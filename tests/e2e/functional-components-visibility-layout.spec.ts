import { test } from '@playwright/test';
import { configureVisibilityOnContainerComponentTypesThroughUi } from './helpers/functional-components-common';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio layout component visibility contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('VIS-003 - visibility on layout and container component types', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureVisibilityOnContainerComponentTypesThroughUi(page);
  });
});
