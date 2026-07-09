import { test } from '@playwright/test';
import {
  exerciseBarcodeFallbackInputRequiredAndSubmitThroughUi,
  exerciseCameraFallbackImageSelectionRequiredAndSubmitThroughUi,
  exerciseImportFileModalSelectionSizeAndSubmitThroughUi,
  exerciseLocationAcceptedPermissionValueAndSubmitThroughUi,
  exerciseLocationRefusedPermissionBlocksSubmitThroughUi,
  exerciseSignatureDrawClearRequiredAndSubmitThroughUi,
  submitPublishedMediaComponentsThroughUi,
} from './helpers/functional-components-media';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional media components', () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-FILE-001 - Import file modal selection size limit and submission', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseImportFileModalSelectionSizeAndSubmitThroughUi(page);
  });

  test('CMP-SIGN-001 - Signature draw clear required validation and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseSignatureDrawClearRequiredAndSubmitThroughUi(page);
  });

  test('CMP-BARCODE-001 - Barcode fallback input required validation and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseBarcodeFallbackInputRequiredAndSubmitThroughUi(page);
  });

  test('CMP-CAMERA-001 - Camera fallback image selection required validation and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCameraFallbackImageSelectionRequiredAndSubmitThroughUi(page);
  });

  test('CMP-LOCATION-001 - Location accepted permission value and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseLocationAcceptedPermissionValueAndSubmitThroughUi(page);
  });

  test('CMP-LOCATION-001 - Location refused permission blocks required submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseLocationRefusedPermissionBlocksSubmitThroughUi(page);
  });

  test('PUB-008 - published media components submission', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await submitPublishedMediaComponentsThroughUi(page);
  });
});
