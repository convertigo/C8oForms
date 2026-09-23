import { test } from './fixtures';
import {
  changeUserLanguageThroughSettings,
  createApplicationFromFirstTemplateThroughUi,
  createBlankApplicationThroughUi,
  createFolderAndValidateTitleThroughUi,
  currentUserLanguageFromSettings,
  deleteApplicationCancelThenConfirmThroughUi,
  duplicateApplicationAndAssertCopyThroughUi,
  expectNoCodeDashboardReady,
  expectStoredStudioLanguage,
  loginWithUsernamePassword,
  moveApplicationIntoFolderAndAssertThroughUi,
  reloadDashboardAndExpectSessionPersists,
  renameApplicationAndAssertPersistenceThroughUi,
  reopenExistingApplicationFromSelectorThroughUi,
  searchApplicationsByNameVariantsThroughUi,
} from './helpers/functional-studio';

// Runs on the worker's shared, already signed-in browser context (./fixtures).
// Tests that need a signed-out context or another identity (login form, logout,
// admin) live in functional-authoring-identity.spec.ts on a fresh context.
test.describe('No-Code Studio functional authoring', () => {
  // Every authoring journey creates an application through the UI and reloads the
  // selector, which costs 60-90s on a loaded CI server. Without a budget these
  // tests die on the 90s global timeout (playwright.config.ts) while an inner
  // 30s poll is still running, and the report blames whatever step was in flight
  // instead of naming the deadline. The two tests below that already declare
  // their own budget keep it - test.setTimeout() overrides this default.
  test.describe.configure({ timeout: 180_000 });

  test('AUTH-003 - keep the session after reloading the dashboard', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await reloadDashboardAndExpectSessionPersists(page);
  });

  test('AUTH-004 - change the user language from Settings', async ({ page }) => {
    await loginWithUsernamePassword(page);
    const originalLanguage = await currentUserLanguageFromSettings(page);
    const targetLanguage = originalLanguage === 'en' ? 'fr' : 'en';

    try {
      await changeUserLanguageThroughSettings(page, targetLanguage);
      await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expectNoCodeDashboardReady(page);
      await expectStoredStudioLanguage(page, targetLanguage);
    } finally {
      await changeUserLanguageThroughSettings(page, originalLanguage);
    }
  });

  test('APP-001 - create a blank application', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
  });

  test('APP-002 - create an application from a template', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await createApplicationFromFirstTemplateThroughUi(page);
  });

  test('APP-003 - create a folder and validate its title', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await createFolderAndValidateTitleThroughUi(page);
  });

  test('APP-004 - rename an application', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await renameApplicationAndAssertPersistenceThroughUi(page);
  });

  test('APP-005 - delete an application with cancel then confirm', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await deleteApplicationCancelThenConfirmThroughUi(page);
  });

  test('APP-006 - duplicate an application', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await duplicateApplicationAndAssertCopyThroughUi(page);
  });

  test('APP-007 - move an application into a folder', async ({ page }) => {
    // The heaviest journey in this file: it creates a folder AND an application,
    // then reloads the selector three times.
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await moveApplicationIntoFolderAndAssertThroughUi(page);
  });

  test('APP-008 - search applications by name variants', async ({ page }) => {
    test.setTimeout(150_000);
    await loginWithUsernamePassword(page);
    await searchApplicationsByNameVariantsThroughUi(page);
  });

  test('APP-010 - open an existing application from selector', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await reopenExistingApplicationFromSelectorThroughUi(page);
  });
});
