import { test } from '@playwright/test';
import { configureVisibilityOnDataDisplayComponentTypesThroughUi } from './helpers/functional-components-common';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio data component visibility contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('VIS-003 - visibility on data display component types', async ({ page }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureVisibilityOnDataDisplayComponentTypesThroughUi(page);
  });
});
