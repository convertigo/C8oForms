import { test } from '@playwright/test';
import {
  verifyAdminGroupCanBeCreatedAndCleanedThroughUi,
  loginAsAdminWithUsernamePassword,
  verifyAdminUsersAndGroupsManagementSurfacesThroughUi,
} from './helpers/functional-admin';

test.describe('No-Code Studio functional admin contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('ADM-001 - admin users and groups management surfaces are accessible', async ({ page }) => {
    test.setTimeout(240_000);
    await loginAsAdminWithUsernamePassword(page);
    await verifyAdminUsersAndGroupsManagementSurfacesThroughUi(page);
  });

  test('ADM-001 - admin group can be created and cleaned through the UI', async ({ page }) => {
    // Measured on CI run 35616797087 (shared server, admin calls 12-33s each): login 61s, and
    // 156s to reach the Add-user-to-group step, which is 4 of 6. The last two steps chain
    // several more admin calls, so 240s could not fit the whole journey. Plus the stale-group
    // sweep: seconds in steady state, capped at 90s.
    test.setTimeout(480_000);
    await loginAsAdminWithUsernamePassword(page);
    await verifyAdminGroupCanBeCreatedAndCleanedThroughUi(page);
  });
});
