import { expect, test, type Page } from '@playwright/test';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  openComponentConfigAt,
  openComponentsPalette,
  openPreview,
  reloadStudioWithLanguage,
  setTechnicalId,
  type StudioLanguage,
} from './helpers/studio';

const SMOKE_LANGUAGES: StudioLanguage[] = ['fr', 'en', 'es', 'it'];
const RESPONSIVE_VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
] as const;
const PREVIEW_LABEL_RE = /Preview|Aper\u00e7u|Vista previa|Anteprima/i;

async function openPreviewFromMobileEditor(page: Page, waitForSelector: string): Promise<void> {
  const preview = page.getByRole('button', { name: PREVIEW_LABEL_RE }).first();
  await expect(preview, 'mobile editor should render the toolbar Preview button').toBeVisible({ timeout: 30_000 });
  await expect(preview, 'mobile editor toolbar Preview button should be enabled').toBeEnabled({ timeout: 10_000 });

  await preview.click({ timeout: 10_000 });

  await expect(page, 'mobile Preview action should open the viewer route').toHaveURL(/\/viewer(?:Page)?(?:\/|$)/i, { timeout: 30_000 });
  await page.locator(waitForSelector).first().waitFor({ state: 'visible', timeout: 30_000 });
}

test.describe('No-Code Studio functional transverse contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('X-001 - multilingual selector smoke uses i18n-neutral selectors', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);

    for (const language of SMOKE_LANGUAGES) {
      await reloadStudioWithLanguage(page, language);
      await expect(page.locator(SEL.selectorPageRoot).first(), `selector page should render in ${language}`).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator(SEL.blankFormCard).first(), `blank application entry should render in ${language}`).toBeVisible({
        timeout: 30_000,
      });
    }
  });

  test('X-002 - cross-browser authoring and preview smoke', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);

    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input should be added through the palette').toBeVisible({
      timeout: 30_000,
    });

    await openPreview(page, SEL.textComponent);
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input should render in preview').toBeVisible({
      timeout: 30_000,
    });
  });

  test('X-003 - responsive editor and viewer smoke', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);

    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'responsive smoke Text input should be present').toBeVisible({
      timeout: 30_000,
    });

    for (const viewport of RESPONSIVE_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(page.locator(SEL.previewButton).first(), `Preview button should remain rendered on ${viewport.name}`).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page.locator(`${SEL.textComponent}:visible`).first(),
        `Text input editor component should stay visible on ${viewport.name}`,
      ).toBeVisible({ timeout: 30_000 });
    }

    await page.setViewportSize({ width: RESPONSIVE_VIEWPORTS[0].width, height: RESPONSIVE_VIEWPORTS[0].height });
    await openPreview(page, SEL.textComponent);

    for (const viewport of RESPONSIVE_VIEWPORTS) {
      const value = `responsive-${viewport.name}`;
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(page.locator(SEL.viewerPage).first(), `Viewer page should stay visible on ${viewport.name}`).toBeVisible({
        timeout: 30_000,
      });
      const viewerInput = page.locator(`${SEL.textComponent}:visible input, ${SEL.textComponent}:visible textarea`).first();
      await expect(viewerInput, `Text input should stay actionable in viewer on ${viewport.name}`).toBeVisible({
        timeout: 30_000,
      });
      await viewerInput.fill(value);
      await expect(viewerInput, `Text input should keep typed value on ${viewport.name}`).toHaveValue(value, {
        timeout: 10_000,
      });
    }
  });

  test.fixme('X-003 - mobile Preview button opens the viewer', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);

    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'mobile Preview smoke Text input should be present').toBeVisible({
      timeout: 30_000,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(SEL.previewButton).first(), 'Preview button should be visible on mobile before clicking').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(SEL.previewButton).first(), 'Preview button should be enabled on mobile before clicking').toBeEnabled({
      timeout: 10_000,
    });

    await openPreviewFromMobileEditor(page, SEL.textComponent);
    await expect(page.locator(SEL.viewerPage).first(), 'Viewer page should open from the mobile Preview button').toBeVisible({
      timeout: 30_000,
    });
    const viewerInput = page.locator(`${SEL.textComponent}:visible input, ${SEL.textComponent}:visible textarea`).first();
    await expect(viewerInput, 'Text input should be actionable after mobile Preview opens').toBeVisible({
      timeout: 30_000,
    });
    await viewerInput.fill('mobile-preview');
    await expect(viewerInput, 'Text input should keep the mobile Preview value').toHaveValue('mobile-preview', {
      timeout: 10_000,
    });
  });

  test('X-004 - reload robustness while editing', async ({ page }) => {
    test.setTimeout(240_000);
    const technicalId = `functional_reload_text_${Date.now()}`;

    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);

    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'reload smoke Text input should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, technicalId);

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(SEL.previewButton).first(), 'editor toolbar should reload after an in-progress edit').toBeVisible({
      timeout: 45_000,
    });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input should still be present after reload').toBeVisible({
      timeout: 45_000,
    });

    await openComponentConfigAt(page, SEL.textComponent, 0);
    await expect(page.locator(SEL.technicalIdInput).first(), 'Text input technical ID should persist after reload').toHaveValue(
      technicalId,
      { timeout: 30_000 },
    );
  });
});
