import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureDataSourceFilterTextValue,
  configureSelectBaserowSource,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setTechnicalId,
  sourceSelectVisibleOptions,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1398
 * "Select data sources cannot filter on columns different from display/value columns".
 *
 * Broken version: 2.2.0-beta198, inferred because the fix commit a2f69c60 is
 * first contained in 2.2.0-beta199.
 * Fixed version: the ticket was validated OK in 2.2.0-beta205.
 * Root cause: Select Baserow source configuration only retained fields chosen
 * as display and submitted value fields. A column used only by the Filter panel
 * was not available to the source model, so authors could not filter on hidden
 * Baserow columns such as an Active flag while returning only the displayed
 * value. The fixture stores the hidden filter flag as text so the regression
 * check stays focused on hidden filter-field retention rather than
 * boolean-operator rendering.
 *
 * The C8oForms form is built only through the Studio UI. The external Baserow
 * table is an idempotent MCP fixture, selected later through the Select source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1398 Hidden Filter Name';
const NAME = 'Name';
const FILTER_FLAG = 'FilterFlag';
const ACTIVE_VALUE = 'enabled';
const TECHNICAL_ID = 'source_select_filter_1398';

const ACTIVE_NAMES = ['Alpha 1398', 'Charlie 1398'];
const INACTIVE_NAMES = ['Bravo 1398'];

const ROWS = [
  { [NAME]: 'Alpha 1398', [FILTER_FLAG]: ACTIVE_VALUE },
  { [NAME]: 'Bravo 1398', [FILTER_FLAG]: 'disabled' },
  { [NAME]: 'Charlie 1398', [FILTER_FLAG]: ACTIVE_VALUE },
];

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(420_000);

test('#1398 - Baserow Select filters by a hidden source column', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: NAME,
    columns: [
      { name: NAME, type: 'text' },
      { name: FILTER_FLAG, type: 'text' },
    ],
    rows: ROWS,
    upsertKey: NAME,
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1398 hidden filter ${Date.now()}`);

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
    expectedColumns: [NAME, FILTER_FLAG],
    displayColumn: NAME,
    valueColumn: NAME,
  });
  await configureDataSourceFilterTextValue(page, {
    column: FILTER_FLAG,
    operator: 'equal',
    value: ACTIVE_VALUE,
  });
  await closeComponentConfig(page);

  await openPreview(page, SEL.selectComponent);
  const choices = await sourceSelectVisibleOptions(page, ACTIVE_NAMES, INACTIVE_NAMES);
  expect(choices, 'the Select should return only active names filtered by hidden FilterFlag').toEqual(ACTIVE_NAMES);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    console.warn(`Baserow MCP read-back did not list ${TABLE}; continuing with UI validation.`);
    return;
  }

  const columns = table?.columns ?? [];
  const nameColumn = columns.find((candidate) => candidate.name === NAME);
  expect(nameColumn, `Baserow column ${NAME} should exist`).toBeTruthy();
  expect(nameColumn?.type, `Baserow column ${NAME} should be a Text field`).toBe('text');

  const flagColumn = columns.find((candidate) => candidate.name === FILTER_FLAG);
  expect(flagColumn, `Baserow column ${FILTER_FLAG} should exist`).toBeTruthy();
  expect(flagColumn?.type, `Baserow column ${FILTER_FLAG} should be a Text field`).toBe('text');
}
