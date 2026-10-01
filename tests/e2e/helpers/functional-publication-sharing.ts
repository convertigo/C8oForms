import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import {
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  c8oCall,
  clickPublishedQrButton,
  clickVisibleSelectorCardMenuByTitle,
  closeComponentConfig,
  configurePublishedApplicationPublicLinkAndAssertQrLabel,
  createBlankForm,
  expectCollaboratorsCsvImportAvailable,
  expectPublishedQrButtonMode,
  expectPublishedQrTooltipMode,
  expectPwaAccessModeSelected,
  expectSelectorApplicationVisible,
  getFormDocument,
  getPwaDocument,
  login,
  openEditor,
  openPublishedApplicationsTab,
  openApplicationSettingsFromSidebar,
  openPublishedPwaEditor,
  openPublishedShareApplicationModal,
  openPublishedViewer,
  openComponentConfigAt,
  openConfigTabById,
  openEditorCollaboratorsModal,
  fillViewerTextInput,
  PALETTE_ICON,
  publishCurrentFormWithPwa,
  publishedPwaUrl,
  publishedViewerToolbarThemeState,
  searchSelectorApplicationsByName,
  setSelectorMyApplicationsFilter,
  sharePublishedApplicationWithNotification,
  setPwaAccessModeAndSave,
  setTechnicalId,
  submitViewerForm,
  TEST_USER,
  viewerTextInput,
  type LoginCredentials,
  type PublishedToolbarButtonThemeState,
} from './studio';
import {
  changeUserLanguageThroughSettings,
  currentUserLanguageFromSettings,
} from './functional-studio';
import { configureGridBaserowTableAndAssertViewerRowsThroughUi } from './functional-sources';
import {
  createFunctionalAdminSequenceClient,
  type FunctionalAdminSequenceClient,
} from './functional-users';

type FormDocument = Awaited<ReturnType<typeof getFormDocument>>;
type PwaDocument = Awaited<ReturnType<typeof getPwaDocument>>;
type PublishedPwaCacheSnapshot = {
  supported: boolean;
  controlled: boolean;
  scope: string;
  cacheNames: string[];
  cachedUrls: string[];
};
type PwaCacheAccessMode = 'anonymous' | 'authenticated';
type PublishedPwaCacheFixture = {
  mode: PwaCacheAccessMode;
  title: string;
  technicalId: string;
  pwaIndexUrl: string;
};

const TEXT_INPUT_PUBLICATION_SEL = {
  requiredToggle: 'c8oforms-toggleswitch.class1776263100018:visible, .class1776263100018:visible',
} as const;

const PUBLISHED_VIEWER_RESPONSIVE_VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 900 },
] as const;

const PUBLISHED_ACCESS_DENIED_RE =
  /(?:sufficient permissions|permissions suffisantes|permisos suficientes|permessi sufficienti)/i;

export async function publishAuthenticatedApplicationThroughUi(page: Page): Promise<void> {
  const title = `Functional published authenticated ${Date.now()}`;
  let formId = '';

  await test.step('Create and publish an authenticated PWA', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'authenticated');
  });

  await test.step('Assert the authenticated PWA is listed and opens for the current user', async () => {
    await expect
      .poll(async () => (await getPwaDocument(page, formId))?.notAnonymous, {
        message: 'authenticated PWA document should persist notAnonymous=true',
        timeout: 60_000,
      })
      .toBe(true);

    await openPublishedApplicationsTab(page);
    await expectSelectorApplicationVisible(page, title);
    await openPublishedViewer(page, formId);
    await expect(page.locator(SEL.viewerPage), 'authenticated published viewer should open').toBeAttached({ timeout: 60_000 });
  });
}

export async function publishAnonymousApplicationAndOpenWithoutSessionThroughUi(
  page: Page,
  browser: Browser,
): Promise<void> {
  const title = `Functional published anonymous ${Date.now()}`;
  let formId = '';
  let anonymousKey = '';

  await test.step('Create and publish an anonymous PWA', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
    const pwa = await expectPwaDocument(page, formId, 'anonymous PWA document should exist after publication');
    expect(pwa.notAnonymous, 'anonymous PWA document should persist notAnonymous=false').toBe(false);
    anonymousKey = publishedViewerTargetId(pwa, publishedApplicationId(formId));
    expect(anonymousKey, 'anonymous PWA should expose a public target id').not.toBe('');
  });

  await test.step('Open the anonymous PWA in a fresh browser context', async () => {
    const url = standalonePwaUrl(page, anonymousKey);
    const context = await browser.newContext();
    try {
      const anonymousPage = await context.newPage();
      await anonymousPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await acceptRgpdIfVisible(anonymousPage);
      await expect(anonymousPage.locator(SEL.viewerPage), 'anonymous PWA should render the viewer').toBeAttached({
        timeout: 60_000,
      });
      await expect(anonymousPage.locator(SEL.loginPageRoot), 'anonymous PWA should not require the login page').toHaveCount(0, {
        timeout: 5_000,
      });
      await expect(anonymousPage.getByText(title, { exact: true }).first(), 'anonymous PWA should show the application title').toBeVisible({
        timeout: 60_000,
      });
    } finally {
      await context.close();
    }
  });
}

export async function updateExistingPwaWithoutRepublishingThroughUi(page: Page): Promise<void> {
  const title = `Functional PWA edit ${Date.now()}`;
  const updatedShortName = `FPWA${Date.now().toString().slice(-7)}`;
  let formId = '';
  let publishedVersionBefore = '';
  let pwaRevisionBefore = '';

  await test.step('Create and publish the initial PWA', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
    publishedVersionBefore = await waitForPublishedApplicationVersion(page, formId);
    const pwa = await expectPwaDocument(page, formId, 'PWA document should exist before editing');
    pwaRevisionBefore = documentRevision(pwa);
    expect(pwaRevisionBefore, 'PWA document should expose an initial revision').not.toBe('');
  });

  await test.step('Update only the existing PWA short name', async () => {
    await openPublishedPwaEditor(page, title);
    await setPwaShortNameAndSave(page, updatedShortName);
  });

  await test.step('Assert the PWA changed without creating another published application', async () => {
    await expect
      .poll(async () => {
        const pwa = await getPwaDocument(page, formId);
        return pwa?.shortName === updatedShortName && documentRevision(pwa) !== pwaRevisionBefore;
      }, {
        message: 'saving the existing PWA should update the PWA document revision and short name',
        timeout: 60_000,
      })
      .toBe(true);

    await expectPublishedApplicationVersionUnchanged(page, formId, publishedVersionBefore);
    await openPublishedApplicationsTab(page);
    await expectSelectorApplicationVisible(page, title);
    await expectPublishedCardCount(page, title, 1);
  });
}

export async function switchAnonymousPwaBackToAuthenticatedThroughUi(page: Page): Promise<void> {
  const title = `Functional PWA access ${Date.now()}`;
  let formId = '';
  let anonymousRevision = '';

  await test.step('Create and publish an anonymous PWA', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
    const pwa = await expectPwaDocument(page, formId, 'anonymous PWA should exist before access switch');
    expect(pwa.notAnonymous, 'fixture should start as anonymous').toBe(false);
    anonymousRevision = documentRevision(pwa);
  });

  await test.step('Switch the existing PWA back to authenticated', async () => {
    await openPublishedPwaEditor(page, title);
    await expectPwaAccessModeSelected(page, 'anonymous');
    await setPwaAccessModeAndSave(page, 'authenticated');

    await expect
      .poll(async () => {
        const pwa = await getPwaDocument(page, formId);
        return pwa?.notAnonymous === true && (!anonymousRevision || documentRevision(pwa) !== anonymousRevision);
      }, {
        message: 'saving the PWA editor should persist authenticated access',
        timeout: 60_000,
      })
      .toBe(true);

    await openPublishedPwaEditor(page, title);
    await expectPwaAccessModeSelected(page, 'authenticated');
  });
}

export async function verifyPwaConfigurationReopenAndViewerMetadataThroughUi(page: Page): Promise<void> {
  const title = `Functional PWA config ${Date.now()}`;
  let formId = '';
  let pageName = '';
  let pwaName = '';
  let themeColor = '';
  let pwa: NonNullable<PwaDocument>;

  await test.step('Create and publish a PWA with the configuration wizard', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
    pwa = await expectPwaDocument(page, formId, 'PWA configuration document should exist after publication');
    const form = await getFormDocument(page, formId);
    pageName = firstFormPageName(form);
    pwaName = String(pwa.name ?? '').trim();
    themeColor = String(pwa.themeColor ?? pwa.backgroundColor ?? '').trim();
    expect(pageName, 'published form should expose its first page name for the browser title').not.toBe('');
    expect(pwaName, 'PWA document should persist a name').not.toBe('');
    expect(String(pwa.shortName ?? ''), 'PWA document should persist a short name').not.toBe('');
    expectCssColorVisible(themeColor, 'PWA document should persist a visible theme/background color');
  });

  await test.step('Reopen the PWA editor and verify persisted configuration fields', async () => {
    await openPublishedPwaEditor(page, title);
    const modal = page.locator(SEL.pwaEditModal).last();
    await expect(modal, 'PWA editor should reopen').toBeVisible({ timeout: 30_000 });

    const nameInput = modal.getByRole('textbox').nth(0);
    await expect(nameInput, 'PWA name input should be visible after reopening').toBeVisible({ timeout: 15_000 });
    await expect(nameInput, 'PWA name should persist after reopening').toHaveValue(String(pwa.name), { timeout: 10_000 });

    const shortNameInput = modal.getByRole('textbox').nth(1);
    await expect(shortNameInput, 'PWA short name input should be visible after reopening').toBeVisible({ timeout: 15_000 });
    await expect(shortNameInput, 'PWA short name should persist after reopening').toHaveValue(String(pwa.shortName), {
      timeout: 10_000,
    });

    const iconPicker = modal.locator(SEL.pwaIconEditor).first();
    await expect(iconPicker, 'PWA icon editor should remain visible after reopening').toBeVisible({ timeout: 15_000 });
    await expectConfiguredPwaIconContained(page, modal, iconPicker);
    await modal.locator(SEL.pwaSaveButton).first().click({ timeout: 10_000 }).catch(async () => {
      await modal.locator(SEL.pwaSaveButton).first().dispatchEvent('click');
    });
    await expect(modal, 'PWA editor should close after reopening checks').toBeHidden({ timeout: 60_000 });
  });

  await test.step('Open the published viewer and verify standalone PWA layout and branding', async () => {
    await openPublishedViewer(page, formId);
    await expect(page.locator(SEL.viewerPage), 'published viewer should open for PWA configuration checks').toBeVisible({
      timeout: 60_000,
    });

    await expect
      .poll(() => page.title(), {
        message: 'standalone PWA browser title should contain the complete application and page names',
        timeout: 30_000,
      })
      .toBe(`${pwaName}: ${pageName}`);

    const splitPane = page.locator('ion-split-pane').first();
    await expect(splitPane, 'standalone PWA should render inside the application split-pane host').toBeAttached();
    await expect(splitPane, 'standalone PWA split pane should not be open initially on desktop').not.toHaveClass(
      /split-pane-visible/,
    );
    await expect(
      page.locator('ion-menu.show-menu:visible, ion-menu.menu-pane-visible:visible'),
      'standalone PWA should not expose an initially open menu',
    ).toHaveCount(0);

    const toolbar = page.locator(SEL.publishedToolbar).first();
    const applicationName = toolbar.getByText(pwaName, { exact: true }).filter({ visible: true }).first();
    await expect(applicationName, 'published PWA header should expose its exact application name').toBeVisible({
      timeout: 60_000,
    });
    await expect(applicationName, 'published PWA header should retain the complete application name').toHaveText(pwaName);
    await expect(
      toolbar.getByText(/^(?:Convertigo Forms|No Code Studio)$/).filter({ visible: true }),
      'published PWA header should not fall back to Studio branding',
    ).toHaveCount(0);

    const state = await publishedViewerToolbarThemeState(page);
    expectCssColorVisible(state.toolbarBackgroundColor, 'published viewer toolbar should expose the configured PWA theme color');
    expectCssColorClose(
      state.toolbarBackgroundColor,
      themeColor,
      'published viewer toolbar background should match the configured PWA theme color',
    );

    const expectedTextColor = contrastingTextColor(themeColor);
    expectCssColorClose(
      state.toolbarColor,
      expectedTextColor,
      'published viewer toolbar should compute contrasting text from the PWA theme color',
    );
    const applicationNameColor = await applicationName.evaluate((element) => getComputedStyle(element).color);
    expectCssColorClose(
      applicationNameColor,
      expectedTextColor,
      'published PWA application name should render with the computed contrasting text color',
    );
  });
}

