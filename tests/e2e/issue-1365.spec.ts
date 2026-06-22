import { test } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectButtonDefaultIconName,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1365
 *
 * Found in 2.2.0-beta150. Fixed by b0605dbf (first tagged in
 * 2.2.0-beta155) and validated OK in 2.2.0-beta155.
 *
 * Root cause: newly inserted Button components initialized config.icon to
 * "bulb-outline", but the icon picker/list contains "bulb" and not that
 * outline name. The fix changes the creation default to "bulb"; existing old
 * buttons are intentionally not migrated.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button component, open its configuration panel, and inspect the Button Icon
 * style section. No form document writes or fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1365 - new Button uses an available default icon', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1365 button icon ${Date.now()}`);
  });

  await test.step('Add a Button and open its configuration', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
  });

  await expectButtonDefaultIconName(page, 'bulb');
});
