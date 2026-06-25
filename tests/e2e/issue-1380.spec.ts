import { test } from './fixtures';
import {
  createBlankForm,
  expectPagesPanelDefaultAfterWorkflowNavigation,
  login,
  openFirstWorkflowSection,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1380
 * "Vertical bar buttons do not reset to their default section when switching
 * between Workflows, Pages, and Palette".
 *
 * Broken version: 2.2.0-beta158.
 * Fixed version: the default-selection work first shipped in 2.2.0-beta170,
 * was corrected for single-page forms by 10789dac in 2.2.0-beta181, and the
 * ticket was validated OK in 2.2.0-beta186.
 * Root cause: clicking the Pages vertical tab only toggled the sidebar display
 * flag. If a workflow was active, page.local.currentPage/page.local.flow stayed
 * on that workflow, so the UI kept showing workflow content instead of the
 * first page. The fix resets currentPage/currentIndex to the first page and
 * clears the flow state when entering Pages.
 *
 * The C8oForms fixture is built only through Studio UI: log in, create a blank
 * form, open Workflows, open the first workflow section, then click Pages.
 */

test.setTimeout(180_000);

test('#1380 - Pages vertical tab resets from an active workflow to the first page', async ({ page }) => {
  await test.step('login', async () => {
    await login(page);
  });

  await test.step('create a blank form', async () => {
    await createBlankForm(page, `Issue 1380 vertical tabs ${Date.now()}`);
  });

  await test.step('open the first Workflows section', async () => {
    await openFirstWorkflowSection(page);
  });

  await test.step('assert Pages returns to the first page', async () => {
    await expectPagesPanelDefaultAfterWorkflowNavigation(page);
  });
});
