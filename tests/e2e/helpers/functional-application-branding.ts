import { expect, test, type Locator, type Page } from '@playwright/test';
import { createBlankApplicationThroughUi } from './functional-studio';
import {
  openEditionApplicationsTab,
  openPublishedApplicationsTab,
  publishCurrentFormWithPwa,
  returnToSelectorFromEditor,
  switchSelectorApplicationsView,
} from './studio';

const BRANDING_SEL = {
  imageMenuButton: 'ion-button#edit-images',
  imageMenu: 'ion-popover.popover-toolbar-profil:visible',
  imageMenuItems: 'ion-list ion-item:visible',
  thumbnailPreview: 'ion-button#edit-images > ion-avatar',
  thumbnailColorPreview: 'ion-button#edit-images > ion-avatar:first-of-type > div',
  thumbnailImagePreview: 'ion-button#edit-images > ion-avatar:first-of-type img',
  wallpaperPreview: 'ion-button#edit-images > ion-avatar:nth-of-type(2) > div',
  pickerModal: 'ion-modal.show-modal.modal-custom--hw-100, ion-modal.show-modal.modal-custom',
  pickerColorSegment:
    'ion-segment-button.class1774608193139, ion-segment-button.class1648553976686',
  pickerCustomSegment:
    'ion-segment-button.class1774608193151, ion-segment-button.class1648553979967',
  pickerHexInput: '.color-picker .hex-text input',
  pickerFileInput: 'input#file-input[type="file"][accept*="image"]',
  pickerSaveButton: 'ion-button.class1774608108762, ion-button.class1586166864663',
  selectorCard: '[id^="idcard"]:not([id^="idcardO"])',
  selectorCardColorThumbnail: '.class1694178361537',
  selectorCardImageThumbnail: 'img.class1694177321790',
} as const;

const THUMBNAIL_COLOR = '#e5484d';
const WALLPAPER_COLOR = '#3e63dd';
const THUMBNAIL_RGB = 'rgb(229, 72, 77)';
const WALLPAPER_RGB = 'rgb(62, 99, 221)';

// A valid one-pixel PNG keeps the regression self-contained while exercising
// the real hidden image input and attachment upload path used by Studio.
const THUMBNAIL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nLkAAAAASUVORK5CYII=',
  'base64',
);

export async function verifyApplicationThumbnailIndependenceThroughUi(page: Page): Promise<void> {
  await test.step('Verify distinct thumbnail/background colors in the editor and selectors', async () => {
    const title = `Functional branding colors ${Date.now()}`;
    await createBlankApplicationThroughUi(page, title);
    await setBrandingColorThroughUi(page, 'thumbnail', THUMBNAIL_COLOR);
    await setBrandingColorThroughUi(page, 'wallpaper', WALLPAPER_COLOR);
    await expectEditorColorRoles(page);

    // Publication is created only through the Studio wizard. The published
    // selector uses the same application thumbnail contract as Apps edition.
    await publishCurrentFormWithPwa(page, 'authenticated', { configureIcon: false });
    await openPublishedApplicationsTab(page);
    await switchSelectorApplicationsView(page, 'grid');
    await expectSelectorCardColorThumbnail(page, title, 'Published Applications');

    await openEditionApplicationsTab(page);
    await switchSelectorApplicationsView(page, 'grid');
    await expectSelectorCardColorThumbnail(page, title, 'Apps edition');
    await openApplicationFromSelectorCard(page, title);
    await expectEditorColorRoles(page);
  });

  await test.step('Verify an uploaded thumbnail in the editor and selectors', async () => {
    await returnToSelectorFromEditor(page);
    const title = `Functional branding image ${Date.now()}`;
    const applicationId = await createBlankApplicationThroughUi(page, title);
    await uploadThumbnailThroughUi(page);
    await setBrandingColorThroughUi(page, 'wallpaper', WALLPAPER_COLOR);
    await expectEditorThumbnailImage(page, applicationId, 'immediately after upload');
    await expect(
      page.locator(BRANDING_SEL.wallpaperPreview).first(),
      'the application background should remain distinct from the uploaded thumbnail',
    ).toHaveCSS('background-color', WALLPAPER_RGB, { timeout: 30_000 });

    await publishCurrentFormWithPwa(page, 'authenticated', { configureIcon: false });

    await returnToSelectorFromEditor(page);
    await switchSelectorApplicationsView(page, 'grid');
    await expectSelectorCardImageThumbnail(page, title, applicationId, 'Apps edition');

    await openPublishedApplicationsTab(page);
    await switchSelectorApplicationsView(page, 'grid');
    await expectSelectorCardImageThumbnail(page, title, applicationId, 'Published Applications');

    await openEditionApplicationsTab(page);
    await switchSelectorApplicationsView(page, 'grid');
    await openApplicationFromSelectorCard(page, title);
    await expectEditorThumbnailImage(page, applicationId, 'after reopening the application');
    await expect(
      page.locator(BRANDING_SEL.wallpaperPreview).first(),
      'the distinct application background should still be present after the thumbnail upload and reopen',
    ).toHaveCSS('background-color', WALLPAPER_RGB, { timeout: 30_000 });
  });
}

