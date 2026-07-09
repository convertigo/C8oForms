import { test } from '@playwright/test';
import {
  changeUserLanguageThroughSettings,
  assertSelectorFiltersThroughUi,
  createApplicationFromFirstTemplateThroughUi,
  createBlankApplicationThroughUi,
  createFolderAndValidateTitleThroughUi,
  currentUserLanguageFromSettings,
  deleteApplicationCancelThenConfirmThroughUi,
  duplicateApplicationAndAssertCopyThroughUi,
  expectInvalidUsernamePasswordLoginRejected,
  expectForgottenPasswordModalOpensAndCloses,
  expectNoCodeDashboardReady,
  expectProtectedRouteRedirectsToLogin,
  expectStoredStudioLanguage,
  loginWithUsernamePassword,
  logoutFromNoCodeDashboard,
  moveApplicationIntoFolderAndAssertThroughUi,
  reloadDashboardAndExpectSessionPersists,
  renameApplicationAndAssertPersistenceThroughUi,
  reopenExistingApplicationFromSelectorThroughUi,
  searchApplicationsByNameVariantsThroughUi,
} from './helpers/functional-studio';

test.describe('No-Code Studio functional authoring', () => {
  test('AUTH-001 - log in with the current username/password test user', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await expectNoCodeDashboardReady(page);
  });

  test('AUTH-002 - log out and redirect protected routes to login', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await logoutFromNoCodeDashboard(page);
    await expectProtectedRouteRedirectsToLogin(page);
  });

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

  test('AUTH-005 - reject invalid username/password credentials', async ({ page }) => {
    await expectInvalidUsernamePasswordLoginRejected(page);
  });

  test('AUTH-006 - open and close the forgotten password modal', async ({ page }) => {
    await expectForgottenPasswordModalOpensAndCloses(page);
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
    await loginWithUsernamePassword(page);
    await moveApplicationIntoFolderAndAssertThroughUi(page);
  });

  test('APP-008 - search applications by name variants', async ({ page }) => {
    test.setTimeout(150_000);
    await loginWithUsernamePassword(page);
    await searchApplicationsByNameVariantsThroughUi(page);
  });

  test('APP-009 - selector filters', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await assertSelectorFiltersThroughUi(page);
  });

  test('APP-010 - open an existing application from selector', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await reopenExistingApplicationFromSelectorThroughUi(page);
  });
});
