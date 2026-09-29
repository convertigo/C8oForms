import { test } from '@playwright/test';
import {
  loginAsAdminWithUsernamePassword,
  verifyMultipleUsersCanBeAddedToMultipleAdminGroupsThroughUi,
} from './helpers/functional-admin';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1165
 * "Add one or more users to one or more groups from Groups Management".
 *
 * In 2.1.10-beta15, Groups Management only exposed the inverse workflow: an
 * administrator had to find users in the right grid first and open each user's
 * group assignment. The #1077 redesign introduced a bulk Add to group action
 * and a two-pane modal carrying multiple selected users and groups (notably
 * 9eb7ab73 and c1f62419), first shipped in 2.2.0-beta9. QA historically
 * validated #1165 in 2.2.0-beta251.
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta370, without deployment or a historical red phase. It creates two
 * temporary groups through the Admin UI, selects two existing users through
 * the rendered grid, assigns both users to both groups through the bulk modal,
 * verifies the four relations, and cleans up the temporary groups.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(360_000);

test('#1165 — bulk Add to group assigns multiple users to multiple groups', async ({ page }) => {
  await loginAsAdminWithUsernamePassword(page);
  await verifyMultipleUsersCanBeAddedToMultipleAdminGroupsThroughUi(page);
});
