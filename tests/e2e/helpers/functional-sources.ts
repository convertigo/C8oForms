import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './baserow';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  checkedSelectBaserowDisplayColumns,
  checkedSelectBaserowValueColumns,
  configureChartBaserowSource,
  configureDataSourceFilterMonacoPaletteValue,
  configureDataSourceFilterTextValue,
  configureDataSourceSort,
  closeComponentConfig,
  configureGridBaserowSource,
  configureMapBaserowSource,
  configureSelectBaserowSource,
  createBlankForm,
  expectChartBaserowSourceRoles,
  expectChartHeightModeSelected,
  expectChartPersonalizedHeightInput,
  expectGridFooterAndPaginationSettings,
  expectGridRowsPerPageValue,
  expectGridRowsPerPageVisible,
  expectMapBaserowSourceRoles,
  expectSelectBaserowColumnsVisible,
  expectDataSourceSortMissingConfigResolved,
  openComponentConfig,
  openComponentsPalette,
  openConfigTabById,
  openDataSourceSortPanel,
  openGridFormattingTab,
  openPreview,
  openSelectBaserowSourceConfiguration,
  openSelectBaserowTablePicker,
  clickSourcePaletteCollapseAll,
  clickSourcePaletteSection,
  login,
  selectChartHeightMode,
  sourcePaletteEntryDragPayload,
  sourcePaletteSectionStates,
  sourceSelectVisibleOptions,
  tinyMceEditorContent,
  selectGridBaserowSourceWithoutTable,
  setGridReturnedValueToRowSelected,
  setGridFooterEnabled,
  setGridPaginationMode,
  setGridRowsPerPage,
  setChartPersonalizedHeight,
  waitForSourcePaletteSections,
  type SourcePaletteSection,
  type LoginCredentials,
} from './studio';

const FUNCTIONAL_SOURCE_WORKSPACE = 'C8oForms E2E';
const FUNCTIONAL_SOURCE_DATABASE = 'Functional Fixtures';
const GRID_SOURCE_TABLE = 'Functional Source Grid';
const GRID_SOURCE_COLUMNS = ['Name', 'Status', 'Marker'];
const GRID_SOURCE_ROWS = [
  { Name: 'functional_source_grid_alpha', Status: 'Active', Marker: 'visible_grid_alpha' },
  { Name: 'functional_source_grid_bravo', Status: 'Pending', Marker: 'visible_grid_bravo' },
];
const GRID_FORMAT_TABLE = 'Functional Grid Typed Formats';
const GRID_FORMAT_ROW_NAME = 'functional_grid_typed_formats';
const GRID_FORMAT_DURATION_COLUMN = 'Duration h:mm:ss';
const GRID_FORMAT_COLUMNS = [
  {
    name: 'Date EU',
    type: 'date',
    baserowOptions: { date_format: 'EU', date_include_time: false },
    expectedText: '31/12/2026',
  },
  {
    name: 'Date ISO',
    type: 'date',
    baserowOptions: { date_format: 'ISO', date_include_time: false },
    expectedText: '2026-12-31',
  },
  {
    name: 'DateTime US 12h',
    type: 'date',
    baserowOptions: { date_format: 'US', date_include_time: true, date_time_format: '12', date_show_tzinfo: false },
    expectedPattern: /12\/31\/2026\s+12:45\s*PM/i,
  },
  {
    name: GRID_FORMAT_DURATION_COLUMN,
    type: 'duration',
    baserowOptions: { duration_format: 'h:mm:ss' },
    expectedText: '1:23:45',
    rawText: '5025',
  },
] as const;
const GRID_FORMAT_EXPECTED_COLUMNS = ['Name', ...GRID_FORMAT_COLUMNS.map((column) => column.name)];
const GRID_INTERACTION_TABLE = 'Functional Grid Interactions';
const GRID_INTERACTION_NAME = 'Name';
const GRID_INTERACTION_STATUS = 'Filter Status';
const GRID_INTERACTION_RANK = 'Sort Rank';
const GRID_INTERACTION_NOTES = 'Nullable Notes';
const GRID_INTERACTION_COLUMNS = [
  GRID_INTERACTION_NAME,
  GRID_INTERACTION_STATUS,
  GRID_INTERACTION_RANK,
  GRID_INTERACTION_NOTES,
];
const GRID_INTERACTION_VISIBLE_STATUS = 'functional_grid_002_visible';
const GRID_INTERACTION_HIDDEN_STATUS = 'functional_grid_002_hidden';
const GRID_INTERACTION_ROWS = [
  {
    [GRID_INTERACTION_NAME]: 'functional_grid_002_hidden_alpha',
    [GRID_INTERACTION_STATUS]: GRID_INTERACTION_HIDDEN_STATUS,
    [GRID_INTERACTION_RANK]: 1,
    [GRID_INTERACTION_NOTES]: 'filtered out',
  },
  {
    [GRID_INTERACTION_NAME]: 'functional_grid_002_visible_bravo',
    [GRID_INTERACTION_STATUS]: GRID_INTERACTION_VISIBLE_STATUS,
    [GRID_INTERACTION_RANK]: 2,
    [GRID_INTERACTION_NOTES]: null,
  },
  {
    [GRID_INTERACTION_NAME]: 'functional_grid_002_visible_charlie',
    [GRID_INTERACTION_STATUS]: GRID_INTERACTION_VISIBLE_STATUS,
    [GRID_INTERACTION_RANK]: 1,
    [GRID_INTERACTION_NOTES]: 'first after sort',
  },
];
const GRID_INTERACTION_EXPECTED_ORDER = ['functional_grid_002_visible_charlie', 'functional_grid_002_visible_bravo'];
const CHART_SOURCE_TABLE = 'Functional Source Chart';
const CHART_SOURCE_IGNORED_CATEGORY = 'Ignored Category';
const CHART_SOURCE_CATEGORY = 'Category Label';
const CHART_SOURCE_IGNORED_VALUE = 'Ignored Value';
const CHART_SOURCE_VALUE = 'Metric Value';
const CHART_SOURCE_COLUMNS = [
  CHART_SOURCE_IGNORED_CATEGORY,
  CHART_SOURCE_CATEGORY,
  CHART_SOURCE_IGNORED_VALUE,
  CHART_SOURCE_VALUE,
];
const CHART_TYPE_TOGGLE = '.class1776605300004';
const CHART_SOURCE_ROWS = [
  {
    [CHART_SOURCE_IGNORED_CATEGORY]: 'Ignored Chart Alpha',
    [CHART_SOURCE_CATEGORY]: 'Functional Chart Alpha',
    [CHART_SOURCE_IGNORED_VALUE]: 900,
    [CHART_SOURCE_VALUE]: 12,
  },
  {
    [CHART_SOURCE_IGNORED_CATEGORY]: 'Ignored Chart Bravo',
    [CHART_SOURCE_CATEGORY]: 'Functional Chart Bravo',
    [CHART_SOURCE_IGNORED_VALUE]: 800,
    [CHART_SOURCE_VALUE]: 34,
  },
];
const MAP_SOURCE_TABLE = 'Functional Source Map';
const MAP_SOURCE_IGNORED_TITLE = 'Ignored Title';
const MAP_SOURCE_IGNORED_LATITUDE = 'Ignored Latitude';
const MAP_SOURCE_IGNORED_LONGITUDE = 'Ignored Longitude';
const MAP_SOURCE_TITLE = 'Marker Title';
const MAP_SOURCE_LATITUDE = 'Marker Latitude';
const MAP_SOURCE_LONGITUDE = 'Marker Longitude';
const MAP_SOURCE_COLUMNS = [
  MAP_SOURCE_IGNORED_TITLE,
  MAP_SOURCE_IGNORED_LATITUDE,
  MAP_SOURCE_IGNORED_LONGITUDE,
  MAP_SOURCE_TITLE,
  MAP_SOURCE_LATITUDE,
  MAP_SOURCE_LONGITUDE,
];
const MAP_SOURCE_ROWS = [
  {
    [MAP_SOURCE_IGNORED_TITLE]: 'Ignored Map Paris',
    [MAP_SOURCE_IGNORED_LATITUDE]: 0,
    [MAP_SOURCE_IGNORED_LONGITUDE]: 0,
    [MAP_SOURCE_TITLE]: 'Functional Map Paris',
    [MAP_SOURCE_LATITUDE]: 48,
    [MAP_SOURCE_LONGITUDE]: 2,
  },
  {
    [MAP_SOURCE_IGNORED_TITLE]: 'Ignored Map Lyon',
    [MAP_SOURCE_IGNORED_LATITUDE]: 1,
    [MAP_SOURCE_IGNORED_LONGITUDE]: 1,
    [MAP_SOURCE_TITLE]: 'Functional Map Lyon',
    [MAP_SOURCE_LATITUDE]: 45,
    [MAP_SOURCE_LONGITUDE]: 4,
  },
];
const SELECT_SOURCE_TABLE = 'Functional Source Select';
const SELECT_SOURCE_DISPLAY_COLUMN = 'Display Label';
const SELECT_SOURCE_VALUE_COLUMN = 'Stored Value';
const SELECT_SOURCE_EXTRA_COLUMN = 'Category';
const SELECT_SOURCE_COLUMNS = ['Name', SELECT_SOURCE_DISPLAY_COLUMN, SELECT_SOURCE_VALUE_COLUMN, SELECT_SOURCE_EXTRA_COLUMN];
const SELECT_SOURCE_ROWS = [
  {
    Name: 'functional_source_select_alpha',
    [SELECT_SOURCE_DISPLAY_COLUMN]: 'Functional Source Alpha',
    [SELECT_SOURCE_VALUE_COLUMN]: 'source-alpha',
    [SELECT_SOURCE_EXTRA_COLUMN]: 'Group A',
  },
  {
    Name: 'functional_source_select_bravo',
    [SELECT_SOURCE_DISPLAY_COLUMN]: 'Functional Source Bravo',
    [SELECT_SOURCE_VALUE_COLUMN]: 'source-bravo',
    [SELECT_SOURCE_EXTRA_COLUMN]: 'Group B',
  },
  {
    Name: 'functional_source_select_charlie',
    [SELECT_SOURCE_DISPLAY_COLUMN]: 'Functional Source Charlie',
    [SELECT_SOURCE_VALUE_COLUMN]: 'source-charlie',
    [SELECT_SOURCE_EXTRA_COLUMN]: 'Group C',
  },
];
const FILTER_SOURCE_TABLE = 'Functional Source Filter';
const FILTER_SOURCE_NAME = 'Name';
const FILTER_SOURCE_FLAG = 'FilterFlag';
const FILTER_SOURCE_ACTIVE_VALUE = 'enabled';
const FILTER_SOURCE_INACTIVE_VALUE = 'disabled';
const FILTER_SOURCE_ACTIVE_NAMES = ['Functional Filter Alpha', 'Functional Filter Charlie'];
const FILTER_SOURCE_INACTIVE_NAMES = ['Functional Filter Bravo'];
const FILTER_SOURCE_COLUMNS = [FILTER_SOURCE_NAME, FILTER_SOURCE_FLAG];
const FILTER_SOURCE_ROWS = [
  { [FILTER_SOURCE_NAME]: FILTER_SOURCE_ACTIVE_NAMES[0], [FILTER_SOURCE_FLAG]: FILTER_SOURCE_ACTIVE_VALUE },
  { [FILTER_SOURCE_NAME]: FILTER_SOURCE_INACTIVE_NAMES[0], [FILTER_SOURCE_FLAG]: FILTER_SOURCE_INACTIVE_VALUE },
  { [FILTER_SOURCE_NAME]: FILTER_SOURCE_ACTIVE_NAMES[1], [FILTER_SOURCE_FLAG]: FILTER_SOURCE_ACTIVE_VALUE },
];
const FILTER_SOURCE_JS_EXPECTED_CODE = 'api.translate.getBrowserLang()';
const SORT_SOURCE_TABLE = 'Functional Source Sort';
const SORT_SOURCE_NAME = 'Name';
const SORT_SOURCE_RANK = 'SortRank';
const SORT_SOURCE_COLUMNS = [SORT_SOURCE_NAME, SORT_SOURCE_RANK];
const SORT_SOURCE_ROWS = [
  { [SORT_SOURCE_NAME]: 'Functional Sort Low', [SORT_SOURCE_RANK]: 10 },
  { [SORT_SOURCE_NAME]: 'Functional Sort High', [SORT_SOURCE_RANK]: 30 },
  { [SORT_SOURCE_NAME]: 'Functional Sort Middle', [SORT_SOURCE_RANK]: 20 },
];
const SORT_SOURCE_EXPECTED_DESC_ORDER = ['Functional Sort High', 'Functional Sort Middle', 'Functional Sort Low'];
const SOURCE_ISOLATION_PRIMARY_COLUMNS = ['Primary Name', 'Primary Marker'];
const SOURCE_ISOLATION_SECONDARY_COLUMNS = ['Secondary Name', 'Secondary Marker'];
const SELECT_SOURCE_COLUMN_ROW = 'ion-item.class1776161384798';
const SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX = 'ion-checkbox.class1776352302823';
const SELECT_SOURCE_VALUE_COLUMN_CHECKBOX = 'ion-checkbox.class1776352314668';
const SELECT_SOURCE_SUMMARY = '.class1776013865512';
const SOURCE_PICKER_CONFIRM_BUTTON = 'ion-button.class1599830132445';
const TABLE_PICKER_SAVE_BUTTON = 'ion-button.class1776244653366';
const GRID_COLUMN_DISPLAYED_LABEL_RE = /Displayed|Affich|Mostrado|Visualizzati/i;
const GRID_COLUMN_HIDDEN_LABEL_RE = /Hidden|Masqu|Oculto|Nascosti/i;

