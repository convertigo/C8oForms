import { test } from './fixtures';
import {
  createBlankForm,
  expectSelectorApplicationVisible,
  expectSelectorMyApplicationsFilterEnabled,
  login,
  reloadSelectorPage,
  returnToSelectorFromEditor,
  setSelectorMyApplicationsFilter,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1348
 *
 * Found in 2.2.0-beta141. Fixed by b659be83, first released in
 * 2.2.0-beta149 and validated OK in 2.2.0-beta154.
 *
 * Root cause: selector edition filters were read from raw persisted overrides
 * in several places instead of a normalized object merging defaults, server
 * settings, and local overrides. With the My applications filter active, a page
 * reload could restore the active filter but feed an inconsistent filter state
 * to the form search, leaving the selector with no visible applications. The
 * fix adds getEditionFilters(), makes searchForm use it, and refreshes the
 * selector list after quick-filter changes.
 *
 * The fixture is built only through Studio UI: log in, create a blank
 * application from the selector page, return to the selector, activate the My
 * applications quick filter, and reload the selector page.
 */

test.setTimeout(180_000);

test('#1348 - My applications filter keeps owned applications visible after reload', async ({ page }) => {
  const title = `Issue1348-${Date.now()}`;

  await test.step('Log in and start from an unfiltered selector', async () => {
    await login(page);
    await setSelectorMyApplicationsFilter(page, false);
  });

  await test.step('Create an owned application through the selector UI', async () => {
    await createBlankForm(page, title);
    await returnToSelectorFromEditor(page);
    await expectSelectorApplicationVisible(page, title);
  });

  await test.step('Enable My applications and keep the owned application visible', async () => {
    await setSelectorMyApplicationsFilter(page, true);
    await expectSelectorMyApplicationsFilterEnabled(page, true);
    await expectSelectorApplicationVisible(page, title);
  });

  await test.step('Reload with My applications still active', async () => {
    await reloadSelectorPage(page);
    await expectSelectorMyApplicationsFilterEnabled(page, true);
    await expectSelectorApplicationVisible(page, title);
  });
});
