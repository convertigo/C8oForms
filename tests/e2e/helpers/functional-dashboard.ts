import { expect, test, type Frame, type Locator, type Page } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './baserow';
import { expectNoCodeDashboardReady } from './functional-studio';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  c8oCall,
  closeComponentConfig,
  configureGridBaserowSource,
  createBlankForm,
  expectSelectorApplicationVisible,
  openComponentConfig,
  publishCurrentFormWithPwa,
  searchSelectorApplicationsByName,
} from './studio';

type DashboardEntryPoint = 'dashboard-button' | 'left-menu';
type DashboardSection = 'edition' | 'published' | 'database';

interface DashboardFixture {
  title: string;
  sourceTable: string;
  noCodeDatabase: string;
  noCodeTable: string;
}

const SOURCE_WORKSPACE = 'C8oForms E2E';
const SOURCE_DATABASE = 'Functional Fixtures';
const SOURCE_TABLE = 'Functional Dashboard Sections';
const SOURCE_COLUMNS = ['Name', 'Marker'];
const DASHBOARD_ROW_NAME = 'functional_dashboard_sections';
const NOCODE_DATABASE = 'Functional Dashboard Sections';
const NOCODE_TABLE = 'Table';

const DASHBOARD_SEL = {
  selectorPageVisible: 'page-selectorpage:not(.ion-page-hidden)',
  dashboardEditionButton: 'page-selectorpage:not(.ion-page-hidden) ion-button.class1761754757300',
  dashboardPublishedButton: 'page-selectorpage:not(.ion-page-hidden) ion-button.class1761754757348',
  dashboardDatabaseButton: 'page-selectorpage:not(.ion-page-hidden) ion-button.class1761754757399',
  menuButton:
    'page-selectorpage:not(.ion-page-hidden) ion-menu-button, ion-menu-button[menu="start"], page-selectorpage:not(.ion-page-hidden) ion-button.class1757346419324',
  menuEditionItem:
    'ion-menu ion-item.form-item--small.btn:has(ion-icon[src*="pen-line.svg"]), ion-item.class1759164027337, ion-item.class1656493755519',
  menuPublishedItem:
    'ion-menu ion-item.form-item--small.btn:has(ion-icon[src*="book-open.svg"]), ion-item.class1759164027376, ion-item.class1656494131069',
  menuDatabaseItem:
    'ion-menu ion-item.form-item--small.btn:has(ion-icon[src*="database.svg"]), ion-item.class1759164027415, ion-item.class1728311082676',
  visibleMenu: 'ion-menu.show-menu, ion-menu.menu-pane-visible, ion-menu:not(.menu-hidden)',
  noCodeDatabaseFrame: 'page-selectorpage:not(.ion-page-hidden) iframe',
} as const;

export async function assertDashboardSectionsThroughBothEntryPoints(page: Page): Promise<void> {
  const fixture = await createPublishedBaserowApplicationForDashboard(page);

  for (const entryPoint of ['dashboard-button', 'left-menu'] as const) {
    await assertDashboardSection(page, 'edition', entryPoint, fixture);
    await assertDashboardSection(page, 'published', entryPoint, fixture);
    await assertDashboardSection(page, 'database', entryPoint, fixture);
  }
}

export async function assertDashboardEmptyResultStates(page: Page): Promise<void> {
  const query = `functional-empty-${Date.now()}-no-match`;

  await assertDashboardEmptyResultState(page, 'edition', query);
  await assertDashboardEmptyResultState(page, 'published', query);
  await assertNoCodeDatabaseSectionReadyForEmptyState(page);
}

export async function assertIsolatedEmptyDashboardSections(page: Page): Promise<void> {
  await ensureNoCodeDatabaseAccount(page);
  for (const entryPoint of ['dashboard-button', 'left-menu'] as const) {
    await assertDashboardSectionHasNoResultCards(page, 'edition', entryPoint);
    await assertDashboardSectionHasNoResultCards(page, 'published', entryPoint);
    await assertNoCodeDatabaseSectionHasNoFunctionalFixture(page, entryPoint);
  }
}

