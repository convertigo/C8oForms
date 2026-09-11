import { test } from '@playwright/test';
import {
  exerciseBusinessLogicDynamicFieldFormulaThroughUi,
  exerciseBusinessLogicFormulaSourceThroughUi,
  exerciseButtonLabelIconRenderingThroughUi,
  exerciseButtonStateConditionAndWorkflowThroughUi,
  exerciseMapConfiguredHeightRenderingThroughUi,
  exerciseMapHeightResetThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional action component values', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-BUTTON-001 - Button labels icons and rendering', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseButtonLabelIconRenderingThroughUi(page);
  });

  test('CMP-BUTTON-002 - Button conditional enabled state and workflow', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseButtonStateConditionAndWorkflowThroughUi(page);
  });

  test('CMP-MAP-001 - Map configured height and editor viewer rendering', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseMapConfiguredHeightRenderingThroughUi(page);
  });

  test('CMP-MAP-001 - Map height reset persists after reopening', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseMapHeightResetThroughUi(page);
  });

  test('CMP-BIZ-001 - Business logic formula source and viewer evaluation', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseBusinessLogicFormulaSourceThroughUi(page);
  });

  test('CMP-BIZ-001 - Business logic dynamic field formula refresh', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseBusinessLogicDynamicFieldFormulaThroughUi(page);
  });
});
