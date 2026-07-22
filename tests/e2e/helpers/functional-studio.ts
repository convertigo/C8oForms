import { expect, test, type Locator, type Page } from '@playwright/test';
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
  login,
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

const FUNCTIONAL_SEL = {
  applicationNameInput: 'ion-input.class1776265600007 input, .class1776265600007 input',
  applicationSettingsCloseButton: 'button.class1780498802542',
  selectorDeleteMenuItem: 'ion-item.class1566923689496',
  selectorDuplicateMenuItem: 'ion-item.class1588251387387',
  selectorManageFoldersMenuItem: 'ion-item.class1578920252046',
  selectorPopover: 'ion-popover:not(.overlay-hidden):visible page-popoverpageselector',
  selectorAllApplicationsButton: 'ion-button.class1761754659662',
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

export function functionalEmptyUserCredentials(): LoginCredentials | null {
  const user = (process.env.C8OFORMS_FUNCTIONAL_EMPTY_USER ?? defaultProvisionedFunctionalUser('empty')).trim();
  if (!user || user.toLowerCase() === TEST_USER.toLowerCase()) {
    return null;
  }

  return {
    user,
    password: process.env.C8OFORMS_FUNCTIONAL_EMPTY_PASSWORD ?? user,
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

function defaultProvisionedFunctionalUser(kind: 'secondary' | 'empty' | 'admin'): string {
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
    await forgottenPassword.click({ timeout: 10_000 });

    const modal = page.locator('ion-modal.show-modal page-resetpasswordpage, page-resetpasswordpage').first();
    await expect(modal, 'forgotten password modal should be visible').toBeVisible({ timeout: 15_000 });
    await expect(
      modal.locator('ion-input.class1757510564581 input, ion-input.class1582285458300 input').first(),
      'forgotten password email input should be visible',
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      modal.locator('ion-button.send-button, ion-button.class1757510317776, ion-button.class1582285458387').first(),
      'forgotten password send action should be visible',
    ).toBeVisible({ timeout: 15_000 });

    const close = modal.locator('ion-button.close-button, ion-button.class1757510386777').first();
    await expect(close, 'forgotten password modal close action should be visible').toBeVisible({ timeout: 15_000 });
    await close.click({ timeout: 10_000 });
    await expect(modal, 'forgotten password modal should close').toBeHidden({ timeout: 15_000 });
    await expectLoginScreenVisible(page);
  });
}

export async function expectNoCodeDashboardReady(page: Page): Promise<void> {
  await test.step('Assert the No-Code Studio dashboard is ready', async () => {
    await expect(page.locator(SEL.selectorPageRoot).first(), 'selector page should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.blankFormCard).first(), 'blank application creation entry should be visible').toBeVisible({
      timeout: 15_000,
    });
  });
}

export async function logoutFromNoCodeDashboard(page: Page): Promise<void> {
  await test.step('Log out from the No-Code Studio dashboard', async () => {
    await expectNoCodeDashboardReady(page);
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
    await menuButton.click({ timeout: 10_000 });

    const logoutLabel = /logout|log out|déconnexion|se déconnecter|cerrar sesión|disconnetti/i;
    const logoutButton = await firstVisibleCandidate(
      [
        page.locator('ion-menu').getByRole('button', { name: logoutLabel }).first(),
        page.locator('ion-menu .logout-button[role="button"]:visible').first(),
        page.getByRole('button', { name: logoutLabel }).first(),
        page.locator('ion-menu ion-item.class1759249408074:visible').first(),
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

async function openSelectorCardMenu(page: Page, title: string): Promise<void> {
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

async function clickSelectorPopoverItem(page: Page, itemSelector: string, description: string): Promise<void> {
  const popover = page.locator(FUNCTIONAL_SEL.selectorPopover).last();
  await expect(popover, `${description} popover should be visible`).toBeVisible({ timeout: 10_000 });
  const item = popover.locator(itemSelector).last();
  await expect(item, `${description} menu item should be visible`).toBeVisible({ timeout: 10_000 });
  await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
}

async function openSelectorApplicationFromCard(page: Page, title: string): Promise<void> {
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

async function dismissSelectorPopovers(page: Page): Promise<void> {
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
  await input.fill(query, { timeout: 10_000 });
  await input.press('Enter', { timeout: 10_000 });
  await page.waitForTimeout(1_500);
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
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60_000 });
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
    const templateCard = await firstVisibleFromLocator(page, page.locator('.class1645547241674'), 'template application card');
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

    for (const { title } of cases) {
      await createBlankForm(page, title);
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expectNoCodeDashboardReady(page);
    }

    for (const { title, query } of cases) {
      await searchSelectorApplicationsByNameThroughDashboard(page, query);
      await expectSelectorSearchKeepsSingleApplication(page, title);
    }
  });
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
    await setSelectorHideFoldersFilter(page, false);
    await expectSelectorFolderVisible(page, folderTitle);
    await expectSelectorApplicationVisible(page, title);

    const collaborator = await addFirstAvailableCollaboratorFromSelectorCard(page, title);
    expect(collaborator, 'a collaborator should be selected for the test application').toContain('@');

    await setSelectorMyApplicationsFilter(page, true);
    await expectSelectorMyApplicationsFilterEnabled(page, true);
    await expectSelectorApplicationVisible(page, title);
    await setSelectorMyApplicationsFilter(page, false);
    await expectSelectorMyApplicationsFilterEnabled(page, false);

    await setSelectorHideFoldersFilter(page, true);
    await expectSelectorFolderHidden(page, folderTitle);
    await setSelectorHideFoldersFilter(page, false);
    await expectSelectorFolderVisible(page, folderTitle);

    await setSelectorAllApplicationsFilter(page, true);
    await expectSelectorAllApplicationsFilterEnabled(page, true);
    await searchSelectorApplicationsByNameThroughDashboard(page, title);
    await expectSelectorApplicationVisible(page, title);
    await setSelectorAllApplicationsFilter(page, false);
    await expectSelectorAllApplicationsFilterEnabled(page, false);
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