async function setBrandingColorThroughUi(
  page: Page,
  target: 'thumbnail' | 'wallpaper',
  hexColor: string,
): Promise<void> {
  await test.step(`Set the application ${target} color through its Studio picker`, async () => {
    await openBrandingPickerFromToolbar(page, target);

    const modal = page.locator(BRANDING_SEL.pickerModal).last();
    await expect(modal, `${target} picker should open`).toBeVisible({ timeout: 30_000 });
    const colorSegment = modal.locator(BRANDING_SEL.pickerColorSegment).filter({ visible: true }).first();
    await expect(colorSegment, `${target} picker should expose the color tab`).toBeVisible({ timeout: 10_000 });
    await colorSegment.click({ timeout: 10_000 }).catch(async () => colorSegment.dispatchEvent('click'));

    const hexInput = modal.locator(BRANDING_SEL.pickerHexInput).filter({ visible: true }).last();
    await expect(hexInput, `${target} color picker should expose its Hex input`).toBeVisible({ timeout: 10_000 });
    await hexInput.fill(hexColor);
    await hexInput.press('Enter');
    await hexInput.dispatchEvent('change');

    const save = modal.locator(BRANDING_SEL.pickerSaveButton).filter({ visible: true }).first();
    await expect(save, `${target} picker should expose Save`).toBeVisible({ timeout: 10_000 });
    await save.click({ timeout: 10_000 }).catch(async () => save.dispatchEvent('click'));
    await expect(modal, `${target} picker should close after Save`).toBeHidden({ timeout: 30_000 });
  });
}

async function uploadThumbnailThroughUi(page: Page): Promise<void> {
  await test.step('Upload a custom application thumbnail through the Studio picker', async () => {
    await openBrandingPickerFromToolbar(page, 'thumbnail');

    const modal = page.locator(BRANDING_SEL.pickerModal).last();
    await expect(modal, 'thumbnail picker should open for image upload').toBeVisible({ timeout: 30_000 });
    const customSegment = modal.locator(BRANDING_SEL.pickerCustomSegment).filter({ visible: true }).first();
    await expect(customSegment, 'thumbnail picker should expose the custom-image tab').toBeVisible({ timeout: 10_000 });
    await customSegment.click({ timeout: 10_000 }).catch(async () => customSegment.dispatchEvent('click'));

    const input = modal.locator(BRANDING_SEL.pickerFileInput).first();
    await expect(input, 'custom thumbnail picker should expose its image input').toBeAttached({ timeout: 10_000 });
    await input.setInputFiles({
      name: 'issue-1448-thumbnail.png',
      mimeType: 'image/png',
      buffer: THUMBNAIL_PNG,
    });

    const save = modal.locator(BRANDING_SEL.pickerSaveButton).filter({ visible: true }).first();
    await expect(save, 'thumbnail picker should expose Save after selecting an image').toBeVisible({ timeout: 10_000 });
    await save.click({ timeout: 10_000 }).catch(async () => save.dispatchEvent('click'));
    await expect(modal, 'thumbnail picker should close after uploading the image').toBeHidden({ timeout: 30_000 });
  });
}

async function expectEditorColorRoles(page: Page): Promise<void> {
  await test.step('Assert editor thumbnail and background retain distinct color roles', async () => {
    const thumbnail = page.locator(BRANDING_SEL.thumbnailColorPreview).filter({ visible: true }).first();
    const wallpaper = page.locator(BRANDING_SEL.wallpaperPreview).filter({ visible: true }).first();
    await expect(thumbnail, 'editor thumbnail should render the selected thumbnail color').toHaveCSS(
      'background-color',
      THUMBNAIL_RGB,
      { timeout: 30_000 },
    );
    await expect(wallpaper, 'editor canvas should render the selected application background').toHaveCSS(
      'background-color',
      WALLPAPER_RGB,
      { timeout: 30_000 },
    );
    expect(
      await thumbnail.evaluate((element) => getComputedStyle(element).backgroundColor),
      'application background must not overwrite the thumbnail color in the editor',
    ).not.toBe(await wallpaper.evaluate((element) => getComputedStyle(element).backgroundColor));
  });
}

