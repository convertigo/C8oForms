import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectButtonIconFieldReadOnly,
  expectButtonIconName,
  login,
  openButtonIconPicker,
  openComponentConfig,
  pickIconWithOneClick,
  searchIconPicker,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1545
 *
 * Found in 2.2.0-beta342, still present in 2.2.0-beta345.
 *
 * Root cause: the chooseIcon modal feeds its cdkVirtualFor with
 * filterIconRows(), which rebuilt the rows array on every call. The generated
 * template calls it twice per change detection, so every tick handed the
 * virtual list a new array of new rows and the list re-rendered all its views.
 * After a search, the mousedown on an icon blurs the search bar, which runs a
 * tick: the cell under the pointer is detached or recycled for another icon
 * before mouseup. The click is lost (two clicks needed), or it lands on a
 * recycled cell and picks the wrong icon (Firefox, click on the text). The fix
 * memoizes the rows on the filtered icon list. The icon name field accepted
 * typing although a typed name was never applied: it is now read-only and only
 * opens the picker.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button, check that its icon field is read-only, open its icon picker, search,
 * and pick an icon with a single click on its text, then on its image. No form
 * document writes or fixture shortcuts.
 */

test.setTimeout(180_000);

test('#1545 - one click on an icon text or image picks it in the Button icon picker', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1545 button icon picker ${Date.now()}`);
  });

  await test.step('Add a Button and open its configuration', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
  });

  await expectButtonIconFieldReadOnly(page);

  await test.step('Pick an icon by clicking its text once', async () => {
    await openButtonIconPicker(page);
    await searchIconPicker(page, 'heart');
    await pickIconWithOneClick(page, 'heart-circle', 'text');
    await expectButtonIconName(page, 'heart-circle');
  });

  await test.step('Pick an icon by clicking its image once', async () => {
    await openButtonIconPicker(page);
    await searchIconPicker(page, 'star');
    await pickIconWithOneClick(page, 'star-half', 'image');
    await expectButtonIconName(page, 'star-half');
  });
});
