import { test } from '@playwright/test';
import {
  loginAsAdminWithUsernamePassword,
  verifyAdminGroupContainingC8OCanBeCreatedAndListedThroughUi,
} from './helpers/functional-admin';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1119
 * "Fail to add a new group".
 *
 * Found in 2.1.8-beta1. The group was created successfully, but
 * admin_users_get_by_group_v2 removed every group whose name contained C8O, so
 * it disappeared from the Admin Groups list. Fix 18d7188a limits that exclusion
 * to internal C8O_HIDDEN and C8Oreserved groups (first in 2.2.0-beta12; QA
 * validated the ticket in 2.2.0-beta118).
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta369. Per request, it has no deployment or historical red run. The
 * temporary group is created through the Admin UI and removed after the
 * assertion.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(180_000);

test('#1119 — a new group containing C8O remains visible after creation', async ({ page }) => {
  await loginAsAdminWithUsernamePassword(page);
  await verifyAdminGroupContainingC8OCanBeCreatedAndListedThroughUi(page);
});
