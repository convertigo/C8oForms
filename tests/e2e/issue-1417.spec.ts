import { test, expect } from './fixtures';
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
  deleteOpenComponent,
  configureGridBaserowSource,
  publishCurrentFormWithPwa,
  openEditor,
  openPublishedViewer,
  getFormDocument,
  visibleDataGridRow,
  normalizedLocatorText,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1417
 * "BaseRow config validation should use the current form document instead of the editor form"
 *
 * Broken version: 2.2.0-beta221.
 * Fixed version: 2.2.0-beta222, by 42f79c53.
 * Root cause: published forms kept a BaseRow forms_config whose form_id pointed
 * at the editor/draft document. When the draft was later modified, the published
 * viewer still validated the BaseRow source against that changed draft and could
 * fail with a forms_config mismatch. The fix passes the current published form
 * id as forms_form_id when executing lib_BaseRow sources.
 *
 * The C8oForms fixture is built and mutated only through the Studio UI:
 * create blank form -> add Data Grid -> configure Baserow source A -> publish ->
 * reopen the draft -> delete the same Data Grid. The Baserow table is an
 * external ensure-created fixture, then selected through the UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const PUBLISHED_TABLE = 'Issue 1417 Published Source A';
const ROW_KEY = 'row_1417';
const PUBLISHED_MARKER = 'published_witness_1417';
const GRID_TECHNICAL_ID = 'baserow_published_grid_1417';
const EXPECTED_COLUMNS = ['Name', 'Marker'];

test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

test.setTimeout(300_000);

test('#1417 - published BaseRow grid validates against the published form after the draft changes', async ({ page }) => {
  await test.step('ensure the Baserow published source fixture', async () => {
    const publishedCatalog = await ensureIssue1417Table(PUBLISHED_TABLE, PUBLISHED_MARKER);
    assertIssue1417Table(publishedCatalog, PUBLISHED_TABLE);
  });

  await test.step('login', async () => {
    await login(page);
  });

  let formId = '';
  await test.step('create a draft form with a Data Grid bound to source A', async () => {
    formId = await createBlankForm(page, `Issue 1417 published source ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);
    await setTechnicalId(page, GRID_TECHNICAL_ID);
    await configureGridBaserowSource(page, sourceFor(PUBLISHED_TABLE));
    await closeComponentConfig(page);
  });

  await test.step('publish the form while the published version still points to source A', async () => {
    await publishCurrentFormWithPwa(page, 'authenticated');
    await expect
      .poll(
        async () => {
          const published = await getFormDocument(page, `published_${formId}`).catch(() => null);
          return published?._id ?? '';
        },
        {
          message: 'the published form document should exist after publishing through the UI',
          timeout: 60_000,
        },
      )
      .toBe(`published_${formId}`);
  });

  await test.step('reopen the draft and delete its Data Grid without republishing', async () => {
    await openEditor(page, formId);
    await expect(page.locator(SEL.gridComponent), 'the draft Data Grid should still be present').toHaveCount(1, {
      timeout: 60_000,
    });
    await openComponentConfig(page, SEL.gridComponent);
    await deleteOpenComponent(page);
    await expect(page.locator(SEL.gridComponent), 'the draft Data Grid should be deleted').toHaveCount(0, {
      timeout: 30_000,
    });
  });

  await test.step('open the published viewer and assert it still uses source A', async () => {
    await openPublishedViewer(page, formId, SEL.gridComponent);
    const row = await visibleDataGridRow(page, ROW_KEY);
    const rowText = await normalizedLocatorText(row);

    expect(rowText, 'the published viewer should keep the source A row after the draft changed').toContain(PUBLISHED_MARKER);
    await expect(page.locator('body'), 'the published viewer should not surface a BaseRow config mismatch').not.toContainText(
      /forms_config mismatch/i,
      { timeout: 5_000 },
    );
  });
});

function sourceFor(table: string) {
  return {
    workspace: WORKSPACE,
    database: BASE,
    table,
    expectedColumns: EXPECTED_COLUMNS,
  };
}

async function ensureIssue1417Table(table: string, marker: string): Promise<BaserowCatalog> {
  return ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      { name: 'Marker', type: 'text' },
    ],
    rows: [
      {
        Name: ROW_KEY,
        Marker: marker,
      },
    ],
    upsertKey: 'Name',
  });
}

function assertIssue1417Table(catalog: BaserowCatalog, tableName: string): void {
  const table = catalog.tables.find((candidate) => candidate.name === tableName);
  expect(table, `Baserow table ${tableName} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of EXPECTED_COLUMNS) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${tableName}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${tableName}.${columnName} should be a Text field`).toBe('text');
  }
}
