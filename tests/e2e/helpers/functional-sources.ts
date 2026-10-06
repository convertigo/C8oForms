import { expect, test, type Browser, type Locator, type Page, type Route } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './baserow';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  checkedSelectBaserowDisplayColumns,
  checkedSelectBaserowValueColumns,
  configureChartBaserowSource,
  dataSourceFilterFieldOptions,
  configureDataSourceFilterMonacoPaletteValue,
  configureDataSourceFilterTextValue,
  configureDataSourceSort,
  closeComponentConfig,
  configureGridBaserowSource,
  configureMapBaserowSource,
  configureSelectBaserowSource,
  createBlankForm,
  expectChartBaserowSourceRoles,
  expectGridBaserowColumnsOnReopen,
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
  dragExistingComponentIntoGroup,
  openDataSourceFilterPanel,
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
  setSelectSelectionMode,
  setTechnicalId,
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
const SOURCE_FILTER_WITNESS_WORKSPACE = 'Functional Search Witness';
const SOURCE_FILTER_WITNESS_DATABASE = 'Picker Search Witness';
const SOURCE_FILTER_ISOLATED_DATABASE = 'Picker Search Witness Isolated';
const SOURCE_FILTER_WITNESS_TABLE = 'Picker Search Witness Table';
const GRID_SOURCE_TABLE = 'Functional Source Grid';
const GRID_SOURCE_COLUMNS = ['Name', 'Status', 'Marker'];
const GRID_SOURCE_ROWS = [
  { Name: 'functional_source_grid_alpha', Status: 'Active', Marker: 'visible_grid_alpha' },
  { Name: 'functional_source_grid_bravo', Status: 'Pending', Marker: 'visible_grid_bravo' },
];
const GRID_EDITOR_PREVIEW_TABLE = 'Functional Grid Editor Preview 1409';
const GRID_EDITOR_PREVIEW_COLUMNS = [
  'Configured customer reference',
  'Configured delivery destination',
  'Configured fulfillment status',
  'Configured account representative',
  'Configured purchase order number',
  'Configured shipment tracking reference',
  'Configured invoice approval state',
  'Configured archival classification',
];
const GRID_LONG_TABLE_NAME =
  'Functional Source Table With A Deliberately Very Long Name That Must Stay Truncated And Selectable 1277';
const GRID_LONG_TABLE_COLUMNS = ['Name', 'Long Name Marker'];
const GRID_LONG_TABLE_ROW = 'functional_source_long_table_1277';
const GRID_URL_TABLE = 'Functional Grid URL Contract';
const GRID_URL_COLUMN = 'Website';
const GRID_URL_TEXT_COLUMN = 'URL Looking Text';
const GRID_URL_COLUMNS = ['Name', GRID_URL_COLUMN, GRID_URL_TEXT_COLUMN];
const GRID_URL_ROWS = [
  {
    Name: 'functional_grid_url_absolute',
    [GRID_URL_COLUMN]: 'https://example.com/c8oforms-url-contract',
    [GRID_URL_TEXT_COLUMN]: 'https://example.com/plain-text-contract',
  },
  {
    Name: 'functional_grid_url_domain',
    [GRID_URL_COLUMN]: 'example.org/c8oforms-url-contract',
    [GRID_URL_TEXT_COLUMN]: 'example.org/plain-text-contract',
  },
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
const SOURCE_PICKER_NAVIGATION_SEARCH_INPUT = 'ion-input.class1776256596569 input:visible';
const SOURCE_PICKER_COLUMN_SEARCH_INPUT = 'ion-input.class1776260626658 input:visible';
const SOURCE_PICKER_SEARCH_PLACEHOLDER =
  /^(Search|Rechercher|Buscar|Cerca)( columns| des colonnes| columnas| colonne)?$/i;
const GRID_COLUMN_DISPLAYED_LABEL_RE = /Displayed|Affich|Mostrado|Visualizzati/i;
const GRID_COLUMN_HIDDEN_LABEL_RE = /Hidden|Masqu|Oculto|Nascosti/i;
const GRID_COLUMN_INCLUDE_CHECKBOX = 'ion-checkbox.class1776161384894';
const GRID_COLUMN_DISPLAY_BUTTON = 'ion-button.class1776332952453';
const GRID_COLUMN_SUMMARY = 'ion-text.class1776260306611';
const SOURCE_PICKER_NAVIGATION_BUTTON = 'ion-button.initial.btn';
const GRID_SELECTION_CHECKBOX = '.ag-selection-checkbox .ag-checkbox-input-wrapper';

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

    for (const sampleColumn of ['Make', 'Model', 'Price']) {
      await expectGridHeaderHidden(page, sampleColumn);
    }

    for (const row of GRID_SOURCE_ROWS) {
      const gridRow = await visibleGridRow(page, row.Name);
      const text = await normalizedText(gridRow);
      expect(text, `Grid row ${row.Name} should contain its Status`).toContain(row.Status);
      expect(text, `Grid row ${row.Name} should contain its Marker`).toContain(row.Marker);
    }
  });
}

/**
 * #1255: a configured Grid must keep both source editors usable after the
 * existing component is moved from the page root into a Group.
 */
export async function assertConfiguredGridSourceSurvivesMoveIntoGroupThroughUi(page: Page): Promise<void> {
  const source = {
    workspace: FUNCTIONAL_SOURCE_WORKSPACE,
    database: FUNCTIONAL_SOURCE_DATABASE,
    table: GRID_SOURCE_TABLE,
    expectedColumns: GRID_SOURCE_COLUMNS,
  } as const;

  await test.step('Ensure the functional Grid Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: source.workspace,
      database: source.database,
      table: source.table,
      primaryField: 'Name',
      columns: GRID_SOURCE_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: GRID_SOURCE_ROWS,
      upsertKey: 'Name',
    });
    assertGridSourceFixture(catalog);
  });

  await test.step('Configure a Grid at the page root, then move that existing Grid into a Group', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, source);
    await closeComponentConfig(page);

    await openComponentsPalette(page, PALETTE_ICON.group);
    await addComponent(page, PALETTE_ICON.group, { allowEditorApiFallback: false });
    const group = page.locator('c8oforms-itemcardeditorviewer:visible').first();
    await expect(group, 'destination Group should be present').toBeVisible({ timeout: 30_000 });

    await dragExistingComponentIntoGroup(page, SEL.gridComponent);
    await expect(
      group.locator(`${SEL.gridComponent}:visible`),
      'the already configured Grid should render as a child of the Group',
    ).toHaveCount(1, { timeout: 30_000 });
  });

  await test.step('Reopen the moved Grid Source selection dialog', async () => {
    await openComponentConfig(page, `c8oforms-itemcardeditorviewer ${SEL.gridComponent}`);
    await openConfigTabById(page, 'tab_selector_choice_source');
    const selectButton = page.locator(`${SEL.dataSourceSelectButton}:visible`).first();
    await expect(selectButton, 'moved Grid Source selection button should remain visible').toBeVisible({ timeout: 15_000 });
    await selectButton.click({ timeout: 10_000 }).catch(async () => selectButton.dispatchEvent('click'));

    const sourcePicker = page.locator('ion-modal:visible').last();
    await expect(sourcePicker, 'moved Grid Source selection dialog should open').toBeVisible({ timeout: 30_000 });
    await expect(
      sourcePicker.locator(SEL.dataSourceSelectButton).first(),
      'moved Grid Source selection dialog should expose its configured source choice',
    ).toBeVisible({ timeout: 30_000 });
    await closeSourceSelectionModal(sourcePicker);
  });

  await test.step('Reopen the moved Grid Source configuration and retain its Baserow columns', async () => {
    await expectGridBaserowColumnsOnReopen(page, source);
    await closeComponentConfig(page);
  });
}

