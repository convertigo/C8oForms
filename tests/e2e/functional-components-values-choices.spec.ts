import { test } from '@playwright/test';
import {
  exerciseCheckboxGroupCustomRowsOptionsThroughUi,
  exerciseCheckboxGroupDefaultValuesThroughUi,
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
});
