import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  clearButtonIcon,
  createBlankForm,
  expectButtonRenderedWithoutIcon,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1356
 *
 * Found in 2.2.0-beta150. Fixed by 0ef67c13 (first tagged in
 * 2.2.0-beta151) and validated OK in 2.2.0-beta153.
 *
 * Root cause: the Button Icon editor only let users choose another icon; it had
 * no clear action, so a Button could not be configured as text-only. The fix
 * adds a close-outline control that calls setButtonConfig("icon", "") and the
 * Button viewer hides its ion-icon when the icon value is empty.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button component, open its configuration panel, clear the icon, and observe
 * the rendered Button. No form document writes or fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1356 - Button icon can be cleared for a text-only button', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1356 button clear icon ${Date.now()}`);
  });

  await test.step('Add a Button and open its configuration', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
  });

  await clearButtonIcon(page);
  await expectButtonRenderedWithoutIcon(page);
});
