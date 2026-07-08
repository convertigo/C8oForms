import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectButtonRenderedHtmlLabel,
  login,
  openComponentConfig,
  openPreview,
  setButtonAdvancedRichLabel,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1431
 * "Add a TinyMCE editing mode for the Button component".
 *
 * Reported in 2.2.0-beta242. Commit c6943fca adds the Button display mode
 * switch, the advanced TinyMCE HTML editor, and the viewer [innerHTML] rendering;
 * it first shipped in 2.2.0-beta248 and was validated OK in that release.
 *
 * Root cause: before #1431, Button labels were edited as plain text only. There
 * was no advanced display mode, no Button-specific TinyMCE editor, and the
 * viewer rendered config.label as text instead of rich HTML.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button, switch its display mode from the Button style panel, edit the label
 * with the advanced HTML editor, close the config panel, and open Preview. No
 * form document writes or fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1431 - Button advanced mode renders the TinyMCE HTML label in editor and preview', async ({ page }) => {
  const buttonId = 'button_tinymce_1431';
  const richLabel = { boldText: 'Button 1431', italicText: 'TinyMCE label saved' };
  const expected = {
    texts: [richLabel.boldText, richLabel.italicText],
    htmlPattern: /<strong[^>]*>\s*Button 1431\s*<\/strong>[\s\S]*<em[^>]*>\s*TinyMCE label saved\s*<\/em>/i,
  };

  await test.step('Create a blank form with a Button component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1431 button TinyMCE ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  });

  await test.step('Configure the Button label through the advanced TinyMCE editor', async () => {
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, buttonId);
    await setButtonAdvancedRichLabel(page, richLabel);
    await closeComponentConfig(page);
  });

  await expectButtonRenderedHtmlLabel(page, expected, 'editor');

  await test.step('Open Preview and assert the Button keeps its rich HTML label', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expectButtonRenderedHtmlLabel(page, expected, 'viewer');
  });
});