/** #1409: editor preview columns and width behavior come from stored Grid configuration. */
export async function assertConfiguredGridEditorPreviewColumnsAndWidthThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the wide Grid editor-preview fixture exists', async () => {
    await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_EDITOR_PREVIEW_TABLE,
      primaryField: GRID_EDITOR_PREVIEW_COLUMNS[0],
      columns: GRID_EDITOR_PREVIEW_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: [
        Object.fromEntries(GRID_EDITOR_PREVIEW_COLUMNS.map((column, index) => [column, `editor-preview-${index + 1}`])),
      ],
      upsertKey: GRID_EDITOR_PREVIEW_COLUMNS[0],
    });
  });

  await test.step('Configure the Grid source and verify its stored columns in the editor preview', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_EDITOR_PREVIEW_TABLE,
      expectedColumns: GRID_EDITOR_PREVIEW_COLUMNS,
    });
    await closeComponentConfig(page);

    for (const column of GRID_EDITOR_PREVIEW_COLUMNS) {
      await expectGridHeaderVisible(page, column);
    }
    for (const fallback of ['Make', 'Model', 'Price']) {
      await expectGridHeaderHidden(page, fallback);
    }
  });

  await test.step('Fit configured editor-preview columns without horizontal scrolling', async () => {
    await openComponentConfig(page, SEL.gridComponent);
    await setGridEditorColumnWidthMode(page, 'fit');
    await closeComponentConfig(page);
    const geometry = await gridEditorHorizontalGeometry(page);
    expect(
      geometry.scrollWidth,
      `fit mode should not horizontally overflow the editor Grid (${geometry.scrollWidth}/${geometry.clientWidth})`,
    ).toBeLessThanOrEqual(geometry.clientWidth + 2);
  });

  await test.step('Keep configured editor-preview column widths with horizontal scrolling', async () => {
    await openComponentConfig(page, SEL.gridComponent);
    await setGridEditorColumnWidthMode(page, 'scroll');
    await closeComponentConfig(page);
    const geometry = await gridEditorHorizontalGeometry(page);
    expect(
      geometry.scrollWidth,
      `scroll mode should overflow the editor Grid viewport (${geometry.scrollWidth}/${geometry.clientWidth})`,
    ).toBeGreaterThan(geometry.clientWidth + 2);
  });
}

async function ensureGridSourcePickerFixtures(): Promise<void> {
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

  await ensureBaserowTable({
    workspace: FUNCTIONAL_SOURCE_WORKSPACE,
    database: SOURCE_FILTER_WITNESS_DATABASE,
    table: SOURCE_FILTER_WITNESS_TABLE,
    primaryField: 'Name',
    columns: [{ name: 'Name', type: 'text' }],
  });
  await ensureBaserowTable({
    workspace: SOURCE_FILTER_WITNESS_WORKSPACE,
    database: SOURCE_FILTER_ISOLATED_DATABASE,
    table: SOURCE_FILTER_WITNESS_TABLE,
    primaryField: 'Name',
    columns: [{ name: 'Name', type: 'text' }],
  });
}

async function expectLocalizedLiveSearchPlaceholder(search: Locator, context: string): Promise<void> {
  await expect(search, `${context} should be visible`).toBeVisible({ timeout: 30_000 });
  await expect(search, `${context} should use localized live-search copy`).toHaveAttribute(
    'placeholder',
    SOURCE_PICKER_SEARCH_PLACEHOLDER,
  );
  const placeholder = (await search.getAttribute('placeholder')) ?? '';
  expect(placeholder, `${context} should not advertise an Enter key`).not.toMatch(/[⏎↵]/);
}

export async function assertGridSourceSearchPlaceholdersThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the Grid source and live-search witness fixtures exist', async () => {
    await ensureGridSourcePickerFixtures();
  });

  await test.step('Prove navigation search is live and inspect both picker placeholders', async () => {
    const picker = await openGridBaserowWorkspacePicker(page);
    const navigationSearch = picker.locator(SOURCE_PICKER_NAVIGATION_SEARCH_INPUT).first();
    await expectLocalizedLiveSearchPlaceholder(navigationSearch, 'navigation search');

    const targetWorkspace = sourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_WORKSPACE);
    const witnessWorkspace = sourcePickerNavigationEntry(picker, SOURCE_FILTER_WITNESS_WORKSPACE);
    await expect(targetWorkspace, 'target workspace should be visible before live filtering').toBeVisible({ timeout: 60_000 });
    await expect(witnessWorkspace, 'witness workspace should be visible before live filtering').toBeVisible({ timeout: 60_000 });
    await navigationSearch.fill(FUNCTIONAL_SOURCE_WORKSPACE);
    await expect(targetWorkspace, 'matching workspace should remain visible without pressing Enter').toBeVisible();
    await expect(witnessWorkspace, 'non-matching workspace should be hidden while typing without pressing Enter').toBeHidden();
    await navigationSearch.fill('');
    await expect(witnessWorkspace, 'clearing live search should restore the witness workspace').toBeVisible({ timeout: 15_000 });

    await clickSourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_WORKSPACE, 'workspace');
    await clickSourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_DATABASE, 'database');
    const table = sourcePickerNavigationEntry(picker, GRID_SOURCE_TABLE);
    await expect(table, 'Grid source table should be visible').toBeVisible({ timeout: 60_000 });
    await table.click({ timeout: 10_000 }).catch(async () => table.dispatchEvent('click'));
    await expect(gridSourceColumnRow(picker, 'Marker'), 'selecting the table should expose its columns').toBeVisible({
      timeout: 30_000,
    });

    await expectLocalizedLiveSearchPlaceholder(picker.locator(SOURCE_PICKER_COLUMN_SEARCH_INPUT).first(), 'column search');
    await saveGridBaserowTablePicker(picker);
    await closeComponentConfig(page);
  });
}

