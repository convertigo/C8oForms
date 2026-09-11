import { test } from '@playwright/test';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  cancelAndConfirmVisibilityModeSwitchThroughUi,
  exerciseVisibilityFieldPickerSearchAndPersistenceThroughUi,
  exerciseVisibilityModesInAuthenticatedViewerThroughUi,
} from './helpers/functional-visibility';

test.describe('No-Code Studio functional visibility modes contract', () => {
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
});
