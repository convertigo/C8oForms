import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  pasteThroughRichTextEditMenu,
  writeRichTextClipboard,
} from './helpers/studio';

/**
 * Regression for https://github.com/convertigo/C8oForms/issues/1550.
 * Edit > Paste invoked the browser-blocked execCommand('paste') and silently did
 * nothing. Intended fix f49a49719 reads the Clipboard API, first in beta345.
 * The form and Description are authored only through Studio UI. Red on
 * test-repro beta344 and beta349 and on test-nocode beta375: Ctrl+V works,
 * but the Edit menu command still leaves the editor empty.
 */
test.setTimeout(240_000);

test('#1550 - HugeRTE Edit menu pastes clipboard text into a Description', async ({ page }) => {
  const text = `Paste menu 1550 ${Date.now()}`;
  await test.step('Create a Description in Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1550 ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await page.locator(SEL.descriptionComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.descriptionComponent);
  });

  await writeRichTextClipboard(page, { text });
  const editorBody = page.frameLocator('iframe.tox-edit-area__iframe').locator('body').first();
  await editorBody.click();
  await page.keyboard.press('Control+V');
  await expect(editorBody, 'keyboard paste should work with the same clipboard').toContainText(text);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await expect(editorBody).not.toContainText(text);
  const body = await pasteThroughRichTextEditMenu(page);
  await expect(body, 'Edit > Paste must insert the clipboard text').toContainText(text, { timeout: 15_000 });
  await closeComponentConfig(page);
  await openPreview(page, SEL.descriptionComponent);
  await expect(page.locator(`${SEL.descriptionComponent}:visible`).first()).toContainText(text);
});
