import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureDataSourceSort,
  configureSelectBaserowSource,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setTechnicalId,
  sourceSelectVisibleOptions,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1430
 * "Baserow source fails when sorting by a hidden field".
 *
 * Broken version: 2.2.0-beta242, inferred because the issue has no Version
 * field and 2.2.0-beta243 is the first tag containing the fix.
 * Fixed version: 0628ecc0 first shipped in 2.2.0-beta243; the ticket was
 * validated OK in 2.2.0-beta247.
 * Root cause: C8oForms used lib_BaseRow 1.1.42-hotfix25, whose getSelectData
 * call did not request columns used only for sorting when they were hidden from
 * the displayed/value fields. Sorting a Select by date_ronde while returning
 * only Name made the source fail or return no usable rows. The fix bumps
 * lib_BaseRow to 1.1.42-hotfix26, which internally includes sort fields.
 *
 * The C8oForms form is built only through Studio UI. The external Baserow table
 * is an idempotent MCP fixture, selected later through the Select source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1430 Hidden Sort Field';
const NAME = 'Name';
const SORT_DATE = 'date_ronde';
const TECHNICAL_ID = 'source_select_1430';

const ROWS = [
  { [NAME]: 'Alpha 1430', [SORT_DATE]: '2026-01-10' },
  { [NAME]: 'Bravo 1430', [SORT_DATE]: '2026-03-10' },
  { [NAME]: 'Charlie 1430', [SORT_DATE]: '2026-02-10' },
];

const EXPECTED_DESC_ORDER = ['Bravo 1430', 'Charlie 1430', 'Alpha 1430'];

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(420_000);

test('#1430 - Baserow Select stays sorted by a hidden field', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: NAME,
    columns: [
      { name: NAME, type: 'text' },
      { name: SORT_DATE, type: 'date', baserowOptions: { date_format: 'ISO', date_include_time: false } },
    ],
    rows: ROWS,
    upsertKey: NAME,
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1430 hidden sort field ${Date.now()}`);

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
    expectedColumns: [NAME, SORT_DATE],
    displayColumn: NAME,
    valueColumn: NAME,
  });
  await configureDataSourceSort(page, { column: SORT_DATE, order: 'desc' });
  await closeComponentConfig(page);

  await openPreview(page, SEL.selectComponent);
  const choices = await sourceSelectVisibleOptions(page, EXPECTED_DESC_ORDER);
  expect(choices, 'the Select should return Name values sorted by hidden date_ronde descending').toEqual(EXPECTED_DESC_ORDER);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();

  const columns = table?.columns ?? [];
  const nameColumn = columns.find((candidate) => candidate.name === NAME);
  expect(nameColumn, `Baserow column ${NAME} should exist`).toBeTruthy();
  expect(nameColumn?.type, `Baserow column ${NAME} should be a Text field`).toBe('text');

  const sortColumn = columns.find((candidate) => candidate.name === SORT_DATE);
  expect(sortColumn, `Baserow column ${SORT_DATE} should exist`).toBeTruthy();
  expect(sortColumn?.type, `Baserow column ${SORT_DATE} should be a Date field`).toBe('date');
  expect(sortColumn?.date_format, `Baserow column ${SORT_DATE} should use ISO date format`).toBe('ISO');
  expect(sortColumn?.date_include_time, `Baserow column ${SORT_DATE} should be a date-only field`).toBe(false);
}
