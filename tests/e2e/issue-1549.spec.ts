import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  authorDescriptionWithArialBoldThroughUi,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1549
 * Intended fix 75fb84d20 first shipped in 2.2.0-beta345.
 * The HugeRTE editor used a generic default font, while the viewer used IBM
 * Plex Sans. A bold child of an Arial span also reverted to IBM Plex Sans in
 * the viewer. The fix aligns the editor default and lets rich-text children
 * inherit an explicitly selected font. All content is authored through Studio.
 * Red on beta343, beta349 and test-nocode beta373: Angular scopes the viewer
 * selector to _ngcontent-* nodes, but HugeRTE's rendered children lack them.
 */

test.setTimeout(240_000);

test('#1549 - Description fonts match between rich-text editing and preview', async ({ page }) => {
  await test.step('Create a Description through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1549 ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await page.locator(SEL.descriptionComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.descriptionComponent);
  });

  const fonts = await authorDescriptionWithArialBoldThroughUi(page, 'Arial bold word', 'Default second paragraph');
  expect(fonts.editorBoldFont.toLowerCase(), 'Arial should be visible on the bold word while editing').toContain('arial');

  await closeComponentConfig(page);
  await openPreview(page, SEL.descriptionComponent);
  const rendered = page.locator(`${SEL.descriptionComponent}:visible`).first();
  const bold = rendered.locator('strong').first();
  const second = rendered.locator('p').nth(1);
  await expect(bold).toContainText('Arial');
  await expect(second).toContainText('Default second paragraph');
  const previewBoldFont = await bold.evaluate((el) => getComputedStyle(el).fontFamily);
  const previewDefaultFont = await second.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(previewBoldFont, 'the bold word should keep its Arial font in Preview').toBe(fonts.editorBoldFont);
  expect(previewDefaultFont, 'the default paragraph should use the same font as the editor').toBe(fonts.editorDefaultFont);
});
