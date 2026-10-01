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
  verifyDashboardStateSurvivesImportModalAndViewSwitchThroughUi,
  verifyLongApplicationNamePresentationThroughUi,
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

  /**
   * #1444 was reported in 2.2.0-beta271. The selector template region still
   * imposed a fixed 165px height and absolutely positioned its See more
   * control, clipping the lower edge of template cards and overlapping the
   * following content. Fix 194cc8bd disables the fixed height and restores the
   * control to normal flow; it first shipped in 2.2.0-beta278 and was
   * historically QA-validated in 2.2.0-beta282.
   */
  test('APP-002 #1444 - create an application from a fully visible template card', async ({ page }) => {
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

  /**
   * #1442 introduced the direct-search UI in beta262. Its query-chip
   * lifecycle was corrected through beta321, where QA historically validated
   * the final behavior. Runtime validation of this functional owner on current
   * test-nocode is pending.
   */
  test('APP-008 #1442 - search applications by name variants and preserve the committed query', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await searchApplicationsByNameVariantsThroughUi(page);
  });

  test('APP-010 - open an existing application from selector', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await reopenExistingApplicationFromSelectorThroughUi(page);
  });

  /**
   * #1358 was reported in 2.2.0-beta150. Commits 0f4ae709 and b8f2087e
   * replaced the centered overflow with one-line ellipsis plus full-name
   * tooltips in grid and list views; both first shipped and were historically
   * validated in 2.2.0-beta159. Current test-nocode runtime validation remains
   * pending.
   */
  test('APP-012 #1358 - long application names remain identifiable in grid and list views', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await verifyLongApplicationNamePresentationThroughUi(page);
  });

  /**
   * #1440 was reported in 2.2.0-beta256. Commit f2b6cd67 replaced the Import
   * modal action's purple gradient with the resolved primary theme color; it
   * first shipped in 2.2.0-beta257 and was historically QA-validated in
   * 2.2.0-beta262.
   *
   * #1441 was reported in 2.2.0-beta256. Commit b73acff6 stopped the import
   * modal from refreshing the selector (beta257), and commit 2daa686f made
   * grid/list switches update in place (beta292). QA historically validated
   * the complete behavior in beta294. Current test-nocode validation remains
   * pending.
   */
  test('APP-013 #1440 #1441 - import styling and view switches preserve in-progress state', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await verifyDashboardStateSurvivesImportModalAndViewSwitchThroughUi(page);
  });
});
