import { test } from './fixtures';
import {
  addPageThroughPagesPanel,
  createBlankForm,
  expectPageDeleteActionVisibleForPage,
  login,
  renameCurrentPageFromPagesPanel,
} from './helpers/studio';

const LONG_PAGE_NAME =
  'Issue 1389 page with a very long name that must keep the delete action visible on hover';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1389
 *
 * Found in 2.2.0-beta175. Long page names expanded across the Pages panel row
 * and pushed or overlapped the hover delete action, making direct page deletion
 * inaccessible. Fix ba12b3ea first shipped in 2.2.0-beta180; the ticket was
 * validated OK in 2.2.0-beta186.
 *
 * The C8oForms form is built and configured only through Studio UI.
 *
 * Since ref #1511 (commit a058a4850) the Pages panel deliberately hides the
 * delete action on the last remaining page: editorPage.yaml guards DivDelete with
 * `this.local.idHovered == i && this.form?.pages?.length > 1`. #1389 is about
 * layout - a long page name must not push the hover actions out of the panel -
 * so the form needs a second page for the action to exist at all. Adding it is
 * part of the scenario, not a relaxation of the assertion.
 */

test.setTimeout(120_000);

test('#1389 - long page names keep the delete action visible in the Pages panel', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1389 long page name ${Date.now()}`);
  });

  await test.step('Rename the page with a long name', async () => {
    await renameCurrentPageFromPagesPanel(page, LONG_PAGE_NAME);
  });

  await test.step('Add a second page so the delete action is offered (ref #1511)', async () => {
    // Rename first: addPageThroughPagesPanel identifies the new row by its
    // generated "Page N" label, and the long name must belong to page 1.
    await addPageThroughPagesPanel(page);
  });

  await test.step('Check the delete action on page hover', async () => {
    await expectPageDeleteActionVisibleForPage(page, LONG_PAGE_NAME);
  });
});