async function ensureNoCodeDatabaseAccount(page: Page): Promise<void> {
  await test.step('Provision the isolated user No-code database account', async () => {
    let token = '';
    let iframe = '';
    await expect
      .poll(
        async () => {
          const response = await c8oCall(page, 'BaserowAccount', {});
          const document = asRecord(response.document);
          const result = asRecord(document?.result) ?? asRecord(response.result) ?? document ?? response;
          token = typeof result.token === 'string' ? result.token : '';
          iframe = typeof result.iframe === 'string' ? result.iframe : '';
          return Boolean(token && iframe);
        },
        {
          message: 'BaserowAccount should finish provisioning the isolated user',
          timeout: 60_000,
          intervals: [1_000, 2_000, 5_000, 10_000],
        },
      )
      .toBe(true);
    expect(token, 'BaserowAccount should return a login token for the isolated user').not.toBe('');
    expect(iframe, 'BaserowAccount should return an iframe endpoint for the isolated user').not.toBe('');

    let jwt = '';
    await expect
      .poll(
        async () => {
          const checkLogin = await page.request.post(`${iframe.replace(/\/+$/, '')}/.json`, {
            form: { __sequence: 'CheckLogin', token },
            timeout: 60_000,
          });
          if (!checkLogin.ok()) return false;
          const body = await checkLogin.json().catch(() => ({}));
          jwt = String(asRecord(body)?.jwt_token ?? '');
          return jwt.length > 0;
        },
        {
          message: 'Baserow iframe CheckLogin should return a JWT after account provisioning',
          timeout: 60_000,
          intervals: [1_000, 2_000, 5_000, 10_000],
        },
      )
      .toBe(true);
  });
}

async function createPublishedBaserowApplicationForDashboard(page: Page): Promise<DashboardFixture> {
  return test.step('Create a published Baserow-backed application for dashboard sections', async () => {
    await ensureFunctionalDashboardTable();

    const title = `Functional dashboard ${Date.now()}`;
    await createBlankForm(page, title);
    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'dashboard fixture should contain one Data Grid').toHaveCount(1, {
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: SOURCE_WORKSPACE,
      database: SOURCE_DATABASE,
      table: SOURCE_TABLE,
      expectedColumns: SOURCE_COLUMNS,
    });
    await closeComponentConfig(page);
    await publishCurrentFormWithPwa(page, 'authenticated');

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await ensureNoCodeDatabaseTableThroughUi(page);
    return { title, sourceTable: SOURCE_TABLE, noCodeDatabase: NOCODE_DATABASE, noCodeTable: NOCODE_TABLE };
  });
}

async function assertDashboardEmptyResultState(page: Page, section: 'edition' | 'published', query: string): Promise<void> {
  await test.step(`Assert ${section} dashboard empty result state remains usable`, async () => {
    await openDashboardSection(page, section, 'dashboard-button');
    await searchDashboardApplications(page, query);
    await expectDashboardButtonActive(page, section);
    await expectDashboardSearchInputVisible(page);
    await expectDashboardTabsVisible(page);
    await expectVisibleSelectorResultCards(page, 0);
    await expect(page.locator('ion-loading:not(.overlay-hidden)').first(), 'empty state should not leave an Ionic loader open').toHaveCount(
      0,
      { timeout: 5_000 },
    );
  });
}

async function assertDashboardSectionHasNoResultCards(
  page: Page,
  section: 'edition' | 'published',
  entryPoint: DashboardEntryPoint,
): Promise<void> {
  await test.step(`Assert isolated ${section} dashboard section is empty through ${entryPoint}`, async () => {
    await openDashboardSection(page, section, entryPoint);
    await expectDashboardButtonActive(page, section);
    await expectDashboardSearchInputVisible(page);
    await expectDashboardTabsVisible(page);
    await expectVisibleSelectorResultCards(page, 0);
    await expect(page.locator('ion-loading:not(.overlay-hidden)').first(), 'isolated empty state should not leave an Ionic loader open').toHaveCount(
      0,
      { timeout: 5_000 },
    );
  });
}

