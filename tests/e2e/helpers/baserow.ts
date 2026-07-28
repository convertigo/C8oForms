/**
 * Baserow fixtures - ensure-or-create, never assume.
 *
 * A test that needs a Baserow table must guarantee it exists rather than depend
 * on pre-existing data. This helper applies an idempotent schema through the
 * Convertigo MCP HTTP endpoint: existing workspace/base/table objects are reused,
 * missing fields are created, and sample rows are upserted when supported.
 *
 * Config (tests/.env):
 *   C8OFORMS_MCP_TOKEN  bearer token for the No Code Studio MCP (forms:write).
 *   C8OFORMS_MCP_URL    optional; defaults to <C8OFORMS_BASE_URL>/convertigo/api/mcp.
 */

import { execFileSync } from 'node:child_process';

type Json = Record<string, unknown>;

export interface BaserowCatalog {
  workspaces: Array<{ id?: number | string; name?: string }>;
  bases: Array<{ id?: number | string; name?: string; workspace?: string }>;
  tables: Array<{ id?: number | string; name?: string; base?: string; columns?: Json[] }>;
  columns: Array<Json>;
}

export interface BaserowCatalogOptions {
  includeColumns?: boolean;
  workspaceId?: number;
  databaseId?: number;
  tableId?: number;
}

export interface BaserowColumnSpec {
  name: string;
  type: string;
  baserowOptions?: Json;
  values?: Array<string | Json>;
  description?: string;
  required?: boolean;
}

export interface EnsureTableSpec {
  workspace: string;
  database: string;
  table: string;
  primaryField?: string;
  columns: BaserowColumnSpec[];
  /** Optional seed rows, upserted every time when supported by the MCP tool. */
  rows?: Array<Record<string, string | number | boolean | null>>;
  upsertKey?: string;
}

function mcpUrl(): string {
  if (process.env.C8OFORMS_MCP_URL) return process.env.C8OFORMS_MCP_URL;
  const base = (process.env.C8OFORMS_BASE_URL ?? 'https://test-repro.convertigo.net').replace(/\/+$/, '');
  return `${base}/convertigo/api/mcp`;
}

function mcpToken(): string {
  const t = process.env.C8OFORMS_MCP_TOKEN ?? process.env['greg-forms-codex'];
  if (!t) {
    throw new Error('C8OFORMS_MCP_TOKEN is not set - needed for Baserow fixtures (see tests/.env.example).');
  }
  return t;
}

/**
 * Mint an MCP token for the same configured worker account used by login().
 *
 * The provisioning script only understands C8OFORMS_TEST_USER_INDEX, while the
 * Playwright helpers also support TEST_PARALLEL_INDEX / TEST_WORKER_INDEX and
 * the legacy singular C8OFORMS_TEST_USER variables. Normalize those inputs here
 * so the browser session and Baserow fixture always belong to the same user.
 */