export async function verifyAnonymousPwaLanguagePersistenceWithGridThroughUi(
  page: Page,
  browser: Browser,
): Promise<void> {
  const title = `Functional anonymous language Grid ${Date.now()}`;
  let formId = '';
  let pwaUrl = '';

  await test.step('Create a Grid-backed application and publish it anonymously', async () => {
    formId = await createBlankForm(page, title);
    await configureGridBaserowTableAndAssertViewerRowsThroughUi(page);
    await openEditor(page, formId);
    await publishCurrentFormWithPwa(page, 'anonymous');

    const pwa = await expectPwaDocument(page, formId, 'anonymous language PWA document should exist after publication');
    expect(pwa.notAnonymous, 'language persistence fixture should be published anonymously').toBe(false);
    pwaUrl = standalonePwaUrl(page, publishedViewerTargetId(pwa, publishedApplicationId(formId)));
  });

  await test.step('Apply and persist a language without losing the Grid in an anonymous browser', async () => {
    const context = await browser.newContext({ locale: 'en-US' });
    try {
      const anonymousPage = await context.newPage();
      await anonymousPage.goto(pwaUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await acceptRgpdIfVisible(anonymousPage);
      await expect(anonymousPage.locator(SEL.viewerPage), 'anonymous PWA viewer should open').toBeVisible({
        timeout: 60_000,
      });

      const initialRows = await visiblePublishedGridRows(anonymousPage);
      expect(initialRows.length, 'published Grid should expose both deterministic Baserow fixture rows').toBeGreaterThanOrEqual(2);

      const languageSelect = await openPublishedLanguageSelect(anonymousPage);
      await expect(languageSelect, 'fresh anonymous PWA should select the browser language').toHaveJSProperty('value', 'en');
      await expect
        .poll(() => anonymousPage.locator('html').getAttribute('lang'), {
          message: 'fresh anonymous PWA metadata should use the browser language',
          timeout: 15_000,
        })
        .toBe('en');

      await selectPublishedLanguageThroughUi(anonymousPage, languageSelect, 'fr');
      await expect(languageSelect, 'anonymous PWA language selection should update immediately').toHaveJSProperty('value', 'fr');
      await expect
        .poll(() => anonymousPage.evaluate(() => localStorage.getItem('lang')), {
          message: 'anonymous PWA language selection should persist in localStorage',
          timeout: 15_000,
        })
        .toBe('fr');
      await expect
        .poll(() => anonymousPage.locator('html').getAttribute('lang'), {
          message: 'anonymous PWA metadata should follow the selected language',
          timeout: 15_000,
        })
        .toBe('fr');

      await closePublishedMenuIfOpen(anonymousPage);
      expect(await visiblePublishedGridRows(anonymousPage), 'language change should preserve the published Grid rows').toEqual(
        initialRows,
      );

      const applicationReloadButton = anonymousPage.locator(SEL.publishedToolbarReloadButton).first();
      await expect(applicationReloadButton, 'anonymous PWA toolbar should expose its application reload action').toBeVisible({
        timeout: 30_000,
      });
      await applicationReloadButton
        .click({ timeout: 10_000 })
        .catch(async () => applicationReloadButton.dispatchEvent('click'));
      await expect(anonymousPage.locator(SEL.viewerPage), 'anonymous PWA should reopen after application reload').toBeVisible({
        timeout: 60_000,
      });
      expect(
        await visiblePublishedGridRows(anonymousPage),
        'persisted language should not break Grid after application reload',
      ).toEqual(initialRows);

      const reloadedLanguageSelect = await openPublishedLanguageSelect(anonymousPage);
      await expect(
        reloadedLanguageSelect,
        'anonymous PWA should restore the persisted language after application reload',
      ).toHaveJSProperty('value', 'fr');
      await expect
        .poll(() => anonymousPage.locator('html').getAttribute('lang'), {
          message: 'application-reloaded anonymous PWA metadata should retain the persisted language',
          timeout: 15_000,
        })
        .toBe('fr');
    } finally {
      await context.close();
    }
  });
}

async function openPublishedLanguageSelect(page: Page): Promise<Locator> {
  const menuButton = page.locator(SEL.publishedToolbarMenuButton).first();
  await expect(menuButton, 'published viewer menu button should be visible').toBeVisible({ timeout: 30_000 });
  await menuButton.click({ timeout: 10_000 }).catch(async () => menuButton.dispatchEvent('click'));

  const menu = page.locator('ion-menu.show-menu:visible, ion-menu.menu-pane-visible:visible').last();
  await expect(menu, 'published viewer menu should open').toBeVisible({ timeout: 15_000 });
  const languageSelect = menu.locator('ion-select#button_lang').first();
  await expect(languageSelect, 'published viewer menu should expose its language selector').toBeVisible({ timeout: 15_000 });
  return languageSelect;
}

async function selectPublishedLanguageThroughUi(page: Page, languageSelect: Locator, language: string): Promise<void> {
  await languageSelect.click({ timeout: 10_000 }).catch(async () => languageSelect.dispatchEvent('click'));
  const popover = page.locator('ion-popover.custom-popover:not(.overlay-hidden):visible, ion-popover.my-custom-interface:not(.overlay-hidden):visible').last();
  await expect(popover, 'published language options should open in a popover').toBeVisible({ timeout: 15_000 });

  const option = popover.locator(`ion-radio[value="${language}"], ion-item:has(ion-label[lang="${language}"])`).first();
  await expect(option, `published language option ${language} should be visible`).toBeVisible({ timeout: 15_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(popover, 'published language options should close after selection').toBeHidden({ timeout: 15_000 });
}

async function closePublishedMenuIfOpen(page: Page): Promise<void> {
  const menu = page.locator('ion-menu.show-menu:visible, ion-menu.menu-pane-visible:visible').last();
  if (!(await menu.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return;
  }

  const menuButton = page.locator(SEL.publishedToolbarMenuButton).first();
  await menuButton.click({ timeout: 10_000 }).catch(async () => menuButton.dispatchEvent('click'));
  await expect(menu, 'published viewer menu should close').toBeHidden({ timeout: 15_000 });
}

async function visiblePublishedGridRows(page: Page): Promise<string[]> {
  const grid = page.locator(`${SEL.gridComponent}:visible`).first();
  await expect(grid, 'published Data Grid should be visible').toBeVisible({ timeout: 60_000 });
  const rows = grid.locator('.ag-center-cols-container .ag-row');
  await expect
    .poll(() => rows.count(), {
      message: 'published Data Grid should finish rendering its fixture rows',
      timeout: 60_000,
    })
    .toBeGreaterThanOrEqual(2);

  return rows.evaluateAll((elements) =>
    elements.map((element) => (element.textContent ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()),
  );
}

function firstFormPageName(form: FormDocument): string {
  if (!Array.isArray(form.pages)) {
    return '';
  }
  const firstPage = form.pages[0];
  return firstPage && typeof firstPage === 'object' && !Array.isArray(firstPage)
    ? String((firstPage as Record<string, unknown>).name ?? '').trim()
    : '';
}

async function expectConfiguredPwaIconContained(page: Page, modal: Locator, iconPicker: Locator): Promise<void> {
  await test.step('Verify the configured PWA icon stays inside its picker and modal', async () => {
    await expect(iconPicker, 'configured PWA icon picker should expose its configured state').toHaveClass(
      /icon-picker--configured/,
    );
    const geometry = await iconPicker.evaluate((element) => {
      const picker = element as HTMLElement;
      const pickerBox = picker.getBoundingClientRect();
      const modal = picker.closest('ion-modal') as HTMLElement | null;
      const modalBox = modal?.getBoundingClientRect();
      const visualCandidates = [
        ...picker.querySelectorAll(':scope > img, :scope > ion-img, :scope > div:not(.info-upload-img)'),
      ].filter((candidate) => {
        const box = (candidate as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(candidate);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      });
      const contained = visualCandidates.every((candidate) => {
        const box = (candidate as HTMLElement).getBoundingClientRect();
        return (
          box.left >= pickerBox.left - 1 &&
          box.top >= pickerBox.top - 1 &&
          box.right <= pickerBox.right + 1 &&
          box.bottom <= pickerBox.bottom + 1 &&
          (!modalBox ||
            (box.left >= modalBox.left - 1 &&
              box.top >= modalBox.top - 1 &&
              box.right <= modalBox.right + 1 &&
              box.bottom <= modalBox.bottom + 1))
        );
      });
      return {
        width: pickerBox.width,
        height: pickerBox.height,
        clientWidth: picker.clientWidth,
        clientHeight: picker.clientHeight,
        scrollWidth: picker.scrollWidth,
        scrollHeight: picker.scrollHeight,
        visualCount: visualCandidates.length,
        contained,
      };
    });

    expect(geometry.width, 'PWA icon picker should keep its fixed 120px width').toBeCloseTo(120, 0);
    expect(geometry.height, 'PWA icon picker should keep its fixed 120px height').toBeCloseTo(120, 0);
    expect(geometry.visualCount, 'PWA icon picker should expose a visible configured visual').toBeGreaterThan(0);
    expect(geometry.contained, 'PWA icon visual should stay geometrically contained').toBe(true);
    expect(geometry.scrollWidth, 'PWA icon picker should not overflow horizontally').toBeLessThanOrEqual(
      geometry.clientWidth + 1,
    );
    expect(geometry.scrollHeight, 'PWA icon picker should not overflow vertically').toBeLessThanOrEqual(
      geometry.clientHeight + 1,
    );

    const overlay = iconPicker.locator('.info-upload-img').first();
    await expect(overlay, 'configured PWA icon should expose an edit overlay').toBeAttached();
    await page.mouse.move(5, 5);
    await expect(overlay, 'configured icon overlay should start transparent').toHaveCSS('opacity', '0');
    await expect(overlay, 'configured icon overlay should not intercept input before hover').toHaveCSS(
      'pointer-events',
      'none',
    );
    await iconPicker.hover();
    await expect(overlay, 'configured icon overlay should appear on hover').toHaveCSS('opacity', '1');
    await expect(overlay, 'configured icon overlay should become interactive on hover').toHaveCSS(
      'pointer-events',
      'auto',
    );
    await expect(modal, 'PWA modal should remain open after the icon hover contract').toBeVisible();
  });
}

export async function verifyPublishedViewerToolbarThemeThroughUi(page: Page): Promise<void> {
  const title = `Functional PWA toolbar ${Date.now()}`;
  let formId = '';

  await test.step('Create and publish an anonymous PWA for toolbar assertions', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
    await expectPwaDocument(page, formId, 'anonymous PWA should exist before toolbar assertions');
  });

  await test.step('Open the published viewer and assert toolbar buttons inherit the theme', async () => {
    await openPublishedViewer(page, formId);
    const state = await publishedViewerToolbarThemeState(page);
    expect(state.toolbarVisibility, 'published toolbar should not stay hidden after PWA theme loading').not.toBe('hidden');
    expectCssColorVisible(state.toolbarBackgroundColor, 'published toolbar should expose the selected PWA theme color');
    expectToolbarButtonUsesTheme(state.menu, state.toolbarColor, 'menu');
    expectToolbarButtonUsesTheme(state.reload, state.toolbarColor, 'reload');
  });
}

export async function submitSimplePublishedFormThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const title = `Functional published submit ${suffix}`;
  const requiredTechnicalId = `functional_pub_required_${suffix}`;
  const optionalTechnicalId = `functional_pub_optional_${suffix}`;
  const requiredValue = `Functional required value ${suffix}`;
  const optionalValue = `Functional optional value ${suffix}`;
  let formId = '';

  await test.step('Create a simple form with required and optional Text inputs', async () => {
    formId = await createBlankForm(page, title);
    await createPublishedTextInput(page, requiredTechnicalId, { required: true });
    await createPublishedTextInput(page, optionalTechnicalId, { required: false });
  });

  await test.step('Publish the simple form as an anonymous PWA', async () => {
    await publishCurrentFormWithPwa(page, 'anonymous');
    await expectPwaDocument(page, formId, 'anonymous PWA should exist before opening the simple published viewer');
  });

  await test.step('Open the published viewer, fill values, and submit the response', async () => {
    await openPublishedViewer(page, formId, `#${requiredTechnicalId}`);
    await fillViewerTextInput(page, requiredTechnicalId, requiredValue);
    await fillViewerTextInput(page, optionalTechnicalId, optionalValue);
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'published simple form submission should complete').toBeAttached({
      timeout: 60_000,
    });
  });
}

const SINGLE_RESPONSE_SETTING_RE =
  /(?:Do not allow more than one response per person|Ne pas autoriser plus d[’']une réponse par personne|No permitir más de una respuesta por persona|Non consentire più di una risposta per persona)/i;
const LOOP_TO_FORM_SETTING_RE =
  /(?:Return to the first page of the application after submission|Revenir à la première page de l'application après soumission|Volver a la primera página de la aplicaciones después del envío|Tornare alla prima pagina del applicazione dopo l'invio)/i;
const SEND_ANOTHER_RESPONSE_RE =
  /^(?:Send another repl(?:y|ies)|Envoyer une autre réponse|Enviar otra respuesta|Invia un'altra risposta)$/i;
const CORRECT_FRENCH_SINGLE_RESPONSE_MESSAGE =
  'Vous avez déjà répondu à ce formulaire, et une seule réponse est autorisée.';
const INCORRECT_FRENCH_SINGLE_RESPONSE_MESSAGE =
  "Vous avez déjà répondu à ce formulaire, et une seule réponse n'est autorisée.";

/**
 * #1300: create, configure, publish and answer the form only through rendered UI.
 * The user language is also changed and restored through the Settings screen.
 */
export async function verifyFrenchSingleResponseMessageThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const title = `Functional single response ${suffix}`;
  const technicalId = `functional_single_response_${suffix}`;
  const submittedValue = `Réponse fonctionnelle ${suffix}`;
  let formId = '';
  let originalLanguage = 'en';
  let languageChanged = false;
  let scenarioError: unknown;

  try {
    await test.step('Switch the Studio user to French through Settings', async () => {
      originalLanguage = await currentUserLanguageFromSettings(page);
      if (originalLanguage !== 'fr') {
        await changeUserLanguageThroughSettings(page, 'fr');
        languageChanged = true;
      }
    });

    await test.step('Create a form and enable one response per person through application Settings', async () => {
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      formId = await createBlankForm(page, title);
      await createPublishedTextInput(page, technicalId, { required: false });
      await setBooleanApplicationSettingThroughUi(page, SINGLE_RESPONSE_SETTING_RE, true, 'one response per person');
      await expect
        .poll(() => readPersistedFormBoolean(page, formId, ['config', 'oneRespByPerson']), {
          message: 'one-response-per-person must persist before publication',
          timeout: 30_000,
        })
        .toBe(true);
    });

    await test.step('Publish and submit the authenticated form once', async () => {
      await publishCurrentFormWithPwa(page, 'authenticated');
      await expectPwaDocument(page, formId, 'authenticated one-response PWA should exist before submission');
      await openPublishedViewer(page, formId, `#${technicalId}`);
      await fillViewerTextInput(page, technicalId, submittedValue);
      await submitViewerForm(page);
      await expect(page.locator(SEL.responseCompletedPage), 'the first response should complete successfully').toBeAttached({
        timeout: 60_000,
      });
    });

    await test.step('Reopen the form and assert the corrected French rejection message', async () => {
      await openPublishedViewer(page, formId);
      const viewer = page.locator(SEL.viewerPage).first();
      await expect(viewer, 'the one-response viewer should reopen for the same authenticated user').toBeVisible({
        timeout: 60_000,
      });
      await expect(
        viewer.getByText(CORRECT_FRENCH_SINGLE_RESPONSE_MESSAGE, { exact: true }),
        'the single-response rejection should use the corrected French agreement',
      ).toBeVisible({ timeout: 60_000 });
      await expect(
        viewer.getByText(INCORRECT_FRENCH_SINGLE_RESPONSE_MESSAGE, { exact: true }),
        'the former incorrect French agreement must not be rendered',
      ).toHaveCount(0);
    });
  } catch (error) {
    scenarioError = error;
    throw error;
  } finally {
    if (languageChanged) {
      await test.step(`Restore the Studio user language to ${originalLanguage}`, async () => {
        try {
          await changeUserLanguageThroughSettings(page, originalLanguage);
        } catch (restoreError) {
          if (scenarioError === undefined) throw restoreError;
          console.warn(`Studio language restore failed after the #1300 scenario had already failed: ${String(restoreError)}`);
        }
      });
    }
  }
}

/**
 * #1302: the completion-page button must decode forwardData before rebuilding
 * viewerPage. Without the fix, JSON.parse receives the URL-encoded object and
 * the manual return never reopens the form for a second response.
 */
export async function verifyNonLoopingResponsePreservesEncodedNavigationDataThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const title = `Functional forward data ${suffix}`;
  const technicalId = `functional_forward_data_${suffix}`;
  const firstResponseValue = `Élodie & 50% + a=b / ? # ${suffix}`;
  const secondResponseValue = `Maël = 75% & x+y # ${suffix}`;
  let formId = '';

  await test.step('Create a non-looping form through Studio application Settings', async () => {
    formId = await createBlankForm(page, title);
    await createPublishedTextInput(page, technicalId, { required: false });
    await setBooleanApplicationSettingThroughUi(page, LOOP_TO_FORM_SETTING_RE, false, 'return to form after submission');
    await expect
      .poll(() => readPersistedFormBoolean(page, formId, ['loopToForm']), {
        message: 'loopToForm=false must persist before publication',
        timeout: 30_000,
      })
      .toBe(false);
  });

  await test.step('Publish the form and submit a response containing special characters', async () => {
    await publishCurrentFormWithPwa(page, 'authenticated');
    await expectPwaDocument(page, formId, 'authenticated non-looping PWA should exist before submission');
    await openPublishedViewer(page, formId, `#${technicalId}`);
    await fillViewerTextInput(page, technicalId, firstResponseValue);
    await submitViewerForm(page);
  });

  await test.step('Return manually from the response completion page', async () => {
    const completion = page.locator(SEL.responseCompletedPage).first();
    await expect(completion, 'non-looping submission should stay on the response completion page').toBeVisible({
      timeout: 60_000,
    });
    const sendAnother = completion.getByRole('button', { name: SEND_ANOTHER_RESPONSE_RE }).first();
    await expectActionableInsideViewport(page, sendAnother, 'send another response button');
    await sendAnother.click({ timeout: 10_000 }).catch(async () => sendAnother.dispatchEvent('click'));
    await expect(page.locator(SEL.viewerPage), 'manual response return should reopen viewerPage').toBeAttached({ timeout: 60_000 });
  });

  await test.step('Submit a second special-character response after the decoded return', async () => {
    await expect(viewerTextInput(page, technicalId), 'the returned viewer should expose the original Text input').toBeVisible({
      timeout: 60_000,
    });
    await fillViewerTextInput(page, technicalId, secondResponseValue);
    await expect(viewerTextInput(page, technicalId), 'the second special-character value should remain exact before resubmission').toHaveValue(
      secondResponseValue,
    );
    await submitViewerForm(page);
    await expect(
      page.locator(SEL.responseCompletedPage).first(),
      'the second response should complete after the manual decoded return',
    ).toBeVisible({ timeout: 60_000 });
  });
}

async function setBooleanApplicationSettingThroughUi(
  page: Page,
  label: RegExp,
  enabled: boolean,
  description: string,
): Promise<void> {
  await openApplicationSettingsFromSidebar(page);
  const formCategory = page.locator('.app-settings-categories button.class1779358000042').filter({ visible: true }).first();
  await expect(formCategory, 'application settings should expose the Form category').toBeVisible({ timeout: 15_000 });
  await formCategory.click({ timeout: 10_000 }).catch(async () => formCategory.dispatchEvent('click'));
  const row = page.locator('ion-item:visible, c8oforms-toggleswitch:visible').filter({ hasText: label }).first();
  await expect(row, `${description} application setting should be visible`).toBeVisible({ timeout: 15_000 });

  const checkbox = row.locator('ion-checkbox:visible').first();
  if (await checkbox.isVisible({ timeout: 1_000 }).catch(() => false)) {
    if ((await ionCheckboxChecked(checkbox)) !== enabled) {
      await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
    }
    await expect
      .poll(() => ionCheckboxChecked(checkbox), {
        message: `${description} checkbox should be ${enabled ? 'checked' : 'unchecked'}`,
        timeout: 15_000,
      })
      .toBe(enabled);
  } else {
    const target = row.locator('button.c8o-btn:visible').nth(enabled ? 0 : 1);
    await expect(target, `${description} ${enabled ? 'Yes' : 'No'} option should be visible`).toBeVisible({ timeout: 10_000 });
    if (!((await target.getAttribute('class')) ?? '').includes('c8o-btn-selected')) {
      await target.click({ timeout: 10_000 }).catch(async () => target.dispatchEvent('click'));
    }
    await expect(target, `${description} option should be selected`).toHaveClass(/c8o-btn-selected/, { timeout: 15_000 });
  }

  const close = page.locator('.c8o-btn-close:visible').last();
  if (await close.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await close.click({ timeout: 10_000 }).catch(async () => close.dispatchEvent('click'));
  }
}

async function ionCheckboxChecked(checkbox: Locator): Promise<boolean> {
  return checkbox.evaluate((element) => {
    const ionCheckbox = element as HTMLElement & { checked?: boolean };
    return (
      ionCheckbox.checked === true ||
      element.getAttribute('aria-checked') === 'true' ||
      element.classList.contains('checkbox-checked')
    );
  });
}

async function readPersistedFormBoolean(page: Page, formId: string, path: string[]): Promise<boolean | undefined> {
  let value: unknown = await getFormDocument(page, formId);
  for (const key of path) {
    value = jsonRecord(value)?.[key];
  }
  return typeof value === 'boolean' ? value : undefined;
}

export async function verifyPublishedViewerResponsiveLayoutThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const title = `Functional PWA responsive ${suffix}`;
  const technicalId = `functional_pub_responsive_${suffix}`;
  let formId = '';

  await test.step('Create and publish a simple anonymous PWA for responsive assertions', async () => {
    formId = await createBlankForm(page, title);
    await createPublishedTextInput(page, technicalId, { required: false });
    await publishCurrentFormWithPwa(page, 'anonymous');
    await expectPwaDocument(page, formId, 'anonymous PWA should exist before responsive viewer assertions');
  });

  for (const viewport of PUBLISHED_VIEWER_RESPONSIVE_VIEWPORTS) {
    await test.step(`Verify published viewer layout on ${viewport.name}`, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openPublishedViewer(page, formId, `#${technicalId}`);
      await expect(page.locator(SEL.viewerPage), `${viewport.name} viewer page should render`).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.locator(`#${technicalId}`).first(), `${viewport.name} text input should remain visible`).toBeVisible({
        timeout: 30_000,
      });
      await expectActionableInsideViewport(
        page,
        page.locator(SEL.publishedToolbarMenuButton).first(),
        `${viewport.name} menu button`,
      );
      await expectActionableInsideViewport(
        page,
        page.locator(SEL.publishedToolbarReloadButton).first(),
        `${viewport.name} reload button`,
      );
      await expectActionableInsideViewport(
        page,
        page.locator(SEL.viewerSubmitButton).first(),
        `${viewport.name} submit action`,
      );
    });
  }
}

export async function verifyPublishedPwaCacheMetadataThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  let anonymousFixture: PublishedPwaCacheFixture | null = null;
  let authenticatedFixture: PublishedPwaCacheFixture | null = null;

  await test.step('Create and publish anonymous and authenticated PWAs for cache assertions', async () => {
    anonymousFixture = await createPublishedPwaCacheFixture(page, 'anonymous', suffix);
    authenticatedFixture = await createPublishedPwaCacheFixture(page, 'authenticated', suffix);
  });
  expect(anonymousFixture, 'anonymous PWA cache fixture should be created').not.toBeNull();
  expect(authenticatedFixture, 'authenticated PWA cache fixture should be created').not.toBeNull();
  const anonymous = anonymousFixture!;
  const authenticated = authenticatedFixture!;

  await test.step('Verify the published PWA manifest and service-worker metadata are served', async () => {
    await expectPublishedPwaMetadataResources(page, anonymous);
    await expectPublishedPwaMetadataResources(page, authenticated);
  });

  await test.step('Open the published PWAs and verify service-worker registration', async () => {
    await expectPublishedPwaServiceWorkerRegistration(page, anonymous.pwaIndexUrl, `#${anonymous.technicalId}`);
    await expectPublishedPwaServiceWorkerRegistration(page, authenticated.pwaIndexUrl, `#${authenticated.technicalId}`);
  });

  await test.step('Verify the published PWA application shell reloads offline', async () => {
    await expectPublishedPwaOfflineShellReload(page, anonymous.pwaIndexUrl, `#${anonymous.technicalId}`);
    await expectPublishedPwaOfflineShellReload(page, authenticated.pwaIndexUrl, `#${authenticated.technicalId}`);
  });
}

