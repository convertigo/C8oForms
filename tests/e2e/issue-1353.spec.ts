import { test } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectDataSourceSortMissingConfigResolved,
  login,
  openComponentConfig,
  openDataSourceSortPanel,
  selectGridBaserowSourceWithoutTable,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1353
 *
 * Found in 2.2.0-beta147. Fixed by a804c4d5 (first tagged in
 * 2.2.0-beta150) and validated OK in 2.2.0-beta153.
 *
 * Root cause: the Sort section of dataSourceEditor fell into its loading
 * fallback when forms_config/table configuration was missing, leaving an
 * indeterminate ion-progress-bar visible forever. The fix renders the same
 * missing-configuration error path as Filter and disables that fallback loader.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Data Grid, select the Baserow/getData source type, intentionally leave the
 * table unconfigured, and open Sort. No form document writes or fixture
 * shortcuts are used.
 */

test.setTimeout(180_000);

test('#1353 - Sort reports a missing data source instead of loading forever', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1353 source sort ${Date.now()}`);
  });

  await test.step('Add a Data Grid and open its configuration', async () => {
    await addComponent(page, PALETTE_ICON.grid);
    await page.locator(SEL.gridComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.gridComponent);
  });

  await test.step('Select a data source type without configuring a table', async () => {
    await selectGridBaserowSourceWithoutTable(page);
  });

  await test.step('Open Sort and assert the missing-configuration state', async () => {
    await openDataSourceSortPanel(page);
    await expectDataSourceSortMissingConfigResolved(page);
  });
});
