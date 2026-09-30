import { test } from './fixtures';
import {
  addToastActionToButtonWorkflowThroughUi,
  configureBaserowAddRowAndVerifyCreatedRowThroughUi,
  configureIfActionModesWithTextSourceThroughUi,
  configureLoopActionIteratorThroughUi,
  configureMailActionAndVerifyPersistenceThroughUi,
  configureSubmitActionAndVerifyRequiredValidationThroughUi,
  configureToastActionAndVerifyViewerToastThroughUi,
  verifyBaserowAddRowMappingCanBeDeletedThroughUi,
  verifyConfiguredActionReplacementWarningThroughUi,
  verifyWorkflowPersistenceAfterReloadThroughUi,
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

  test('WF-003 - If action modes and visible configuration tabs', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureIfActionModesWithTextSourceThroughUi(page);
  });

  test('WF-004 - Loop action iterator and Source Palette button', async ({ page }) => {
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

  // #1328: the functional Add Row journey owns the redesigned no-code database action UI.
  test('WF-007 - No-Code Database Add Row action creates a row', async ({ page }) => {
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
});
