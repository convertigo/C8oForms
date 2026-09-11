import { test } from '@playwright/test';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  exerciseAdditionalSimpleVisibilityOperatorsThroughUi,
  exerciseNumericVisibilityOperatorsThroughUi,
  exerciseTextVisibilityOperatorsThroughUi,
} from './helpers/functional-visibility';

test.describe('No-Code Studio functional visibility operators contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('VIS-002 - text visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTextVisibilityOperatorsThroughUi(page);
  });

  test('VIS-002 - additional simple visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseAdditionalSimpleVisibilityOperatorsThroughUi(page);
  });

  test('VIS-002 - numeric visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseNumericVisibilityOperatorsThroughUi(page);
  });
});
