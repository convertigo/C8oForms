import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  addPageThroughPagesPanel,
  checkViewerCheckboxOption,
  closeComponentConfig,
  configureComponentNavigationFilter,
  closePageSettings,
  expectComponentNavigationFilter,
  expectViewerPageTitleHidden,
  openApplicationSettingsFromSidebar,
  openComponentConfig,
  openComponentsPalette,
  openConfigTabById,
  openPagesPanel,
  openPageSettingsForPage,
  openPublishedViewer,
  openPreview,
  publishCurrentFormWithPwa,
  publishedViewerToolbarThemeState,
  selectViewerRadioOption,
  setPageTabsThroughAppSettings,
  setChoiceLocalOptions,
  setDescriptionText,
  setTechnicalId,
} from './studio';

const VIEWER_NEXT_BUTTON = [
  'page-viewerpage ion-tab-button.class1664274551545:has(ion-icon[name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button.class1664274551545:has(ion-icon[ng-reflect-name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button:has(ion-icon[name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button:has(ion-icon[ng-reflect-name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button.class1664274551545',
].join(', ');

const APPLICATION_STANDARD_BUTTONS_TOGGLE = 'c8oforms-toggleswitch.class1781084751323';
const APPLICATION_BUTTONS_ORIENTATION_TOGGLE = 'c8oforms-toggleswitch.class1787576886492';
const APPLICATION_BUTTONS_BEHAVIOR_TOGGLE = 'c8oforms-toggleswitch.class1786367183326';
const APPLICATION_FORM_SETTINGS_BUTTON = 'button.class1779358000042';
const APPLICATION_PROGRESS_INDICATOR_TOGGLE = 'c8oforms-toggleswitch.class1779358500021';
const PAGE_FOLLOWS_GLOBAL_NAVIGATION_TOGGLE = 'c8oforms-toggleswitch.class1781188989133';
const PAGE_BUTTONS_TOGGLE = 'c8oforms-toggleswitch.class1779359000054';
const EDITOR_STANDARD_NEXT_BUTTON = 'ion-button.class1664197353976:visible';
const VIEWER_STANDARD_NEXT_BUTTON = [
  'page-viewerpage ion-button.class1592514320843:visible',
  'page-viewerpage ion-button.class1543865084771:visible',
].join(', ');
const SHARED_TABS_LAYOUT = 'page-viewerpage .class1727885021647';
const VIEWER_PROGRESS_INDICATOR = 'page-viewerpage ion-progress-bar.class1733481000437';
const VIEWER_TAB_ACTION_BUTTON = 'page-viewerpage ion-tab-button.class1664292958806';

