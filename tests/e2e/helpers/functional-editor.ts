import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  activePageSettingsSection,
  addComponent,
  addPageThroughPagesPanel,
  closePageSettings,
  closeComponentConfig,
  countComponents,
  editorSidebarTooltipTitles,
  expectEditorSidebarButtonsVisible,
  expectPagesPanelDefaultAfterWorkflowNavigation,
  openComponentConfig,
  openComponentConfigByTechnicalId,
  openApplicationSettingsFromSidebar,
  openComponentsPalette,
  openPageButtonsConfig,
  openPagesPanel,
  openPageSettings,
  openPageSettingsForPage,
  openWorkflowsPanel,
  recordedToasts,
  recordToasts,
  setTechnicalId,
} from './studio';

const EMPTY_PAGE_NAME_MESSAGE = /Ce champ ne peut etre vide|Ce champ ne peut .tre vide|This field can't be empty/i;
const DUPLICATE_PAGE_NAME_MESSAGE = /Ce nom existe deja|Ce nom existe d.j.|This name already exists/i;
const PAGE_DUPLICATE_ACTION = '[data-id="duplicate-action-pages"]';
const WORKFLOWS_SCROLL_CONTAINER = '#bloc-palette .class1773251123673';
const WORKFLOW_STRESS_BUTTON_COUNT = 10;
const PAGE_SETTINGS_HEADER_ICON = 'ion-button.class1664198060282';
const APPLICATION_SETTINGS_HEADER_ICON = 'ion-button.class1774950763931';
const PAGE_NAVIGATION_INHERITANCE_TOGGLE = 'c8oforms-toggleswitch.class1781188989133';
const PAGE_NAVIGATION_BUTTONS_TOGGLE = 'c8oforms-toggleswitch.class1779359000054';
const WORKFLOW_EDIT_ACTION = '[data-id="edit-action-workflows"]';
const EDITABLE_WORKFLOW_NAME_INPUT = 'ion-input.class1742208653180';
const FLOW_HEADER = '.class1780661784366';
const FLOW_HEADER_HOVER_AFFORDANCE = '.class1780661784486';
const CURRENT_PAGE_ADD_ACTION = 'ion-button.class1780583331059';
const LEGACY_PAGE_ADD_ACTION = 'ion-button.class1750084426535';
const AI_FAB = 'ion-fab.class1730193473111';
const AI_FAB_BUTTON = 'ion-fab-button.class1730193473102';
const LOCALIZED_DISABLED_LABEL =
  /^(?:Disabled|Désactivé|Discapacitado|Disabilitato|已禁用)$/;

interface DecorativeSettingsIconState {
  cursor: string;
  hostDisabled: boolean;
  opacity: string;
  shadowDisabled: boolean;
}

/**
 * #1321: the icons heading Page and Application settings are informational,
 * not actions. Assert their actual host/shadow disabled state and neutral
 * visual behavior, then verify the localized Disabled option in Page >
 * Navigation uses the corrected capitalization.
 */
export async function assertPageAndApplicationSettingsIconsAreDisabledThroughUi(page: Page): Promise<void> {
  await test.step('Assert the Page settings header icon is disabled', async () => {
    await openPageSettings(page);
    await expectDecorativeSettingsIconDisabled(
      page.locator(`${PAGE_SETTINGS_HEADER_ICON}:visible`).first(),
      'Page settings icon',
    );
  });

  await test.step('Assert Page Navigation exposes the corrected localized Disabled label', async () => {
    const navigationTab = page.locator(SEL.pageSettingsNavigationTab).first();
    await expect(navigationTab, 'Page settings Navigation tab should be visible').toBeVisible({ timeout: 15_000 });
    await navigationTab.click({ timeout: 10_000 }).catch(async () => navigationTab.dispatchEvent('click'));
    await expect
      .poll(() => activePageSettingsSection(page), {
        message: 'Page settings should switch to Navigation',
        timeout: 10_000,
      })
      .toBe('navigation');

    const inheritance = page.locator(`${PAGE_NAVIGATION_INHERITANCE_TOGGLE}:visible`).first();
    await expect(inheritance, 'Page Navigation should expose the global-navigation inheritance choice').toBeVisible({
      timeout: 15_000,
    });
    const individual = inheritance.locator('button.c8o-btn:visible').nth(0);
    await individual.click({ timeout: 10_000 }).catch(async () => individual.dispatchEvent('click'));
    await expect(individual, 'individual Page navigation should be selected').toHaveClass(/c8o-btn-selected/, {
      timeout: 10_000,
    });

    const buttonModes = page.locator(`${PAGE_NAVIGATION_BUTTONS_TOGGLE}:visible`).first().locator('button.c8o-btn:visible');
    await expect(buttonModes, 'Page Navigation should expose its three button modes').toHaveCount(3, { timeout: 15_000 });
    await expect
      .poll(async () => (await buttonModes.nth(0).innerText()).trim(), {
        message: 'the localized disabled mode should use the corrected label',
        timeout: 10_000,
      })
      .toMatch(LOCALIZED_DISABLED_LABEL);
  });

  await test.step('Assert the Application settings header icon is disabled', async () => {
    await closePageSettings(page);
    await openApplicationSettingsFromSidebar(page);
    await expectDecorativeSettingsIconDisabled(
      page.locator(`${APPLICATION_SETTINGS_HEADER_ICON}:visible`).first(),
      'Application settings icon',
    );
  });
}

async function expectDecorativeSettingsIconDisabled(icon: Locator, description: string): Promise<void> {
  await expect(icon, `${description} should be visible`).toBeVisible({ timeout: 15_000 });
  const state = await icon.evaluate((host): DecorativeSettingsIconState => {
    const button = host as HTMLElement & { disabled?: boolean };
    const shadowButton = host.shadowRoot?.querySelector('button');
    const style = getComputedStyle(host);
    return {
      cursor: style.cursor,
      hostDisabled: button.disabled === true || button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true',
      opacity: style.opacity,
      shadowDisabled: shadowButton instanceof HTMLButtonElement && shadowButton.disabled,
    };
  });
  expect(
    state.hostDisabled || state.shadowDisabled,
    `${description} should be disabled at the host or native-button level`,
  ).toBe(true);
  expect(state.cursor, `${description} should not advertise a clickable pointer`).not.toBe('pointer');
  expect(Number(state.opacity), `${description} should retain its informational icon opacity`).toBe(1);
}

