import { test, expect } from '@playwright/test';
import {
  SEL,
  PALETTE_ICON,
  TEST_USER,
  login,
  createBlankForm,
  addComponent,
  openComponentConfigAt,
  closeComponentConfig,
  setTextDefaultValueJavascript,
  setTextDefaultValueFromUserEmailPalette,
  dragUserEmailPaletteToTinyMce,
} from './helpers/studio';

const API_USER_EMAIL_RETURN = 'api.user.email';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1399
 * "Viewer expressions using api.* no longer resolve correctly."
 *
 * Found in 2.2.0-beta204, fixed by 68e69971 (first released in
 * 2.2.0-beta205), and manually checked OK in 2.2.0-beta214. Root cause:
 * viewerPage shadowed window["api"] with page.api || {}, so expressions such as
 * api.user.email evaluated against an empty object in the viewer.
 *
 * The fixture is authored through Studio UI only.
 */
test.setTimeout(150_000);

test('#1399 - viewer resolves api.user.email defaults from JS and Source Palette', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1399 ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.textInput);
  await page.locator(SEL.textComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfigAt(page, SEL.textComponent, 0);
  await setTextDefaultValueJavascript(page, API_USER_EMAIL_RETURN);
  await closeComponentConfig(page);

  await addComponent(page, PALETTE_ICON.textInput);
  await expect(page.locator(SEL.textComponent)).toHaveCount(2, { timeout: 30_000 });
  await openComponentConfigAt(page, SEL.textComponent, 1);
  await setTextDefaultValueFromUserEmailPalette(page);
  await closeComponentConfig(page);

  await addComponent(page, PALETTE_ICON.description);
  await page.locator(SEL.descriptionComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfigAt(page, SEL.descriptionComponent, 0);
  await dragUserEmailPaletteToTinyMce(page);
  await closeComponentConfig(page);

  await page.locator(SEL.previewButton).first().click();
  await expect(page).toHaveURL(/\/viewer\//, { timeout: 30_000 });

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const api = (window as any).api;
          return api?.user?.email ?? null;
        }),
      {
        message: 'viewer should expose window["api"].user.email',
        timeout: 30_000,
      },
    )
    .toBe(TEST_USER);

  const textInputs = page.locator(`${SEL.textComponent} input`);
  await expect(textInputs).toHaveCount(2, { timeout: 30_000 });
  await expect(textInputs.nth(0), 'JavaScript default api.user.email should resolve').toHaveValue(TEST_USER, {
    timeout: 30_000,
  });
  await expect(textInputs.nth(1), 'Text default dropped from the Source Palette should resolve').toHaveValue(TEST_USER, {
    timeout: 30_000,
  });
  await expect(page.locator(SEL.descriptionComponent).first(), 'Description Source Palette value should resolve').toContainText(
    TEST_USER,
    { timeout: 30_000 },
  );
});
