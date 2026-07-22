import { expect, test, type Browser, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  addVisibilityCondition,
  cancelVisibilityModeSwitch,
  closeComponentConfig,
  expectVisibilityConditionConfigured,
  fillSourceCompletionSearch,
  getPwaDocument,
  openComponentConfigAt,
  openComponentsPalette,
  openConfigTabById,
  openPreview,
  openVisibilityConditionFieldPicker,
  expectVisibilityModeSelected,
  publishCurrentFormWithPwa,
  selectVisibilityMode,
  setCheckboxDefaultSelected,
  setCheckboxLocalOptions,
  setChoiceDefaultValueText,
  setChoiceLocalOptions,
  setDescriptionText,
  setTechnicalId,
  setTextDefaultValueJavascript,
  sourceCompletionPopover,
  sourceCompletionPopoverState,
  type VisibilityMode,
  type VisibilityOperator,
} from './studio';

const DATE_COMPONENT = 'c8oforms-itemdatetimeviewver';
const TIME_COMPONENT = 'c8oforms-itemtimeviewver';

interface VisibilityModeCase {
  id: string;
  text: string;
  mode: VisibilityMode;
  expectedInAuthenticatedViewer: boolean;
  expectedInAnonymousViewer: boolean;
}

interface VisibilityModeExerciseOptions {
  formId?: string;
  anonymousBrowser?: Browser;
}

export async function exerciseVisibilityModesInAuthenticatedViewerThroughUi(
  page: Page,
  options: VisibilityModeExerciseOptions = {},
): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_vis_mode_source_${suffix}`;
  let anonymousViewerUrl = '';
  const cases: VisibilityModeCase[] = [
    {
      id: `functional_vis_always_${suffix}`,
      text: `Functional visibility always ${suffix}`,
      mode: 'always',
      expectedInAuthenticatedViewer: true,
      expectedInAnonymousViewer: true,
    },
    {
      id: `functional_vis_never_${suffix}`,
      text: `Functional visibility never ${suffix}`,
      mode: 'never',
      expectedInAuthenticatedViewer: false,
      expectedInAnonymousViewer: false,
    },
    {
      id: `functional_vis_auth_${suffix}`,
      text: `Functional visibility authenticated ${suffix}`,
      mode: 'auth_required',
      expectedInAuthenticatedViewer: true,
      expectedInAnonymousViewer: false,
    },
    {
      id: `functional_vis_no_auth_${suffix}`,
      text: `Functional visibility unauthenticated ${suffix}`,
      mode: 'no_auth_required',
      expectedInAuthenticatedViewer: false,
      expectedInAnonymousViewer: true,
    },
    {
      id: `functional_vis_condition_${suffix}`,
      text: `Functional visibility condition ${suffix}`,
      mode: 'condition',
      expectedInAuthenticatedViewer: true,
      expectedInAnonymousViewer: true,
    },
  ];

  await test.step('Create a Text source for conditional visibility', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'visibility source Text input should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, sourceTechnicalId);
    await setTextDefaultValueJavascript(page, "'Alpha'");
    await closeComponentConfig(page);
  });

  await test.step('Create Description targets for each Visibility mode', async () => {
    for (const [index, modeCase] of cases.entries()) {
      await openComponentsPalette(page, PALETTE_ICON.description);
      await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.descriptionComponent}:visible`).nth(index), `${modeCase.id} should be visible before configuration`).toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfigAt(page, SEL.descriptionComponent, index);
      await setTechnicalId(page, modeCase.id);
      await setDescriptionText(page, modeCase.text);
      await openConfigTabById(page, 'visibility_tab_selector');
      if (modeCase.mode === 'condition') {
        await addVisibilityCondition(page, {
          field: sourceTechnicalId,
          operator: 'equals',
          value: 'Alpha',
        });
      } else {
        await selectVisibilityMode(page, modeCase.mode);
        await expectVisibilityModeSelected(page, modeCase.mode);
      }
      await closeComponentConfig(page);
    }
  });

  if (options.formId && options.anonymousBrowser) {
    await test.step('Publish the Visibility modes application as an anonymous PWA', async () => {
      await publishCurrentFormWithPwa(page, 'anonymous');
      const pwa = await waitForVisibilityPwaDocument(page, options.formId!);
      const targetId = visibilityPublishedViewerTargetId(pwa, `published_${options.formId}`);
      anonymousViewerUrl = visibilityStandalonePwaUrl(page, targetId);
    });
  }

  await test.step('Open Preview and assert authenticated viewer visibility modes', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(SEL.viewerPage).first(), 'viewer page should be visible for Visibility modes').toBeVisible({
      timeout: 30_000,
    });

    await expectVisibilityModeMarkers(page, cases, 'authenticated');
  });

  if (anonymousViewerUrl && options.anonymousBrowser) {
    await test.step('Open anonymous published viewer and assert unauthenticated Visibility modes', async () => {
      const context = await options.anonymousBrowser!.newContext();
      try {
        const anonymousPage = await context.newPage();
        await anonymousPage.goto(anonymousViewerUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await acceptRgpdIfVisible(anonymousPage);
        await expect(anonymousPage.locator(SEL.viewerPage), 'anonymous published viewer should render').toBeAttached({
          timeout: 60_000,
        });
        await expect(anonymousPage.locator(SEL.loginPageRoot), 'anonymous published viewer should not require login').toHaveCount(0, {
          timeout: 5_000,
        });
        await expectVisibilityModeMarkers(anonymousPage, cases, 'anonymous');
      } finally {
        await context.close();
      }
    });
  }
}

