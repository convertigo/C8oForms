import { test, expect, type Browser } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { ensureBaserowTable } from './helpers/baserow';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  setTechnicalId,
  closeComponentConfig,
  configureGridBaserowSource,
  credentialsForUserIndex,
  TEST_USERS,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1423
 *
 * Broken on lib_BaseRow 1.1.42-hotfix24 and earlier; fixed by scoping the
 * table_id cache per user (lib_BaseRow js/common.js getUserScope()).
 *
 * Root cause / observed mechanism: lib_BaseRow resolveTableId() caches
 * "application~>database~>table" name tuples -> Baserow ids in a PROJECT-scoped
 * map keyed by the name tuple only. Baserow workspaces are per-user, so two
 * users with identically-named workspace/base/table have different ids. The
 * first user to resolve a name caches THEIR id; the second user then receives
 * the first user's id and the column picker shows that other user's table
 * (wrong columns) or an empty field list. The fix prefixes the cache key with
 * the authenticated Baserow user.
 *
 * The bug is intrinsically cross-user, so this spec drives TWO distinct
 * accounts: each ensures a same-named Baserow table that contains a column
 * unique to that user, then selects it through the Studio source picker and
 * asserts the picker resolves ITS OWN table (its own marker column). On the
 * buggy version the second user's picker resolves the first user's table and
 * the marker assertion fails.
 *
 * The C8oForms form is built only through the Studio UI. The external Baserow
 * tables are idempotent MCP fixtures created with each user's own MCP token.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
// Identical table name for both users — this is the collision surface.
const TABLE = 'Issue 1423 Cross User Cache Probe';

interface UserProbe {
  oneBasedIndex: number;
  marker: string;
}

const PROBES: UserProbe[] = [
  { oneBasedIndex: 1, marker: 'Owner Alpha 1423' },
  { oneBasedIndex: 2, marker: 'Owner Bravo 1423' },
];

// Mint an MCP token for a specific configured user by reusing the proven CI
// provisioning script. Without GITHUB_ENV it prints `C8OFORMS_MCP_TOKEN=...`.
function mintMcpToken(oneBasedIndex: number): string {
  const out = execFileSync('node', ['ci/ensure-test-users.mjs', '--emit-mcp-token'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, C8OFORMS_TEST_USER_INDEX: String(oneBasedIndex), GITHUB_ENV: '' },
  });
  const match = out.match(/^C8OFORMS_MCP_TOKEN=(.+)$/m);
  if (!match) {
    throw new Error(`Could not mint an MCP token for user index ${oneBasedIndex}: ${out.slice(-400)}`);
  }
  return match[1].trim();
}

async function selectTableInPicker(browser: Browser, probe: UserProbe): Promise<void> {
  const credentials = credentialsForUserIndex(probe.oneBasedIndex - 1);
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  try {
    const page = await context.newPage();
    await login(page, credentials);
    await createBlankForm(page, `Issue 1423 cross-user ${probe.marker} ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.grid);
    await expect(page.locator(SEL.gridComponent), 'the Data Grid component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.gridComponent);
    await setTechnicalId(page, `cross_user_grid_1423_${probe.oneBasedIndex}`);

    // configureGridBaserowSource asserts each expectedColumn is selectable in the
    // picker. With the cross-user cache bug, this user resolves the OTHER user's
    // table by name and its own marker column never appears -> this fails.
    await configureGridBaserowSource(page, {
      workspace: WORKSPACE,
      database: BASE,
      table: TABLE,
      expectedColumns: [probe.marker],
    });
    await closeComponentConfig(page);
  } finally {
    await context.close();
  }
}

test.setTimeout(240_000);

test('#1423 - Baserow source picker resolves the current user table, not another user table', async ({ browser }) => {
  test.skip(TEST_USERS.length < 2, 'Cross-user isolation needs at least two configured C8OFORMS_TEST_USERS.');

  // 1. Each user ensures a same-named table holding a column unique to that user.
  for (const probe of PROBES) {
    const token = mintMcpToken(probe.oneBasedIndex);
    const catalog = await ensureBaserowTable(
      {
        workspace: WORKSPACE,
        database: BASE,
        table: TABLE,
        primaryField: 'Name',
        columns: [
          { name: 'Name', type: 'text' },
          { name: probe.marker, type: 'text' },
        ],
        rows: [{ Name: `row_1423_${probe.oneBasedIndex}`, [probe.marker]: 'present' }],
        upsertKey: 'Name',
      },
      token,
    );
    const table = catalog.tables.find((candidate) => candidate.name === TABLE);
    expect(table, `Baserow table ${TABLE} should exist for user ${probe.oneBasedIndex}`).toBeTruthy();
    const columns = table?.columns ?? [];
    expect(
      columns.some((candidate) => candidate.name === probe.marker),
      `user ${probe.oneBasedIndex} fixture should expose its marker column ${probe.marker}`,
    ).toBeTruthy();
  }

  // 2. Each user opens the picker for that same-named table and must resolve its
  //    OWN table. Run sequentially so the first resolution populates the shared
  //    cache before the second user resolves the same name.
  for (const probe of PROBES) {
    await selectTableInPicker(browser, probe);
  }
});