/**
 * #1372/#1373: only user-created workflows are editable. Their list row must
 * expose the edit affordance on hover and their canvas header must advertise
 * that it can be configured. Formula and submission system workflows must do
 * neither, and selecting either one must close an already-open rename panel.
 */
export async function verifyEditableWorkflowAffordancesThroughUi(page: Page): Promise<void> {
  await test.step('Create one editable workflow through the component Palette', async () => {
    const buttonComponents = page.locator(SEL.buttonComponent);
    const before = await buttonComponents.count();
    await openComponentsPalette(page, PALETTE_ICON.button);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect
      .poll(() => buttonComponents.count(), {
        message: 'adding a Button through the Palette should create its editable workflow',
        timeout: 30_000,
      })
      .toBe(before + 1);
  });

  await openWorkflowsPanel(page);
  const userFlow = page.locator(`${SEL.buttonWorkflowEntry}:visible`).first();
  const formulas = page.locator('#unique_formulas:visible').first();
  const submission = page.locator('#unique_submit:visible').first();

  await test.step('Expose edit only when hovering a user-created workflow', async () => {
    await expect(userFlow, 'the Button should expose a user-created workflow').toBeVisible({ timeout: 15_000 });
    await expect(formulas, 'the Formula system workflow should be visible').toBeVisible({ timeout: 15_000 });
    await expect(submission, 'the submission system workflow should be visible').toBeVisible({ timeout: 15_000 });

    await userFlow.hover();
    await expect(
      userFlow.locator(WORKFLOW_EDIT_ACTION),
      'hovering a user-created workflow should expose its edit control',
    ).toBeVisible({ timeout: 10_000 });

    for (const [name, systemFlow] of [
      ['Formula', formulas],
      ['submission', submission],
    ] as const) {
      await systemFlow.hover();
      await expect(
        systemFlow.locator(WORKFLOW_EDIT_ACTION),
        `${name} is a system workflow and must not expose an edit control on hover`,
      ).toHaveCount(0);
    }
  });

  await test.step('Close user-flow rename settings when selecting each system workflow', async () => {
    for (const [name, systemFlow] of [
      ['Formula', formulas],
      ['submission', submission],
    ] as const) {
      await openUserWorkflowRenameSettings(userFlow);
      await expect(
        page.locator(`${EDITABLE_WORKFLOW_NAME_INPUT}:visible`),
        'the edit affordance should open the editable user-workflow name field',
      ).toHaveCount(1, { timeout: 10_000 });

      await systemFlow.click({ timeout: 10_000 }).catch(async () => systemFlow.dispatchEvent('click'));
      await expect(
        page.locator(`${EDITABLE_WORKFLOW_NAME_INPUT}:visible`),
        `selecting ${name} should close the user-workflow rename field`,
      ).toHaveCount(0, { timeout: 10_000 });
    }
  });

  await test.step('Show canvas-header hover feedback only for the editable workflow', async () => {
    await userFlow.click({ timeout: 10_000 }).catch(async () => userFlow.dispatchEvent('click'));
    await expectWorkflowHeaderHoverAffordance(page, true, 'user-created workflow');

    await formulas.click({ timeout: 10_000 }).catch(async () => formulas.dispatchEvent('click'));
    await expectWorkflowHeaderHoverAffordance(page, false, 'Formula system workflow');

    await submission.click({ timeout: 10_000 }).catch(async () => submission.dispatchEvent('click'));
    await expectWorkflowHeaderHoverAffordance(page, false, 'submission system workflow');
  });
}

async function openUserWorkflowRenameSettings(userFlow: Locator): Promise<void> {
  await userFlow.hover();
  const edit = userFlow.locator(WORKFLOW_EDIT_ACTION);
  await expect(edit, 'user-workflow edit control should be visible after hover').toBeVisible({ timeout: 10_000 });
  await edit.click({ position: { x: 2, y: 2 }, timeout: 10_000 }).catch(async () => edit.dispatchEvent('click'));
}

async function expectWorkflowHeaderHoverAffordance(
  page: Page,
  editable: boolean,
  description: string,
): Promise<void> {
  const visibleHeaders = page.locator(`${FLOW_HEADER}:visible`);
  await expect(visibleHeaders, `${description} should render one current workflow header`).toHaveCount(1, {
    timeout: 15_000,
  });
  const header = visibleHeaders.first();
  await header.hover();
  const affordance = header.locator(FLOW_HEADER_HOVER_AFFORDANCE);
  if (editable) {
    await expect(affordance, `${description} should show its edit feedback on hover`).toBeVisible({ timeout: 10_000 });
  } else {
    await expect(affordance, `${description} must not show editable hover feedback`).toHaveCount(0);
  }
}