async function createPublishedPwaCacheFixture(
  page: Page,
  mode: PwaCacheAccessMode,
  suffix: number,
): Promise<PublishedPwaCacheFixture> {
  const title = `Functional PWA cache ${mode} ${suffix}`;
  const technicalId = `functional_pwa_cache_${mode}_${suffix}`;

  await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.locator(SEL.selectorPageRoot).first(), 'selector page should be visible before creating a PWA cache fixture').toBeVisible({
    timeout: 60_000,
  });

  const formId = await createBlankForm(page, title);
  await createPublishedTextInput(page, technicalId, { required: false });
  await publishCurrentFormWithPwa(page, mode);
  const pwa = await expectPwaDocument(page, formId, `${mode} PWA should exist before cache metadata assertions`);
  expect(pwa.notAnonymous, `${mode} PWA access flag should persist`).toBe(mode === 'authenticated');
  const targetId = publishedViewerTargetId(pwa, publishedApplicationId(formId));
  expect(targetId, `${mode} PWA should expose a standalone target id for cache metadata`).not.toBe('');

  return {
    mode,
    title,
    technicalId,
    pwaIndexUrl: standalonePwaUrl(page, targetId),
  };
}

async function expectPublishedPwaMetadataResources(page: Page, fixture: PublishedPwaCacheFixture): Promise<void> {
  const environment = await expectPublishedPwaJson(
    page,
    new URL('env.json', fixture.pwaIndexUrl).toString(),
    `${fixture.mode} env.json`,
  );
  expect(String(environment.appTemplateVersion ?? ''), `${fixture.mode} PWA env.json should expose its template version`).not.toBe('');
  expect(String(environment.remoteBase ?? ''), `${fixture.mode} PWA env.json should expose its backend endpoint`).not.toBe('');

  const manifest = await expectPublishedPwaJson(
    page,
    new URL('manifest.webmanifest', fixture.pwaIndexUrl).toString(),
    `${fixture.mode} manifest.webmanifest`,
  );
  expect(String(manifest.name ?? ''), `${fixture.mode} PWA manifest should expose a name`).not.toBe('');
  expect(String(manifest.short_name ?? ''), `${fixture.mode} PWA manifest should expose a short name`).not.toBe('');
  expect(String(manifest.start_url ?? ''), `${fixture.mode} PWA manifest should expose a start URL`).not.toBe('');

  const ngsw = await expectPublishedPwaJson(page, new URL('ngsw.json', fixture.pwaIndexUrl).toString(), `${fixture.mode} ngsw.json`);
  expect(Array.isArray(ngsw.assetGroups), `${fixture.mode} PWA ngsw.json should expose asset groups`).toBe(true);
  const assetGroupNames = (ngsw.assetGroups as Array<{ name?: unknown }>).map((group) => String(group.name ?? ''));
  expect(assetGroupNames, `${fixture.mode} PWA ngsw.json should include the app shell asset group`).toContain('app-shell');
  expect(assetGroupNames, `${fixture.mode} PWA ngsw.json should include the lazy application code asset group`).toContain('app-code');
  expect(assetGroupNames, `${fixture.mode} PWA ngsw.json should include the lazy assets asset group`).toContain('assets');
}