export async function openSourceSelectionPanelFromSelectThroughUi(page: Page): Promise<void> {
  await test.step('Create a Select component and open Source selection', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'Select component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await openConfigTabById(page, 'tab_selector_choice_source');
    await activateDataSourceMode(page);

    const openPicker = async (): Promise<Locator> => {
      const sourceButton = page.locator(`${SEL.dataSourceSelectButton}:visible`).first();
      await expect(sourceButton, 'source selection button should be visible').toBeVisible({ timeout: 15_000 });
      await sourceButton.click({ timeout: 10_000 }).catch(async () => sourceButton.dispatchEvent('click'));

      const modal = page.locator('ion-modal:not(.overlay-hidden):visible').last();
      await expect(modal, 'source selection modal should open').toBeVisible({ timeout: 30_000 });
      return modal;
    };

    let picker = await openPicker();
    let selectableSource = picker.locator(`${SEL.dataSourceSelectButton}:visible`).first();
    const sourceTreeReady = await selectableSource
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (!sourceTreeReady) {
      // The Ionic shell can occasionally be presented before its source tree
      // is initialized. Reopening the UI restarts that initialization without
      // carrying the empty modal state into the rest of the test.
      await closeSourceSelectionModal(picker);
      picker = await openPicker();
      selectableSource = picker.locator(`${SEL.dataSourceSelectButton}:visible`).first();
    }
    await expect(selectableSource, 'source selection modal should expose at least one selectable source').toBeVisible({
      timeout: 30_000,
    });

    await closeSourceSelectionModal(picker);
  });
}

export async function configureGridBaserowTableAndAssertViewerRowsThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Grid Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_SOURCE_TABLE,
      primaryField: 'Name',
      columns: GRID_SOURCE_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: GRID_SOURCE_ROWS,
      upsertKey: 'Name',
    });
    assertGridSourceFixture(catalog);
  });

  await test.step('Create a Data Grid and configure its Baserow table source', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'Data Grid component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_SOURCE_TABLE,
      expectedColumns: GRID_SOURCE_COLUMNS,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Grid columns and Baserow rows', async () => {
    await openPreview(page, SEL.gridComponent);
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'viewer Data Grid should be visible').toBeVisible({
      timeout: 45_000,
    });

    for (const column of GRID_SOURCE_COLUMNS) {
      await expectGridHeaderVisible(page, column);
    }

    for (const row of GRID_SOURCE_ROWS) {
      const gridRow = await visibleGridRow(page, row.Name);
      const text = await normalizedText(gridRow);
      expect(text, `Grid row ${row.Name} should contain its Status`).toContain(row.Status);
      expect(text, `Grid row ${row.Name} should contain its Marker`).toContain(row.Marker);
    }
  });
}

