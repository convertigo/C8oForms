import { test } from '@playwright/test';
import {
  addPageAndNavigateThroughPagesPanel,
  autosaveComponentConfigurationAfterCloseAndReload,
  configurePageButtonsThroughUi,
  deletePageCancelThenConfirmThroughUi,
  duplicatePageAndAssertCopiedContentThroughUi,
  navigateEditorShellSectionsThroughUi,
  openSettingsFromWorkflowsAndKeepSidebarNavigable,
  renamePageWithValidationThroughUi,
  reorderPagesAndAssertPersistenceThroughUi,
  returnHomeAndReopenSameApplicationThroughUi,
} from './helpers/functional-editor';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional editor shell', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('EDT-001 - navigate between Palette, Pages, Workflows, and Settings', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateEditorShellSectionsThroughUi(page);
  });

  test('EDT-002 - open application settings from Workflows', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await openSettingsFromWorkflowsAndKeepSidebarNavigable(page);
  });

  test('EDT-003 - autosave a configuration after close and reload', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await autosaveComponentConfigurationAfterCloseAndReload(page);
  });

  test('EDT-004 - add a page', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await addPageAndNavigateThroughPagesPanel(page);
  });

  test('EDT-005 - rename a page with empty, duplicate, and valid names', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await renamePageWithValidationThroughUi(page);
  });

  test('EDT-006 - delete a page with cancel then confirm', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await deletePageCancelThenConfirmThroughUi(page);
  });

  test('EDT-007 - reorder pages', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await reorderPagesAndAssertPersistenceThroughUi(page);
  });

  test('EDT-008 - duplicate a page', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await duplicatePageAndAssertCopiedContentThroughUi(page);
  });

  test('EDT-009 - configure page buttons', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configurePageButtonsThroughUi(page);
  });

  test('EDT-010 - return home from editor, then reopen', async ({ page }) => {
    test.setTimeout(180_000);
    const title = `Functional return ${Date.now()}`;
    await loginWithUsernamePassword(page);
    const applicationId = await createBlankApplicationThroughUi(page, title);
    await returnHomeAndReopenSameApplicationThroughUi(page, title, applicationId);
  });
});
