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
    test.setTimeout(240_000);
    await loginAsAdminWithUsernamePassword(page);
    await verifyAdminGroupCanBeCreatedAndCleanedThroughUi(page);
  });
});
