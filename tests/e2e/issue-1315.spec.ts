import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addPageThroughPagesPanel,
  closeComponentConfig,
  configureComponentNavigationFilter,
  createBlankForm,
  expectComponentNavigationFilter,
  login,
  openComponentConfig,
  openComponentNavigationConfig,
  setChoiceLocalOptions,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1315
 * "Page navigation filter text field is not saved and chip mode is unclear".
 *
 * Broken version: 2.2.0-beta120.
 * Fixed version: 46be3e8c first shipped in 2.2.0-beta150; the ticket was
 * validated OK in 2.2.0-beta153.
 * Root cause: GoToPage filters categorized Select, Radio and Checkbox as
 * multiple-value fields. Their right-hand value therefore rendered through the
 * chip/tag editor, where typed text and committed chips were not serialized
 * back as the simple text value expected by page navigation filters. The fix
 * moves those components to the simple GoToPage field set.
 *
 * The C8oForms fixture is built only through Studio UI: create a blank form,
 * add and configure a Select component, add a second page, configure the Select
 * component Navigation filter, close and reopen the same component settings.
 */

const SELECT_ID = 'select_1315';
const EXPECTED_VALUE = 'Alpha 1315';
const SECOND_VALUE = 'Beta 1315';

test.setTimeout(240_000);

test('#1315 - Page navigation filter keeps a Select text value after reopening', async ({ page }) => {
  await test.step('Log in and create a form with a Select source', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1315 navigation filter ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.select);
    await expect(page.locator(SEL.selectComponent), 'the Select component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, SELECT_ID);
    await setChoiceLocalOptions(page, [EXPECTED_VALUE, SECOND_VALUE]);
    await closeComponentConfig(page);
  });

  const targetPageName = await test.step('Add a second page through the Pages panel', async () => {
    return addPageThroughPagesPanel(page);
  });

  await test.step('Configure the Select component Navigation filter', async () => {
    await openComponentNavigationConfig(page, SEL.selectComponent);
    await configureComponentNavigationFilter(page, {
      field: SELECT_ID,
      operator: 'equals',
      value: EXPECTED_VALUE,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Reopen Navigation settings and assert the filter persisted', async () => {
    await openComponentNavigationConfig(page, SEL.selectComponent);
    await expectComponentNavigationFilter(page, {
      field: SELECT_ID,
      operator: 'equals',
      value: EXPECTED_VALUE,
      action: 'goTo',
      pageName: targetPageName,
    });
  });
});