export async function navigateEditorShellSectionsThroughUi(page: Page): Promise<void> {
  await test.step('Open the component Palette panel', async () => {
    await openComponentsPalette(page, PALETTE_ICON.description);
    await expect(page.locator(SEL.componentPaletteSearch).first(), 'component Palette search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
    const titles = await editorSidebarTooltipTitles(page);
    expect(new Set(titles).size, 'the four editor sidebar actions should expose distinct tooltip titles').toBe(4);
    await expectEditorCanvasVisible(page);
  });

  await test.step('Open the Pages panel', async () => {
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageSearchbar).first(), 'Pages panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should expose the current page').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
    await expectEditorCanvasVisible(page);
  });

  await test.step('Open the Workflows panel', async () => {
    await openWorkflowsPanel(page);
    await expect(page.locator(SEL.workflowsSearchbar).first(), 'Workflows panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.workflowEntry).first(), 'Workflows panel should expose workflow entries').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await expectPagesPanelDefaultAfterWorkflowNavigation(page);

  await test.step('Open the application Settings panel', async () => {
    await openApplicationSettingsFromSidebar(page);
    await expect(page.locator(SEL.appSettingsCategories).first(), 'Settings panel categories should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await test.step('Return to Pages and prove the canvas remains reachable after Settings', async () => {
    await closeApplicationSettingsIfOpen(page);
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should still expose the current page').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
    await expectEditorCanvasVisible(page);
  });
}

export async function openOnePageIconPickerAfterRapidClicksThroughUi(page: Page): Promise<void> {
  await test.step('Open one page icon picker after rapid clicks', async () => {
    await openPageSettings(page);
    const iconSetting = page.locator(SEL.pageIconSetting).filter({ visible: true }).first();
    await expect(iconSetting, 'page icon setting should be visible').toBeVisible({ timeout: 15_000 });

    await iconSetting.click({ clickCount: 5, delay: 10 });

    const modals = page.locator(SEL.iconPickerModal);
    await expect(modals, 'rapid page icon clicks should create exactly one picker').toHaveCount(1, { timeout: 15_000 });
    await expect(modals.first(), 'the single page icon picker should be visible').toBeVisible({ timeout: 15_000 });

    await page.waitForTimeout(1_000);
    await expect(modals, 'no delayed page icon picker should stack after the rapid burst').toHaveCount(1);
  });

  await test.step('Close the picker and prove its modal lock is released', async () => {
    await page.keyboard.press('Escape');
    await expect(page.locator(`${SEL.iconPickerModal}:visible`), 'page icon picker should close').toHaveCount(0, {
      timeout: 15_000,
    });

    const iconSetting = page.locator(SEL.pageIconSetting).filter({ visible: true }).first();
    await expect(iconSetting, 'page icon setting should remain usable after closing its picker').toBeVisible({ timeout: 15_000 });
    await iconSetting.click({ timeout: 10_000 });
    await expect(
      page.locator(`${SEL.iconPickerModal}:visible`),
      'one page icon picker should reopen after the modal lock is released',
    ).toHaveCount(1, { timeout: 15_000 });
  });
}

export async function keepLastWorkflowFullyVisibleAfterScrollThroughUi(page: Page): Promise<void> {
  await test.step('Create enough Button workflows through the Studio palette', async () => {
    const buttons = page.locator(SEL.buttonComponent);
    const before = await buttons.count();
    await openComponentsPalette(page, PALETTE_ICON.button);
    for (let index = 0; index < WORKFLOW_STRESS_BUTTON_COUNT; index++) {
      await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    }
    await expect
      .poll(() => buttons.count(), {
        message: 'every palette Button should create a component and its workflow',
        timeout: 30_000,
      })
      .toBe(before + WORKFLOW_STRESS_BUTTON_COUNT);
  });

  await test.step('Scroll the constrained Workflows panel to its last flow', async () => {
    await page.setViewportSize({ width: 1280, height: 520 });
    await openWorkflowsPanel(page);

    const scroller = page.locator(`${WORKFLOWS_SCROLL_CONTAINER}:visible`).first();
    await expect(scroller, 'Workflows should expose the dedicated scroll container').toBeVisible({ timeout: 15_000 });
    const buttonFlows = scroller.locator('[draggable="true"]:not(#unique_formulas):not(#unique_submit)');
    await expect(buttonFlows, 'each Studio Button should expose a workflow entry').toHaveCount(WORKFLOW_STRESS_BUTTON_COUNT, {
      timeout: 30_000,
    });

    const initialState = await workflowScrollState(scroller);
    expect(initialState.overflowY, 'Workflows list should be vertically scrollable').toMatch(/^(?:auto|scroll)$/);
    expect(initialState.scrollHeight, 'the workflow fixture should overflow the constrained panel').toBeGreaterThan(
      initialState.clientHeight,
    );

    await scrollWorkflowContainerToBottom(page, scroller);
    const lastFlow = scroller.locator('[draggable="true"]').last();
    await expect(lastFlow, 'the last workflow should remain rendered after scrolling').toBeAttached();
    await expectLastWorkflowInsideVisibleScroller(lastFlow);
  });
}

export async function openSettingsFromWorkflowsAndKeepSidebarNavigable(page: Page): Promise<void> {
  await test.step('Open Workflows before application Settings', async () => {
    await openWorkflowsPanel(page);
    await expect(page.locator(SEL.workflowsSearchbar).first(), 'Workflows panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.workflowEntry).first(), 'Workflows panel should expose workflow entries').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await test.step('Open application Settings while coming from Workflows', async () => {
    await openApplicationSettingsFromSidebar(page);
    await expect(page.locator(SEL.appSettingsCategories).first(), 'Settings panel categories should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await test.step('Use the sidebar after opening Settings from Workflows', async () => {
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageSearchbar).first(), 'Pages panel search should be reachable from Settings').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should show the current page after leaving Settings').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorCanvasVisible(page);
  });
}

export async function addPageAndNavigateThroughPagesPanel(page: Page): Promise<void> {
  let newPageName = '';

  await test.step('Use the single prominent Add Page action', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);

    const addPage = page.locator(`${CURRENT_PAGE_ADD_ACTION}:visible`);
    await expect(addPage, 'Pages should expose exactly one current Add Page action').toHaveCount(1, {
      timeout: 15_000,
    });
    await expect(
      page.locator(LEGACY_PAGE_ADD_ACTION),
      'the obsolete upper-right Add Page action should not remain in the DOM',
    ).toHaveCount(0);

    const button = addPage.first();
    await expect(button, 'current Add Page action should be visible').toBeVisible({ timeout: 15_000 });
    await expect(
      button.locator('ion-icon.class1780583331077[role="img"]'),
      'current Add Page action should keep its plus icon',
    ).toBeVisible({ timeout: 10_000 });
    await expect(button.locator('ion-label'), 'current Add Page action should expose a localized visible label').not.toHaveText(
      /^\s*$/,
    );

    const layout = await button.evaluate((element) => {
      const host = element as HTMLElement;
      const panel = host.closest<HTMLElement>('#bloc-palette');
      const paintedPanel = panel?.querySelector<HTMLElement>('.class1650357035508') ?? panel;
      const native = host.shadowRoot?.querySelector<HTMLElement>('[part="native"]') ?? null;
      const hostBox = host.getBoundingClientRect();
      const panelBox = panel?.getBoundingClientRect() ?? null;
      const hostStyle = getComputedStyle(host);
      const panelStyle = paintedPanel ? getComputedStyle(paintedPanel) : null;
      return {
        borderTopWidth: Number.parseFloat(hostStyle.borderTopWidth),
        height: hostBox.height,
        nativeWidth: native?.getBoundingClientRect().width ?? 0,
        panelBackground: panelStyle?.backgroundColor ?? '',
        withinPanel:
          panelBox != null &&
          hostBox.left >= panelBox.left - 1 &&
          hostBox.right <= panelBox.right + 1 &&
          hostBox.top >= panelBox.top - 1 &&
          hostBox.bottom <= panelBox.bottom + 1,
        width: hostBox.width,
      };
    });
    expect(layout.width, 'Add Page action should span a readily discoverable panel row').toBeGreaterThanOrEqual(120);
    expect(layout.height, 'Add Page action should retain a usable click height').toBeGreaterThanOrEqual(28);
    expect(layout.nativeWidth, 'Add Page native button should expose a measurable click target').toBeGreaterThanOrEqual(60);
    expect(layout.borderTopWidth, 'Add Page action should be visually separated from the page list').toBeGreaterThanOrEqual(1);
    expect(layout.panelBackground, 'Add Page action should sit on a painted Pages-panel background').not.toMatch(
      /^(?:transparent|rgba\(0,\s*0,\s*0,\s*0\))$/,
    );
    expect(layout.withinPanel, 'Add Page action should remain fully contained in the Pages panel').toBe(true);

    const beforeNames = await visiblePageNames(page);
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
    await expect
      .poll(() => visiblePageNames(page), {
        message: 'clicking the current Add Page action should create exactly one page',
        timeout: 20_000,
      })
      .toHaveLength(beforeNames.length + 1);
    const afterNames = await visiblePageNames(page);
    newPageName = afterNames.find((name) => !beforeNames.includes(name)) ?? '';
    expect(newPageName, `new page should be identifiable after ${afterNames.join(', ')}`).not.toBe('');
  });

  await test.step('Navigate to the newly added page from the Pages panel', async () => {
    await openPagesPanel(page);
    const newPageRow = page.locator(SEL.pageRow).filter({ hasText: newPageName }).first();
    await expect(newPageRow, `new page row ${newPageName} should stay visible`).toBeVisible({ timeout: 15_000 });
    await newPageRow.click({ timeout: 10_000 }).catch(async () => newPageRow.dispatchEvent('click'));
    await expect(page.locator(SEL.pageButtonsBlock).first(), 'page canvas should stay visible after selecting the new page').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(newPageName, { exact: true }).first(), `canvas should expose the active page ${newPageName}`).toBeVisible({
      timeout: 15_000,
    });
  });
}