export async function verifyPublishedApplicationCanBeSharedWithTemporaryGroupThroughUi(page: Page): Promise<void> {
  const admin = await createFunctionalAdminSequenceClient();
  const suffix = Date.now();
  const title = `Functional group share ${suffix}`;
  const groupName = `functional_share_group_${suffix}`;
  let formId = '';
  let publishedId = '';
  let owner = '';
  let groupCreated = false;

  try {
    await test.step('Create and publish an authenticated PWA for group sharing', async () => {
      formId = await createBlankForm(page, title);
      const form = await getFormDocument(page, formId);
      owner = String(form.creator ?? form['~c8oAcl'] ?? '').trim();
      expect(owner, 'temporary group creation needs the current form owner').not.toBe('');
      await publishCurrentFormWithPwa(page, 'authenticated');
      await expectPwaDocument(page, formId, 'authenticated PWA should exist before group sharing');
      publishedId = publishedApplicationId(formId);
    });

    await test.step('Create a temporary group fixture for the current owner', async () => {
      await createTemporaryAccessGroup(admin, groupName, owner);
      groupCreated = true;
      await expectShareGroupAvailableForPublishedApplication(page, publishedId, groupName);
    });

    await test.step('Select the temporary group in the published application share modal', async () => {
      await openPublishedShareApplicationModal(page, title);
      const modal = page.locator(SEL.collaboratorsModal).last();
      await selectShareApplicationGroupRecipient(page, modal, groupName);
      await saveCollaboratorsModal(modal, 'published group share');
    });

    await test.step('Assert the published application document references the shared group', async () => {
      await expectPublishedDocumentSharedWithGroup(page, publishedId, groupName);
    });

    await test.step('Reopen the share modal and verify the group share persists', async () => {
      await openPublishedShareApplicationModal(page, title);
      const modal = page.locator(SEL.collaboratorsModal).last();
      await expect(modal.locator('ion-item').filter({ hasText: groupName }).first(), 'shared group should remain listed after reopening').toBeVisible({
        timeout: 30_000,
      });
      await saveCollaboratorsModal(modal, 'published group share verification');
    });
  } finally {
    if (publishedId) {
      await clearPublishedApplicationShares(page, publishedId).catch(() => undefined);
    }
    if (groupCreated) {
      await deleteTemporaryAccessGroup(admin, groupName).catch(() => undefined);
    }
  }
}

export async function verifyPublishedGroupShareAllowsConfiguredMemberThroughUi(
  page: Page,
  browser: Browser,
  memberUser: LoginCredentials,
): Promise<void> {
  const admin = await createFunctionalAdminSequenceClient();
  const suffix = Date.now();
  const title = `Functional group member share ${suffix}`;
  const technicalId = `functional_group_member_${suffix}`;
  const groupName = `functional_group_member_${suffix}`;
  let formId = '';
  let publishedId = '';
  let owner = '';
  let pwaIndexUrl = '';
  let groupCreated = false;

  try {
    await test.step('Create and publish an authenticated PWA for group-member access', async () => {
      formId = await createBlankForm(page, title);
      await createPublishedTextInput(page, technicalId, { required: false });
      const form = await getFormDocument(page, formId);
      owner = String(form.creator ?? form['~c8oAcl'] ?? '').trim();
      expect(owner, 'temporary group creation needs the current form owner').not.toBe('');
      await publishCurrentFormWithPwa(page, 'authenticated');
      const pwa = await expectPwaDocument(page, formId, 'authenticated PWA should exist before group-member sharing');
      publishedId = publishedApplicationId(formId);
      const targetId = publishedViewerTargetId(pwa, publishedId);
      expect(targetId, 'authenticated group-member PWA should expose a standalone target id').not.toBe('');
      pwaIndexUrl = standalonePwaUrl(page, targetId);
    });

    await test.step('Create a temporary group containing the configured member', async () => {
      const memberAcl = await resolveAdminUserAclByEmail(admin, memberUser.user);
      expect(memberAcl, `configured group member ${memberUser.user} should exist in Admin users`).not.toBe('');
      await createTemporaryAccessGroup(admin, groupName, owner);
      groupCreated = true;
      await addUserToTemporaryAccessGroup(admin, groupName, memberAcl);
      await expectTemporaryGroupContainsUser(admin, groupName, memberAcl);
      await expectShareGroupAvailableForPublishedApplication(page, publishedId, groupName);
    });

    await test.step('Share the published application with the temporary group', async () => {
      await openPublishedShareApplicationModal(page, title);
      const modal = page.locator(SEL.collaboratorsModal).last();
      await selectShareApplicationGroupRecipient(page, modal, groupName);
      await saveCollaboratorsModal(modal, 'published group member share');
      await expectPublishedDocumentSharedWithGroup(page, publishedId, groupName);
    });

    await test.step('Open the authenticated PWA as the configured group member', async () => {
      const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
      try {
        const memberPage = await context.newPage();
        await login(memberPage, memberUser);
        await memberPage.goto(pwaIndexUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await acceptRgpdIfVisible(memberPage).catch(() => undefined);
        await expect(memberPage.locator(SEL.viewerPage), 'group member should open the shared authenticated PWA').toBeAttached({
          timeout: 60_000,
        });
        await expect(memberPage.locator(`#${technicalId}`).first(), 'group member should see the shared PWA form field').toBeVisible({
          timeout: 60_000,
        });
      } finally {
        await context.close();
      }
    });
  } finally {
    if (publishedId) {
      await clearPublishedApplicationShares(page, publishedId).catch(() => undefined);
    }
    if (groupCreated) {
      await deleteTemporaryAccessGroup(admin, groupName).catch(() => undefined);
    }
  }
}

export async function verifyAuthenticatedPublishedPwaRejectsUnauthorizedUserThroughUi(
  page: Page,
  browser: Browser,
  unauthorizedUser: LoginCredentials,
): Promise<void> {
  const suffix = Date.now();
  const title = `Functional unauthorized PWA ${suffix}`;
  const technicalId = `functional_unauthorized_pwa_${suffix}`;
  let pwaIndexUrl = '';

  await test.step('Create and publish a private authenticated PWA', async () => {
    const formId = await createBlankForm(page, title);
    await createPublishedTextInput(page, technicalId, { required: false });
    await publishCurrentFormWithPwa(page, 'authenticated');
    const pwa = await expectPwaDocument(page, formId, 'authenticated PWA should exist before unauthorized access checks');
    expect(pwa.notAnonymous, 'unauthorized-access fixture should stay authenticated/private').toBe(true);
    const targetId = publishedViewerTargetId(pwa, publishedApplicationId(formId));
    expect(targetId, 'authenticated PWA should expose a standalone target id').not.toBe('');
    pwaIndexUrl = standalonePwaUrl(page, targetId);
  });

  await test.step('Open the private PWA as an unrelated authenticated user', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const unauthorizedPage = await context.newPage();
      await login(unauthorizedPage, unauthorizedUser);
      await unauthorizedPage.goto(pwaIndexUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await acceptRgpdIfVisible(unauthorizedPage).catch(() => undefined);

      await expect(
        unauthorizedPage.locator('body'),
        'an authenticated user without share rights should see the access-denied state',
      ).toContainText(PUBLISHED_ACCESS_DENIED_RE, { timeout: 60_000 });
      await expect(
        unauthorizedPage.locator(`#${technicalId}`),
        'private PWA form field should not render for an unauthorized user',
      ).toHaveCount(0, { timeout: 5_000 });
    } finally {
      await context.close();
    }
  });
}

export async function verifyCollaboratorCanFindSharedApplicationThroughUi(
  page: Page,
  browser: Browser,
  ownerUser: LoginCredentials,
): Promise<void> {
  const suffix = Date.now();
  const title = `Functional collaborator search ${suffix}`;

  await test.step('Create an application as the secondary owner and share it with the current user', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const ownerPage = await context.newPage();
      await login(ownerPage, ownerUser);
      const formId = await createBlankForm(ownerPage, title);
      await openEditorCollaboratorsModal(ownerPage);
      const modal = ownerPage.locator(SEL.collaboratorsModal).last();
      await selectEditorCollaboratorByEmail(ownerPage, modal, TEST_USER);
      await saveCollaboratorsModal(modal, 'cross-user collaborator search share');
      await expectEditorCollaboratorDocumentState(ownerPage, formId, TEST_USER, true);
    } finally {
      await context.close();
    }
  });

  await test.step('Search the shared application as the collaborator', async () => {
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await setSelectorMyApplicationsFilter(page, false);
    await searchSelectorApplicationsByName(page, title);
    await expectSelectorApplicationVisible(page, title);
  });

  await test.step('Assert the shared application is not treated as an owned application', async () => {
    await setSelectorMyApplicationsFilter(page, true);
    await searchSelectorApplicationsByName(page, title);
    await expectSelectorApplicationHidden(page, title);
  });
}

export async function verifySelectedOwnerCollaborationsOnlyThroughUi(
  page: Page,
  browser: Browser,
  adminUser: LoginCredentials,
  ownerUser: LoginCredentials,
): Promise<void> {
  const suffix = Date.now();
  const titlePrefix = `Functional selected user ${suffix}`;
  const ownerSharedTitle = `${titlePrefix} owner shared`;
  const ownerOnlyTitle = `${titlePrefix} owner only`;
  const collaboratorOnlyTitle = `${titlePrefix} collaborator only`;

  await test.step('Create two selected-owner applications, sharing only one with the current administrator', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const ownerPage = await context.newPage();
      await login(ownerPage, ownerUser);

      const sharedFormId = await createBlankForm(ownerPage, ownerSharedTitle);
      await openEditorCollaboratorsModal(ownerPage);
      const modal = ownerPage.locator(SEL.collaboratorsModal).last();
      await selectEditorCollaboratorByEmail(ownerPage, modal, adminUser.user);
      await saveCollaboratorsModal(modal, 'selected-owner collaboration fixture');
      await expectEditorCollaboratorDocumentState(ownerPage, sharedFormId, adminUser.user, true);

      await ownerPage.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await createBlankForm(ownerPage, ownerOnlyTitle);
    } finally {
      await context.close();
    }
  });

  await test.step('Create an administrator-owned application where the selected owner is only a collaborator', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const adminPage = await context.newPage();
      await login(adminPage, adminUser);
      const collaboratorOnlyFormId = await createBlankForm(adminPage, collaboratorOnlyTitle);
      await openEditorCollaboratorsModal(adminPage);
      const modal = adminPage.locator(SEL.collaboratorsModal).last();
      await selectEditorCollaboratorByEmail(adminPage, modal, ownerUser.user);
      await saveCollaboratorsModal(modal, 'selected-user collaborator-only fixture');
      await expectEditorCollaboratorDocumentState(adminPage, collaboratorOnlyFormId, ownerUser.user, true);
    } finally {
      await context.close();
    }
  });

  await test.step('Filter as administrator by the selected owner, excluding collaborator-only applications', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const adminPage = await context.newPage();
      await login(adminPage, adminUser);
      await setSelectorMyApplicationsFilter(adminPage, false);
      await selectSelectorUserFilter(adminPage, ownerUser.user);
      await searchSelectorApplicationsByName(adminPage, titlePrefix);

      await expectSelectorApplicationVisible(adminPage, ownerSharedTitle);
      await expectSelectorApplicationVisible(adminPage, ownerOnlyTitle);
      // #1338: selecting a user means creator=<selected user>, not merely an
      // ACL match where that user is a collaborator.
      await expectSelectorApplicationHidden(adminPage, collaboratorOnlyTitle);

      const collaborationsOnly = adminPage.locator('ion-button.class1784723090278:visible').first();
      await expect(collaborationsOnly, 'Collaboration-only should appear for one selected user other than the current user').toBeVisible({
        timeout: 30_000,
      });
      await expect(collaborationsOnly, 'Collaboration-only should be enabled for the selected owner').toBeEnabled();
      await expect(collaborationsOnly, 'Collaboration-only should initially be inactive').toHaveAttribute(
        'aria-pressed',
        'false',
      );
      await expect(collaborationsOnly, 'Collaboration-only should expose its localized accessible name').toHaveAttribute(
        'aria-label',
        /(?:Collaborations only|Collaborations uniquement|Solo colaboraciones|Solo collaborazioni)/i,
      );
      await collaborationsOnly.click({ timeout: 10_000 }).catch(async () => collaborationsOnly.dispatchEvent('click'));
      await expect(collaborationsOnly, 'Collaboration-only should become active').toHaveAttribute('aria-pressed', 'true', {
        timeout: 15_000,
      });

      // #1350: creator stays the selected owner while collaboration membership
      // is evaluated against the currently connected administrator.
      await expectSelectorApplicationVisible(adminPage, ownerSharedTitle);
      await expectSelectorApplicationHidden(adminPage, ownerOnlyTitle);
      await expectSelectorApplicationHidden(adminPage, collaboratorOnlyTitle);
    } finally {
      await context.close();
    }
  });
}

