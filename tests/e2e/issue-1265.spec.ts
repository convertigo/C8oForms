import { expect, test } from './fixtures';
import { deleteBaserowWorkspaces, ensureBaserowWorkspaceTable } from './helpers/functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  baserowPickerSearchInput,
  createBlankForm,
  login,
  openComponentConfig,
  openGridBaserowTablePicker,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1265
 * Reported in 2.2.0-beta101 and still present in 2.2.0-beta104. Fix
 * 3022c2c88 removed the carriage-return hint from both Grid source picker
 * search placeholders in all locales, first shipped in 2.2.0-beta107. QA
 * historically validated 2.2.0-beta108. This latest-only test targets
 * test-nocode running 2.2.0-beta371, without deployment or a historical red
 * phase. The form and Grid are authored only through Studio; the Baserow API
 * ensures/removes external schemas, never a C8oForms form.
 */
test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(300_000);

test('#1265 - Grid source search placeholders match live filtering', async ({ page }) => {
  const suffix = Date.now();
  const workspace = `Issue 1265 Workspace ${suffix}`;
  const otherWorkspace = `Issue 1265 Other Workspace ${suffix}`;
  const database = `Issue 1265 Database ${suffix}`;
  const table = `Issue 1265 Table ${suffix}`;
  const targetColumn = `Issue 1265 Target ${suffix}`;
  const otherColumn = `Issue 1265 Other ${suffix}`;
  const workspaceIds: number[] = [];

  await login(page);
  try {
    await test.step('Ensure isolated Baserow workspace and column fixtures', async () => {
      const target = await ensureBaserowWorkspaceTable(page, {
        workspace,
        database,
        table,
        columns: [
          { name: targetColumn, type: 'text' },
          { name: otherColumn, type: 'text' },
        ],
      });
      workspaceIds.push(target.workspaceId);
      const witness = await ensureBaserowWorkspaceTable(page, {
        workspace: otherWorkspace,
        database: `Issue 1265 Witness Database ${suffix}`,
        table: `Issue 1265 Witness Table ${suffix}`,
        columns: [{ name: 'Name', type: 'text' }],
      });
      workspaceIds.push(witness.workspaceId);
    });

    await test.step('Create a Grid and open its source picker through Studio', async () => {
      await createBlankForm(page, `Issue 1265 Grid search ${suffix}`);
      await addComponent(page, PALETTE_ICON.grid);
      await expect(page.locator(SEL.gridComponent)).toHaveCount(1, { timeout: 30_000 });
      await openComponentConfig(page, SEL.gridComponent);
    });

    const picker = await openGridBaserowTablePicker(page);
    await test.step('Check navigation placeholder and live workspace filtering', async () => {
      const search = baserowPickerSearchInput(picker, 'navigation');
      await expect(search).toBeVisible({ timeout: 15_000 });
      const placeholder = await search.getAttribute('placeholder');
      expect(placeholder, 'navigation search should have a placeholder').toBeTruthy();
      expect(placeholder, 'live navigation search should not suggest pressing Enter').not.toContain('⏎');
      await expect(picker.getByTitle(otherWorkspace, { exact: true })).toBeVisible({ timeout: 60_000 });
      await search.fill(workspace);
      await expect(picker.getByTitle(workspace, { exact: true })).toBeVisible();
      await expect(picker.getByTitle(otherWorkspace, { exact: true })).toBeHidden();
      await picker.getByTitle(workspace, { exact: true }).click();
      await expect(picker.getByTitle(database, { exact: true })).toBeVisible({ timeout: 60_000 });
    });

    await test.step('Open a table and check column placeholder and live filtering', async () => {
      await picker.getByTitle(database, { exact: true }).click();
      await expect(picker.getByTitle(table, { exact: true })).toBeVisible({ timeout: 60_000 });
      await picker.getByTitle(table, { exact: true }).click();
      const rows = picker.locator('.class1776267952308');
      await expect(rows.filter({ hasText: targetColumn }).first()).toBeVisible({ timeout: 60_000 });
      await expect(rows.filter({ hasText: otherColumn }).first()).toBeVisible({ timeout: 60_000 });
      const search = baserowPickerSearchInput(picker, 'columns');
      await expect(search).toBeVisible({ timeout: 15_000 });
      const placeholder = await search.getAttribute('placeholder');
      expect(placeholder, 'column search should have a placeholder').toBeTruthy();
      expect(placeholder, 'live column search should not suggest pressing Enter').not.toContain('⏎');
      await search.fill(targetColumn);
      await expect(rows.filter({ hasText: targetColumn }).first()).toBeVisible();
      await expect(rows.filter({ hasText: otherColumn }).first()).toBeHidden();
    });
  } finally {
    await deleteBaserowWorkspaces(page, workspaceIds).catch(() => undefined);
  }
});