async function expectVisibilityModeMarkers(
  page: Page,
  cases: VisibilityModeCase[],
  viewerKind: 'authenticated' | 'anonymous',
): Promise<void> {
  for (const modeCase of cases) {
    const expected = viewerKind === 'authenticated' ? modeCase.expectedInAuthenticatedViewer : modeCase.expectedInAnonymousViewer;
    const marker = page.getByText(modeCase.text, { exact: true }).first();
    if (expected) {
      await expect(marker, `${modeCase.mode} marker should be visible in ${viewerKind} viewer`).toBeVisible({
        timeout: 30_000,
      });
    } else {
      await expect(marker, `${modeCase.mode} marker should be hidden in ${viewerKind} viewer`).toBeHidden({
        timeout: 10_000,
      });
    }
  }
}

async function waitForVisibilityPwaDocument(page: Page, formId: string): Promise<Record<string, unknown>> {
  let pwa: Record<string, unknown> | null = null;
  await expect
    .poll(
      async () => {
        pwa = (await getPwaDocument(page, formId)) as Record<string, unknown> | null;
        return pwa ? 'ready' : '';
      },
      {
        message: 'anonymous Visibility PWA document should exist after publication',
        timeout: 120_000,
      },
    )
    .toBe('ready');
  return pwa as Record<string, unknown>;
}

function visibilityPublishedViewerTargetId(pwa: Record<string, unknown>, fallbackPublishedId: string): string {
  if (typeof pwa.targetId === 'string' && pwa.targetId) {
    return pwa.targetId;
  }
  if (typeof pwa.anonymousKey === 'string' && pwa.anonymousKey) {
    return pwa.anonymousKey;
  }
  return fallbackPublishedId;
}

function visibilityStandalonePwaUrl(page: Page, targetId: string): string {
  const url = new URL(page.url());
  const marker = '/DisplayObjects/mobile/';
  const markerIndex = url.pathname.indexOf(marker);
  if (markerIndex >= 0) {
    url.pathname = `${url.pathname.slice(0, markerIndex)}/DisplayObjects/pwas/${targetId}/index.html`;
    url.search = '';
    url.hash = '';
    return url.toString();
  }
  return new URL(`../pwas/${targetId}/index.html`, page.url()).toString();
}

export async function cancelAndConfirmVisibilityModeSwitchThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_vis_cancel_source_${suffix}`;
  const targetTechnicalId = `functional_vis_cancel_target_${suffix}`;
  const targetText = `Functional visibility cancel target ${suffix}`;
  const expectedValue = `Alpha ${suffix}`;

  await test.step('Create a Text source for the Visibility condition', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Visibility cancel source Text input should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, sourceTechnicalId);
    await setTextDefaultValueJavascript(page, `'${expectedValue}'`);
    await closeComponentConfig(page);
  });

  await test.step('Create a Description target with conditional Visibility', async () => {
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.descriptionComponent}:visible`).first(), 'Visibility cancel target should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.descriptionComponent, 0);
    await setTechnicalId(page, targetTechnicalId);
    await setDescriptionText(page, targetText);
    await openConfigTabById(page, 'visibility_tab_selector');
    await addVisibilityCondition(page, {
      field: sourceTechnicalId,
      operator: 'equals',
      value: expectedValue,
    });
    await expectVisibilityModeSelected(page, 'condition');
    await expectVisibilityConditionConfigured(page, sourceTechnicalId, 'equals', expectedValue);
  });

  await test.step('Cancel switching away from conditional Visibility and verify the rule is preserved', async () => {
    await cancelVisibilityModeSwitch(page, 'always');
    await expectVisibilityModeSelected(page, 'condition');
    await expectVisibilityConditionConfigured(page, sourceTechnicalId, 'equals', expectedValue);

    await closeComponentConfig(page);
    await openComponentConfigAt(page, SEL.descriptionComponent, 0);
    await openConfigTabById(page, 'visibility_tab_selector');
    await expectVisibilityModeSelected(page, 'condition');
    await expectVisibilityConditionConfigured(page, sourceTechnicalId, 'equals', expectedValue);
  });

  await test.step('Confirm switching away from conditional Visibility and verify the simple mode is selected', async () => {
    await confirmVisibilityModeSwitch(page, 'never');
    await expectVisibilityModeSelected(page, 'never');
    await expect(page.locator(SEL.visibilityAddConditionButton).first(), 'Visibility condition controls should be hidden after confirmation').toBeHidden({
      timeout: 10_000,
    });
  });
}

