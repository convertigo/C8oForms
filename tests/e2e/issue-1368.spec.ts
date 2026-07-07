import { test, expect } from './fixtures';
import {
  createBlankForm,
  login,
  returnToSelectorFromEditor,
  searchSelectorApplicationsByName,
  waitForSelectorHighlightedTitleLayout,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1368
 *
 * Found in 2.2.0-beta153. Fixed by 55f447eb and validated OK in
 * 2.2.0-beta156.
 *
 * Root cause: the selector search result built highlighted HTML by replacing
 * matches inside the application name, then rendered the result title with
 * nowrap/flex styles. When only part of a name was highlighted, spaces around
 * the highlighted fragment and punctuation collapsed visually
 * ("NOT A FOLDER !" became "NOT AFOLDER!"). The fix preserves escaped text
 * segments while building boldName and renders selector titles with
 * white-space: pre.
 */

test.setTimeout(240_000);

test('#1368 - application search results preserve spaces and punctuation in names', async ({ page }) => {
  const highlightedFragment = `FOLDER${Date.now()}`;
  const title = `NOT A ${highlightedFragment} !`;

  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form with spaces and punctuation in its name', async () => {
    await createBlankForm(page, title);
  });

  await test.step('Search applications by a highlighted fragment of the name', async () => {
    await returnToSelectorFromEditor(page);
    await searchSelectorApplicationsByName(page, highlightedFragment);
  });

  await test.step('Assert the rendered search result keeps the exact application name', async () => {
    const renderedTitle = await waitForSelectorHighlightedTitleLayout(page, highlightedFragment, highlightedFragment);

    expect(
      renderedTitle.text,
      'the rendered application title should preserve spaces around the highlighted fragment and punctuation',
    ).toBe(title);
    expect(renderedTitle.highlightedText, 'the search query should highlight the unique FOLDER fragment').toBe(highlightedFragment);
    expect(
      renderedTitle.spaceBeforeHighlightWidth,
      `the space before the highlighted fragment should be visibly rendered (${renderedTitle.html})`,
    ).toBeGreaterThan(1);
    expect(
      renderedTitle.spaceAfterHighlightWidth,
      `the space after the highlighted fragment should be visibly rendered (${renderedTitle.html})`,
    ).toBeGreaterThan(1);
  });
});