export function mintCurrentWorkerMcpToken(): string {
  const listedUsers = (process.env.C8OFORMS_TEST_USERS ?? process.env.TEST_NOCODE_E2E_USERS ?? '')
    .split(',')
    .map((user) => user.trim())
    .filter(Boolean);
  const singularUser = (process.env.C8OFORMS_TEST_USER ?? '').trim();
  const users = listedUsers.length > 0 ? listedUsers : singularUser ? [singularUser] : [];
  const oneBased = Number(process.env.C8OFORMS_TEST_USER_INDEX);
  const parallel = Number(process.env.TEST_PARALLEL_INDEX ?? process.env.TEST_WORKER_INDEX);
  const selectedIndex =
    Number.isInteger(oneBased) && oneBased > 0
      ? oneBased
      : Number.isInteger(parallel) && parallel >= 0
        ? parallel + 1
        : 1;
  const normalizedIndex = users.length > 0 ? ((selectedIndex - 1) % users.length) + 1 : selectedIndex;
  const env = {
    ...process.env,
    C8OFORMS_TEST_USER_INDEX: String(normalizedIndex),
    GITHUB_ENV: '',
  };
  if (listedUsers.length === 0 && singularUser) {
    env.C8OFORMS_TEST_USERS = singularUser;
    env.C8OFORMS_TEST_PASSWORD_1 = process.env.C8OFORMS_TEST_PASSWORD ?? singularUser;
  }

  const out = execFileSync('node', ['ci/ensure-test-users.mjs', '--emit-mcp-token'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env,
  });
  const match = out.match(/^C8OFORMS_MCP_TOKEN=(.+)$/m);
  if (!match) {
    throw new Error(`Could not mint an MCP token for worker index ${normalizedIndex}: ${out.slice(-400)}`);
  }
  return match[1].trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Per-request timeout for a single MCP HTTP call. Kept aligned with (and just
// under) the server-side responseTimeout on ConvertigoMCP.mcp_endpoint (300s) so
// a slow-but-progressing schema-apply (e.g. an 80-row upsert on a loaded engine)
// is given time to finish instead of being aborted client-side and retried into
// a still-busy engine. callMcp still retries on a genuine abort/transient error.
const MCP_REQUEST_TIMEOUT_MS = 180_000;

function isTransientMcpError(error: unknown): boolean {
  return /interrupted|did not terminate quickly enough|timed? ?out|temporarily|abort|ECONNRESET|EPIPE|HTTP 50[234]/i.test(
    String((error as Error | undefined)?.message ?? error),
  );
}

/**
 * Minimal JSON-RPC call to the Convertigo MCP streamable-HTTP endpoint:
 * initialize -> notifications/initialized -> tools/call, reusing the session id.
 * Responses may come back as plain JSON or as a single SSE `data:` line.
 */
async function callMcp(tool: string, args: Json, token?: string): Promise<Json> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await callMcpOnce(tool, args, token);
    } catch (error) {
      lastError = error;
      if (!isTransientMcpError(error) || attempt === 3) {
        throw error;
      }
      await sleep([2_000, 5_000, 10_000][attempt] ?? 10_000);
    }
  }
  throw lastError;
}

async function callMcpOnce(tool: string, args: Json, token?: string): Promise<Json> {
  const url = mcpUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };

  const post = async (body: Json, sessionId?: string) => {
    const h = { ...headers };
    if (sessionId) h['mcp-session-id'] = sessionId;
    const res = await fetch(url, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(MCP_REQUEST_TIMEOUT_MS),
    });
    const sid = res.headers.get('mcp-session-id') ?? sessionId;
    const contentType = res.headers.get('content-type') ?? 'unknown content-type';
    const text = await res.text();
    const m = text.match(/data:\s*(\{[\s\S]*\})\s*$/m);
    const payload = m ? m[1] : text;
    let json: Json = {};
    try {
      json = payload ? (JSON.parse(payload) as Json) : {};
    } catch {
      json = { _raw: text };
    }
    const method = String(body.method ?? 'request');
    if (!res.ok) {
      throw new Error(`MCP ${method} failed at ${url}: HTTP ${res.status} ${contentType} ${text.slice(0, 300)}`);
    }
    if (json._raw) {
      throw new Error(`MCP ${method} returned non-JSON at ${url}: ${contentType} ${text.slice(0, 300)}`);
    }
    if (json.error) {
      throw new Error(`MCP ${method} returned JSON-RPC error: ${JSON.stringify(json.error).slice(0, 500)}`);
    }
    return { res, sid, json };
  };

  const init = await post({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'c8oforms-e2e', version: '1.0.0' },
    },
  });
  const sessionId = init.sid ?? undefined;

  await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId).catch(() => undefined);

  const out = await post(
    { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: tool, arguments: { token: token ?? mcpToken(), ...args } } },
    sessionId,
  );

  const result = (out.json.result ?? out.json) as Json;
  if (result.isError) {
    const content = result.content as Array<Json> | undefined;
    const textNode = Array.isArray(content) ? (content.find((c) => (c as Json).type === 'text') as Json | undefined) : undefined;
    const message = textNode?.text ? String(textNode.text) : JSON.stringify(result);
    throw new Error(`MCP tool ${tool} failed: ${message.slice(0, 500)}`);
  }
  const structured = (result as Json).structuredContent;
  if (structured) return structured as Json;
  const content = (result as Json).content as Array<Json> | undefined;
  if (Array.isArray(content)) {
    const textNode = content.find((c) => (c as Json).type === 'text') as Json | undefined;
    if (textNode?.text) {
      try {
        return JSON.parse(String(textNode.text)) as Json;
      } catch {
        return { text: textNode.text };
      }
    }
  }
  return result;
}