export async function exerciseVisibilityFieldPickerSearchAndPersistenceThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceIds = [
    `functional_vis_picker_zulu_${suffix}`,
    `functional_vis_picker_alpha_${suffix}`,
    `functional_vis_picker_target_${suffix}`,
    `functional_vis_picker_mid_${suffix}`,
    `functional_vis_picker_omega_${suffix}`,
  ];
  const targetSourceId = sourceIds[2];
  const targetTechnicalId = `functional_vis_picker_description_${suffix}`;

  await test.step('Create several Text sources for the Visibility field picker', async () => {
    for (const [index, sourceId] of sourceIds.entries()) {
      await openComponentsPalette(page, PALETTE_ICON.textInput);
      await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.textComponent}:visible`).nth(index), `${sourceId} Text input should be visible`).toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfigAt(page, SEL.textComponent, index);
      await setTechnicalId(page, sourceId);
      await closeComponentConfig(page);
    }
  });

  await test.step('Create a Description target and open the Visibility field picker', async () => {
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.descriptionComponent}:visible`).first(), 'Visibility picker target should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.descriptionComponent, 0);
    await setTechnicalId(page, targetTechnicalId);
    await setDescriptionText(page, `Functional visibility picker target ${suffix}`);
    await openConfigTabById(page, 'visibility_tab_selector');
    await openVisibilityConditionFieldPicker(page);
  });

  await test.step('Search and select the expected source in the Visibility field picker', async () => {
    const initialState = await sourceCompletionPopoverState(page);
    expect(initialState.labels.length, 'Visibility field picker should list selectable sources').toBeGreaterThanOrEqual(sourceIds.length);
    const listedSourceIds = initialState.labels.filter((label) => sourceIds.includes(label));
    expect(listedSourceIds, 'Visibility field picker should list the created Text sources in alphabetical order').toEqual(
      [...listedSourceIds].sort((left, right) => left.localeCompare(right)),
    );
    expect(
      initialState.scrollHeight >= initialState.clientHeight,
      'Visibility field picker list should be bounded and scroll-ready',
    ).toBe(true);

    await fillSourceCompletionSearch(page, targetSourceId);
    await expect
      .poll(async () => (await sourceCompletionPopoverState(page)).labels, {
        message: `Visibility field picker search should expose ${targetSourceId}`,
        timeout: 10_000,
      })
      .toContain(targetSourceId);

    const option = sourceCompletionPopover(page).locator('ion-item').filter({ hasText: targetSourceId }).first();
    await expect(option, `Visibility field picker option ${targetSourceId} should be selectable`).toBeVisible({ timeout: 10_000 });
    await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
    await expectVisibilityConditionFieldSelected(page, targetSourceId);
  });

  await test.step('Reopen Visibility configuration and verify the selected field persists', async () => {
    await closeComponentConfig(page);
    await openComponentConfigAt(page, SEL.descriptionComponent, 0);
    await openConfigTabById(page, 'visibility_tab_selector');
    await expectVisibilityConditionFieldSelected(page, targetSourceId);
  });
}

export async function exerciseTextVisibilityOperatorsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const filledSourceId = `functional_vis_operator_text_${suffix}`;
  const emptySourceId = `functional_vis_operator_empty_${suffix}`;
  const sourceValue = `Alpha Beta ${suffix}`;

  const cases: Array<{
    operator: VisibilityOperator;
    field: string;
    visibleValue?: string | string[];
    hiddenField?: string;
    hiddenValue?: string | string[];
  }> = [
    { operator: 'equals', field: filledSourceId, visibleValue: sourceValue, hiddenValue: `Nope ${suffix}` },
    { operator: 'different', field: filledSourceId, visibleValue: `Nope ${suffix}`, hiddenValue: sourceValue },
    { operator: 'contains', field: filledSourceId, visibleValue: 'Beta', hiddenValue: `Nope ${suffix}` },
    {
      operator: 'among_following',
      field: filledSourceId,
      visibleValue: [sourceValue, `Other ${suffix}`],
      hiddenValue: [`Nope ${suffix}`, `Other ${suffix}`],
    },
    { operator: 'is_empty', field: emptySourceId, hiddenField: filledSourceId },
  ];

  const expectedVisibleTexts = cases.map((operatorCase) => `Functional ${operatorCase.operator} visible ${suffix}`);
  const expectedHiddenTexts = cases.map((operatorCase) => `Functional ${operatorCase.operator} hidden ${suffix}`);

  await test.step('Create filled and empty Text sources for Visibility operators', async () => {
    await createTextVisibilitySource(page, 0, filledSourceId, sourceValue);
    await createTextVisibilitySource(page, 1, emptySourceId, '');
  });

  await test.step('Create one visible and one hidden Description target for each text operator', async () => {
    let descriptionIndex = 0;
    for (const [caseIndex, operatorCase] of cases.entries()) {
      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_operator_${operatorCase.operator}_visible_${suffix}`,
        text: expectedVisibleTexts[caseIndex],
        field: operatorCase.field,
        operator: operatorCase.operator,
        value: operatorCase.visibleValue,
      });
      descriptionIndex += 1;

      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_operator_${operatorCase.operator}_hidden_${suffix}`,
        text: expectedHiddenTexts[caseIndex],
        field: operatorCase.hiddenField ?? operatorCase.field,
        operator: operatorCase.operator,
        value: operatorCase.hiddenValue,
      });
      descriptionIndex += 1;
    }
  });

  await test.step('Open Preview and verify every text operator shows and hides as expected', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(SEL.viewerPage).first(), 'viewer page should be visible for Visibility operator checks').toBeVisible({
      timeout: 30_000,
    });

    for (const text of expectedVisibleTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be visible`).toBeVisible({ timeout: 30_000 });
    }
    for (const text of expectedHiddenTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be hidden`).toBeHidden({ timeout: 10_000 });
    }
  });
}

export async function exerciseAdditionalSimpleVisibilityOperatorsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const filledSourceId = `functional_vis_simple_filled_${suffix}`;
  const emptySourceId = `functional_vis_simple_empty_${suffix}`;
  const sourceValue = `Alpha Beta ${suffix}`;

  const cases: Array<{
    operator: VisibilityOperator;
    visibleField: string;
    hiddenField: string;
    visibleValue?: string;
    hiddenValue?: string;
  }> = [
    {
      operator: 'not_contains',
      visibleField: filledSourceId,
      hiddenField: filledSourceId,
      visibleValue: `Nope ${suffix}`,
      hiddenValue: 'Beta',
    },
    {
      operator: 'is_filled',
      visibleField: filledSourceId,
      hiddenField: emptySourceId,
    },
  ];

  const expectedVisibleTexts = cases.map((operatorCase) => `Functional ${operatorCase.operator} additional visible ${suffix}`);
  const expectedHiddenTexts = cases.map((operatorCase) => `Functional ${operatorCase.operator} additional hidden ${suffix}`);

  await test.step('Create filled and empty Text sources for additional Visibility operators', async () => {
    await createTextVisibilitySource(page, 0, filledSourceId, sourceValue);
    await createTextVisibilitySource(page, 1, emptySourceId, '');
  });

  await test.step('Create one visible and one hidden Description target for each additional operator', async () => {
    let descriptionIndex = 0;
    for (const [caseIndex, operatorCase] of cases.entries()) {
      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_additional_${operatorCase.operator}_visible_${suffix}`,
        text: expectedVisibleTexts[caseIndex],
        field: operatorCase.visibleField,
        operator: operatorCase.operator,
        value: operatorCase.visibleValue,
      });
      descriptionIndex += 1;

      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_additional_${operatorCase.operator}_hidden_${suffix}`,
        text: expectedHiddenTexts[caseIndex],
        field: operatorCase.hiddenField,
        operator: operatorCase.operator,
        value: operatorCase.hiddenValue,
      });
      descriptionIndex += 1;
    }
  });

  await test.step('Open Preview and verify additional simple operators show and hide as expected', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(SEL.viewerPage).first(), 'viewer page should be visible for additional Visibility operator checks').toBeVisible({
      timeout: 30_000,
    });

    for (const text of expectedVisibleTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be visible`).toBeVisible({ timeout: 30_000 });
    }
    for (const text of expectedHiddenTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be hidden`).toBeHidden({ timeout: 10_000 });
    }
  });
}

export async function exerciseNumericVisibilityOperatorsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const numericSourceId = `functional_vis_numeric_${suffix}`;
  const sourceValue = '5';

  const cases: Array<{
    operator: VisibilityOperator;
    visibleValue: string;
    hiddenValue: string;
  }> = [
    { operator: 'greater', visibleValue: '3', hiddenValue: '8' },
    { operator: 'greaterequals', visibleValue: '5', hiddenValue: '6' },
    { operator: 'minus', visibleValue: '10', hiddenValue: '4' },
    { operator: 'minusequals', visibleValue: '5', hiddenValue: '4' },
  ];

  const expectedVisibleTexts = cases.map((operatorCase) => `Functional numeric ${operatorCase.operator} visible ${suffix}`);
  const expectedHiddenTexts = cases.map((operatorCase) => `Functional numeric ${operatorCase.operator} hidden ${suffix}`);

  await test.step('Create a numeric Text source for numeric Visibility operators', async () => {
    await createTextVisibilitySource(page, 0, numericSourceId, sourceValue);
  });

  await test.step('Create one visible and one hidden Description target for each numeric operator', async () => {
    let descriptionIndex = 0;
    for (const [caseIndex, operatorCase] of cases.entries()) {
      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_numeric_${operatorCase.operator}_visible_${suffix}`,
        text: expectedVisibleTexts[caseIndex],
        field: numericSourceId,
        operator: operatorCase.operator,
        value: operatorCase.visibleValue,
      });
      descriptionIndex += 1;

      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_numeric_${operatorCase.operator}_hidden_${suffix}`,
        text: expectedHiddenTexts[caseIndex],
        field: numericSourceId,
        operator: operatorCase.operator,
        value: operatorCase.hiddenValue,
      });
      descriptionIndex += 1;
    }
  });

  await test.step('Open Preview and verify numeric operators show and hide as expected', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(SEL.viewerPage).first(), 'viewer page should be visible for numeric Visibility operator checks').toBeVisible({
      timeout: 30_000,
    });

    for (const text of expectedVisibleTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be visible`).toBeVisible({ timeout: 30_000 });
    }
    for (const text of expectedHiddenTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be hidden`).toBeHidden({ timeout: 10_000 });
    }
  });
}

export async function exerciseCheckboxVisibilityOperatorsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const filledSourceId = `functional_vis_checkbox_filled_${suffix}`;
  const emptySourceId = `functional_vis_checkbox_empty_${suffix}`;
  const alpha = `Functional checkbox Alpha ${suffix}`;
  const beta = `Functional checkbox Beta ${suffix}`;
  const gamma = `Functional checkbox Gamma ${suffix}`;

  const cases: Array<{
    operator: VisibilityOperator;
    visibleField: string;
    hiddenField: string;
    visibleValue?: string[];
    hiddenValue?: string[];
  }> = [
    { operator: 'equals', visibleField: filledSourceId, hiddenField: filledSourceId, visibleValue: [alpha], hiddenValue: [beta] },
    { operator: 'different', visibleField: filledSourceId, hiddenField: filledSourceId, visibleValue: [beta], hiddenValue: [alpha] },
    {
      operator: 'among_following',
      visibleField: filledSourceId,
      hiddenField: filledSourceId,
      visibleValue: [alpha, gamma],
      hiddenValue: [beta, gamma],
    },
    {
      operator: 'out_following',
      visibleField: filledSourceId,
      hiddenField: filledSourceId,
      visibleValue: [beta, gamma],
      hiddenValue: [alpha, gamma],
    },
    { operator: 'is_filled', visibleField: filledSourceId, hiddenField: emptySourceId },
    { operator: 'is_empty', visibleField: emptySourceId, hiddenField: filledSourceId },
  ];

  const expectedVisibleTexts = cases.map((operatorCase) => `Functional checkbox ${operatorCase.operator} visible ${suffix}`);
  const expectedHiddenTexts = cases.map((operatorCase) => `Functional checkbox ${operatorCase.operator} hidden ${suffix}`);

  await test.step('Create filled and empty Checkbox sources for multi-value Visibility operators', async () => {
    await createCheckboxVisibilitySource(page, 0, filledSourceId, [alpha, beta, gamma], 0);
    await createCheckboxVisibilitySource(page, 1, emptySourceId, [alpha, beta, gamma]);
  });

  await test.step('Create one visible and one hidden Description target for each Checkbox operator', async () => {
    let descriptionIndex = 0;
    for (const [caseIndex, operatorCase] of cases.entries()) {
      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_checkbox_${operatorCase.operator}_visible_${suffix}`,
        text: expectedVisibleTexts[caseIndex],
        field: operatorCase.visibleField,
        operator: operatorCase.operator,
        value: operatorCase.visibleValue,
      });
      descriptionIndex += 1;

      await createDescriptionVisibilityTarget(page, {
        index: descriptionIndex,
        technicalId: `functional_vis_checkbox_${operatorCase.operator}_hidden_${suffix}`,
        text: expectedHiddenTexts[caseIndex],
        field: operatorCase.hiddenField,
        operator: operatorCase.operator,
        value: operatorCase.hiddenValue,
      });
      descriptionIndex += 1;
    }
  });

  await test.step('Open Preview and verify Checkbox operators show and hide as expected', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(SEL.viewerPage).first(), 'viewer page should be visible for Checkbox Visibility operator checks').toBeVisible({
      timeout: 30_000,
    });

    for (const text of expectedVisibleTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be visible`).toBeVisible({ timeout: 30_000 });
    }
    for (const text of expectedHiddenTexts) {
      await expect(page.getByText(text, { exact: true }).first(), `${text} should be hidden`).toBeHidden({ timeout: 10_000 });
    }
  });
}

export async function exerciseChoiceVisibilityConditionsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const selectSourceId = `functional_vis_select_source_${suffix}`;
  const radioSourceId = `functional_vis_radio_source_${suffix}`;
  const dateSourceId = `functional_vis_date_source_${suffix}`;
  const timeSourceId = `functional_vis_time_source_${suffix}`;
  const checkboxGroupSourceId = `functional_vis_checkbox_group_source_${suffix}`;
  const selectValue = `Functional select match ${suffix}`;
  const selectOtherValue = `Functional select other ${suffix}`;
  const radioValue = `Functional radio match ${suffix}`;
  const radioOtherValue = `Functional radio other ${suffix}`;
  const dateValue = '2026-07-14';
  const dateOtherValue = '2026-08-15';
  const timeValue = '09:45';
  const timeOtherValue = '10:30';
  const checkboxGroupDefaultValue = '{"Line 1":["Option 1"],"Line 2":["Option 2"]}';
  const checkboxGroupValue = ['Line 1_Option 1', 'Line 2_Option 2'];
  const checkboxGroupOtherValue = ['Line 1_Option 2'];
  const visibleSelectText = `Functional visibility select visible ${suffix}`;
  const hiddenSelectText = `Functional visibility select hidden ${suffix}`;
  const visibleRadioText = `Functional visibility radio visible ${suffix}`;
  const hiddenRadioText = `Functional visibility radio hidden ${suffix}`;
  const visibleDateText = `Functional visibility date visible ${suffix}`;
  const hiddenDateText = `Functional visibility date hidden ${suffix}`;
  const visibleTimeText = `Functional visibility time visible ${suffix}`;
  const hiddenTimeText = `Functional visibility time hidden ${suffix}`;
  const visibleCheckboxGroupText = `Functional visibility checkbox group visible ${suffix}`;
  const hiddenCheckboxGroupText = `Functional visibility checkbox group hidden ${suffix}`;

  await test.step('Create Select, Radio, Date, Time, and Checkbox group sources with default values', async () => {
    await createChoiceVisibilitySource(page, {
      icon: PALETTE_ICON.select,
      selector: SEL.selectComponent,
      index: 0,
      technicalId: selectSourceId,
      options: [selectValue, selectOtherValue],
      defaultValue: selectValue,
    });
    await createChoiceVisibilitySource(page, {
      icon: PALETTE_ICON.radio,
      selector: SEL.radioComponent,
      index: 0,
      technicalId: radioSourceId,
      options: [radioValue, radioOtherValue],
      defaultValue: radioValue,
    });
    await createDefaultValueVisibilitySource(page, {
      icon: PALETTE_ICON.date,
      selector: DATE_COMPONENT,
      index: 0,
      technicalId: dateSourceId,
      defaultValue: dateValue,
    });
    await createDefaultValueVisibilitySource(page, {
      icon: PALETTE_ICON.time,
      selector: TIME_COMPONENT,
      index: 0,
      technicalId: timeSourceId,
      defaultValue: timeValue,
    });
    await createDefaultValueVisibilitySource(page, {
      icon: PALETTE_ICON.checkboxGroup,
      selector: SEL.checkboxGroupComponent,
      index: 0,
      technicalId: checkboxGroupSourceId,
      defaultValue: checkboxGroupDefaultValue,
    });
  });

  await test.step('Create visible and hidden Description targets for choice, Date, Time, and Checkbox group conditions', async () => {
    await createDescriptionVisibilityTarget(page, {
      index: 0,
      technicalId: `functional_vis_select_visible_${suffix}`,
      text: visibleSelectText,
      field: selectSourceId,
      operator: 'equals',
      value: selectValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 1,
      technicalId: `functional_vis_select_hidden_${suffix}`,
      text: hiddenSelectText,
      field: selectSourceId,
      operator: 'equals',
      value: selectOtherValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 2,
      technicalId: `functional_vis_radio_visible_${suffix}`,
      text: visibleRadioText,
      field: radioSourceId,
      operator: 'equals',
      value: radioValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 3,
      technicalId: `functional_vis_radio_hidden_${suffix}`,
      text: hiddenRadioText,
      field: radioSourceId,
      operator: 'equals',
      value: radioOtherValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 4,
      technicalId: `functional_vis_date_visible_${suffix}`,
      text: visibleDateText,
      field: dateSourceId,
      operator: 'equals',
      value: dateValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 5,
      technicalId: `functional_vis_date_hidden_${suffix}`,
      text: hiddenDateText,
      field: dateSourceId,
      operator: 'equals',
      value: dateOtherValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 6,
      technicalId: `functional_vis_time_visible_${suffix}`,
      text: visibleTimeText,
      field: timeSourceId,
      operator: 'equals',
      value: timeValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 7,
      technicalId: `functional_vis_time_hidden_${suffix}`,
      text: hiddenTimeText,
      field: timeSourceId,
      operator: 'equals',
      value: timeOtherValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 8,
      technicalId: `functional_vis_checkbox_group_visible_${suffix}`,
      text: visibleCheckboxGroupText,
      field: checkboxGroupSourceId,
      operator: 'equals',
      value: checkboxGroupValue,
    });
    await createDescriptionVisibilityTarget(page, {
      index: 9,
      technicalId: `functional_vis_checkbox_group_hidden_${suffix}`,
      text: hiddenCheckboxGroupText,
      field: checkboxGroupSourceId,
      operator: 'equals',
      value: checkboxGroupOtherValue,
    });
  });

  await test.step('Open Preview and verify choice, Date, Time, and Checkbox group Visibility conditions', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(SEL.viewerPage).first(), 'viewer page should be visible for choice Visibility checks').toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByText(visibleSelectText, { exact: true }).first(), 'Select matching condition should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(hiddenSelectText, { exact: true }).first(), 'Select non-matching condition should be hidden').toBeHidden({
      timeout: 10_000,
    });
    await expect(page.getByText(visibleRadioText, { exact: true }).first(), 'Radio matching condition should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(hiddenRadioText, { exact: true }).first(), 'Radio non-matching condition should be hidden').toBeHidden({
      timeout: 10_000,
    });
    await expect(page.getByText(visibleDateText, { exact: true }).first(), 'Date matching condition should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(hiddenDateText, { exact: true }).first(), 'Date non-matching condition should be hidden').toBeHidden({
      timeout: 10_000,
    });
    await expect(page.getByText(visibleTimeText, { exact: true }).first(), 'Time matching condition should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(hiddenTimeText, { exact: true }).first(), 'Time non-matching condition should be hidden').toBeHidden({
      timeout: 10_000,
    });
    await expect(
      page.getByText(visibleCheckboxGroupText, { exact: true }).first(),
      'Checkbox group matching condition should be visible',
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText(hiddenCheckboxGroupText, { exact: true }).first(),
      'Checkbox group non-matching condition should be hidden',
    ).toBeHidden({
      timeout: 10_000,
    });
  });
}

