import { expect, test } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureSelectBaserowSource,
  createBlankForm,
  expectSelectBaserowColumnsVisible,
  login,
  openComponentConfig,
  openComponentConfigByTechnicalId,
  openSelectBaserowSourceConfiguration,
  openSelectBaserowTablePicker,
  reopenEditorFromHome,
  settledSelectBaserowDisplayColumns,
  settledSelectBaserowValueColumns,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1401
 * Point 2 only: "Select data source always re-selects two columns".
 *
 * Found in 2.2.0-beta204, fixed by 4367d4c9 (first tagged in
 * 2.2.0-beta218). Root cause: DisplayTableColumns used indexOf() on
 * page.local.valueColumn even when the Select stored it as a scalar string, so
 * a value column named "identifier" also matched and selected the generated
 * "id" column when the source configuration was reopened.
 *
 * The C8oForms form is built only through the Studio UI. The external Baserow
 * table is an idempotent MCP fixture, selected later through the Select source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1401 Select Identifier';
const TECHNICAL_ID = 'select_identifier_1401';
const DISPLAY_COLUMN = 'Name';
const VALUE_COLUMN = 'identifier';
const COLUMN_CANDIDATES = ['id', 'Name', 'identifier'];

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(180_000);

test.beforeAll(async () => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      { name: 'identifier', type: 'text' },
    ],
    rows: [
      { Name: 'row_1401_alpha', identifier: 'identifier-alpha' },
      { Name: 'row_1401_beta', identifier: 'identifier-beta' },
    ],
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);
});

test('#1401 - source Select reopens with only the identifier column selected', async ({ page }) => {
  await login(page);
  const title = `Issue 1401 select identifier ${Date.now()}`;
  await createBlankForm(page, title);

  await addComponent(page, PALETTE_ICON.select);
  await expect(page.locator(SEL.selectComponent), 'the Select component should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfig(page, SEL.selectComponent);
  await setTechnicalId(page, TECHNICAL_ID);
  await configureSelectBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: ['Name', 'identifier'],
    displayColumn: DISPLAY_COLUMN,
    valueColumn: VALUE_COLUMN,
  });

  await closeComponentConfig(page);
  await reopenEditorFromHome(page, title);
  await openComponentConfigByTechnicalId(page, TECHNICAL_ID);
  await openSelectBaserowSourceConfiguration(page);

  const tablePicker = await openSelectBaserowTablePicker(page);
  await expect(tablePicker.locator('.class1776246576145')).toContainText(TABLE, { timeout: 15_000 });
  await expectSelectBaserowColumnsVisible(tablePicker, COLUMN_CANDIDATES);

  const checkedValueColumns = await settledSelectBaserowValueColumns(tablePicker, COLUMN_CANDIDATES);
  expect(
    checkedValueColumns,
    `reopening the Select source must not re-select id next to identifier; checked value columns: ${checkedValueColumns.join(', ')}`,
  ).toEqual(['identifier']);

  const checkedDisplayColumns = await settledSelectBaserowDisplayColumns(tablePicker, COLUMN_CANDIDATES);
  expect(
    checkedDisplayColumns,
    `display column should stay on the configured Name column; checked display columns: ${checkedDisplayColumns.join(', ')}`,
  ).toEqual(['Name']);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    // Older deployed C8oForms/BaserowIntegration tags do not always expose the
    // schema-apply read-back through MCP. The Studio table picker below still
    // validates that the ensured table and expected columns are available.
    console.warn(`Baserow MCP read-back did not list ${TABLE}; continuing with UI validation.`);
    return;
  }
  const columns = table?.columns ?? [];
  for (const columnName of ['Name', 'identifier']) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
}
