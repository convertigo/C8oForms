import { expect, test } from './fixtures';
import {
  createBlankForm,
  deletePublishedApplicationThroughUi,
  expectSelectorApplicationVisible,
  login,
  openPublishedApplicationsTab,
  publishCurrentFormWithPwa,
  reloadAndReadCurrentUserGroups,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1557
 *
 * Found in 2.2.0-beta347 (orphan groups found on the e2e accounts of
 * test-nocode); open until a release ships the fix (feature/#1557, 30ad0515).
 *
 * Root cause: APIV2_Publish puts the creator in the hidden group
 * _C8O_HIDDEN_published_<id> (the generated user of an anonymous PWA too), and
 * APIV2_deleteDocument deleted the published document, its PWA document and its
 * anonymous document but never that group. Every deleted publication left an
 * orphan group that getCurrentUserSettings returns and APIV2_ExecuteView sends
 * to CouchDB as ACL keys. The fix calls lib_FullSyncGrp.RemoveGroup once the
 * published form is deleted.
 *
 * The C8oForms form is built only through Studio UI: create a blank form,
 * publish it as an authenticated PWA, delete it from the Published applications
 * list. The groups are read from the getCurrentUserSettings answer the Studio
 * requests on reload; no form document writes or fixture shortcuts.
 */

test.setTimeout(240_000);

test('#1557 - deleting a published application removes its hidden publication group', async ({ page }) => {
  const title = `Issue 1557 hidden group ${Date.now()}`;
  let hiddenGroup = '';

  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create and publish an authenticated application', async () => {
    const formId = await createBlankForm(page, title);
    hiddenGroup = `_C8O_HIDDEN_published_${formId}`;
    await publishCurrentFormWithPwa(page, 'authenticated');
    await openPublishedApplicationsTab(page);
    await expectSelectorApplicationVisible(page, title);
  });

  await test.step('Publishing puts the creator in the hidden publication group', async () => {
    await expect
      .poll(async () => (await reloadAndReadCurrentUserGroups(page)).includes(hiddenGroup), {
        message: `${hiddenGroup} should be among the user groups once the application is published`,
        timeout: 90_000,
        intervals: [2_000, 5_000],
      })
      .toBe(true);
  });

  await deletePublishedApplicationThroughUi(page, title);

  await test.step('Deleting the published application removes the hidden publication group', async () => {
    const groups = await reloadAndReadCurrentUserGroups(page);
    expect(groups.includes(hiddenGroup), `${hiddenGroup} should no longer be among the ${groups.length} user groups`).toBe(false);
  });
});
