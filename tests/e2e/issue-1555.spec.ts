import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addButtonFlowBusinessLogicAction,
  addComponent,
  closeComponentConfig,
  configureGridBaserowSource,
  createBlankForm,
  dataGridRowHeight,
  login,
  openComponentConfigAt,
  openComponentsPalette,
  openPreview,
  setGridLocalDataSource,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1555
 * "Grid row height differs between Baserow and local Formula data sources"
 *
 * Found in 2.2.0-beta342, still present in 2.2.0-beta347. Not fixed in a release yet.
 *
 * Root cause: the Data Grid rows are auto height (autoHeight in itemGridViewer's defaultColDef). The cells of
 * a Baserow source are html cells: formssource_GetTableData renders them in a flex <div>. The cells of a local
 * grid (source "From local data") went through the TextCellRenderer that viewerPage registers for local grids,
 * which wraps the text in a <p>: its default 16px top and bottom margins made every local row 59px high
 * instead of 27px. The local fix (92e42139, not released yet) renders the same flex <div> as the Baserow
 * cells, without a <p>.
 *
 * The ticket fills the local grid from a Formula. A Formula runs before the viewer creates the local grid, so
 * it only fills it when a later change of another field runs it again. The test fills the local grid from a
 * Business logic action of a Button flow instead: the rows go through the same local grid cell renderer.
 *
 * The C8oForms form is built only through the Studio UI: create a blank form, add a Data Grid bound to the
 * Baserow table, a Data Grid on local data, and a Button whose flow writes the local rows. The Baserow table
 * itself is ensured through the No Code MCP.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1555 Grid Row Height';
const SOURCE_COLUMNS = ['Name', 'Key', 'Value', 'Lang'];
const BASEROW_ROWS = [
  { Name: 'row_1555_a', Key: 'firstname', Value: 'Firstname', Lang: 'en' },
  { Name: 'row_1555_b', Key: 'lastname', Value: 'Lastname', Lang: 'en' },
  { Name: 'row_1555_c', Key: 'gender', Value: 'Gender', Lang: 'en' },
];
const LOCAL_GRID = 'local_grid_1555';
// A new Data Grid on local data has the Make, Model and Price columns.
const LOCAL_ROWS = [
  { Make: 'row_1555_local_a', Model: 'firstname', Price: 'Firstname' },
  { Make: 'row_1555_local_b', Model: 'lastname', Price: 'Lastname' },
  { Make: 'row_1555_local_c', Model: 'gender', Price: 'Gender' },
];
// Both grids render one line of text per row: 27px, against 59px for the local rows on beta347.
const ROW_HEIGHT_TOLERANCE = 2;

test.use({
  viewport: { width: 1600, height: 1000 },
});

test.setTimeout(240_000);

test.beforeAll(async () => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: SOURCE_COLUMNS.map((name) => ({ name, type: 'text' })),
    rows: BASEROW_ROWS,
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);
});

test('#1555 - Data Grid rows on local data are as high as rows from a Baserow source', async ({ page }) => {
  await test.step('Log in and create a blank form', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1555 grid row height ${Date.now()}`);
  });

  await test.step('Add a Data Grid bound to the Baserow table', async () => {
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.gridComponent), 'the Baserow Data Grid should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.gridComponent, 0);
    await configureGridBaserowSource(page, {
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      expectedColumns: SOURCE_COLUMNS,
    });
    await closeComponentConfig(page);
  });

  await test.step('Add a Data Grid on local data', async () => {
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.gridComponent), 'the local Data Grid should be added').toHaveCount(2, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.gridComponent, 1);
    await setTechnicalId(page, LOCAL_GRID);
    await setGridLocalDataSource(page);
    await closeComponentConfig(page);
  });

  await test.step('Add a Button whose flow writes the local grid rows', async () => {
    await openComponentsPalette(page, PALETTE_ICON.button);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.buttonComponent), 'the Button should be added').toHaveCount(1, { timeout: 30_000 });
    await addButtonFlowBusinessLogicAction(
      page,
      'init_local_grid_1555',
      `(async ()=>{ page.local.sourceValue["${LOCAL_GRID}"].data = ${JSON.stringify(LOCAL_ROWS)}; return ""; })();`,
    );
  });

  const baserowGrid = page.locator(`${SEL.gridComponent}:visible`).nth(0);
  const localGrid = page.locator(`${SEL.gridComponent}:visible`).nth(1);

  await test.step('Open Preview, wait for the Baserow rows and fill the local grid', async () => {
    await openPreview(page, SEL.gridComponent);
    await expect(baserowGrid.getByText(BASEROW_ROWS[0].Name), 'the Baserow rows should be loaded').toBeVisible({
      timeout: 45_000,
    });
    const button = page.locator(`${SEL.buttonComponent}:visible ion-button`).first();
    await expect(button, 'the viewer Button should be visible').toBeVisible({ timeout: 30_000 });
    await button.click({ timeout: 10_000 });
    await expect(localGrid.getByText(LOCAL_ROWS[0].Make), 'the Button flow should fill the local grid').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Local rows are as high as the Baserow rows', async () => {
    const baserowHeights = [];
    for (const row of BASEROW_ROWS) {
      baserowHeights.push(await dataGridRowHeight(baserowGrid, row.Name));
    }
    const baserowHeight = Math.max(...baserowHeights);
    expect(baserowHeight, 'a Baserow row should be rendered').toBeGreaterThan(0);
    for (const row of LOCAL_ROWS) {
      const localHeight = await dataGridRowHeight(localGrid, row.Make);
      expect(
        Math.abs(localHeight - baserowHeight),
        `the local row ${row.Make} is ${localHeight}px high, the Baserow rows ${baserowHeight}px`,
      ).toBeLessThanOrEqual(ROW_HEIGHT_TOLERANCE);
    }
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
    expect(column?.type, `Baserow column ${columnName} should be a text field`).toBe('text');
  }
}
