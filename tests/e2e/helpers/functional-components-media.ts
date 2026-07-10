import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  c8oCall,
  closeComponentConfig,
  createBlankForm,
  openComponentConfig,
  openConfigTabById,
  openComponentsPalette,
  openPublishedViewer,
  openPreview,
  publishCurrentFormWithPwa,
  setTechnicalId,
  submitViewerForm,
} from './studio';

type JsonRecord = Record<string, unknown>;

const MEDIA_SEL = {
  barcodePlaceholderInput: 'c8oforms-textinputsetting.class1776351000004 input, .class1776351000004 input',
  barcodeMandatoryToggle: 'c8oforms-toggleswitch.class1776351000013:visible, .class1776351000013:visible',
  cameraMaxSizeInput: 'c8oforms-textinputsetting.class1776361000031 input, .class1776361000031 input',
  cameraMandatoryToggle: 'c8oforms-toggleswitch.class1776361000040:visible, .class1776361000040:visible',
  fileMultipleToggle: 'c8oforms-toggleswitch.class1776501400004:visible, .class1776501400004:visible',
  fileMaxSizeInput: 'c8oforms-textinputsetting.class1776501400013 input, .class1776501400013 input',
  locationPlaceholderInput: 'c8oforms-textinputsetting.class1776361300004 input, .class1776361300004 input',
  locationMandatoryToggle: 'c8oforms-toggleswitch.class1776361300049:visible, .class1776361300049:visible',
  locationReturnedValueToggle: 'c8oforms-toggleswitch.class1776501500004:visible, .class1776501500004:visible',
  locationAutoPositionToggle: 'c8oforms-toggleswitch.class1776501500024:visible, .class1776501500024:visible',
  locationCorrespondingAddressToggle: 'c8oforms-toggleswitch.class1776501500033:visible, .class1776501500033:visible',
  uploadModal: 'ion-modal.modal-custom-import-file:not(.overlay-hidden), ion-modal:not(.overlay-hidden)',
  fileInput: 'input#file-input[type="file"], input[type="file"]',
  signatureMandatoryToggle: 'c8oforms-toggleswitch.class1776361200004:visible, .class1776361200004:visible',
} as const;

const BARCODE_COMPONENT = 'c8oforms-itembarcodeviewver';
const CAMERA_COMPONENT = 'c8oforms-itemimgviewer';
const LOCATION_COMPONENT = 'c8oforms-itemlocationviewer';
const SIGNATURE_COMPONENT = 'c8oforms-itemsignatureviewver';
const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l7sXxQAAAABJRU5ErkJggg==',
  'base64',
);

export async function exerciseImportFileModalSelectionSizeAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_file_${suffix}`;
  const maxSizeMb = '1';
  const rejectedFileName = `functional-too-large-${suffix}.txt`;
  const acceptedFileName = `functional-upload-${suffix}.txt`;

  await test.step('Create an Import file component and configure a max size', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.file);
    await addComponent(page, PALETTE_ICON.file, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.fileComponent}:visible`).first(), 'Import file component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.fileComponent);
    await setTechnicalId(page, technicalId);
    await openImportFileSubmissionTab(page);
    await setImportFileMaxSize(page, maxSizeMb);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the dedicated upload modal contract', async () => {
    await openPreview(page, SEL.fileComponent);
    const modal = await openImportFileUploadModal(page);
    await expectImportFileModalContract(modal);

    await selectUploadModalFile(modal, {
      name: rejectedFileName,
      mimeType: 'text/plain',
      buffer: Buffer.alloc(1_100_000, 'x'),
    });
    await expectModalFileAbsent(modal, rejectedFileName, 'oversized file should be refused by the configured max size');

    await selectUploadModalFile(modal, {
      name: acceptedFileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(`Functional upload ${suffix}`),
    });
    await expect(modal, 'accepted file should appear in the upload modal list').toContainText(acceptedFileName, {
      timeout: 15_000,
    });

    await confirmUploadModal(modal);
  });

  await test.step('Verify the accepted file is shown in the viewer and submit the response', async () => {
    const component = await visibleImportFileComponent(page, technicalId);
    await expect(component, 'Import file component should render the accepted file name').toContainText(acceptedFileName, {
      timeout: 30_000,
    });

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Import file response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseSignatureDrawClearRequiredAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_signature_${suffix}`;

  await test.step('Create a required Signature component', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.signature);
    await addComponent(page, PALETTE_ICON.signature, { allowEditorApiFallback: false });
    await expect(page.locator(`${SIGNATURE_COMPONENT}:visible`).first(), 'Signature component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SIGNATURE_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setSignatureMandatory(page, true);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify a required empty Signature blocks submission', async () => {
    await openPreview(page, SIGNATURE_COMPONENT);
    const component = await visibleSignatureComponent(page, technicalId);
    await expect(signatureCanvas(component), 'Signature canvas should be visible').toBeVisible({ timeout: 30_000 });

    await clickViewerSubmitWithoutCompletionWait(page);
    await expect(page.locator(SEL.responseCompletedPage), 'empty required Signature should block submission').toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(component, 'blocked submission should keep the Signature component visible').toBeVisible({
      timeout: 10_000,
    });
  });

  await test.step('Draw a signature, clear it, then draw again and submit', async () => {
    const component = await visibleSignatureComponent(page, technicalId);
    await drawSignature(component);
    await expectSignatureCanvasBlank(component, false, 'drawn signature should mark the canvas');

    await clearSignature(component);
    await expectSignatureCanvasBlank(component, true, 'clear action should reset the Signature canvas');

    await drawSignature(component);
    await expectSignatureCanvasBlank(component, false, 'redrawn signature should mark the canvas before submission');

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Signature response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseBarcodeFallbackInputRequiredAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_barcode_${suffix}`;
  const placeholder = `Functional barcode placeholder ${suffix}`;
  const barcodeValue = `FUNCTIONAL-BARCODE-${suffix}`;

  await test.step('Create a required Barcode component with a configured placeholder', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.barcode);
    await addComponent(page, PALETTE_ICON.barcode, { allowEditorApiFallback: false });
    await expect(page.locator(`${BARCODE_COMPONENT}:visible`).first(), 'Barcode component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, BARCODE_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setBarcodeDataInteractionValues(page, { placeholder, mandatory: true });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Barcode fallback input and required validation', async () => {
    await openPreview(page, BARCODE_COMPONENT);
    const component = await visibleBarcodeComponent(page, technicalId);
    const input = barcodeInput(component);
    await expect(input, 'Barcode fallback input should be visible').toBeVisible({ timeout: 30_000 });
    await expect(input, 'Barcode fallback input should render the configured placeholder').toHaveAttribute('placeholder', placeholder, {
      timeout: 15_000,
    });
    await expect(component.locator('ion-button:visible'), 'Barcode should expose scan/image action buttons').toHaveCount(2, {
      timeout: 15_000,
    });

    await clickViewerSubmitWithoutCompletionWait(page);
    await expect(page.locator(SEL.responseCompletedPage), 'empty required Barcode should block submission').toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(component, 'blocked submission should keep the Barcode component visible').toBeVisible({ timeout: 10_000 });
  });

  await test.step('Fill the Barcode fallback value and submit the response', async () => {
    const component = await visibleBarcodeComponent(page, technicalId);
    const input = barcodeInput(component);
    await input.fill(barcodeValue);
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');
    await input.blur();
    await expect(input, 'Barcode fallback input should keep the produced value').toHaveValue(barcodeValue, {
      timeout: 15_000,
    });

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Barcode response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseCameraFallbackImageSelectionRequiredAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_camera_${suffix}`;
  const fileName = `functional-camera-${suffix}.png`;

  await test.step('Create a required Camera component with a configured max size', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.camera);
    await addComponent(page, PALETTE_ICON.camera, { allowEditorApiFallback: false });
    await expect(page.locator(`${CAMERA_COMPONENT}:visible`).first(), 'Camera component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, CAMERA_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setCameraDataInteractionValues(page, { maxSizeMb: '1', mandatory: true });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify empty required Camera blocks submission', async () => {
    await openPreview(page, CAMERA_COMPONENT);
    const component = await visibleCameraComponent(page, technicalId);
    await expect(cameraFileInput(component), 'Camera should expose a hidden image file input fallback').toBeAttached({
      timeout: 30_000,
    });
    await expect
      .poll(() => cameraActionButtons(component).count(), {
        message: 'Camera should expose capture or gallery action buttons',
        timeout: 15_000,
      })
      .toBeGreaterThan(0);

    await clickViewerSubmitWithoutCompletionWait(page);
    await expect(page.locator(SEL.responseCompletedPage), 'empty required Camera should block submission').toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(component, 'blocked submission should keep the Camera component visible').toBeVisible({ timeout: 10_000 });
  });

  await test.step('Select an image through the Camera fallback input and verify preview rendering', async () => {
    const component = await visibleCameraComponent(page, technicalId);
    const input = cameraFileInput(component);
    await input.setInputFiles({
      name: fileName,
      mimeType: 'image/png',
      buffer: TINY_PNG_BUFFER,
    });
    await input.dispatchEvent('change');
    await expectCameraPreviewFromSelectedFile(component);
  });

  await test.step('Submit the response with the selected Camera image', async () => {
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Camera response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function submitPublishedMediaComponentsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const title = `Functional published media ${suffix}`;
  const fileTechnicalId = `functional_pub_file_${suffix}`;
  const cameraTechnicalId = `functional_pub_camera_${suffix}`;
  const barcodeTechnicalId = `functional_pub_barcode_${suffix}`;
  const signatureTechnicalId = `functional_pub_signature_${suffix}`;
  const uploadFileNames = [
    `functional-published-upload-a-${suffix}.txt`,
    `functional-published-upload-b-${suffix}.txt`,
  ];
  const cameraFileName = `functional-published-camera-${suffix}.png`;
  const barcodeValue = `FUNCTIONAL-PUBLISHED-BARCODE-${suffix}`;
  let formId = '';

  await test.step('Create an application with published media components', async () => {
    formId = await createBlankForm(page, title);

    await openComponentsPalette(page, PALETTE_ICON.file);
    await addComponent(page, PALETTE_ICON.file, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.fileComponent}:visible`).first(), 'published Import file component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.fileComponent);
    await setTechnicalId(page, fileTechnicalId);
    await openImportFileSubmissionTab(page);
    await setImportFileMultiple(page, true);
    await setImportFileMaxSize(page, '1');
    await closeComponentConfig(page);

    await openComponentsPalette(page, PALETTE_ICON.camera);
    await addComponent(page, PALETTE_ICON.camera, { allowEditorApiFallback: false });
    await expect(page.locator(`${CAMERA_COMPONENT}:visible`).first(), 'published Camera component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, CAMERA_COMPONENT);
    await setTechnicalId(page, cameraTechnicalId);
    await setCameraDataInteractionValues(page, { maxSizeMb: '1', mandatory: false });
    await closeComponentConfig(page);

    await openComponentsPalette(page, PALETTE_ICON.barcode);
    await addComponent(page, PALETTE_ICON.barcode, { allowEditorApiFallback: false });
    await expect(page.locator(`${BARCODE_COMPONENT}:visible`).first(), 'published Barcode component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, BARCODE_COMPONENT);
    await setTechnicalId(page, barcodeTechnicalId);
    await setBarcodeDataInteractionValues(page, {
      placeholder: `Functional published barcode ${suffix}`,
      mandatory: false,
    });
    await closeComponentConfig(page);

    await openComponentsPalette(page, PALETTE_ICON.signature);
    await addComponent(page, PALETTE_ICON.signature, { allowEditorApiFallback: false });
    await expect(page.locator(`${SIGNATURE_COMPONENT}:visible`).first(), 'published Signature component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SIGNATURE_COMPONENT);
    await setTechnicalId(page, signatureTechnicalId);
    await setSignatureMandatory(page, false);
    await closeComponentConfig(page);
  });

  await test.step('Publish the media application as an anonymous PWA', async () => {
    await publishCurrentFormWithPwa(page, 'anonymous');
  });

  await test.step('Open the published viewer and fill media values', async () => {
    await openPublishedViewer(page, formId, SEL.fileComponent);

    const modal = await openImportFileUploadModal(page);
    await expectImportFileModalContract(modal, { expectedMultiple: true });
    await selectUploadModalFiles(
      modal,
      uploadFileNames.map((name, index) => ({
        name,
        mimeType: 'text/plain',
        buffer: Buffer.from(`Functional published upload ${index + 1} ${suffix}`),
      })),
    );
    for (const uploadFileName of uploadFileNames) {
      await expect(modal, `published Import file should list ${uploadFileName}`).toContainText(uploadFileName, {
        timeout: 15_000,
      });
    }
    await confirmUploadModal(modal);
    const fileComponent = await visibleImportFileComponent(page, fileTechnicalId);
    for (const uploadFileName of uploadFileNames) {
      await expect(fileComponent, `published Import file should render ${uploadFileName}`).toContainText(uploadFileName, {
        timeout: 30_000,
      });
    }

    const cameraComponent = await visibleCameraComponent(page, cameraTechnicalId);
    await cameraFileInput(cameraComponent).setInputFiles({
      name: cameraFileName,
      mimeType: 'image/png',
      buffer: TINY_PNG_BUFFER,
    });
    await cameraFileInput(cameraComponent).dispatchEvent('change');
    await expectCameraPreviewFromSelectedFile(cameraComponent);

    const barcodeComponent = await visibleBarcodeComponent(page, barcodeTechnicalId);
    const input = barcodeInput(barcodeComponent);
    await input.fill(barcodeValue);
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');
    await input.blur();
    await expect(input, 'published Barcode fallback value should persist before submission').toHaveValue(barcodeValue, {
      timeout: 15_000,
    });

    const signatureComponent = await visibleSignatureComponent(page, signatureTechnicalId);
    await drawSignature(signatureComponent);
    await expectSignatureCanvasBlank(signatureComponent, false, 'published Signature should contain a drawn value before submission');
  });

  await test.step('Submit the published media response', async () => {
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'published media response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });

  await test.step('Verify the published media response is stored with downloadable attachments', async () => {
    await expectPublishedMediaResponseStored(page, {
      formId,
      fileTechnicalId,
      cameraTechnicalId,
      barcodeTechnicalId,
      signatureTechnicalId,
      uploadFileNames,
      barcodeValue,
    });
  });
}

export async function exerciseLocationAcceptedPermissionValueAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_location_${suffix}`;
  const placeholder = `Functional location placeholder ${suffix}`;
  const mockedPosition = {
    latitude: 48.8566,
    longitude: 2.3522,
    accuracy: 12,
  };

  await test.step('Create a required Location component configured to return GPS coordinates', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.location);
    await addComponent(page, PALETTE_ICON.location, { allowEditorApiFallback: false });
    await expect(page.locator(`${LOCATION_COMPONENT}:visible`).first(), 'Location component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, LOCATION_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setLocationDataInteractionValues(page, { placeholder, mandatory: true });
    await setLocationReturnedValueValues(page, { autoPosition: false, correspondingAddress: false });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview with accepted geolocation permission and verify the produced GPS value', async () => {
    const origin = new URL(page.url()).origin;
    await page.context().grantPermissions(['geolocation'], { origin });
    await page.context().setGeolocation(mockedPosition);

    await openPreview(page, LOCATION_COMPONENT);
    const component = await visibleLocationComponent(page, technicalId);
    await expect(component, 'Location component should initially show no GPS value before clicking the action').toContainText('n/a', {
      timeout: 30_000,
    });

    const button = locationActionButton(component);
    await expect(button, 'Location component should expose a get-position action button').toBeVisible({ timeout: 15_000 });
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));

    await expect(component, 'Location component should render the mocked latitude after permission is accepted').toContainText(
      String(mockedPosition.latitude),
      { timeout: 30_000 },
    );
    await expect(component, 'Location component should render the mocked longitude after permission is accepted').toContainText(
      String(mockedPosition.longitude),
      { timeout: 30_000 },
    );
  });

  await test.step('Submit the response with the produced Location value', async () => {
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Location response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

async function expectPublishedMediaResponseStored(
  page: Page,
  expected: {
    formId: string;
    fileTechnicalId: string;
    cameraTechnicalId: string;
    barcodeTechnicalId: string;
    signatureTechnicalId: string;
    uploadFileNames: string[];
    barcodeValue: string;
  },
): Promise<void> {
  const response = await waitForPublishedResponseContaining(page, expected.formId, expected.barcodeValue);
  const entries = responseEntries(response);
  const barcodeEntry = responseEntryByName(entries, expected.barcodeTechnicalId);
  expect(stringValues(barcodeEntry), 'stored published media response should contain the Barcode fallback value').toContain(
    expected.barcodeValue,
  );

  const fileAttachments = objectValues(responseEntryByName(entries, expected.fileTechnicalId));
  for (const uploadFileName of expected.uploadFileNames) {
    const fileAttachment = fileAttachments.find((value) => String(value.name ?? '') === uploadFileName);
    expect(fileAttachment, `stored published media response should reference imported file ${uploadFileName}`).toBeTruthy();
    await expectDownloadableAttachment(page, String(fileAttachment?.url ?? ''), /text\/plain|application\/octet-stream/i, 'Import file');
  }

  const cameraUrl = firstAttachmentUrl(responseEntryByName(entries, expected.cameraTechnicalId));
  await expectDownloadableAttachment(page, cameraUrl, /image\//i, 'Camera');

  const signatureEntry = responseEntryByName(entries, expected.signatureTechnicalId);
  expect(Boolean(signatureEntry.att_type), 'stored Signature response should be marked as an attachment').toBe(true);
  const signatureUrl = firstAttachmentUrl(signatureEntry);
  await expectDownloadableAttachment(page, signatureUrl, /image\/png/i, 'Signature');
}

async function waitForPublishedResponseContaining(page: Page, formId: string, expectedValue: string): Promise<JsonRecord> {
  const publishedId = formId.startsWith('published_') ? formId : `published_${formId}`;
  let lastResponse: JsonRecord = {};
  await expect
    .poll(
      async () => {
        lastResponse = await c8oCall(page, 'APIV2_getResponses', {
          formId: publishedId,
          summary: 'false',
          csv: 'false',
          meta: JSON.stringify({ limit: 5 }),
        });
        return JSON.stringify(responsePayload(lastResponse)).includes(expectedValue);
      },
      {
        message: 'APIV2_getResponses should expose the submitted published media response',
        timeout: 60_000,
      },
    )
    .toBe(true);
  return responsePayload(lastResponse);
}

function responsePayload(response: JsonRecord): JsonRecord {
  const document = response.document as JsonRecord | undefined;
  return ((response.res as JsonRecord | undefined) ?? (document?.res as JsonRecord | undefined) ?? response) as JsonRecord;
}

function responseEntries(response: JsonRecord): JsonRecord[] {
  const root = (response.response as JsonRecord | undefined) ?? {};
  const values = root.value;
  const nestedResponses = root.nestedResponses;
  const latestNested =
    Array.isArray(nestedResponses) && nestedResponses.length > 0
      ? nestedResponses[nestedResponses.length - 1]
      : [];
  return (Array.isArray(values) ? values : [])
    .filter(isJsonRecord)
    .map((entry, index) => {
      const nestedEntry = Array.isArray(latestNested) && isJsonRecord(latestNested[index]) ? latestNested[index] : null;
      const entryValues = responseValueArray(entry);
      if (entryValues.length > 0 || !nestedEntry) {
        return entry;
      }
      return { ...entry, value: nestedEntry.value };
    });
}

function responseEntryByName(entries: JsonRecord[], name: string): JsonRecord {
  const entry = entries.find((candidate) => String(candidate.name ?? candidate.id ?? '') === name);
  expect(entry, `stored response should include entry ${name}`).toBeTruthy();
  return entry ?? {};
}

function stringValues(entry: JsonRecord): string[] {
  return responseValueArray(entry).filter((value): value is string => typeof value === 'string');
}

function objectValues(entry: JsonRecord): JsonRecord[] {
  return responseValueArray(entry).filter(isJsonRecord);
}

function responseValueArray(entry: JsonRecord): unknown[] {
  const value = entry.value;
  if (Array.isArray(value)) {
    return value;
  }
  return value === undefined || value === null || value === '' ? [] : [value];
}

function firstAttachmentUrl(entry: JsonRecord): string {
  const candidates = responseValueArray(entry)
    .map((value) => {
      if (typeof value === 'string') {
        return value;
      }
      if (isJsonRecord(value)) {
        return String(value.url ?? '');
      }
      return '';
    })
    .filter(Boolean);
  expect(candidates[0], `stored response entry ${String(entry.name ?? entry.id ?? '')} should expose an attachment URL`).toBeTruthy();
  return candidates[0] ?? '';
}

async function expectDownloadableAttachment(
  page: Page,
  url: string,
  expectedContentType: RegExp,
  label: string,
): Promise<void> {
  expect(url, `${label} attachment URL should be present`).toMatch(/\/(?:fullsync|projects\/C8Oforms\/\.bin)/);
  const result = await page.evaluate(async (attachmentUrl) => {
    const response = await fetch(attachmentUrl, { credentials: 'include' });
    const bytes = await response.arrayBuffer();
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      byteLength: bytes.byteLength,
    };
  }, url);
  expect(result.ok, `${label} attachment download should succeed with HTTP ${result.status}`).toBe(true);
  expect(result.byteLength, `${label} attachment download should not be empty`).toBeGreaterThan(0);
  expect(result.contentType, `${label} attachment content type should match`).toMatch(expectedContentType);
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export async function exerciseLocationRefusedPermissionBlocksSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_location_refused_${suffix}`;
  const placeholder = `Functional refused location placeholder ${suffix}`;

  await test.step('Create a required Location component for refused permission', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.location);
    await addComponent(page, PALETTE_ICON.location, { allowEditorApiFallback: false });
    await expect(page.locator(`${LOCATION_COMPONENT}:visible`).first(), 'Location component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, LOCATION_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setLocationDataInteractionValues(page, { placeholder, mandatory: true });
    await setLocationReturnedValueValues(page, { autoPosition: false, correspondingAddress: false });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview with refused geolocation permission and verify no GPS value is produced', async () => {
    await openPreview(page, LOCATION_COMPONENT);
    await simulateRefusedGeolocationPermission(page);
    const component = await visibleLocationComponent(page, technicalId);
    await expect(component, 'Location component should initially show no GPS value before clicking the action').toContainText('n/a', {
      timeout: 30_000,
    });

    const button = locationActionButton(component);
    await expect(button, 'Location component should expose a get-position action button').toBeVisible({ timeout: 15_000 });
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
    await page.waitForTimeout(1_000);

    await expect(component, 'Location component should keep the empty GPS value after refused permission').toContainText('n/a', {
      timeout: 10_000,
    });
    await expect(component, 'Location component should not render latitude after refused permission').not.toContainText(/\d+\.\d+/, {
      timeout: 5_000,
    });
  });

  await test.step('Verify required submission remains blocked without a Location value', async () => {
    await clickViewerSubmitWithoutCompletionWait(page);
    await expect(page.locator(SEL.responseCompletedPage), 'refused required Location should block submission').toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(await visibleLocationComponent(page, technicalId), 'blocked submission should keep the Location component visible').toBeVisible({
      timeout: 10_000,
    });
  });
}

async function setCameraDataInteractionValues(
  page: Page,
  values: { maxSizeMb: string; mandatory: boolean },
): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  const maxSizeInput = page.locator(MEDIA_SEL.cameraMaxSizeInput).first();
  await expect(maxSizeInput, 'Camera max photo size setting should be visible').toBeVisible({ timeout: 15_000 });
  await maxSizeInput.fill(values.maxSizeMb);
  await maxSizeInput.dispatchEvent('input');
  await maxSizeInput.dispatchEvent('change');
  await maxSizeInput.blur();
  await expect(maxSizeInput, 'Camera max photo size setting should keep the configured value').toHaveValue(values.maxSizeMb, {
    timeout: 15_000,
  });
  await setToggleSwitch(page, MEDIA_SEL.cameraMandatoryToggle, values.mandatory, 'Camera mandatory');
}

async function openImportFileSubmissionTab(page: Page): Promise<void> {
  const tabs = page.locator(`${SEL.configTabsContainer} ${SEL.configTab}:visible`);
  await expect(tabs.first(), 'Import file configuration tabs should be visible').toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => tabs.count(), {
      message: 'Import file should expose Data & Interactions, File submissions, and Visibility tabs',
      timeout: 15_000,
    })
    .toBe(3);

  await tabs.nth(1).click({ timeout: 10_000 }).catch(async () => tabs.nth(1).dispatchEvent('click'));
  await expect(page.locator(MEDIA_SEL.fileMaxSizeInput).first(), 'Import file submissions tab should expose max size').toBeVisible({
    timeout: 15_000,
  });
}

async function setImportFileMaxSize(page: Page, value: string): Promise<void> {
  const input = page.locator(MEDIA_SEL.fileMaxSizeInput).first();
  await expect(input, 'Import file max size setting should be visible').toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  await input.blur();
  await expect(input, 'Import file max size setting should keep the configured value').toHaveValue(value, {
    timeout: 15_000,
  });
}

async function setImportFileMultiple(page: Page, enabled: boolean): Promise<void> {
  await setToggleSwitch(page, MEDIA_SEL.fileMultipleToggle, enabled, 'Import file multiple files');
}

async function openImportFileUploadModal(page: Page): Promise<Locator> {
  const component = page.locator(`${SEL.fileComponent}:visible`).first();
  await expect(component, 'Import file component should be visible in preview').toBeVisible({ timeout: 30_000 });
  await component.scrollIntoViewIfNeeded();

  const addFileButton = component.locator('ion-button:visible, button:visible').first();
  await expect(addFileButton, 'Import file component should expose an add-file button').toBeVisible({ timeout: 15_000 });
  await addFileButton.click({ timeout: 10_000 }).catch(async () => component.click({ timeout: 10_000 }));

  const modal = page.locator(MEDIA_SEL.uploadModal).last();
  await expect(modal, 'Import file click should open the upload modal').toBeVisible({ timeout: 30_000 });
  await expect(modal.locator(MEDIA_SEL.fileInput).first(), 'Import file modal should contain a file input').toBeAttached({
    timeout: 30_000,
  });
  return modal;
}

async function expectUploadModalMultipleState(modal: Locator, multiple: boolean): Promise<void> {
  await expect
    .poll(
      () =>
        modal.locator(MEDIA_SEL.fileInput).first().evaluate((element) => {
          return (element as HTMLInputElement).multiple;
        }),
      {
        message: `Import file modal input should be ${multiple ? 'multiple' : 'single-file'}`,
        timeout: 10_000,
      },
    )
    .toBe(multiple);
}

async function expectImportFileModalContract(
  modal: Locator,
  options: { expectedMultiple?: boolean } = {},
): Promise<void> {
  const expectedMultiple = options.expectedMultiple ?? false;
  const classList = await modal.evaluate((element) => [...(element as HTMLElement).classList]);
  expect(classList, 'Import file modal should use the dedicated upload modal class').toContain('modal-custom-import-file');
  expect(classList, 'Import file modal should not use the fullscreen application-import modal').not.toContain('alwaysFullScreen');

  const inputState = await modal.locator(MEDIA_SEL.fileInput).first().evaluate((element) => {
    const input = element as HTMLInputElement;
    return {
      accept: input.getAttribute('accept') ?? '',
      multiple: input.multiple,
    };
  });
  expect(inputState.accept, 'Import file upload should not be restricted to .c8oforms project imports').not.toContain(
    '.c8oforms',
  );
  expect(inputState.multiple, `Import file upload should be ${expectedMultiple ? 'multiple' : 'single-file'}`).toBe(
    expectedMultiple,
  );

  const modalText = (await modal.innerText({ timeout: 10_000 })).replace(/\s+/g, ' ').toLowerCase();
  expect(modalText, 'Import file upload modal should not display .c8oforms project import wording').not.toContain(
    '.c8oforms',
  );
}

async function selectUploadModalFile(
  modal: Locator,
  file: { name: string; mimeType: string; buffer: Buffer },
): Promise<void> {
  await selectUploadModalFiles(modal, [file]);
}

async function selectUploadModalFiles(
  modal: Locator,
  files: Array<{ name: string; mimeType: string; buffer: Buffer }>,
): Promise<void> {
  const input = modal.locator(MEDIA_SEL.fileInput).first();
  await expect(input, `file input should be ready for ${files.map((file) => file.name).join(', ')}`).toBeAttached({
    timeout: 10_000,
  });
  await input.setInputFiles(files);
  await modal.page().waitForTimeout(700);
}

async function expectModalFileAbsent(modal: Locator, fileName: string, message: string): Promise<void> {
  await expect
    .poll(() => modal.innerText().then((text) => text.includes(fileName)), {
      message,
      timeout: 5_000,
    })
    .toBe(false);
}

async function confirmUploadModal(modal: Locator): Promise<void> {
  const importButton = modal.locator('ion-button:visible:has(ion-icon)').last();
  await expect(importButton, 'Import file modal should expose a confirmation button').toBeVisible({ timeout: 15_000 });
  await importButton.click();
  await expect(modal, 'Import file modal should close after confirming a selected file').toBeHidden({ timeout: 30_000 });
}

async function visibleImportFileComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${SEL.fileComponent}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${SEL.fileComponent}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${SEL.fileComponent}:visible`).first();
  await expect(fallback, `Import file component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

async function setBarcodeDataInteractionValues(
  page: Page,
  values: { placeholder: string; mandatory: boolean },
): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  const placeholderInput = page.locator(MEDIA_SEL.barcodePlaceholderInput).first();
  await expect(placeholderInput, 'Barcode placeholder setting should be visible').toBeVisible({ timeout: 15_000 });
  await placeholderInput.fill(values.placeholder);
  await placeholderInput.dispatchEvent('input');
  await placeholderInput.dispatchEvent('change');
  await placeholderInput.blur();
  await expect(placeholderInput, 'Barcode placeholder setting should keep the configured value').toHaveValue(values.placeholder, {
    timeout: 15_000,
  });
  await setToggleSwitch(page, MEDIA_SEL.barcodeMandatoryToggle, values.mandatory, 'Barcode mandatory');
}

