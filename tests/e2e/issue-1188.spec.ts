import { expect, test } from './fixtures';
import { deleteBaserowWorkspaces, ensureBaserowWorkspaceTable } from './helpers/functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  configureGridBaserowSource,
  createBlankForm,
  expectGridBaserowColumnsOnReopen,
  login,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1188
 * "Missing Columns After Token Renewal in No Code Database Table".
 *
 * Reported on 2.1.11-beta5, lib_BaseRow 1.1.42-hotfix11 treated every access
 * token as expired after a fixed 58 seconds and then authenticated again. That
 * renewal path could make Baserow's fields endpoint return
 * ERROR_USER_NOT_IN_GROUP, leaving the table picker without columns. C8oForms
 * commit b3cc321b upgrades lib_BaseRow to 1.1.42-hotfix12, whose b38db1e8
 * reads the JWT expiry and uses the session refresh_token before falling back
 * to credentials. The fix first shipped in 2.2.0-beta108 and was historically
 * validated by QA in 2.2.0-beta115.
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta370, without deployment or a historical red phase. The form and
 * Data Grid are authored exclusively through Studio. The authenticated user's
 * Baserow API is used only to create and remove the isolated external schema.
 */

const FORMER_TOKEN_VALIDITY_MS = 58_000;

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(300_000);

test('#1188 — Baserow columns remain available beyond the former token-renewal boundary', async ({ page }) => {
  const suffix = Date.now();
  const workspace = `Issue 1188 Workspace ${suffix}`;
  const database = `Issue 1188 Database ${suffix}`;
  const table = `Issue 1188 Table ${suffix}`;
  const witnessColumn = `Renewed token column ${suffix}`;
  const workspaceIds: number[] = [];

  await login(page);
  try {
    const fixture = await ensureBaserowWorkspaceTable(page, {
      workspace,
      database,
      table,
      columns: [
        { name: 'Name', type: 'text' },
        { name: witnessColumn, type: 'text' },
      ],
    });
    workspaceIds.push(fixture.workspaceId);

    await test.step('Create a Data Grid and select the temporary Baserow table through Studio', async () => {
      await createBlankForm(page, `Issue 1188 token renewal ${suffix}`);
      await addComponent(page, PALETTE_ICON.grid, { allowEditorApiFallback: false });
      await expect(page.locator(SEL.gridComponent), 'the Data Grid should be added through Studio').toHaveCount(1, {
        timeout: 30_000,
      });
      await openComponentConfig(page, SEL.gridComponent);
      await setTechnicalId(page, `issue_1188_grid_${suffix}`);
      await configureGridBaserowSource(page, {
        workspace,
        database,
        table,
        expectedColumns: ['Name', witnessColumn],
      });
    });

    await test.step('Cross the obsolete fixed 58-second token-validity boundary', async () => {
      await page.waitForTimeout(FORMER_TOKEN_VALIDITY_MS + 7_000);
    });

    await expectGridBaserowColumnsOnReopen(page, {
      table,
      expectedColumns: ['Name', witnessColumn],
    });
  } finally {
    await deleteBaserowWorkspaces(page, workspaceIds).catch(() => undefined);
  }
});
