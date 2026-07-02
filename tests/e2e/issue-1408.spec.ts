import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  SEL,
  configureMapBaserowSource,
  createFormWithMap,
  expectMapBaserowSourceRoles,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1408
 * "Allow selecting latitude and longitude fields when configuring map data sources".
 *
 * First implemented by 3b249a69 in 2.2.0-beta246, but still not OK in
 * 2.2.0-beta247 because the Map role checkboxes were present in the Baserow
 * configuration table but not visible/usable. Follow-up 5ff24c4b changed those
 * role checkboxes to the fixed modal-configure style and was validated OK in
 * 2.2.0-beta248.
 *
 * Root cause: Map source configuration inferred title/latitude/longitude from
 * the first returned columns. The fix adds explicit role checkboxes in the
 * Baserow table picker and saves the selected label, latitude, and longitude
 * fields in that order.
 *
 * The C8oForms form is built only through Studio UI. The external Baserow table
 * is an idempotent MCP fixture, selected later through the Map source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1408 Map Source Roles';
const TECHNICAL_ID = 'source_map_1408';

const IGNORED_TITLE = 'Ignored title';
const IGNORED_LATITUDE = 'Ignored latitude';
const IGNORED_LONGITUDE = 'Ignored longitude';
const EXPECTED_TITLE = 'Expected title';
const EXPECTED_LATITUDE = 'Expected latitude';
const EXPECTED_LONGITUDE = 'Expected longitude';

const SOURCE_COLUMNS = [
  IGNORED_TITLE,
  IGNORED_LATITUDE,
  IGNORED_LONGITUDE,
  EXPECTED_TITLE,
  EXPECTED_LATITUDE,
  EXPECTED_LONGITUDE,
];

const ROWS = [
  {
    [IGNORED_TITLE]: 'Ignored Paris 1408',
    [IGNORED_LATITUDE]: 0,
    [IGNORED_LONGITUDE]: 0,
    [EXPECTED_TITLE]: 'Expected Paris 1408',
    [EXPECTED_LATITUDE]: 48,
    [EXPECTED_LONGITUDE]: 2,
  },
  {
    [IGNORED_TITLE]: 'Ignored Lyon 1408',
    [IGNORED_LATITUDE]: 1,
    [IGNORED_LONGITUDE]: 1,
    [EXPECTED_TITLE]: 'Expected Lyon 1408',
    [EXPECTED_LATITUDE]: 45,
    [EXPECTED_LONGITUDE]: 4,
  },
];

test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(420_000);

test('#1408 - Map data source keeps explicit latitude and longitude fields', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: IGNORED_TITLE,
    columns: [
      { name: IGNORED_TITLE, type: 'text' },
      { name: IGNORED_LATITUDE, type: 'number' },
      { name: IGNORED_LONGITUDE, type: 'number' },
      { name: EXPECTED_TITLE, type: 'text' },
      { name: EXPECTED_LATITUDE, type: 'number' },
      { name: EXPECTED_LONGITUDE, type: 'number' },
    ],
    rows: ROWS,
    upsertKey: IGNORED_TITLE,
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createFormWithMap(page, {
    title: `Issue 1408 map roles ${Date.now()}`,
    technicalId: TECHNICAL_ID,
  });

  await openComponentConfig(page, SEL.mapComponent);
  await configureMapBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: SOURCE_COLUMNS,
    titleColumn: EXPECTED_TITLE,
    latitudeColumn: EXPECTED_LATITUDE,
    longitudeColumn: EXPECTED_LONGITUDE,
  });
  await expectMapBaserowSourceRoles(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: SOURCE_COLUMNS,
    titleColumn: EXPECTED_TITLE,
    latitudeColumn: EXPECTED_LATITUDE,
    longitudeColumn: EXPECTED_LONGITUDE,
  });
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();

  const columns = table?.columns ?? [];
  for (const columnName of [IGNORED_TITLE, EXPECTED_TITLE]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
  for (const columnName of [IGNORED_LATITUDE, IGNORED_LONGITUDE, EXPECTED_LATITUDE, EXPECTED_LONGITUDE]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Number field`).toBe('number');
  }
}
