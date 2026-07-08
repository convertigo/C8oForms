import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  configureDataSourceFilterMonacoPaletteValue,
  configureGridBaserowSource,
  createBlankForm,
  login,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1279
 * "Dropped variables do not work in data source filter Monaco editors"
 *
 * Reproduced on 2.2.0-beta112 and validated OK in 2.2.0-beta115. The observed
 * mechanism is that Source Palette formula/API entries such as getBrowserLang
 * were exposed to the data-source Filter editor with the wrong target type, so
 * dragStartAction did not mark the drag as a C8oForms Monaco/filter source drop.
 * The Monaco drop handler then ignored the drop instead of inserting
 * api.translate.getBrowserLang().
 *
 * The C8oForms form is built only through the Studio UI: create a blank form,
 * add a Data Grid, configure its Baserow source, open the data-source Filter
 * panel, add a filter row, switch its value to JavaScript/Monaco, and drop the
 * Source Palette entry into Monaco.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1279 Filter Monaco DnD';
const GRID_ID = 'grid_filter_1279';
const LANG_COLUMN = 'LANG';
const EXPECTED_CODE = 'api.translate.getBrowserLang()';

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(240_000);

test.beforeAll(async () => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      { name: LANG_COLUMN, type: 'text' },
      { name: 'Label', type: 'text' },
    ],
    rows: [
      { Name: 'row_1279_fr', LANG: 'fr', Label: 'French row' },
      { Name: 'row_1279_en', LANG: 'en', Label: 'English row' },
    ],
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);
});

test('#1279 - data source filter Monaco accepts Source Palette API drops', async ({ page }) => {
  await test.step('Create a grid backed by Baserow', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1279 filter Monaco ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);
    await setTechnicalId(page, GRID_ID);
    await configureGridBaserowSource(page, {
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      expectedColumns: [LANG_COLUMN, 'Label'],
      allowLegacySourceSummaryMissing: true,
    });
  });

  const payload = await configureDataSourceFilterMonacoPaletteValue(page, {
    sourceSection: 'translation',
    sourceLabel: 'getBrowserLang',
    expectedCode: EXPECTED_CODE,
  });

  expect(payload.plainData, 'Source Palette drag should carry the Translation API code').toBe(EXPECTED_CODE);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    console.warn(`Baserow MCP read-back did not list ${TABLE}; continuing with UI validation.`);
    return;
  }
  const columns = table.columns ?? [];
  for (const columnName of ['Name', LANG_COLUMN, 'Label']) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
}
