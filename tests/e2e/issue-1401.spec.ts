import { expect, test } from '@playwright/test';
import {
  PALETTE_ICON,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openComponentConfigByTechnicalId,
  reopenEditorFromHome,
  setTechnicalId,
} from './helpers/studio';
import { ensureBaserowTable } from './helpers/baserow';
import {
  BASEROW_BASE,
  BASEROW_WORKSPACE,
  checkedDisplayColumns,
  checkedValueColumns,
  configureSelectBaserowSource,
  openSelectSourceConfiguration,
  openSelectTablePicker,
} from './helpers/select-source';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1401
 * "Select data source always re-selects two columns instead of one"
 *
 * Found in 2.2.0-beta204, fixed by 4367d4c9 (first released in
 * 2.2.0-beta218). Root cause: DisplayTableColumns reused indexOf() for
 * page.local.valueColumn even when the Select component stored it as a scalar
 * string, so reopening the table configuration could mark both "id" and the
 * chosen value column.
 */
const TABLE = 'Issue 1401 Select Id Substring';
const VALUE_COLUMN_CANDIDATES = ['id', 'Name', 'Notes', 'Active', 'client_id', 'Label'];

test.setTimeout(120_000);

test.beforeAll(async () => {
  await ensureBaserowTable({
    workspace: BASEROW_WORKSPACE,
    database: BASEROW_BASE,
    table: TABLE,
    columns: [
      { name: 'client_id', type: 'text' },
      { name: 'Label', type: 'text' },
    ],
    rows: [
      { client_id: 'client-1', Label: 'Alpha' },
      { client_id: 'client-2', Label: 'Beta' },
    ],
  });
});

test('#1401 - select data source keeps a single value column after reopening configuration', async ({ page }) => {
  await login(page);
  const title = `Issue 1401 ${Date.now()}`;
  await createBlankForm(page, title);

  await addComponent(page, PALETTE_ICON.select);
  await page.locator('c8oforms-itemselectviewver').first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, 'c8oforms-itemselectviewver');
  await setTechnicalId(page, 'select_columns');

  await configureSelectBaserowSource(page, {
    table: TABLE,
    displayColumn: 'client_id',
    valueColumn: 'client_id',
  });

  await closeComponentConfig(page);
  await reopenEditorFromHome(page, title);
  await openComponentConfigByTechnicalId(page, 'select_columns');
  await openSelectSourceConfiguration(page);

  const tablePicker = await openSelectTablePicker(page);
  await expect(tablePicker.locator('.class1776246576145')).toContainText(TABLE, { timeout: 15_000 });
  await expect
    .poll(() => checkedValueColumns(tablePicker, VALUE_COLUMN_CANDIDATES), {
      message: 'reopening the Select source must not re-select id next to the saved value column',
      timeout: 10_000,
    })
    .toEqual(['client_id']);
  await expect
    .poll(() => checkedDisplayColumns(tablePicker, VALUE_COLUMN_CANDIDATES), {
      message: 'display and value should stay on the same single selected column',
      timeout: 10_000,
    })
    .toEqual(['client_id']);
});
