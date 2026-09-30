import { expect, test } from './fixtures';
import { deleteBaserowWorkspaces, ensureBaserowWorkspaceTable } from './helpers/functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  login,
  openComponentConfig,
  openGridBaserowTablePicker,
  searchAndSelectBaserowPickerEntry,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1254
 * Reported in 2.2.0-beta94. Fix 6d029486e binds the left picker search to
 * its model and clears it when selecting a workspace, database, or table; it
 * first shipped in 2.2.0-beta98. QA historically validated 2.2.0-beta101.
 * This latest-only test targets test-nocode running 2.2.0-beta371, without
 * deployment or a historical red phase. The form and Grid are authored only
 * through Studio; Baserow API calls only ensure/remove external test schemas.
 */
test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(300_000);

test('#1254 - Grid source search clears on each hierarchy selection', async ({ page }) => {
  const suffix = Date.now();
  const workspace = `Issue 1254 Workspace ${suffix}`;
  const otherWorkspace = `Issue 1254 Other Workspace ${suffix}`;
  const database = `Issue 1254 Database ${suffix}`;
  const otherDatabase = `Issue 1254 Other Database ${suffix}`;
  const table = `Issue 1254 Table ${suffix}`;
  const column = `Issue 1254 Column ${suffix}`;
  const workspaceIds: number[] = [];

  await login(page);
  try {
    await test.step('Ensure isolated Baserow workspace, database and table entries', async () => {
      const target = await ensureBaserowWorkspaceTable(page, {
        workspace,
        database,
        additionalDatabases: [otherDatabase],
        table,
        columns: [{ name: column, type: 'text' }],
      });
      workspaceIds.push(target.workspaceId);
      const other = await ensureBaserowWorkspaceTable(page, {
        workspace: otherWorkspace,
        database: `Issue 1254 Witness Database ${suffix}`,
        table: `Issue 1254 Witness Table ${suffix}`,
        columns: [{ name: 'Name', type: 'text' }],
      });
      workspaceIds.push(other.workspaceId);
    });

    await test.step('Create a Grid and open its source picker through Studio', async () => {
      await createBlankForm(page, `Issue 1254 Grid search ${suffix}`);
      await addComponent(page, PALETTE_ICON.grid);
      await expect(page.locator(SEL.gridComponent)).toHaveCount(1, { timeout: 30_000 });
      await openComponentConfig(page, SEL.gridComponent);
    });

    const picker = await openGridBaserowTablePicker(page);
    await test.step('Search for a workspace and verify its databases become accessible', async () => {
      await expect(picker.getByTitle(otherWorkspace, { exact: true })).toBeVisible({ timeout: 60_000 });
      await searchAndSelectBaserowPickerEntry(picker, workspace, otherWorkspace);
      await expect(picker.getByTitle(database, { exact: true })).toBeVisible({ timeout: 60_000 });
    });
    await test.step('Search for a database and verify its tables become accessible', async () => {
      await expect(picker.getByTitle(otherDatabase, { exact: true })).toBeVisible({ timeout: 60_000 });
      await searchAndSelectBaserowPickerEntry(picker, database, otherDatabase);
      await expect(picker.getByTitle(table, { exact: true })).toBeVisible({ timeout: 60_000 });
    });
    await test.step('Search for a table and verify its columns become accessible', async () => {
      await searchAndSelectBaserowPickerEntry(picker, table);
      await expect(picker.locator('.class1776267952308').filter({ hasText: column }).first()).toBeVisible({
        timeout: 60_000,
      });
    });
  } finally {
    await deleteBaserowWorkspaces(page, workspaceIds).catch(() => undefined);
  }
});
