import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectSliderBoundaryLabelsInConfig,
  login,
  openComponentConfig,
  setSliderBoundaryLabels,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1292
 * "Slider component configuration: Min Label and Max Label fields are missing
 * in Data & Interactions".
 *
 * Broken version: 2.2.0-beta111. Slider boundary label fields were first added
 * by 0c6c0567 in 2.2.0-beta116; follow-up 104d59e2 in 2.2.0-beta124 fixed the
 * shared TextInputSetting draft behavior reported in the ticket comments. The
 * ticket was validated OK in 2.2.0-beta127.
 *
 * Root cause: SliderDataInteractionsEditor exposed Min, Max and Step settings
 * but omitted the TextInputSetting instances bound to config.sliderLeftLabel
 * and config.sliderRightLabel, so users could not configure slider boundary
 * labels from the Data & Interactions panel.
 *
 * The C8oForms form is built only through Studio UI: blank form creation,
 * Slider insertion from the palette, Slider Data & Interactions editing, panel
 * close and reopen. No form document writes or fixture shortcuts are used.
 */

test.setTimeout(120_000);

test('#1292 - Slider Min Label and Max Label settings are available and persist', async ({ page }) => {
  const labels = {
    min: `Left 1292 ${Date.now()}`,
    max: `Right 1292 ${Date.now()}`,
  };

  await test.step('Create a blank form with a Slider component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1292 slider labels ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.slider, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.sliderComponent), 'the Slider component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
  });

  await test.step('Configure Slider boundary labels', async () => {
    await openComponentConfig(page, SEL.sliderComponent);
    await setSliderBoundaryLabels(page, labels);
    await closeComponentConfig(page);
  });

  await test.step('Reopen Slider configuration and assert labels persisted', async () => {
    await openComponentConfig(page, SEL.sliderComponent);
    await expectSliderBoundaryLabelsInConfig(page, labels);
  });
});