/** #1487: the AI FAB remains fully visible when the optional Brevo widget is absent. */
export async function verifyAiFloatingActionButtonWithoutBrevoThroughUi(page: Page): Promise<void> {
  await test.step('Confirm the optional Brevo widget is absent', async () => {
    await expect(page.locator('#brevo-conversations'), 'Brevo widget should remain absent for this regression guard').toHaveCount(0);
  });

  await test.step('Keep the 60x60 AI FAB fully inside the viewport', async () => {
    const fab = page.locator(`${AI_FAB}:visible`).first();
    const button = fab.locator(`${AI_FAB_BUTTON}:visible`).first();
    await expect(fab, 'AI FAB container should be visible when HasProject returns true').toBeVisible({ timeout: 30_000 });
    await expect(button, 'AI FAB button should be visible without Brevo').toBeVisible({ timeout: 15_000 });
    await expect
      .poll(() => fab.evaluate((element) => (element as HTMLElement).style.marginBottom), {
        message: 'AI FAB should use the no-Brevo bottom offset',
        timeout: 15_000,
      })
      .toBe('70px');

    const geometry = await fab.evaluate((element, buttonSelector) => {
      const host = element as HTMLElement;
      const button = host.querySelector<HTMLElement>(buttonSelector);
      const hostBox = host.getBoundingClientRect();
      const buttonBox = button?.getBoundingClientRect() ?? null;
      const centerTarget = document.elementFromPoint(
        hostBox.left + hostBox.width / 2,
        hostBox.top + hostBox.height / 2,
      );
      return {
        buttonHeight: buttonBox?.height ?? 0,
        buttonWidth: buttonBox?.width ?? 0,
        clickableAtCenter: centerTarget != null && (centerTarget === host || host.contains(centerTarget)),
        height: hostBox.height,
        insideViewport:
          hostBox.left >= 0 &&
          hostBox.top >= 0 &&
          hostBox.right <= window.innerWidth &&
          hostBox.bottom <= window.innerHeight,
        width: hostBox.width,
      };
    }, AI_FAB_BUTTON);

    expect(geometry.width, 'AI FAB container width').toBeCloseTo(60, 0);
    expect(geometry.height, 'AI FAB container height').toBeCloseTo(60, 0);
    expect(geometry.buttonWidth, 'AI FAB button width').toBeCloseTo(60, 0);
    expect(geometry.buttonHeight, 'AI FAB button height').toBeCloseTo(60, 0);
    expect(geometry.insideViewport, 'AI FAB should remain entirely within the visible viewport').toBe(true);
    expect(geometry.clickableAtCenter, 'AI FAB center should not be clipped or covered').toBe(true);
  });

  await test.step('Open the AI assistant from the visible FAB', async () => {
    const button = page.locator(`${AI_FAB_BUTTON}:visible`).first();
    await button.click({ timeout: 10_000 });
    await expect(
      page.locator('ion-modal.aichat:visible page-aichat').first(),
      'clicking the AI FAB should open the AI assistant modal',
    ).toBeVisible({ timeout: 30_000 });
  });
}

export async function renamePageWithValidationThroughUi(page: Page, validName = `Functional page ${Date.now()}`): Promise<void> {
  const newPageName = await addPageThroughPagesPanel(page);

  await test.step('Select the page to rename and open page settings', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);
    await openPageSettingsForPage(page, newPageName);
    await expect(page.locator(SEL.pageNameInput).first(), 'page name input should be visible').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Reject an empty page name', async () => {
    const input = page.locator(SEL.pageNameInput).first();
    await recordToasts(page);
    await commitTextInputChange(input, '');
    await expect
      .poll(async () => (await recordedToasts(page)).join(' | '), {
        message: 'empty page name should raise a validation toast',
        timeout: 10_000,
      })
      .toMatch(EMPTY_PAGE_NAME_MESSAGE);
  });

  await test.step('Reject a duplicate page name', async () => {
    const input = page.locator(SEL.pageNameInput).first();
    await commitTextInputChange(input, 'Page 1');
    await expect
      .poll(async () => (await recordedToasts(page)).join(' | '), {
        message: 'duplicate page name should raise a validation toast',
        timeout: 10_000,
      })
      .toMatch(DUPLICATE_PAGE_NAME_MESSAGE);
  });

  await test.step('Save a valid page name and assert it persists after reload', async () => {
    const input = page.locator(SEL.pageNameInput).first();
    await commitTextInputChange(input, validName);
    await expect(input, 'valid page name should stay in the settings input').toHaveValue(validName, {
      timeout: 10_000,
    });
    await closePageSettings(page);

    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).filter({ hasText: validName }).first(), `page row ${validName} should be listed`).toBeVisible({
      timeout: 15_000,
    });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectEditorCanvasVisible(page);
    await openPagesPanel(page);
    await expect(
      page.locator(SEL.pageRow).filter({ hasText: validName }).first(),
      `page row ${validName} should persist after reload`,
    ).toBeVisible({ timeout: 30_000 });
  });
}

