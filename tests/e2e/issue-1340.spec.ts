import { test } from './fixtures';
import {
  createBlankForm,
  expectSelectorSearchKeepsSingleApplication,
  login,
  returnToSelectorFromEditor,
  searchSelectorApplicationsByName,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1340
 * "Search bar is accent-case-sensitive in both directions".
 *
 * Found in 2.2.0-beta138. The first attempt shipped in 2.2.0-beta140 but was
 * still KO in 2.2.0-beta142; the final sequence-side normalization fix is
 * 773d1a08, first released in 2.2.0-beta144 and validated OK in 2.2.0-beta147.
 *
 * Root cause: selector search used a regex built from the raw query. Accented
 * characters such as "É" and "é" did not match across case/accent variants
 * until APIV2_ExecuteView normalized both the query and candidate names.
 *
 * The application fixture is built entirely through Studio UI: blank app
 * creation, return to selector, then selector search by application name.
 */

test.setTimeout(240_000);

test('#1340 - selector search matches application names across accent case', async ({ page }) => {
  const suffix = `C1340-${Date.now()}`;
  const title = `SÉCURITÉ ${suffix}`;
  const query = `Sécurité ${suffix}`;

  await test.step('Create an application with an uppercase accented title', async () => {
    await login(page);
    await createBlankForm(page, title);
  });

  await test.step('Search the same title with lowercase accented input', async () => {
    await returnToSelectorFromEditor(page);
    await searchSelectorApplicationsByName(page, query);
    await expectSelectorSearchKeepsSingleApplication(page, title);
  });
});
