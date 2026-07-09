import { test } from '@playwright/test';
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

  test('WF-006 - Send mail action configuration persists after action selection', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureMailActionAndVerifyPersistenceThroughUi(page);
  });

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
