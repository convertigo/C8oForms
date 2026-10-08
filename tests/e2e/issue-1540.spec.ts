import { test } from './fixtures';
import { assertGridLoadingOverlayWhileSourceLoadsThroughUi } from './helpers/functional-sources';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  openSettings,
  createMcpTokenThroughSettingsUi,
  revokeMcpTokenThroughSettingsUi,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1540
 *
 * Broken version: 2.2.0-beta342 (still broken on beta345). Fix 7b1d28895 was
 * merged by e6f35eb99 and first released in 2.2.0-beta347.
 *
 * Root cause: the viewer requests the Grid loading overlay (viewerPage.showGridOverlayById) as soon as the
 * source starts loading, but the Grid Viewer creates its AG Grid only once the AG Grid locale is loaded
 * (lib_ExtendedComponents_ui_ngx agGrid). The lookup then threw on the missing AG Grid, logging
 * "an error occured while trying to show an overlay for grid:<id>", and the #1195 retry at view init ran
 * just as early. Nothing showed the overlay once the AG Grid existed, and AG Grid displays its "no rows"
 * overlay for the empty data set the viewer binds while loading. The fix records the state without
 * throwing and lets the Grid Viewer restore the loading overlay on GridReady and after each row data
 * update while its source still loads.
 *
 * The source request is held by the test so the loading state is asserted however fast Baserow answers.
 * The fixture is built only through Studio UI; the Baserow table is ensured through the MCP helper.
 * QA historically validated 2.2.0-beta372. This test passed on test-nocode
 * running 2.2.0-beta372 without deployment in the current run.
 */

test.describe('#1540 - Grid data loading overlay', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('#1540 - Grid shows its loading overlay while its Baserow source loads', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    const tokenName = `issue-1540-${Date.now()}`;
    let temporaryToken: string | undefined;
    try {
      if (!process.env.C8OFORMS_MCP_TOKEN) {
        await openSettings(page);
        temporaryToken = await createMcpTokenThroughSettingsUi(page, tokenName);
        await loginWithUsernamePassword(page);
      }
      await createBlankApplicationThroughUi(page);
      await assertGridLoadingOverlayWhileSourceLoadsThroughUi(page, temporaryToken);
    } finally {
      if (temporaryToken) {
        await openSettings(page);
        await revokeMcpTokenThroughSettingsUi(page, tokenName);
      }
    }
  });
});
