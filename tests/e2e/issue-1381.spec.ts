import { expect, test } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureGridBaserowSource,
  configureVisibilityEqualsField,
  createBlankForm,
  dragSourcePaletteEntryToTinyMceStrict,
  expectTinyMcePathBadge,
  login,
  openComponentConfig,
  openComponentVisibilityConfigBySelector,
  setGridReturnedValueToRowSelected,
  setTechnicalId,
  selectTinyMcePathBadgeTreeValue,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1381
 * "Visibility condition value picker does not save selected grid fields".
 *
 * Broken version: 2.2.0-beta167, inferred because the ticket has no Version
 * field and 58015524 first shipped in 2.2.0-beta168.
 * Fixed version: 58015524 first shipped in 2.2.0-beta168; the ticket was
 * validated OK in 2.2.0-beta178.
 * Root cause: the Visibility condition editor owns a nested TinyMCE instance.
 * Before the fix, selecting a field from a Grid path badge opened the treeview,
 * but the handler replaced the wrong/stale TinyMCE target, so the badge stayed
 * at grid1 instead of grid1.<column>. The fix routes TinyMCE helper calls through
 * the nested condition editor owner and replaces the live badge node.
 *
 * The C8oForms form is built only through Studio UI. The external Baserow table
 * is an idempotent MCP fixture, selected later through the Grid source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1381 Visibility Grid Field';
const GRID_ID = 'grid1';
const TEXT_ID = 'text_1381';
const DESCRIPTION_ID = 'desc_1381';
const COLUMN = 'Start1381';
const EXPECTED_PATH = `${GRID_ID}.${COLUMN}`;

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(420_000);

test('#1381 - Visibility value picker persists the selected Grid column', async ({ page }) => {
  await test.step('Ensure the Baserow Grid source fixture', async () => {
    const catalog = await ensureBaserowTable({
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      primaryField: 'Name',
      columns: [
        { name: 'Name', type: 'text' },
        { name: COLUMN, type: 'text' },
      ],
      rows: [{ Name: 'row_1381', [COLUMN]: 'Selected column value' }],
      upsertKey: 'Name',
    });
    assertBaserowFixture(catalog);
  });

  await test.step('Create a form with a Text input, a source Grid, and a Description', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1381 visibility grid field ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.textInput);
    await expect(page.locator(SEL.textComponent), 'the Text input component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, TEXT_ID);
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
      expectedColumns: [COLUMN],
    });
    await setGridReturnedValueToRowSelected(page);
    await closeComponentConfig(page);

    await addComponent(page, PALETTE_ICON.description);
    await expect(page.locator(SEL.descriptionComponent), 'the Description component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.descriptionComponent);
    await setTechnicalId(page, DESCRIPTION_ID);
    await closeComponentConfig(page);
  });

  await test.step('Select a Grid column from the Visibility value badge tree', async () => {
    await openComponentVisibilityConfigBySelector(page, SEL.descriptionComponent);
    await configureVisibilityEqualsField(page, TEXT_ID);
    await dragSourcePaletteEntryToTinyMceStrict(page, 'form', GRID_ID);
    await selectTinyMcePathBadgeTreeValue(page, COLUMN, EXPECTED_PATH);
  });

  await test.step('Reopen Visibility and assert the selected Grid column persisted', async () => {
    await closeComponentConfig(page);
    await openComponentVisibilityConfigBySelector(page, SEL.descriptionComponent);
    await expectTinyMcePathBadge(page, EXPECTED_PATH);
  });
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  if (catalog.workspaces.length === 0 && catalog.bases.length === 0 && catalog.tables.length === 0) {
    return;
  }

  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();

  const columns = table?.columns ?? [];
  for (const columnName of ['Name', COLUMN]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
}