async function selectToggleOption(page: Page, selector: string, index: number, description: string): Promise<void> {
  const toggle = page.locator(`${selector}:visible`).first();
  await expect(toggle, `${description} toggle should be visible`).toBeVisible({ timeout: 15_000 });
  const option = toggle.locator('button.c8o-btn:visible').nth(index);
  await expect(option, `${description} option #${index + 1} should be visible`).toBeVisible({ timeout: 10_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(option, `${description} option #${index + 1} should be selected`).toHaveClass(/c8o-btn-selected/, {
    timeout: 10_000,
  });
}

interface IonicButtonVisualState {
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  height: number;
  letterSpacing: string;
  paddingLeft: string;
  paddingRight: string;
  textTransform: string;
}

interface SharedTabVisualState {
  cursor: string;
  tabColor: string;
  iconColor: string;
  labelColor: string;
}

interface SharedTabSelectedIndicator {
  labelBorderBottomColor: string;
  labelBorderBottomStyle: string;
  labelBorderBottomWidth: string;
  pseudoBackgroundColor: string;
  pseudoContent: string;
  pseudoDisplay: string;
  pseudoHeight: string;
  pseudoWidth: string;
}

/**
 * #1320: configure the application-level standard ("Following the
 * application") navigation through Studio, then compare the actual Ionic
 * native button shape on the editor canvas and in Preview. Reading computed
 * styles from the shadow button protects the rendered contract without a
 * screenshot or a hard-coded theme color.
 */
export async function assertStandardNavigationStylesMatchEditorAndPreviewThroughUi(page: Page): Promise<void> {
  let secondPageName = '';
  await test.step('Create a second page and select standard application navigation', async () => {
    secondPageName = await addPageThroughPagesPanel(page);
    await openApplicationSettingsFromSidebar(page);

    const category = page.locator(SEL.appSettingsNavigationCategory).first();
    await expect(category, 'application Navigation settings should be visible').toBeVisible({ timeout: 15_000 });
    await category.click({ timeout: 10_000 }).catch(async () => category.dispatchEvent('click'));

    const toggle = page.locator(`${APPLICATION_STANDARD_BUTTONS_TOGGLE}:visible`).first();
    await expect(toggle, 'application navigation should expose the three button modes').toBeVisible({ timeout: 15_000 });
    const modes = toggle.locator('button.c8o-btn:visible');
    await expect(modes, 'application navigation should offer Disabled, standard, and tab modes').toHaveCount(3, {
      timeout: 10_000,
    });
    const standard = modes.nth(1);
    await standard.click({ timeout: 10_000 }).catch(async () => standard.dispatchEvent('click'));
    await expect(standard, 'standard navigation mode should be selected').toHaveClass(/c8o-btn-selected/, {
      timeout: 10_000,
    });

    await openPagesPanel(page);
  });

  let editorStyle: IonicButtonVisualState;
  await test.step('Capture the rendered Editor navigation-button style', async () => {
    const editorButton = page.locator(EDITOR_STANDARD_NEXT_BUTTON).first();
    await expect(editorButton, 'Editor should render its standard Next navigation button').toBeVisible({ timeout: 15_000 });
    editorStyle = await ionicButtonVisualState(editorButton);
    expectIonicButtonHasVisibleShape(editorStyle, 'Editor standard navigation button');
  });

  await test.step('Verify the global mode reaches every page and one page can override it', async () => {
    await selectEditorPageByName(page, secondPageName);
    const inheritedButton = page.locator(EDITOR_STANDARD_NEXT_BUTTON).first();
    await expect(inheritedButton, 'the second page should inherit the global standard navigation').toBeVisible({
      timeout: 15_000,
    });
    expect(
      await ionicButtonVisualState(inheritedButton),
      'global navigation should render the same standard button on the second page',
    ).toEqual(editorStyle!);

    await openPageSettingsForPage(page, secondPageName);
    const navigationSection = page.locator(SEL.pageSettingsNavigationTab).first();
    await expect(navigationSection, 'page settings should expose the Navigation section').toBeVisible({ timeout: 15_000 });
    await navigationSection.click({ timeout: 10_000 }).catch(async () => navigationSection.dispatchEvent('click'));

    const followsGlobal = page.locator(`${PAGE_FOLLOWS_GLOBAL_NAVIGATION_TOGGLE}:visible`).first();
    await expect(followsGlobal, 'page Navigation should expose the global-navigation inheritance switch').toBeVisible({
      timeout: 15_000,
    });
    const pageSpecific = followsGlobal.locator('button.c8o-btn:visible').nth(0);
    await pageSpecific.click({ timeout: 10_000 }).catch(async () => pageSpecific.dispatchEvent('click'));
    await expect(pageSpecific, 'the second page should ignore the global navigation').toHaveClass(/c8o-btn-selected/, {
      timeout: 10_000,
    });

    const pageButtons = page.locator(`${PAGE_BUTTONS_TOGGLE}:visible`).first();
    await expect(pageButtons, 'page-specific Navigation should expose its button modes').toBeVisible({ timeout: 15_000 });
    const disabled = pageButtons.locator('button.c8o-btn:visible').nth(0);
    await disabled.click({ timeout: 10_000 }).catch(async () => disabled.dispatchEvent('click'));
    await expect(disabled, 'the page-specific Disabled mode should be selected').toHaveClass(/c8o-btn-selected/, {
      timeout: 10_000,
    });
    await closePageSettings(page);

    await selectEditorPageByName(page, secondPageName);
    await expect(
      page.locator(EDITOR_STANDARD_NEXT_BUTTON),
      'the page-specific exception should remove the inherited standard button only from the second page',
    ).toHaveCount(0, { timeout: 15_000 });
    await selectEditorPageByName(page, 'Page 1');
    await expect(
      page.locator(EDITOR_STANDARD_NEXT_BUTTON).first(),
      'the first page should keep the application-level standard navigation after the exception',
    ).toBeVisible({ timeout: 15_000 });
  });

  await test.step('Open Preview and compare the rendered navigation-button style', async () => {
    await openPreview(page, VIEWER_STANDARD_NEXT_BUTTON);
    const viewerButton = page.locator(VIEWER_STANDARD_NEXT_BUTTON).first();
    await expect(viewerButton, 'Preview should render its standard Next navigation button').toBeVisible({ timeout: 30_000 });
    const viewerStyle = await ionicButtonVisualState(viewerButton);
    expectIonicButtonHasVisibleShape(viewerStyle, 'Preview standard navigation button');
    expect(viewerStyle, 'Preview should keep the Editor navigation button shape, typography, and colors').toEqual(editorStyle!);
  });
}

async function ionicButtonVisualState(button: Locator): Promise<IonicButtonVisualState> {
  return button.evaluate((host) => {
    const native = host.shadowRoot?.querySelector('button');
    if (!(native instanceof HTMLElement)) {
      throw new Error('Ionic navigation button should expose its native shadow button');
    }
    const style = getComputedStyle(native);
    const rect = native.getBoundingClientRect();
    return {
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      height: Math.round(rect.height * 100) / 100,
      letterSpacing: style.letterSpacing,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      textTransform: style.textTransform,
    };
  });
}

function expectIonicButtonHasVisibleShape(state: IonicButtonVisualState, description: string): void {
  expect(state.height, `${description} should have a measurable height`).toBeGreaterThan(0);
  expect(state.backgroundColor, `${description} should have a visible background`).not.toMatch(
    /^(?:rgba\(0, 0, 0, 0\)|transparent)$/,
  );
  expect(state.borderRadius, `${description} should keep the rounded navigation-button shape`).not.toBe('0px');
}

/**
 * #1290: exercise the SharedTabs CSS contract through a real two-page form.
 * The assertions deliberately use computed styles and tab state instead of page
 * labels or a hard-coded theme color, so they remain locale and theme neutral.
 */
export async function assertSharedTabsHoverAndSelectedStylesThroughUi(page: Page, browserName: string): Promise<void> {
  await test.step('Create a second page and enable viewer page tabs', async () => {
    await addPageThroughPagesPanel(page);
    await setPageTabsThroughAppSettings(page, 'footer');
  });

  await test.step('Open Preview with one SharedTabs button per page', async () => {
    await openPreview(page, SEL.viewerPageTab);
    await expect(page.locator(SEL.viewerPageTab), 'SharedTabs should expose two page buttons').toHaveCount(2, {
      timeout: 30_000,
    });
  });

  const tabs = page.locator(SEL.viewerPageTab);
  const selectedIndex = await selectedSharedTabIndex(tabs);
  expect(selectedIndex, 'SharedTabs should identify the current page').toBeGreaterThanOrEqual(0);
  const selectedTab = tabs.nth(selectedIndex);
  const hoverTargetIndex = selectedIndex === 0 ? 1 : 0;
  const hoverTarget = tabs.nth(hoverTargetIndex);

  await test.step('Verify the current page has selected visual feedback', async () => {
    await expect(selectedTab, 'current page tab should carry the selected state').toHaveClass(/tab-selected/);
    const selectedVisual = await sharedTabVisualState(selectedTab);
    expect(selectedVisual.cursor, 'selected SharedTabs button should advertise clickability').toBe('pointer');
    expect(selectedVisual.iconColor, 'selected page icon should use the selected color').toBe(selectedVisual.tabColor);
    expect(selectedVisual.labelColor, 'selected page label should use the selected color').toBe(selectedVisual.tabColor);
    await expectSharedTabSelectedIndicator(selectedTab, selectedVisual.tabColor, browserName);
  });

  await test.step('Verify an unselected page exposes hover feedback', async () => {
    const beforeHover = await sharedTabVisualState(hoverTarget);
    await hoverTarget.hover();
    await expect
      .poll(() => sharedTabVisualState(hoverTarget), {
        message: 'hovered SharedTabs button, icon and label should adopt the selected color',
        timeout: 5_000,
      })
      .toEqual({
        cursor: 'pointer',
        tabColor: (await sharedTabVisualState(selectedTab)).tabColor,
        iconColor: (await sharedTabVisualState(selectedTab)).tabColor,
        labelColor: (await sharedTabVisualState(selectedTab)).tabColor,
      });
    const afterHover = await sharedTabVisualState(hoverTarget);
    expect(afterHover.tabColor, 'hover should visibly change the page-tab color').not.toBe(beforeHover.tabColor);
  });

  await test.step('Switch pages and verify selected feedback follows the current page', async () => {
    await hoverTarget.click({ timeout: 10_000 });
    await expect(hoverTarget, 'clicked page tab should become selected').toHaveClass(/tab-selected/, { timeout: 15_000 });
    await expect(selectedTab, 'previous page tab should lose its selected state').not.toHaveClass(/tab-selected/, {
      timeout: 15_000,
    });

    const selectedVisual = await sharedTabVisualState(hoverTarget);
    expect(selectedVisual.iconColor, 'new current-page icon should keep selected feedback').toBe(selectedVisual.tabColor);
    expect(selectedVisual.labelColor, 'new current-page label should keep selected feedback').toBe(selectedVisual.tabColor);
    await expectSharedTabSelectedIndicator(hoverTarget, selectedVisual.tabColor, browserName);
  });
}

/**
 * #1449: the published SharedTabs selected state must inherit the published
 * toolbar policy color instead of falling back to Ionic primary blue. The
 * toolbar icon is the rendered policy-color reference, so this stays neutral
 * to whichever PWA theme the environment serves.
 */
export async function assertPublishedFooterTabsUseThemeColorThroughUi(
  page: Page,
  formId: string,
  browserName: string,
): Promise<void> {
  await test.step('Create two footer tabs and publish the form anonymously', async () => {
    await addPageThroughPagesPanel(page);
    await setPageTabsThroughAppSettings(page, 'footer');
    await publishCurrentFormWithPwa(page, 'anonymous');
    await openPublishedViewer(page, formId, SEL.viewerPageTab);
    await acceptRgpdIfVisible(page);
    await expect(page.locator(SEL.viewerPageTab), 'published SharedTabs should expose both pages').toHaveCount(2, {
      timeout: 30_000,
    });
  });

  const tabs = page.locator(SEL.viewerPageTab);
  const initialIndex = await selectedSharedTabIndex(tabs);
  expect(initialIndex, 'published SharedTabs should identify the current page').toBeGreaterThanOrEqual(0);
  const initialTab = tabs.nth(initialIndex);
  const nextIndex = initialIndex === 0 ? 1 : 0;
  const nextTab = tabs.nth(nextIndex);

  await test.step('Compare selected tab feedback with the published theme policy color', async () => {
    const theme = await publishedViewerToolbarThemeState(page);
    const policyColor = theme.menu.iconColor || theme.menu.nativeColor || theme.menu.color;
    expect(policyColor, 'published toolbar should expose a computed policy color').toMatch(/^rgba?\(/);

    const selected = await sharedTabVisualState(initialTab);
    expect(selected.tabColor, 'selected published tab should use the toolbar policy color').toBe(policyColor);
    expect(selected.iconColor, 'selected published tab icon should use the toolbar policy color').toBe(policyColor);
    expect(selected.labelColor, 'selected published tab label should use the toolbar policy color').toBe(policyColor);
    await expectSharedTabSelectedIndicator(initialTab, policyColor, browserName);
  });

  await test.step('Switch pages and verify theme-colored selection follows the current page', async () => {
    await nextTab.click({ timeout: 10_000 });
    await expect(nextTab, 'clicked published tab should become selected').toHaveClass(/tab-selected/, {
      timeout: 15_000,
    });
    await expect(initialTab, 'previous published tab should lose selection').not.toHaveClass(/tab-selected/, {
      timeout: 15_000,
    });

    const theme = await publishedViewerToolbarThemeState(page);
    const policyColor = theme.menu.iconColor || theme.menu.nativeColor || theme.menu.color;
    const selected = await sharedTabVisualState(nextTab);
    expect(selected.tabColor, 'new selected published tab should keep the toolbar policy color').toBe(policyColor);
    expect(selected.iconColor, 'new selected published tab icon should keep the toolbar policy color').toBe(policyColor);
    expect(selected.labelColor, 'new selected published tab label should keep the toolbar policy color').toBe(policyColor);
    await expectSharedTabSelectedIndicator(nextTab, policyColor, browserName);
  });
}

/** #1390: prove both configurable horizontal wrapping and right-side vertical tabs. */
export async function assertConfigurableTabLayoutsThroughUi(page: Page): Promise<void> {
  await test.step('Create enough pages to exercise a multi-page tab layout', async () => {
    for (let index = 0; index < 4; index += 1) {
      await addPageThroughPagesPanel(page);
    }
  });

  await test.step('Select horizontal Wrap behavior through application Navigation settings', async () => {
    await openApplicationSettingsFromSidebar(page);
    const category = page.locator(SEL.appSettingsNavigationCategory).first();
    await category.click({ timeout: 10_000 }).catch(async () => category.dispatchEvent('click'));
    await selectToggleOption(page, APPLICATION_STANDARD_BUTTONS_TOGGLE, 2, 'application tab-button mode');
    await selectToggleOption(page, APPLICATION_BUTTONS_ORIENTATION_TOGGLE, 0, 'horizontal tab orientation');
    await selectToggleOption(page, APPLICATION_BUTTONS_BEHAVIOR_TOGGLE, 1, 'Wrap tab behavior');
    await setPageTabsThroughAppSettings(page, 'footer');
  });

  await test.step('Verify Preview renders the configured wrapping contract', async () => {
    await openPreview(page, SEL.viewerPageTab);
    const layout = page.locator(SHARED_TABS_LAYOUT).first();
    await expect(layout, 'Preview should render the SharedTabs layout').toHaveClass(/c8o-tabs-buttons-wrap/, {
      timeout: 30_000,
    });
    const style = await layout.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { flexWrap: computed.flexWrap, overflowX: computed.overflowX, flexDirection: computed.flexDirection };
    });
    expect(style.flexWrap, 'Wrap behavior should allow page buttons onto additional rows').toBe('wrap');
    expect(style.overflowX, 'Wrap behavior should not force a horizontal scrollbar').toBe('visible');
    expect(style.flexDirection, 'Wrap behavior should retain the horizontal tab axis').toBe('row');
  });

  await test.step('Return to Studio and configure a right-side vertical tab rail', async () => {
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(SEL.previewButton).first(), 'Studio should be ready after leaving Preview').toBeVisible({
      timeout: 60_000,
    });
    await openApplicationSettingsFromSidebar(page);
    const category = page.locator(SEL.appSettingsNavigationCategory).first();
    await category.click({ timeout: 10_000 }).catch(async () => category.dispatchEvent('click'));
    await selectToggleOption(page, APPLICATION_BUTTONS_ORIENTATION_TOGGLE, 1, 'vertical tab orientation');
    await selectToggleOption(page, 'c8oforms-toggleswitch.class1787576909645', 2, 'right vertical placement');
  });

  await test.step('Verify Preview renders a right-side vertical tab rail', async () => {
    await openPreview(page, SEL.viewerPageTab);
    const layout = page.locator(SHARED_TABS_LAYOUT).first();
    await expect(layout, 'vertical Preview SharedTabs should expose its orientation class').toHaveClass(
      /c8o-tabs-orientation-vertical/,
      { timeout: 30_000 },
    );
    await expect(layout, 'vertical Preview SharedTabs should expose its right-placement class').toHaveClass(
      /c8o-tabs-vertical-right/,
      { timeout: 15_000 },
    );
    await expect(
      page.locator('page-viewerpage ion-content.c8o-tabs-vertical-runtime-right').first(),
      'viewer content should place the vertical navigation rail on the right',
    ).toBeVisible({ timeout: 15_000 });
    const style = await layout.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { flexDirection: computed.flexDirection, overflowX: computed.overflowX, overflowY: computed.overflowY };
    });
    expect(style.flexDirection, 'vertical tabs should stack along the block axis').toBe('column');
    expect(style.overflowX, 'vertical tabs should not horizontally overflow their rail').toBe('hidden');
    expect(style.overflowY, 'vertical tabs should remain scrollable when the rail overflows').toBe('auto');
  });
}

