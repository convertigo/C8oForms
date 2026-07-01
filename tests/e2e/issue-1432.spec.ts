import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureChartBaserowSource,
  createBlankForm,
  expectChartBaserowSourceRoles,
  login,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1432
 * "Allow selecting category and value fields when configuring chart data sources".
 *
 * Reported and first implemented around 2.2.0-beta246, still not OK in
 * 2.2.0-beta247 because the Chart Category/Value selectors were not usable
 * enough in the Baserow configuration modal. Fixed and validated OK in
 * 2.2.0-beta248.
 *
 * Root cause: Chart source configuration inferred labels/values from the first
 * available Baserow columns. The fix adds explicit Category and Value role
 * checkboxes and saves the selected category column first, followed by selected
 * value column(s).
 *
 * The C8oForms form is built only through Studio UI. The external Baserow table
 * is an idempotent MCP fixture, selected later through the Chart source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1432 Chart Source Roles';
const TECHNICAL_ID = 'source_chart_1432';

const IGNORED_CATEGORY = 'Ignored category';
const EXPECTED_CATEGORY = 'Expected category';
const IGNORED_VALUE = 'Ignored value';
const EXPECTED_VALUE = 'Expected value';

const EXPECTED_CATEGORIES = ['Expected Alpha 1432', 'Expected Bravo 1432'];
const IGNORED_CATEGORIES = ['Ignored Alpha 1432', 'Ignored Bravo 1432'];

const ROWS = [
  {
    [IGNORED_CATEGORY]: IGNORED_CATEGORIES[0],
    [EXPECTED_CATEGORY]: EXPECTED_CATEGORIES[0],
    [IGNORED_VALUE]: 900,
    [EXPECTED_VALUE]: 12,
  },
  {
    [IGNORED_CATEGORY]: IGNORED_CATEGORIES[1],
    [EXPECTED_CATEGORY]: EXPECTED_CATEGORIES[1],
    [IGNORED_VALUE]: 800,
    [EXPECTED_VALUE]: 34,
  },
];

const SOURCE_COLUMNS = [IGNORED_CATEGORY, EXPECTED_CATEGORY, IGNORED_VALUE, EXPECTED_VALUE];

test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(420_000);

test('#1432 - Chart data source uses explicit category and value fields', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: IGNORED_CATEGORY,
    columns: [
      { name: IGNORED_CATEGORY, type: 'text' },
      { name: EXPECTED_CATEGORY, type: 'text' },
      { name: IGNORED_VALUE, type: 'number' },
      { name: EXPECTED_VALUE, type: 'number' },
    ],
    rows: ROWS,
    upsertKey: IGNORED_CATEGORY,
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1432 chart roles ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.chart);
  await expect(page.locator(SEL.chartComponent), 'the Chart component should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfig(page, SEL.chartComponent);
  await setTechnicalId(page, TECHNICAL_ID);
  await configureChartBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: SOURCE_COLUMNS,
    categoryColumn: EXPECTED_CATEGORY,
    valueColumns: [EXPECTED_VALUE],
  });
  await expectChartBaserowSourceRoles(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: SOURCE_COLUMNS,
    categoryColumn: EXPECTED_CATEGORY,
    valueColumns: [EXPECTED_VALUE],
  });
  await closeComponentConfig(page);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();

  const columns = table?.columns ?? [];
  for (const columnName of [IGNORED_CATEGORY, EXPECTED_CATEGORY]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
  for (const columnName of [IGNORED_VALUE, EXPECTED_VALUE]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Number field`).toBe('number');
  }
}
