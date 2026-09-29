import { expect, test } from './fixtures';
import { deleteBaserowWorkspaces, ensureBaserowWorkspaceTable } from './helpers/functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectBaserowColumnsBesideScrolledDatabase,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Latest-only characterization for https://github.com/convertigo/C8oForms/issues/1123
 * "Make table data scrolled next to database".
 *
 * The former Baserow picker grew as one long page: selecting a database near
 * the bottom left its table-column details at the top, outside the viewport.
 * The modalConfigure redesign (notably 94f46b84 and 36e17493, first shipped in
 * 2.2.0-beta72 as part of #1077) introduced a fixed two-pane layout with an
 * independently scrollable navigation list and adjacent column details. The
 * ticket was requested for testing in 2.2.0-beta110 and validated in
 * 2.2.0-beta115.
 *
 * The C8oForms form and Grid are created only through the Studio UI. The
 * authenticated user's Baserow API is used solely to ensure and remove the
 * external scroll fixture. This latest-only test was executed successfully on
 * test-nocode running 2.2.0-beta370. Per request, it has no deployment or
 * historical red phase.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(300_000);

test('#1123 — table columns stay visible beside a scrolled database list', async ({ page }) => {
  const suffix = Date.now();
  const workspace = `Issue 1123 Workspace ${suffix}`;
  const targetDatabase = `Issue 1123 Database 99 ${suffix}`;
  const targetTable = `Issue 1123 Table ${suffix}`;
  const expectedColumn = `Visible column ${suffix}`;
  const fillerDatabases = Array.from(
    { length: 18 },
    (_, index) => `Issue 1123 Database ${String(index + 1).padStart(2, '0')} ${suffix}`,
  );
  const workspaceIds: number[] = [];

  await login(page);
  try {
    const fixture = await ensureBaserowWorkspaceTable(page, {
      workspace,
      database: targetDatabase,
      additionalDatabases: fillerDatabases,
      table: targetTable,
      columns: [
        { name: 'Name', type: 'text' },
        { name: expectedColumn, type: 'text' },
      ],
    });
    workspaceIds.push(fixture.workspaceId);

    await createBlankForm(page, `Issue 1123 scrolled database ${suffix}`);
    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added through Studio').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);

    await expectBaserowColumnsBesideScrolledDatabase(page, {
      workspace,
      database: targetDatabase,
      table: targetTable,
      expectedColumn,
    });
  } finally {
    await deleteBaserowWorkspaces(page, workspaceIds).catch(() => undefined);
  }
});