async function assertNoCodeDatabaseSectionReadyForEmptyState(page: Page): Promise<void> {
  await test.step('Assert No-code database section remains usable when no table filter is applied', async () => {
    await openDashboardSection(page, 'database', 'dashboard-button');
    const frame = await waitForNoCodeDatabaseWorkspaceReady(page);
    await expectDashboardButtonActive(page, 'database');
    await expectDashboardTabsVisible(page);
    await expect(page.locator('ion-loading:not(.overlay-hidden)').first(), 'No-code database section should not leave an Ionic loader open').toHaveCount(
      0,
      { timeout: 5_000 },
    );
    await expect
      .poll(() => noCodeDatabaseWorkspaceUsable(frame), {
        message: 'No-code database workspace should expose an empty-state or database-management entry point',
        timeout: 30_000,
      })
      .toBe(true);
  });
}

async function assertNoCodeDatabaseSectionHasNoFunctionalFixture(
  page: Page,
  entryPoint: DashboardEntryPoint,
): Promise<void> {
  await test.step(`Assert isolated No-code database section has no functional fixture through ${entryPoint}`, async () => {
    await openDashboardSection(page, 'database', entryPoint);
    const frame = await waitForNoCodeDatabaseWorkspaceReady(page);
    await expectDashboardButtonActive(page, 'database');
    await expectDashboardTabsVisible(page);
    await expect(page.locator('ion-loading:not(.overlay-hidden)').first(), 'isolated No-code database section should not leave an Ionic loader open').toHaveCount(
      0,
      { timeout: 5_000 },
    );
    await expect
      .poll(() => noCodeDatabaseWorkspaceHasNoFunctionalFixture(frame), {
        message: 'isolated No-code database workspace should not expose functional dashboard fixtures',
        timeout: 30_000,
      })
      .toBe(true);
  });
}

async function ensureFunctionalDashboardTable(): Promise<void> {
  await test.step('Ensure the functional dashboard Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: SOURCE_WORKSPACE,
      database: SOURCE_DATABASE,
      table: SOURCE_TABLE,
      primaryField: 'Name',
      columns: [
        { name: 'Name', type: 'text' },
        { name: 'Marker', type: 'text' },
      ],
      rows: [
        {
          Name: DASHBOARD_ROW_NAME,
          Marker: 'visible_from_dashboard_section',
        },
      ],
      upsertKey: 'Name',
    });
    assertFunctionalDashboardTable(catalog);
  });
}

function assertFunctionalDashboardTable(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === SOURCE_TABLE);
  expect(table, `Baserow table ${SOURCE_TABLE} should exist`).toBeTruthy();

  const columns = table?.columns ?? [];
  for (const columnName of SOURCE_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
}

async function assertDashboardSection(
  page: Page,
  section: DashboardSection,
  entryPoint: DashboardEntryPoint,
  fixture: DashboardFixture,
): Promise<void> {
  await test.step(`Open ${section} dashboard section through ${entryPoint}`, async () => {
    await openDashboardSection(page, section, entryPoint);
    await expectDashboardSectionContent(page, section, fixture);
  });
}

async function openDashboardSection(page: Page, section: DashboardSection, entryPoint: DashboardEntryPoint): Promise<void> {
  await expectSelectorShellVisible(page);

  if (entryPoint === 'dashboard-button') {
    await clickVisibleFromLocator(page, page.locator(dashboardButtonSelector(section)), `${section} dashboard button`);
  } else {
    await clickLeftMenuSection(page, section);
  }

  await page.waitForTimeout(1_000);
  await expectSelectorShellVisible(page);
}

async function expectDashboardSectionContent(page: Page, section: DashboardSection, fixture: DashboardFixture): Promise<void> {
  if (section === 'edition') {
    await expectDashboardButtonActive(page, section);
    await expectSelectorApplicationVisible(page, fixture.title);
    return;
  }

  if (section === 'published') {
    await expectDashboardButtonActive(page, section);
    await expectSelectorApplicationVisible(page, fixture.title);
    return;
  }

  await expectDashboardButtonActive(page, section);
  await expectNoCodeDatabaseTableVisible(page, fixture.noCodeDatabase, fixture.noCodeTable);
}

