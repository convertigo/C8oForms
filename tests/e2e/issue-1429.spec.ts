import { test } from './fixtures';
import {
  SEL,
  PALETTE_ICON,
  addComponent,
  createBlankForm,
  expectImportFilePreviewOpensDedicatedUploadModal,
  login,
  openPreview,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1429
 * "Import File component opens an oversized modal with incorrect .c8oforms
 * project import wording".
 *
 * Broken version: 2.2.0-beta241.
 * Fixed version: f274aca5 first shipped in 2.2.0-beta244 and the ticket was
 * validated OK in 2.2.0-beta247.
 * Root cause: the Import File viewer opened dropFilePage with the generic
 * alwaysFullScreen application-import modal class and application import text.
 * The fix passes modal-custom-import-file and uses file-upload labels/accept
 * handling when the modal is not opened for a .c8oforms project import.
 *
 * The C8oForms fixture is built only through Studio UI: log in, create a blank
 * form, add the Import file component from the palette, switch to Preview, and
 * click the component's add-file button.
 */

test.setTimeout(180_000);

test('#1429 - Import file preview opens the dedicated file upload modal', async ({ page }) => {
  await test.step('login', async () => {
    await login(page);
  });

  await test.step('create a blank form', async () => {
    await createBlankForm(page, `Issue 1429 import file modal ${Date.now()}`);
  });

  await test.step('add an Import file component through the palette UI', async () => {
    await addComponent(page, PALETTE_ICON.file, { allowEditorApiFallback: false });
  });

  await test.step('open Preview', async () => {
    await openPreview(page, SEL.fileComponent);
  });

  await expectImportFilePreviewOpensDedicatedUploadModal(page);
});
