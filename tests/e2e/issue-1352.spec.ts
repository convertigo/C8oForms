import { test } from './fixtures';
import {
  createSelectorFolder,
  expectSelectorFolderHidden,
  expectSelectorFolderVisible,
  login,
  setSelectorHideFoldersFilter,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1352
 *
 * Found in 2.2.0-beta147, the latest release before the issue was opened.
 * Fixed by b659be83 (first tagged in 2.2.0-beta149) and validated OK in
 * 2.2.0-beta153.
 *
 * Root cause: the selector quick "Hide folders" filter updated the persisted
 * filter state but did not refresh the currently displayed out_folder view, so
 * folders remained visible until the user changed view. The fix normalizes the
 * edition filters and invokes callViewLiveAndFillFormList after quick-filter
 * changes.
 *
 * The selector fixture is built only through Studio UI: log in, create a folder
 * from the selector page, and toggle the Hide folders quick filter. No document
 * writes or fixture shortcuts are used.
 */

test.setTimeout(120_000);

test('#1352 - Hide folders applies immediately on the selector page', async ({ page }) => {
  const folderTitle = `F1352-${Date.now()}`;

  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a visible folder from the selector page', async () => {
    await setSelectorHideFoldersFilter(page, false);
    await createSelectorFolder(page, folderTitle);
    await expectSelectorFolderVisible(page, folderTitle);
  });

  await test.step('Enable Hide folders and assert the folder disappears immediately', async () => {
    await setSelectorHideFoldersFilter(page, true);
    await expectSelectorFolderHidden(page, folderTitle);
  });

  await test.step('Disable Hide folders and assert the folder reappears immediately', async () => {
    await setSelectorHideFoldersFilter(page, false);
    await expectSelectorFolderVisible(page, folderTitle);
  });
});
