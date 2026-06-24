import { test, expect } from './fixtures';
import {
  login,
  createBlankForm,
  openEditor,
  acceptRgpdIfVisible,
  addHorizontalLayout,
  dragPaletteComponentInto,
  deleteLayoutChild,
  PALETTE_ICON,
  SEL,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1363
 * "Deleting a component inside an Horizontal layout also deletes the Horizontal
 * layout itself and all its content".
 *
 * Reproduced on 2.2.0-beta151, fixed first in beta155 (commits 1f58b05dd then
 * fdabd9bd1). Root cause: the editor's close/delete handling
 * (mobileSharedActions/closeOptions.yaml + editorPage delete logic) removed the
 * whole container instead of the selected child. The fix deletes only the
 * selected element, leaving the layout and its other children intact.
 *
 * The fixture is built entirely through the No Code Studio UI. A Horizontal
 * layout is a container of type "layout" which (unlike an ion-card) only accepts
 * children via a real drag-and-drop (`dragPaletteComponentInto`). The child is
 * then deleted the way a user does it: hover the child, open its own editor, and
 * click that editor's "Supprimer" button. In the buggy version that button acted
 * on the parent layout (hence the cascade); the fix scopes it to the child.
 */
test('#1363 - deleting a child inside a Horizontal layout removes only that child, not the whole layout', async ({
  page,
}) => {
  test.setTimeout(75_000);

  await login(page);
  const id = await createBlankForm(page, `Repro 1363 ${Date.now()}`);
  await openEditor(page, id);
  await acceptRgpdIfVisible(page);

  // Build the fixture: a Horizontal layout holding two children, nested via real
  // drag-and-drop.
  await addHorizontalLayout(page);
  await dragPaletteComponentInto(page, PALETTE_ICON.textInput, SEL.layoutViewer);
  await dragPaletteComponentInto(page, PALETTE_ICON.description, SEL.layoutViewer);

  // Context guard: both children must really be nested inside the layout before
  // we assert the bug — otherwise a broken DnD setup would pass as "fixed".
  await expect(page.locator(SEL.layoutViewer)).toHaveCount(1);
  await expect(page.locator(SEL.layoutChild)).toHaveCount(2);

  // Delete the first nested child (via its own editor on the fixed UI, or its
  // config panel on the old buggy UI).
  await deleteLayoutChild(page, 0);

  // The bug deletes the entire layout (and every child); the fix removes only the
  // edited child, so the layout and its remaining child must survive.
  await expect(
    page.locator(SEL.layoutViewer),
    'deleting a child must not delete the Horizontal layout itself',
  ).toHaveCount(1);
  await expect(
    page.locator(SEL.layoutChild),
    'only the edited child should be removed, the other must remain',
  ).toHaveCount(1);
});
