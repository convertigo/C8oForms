import { test } from './fixtures';
import {
  addFirstAvailableCollaboratorFromSelectorCard,
  createBlankForm,
  expectSelectorSearchKeepsSingleApplication,
  login,
  returnToSelectorFromEditor,
  searchSelectorApplicationsByName,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1366
 *
 * Found in 2.2.0-beta150. Fixed by d4975c63 (first tagged in
 * 2.2.0-beta158) and validated OK in 2.2.0-beta164.
 *
 * Root cause: the selector live-refresh path reset active search state after
 * the selected application document changed. Adding a collaborator updates the
 * form document; the broken version refreshed the selector with the unfiltered
 * out_folder query, losing the current application-name search. The fix detects
 * active search parameters and replays searchForm instead.
 *
 * The C8oForms application fixture is built only through Studio UI: create a
 * blank form, search it from the selector, open its card menu, add a
 * collaborator through ManageAccessRights, and save. No form document writes or
 * fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1366 - adding a collaborator preserves selector search results', async ({ page }) => {
  const title = `C1366-${Date.now()}`;

  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form with a unique searchable name', async () => {
    await createBlankForm(page, title);
  });

  await test.step('Search applications by the unique form name', async () => {
    await returnToSelectorFromEditor(page);
    await searchSelectorApplicationsByName(page, title);
    await expectSelectorSearchKeepsSingleApplication(page, title);
  });

  await test.step('Add a collaborator from the filtered search result', async () => {
    await addFirstAvailableCollaboratorFromSelectorCard(page, title);
  });

  await test.step('Assert the selector stayed on the same filtered search results', async () => {
    await expectSelectorSearchKeepsSingleApplication(page, title);
  });
});
