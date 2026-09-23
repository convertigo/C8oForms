import { test, expect, Page } from './fixtures';
import { ensureBaserowTable } from './helpers/baserow';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  addHorizontalLayout,
  dragPaletteComponentInto,
  openComponentConfig,
  openLayoutChildEditorByComponent,
  setTechnicalId,
  closeComponentConfig,
  configureGridBaserowSource,
  acceptRgpdIfVisible,
  dragSourcePaletteEntryToTinyMce,
  selectTinyMcePathBadgeTreeValue,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1527
 * "Grid sources cannot be edited from the Palette when multiple Horizontal
 * Layout components are used."
 *
 * Found in 2.2.0-beta337. Root cause: after a value was chosen in the Grid
 * source tree, replaceTinyBadgeFromTreeview looked the badge up by its fakeId
 * class in the whole page. For a component nested in Horizontal layouts, the
 * canvas behind the editor renders a copy of the same badge: that copy was
 * replaced, and the editor kept the bare grid badge.
 */
const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1527 Grid Source';
const GRID_NAME = 'grid1527';
const COLUMN = 'Last name';
const INNER_LAYOUT = `${SEL.layoutViewer} ${SEL.layoutViewer}`;

test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.setTimeout(300_000);

test('#1527 - grid palette values stay editable in components nested in two Horizontal layouts', async ({ page }) => {
  await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      { name: COLUMN, type: 'text' },
    ],
    rows: [{ Name: 'row_1527', [COLUMN]: 'Doe' }],
    upsertKey: 'Name',
  });

  await login(page);
  await createBlankForm(page, `Issue 1527 ${Date.now()}`);
  await addBaserowGrid(page);

  await addHorizontalLayout(page);
  await dragPaletteComponentInto(page, PALETTE_ICON.layout, SEL.layoutViewer);
  await expect(page.locator(INNER_LAYOUT), 'a Horizontal layout should be nested in the first one').toHaveCount(1, {
    timeout: 15_000,
  });
  await dragPaletteComponentInto(page, PALETTE_ICON.description, INNER_LAYOUT);
  await dragPaletteComponentInto(page, PALETTE_ICON.textInput, INNER_LAYOUT);

  await test.step('Nested Description: pick a grid column through the palette value pencil', async () => {
    await openLayoutChildEditorByComponent(page, INNER_LAYOUT, SEL.descriptionComponent);
    await pickGridColumnInVisibleEditor(page);
    await closeComponentConfig(page);
  });

  await test.step('Nested Text input question: pick a grid column through the palette value pencil', async () => {
    await openLayoutChildEditorByComponent(page, INNER_LAYOUT, SEL.textComponent);
    await pickGridColumnInVisibleEditor(page);
  });
});

async function addBaserowGrid(page: Page): Promise<void> {
  await addComponent(page, PALETTE_ICON.grid);
  await page.locator(SEL.gridComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, SEL.gridComponent);
  await setTechnicalId(page, GRID_NAME);
  await acceptRgpdIfVisible(page);
  await configureGridBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: [COLUMN],
  });
  await closeComponentConfig(page);
}

async function pickGridColumnInVisibleEditor(page: Page): Promise<void> {
  await dragSourcePaletteEntryToTinyMce(page, 'page', GRID_NAME);
  // The bug: the tree closes, but the editor keeps the bare grid badge.
  await selectTinyMcePathBadgeTreeValue(page, COLUMN, `${GRID_NAME}.${COLUMN}`);
}
