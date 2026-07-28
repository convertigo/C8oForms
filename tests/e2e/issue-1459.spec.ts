import { test, expect } from './fixtures';
import { ensureBaserowTable, mintCurrentWorkerMcpToken, type BaserowCatalog } from './helpers/baserow';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  setTechnicalId,
  configureGridBaserowSource,
  configureDataSourceGroupBy,
  dataSourceFilterFieldOptions,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1459
 * "Grid filter column list is restricted after selecting a Group by column"
 *
 * Found in C8oForms 2.2.0-beta281 with lib_BaseRow 1.1.42-hotfix28.
 * No fixed release exists yet.
 *
 * Root cause / observed mechanism: C8OForms requests model="all_columns" when
 * opening the Filter editor, but lib_BaseRow.formssource_GetTableData reapplies
 * its grouped model whenever forms_tableGroupBy is set. The returned model then
 * contains only the Group by field (plus aggregation metadata), so the Filter
 * field picker loses every other source column.
 *
 * The form fixture is built entirely through the Studio UI: create a blank
 * form, add a Data Grid, configure its Baserow source, and set Group by. Only
 * the external Baserow table is ensure-created through MCP.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1459 Grid Group By Filter';
const NAME = 'Name 1459';
const GROUP = 'Category 1459';
const FILTER_ONLY = 'Filter witness 1459';
const COLUMNS = [NAME, GROUP, FILTER_ONLY];

test.setTimeout(300_000);

test('#1459 - Grid Filter keeps all Baserow columns after Group by is selected', async ({ page }) => {
  const token = mintCurrentWorkerMcpToken();
  const catalog = await test.step('Ensure the Baserow fixture', () =>
    ensureBaserowTable(
      {
        workspace: WORKSPACE,
        database: BASE,
        table: TABLE,
        primaryField: NAME,
        columns: COLUMNS.map((name) => ({ name, type: 'text' })),
        rows: [
          { [NAME]: 'row-alpha-1459', [GROUP]: 'alpha', [FILTER_ONLY]: 'enabled' },
          { [NAME]: 'row-beta-1459', [GROUP]: 'beta', [FILTER_ONLY]: 'disabled' },
        ],
        upsertKey: NAME,
      },
      token,
    ),
  );
  assertBaserowFixture(catalog);

  await test.step('Create a Data Grid form through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1459 Group by Filter ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);
    await setTechnicalId(page, 'grid_group_by_filter_1459');
  });

  await test.step('Configure the Baserow source and Group by', async () => {
    await configureGridBaserowSource(page, {
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      expectedColumns: COLUMNS,
    });
    await configureDataSourceGroupBy(page, GROUP);
  });

  const options = await dataSourceFilterFieldOptions(page);
  const missing = COLUMNS.filter((column) => !options.includes(column));
  expect(
    missing,
    `Filter should offer every source column after Group by ${GROUP}; available: ${options.join(', ')}`,
  ).toEqual([]);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    console.warn(`Baserow MCP read-back did not list ${TABLE}; continuing with UI validation.`);
    return;
  }
  for (const expected of COLUMNS) {
    const column = (table.columns ?? []).find((candidate) => candidate.name === expected);
    expect(column, `Baserow column ${expected} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${expected} should be text`).toBe('text');
  }
}
