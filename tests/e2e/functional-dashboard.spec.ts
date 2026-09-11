import { test } from '@playwright/test';
import {
  assertDashboardEmptyResultStates,
  assertDashboardSectionsThroughBothEntryPoints,
  assertIsolatedEmptyDashboardSections,
} from './helpers/functional-dashboard';
import { loginWithUsernamePassword } from './helpers/functional-studio';
import { ensureFunctionalUserIfPossible, functionalUserProvisioningAvailable } from './helpers/functional-users';
import { TEST_PASSWORD, TEST_USER } from './helpers/studio';

test.describe('No-Code Studio functional dashboard', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('DASH-001 - access Edition apps, Published apps, and No-code database sections', async ({ page }) => {
    test.setTimeout(720_000);
    await loginWithUsernamePassword(page);
    await assertDashboardSectionsThroughBothEntryPoints(page);
  });

  test('DASH-002 - empty dashboard result states remain usable', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await assertDashboardEmptyResultStates(page);
  });

  test('DASH-002 - isolated empty dashboard sections remain usable', async ({ page }) => {
    test.setTimeout(300_000);
    test.skip(
      !functionalUserProvisioningAvailable(),
      'CONVERTIGO_ADMIN_PASSWORD is required to reset the current test user before asserting an empty dashboard.',
    );
    await ensureFunctionalUserIfPossible({ user: TEST_USER, password: TEST_PASSWORD }, { resetOwnedData: true });
    await loginWithUsernamePassword(page);
    await assertIsolatedEmptyDashboardSections(page);
  });
});