async function commitTextInputChange(input: Locator, value: string): Promise<void> {
  await input.fill(value, { timeout: 10_000 });
  await expect(input, 'page name input should contain the value before committing it').toHaveValue(value, {
    timeout: 10_000,
  });
  await input.dispatchEvent('change');
  await input.blur();
}

export async function deletePageCancelThenConfirmThroughUi(page: Page): Promise<void> {
  const pageName = await addPageThroughPagesPanel(page);
  await acceptRgpdIfVisible(page);

  await test.step('Cancel page deletion and assert the page remains listed', async () => {
    await clickPageDeleteAction(page, pageName);
    const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
    await expect(alert, 'page deletion confirmation should be visible').toBeVisible({ timeout: 15_000 });
    const cancel = alert.locator('button.alert-button-role-cancel, button.btn--info, button.alert-button').first();
    await expect(cancel, 'page deletion cancel action should be visible').toBeVisible({ timeout: 10_000 });
    await cancel.click({ timeout: 10_000 }).catch(async () => cancel.dispatchEvent('click'));
    await expect(alert, 'page deletion confirmation should close after cancel').toBeHidden({ timeout: 15_000 });
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).filter({ hasText: pageName }).first(), `page row ${pageName} should remain after cancel`).toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Confirm page deletion and assert the active page remains usable', async () => {
    await clickPageDeleteAction(page, pageName);
    const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
    await expect(alert, 'page deletion confirmation should reopen').toBeVisible({ timeout: 15_000 });
    const confirm = alert.locator('button.btn--danger, button.alert-button-role-confirm').last();
    await expect(confirm, 'page deletion confirm action should be visible').toBeVisible({ timeout: 10_000 });
    await confirm.click({ timeout: 10_000 }).catch(async () => confirm.dispatchEvent('click'));
    await expect(alert, 'page deletion confirmation should close after confirm').toBeHidden({ timeout: 15_000 });
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).filter({ hasText: pageName }).first(), `page row ${pageName} should be removed`).toHaveCount(
      0,
      { timeout: 15_000 },
    );
    await expect(page.locator(SEL.pageRow).first(), 'at least one page should remain after deletion').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorCanvasVisible(page);
  });
}

export async function reorderPagesAndAssertPersistenceThroughUi(page: Page): Promise<void> {
  const secondPageName = await addPageThroughPagesPanel(page);
  const thirdPageName = await addPageThroughPagesPanel(page);
  let finalOrder: string[] = [];

  await test.step('Reorder the third page before the first page', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);
    const beforeOrder = await visiblePageNames(page);
    expect(beforeOrder, 'three page rows should be visible before reordering').toEqual(['Page 1', secondPageName, thirdPageName]);

    await dragPageOnto(page, thirdPageName, 'Page 1');

    await expect
      .poll(() => visiblePageNames(page), {
        message: 'page rows should reflect the new drag-and-drop order',
        timeout: 20_000,
      })
      .toEqual([thirdPageName, 'Page 1', secondPageName]);
  });

  await test.step('Move the first page downward and keep every page exactly once', async () => {
    // #1308: a page could only be moved upward. Page 3, first, is dragged downward onto Page 1. The exact place it
    // lands on depends on the rows the editor shifts during the drag, so the test checks that it went down, that
    // every page is still listed once, and that this order is the one kept after a reload.
    await dragPageOnto(page, thirdPageName, 'Page 1');
    await expect
      .poll(async () => (await visiblePageNames(page)).indexOf(thirdPageName), {
        message: 'page rows should support downward drag-and-drop',
        timeout: 20_000,
      })
      .toBeGreaterThan(0);
    finalOrder = await visiblePageNames(page);
    expect([...finalOrder].sort(), `reordered pages should stay unique: ${finalOrder.join(', ')}`).toEqual(
      ['Page 1', secondPageName, thirdPageName].sort(),
    );
  });

  await test.step('Reload the editor and assert the page order persists', async () => {
    const editorUrl = page.url();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (!(await page.locator(SEL.pageButtonsBlock).first().isVisible({ timeout: 30_000 }).catch(() => false))) {
      await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }
    await expectEditorCanvasVisible(page);
    await openPagesPanel(page);
    await expect
      .poll(() => visiblePageNames(page), {
        message: 'page rows should keep the reordered order after reload',
        timeout: 30_000,
      })
      .toEqual(finalOrder);
  });
}

export async function duplicatePageAndAssertCopiedContentThroughUi(
  page: Page,
  sourceTechnicalId = `functional_duplicate_text_${Date.now()}`,
): Promise<void> {
  await test.step('Create a source page with a configured Text input', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent).first(), 'source Text input should be visible before duplication').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, sourceTechnicalId);
    await closeComponentConfig(page);
    await expect(page.getByText(sourceTechnicalId, { exact: true }).first(), 'source technical ID should be visible').toBeVisible({
      timeout: 15_000,
    });
  });

  let copiedPageName = '';
  await test.step('Duplicate the source page from the Pages panel', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);
    const beforeRows = await visiblePageRowLabels(page);
    expect(beforeRows, 'a blank application should expose one source page before duplication').toContain('Page 1');

    await clickPageDuplicateAction(page, 'Page 1');
    const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
    await expect(alert, 'page duplication confirmation should be visible').toBeVisible({ timeout: 15_000 });
    const confirm = alert.locator('button.btn--success, button.alert-button-role-confirm').last();
    await expect(confirm, 'page duplication confirm action should be visible').toBeVisible({ timeout: 10_000 });
    await confirm.click({ timeout: 10_000 }).catch(async () => confirm.dispatchEvent('click'));
    await expect(alert, 'page duplication confirmation should close after confirm').toBeHidden({ timeout: 15_000 });

    await openPagesPanel(page);
    await expect
      .poll(() => visiblePageRowLabels(page), {
        message: 'duplicating a page should add a new page row',
        timeout: 20_000,
      })
      .toHaveLength(beforeRows.length + 1);
    const afterRows = await visiblePageRowLabels(page);
    copiedPageName = afterRows.find((name) => !beforeRows.includes(name)) ?? '';
    expect(copiedPageName, `a copied page name should be discoverable after rows ${afterRows.join(' | ')}`).not.toBe('');
  });

  await test.step('Open the copied page and assert the component was copied with a distinct ID', async () => {
    await openPagesPanel(page);
    const copiedRow = page.locator(SEL.pageRow).filter({ hasText: copiedPageName }).first();
    await expect(copiedRow, `copied page row ${copiedPageName} should be visible`).toBeVisible({ timeout: 15_000 });
    await copiedRow.click({ timeout: 10_000 }).catch(async () => copiedRow.dispatchEvent('click'));
    await expect(page.locator(SEL.textComponent).first(), 'copied page should contain the Text input component').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    const copiedTechnicalId = await page.locator(SEL.technicalIdInput).first().inputValue({ timeout: 15_000 });
    expect(copiedTechnicalId, 'copied component technical ID should not be empty').not.toBe('');
    expect(copiedTechnicalId, 'copied component technical ID should differ from the source component').not.toBe(sourceTechnicalId);
    await closeComponentConfig(page);
  });
}

