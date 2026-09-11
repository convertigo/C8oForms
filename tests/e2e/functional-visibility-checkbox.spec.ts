import { test } from '@playwright/test';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import { exerciseCheckboxVisibilityOperatorsThroughUi } from './helpers/functional-visibility';

test.describe('No-Code Studio functional checkbox visibility contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('VIS-002 - Checkbox visibility operators show and hide targets', async ({ page }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxVisibilityOperatorsThroughUi(page);
  });
});
