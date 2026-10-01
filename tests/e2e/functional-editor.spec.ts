import { test } from './fixtures';
import {
  addPageAndNavigateThroughPagesPanel,
  assertPageAndApplicationSettingsIconsAreDisabledThroughUi,
  autosaveComponentConfigurationAfterCloseAndReload,
  configurePageButtonsThroughUi,
  deletePageCancelThenConfirmThroughUi,
  duplicatePageAndAssertCopiedContentThroughUi,
  keepLastWorkflowFullyVisibleAfterScrollThroughUi,
  navigateEditorShellSectionsThroughUi,
  openOnePageIconPickerAfterRapidClicksThroughUi,
  openSettingsFromWorkflowsAndKeepSidebarNavigable,
  renamePageWithValidationThroughUi,
  reorderPagesAndAssertPersistenceThroughUi,
  returnHomeAndReopenSameApplicationThroughUi,
  verifyEditableWorkflowAffordancesThroughUi,
} from './helpers/functional-editor';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional editor shell', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  // #1271: every sidebar affordance keeps its own localized native title.
  test('EDT-001 #1271 - navigate between Palette, Pages, Workflows, and Settings', async ({ page }) => {
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

  // #1308: cover both upward and downward page moves without duplicate rows.
  test('EDT-007 - reorder pages', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await reorderPagesAndAssertPersistenceThroughUi(page);
  });

  /**
   * #1360 was reported in 2.2.0-beta150. Commit 6659d695 added full-page
   * duplication in 2.2.0-beta191 and e006e57d aligned its icon in
   * 2.2.0-beta198, where QA historically validated the complete journey.
   * Current test-nocode runtime validation remains pending.
   */
  test('EDT-008 #1360 - duplicate a page', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await duplicatePageAndAssertCopiedContentThroughUi(page);
  });

  // #1282: standard page buttons stay in the lower editor canvas, while tabs keep their tab roles.
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

  // #1297: the asynchronous page-icon action is guarded before modal creation.
  test('EDT-013 #1297 - rapid page icon clicks open one picker modal', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await openOnePageIconPickerAfterRapidClicksThroughUi(page);
  });

  /**
   * #1361 was reported in 2.2.0-beta150. Commit 2795de4e made the Workflows
   * flex child the scroll container and constrained its parent, first shipped
   * in beta152; QA historically validated the fix in beta153. Current
   * test-nocode runtime validation remains pending.
   */
  test('EDT-014 #1361 - keep the last workflow fully visible after scrolling', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await keepLastWorkflowFullyVisibleAfterScrollThroughUi(page);
  });

  /**
   * #1321 was reported in 2.2.0-beta124. Commit 9e7b3600 disabled the Page
   * settings icon and capitalized the English/Spanish Disabled labels, first
   * released in beta150. After the application icon was reported in beta153,
   * 7c7af6a8 disabled it too; QA validated the complete fix in beta155.
   * Current runtime validation remains pending.
   */
  test('EDT-015 #1321 - Page and Application settings icons are decorative disabled controls', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertPageAndApplicationSettingsIconsAreDisabledThroughUi(page);
  });

  /**
   * #1372/#1373 were reported in 2.2.0-beta158. The workflow-list edit
   * controls were introduced by a8045bdf and made hover-driven by a596827c;
   * 0a8dc450 then closed stale rename settings when changing workflows.
   * 30596546/4ea3057b added editable-header hover feedback while excluding
   * Formula and Triggered on submission. The fixes first shipped across
   * beta164-beta169; QA historically validated #1373 in beta167 and the full
   * #1372 journey in beta186. Current runtime validation remains pending.
   */
  test('EDT-016 #1372 #1373 - only user workflows expose edit and hover affordances', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await verifyEditableWorkflowAffordancesThroughUi(page);
  });
});