async function setLocationDataInteractionValues(
  page: Page,
  values: { placeholder: string; mandatory: boolean },
): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  const placeholderInput = page.locator(MEDIA_SEL.locationPlaceholderInput).first();
  await expect(placeholderInput, 'Location placeholder setting should be visible').toBeVisible({ timeout: 15_000 });
  await placeholderInput.fill(values.placeholder);
  await placeholderInput.dispatchEvent('input');
  await placeholderInput.dispatchEvent('change');
  await placeholderInput.blur();
  await expect(placeholderInput, 'Location placeholder setting should keep the configured value').toHaveValue(
    values.placeholder,
    {
      timeout: 15_000,
    },
  );
  await setToggleSwitch(page, MEDIA_SEL.locationMandatoryToggle, values.mandatory, 'Location mandatory');
}

async function setLocationReturnedValueValues(
  page: Page,
  values: { autoPosition: boolean; correspondingAddress: boolean },
): Promise<void> {
  await openLocationReturnedValueTab(page);
  await selectToggleSwitchOption(page, MEDIA_SEL.locationReturnedValueToggle, 1, 'Location returned value get_location');
  await setToggleSwitch(page, MEDIA_SEL.locationAutoPositionToggle, values.autoPosition, 'Location auto position');
  await setToggleSwitch(
    page,
    MEDIA_SEL.locationCorrespondingAddressToggle,
    values.correspondingAddress,
    'Location corresponding address',
  );
}

