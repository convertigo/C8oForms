import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  setTechnicalId,
  setTextDefaultValueJavascript,
  setTextInputQuestion,
} from './helpers/studio';

/**
 * Regression coverage for https://github.com/convertigo/C8oForms/issues/1526
 * The editor preview cached a copy of a Text input in JavaScript default-value
 * mode using a key that omitted config.html, so changing its question left the
 * rendered editor component stale. Fixed by 27fa30a6 in 2.2.0-beta337.
 * Per request, validate only on the latest 2.2 release; no historical red run.
 * The form and all component settings are created through the Studio UI.
 */
test('#1526 - Text input editor preview updates its question in JavaScript default-value mode', async ({ page }) => {
  const before = 'Question before 1526';
  const after = 'Question after 1526';

  await test.step('Create a form with a Text input', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1526 editor preview ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.textInput);
    await expect(page.locator(SEL.textComponent), 'Text input should render in the editor').toHaveCount(1, {
      timeout: 30_000,
    });
  });

  await test.step('Configure JavaScript default value and initial question', async () => {
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, 'text_1526');
    await setTextDefaultValueJavascript(page, "'seed-1526'");
    await setTextInputQuestion(page, before);
    await closeComponentConfig(page);
    await expect(page.locator(SEL.textComponent), 'Initial question should render in the editor preview').toContainText(before, {
      timeout: 15_000,
    });
  });

  await test.step('Change the question without reloading the editor', async () => {
    await openComponentConfig(page, SEL.textComponent);
    await setTextInputQuestion(page, after);
    await closeComponentConfig(page);
    const preview = page.locator(SEL.textComponent);
    await expect(preview, 'Updated question should replace the cached editor preview').toContainText(after, {
      timeout: 15_000,
    });
    await expect(preview, 'Old question should no longer be shown in the editor preview').not.toContainText(before);
  });
});
