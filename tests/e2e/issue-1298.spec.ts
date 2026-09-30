import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  duplicateOpenComponentHere,
  login,
  openComponentConfig,
  openComponentConfigAt,
  recordToasts,
  recordedToasts,
  setTechnicalId,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1298
 * Reported in 2.2.0-beta112: duplication worked but gave no visible feedback.
 * Fix 6bdb67278 focuses and scrolls the new component into view and displays
 * a source/target toast, first shipped in 2.2.0-beta201. QA historically
 * validated 2.2.0-beta202. This latest-only test targets test-nocode running
 * 2.2.0-beta371, without deployment or a historical red phase. The form and
 * component are authored exclusively through the Studio UI.
 */
test.setTimeout(150_000);

test('#1298 - duplicating a component identifies the copy with visible feedback', async ({ page }) => {
  const sourceId = `issue1298_source_${Date.now()}`;

  await test.step('Create and identify a Text input through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1298 duplicate feedback ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.textInput);
    await expect(page.locator(`${SEL.textComponent}:visible`)).toHaveCount(1);
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, sourceId);
  });

  await test.step('Duplicate the Text input and capture the feedback', async () => {
    await recordToasts(page);
    await duplicateOpenComponentHere(page);
    await expect(page.locator(`${SEL.textComponent}:visible`), 'a new Text input should appear').toHaveCount(2, {
      timeout: 20_000,
    });
    await expect.poll(async () => (await recordedToasts(page)).some((message) => message.includes(sourceId)), {
      message: 'a duplication toast should name the source component',
      timeout: 10_000,
    }).toBe(true);
  });

  await test.step('Identify the destination in the feedback', async () => {
    await closeComponentConfig(page);
    await openComponentConfigAt(page, SEL.textComponent, 1);
    const copyId = await page.locator(`${SEL.technicalIdInput}:visible`).first().inputValue();
    expect(copyId, 'copy should have its own technical identifier').not.toBe(sourceId);
    expect(copyId).not.toBe('');
    expect((await recordedToasts(page)).some((message) => message.includes(sourceId) && message.includes(copyId)),
      'the feedback should identify both source and copied component').toBe(true);
  });
});