async function openLocationReturnedValueTab(page: Page): Promise<void> {
  const tabs = page.locator(`${SEL.configTabsContainer} ${SEL.configTab}:visible`);
  await expect(tabs.first(), 'Location configuration tabs should be visible').toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => tabs.count(), {
      message: 'Location should expose Data & Interactions, Returned value, Visibility, and Navigation tabs',
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(4);

  await tabs.nth(1).click({ timeout: 10_000 }).catch(async () => tabs.nth(1).dispatchEvent('click'));
  await expect(page.locator(MEDIA_SEL.locationReturnedValueToggle).first(), 'Location returned value tab should be visible').toBeVisible(
    {
      timeout: 15_000,
    },
  );
}

async function visibleBarcodeComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${BARCODE_COMPONENT}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${BARCODE_COMPONENT}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${BARCODE_COMPONENT}:visible`).first();
  await expect(fallback, `Barcode component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

function barcodeInput(component: Locator): Locator {
  return component.locator('ion-input:visible input:visible, input:visible').first();
}

async function visibleCameraComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${CAMERA_COMPONENT}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${CAMERA_COMPONENT}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${CAMERA_COMPONENT}:visible`).first();
  await expect(fallback, `Camera component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

function cameraFileInput(component: Locator): Locator {
  return component.locator('input[type="file"][accept="image/*"], input[type="file"]').first();
}

function cameraActionButtons(component: Locator): Locator {
  return component.locator('ion-button:visible:has(ion-icon[name="camera"]), ion-button:visible:has(ion-icon[name="image"])');
}

async function expectCameraPreviewFromSelectedFile(component: Locator): Promise<void> {
  await expect
    .poll(() => selectedCameraPreviewState(component), {
      message: 'Camera preview should render the selected fallback image as a blob URL',
      timeout: 30_000,
    })
    .toMatchObject({ loaded: true, usesSelectedFile: true });
}

async function selectedCameraPreviewState(component: Locator): Promise<{ loaded: boolean; usesSelectedFile: boolean }> {
  return component.evaluate((root) => {
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const images = [...root.querySelectorAll('img')].filter(visible) as HTMLImageElement[];
    return {
      loaded: images.some((image) => image.complete && image.naturalWidth > 0),
      usesSelectedFile: images.some((image) => image.currentSrc.startsWith('blob:') || image.src.startsWith('blob:')),
    };
  });
}

async function visibleLocationComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${LOCATION_COMPONENT}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${LOCATION_COMPONENT}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${LOCATION_COMPONENT}:visible`).first();
  await expect(fallback, `Location component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

function locationActionButton(component: Locator): Locator {
  return component.locator('ion-button:visible:has(ion-icon[name="location-outline"]), ion-button:visible').first();
}

async function simulateRefusedGeolocationPermission(page: Page): Promise<void> {
  await page.evaluate(() => {
    const deniedError = {
      code: 1,
      message: 'User denied Geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };
    const deniedGeolocation = {
      getCurrentPosition: (_success: PositionCallback, error?: PositionErrorCallback) => {
        window.setTimeout(() => error?.(deniedError as GeolocationPositionError), 0);
      },
      watchPosition: (_success: PositionCallback, error?: PositionErrorCallback) => {
        window.setTimeout(() => error?.(deniedError as GeolocationPositionError), 0);
        return 0;
      },
      clearWatch: () => undefined,
    };
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: deniedGeolocation,
    });
  });
}

