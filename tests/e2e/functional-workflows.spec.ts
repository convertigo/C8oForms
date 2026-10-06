import { test } from './fixtures';
import {
  addToastActionToButtonWorkflowThroughUi,
  configureBaserowAddRowAndVerifyCreatedRowThroughUi,
  configureIfActionModesWithTextSourceThroughUi,
  configureLoopActionIteratorThroughUi,
  configureMailActionAndVerifyPersistenceThroughUi,
  configureResetFieldsActionAndVerifyComponentScopeThroughUi,
  configureSubmitActionAndVerifyRequiredValidationThroughUi,
  configureToastActionAndVerifyViewerToastThroughUi,
  verifyButtonFlowNamesRemainUniqueAfterComponentRecreationThroughUi,
  verifyBaserowAddRowMappingCanBeDeletedThroughUi,
  verifyNavigateToPageGoBackUsesViewerHistoryThroughUi,
  verifyConfiguredActionReplacementWarningThroughUi,
  verifyWorkflowPersistenceAfterReloadThroughUi,
  verifyGenericTaskChangesOnlyNamedStoredResponseFieldThroughUi,
} from './helpers/functional-workflows';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional workflow contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('WF-001 - open a Button workflow and add a Toast action', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await addToastActionToButtonWorkflowThroughUi(page);
  });

  test('WF-002 - Submit action respects required validations', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureSubmitActionAndVerifyRequiredValidationThroughUi(page);
  });

  /**
   * #1428 (reported on 2.2.0-beta238) asked for the modern Fields/Aa/JS
   * selector used by the If action. Fix e49725f9 first shipped in beta241;
   * after an intentional Fields-mode information-panel difference was reviewed,
   * QA validated the complete behavior in beta247. WF-003 exercises all three
   * modes and now distinguishes the modern Aa/JS guidance from the intentionally
   * guidance-free Fields mode.
   */
  test('WF-003 #1428 - If action modes and visible configuration tabs', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureIfActionModesWithTextSourceThroughUi(page);
  });

  /**
   * #1427 (reported on 2.2.0-beta238) lacked guidance about the iterable accepted
   * by Loop. Fix 482d7f90 first shipped and was QA validated in beta241. WF-004
   * now protects both the array guidance/examples and the usable iterator modes.
   */
  test('WF-004 #1427 - Loop action documents its array iterator input', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureLoopActionIteratorThroughUi(page);
  });

  test('WF-005 - configured Toast action appears in the viewer', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureToastActionAndVerifyViewerToastThroughUi(page);
  });

  /**
   * #1313 (reported on 2.2.0-beta118 by release-date inference) covered cramped
   * action configuration panels. Fix 8d61ba03, released first in 2.2.0-beta120
   * and historically validated in 2.2.0-beta122, made the panel responsive,
   * enlarged HTML editing, removed the Aa toolbar and widened the selector.
   * #1322 (reported on inferred 2.2.0-beta125) covered the first-load race where
   * background actions returned by C8Oforms.GetSequences missed the palette.
   * Fix 9b68c8b0 first shipped in 2.2.0-beta126 and QA validated beta127. WF-006
   * already proves that the dynamic Send Mail action is selectable on first load.
   * Current test-nocode runtime validation is pending; this pass is authoring-only.
   */
  test('WF-006 #1313 #1322 - responsive Send Mail configuration persists after dynamic action selection', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureMailActionAndVerifyPersistenceThroughUi(page);
  });

  /**
   * #1328: this journey owns the redesigned no-code database action UI.
   * #1515 (reported after beta317) was caused by the shared variable button
   * becoming selected after one click and suppressing subsequent clicks. Fix
   * 39f666df first shipped in beta326 and QA validated beta333. The two mappings
   * below require two successive Add a variable clicks and both reach Preview.
   */
  test('WF-007 #1515 - No-Code Database Add Row action creates a row with successive variables', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureBaserowAddRowAndVerifyCreatedRowThroughUi(page);
  });

  test('WF-007 - No-Code Database Add Row mapping can be deleted', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await verifyBaserowAddRowMappingCanBeDeletedThroughUi(page);
  });

  // #1323: reselecting a configured action must warn before discarding its values.
  test('WF-009 - configured action replacement warning preserves values on cancel', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await verifyConfiguredActionReplacementWarningThroughUi(page);
  });

  test('WF-010 - workflow action persists after editor reload', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await verifyWorkflowPersistenceAfterReloadThroughUi(page);
  });

  /**
   * #1378 introduced the configurable Reset fields action. Fix dbd10db8 first
   * shipped in 2.2.0-beta185 and was historically validated in beta309.
   * WF-011 is authoring-only until its first runtime validation: it protects
   * the three scopes and the component-scope default/outside-scope semantics.
   */
  test('WF-011 #1378 - Reset fields restores defaults within the configured scope', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureResetFieldsActionAndVerifyComponentScopeThroughUi(page);
  });

  /**
   * #1482 was reported on 2.2.0-beta304. Deleted Buttons intentionally retain
   * their flows, but the old name allocator ignored those retained flow names
   * and could reuse one. Fix 68d0e6fb first shipped in beta318 and was
   * historically validated in beta320. Runtime validation of this authored
   * functional owner is pending.
   */
  test('WF-012 #1482 - recreated Buttons receive unique workflow names', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await verifyButtonFlowNamesRemainUniqueAfterComponentRecreationThroughUi(page);
  });

  /**
   * #1484 was requested on 2.2.0-beta304. Fix d2b92722 added a distinct Go back
   * target and viewer page history in beta328; QA validated it in beta333. The
   * scenario jumps Page 1 -> Page 3, then proves Go back returns to the visited
   * Page 1 rather than the index-adjacent Page 2. Runtime validation is pending.
   */
  test('WF-013 #1484 - Navigate to Page Go back follows viewer history', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await verifyNavigateToPageGoBackUsesViewerHistoryThroughUi(page);
  });

  /**
   * #1492 was reported on 2.2.0-beta309. Studio fix 6623b0a6 made a
   * field_name variable serialize the selected component's technical name,
   * while lib_Actions_C8Oforms bde2b16a persisted the corresponding response
   * edit. The complete fix first shipped in beta329 and was historically
   * QA-validated in beta337. This functional owner inspects the submitted
   * response in Studio's Individual view after publishing.
   */
  test('WF-014 #1492 - Generic Task changes only the named stored response field', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    const title = `WF-014 Generic Task ${Date.now()}`;
    const formId = await createBlankApplicationThroughUi(page, title);
    await verifyGenericTaskChangesOnlyNamedStoredResponseFieldThroughUi(page, formId, title);
  });
});
