import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureSelectBaserowSource,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1289
 * "Select component preview is broken: empty blue button on the right and
 * options list partially hidden"
 *
 * Reproduced in 2.2.0-beta107 with a Select configured from a Baserow source and
 * validated OK in 2.2.0-beta108. The source-backed Select viewer rendered its
 * clear ion-button even when the current value was empty, producing an empty
 * blue button at the right of the field; the searchable dropdown was also
 * clipped by the viewer layout. Fix 30d822c9 added the empty-value guard and
 * layout/positioning adjustments for the source-backed select viewer.
 *
 * The C8oForms form is built only through Studio UI. The external Baserow table
 * is ensured idempotently, then selected through the Select source configuration
 * UI by workspace/base/table/column names.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1289 Source Select';
const DISPLAY_COLUMN = 'Name';
const VALUE_COLUMN = 'Value';
const TECHNICAL_ID = 'source_select_1289';
const OPTIONS = ['Alpha 1289', 'Beta 1289', 'Gamma 1289'];

const SELECT_TRIGGER = 'ion-item.class1648542300891';
const SELECT_DROPDOWN = '.class1599133954837';
const softExpect = expect.configure({ soft: true });

test.use({
  viewport: { width: 1366, height: 768 },
});

test.setTimeout(90_000);

test('#1289 - source Select preview has no empty clear button and shows the dropdown', async ({ page }) => {
  await test.step('Ensure the Baserow Select source fixture', async () => {
    const catalog = await ensureBaserowTable({
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      primaryField: DISPLAY_COLUMN,
      columns: [
        { name: DISPLAY_COLUMN, type: 'text' },
        { name: VALUE_COLUMN, type: 'text' },
      ],
      rows: OPTIONS.map((name, index) => ({
        [DISPLAY_COLUMN]: name,
        [VALUE_COLUMN]: `issue-1289-${index + 1}`,
      })),
      upsertKey: DISPLAY_COLUMN,
    });
    assertBaserowFixtureIfCatalogIsAvailable(catalog);
  });

  await test.step('Create a Baserow-backed Select form through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1289 select preview ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.select);
    await expect(page.locator(SEL.selectComponent), 'the Select component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, TECHNICAL_ID);
    await configureSelectBaserowSource(page, {
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      expectedColumns: [DISPLAY_COLUMN, VALUE_COLUMN],
      displayColumn: DISPLAY_COLUMN,
      valueColumn: VALUE_COLUMN,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and record the empty source Select clear action state', async () => {
    await openPreview(page, SEL.selectComponent);
    const select = page.locator(SEL.selectComponent).first();
    await expect(select, 'the source Select should render in Preview').toBeVisible({ timeout: 30_000 });

    await softExpect
      .poll(() => visibleButtonCount(select, 'ion-button'), {
        message: 'an empty source Select should not render the blue clear/deselect button in Preview',
        timeout: 10_000,
      })
      .toBe(0);
  });

  await test.step('Open the source Select and assert the dropdown content is not clipped', async () => {
    const select = page.locator(SEL.selectComponent).first();
    const trigger = select.locator(SELECT_TRIGGER).first();
    await expect(trigger, 'the source Select trigger should be visible').toBeVisible({ timeout: 15_000 });
    await clickSourceSelectTrigger(page, trigger);

    const dropdown = page.locator(`${SELECT_DROPDOWN}:visible`).filter({ hasText: OPTIONS[0] }).last();
    await expect(dropdown, 'the source Select searchable dropdown should open').toBeVisible({ timeout: 20_000 });
    await expect(dropdown, `the dropdown should include ${OPTIONS[2]}`).toContainText(OPTIONS[2], { timeout: 20_000 });

    for (const option of OPTIONS) {
      const optionLocator = dropdown.getByText(option, { exact: true }).last();
      const optionState = await hitTestVisibleState(optionLocator);
      expect(optionState.ratio, `source Select option ${option} should be visible (${optionState.description})`).toBeGreaterThanOrEqual(
        0.9,
      );
    }
  });
});

function assertBaserowFixtureIfCatalogIsAvailable(catalog: BaserowCatalog): void {
  if (catalog.workspaces.length === 0 && catalog.bases.length === 0 && catalog.tables.length === 0) {
    return;
  }

  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const column of [
    { name: DISPLAY_COLUMN, type: 'text' },
    { name: VALUE_COLUMN, type: 'text' },
  ]) {
    const actual = columns.find((candidate) => candidate.name === column.name);
    expect(actual, `Baserow column ${column.name} should exist`).toBeTruthy();
    expect(actual?.type, `Baserow column ${column.name} should be a text field`).toBe(column.type);
  }
}

async function visibleButtonCount(root: Locator, selector: string): Promise<number> {
  const buttons = root.locator(selector);
  const count = await buttons.count();
  let visible = 0;
  for (let index = 0; index < count; index++) {
    if (await buttons.nth(index).isVisible().catch(() => false)) {
      visible += 1;
    }
  }
  return visible;
}

async function clickSourceSelectTrigger(page: Page, trigger: Locator): Promise<void> {
  await trigger.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  const box = await trigger.boundingBox();
  expect(box, 'the source Select trigger should have a clickable box').not.toBeNull();

  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
}

interface HitTestVisibleState {
  ratio: number;
  description: string;
}

async function hitTestVisibleState(locator: Locator): Promise<HitTestVisibleState> {
  await expect(locator).toBeVisible({ timeout: 10_000 });
  const handle = await locator.elementHandle();
  if (!handle) throw new Error('could not inspect visible hit target');

  const state = await handle.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const points = [
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      { x: rect.left + Math.max(1, rect.width * 0.25), y: rect.top + rect.height / 2 },
      { x: rect.left + Math.max(1, rect.width * 0.75), y: rect.top + rect.height / 2 },
    ].filter((point) => point.x >= 0 && point.y >= 0 && point.x <= window.innerWidth && point.y <= window.innerHeight);

    let hits = 0;
    for (const point of points) {
      const hit = document.elementFromPoint(point.x, point.y);
      if (hit && (hit === element || element.contains(hit) || hit.contains(element))) {
        hits += 1;
      }
    }

    return {
      ratio: points.length === 0 ? 0 : hits / points.length,
      description: `hit=${hits}/${points.length} rect=${Math.round(rect.width)}x${Math.round(rect.height)} at ${Math.round(
        rect.left,
      )},${Math.round(rect.top)}`,
    };
  });

  await handle.dispose();
  return state;
}
