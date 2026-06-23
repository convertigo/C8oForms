import { expect, test } from './fixtures';
import {
  SEL,
  login,
  createBlankForm,
  openApplicationSettingsFromSidebar,
  expectEditorSidebarButtonsVisible,
  openPagesPanel,
  openWorkflowsPanel,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1375
 * "Opening the Application settings hides the side bar buttons".
 *
 * Reported on 2.2.0-beta158. The settings sidebar button reused the palette
 * display toggle path, so opening application settings could hide the vertical
 * navigation buttons and prevent quick jumps to Pages/Workflows. The fix series
 * (#1375, validated OK in 2.2.0-beta204) keeps the sidebar visible while the
 * settings panel is open.
 *
 * The form fixture is built entirely through the No Code Studio UI.
 */
test('#1375 - application settings keeps the editor sidebar navigation usable', async ({ page }) => {
  test.setTimeout(120_000);

  await test.step('Create a blank form', async () => {
    await login(page);
    await createBlankForm(page, `Repro 1375 ${Date.now()}`);
  });

  await openApplicationSettingsFromSidebar(page);
  await expectEditorSidebarButtonsVisible(page);

  await test.step('Navigate directly from application settings to Pages', async () => {
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should show the first page row').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Navigate directly from Pages to Workflows', async () => {
    await openWorkflowsPanel(page);
    await expect(page.locator(SEL.submitFlowButton).first(), 'Workflows panel should show the submit flow').toBeVisible({
      timeout: 15_000,
    });
  });
});
