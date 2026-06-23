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
 * Regression test for https://github.com/convertigo/C8oForms/issues/1416
 * Context from #1414: Baserow Date columns configured with EU/US/ISO formats
 * were rendered in the Data Grid with the old default yyyy/mm/dd shape.
 *
 * Also covers #1424 (datetime timezone shift): datetime fields without a forced
 * timezone must keep their Baserow UTC value instead of being shifted by one
 * hour (see the DateTime EU 24h / US 12h columns and the anti-shift assertions).
 *
 * Reproduced in 2.2.0-beta223, fixed in the 2.2.0-beta232 line.
 * Root cause/observable mechanism: the grid must consume the Baserow formatted
 * display value for Date fields, preserving field-level date and time format
 * options instead of rendering every Date field through the default format.
 *
 * The C8oForms form is built only through the Studio UI. The external Baserow
 * table is an idempotent MCP fixture: the test creates missing fields and
 * upserts the controlled row before selecting that table through the UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1416 Date Formats v2';
const ROW_LABEL = 'row_1416';
const GRID_TECHNICAL_ID = 'baserow_date_formats_grid_1416';

const DATE_COLUMNS = [
  {
    name: 'Date EU',
    type: 'date',
    baserowOptions: { date_format: 'EU', date_include_time: false },
    expectedText: '31/12/2026',
  },
  {
    name: 'Date US',
    type: 'date',
    baserowOptions: { date_format: 'US', date_include_time: false },
    expectedText: '12/31/2026',
  },
  {
    name: 'Date ISO',
    type: 'date',
    baserowOptions: { date_format: 'ISO', date_include_time: false },
    expectedText: '2026-12-31',
  },
  {
    name: 'DateTime EU 24h',
    type: 'date',
    baserowOptions: { date_format: 'EU', date_include_time: true, date_time_format: '24', date_show_tzinfo: false },
    expectedPattern: /31\/12\/2026\s+12:45/,
  },
  {
    name: 'DateTime US 12h',
    type: 'date',
    baserowOptions: { date_format: 'US', date_include_time: true, date_time_format: '12', date_show_tzinfo: false },
    expectedPattern: /12\/31\/2026\s+12:45\s*PM/i,
  },
] as const;

const EXPECTED_COLUMNS = DATE_COLUMNS.map((column) => column.name);

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(180_000);

test('#1416 - Baserow date formats and times are preserved in the data grid', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      ...DATE_COLUMNS.map(({ name, type, baserowOptions }) => ({ name, type, baserowOptions })),
    ],
    rows: [
      {
        Name: ROW_LABEL,
        'Date EU': '2026-12-31',
        'Date US': '2026-12-31',
        'Date ISO': '2026-12-31',
        'DateTime EU 24h': '2026-12-31T12:45:00Z',
        'DateTime US 12h': '2026-12-31T12:45:00Z',
      },
    ],
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1416 date formats ${Date.now()}`);

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
    expectedColumns: EXPECTED_COLUMNS,
  });
  await closeComponentConfig(page);

  await openPreview(page, SEL.gridComponent);
  const row = await visibleGridRow(page, ROW_LABEL);
  const rowText = await normalizedRowText(row);

  for (const column of DATE_COLUMNS) {
    if ('expectedText' in column) {
      expect(rowText, `${column.name} should use its Baserow date format`).toContain(column.expectedText);
    } else {
      expect(rowText, `${column.name} should preserve the Baserow formatted time`).toMatch(column.expectedPattern);
    }
  }

  expect(rowText, 'the old default yyyy/mm/dd date format must not be used').not.toContain('2026/12/31');
  expect(rowText, 'the datetime values must not be shifted back by one hour').not.toMatch(/\b11:45\b/);
  expect(rowText, 'the datetime values must not be shifted forward by one hour').not.toMatch(/\b13:45\b/);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const expected of DATE_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === expected.name);
    expect(column, `Baserow column ${expected.name} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${expected.name} should be a Date field`).toBe('date');
    for (const [key, value] of Object.entries(expected.baserowOptions)) {
      expect(column?.[key], `Baserow column ${expected.name} should keep ${key}`).toBe(value);
    }
  }
}

async function visibleGridRow(page: Page, text: string): Promise<Locator> {
  const row = page.locator('.ag-center-cols-container .ag-row').filter({ hasText: text }).first();
  await expect(row, `the Baserow row ${text} should render in the Data Grid`).toBeVisible({ timeout: 45_000 });
  await expect
    .poll(() => normalizedRowText(row), {
      message: `the Baserow row ${text} should expose its visible cell text`,
      timeout: 15_000,
    })
    .toContain(text);
  return row;
}

async function normalizedRowText(row: Locator): Promise<string> {
  return (await row.innerText()).replace(/\s+/g, ' ').trim();
}