async function ensureNoCodeDatabaseTableThroughUi(page: Page): Promise<void> {
  await test.step('Ensure a No-code database table is visible in the embedded database workspace', async () => {
    await openDashboardSection(page, 'database', 'dashboard-button');
    await waitForNoCodeDatabaseWorkspaceReady(page);
    if (await openNoCodeDatabaseIfVisible(page, NOCODE_DATABASE)) {
      await expectNoCodeDatabaseTableVisible(page, NOCODE_DATABASE, NOCODE_TABLE);
      return;
    }

    await createNoCodeDatabaseThroughIframe(page, NOCODE_DATABASE);
    await expectNoCodeDatabaseTableVisible(page, NOCODE_DATABASE, NOCODE_TABLE);
  });
}

async function clickLeftMenuSection(page: Page, section: DashboardSection): Promise<void> {
  const roleItem = page.getByRole('button', { name: leftMenuRoleName(section) }).first();
  if (await roleItem.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await roleItem.click({ timeout: 10_000 }).catch(async () => roleItem.dispatchEvent('click'));
    return;
  }

  const selector = menuItemSelector(section);
  const stableItem = page.locator(selector).first();
  if (await stableItem.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await stableItem.click({ timeout: 10_000 }).catch(async () => stableItem.dispatchEvent('click'));
    return;
  }

  {
    const menuButton = await firstVisibleFromLocator(page, page.locator(DASHBOARD_SEL.menuButton), 'main menu button');
    await menuButton.click({ timeout: 10_000 }).catch(async () => menuButton.dispatchEvent('click'));
    await expect(page.locator(DASHBOARD_SEL.visibleMenu).first(), 'main menu should open').toBeVisible({ timeout: 10_000 });
  }

  const openedRoleItem = page.getByRole('button', { name: leftMenuRoleName(section) }).first();
  if (await openedRoleItem.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await openedRoleItem.click({ timeout: 10_000 }).catch(async () => openedRoleItem.dispatchEvent('click'));
    return;
  }

  const menuItem = await firstVisibleFromLocator(page, page.locator(selector), `${section} left-menu item`);
  await expect(menuItem, `${section} left-menu item should be visible after opening the menu`).toBeVisible({ timeout: 2_000 });
  await menuItem.click({ timeout: 10_000 }).catch(async () => menuItem.dispatchEvent('click'));
}

async function expectNoCodeDatabaseTableVisible(page: Page, database: string, table: string): Promise<void> {
  await waitForNoCodeDatabaseWorkspaceReady(page);

  if (!((await baserowFrameContainsText(page, database)) && (await baserowFrameContainsText(page, table)))) {
    await openNoCodeDatabaseIfVisible(page, database);
    await page.waitForTimeout(1_500);
  }

  await expect
    .poll(() => noCodeDatabaseAndTableAreVisible(page, database, table), {
      message: `No-code database should show ${database} and table ${table}`,
      timeout: 90_000,
    })
    .toBe(true);
}

async function noCodeDatabaseAndTableAreVisible(page: Page, database: string, table: string): Promise<boolean> {
  return (await baserowFrameContainsText(page, database)) && (await baserowFrameContainsText(page, table));
}

async function openNoCodeDatabaseIfVisible(page: Page, database: string): Promise<boolean> {
  const frame = await waitForNoCodeDatabaseWorkspaceReady(page);
  if (!(await baserowFrameContainsText(page, database))) {
    return false;
  }
  await clickTextInFrame(frame, database).catch(() => undefined);
  await page.waitForTimeout(3_000);
  return true;
}

