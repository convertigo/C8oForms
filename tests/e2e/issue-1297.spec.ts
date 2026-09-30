import { expect, test } from './fixtures';
import { SEL, clickPageIconFieldRapidly, createBlankForm, login, openPageSettings } from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1297
 * Reported in 2.2.0-beta112. Fix 18fb83b4d prevents concurrent page-icon
 * picker openings with a shared guard around modal creation, first released
 * and historically validated by QA in 2.2.0-beta114. This latest-only test
 * was executed successfully on test-nocode running 2.2.0-beta371, without
 * deployment or a historical red phase. The form uses only Studio UI actions.
 */
test.setTimeout(120_000);

test('#1297 - rapid page icon clicks open only one picker', async ({ page }) => {
  await test.step('Create a blank form and open page settings', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1297 page icon ${Date.now()}`);
    await openPageSettings(page);
  });

  await test.step('Click the page icon field repeatedly and count pickers', async () => {
    await clickPageIconFieldRapidly(page);
    const pickers = page.locator(SEL.iconPickerModal);
    await expect(pickers, 'one page icon picker should open').toHaveCount(1, { timeout: 20_000 });
    await expect(pickers.first()).toBeVisible();
    await page.waitForTimeout(1_000);
    await expect(pickers, 'rapid clicks must not stack pickers').toHaveCount(1);
  });

  await test.step('Dismiss the picker and verify it can open again', async () => {
    await page.keyboard.press('Escape');
    await expect(page.locator(`${SEL.iconPickerModal}:visible`)).toHaveCount(0);
    await clickPageIconFieldRapidly(page, 1);
    await expect(page.locator(`${SEL.iconPickerModal}:visible`)).toHaveCount(1);
  });
});
