import { test } from '@playwright/test';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import { exerciseChoiceVisibilityConditionsThroughUi } from './helpers/functional-visibility';

test.describe('No-Code Studio functional choice visibility contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('VIS-005 - Select Radio Date Time and Checkbox group visibility condition values', async ({ page }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseChoiceVisibilityConditionsThroughUi(page);
  });
});
