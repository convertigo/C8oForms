import { test } from '@playwright/test';
import {
  exerciseCheckboxBaserowSourceConfigurationThroughUi,
  exerciseCheckboxBaserowSourceThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional Baserow component values', () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-CHECK-002 - Checkbox Baserow source configuration persists', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxBaserowSourceConfigurationThroughUi(page);
  });

  test('CMP-CHECK-002 - Checkbox Baserow visible labels and multi-selection', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxBaserowSourceThroughUi(page);
  });
});
