import { expect, test } from '@playwright/test';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  openConfigTabById,
  setTechnicalId,
  expectChartHeightModeSelected,
  expectChartPersonalizedHeightInput,
  selectChartHeightMode,
  setChartPersonalizedHeight,
} from './helpers/studio';

/**
 * Current-behavior coverage for https://github.com/convertigo/C8oForms/issues/1382
 * "Chart component height field does not allow entering auto although the UI suggests it".
 *
 * Reported on 2.2.0-beta169. Fix e0cb72ac introduced a Chart height mode toggle
 * with Automatic and Personalized modes, hiding the numeric height field when
 * config.height is "auto" and restoring an editable numeric height in Personalized
 * mode.
 *
 * This intentionally does not run a historical RED against beta169: the old UI had
 * only a numeric field, while the supported behavior to preserve is the new mode
 * switch. The form fixture is built entirely through the No Code Studio UI.
 */
test('#1382 - Chart height can toggle Automatic/Personalized and edit the personalized value', async ({ page }) => {
  test.setTimeout(120_000);

  await test.step('Create a blank form with a Chart component', async () => {
    await login(page);
    await createBlankForm(page, `Repro 1382 ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.chart);
    await expect(page.locator(SEL.chartComponent).first(), 'Chart component should be added to the canvas').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Open the Chart Data & Interactions configuration', async () => {
    await openComponentConfig(page, SEL.chartComponent);
    await setTechnicalId(page, 'chart_height_1382');
    await openConfigTabById(page, 'data_interactions');
    await expectChartHeightModeSelected(page, 'auto');
    await expectChartPersonalizedHeightInput(page, false);
  });

  await selectChartHeightMode(page, 'personalized');
  await expectChartPersonalizedHeightInput(page, true);
  await setChartPersonalizedHeight(page, '520');

  await selectChartHeightMode(page, 'auto');
  await expectChartPersonalizedHeightInput(page, false);

  await selectChartHeightMode(page, 'personalized');
  await expectChartPersonalizedHeightInput(page, true);
  await setChartPersonalizedHeight(page, '640');
});
