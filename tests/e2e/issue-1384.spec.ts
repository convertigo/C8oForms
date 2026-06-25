import { test } from './fixtures';
import {
  createBlankForm,
  expectCollaboratorsCsvImportAvailable,
  login,
  openEditorCollaboratorsModal,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1384
 * "Add collaborators modal proposes CSV import but no button is available"
 *
 * Broken version: 2.2.0-beta158.
 * Fixed version: first CSV button work in 2.2.0-beta172, modal follow-up in
 * 2.2.0-beta181, validated OK in 2.2.0-beta187.
 * Root cause: the collaborators ManageAccessRights modal described CSV user
 * import in its help text but did not expose a visible, usable upload action.
 * The fix added a CSV file input and a button that opens the browser file
 * picker from the collaborators modal.
 *
 * The C8oForms fixture is built only through Studio UI: log in, create a blank
 * form, stay in the editor opened by creation, open the editor more-actions
 * collaborators entry, and assert the CSV import control is usable.
 */

test.setTimeout(180_000);

test('#1384 - editor collaborators modal exposes a usable CSV import button', async ({ page }) => {
  await test.step('login', async () => {
    await login(page);
  });

  await test.step('create a blank form and stay in the editor', async () => {
    await createBlankForm(page, `Issue 1384 CSV collaborators ${Date.now()}`);
  });

  await test.step('open collaborators from the editor more-actions menu', async () => {
    await openEditorCollaboratorsModal(page);
  });

  await test.step('assert CSV import is visible and opens the file picker', async () => {
    await expectCollaboratorsCsvImportAvailable(page);
  });
});
