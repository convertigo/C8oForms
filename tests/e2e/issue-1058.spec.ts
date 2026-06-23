import { test, expect, Page, Locator } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  setTechnicalId,
  closeComponentConfig,
  configureGridBaserowSource,
  openPreview,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1058
 *
 * In 2.1.0-beta112, a Baserow Duration column configured as h:mm:ss rendered in
 * the C8oForms Grid bean as the raw duration seconds (5025 / 15) instead of the
 * Baserow formatted display values (1:23:45 / 0:00:15). The manifest uses
 * 2.2.0-beta218 as the executable broken target because 2.1.0-beta112 has no
 * no_code_studio_and_dependencies.zip asset for the current runner deploy flow.
 *
 * Fixed by 2d04fde4 (ref #1058 #1416 done), first tagged in 2.2.0-beta220 and
 * manually confirmed OK in 2.2.0-beta223. The test validates the current line by
 * asserting the Data Grid cell text itself, not only the whole row text.
 *
 * The C8oForms form is built only through the Studio UI. The external Baserow
 * table is an idempotent MCP fixture: the test creates missing fields and
 * upserts controlled rows before selecting that table through the UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1058 Duration Formats';
const GRID_TECHNICAL_ID = 'baserow_duration_grid_1058';
const DURATION_COLUMN = 'Duration h:mm:ss';

const DURATION_ROWS = [
  { Name: 'row_1058_long', [DURATION_COLUMN]: 5025, expectedText: '1:23:45', rawText: '5025' },
  { Name: 'row_1058_short', [DURATION_COLUMN]: 15, expectedText: '0:00:15', rawText: '15' },
] as const;

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(180_000);

test('#1058 - Baserow duration format is preserved in the data grid', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      { name: DURATION_COLUMN, type: 'duration', baserowOptions: { duration_format: 'h:mm:ss' } },
    ],
    rows: DURATION_ROWS.map(({ Name, [DURATION_COLUMN]: duration }) => ({
      Name,
      [DURATION_COLUMN]: duration,
    })),
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1058 duration formats ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.grid);
  await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfig(page, SEL.gridComponent);
  await setTechnicalId(page, GRID_TECHNICAL_ID);
  await configureGridBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: [DURATION_COLUMN],
  });
  await closeComponentConfig(page);

  await openPreview(page, SEL.gridComponent);
  await page.locator('page-viewerpage').waitFor({ state: 'attached', timeout: 30_000 });

  for (const rowSpec of DURATION_ROWS) {
    const row = await visibleGridRow(page, rowSpec.Name);
    const durationText = await visibleGridCellText(page, row, DURATION_COLUMN);
    expect(durationText, `${rowSpec.Name} should render the Baserow h:mm:ss display value`).toBe(rowSpec.expectedText);
    if (rowSpec.rawText !== rowSpec.expectedText) {
      expect(durationText, `${rowSpec.Name} must not render raw duration seconds`).not.toBe(rowSpec.rawText);
    }
  }
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  const durationColumn = columns.find((candidate) => candidate.name === DURATION_COLUMN);
  expect(durationColumn, `Baserow column ${DURATION_COLUMN} should exist`).toBeTruthy();
  expect(durationColumn?.type, `Baserow column ${DURATION_COLUMN} should be a Duration field`).toBe('duration');
  expect(durationColumn?.duration_format, `Baserow column ${DURATION_COLUMN} should keep h:mm:ss`).toBe('h:mm:ss');
}

async function visibleGridRow(page: Page, text: string): Promise<Locator> {
  const row = page.locator('.ag-center-cols-container .ag-row').filter({ hasText: text }).first();
  await expect(row, `the Baserow row ${text} should render in the Data Grid`).toBeVisible({ timeout: 45_000 });
  await expect
    .poll(() => normalizedText(row), {
      message: `the Baserow row ${text} should expose its visible cell text`,
      timeout: 15_000,
    })
    .toContain(text);
  return row;
}

async function visibleGridCellText(page: Page, row: Locator, columnName: string): Promise<string> {
  const columnIndex = await page.locator('.ag-header-cell .ag-header-cell-text').evaluateAll(
    (headers, expected) =>
      headers.findIndex((header) => (header.textContent ?? '').trim().toLowerCase() === expected.toLowerCase()),
    columnName,
  );
  if (columnIndex < 0) {
    throw new Error(`Data Grid column ${columnName} was not found`);
  }

  const cell = row.locator('.ag-cell').nth(columnIndex);
  await expect(cell, `cell ${columnName} should be visible`).toBeVisible({ timeout: 15_000 });
  return normalizedText(cell);
}

async function normalizedText(locator: Locator): Promise<string> {
  return (await locator.innerText()).replace(/\s+/g, ' ').trim();
}
