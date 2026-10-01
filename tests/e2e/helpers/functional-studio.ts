import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addFirstAvailableCollaboratorFromSelectorCard,
  countComponents,
  createBlankForm,
  expectSelectorApplicationVisible,
  expectSelectorFolderHidden,
  expectSelectorFolderVisible,
  getFormDocument,
  gotoWithTransientRetry,
  login,
  openEditionApplicationsTab,
  openCreateFolderPrompt,
  recordedToasts,
  recordToasts,
  reloadSelectorPage,
  setSelectorHideFoldersFilter,
  setSelectorMyApplicationsFilter,
  TEST_USER,
  expectSelectorMyApplicationsFilterEnabled,
  expectSelectorSearchKeepsSingleApplication,
  type LoginCredentials,
} from './studio';
import { setGlobalSymbolForTest, type RestoreGlobalSymbol } from './admin-symbols';

const FUNCTIONAL_SEL = {
  applicationNameInput: 'ion-input.class1776265600007 input, .class1776265600007 input',
  applicationSettingsCloseButton: 'button.class1780498802542',
  selectorDeleteMenuItem: 'ion-item.class1566923689496',
  selectorDuplicateMenuItem: 'ion-item.class1588251387387',
  selectorManageFoldersMenuItem: 'ion-item.class1578920252046',
  selectorPopover: 'ion-popover:not(.overlay-hidden):visible page-popoverpageselector',
  selectorAllApplicationsButton: 'ion-button.class1761754659662',
  selectorGridViewButton: 'ion-button.class1761574287897',
  selectorListViewButton: 'ion-button.class1761576075026',
  selectorImportButton: 'ion-button.class1761574287978',
  selectorImportModal: 'ion-modal.show-modal page-dropfilepage',
  selectorImportModalCloseButton: 'ion-button.close-button',
  selectorImportModalConfirmButton: 'ion-button.class1658764714718',
  selectorTemplateCard: '.class1645547241674',
  selectorTemplateList: '.class1645547166673',
  selectorTemplateMoreButton: 'ion-button.class1761563584596',
  selectorAdvancedSearchButton: 'ion-button.class1783947965453',
  selectorAdvancedSearchPanel: '.class1645545984242',
  selectorCommittedSearchBadge: 'ion-badge.class1645887518298',
  selectorUserSearchFilter: '.class1750838881480',
  selectorUserSearchInput: '.class1750838881480 c8oforms-ngxtaginputcustomc8oforms input',
  labelsModal: 'ion-modal.show-modal page-labelspage',
  labelsFolderInput: 'input.ng2-tag-input__text-input',
  labelsSaveButton: 'ion-button.class1763130514151',
} as const;

/**
 * Functional-suite helpers live outside helpers/studio.ts so new functional
 * flows do not accidentally change the regression helper contract.
 */
export async function loginWithUsernamePassword(page: Page): Promise<void> {
  await test.step('Log in with username and password', async () => {
    await login(page);
  });
}

export function functionalSecondaryUserCredentials(): LoginCredentials | null {
  const user = (
    process.env.C8OFORMS_FUNCTIONAL_SECONDARY_USER ??
    process.env.C8OFORMS_SECONDARY_TEST_USER ??
    process.env.C8OFORMS_TEST_USER_2 ??
    defaultProvisionedFunctionalUser('secondary')
  ).trim();
  if (!user || user.toLowerCase() === TEST_USER.toLowerCase()) {
    return null;
  }

  return {
    user,
    password:
      process.env.C8OFORMS_FUNCTIONAL_SECONDARY_PASSWORD ??
      process.env.C8OFORMS_SECONDARY_TEST_PASSWORD ??
      process.env.C8OFORMS_TEST_PASSWORD_2 ??
      user,
  };
}

export function functionalAdminUserCredentials(): LoginCredentials | null {
  const user = (process.env.C8OFORMS_FUNCTIONAL_ADMIN_USER ?? defaultProvisionedFunctionalUser('admin')).trim();
  if (!user) {
    return null;
  }

  return {
    user,
    password: process.env.C8OFORMS_FUNCTIONAL_ADMIN_PASSWORD ?? user,
  };
}

export function functionalSecondaryMcpToken(): string | null {
  const token = (process.env.C8OFORMS_FUNCTIONAL_SECONDARY_MCP_TOKEN ?? '').trim();
  return token || null;
}

function defaultProvisionedFunctionalUser(kind: 'secondary' | 'admin'): string {
  if (!process.env.CONVERTIGO_ADMIN_PASSWORD && !process.env.TEST_NOCODE_PASSWORD) {
    return '';
  }
  const prefix = (process.env.C8OFORMS_FUNCTIONAL_USER_PREFIX ?? 'c8oforms-functional')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const domain = process.env.C8OFORMS_FUNCTIONAL_USER_DOMAIN ?? 'yopmail.com';
  return `${prefix || 'c8oforms-functional'}-${kind}@${domain}`;
}

export async function loginWithFunctionalCredentials(page: Page, credentials: LoginCredentials): Promise<void> {
  await test.step(`Log in with functional fixture user ${credentials.user}`, async () => {
    await login(page, credentials);
  });
}

