import { test } from './fixtures';
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
    test.setTimeout(420_000);
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

  /**
   * #1280: reported while beta104 was current (timing inference). The reopened
   * Location case was fixed by 986b5c81 then e0dd7e2e, first shipped and
   * historically QA-validated in beta116. Automated E2E coverage was
   * runtime-validated against test-nocode 2.2.0-beta371.
   */
  test('CMP-LOCATION-001 #1280 - Location action style, accepted permission, value and submission', async ({ page }) => {
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