export async function verifyCollaboratorRevocationHidesSharedApplicationThroughUi(
  page: Page,
  browser: Browser,
  ownerUser: LoginCredentials,
): Promise<void> {
  const suffix = Date.now();
  const title = `Functional collaborator revoke ${suffix}`;
  let formId = '';
  const ownerContext = await browser.newContext({ baseURL: mobileAppRootUrl(page) });

  try {
    const ownerPage = await ownerContext.newPage();

    await test.step('Create an application as the secondary owner and share it with the current user', async () => {
      await login(ownerPage, ownerUser);
      formId = await createBlankForm(ownerPage, title);
      await openEditorCollaboratorsModal(ownerPage);
      const modal = ownerPage.locator(SEL.collaboratorsModal).last();
      await selectEditorCollaboratorByEmail(ownerPage, modal, TEST_USER);
      await saveCollaboratorsModal(modal, 'cross-user collaborator revocation share');
      await expectEditorCollaboratorDocumentState(ownerPage, formId, TEST_USER, true);
    });

    await test.step('Verify the current user can find the shared application before revocation', async () => {
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await setSelectorMyApplicationsFilter(page, false);
      await searchSelectorApplicationsByName(page, title);
      await expectSelectorApplicationVisible(page, title);
    });

    await test.step('Remove the current user from the owner collaborators modal', async () => {
      await openEditorCollaboratorsModal(ownerPage);
      const modal = ownerPage.locator(SEL.collaboratorsModal).last();
      await removeEditorCollaboratorByEmail(ownerPage, modal, TEST_USER);
      await saveCollaboratorsModal(modal, 'cross-user collaborator revocation');
      await expectEditorCollaboratorDocumentState(ownerPage, formId, TEST_USER, false);
    });

    await test.step('Verify the revoked collaborator no longer finds the application', async () => {
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await setSelectorMyApplicationsFilter(page, false);
      await searchSelectorApplicationsByName(page, title);
      await expectSelectorApplicationHidden(page, title);
    });
  } finally {
    await ownerContext.close();
  }
}

export async function verifyAnonymousPublishedQrToggleThroughUi(page: Page): Promise<void> {
  const title = `Functional PWA QR ${Date.now()}`;

  await test.step('Create and publish an anonymous PWA for QR assertions', async () => {
    const formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
    await expectPwaDocument(page, formId, 'anonymous PWA should exist before QR assertions');
  });

  await test.step('Open Published Applications and verify the QR toggle', async () => {
    await openPublishedApplicationsTab(page);
    await expectSelectorApplicationVisible(page, title);
    await expectPublishedQrButtonMode(page, 'show');
    await expectPublishedQrTooltipMode(page, 'show');
    await clickPublishedQrButton(page);
    await expectPublishedQrButtonMode(page, 'hide');
    await expectPublishedQrTooltipMode(page, 'hide');
    // #1346: c6f8a05b made both selector-card QR labels flex-aligned;
    // first shipped in beta150 and historically QA-validated in beta154.
    await expectPublishedQrLabelAlignedAtResponsiveWidths(page, title);
    await clickPublishedQrButton(page);
    await expectPublishedQrButtonMode(page, 'show');
  });

  await configurePublishedApplicationPublicLinkAndAssertQrLabel(page, title);
}

async function expectPublishedPwaJson(page: Page, url: string, description: string): Promise<Record<string, unknown>> {
  let json: Record<string, unknown> | null = null;
  await expect
    .poll(
      async () => {
        const response = await page.request.get(url, { failOnStatusCode: false, timeout: 10_000 });
        if (response.status() !== 200) {
          return false;
        }
        const candidate = await response.json().catch(() => null);
        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
          return false;
        }
        json = candidate as Record<string, unknown>;
        if (description.includes('ngsw.json')) {
          return Array.isArray(json.assetGroups);
        }
        if (description.includes('manifest.webmanifest')) {
          return typeof json.name === 'string' && typeof json.start_url === 'string';
        }
        if (description.includes('env.json')) {
          return typeof json.appTemplateVersion === 'string' && typeof json.remoteBase === 'string';
        }
        return !json.couchdb_output;
      },
      {
        message: `published PWA ${description} should be fully generated at ${url}`,
        timeout: 60_000,
      },
    )
    .toBe(true);
  return json!;
}

async function expectPublishedPwaServiceWorkerRegistration(page: Page, pwaIndexUrl: string, waitForSelector = SEL.viewerPage): Promise<void> {
  const workerUrl = new URL('ngsw-worker.js', pwaIndexUrl).toString();
  const worker = await page.request.get(workerUrl, { failOnStatusCode: false, timeout: 10_000 });
  expect(worker.status(), `published PWA service worker should be served at ${workerUrl}`).toBe(200);

  await page.goto(pwaIndexUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await acceptRgpdIfVisible(page).catch(() => undefined);
  await expect(page.locator(SEL.viewerPage), 'published PWA should render before service-worker assertions').toBeAttached({
    timeout: 60_000,
  });
  await expect(page.locator(waitForSelector).first(), 'published PWA should render the form-data witness before service-worker assertions').toBeVisible({
    timeout: 60_000,
  });

  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          if (!('serviceWorker' in navigator)) {
            return { supported: false, controlled: false, scope: '', scriptURL: '', state: '' };
          }
          const ready = navigator.serviceWorker.ready.catch(() => null);
          const timedReady = await Promise.race([ready, new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_000))]);
          const registration = timedReady ?? (await navigator.serviceWorker.getRegistration().catch(() => null));
          const current = registration?.active ?? registration?.waiting ?? registration?.installing ?? null;
          return {
            supported: true,
            controlled: Boolean(navigator.serviceWorker.controller),
            scope: registration?.scope ?? '',
            scriptURL: current?.scriptURL ?? '',
            state: current?.state ?? '',
          };
        }),
      {
        message: 'published PWA should register an Angular service worker',
        timeout: 60_000,
      },
    )
    .toEqual(
      expect.objectContaining({
        supported: true,
        scope: expect.stringContaining(new URL('.', pwaIndexUrl).pathname),
        scriptURL: expect.stringContaining('ngsw-worker.js'),
      }),
    );

  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker?.controller)).catch(() => false))) {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await acceptRgpdIfVisible(page).catch(() => undefined);
    await expect(page.locator(SEL.viewerPage), 'published PWA should render after the service worker takes control').toBeAttached({
      timeout: 60_000,
    });
    await expect(page.locator(waitForSelector).first(), 'published PWA should keep the form-data witness after service-worker control').toBeVisible({
      timeout: 60_000,
    });
  }

  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker?.controller)).catch(() => false), {
      message: 'published PWA page should be controlled by its service worker',
      timeout: 30_000,
    })
    .toBe(true);
}

async function expectPublishedPwaCacheStorage(page: Page, pwaIndexUrl: string): Promise<void> {
  await expect
    .poll(() => publishedPwaCacheSnapshot(page), {
      message: 'published PWA service worker should populate CacheStorage with app-shell assets',
      timeout: 60_000,
    })
    .toEqual(
      expect.objectContaining({
        supported: true,
        controlled: true,
        cacheNames: expect.arrayContaining([expect.stringMatching(/ngsw/i)]),
        cachedUrls: expect.arrayContaining([expect.stringContaining(new URL('.', pwaIndexUrl).pathname)]),
      }),
    );

  const ngsw = await expectPublishedPwaJson(page, new URL('ngsw.json', pwaIndexUrl).toString(), 'ngsw.json cache readiness');
  const assetGroups = Array.isArray(ngsw.assetGroups) ? ngsw.assetGroups : [];
  const appShellGroup = assetGroups.find((group): group is Record<string, unknown> => {
    if (!group || typeof group !== 'object') return false;
    const name = String((group as Record<string, unknown>).name ?? '');
    return name === 'app-shell' || name === 'app';
  });
  const appShellUrls =
    appShellGroup && Array.isArray(appShellGroup.urls)
      ? appShellGroup.urls.filter((url): url is string => typeof url === 'string')
      : [];
  expect(
    appShellUrls.some((url) => /(?:^|\/)index\.html$/.test(url)),
    'published PWA ngsw should declare index.html as its navigation shell',
  ).toBe(true);
  const requiredCachedAppShellUrls = appShellUrls
    .filter((url) => /\.(?:css|js)$/.test(new URL(url, pwaIndexUrl).pathname))
    .map((url) => new URL(url, pwaIndexUrl).toString());
  if (requiredCachedAppShellUrls.length > 0) {
    await expect
      .poll(async () => {
        const snapshot = await publishedPwaCacheSnapshot(page);
        return requiredCachedAppShellUrls.every((url) => snapshot.cachedUrls.includes(url));
      }, {
        message: 'published PWA service worker should finish prefetching its declared shell bundles before offline mode',
        timeout: 60_000,
      })
      .toBe(true);
  }
}

async function expectPublishedPwaOfflineShellReload(
  page: Page,
  pwaIndexUrl: string,
  onlineWitnessSelector: string,
): Promise<void> {
  await page.goto(pwaIndexUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await acceptRgpdIfVisible(page).catch(() => undefined);
  await expect(page.locator(SEL.viewerPage), 'published PWA should render online before offline reload').toBeAttached({
    timeout: 60_000,
  });
  await expect(
    page.locator(onlineWitnessSelector).first(),
    'published PWA form-data witness should render online before testing the cached shell',
  ).toBeVisible({ timeout: 60_000 });
  await expectPublishedPwaCacheStorage(page, pwaIndexUrl);

  await page.context().setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('body'), 'offline reload should not show a browser network error page').not.toContainText(
      /ERR_INTERNET_DISCONNECTED|This site can(?:'|’)t be reached|No internet/i,
      { timeout: 10_000 },
    );
    await expect(page.locator(SEL.viewerPage), 'cached published PWA app shell should render offline').toBeAttached({
      timeout: 60_000,
    });
    await expect(page.locator('ion-app').first(), 'cached published PWA application root should render offline').toBeAttached({
      timeout: 30_000,
    });
  } finally {
    await page.context().setOffline(false);
  }
}

async function publishedPwaCacheSnapshot(page: Page): Promise<PublishedPwaCacheSnapshot> {
  return page.evaluate(async () => {
    const cacheApi = 'caches' in window ? window.caches : null;
    if (!('serviceWorker' in navigator) || !cacheApi) {
      return { supported: false, controlled: false, scope: '', cacheNames: [], cachedUrls: [] };
    }

    const registration = await navigator.serviceWorker.ready.catch(() => null);
    const scope = registration?.scope ?? '';
    const cacheNames = await cacheApi.keys();
    const cachedUrls: string[] = [];
    for (const cacheName of cacheNames) {
      const cache = await cacheApi.open(cacheName);
      const requests = await cache.keys();
      cachedUrls.push(...requests.map((request) => request.url));
    }

    return {
      supported: true,
      controlled: Boolean(navigator.serviceWorker.controller),
      scope,
      cacheNames,
      cachedUrls,
    };
  });
}

async function createTemporaryAccessGroup(
  admin: FunctionalAdminSequenceClient,
  groupName: string,
  owner: string,
): Promise<void> {
  const create = await admin.callSequence('admin_groups_post', {
    meta: JSON.stringify({ group: groupName, user: owner }),
  });
  expect(create.success, `temporary group ${groupName} should be created in FullSync groups`).toBeDefined();

  await admin.callSequence('admin_group_upsert', {
    meta: JSON.stringify({
      _id: groupName,
      editing_rights: false,
      formulas: false,
      publication: false,
      nocode_db_rights: false,
      admin: false,
      admin_readonly: false,
    }),
  });
}

async function addUserToTemporaryAccessGroup(
  admin: FunctionalAdminSequenceClient,
  groupName: string,
  userAcl: string,
): Promise<void> {
  const add = await admin.callSequence('admin_groups_post', {
    meta: JSON.stringify({ group: groupName, user: userAcl }),
  });
  expect(add.success, `temporary group ${groupName} should accept member ${userAcl}`).toBeDefined();
}

async function deleteTemporaryAccessGroup(admin: FunctionalAdminSequenceClient, groupName: string): Promise<void> {
  await admin.callSequence('admin_groups_delete', {
    meta: JSON.stringify({ group: groupName }),
  }).catch(() => undefined);
  await admin.callSequence('admin_group_delete', {
    _use_doc_id: groupName,
  }).catch(() => undefined);
}

async function expectShareGroupAvailableForPublishedApplication(page: Page, publishedId: string, groupName: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const response = await c8oCall(page, 'APIV2_GetManageAccessRights', {
          id: publishedId,
          collab: false,
          showAllGroups: true,
        });
        const groupsOrUsers = accessRightsEntries(response, 'grpsOrUsers');
        return groupsOrUsers.some((entry) => entry.type === 'group' && entry.value === groupName);
      },
      {
        message: `temporary group ${groupName} should be available in share candidates`,
        timeout: 30_000,
      },
    )
    .toBe(true);
}

async function resolveAdminUserAclByEmail(admin: FunctionalAdminSequenceClient, email: string): Promise<string> {
  const needle = email.toLowerCase();
  const users = await adminGroupChildren(admin, 'all_users');
  const match = users.find((entry) => Object.values(entry).some((value) => String(value ?? '').toLowerCase().includes(needle)));
  return stringValue(match?.['~c8oAcl'] ?? match?.acl ?? match?._id);
}

async function expectTemporaryGroupContainsUser(
  admin: FunctionalAdminSequenceClient,
  groupName: string,
  userAcl: string,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const users = await adminGroupChildren(admin, groupName);
        return users.some((entry) => stringValue(entry['~c8oAcl'] ?? entry.acl ?? entry._id) === userAcl);
      },
      {
        message: `temporary group ${groupName} should contain user ${userAcl}`,
        timeout: 60_000,
      },
    )
    .toBe(true);
}

async function adminGroupChildren(
  admin: FunctionalAdminSequenceClient,
  groupName: string,
): Promise<Record<string, unknown>[]> {
  const entry = await adminGroupListEntry(admin, groupName, groupName !== 'all_users');
  let children = recordArray(entry?.children);
  if (children.length === 0 && groupName === 'all_users') {
    const fullEntry = await adminGroupListEntry(admin, groupName, true);
    children = recordArray(fullEntry?.children);
  }
  return children;
}