async function createNoCodeDatabaseThroughIframe(page: Page, database: string): Promise<void> {
  let frame = await waitForNoCodeDatabaseWorkspaceReady(page);
  await clickTextInFrame(frame, 'Add new...');
  await clickTextInFrame(frame, 'Database');

  await expect
    .poll(() => baserowFrameContainsText(page, 'Add new database'), {
      message: 'Baserow should open the Add new database form',
      timeout: 30_000,
    })
    .toBe(true);
  frame = await waitForNoCodeDatabaseWorkspaceReady(page);
  const nameInput = await firstVisibleInputInFrame(frame);
  await nameInput.fill(database, { timeout: 10_000 });
  await clickTextInFrame(frame, 'Add database');
  await page.waitForTimeout(6_000);
}

async function waitForNoCodeDatabaseWorkspaceReady(page: Page): Promise<Frame> {
  const iframe = page.locator(DASHBOARD_SEL.noCodeDatabaseFrame).first();
  await expect(iframe, 'No-code database section should expose the Baserow iframe').toBeVisible({ timeout: 90_000 });

  await expect
    .poll(() => baserowFrameReady(page), {
      message: 'embedded Baserow workspace should finish authenticating',
      timeout: 90_000,
    })
    .toBe(true);

  const frame = await baserowWorkspaceFrame(page);
  if (!frame) {
    throw new Error('No Baserow workspace frame was found after authentication');
  }
  return frame;
}

async function baserowFrameReady(page: Page): Promise<boolean> {
  return (await baserowWorkspaceFrame(page)) !== null;
}

async function baserowWorkspaceFrame(page: Page): Promise<Frame | null> {
  for (const frame of page.frames()) {
    if (!frame.url().includes('baserow.convertigo.net')) {
      continue;
    }
    const text = await frame
      .locator('body')
      .innerText({ timeout: 2_000 })
      .then(normalize)
      .catch(() => '');
    if (/Add new\.\.\.|This workspace is empty|Databases|Table/i.test(text) && !/Authenticating/i.test(text)) {
      return frame;
    }
  }
  return null;
}

async function noCodeDatabaseWorkspaceUsable(frame: Frame): Promise<boolean> {
  const text = await frame
    .locator('body')
    .innerText({ timeout: 2_000 })
    .then(normalize)
    .catch(() => '');
  return /Add new\.\.\.|This workspace is empty|Databases|Table/i.test(text) && !/Authenticating/i.test(text);
}

async function noCodeDatabaseWorkspaceHasNoFunctionalFixture(frame: Frame): Promise<boolean> {
  const text = await frame
    .locator('body')
    .innerText({ timeout: 2_000 })
    .then(normalize)
    .catch(() => '');
  return noCodeDatabaseTextIsReady(text) && !text.includes(SOURCE_DATABASE) && !text.includes(SOURCE_TABLE) && !text.includes(NOCODE_DATABASE);
}

function noCodeDatabaseTextIsReady(text: string): boolean {
  return /Add new\.\.\.|This workspace is empty|Databases|Table/i.test(text) && !/Authenticating/i.test(text);
}

async function baserowFrameContainsText(page: Page, expectedText: string): Promise<boolean> {
  const frame = await baserowWorkspaceFrame(page);
  if (!frame) {
    return false;
  }
  const expected = normalize(expectedText).toLowerCase();
  const text = await frame
    .locator('body')
    .innerText({ timeout: 2_000 })
    .then((value) => normalize(value).toLowerCase())
    .catch(() => '');
  return text.includes(expected);
}

async function clickTextInFrame(frame: Frame, text: string): Promise<void> {
  const target = frame.getByText(text, { exact: true }).first();
  await expect(target, `Baserow frame should expose ${text}`).toBeVisible({ timeout: 30_000 });
  await target.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  await target.click({ timeout: 10_000 }).catch(async () => target.dispatchEvent('click'));
}

async function firstVisibleInputInFrame(frame: Frame): Promise<Locator> {
  const inputs = frame.locator('input');
  const count = await inputs.count();
  for (let i = count - 1; i >= 0; i--) {
    const input = inputs.nth(i);
    if (await input.isVisible({ timeout: 500 }).catch(() => false)) {
      return input;
    }
  }
  throw new Error('No visible input was found in the No-code database iframe');
}