export async function expectInvalidUsernamePasswordLoginRejected(page: Page): Promise<void> {
  await test.step('Submit invalid username/password credentials and assert rejection', async () => {
    await openUsernamePasswordLoginForm(page);
    await recordToasts(page);

    const email = await firstVisibleFromLocator(page, page.locator(SEL.emailInput), 'login email input');
    const password = await firstVisibleFromLocator(page, page.locator(SEL.passwordInput), 'login password input');
    await email.fill(`invalid-${Date.now()}@example.invalid`, { timeout: 10_000 });
    await password.fill(`wrong-password-${Date.now()}`, { timeout: 10_000 });

    const submit = await firstVisibleFromLocator(page, page.locator(SEL.loginReveal), 'login submit button');
    await submit.click({ timeout: 10_000 });

    await expectLoginScreenVisible(page);
    await expect(page.locator(SEL.blankFormCard).first(), 'selector should not be visible after invalid login').toHaveCount(0, {
      timeout: 3_000,
    });
    await expect
      .poll(async () => (await recordedToasts(page)).filter((message) => message.trim().length > 0).length, {
        message: 'invalid login should raise an error toast',
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
  });
}

export async function expectForgottenPasswordModalOpensAndCloses(page: Page): Promise<void> {
  await test.step('Open and close the forgotten password modal', async () => {
    await openUsernamePasswordLoginForm(page);

    const forgottenPassword = await firstVisibleFromLocator(
      page,
      page.locator('.forgot-password'),
      'forgotten password action',
    );
    await forgottenPassword
      .click({ timeout: 10_000 })
      .catch(async () => forgottenPassword.dispatchEvent('click'));

    const modal = page.locator('ion-modal.show-modal page-resetpasswordpage, page-resetpasswordpage').first();
    await expect(modal, 'forgotten password modal should be visible').toBeVisible({ timeout: 15_000 });
    await expect(
      modal.locator('ion-input.class1757510564581 input, ion-input.class1582285458300 input').first(),
      'forgotten password email input should be visible',
    ).toBeVisible({ timeout: 15_000 });
    const send = modal
      .locator('ion-button.send-button, ion-button.class1757510317776, ion-button.class1582285458387')
      .first();
    await expect(send, 'forgotten password send action should be visible').toBeVisible({ timeout: 15_000 });
    await expectButtonUsesSolidThemeColor(
      send,
      '--ion-color-convertigo',
      'forgotten password send action',
    );

    const close = modal.locator('ion-button.close-button, ion-button.class1757510386777').first();
    await expect(close, 'forgotten password modal close action should be visible').toBeVisible({ timeout: 15_000 });
    await close.click({ timeout: 10_000 });
    await expect(modal, 'forgotten password modal should close').toBeHidden({ timeout: 15_000 });
    await expectLoginScreenVisible(page);
  });
}

/**
 * Covers #1259 and #1391 without holding two global-symbol locks at once.
 * Every assertion after the first uses a fresh browser context so the login
 * discovery sequence cannot reuse an earlier priority-server cache entry.
 */
export async function expectLoginSymbolsThroughUi(page: Page): Promise<void> {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const placeholderValue = `QA placeholder ${token}`;
  let restoreSymbol: RestoreGlobalSymbol | undefined;

  try {
    await test.step('Set and verify the identifier placeholder server symbol', async () => {
      restoreSymbol = await setGlobalSymbolForTest('C8Oforms.IdentifierPlaceHolderValue', placeholderValue);
      await openUsernamePasswordLoginForm(page);
      const identifierInput = await firstVisibleFromLocator(page, page.locator(SEL.emailInput), 'login identifier input');
      await expect(
        identifierInput,
        'the signed-out login input should use C8Oforms.IdentifierPlaceHolderValue verbatim',
      ).toHaveAttribute('placeholder', placeholderValue);
    });
  } finally {
    await restoreSymbol?.();
    restoreSymbol = undefined;
  }

  const browser = page.context().browser();
  expect(browser, 'the identity symbol check requires a Playwright browser context').not.toBeNull();
  const appBaseUrl = page.url().match(/^(.*\/DisplayObjects\/mobile\/)/)?.[1] ?? '';
  expect(appBaseUrl, 'the identity symbol check should resolve the C8OForms mobile root URL').not.toBe('');
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const checks: LoginTextSymbolCheck[] = [
    {
      symbol: 'C8Oforms.IdentifierValue',
      value: `QA identifier ${token}`,
      selector: 'ion-label.class1757506269316:visible',
      description: 'identifier label',
      revealLoginForm: true,
    },
    {
      symbol: 'C8Oforms.customHeaderDescription',
      value: `QA header description ${token}`,
      selector: '.hero-subtitle:visible',
      description: 'header description',
    },
    {
      symbol: 'C8Oforms.customContentTitle',
      value: `QA content title ${token}`,
      selector: '.login-form-header h1.main-title:visible',
      description: 'login-card title',
    },
    {
      symbol: 'C8Oforms.customContentDescription',
      value: `QA content description ${token}`,
      selector: '.login-form-header .description:visible',
      description: 'login-card description',
    },
  ];

  for (const check of checks) {
    await expectLoginTextSymbolInFreshContext(browser!, appBaseUrl, viewport, check);
  }
}

type LoginTextSymbolCheck = {
  symbol: string;
  value: string;
  selector: string;
  description: string;
  revealLoginForm?: boolean;
};

async function expectLoginTextSymbolInFreshContext(
  browser: Browser,
  appBaseUrl: string,
  viewport: { width: number; height: number },
  check: LoginTextSymbolCheck,
): Promise<void> {
  const context = await browser.newContext({ baseURL: appBaseUrl, viewport });
  let restoreSymbol: RestoreGlobalSymbol | undefined;

  try {
    await test.step(`Set and verify the ${check.description} server symbol`, async () => {
      restoreSymbol = await setGlobalSymbolForTest(check.symbol, check.value);
      const symbolPage = await context.newPage();
      if (check.revealLoginForm) {
        await openUsernamePasswordLoginForm(symbolPage);
      } else {
        await symbolPage.goto('./', { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await expect(symbolPage.locator(SEL.loginPageRoot).first(), 'login page should be visible').toBeVisible({
          timeout: 30_000,
        });
      }

      const customizedText = symbolPage.locator(check.selector).filter({ hasText: check.value });
      await expect(
        customizedText,
        `the signed-out login page should expose one customized ${check.description}`,
      ).toHaveCount(1);
      await expect(
        customizedText.first(),
        `${check.description} should use ${check.symbol} verbatim instead of its translated fallback`,
      ).toHaveText(check.value);
    });
  } finally {
    try {
      await restoreSymbol?.();
    } finally {
      await context.close();
    }
  }
}

export async function expectNoCodeDashboardReady(page: Page): Promise<void> {
  await test.step('Assert the No-Code Studio dashboard is ready', async () => {
    await expect(page.locator(SEL.selectorPageRoot).first(), 'selector page should be visible').toBeVisible({
      timeout: 15_000,
    });
    await openEditionApplicationsTab(page);
    const blankFormCard = page.locator(SEL.blankFormCard).first();
    await expect(blankFormCard, 'blank application creation entry should be visible').toBeVisible({
      timeout: 15_000,
    });
  });
}

export async function logoutFromNoCodeDashboard(page: Page): Promise<void> {
  await test.step('Log out from the No-Code Studio dashboard', async () => {
    await expectNoCodeDashboardReady(page);
    const openMenu = page.locator('ion-menu.show-menu:visible, ion-menu.menu-pane-visible:visible').last();
    if (!(await openMenu.isVisible({ timeout: 1_000 }).catch(() => false))) {
      const menuButton = await firstVisibleCandidate(
        [
          page
            .locator('page-selectorpage:not(.ion-page-hidden) c8oforms-toolbarcomponentui ion-button:has(ion-icon[src*="menu.svg"])')
            .first(),
          page.locator('page-selectorpage:not(.ion-page-hidden) ion-button.class1757346419324').first(),
          page.locator('page-selectorpage ion-menu-button, ion-menu-button[menu="start"]').first(),
          page.getByRole('banner').getByRole('button').first(),
        ],
        'dashboard menu button',
      );
      await expect(menuButton, 'dashboard menu button should be visible').toBeVisible({ timeout: 15_000 });
      await menuButton.click({ timeout: 10_000 }).catch(async () => menuButton.dispatchEvent('click'));
      await expect(
        openMenu,
        'dashboard menu should be open before selecting Log out',
      ).toBeVisible({ timeout: 10_000 });
    }

    const logoutLabel = /logout|log out|déconnexion|se déconnecter|cerrar sesión|disconnetti/i;
    const logoutButton = await firstVisibleCandidate(
      [
        openMenu.getByRole('button', { name: logoutLabel }).last(),
        openMenu
          .locator('ion-item:visible, ion-button:visible, button:visible, [role="button"]:visible')
          .filter({ hasText: logoutLabel })
          .last(),
        openMenu.locator('.logout-button:visible, [aria-label*="logout" i]:visible, [title*="déconnect" i]:visible').last(),
      ],
      'logout action',
    );
    await expect(logoutButton, 'logout action should be visible in the main menu').toBeVisible({ timeout: 15_000 });
    await logoutButton.click({ timeout: 10_000 }).catch(async () => logoutButton.dispatchEvent('click'));
    await expectLoginScreenVisible(page);
  });
}

async function firstVisibleCandidate(candidates: Locator[], description: string): Promise<Locator> {
  for (const candidate of candidates) {
    if (await candidate.isVisible({ timeout: 1_000 }).catch(() => false)) {
      return candidate;
    }
  }
  return candidates[0].describe(description);
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

async function locatorCanBeClicked(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    const element = el as HTMLElement & { disabled?: boolean };
    const style = window.getComputedStyle(element);
    return (
      element.disabled !== true &&
      element.getAttribute('aria-disabled') !== 'true' &&
      !element.classList.contains('alert-button-disabled') &&
      style.pointerEvents !== 'none' &&
      style.visibility !== 'hidden' &&
      style.display !== 'none'
    );
  });
}

async function openApplicationSettings(page: Page): Promise<void> {
  const settings = await firstVisibleCandidate(
    [
      page.locator('ion-button.class1774952185775, ion-button.class1780909504441').first(),
      page.getByTitle(/application settings/i).first(),
    ],
    'application settings button',
  );
  await expect(settings, 'application settings button should be visible').toBeVisible({ timeout: 15_000 });
  await settings.click({ timeout: 10_000 }).catch(async () => settings.dispatchEvent('click'));
  await expect(page.locator(FUNCTIONAL_SEL.applicationNameInput).first(), 'application settings should expose the name input').toBeVisible({
    timeout: 15_000,
  });
}

export async function openSelectorCardMenu(page: Page, title: string): Promise<void> {
  await expectNoCodeDashboardReady(page);
  await expectSelectorApplicationVisible(page, title);
  await dismissSelectorPopovers(page);

  const opened = await page.evaluate(
    async ({ expectedTitle, titleSelector }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const visible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const titleElement = [...document.querySelectorAll(titleSelector)]
        .filter(visible)
        .find((candidate) => normalize((candidate as HTMLElement).innerText).includes(expectedTitle)) as HTMLElement | undefined;
      const card =
        titleElement?.closest('[id^="idcard"]:not([id^="idcardO"])') ??
        titleElement?.closest('c8oforms-cardselector') ??
        titleElement?.closest('ion-col');
      if (!card) {
        return false;
      }

      card.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      const rect = (card as HTMLElement).getBoundingClientRect();
      for (const type of ['pointerover', 'mouseover', 'mouseenter', 'mousemove']) {
        card.dispatchEvent(
          new MouseEvent(type, {
            bubbles: type !== 'mouseenter',
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            view: window,
          }),
        );
      }

      const buttons = [...card.querySelectorAll('ion-button, button, [role="button"]')].filter(visible);
      const menu =
        buttons.find((button) => button.classList.contains('class1606574763560')) ??
        buttons.find((button) => !!button.querySelector('ion-icon[name*="ellipsis"], ion-icon.class1606574808458'));
      if (!menu) {
        return false;
      }

      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        menu.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      }
      menu.click();
      return true;
    },
    { expectedTitle: title, titleSelector: '.class1603968061706, .class1780484375240' },
  );
  expect(opened, `selector card menu for ${title} should open`).toBe(true);
  await expect(page.locator(FUNCTIONAL_SEL.selectorPopover).last(), 'selector card popover should be visible').toBeVisible({
    timeout: 10_000,
  });
}

export async function clickSelectorPopoverItem(page: Page, itemSelector: string, description: string): Promise<void> {
  const popover = page.locator(FUNCTIONAL_SEL.selectorPopover).last();
  await expect(popover, `${description} popover should be visible`).toBeVisible({ timeout: 10_000 });
  const item = popover.locator(itemSelector).last();
  await expect(item, `${description} menu item should be visible`).toBeVisible({ timeout: 10_000 });
  await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
}

export async function openSelectorApplicationFromCard(page: Page, title: string): Promise<void> {
  await expectNoCodeDashboardReady(page);
  await expectSelectorApplicationVisible(page, title);
  await dismissSelectorPopovers(page);

  const clicked = await page.evaluate(
    async ({ expectedTitle, titleSelector }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const visible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const isFolderCard = (card: HTMLElement) =>
        card.classList.contains('card-container--folder') ||
        !!card.querySelector(
          'ion-icon[src*="folder.svg"], ion-icon[src*="folder-open.svg"], img[src*="folder.svg"], img[src*="folder-open.svg"]',
        );
      const titleElement = [...document.querySelectorAll(titleSelector)]
        .filter(visible)
        .find((candidate) => normalize((candidate as HTMLElement).innerText).includes(expectedTitle)) as HTMLElement | undefined;
      const card = titleElement?.closest('[id^="idcard"]:not([id^="idcardO"])') as HTMLElement | null;
      if (!card || !visible(card) || isFolderCard(card)) {
        return false;
      }
      card.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      const target = (card.querySelector('.class1586272535795') as HTMLElement | null) ?? card;
      const rect = target.getBoundingClientRect();
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        target.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + Math.min(rect.width / 2, rect.width - 5),
            clientY: rect.top + Math.min(rect.height / 2, rect.height - 5),
            view: window,
          }),
        );
      }
      target.click();
      return true;
    },
    { expectedTitle: title, titleSelector: '.class1603968061706, .class1780484375240' },
  );
  expect(clicked, `selector application card ${title} should be clicked`).toBe(true);
  await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 60_000 });
}