export async function exerciseGridSourceFooterAndPaginationThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Grid Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_SOURCE_TABLE,
      primaryField: 'Name',
      columns: GRID_SOURCE_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: GRID_SOURCE_ROWS,
      upsertKey: 'Name',
    });
    assertGridSourceFixture(catalog);
  });

  await test.step('Create a Data Grid and configure its Baserow source', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'Data Grid component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_SOURCE_TABLE,
      expectedColumns: GRID_SOURCE_COLUMNS,
    });
  });

  await test.step('Configure Data Grid footer and pagination settings', async () => {
    await openGridFormattingTab(page);
    await expectGridFooterAndPaginationSettings(page);
    await setGridFooterEnabled(page, false);
    await setGridPaginationMode(page, 'all_rows');
    await expectGridRowsPerPageVisible(page, false);
    await setGridFooterEnabled(page, true);
    await setGridPaginationMode(page, 'paginated');
    await expectGridRowsPerPageVisible(page, true);
    await setGridRowsPerPage(page, '1');
  });

  await test.step('Reopen Data Grid configuration and verify pagination settings persist', async () => {
    await closeComponentConfig(page);
    await openComponentConfig(page, SEL.gridComponent);
    await openGridFormattingTab(page);
    await expectGridFooterAndPaginationSettings(page);
    await expectGridRowsPerPageValue(page, '1');
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Grid headers, Baserow rows, and pagination footer render', async () => {
    await openPreview(page, SEL.gridComponent);
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'viewer Data Grid should be visible').toBeVisible({
      timeout: 45_000,
    });

    for (const column of GRID_SOURCE_COLUMNS) {
      await expectGridHeaderVisible(page, column);
    }

    const firstRow = await visibleGridRowAcrossPages(page, GRID_SOURCE_ROWS[0].Name);
    const firstRowText = await normalizedText(firstRow);
    expect(firstRowText, `Grid row ${GRID_SOURCE_ROWS[0].Name} should contain its Status`).toContain(GRID_SOURCE_ROWS[0].Status);
    expect(firstRowText, `Grid row ${GRID_SOURCE_ROWS[0].Name} should contain its Marker`).toContain(GRID_SOURCE_ROWS[0].Marker);

    await expect(
      page.locator(`${SEL.gridComponent}:visible .ag-paging-panel, ${SEL.gridComponent}:visible .ag-paging-row-summary-panel`).first(),
      'viewer Data Grid should render the pagination footer',
    ).toBeVisible({ timeout: 30_000 });
  });
}

export async function exerciseGridFilterSortSelectionAndReloadThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Grid interactions Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_INTERACTION_TABLE,
      primaryField: GRID_INTERACTION_NAME,
      columns: [
        { name: GRID_INTERACTION_NAME, type: 'text' },
        { name: GRID_INTERACTION_STATUS, type: 'text' },
        { name: GRID_INTERACTION_RANK, type: 'number' },
        { name: GRID_INTERACTION_NOTES, type: 'text' },
      ],
      rows: GRID_INTERACTION_ROWS,
      upsertKey: GRID_INTERACTION_NAME,
    });
    assertGridInteractionFixture(catalog);
  });

  await test.step('Create a Data Grid with Baserow filter, sort, and row selection', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'Data Grid component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_INTERACTION_TABLE,
      expectedColumns: GRID_INTERACTION_COLUMNS,
    });
    await setGridSourceColumnHiddenThroughUi(page, GRID_INTERACTION_NOTES, true);
    await expectGridSourceColumnHiddenPersistsThroughUi(page, GRID_INTERACTION_NOTES, true);
    await configureDataSourceFilterTextValue(page, {
      column: GRID_INTERACTION_STATUS,
      operator: 'equal',
      value: GRID_INTERACTION_VISIBLE_STATUS,
    });
    await configureDataSourceSort(page, { column: GRID_INTERACTION_RANK, order: 'asc' });
    await setGridReturnedValueToRowSelected(page);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify filtered sorted Grid rows', async () => {
    await openPreview(page, SEL.gridComponent);
    await expectGridVisibleRowsInOrder(page, GRID_INTERACTION_EXPECTED_ORDER);
    await expectGridHeaderHidden(page, GRID_INTERACTION_NOTES);
    await expectVisibleGridTextToExclude(page, 'first after sort');
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'viewer Data Grid should remain visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator(`${SEL.gridComponent}:visible .ag-center-cols-container .ag-row`).filter({
        hasText: 'functional_grid_002_hidden_alpha',
      }),
      'filtered-out Grid row should not be visible',
    ).toHaveCount(0, { timeout: 10_000 });
  });

  await test.step('Select a Grid row and verify selected state', async () => {
    const row = await visibleScopedGridRow(page, GRID_INTERACTION_EXPECTED_ORDER[0]);
    await row.click({ timeout: 10_000 }).catch(async () => row.dispatchEvent('click'));
    await expect
      .poll(() => gridRowSelected(row), {
        message: 'clicked Grid row should become selected',
        timeout: 10_000,
      })
      .toBe(true);
  });

  await test.step('Reload viewer and verify Grid filter and sort still apply', async () => {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'viewer Data Grid should reappear after reload').toBeVisible({
      timeout: 45_000,
    });
    await page.waitForTimeout(2_000);
    await expectGridVisibleRowsInOrder(page, GRID_INTERACTION_EXPECTED_ORDER);
    await expectGridHeaderHidden(page, GRID_INTERACTION_NOTES);
    await expectVisibleGridTextToExclude(page, 'first after sort');
    await expect(
      page.locator(`${SEL.gridComponent}:visible .ag-center-cols-container .ag-row`).filter({
        hasText: 'functional_grid_002_hidden_alpha',
      }),
      'filtered-out Grid row should remain hidden after reload',
    ).toHaveCount(0, { timeout: 10_000 });
  });
}

export async function exerciseGridTypedBaserowFormattingThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Grid typed-format Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_FORMAT_TABLE,
      primaryField: 'Name',
      columns: [
        { name: 'Name', type: 'text' },
        ...GRID_FORMAT_COLUMNS.map(({ name, type, baserowOptions }) => ({ name, type, baserowOptions })),
      ],
      rows: [
        {
          Name: GRID_FORMAT_ROW_NAME,
          'Date EU': '2026-12-31',
          'Date ISO': '2026-12-31',
          'DateTime US 12h': '2026-12-31T12:45:00Z',
          [GRID_FORMAT_DURATION_COLUMN]: 5025,
        },
      ],
      upsertKey: 'Name',
    });
    assertGridFormatFixture(catalog);
  });

  await test.step('Create a Data Grid and configure its typed Baserow source', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'typed-format Data Grid component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_FORMAT_TABLE,
      expectedColumns: GRID_FORMAT_EXPECTED_COLUMNS,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify typed Baserow values keep their formatted display values', async () => {
    await openPreview(page, SEL.gridComponent);
    const row = await visibleGridRow(page, GRID_FORMAT_ROW_NAME);
    const rowText = await normalizedText(row);

    for (const column of GRID_FORMAT_COLUMNS) {
      if ('expectedText' in column) {
        expect(rowText, `${column.name} should use its Baserow formatted display value`).toContain(column.expectedText);
      } else {
        expect(rowText, `${column.name} should preserve the Baserow formatted display value`).toMatch(column.expectedPattern);
      }
    }

    const durationText = await visibleGridCellText(page, row, GRID_FORMAT_DURATION_COLUMN);
    expect(durationText, `${GRID_FORMAT_DURATION_COLUMN} should render the formatted duration`).toBe('1:23:45');
    expect(durationText, `${GRID_FORMAT_DURATION_COLUMN} should not render raw duration seconds`).not.toBe('5025');
    expect(rowText, 'Date values should not fall back to the old yyyy/mm/dd format').not.toContain('2026/12/31');
    expect(rowText, 'DateTime value should not be shifted back by one hour').not.toMatch(/\b11:45\b/);
    expect(rowText, 'DateTime value should not be shifted forward by one hour').not.toMatch(/\b13:45\b/);
  });
}