async function adminGroupListEntry(
  admin: FunctionalAdminSequenceClient,
  groupName: string,
  includeChildren = false,
): Promise<Record<string, unknown> | null> {
  const response = await admin.callSequence(
    'admin_users_get_by_group_v2',
    includeChildren ? { targetGroup: groupName } : {},
  );
  return adminResultValues(response).find((entry) => stringValue(entry.value) === groupName) ?? null;
}

async function selectShareApplicationGroupRecipient(page: Page, modal: Locator, groupName: string): Promise<void> {
  const input = modal.locator(SEL.collaboratorSearchInput).first();
  await expect(input, 'Share application should expose the user/group autocomplete').toBeVisible({ timeout: 30_000 });
  await input.fill(groupName);

  const option = page.locator(SEL.collaboratorAutocompleteOption).filter({ hasText: groupName }).first();
  await expect(option, `temporary group ${groupName} should be selectable in the share autocomplete`).toBeVisible({
    timeout: 30_000,
  });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(modal.locator('ion-item').filter({ hasText: groupName }).first(), `selected group ${groupName} should be listed before saving`).toBeVisible({
    timeout: 15_000,
  });
}

async function expectPublishedDocumentSharedWithGroup(page: Page, publishedId: string, groupName: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const doc = await getFormDocument(page, publishedId);
        const shared = stringArray(doc.shared);
        const c8oGrp = jsonRecord(doc.c8oGrp);
        return shared.includes(groupName) && c8oGrp?.[groupName] === true;
      },
      {
        message: `published application ${publishedId} should be shared with group ${groupName}`,
        timeout: 30_000,
      },
    )
    .toBe(true);
}

async function clearPublishedApplicationShares(page: Page, publishedId: string): Promise<void> {
  await c8oCall(page, 'APIV2_SetManageAccessRights', {
    id: publishedId,
    collab: false,
    meta: JSON.stringify({
      newUsersOrGroups: [],
      existingGrpsOrUsersArray: [],
      revoke_invit: [],
    }),
  });
}

function accessRightsEntries(response: Record<string, unknown>, key: 'grpsOrUsers' | 'existingGrpsOrUsersArrayFormated'): Array<Record<string, unknown>> {
  const root = jsonRecord(response.res) ?? response;
  return recordArray(root[key]);
}

async function expectEditorCollaboratorDocumentState(
  page: Page,
  formId: string,
  collaborator: string,
  expected: boolean,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const response = await c8oCall(page, 'APIV2_GetManageAccessRights', {
          id: formId,
          collab: true,
          showAllGroups: true,
        });
        const entries = accessRightsEntries(response, 'existingGrpsOrUsersArrayFormated');
        return entries.some((entry) => accessRightsEntryContains(entry, collaborator));
      },
      {
        message: `collaborator ${collaborator} should ${expected ? '' : 'not '}be persisted in access rights for ${formId}`,
        timeout: 30_000,
      },
    )
      .toBe(expected);
}

async function selectEditorCollaboratorByEmail(page: Page, modal: Locator, email: string): Promise<void> {
  const input = modal.locator(SEL.collaboratorSearchInput).first();
  await expect(input, 'collaborator autocomplete input should be visible').toBeVisible({ timeout: 30_000 });
  await input.fill(email);

  const option = page.locator(SEL.collaboratorAutocompleteOption).filter({ hasText: email }).first();
  await expect(option, `collaborator ${email} should be selectable from autocomplete`).toBeVisible({
    timeout: 30_000,
  });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(modal.locator('ion-item').filter({ hasText: email }).first(), `collaborator ${email} should be listed before saving`).toBeVisible({
    timeout: 15_000,
  });
}

async function removeEditorCollaboratorByEmail(page: Page, modal: Locator, email: string): Promise<void> {
  const row = modal.locator('ion-item').filter({ hasText: email }).first();
  await expect(row, `collaborator ${email} should be listed before revocation`).toBeVisible({ timeout: 30_000 });

  let removeButton = row
    .locator(
      'ion-button:has(ion-icon[name="trash"]), ion-button:has(ion-icon[ng-reflect-name="trash"]), ion-button:has(ion-icon[src*="trash"]), ion-button:has(img[src*="trash"])',
    )
    .last();
  if (!(await removeButton.isVisible({ timeout: 1_000 }).catch(() => false))) {
    removeButton = row.locator('ion-button').last();
  }
  await expect(removeButton, `collaborator ${email} should expose a remove action`).toBeVisible({ timeout: 10_000 });
  await removeButton.click({ timeout: 10_000 }).catch(async () => removeButton.dispatchEvent('click'));
  await expect(row, `collaborator ${email} should disappear from the modal before saving`).toBeHidden({
    timeout: 15_000,
  });
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
  return page.evaluate((expectedTitle) => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const isFolderCard = (card: HTMLElement) =>
      card.classList.contains('card-container--folder') ||
      !!card.querySelector('ion-icon[src*="folder.svg"], ion-icon[src*="folder-open.svg"], img[src*="folder.svg"], img[src*="folder-open.svg"]');

    return [...document.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')]
      .filter(visible)
      .some((card) => !isFolderCard(card as HTMLElement) && normalize((card as HTMLElement).innerText).includes(expectedTitle));
  }, title);
}

function accessRightsEntryContains(entry: Record<string, unknown>, expected: string): boolean {
  const needle = expected.toLowerCase();
  return Object.values(entry).some((value) => String(value ?? '').toLowerCase().includes(needle));
}

function recordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object' && !Array.isArray(entry));
}

function adminResultValues(response: Record<string, unknown>): Record<string, unknown>[] {
  const document = response.document as Record<string, unknown> | undefined;
  const result = (response.result as Record<string, unknown> | undefined) ?? (document?.result as Record<string, unknown> | undefined);
  return recordArray(result?.values);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => String(entry));
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function jsonRecord(value: unknown): Record<string, unknown> | null {
  return !!value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

async function expectActionableInsideViewport(page: Page, locator: Locator, label: string): Promise<void> {
  await expect(locator, `${label} should be visible`).toBeVisible({ timeout: 30_000 });
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box, `${label} should expose a visible bounding box`).not.toBeNull();
  const viewport = page.viewportSize();
  expect(viewport, `${label} should run with an explicit viewport`).not.toBeNull();
  expect(box!.x, `${label} should not be clipped on the left`).toBeGreaterThanOrEqual(0);
  expect(box!.y, `${label} should not be clipped on the top`).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, `${label} should fit inside viewport width`).toBeLessThanOrEqual(viewport!.width + 1);
  expect(box!.y + box!.height, `${label} should fit inside viewport height`).toBeLessThanOrEqual(viewport!.height + 1);

  const visibleToasts = page.locator('ion-toast:not(.overlay-hidden):visible');
  for (let attempt = 0; attempt < 5 && (await visibleToasts.count()) > 0; attempt++) {
    const countBefore = await visibleToasts.count();
    const toast = visibleToasts.last();
    const closeButton = toast
      .locator('button, ion-button, .toast-button')
      .filter({ hasText: /^(OK|Close|Fermer)$/i })
      .last();
    if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeButton.click({ timeout: 5_000 });
      await expect
        .poll(() => visibleToasts.count(), { timeout: 5_000 })
        .toBeLessThan(countBefore);
    } else {
      break;
    }
  }
  await expect(
    page.locator('ion-toast:not(.overlay-hidden):visible'),
    `${label} should not be covered by a viewer toast`,
  ).toHaveCount(0, { timeout: 5_000 });
  await locator.click({ trial: true, timeout: 10_000 });
}

async function createPublishedTextInput(page: Page, technicalId: string, options: { required: boolean }): Promise<void> {
  const before = await page.locator(SEL.textComponent).count();
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await expect
    .poll(() => page.locator(SEL.textComponent).count(), {
      message: `Text input ${technicalId} should be added`,
      timeout: 30_000,
    })
    .toBeGreaterThan(before);
  await openComponentConfigAt(page, SEL.textComponent, before);
  await setTechnicalId(page, technicalId);
  if (options.required) {
    await openConfigTabById(page, 'data_interactions');
    await setTextInputRequired(page, true);
  }
  await closeComponentConfig(page);
}

async function setTextInputRequired(page: Page, required: boolean): Promise<void> {
  const toggle = page.locator(TEXT_INPUT_PUBLICATION_SEL.requiredToggle).first();
  await expect(toggle, 'Text input required toggle should be visible').toBeVisible({ timeout: 15_000 });
  const button = toggle.locator('button.class1775840591959:visible, button.c8o-btn:visible').nth(required ? 0 : 1);
  await expect(button, `Text input required toggle ${required ? 'Yes' : 'No'} button should be visible`).toBeVisible({
    timeout: 15_000,
  });
  if (!((await button.getAttribute('class')) ?? '').includes('c8o-btn-selected')) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expect(button, `Text input required toggle should be ${required ? 'enabled' : 'disabled'}`).toHaveClass(
    /c8o-btn-selected/,
    { timeout: 15_000 },
  );
}

export async function verifyEditorCollaboratorsCsvImportThroughUi(page: Page): Promise<void> {
  const title = `Functional collaborators CSV ${Date.now()}`;

  await test.step('Create an application and open the editor collaborators modal', async () => {
    await createBlankForm(page, title);
    await openEditorCollaboratorsModal(page);
  });

  await test.step('Verify the collaborators CSV import controls are available', async () => {
    await expectCollaboratorsCsvImportAvailable(page);
  });
}

export async function verifyEditorCollaboratorsCsvImportAddsExistingUserThroughUi(page: Page): Promise<void> {
  const title = `Functional collaborators CSV import ${Date.now()}`;
  let collaborator = '';

  await test.step('Create an application and open the editor collaborators modal', async () => {
    await createBlankForm(page, title);
    await openEditorCollaboratorsModal(page);
  });

  await test.step('Resolve an existing user through the collaborators autocomplete', async () => {
    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'editor collaborators modal should be visible').toBeVisible({ timeout: 30_000 });
    const input = modal.locator(SEL.collaboratorSearchInput).first();
    await expect(input, 'collaborator autocomplete input should be visible').toBeVisible({ timeout: 30_000 });
    await input.fill('test');

    const option = page.locator(SEL.collaboratorAutocompleteOption).first();
    await expect(option, 'at least one collaborator autocomplete option should be available for CSV import').toBeVisible({
      timeout: 20_000,
    });
    const optionText = normalizeWhitespace(await option.innerText());
    collaborator = optionText.split(/\s+/).find((token) => token.includes('@')) ?? optionText;
    expect(collaborator, 'CSV import needs an existing user email from autocomplete').toContain('@');
    await page.keyboard.press('Escape').catch(() => undefined);
  });

  await test.step('Import the existing collaborator from a CSV file with explicit rights', async () => {
    const modal = page.locator(SEL.collaboratorsModal).last();
    const input = modal.locator(SEL.collaboratorsCsvInput).first();
    await expect(input, 'CSV import input should be attached before importing').toBeAttached({ timeout: 10_000 });
    await input.setInputFiles({
      name: 'functional-collaborator.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(`${collaborator};Edition_Responses\n`, 'utf-8'),
    });

    const row = modal.locator('ion-item').filter({ hasText: collaborator }).first();
    await expect(row, 'CSV-imported collaborator should be listed before saving').toBeVisible({ timeout: 15_000 });
    await expect
      .poll(() => row.locator('ion-select').first().evaluate((element) => String((element as HTMLElement & { value?: unknown }).value ?? '')), {
        message: 'CSV-imported collaborator should keep the Edition_Responses rights from the CSV',
        timeout: 15_000,
      })
      .toBe('Edition_Responses');

    const save = modal.locator(SEL.collaboratorsSaveButton).first();
    await expect(save, 'collaborators CSV import save button should be visible').toBeVisible({ timeout: 10_000 });
    await save.click({ timeout: 10_000 }).catch(async () => {
      if (await modal.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await modal.locator(SEL.collaboratorsSaveButton).first().dispatchEvent('click');
      }
    });
    await expect(modal, 'collaborators modal should close after saving the CSV import').toBeHidden({ timeout: 30_000 });
  });
}

export async function verifyEditorCollaboratorCanBeAddedThroughUi(page: Page): Promise<void> {
  const title = `Functional collaborator ${Date.now()}`;
  let formId = '';
  let collaborator = '';

  await test.step('Create an application and select the first available collaborator from the editor modal', async () => {
    formId = await createBlankForm(page, title);
    await openEditorCollaboratorsModal(page);

    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'editor collaborators modal should be visible').toBeVisible({ timeout: 30_000 });
    const input = modal.locator(SEL.collaboratorSearchInput).first();
    await expect(input, 'collaborator autocomplete input should be visible').toBeVisible({ timeout: 30_000 });
    await input.fill('test');

    const option = page.locator(SEL.collaboratorAutocompleteOption).first();
    await expect(option, 'at least one collaborator autocomplete option should be available').toBeVisible({
      timeout: 20_000,
    });
    const optionText = normalizeWhitespace(await option.innerText());
    await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));

    collaborator = optionText.split(/\s+/).find((token) => token.includes('@')) ?? optionText;
    expect(collaborator, 'collaborator add needs an existing user email from autocomplete').toContain('@');
    await expect(modal, 'selected collaborator should be listed before saving').toContainText(collaborator, {
      timeout: 15_000,
    });
    await modal.locator(SEL.collaboratorsSaveButton).first().click({ timeout: 10_000 });
    await expect(modal, 'collaborators modal should close after saving').toBeHidden({ timeout: 30_000 });
  });

  await test.step('Verify the collaborator is persisted in the access-rights document', async () => {
    await expectEditorCollaboratorDocumentState(page, formId, collaborator, true);
  });
}