async function selectedSharedTabIndex(tabs: Locator): Promise<number> {
  return tabs.evaluateAll((elements) => elements.findIndex((element) => element.classList.contains('tab-selected')));
}

async function sharedTabVisualState(tab: Locator): Promise<SharedTabVisualState> {
  return tab.evaluate((element) => {
    const icon = element.querySelector('ion-icon');
    const label = element.querySelector('ion-label');
    if (!(icon instanceof HTMLElement) || !(label instanceof HTMLElement)) {
      throw new Error('SharedTabs page button should expose an icon and label');
    }
    return {
      cursor: getComputedStyle(element).cursor,
      tabColor: getComputedStyle(element).color,
      iconColor: getComputedStyle(icon).color,
      labelColor: getComputedStyle(label).color,
    };
  });
}

async function expectSharedTabSelectedIndicator(tab: Locator, selectedColor: string, browserName: string): Promise<void> {
  const indicator = await tab.evaluate((element): SharedTabSelectedIndicator => {
    const label = element.querySelector('ion-label');
    if (!(label instanceof HTMLElement)) {
      throw new Error('SharedTabs selected button should expose a label');
    }
    const labelStyle = getComputedStyle(label);
    const pseudoStyle = getComputedStyle(element, '::after');
    return {
      labelBorderBottomColor: labelStyle.borderBottomColor,
      labelBorderBottomStyle: labelStyle.borderBottomStyle,
      labelBorderBottomWidth: labelStyle.borderBottomWidth,
      pseudoBackgroundColor: pseudoStyle.backgroundColor,
      pseudoContent: pseudoStyle.content,
      pseudoDisplay: pseudoStyle.display,
      pseudoHeight: pseudoStyle.height,
      pseudoWidth: pseudoStyle.width,
    };
  });

  if (browserName === 'firefox') {
    expect(indicator.labelBorderBottomWidth, 'Firefox selected label should have a 2px underline').toBe('2px');
    expect(indicator.labelBorderBottomStyle, 'Firefox selected label underline should be visible').not.toBe('none');
    expect(indicator.labelBorderBottomColor, 'Firefox selected underline should use the selected color').toBe(selectedColor);
    expect(indicator.pseudoDisplay, 'Firefox should suppress the stray pseudo-element underscore').toBe('none');
    expect(indicator.pseudoContent, 'Firefox should suppress pseudo-element content').toMatch(/^(none|normal)$/);
    return;
  }

  expect(indicator.pseudoDisplay, 'selected page should expose its underline').not.toBe('none');
  expect(indicator.pseudoContent, 'selected page underline should have generated content').not.toMatch(/^(none|normal)$/);
  expect(indicator.pseudoWidth, 'selected page underline should keep its intended width').toBe('10px');
  expect(indicator.pseudoHeight, 'selected page underline should keep its intended height').toBe('1px');
  expect(indicator.pseudoBackgroundColor, 'selected page underline should use the selected color').toBe(selectedColor);
}

