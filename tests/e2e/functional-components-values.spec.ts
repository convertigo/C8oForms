import { test } from '@playwright/test';
import {
  exerciseBusinessLogicDynamicFieldFormulaThroughUi,
  exerciseBusinessLogicFormulaSourceThroughUi,
  exerciseButtonLabelIconRenderingThroughUi,
  exerciseButtonStateConditionAndWorkflowThroughUi,
  exerciseCheckboxBaserowSourceThroughUi,
  exerciseCheckboxBaserowSourceConfigurationThroughUi,
  exerciseCheckboxGroupCustomRowsOptionsThroughUi,
  exerciseCheckboxGroupDefaultValuesThroughUi,
  exerciseCheckboxLocalOptionsThroughUi,
  exerciseDateDefaultBoundsFormatAndSubmitThroughUi,
  exerciseDescriptionRichTextAndSourcePaletteThroughUi,
  exerciseMapConfiguredHeightRenderingThroughUi,
  exerciseMapHeightResetThroughUi,
  exerciseRadioGroupCustomRowsOptionsThroughUi,
  exerciseRadioGroupDefaultValuesThroughUi,
  exerciseRadioLocalOptionsThroughUi,
  exerciseSelectLocalOptionsSearchAndDropdownThroughUi,
  exerciseSliderBoundsLabelsAndViewerValueThroughUi,
  exerciseDateAlternateDisplayFormatThroughUi,
  exerciseTextInputAdvancedDefaultValuesThroughUi,
  exerciseTextInputCoreBehaviorThroughUi,
  exerciseTimeAlternateDisplayFormatThroughUi,
  exerciseTimeDefaultFormatInputAndSubmitThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional component values', () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-TEXT-001 - Text input label placeholder required default input and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTextInputCoreBehaviorThroughUi(page);
  });

  test('CMP-TEXT-002 - Text input advanced default values and source expressions', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTextInputAdvancedDefaultValuesThroughUi(page);
  });

  test('CMP-DESC-001 - Description rich text source palette and rendering', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDescriptionRichTextAndSourcePaletteThroughUi(page);
  });

  test('CMP-CHECK-001 - Checkbox local options default selection and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxLocalOptionsThroughUi(page);
  });

  test('CMP-CHECK-002 - Checkbox Baserow source configuration persists', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxBaserowSourceConfigurationThroughUi(page);
  });

  test('CMP-CHECK-002 - Checkbox Baserow visible labels and multi-selection', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxBaserowSourceThroughUi(page);
  });

  test('CMP-RADIO-001 - Radio local options default exclusive selection and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseRadioLocalOptionsThroughUi(page);
  });

  test('CMP-CHECKGROUP-001 - Checkbox group visual text and JavaScript default values', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxGroupDefaultValuesThroughUi(page);
  });

  test('CMP-CHECKGROUP-001 - Checkbox group custom rows and options', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxGroupCustomRowsOptionsThroughUi(page);
  });

  test('CMP-RADIOGROUP-001 - Radio group visual text and JavaScript default values', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseRadioGroupDefaultValuesThroughUi(page);
  });

  test('CMP-RADIOGROUP-001 - Radio group custom rows and options', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseRadioGroupCustomRowsOptionsThroughUi(page);
  });

  test('CMP-SELECT-001 - Select local options default and dropdown sizing', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseSelectLocalOptionsSearchAndDropdownThroughUi(page);
  });

  test('CMP-SLIDER-001 - Slider bounds labels and viewer value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseSliderBoundsLabelsAndViewerValueThroughUi(page);
  });

  test('CMP-DATE-001 - Date default bounds format and submission', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDateDefaultBoundsFormatAndSubmitThroughUi(page);
  });

  test('CMP-DATE-001 - Date alternate display format persistence', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDateAlternateDisplayFormatThroughUi(page);
  });

  test.fixme('CMP-DATE-001 - Date alternate display format runtime rendering contract', async () => {
    // Requires a product contract: current exploration persisted YYYY/MM/DD but rendered DD/MM/YYYY in the viewer.
  });

  test('CMP-TIME-001 - Time default format input and submission', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTimeDefaultFormatInputAndSubmitThroughUi(page);
  });

  test('CMP-TIME-001 - Time alternate display format persistence', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTimeAlternateDisplayFormatThroughUi(page);
  });

  test.fixme('CMP-TIME-001 - Time alternate display format runtime rendering contract', async () => {
    // Requires a product contract: current exploration persisted hh:mm:ss:A but opened a 24-hour viewer picker.
  });

  test('CMP-BUTTON-001 - Button labels icons and rendering', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseButtonLabelIconRenderingThroughUi(page);
  });

  test('CMP-BUTTON-002 - Button conditional enabled state and workflow', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseButtonStateConditionAndWorkflowThroughUi(page);
  });

  test('CMP-MAP-001 - Map configured height and editor viewer rendering', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseMapConfiguredHeightRenderingThroughUi(page);
  });

  test('CMP-MAP-001 - Map height reset persists after reopening', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseMapHeightResetThroughUi(page);
  });

  test('CMP-BIZ-001 - Business logic formula source and viewer evaluation', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseBusinessLogicFormulaSourceThroughUi(page);
  });

  test('CMP-BIZ-001 - Business logic dynamic field formula refresh', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseBusinessLogicDynamicFieldFormulaThroughUi(page);
  });
});