export async function verifyEditorCollaboratorCanFindSharedApplicationThroughUi(
  page: Page,
  browser: Browser,
  collaboratorUser: LoginCredentials,
): Promise<void> {
  const suffix = Date.now();
  const title = `Functional collaborator access ${suffix}`;
  let formId = '';

  await test.step('Create an application and add the secondary user from the editor collaborators modal', async () => {
    formId = await createBlankForm(page, title);
    await openEditorCollaboratorsModal(page);
    const modal = page.locator(SEL.collaboratorsModal).last();
    await selectEditorCollaboratorByEmail(page, modal, collaboratorUser.user);
    await saveCollaboratorsModal(modal, 'cross-user editor collaborator add');
    await expectEditorCollaboratorDocumentState(page, formId, collaboratorUser.user, true);
  });

  await test.step('Verify the added collaborator can find the shared application', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const collaboratorPage = await context.newPage();
      await login(collaboratorPage, collaboratorUser);
      await setSelectorMyApplicationsFilter(collaboratorPage, false);
      await searchSelectorApplicationsByName(collaboratorPage, title);
      await expectSelectorApplicationVisible(collaboratorPage, title);
      // #1347: edf693ce moved access/share indicators outside the visual card
      // container and anchored them at right:50px/bottom:19px; first shipped in
      // beta150 and historically QA-validated in beta154.
      await expectSharedCardAccessIndicatorPositioned(collaboratorPage, title);

      await setSelectorMyApplicationsFilter(collaboratorPage, true);
      await searchSelectorApplicationsByName(collaboratorPage, title);
      await expectSelectorApplicationHidden(collaboratorPage, title);
    } finally {
      await context.close();
    }
  });
}

async function expectPublishedQrLabelAlignedAtResponsiveWidths(page: Page, title: string): Promise<void> {
  const originalViewport = page.viewportSize();
  try {
    for (const viewport of [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const card = selectorCardByTitle(page, title);
      await expect(card, `${viewport.name} published application card should remain visible with QR codes shown`).toBeVisible({
        timeout: 15_000,
      });
      await expect(card.locator('canvas:visible').first(), `${viewport.name} published card should render its QR code`).toBeVisible({
        timeout: 15_000,
      });
      const label = card.locator(SEL.selectorCardTitle).filter({ hasText: title }).first();
      await expect(label, `${viewport.name} QR label should remain visible`).toBeVisible({ timeout: 15_000 });
      await expect(label, `${viewport.name} QR label should use the fixed flex layout`).toHaveCSS('display', 'flex');
      await expect(label, `${viewport.name} QR label content should remain vertically centered`).toHaveCSS(
        'align-items',
        'center',
      );
    }
  } finally {
    if (originalViewport) {
      await page.setViewportSize(originalViewport);
    }
  }
}

async function expectSharedCardAccessIndicatorPositioned(page: Page, title: string): Promise<void> {
  const originalViewport = page.viewportSize();
  try {
    for (const viewport of [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const card = selectorCardByTitle(page, title);
      await expect(card, `${viewport.name} shared application card should remain visible`).toBeVisible({ timeout: 15_000 });
      const indicator = card
        .locator(
          'div.class1614878181934:visible, div.class1614878239631:visible, div.class1614878254783:visible, div.class1614763483649:visible',
        )
        .first();
      await expect(indicator, `${viewport.name} shared application card should expose an access indicator`).toBeVisible({
        timeout: 15_000,
      });
      await expect(indicator, `${viewport.name} shared access indicator should be absolutely positioned`).toHaveCSS(
        'position',
        'absolute',
      );
      await expect(indicator, `${viewport.name} shared access indicator should retain its right offset`).toHaveCSS('right', '50px');
      await expect(indicator, `${viewport.name} shared access indicator should retain its bottom offset`).toHaveCSS(
        'bottom',
        '19px',
      );
      expect(
        await indicator.evaluate((element) => {
          const visualContainer = element.parentElement?.querySelector(':scope > .card-container--app');
          return visualContainer == null || !visualContainer.contains(element);
        }),
        `${viewport.name} shared access indicator should be a sibling of, not clipped inside, the visual card container`,
      ).toBe(true);
    }
  } finally {
    if (originalViewport) {
      await page.setViewportSize(originalViewport);
    }
  }
}

function selectorCardByTitle(page: Page, title: string): Locator {
  const exactTitle = new RegExp(`^${escapeRegExp(title)}$`);
  const label = page.locator(`${SEL.selectorCardTitle}:visible`).filter({ hasText: exactTitle }).first();
  return page.locator('[id^="idcard"]:not([id^="idcardO"])').filter({ has: label }).first();
}

async function selectSelectorUserFilter(page: Page, user: string): Promise<void> {
  const input = page.locator('.class1750838881480 c8oforms-ngxtaginputcustomc8oforms input:visible').first();
  if (!(await input.isVisible({ timeout: 1_000 }).catch(() => false))) {
    const toggle = page.locator(SEL.selectorFilterInlineToggleButton).filter({ visible: true }).first();
    await expect(toggle, 'administrator selector should expose advanced search').toBeVisible({ timeout: 15_000 });
    await toggle.click({ timeout: 10_000 }).catch(async () => toggle.dispatchEvent('click'));
  }

  await expect(input, 'administrator advanced search should expose the user autocomplete').toBeVisible({ timeout: 15_000 });
  await input.fill(user);
  const option = page.locator(SEL.collaboratorAutocompleteOption).filter({ hasText: user }).first();
  await expect(option, `selector user ${user} should be selectable from autocomplete`).toBeVisible({ timeout: 30_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));

  const collaborationsOnly = page.locator('ion-button.class1784723090278:visible').first();
  await expect(
    collaborationsOnly,
    'selecting exactly one other user should expose the collaboration-only quick filter',
  ).toBeVisible({ timeout: 30_000 });
}

export async function verifyEditorCollaboratorCanBeRemovedThroughUi(page: Page): Promise<void> {
  const title = `Functional collaborator removal ${Date.now()}`;
  let formId = '';
  let collaborator = '';

  await test.step('Create an application and add an editor collaborator', async () => {
    formId = await createBlankForm(page, title);
    await openFunctionalEditorCollaboratorsModal(page);

    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'editor collaborators modal should be visible').toBeVisible({ timeout: 30_000 });
    const input = modal.locator(SEL.collaboratorSearchInput).first();
    await expect(input, 'collaborator autocomplete input should be visible').toBeVisible({ timeout: 30_000 });
    await input.fill('test');

    const option = page.locator(SEL.collaboratorAutocompleteOption).first();
    await expect(option, 'at least one collaborator autocomplete option should be available').toBeVisible({
      timeout: 20_000,
    });
    const optionText = normalizeWhitespace(await option.innerText());
    await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));

    collaborator = optionText.split(/\s+/).find((token) => token.includes('@')) ?? optionText;
    expect(collaborator, 'collaborator removal needs an existing user email from autocomplete').toContain('@');
    await expect(modal.locator('ion-item').filter({ hasText: collaborator }).first(), 'selected collaborator should be listed before saving').toBeVisible({
      timeout: 15_000,
    });
    await saveCollaboratorsModal(modal, 'collaborator creation before removal');
    await expectEditorCollaboratorDocumentState(page, formId, collaborator, true);
  });

  await test.step('Reopen the editor collaborators modal and remove the collaborator', async () => {
    await openFunctionalEditorCollaboratorsModal(page);

    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'editor collaborators modal should reopen before removal').toBeVisible({ timeout: 30_000 });
    const row = modal.locator('ion-item').filter({ hasText: collaborator }).first();
    await expect(row, 'saved collaborator should be listed before removal').toBeVisible({ timeout: 30_000 });

    let removeButton = row
      .locator(
        'ion-button:has(ion-icon[name="trash"]), ion-button:has(ion-icon[ng-reflect-name="trash"]), ion-button:has(ion-icon[src*="trash"]), ion-button:has(img[src*="trash"])',
      )
      .last();
    if (!(await removeButton.isVisible({ timeout: 1_000 }).catch(() => false))) {
      removeButton = row.locator('ion-button').last();
    }
    await expect(removeButton, 'saved collaborator row should expose a remove action').toBeVisible({ timeout: 10_000 });
    await removeButton.click({ timeout: 10_000 }).catch(async () => removeButton.dispatchEvent('click'));
    await expect(row, 'removed collaborator should disappear from the modal before saving').toBeHidden({
      timeout: 15_000,
    });
    await saveCollaboratorsModal(modal, 'collaborator removal');
  });

  await test.step('Reopen the editor collaborators modal and verify the collaborator is absent', async () => {
    await openFunctionalEditorCollaboratorsModal(page);

    const reopened = page.locator(SEL.collaboratorsModal).last();
    await expect(reopened, 'editor collaborators modal should reopen after removal').toBeVisible({ timeout: 30_000 });
    await expect(reopened.locator('ion-item').filter({ hasText: collaborator }), 'removed collaborator should not be listed after reopening').toHaveCount(
      0,
      { timeout: 15_000 },
    );
    await saveCollaboratorsModal(reopened, 'collaborator removal verification');
    await expectEditorCollaboratorDocumentState(page, formId, collaborator, false);
  });
}

export async function verifyPublishedShareNotificationFieldsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const title = `Functional published share ${suffix}`;
  const subject = `Functional share subject ${suffix}`;
  const body = `Functional share body ${suffix}`;
  let recipient = '';

  await test.step('Create and publish an application for share notification configuration', async () => {
    await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'authenticated');
  });

  await test.step('Configure the published application share notification fields', async () => {
    recipient = await sharePublishedApplicationWithNotification(page, title, {
      recipientQuery: 'test',
      subject,
      body,
    });
    expect(recipient, 'a recipient should be selected before configuring share notification').not.toBe('');
    expect(recipient, 'response-tracking coverage requires the selected share recipient to be a real user').toContain('@');

    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'Share application modal should remain open after configuring notification').toBeVisible({
      timeout: 30_000,
    });
    await expect(modal, 'selected share recipient should remain visible in the modal').toContainText(recipient, {
      timeout: 15_000,
    });
    await expect(modal.locator(SEL.shareSubjectInput).first(), 'share notification subject should keep the typed value').toHaveValue(
      subject,
      { timeout: 10_000 },
    );
    await expectShareNotificationBodyContains(page, modal, body);
    await modal.locator(SEL.collaboratorsSaveButton).first().click({ timeout: 10_000 });
    await expect(modal, 'Share application modal should close after saving notification fields').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Reopen the published application share modal and verify notification persistence', async () => {
    await openPublishedShareApplicationModal(page, title);
    const reopened = page.locator(SEL.collaboratorsModal).last();
    await expect(reopened, 'Share application modal should reopen after saving notification fields').toBeVisible({
      timeout: 30_000,
    });
    await expect(reopened, 'saved share recipient should remain visible after reopening').toContainText(recipient, {
      timeout: 15_000,
    });
    await reopened.locator(SEL.collaboratorsSaveButton).first().click({ timeout: 10_000 });
    await expect(reopened, 'Share application modal should close after persistence verification').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Verify the saved invitee remains readable in response tracking', async () => {
    const inviteeRow = await openPublishedInviteeResponseRowThroughUi(page, title, recipient);
    const geometry = await inviteeResponseRowGeometry(inviteeRow);

    expect(geometry.textLines.length, 'invitee response row should render separate name and metadata lines').toBeGreaterThanOrEqual(
      2,
    );
    expect(geometry.rowHeight, 'invitee response row should no longer use the former fixed 31.5px height').toBeGreaterThan(
      32.5,
    );
    expect(geometry.contentTop, 'invitee name should remain inside the top of its row').toBeGreaterThanOrEqual(
      geometry.rowTop - 1,
    );
    expect(geometry.contentBottom, 'invitee metadata should remain inside the bottom of its row').toBeLessThanOrEqual(
      geometry.rowBottom + 1,
    );
    expect(
      geometry.scrollHeight,
      'invitee row content should fit vertically without being clipped or overflowing its client box',
    ).toBeLessThanOrEqual(geometry.clientHeight + 1);

    const [nameLine, metadataLine] = geometry.textLines;
    expect(metadataLine.top, 'invitee metadata should be laid out below the name without overlapping it').toBeGreaterThanOrEqual(
      nameLine.bottom - 1,
    );
  });
}

