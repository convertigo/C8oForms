import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addHorizontalLayout,
  createBlankForm,
  dragPaletteComponentInto,
  horizontalLayoutColumnWidths,
  login,
  openEditor,
  openPreview,
  setHorizontalLayoutDesktopColumns3And9,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1252
 * The reported version was 2.2.x without a concrete beta. Fix 97123484d
 * recalculates the layout column sizes in the editor after a configuration
 * change; it first shipped in 2.2.0-beta99 and QA historically validated
 * 2.2.0-beta101. This latest-only test was executed successfully on
 * test-nocode running 2.2.0-beta371, without deployment or a historical red
 * phase. The form and layout are authored exclusively through the Studio UI.
 */
test.setTimeout(180_000);

test('#1252 - Horizontal layout reflects configured columns in the editor', async ({ page }) => {
  let formId = '';

  const expectThreeNineColumns = async (mode: 'editor' | 'viewer') => {
    await expect.poll(() => horizontalLayoutColumnWidths(page, mode), {
      message: `${mode} should render two visible layout columns`,
      timeout: 20_000,
    }).toHaveLength(2);
    await expect.poll(async () => {
      const [first, second] = await horizontalLayoutColumnWidths(page, mode);
      return Math.abs(first / (first + second) - 0.25);
    }, {
      message: `${mode} should apply the configured 3/9 column proportions`,
      timeout: 20_000,
    }).toBeLessThan(0.02);
  };

  await test.step('Create a form with a two-child Horizontal layout through Studio', async () => {
    await login(page);
    formId = await createBlankForm(page, `Issue 1252 layout ${Date.now()}`);
    await addHorizontalLayout(page);
    await dragPaletteComponentInto(page, PALETTE_ICON.textInput, SEL.layoutViewer);
    await dragPaletteComponentInto(page, PALETTE_ICON.description, SEL.layoutViewer);
    await expect(page.locator(SEL.layoutChild)).toHaveCount(2);
  });

  await test.step('Apply 3/9 and verify the editor before opening Preview', async () => {
    await setHorizontalLayoutDesktopColumns3And9(page);
    await expectThreeNineColumns('editor');
  });

  await test.step('Verify Preview has the same proportions', async () => {
    await openPreview(page, 'c8oforms-itemlayoutviewer');
    await expectThreeNineColumns('viewer');
  });

  await test.step('Return to the editor and verify the proportions remain', async () => {
    await openEditor(page, formId);
    await expect(page.locator(SEL.layoutViewer)).toBeVisible({ timeout: 30_000 });
    await expectThreeNineColumns('editor');
  });
});
