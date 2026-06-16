import { test, expect } from '@playwright/test';
import {
  login,
  createBlankForm,
  openEditor,
  acceptRgpdIfVisible,
  openPageSettings,
  recordToasts,
  recordedToasts,
  SEL,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1383
 * "Renaming a page shows 'name already exists' when the field is left empty".
 *
 * Reproduced on 2.2.0-beta158. Fixed by 269e0386e: when the new page name is
 * empty, the validation now raises the `emptyField` message instead of the
 * `nameAlreadyexits` one (it does NOT disable the Close button — the only
 * observable change is the toast text).
 *
 * i18n values (the assertion is language-agnostic, the test user runs in fr):
 *   - emptyField        fr "Ce champ ne peut être vide"            en "This field can't be empty"
 *   - nameAlreadyexits  fr "Ce nom existe déjà, veuillez en choisir un autre"
 *                       en "This name already exists, please choose another one"
 *
 * On beta158 clearing the page name raises nameAlreadyexits → RED; the fix
 * raises emptyField → GREEN.
 *
 * The form fixture is built entirely through the No Code Studio UI
 * (createBlankForm → a blank form already has one page named "Page 1").
 */
const EMPTY_FIELD_MESSAGE = /Ce champ ne peut être vide|This field can't be empty/i;
const NAME_EXISTS_MESSAGE = /Ce nom existe déjà|This name already exists/i;

test("#1383 - clearing a page name raises the empty-field message, not 'name already exists'", async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  const id = await createBlankForm(page, `Repro 1383 ${Date.now()}`);
  await openEditor(page, id);
  await acceptRgpdIfVisible(page);

  // Open the page settings via the Pages panel pencil. The helper guards the
  // context (fails loudly if the settings don't open) so a broken setup can't
  // pass as "fixed".
  await openPageSettings(page);

  const nameInput = page.locator(SEL.pageNameInput).first();
  await expect(nameInput).toBeVisible({ timeout: 15_000 });

  // Record toasts up front: they auto-dismiss, so a point-in-time read races them.
  await recordToasts(page);

  // Clear the page name and commit it (validation runs on change/blur).
  await nameInput.fill('');
  await nameInput.blur();

  // A validation toast must appear — guards against a false green where nothing
  // fires at all (broken setup) rather than the fixed message.
  await expect
    .poll(async () => (await recordedToasts(page)).join(' | '), {
      message: 'clearing the page name must raise a validation toast',
      timeout: 8_000,
    })
    .not.toBe('');

  // The bug raises the "name already exists" toast for an empty value; the fix
  // raises the dedicated empty-field message.
  const toasts = (await recordedToasts(page)).join(' | ');
  expect(toasts, 'clearing the page name must raise the empty-field message').toMatch(EMPTY_FIELD_MESSAGE);
  expect(toasts, "clearing the page name must not raise the 'name already exists' message").not.toMatch(
    NAME_EXISTS_MESSAGE,
  );
});
