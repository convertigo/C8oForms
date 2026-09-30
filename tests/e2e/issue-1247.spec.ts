import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  openTextInputQuestionEditor,
  typeInRichTextEditor,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1247
 * The reported version was 2.2.x without a concrete beta. The ticket says the
 * rich-text editor was restored in 2.2.0-beta95 and QA validated it in
 * 2.2.0-beta115. No commit is linked directly to #1247; the related #1077
 * change 652a3deb4 later removed an advancedEditing condition around the
 * question editor and first appeared in 2.2.0-beta100.
 * This latest-only test targets test-nocode running 2.2.0-beta371, without
 * deployment or a historical red phase. The form and components are authored
 * exclusively through the Studio UI with Playwright.
 */
test.setTimeout(180_000);

test('#1247 - Description and Text input expose usable rich-text editors', async ({ page }) => {
  const suffix = Date.now();
  const descriptionText = `Rich description ${suffix}`;
  const questionText = `Rich question ${suffix}`;

  await test.step('Create a form with a Description through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1247 rich text ${suffix}`);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.descriptionComponent), 'Description should render in the editor').toHaveCount(1, {
      timeout: 30_000,
    });
  });

  await test.step('Use the Description rich-text editor', async () => {
    await openComponentConfig(page, SEL.descriptionComponent);
    await typeInRichTextEditor(page, descriptionText);
    await closeComponentConfig(page);
    await expect(page.locator(SEL.descriptionComponent), 'Description should display the edited text').toContainText(
      descriptionText,
      { timeout: 20_000 },
    );
  });

  await test.step('Use the Text input question rich-text editor', async () => {
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent), 'Text input should render in the editor').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await openTextInputQuestionEditor(page);
    await typeInRichTextEditor(page, questionText);
    await closeComponentConfig(page);
    await expect(page.locator(SEL.textComponent), 'Text input should display the edited question').toContainText(
      questionText,
      { timeout: 20_000 },
    );
  });

  await test.step('Verify both edited components in Preview', async () => {
    await openPreview(page, SEL.textComponent);
    await expect(page.locator(SEL.descriptionComponent)).toContainText(descriptionText, { timeout: 20_000 });
    await expect(page.locator(SEL.textComponent)).toContainText(questionText, { timeout: 20_000 });
  });
});