export async function assertGridSourceColumnSearchFiltersLiveThroughUi(page: Page): Promise<void> {
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

  await test.step('Configure a Data Grid and reopen its source columns', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_SOURCE_TABLE,
      expectedColumns: GRID_SOURCE_COLUMNS,
    });

    const picker = await openGridBaserowTablePickerFromConfig(page);
    for (const column of GRID_SOURCE_COLUMNS) {
      await expect(gridSourceColumnRow(picker, column), `Grid source column ${column} should initially be visible`).toBeVisible({
        timeout: 30_000,
      });
    }

    const search = picker.locator(SOURCE_PICKER_COLUMN_SEARCH_INPUT).first();
    await expect(search, 'Grid source column live-search input should be visible').toBeVisible({ timeout: 15_000 });
    await search.pressSequentially('Marker', { delay: 25 });
    await expect(gridSourceColumnRow(picker, 'Marker'), 'matching source column should remain visible without pressing Enter').toBeVisible({
      timeout: 10_000,
    });
    await expect(gridSourceColumnRow(picker, 'Name'), 'non-matching Name column should be filtered live').toBeHidden({ timeout: 10_000 });
    await expect(gridSourceColumnRow(picker, 'Status'), 'non-matching Status column should be filtered live').toBeHidden({ timeout: 10_000 });

    await search.fill('');
    for (const column of GRID_SOURCE_COLUMNS) {
      await expect(gridSourceColumnRow(picker, column), `clearing live search should restore ${column}`).toBeVisible({ timeout: 10_000 });
    }
    await saveGridBaserowTablePicker(picker);
    await closeComponentConfig(page);
  });
}

export async function assertExcludedGridColumnLeavesDisplayedCountThroughUi(page: Page): Promise<void> {
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

  await test.step('Exclude one included Grid column and compare picker counters', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_SOURCE_TABLE,
      expectedColumns: GRID_SOURCE_COLUMNS,
    });

    const picker = await openGridBaserowTablePickerFromConfig(page);
    const summary = picker.locator(GRID_COLUMN_SUMMARY).first();
    const initial = await gridColumnSummaryCounts(summary);
    expect(initial, 'Grid source summary should expose total, included and displayed counts').toHaveLength(3);

    const row = gridSourceColumnRow(picker, 'Marker');
    const include = row.locator(GRID_COLUMN_INCLUDE_CHECKBOX).first();
    const display = row.locator(GRID_COLUMN_DISPLAY_BUTTON).first();
    await expect(include, 'Marker Include checkbox should initially be checked').toHaveAttribute('aria-checked', 'true');
    await include.click({ timeout: 10_000 }).catch(async () => include.dispatchEvent('click'));
    await expect(include, 'Marker Include checkbox should become unchecked').toHaveAttribute('aria-checked', 'false', {
      timeout: 10_000,
    });
    await expect(display, 'Displayed control should be disabled for an excluded column').toHaveAttribute(
      'aria-disabled',
      'true',
      { timeout: 10_000 },
    );

    await expect
      .poll(() => gridColumnSummaryCounts(summary), {
        message: 'excluding Marker should decrement both included and displayed counts',
        timeout: 10_000,
      })
      .toEqual([initial[0], initial[1] - 1, initial[2] - 1]);
    await saveGridBaserowTablePicker(picker);
    await closeComponentConfig(page);
  });
}

export async function assertGridLongTableNameLayoutThroughUi(page: Page): Promise<void> {
  await test.step('Ensure a Baserow table with a deliberately long name exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_LONG_TABLE_NAME,
      primaryField: 'Name',
      columns: GRID_LONG_TABLE_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: [{ Name: GRID_LONG_TABLE_ROW, 'Long Name Marker': 'visible_long_table_1277' }],
      upsertKey: 'Name',
    });
    const table = catalog.tables.find((candidate) => candidate.name === GRID_LONG_TABLE_NAME);
    expect(table, `Baserow table ${GRID_LONG_TABLE_NAME} should exist`).toBeTruthy();
    for (const columnName of GRID_LONG_TABLE_COLUMNS) {
      expect(
        table?.columns?.find((column) => column.name === columnName)?.type,
        `Baserow column ${GRID_LONG_TABLE_NAME}.${columnName} should be text`,
      ).toBe('text');
    }
  });

  await test.step('Open the Grid source picker and navigate to the long table name', async () => {
    const picker = await openGridBaserowWorkspacePicker(page);
    await clickSourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_WORKSPACE, 'workspace');
    await clickSourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_DATABASE, 'database');

    const tableButton = sourcePickerNavigationEntry(picker, GRID_LONG_TABLE_NAME);
    const tableIcon = tableButton.locator('ion-icon').first();
    await expect(tableButton, 'long Baserow table should remain visible and actionable').toBeVisible({ timeout: 30_000 });
    await expect(tableButton, 'long Baserow table should expose its complete name').toHaveAttribute(
      'title',
      GRID_LONG_TABLE_NAME,
    );
    await expect(tableIcon, 'long table row should keep its leading table icon').toBeVisible({ timeout: 10_000 });

    const layout = await tableButton.evaluate((button, expectedName) => {
      const text = [...button.querySelectorAll('ion-text')].find(
        (candidate) => (candidate.textContent ?? '').replace(/\s+/g, ' ').trim() === expectedName,
      ) as HTMLElement | undefined;
      const icon = button.querySelector('ion-icon') as HTMLElement | null;
      const panel = button.closest('ion-card-content') as HTMLElement | null;
      if (!text || !icon || !panel) {
        return null;
      }
      const textStyle = getComputedStyle(text);
      const buttonBox = (button as HTMLElement).getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      const iconBox = icon.getBoundingClientRect();
      return {
        textOverflow: textStyle.textOverflow,
        overflow: textStyle.overflow,
        whiteSpace: textStyle.whiteSpace,
        textAlign: textStyle.textAlign,
        textClientWidth: text.clientWidth,
        textScrollWidth: text.scrollWidth,
        iconWidth: iconBox.width,
        buttonRight: buttonBox.right,
        panelRight: panelBox.right,
      };
    }, GRID_LONG_TABLE_NAME);

    expect(layout, 'long table row should expose text, icon and panel layout witnesses').not.toBeNull();
    expect(layout?.overflow, 'long table name should be clipped inside its row').toBe('hidden');
    expect(layout?.textOverflow, 'long table name should use an ellipsis').toBe('ellipsis');
    expect(layout?.whiteSpace, 'long table name should stay on one line').toBe('nowrap');
    expect(layout?.textAlign, 'long table name should stay left aligned').toBe('left');
    expect(layout?.textScrollWidth, 'the long fixture name should actually overflow its text box').toBeGreaterThan(
      (layout?.textClientWidth ?? 0) + 1,
    );
    expect(layout?.iconWidth, 'the leading table icon should not collapse').toBeGreaterThanOrEqual(12);
    expect(layout?.buttonRight, 'the long table row should remain inside the picker panel').toBeLessThanOrEqual(
      (layout?.panelRight ?? 0) + 1,
    );

    await tableButton.click({ timeout: 10_000 }).catch(async () => tableButton.dispatchEvent('click'));
    await expect(
      gridSourceColumnRow(picker, 'Long Name Marker'),
      'clicking the truncated long table should still load its columns',
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      picker.locator('.class1776246576145'),
      'selected table summary should expose the complete long table name',
    ).toContainText(GRID_LONG_TABLE_NAME, { timeout: 30_000 });

    await saveGridBaserowTablePicker(picker);
    await closeComponentConfig(page);
  });
}

