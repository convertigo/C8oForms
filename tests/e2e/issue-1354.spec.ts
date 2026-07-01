import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectButtonStyleTabsOnly,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1354
 *
 * Found in 2.2.0-beta150. Fixed by d50b64c6 (first tagged in 2.2.0-beta151)
 * and validated OK in 2.2.0-beta153.
 *
 * Root cause: buttonMainEditorStyleTabs still included the shared
 * tab_selector_grid_question entry and selected it by default, so Button style
 * configuration exposed the irrelevant generic Question section before the
 * button_style and button_icon sections. Later button-specific or shared style
 * tabs are allowed; the regression guard is the absence of the generic
 * tab_selector_grid_question tab.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button component, and open its configuration panel. No form document writes or
 * fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1354 - Button style panel does not expose the generic Question section', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1354 button style tabs ${Date.now()}`);
  });

  await test.step('Add a Button and open its configuration', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
  });

  await test.step('Assert Button style sections', async () => {
    await expectButtonStyleTabsOnly(page);
  });
});
