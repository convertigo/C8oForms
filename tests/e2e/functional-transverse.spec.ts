import { expect, test, type Page } from './fixtures';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  openComponentConfigAt,
  openComponentsPalette,
  openPreview,
  reloadStudioWithLanguage,
  setTextDefaultValueJavascriptCode,
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
    const originalLanguage = await page.evaluate(() => window.localStorage.getItem('lang'));

    try {
      for (const language of SMOKE_LANGUAGES) {
        await reloadStudioWithLanguage(page, language);
        await expect(page.locator(SEL.selectorPageRoot).first(), `selector page should render in ${language}`).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.locator(SEL.blankFormCard).first(), `blank application entry should render in ${language}`).toBeVisible({
          timeout: 30_000,
        });
      }
    } finally {
      // The spec runs on the worker's shared browser context (./fixtures): put back
      // the language the following tests start with.
      await page.evaluate((value) => {
        if (value === null) window.localStorage.removeItem('lang');
        else window.localStorage.setItem('lang', value);
      }, originalLanguage);
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

  /**
   * #1303: reported on 2.2.0-beta115 and historically validated on
   * 2.2.0-beta156. Commit 0877f173, first released in 2.2.0-beta154,
   * restored Monaco's monospace metrics and disabled pointer events on syntax
   * token spans. In Firefox those spans had intercepted mouse events, leaving
   * Monaco's hidden input unfocused and preventing text selection.
   *
   * The application, Text input, and JavaScript default value are all created
   * through the Studio UI. Runtime validation on the current test-nocode
   * release remains pending.
   */
  test('X-002 #1303 - Monaco supports mouse selection and replacement in Firefox', async ({ page }) => {
    test.setTimeout(240_000);
    const originalMarker = 'firefox_selection_marker_1303';
    const replacementMarker = 'firefox_replacement_1303';

    await test.step('Create a Text input with a JavaScript default value', async () => {
      await loginWithUsernamePassword(page);
      await createBlankApplicationThroughUi(page);
      await openComponentsPalette(page, PALETTE_ICON.textInput);
      await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input should be added through the palette').toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfigAt(page, SEL.textComponent, 0);
      await setTechnicalId(page, `functional_monaco_1303_${Date.now()}`);
      await setTextDefaultValueJavascriptCode(page, `return '${originalMarker}';`);
    });

    await test.step('Assert the causal Monaco pointer and font contracts', async () => {
      const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor:visible`).last();
      await expect(editor, 'JavaScript default-value Monaco editor should be visible').toBeVisible({ timeout: 15_000 });
      await expect(editor, 'JavaScript default-value code should contain the selection marker').toContainText(originalMarker, {
        timeout: 15_000,
      });

      const token = editor.locator('.view-line span').filter({ hasText: originalMarker }).last();
      await expect(token, 'the JavaScript string should be rendered as a Monaco syntax token').toBeVisible({ timeout: 10_000 });
      await expect
        .poll(() => token.evaluate((element) => getComputedStyle(element).pointerEvents), {
          message: 'Monaco syntax tokens should let the line container handle Firefox mouse events',
        })
        .toBe('none');

      const fontFamilies = await editor.locator('.view-line, textarea.inputarea').evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).fontFamily),
      );
      expect(fontFamilies.length, 'Monaco should expose its line and hidden input for the font-metric check').toBeGreaterThan(1);
      for (const fontFamily of fontFamilies) {
        expect(fontFamily, 'Monaco text surfaces should retain a monospace font stack').toMatch(
          /Menlo|Monaco|Courier New|monospace/i,
        );
      }
    });

    await test.step('Select JavaScript text with the mouse and replace it', async () => {
      const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor:visible`).last();
      const token = editor.locator('.view-line span').filter({ hasText: originalMarker }).last();
      const tokenBox = await token.boundingBox();
      expect(tokenBox, 'the JavaScript string token should have mouse-selectable coordinates').not.toBeNull();

      const y = tokenBox!.y + tokenBox!.height / 2;
      await page.mouse.move(tokenBox!.x + 2, y);
      await page.mouse.down();
      await page.mouse.move(tokenBox!.x + tokenBox!.width - 2, y, { steps: 12 });
      await page.mouse.up();

      const input = editor.locator('textarea.inputarea');
      await expect(input, 'mouse selection should focus Monaco\'s hidden input in Firefox').toBeFocused();
      await expect(
        editor.locator('.selected-text').filter({ visible: true }).first(),
        'mouse drag should create a visible Monaco selection',
      ).toBeVisible({ timeout: 5_000 });

      await page.keyboard.insertText(replacementMarker);
      await expect(editor, 'typing should replace the selected JavaScript string').toContainText(replacementMarker, {
        timeout: 10_000,
      });
      await expect(editor, 'the selected JavaScript marker should have been replaced').not.toContainText(originalMarker, {
        timeout: 10_000,
      });
    });
  });

  /**
   * #1330: reported in 2.2.0-beta127, fixed by 01399198 in beta150 and
   * historically QA-validated in beta154. The editor iteration wrapper was
   * marked draggable, so Firefox started a component drag when the user tried
   * to select the Technical ID input with the mouse. The fix removes that
   * draggable attribute.
   *
   * The application and Text input are created only through the Studio UI.
   * Runtime validation on the current test-nocode Firefox release is pending.
   */
  test('X-002 #1330 - Technical ID supports mouse selection in Firefox', async ({ page }) => {
    test.setTimeout(240_000);
    const technicalId = `firefox_selectable_technical_id_${Date.now()}`;

    await test.step('Create a Text input and assign a controlled Technical ID', async () => {
      await loginWithUsernamePassword(page);
      await createBlankApplicationThroughUi(page);
      await openComponentsPalette(page, PALETTE_ICON.textInput);
      await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input should be added through the palette').toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfigAt(page, SEL.textComponent, 0);
      await setTechnicalId(page, technicalId);
    });

    await test.step('Select the Technical ID with a real Firefox mouse drag', async () => {
      const input = page.locator(SEL.technicalIdInput).filter({ visible: true }).first();
      await expect(input, 'Technical ID input should expose the controlled value').toHaveValue(technicalId, {
        timeout: 15_000,
      });
      await expect
        .poll(() => input.evaluate((element) => element.closest('[draggable="true"]') !== null), {
          message: 'Technical ID input must not remain inside the draggable editor wrapper',
          timeout: 10_000,
        })
        .toBe(false);

      const box = await input.boundingBox();
      expect(box, 'Technical ID input should have mouse-selectable coordinates').not.toBeNull();
      const y = box!.y + box!.height / 2;
      await page.mouse.move(box!.x + box!.width - 8, y);
      await page.mouse.down();
      await page.mouse.move(box!.x + 8, y, { steps: 16 });
      await page.mouse.up();

      await expect(input, 'mouse selection should keep focus on the Technical ID input').toBeFocused();
      const selectionLength = await input.evaluate((element) => {
        const field = element as HTMLInputElement;
        return Math.abs((field.selectionEnd ?? 0) - (field.selectionStart ?? 0));
      });
      expect(selectionLength, 'mouse drag should select a meaningful part of the Technical ID').toBeGreaterThan(5);
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