async function setSignatureMandatory(page: Page, required: boolean): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  await setToggleSwitch(page, MEDIA_SEL.signatureMandatoryToggle, required, 'Signature mandatory');
}

async function setToggleSwitch(page: Page, selector: string, enabled: boolean, description: string): Promise<void> {
  await selectToggleSwitchOption(page, selector, enabled ? 0 : 1, `${description} toggle ${enabled ? 'Yes' : 'No'}`);
}

async function selectToggleSwitchOption(
  page: Page,
  selector: string,
  optionIndex: number,
  description: string,
): Promise<void> {
  const toggle = page.locator(selector).first();
  await expect(toggle, `${description} toggle should be visible`).toBeVisible({ timeout: 15_000 });
  const button = toggle.locator('button.class1775840591959:visible, button.c8o-btn:visible').nth(optionIndex);
  await expect(button, `${description} option should be visible`).toBeVisible({
    timeout: 15_000,
  });
  if (!((await button.getAttribute('class')) ?? '').includes('c8o-btn-selected')) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expect(button, `${description} option should be selected`).toHaveClass(/c8o-btn-selected/, {
    timeout: 15_000,
  });
}

async function visibleSignatureComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${SIGNATURE_COMPONENT}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${SIGNATURE_COMPONENT}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${SIGNATURE_COMPONENT}:visible`).first();
  await expect(fallback, `Signature component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

