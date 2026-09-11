import { test } from '@playwright/test';
import {
  exerciseDateAlternateDisplayFormatThroughUi,
  exerciseDateDefaultBoundsFormatAndSubmitThroughUi,
  exerciseSliderBoundsLabelsAndViewerValueThroughUi,
  exerciseTimeAlternateDisplayFormatThroughUi,
  exerciseTimeDefaultFormatInputAndSubmitThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional date and time component values', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-SLIDER-001 - Slider bounds labels and viewer value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseSliderBoundsLabelsAndViewerValueThroughUi(page);
  });

  test('CMP-DATE-001 - Date default bounds format and submission', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDateDefaultBoundsFormatAndSubmitThroughUi(page);
  });

  test('CMP-DATE-001 - Date alternate display format persistence', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDateAlternateDisplayFormatThroughUi(page);
  });

  test.fixme('CMP-DATE-001 - Date alternate display format runtime rendering contract', async () => {
    // Requires a product contract: current exploration persisted YYYY/MM/DD but rendered DD/MM/YYYY in the viewer.
  });

  test('CMP-TIME-001 - Time default format input and submission', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTimeDefaultFormatInputAndSubmitThroughUi(page);
  });

  test('CMP-TIME-001 - Time alternate display format persistence', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTimeAlternateDisplayFormatThroughUi(page);
  });

  test.fixme('CMP-TIME-001 - Time alternate display format runtime rendering contract', async () => {
    // Requires a product contract: current exploration persisted hh:mm:ss:A but opened a 24-hour viewer picker.
  });
});
