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
  assertRepresentativeComponentActionRailsThroughUi,
  deleteTextInputCancelThenConfirmThroughUi,
  duplicateConfiguredButtonAndAssertCopyThroughUi,
  disableTextInputAndAssertViewerExclusionThroughUi,
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

  /**
   * #1298: duplication must select/scroll to the copy and identify both ends.
   * #1388: Copy to page must use the redesigned alert without regressing the
   * cross-page copy itself.
   */
  test('CMP-COM-005 #1298 #1388 - duplicate a configured component locally and to another page', async ({ page }) => {
    test.setTimeout(300_000);
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

  /**
   * #505 asks the shared navigation filter to support the complete operator
   * family and right-hand values authored as text, another form field, or an
   * advanced JavaScript expression. The complete contract was runtime-validated
   * on test-nocode running 2.2.0-beta371.
   */
  test('CMP-COM-010 #505 - component navigation with text source and JavaScript conditions', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    const applicationId = await createBlankApplicationThroughUi(page);
    await configureConditionalComponentNavigationThroughUi(page, applicationId);
  });

  // #1251: filtering must keep each palette result bound to its own hover resources.
  test('CMP-COM-011 - filtered palette hover has no missing resources', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertFilteredComponentPaletteHoverHasNo404sThroughUi(page);
  });

  /**
   * #1436: disabled components stay configured and visibly marked in Studio,
   * but are omitted from Preview until explicitly re-enabled.
   */
  test('CMP-COM-012 #1436 - disable a component without removing its configuration', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    const applicationId = await createBlankApplicationThroughUi(page);
    await disableTextInputAndAssertViewerExclusionThroughUi(page, applicationId);
  });

  /**
   * Representative, deliberately bounded coverage for #1371: this compares
   * the action rails of a Button and a Radio component. It does not claim to
   * exhaust every Studio settings page. #1387 is protected by requiring every
   * sampled action's visible label to match one complete supported-locale
   * wording and to remain geometrically contained in its button. This bounded
   * contract was runtime-validated on test-nocode running 2.2.0-beta371.
   */
  test('CMP-COM-013 #1371 #1387 - Button and Radio action rails stay consistent and explicit', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertRepresentativeComponentActionRailsThroughUi(page);
  });

  test('CMP-LAYOUT-001 #1379 #1463 - Horizontal layout children, nesting, and valid drop-zone feedback', async ({ page }) => {
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

  test('CMP-GROUP-001 #1379 - Group children visibility reorder delete and valid drop-zone feedback', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureGroupChildrenVisibilityReorderAndDeleteThroughUi(page);
  });
});
