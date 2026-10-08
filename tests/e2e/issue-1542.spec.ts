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
  writeRichTextClipboard,
} from './helpers/studio';

/**
 * Regression for https://github.com/convertigo/C8oForms/issues/1542.
 * Pasted rich text could retain an image's file:// URL from the author's disk.
 * Fix 25497b1f8 filters local file references, first in beta344. Clipboard
 * setup is browser support; the form is manipulated only through Studio UI.
 * Red on test-repro beta343; green on beta349 and test-nocode beta375.
 */
test.setTimeout(240_000);

test('#1542 - pasted local-file image is removed from Description rich text', async ({ page }) => {
  const before = `Before 1542 ${Date.now()}`;
  const after = 'After 1542';
  const localFileUrl = 'file:///C:/Users/Author/Downloads/issue-1542.svg';
  await test.step('Create a Description in Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1542 ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await page.locator(SEL.descriptionComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.descriptionComponent);
  });

  await writeRichTextClipboard(page, {
    text: `${before} ${after}`,
    html: `<p>${before}<img src="${localFileUrl}" alt="local author file">${after}</p>`,
  });
  const body = page.frameLocator('iframe.tox-edit-area__iframe').locator('body').first();
  await body.click();
  await page.keyboard.press('Control+V');
  await expect(body, 'the rich-text HTML payload must actually be pasted').toContainText(before);
  expect(await body.evaluate((el) => el.innerHTML), 'the local file URL must not remain in editor HTML').not.toContain(localFileUrl);
  await expect(body.locator('img[src^="file:"]'), 'a file URL must not be persisted in rich text').toHaveCount(0);

  await closeComponentConfig(page);
  await openPreview(page, SEL.descriptionComponent);
  const rendered = page.locator(`${SEL.descriptionComponent}:visible`).first();
  await expect(rendered).toContainText(before);
  await expect(rendered.locator('img[src^="file:"]')).toHaveCount(0);
});