export async function navigateToSecondPageThroughViewerNextButton(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceMarker = `Functional navigation source ${suffix}`;
  const targetMarker = `Functional navigation target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a visible marker on Page 1', async () => {
    await addDescriptionMarker(page, `functional_nav_source_${suffix}`, sourceMarker);
  });

  await test.step('Create a second page with a visible marker', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Open Preview on Page 1', async () => {
    await openPreview(page, SEL.descriptionComponent);
    await expect(page.getByText(sourceMarker, { exact: true }).first(), 'viewer should start on Page 1').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'target page marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Navigate to the second page with the viewer Next button', async () => {
    const next = await visibleViewerNextButton(page);
    await next.scrollIntoViewIfNeeded().catch(() => undefined);
    await next.click({ timeout: 10_000 }).catch(async () => next.dispatchEvent('click'));
    await expect(page.getByText(targetMarker, { exact: true }).first(), `viewer should navigate to ${targetPageName}`).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(sourceMarker, { exact: true }).first(), 'source page marker should be hidden after navigation').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateConditionallyByRadioValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const radioTechnicalId = `functional_nav_radio_${suffix}`;
  const blockedOption = `Functional blocked ${suffix}`;
  const acceptedOption = `Functional accepted ${suffix}`;
  const targetMarker = `Functional conditional target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_conditional_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Radio component with conditional navigation', async () => {
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.radioComponent}:visible`).first(), 'navigation Radio component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, radioTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
    await setPageTabsThroughAppSettings(page, 'footer');
  });

  await test.step('Open Preview and verify the non-matching value does not navigate', async () => {
    await openPreview(page, SEL.radioComponent);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'viewer should start on Page 1 with the Radio visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await expect(
      page.locator(SEL.viewerPageTab),
      'a GoTo condition must not hide its target page from footer navigation before it fires',
    ).toHaveCount(2, { timeout: 30_000 });
    await expectTabActionIcon(page, 'arrow-forward-outline', 'a non-final accessible page should expose Next, not Send');
    await selectViewerRadioOption(page, radioTechnicalId, blockedOption);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'blocked value should keep the source page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'blocked value should not open the target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching value and verify navigation to the target page', async () => {
    await clickViewerRadioOptionForNavigation(page, radioTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted value should open the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'accepted value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
    await expectTabActionIcon(page, 'send-outline', 'only the last accessible page should expose Send');
  });
}

async function expectTabActionIcon(page: Page, expected: string, description: string): Promise<void> {
  const action = page.locator(VIEWER_TAB_ACTION_BUTTON).first();
  await expect(action, description).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(
      () =>
        action.locator('ion-icon').first().evaluate((icon) => {
          const ionic = icon as HTMLElement & { name?: string };
          return ionic.name ?? ionic.getAttribute('name') ?? ionic.getAttribute('ng-reflect-name') ?? '';
        }),
      { message: description, timeout: 15_000 },
    )
    .toBe(expected);
}

/**
 * #1446: unlike GoTo targets, an Authorize target stays absent from SharedTabs
 * until its condition is satisfied, then becomes a reachable page tab.
 */
export async function assertAuthorizedFooterTabAppearsOnlyAfterConditionThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const radioTechnicalId = `functional_authorize_radio_${suffix}`;
  const blockedOption = `Functional authorize blocked ${suffix}`;
  const acceptedOption = `Functional authorize accepted ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page and an Authorize-page Radio condition', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, 'Page 1');
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, radioTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'authorize',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
    await setPageTabsThroughAppSettings(page, 'footer');
  });

  await test.step('Verify the unauthorized page tab is hidden', async () => {
    await openPreview(page, SEL.radioComponent);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'Authorize Radio should render on the source page').toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator(SEL.viewerPageTab),
      'SharedTabs should expose only the source page before authorization',
    ).toHaveCount(1, { timeout: 30_000 });
    await selectViewerRadioOption(page, radioTechnicalId, blockedOption);
    await expect(
      page.locator(SEL.viewerPageTab),
      'a non-matching value should keep the target page unauthorized',
    ).toHaveCount(1, { timeout: 15_000 });
  });

  await test.step('Verify satisfying the condition reveals the authorized page tab', async () => {
    await selectViewerRadioOption(page, radioTechnicalId, acceptedOption);
    await expect(
      page.locator(SEL.viewerPageTab),
      `SharedTabs should reveal ${targetPageName} once the Authorize condition is satisfied`,
    ).toHaveCount(2, { timeout: 30_000 });
  });
}