async function openSelectorFolderFromCard(page: Page, title: string): Promise<void> {
  await expectNoCodeDashboardReady(page);
  await expectSelectorFolderVisible(page, title);
  await dismissSelectorPopovers(page);

  const clicked = await page.evaluate(
    async ({ expectedTitle }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const visible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const card = [...document.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')]
        .filter(visible)
        .find((candidate) => normalize((candidate as HTMLElement).innerText).includes(expectedTitle)) as HTMLElement | undefined;
      if (!card) {
        return false;
      }
      card.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      const target = (card.querySelector('.class1586272535795') as HTMLElement | null) ?? card;
      const rect = target.getBoundingClientRect();
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        target.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + Math.min(rect.width / 2, rect.width - 5),
            clientY: rect.top + Math.min(rect.height / 2, rect.height - 5),
            view: window,
          }),
        );
      }
      target.click();
      return true;
    },
    { expectedTitle: title },
  );
  expect(clicked, `selector folder card ${title} should be clicked`).toBe(true);
  await page.waitForTimeout(1_500);
}

export async function dismissSelectorPopovers(page: Page): Promise<void> {
  const popover = page.locator(FUNCTIONAL_SEL.selectorPopover).last();
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!(await popover.isVisible({ timeout: 500 }).catch(() => false))) {
      return;
    }
    await page.keyboard.press('Escape').catch(() => undefined);
    if (await popover.waitFor({ state: 'hidden', timeout: 1_000 }).then(() => true).catch(() => false)) {
      return;
    }
    await page.mouse.click(20, 20).catch(() => undefined);
    if (await popover.waitFor({ state: 'hidden', timeout: 1_000 }).then(() => true).catch(() => false)) {
      return;
    }
  }
}

function deleteApplicationAlert(page: Page, title: string): Locator {
  return page.locator('ion-alert:not(.overlay-hidden)').filter({ hasText: title }).last();
}

async function expectSelectorApplicationHidden(page: Page, title: string): Promise<void> {
  await expect
    .poll(() => selectorApplicationVisible(page, title), {
      message: `selector application "${title}" should be hidden`,
      timeout: 30_000,
    })
    .toBe(false);
}

async function selectorApplicationVisible(page: Page, title: string): Promise<boolean> {
  return page.evaluate(
    ({ expectedTitle, titleSelector }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const visible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const isFolderCard = (card: HTMLElement) =>
        card.classList.contains('card-container--folder') ||
        !!card.querySelector(
          'ion-icon[src*="folder.svg"], ion-icon[src*="folder-open.svg"], img[src*="folder.svg"], img[src*="folder-open.svg"]',
        );

      for (const titleElement of [...document.querySelectorAll(titleSelector)].filter(visible)) {
        const text = normalize((titleElement as HTMLElement).innerText);
        if (!text.includes(expectedTitle)) {
          continue;
        }
        const card = titleElement.closest('[id^="idcard"]:not([id^="idcardO"])') as HTMLElement | null;
        if (card && visible(card) && !isFolderCard(card)) {
          return true;
        }
      }
      return false;
    },
    { expectedTitle: title, titleSelector: '.class1603968061706, .class1780484375240' },
  );
}