export async function assertFilteredGridSourceItemsSelectOnFirstClickThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the Grid source and negative filtering witnesses exist', async () => {
    await ensureGridSourcePickerFixtures();
  });

  await test.step('Select each filtered picker level with one click', async () => {
    const picker = await openGridBaserowWorkspacePicker(page);
    const search = picker.locator(SOURCE_PICKER_NAVIGATION_SEARCH_INPUT).first();
    await expect(search, 'source picker navigation search should be visible').toBeVisible({ timeout: 30_000 });

    const witnessWorkspace = sourcePickerNavigationEntry(picker, SOURCE_FILTER_WITNESS_WORKSPACE);
    await expect(witnessWorkspace, 'non-matching workspace witness should initially be visible').toBeVisible({ timeout: 60_000 });
    await search.fill(FUNCTIONAL_SOURCE_WORKSPACE);
    const workspace = sourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_WORKSPACE);
    await expect(workspace, 'filtered workspace should be visible').toBeVisible({ timeout: 15_000 });
    await expect(witnessWorkspace, 'filtering a workspace should hide the non-matching witness').toBeHidden({ timeout: 15_000 });
    await workspace.click({ timeout: 10_000 });
    await expect(search, 'selecting a filtered workspace should clear the navigation search').toHaveValue('', {
      timeout: 10_000,
    });
    await expect(
      sourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_DATABASE),
      'one workspace click should advance to databases',
    ).toBeVisible({ timeout: 30_000 });

    const witnessDatabase = sourcePickerNavigationEntry(picker, SOURCE_FILTER_WITNESS_DATABASE);
    await expect(witnessDatabase, 'non-matching database witness should initially be visible').toBeVisible({ timeout: 60_000 });
    await search.fill(FUNCTIONAL_SOURCE_DATABASE);
    const database = sourcePickerNavigationEntry(picker, FUNCTIONAL_SOURCE_DATABASE);
    await expect(database, 'filtered database should be visible').toBeVisible({ timeout: 15_000 });
    await expect(witnessDatabase, 'filtering a database should hide the non-matching witness').toBeHidden({ timeout: 15_000 });
    await database.click({ timeout: 10_000 });
    await expect(search, 'selecting a filtered database should clear the navigation search').toHaveValue('', {
      timeout: 10_000,
    });
    await expect(
      sourcePickerNavigationEntry(picker, GRID_SOURCE_TABLE),
      'one database click should advance to tables',
    ).toBeVisible({ timeout: 30_000 });

    await search.fill('Functional Source Grid');
    const table = sourcePickerNavigationEntry(picker, GRID_SOURCE_TABLE);
    await expect(table, 'filtered table should be visible').toBeVisible({ timeout: 15_000 });
    await table.click({ timeout: 10_000 });
    await expect(search, 'selecting a filtered table should clear the navigation search').toHaveValue('', {
      timeout: 10_000,
    });
    await expect(
      gridSourceColumnRow(picker, 'Marker'),
      'one table click should load its columns',
    ).toBeVisible({ timeout: 30_000 });

    await saveGridBaserowTablePicker(picker);
    await closeComponentConfig(page);
  });
}

export async function assertGridUrlColumnTypeAndRenderingThroughUi(page: Page): Promise<void> {
  await test.step('Ensure an isolated Grid URL fixture exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_URL_TABLE,
      primaryField: 'Name',
      columns: [
        { name: 'Name', type: 'text' },
        { name: GRID_URL_COLUMN, type: 'url' },
        { name: GRID_URL_TEXT_COLUMN, type: 'text' },
      ],
      rows: GRID_URL_ROWS,
      upsertKey: 'Name',
    });
    const table = catalog.tables.find((candidate) => candidate.name === GRID_URL_TABLE);
    expect(table, `Baserow table ${GRID_URL_TABLE} should exist`).toBeTruthy();
    expect(
      table?.columns.find((column) => column.name === GRID_URL_COLUMN)?.type,
      `${GRID_URL_COLUMN} should remain a URL field`,
    ).toBe('url');
  });

  await test.step('Configure the URL-backed Grid and verify its picker type label', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_URL_TABLE,
      expectedColumns: GRID_URL_COLUMNS,
    });

    const picker = await openGridBaserowTablePickerFromConfig(page);
    const urlRow = gridSourceColumnRow(picker, GRID_URL_COLUMN);
    await expect(urlRow, 'URL source column should be visible in the picker').toBeVisible({ timeout: 30_000 });
    await expect(urlRow, 'URL source column should expose its field type').toContainText('URL');
    await expect(urlRow, 'URL source column should not fall back to an unknown type').not.toContainText(
      /Unknown type|Type inconnu|Tipo desconocido|Tipo sconosciuto/i,
    );
    await saveGridBaserowTablePicker(picker);
    await closeComponentConfig(page);
  });

  await test.step('Verify URL fields render as safe links while URL-looking text stays plain', async () => {
    await openPreview(page, SEL.gridComponent);
    await expectGridHeaderVisible(page, GRID_URL_COLUMN);
    await expectGridHeaderVisible(page, GRID_URL_TEXT_COLUMN);

    for (const fixture of GRID_URL_ROWS) {
      const row = await visibleGridRow(page, fixture.Name);
      const urlValue = fixture[GRID_URL_COLUMN];
      const link = row.locator('a').filter({ hasText: urlValue }).first();
      await expect(link, `URL field ${urlValue} should render as a link`).toBeVisible({ timeout: 30_000 });
      const expectedHref = urlValue.startsWith('http') ? urlValue : `https://${urlValue}`;
      await expect(link).toHaveAttribute('href', expectedHref);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
      await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);

      const plainText = fixture[GRID_URL_TEXT_COLUMN];
      await expect(row, `text field ${plainText} should still render`).toContainText(plainText);
      await expect(row.locator('a').filter({ hasText: plainText }), `text field ${plainText} should not become a link`).toHaveCount(0);
    }
  });
}

// The loading overlay AG Grid renders with the C8Oforms spinner template (global.overlayNoRowsTemplate).
const GRID_LOADING_SPINNER = `${SEL.gridComponent} .ag-overlay-loading-wrapper .justTocheckExistingLoading`;
const GRID_NO_ROWS_OVERLAY = `${SEL.gridComponent} .ag-overlay-no-rows-wrapper`;
const GRID_OVERLAY_ERROR = /an error occured while trying to show an overlay for grid/;

export interface HeldSourceRequests {
  /** Number of source requests held so far. */
  count(): number;
  /** Lets the held requests (and every later one) reach the server and removes the interception. */
  release(): Promise<void>;
}

