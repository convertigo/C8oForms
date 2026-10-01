import { test } from '@playwright/test';
import {
  verifyAdminGroupCanBeCreatedAndCleanedThroughUi,
  verifyManualAdminUserFullNameThroughUi,
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

  /**
   * #1310 was reported in 2.2.0-beta118. Commit 63ff4503 added an explicit
   * border/background and inset outline to unchecked permission boxes in the
   * Add group and Add user modals; it first shipped in 2.2.0-beta125 and QA
   * historically validated it in 2.2.0-beta127. Current runtime validation is
   * intentionally outside this authoring pass.
   */
  test('ADM-001 #1310 - admin group can be created with visible unchecked permissions and cleaned through the UI', async ({ page }) => {
    // Measured on CI run 35616797087 (shared server, admin calls 12-33s each): login 61s, and
    // 156s to reach the Add-user-to-group step, which is 4 of 6. The last two steps chain
    // several more admin calls, so 240s could not fit the whole journey. Plus the stale-group
    // sweep: seconds in steady state, capped at 90s.
    test.setTimeout(480_000);
    await loginAsAdminWithUsernamePassword(page);
    await verifyAdminGroupCanBeCreatedAndCleanedThroughUi(page);
  });

  /**
   * #1311 was reported in 2.2.0-beta118. Commit 80854397 persisted displayName
   * for manually created users and added name/surname fallbacks to the Users,
   * Groups, group-picker and menu renderers; it first shipped and was
   * historically validated in 2.2.0-beta125. Current runtime validation is
   * intentionally outside this authoring pass.
   */
  test('ADM-002 #1311 - a manually created user keeps its complete name across Admin surfaces', async ({ page }) => {
    test.setTimeout(360_000);
    await loginAsAdminWithUsernamePassword(page);
    await verifyManualAdminUserFullNameThroughUi(page);
  });
});
