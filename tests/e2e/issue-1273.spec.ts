import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectButtonRenderedLabel,
  login,
  openComponentConfig,
  openEditor,
  openPreview,
  setButtonLabel,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1273
 * "Button label cannot be renamed".
 *
 * Broken version: 2.2.0-beta104, the latest release before the issue was
 * opened because the ticket has no Version field. Fixed by 1d439742 and
 * b1f19461, validated OK in 2.2.0-beta112.
 *
 * Root cause: the Button style Label field initially invoked the generated
 * ETS1741100029494 handler instead of updating config.label. Follow-up fixes
 * wired the field to setButtonConfig, then committed the shared TextInputSetting
 * value on blur so the editor state is refreshed without breaking typing.
 *
 * The C8oForms form is built only through Studio UI: blank form creation,
 * Button insertion from the palette, Button style Label edit, Preview opening,
 * and editor reopening. No form document writes or fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1273 - Button label changes apply in editor, preview, and after reopen', async ({ page }) => {
  const label = `Button 1273 ${Date.now()}`;
  let formId = '';

  await test.step('Create a blank form with a Button component', async () => {
    await login(page);
    formId = await createBlankForm(page, `Issue 1273 button label ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  });

  await test.step('Rename the Button label from the style configuration', async () => {
    await openComponentConfig(page, SEL.buttonComponent);
    await setButtonLabel(page, label);
    await closeComponentConfig(page);
  });

  await expectButtonRenderedLabel(page, label, 'editor');

  await test.step('Open Preview and assert the renamed Button label', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expectButtonRenderedLabel(page, label, 'viewer');
  });

  await test.step('Reopen the editor and assert the renamed Button label persisted', async () => {
    await openEditor(page, formId);
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await expectButtonRenderedLabel(page, label, 'editor');
  });
});