async function expectVisibilityConditionFieldSelected(page: Page, fieldTechnicalId: string): Promise<void> {
  await expect(page.locator(SEL.visibilityAddConditionButton).first(), 'visibility condition controls should remain visible').toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(SEL.conditionFieldInput).first(), 'visibility condition field should remain configured').toHaveValue(
    fieldTechnicalId,
    { timeout: 10_000 },
  );
}

async function createChoiceVisibilitySource(
  page: Page,
  spec: {
    icon: string;
    selector: string;
    index: number;
    technicalId: string;
    options: string[];
    defaultValue: string;
  },
): Promise<void> {
  await openComponentsPalette(page, spec.icon);
  await addComponent(page, spec.icon, { allowEditorApiFallback: false });
  await expect(page.locator(`${spec.selector}:visible`).nth(spec.index), `${spec.technicalId} choice source should be visible`).toBeVisible({
    timeout: 30_000,
  });
  await openComponentConfigAt(page, spec.selector, spec.index);
  await setTechnicalId(page, spec.technicalId);
  await setChoiceLocalOptions(page, spec.options);
  await setChoiceDefaultValueText(page, spec.defaultValue);
  await closeComponentConfig(page);
}

async function createDefaultValueVisibilitySource(
  page: Page,
  spec: {
    icon: string;
    selector: string;
    index: number;
    technicalId: string;
    defaultValue: string;
  },
): Promise<void> {
  await openComponentsPalette(page, spec.icon);
  await addComponent(page, spec.icon, { allowEditorApiFallback: false });
  await expect(page.locator(`${spec.selector}:visible`).nth(spec.index), `${spec.technicalId} default-value source should be visible`).toBeVisible({
    timeout: 30_000,
  });
  await openComponentConfigAt(page, spec.selector, spec.index);
  await setTechnicalId(page, spec.technicalId);
  await setChoiceDefaultValueText(page, spec.defaultValue);
  await closeComponentConfig(page);
}