/** #1481: a newly created page defaults to a hidden title in settings and Preview. */
export async function assertNewPageKeepsApplicationTitleHiddenThroughUi(page: Page): Promise<void> {
  let newPageName = '';
  await test.step('Create a page and verify its Display title default is No', async () => {
    newPageName = await addPageThroughPagesPanel(page);
    await openPageSettingsForPage(page, newPageName);
    const displayTitle = page.locator(`${SEL.pageDisplayTitleToggle}:visible`).first();
    await expect(displayTitle, 'new page settings should expose the Display page title switch').toBeVisible({
      timeout: 15_000,
    });
    await expect(
      displayTitle.locator('button.c8o-btn:visible').nth(1),
      'a newly created page should default Display page title to No',
    ).toHaveClass(/c8o-btn-selected/, { timeout: 10_000 });
    await closePageSettings(page);
    await selectEditorPageByName(page, newPageName);
  });

  await test.step('Verify Preview respects the new page hidden-title default', async () => {
    await openPreview(page, SEL.viewerPage);
    await expectViewerPageTitleHidden(page, newPageName);
  });
}

/** #1488/#1503: footer tabs keep a visible, theme-derived progress indicator. */
export async function assertFooterTabsProgressIndicatorThroughUi(page: Page): Promise<void> {
  await test.step('Create footer navigation and enable the application progress indicator', async () => {
    await addPageThroughPagesPanel(page);
    await setPageTabsThroughAppSettings(page, 'footer');
    await openApplicationSettingsFromSidebar(page);
    const formSettings = page.locator(APPLICATION_FORM_SETTINGS_BUTTON).first();
    await expect(formSettings, 'application settings should expose the Form category').toBeVisible({ timeout: 15_000 });
    await formSettings.click({ timeout: 10_000 }).catch(async () => formSettings.dispatchEvent('click'));
    await selectToggleOption(page, APPLICATION_PROGRESS_INDICATOR_TOGGLE, 0, 'progress indicator');
  });

  await test.step('Verify the progress indicator is rendered with footer tabs', async () => {
    await openPreview(page, VIEWER_PROGRESS_INDICATOR);
    await expect(page.locator(SEL.viewerPageTab), 'footer navigation should render both page tabs').toHaveCount(2, {
      timeout: 30_000,
    });
    const progress = page.locator(VIEWER_PROGRESS_INDICATOR).first();
    await expect(progress, 'footer navigation must not suppress the enabled progress indicator').toBeVisible({
      timeout: 30_000,
    });

    const tabs = page.locator(SEL.viewerPageTab);
    const currentIndex = await selectedSharedTabIndex(tabs);
    const targetIndex = currentIndex === 0 ? 1 : 0;
    await tabs.nth(targetIndex).click({ timeout: 10_000 });
    await expect(tabs.nth(targetIndex), 'page selection should advance the progress indicator state').toHaveClass(
      /tab-selected/,
      { timeout: 15_000 },
    );

    const state = await progressIndicatorVisualState(progress);
    expect(state.height, 'progress indicator should have visible geometry').toBeGreaterThan(0);
    expect(state.progressVariable, 'progress fill should be supplied through the theme-aware CSS variable').toMatch(
      /^rgba?\(/,
    );
    expect(state.trackVariable, 'progress track should be supplied through its theme-aware CSS variable').toMatch(/^rgba?\(/);
    expect(state.progressColor, 'shadow progress fill should resolve the configured progress variable').toBe(
      state.progressVariable,
    );
    expect(state.progressColor, 'progress fill should remain distinguishable from its track').not.toBe(state.trackColor);
    expect(rgbContrastRatio(state.progressColor, state.trackColor), 'progress fill should keep accessible track contrast').toBeGreaterThanOrEqual(
      4.5,
    );
    expect(state.progressColor, 'the theme-derived progress fill should not regress to fixed black').not.toBe('rgb(0, 0, 0)');
  });
}

async function progressIndicatorVisualState(progress: Locator): Promise<{
  height: number;
  progressColor: string;
  progressVariable: string;
  trackColor: string;
  trackVariable: string;
}> {
  return progress.evaluate((host) => {
    const style = getComputedStyle(host);
    const progressPart = host.shadowRoot?.querySelector('.progress, .progress-bar') as HTMLElement | null;
    if (!progressPart) {
      throw new Error('Ionic progress indicator should expose its progress shadow element');
    }
    return {
      height: host.getBoundingClientRect().height,
      progressColor: getComputedStyle(progressPart).backgroundColor,
      progressVariable: style.getPropertyValue('--progress-background').trim(),
      trackColor: style.getPropertyValue('--background').trim(),
      trackVariable: style.getPropertyValue('--background').trim(),
    };
  });
}

function rgbContrastRatio(first: string, second: string): number {
  const luminance = (color: string): number => {
    const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) {
      throw new Error(`Expected an rgb color, received ${color}`);
    }
    const [red, green, blue] = channels.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

export async function navigateConditionallyBySelectValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const selectTechnicalId = `functional_nav_select_${suffix}`;
  const blockedOption = `Functional select blocked ${suffix}`;
  const acceptedOption = `Functional select accepted ${suffix}`;
  const targetMarker = `Functional select target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_select_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Select component with conditional navigation', async () => {
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'navigation Select component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, selectTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: selectTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the non-matching Select value does not navigate', async () => {
    await openPreview(page, SEL.selectComponent);
    await expect(page.locator(`#${selectTechnicalId}`).first(), 'viewer should start on Page 1 with the Select visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'Select target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await selectViewerSelectOption(page, selectTechnicalId, blockedOption);
    await expect(page.locator(`#${selectTechnicalId}`).first(), 'blocked Select value should keep the source page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'blocked Select value should not open the target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching Select value and verify navigation to the target page', async () => {
    await selectViewerSelectOption(page, selectTechnicalId, acceptedOption, true);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted Select value should open the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${selectTechnicalId}`).first(), 'accepted Select value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateConditionallyByCheckboxValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const checkboxTechnicalId = `functional_nav_checkbox_${suffix}`;
  const blockedOption = `Functional checkbox blocked ${suffix}`;
  const acceptedOption = `Functional checkbox accepted ${suffix}`;
  const targetMarker = `Functional checkbox target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_checkbox_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Checkbox component with conditional navigation', async () => {
    await openComponentsPalette(page, PALETTE_ICON.checkbox);
    await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.checkboxComponent}:visible`).first(), 'navigation Checkbox component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.checkboxComponent);
    await setTechnicalId(page, checkboxTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(
      page,
      {
        field: checkboxTechnicalId,
        operator: 'among_following',
        value: acceptedOption,
        action: 'goTo',
        pageName: targetPageName,
      } as Parameters<typeof configureComponentNavigationFilter>[1],
    );
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the non-matching Checkbox value does not navigate', async () => {
    await openPreview(page, SEL.checkboxComponent);
    await expect(page.locator(`#${checkboxTechnicalId}`).first(), 'viewer should start on Page 1 with the Checkbox visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'Checkbox target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await checkViewerCheckboxOption(page, checkboxTechnicalId, blockedOption);
    await expect(page.locator(`#${checkboxTechnicalId}`).first(), 'blocked Checkbox value should keep the source page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'blocked Checkbox value should not open the target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching Checkbox value and verify navigation to the target page', async () => {
    await clickViewerCheckboxOptionForNavigation(page, checkboxTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted Checkbox value should open the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${checkboxTechnicalId}`).first(), 'accepted Checkbox value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateToRenamedPageThroughConditionalRadioThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const radioTechnicalId = `functional_nav_rename_radio_${suffix}`;
  const acceptedOption = `Functional rename accepted ${suffix}`;
  const blockedOption = `Functional rename blocked ${suffix}`;
  const targetMarker = `Functional renamed navigation target ${suffix}`;
  const renamedPageName = `Functional renamed page ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_renamed_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Radio component with conditional navigation to the target page', async () => {
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.radioComponent}:visible`).first(), 'rename navigation Radio component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, radioTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Rename the target page after the navigation rule has been configured', async () => {
    await renamePageFromPagesPanel(page, targetPageName, renamedPageName);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Reopen the Radio navigation config and assert the target follows the renamed page', async () => {
    await openComponentConfig(page, SEL.radioComponent);
    await openConfigTabById(page, 'navigation_tab_selector');
    await expectComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: renamedPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the Radio still navigates to the renamed target page', async () => {
    await openPreview(page, SEL.radioComponent);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'viewer should start on Page 1 with the Radio visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'renamed target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await clickViewerRadioOptionForNavigation(page, radioTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted value should open the renamed target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'accepted value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

async function addDescriptionMarker(page: Page, technicalId: string, text: string): Promise<void> {
  await openComponentsPalette(page, PALETTE_ICON.description);
  const before = await page.locator(SEL.descriptionComponent).count();
  await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
  await expect
    .poll(() => page.locator(SEL.descriptionComponent).count(), {
      message: `Description marker ${technicalId} should be added`,
      timeout: 30_000,
    })
    .toBeGreaterThan(before);
  await openComponentConfig(page, SEL.descriptionComponent);
  await setTechnicalId(page, technicalId);
  await setDescriptionText(page, text);
  await closeComponentConfig(page);
}

async function renamePageFromPagesPanel(page: Page, currentName: string, nextName: string): Promise<void> {
  await openPagesPanel(page);
  const row = page.locator(SEL.pageRow).filter({ hasText: currentName }).first();
  await expect(row, `page row ${currentName} should be visible before renaming`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const editAction = page.locator(SEL.pageEditButton).first();
  if (await editAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await editAction.click({ timeout: 10_000 }).catch(async () => editAction.dispatchEvent('click'));
  } else {
    const rowBox = await row.boundingBox();
    const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
    expect(rowBox, `page row ${currentName} should have a bounding box`).not.toBeNull();
    expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
    if (!rowBox || !panelBox) {
      throw new Error(`Could not locate page edit action for ${currentName}`);
    }
    await page.mouse.click(panelBox.x + panelBox.width - 86, rowBox.y + rowBox.height / 2);
  }

  const input = page.locator(SEL.pageNameInput).first();
  await expect(input, `page settings for ${currentName} should expose the name input`).toBeVisible({
    timeout: 15_000,
  });
  await input.fill(nextName);
  await input.blur();
  await expect(input, 'page name input should keep the renamed value').toHaveValue(nextName, { timeout: 10_000 });
  await closePageSettings(page);
  await openPagesPanel(page);
  await expect(page.locator(SEL.pageRow).filter({ hasText: nextName }).first(), `page row ${nextName} should be listed`).toBeVisible({
    timeout: 15_000,
  });
}

async function selectEditorPageByName(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const pageRow = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(pageRow, `page row ${pageName} should be visible`).toBeVisible({ timeout: 15_000 });
  await pageRow.click({ timeout: 10_000 }).catch(async () => pageRow.dispatchEvent('click'));
  await expect(page.locator('page-editorpage .class1650357059930').first(), `page ${pageName} canvas should be visible`).toBeVisible({
    timeout: 15_000,
  });
}

async function visibleViewerNextButton(page: Page): Promise<Locator> {
  const button = page.locator(VIEWER_NEXT_BUTTON).first();
  await expect(button, 'viewer Next button should be visible').toBeVisible({ timeout: 30_000 });
  return button;
}

async function clickViewerRadioOptionForNavigation(page: Page, technicalId: string, option: string): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Radio ${technicalId} should be visible before navigation`).toBeVisible({ timeout: 30_000 });
  const item = root.locator('ion-item').filter({ hasText: option }).first();
  if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
    return;
  }
  const label = root.getByText(option, { exact: true }).first();
  await expect(label, `viewer Radio option ${option} should be visible before navigation`).toBeVisible({ timeout: 10_000 });
  await label.click({ timeout: 10_000 }).catch(async () => label.dispatchEvent('click'));
}

async function selectViewerSelectOption(
  page: Page,
  technicalId: string,
  option: string,
  navigationExpected = false,
): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Select ${technicalId} should be visible before selecting ${option}`).toBeVisible({
    timeout: 30_000,
  });

  const select = root.locator('ion-select').first();
  await expect(select, `viewer Select ${technicalId} should expose an ion-select`).toBeVisible({ timeout: 10_000 });

  const overlaySelector =
    'ion-select-popover:visible, ion-popover:not(.overlay-hidden):visible, ion-alert:not(.overlay-hidden):visible, .class1599133954837:visible, cdk-virtual-scroll-viewport:visible';
  for (let attempt = 0; attempt < 3; attempt++) {
    await select.scrollIntoViewIfNeeded().catch(() => undefined);
    const box = await select.boundingBox();
    if (box) {
      await page.mouse.click(box.x + Math.max(box.width - 24, 4), box.y + box.height / 2);
    } else {
      await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
    }

    const overlay = page.locator(overlaySelector).filter({ hasText: option }).last();
    if (await overlay.isVisible({ timeout: 15_000 }).catch(() => false)) {
      const roleOption = page.getByRole('radio', { name: option, exact: true }).first();
      const optionLocator = (await roleOption.isVisible({ timeout: 1_000 }).catch(() => false))
        ? roleOption
        : overlay.locator('ion-item, ion-radio, [role="option"], [role="radio"], button').filter({ hasText: option }).first();
      await expect(optionLocator, `viewer Select option ${option} should be visible`).toBeVisible({ timeout: 10_000 });
      await optionLocator.click({ force: true, timeout: 10_000 });
      await expect(overlay, 'viewer Select options overlay should close').toBeHidden({ timeout: 10_000 });
      // A matching option destroys the source page while routing. Do not touch
      // its ion-select locator after the click: Playwright would otherwise
      // wait for an element which is expected to stay detached.
      if (navigationExpected) {
        return;
      }
      const selectValue = await select.evaluate((element) => String((element as HTMLElement & { value?: unknown }).value ?? '')).catch(() => '');
      if (selectValue !== option && (await select.isVisible({ timeout: 1_000 }).catch(() => false))) {
        await select.evaluate((element, value) => {
          const ionSelect = element as HTMLElement & { value?: unknown };
          ionSelect.value = value;
          ionSelect.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
          ionSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
          ionSelect.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
        }, option);
      }
      if (await root.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await expect(root, `viewer Select ${technicalId} should display ${option}`).toContainText(option, { timeout: 10_000 });
      }
      return;
    }

    await page.keyboard.press('Escape').catch(() => undefined);
    await expect(page.locator(overlaySelector), 'stale viewer Select overlay should close before retry')
      .toHaveCount(0, { timeout: 5_000 })
      .catch(() => undefined);
  }

  throw new Error(`viewer Select option ${option} should be visible`);
}

async function clickViewerCheckboxOptionForNavigation(page: Page, technicalId: string, option: string): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Checkbox ${technicalId} should be visible before navigation`).toBeVisible({ timeout: 30_000 });
  const item = root.locator('ion-item').filter({ hasText: option }).first();
  if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
    return;
  }

  const label = root.getByText(option, { exact: true }).first();
  await expect(label, `viewer Checkbox option ${option} should be visible before navigation`).toBeVisible({ timeout: 10_000 });
  await label.click({ timeout: 10_000 }).catch(async () => label.dispatchEvent('click'));
}