export async function configurePageButtonsThroughUi(page: Page): Promise<void> {
  const secondPageName = await addPageThroughPagesPanel(page);
  await acceptRgpdIfVisible(page);

  await test.step('Configure page buttons as standard buttons', async () => {
    await openPageButtonsConfig(page);
    expect(await activePageSettingsSection(page), 'page buttons click should open Navigation settings').toBe('navigation');
    await ensurePageSpecificNavigationControlsVisible(page);
    await selectPageButtonsMode(page, 1);
    await closePageSettings(page);
    await expect
      .poll(() => pageButtonsUiState(page), {
        message: 'standard page buttons should be visible without tab roles',
        timeout: 15_000,
      })
      .toMatchObject({ visible: true, hasTabs: false });
  });

  await test.step('Configure page buttons as tab buttons', async () => {
    await openPageNavigationSettingsFromPageRow(page, secondPageName);
    await ensurePageSpecificNavigationControlsVisible(page);
    await selectPageButtonsMode(page, 2);
    await closePageSettings(page);
    await expect
      .poll(() => pageButtonsUiState(page), {
        message: 'tab page buttons should be visible with tab roles',
        timeout: 15_000,
      })
      .toMatchObject({ visible: true, hasTabs: true });
  });

  await test.step('Disable page buttons', async () => {
    await openPageNavigationSettingsFromPageRow(page, secondPageName);
    await ensurePageSpecificNavigationControlsVisible(page);
    await selectPageButtonsMode(page, 0);
    await closePageSettings(page);
    await expect
      .poll(() => pageButtonsUiState(page), {
        message: 'disabled page buttons should hide the page buttons block',
        timeout: 15_000,
      })
      .toMatchObject({ visible: false });
  });
}

export async function returnHomeAndReopenSameApplicationThroughUi(
  page: Page,
  title: string,
  applicationId: string,
): Promise<void> {
  await test.step('Add a witness component before leaving the editor', async () => {
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect
      .poll(() => countComponents(page), {
        message: 'application should contain a witness component before returning home',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  });

  await test.step('Return to the selector from the editor Home button', async () => {
    const home = page.locator(SEL.editorHomeButton).first();
    await expect(home, 'editor Home button should be visible').toBeVisible({ timeout: 15_000 });
    await home.click({ timeout: 10_000 }).catch(async () => home.dispatchEvent('click'));
    await expect(page.locator(SEL.selectorPageRoot).first(), 'selector page should be visible after returning home').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(SEL.blankFormCard).first(), 'selector creation card should be visible after returning home').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Reopen the same application from the selector', async () => {
    const cards = page.locator('[id^="idcard"]');
    let card = cards.filter({ hasText: title }).first();
    if (!(await card.isVisible({ timeout: 10_000 }).catch(() => false))) {
      card = cards.filter({ hasText: title.slice(0, 29) }).first();
    }
    await expect(card, `selector should show application card ${title}`).toBeVisible({ timeout: 30_000 });
    await card.click({ timeout: 10_000 }).catch(async () => card.dispatchEvent('click'));
    await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 60_000 });
    const reopenedId = page.url().match(/\/editor\/([^/?#]+)/)?.[1] ?? '';
    expect(reopenedId, 'reopened editor id should match the original application id').toBe(applicationId);
    await expect
      .poll(() => countComponents(page), {
        message: 'reopened application should keep its witness component',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  });
}

export async function autosaveComponentConfigurationAfterCloseAndReload(
  page: Page,
  technicalId = `functional_autosave_${Date.now()}`,
): Promise<void> {
  await test.step('Add and configure a Text input component', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent).first(), 'Text input component should be visible on the canvas').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, technicalId);
    await expect(page.locator(SEL.technicalIdInput).first(), 'technical ID input should keep the configured value').toHaveValue(
      technicalId,
      { timeout: 10_000 },
    );
  });

  await test.step('Close the configuration panel and reload the editor', async () => {
    await closeComponentConfig(page);
    await expect(page.getByText(technicalId, { exact: true }).first(), 'configured technical ID should be visible after close').toBeVisible({
      timeout: 15_000,
    });

    const editorUrl = page.url();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (!(await page.locator(SEL.pageButtonsBlock).first().isVisible({ timeout: 30_000 }).catch(() => false))) {
      await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }
    await expectEditorCanvasVisible(page);
    await expect(page.locator(SEL.textComponent).first(), 'Text input component should remain visible after reload').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Reopen the component configuration and assert the saved value', async () => {
    await openComponentConfigByTechnicalId(page, technicalId);
    await expect(page.locator(SEL.technicalIdInput).first(), 'technical ID should persist after close and reload').toHaveValue(
      technicalId,
      { timeout: 15_000 },
    );
  });
}

async function closeApplicationSettingsIfOpen(page: Page): Promise<void> {
  if (!(await page.locator(SEL.appSettingsCategories).first().isVisible({ timeout: 1_000 }).catch(() => false))) {
    return;
  }

  const stableClose = page.locator('button.class1780498802542').first();
  const roleClose = page.getByRole('button', { name: /^Close$/i }).last();
  const close = (await stableClose.isVisible({ timeout: 1_000 }).catch(() => false)) ? stableClose : roleClose;
  await expect(close, 'application Settings close button should be visible before returning to Palette').toBeVisible({
    timeout: 10_000,
  });
  await close.click({ timeout: 10_000 }).catch(async () => close.dispatchEvent('click'));
  await expect(page.locator(SEL.appSettingsCategories).first(), 'application Settings panel should close').toBeHidden({
    timeout: 15_000,
  });
}

