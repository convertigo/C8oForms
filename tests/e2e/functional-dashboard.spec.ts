import { test } from '@playwright/test';
import {
  assertDashboardEmptyResultStates,
  assertDashboardSectionsThroughBothEntryPoints,
  assertIsolatedEmptyDashboardSections,
} from './helpers/functional-dashboard';
import { functionalEmptyUserCredentials, loginWithFunctionalCredentials, loginWithUsernamePassword } from './helpers/functional-studio';
import { ensureFunctionalUserIfPossible } from './helpers/functional-users';

test.describe('No-Code Studio functional dashboard', () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

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
    const emptyUser = functionalEmptyUserCredentials();
    test.skip(
      !emptyUser,
      'Set C8OFORMS_FUNCTIONAL_EMPTY_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to auto-provision a functional empty user.',
    );
    await ensureFunctionalUserIfPossible(emptyUser!, { resetOwnedData: true });
    await loginWithFunctionalCredentials(page, emptyUser!);
    await assertIsolatedEmptyDashboardSections(page);
  });
});
