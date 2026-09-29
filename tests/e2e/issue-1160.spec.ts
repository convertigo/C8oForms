import { expect, test, type Page } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openConfigTabById,
  recordToasts,
  recordedToasts,
  resetRecordedToasts,
  setTechnicalId,
  setTextDefaultValueJavascriptCode,
} from './helpers/studio';

/**
 * Latest-only non-regression tests for https://github.com/convertigo/C8oForms/issues/1160
 * "Avoid Red error Toast when DnD a component to a JS Editor".
 *
 * Reported on 2.1.10-beta12, Monaco parsed JavaScript on blur and surfaced a
 * transient SyntaxError as a global red toast while the user was still editing
 * or preparing a drag/drop. Commit 1d9ab4fc moved passive parse feedback away
 * from that toast path (first shipped in 2.2.0-beta254). Follow-up 7c87ea68
 * rebuilt the stored diagnostics when Monaco is reopened so an explicit close
 * can display the validation toast again (first shipped in 2.2.0-beta256).
 * The complete behavior was historically validated in 2.2.0-beta294.
 *
 * These latest-only tests were executed successfully on test-nocode running
 * 2.2.0-beta370, without deployment or a historical red phase. Each form and
 * Text input is authored exclusively through the Studio UI.
 */

const INVALID_CODE = 'const incomplete_1160 =';

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(180_000);

test('#1160 — invalid JavaScript blur keeps diagnostics inline without a toast', async ({ page }) => {
  await createInvalidJavascriptDefaultThroughUi(page, `issue_1160_blur_${Date.now()}`);

  await expect
    .poll(() => recordedToasts(page), {
      message: 'passively blurring invalid JavaScript should not display a global toast',
      timeout: 2_000,
    })
    .toEqual([]);
});

test('#1160 — explicit validation still reports invalid JavaScript after reopening', async ({ page }) => {
  const technicalId = `issue_1160_validate_${Date.now()}`;
  await createInvalidJavascriptDefaultThroughUi(page, technicalId);

  await test.step('Validate the invalid JavaScript explicitly', async () => {
    await closeComponentConfig(page);
    await expect
      .poll(() => recordedToasts(page), {
        message: 'explicit validation should display the stored JavaScript error',
        timeout: 10_000,
      })
      .not.toEqual([]);
  });

  await test.step('Reopen the same JavaScript editor without changing its invalid code', async () => {
    await openComponentConfig(page, SEL.textComponent);
    await openConfigTabById(page, 'defaultvalue');
    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, 'the reopened JavaScript editor should be visible').toBeVisible({ timeout: 15_000 });
    await expect(editor, 'the invalid JavaScript should persist after reopening').toContainText(INVALID_CODE, {
      timeout: 15_000,
    });
    await page.waitForTimeout(800);
    await resetRecordedToasts(page);
  });

  await test.step('Validate again and receive a fresh error toast', async () => {
    await closeComponentConfig(page);
    await expect
      .poll(() => recordedToasts(page), {
        message: 'the reopened JavaScript editor should report its error again on explicit validation',
        timeout: 10_000,
      })
      .not.toEqual([]);
  });
});

async function createInvalidJavascriptDefaultThroughUi(page: Page, technicalId: string): Promise<void> {
  await test.step('Create a Text input and enter temporarily invalid JavaScript', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1160 Monaco toast ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent), 'the Text input should be added through Studio').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, technicalId);
    await recordToasts(page);
    await setTextDefaultValueJavascriptCode(page, INVALID_CODE);

    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, 'the JavaScript editor should keep the incomplete statement').toContainText(INVALID_CODE, {
      timeout: 15_000,
    });
    await page.waitForTimeout(1_000);
  });
}
