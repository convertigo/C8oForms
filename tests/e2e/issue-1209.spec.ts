import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectStudioToIgnoreSystemDarkTheme,
  login,
} from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1209
 * "Dark Theme Still Applies on Devices in Dark Mode After Toggle Removal".
 *
 * The ticket does not name a reported version; commit 12ee6d02 advances the
 * project from 2.2.0-beta20 to 2.2.0-beta21, making beta20 the historical
 * reference. Studio still read the operating-system color preference and set
 * data-theme="dark" after its toggle had been removed, while the enabled
 * _NewStyleDarkTheme_ block applied a global inversion filter to ion-app.
 * Commit 12ee6d02 disables that style, first shipped in 2.2.0-beta21.
 * QA historically confirmed on 2026-08-03 that dark theme was no longer
 * supported in Studio No Code 2.2.0; beta297 was the latest published build at
 * that moment, although the QA comment itself does not name a beta.
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta370, without deployment or a historical red phase. The form and
 * Text input are authored exclusively through the Studio UI before the browser
 * is reloaded with a dark operating-system preference.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(180_000);

test('#1209 — Studio stays unfiltered when the operating system prefers dark mode', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1209 light Studio ${Date.now()}`);
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await expect(page.locator(SEL.textComponent), 'the Text input should be added through Studio').toHaveCount(1, {
    timeout: 30_000,
  });

  await expectStudioToIgnoreSystemDarkTheme(page);
  await expect(page.locator(SEL.textComponent), 'the UI-authored Text input should remain visible after the dark-mode reload').toHaveCount(
    1,
    { timeout: 30_000 },
  );
});
