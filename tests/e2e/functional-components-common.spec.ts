import { test } from './fixtures';
import {
  addEveryPaletteComponentThroughUi,
  assertFilteredComponentPaletteHoverHasNo404sThroughUi,
  assertHorizontalLayoutConfigurationRendersImmediatelyThroughUi,
  configureGroupChildrenVisibilityReorderAndDeleteThroughUi,
  configureSelectDefaultValuesInAllModesThroughUi,
  configureTextInputCommonPropertiesThroughUi,
  configureConditionalComponentNavigationThroughUi,
  configureHorizontalLayoutChildrenThroughUi,
  deleteTextInputCancelThenConfirmThroughUi,
  duplicateConfiguredButtonAndAssertCopyThroughUi,
  renameTextInputTechnicalIdentifierThroughUi,
  reorderButtonsAndAssertPersistenceThroughUi,
  validateTextInputTechnicalIdentifierErrorsThroughUi,
} from './helpers/functional-components-common';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional common component contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  /**
   * #1291: reported while beta107 was current, fixed by 4e05b27e and
   * historically validated in beta111. Affected editor component hosts must
   * remain block boxes with 10px bottom padding.
   */
  test('CMP-COM-001 #1291 - add every palette component with consistent editor spacing', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await addEveryPaletteComponentThroughUi(page);
  });

  test('CMP-COM-002 - rename the technical identifier', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await renameTextInputTechnicalIdentifierThroughUi(page);
  });

  test('CMP-COM-003 - validate empty duplicate and invalid technical identifiers', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await validateTextInputTechnicalIdentifierErrorsThroughUi(page);
  });

  test('CMP-COM-004 - delete a component cancel then confirm', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await deleteTextInputCancelThenConfirmThroughUi(page);
  });

  // #1298: duplication must select/scroll to the copy and provide visible feedback.
  test('CMP-COM-005 - duplicate a configured component', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await duplicateConfiguredButtonAndAssertCopyThroughUi(page);
  });

  // #1246: component drag-and-drop reordering remains functional and persistent.
  test('CMP-COM-006 - reorder components by drag-and-drop', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await reorderButtonsAndAssertPersistenceThroughUi(page);
  });

  test('CMP-COM-007 - configure common label placeholder and required state', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureTextInputCommonPropertiesThroughUi(page);
  });

  test('CMP-COM-008 - default value in Visual Aa and JavaScript modes', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureSelectDefaultValuesInAllModesThroughUi(page);
  });

  test('CMP-COM-010 - component navigation with a condition', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureConditionalComponentNavigationThroughUi(page);
  });

  // #1251: filtering must keep each palette result bound to its own hover resources.
  test('CMP-COM-011 - filtered palette hover has no missing resources', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertFilteredComponentPaletteHoverHasNo404sThroughUi(page);
  });

  test('CMP-LAYOUT-001 - Horizontal layout children add reorder and delete', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureHorizontalLayoutChildrenThroughUi(page);
  });

  /**
   * #1252: reported while beta84 was current, fixed by 97123484 in beta99
   * and historically QA-validated in beta101. The editor must recompute the
   * responsive Ionic columns as soon as the Layout preset changes.
   */
  test('CMP-LAYOUT-001 #1252 - configured columns render immediately in the editor', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    const applicationId = await createBlankApplicationThroughUi(page);
    await assertHorizontalLayoutConfigurationRendersImmediatelyThroughUi(page, applicationId);
  });

  test('CMP-GROUP-001 - Group children visibility reorder and delete', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureGroupChildrenVisibilityReorderAndDeleteThroughUi(page);
  });
});