async function openPublishedInviteeResponseRowThroughUi(
  page: Page,
  title: string,
  recipient: string,
): Promise<Locator> {
  await openPublishedApplicationsTab(page);
  const card = selectorCardByTitle(page, title);
  await expect(card, `published application card ${title} should remain visible`).toBeVisible({ timeout: 30_000 });

  const cardId = await card.getAttribute('id');
  expect(cardId, 'published application card should expose its generated card id').toBeTruthy();
  const overlayId = String(cardId).replace(/^idcard/, 'idcardO');
  const responsesMenuItem = page
    .locator(
      'ion-popover:not(.overlay-hidden):visible page-popoverpageselector ion-item.class1580132441145, ' +
        'ion-popover:not(.overlay-hidden):visible page-popoverpageselector ion-item:has(ion-icon[src*="chart-column.svg"])',
    )
    .first();

  for (let attempt = 0; attempt < 3; attempt++) {
    if (await clickVisibleSelectorCardMenuByTitle(page, title)) {
      if (await responsesMenuItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
        break;
      }
    }

    await card.hover({ timeout: 10_000 }).catch(() => undefined);
    const overlayMenu = page.locator(`[id="${overlayId}"]:visible ${SEL.cardMenuButton}`).first();
    const cardMenu = card.locator(SEL.cardMenuButton).first();
    const menu = (await overlayMenu.isVisible({ timeout: 1_000 }).catch(() => false)) ? overlayMenu : cardMenu;
    if (await menu.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await menu.click({ timeout: 10_000 }).catch(async () => menu.dispatchEvent('click'));
    }
    if (await responsesMenuItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
      break;
    }
  }

  await expect(responsesMenuItem, 'published application menu should expose View responses').toBeVisible({ timeout: 10_000 });
  await responsesMenuItem.click({ timeout: 10_000 }).catch(async () => responsesMenuItem.dispatchEvent('click'));

  const responsesPage = page.locator('page-datapage:visible').last();
  await expect(responsesPage, 'View responses should open the response tracking page').toBeVisible({ timeout: 60_000 });
  const inviteesTab = responsesPage.locator('ion-segment-button[value="Invitees"]:visible').first();
  await expect(inviteesTab, 'response tracking should expose its Invitees segment').toBeVisible({ timeout: 30_000 });
  await inviteesTab.click({ timeout: 10_000 }).catch(async () => inviteesTab.dispatchEvent('click'));

  const row = responsesPage.locator('ion-list ion-item:visible').filter({ hasText: recipient }).first();
  await expect(row, `response tracking should list saved invitee ${recipient}`).toBeVisible({ timeout: 60_000 });
  await expect(row, `saved invitee row should retain ${recipient}`).toContainText(recipient);
  return row;
}

async function inviteeResponseRowGeometry(row: Locator): Promise<{
  rowTop: number;
  rowBottom: number;
  rowHeight: number;
  clientHeight: number;
  scrollHeight: number;
  contentTop: number;
  contentBottom: number;
  textLines: Array<{ top: number; bottom: number; text: string }>;
}> {
  return row.evaluate((element) => {
    const rowElement = element as HTMLElement;
    const rowBox = rowElement.getBoundingClientRect();
    const nameColumn = [...rowElement.querySelectorAll('ion-col')].find((candidate) => {
      const visibleTextLines = [...candidate.querySelectorAll('ion-text')].filter((text) => {
        const box = (text as HTMLElement).getBoundingClientRect();
        return box.width > 0 && box.height > 0 && (text.textContent ?? '').trim() !== '';
      });
      return visibleTextLines.length >= 2;
    });
    if (!(nameColumn instanceof HTMLElement)) {
      throw new Error('Invitee response row should expose a two-line name and metadata column');
    }

    const textLines = [...nameColumn.querySelectorAll('ion-text')]
      .map((text) => {
        const box = (text as HTMLElement).getBoundingClientRect();
        return {
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
          text: (text.textContent ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(),
        };
      })
      .filter((line) => line.width > 0 && line.height > 0 && line.text !== '')
      .sort((left, right) => left.top - right.top)
      .map(({ top, bottom, text }) => ({ top, bottom, text }));

    return {
      rowTop: rowBox.top,
      rowBottom: rowBox.bottom,
      rowHeight: rowBox.height,
      clientHeight: rowElement.clientHeight,
      scrollHeight: rowElement.scrollHeight,
      contentTop: Math.min(...textLines.map((line) => line.top)),
      contentBottom: Math.max(...textLines.map((line) => line.bottom)),
      textLines,
    };
  });
}

async function expectShareNotificationBodyContains(page: Page, modal: Locator, expectedText: string): Promise<void> {
  const iframeBody = await visibleShareNotificationTinyMceBody(page, modal);
  if (iframeBody) {
    await expect(iframeBody, 'share notification body should keep the configured text').toContainText(expectedText, {
      timeout: 10_000,
    });
    return;
  }

  const inlineEditor = modal.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'share notification inline body editor should be visible').toBeVisible({ timeout: 10_000 });
  await expect(inlineEditor, 'share notification body should keep the configured text').toContainText(expectedText, {
    timeout: 10_000,
  });
}

async function visibleShareNotificationTinyMceBody(page: Page, modal: Locator): Promise<Locator | null> {
  const frames = modal.locator(SEL.shareBodyEditorFrame);
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    const count = await frames.count().catch(() => 0);
    for (let index = count - 1; index >= 0; index--) {
      const frame = frames.nth(index);
      await frame.waitFor({ state: 'attached', timeout: 500 }).catch(() => undefined);
      await frame.scrollIntoViewIfNeeded({ timeout: 1_000 }).catch(() => undefined);

      const body = frame.contentFrame().locator('body[contenteditable="true"], body.mce-content-body, body').first();
      if (await body.isVisible({ timeout: 1_000 }).catch(() => false)) {
        return body;
      }
    }

    await page.waitForTimeout(250);
  }

  return null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function openFunctionalEditorCollaboratorsModal(page: Page): Promise<Locator> {
  await acceptRgpdIfVisible(page).catch(() => undefined);
  const modal = page.locator(SEL.collaboratorsModal).last();

  try {
    return await openEditorCollaboratorsModal(page);
  } catch (error) {
    await acceptRgpdIfVisible(page, 500).catch(() => undefined);
    const addCollaboratorsItem = page
      .locator('ion-popover:not(.overlay-hidden):visible ion-item')
      .filter({ hasText: /Add collaborators|Ajouter des collaborateurs|Agregar colaboradores|Aggiungi collaboratori/i })
      .first();

    if (!(await addCollaboratorsItem.isVisible({ timeout: 5_000 }).catch(() => false))) {
      throw error;
    }

    await addCollaboratorsItem.click({ timeout: 5_000 }).catch(async () => addCollaboratorsItem.dispatchEvent('click'));
    await expect(modal, 'the collaborators modal should open from the visible more-actions item').toBeVisible({
      timeout: 30_000,
    });
    return modal;
  }
}

async function saveCollaboratorsModal(modal: Locator, description: string): Promise<void> {
  const save = modal.locator(SEL.collaboratorsSaveButton).first();
  await expect(save, `${description} save button should be visible`).toBeVisible({ timeout: 10_000 });
  await save.click({ timeout: 10_000 }).catch(async () => {
    if (await modal.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await modal.locator(SEL.collaboratorsSaveButton).first().dispatchEvent('click');
    }
  });
  await expect(modal, `${description} collaborators modal should close after saving`).toBeHidden({ timeout: 30_000 });
}

async function setPwaShortNameAndSave(page: Page, shortName: string): Promise<void> {
  const modal = page.locator(SEL.pwaEditModal).last();
  await expect(modal, 'PWA editor modal should be open').toBeVisible({ timeout: 30_000 });
  const input = modal.locator(SEL.pwaShortNameInput).first();
  await expect(input, 'PWA short name input should be visible').toBeVisible({ timeout: 15_000 });
  await input.fill(shortName);
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  await input.blur();
  await expect(input, 'PWA short name should contain the updated value before saving').toHaveValue(shortName, {
    timeout: 10_000,
  });
  await modal.locator(SEL.pwaSaveButton).first().click({ timeout: 10_000 }).catch(async () => {
    await modal.locator(SEL.pwaSaveButton).first().dispatchEvent('click');
  });
  await expect(modal, 'PWA editor modal should close after saving').toBeHidden({ timeout: 60_000 });
}

async function waitForPublishedApplicationVersion(page: Page, formId: string): Promise<string> {
  await expect
    .poll(async () => documentVersion(await getFormDocument(page, publishedApplicationId(formId)).catch(() => null)), {
      message: 'published application document should expose a version after publication',
      timeout: 60_000,
    })
    .not.toBe('');

  return documentVersion(await getFormDocument(page, publishedApplicationId(formId)));
}

async function expectPublishedApplicationVersionUnchanged(
  page: Page,
  formId: string,
  expectedVersion: string,
): Promise<void> {
  const deadline = Date.now() + 8_000;
  do {
    const currentVersion = documentVersion(await getFormDocument(page, publishedApplicationId(formId)));
    expect(currentVersion, 'saving an existing PWA should not create a new published application version').toBe(expectedVersion);
    await page.waitForTimeout(500);
  } while (Date.now() < deadline);
}

async function expectPwaDocument(page: Page, formId: string, message: string): Promise<NonNullable<PwaDocument>> {
  let pwa: PwaDocument | null = null;
  await expect
    .poll(
      async () => {
        pwa = await getPwaDocument(page, formId);
        if (pwa) {
          return 'ready';
        }
        const publicationError = normalizeWhitespace(
          await page
            .locator('ion-toast.toastError:visible')
            .last()
            .innerText({ timeout: 500 })
            .catch(() => ''),
        );
        if (publicationError) {
          throw new Error(`PWA publication reported an error: ${publicationError}`);
        }
        return '';
      },
      {
        message,
        timeout: 120_000,
      },
    )
    .toBe('ready');
  return pwa as NonNullable<PwaDocument>;
}

async function expectPublishedCardCount(page: Page, title: string, expected: number): Promise<void> {
  await expect
    .poll(() => visiblePublishedCardCount(page, title), {
      message: `Published Applications should show ${expected} card(s) for ${title}`,
      timeout: 30_000,
    })
    .toBe(expected);
}

async function visiblePublishedCardCount(page: Page, title: string): Promise<number> {
  return page.evaluate((expectedTitle) => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const visible = (el: Element): boolean => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...document.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')]
      .filter(visible)
      .filter((card) => normalize((card as HTMLElement).innerText).includes(expectedTitle)).length;
  }, title);
}

function standalonePwaUrl(page: Page, targetId: string): string {
  return publishedPwaUrl(page, targetId);
}

function mobileAppRootUrl(page: Page): string {
  const url = new URL(page.url());
  const marker = '/DisplayObjects/mobile/';
  const markerIndex = url.pathname.indexOf(marker);
  if (markerIndex >= 0) {
    url.pathname = `${url.pathname.slice(0, markerIndex)}${marker}`;
    url.search = '';
    url.hash = '';
    return url.toString();
  }
  url.pathname = url.pathname.replace(/\/(?:editor|viewer)(?:\/.*)?$/, '/');
  url.search = '';
  url.hash = '';
  return url.toString();
}

function publishedViewerTargetId(pwa: NonNullable<PwaDocument>, fallbackPublishedId: string): string {
  if (typeof pwa.targetId === 'string' && pwa.targetId) {
    return pwa.targetId;
  }
  if (typeof pwa.anonymousKey === 'string' && pwa.anonymousKey) {
    return pwa.anonymousKey;
  }
  return fallbackPublishedId;
}

function publishedApplicationId(formId: string): string {
  return formId.startsWith('published_') ? formId : `published_${formId}`;
}

function documentRevision(doc: FormDocument | PwaDocument | null | undefined): string {
  const revision = doc?._rev;
  return typeof revision === 'string' ? revision : '';
}

function documentVersion(doc: FormDocument | null | undefined): string {
  const version = doc?.version;
  return typeof version === 'string' || typeof version === 'number' ? String(version) : '';
}

function expectToolbarButtonUsesTheme(
  state: PublishedToolbarButtonThemeState,
  toolbarColor: string,
  label: string,
): void {
  expect(state.visibility, `${label} button should be visible after theme loading`).not.toBe('hidden');
  expect(state.cssColor, `${label} button should define Ionic --color from the toolbar theme`).not.toBe('');
  expectCssColorClose(state.cssColor, toolbarColor, `${label} --color should match toolbar text color`);
  expectCssColorClose(buttonRenderedColor(state), toolbarColor, `${label} icon should render with toolbar text color`);
  expect(state.hoverBackground, `${label} hover background should stay transparent in a published app`).toBe('transparent');
}

function buttonRenderedColor(state: PublishedToolbarButtonThemeState): string {
  return state.iconColor || state.nativeColor || state.color;
}

function expectCssColorVisible(value: string, message: string): void {
  const color = parseCssColor(value);
  expect(color.alpha, `${message}; actual=${value}`).toBeGreaterThan(0);
}

function expectCssColorClose(actual: string, expected: string, message: string): void {
  const actualColor = parseCssColor(actual);
  const expectedColor = parseCssColor(expected);
  const distance =
    Math.abs(actualColor.red - expectedColor.red) +
    Math.abs(actualColor.green - expectedColor.green) +
    Math.abs(actualColor.blue - expectedColor.blue);

  expect(distance, `${message}; actual=${actual}; expected=${expected}`).toBeLessThanOrEqual(6);
}

function contrastingTextColor(background: string): string {
  const color = parseCssColor(background);
  const channels = [color.red, color.green, color.blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

function parseCssColor(value: string): { red: number; green: number; blue: number; alpha: number } {
  const css = value.trim().toLowerCase();
  if (css === 'white') {
    return { red: 255, green: 255, blue: 255, alpha: 1 };
  }
  if (css === 'black') {
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  }
  if (css === 'transparent') {
    return { red: 0, green: 0, blue: 0, alpha: 0 };
  }

  const hex = css.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1].length === 3 ? hex[1].split('').map((part) => `${part}${part}`).join('') : hex[1];
    return {
      red: Number.parseInt(raw.slice(0, 2), 16),
      green: Number.parseInt(raw.slice(2, 4), 16),
      blue: Number.parseInt(raw.slice(4, 6), 16),
      alpha: 1,
    };
  }

  const rgb = css.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(',').map((part) => part.trim());
    return {
      red: Number(parts[0]),
      green: Number(parts[1]),
      blue: Number(parts[2]),
      alpha: parts[3] == null ? 1 : Number(parts[3]),
    };
  }

  throw new Error(`Unsupported CSS color: ${value}`);
}