async function searchSelectorApplicationsByNameThroughDashboard(page: Page, query: string): Promise<void> {
  await expectNoCodeDashboardReady(page);
  const input = await selectorApplicationSearchInput(page);
  await input.fill(query, { timeout: 10_000 });
  await input.press('Enter', { timeout: 10_000 });
  await page.waitForTimeout(1_500);
}

async function selectorApplicationSearchInput(page: Page): Promise<Locator> {
  const input = page
    .locator(
      [
        'page-selectorpage input[placeholder*="application" i]',
        'page-selectorpage input[aria-label*="application" i]',
        'page-selectorpage input[type="search"]',
        'page-selectorpage input:visible',
      ].join(', '),
    )
    .first();
  await expect(input, 'selector application search input should be visible').toBeVisible({ timeout: 15_000 });
  return input;
}

async function expectCommittedSelectorSearchQuery(page: Page, query: string | null): Promise<void> {
  const badge = page.locator(FUNCTIONAL_SEL.selectorCommittedSearchBadge).filter({ visible: true });
  if (query === null) {
    await expect(badge, 'selector should not display a committed search chip').toHaveCount(0, { timeout: 15_000 });
    return;
  }
  await expect(badge, 'selector should display the committed search chip').toHaveCount(1, { timeout: 15_000 });
  await expect(badge.first(), 'search chip should equal the last submitted query').toHaveText(query, { timeout: 15_000 });
}

async function setSelectorAllApplicationsFilter(page: Page, enabled: boolean): Promise<void> {
  await expectNoCodeDashboardReady(page);
  const button = page.locator(FUNCTIONAL_SEL.selectorAllApplicationsButton).first();
  await expect(button, 'All applications selector filter should be visible').toBeVisible({ timeout: 15_000 });
  if ((await selectorAllApplicationsFilterEnabled(page)) !== enabled) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expectSelectorAllApplicationsFilterEnabled(page, enabled);
}

async function expectSelectorAllApplicationsFilterEnabled(page: Page, enabled: boolean): Promise<void> {
  await expect
    .poll(() => selectorAllApplicationsFilterEnabled(page), {
      message: `All applications quick filter should be ${enabled ? 'enabled' : 'disabled'}`,
      timeout: 10_000,
    })
    .toBe(enabled);
}

async function selectorAllApplicationsFilterEnabled(page: Page): Promise<boolean> {
  return page.locator(FUNCTIONAL_SEL.selectorAllApplicationsButton).evaluateAll((buttons) => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const button = buttons.find(visible);
    return !!button?.classList.contains('btn--allapps');
  });
}

export async function expectLoginScreenVisible(page: Page): Promise<void> {
  await test.step('Assert the username/password login screen is visible', async () => {
    await expect(page.locator(SEL.loginPageRoot).first(), 'login page should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator(`${SEL.loginReveal}, ${SEL.emailInput}`).first(),
      'username/password login entry should be visible',
    ).toBeVisible({ timeout: 15_000 });
  });
}

export async function expectProtectedRouteRedirectsToLogin(page: Page, route = './settings'): Promise<void> {
  await test.step('Assert a protected route redirects to login after logout', async () => {
    await gotoWithTransientRetry(page, route);
    await expectLoginScreenVisible(page);
  });
}

export async function reloadDashboardAndExpectSessionPersists(page: Page): Promise<void> {
  await test.step('Reload the dashboard and assert the session persists', async () => {
    await expectNoCodeDashboardReady(page);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
  });
}

export async function createBlankApplicationThroughUi(page: Page, title = `Functional blank ${Date.now()}`): Promise<string> {
  return test.step('Create a blank application through the Studio UI', async () => {
    const id = await createBlankForm(page, title);
    expect(id, 'a new application id should be returned from the editor URL').toMatch(/^\d+$/);
    expect(await countComponents(page), 'a blank application should start without page components').toBe(0);
    return id;
  });
}