export async function configureChartBaserowTableAndAssertPersistenceThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Chart Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: CHART_SOURCE_TABLE,
      primaryField: CHART_SOURCE_IGNORED_CATEGORY,
      columns: [
        { name: CHART_SOURCE_IGNORED_CATEGORY, type: 'text' },
        { name: CHART_SOURCE_CATEGORY, type: 'text' },
        { name: CHART_SOURCE_IGNORED_VALUE, type: 'number' },
        { name: CHART_SOURCE_VALUE, type: 'number' },
      ],
      rows: CHART_SOURCE_ROWS,
      upsertKey: CHART_SOURCE_IGNORED_CATEGORY,
    });
    assertChartSourceFixture(catalog);
  });

  await test.step('Create a Chart and configure its Baserow category/value columns', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.chart);
    await addComponent(page, PALETTE_ICON.chart, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.chartComponent}:visible`).first(), 'Chart component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.chartComponent);
    await configureChartBaserowSource(page, chartSourceConfig());
  });

  await test.step('Reopen Chart source configuration and verify persisted roles', async () => {
    await expectChartBaserowSourceRoles(page, chartSourceConfig());
    await closeComponentConfig(page);
  });
}

export async function exerciseChartSourceTypeAndHeightThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Chart Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: CHART_SOURCE_TABLE,
      primaryField: CHART_SOURCE_IGNORED_CATEGORY,
      columns: [
        { name: CHART_SOURCE_IGNORED_CATEGORY, type: 'text' },
        { name: CHART_SOURCE_CATEGORY, type: 'text' },
        { name: CHART_SOURCE_IGNORED_VALUE, type: 'number' },
        { name: CHART_SOURCE_VALUE, type: 'number' },
      ],
      rows: CHART_SOURCE_ROWS,
      upsertKey: CHART_SOURCE_IGNORED_CATEGORY,
    });
    assertChartSourceFixture(catalog);
  });

  await test.step('Create a Chart and configure its Baserow source roles', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.chart);
    await addComponent(page, PALETTE_ICON.chart, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.chartComponent}:visible`).first(), 'Chart component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.chartComponent);
    await configureChartBaserowSource(page, chartSourceConfig());
  });

  await test.step('Configure Chart type and personalized height', async () => {
    await openConfigTabById(page, 'data_interactions');
    await expectChartTypeOptions(page);
    await selectChartType(page, 'line');
    await selectChartType(page, 'donut');

    await expectChartHeightModeSelected(page, 'auto');
    await expectChartPersonalizedHeightInput(page, false);
    await selectChartHeightMode(page, 'personalized');
    await expectChartPersonalizedHeightInput(page, true);
    await setChartPersonalizedHeight(page, '360');
  });

  await test.step('Reopen Chart configuration and verify source roles, type, and height persist', async () => {
    await closeComponentConfig(page);
    await openComponentConfig(page, SEL.chartComponent);
    await expectChartBaserowSourceRoles(page, chartSourceConfig());
    await openConfigTabById(page, 'data_interactions');
    await expectChartTypeSelected(page, 'donut');
    await expectChartHeightModeSelected(page, 'personalized');
    await expectChartPersonalizedHeightInput(page, true);
    await expect(page.locator(`${SEL.chartPersonalizedHeightInput}:visible`).first(), 'Chart personalized height should persist').toHaveValue(
      '360',
      { timeout: 10_000 },
    );
    await selectChartHeightMode(page, 'auto');
    await expectChartPersonalizedHeightInput(page, false);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the configured Chart renders', async () => {
    await openPreview(page, SEL.chartComponent);
    const renderedChart = page
      .locator(`${SEL.chartComponent}:visible .apexcharts-canvas, ${SEL.chartComponent}:visible apx-chart, ${SEL.chartComponent}:visible svg`)
      .first();
    await expect(renderedChart, 'viewer Chart should render a chart surface').toBeVisible({ timeout: 45_000 });
  });
}

export async function configureMapBaserowTableAndAssertPersistenceThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Map Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: MAP_SOURCE_TABLE,
      primaryField: MAP_SOURCE_IGNORED_TITLE,
      columns: [
        { name: MAP_SOURCE_IGNORED_TITLE, type: 'text' },
        { name: MAP_SOURCE_IGNORED_LATITUDE, type: 'number' },
        { name: MAP_SOURCE_IGNORED_LONGITUDE, type: 'number' },
        { name: MAP_SOURCE_TITLE, type: 'text' },
        { name: MAP_SOURCE_LATITUDE, type: 'number' },
        { name: MAP_SOURCE_LONGITUDE, type: 'number' },
      ],
      rows: MAP_SOURCE_ROWS,
      upsertKey: MAP_SOURCE_IGNORED_TITLE,
    });
    assertMapSourceFixture(catalog);
  });

  await test.step('Create a Map and configure its Baserow title/latitude/longitude columns', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.map);
    await addComponent(page, PALETTE_ICON.map, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.mapComponent}:visible`).first(), 'Map component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.mapComponent);
    await configureMapBaserowSource(page, mapSourceConfig());
  });

  await test.step('Reopen Map source configuration and verify persisted roles', async () => {
    await expectMapBaserowSourceRoles(page, mapSourceConfig());
    await closeComponentConfig(page);
  });
}

export async function exerciseMapBaserowMarkersThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Map Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: MAP_SOURCE_TABLE,
      primaryField: MAP_SOURCE_IGNORED_TITLE,
      columns: [
        { name: MAP_SOURCE_IGNORED_TITLE, type: 'text' },
        { name: MAP_SOURCE_IGNORED_LATITUDE, type: 'number' },
        { name: MAP_SOURCE_IGNORED_LONGITUDE, type: 'number' },
        { name: MAP_SOURCE_TITLE, type: 'text' },
        { name: MAP_SOURCE_LATITUDE, type: 'number' },
        { name: MAP_SOURCE_LONGITUDE, type: 'number' },
      ],
      rows: MAP_SOURCE_ROWS,
      upsertKey: MAP_SOURCE_IGNORED_TITLE,
    });
    assertMapSourceFixture(catalog);
  });

  await test.step('Create a Map and configure its Baserow marker roles', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.map);
    await addComponent(page, PALETTE_ICON.map, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.mapComponent}:visible`).first(), 'Map component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.mapComponent);
    await configureMapBaserowSource(page, mapSourceConfig());
  });

  await test.step('Reopen Map source configuration and verify marker roles persist', async () => {
    await expectMapBaserowSourceRoles(page, mapSourceConfig());
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Baserow markers are visible', async () => {
    await openPreview(page, SEL.mapViewer);
    const markerLocator = page.locator(`${SEL.mapViewer}:visible .leaflet-marker-icon`);
    await expect
      .poll(() => markerLocator.count(), {
        message: 'viewer Map should render Baserow Leaflet markers',
        timeout: 45_000,
      })
      .toBeGreaterThanOrEqual(MAP_SOURCE_ROWS.length);

    const markerTitles = await visibleLeafletMarkerTitles(page);
    for (const row of MAP_SOURCE_ROWS) {
      expect(markerTitles, `Map marker title ${row[MAP_SOURCE_TITLE]} should be rendered`).toContain(row[MAP_SOURCE_TITLE]);
    }
  });
}

export async function configureSelectBaserowTableAndAssertPersistenceThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional Select Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: SELECT_SOURCE_TABLE,
      primaryField: 'Name',
      columns: SELECT_SOURCE_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: SELECT_SOURCE_ROWS,
      upsertKey: 'Name',
    });
    assertSelectSourceFixture(catalog);
  });

  await test.step('Create a Select and configure its Baserow display/value columns', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'Select component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await configureFunctionalSelectBaserowSource(page);
  });

  await test.step('Reopen Select source configuration and verify persisted columns', async () => {
    await openSelectBaserowSourceConfiguration(page);
    const tablePicker = await openSelectBaserowTablePicker(page);
    await expectSelectBaserowColumnsVisible(tablePicker, SELECT_SOURCE_COLUMNS);
    await expect
      .poll(() => checkedSelectBaserowDisplayColumns(tablePicker, SELECT_SOURCE_COLUMNS), {
        message: 'Select source Display column should persist after reopen',
        timeout: 10_000,
      })
      .toEqual([SELECT_SOURCE_DISPLAY_COLUMN]);
    await expect
      .poll(() => checkedSelectBaserowValueColumns(tablePicker, SELECT_SOURCE_COLUMNS), {
        message: 'Select source Value column should persist after reopen',
        timeout: 10_000,
      })
      .toEqual([SELECT_SOURCE_VALUE_COLUMN]);
    await closeSourceSelectionModal(tablePicker);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Select options use the display column', async () => {
    await openPreview(page, SEL.selectComponent);
    const labels = SELECT_SOURCE_ROWS.map((row) => row[SELECT_SOURCE_DISPLAY_COLUMN]);
    const visibleOptions = await sourceSelectVisibleOptions(page, labels);
    expect(visibleOptions, 'viewer Select should expose Baserow display labels').toEqual(labels);
  });
}

