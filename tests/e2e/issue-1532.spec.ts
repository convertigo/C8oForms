import { test } from './fixtures';
import {
  createBlankForm,
  expectSearchedApplicationTooltipName,
  login,
  returnToSelectorFromEditor,
  searchSelectorApplicationsByName,
  switchSelectorApplicationsView,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1532
 * Reported in 2.2.0-beta338, reproduced on beta344, fixed by c06a09625
 * (merged by 3e42eb45f) in 2.2.0-beta345.
 *
 * Search results render highlighted boldName HTML. Both selector tooltips
 * mistakenly used that HTML instead of the plain application name, exposing
 * markup to users. The form is created and searched only through Studio UI.
 * The same assertion failed on beta344 with literal <strong> markup, passed on
 * beta349 (test-repro), then passed on test-nocode running beta373.
 */

test.setTimeout(240_000);

test('#1532 - searched application tooltips show the plain name in grid and list views', async ({ page }) => {
  const query = `Search1532${Date.now()}`;
  const title = `Issue 1532 ${query} result`;

  await test.step('Create an application with a searchable name', async () => {
    await login(page);
    await createBlankForm(page, title);
    await returnToSelectorFromEditor(page);
    await searchSelectorApplicationsByName(page, query);
  });

  try {
    await switchSelectorApplicationsView(page, 'grid');
    await expectSearchedApplicationTooltipName(page, title, query, 'grid');

    await switchSelectorApplicationsView(page, 'list');
    await expectSearchedApplicationTooltipName(page, title, query, 'list');
  } finally {
    await switchSelectorApplicationsView(page, 'grid').catch(() => undefined);
  }
});
