import { test } from '@playwright/test';
import {
  loginAsAdminWithUsernamePassword,
  verifyAdminGroupMembershipCountThroughUi,
} from './helpers/functional-admin';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1120
 * "Wrong Users in Group count".
 *
 * The issue was reported on 2.1.8-beta1: after adding a user, the group showed
 * the signed-in administrator while the selected user was missing. The project
 * referenced lib_FullSyncGrp 8.0.0.0, which lacked the bulk add/remove
 * sequences; reloading 8.0.0.3 fixed the workflow and QA validated it in
 * 2.2.0-beta118.
 *
 * The current creation flow intentionally adds the authenticated administrator
 * as the first member. This characterization therefore checks that the rendered
 * count and actual membership stay aligned from one member to two, and that the
 * user selected in the Add user modal is rendered after selection. Per request,
 * it runs only on latest, without deployment or a historical red phase. This
 * test was executed successfully on test-nocode running 2.2.0-beta370.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(300_000);

test('#1120 — group member count and added user stay consistent', async ({ page }) => {
  await loginAsAdminWithUsernamePassword(page);
  await verifyAdminGroupMembershipCountThroughUi(page);
});
