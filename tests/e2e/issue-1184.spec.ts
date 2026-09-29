import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  acknowledgeTextToJavascriptWarningThroughUi,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  setJsModeSwitchWarningThroughSettingsUi,
  setTechnicalId,
  switchTextDefaultValueToJavascriptWithoutWarning,
  switchTextDefaultValueToTextMode,
} from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1184
 * "Disable Warning on Mode Switch Aa to JS".
 *
 * Reported on 2.1.11-beta1, every Aa-to-JavaScript mode switch displayed the
 * compatibility warning because there was no persistent user acknowledgement.
 * Commit 7784e69b added a versioned jsModeSwitchWarningAckVersion preference,
 * the "do not show again" checkbox, and the matching Settings control; commit
 * 313d9e72 completed its translations. The change first shipped in
 * 2.2.0-beta308 and was historically validated by QA in 2.2.0-beta309.
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta370, without deployment or a historical red phase. It creates the
 * form exclusively through the Studio UI, normalizes and restores the user's
 * warning preference through Settings, and reloads Studio before proving that
 * the acknowledgement persists.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(180_000);

test('#1184 — do-not-show-again persists for Aa-to-JavaScript switches', async ({ page }) => {
  await login(page);
  const warningWasEnabled = await setJsModeSwitchWarningThroughSettingsUi(page, true);

  try {
    await login(page);
    await createBlankForm(page, `Issue 1184 JS warning ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent), 'the Text input should be added through Studio').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, `issue_1184_${Date.now()}`);

    await acknowledgeTextToJavascriptWarningThroughUi(page);
    await switchTextDefaultValueToTextMode(page);
    await closeComponentConfig(page);

    await test.step('Reload Studio to prove the preference is persisted for the user', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator(SEL.textComponent), 'the UI-authored Text input should remain after reload').toHaveCount(1, {
        timeout: 30_000,
      });
      await openComponentConfig(page, SEL.textComponent);
    });

    await switchTextDefaultValueToJavascriptWithoutWarning(page);
  } finally {
    await setJsModeSwitchWarningThroughSettingsUi(page, warningWasEnabled);
  }
});
