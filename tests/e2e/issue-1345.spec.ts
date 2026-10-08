import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addButtonFlowBusinessLogicAction,
  addComponent,
  createBlankForm,
  login,
  openPreview,
  returnToEditorFromPreviewThroughUi,
} from './helpers/studio';

/**
 * Regression for https://github.com/convertigo/C8oForms/issues/1345.
 * A Button Flow kept running after Preview was left. Fix 0e4f6912b adds an
 * execution token checked between actions, first in beta150 and QA-validated
 * in beta154. The entire form and Flow are authored through Studio UI.
 * Red on test-repro beta149; green on beta349 and test-nocode beta375.
 */
test.setTimeout(240_000);

test('#1345 - leaving Preview cancels pending Button Flow actions', async ({ page }) => {
  const key = `c8o-e2e-1345-${Date.now()}`;
  const startedKey = `${key}-started`;
  const finishedKey = `${key}-finished`;
  const delayMs = 6_000;

  await test.step('Create a Button Flow with a delayed action and a witness action', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1345 ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.buttonComponent), 'Button must be present before configuring its Flow').toHaveCount(1);
    await addButtonFlowBusinessLogicAction(
      page,
      'wait_for_1345',
      `(async()=>{localStorage.setItem(${JSON.stringify(startedKey)}, String(Date.now())); await new Promise(resolve=>setTimeout(resolve, ${delayMs})); return 'ready';})()`,
    );
    await addButtonFlowBusinessLogicAction(
      page,
      'finish_1345',
      `(()=>{localStorage.setItem(${JSON.stringify(finishedKey)}, 'done'); return 'done';})()`,
    );
  });

  await test.step('Confirm the same Flow completes when Preview stays open', async () => {
    await openPreview(page, SEL.buttonComponent);
    const button = page.locator(`${SEL.buttonComponent}:visible ion-button`).first();
    await expect(button).toBeVisible({ timeout: 30_000 });
    await button.click();
    await expect.poll(() => page.evaluate((name) => localStorage.getItem(name), finishedKey), {
      message: 'the witness action should run when Preview remains open',
      timeout: 20_000,
    }).toBe('done');
  });

  await test.step('Leave Preview while the second Flow run is pending', async () => {
    await page.evaluate((names) => names.forEach((name) => localStorage.removeItem(name)), [startedKey, finishedKey]);
    await page.locator(`${SEL.buttonComponent}:visible ion-button`).first().click();
    await expect.poll(() => page.evaluate((name) => localStorage.getItem(name), startedKey), {
      message: 'the delayed action should start before leaving Preview',
      timeout: 10_000,
    }).not.toBeNull();
    await returnToEditorFromPreviewThroughUi(page);
    const startedAt = Number(await page.evaluate((name) => localStorage.getItem(name), startedKey));
    expect(Date.now() - startedAt, 'Preview must be left while the delayed action is still pending').toBeLessThan(delayMs);
    await page.waitForTimeout(delayMs + 750);
    expect(await page.evaluate((name) => localStorage.getItem(name), finishedKey),
      'no Flow action should run after Preview was left').toBeNull();
  });
});
