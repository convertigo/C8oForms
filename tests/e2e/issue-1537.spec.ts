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
  uploadButtonAdvancedSvgThroughImageDialog,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1537
 * Reported in 2.2.0-beta341 and fixed by 89be681d3 in beta344.
 * HugeRTE's image dialog omitted SVG from images_file_types, so the Upload tab
 * rejected a valid image even though the quick-insert route accepted it.
 * The Button and its rich label are configured only through Studio UI.
 * Red on test-repro beta343; green on test-repro beta349 and test-nocode beta373.
 */

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#008577"/></svg>';

test.setTimeout(240_000);

test('#1537 - SVG upload through the Button advanced editor image dialog', async ({ page }) => {
  await test.step('Create a Button through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1537 ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
  });

  const image = await uploadButtonAdvancedSvgThroughImageDialog(page, SVG);
  await expect(image, 'the uploaded SVG should be inserted into the Button rich label').toBeVisible({ timeout: 15_000 });

  await closeComponentConfig(page);
  await openPreview(page, SEL.buttonComponent);
  const rendered = page.locator(`${SEL.buttonComponent} img[src^="data:image/svg+xml"]`).first();
  await expect(rendered, 'the uploaded SVG should render in the Button preview').toBeVisible({ timeout: 20_000 });
  await expect.poll(() => rendered.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
