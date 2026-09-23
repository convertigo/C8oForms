import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureGridBaserowSource,
  createBlankForm,
  expectDataGridHeaders,
  login,
  normalizedLocatorText,
  openComponentConfig,
  openPreview,
  visibleDataGridRow,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1554
 * "Data Grid: column headers from a data source are title-cased instead of matching the source column names"
 *
 * Found in 2.2.0-beta327, still present in 2.2.0-beta347, fixed in 2.2.0-beta348. Regression from 2cc1eb0d
 * (#1491, first in 2.2.0-beta319).
 *
 * Root cause: the grid postFunc of viewerPage builds the runtime column definitions with a `field` only.
 * itemGridViewer.checkColumnDefs() used to give them the header names of the Baserow source configuration,
 * but since 2cc1eb0d it drops that configuration as soon as the runtime columns differ from
 * item.config.columns, which still holds the Make/Model/Price placeholders written when the grid is
 * created. With no headerName, AG Grid builds the header with camelCaseToHumanText(field), which
 * uppercases the first letter of every word. The editor canvas, and the viewer before the rows arrive,
 * still read the source configuration and show the right names. Fix 951850b0 (merged into NGX by 5fd3f83b)
 * sets headerName to the field in the postFunc.
 *
 * The C8oForms form is built only through the Studio UI: create a blank form, add a Data Grid and select
 * the Baserow table as its source. The Baserow table itself is ensured through the No Code MCP.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1554 Grid Header Names';
const NAME_COLUMN = 'Name';
const STATUS_COLUMN = 'statut action';
const FORMULA_COLUMN = 'Etat de la saisie';
const TEXT_COLUMN = 'commentaire libre';
const HYPHENATED_COLUMN = 'Sous-action';
const ROW_NAME = 'row_1554_app1';
const STATUS_VALUE = 'In progress';
const FORMULA_VALUE = `${ROW_NAME} formula`;
// Names with spaces or a lowercase first letter are the ones AG Grid rewrites; Sous-action is a control.
const SOURCE_COLUMNS = [NAME_COLUMN, STATUS_COLUMN, FORMULA_COLUMN, TEXT_COLUMN, HYPHENATED_COLUMN];
const COLUMN_TYPES: Record<string, string> = {
  [NAME_COLUMN]: 'text',
  [STATUS_COLUMN]: 'single_select',
  [FORMULA_COLUMN]: 'formula',
  [TEXT_COLUMN]: 'text',
  [HYPHENATED_COLUMN]: 'text',
};

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(180_000);

test.beforeAll(async () => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: NAME_COLUMN,
    columns: [
      { name: NAME_COLUMN, type: 'text' },
      { name: STATUS_COLUMN, type: 'single_select', values: [STATUS_VALUE, 'Postponed'] },
      { name: FORMULA_COLUMN, type: 'formula', formula: `concat(field('${NAME_COLUMN}'), ' formula')` },
      { name: TEXT_COLUMN, type: 'text' },
      { name: HYPHENATED_COLUMN, type: 'text' },
    ],
    rows: [
      {
        [NAME_COLUMN]: ROW_NAME,
        [STATUS_COLUMN]: STATUS_VALUE,
        [TEXT_COLUMN]: 'free text 1554',
        [HYPHENATED_COLUMN]: 'sub action 1554',
      },
    ],
    upsertKey: NAME_COLUMN,
  });
  assertBaserowFixture(catalog);
});

test('#1554 - Data Grid headers keep the Baserow column names in Preview', async ({ page }) => {
  await test.step('Log in and create a blank form', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1554 grid headers ${Date.now()}`);
  });

  await test.step('Add a Data Grid and select the Baserow table as its source', async () => {
    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      expectedColumns: SOURCE_COLUMNS,
    });
    await closeComponentConfig(page);
  });

  await test.step('The editor canvas shows the source column names', async () => {
    await expectDataGridHeaders(page.locator(SEL.gridComponent).first(), SOURCE_COLUMNS, 'editor');
  });

  await test.step('Open Preview and wait for the Baserow row', async () => {
    await openPreview(page, SEL.gridComponent);
    // The viewer shows the right names until the rows arrive: only assert once the row is rendered,
    // with the single select and formula cells filled from the source.
    const row = await visibleDataGridRow(page, ROW_NAME);
    const rowText = await normalizedLocatorText(row);
    expect(rowText, 'the single select cell should be rendered').toContain(STATUS_VALUE);
    expect(rowText, 'the formula cell should be rendered').toContain(FORMULA_VALUE);
  });

  await test.step('Preview headers keep the exact source column names', async () => {
    await expectDataGridHeaders(page.locator(`${SEL.gridComponent}:visible`).first(), SOURCE_COLUMNS, 'viewer');
  });
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    console.warn(`Baserow MCP read-back did not list ${TABLE}; continuing with UI validation.`);
    return;
  }
  const columns = table.columns ?? [];
  for (const columnName of SOURCE_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a ${COLUMN_TYPES[columnName]} field`).toBe(
      COLUMN_TYPES[columnName],
    );
  }
}
