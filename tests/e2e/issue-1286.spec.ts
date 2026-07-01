import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectSliderBoundsUseNumberInputs,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1286
 * "Slider component: Min and Max fields are not numeric inputs".
 *
 * Broken version: 2.2.0-beta106. Fixed by e232a29f, first released and
 * validated OK in 2.2.0-beta108.
 *
 * Root cause: SliderDataInteractionsEditor passed type="number" to the shared
 * TextInputSetting only for Step. Min value and Max value kept the default text
 * input type, so non-numeric input could transiently become NaN before being
 * cleared. The fix wires Min and Max to the same native numeric input type.
 *
 * The C8oForms form is built only through Studio UI: blank form creation,
 * Slider insertion from the palette, component configuration opening, and
 * Data & Interactions inspection. No form document writes or fixture shortcuts
 * are used.
 */

test.setTimeout(120_000);

test('#1286 - Slider Min and Max settings use numeric inputs like Step', async ({ page }) => {
  await test.step('Create a blank form with a Slider component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1286 slider numeric inputs ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.slider, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.sliderComponent), 'the Slider component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
  });

  await test.step('Open Slider Data & Interactions and assert numeric bounds inputs', async () => {
    await openComponentConfig(page, SEL.sliderComponent);
    await expectSliderBoundsUseNumberInputs(page);
  });
});