export async function filterSelectBaserowSourceByHiddenTextColumnThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional source Filter Baserow table exists', async () => {
    await ensureFunctionalFilterSourceTable();
  });

  await test.step('Create a Select source and filter it by a hidden text column', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'filtered Select component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await configureSelectBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: FILTER_SOURCE_TABLE,
      expectedColumns: FILTER_SOURCE_COLUMNS,
      displayColumn: FILTER_SOURCE_NAME,
      valueColumn: FILTER_SOURCE_NAME,
    });
    await configureDataSourceFilterTextValue(page, {
      column: FILTER_SOURCE_FLAG,
      operator: 'equal',
      value: FILTER_SOURCE_ACTIVE_VALUE,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the source filter keeps only matching rows', async () => {
    await openPreview(page, SEL.selectComponent);
    const visibleOptions = await sourceSelectVisibleOptions(page, FILTER_SOURCE_ACTIVE_NAMES, FILTER_SOURCE_INACTIVE_NAMES);
    expect(visibleOptions, 'filtered Select should expose only active source rows').toEqual(FILTER_SOURCE_ACTIVE_NAMES);
  });
}

export async function configureSelectSourceFilterJavaScriptPaletteValueThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional source Filter Baserow table exists', async () => {
    await ensureFunctionalFilterSourceTable();
  });

  await test.step('Create a Select source and configure a JavaScript filter value from the Source Palette', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'JavaScript-filtered Select component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await configureSelectBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: FILTER_SOURCE_TABLE,
      expectedColumns: FILTER_SOURCE_COLUMNS,
      displayColumn: FILTER_SOURCE_NAME,
      valueColumn: FILTER_SOURCE_NAME,
    });
    const payload = await configureDataSourceFilterMonacoPaletteValue(page, {
      column: FILTER_SOURCE_FLAG,
      operator: 'equal',
      sourceSection: 'translation',
      sourceLabel: 'getBrowserLang',
      expectedCode: FILTER_SOURCE_JS_EXPECTED_CODE,
    });

    expect(payload.plainData, 'Source Palette drag should carry the JavaScript filter code').toBe(FILTER_SOURCE_JS_EXPECTED_CODE);
    expect(payload.internalData, 'Source Palette drag should carry the C8oForms internal source marker').not.toBe('');
    await closeComponentConfig(page);
  });
}

export async function sortSelectBaserowSourceByHiddenColumnThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional source Sort Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: SORT_SOURCE_TABLE,
      primaryField: SORT_SOURCE_NAME,
      columns: [
        { name: SORT_SOURCE_NAME, type: 'text' },
        { name: SORT_SOURCE_RANK, type: 'number' },
      ],
      rows: SORT_SOURCE_ROWS,
      upsertKey: SORT_SOURCE_NAME,
    });
    assertSortSourceFixture(catalog);
  });

  await test.step('Create a Select source and sort it by a hidden numeric column', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'sorted Select component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await configureSelectBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: SORT_SOURCE_TABLE,
      expectedColumns: SORT_SOURCE_COLUMNS,
      displayColumn: SORT_SOURCE_NAME,
      valueColumn: SORT_SOURCE_NAME,
    });
    await configureDataSourceSort(page, { column: SORT_SOURCE_RANK, order: 'desc' });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the source sort order', async () => {
    await openPreview(page, SEL.selectComponent);
    const visibleOptions = await sourceSelectVisibleOptions(page, SORT_SOURCE_EXPECTED_DESC_ORDER);
    expect(visibleOptions, 'sorted Select should follow hidden SortRank descending').toEqual(SORT_SOURCE_EXPECTED_DESC_ORDER);
  });
}

export async function assertBaserowSourcePickerIsolationThroughUi(
  page: Page,
  browser: Browser,
  secondaryUser: LoginCredentials,
  secondaryMcpToken: string,
): Promise<void> {
  const suffix = Date.now();
  const primaryWorkspace = `Functional Isolation Primary ${suffix}`;
  const primaryDatabase = `Primary Database ${suffix}`;
  const primaryTable = `Primary Table ${suffix}`;
  const secondaryWorkspace = `Functional Isolation Secondary ${suffix}`;
  const secondaryDatabase = `Secondary Database ${suffix}`;
  const secondaryTable = `Secondary Table ${suffix}`;

  await test.step('Create isolated Baserow fixtures with primary and secondary tokens', async () => {
    await ensureBaserowTable({
      workspace: primaryWorkspace,
      database: primaryDatabase,
      table: primaryTable,
      primaryField: SOURCE_ISOLATION_PRIMARY_COLUMNS[0],
      columns: SOURCE_ISOLATION_PRIMARY_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: [
        {
          [SOURCE_ISOLATION_PRIMARY_COLUMNS[0]]: `primary-${suffix}`,
          [SOURCE_ISOLATION_PRIMARY_COLUMNS[1]]: 'primary-only',
        },
      ],
      upsertKey: SOURCE_ISOLATION_PRIMARY_COLUMNS[0],
    });

    await ensureBaserowTable(
      {
        workspace: secondaryWorkspace,
        database: secondaryDatabase,
        table: secondaryTable,
        primaryField: SOURCE_ISOLATION_SECONDARY_COLUMNS[0],
        columns: SOURCE_ISOLATION_SECONDARY_COLUMNS.map((name) => ({ name, type: 'text' })),
        rows: [
          {
            [SOURCE_ISOLATION_SECONDARY_COLUMNS[0]]: `secondary-${suffix}`,
            [SOURCE_ISOLATION_SECONDARY_COLUMNS[1]]: 'secondary-only',
          },
        ],
        upsertKey: SOURCE_ISOLATION_SECONDARY_COLUMNS[0],
      },
      secondaryMcpToken,
    );
  });

  await test.step('Assert primary user sees only the primary Baserow workspace in the source picker', async () => {
    await createBlankForm(page, `Functional source isolation primary ${suffix}`);
    const picker = await openGridBaserowWorkspacePicker(page);
    await expectBaserowWorkspaceVisible(picker, primaryWorkspace);
    await expectBaserowWorkspaceHidden(picker, secondaryWorkspace);
    await closeSourceSelectionModal(picker);
  });

  await test.step('Assert secondary user sees only the secondary Baserow workspace in the source picker', async () => {
    const context = await browser.newContext({ baseURL: mobileAppRootUrl(page) });
    try {
      const secondaryPage = await context.newPage();
      await login(secondaryPage, secondaryUser);
      await createBlankForm(secondaryPage, `Functional source isolation secondary ${suffix}`);
      const picker = await openGridBaserowWorkspacePicker(secondaryPage);
      await expectBaserowWorkspaceVisible(picker, secondaryWorkspace);
      await expectBaserowWorkspaceHidden(picker, primaryWorkspace);
      await closeSourceSelectionModal(picker);
    } finally {
      await context.close();
    }
  });
}

async function ensureFunctionalFilterSourceTable(): Promise<void> {
  const catalog = await ensureBaserowTable({
    workspace: FUNCTIONAL_SOURCE_WORKSPACE,
    database: FUNCTIONAL_SOURCE_DATABASE,
    table: FILTER_SOURCE_TABLE,
    primaryField: FILTER_SOURCE_NAME,
    columns: FILTER_SOURCE_COLUMNS.map((name) => ({ name, type: 'text' })),
    rows: FILTER_SOURCE_ROWS,
    upsertKey: FILTER_SOURCE_NAME,
  });
  assertFilterSourceFixture(catalog);
}