// A component source is loaded by a formssource_* sequence (formssource_GetTableData for a Baserow table).
const SOURCE_SEQUENCE_URL = '**/convertigo/projects/C8Oforms/.json';
const SOURCE_SEQUENCE_REQUEST = /name="__sequence"\r?\n\r?\nformssource_/;

/**
 * Holds the requests that load a component source until release() is called, so that the loading state of
 * the component can be asserted however fast the source answers. Install it right before opening the viewer:
 * every formssource_* sequence call issued from then on is held. The route is set on the browser context
 * because the application service worker issues these fetches itself, out of reach of page.route
 * (Chromium routes service worker requests through the context).
 */
export async function holdSourceRequests(page: Page, maxHoldMs = 60_000): Promise<HeldSourceRequests> {
  const context = page.context();
  let count = 0;
  let released = false;
  let releaseHeld: () => void = () => undefined;
  const releasedPromise = new Promise<void>((resolve) => {
    releaseHeld = resolve;
  });
  const handler = async (route: Route): Promise<void> => {
    const request = route.request();
    const body = request.method() === 'POST' ? (request.postDataBuffer()?.toString('utf8') ?? '') : '';
    if (!released && SOURCE_SEQUENCE_REQUEST.test(body)) {
      count++;
      await Promise.race([releasedPromise, new Promise((resolve) => setTimeout(resolve, maxHoldMs))]);
    }
    await route.fallback().catch(() => undefined);
  };
  await context.route(SOURCE_SEQUENCE_URL, handler);
  return {
    count: () => count,
    release: async () => {
      released = true;
      releaseHeld();
      await context.unroute(SOURCE_SEQUENCE_URL, handler);
    },
  };
}

/**
 * #1540: a Data Grid bound to a Baserow source shows its loading overlay in Preview until its rows arrive,
 * without the "an error occured while trying to show an overlay" console error.
 */
export async function assertGridLoadingOverlayWhileSourceLoadsThroughUi(page: Page): Promise<void> {
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

  const overlayErrors: string[] = [];
  page.on('console', (message) => {
    if (GRID_OVERLAY_ERROR.test(message.text())) overlayErrors.push(message.text());
  });
  const sourceRequests = await holdSourceRequests(page);

  try {
    await test.step('Open Preview while the Grid source is still loading', async () => {
      await openPreview(page, SEL.gridComponent);
      await expect
        .poll(() => sourceRequests.count(), { message: 'the viewer should request the Grid source', timeout: 30_000 })
        .toBeGreaterThan(0);
    });

    await test.step('Assert the Grid shows its loading overlay, not the no rows overlay', async () => {
      await expect(page.locator(GRID_LOADING_SPINNER).first(), 'the Grid should show its loading spinner while its source loads').toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator(GRID_NO_ROWS_OVERLAY).first(), 'the Grid should not claim it has no rows while its source loads').toBeHidden();
    });
  } finally {
    await sourceRequests.release();
  }

  await test.step('Release the source and assert the rows replace the loading overlay', async () => {
    for (const row of GRID_SOURCE_ROWS) {
      await visibleGridRow(page, row.Name);
    }
    await expect(page.locator(GRID_LOADING_SPINNER), 'the loading spinner should disappear once the rows are loaded').toHaveCount(0, {
      timeout: 15_000,
    });
    expect(overlayErrors, 'showing the Grid loading overlay should not log an error').toEqual([]);
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

    const headerMenus = page.locator(`${SEL.gridComponent}:visible .ag-header-cell .ag-header-cell-menu-button .ag-icon-filter`);
    await expect.poll(() => headerMenus.count(), {
      message: 'No-Code Grid should expose persistent filter menu icons for the configured source columns',
      timeout: 30_000,
    }).toBeGreaterThanOrEqual(GRID_SOURCE_COLUMNS.length);
    for (const column of GRID_SOURCE_COLUMNS) {
      const header = page.locator(`${SEL.gridComponent}:visible .ag-header-cell`).filter({ hasText: column }).first();
      await expect(
        header.locator('.ag-header-cell-menu-button .ag-icon-filter'),
        `Grid header ${column} filter menu icon should remain visible without hover`,
      ).toBeVisible({ timeout: 15_000 });
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
    await assertDataSourceFilterAndSortRemainUsableAfterSecondOpen(page);
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

/** #1403: an intentionally empty text expression remains an empty runtime filter value. */
export async function assertGridEmptyStringFilterThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the nullable Grid interactions fixture exists', async () => {
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

  await test.step('Configure an equality filter with an intentionally empty text expression', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.grid);
    await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.gridComponent);
    await configureGridBaserowSource(page, {
      workspace: FUNCTIONAL_SOURCE_WORKSPACE,
      database: FUNCTIONAL_SOURCE_DATABASE,
      table: GRID_INTERACTION_TABLE,
      expectedColumns: GRID_INTERACTION_COLUMNS,
    });
    await configureDataSourceFilterTextValue(page, {
      column: GRID_INTERACTION_NOTES,
      operator: 'equal',
      value: '',
    });
    await closeComponentConfig(page);
  });

  await test.step('Render only the row whose filtered value is empty', async () => {
    await openPreview(page, SEL.gridComponent);
    await expectGridVisibleRowsInOrder(page, ['functional_grid_002_visible_bravo']);
    for (const excluded of ['functional_grid_002_hidden_alpha', 'functional_grid_002_visible_charlie']) {
      await expect(
        page.locator(`${SEL.gridComponent}:visible .ag-center-cols-container .ag-row`).filter({ hasText: excluded }),
        `empty-string filter should exclude non-empty row ${excluded}`,
      ).toHaveCount(0, { timeout: 15_000 });
    }
  });
}

async function assertDataSourceFilterAndSortRemainUsableAfterSecondOpen(page: Page): Promise<void> {
  const editor = page.locator('c8oforms-datasourceeditor');
  const visibleInputValues = () =>
    editor
      .locator('input:visible')
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).filter(Boolean));

  await test.step('Open Filter twice and retain its configured field without an endless loader', async () => {
    await openDataSourceFilterPanel(page);
    await openDataSourceFilterPanel(page);
    await expect(editor.locator('ion-progress-bar:visible'), 'Filter should not enter an endless loading state').toHaveCount(0, {
      timeout: 10_000,
    });
    await expect
      .poll(visibleInputValues, {
        message: `Filter should retain configured field ${GRID_INTERACTION_STATUS} after a second open`,
        timeout: 15_000,
      })
      .toContain(GRID_INTERACTION_STATUS);
  });

  await test.step('Open Sort twice and retain its configured field', async () => {
    await openDataSourceSortPanel(page);
    await openDataSourceSortPanel(page);
    await expect(editor.locator('ion-progress-bar:visible'), 'Sort should not enter an endless loading state').toHaveCount(0, {
      timeout: 10_000,
    });
    await expect
      .poll(visibleInputValues, {
        message: `Sort should retain configured field ${GRID_INTERACTION_RANK} after a second open`,
        timeout: 15_000,
      })
      .toContain(GRID_INTERACTION_RANK);
  });
}

