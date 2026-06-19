import { test } from '@playwright/test';
import {
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

  await test.step('Check the delete action on page hover', async () => {
    await expectPageDeleteActionVisibleForPage(page, LONG_PAGE_NAME);
  });
});