export async function exerciseSourcePaletteSectionsCollapseAndDragThroughUi(page: Page): Promise<void> {
  let sections: SourcePaletteSection[] = [];

  await test.step('Create a Description and expose the Source Palette', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.descriptionComponent}:visible`).first(), 'Description component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.descriptionComponent);
    await expectVisibleTinyMceBody(page);
    sections = await waitForSourcePaletteSections(page, 4);
  });

  await test.step('Verify Source Palette sections collapse and manually toggle', async () => {
    await expect
      .poll(() => expandedSourcePaletteSections(page, sections), {
        message: 'Source Palette sections should start expanded',
        timeout: 15_000,
      })
      .toEqual(sections);

    await clickSourcePaletteCollapseAll(page);
    await expect
      .poll(() => expandedSourcePaletteSections(page, sections), {
        message: 'Source Palette collapse-all should close every visible section',
        timeout: 15_000,
      })
      .toEqual([]);

    await clickSourcePaletteSection(page, sections[0]);
    await expect
      .poll(() => expandedSourcePaletteSections(page, sections), {
        message: 'Source Palette manual expansion should work after collapse-all',
        timeout: 15_000,
      })
      .toEqual([sections[0]]);

    await clickSourcePaletteSection(page, sections[0]);
    await expect
      .poll(() => expandedSourcePaletteSections(page, sections), {
        message: 'Source Palette manual collapse should work after collapse-all',
        timeout: 15_000,
      })
      .toEqual([]);
  });

  await test.step('Verify Source Palette entries remain draggable after section changes', async () => {
    const payload = await sourcePaletteEntryDragPayload(page, 'user', 'email');
    expect(payload.types, 'Source Palette drag payload should expose drag data types').not.toEqual([]);
    expect(
      [payload.textData, payload.plainData, payload.htmlData, payload.typeData].filter(Boolean).join(' '),
      'Source Palette user/email drag payload should carry the selected value',
    ).toMatch(/email/i);
  });
}

export async function assertMissingGridSourceTableErrorThroughUi(page: Page): Promise<void> {
  await test.step('Create a Data Grid and select a Baserow source without configuring a table', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'Data Grid component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.gridComponent);
    await selectGridBaserowSourceWithoutTable(page);
  });

  await test.step('Open Sort and verify the missing table error is resolved without loader', async () => {
    await openDataSourceSortPanel(page);
    await expectDataSourceSortMissingConfigResolved(page);
  });
}

async function configureFunctionalSelectBaserowSource(page: Page): Promise<void> {
  await acceptRgpdIfVisible(page);
  const configurationSection = page.locator('.class1775835275863').first();
  if (await configurationSection.isVisible().catch(() => false)) {
    await configurationSection.click();
  }

  await openConfigTabById(page, 'tab_selector_choice_source');
  await activateDataSourceMode(page);
  await selectBaserowSelectDataSourceEntry(page);

  await openConfigTabById(page, 'tab_selector_conf_source');
  await acceptRgpdIfVisible(page);
  const tablePicker = await openSelectBaserowTablePicker(page);
  await selectFunctionalBaserowTable(tablePicker);
  await expectSelectBaserowColumnsVisible(tablePicker, SELECT_SOURCE_COLUMNS);
  await setFunctionalSingleSelectSourceColumn(tablePicker, SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX, SELECT_SOURCE_DISPLAY_COLUMN);
  await setFunctionalSingleSelectSourceColumn(tablePicker, SELECT_SOURCE_VALUE_COLUMN_CHECKBOX, SELECT_SOURCE_VALUE_COLUMN);

  await acceptRgpdIfVisible(page);
  await tablePicker.locator(TABLE_PICKER_SAVE_BUTTON).click({ timeout: 10_000 });
  await expect(tablePicker, 'Select Baserow table picker should close after save').toBeHidden({ timeout: 20_000 });
  await page.waitForTimeout(1_500);

  await expect(page.locator(SELECT_SOURCE_SUMMARY).first(), 'Select source summary should contain the configured table').toContainText(
    SELECT_SOURCE_TABLE,
    { timeout: 15_000 },
  );
}

async function selectBaserowSelectDataSourceEntry(page: Page): Promise<void> {
  const sourceButton = page.locator(`${SEL.dataSourceSelectButton}:visible`).first();
  await expect(sourceButton, 'Baserow source select button should be visible').toBeVisible({ timeout: 30_000 });
  await sourceButton.click({ timeout: 10_000 }).catch(async () => sourceButton.dispatchEvent('click'));

  const picker = page.locator('ion-modal:not(.overlay-hidden):visible').last();
  await expect(picker, 'Baserow source picker modal should open').toBeVisible({ timeout: 30_000 });
  const selectDataSource = picker.locator(`${SEL.dataSourceSelectButton}:visible`).nth(1);
  await expect(selectDataSource, 'Select data source entry should be visible').toBeVisible({ timeout: 30_000 });
  await selectDataSource.click({ timeout: 10_000 }).catch(async () => selectDataSource.dispatchEvent('click'));
  await picker.locator(SOURCE_PICKER_CONFIRM_BUTTON).last().click({ timeout: 10_000 });
  await expect(picker, 'Baserow source picker modal should close').toBeHidden({ timeout: 30_000 });
  await page.waitForTimeout(1_500);
}

async function selectFunctionalBaserowTable(tablePicker: Locator): Promise<void> {
  await expect(tablePicker.getByText(FUNCTIONAL_SOURCE_WORKSPACE, { exact: true }), 'functional Baserow workspace should be visible').toBeVisible({
    timeout: 30_000,
  });
  await tablePicker.getByText(FUNCTIONAL_SOURCE_WORKSPACE, { exact: true }).click();
  await expect(tablePicker.getByText(FUNCTIONAL_SOURCE_DATABASE, { exact: true }), 'functional Baserow database should be visible').toBeVisible({
    timeout: 30_000,
  });
  await tablePicker.getByText(FUNCTIONAL_SOURCE_DATABASE, { exact: true }).click();
  await expect(tablePicker.getByText(SELECT_SOURCE_TABLE, { exact: true }), 'functional Select Baserow table should be visible').toBeVisible({
    timeout: 30_000,
  });
  await tablePicker.getByText(SELECT_SOURCE_TABLE, { exact: true }).click();
  await expect(tablePicker.locator('.class1776246576145'), 'functional Select Baserow table should be selected').toContainText(
    SELECT_SOURCE_TABLE,
    { timeout: 30_000 },
  );
}

async function setFunctionalSingleSelectSourceColumn(
  modal: Locator,
  checkboxSelector: string,
  targetColumn: string,
): Promise<void> {
  const rows = modal.locator(SELECT_SOURCE_COLUMN_ROW);
  const targetColumnPattern = columnNamePattern(targetColumn);
  await expect(rows.filter({ hasText: targetColumnPattern }).first(), `Baserow column ${targetColumn} should be available`).toBeVisible({
    timeout: 15_000,
  });

  const count = await rows.count();
  for (let index = 0; index < count; index++) {
    const row = rows.nth(index);
    const checkbox = row.locator(checkboxSelector).first();
    if ((await checkbox.count()) === 0) continue;

    const rowText = (await row.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const isTarget = targetColumnPattern.test(rowText);
    const checked = (await checkbox.getAttribute('aria-checked')) === 'true';
    if (checked !== isTarget) {
      await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
      await expect
        .poll(() => checkbox.getAttribute('aria-checked'), {
          message: `Baserow column ${rowText || index} checked state should become ${isTarget}`,
          timeout: 5_000,
        })
        .toBe(isTarget ? 'true' : 'false');
    }
  }
}

function columnNamePattern(columnName: string): RegExp {
  return new RegExp(`(^|\\s)${escapeRegExp(columnName)}(\\s|$)`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertGridSourceFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === GRID_SOURCE_TABLE);
  expect(table, `Baserow table ${GRID_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of GRID_SOURCE_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${GRID_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${GRID_SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
}

function assertGridInteractionFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === GRID_INTERACTION_TABLE);
  expect(table, `Baserow table ${GRID_INTERACTION_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of [GRID_INTERACTION_NAME, GRID_INTERACTION_STATUS, GRID_INTERACTION_NOTES]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${GRID_INTERACTION_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${GRID_INTERACTION_TABLE}.${columnName} should be a Text field`).toBe('text');
  }

  const rankColumn = columns.find((candidate) => candidate.name === GRID_INTERACTION_RANK);
  expect(rankColumn, `Baserow column ${GRID_INTERACTION_TABLE}.${GRID_INTERACTION_RANK} should exist`).toBeTruthy();
  expect(rankColumn?.type, `Baserow column ${GRID_INTERACTION_TABLE}.${GRID_INTERACTION_RANK} should be a Number field`).toBe(
    'number',
  );
}

function assertGridFormatFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === GRID_FORMAT_TABLE);
  expect(table, `Baserow table ${GRID_FORMAT_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  const nameColumn = columns.find((candidate) => candidate.name === 'Name');
  expect(nameColumn, `Baserow column ${GRID_FORMAT_TABLE}.Name should exist`).toBeTruthy();
  expect(nameColumn?.type, `Baserow column ${GRID_FORMAT_TABLE}.Name should be a Text field`).toBe('text');

  for (const expected of GRID_FORMAT_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === expected.name);
    expect(column, `Baserow column ${GRID_FORMAT_TABLE}.${expected.name} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${GRID_FORMAT_TABLE}.${expected.name} should keep its type`).toBe(expected.type);
    for (const [key, value] of Object.entries(expected.baserowOptions)) {
      expect(column?.[key], `Baserow column ${GRID_FORMAT_TABLE}.${expected.name} should keep ${key}`).toBe(value);
    }
  }
}

function assertChartSourceFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === CHART_SOURCE_TABLE);
  expect(table, `Baserow table ${CHART_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of [CHART_SOURCE_IGNORED_CATEGORY, CHART_SOURCE_CATEGORY]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${CHART_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${CHART_SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
  for (const columnName of [CHART_SOURCE_IGNORED_VALUE, CHART_SOURCE_VALUE]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${CHART_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${CHART_SOURCE_TABLE}.${columnName} should be a Number field`).toBe('number');
  }
}

function assertMapSourceFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === MAP_SOURCE_TABLE);
  expect(table, `Baserow table ${MAP_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of [MAP_SOURCE_IGNORED_TITLE, MAP_SOURCE_TITLE]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${MAP_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${MAP_SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
  for (const columnName of [
    MAP_SOURCE_IGNORED_LATITUDE,
    MAP_SOURCE_IGNORED_LONGITUDE,
    MAP_SOURCE_LATITUDE,
    MAP_SOURCE_LONGITUDE,
  ]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${MAP_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${MAP_SOURCE_TABLE}.${columnName} should be a Number field`).toBe('number');
  }
}

function assertSelectSourceFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === SELECT_SOURCE_TABLE);
  expect(table, `Baserow table ${SELECT_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of SELECT_SOURCE_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${SELECT_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${SELECT_SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
}

function assertFilterSourceFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === FILTER_SOURCE_TABLE);
  expect(table, `Baserow table ${FILTER_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of FILTER_SOURCE_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${FILTER_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${FILTER_SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
}

function assertSortSourceFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === SORT_SOURCE_TABLE);
  expect(table, `Baserow table ${SORT_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  const nameColumn = columns.find((candidate) => candidate.name === SORT_SOURCE_NAME);
  expect(nameColumn, `Baserow column ${SORT_SOURCE_TABLE}.${SORT_SOURCE_NAME} should exist`).toBeTruthy();
  expect(nameColumn?.type, `Baserow column ${SORT_SOURCE_TABLE}.${SORT_SOURCE_NAME} should be a Text field`).toBe('text');

  const rankColumn = columns.find((candidate) => candidate.name === SORT_SOURCE_RANK);
  expect(rankColumn, `Baserow column ${SORT_SOURCE_TABLE}.${SORT_SOURCE_RANK} should exist`).toBeTruthy();
  expect(rankColumn?.type, `Baserow column ${SORT_SOURCE_TABLE}.${SORT_SOURCE_RANK} should be a Number field`).toBe('number');
}

function chartSourceConfig() {
  return {
    workspace: FUNCTIONAL_SOURCE_WORKSPACE,
    database: FUNCTIONAL_SOURCE_DATABASE,
    table: CHART_SOURCE_TABLE,
    expectedColumns: CHART_SOURCE_COLUMNS,
    categoryColumn: CHART_SOURCE_CATEGORY,
    valueColumns: [CHART_SOURCE_VALUE],
  };
}

function mapSourceConfig() {
  return {
    workspace: FUNCTIONAL_SOURCE_WORKSPACE,
    database: FUNCTIONAL_SOURCE_DATABASE,
    table: MAP_SOURCE_TABLE,
    expectedColumns: MAP_SOURCE_COLUMNS,
    titleColumn: MAP_SOURCE_TITLE,
    latitudeColumn: MAP_SOURCE_LATITUDE,
    longitudeColumn: MAP_SOURCE_LONGITUDE,
  };
}

async function expectGridHeaderVisible(page: Page, column: string): Promise<void> {
  const header = page.locator('.ag-header-cell .ag-header-cell-text').filter({ hasText: column }).first();
  await expect(header, `Grid header ${column} should be visible`).toBeVisible({ timeout: 45_000 });
}

async function expectGridHeaderHidden(page: Page, column: string): Promise<void> {
  await expect(
    page.locator(`${SEL.gridComponent}:visible .ag-header-cell .ag-header-cell-text`).filter({ hasText: column }),
    `Grid header ${column} should be hidden`,
  ).toHaveCount(0, { timeout: 15_000 });
}

async function expectVisibleGridTextToExclude(page: Page, value: string): Promise<void> {
  const grid = page.locator(`${SEL.gridComponent}:visible`).first();
  await expect
    .poll(() => normalizedText(grid), {
      message: `visible Grid text should not expose ${value}`,
      timeout: 15_000,
    })
    .not.toContain(value);
}

async function setGridSourceColumnHiddenThroughUi(page: Page, column: string, hidden: boolean): Promise<void> {
  await test.step(`Set Data Grid source column ${column} to ${hidden ? 'hidden' : 'displayed'}`, async () => {
    const picker = await openGridBaserowTablePickerFromConfig(page);
    await setGridSourceColumnHidden(picker, column, hidden);
    await saveGridBaserowTablePicker(picker);
  });
}

async function expectGridSourceColumnHiddenPersistsThroughUi(page: Page, column: string, hidden: boolean): Promise<void> {
  await test.step(`Reopen Data Grid source and verify ${column} is ${hidden ? 'hidden' : 'displayed'}`, async () => {
    const picker = await openGridBaserowTablePickerFromConfig(page);
    await expectGridSourceColumnHiddenState(picker, column, hidden);
    await saveGridBaserowTablePicker(picker);
  });
}

async function openGridBaserowTablePickerFromConfig(page: Page): Promise<Locator> {
  await openConfigTabById(page, 'tab_selector_conf_source');
  await acceptRgpdIfVisible(page);
  const configureButton = page.locator(`${SEL.dataSourceConfigureButton}:visible`).first();
  await expect(configureButton, 'Data Grid Baserow table configure button should be visible').toBeVisible({
    timeout: 30_000,
  });
  await configureButton.click({ timeout: 10_000 }).catch(async () => configureButton.dispatchEvent('click'));

  const picker = page.locator('ion-modal:not(.overlay-hidden):visible, ion-modal:visible').last();
  await expect(picker, 'Data Grid Baserow table picker should open').toBeVisible({ timeout: 30_000 });
  return picker;
}

async function openGridBaserowWorkspacePicker(page: Page): Promise<Locator> {
  await acceptRgpdIfVisible(page);
  await openComponentsPalette(page, PALETTE_ICON.grid);
  await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
  await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'source isolation Grid component should be present').toBeVisible({
    timeout: 30_000,
  });

  await openComponentConfig(page, SEL.gridComponent);
  await selectGridBaserowSourceWithoutTable(page);
  return openGridBaserowTablePickerFromConfig(page);
}

async function expectBaserowWorkspaceVisible(picker: Locator, workspace: string): Promise<void> {
  await expect(
    picker.getByText(workspace, { exact: true }).first(),
    `Baserow workspace ${workspace} should be visible`,
  ).toBeVisible({ timeout: 60_000 });
}

async function expectBaserowWorkspaceHidden(picker: Locator, workspace: string): Promise<void> {
  await expect(
    picker.getByText(workspace, { exact: true }),
    `Baserow workspace ${workspace} should not be visible`,
  ).toHaveCount(0, { timeout: 10_000 });
}

function mobileAppRootUrl(page: Page): string {
  const url = new URL(page.url());
  const marker = '/DisplayObjects/mobile/';
  const markerIndex = url.pathname.indexOf(marker);
  if (markerIndex >= 0) {
    url.pathname = `${url.pathname.slice(0, markerIndex)}${marker}`;
    url.search = '';
    url.hash = '';
    return url.toString();
  }

  url.pathname = url.pathname.replace(/\/(?:editor|viewer)(?:\/.*)?$/, '/');
  url.search = '';
  url.hash = '';
  return url.toString();
}

async function setGridSourceColumnHidden(picker: Locator, column: string, hidden: boolean): Promise<void> {
  if (await gridSourceColumnHasHiddenState(picker, column, hidden)) {
    return;
  }

  const row = gridSourceColumnRow(picker, column);
  await expect(row, `Grid source column ${column} should be available`).toBeVisible({ timeout: 30_000 });
  const currentLabel = hidden ? GRID_COLUMN_DISPLAYED_LABEL_RE : GRID_COLUMN_HIDDEN_LABEL_RE;
  const toggle = row.locator('ion-button, button').filter({ hasText: currentLabel }).first();
  await expect(toggle, `Grid source column ${column} state toggle should be visible`).toBeVisible({ timeout: 15_000 });
  await toggle.click({ timeout: 10_000 }).catch(async () => toggle.dispatchEvent('click'));
  await expectGridSourceColumnHiddenState(picker, column, hidden);
}

async function expectGridSourceColumnHiddenState(picker: Locator, column: string, hidden: boolean): Promise<void> {
  const row = gridSourceColumnRow(picker, column);
  await expect(row, `Grid source column ${column} should be available`).toBeVisible({ timeout: 30_000 });
  const label = hidden ? GRID_COLUMN_HIDDEN_LABEL_RE : GRID_COLUMN_DISPLAYED_LABEL_RE;
  await expect(row.locator('ion-button, button').filter({ hasText: label }).first(), `Grid source column ${column} should be ${hidden ? 'hidden' : 'displayed'}`).toBeVisible({
    timeout: 15_000,
  });
}

async function gridSourceColumnHasHiddenState(picker: Locator, column: string, hidden: boolean): Promise<boolean> {
  const row = gridSourceColumnRow(picker, column);
  const label = hidden ? GRID_COLUMN_HIDDEN_LABEL_RE : GRID_COLUMN_DISPLAYED_LABEL_RE;
  return row.locator('ion-button, button').filter({ hasText: label }).first().isVisible({ timeout: 1_000 }).catch(() => false);
}

function gridSourceColumnRow(picker: Locator, column: string): Locator {
  return picker.locator(SELECT_SOURCE_COLUMN_ROW).filter({ hasText: column }).first();
}

async function saveGridBaserowTablePicker(picker: Locator): Promise<void> {
  await acceptRgpdIfVisible(picker.page());
  await picker.locator(TABLE_PICKER_SAVE_BUTTON).click({ timeout: 10_000 });
  await expect(picker, 'Data Grid Baserow table picker should close after save').toBeHidden({ timeout: 30_000 });
  await picker.page().waitForTimeout(1_500);
}

type ChartType = 'area' | 'bar' | 'pie' | 'line' | 'donut';

const CHART_TYPE_INDEX: Record<ChartType, number> = {
  area: 0,
  bar: 1,
  pie: 2,
  line: 3,
  donut: 4,
};

async function expectChartTypeOptions(page: Page): Promise<void> {
  await test.step('Assert Chart type options are available', async () => {
    await expect(
      page.locator(`${CHART_TYPE_TOGGLE}:visible button.c8o-btn:visible`),
      'Chart type toggle should expose all supported chart types',
    ).toHaveCount(5, { timeout: 15_000 });
  });
}

async function selectChartType(page: Page, type: ChartType): Promise<void> {
  await test.step(`Select Chart type: ${type}`, async () => {
    const button = chartTypeButton(page, type);
    await expect(button, `Chart ${type} type button should be visible`).toBeVisible({ timeout: 15_000 });
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
    await expectChartTypeSelected(page, type);
  });
}

async function expectChartTypeSelected(page: Page, type: ChartType): Promise<void> {
  await test.step(`Assert Chart type is ${type}`, async () => {
    const button = chartTypeButton(page, type);
    await expect
      .poll(async () => (await button.getAttribute('class')) ?? '', {
        message: `Chart ${type} type button should be selected`,
        timeout: 10_000,
      })
      .toContain('c8o-btn-selected');
  });
}

function chartTypeButton(page: Page, type: ChartType): Locator {
  return page.locator(`${CHART_TYPE_TOGGLE}:visible button.c8o-btn:visible`).nth(CHART_TYPE_INDEX[type]);
}

async function visibleGridRow(page: Page, text: string): Promise<Locator> {
  const row = page.locator('.ag-center-cols-container .ag-row').filter({ hasText: text }).first();
  await expect(row, `Baserow row ${text} should render in the Data Grid`).toBeVisible({ timeout: 45_000 });
  await expect
    .poll(() => normalizedText(row), {
      message: `Baserow row ${text} should expose visible cell text`,
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
  expect(columnIndex, `Data Grid column ${columnName} should be visible`).toBeGreaterThanOrEqual(0);

  const cell = row.locator('.ag-cell').nth(columnIndex);
  await expect(cell, `Data Grid cell ${columnName} should be visible`).toBeVisible({ timeout: 15_000 });
  return normalizedText(cell);
}

async function visibleGridRowAcrossPages(page: Page, text: string): Promise<Locator> {
  const row = page.locator('.ag-center-cols-container .ag-row').filter({ hasText: text }).first();
  for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
    if (await row.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await expect
        .poll(() => normalizedText(row), {
          message: `Baserow row ${text} should expose visible cell text`,
          timeout: 15_000,
        })
        .toContain(text);
      return row;
    }

    const next = gridNextPageButton(page);
    if (!(await next.isVisible({ timeout: 1_000 }).catch(() => false))) {
      break;
    }
    const disabled = await next.evaluate((el) => {
      const element = el as HTMLElement;
      return element.getAttribute('aria-disabled') === 'true' || element.classList.contains('ag-disabled');
    });
    if (disabled) {
      break;
    }
    await next.click({ timeout: 5_000 }).catch(async () => next.dispatchEvent('click'));
    await page.waitForTimeout(750);
  }

  await expect(row, `Baserow row ${text} should render in the Data Grid across paginated pages`).toBeVisible({
    timeout: 1_000,
  });
  return row;
}

async function visibleScopedGridRow(page: Page, text: string): Promise<Locator> {
  const row = page.locator(`${SEL.gridComponent}:visible .ag-center-cols-container .ag-row`).filter({ hasText: text }).first();
  await expect(row, `Baserow row ${text} should render in the scoped Data Grid`).toBeVisible({ timeout: 45_000 });
  return row;
}

async function expectGridVisibleRowsInOrder(page: Page, expected: string[]): Promise<void> {
  await expect
    .poll(() => visibleGridMatchingRowNames(page, expected), {
      message: `visible Grid rows should follow ${expected.join(' -> ')}`,
      timeout: 45_000,
    })
    .toEqual(expected);
}

async function visibleGridMatchingRowNames(page: Page, expected: string[]): Promise<string[]> {
  const rows = await page.locator(`${SEL.gridComponent}:visible .ag-center-cols-container .ag-row`).evaluateAll((elements) =>
    elements.map((element) => (element.textContent ?? '').replace(/\s+/g, ' ').trim()),
  );
  return rows
    .map((text) => expected.find((name) => text.includes(name)) ?? null)
    .filter((name): name is string => name !== null);
}

async function gridRowSelected(row: Locator): Promise<boolean> {
  return row.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    return htmlElement.classList.contains('ag-row-selected') || htmlElement.getAttribute('aria-selected') === 'true';
  });
}

function gridNextPageButton(page: Page): Locator {
  return page.locator('.ag-paging-button[aria-label="Next Page"], .ag-paging-button:has(.ag-icon-next)').first();
}

async function visibleLeafletMarkerTitles(page: Page): Promise<string[]> {
  return page
    .locator(`${SEL.mapViewer}:visible .leaflet-marker-icon`)
    .evaluateAll((markers) =>
      markers
        .map((marker) => marker.getAttribute('title') ?? marker.getAttribute('alt') ?? '')
        .map((value) => value.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    );
}

async function normalizedText(locator: Locator): Promise<string> {
  return ((await locator.textContent()) ?? '').replace(/\s+/g, ' ').trim();
}

async function expectVisibleTinyMceBody(page: Page): Promise<void> {
  await expect
    .poll(() => tinyMceEditorContent(page).then(() => true).catch(() => false), {
      message: 'Description rich text editor should be visible',
      timeout: 15_000,
    })
    .toBe(true);
}

async function expandedSourcePaletteSections(page: Page, sections: SourcePaletteSection[]): Promise<SourcePaletteSection[]> {
  return (await sourcePaletteSectionStates(page, sections)).filter((state) => state.expanded).map((state) => state.name);
}

async function activateDataSourceMode(page: Page): Promise<void> {
  const buttons = page.locator('button.class1775840591959:visible');
  await expect(buttons.nth(1), 'data source mode toggle should be visible').toBeVisible({ timeout: 15_000 });
  const sourceModeButton = buttons.nth(1);
  if (!((await sourceModeButton.getAttribute('class')) ?? '').includes('c8o-btn-selected')) {
    await sourceModeButton.click({ timeout: 10_000 }).catch(async () => sourceModeButton.dispatchEvent('click'));
  }
}

async function closeSourceSelectionModal(modal: Locator): Promise<void> {
  const cancel = modal.locator('ion-button.class1599830132430:visible').last();
  if (await cancel.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await cancel.click({ timeout: 5_000 }).catch(async () => cancel.dispatchEvent('click'));
  } else {
    await modal.page().keyboard.press('Escape').catch(() => undefined);
  }
  await expect(modal, 'source selection modal should close').toBeHidden({ timeout: 15_000 });
}