export async function assertGridJavaScriptFilterAwaitsAsyncValueThroughUi(page: Page): Promise<void> {
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

  await test.step('Configure a Grid filter with an asynchronous JavaScript value', async () => {
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
    await configureDataSourceFilterMonacoPaletteValue(page, {
      column: GRID_INTERACTION_STATUS,
      operator: 'equal',
      sourceSection: 'translation',
      sourceLabel: 'getBrowserLang',
      expectedCode: FILTER_SOURCE_JS_EXPECTED_CODE,
    });
    await replaceVisibleFilterMonacoCode(
      page,
      `(async ()=>{ return ${JSON.stringify(GRID_INTERACTION_VISIBLE_STATUS)}; })();`,
    );
    await closeComponentConfig(page);
  });

  await test.step('Verify the resolved filter value keeps only matching Grid rows', async () => {
    await openPreview(page, SEL.gridComponent);
    await expect(page.locator(`${SEL.gridComponent}:visible`).first(), 'viewer Data Grid should render').toBeVisible({
      timeout: 45_000,
    });
    await expect
      .poll(() => visibleGridMatchingRowNames(page, GRID_INTERACTION_EXPECTED_ORDER).then((names) => names.sort()), {
        message: 'asynchronous JavaScript filter should retain both matching rows regardless of source order',
        timeout: 45_000,
      })
      .toEqual([...GRID_INTERACTION_EXPECTED_ORDER].sort());
    await expect(
      page.locator(`${SEL.gridComponent}:visible .ag-center-cols-container .ag-row`).filter({
        hasText: GRID_INTERACTION_ROWS[0][GRID_INTERACTION_NAME],
      }),
      'the row whose status does not match the resolved JavaScript value should be filtered out',
    ).toHaveCount(0, { timeout: 15_000 });
  });
}

