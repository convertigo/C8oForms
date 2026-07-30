import { test } from '@playwright/test';
import { configureVisibilityOnMainComponentTypesThroughUi } from './helpers/functional-components-common';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio main component visibility contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-COM-009 - visibility on main target component types', async ({ page }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureVisibilityOnMainComponentTypesThroughUi(page);
  });
});
