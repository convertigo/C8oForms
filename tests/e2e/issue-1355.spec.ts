import { test } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectButtonStyleTabsTranslatedToEnglish,
  login,
  openComponentConfig,
  setCurrentUserStudioLanguage,
  setStudioLanguageBeforeLoad,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1355
 *
 * Found in 2.2.0-beta150. Fixed by 871a529c (first tagged in
 * 2.2.0-beta151) and validated OK in 2.2.0-beta153.
 *
 * Root cause: buttonMainEditorStyleTabs used French strings directly for the
 * Button style tabs ("Style du bouton" and "Icône du bouton") instead of i18n
 * keys. The fix stores button_style/button_icon keys in editorPage and adds
 * translations in en/es/fr/it JSON assets.
 *
 * The C8oForms form is built only through Studio UI: force the Studio language
 * to English, create a blank form, add a Button component, open its
 * configuration panel, and inspect its style tabs. No form document writes or
 * fixture shortcuts are used.
 */

test.use({ locale: 'en-US' });
test.setTimeout(180_000);

test('#1355 - Button style tabs are translated outside French', async ({ page }) => {
  await test.step('Force Studio language to English before loading', async () => {
    await setStudioLanguageBeforeLoad(page, 'en');
  });

  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await setCurrentUserStudioLanguage(page, 'en');

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1355 button i18n ${Date.now()}`);
  });

  await test.step('Add a Button and open its configuration', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
  });

  await expectButtonStyleTabsTranslatedToEnglish(page);
});
