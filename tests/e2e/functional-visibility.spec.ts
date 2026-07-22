import { test } from '@playwright/test';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  cancelAndConfirmVisibilityModeSwitchThroughUi,
  exerciseAdditionalSimpleVisibilityOperatorsThroughUi,
  exerciseCheckboxVisibilityOperatorsThroughUi,
  exerciseChoiceVisibilityConditionsThroughUi,
  exerciseNumericVisibilityOperatorsThroughUi,
  exerciseTextVisibilityOperatorsThroughUi,
  exerciseVisibilityFieldPickerSearchAndPersistenceThroughUi,
  exerciseVisibilityModesInAuthenticatedViewerThroughUi,
} from './helpers/functional-visibility';

test.describe('No-Code Studio functional visibility contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('VIS-001 - visibility modes in authenticated and anonymous viewers', async ({ page, browser }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    const formId = await createBlankApplicationThroughUi(page);
    await exerciseVisibilityModesInAuthenticatedViewerThroughUi(page, { formId, anonymousBrowser: browser });
  });

  test('VIS-006 - cancel and confirm a Visibility mode change', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await cancelAndConfirmVisibilityModeSwitchThroughUi(page);
  });

  test('VIS-004 - Visibility field picker search and persistence', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseVisibilityFieldPickerSearchAndPersistenceThroughUi(page);
  });

  test('VIS-002 - text visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTextVisibilityOperatorsThroughUi(page);
  });

  test('VIS-002 - additional simple visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseAdditionalSimpleVisibilityOperatorsThroughUi(page);
  });

  test('VIS-002 - numeric visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseNumericVisibilityOperatorsThroughUi(page);
  });

  test('VIS-002 - Checkbox visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxVisibilityOperatorsThroughUi(page);
  });

  test('VIS-005 - Select Radio Date Time and Checkbox group visibility condition values', async ({ page }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseChoiceVisibilityConditionsThroughUi(page);
  });
});