async function expectSelectorCardColorThumbnail(page: Page, title: string, surface: string): Promise<void> {
  await test.step(`Assert ${surface} card keeps the thumbnail color`, async () => {
    const card = await selectorCard(page, title);
    const thumbnail = card.locator(BRANDING_SEL.selectorCardColorThumbnail).filter({ visible: true }).first();
    await expect(thumbnail, `${surface} card should render a color thumbnail`).toHaveCSS(
      'background-color',
      THUMBNAIL_RGB,
      { timeout: 30_000 },
    );
    expect(
      await thumbnail.evaluate((element) => getComputedStyle(element).backgroundColor),
      `${surface} card thumbnail must not reuse the application background color`,
    ).not.toBe(WALLPAPER_RGB);
  });
}

async function expectSelectorCardImageThumbnail(
  page: Page,
  title: string,
  applicationId: string,
  surface: string,
): Promise<void> {
  await test.step(`Assert ${surface} card renders the uploaded thumbnail attachment`, async () => {
    const card = await selectorCard(page, title);
    const image = card.locator(BRANDING_SEL.selectorCardImageThumbnail).filter({ visible: true }).first();
    await expectLoadedThumbnail(image, applicationId, `${surface} card`);
  });
}

async function expectEditorThumbnailImage(page: Page, applicationId: string, phase: string): Promise<void> {
  await test.step(`Assert editor renders the uploaded thumbnail ${phase}`, async () => {
    await expect(page.locator(BRANDING_SEL.thumbnailPreview).first(), 'editor thumbnail area should remain present').toBeVisible({
      timeout: 30_000,
    });
    const image = page.locator(BRANDING_SEL.thumbnailImagePreview).filter({ visible: true }).first();
    await expectLoadedThumbnail(image, applicationId, `editor ${phase}`);
  });
}

async function expectLoadedThumbnail(image: Locator, applicationId: string, surface: string): Promise<void> {
  await expect(image, `${surface} should display an image thumbnail`).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      () =>
        image.evaluate((element) => {
          const img = element as HTMLImageElement;
          return {
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            src: img.currentSrc || img.src,
          };
        }),
      { message: `${surface} thumbnail attachment should load`, timeout: 30_000 },
    )
    .toMatchObject({ complete: true, naturalWidth: 1, naturalHeight: 1 });

  const src = await image.evaluate((element) => (element as HTMLImageElement).currentSrc || (element as HTMLImageElement).src);
  const documentId = surface.startsWith('Published Applications') ? `published_${applicationId}` : applicationId;
  expect(src, `${surface} should use the uploaded thumbnail attachment, not a random placeholder`).toContain(
    `/convertigo/fullsync/c8oforms_fs/${documentId}/thumbnail`,
  );
  expect(src, `${surface} should not fall back to a random placeholder asset`).not.toContain('/imgplaceholder/');
}

async function selectorCard(page: Page, title: string): Promise<Locator> {
  const card = page.locator(BRANDING_SEL.selectorCard).filter({ hasText: title }).first();
  await expect(card, `selector should display the application card ${title}`).toBeVisible({ timeout: 30_000 });
  return card;
}

async function openApplicationFromSelectorCard(page: Page, title: string): Promise<void> {
  await test.step(`Reopen application ${title} from its selector card`, async () => {
    const card = await selectorCard(page, title);
    await card.click({ timeout: 10_000 }).catch(async () => card.dispatchEvent('click'));
    await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 60_000 });
    await expect(page.locator(BRANDING_SEL.imageMenuButton), 'application editor should reopen').toBeVisible({
      timeout: 30_000,
    });
  });
}

async function openBrandingPickerFromToolbar(page: Page, target: 'thumbnail' | 'wallpaper'): Promise<void> {
  const imageMenuButton = page.locator(BRANDING_SEL.imageMenuButton).filter({ visible: true }).first();
  await expect(imageMenuButton, 'editor image menu should be visible').toBeVisible({ timeout: 30_000 });
  await imageMenuButton.click({ timeout: 10_000 }).catch(async () => imageMenuButton.dispatchEvent('click'));

  const menu = page.locator(BRANDING_SEL.imageMenu).last();
  await expect(menu, 'editor image menu should open').toBeVisible({ timeout: 10_000 });
  const items = menu.locator(BRANDING_SEL.imageMenuItems);
  await expect(items, 'editor image menu should expose thumbnail and background actions').toHaveCount(2, {
    timeout: 10_000,
  });
  const action = items.nth(target === 'thumbnail' ? 0 : 1);
  await action.click({ timeout: 10_000 }).catch(async () => action.dispatchEvent('click'));
}