export async function assertGridMultipleRowSelectionCheckboxesThroughUi(page: Page): Promise<void> {
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

  await test.step('Configure the Grid to return multiple selected rows', async () => {
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
    await setGridReturnedValueToMultipleRowsThroughUi(page);
    await closeComponentConfig(page);
  });

  await test.step('Verify row-selection checkboxes use the Grid glyph and remain aligned', async () => {
    await openPreview(page, SEL.gridComponent);
    const grid = page.locator(`${SEL.gridComponent}:visible`).first();
    await expect(grid, 'viewer Data Grid should render').toBeVisible({ timeout: 45_000 });
    for (const row of GRID_SOURCE_ROWS) {
      await visibleGridRow(page, row.Name);
    }

    const rows = grid.locator('.ag-center-cols-container .ag-row');
    const checkboxes = rows.locator(GRID_SELECTION_CHECKBOX);
    await expect.poll(async () => (await checkboxes.count()) === (await rows.count()), {
      message: 'multiple-row selection should render one checkbox per visible row',
      timeout: 30_000,
    }).toBe(true);

    const checkboxLayout = await checkboxes.evaluateAll((elements) =>
      elements.map((element) => {
        const checkboxBox = (element as HTMLElement).getBoundingClientRect();
        const rowBox = (element.closest('.ag-row') as HTMLElement | null)?.getBoundingClientRect();
        return {
          beforeFontFamily: getComputedStyle(element, '::before').fontFamily,
          afterFontFamily: getComputedStyle(element, '::after').fontFamily,
          width: checkboxBox.width,
          centerOffset: rowBox
            ? Math.abs(checkboxBox.top + checkboxBox.height / 2 - (rowBox.top + rowBox.height / 2))
            : Number.POSITIVE_INFINITY,
        };
      }),
    );
    for (const [index, state] of checkboxLayout.entries()) {
      expect(state.beforeFontFamily, `row ${index + 1} checkbox ::before should use the AG Grid glyph font`).toContain(
        'agGridQuartz',
      );
      expect(state.afterFontFamily, `row ${index + 1} checkbox ::after should use the AG Grid glyph font`).toContain(
        'agGridQuartz',
      );
      expect(state.width, `row ${index + 1} checkbox should keep a readable width`).toBeGreaterThanOrEqual(14);
      expect(state.centerOffset, `row ${index + 1} checkbox should stay vertically centered`).toBeLessThanOrEqual(3);
    }

    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await expect(checkboxes.nth(0), 'first Grid row checkbox should become selected').toHaveClass(/ag-checked/);
    await expect(checkboxes.nth(1), 'second Grid row checkbox should become selected').toHaveClass(/ag-checked/);
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

  await test.step('Verify Chart filters expose columns outside the configured category/value roles', async () => {
    const filterFields = await dataSourceFilterFieldOptions(page);
    expect(filterFields, 'Chart filters should expose the unrendered category column').toContain(
      CHART_SOURCE_IGNORED_CATEGORY,
    );
    expect(filterFields, 'Chart filters should expose the unrendered value column').toContain(
      CHART_SOURCE_IGNORED_VALUE,
    );
    await page.keyboard.press('Escape');
    // The source actions (configure, filter, sort...) are the variable buttons listed beside the source editor, not
    // inside it; the first one (forms_config) brings the table configuration back after the Filter panel.
    const configuration = page
      .locator('c8oforms-button_variable.class1775996201003 button.class1775995541940:visible')
      .first();
    await expect(configuration, 'Chart source configuration action should remain available').toBeVisible({ timeout: 15_000 });
    await configuration.click();
    await expect(configuration, 'Chart source configuration action should be selected').toHaveClass(/figma-button--selected/, {
      timeout: 10_000,
    });
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

/** #1450: sourced Charts show an explicit loading state instead of demo labels. */
const CHART_SURFACE = '.apexcharts-canvas, apx-chart';

export async function assertChartLoadingStateThroughUi(page: Page): Promise<void> {
  await configureChartBaserowTableAndAssertPersistenceThroughUi(page);
  const sourceRequests = await holdSourceRequests(page);

  try {
    await test.step('Open Preview while the Chart source request is held', async () => {
      await openPreview(page, SEL.chartComponent);
      await expect
        .poll(() => sourceRequests.count(), {
          message: 'Chart Preview should issue a held formssource request',
          timeout: 30_000,
        })
        .toBeGreaterThan(0);
    });

    await test.step('Show loading feedback without demo labels or a premature chart', async () => {
      const chart = page.locator(`${SEL.chartComponent}:visible`).first();
      const loading = chart.locator('div:has(> ion-spinner[name="dots"])').first();
      await expect(loading, 'sourced Chart should display its loading indicator').toBeVisible({ timeout: 30_000 });
      await expect(loading.locator('span'), 'Chart loading indicator should include localized feedback').not.toHaveText(/^\s*$/);
      await expect(chart, 'runtime Chart must not expose editor demo labels while loading').not.toContainText('Label1');
      // Only the chart elements: the dots of the loading ion-spinner are SVGs too (in its shadow DOM).
      await expect(
        chart.locator(CHART_SURFACE),
        'Chart surface should stay hidden until sourced data is available',
      ).toHaveCount(0);
    });
  } finally {
    await sourceRequests.release();
  }

  await test.step('Replace loading feedback with the sourced Chart after release', async () => {
    const chart = page.locator(`${SEL.chartComponent}:visible`).first();
    await expect(chart.locator('div:has(> ion-spinner[name="dots"])'), 'Chart loading indicator should disappear').toHaveCount(0, {
      timeout: 45_000,
    });
    await expect(
      chart.locator(CHART_SURFACE).first(),
      'Chart surface should render after the source resolves',
    ).toBeVisible({ timeout: 45_000 });
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
    await ensureFunctionalSelectSourceTable();
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

export async function assertSourcedSelectMultipleDropdownStaysOpenThroughUi(page: Page): Promise<void> {
  const technicalId = `functional_sourced_select_multiple_${Date.now()}`;
  const labels = SELECT_SOURCE_ROWS.map((row) => row[SELECT_SOURCE_DISPLAY_COLUMN]);

  await test.step('Ensure the functional Select Baserow table exists', async () => {
    await ensureFunctionalSelectSourceTable();
  });

  await test.step('Create a sourced Select in multiple-selection mode', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'Select component should be present').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, technicalId);
    await configureFunctionalSelectBaserowSource(page);
    await setSelectSelectionMode(page, 'multiple');
    await closeComponentConfig(page);
  });

  await test.step('Choose two sourced values without closing the multiple dropdown', async () => {
    await openPreview(page, SEL.selectComponent);
    const select = page.locator(`#${technicalId}, ${SEL.selectComponent}:visible`).first();
    await expect(select, 'sourced multiple Select should render in Preview').toBeVisible({ timeout: 30_000 });
    const trigger = select.locator('ion-item.class1648542300891, button').first();
    await expect(trigger, 'sourced multiple Select trigger should be visible').toBeVisible({ timeout: 15_000 });
    await trigger.click({ timeout: 10_000 }).catch(async () => trigger.dispatchEvent('click'));

    const dropdown = page
      .locator('.class1599133954837:visible, cdk-virtual-scroll-viewport:visible')
      .filter({ hasText: labels[0] })
      .last();
    await expect(dropdown, 'sourced multiple Select dropdown should open').toBeVisible({ timeout: 30_000 });

    for (const label of labels.slice(0, 2)) {
      const option = dropdown.locator('ion-item').filter({ hasText: label }).first();
      await expect(option, `sourced Select option ${label} should be visible`).toBeVisible({ timeout: 15_000 });
      const checkbox = option.locator('ion-checkbox').first();
      await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
      await expect(dropdown, `dropdown should remain open after choosing ${label}`).toBeVisible({ timeout: 10_000 });
      await expect
        .poll(
          () =>
            checkbox.evaluate(
              (element) =>
                (element as HTMLElement & { checked?: boolean }).checked === true ||
                element.getAttribute('aria-checked') === 'true',
            ),
          { message: `sourced Select option ${label} should become checked`, timeout: 10_000 },
        )
        .toBe(true);
    }

    await page.locator('ion-content:visible').last().click({ position: { x: 5, y: 5 } });
    await expect(dropdown, 'sourced multiple Select dropdown should close only after an outside click').toBeHidden({
      timeout: 15_000,
    });
    for (const label of labels.slice(0, 2)) {
      await expect(trigger, `closed sourced Select should retain ${label}`).toContainText(label, { timeout: 15_000 });
    }
    expect(
      (await trigger.innerText()).replace(/\s+/g, ' ').trim(),
      'closed sourced Select should render the chosen labels without carriage-return whitespace',
    ).toContain(`${labels[0]}, ${labels[1]}`);
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

export async function assertSelectSourceFilterControlLayoutThroughUi(page: Page): Promise<void> {
  await test.step('Ensure the functional source Filter Baserow table exists', async () => {
    await ensureFunctionalFilterSourceTable();
  });

  await test.step('Create a Select source with a text filter', async () => {
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
  });

  await test.step('Verify Aa, JavaScript and delete controls share the fixed layout contract', async () => {
    const filter = page.locator('c8oforms-datasourceeditor c8oforms-filterbr:visible').last();
    await expect(filter, 'the configured Baserow filter row should remain visible').toBeVisible({ timeout: 15_000 });

    const textButton = filter.locator('ion-button:visible', {
      has: page.locator('ion-icon[name="text-outline"]'),
    }).last();
    const javaScriptButton = filter.locator('ion-button:visible', {
      has: page.locator('ion-icon[name="logo-javascript"]'),
    }).last();
    const deleteButton = filter.locator('ion-button.class1758189196135:visible').last();
    const controls = [
      { label: 'Aa', button: textButton },
      { label: 'JavaScript', button: javaScriptButton },
      { label: 'delete', button: deleteButton },
    ];

    for (const control of controls) {
      await expect(control.button, `${control.label} filter control should be visible`).toBeVisible({ timeout: 15_000 });
    }

    const layouts = await Promise.all(
      controls.map(async ({ label, button }) => ({
        label,
        layout: await button.evaluate((element) => {
          const host = element as HTMLElement;
          const icon = host.querySelector('ion-icon') as HTMLElement | null;
          const native = host.shadowRoot?.querySelector('[part="native"]') as HTMLElement | null;
          const container = host.parentElement;
          if (!icon || !native || !container) {
            return null;
          }

          const hostBox = host.getBoundingClientRect();
          const nativeBox = native.getBoundingClientRect();
          const iconBox = icon.getBoundingClientRect();
          const containerBox = container.getBoundingClientRect();
          const center = (box: DOMRect) => ({
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
          });
          const hostCenter = center(hostBox);
          const nativeCenter = center(nativeBox);
          const iconCenter = center(iconBox);

          return {
            hostWidth: hostBox.width,
            hostHeight: hostBox.height,
            nativeWidth: nativeBox.width,
            nativeHeight: nativeBox.height,
            iconWidth: iconBox.width,
            iconHeight: iconBox.height,
            iconNativeOffsetX: Math.abs(iconCenter.x - nativeCenter.x),
            iconNativeOffsetY: Math.abs(iconCenter.y - nativeCenter.y),
            hostCenterY: hostCenter.y,
            containerWidth: containerBox.width,
            containerHeight: containerBox.height,
            hostContainerOffsetX: Math.abs(hostCenter.x - center(containerBox).x),
            hostContainerOffsetY: Math.abs(hostCenter.y - center(containerBox).y),
          };
        }),
      })),
    );

    for (const { label, layout } of layouts) {
      expect(layout, `${label} filter control should expose its host, native part and icon`).not.toBeNull();
      expect(layout?.hostWidth, `${label} button width`).toBeCloseTo(32, 0);
      expect(layout?.hostHeight, `${label} button height`).toBeCloseTo(32, 0);
      expect(layout?.nativeWidth, `${label} native button width`).toBeCloseTo(32, 0);
      expect(layout?.nativeHeight, `${label} native button height`).toBeCloseTo(32, 0);
      expect(layout?.iconWidth, `${label} icon width`).toBeCloseTo(20, 0);
      expect(layout?.iconHeight, `${label} icon height`).toBeCloseTo(20, 0);
      expect(layout?.iconNativeOffsetX, `${label} icon should be horizontally centered`).toBeLessThanOrEqual(1);
      expect(layout?.iconNativeOffsetY, `${label} icon should be vertically centered`).toBeLessThanOrEqual(1);
    }

    const deleteLayout = layouts.find(({ label }) => label === 'delete')?.layout;
    expect(deleteLayout?.containerWidth, 'delete control container width').toBeCloseTo(32, 0);
    expect(deleteLayout?.containerHeight, 'delete control container height').toBeCloseTo(32, 0);
    expect(deleteLayout?.hostContainerOffsetX, 'delete button should be horizontally centered in its container').toBeLessThanOrEqual(1);
    expect(deleteLayout?.hostContainerOffsetY, 'delete button should be vertically centered in its container').toBeLessThanOrEqual(1);

    const centerLines = layouts.map(({ layout }) => layout?.hostCenterY ?? Number.POSITIVE_INFINITY);
    expect(
      Math.max(...centerLines) - Math.min(...centerLines),
      'Aa, JavaScript and delete buttons should stay on the same vertical center line',
    ).toBeLessThanOrEqual(1);
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

async function ensureFunctionalSelectSourceTable(): Promise<void> {
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

function sourcePickerNavigationEntry(picker: Locator, name: string): Locator {
  return picker.locator(SOURCE_PICKER_NAVIGATION_BUTTON).filter({ hasText: name }).first();
}

async function clickSourcePickerNavigationEntry(
  picker: Locator,
  name: string,
  level: 'workspace' | 'database',
): Promise<void> {
  const entry = sourcePickerNavigationEntry(picker, name);
  await expect(entry, `Baserow ${level} ${name} should be visible`).toBeVisible({ timeout: 60_000 });
  await entry.click({ timeout: 10_000 }).catch(async () => entry.dispatchEvent('click'));
}

/**
 * Replaces the whole code of the visible Filter Monaco editor, like replaceVisibleMonacoCode in studio.ts: the code
 * is typed on a single line, since Monaco auto-closes brackets and quotes and a typed new line leaves the auto-closed
 * tail behind (a code ending with an extra "})" that the Preview cannot run), and the editor must then hold exactly
 * that code.
 */
async function replaceVisibleFilterMonacoCode(page: Page, code: string): Promise<void> {
  expect(code, 'data source Filter code should fit on one line').not.toContain('\n');
  const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor:visible`).last();
  await expect(editor, 'data source Filter JavaScript editor should be visible').toBeVisible({ timeout: 15_000 });
  const editorCode = async () => (await editor.locator('.view-lines').innerText()).replace(/\s+/g, ' ').trim();
  await expect
    .poll(
      async () => {
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Delete');
        return editorCode();
      },
      { message: 'data source Filter JavaScript editor should be empty before typing', timeout: 10_000 },
    )
    .toBe('');
  await page.keyboard.type(code);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await expect
    .poll(editorCode, {
      message: 'data source Filter JavaScript editor should contain exactly the asynchronous code',
      timeout: 15_000,
    })
    .toBe(code.replace(/\s+/g, ' ').trim());
  await page.waitForTimeout(1_000);
}

async function setGridReturnedValueToMultipleRowsThroughUi(page: Page): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  const returnedValue = page.locator('.class1775842589999');
  const select = returnedValue.locator('ion-select').first();
  if (await select.isVisible({ timeout: 1_000 }).catch(() => false)) {
    const optionIndex = await select.evaluate((element) =>
      Array.from(element.querySelectorAll('ion-select-option')).findIndex(
        (option) => (option as HTMLOptionElement & { value?: string }).value === 'multiple_row_selected',
      ),
    );
    expect(optionIndex, 'multiple_row_selected option should exist').toBeGreaterThanOrEqual(0);
    await select.click({ timeout: 10_000 });
    const option = page.locator('ion-select-popover ion-item').nth(optionIndex);
    await expect(option, 'multiple-row selection option should be visible').toBeVisible({ timeout: 10_000 });
    await option.click({ timeout: 10_000 });
    await expect
      .poll(() => select.evaluate((element) => (element as HTMLElement & { value?: unknown }).value), {
        message: 'Grid returned value should be multiple_row_selected',
        timeout: 10_000,
      })
      .toBe('multiple_row_selected');
    return;
  }

  const returnedValueButtons = returnedValue.locator('button.class1776074264497:visible');
  const multipleRowsButton = returnedValueButtons.nth(3);
  await expect(multipleRowsButton, 'multiple-row returned-value button should be visible').toBeVisible({ timeout: 10_000 });
  await multipleRowsButton.click({ timeout: 10_000 });
  await expect
    .poll(() => multipleRowsButton.evaluate((element) => element.classList.contains('c8o-btn-selected')), {
      message: 'Grid returned value should be multiple selected rows',
      timeout: 10_000,
    })
    .toBe(true);
}

function gridSourceColumnRow(picker: Locator, column: string): Locator {
  return picker.locator(SELECT_SOURCE_COLUMN_ROW).filter({ hasText: column }).first();
}

async function gridColumnSummaryCounts(summary: Locator): Promise<number[]> {
  const text = await summary.innerText().catch(() => '');
  return [...text.matchAll(/\d+/g)].map((match) => Number(match[0]));
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

async function setGridEditorColumnWidthMode(page: Page, mode: 'fit' | 'scroll'): Promise<void> {
  await openGridFormattingTab(page);
  const buttons = page.locator('ion-col.class1656520466591:visible button.c8o-btn:visible');
  await expect(buttons, 'Grid Column width should expose fit and horizontal-scroll modes').toHaveCount(2, {
    timeout: 15_000,
  });
  const selected = buttons.nth(mode === 'fit' ? 0 : 1);
  await selected.click({ timeout: 10_000 }).catch(async () => selected.dispatchEvent('click'));
  await expect(selected, `Grid Column width ${mode} mode should be selected`).toHaveClass(/c8o-btn-selected/, {
    timeout: 15_000,
  });
}

async function gridEditorHorizontalGeometry(page: Page): Promise<{ clientWidth: number; scrollWidth: number }> {
  const viewport = page.locator(`${SEL.gridComponent}:visible .ag-center-cols-viewport`).first();
  await expect(viewport, 'Grid editor preview column viewport should be visible').toBeVisible({ timeout: 30_000 });
  return viewport.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
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