export async function createApplicationFromFirstTemplateThroughUi(page: Page): Promise<string> {
  return test.step('Create an application from the first available template', async () => {
    await expectNoCodeDashboardReady(page);
    await expectTemplateCardsRemainContainedThroughUi(page);
    const templateCard = await firstVisibleFromLocator(
      page,
      page.locator(FUNCTIONAL_SEL.selectorTemplateCard),
      'template application card',
    );
    await templateCard.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
    await templateCard.click({ timeout: 10_000 }).catch(async () => templateCard.dispatchEvent('click'));

    await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 60_000 });
    const id = page.url().match(/\/editor\/([^/?#]+)/)?.[1] ?? '';
    expect(id, 'a template-created application id should be present in the editor URL').toMatch(/^\d+$/);
    await page.locator('[draggable="true"]').first().waitFor({ state: 'visible', timeout: 30_000 });
    await expect
      .poll(() => countComponents(page), {
        message: 'a template-created application should contain at least one component',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
    return id;
  });
}

export async function createFolderAndValidateTitleThroughUi(page: Page, title = `Functional folder ${Date.now()}`): Promise<void> {
  await test.step('Create a selector folder and validate the title field', async () => {
    await expectNoCodeDashboardReady(page);
    await setSelectorHideFoldersFilter(page, false);

    const alert = await openCreateFolderPrompt(page);
    const input = alert.locator(SEL.createFolderTitleInput).first();
    const save = alert.locator(SEL.createFolderSaveButton).first();

    await expect(input, 'create folder title input should be visible').toBeVisible({ timeout: 15_000 });
    await expect(save, 'create folder save button should be visible').toBeVisible({ timeout: 10_000 });
    await expect
      .poll(() => locatorCanBeClicked(save), {
        message: 'create folder save button should be disabled while the title is empty',
        timeout: 10_000,
      })
      .toBe(false);

    await input.fill(title, { timeout: 15_000 });
    await expect(input, 'create folder title should be filled before saving').toHaveValue(title, { timeout: 10_000 });
    await expect
      .poll(() => locatorCanBeClicked(save), {
        message: 'create folder save button should become enabled after typing a title',
        timeout: 10_000,
      })
      .toBe(true);

    await save.click({ timeout: 10_000 }).catch(async () => save.dispatchEvent('click'));
    await expect(alert, 'create folder prompt should close after saving').toBeHidden({ timeout: 15_000 });
    await expectSelectorFolderVisible(page, title);
  });
}

export async function renameApplicationAndAssertPersistenceThroughUi(
  page: Page,
  originalTitle = `Functional rename original ${Date.now()}`,
  renamedTitle = `Functional rename updated ${Date.now()}`,
): Promise<void> {
  await test.step('Rename an application and assert the new title persists', async () => {
    const formId = await createBlankForm(page, originalTitle);
    await openApplicationSettings(page);

    const titleInput = page.locator(FUNCTIONAL_SEL.applicationNameInput).first();
    await expect(titleInput, 'application name input should be visible').toBeVisible({ timeout: 15_000 });
    await expect(titleInput, 'application name should start with the original title').toHaveValue(originalTitle, {
      timeout: 10_000,
    });

    await titleInput.fill(renamedTitle, { timeout: 10_000 });
    await titleInput.blur();
    await expect(titleInput, 'application name should be updated before closing settings').toHaveValue(renamedTitle, {
      timeout: 10_000,
    });
    await expect
      .poll(() => getFormDocument(page, formId).then((document) => String(document.name ?? '')).catch(() => ''), {
        message: 'renamed application title should be persisted before leaving the editor',
        timeout: 60_000,
      })
      .toBe(renamedTitle);

    const close = page.locator(FUNCTIONAL_SEL.applicationSettingsCloseButton).first();
    await expect(close, 'application settings close action should be visible').toBeVisible({ timeout: 10_000 });
    await close.click({ timeout: 10_000 }).catch(async () => close.dispatchEvent('click'));

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await expectSelectorApplicationVisible(page, renamedTitle);
    await reloadSelectorPage(page);
    await expectSelectorApplicationVisible(page, renamedTitle);
  });
}

export async function deleteApplicationCancelThenConfirmThroughUi(page: Page, title = `Functional delete ${Date.now()}`): Promise<void> {
  await test.step('Delete an application with cancel then confirm', async () => {
    await createBlankForm(page, title);
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await expectSelectorApplicationVisible(page, title);

    await openSelectorCardMenu(page, title);
    await clickSelectorPopoverItem(page, FUNCTIONAL_SEL.selectorDeleteMenuItem, 'delete application');
    const cancelAlert = deleteApplicationAlert(page, title);
    await expect(cancelAlert, 'delete application confirmation should be visible').toBeVisible({ timeout: 15_000 });
    const cancel = cancelAlert.locator('button.alert-button-role-cancel').first();
    await expect(cancel, 'delete application cancel action should be visible').toBeVisible({ timeout: 10_000 });
    await cancel.click({ timeout: 10_000 }).catch(async () => cancel.dispatchEvent('click'));
    await expect(cancelAlert, 'delete application confirmation should close after cancel').toBeHidden({ timeout: 15_000 });
    await expectSelectorApplicationVisible(page, title);

    await openSelectorCardMenu(page, title);
    await clickSelectorPopoverItem(page, FUNCTIONAL_SEL.selectorDeleteMenuItem, 'delete application');
    const confirmAlert = deleteApplicationAlert(page, title);
    await expect(confirmAlert, 'delete application confirmation should reopen').toBeVisible({ timeout: 15_000 });
    const confirm = confirmAlert.locator('button.btn--danger').last();
    await expect(confirm, 'delete application confirm action should be visible').toBeVisible({ timeout: 10_000 });
    await confirm.click({ timeout: 10_000 }).catch(async () => confirm.dispatchEvent('click'));
    await expect(confirmAlert, 'delete application confirmation should close after confirm').toBeHidden({ timeout: 15_000 });
    await expectSelectorApplicationHidden(page, title);
    await reloadSelectorPage(page);
    await expectSelectorApplicationHidden(page, title);
  });
}

export async function duplicateApplicationAndAssertCopyThroughUi(page: Page, title = `Functional duplicate ${Date.now()}`): Promise<void> {
  await test.step('Duplicate an application and assert the copy keeps its content', async () => {
    const originalId = await createBlankForm(page, title);
    await addComponent(page, PALETTE_ICON.description);
    await expect
      .poll(() => countComponents(page), {
        message: 'original application should contain at least one component before duplication',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await expectSelectorApplicationVisible(page, title);

    await openSelectorCardMenu(page, title);
    await clickSelectorPopoverItem(page, FUNCTIONAL_SEL.selectorDuplicateMenuItem, 'duplicate application');

    const copyTitle = `${title}_copy`;
    expect(copyTitle, 'duplicate application title should be distinct from the original').not.toBe(title);
    await expectSelectorApplicationVisible(page, title);
    await expectSelectorApplicationVisible(page, copyTitle);
    await dismissSelectorPopovers(page);

    await openSelectorApplicationFromCard(page, copyTitle);
    const copyId = page.url().match(/\/editor\/([^/?#]+)/)?.[1] ?? '';
    expect(copyId, 'duplicate application should open with an editor id').toMatch(/^\d+$/);
    expect(copyId, 'duplicate application should have a distinct id').not.toBe(originalId);
    await expect
      .poll(() => countComponents(page), {
        message: 'duplicated application should keep at least one component',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  });
}

export async function moveApplicationIntoFolderAndAssertThroughUi(
  page: Page,
  folderTitle = `Functional move folder ${Date.now()}`,
  title = `Functional move app ${Date.now()}`,
): Promise<void> {
  await test.step('Move an application into a folder and assert folder filters', async () => {
    await createFolderAndValidateTitleThroughUi(page, folderTitle);
    await createBlankForm(page, title);

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await setSelectorHideFoldersFilter(page, false);
    await expectSelectorFolderVisible(page, folderTitle);
    await expectSelectorApplicationVisible(page, title);

    await openSelectorCardMenu(page, title);
    await clickSelectorPopoverItem(page, FUNCTIONAL_SEL.selectorManageFoldersMenuItem, 'manage folders and tags');
    const modal = page.locator(FUNCTIONAL_SEL.labelsModal).last();
    await expect(modal, 'manage folders and tags modal should be visible').toBeVisible({ timeout: 15_000 });

    const folderInput = modal.locator(FUNCTIONAL_SEL.labelsFolderInput).first();
    await expect(folderInput, 'folder tag input should be visible').toBeVisible({ timeout: 15_000 });
    await folderInput.fill(folderTitle, { timeout: 10_000 });
    await folderInput.press('Enter', { timeout: 10_000 });
    await expect(modal, 'selected folder should be displayed in the modal').toContainText(folderTitle, { timeout: 10_000 });

    const save = modal.locator(FUNCTIONAL_SEL.labelsSaveButton).first();
    await expect(save, 'manage folders and tags save action should be visible').toBeVisible({ timeout: 10_000 });
    await save.click({ timeout: 10_000 }).catch(async () => save.dispatchEvent('click'));
    await expect(modal, 'manage folders and tags modal should close after save').toBeHidden({ timeout: 20_000 });

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await setSelectorHideFoldersFilter(page, true);
    await expectSelectorFolderHidden(page, folderTitle);
    await setSelectorHideFoldersFilter(page, false);
    await expectSelectorFolderVisible(page, folderTitle);
    await expectSelectorApplicationHidden(page, title);

    await openSelectorFolderFromCard(page, folderTitle);
    await expectSelectorApplicationVisible(page, title);
  });
}

export async function searchApplicationsByNameVariantsThroughUi(page: Page, suffix = `${Date.now()}`): Promise<void> {
  await test.step('Search applications by case, accent, and punctuation', async () => {
    const folderTitle = `Functional search folder ${suffix}`;
    const cases = [
      {
        title: `Functional Search Case ${suffix}`,
        query: `functional search case ${suffix}`,
      },
      {
        title: `Functional Search Éclair ${suffix}`,
        query: `functional search éclair ${suffix}`,
      },
      {
        title: `Functional Search Punct ${suffix} - A.B_C!?`,
        query: `Functional Search Punct ${suffix} - A.B_C!?`,
      },
    ];

    // A folder makes clearing an empty query observable: #1442 previously
    // left the selector in a filtered state where folders did not come back.
    await createFolderAndValidateTitleThroughUi(page, folderTitle);

    for (const { title } of cases) {
      await createBlankForm(page, title);
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expectNoCodeDashboardReady(page);
    }

    for (const [index, { title, query }] of cases.entries()) {
      const input = await selectorApplicationSearchInput(page);
      await input.fill(query, { timeout: 10_000 });
      if (index === 0) {
        await expectCommittedSelectorSearchQuery(page, null);
      }
      await input.press('Enter', { timeout: 10_000 });
      await expectCommittedSelectorSearchQuery(page, query);
      await expectSelectorSearchKeepsSingleApplication(page, title);

      // Typing and modifier keys edit only the pending query. They must not
      // erase or rewrite the chip for the last query committed with Enter.
      await input.press('Control', { timeout: 10_000 });
      await input.fill(`${query} pending`, { timeout: 10_000 });
      await expectCommittedSelectorSearchQuery(page, query);
      await expectSelectorSearchKeepsSingleApplication(page, title);
      await input.fill(query, { timeout: 10_000 });
    }

    await test.step('Open advanced filters and return to the direct search bar', async () => {
      const advancedSearch = page.locator(FUNCTIONAL_SEL.selectorAdvancedSearchButton).filter({ visible: true }).first();
      await expect(advancedSearch, 'direct search should expose the advanced-filter action').toBeVisible({ timeout: 15_000 });
      await advancedSearch.click({ timeout: 10_000 }).catch(async () => advancedSearch.dispatchEvent('click'));

      const panel = page.locator(FUNCTIONAL_SEL.selectorAdvancedSearchPanel).filter({ visible: true }).first();
      await expect(panel, 'advanced search panel should open from the direct search bar').toBeVisible({ timeout: 15_000 });
      const content = page.locator(`${SEL.selectorPageRoot} ion-content`).first();
      const contentBounds = await content.boundingBox();
      expect(contentBounds, 'selector content should expose an outside-click surface').not.toBeNull();
      await page.mouse.click(contentBounds!.x + 4, contentBounds!.y + contentBounds!.height - 4);
      await expect(panel, 'closing advanced search should restore the direct search bar').toBeHidden({ timeout: 15_000 });
      await selectorApplicationSearchInput(page);
    });

    const input = await selectorApplicationSearchInput(page);
    await input.fill('', { timeout: 10_000 });
    await input.press('Enter', { timeout: 10_000 });
    await expectCommittedSelectorSearchQuery(page, null);
    await expectSelectorFolderVisible(page, folderTitle);
  });
}

export async function verifyDashboardStateSurvivesImportModalAndViewSwitchThroughUi(
  page: Page,
  title = `Functional dashboard state ${Date.now()}`,
): Promise<void> {
  await test.step('Preserve selector state while opening the import modal and switching views', async () => {
    await createBlankForm(page, title);
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await searchSelectorApplicationsByNameThroughDashboard(page, title);
    await expectSelectorApplicationVisible(page, title);
    await expectCommittedSelectorSearchQuery(page, title);

    const root = page.locator(SEL.selectorPageRoot).first();
    const input = await selectorApplicationSearchInput(page);
    const pendingQuery = `${title} pending`;
    const stateMarker = `e2e-${Date.now()}`;
    await root.evaluate((element, marker) => ((element as HTMLElement).dataset.e2eSelectorState = marker), stateMarker);
    const applicationCard = page
      .locator('[id^="idcard"]:not([id^="idcardO"])')
      .filter({ hasText: title, visible: true })
      .first();
    await expect(applicationCard, 'searched application card should be visible before opening the modal').toBeVisible({
      timeout: 15_000,
    });
    await applicationCard.evaluate(
      (element, marker) => ((element as HTMLElement).dataset.e2eSelectorCardState = marker),
      stateMarker,
    );
    await input.fill(pendingQuery, { timeout: 10_000 });
    const dashboardUrl = page.url();

    const expectStatePreserved = async (context: string) => {
      await expect(page, `${context} should not navigate away from the selector`).toHaveURL(dashboardUrl);
      await expect
        .poll(
          () => root.evaluate((element) => (element as HTMLElement).dataset.e2eSelectorState ?? ''),
          { message: `${context} should keep the same selector page instance`, timeout: 15_000 },
        )
        .toBe(stateMarker);
      await expect(input, `${context} should preserve the pending search text`).toHaveValue(pendingQuery);
      await expectCommittedSelectorSearchQuery(page, title);
    };

    const importButton = page.locator(FUNCTIONAL_SEL.selectorImportButton).filter({ visible: true }).first();
    await expect(importButton, 'selector import action should be visible').toBeVisible({ timeout: 15_000 });
    await importButton.click({ timeout: 10_000 }).catch(async () => importButton.dispatchEvent('click'));

    const modal = page.locator(FUNCTIONAL_SEL.selectorImportModal).last();
    await expect(modal, 'application import modal should open over the selector').toBeVisible({ timeout: 15_000 });
    await expectSolidPrimaryImportAction(modal);
    await expectStatePreserved('opening the import modal');

    const close = modal.locator(FUNCTIONAL_SEL.selectorImportModalCloseButton).filter({ visible: true }).first();
    await expect(close, 'application import modal close action should be visible').toBeVisible({ timeout: 10_000 });
    await close.click({ timeout: 10_000 }).catch(async () => close.dispatchEvent('click'));
    await expect(modal, 'application import modal should close').toBeHidden({ timeout: 15_000 });
    await expectStatePreserved('closing the import modal');
    await expect
      .poll(
        () => applicationCard.evaluate((element) => (element as HTMLElement).dataset.e2eSelectorCardState ?? ''),
        { message: 'closing the import modal should not replace or reload the displayed application data', timeout: 15_000 },
      )
      .toBe(stateMarker);

    const listView = page.locator(FUNCTIONAL_SEL.selectorListViewButton).filter({ visible: true }).first();
    await expect(listView, 'selector list-view action should be visible').toBeVisible({ timeout: 15_000 });
    await listView.click({ timeout: 10_000 }).catch(async () => listView.dispatchEvent('click'));
    await expectStatePreserved('switching to list view');
    await expectSelectorApplicationVisible(page, title);

    const gridView = page.locator(FUNCTIONAL_SEL.selectorGridViewButton).filter({ visible: true }).first();
    await expect(gridView, 'selector grid-view action should be visible').toBeVisible({ timeout: 15_000 });
    await gridView.click({ timeout: 10_000 }).catch(async () => gridView.dispatchEvent('click'));
    await expectStatePreserved('switching back to grid view');
    await expectSelectorApplicationVisible(page, title);
  });
}

async function expectTemplateCardsRemainContainedThroughUi(page: Page): Promise<void> {
  const originalViewport = page.viewportSize();

  try {
    for (const viewport of [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'narrow desktop', width: 1024, height: 900 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const cards = page.locator(`${FUNCTIONAL_SEL.selectorTemplateCard}:visible`);
      await expect(cards.first(), `${viewport.name} selector should expose a template card`).toBeVisible({ timeout: 30_000 });
      const cardCount = await cards.count();
      expect(cardCount, `${viewport.name} selector should expose at least one template`).toBeGreaterThan(0);

      const layout = await page.evaluate(
        ({ cardSelector, listSelector, moreSelector }) => {
          const visible = (element: Element): element is HTMLElement => {
            const rect = (element as HTMLElement).getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          };
          const cardElements = [...document.querySelectorAll(cardSelector)].filter(visible);
          const list = document.querySelector(listSelector) as HTMLElement | null;
          const more = [...document.querySelectorAll(moreSelector)].find(visible);
          if (cardElements.length === 0 || !list || !more) return null;

          const listRect = list.getBoundingClientRect();
          const cardRects = cardElements.map((element) => element.getBoundingClientRect());
          const edgeCards = [cardRects[0], cardRects[cardRects.length - 1]];
          const moreRect = more.getBoundingClientRect();
          const tolerance = 1;
          return {
            edgeCardsContained: edgeCards.every(
              (rect) =>
                rect.left >= listRect.left - tolerance &&
                rect.right <= listRect.right + tolerance &&
                rect.top >= listRect.top - tolerance &&
                rect.bottom <= listRect.bottom + tolerance,
            ),
            edgeCardsInsideViewport: edgeCards.every(
              (rect) =>
                rect.left >= -tolerance &&
                rect.right <= window.innerWidth + tolerance &&
                rect.top >= -tolerance &&
                rect.bottom <= window.innerHeight + tolerance,
            ),
            maxCardBottom: Math.max(...cardRects.map((rect) => rect.bottom)),
            moreTop: moreRect.top,
            listBottom: listRect.bottom,
            firstPointerEvents: getComputedStyle(cardElements[0]).pointerEvents,
          };
        },
        {
          cardSelector: FUNCTIONAL_SEL.selectorTemplateCard,
          listSelector: FUNCTIONAL_SEL.selectorTemplateList,
          moreSelector: FUNCTIONAL_SEL.selectorTemplateMoreButton,
        },
      );

      expect(layout, `${viewport.name} template cards and See more control should share the selector layout`).not.toBeNull();
      expect(layout!.edgeCardsContained, `${viewport.name} first and last template cards should fit their list`).toBe(true);
      expect(layout!.edgeCardsInsideViewport, `${viewport.name} first and last template cards should not be clipped`).toBe(true);
      expect(layout!.listBottom, `${viewport.name} template list should extend below every card`).toBeGreaterThanOrEqual(
        layout!.maxCardBottom - 1,
      );
      expect(layout!.moreTop, `${viewport.name} See more control should start after the template cards`).toBeGreaterThanOrEqual(
        layout!.maxCardBottom - 1,
      );
      expect(layout!.firstPointerEvents, `${viewport.name} first template card should remain actionable`).not.toBe('none');
    }
  } finally {
    if (originalViewport) await page.setViewportSize(originalViewport);
  }
}

async function expectSolidPrimaryImportAction(modal: Locator): Promise<void> {
  const button = modal.locator(FUNCTIONAL_SEL.selectorImportModalConfirmButton).filter({ visible: true }).first();
  await expect(button, 'application import modal should expose its Import action').toBeVisible({ timeout: 15_000 });

  await expectButtonUsesSolidThemeColor(button, '--ion-color-primary', 'application Import action');
}

async function expectButtonUsesSolidThemeColor(
  button: Locator,
  colorVariable: `--${string}`,
  description: string,
): Promise<void> {
  const colors = await button.evaluate((host, variable) => {
    const native = host.shadowRoot?.querySelector<HTMLElement>('[part="native"]') ?? (host as HTMLElement);
    const hostStyle = getComputedStyle(host);
    const nativeStyle = getComputedStyle(native);
    const themeValue = hostStyle.getPropertyValue(variable).trim();
    const probe = document.createElement('span');
    probe.style.backgroundColor = themeValue;
    document.body.appendChild(probe);
    const themeColor = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      backgroundImage: nativeStyle.backgroundImage,
      backgroundColor: nativeStyle.backgroundColor,
      themeColor,
    };
  }, colorVariable);

  expect(colors.backgroundImage, `${description} should not retain a gradient`).toBe('none');
  expect(colors.themeColor, `${description} should resolve ${colorVariable}`).not.toBe('rgba(0, 0, 0, 0)');
  expect(colors.backgroundColor, `${description} should use the resolved ${colorVariable}`).toBe(colors.themeColor);
}

export async function assertSelectorFiltersThroughUi(
  page: Page,
  folderTitle = `Functional filter folder ${Date.now()}`,
  title = `Functional filter app ${Date.now()}`,
): Promise<void> {
  await test.step('Assert selector filters for owned apps, folders, and all applications', async () => {
    await createFolderAndValidateTitleThroughUi(page, folderTitle);
    await createBlankForm(page, title);

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    // Let the initial FullSync-backed list settle before opening or changing
    // filters. Interacting while the selector starts its first fetch can leave
    // the virtual list stuck on skeleton cards in CI.
    await searchSelectorApplicationsByNameThroughDashboard(page, title);
    await expectSelectorApplicationVisible(page, title);
    const collaboratorIdentity = await addFirstAvailableCollaboratorFromSelectorCard(page, title);
    expect(collaboratorIdentity, 'a collaborator should be selected for the test application').not.toBe('');

    await setSelectorMyApplicationsFilter(page, true);
    await expectSelectorMyApplicationsFilterEnabled(page, true);
    await searchSelectorApplicationsByNameThroughDashboard(page, title);
    await expectSelectorApplicationVisible(page, title);
    await setSelectorMyApplicationsFilter(page, false);
    await expectSelectorMyApplicationsFilterEnabled(page, false);

    await setSelectorAllApplicationsFilter(page, true);
    await expectSelectorAllApplicationsFilterEnabled(page, true);
    await searchSelectorApplicationsByNameThroughDashboard(page, title);
    await expectSelectorApplicationVisible(page, title);
    await setSelectorAllApplicationsFilter(page, false);
    await expectSelectorAllApplicationsFilterEnabled(page, false);

    // Folder names are not part of the application-name search index. Clear
    // the query and create the folder at the top of the current list before
    // asserting the dedicated Hide folders filter.
    await searchSelectorApplicationsByNameThroughDashboard(page, '');
    await createFolderAndValidateTitleThroughUi(page, folderTitle);
    await setSelectorHideFoldersFilter(page, true);
    await expectSelectorFolderHidden(page, folderTitle);
    await setSelectorHideFoldersFilter(page, false);
    await expectSelectorFolderVisible(page, folderTitle);
  });
}

export async function expectSelectorUserSearchFilterVisibilityThroughUi(page: Page, visible: boolean): Promise<void> {
  await test.step(`Assert selector user search filter is ${visible ? 'visible to administrators' : 'hidden from non-administrators'}`, async () => {
    await expectNoCodeDashboardReady(page);

    const advancedSearchToggle = page.locator(SEL.selectorFilterInlineToggleButton).filter({ visible: true }).first();
    await expect(advancedSearchToggle, 'selector advanced-search toggle should be visible').toBeVisible({ timeout: 15_000 });
    await advancedSearchToggle.click({ timeout: 10_000 }).catch(async () => advancedSearchToggle.dispatchEvent('click'));

    const userFilter = page.locator(FUNCTIONAL_SEL.selectorUserSearchFilter);
    if (visible) {
      await expect(userFilter, 'administrator advanced search should expose the user filter').toBeVisible({ timeout: 15_000 });
      await expect(
        page.locator(FUNCTIONAL_SEL.selectorUserSearchInput).filter({ visible: true }).first(),
        'administrator user filter should expose an editable autocomplete input',
      ).toBeVisible({ timeout: 15_000 });
    } else {
      await expect(userFilter, 'non-administrator advanced search must not render the user filter').toHaveCount(0, {
        timeout: 10_000,
      });
    }
  });
}

export async function reopenExistingApplicationFromSelectorThroughUi(page: Page, title = `Functional reopen ${Date.now()}`): Promise<void> {
  await test.step('Open an existing application from the selector', async () => {
    const originalId = await createBlankForm(page, title);
    await addComponent(page, PALETTE_ICON.description);
    await expect
      .poll(() => countComponents(page), {
        message: 'application should contain at least one component before reopening',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);

    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await expectSelectorApplicationVisible(page, title);
    await openSelectorApplicationFromCard(page, title);

    const reopenedId = page.url().match(/\/editor\/([^/?#]+)/)?.[1] ?? '';
    expect(reopenedId, 'reopened application should keep the original editor id').toBe(originalId);
    await expect
      .poll(() => countComponents(page), {
        message: 'reopened application should keep its components',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  });
}

export async function verifyLongApplicationNamePresentationThroughUi(page: Page): Promise<void> {
  const title = `Functional long application ${Date.now()} ${'readable-name-segment-'.repeat(8)}`;

  await test.step('Create an application whose name overflows selector cards', async () => {
    await createBlankForm(page, title);
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
  });

  try {
    await test.step('Verify grid mode keeps the full name in an ellipsis tooltip', async () => {
      await expectLongSelectorTitleContract(page, SEL.selectorCardTitle, title, 'grid');
    });

    await test.step('Verify list mode keeps the full name in an ellipsis tooltip', async () => {
      const listView = page.locator(FUNCTIONAL_SEL.selectorListViewButton).filter({ visible: true }).first();
      await expect(listView, 'selector list-view button should be visible').toBeVisible({ timeout: 15_000 });
      await listView.click({ timeout: 10_000 }).catch(async () => listView.dispatchEvent('click'));
      await expectLongSelectorTitleContract(page, SEL.selectorListTitle, title, 'list');
    });
  } finally {
    const gridView = page.locator(FUNCTIONAL_SEL.selectorGridViewButton).filter({ visible: true }).first();
    if (await gridView.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await gridView.click({ timeout: 10_000 }).catch(async () => gridView.dispatchEvent('click'));
    }
  }
}

async function expectLongSelectorTitleContract(
  page: Page,
  selector: string,
  title: string,
  view: 'grid' | 'list',
): Promise<void> {
  const surface = view === 'grid' ? 'grid card' : 'list row';
  const name = page.locator(selector).filter({ hasText: title }).first();
  await expect(name, `${surface} should render the long application name`).toBeVisible({ timeout: 30_000 });
  await expect(name, `${surface} should represent the exact complete application name`).toHaveText(title);
  await expect
    .poll(
      () =>
        name.evaluate((element) => {
          const style = window.getComputedStyle(element);
          return {
            clipped: element.scrollWidth > element.clientWidth,
            overflow: style.overflow,
            textOverflow: style.textOverflow,
            whiteSpace: style.whiteSpace,
          };
        }),
      { message: `${surface} should truncate the long name on one line without clipping either edge`, timeout: 15_000 },
    )
    .toEqual({ clipped: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });

  await expect
    .poll(
      () =>
        name.evaluate((element, mode) => {
          const container = mode === 'grid' ? element : element.parentElement;
          if (!container) throw new Error(`${mode} application title has no clipping container`);

          const firstTextNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
          if (!firstTextNode?.textContent) throw new Error(`${mode} application title has no text node`);

          const firstGlyphs = document.createRange();
          firstGlyphs.setStart(firstTextNode, 0);
          firstGlyphs.setEnd(firstTextNode, Math.min(5, firstTextNode.textContent.length));
          const glyphBounds = firstGlyphs.getBoundingClientRect();
          const containerBounds = container.getBoundingClientRect();
          const containerStyle = window.getComputedStyle(container);

          return {
            overflowsContainer: container.scrollWidth > container.clientWidth + 20,
            overflow: containerStyle.overflow,
            textOverflow: containerStyle.textOverflow,
            whiteSpace: containerStyle.whiteSpace,
            titleBeginningInsideLeft: glyphBounds.left >= containerBounds.left - 1,
            firstGlyphsInsideRight: glyphBounds.right <= containerBounds.right + 1,
          };
        }, view),
      {
        message: `${surface} should overflow at the end while keeping its first glyphs inside the clipping container`,
        timeout: 15_000,
      },
    )
    .toEqual({
      overflowsContainer: true,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      titleBeginningInsideLeft: true,
      firstGlyphsInsideRight: true,
    });

  await name.hover();
  const tooltip = page
    .locator('[role="tooltip"], mat-tooltip-component, .mat-tooltip, .mat-mdc-tooltip')
    .filter({ hasText: title })
    .last();
  await expect(tooltip, `${surface} hover should expose the complete application name`).toBeVisible({ timeout: 5_000 });
  await expect(tooltip).toHaveText(title);
}

export async function currentUserLanguageFromSettings(page: Page): Promise<string> {
  return test.step('Read the current user language from Settings', async () => {
    const select = await openSettingsLanguageSelect(page);
    const value = await select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value);
    return typeof value === 'string' && value ? value : 'en';
  });
}

export async function changeUserLanguageThroughSettings(page: Page, language: string): Promise<void> {
  await test.step(`Change the user language to ${language} through Settings`, async () => {
    const select = await openSettingsLanguageSelect(page);
    await selectIonOptionByValue(page, select, language, 'Settings language');
    await expectStoredStudioLanguage(page, language);
  });
}

export async function expectStoredStudioLanguage(page: Page, language: string): Promise<void> {
  await test.step(`Assert the stored Studio language is ${language}`, async () => {
    await expect
      .poll(
        () =>
          page.evaluate(() => ({
            localStorageLanguage: window.localStorage.getItem('lang'),
            htmlLanguage: document.documentElement.getAttribute('lang'),
          })),
        { message: `Studio language should be stored as ${language}`, timeout: 10_000 },
      )
      .toMatchObject({ localStorageLanguage: language, htmlLanguage: language });
  });
}

async function openSettingsLanguageSelect(page: Page): Promise<Locator> {
  await page.goto('./settings', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.locator('page-settingspage').first(), 'Settings page should be visible').toBeVisible({ timeout: 30_000 });
  const select = page
    .locator(
      [
        'page-settingspage ion-select.class1764696178121:visible',
        'page-settingspage ion-select.class1587717673221:visible',
        'page-settingspage ion-select.class1764696261252:visible',
      ].join(', '),
    )
    .first();
  await expect(select, 'Settings language selector should be visible').toBeVisible({ timeout: 15_000 });
  return select;
}

async function openUsernamePasswordLoginForm(page: Page): Promise<void> {
  await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.locator(SEL.loginPageRoot).first(), 'login page should be visible').toBeVisible({ timeout: 30_000 });
  if (await page.locator(SEL.emailInput).first().isVisible({ timeout: 1_000 }).catch(() => false)) {
    return;
  }

  const reveal = await firstVisibleFromLocator(page, page.locator(SEL.loginReveal), 'login form reveal button', 30_000);
  await reveal.click({ timeout: 10_000 });
  await expect(page.locator(SEL.emailInput).first(), 'login email input should be visible').toBeVisible({ timeout: 15_000 });
}

async function selectIonOptionByValue(page: Page, select: Locator, value: string, description: string): Promise<void> {
  await expect(select, `${description} select should be visible`).toBeVisible({ timeout: 15_000 });
  const optionIndex = await select.evaluate(
    (el, expectedValue) =>
      Array.from(el.querySelectorAll('ion-select-option')).findIndex(
        (option) => String((option as HTMLElement & { value?: unknown }).value ?? option.getAttribute('value') ?? '') === expectedValue,
      ),
    value,
  );
  if (optionIndex < 0) {
    throw new Error(`${description} option ${value} should exist`);
  }
  await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
  const items = page.locator('ion-select-popover ion-item');
  await items.first().waitFor({ state: 'visible', timeout: 8_000 });
  await items.nth(optionIndex).click({ timeout: 10_000 }).catch(async () => items.nth(optionIndex).dispatchEvent('click'));
  await expect
    .poll(() => select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
      message: `${description} should be ${value}`,
      timeout: 10_000,
    })
    .toBe(value);
}
