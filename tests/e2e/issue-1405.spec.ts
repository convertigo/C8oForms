import { expect, type Locator, type Page, test } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addVisibilityCondition,
  closeComponentConfig,
  configureGridBaserowSource,
  createBlankForm,
  login,
  openComponentConfig,
  openConfigTabById,
  openPreview,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1405
 * "Grid columns are incorrectly sized when the grid becomes visible after being hidden"
 *
 * Reproduced on 2.2.0-beta212 and confirmed OK in 2.2.0-beta213. The observed
 * mechanism is that AG Grid computed column widths while the C8oForms Data Grid
 * was hidden by a Visibility condition, then kept compressed widths after the
 * condition made the grid visible.
 *
 * The C8oForms form is built only through the Studio UI: create a blank form,
 * add a Text input controller, add/configure a Data Grid from Baserow, and set
 * the grid Visibility condition through the component configuration panel.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1405 Hidden Grid Width';
const CONTROLLER_ID = 'visibility_controller_1405';
const GRID_ID = 'hidden_grid_1405';
const SHOW_VALUE = 'show';
const COLUMNS = ['First column', 'Second column', 'Third column'];

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(180_000);

test.beforeAll(async () => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      ...COLUMNS.map((name) => ({ name, type: 'text' })),
    ],
    rows: [
      {
        Name: 'row_1405_alpha',
        'First column': 'Alpha first',
        'Second column': 'Alpha second',
        'Third column': 'Alpha third',
      },
      {
        Name: 'row_1405_beta',
        'First column': 'Beta first',
        'Second column': 'Beta second',
        'Third column': 'Beta third',
      },
    ],
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);
});

test('#1405 - hidden data grid recomputes column widths when it becomes visible', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1405 hidden grid ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.textInput);
  await expect(page.locator(SEL.textComponent), 'the Text input controller should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfig(page, SEL.textComponent);
  await setTechnicalId(page, CONTROLLER_ID);
  await closeComponentConfig(page);

  await addComponent(page, PALETTE_ICON.grid);
  await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfig(page, SEL.gridComponent);
  await setTechnicalId(page, GRID_ID);
  await configureGridBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: COLUMNS,
  });
  await openConfigTabById(page, 'visibility_tab_selector');
  await addVisibilityCondition(page, {
    field: CONTROLLER_ID,
    operator: 'equals',
    value: SHOW_VALUE,
  });
  await closeComponentConfig(page);

  await openPreview(page, SEL.textComponent);
  await expect(page.locator(SEL.gridComponent), 'the Data Grid should initially be hidden').toBeHidden({
    timeout: 30_000,
  });

  await viewerTextInput(page, CONTROLLER_ID).fill(SHOW_VALUE);
  await page.keyboard.press('Tab');
  const grid = page.locator(SEL.gridComponent).first();
  await expect(grid, 'the Data Grid should become visible after entering the trigger value').toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('.ag-header-cell').nth(2), 'the grid should render at least three visible columns').toBeVisible({
    timeout: 30_000,
  });

  const metrics = await settledGridColumnMetrics(grid);
  expect(metrics.gridWidth, 'the grid container should have a measurable desktop width').toBeGreaterThan(900);
  expect(metrics.summedHeaderWidth, `visible grid columns should be resized after the grid is shown: ${JSON.stringify(metrics)}`).toBeGreaterThan(
    400,
  );
  expect(metrics.usedWidthRatio, `visible grid columns should use the grid width: ${JSON.stringify(metrics)}`).toBeGreaterThan(0.32);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    console.warn(`Baserow MCP read-back did not list ${TABLE}; continuing with UI validation.`);
    return;
  }
  const columns = table?.columns ?? [];
  for (const columnName of ['Name', ...COLUMNS]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
}

function viewerTextInput(page: Page, technicalId: string): Locator {
  return page.locator(`ion-input#${technicalId} input, input#${technicalId}, [id="${technicalId}"] input`).first();
}

async function gridColumnMetrics(grid: Locator): Promise<{
  gridWidth: number;
  headerWidths: number[];
  minHeaderWidth: number;
  summedHeaderWidth: number;
  usedWidthRatio: number;
}> {
  return grid.evaluate((gridElement) => {
    const gridBox = (gridElement as HTMLElement).getBoundingClientRect();
    const headerWidths = [...gridElement.querySelectorAll('.ag-header-cell')]
      .slice(0, 3)
      .map((cell) => Math.round((cell as HTMLElement).getBoundingClientRect().width));
    return {
      gridWidth: Math.round(gridBox.width),
      headerWidths,
      minHeaderWidth: Math.min(...headerWidths),
      summedHeaderWidth: headerWidths.reduce((sum, width) => sum + width, 0),
      usedWidthRatio: Math.round((headerWidths.reduce((sum, width) => sum + width, 0) / gridBox.width) * 1000) / 1000,
    };
  });
}

async function settledGridColumnMetrics(grid: Locator): Promise<Awaited<ReturnType<typeof gridColumnMetrics>>> {
  const startedAt = Date.now();
  const timeoutMs = 3_000;
  const stableMs = 750;
  let stableSince = startedAt;
  let previous = JSON.stringify(await gridColumnMetrics(grid));

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = JSON.stringify(await gridColumnMetrics(grid));
    if (current !== previous) {
      previous = current;
      stableSince = Date.now();
      continue;
    }
    if (Date.now() - stableSince >= stableMs) {
      break;
    }
  }

  return JSON.parse(previous) as Awaited<ReturnType<typeof gridColumnMetrics>>;
}
