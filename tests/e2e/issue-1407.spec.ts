import { expect, test } from '@playwright/test';
import {
  SEL,
  createFormDocument,
  getPwaDocument,
  login,
  openPublishedPwaEditor,
  publishFormWithPwa,
  setPwaAccessModeAndSave,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1407
 * "Cannot switch PWA access from anonymous back to authenticated"
 *
 * Broken before 2.2.0-beta216, fixed by 2ef5d325 (first released in
 * 2.2.0-beta216). Root cause: CreatePwa handled ToggleSwitch modelChanged as a
 * raw string (`event == "oui"`) while the shared component emits an object
 * (`event.out`), so clicking "Oui" kept pwa.notAnonymous false.
 */
test.setTimeout(120_000);

test('#1407 - PWA access can switch from anonymous back to authenticated', async ({ page }) => {
  await login(page);
  const title = `Issue 1407 ${Date.now()}`;
  const { id } = await createFormDocument(page, title);
  await publishFormWithPwa(page, id, { notAnonymous: false });
  await expect
    .poll(async () => (await getPwaDocument(page, id))?.notAnonymous, {
      message: 'the test fixture should start as an anonymous PWA',
      timeout: 30_000,
    })
    .toBe(false);

  await openPublishedPwaEditor(page, title);
  await setPwaAccessModeAndSave(page, 'authenticated');

  await expect
    .poll(async () => (await getPwaDocument(page, id))?.notAnonymous, {
      message: 'saving the PWA editor after choosing authenticated should persist notAnonymous=true',
      timeout: 60_000,
    })
    .toBe(true);

  await openPublishedPwaEditor(page, title);
  await expect(page.locator(SEL.pwaAccessToggle).last().locator(SEL.pwaAccessToggleButton).nth(0)).toHaveClass(
    /c8o-btn-selected/,
    { timeout: 30_000 },
  );
});
