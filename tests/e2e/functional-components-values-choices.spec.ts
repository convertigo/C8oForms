import { test } from './fixtures';
import {
  exerciseCheckboxGroupCustomRowsOptionsThroughUi,
  exerciseCheckboxGroupDefaultValuesThroughUi,
  exerciseChoiceAddControlsStayVisibleThroughUi,
  exerciseChoiceGroupLineColumnAddControlsStayVisibleThroughUi,
  exerciseCheckboxLocalOptionsThroughUi,
  exerciseRadioGroupCustomRowsOptionsThroughUi,
  exerciseRadioGroupDefaultValuesThroughUi,
  exerciseRadioLocalOptionsThroughUi,
  exerciseSelectLocalOptionsSearchAndDropdownThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional choice component values', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-CHECK-001 - Checkbox local options default selection and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxLocalOptionsThroughUi(page);
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

  /**
   * #1274: reported while beta104 was current, fixed by c3f102a1 in beta107
   * and historically validated in beta107. The Ionic wrapper must remain
   * display: contents so headers and radio cells share the same table columns.
   */
  test('CMP-RADIOGROUP-001 #1274 - Radio group custom rows, options and alignment', async ({ page }) => {
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

  /**
   * #1285: reported in beta104. Group Line/Column controls were corrected in beta202;
   * Checkbox/Radio/Select followed in beta203; QA validated beta204.
   */
  test('CMP-CHOICE-001 #1285 - local option Add controls stay visible', async ({ page }) => {
    test.setTimeout(480_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseChoiceAddControlsStayVisibleThroughUi(page);
  });

  test('CMP-CHECKGROUP-003 #1285 - Line and Column Add controls stay visible', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseChoiceGroupLineColumnAddControlsStayVisibleThroughUi(page);
  });
});