/** Read the Baserow catalog (workspaces / bases / tables / columns). */
export async function baserowCatalog(options: BaserowCatalogOptions = {}, token?: string): Promise<BaserowCatalog> {
  const args: Json = {};
  if (options.includeColumns !== undefined) args.includeColumns = options.includeColumns;
  if (options.workspaceId !== undefined) args.workspaceId = options.workspaceId;
  if (options.databaseId !== undefined) args.databaseId = options.databaseId;
  if (options.tableId !== undefined) args.tableId = options.tableId;

  const r = (await callMcp('nocode-baserow-catalog-list', args, token)) as Partial<BaserowCatalog> & Json;
  if ((r as Json).status === 'error') {
    throw new Error(`baserow catalog failed: ${JSON.stringify((r as Json).error ?? r)}`);
  }
  return {
    workspaces: r.workspaces ?? [],
    bases: r.bases ?? [],
    tables: r.tables ?? [],
    columns: r.columns ?? [],
  };
}

/**
 * Ensure a Baserow table exists. The MCP tool is idempotent: existing objects
 * are reused, missing fields are created and sample rows are upserted (by
 * upsertKey). Returns a catalog read-back with columns so the caller can assert
 * fixture metadata.
 *
 * Rows are ALWAYS re-upserted when the spec defines any. We previously skipped
 * the re-upsert for large samples on tables that already had the expected
 * columns ("create if absent"), but that check could not see row count: a table
 * left partially seeded by an interrupted upsert (e.g. an MCP timeout after 64 of
 * 80 rows) was considered "seeded" forever and never topped up, so #1402 kept
 * reading a 64-row dropdown. The upsert is idempotent (no duplicates), so always
 * seeding self-heals such tables without changing complete ones.
 */
export async function ensureBaserowTable(spec: EnsureTableSpec, token?: string): Promise<BaserowCatalog> {
  const rowCount = spec.rows?.length ?? 0;
  const seedRows = rowCount > 0;

  const r = await callMcp('nocode-baserow-schema-apply', {
    mode: 'apply',
    readBack: true,
    create: {
      workspace: true,
      base: true,
      tables: true,
      fields: true,
      sampleRows: seedRows,
    },
    schema: {
      workspaceName: spec.workspace,
      baseName: spec.database,
      tables: [
        {
          name: spec.table,
          primaryField: spec.primaryField,
          fields: spec.columns,
          sampleRows: seedRows ? spec.rows ?? [] : [],
          upsertKey: seedRows ? spec.upsertKey ?? (spec.rows?.length ? spec.columns[0]?.name : undefined) : undefined,
        },
      ],
    },
  }, token);
  if ((r as Json).status === 'error') {
    throw new Error(`baserow schema apply failed: ${JSON.stringify((r as Json).error ?? r)}`);
  }

  const readBack = catalogFromSchemaReadBack(r);
  if (readBack?.tables.some((table) => table.name === spec.table)) {
    return readBack;
  }
  return baserowCatalog({ includeColumns: true }, token);
}

function catalogFromSchemaReadBack(response: Json): BaserowCatalog | null {
  const readBack = response.readBack as Json | undefined;
  const rawWorkspaces = Array.isArray(readBack?.workspaces) ? (readBack.workspaces as Json[]) : [];
  if (rawWorkspaces.length === 0) return null;

  const bases: BaserowCatalog['bases'] = [];
  const tables: BaserowCatalog['tables'] = [];
  const columns: Json[] = [];
  for (const workspace of rawWorkspaces) {
    const workspaceBases = Array.isArray(workspace.bases) ? (workspace.bases as Json[]) : [];
    for (const base of workspaceBases) {
      bases.push(base);
      const baseTables = Array.isArray(base.tables) ? (base.tables as Json[]) : [];
      for (const table of baseTables) {
        tables.push(table);
        if (Array.isArray(table.columns)) {
          columns.push(...(table.columns as Json[]));
        }
      }
    }
  }

  return {
    workspaces: rawWorkspaces,
    bases,
    tables,
    columns,
  };
}
