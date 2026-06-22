import { test } from '@playwright/test';
import {
  createBlankForm,
  login,
  openApplicationSettingsFromSidebar,
  openFirstWorkflowSection,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1374
 * "Application configuration cannot be opened from Workflows".
 *
 * Reported on 2.2.0-beta158. Fixed by ebc18786, first released in
 * 2.2.0-beta163 and validated OK in 2.2.0-beta167.
 *
 * Root cause: the settings cog did not mark that the application settings panel
 * was opened from the Workflows panel. Once a workflow was displayed, the
 * workflow branch stayed selected and the app settings categories never became
 * visible. The fix adds the isPanelSettingsOrigin local flag and a dedicated
 * settings branch for that origin.
 *
 * The form fixture is built entirely through the No Code Studio UI.
 */
test('#1374 - application settings opens from an active workflow', async ({ page }) => {
  test.setTimeout(120_000);

  await test.step('Create a blank form', async () => {
    await login(page);
    await createBlankForm(page, `Repro 1374 ${Date.now()}`);
  });

  await openFirstWorkflowSection(page);

  await openApplicationSettingsFromSidebar(page);
});
