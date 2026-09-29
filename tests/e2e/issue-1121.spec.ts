import { expect, test } from './fixtures';
import { deleteBaserowWorkspaces, ensureBaserowWorkspaceTable } from './helpers/functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  expectBaserowDatabaseSeparatedByWorkspace,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Latest-only characterization for https://github.com/convertigo/C8oForms/issues/1121
 * "Separate databases name from baserow projects/workspaces".
 *
 * The former Baserow table picker rendered databases in one flat list, so two
 * workspaces containing the same database name were indistinguishable. The
 * modalConfigure redesign (notably 94f46b84 and 36e17493, first shipped in
 * 2.2.0-beta72 as part of #1077) introduced explicit workspace, database and
 * table steps and filters databases by workspace id. The ticket was requested
 * for testing in 2.2.0-beta110 and validated in 2.2.0-beta115.
 *
 * The C8oForms form and Grid are created only through the Studio UI. The
 * authenticated user's Baserow API is used solely to ensure the two external
 * schemas. This latest-only test was executed successfully on test-nocode
 * running 2.2.0-beta370. Per request, it has no deployment or historical red
 * phase.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(300_000);

test('#1121 — Baserow databases are separated by workspace', async ({ page }) => {
  const suffix = Date.now();
  const workspaceAlpha = `Issue 1121 Workspace Alpha ${suffix}`;
  const workspaceBeta = `Issue 1121 Workspace Beta ${suffix}`;
  const sharedDatabase = `Issue 1121 Shared Database ${suffix}`;
  const tableAlpha = `Issue 1121 Alpha Table ${suffix}`;
  const tableBeta = `Issue 1121 Beta Table ${suffix}`;
  const workspaceIds: number[] = [];

  await login(page);
  try {
    await test.step('Ensure two Baserow workspaces with the same database name', async () => {
      const alpha = await ensureBaserowWorkspaceTable(page, {
        workspace: workspaceAlpha,
        database: sharedDatabase,
        table: tableAlpha,
        columns: [{ name: 'Name', type: 'text' }],
      });
      workspaceIds.push(alpha.workspaceId);

      const beta = await ensureBaserowWorkspaceTable(page, {
        workspace: workspaceBeta,
        database: sharedDatabase,
        table: tableBeta,
        columns: [{ name: 'Name', type: 'text' }],
      });
      workspaceIds.push(beta.workspaceId);
    });

    await createBlankForm(page, `Issue 1121 workspace hierarchy ${suffix}`);
    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added through Studio').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);

    await expectBaserowDatabaseSeparatedByWorkspace(page, {
      workspaces: [workspaceAlpha, workspaceBeta],
      database: sharedDatabase,
      selectedWorkspace: workspaceAlpha,
      expectedTable: tableAlpha,
      otherWorkspaceTable: tableBeta,
    });
  } finally {
    await deleteBaserowWorkspaces(page, workspaceIds).catch(() => undefined);
  }
});
