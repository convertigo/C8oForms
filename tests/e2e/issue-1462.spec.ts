import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  buttonPreviewStyleState,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setButtonNormalAppearance,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1462
 *
 * Broken version: 2.2.0-beta284. The local fix has not been released yet.
 *
 * Root cause: the normal Button Viewer lost the style adapter that maps the
 * configured background/text colors to Ionic's --background and --color custom
 * properties during the #1411 style cleanup. Preview therefore fell back to
 * the default blue/white Ionic theme. The Viewer host also did not explicitly
 * occupy its available height, which made vertical alignment ineffective in
 * containers that stretch their children.
 *
 * The fixture is built only through Studio UI: blank form creation, Button
 * insertion from the component palette, color-picker Hex input, alignment
 * switches, and Preview opening. No form document writes or fixture shortcuts
 * are used.
 */

test.setTimeout(180_000);

test('#1462 - Flow Button keeps its normal colors and alignment in Preview', async ({ page }) => {
  const textColor = '#ff0000';
  const backgroundColor = '#00ff00';

  await test.step('Create a blank form with a Flow Button', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1462 Flow Button ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.buttonComponent).first(), 'the Flow Button should be added through the palette').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Configure normal-mode colors and bottom-right alignment', async () => {
    await openComponentConfig(page, SEL.buttonComponent);
    await setButtonNormalAppearance(page, {
      textColor,
      backgroundColor,
      justify: 'flex-end',
      align: 'flex-end',
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and assert the rendered Ionic Button style', async () => {
    await openPreview(page, SEL.buttonComponent);
    const state = await buttonPreviewStyleState(page);

    expect(state.cssBackground, 'Preview should bind the configured background to Ionic --background').toBe(
      backgroundColor,
    );
    expect(state.cssColor, 'Preview should bind the configured text color to Ionic --color').toBe(textColor);
    expect(state.nativeBackground, 'Preview should visibly render the configured green background').toBe(
      'rgb(0, 255, 0)',
    );
    expect(state.nativeColor, 'Preview should visibly render the configured red text/icon color').toBe(
      'rgb(255, 0, 0)',
    );
    expect(state.justifyContent, 'Preview should keep the right justification').toBe('flex-end');
    expect(state.alignItems, 'Preview should keep the bottom alignment').toBe('flex-end');
    expect(state.hostHeight, 'the Viewer host should expose a usable height for alignment').not.toBe('auto');
  });
});