async function expectDashboardButtonActive(page: Page, section: DashboardSection): Promise<void> {
  await expect
    .poll(() => dashboardButtonClasses(page, section), {
      message: `${section} dashboard button should be active`,
      timeout: 15_000,
    })
    .toContain('btn--tab-active');
}

async function searchDashboardApplications(page: Page, query: string): Promise<void> {
  await searchSelectorApplicationsByName(page, query);
}

async function expectDashboardSearchInputVisible(page: Page): Promise<void> {
  await expect(
    page
      .locator(
        [
          `${DASHBOARD_SEL.selectorPageVisible} input[placeholder*="application" i]`,
          `${DASHBOARD_SEL.selectorPageVisible} input[aria-label*="application" i]`,
          `${DASHBOARD_SEL.selectorPageVisible} input[type="search"]`,
          `${DASHBOARD_SEL.selectorPageVisible} input:visible`,
        ].join(', '),
      )
      .first(),
    'dashboard search input should stay available in the empty result state',
  ).toBeVisible({ timeout: 15_000 });
}

async function expectDashboardTabsVisible(page: Page): Promise<void> {
  for (const section of ['edition', 'published', 'database'] as const) {
    await expect(
      page.locator(dashboardButtonSelector(section)).first(),
      `${section} dashboard tab should stay available in the empty result state`,
    ).toBeVisible({ timeout: 15_000 });
  }
}

async function expectVisibleSelectorResultCards(page: Page, count: number): Promise<void> {
  await expect
    .poll(() => visibleSelectorResultCardCount(page), {
      message: `selector should show ${count} result card(s)`,
      timeout: 30_000,
    })
    .toBe(count);
}

async function visibleSelectorResultCardCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.querySelector('page-selectorpage:not(.ion-page-hidden)');
    if (!root) {
      return -1;
    }
    const visible = (el: Element): boolean => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...root.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')].filter(visible).length;
  });
}

async function dashboardButtonClasses(page: Page, section: DashboardSection): Promise<string> {
  return page
    .locator(dashboardButtonSelector(section))
    .first()
    .evaluate((element) => (element as HTMLElement).className)
    .catch(() => '');
}

async function expectSelectorShellVisible(page: Page): Promise<void> {
  await expect(page.locator(DASHBOARD_SEL.selectorPageVisible).first(), 'selector page should be visible').toBeVisible({
    timeout: 30_000,
  });
}

async function firstVisibleFromLocator(page: Page, locator: Locator, description: string, timeout = 15_000): Promise<Locator> {
  const startedAt = Date.now();
  do {
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const candidate = locator.nth(i);
      if (await candidate.isVisible({ timeout: 250 }).catch(() => false)) {
        return candidate;
      }
    }
    await page.waitForTimeout(250);
  } while (Date.now() - startedAt < timeout);

  return locator.first().describe(description);
}

async function clickVisibleFromLocator(page: Page, locator: Locator, description: string): Promise<void> {
  const target = await firstVisibleFromLocator(page, locator, description);
  await target.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  await target.click({ timeout: 10_000 }).catch(async () => target.dispatchEvent('click'));
}

function dashboardButtonSelector(section: DashboardSection): string {
  return {
    edition: DASHBOARD_SEL.dashboardEditionButton,
    published: DASHBOARD_SEL.dashboardPublishedButton,
    database: DASHBOARD_SEL.dashboardDatabaseButton,
  }[section];
}

function menuItemSelector(section: DashboardSection): string {
  return {
    edition: DASHBOARD_SEL.menuEditionItem,
    published: DASHBOARD_SEL.menuPublishedItem,
    database: DASHBOARD_SEL.menuDatabaseItem,
  }[section];
}

function leftMenuRoleName(section: DashboardSection): RegExp {
  return {
    edition: /^Home \(Edition\)$/i,
    published: /^Home \(Published\)$/i,
    database: /^Home \(Database\)$/i,
  }[section];
}

function normalize(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}