function signatureCanvas(component: Locator): Locator {
  return component.locator('canvas:visible').first();
}

async function drawSignature(component: Locator): Promise<void> {
  const canvas = signatureCanvas(component);
  await expect(canvas, 'Signature canvas should be visible before drawing').toBeVisible({ timeout: 15_000 });
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Signature canvas has no bounding box');
  }

  const start = { x: box.x + box.width * 0.2, y: box.y + box.height * 0.55 };
  const middle = { x: box.x + box.width * 0.45, y: box.y + box.height * 0.35 };
  const end = { x: box.x + box.width * 0.75, y: box.y + box.height * 0.6 };
  const page = component.page();
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(middle.x, middle.y, { steps: 10 });
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
}

async function clearSignature(component: Locator): Promise<void> {
  const clearButton = component.locator('ion-buttons ion-button:visible, ion-button:visible').first();
  await expect(clearButton, 'Signature clear button should be visible').toBeVisible({ timeout: 15_000 });
  await clearButton.click({ timeout: 10_000 }).catch(async () => clearButton.dispatchEvent('click'));
  await component.page().waitForTimeout(500);
}

async function expectSignatureCanvasBlank(component: Locator, expectedBlank: boolean, message: string): Promise<void> {
  await expect
    .poll(() => isSignatureCanvasBlank(component), {
      message,
      timeout: 15_000,
    })
    .toBe(expectedBlank);
}

async function clickViewerSubmitWithoutCompletionWait(page: Page): Promise<void> {
  const submit = page.locator(SEL.viewerSubmitButton).first();
  await expect(submit, 'viewer submit button should be visible').toBeVisible({ timeout: 30_000 });
  await submit.scrollIntoViewIfNeeded().catch(() => undefined);
  await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
}

async function isSignatureCanvasBlank(component: Locator): Promise<boolean> {
  return signatureCanvas(component).evaluate((canvasElement) => {
    const canvas = canvasElement as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return true;
    }

    const { width, height } = canvas;
    const data = context.getImageData(0, 0, width, height).data;
    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3];
      if (alpha === 0) {
        continue;
      }
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      if (red < 245 || green < 245 || blue < 245) {
        return false;
      }
    }
    return true;
  });
}