async function workflowScrollState(scroller: Locator): Promise<{
  clientHeight: number;
  overflowY: string;
  scrollHeight: number;
  scrollTop: number;
}> {
  return scroller.evaluate((element) => {
    const container = element as HTMLElement;
    return {
      clientHeight: container.clientHeight,
      overflowY: window.getComputedStyle(container).overflowY,
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };
  });
}

async function scrollWorkflowContainerToBottom(page: Page, scroller: Locator): Promise<void> {
  const box = await scroller.boundingBox();
  expect(box, 'Workflows scroll container should have a measurable box').not.toBeNull();
  if (!box) {
    return;
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

  for (let attempt = 0; attempt < 20; attempt++) {
    const state = await workflowScrollState(scroller);
    if (state.scrollHeight - state.clientHeight - state.scrollTop <= 1) {
      break;
    }
    await page.mouse.wheel(0, Math.max(160, Math.floor(state.clientHeight * 0.8)));
    await page.waitForTimeout(75);
  }

  const finalState = await workflowScrollState(scroller);
  expect(finalState.scrollTop, 'the constrained Workflows list should actually scroll').toBeGreaterThan(0);
  expect(
    finalState.scrollHeight - finalState.clientHeight - finalState.scrollTop,
    'the Workflows list should reach its bottom through user scrolling',
  ).toBeLessThanOrEqual(1);
}

async function expectLastWorkflowInsideVisibleScroller(lastFlow: Locator): Promise<void> {
  const geometry = await lastFlow.evaluate((element, scrollerSelector) => {
    const scroller = element.closest<HTMLElement>(scrollerSelector);
    if (!scroller) {
      throw new Error(`Last workflow is not inside ${scrollerSelector}`);
    }
    const flowRect = element.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const contentTop = scrollerRect.top + scroller.clientTop;
    const contentLeft = scrollerRect.left + scroller.clientLeft;
    return {
      flow: {
        bottom: flowRect.bottom,
        height: flowRect.height,
        left: flowRect.left,
        right: flowRect.right,
        top: flowRect.top,
        width: flowRect.width,
      },
      visibleScroller: {
        bottom: Math.min(contentTop + scroller.clientHeight, window.innerHeight),
        left: Math.max(contentLeft, 0),
        right: Math.min(contentLeft + scroller.clientWidth, window.innerWidth),
        top: Math.max(contentTop, 0),
      },
    };
  }, WORKFLOWS_SCROLL_CONTAINER);

  const tolerance = 1;
  expect(geometry.flow.width, 'last workflow should have a measurable width').toBeGreaterThan(0);
  expect(geometry.flow.height, 'last workflow should have a measurable height').toBeGreaterThan(0);
  expect(geometry.flow.top, 'last workflow top should be inside the visible scroller').toBeGreaterThanOrEqual(
    geometry.visibleScroller.top - tolerance,
  );
  expect(geometry.flow.bottom, 'last workflow bottom should be inside the visible scroller').toBeLessThanOrEqual(
    geometry.visibleScroller.bottom + tolerance,
  );
  expect(geometry.flow.left, 'last workflow left edge should be inside the visible scroller').toBeGreaterThanOrEqual(
    geometry.visibleScroller.left - tolerance,
  );
  expect(geometry.flow.right, 'last workflow right edge should be inside the visible scroller').toBeLessThanOrEqual(
    geometry.visibleScroller.right + tolerance,
  );
}

async function clickPageDeleteAction(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const row = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(row, `page row ${pageName} should be visible before deleting`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const deleteAction = page.locator(SEL.pageDeleteAction).first();
  if (await deleteAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await deleteAction.click({ timeout: 10_000 }).catch(async () => deleteAction.dispatchEvent('click'));
    return;
  }

  const rowBox = await row.boundingBox();
  const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
  expect(rowBox, `page row ${pageName} should have a bounding box`).not.toBeNull();
  expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
  if (!rowBox || !panelBox) {
    return;
  }
  await page.mouse.click(panelBox.x + panelBox.width - 42, rowBox.y + rowBox.height / 2);
}

async function clickPageDuplicateAction(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const row = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(row, `page row ${pageName} should be visible before duplicating`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const duplicateAction = page.locator(PAGE_DUPLICATE_ACTION).first();
  if (await duplicateAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await duplicateAction.click({ timeout: 10_000 }).catch(async () => duplicateAction.dispatchEvent('click'));
    return;
  }

  const rowBox = await row.boundingBox();
  const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
  expect(rowBox, `page row ${pageName} should have a bounding box`).not.toBeNull();
  expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
  if (!rowBox || !panelBox) {
    return;
  }
  await page.mouse.click(panelBox.x + panelBox.width - 76, rowBox.y + rowBox.height / 2);
}

async function visiblePageRowLabels(page: Page): Promise<string[]> {
  return page.locator(SEL.pageRow).evaluateAll((rows) => {
    const labels: string[] = [];
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    for (const row of rows) {
      if (!visible(row)) {
        continue;
      }
      const label = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (label && !labels.includes(label)) {
        labels.push(label);
      }
    }
    return labels;
  });
}

async function visiblePageNames(page: Page): Promise<string[]> {
  return page.locator(SEL.pageRow).evaluateAll((rows) => {
    const names: string[] = [];
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    for (const row of rows) {
      if (!visible(row)) {
        continue;
      }
      const text = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
      const match = text.match(/\bPage\s+\d+\b/);
      if (match && !names.includes(match[0])) {
        names.push(match[0]);
      }
    }
    return names;
  });
}

// Drags a page row onto another one: the dragged page takes the position of the target (#1308).
async function dragPageOnto(page: Page, sourceName: string, targetName: string): Promise<void> {
  await openPagesPanel(page);
  const source = page.locator(SEL.pageRow).filter({ hasText: sourceName }).first();
  const target = page.locator(SEL.pageRow).filter({ hasText: targetName }).first();
  await expect(source, `source page row ${sourceName} should be visible before drag`).toBeVisible({ timeout: 15_000 });
  await expect(target, `target page row ${targetName} should be visible before drag`).toBeVisible({ timeout: 15_000 });
  const orderBeforeNativeDrag = await visiblePageNames(page);

  await source.dragTo(target, {
    sourcePosition: { x: 16, y: 16 },
    targetPosition: { x: 16, y: 8 },
    timeout: 10_000,
  }).catch(() => undefined);

  const orderAfterNativeDrag = await visiblePageNames(page);
  if (JSON.stringify(orderAfterNativeDrag) !== JSON.stringify(orderBeforeNativeDrag)) {
    return;
  }

  const dispatched = await dispatchPageDragDrop(page, sourceName, targetName);
  expect(dispatched, `page drag/drop events should be dispatched for ${sourceName} onto ${targetName}`).toBe(true);
}

async function dispatchPageDragDrop(page: Page, sourceName: string, targetName: string): Promise<boolean> {
  return page.evaluate(
    ({ rowSelector, source, target }) => {
      const visible = (element: Element): element is HTMLElement => {
        const box = (element as HTMLElement).getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const pageRows = [...document.querySelectorAll(rowSelector)].filter(visible);
      const uniqueRows: Array<{ name: string; element: HTMLElement }> = [];
      for (const row of pageRows) {
        const text = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
        const match = text.match(/\bPage\s+\d+\b/);
        if (match && !uniqueRows.some((entry) => entry.name === match[0])) {
          uniqueRows.push({ name: match[0], element: row });
        }
      }
      const sourceIndex = uniqueRows.findIndex((entry) => entry.name === source);
      const targetEntry = uniqueRows.find((entry) => entry.name === target);
      const sourceEntry = uniqueRows[sourceIndex];
      if (sourceIndex < 0 || !sourceEntry || !targetEntry) {
        return false;
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.setData('__pagec8oformsdrag', 'true');
      dataTransfer.setData('index', String(sourceIndex));
      dataTransfer.setData('dropEffect', 'move');
      dataTransfer.effectAllowed = 'move';
      dataTransfer.dropEffect = 'move';

      const init: DragEventInit = { bubbles: true, cancelable: true, dataTransfer };
      sourceEntry.element.dispatchEvent(new DragEvent('dragstart', init));
      targetEntry.element.dispatchEvent(new DragEvent('dragenter', init));
      targetEntry.element.dispatchEvent(new DragEvent('dragover', init));
      targetEntry.element.dispatchEvent(new DragEvent('drop', init));
      sourceEntry.element.dispatchEvent(new DragEvent('dragend', init));
      return true;
    },
    { rowSelector: SEL.pageRow, source: sourceName, target: targetName },
  );
}

async function openPageNavigationSettingsFromPageRow(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  await openPageSettingsForPage(page, pageName);
  const navigationTab = page.locator(SEL.pageSettingsNavigationTab).first();
  await expect(navigationTab, 'page Navigation settings tab should be visible').toBeVisible({ timeout: 15_000 });
  await navigationTab.click({ timeout: 10_000 }).catch(async () => navigationTab.dispatchEvent('click'));
  await expect
    .poll(() => activePageSettingsSection(page), {
      message: 'page settings should switch to Navigation',
      timeout: 10_000,
    })
    .toBe('navigation');
}

async function ensurePageSpecificNavigationControlsVisible(page: Page): Promise<void> {
  if (await visibleToggleWithButtonCountOrNull(page, 3, 1_000)) {
    return;
  }

  const modeToggle = await visibleToggleWithButtonCount(page, 2);
  const firstOption = modeToggle.locator('button.c8o-btn:visible').nth(0);
  await expect(firstOption, 'individual page navigation first option should be visible').toBeVisible({ timeout: 10_000 });
  await firstOption.click({ timeout: 10_000 }).catch(async () => firstOption.dispatchEvent('click'));
  await expect
    .poll(() => countVisibleToggleGroupsWithButtonCount(page, 3), {
      message: 'enabling page-specific navigation should reveal page button controls',
      timeout: 15_000,
    })
    .toBeGreaterThan(0);
}

async function selectPageButtonsMode(page: Page, optionIndex: 0 | 1 | 2): Promise<void> {
  const buttonsToggle = await visibleToggleWithButtonCount(page, 3);
  const buttons = buttonsToggle.locator('button.c8o-btn:visible');
  const option = buttons.nth(optionIndex);
  await expect(option, `page buttons mode option #${optionIndex} should be visible`).toBeVisible({ timeout: 10_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(option, `page buttons mode option #${optionIndex} should be selected`).toHaveClass(/c8o-btn-selected/, {
    timeout: 10_000,
  });
}

async function visibleToggleWithButtonCount(page: Page, buttonCount: number): Promise<Locator> {
  const toggle = await visibleToggleWithButtonCountOrNull(page, buttonCount, 15_000);
  if (!toggle) {
    throw new Error(`No visible ToggleSwitch with ${buttonCount} buttons found`);
  }
  return toggle;
}

async function visibleToggleWithButtonCountOrNull(page: Page, buttonCount: number, timeout: number): Promise<Locator | null> {
  const startedAt = Date.now();
  do {
    const toggles = page.locator('c8oforms-toggleswitch:visible');
    const count = await toggles.count();
    for (let index = 0; index < count; index++) {
      const toggle = toggles.nth(index);
      if ((await toggle.locator('button.c8o-btn:visible').count()) === buttonCount) {
        return toggle;
      }
    }
    await page.waitForTimeout(250);
  } while (Date.now() - startedAt < timeout);
  return null;
}

async function countVisibleToggleGroupsWithButtonCount(page: Page, buttonCount: number): Promise<number> {
  const toggles = page.locator('c8oforms-toggleswitch:visible');
  let matching = 0;
  const count = await toggles.count();
  for (let index = 0; index < count; index++) {
    if ((await toggles.nth(index).locator('button.c8o-btn:visible').count()) === buttonCount) {
      matching++;
    }
  }
  return matching;
}

async function pageButtonsUiState(page: Page): Promise<{ visible: boolean; hasTabs: boolean; controlCount: number }> {
  return page.evaluate((tabBlockSelector) => {
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const inLowerCanvas = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      return box.y > window.innerHeight * 0.45 && box.x > 280;
    };
    const tabBlock = document.querySelector(tabBlockSelector);
    const tabControls =
      tabBlock && visible(tabBlock)
        ? [...tabBlock.querySelectorAll('button, ion-button, [role="button"], [role="tab"], ion-tab-button')].filter(visible)
        : [];
    if (tabControls.length > 0) {
      return { visible: true, hasTabs: true, controlCount: tabControls.length };
    }

    const standardControls = [...document.querySelectorAll('button, ion-button, [role="button"]')]
      .filter(visible)
      .filter(inLowerCanvas);
    return {
      visible: standardControls.length > 0,
      hasTabs: false,
      controlCount: standardControls.length,
    };
  }, SEL.pageButtonsBlock);
}

async function expectEditorCanvasVisible(page: Page): Promise<void> {
  await expect(page.locator(SEL.pageButtonsBlock).first(), 'editor canvas page buttons block should stay visible').toBeVisible({
    timeout: 15_000,
  });
}