async function createCheckboxVisibilitySource(
  page: Page,
  index: number,
  technicalId: string,
  options: string[],
  defaultSelectedIndex?: number,
): Promise<void> {
  await openComponentsPalette(page, PALETTE_ICON.checkbox);
  await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });
  await expect(page.locator(`${SEL.checkboxComponent}:visible`).nth(index), `${technicalId} Checkbox source should be visible`).toBeVisible({
    timeout: 30_000,
  });
  await openComponentConfigAt(page, SEL.checkboxComponent, index);
  await setTechnicalId(page, technicalId);
  await setCheckboxLocalOptions(page, options);
  if (defaultSelectedIndex != null) {
    await setCheckboxDefaultSelected(page, defaultSelectedIndex);
  }
  await closeComponentConfig(page);
}

async function createTextVisibilitySource(page: Page, index: number, technicalId: string, defaultValue: string): Promise<void> {
  await openComponentsPalette(page, PALETTE_ICON.textInput);
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await expect(page.locator(`${SEL.textComponent}:visible`).nth(index), `${technicalId} Text input should be visible`).toBeVisible({
    timeout: 30_000,
  });
  await openComponentConfigAt(page, SEL.textComponent, index);
  await setTechnicalId(page, technicalId);
  await setTextDefaultValueJavascript(page, JSON.stringify(defaultValue));
  await closeComponentConfig(page);
}

async function createDescriptionVisibilityTarget(
  page: Page,
  spec: {
    index: number;
    technicalId: string;
    text: string;
    field: string;
    operator: VisibilityOperator;
    value?: string | string[];
  },
): Promise<void> {
  await openComponentsPalette(page, PALETTE_ICON.description);
  await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
  await expect(page.locator(`${SEL.descriptionComponent}:visible`).nth(spec.index), `${spec.technicalId} should be visible before configuration`).toBeVisible({
    timeout: 30_000,
  });
  await openComponentConfigAt(page, SEL.descriptionComponent, spec.index);
  await setTechnicalId(page, spec.technicalId);
  await setDescriptionText(page, spec.text);
  await openConfigTabById(page, 'visibility_tab_selector');
  await addVisibilityCondition(page, {
    field: spec.field,
    operator: spec.operator,
    value: spec.value,
  });
  await closeComponentConfig(page);
}

async function confirmVisibilityModeSwitch(page: Page, targetMode: Exclude<VisibilityMode, 'condition'>): Promise<void> {
  await selectVisibilityMode(page, targetMode);
  const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
  await expect(alert, 'switching away from conditional Visibility should ask for confirmation').toBeVisible({
    timeout: 10_000,
  });

  const confirm = alert.locator('button.alert-button-role-confirm, button.btn--primary, button.alert-button').last();
  await expect(confirm, 'Visibility mode switch confirmation should expose a confirm button').toBeVisible({
    timeout: 10_000,
  });
  await confirm.click({ timeout: 5_000 }).catch(async () => confirm.dispatchEvent('click'));
  await expect(alert, 'Visibility mode switch confirmation should close after Confirm').toBeHidden({
    timeout: 10_000,
  });
  await page.waitForTimeout(800);
}
