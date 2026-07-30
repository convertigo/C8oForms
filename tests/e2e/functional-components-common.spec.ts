import { test } from '@playwright/test';
import {
  addEveryPaletteComponentThroughUi,
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

  test('CMP-COM-001 - add every component from the palette', async ({ page }) => {
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

  test('CMP-COM-005 - duplicate a configured component', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await duplicateConfiguredButtonAndAssertCopyThroughUi(page);
  });

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

  test('CMP-LAYOUT-001 - Horizontal layout children add reorder and delete', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureHorizontalLayoutChildrenThroughUi(page);
  });

  test('CMP-GROUP-001 - Group children visibility reorder and delete', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureGroupChildrenVisibilityReorderAndDeleteThroughUi(page);
  });
});
