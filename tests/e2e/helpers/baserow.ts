/**
 * Baserow fixtures — ensure-or-create, never assume.
 *
 * Same rule as forms: a test that needs a Baserow table must guarantee it exists
 * rather than depend on pre-existing data. This helper checks the catalog and
 * creates what's missing, through the Convertigo MCP HTTP endpoint (the same
 * tools used to author no-code data sources): `nocode-baserow-catalog-list` to
 * inspect, `nocode-baserow-schema-apply` to create.
 *
 * ⚠️ STATUS: SKELETON — not yet exercised end to end. It is blocked on server
 * setup, not on this code:
 *   - the target needs the global symbol `lib_baserow.apikey.secret` defined,
 *     else every lib_BaseRow call returns HTTP 500 (`undefined global symbols`);
 *   - the test user needs Baserow credentials, else the catalog returns
 *     `baserow_catalog_failed: no password found for the current user`.
 * Once both are fixed on the target, confirm the `schema-apply` argument shape
 * (marked TODO below) against a live call and drop this banner.
 *
 * Config (tests/.env):
 *   C8OFORMS_MCP_TOKEN  bearer token for the No Code Studio MCP (forms:write).
 *   C8OFORMS_MCP_URL    optional; defaults to <C8OFORMS_BASE_URL>/convertigo/api/mcp.
 */

type Json = Record<string, unknown>;

export interface BaserowCatalog {
  workspaces: Array<{ id?: number | string; name?: string }>;
  bases: Array<{ id?: number | string; name?: string; workspace?: string }>;
  tables: Array<{ id?: number | string; name?: string; base?: string }>;
  columns: Array<Json>;
}

export interface EnsureTableSpec {
  workspace: string;
  database: string;
  table: string;
  /** Column definitions, e.g. [{ name: 'Name', type: 'text' }, …]. */
  columns: Array<{ name: string; type: string }>;
  /** Optional seed rows, only applied when the table is created. */
  rows?: Array<Record<string, string | number | boolean | null>>;
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
 * Minimal JSON-RPC call to the Convertigo MCP streamable-HTTP endpoint:
 * initialize → notifications/initialized → tools/call, reusing the session id.
 * Responses may come back as plain JSON or as a single SSE `data:` line.
 */
async function callMcp(tool: string, args: Json): Promise<Json> {
  const url = mcpUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };

  const post = async (body: Json, sessionId?: string) => {
    const h = { ...headers };
    if (sessionId) h['mcp-session-id'] = sessionId;
    const res = await fetch(url, { method: 'POST', headers: h, body: JSON.stringify(body) });
    const sid = res.headers.get('mcp-session-id') ?? sessionId;
    const text = await res.text();
    // SSE frames look like "event: message\ndata: {…}\n\n" — grab the JSON.
    const m = text.match(/data:\s*(\{[\s\S]*\})\s*$/m);
    const payload = m ? m[1] : text;
    let json: Json = {};
    try {
      json = payload ? (JSON.parse(payload) as Json) : {};
    } catch {
      json = { _raw: text };
    }
    return { res, sid, json };
  };

  // 1) initialize
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

  // 2) initialized notification (best-effort; ignored if the server doesn't need it)
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId).catch(() => undefined);

  // 3) tools/call
  const out = await post(
    { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: tool, arguments: { token: mcpToken(), ...args } } },
    sessionId,
  );

  const result = (out.json.result ?? out.json) as Json;
  // MCP tool results usually wrap content; many Convertigo tools also return a
  // structuredContent / direct object. Return the most useful shape we find.
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
export async function baserowCatalog(): Promise<BaserowCatalog> {
  const r = (await callMcp('nocode-baserow-catalog-list', {})) as Partial<BaserowCatalog> & Json;
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
 * Ensure a Baserow table exists, creating workspace/base/table/columns only if
 * missing. Returns the catalog after the operation. Reuse this from any spec
 * that needs Baserow-backed data — do not assume the table is already there.
 */
export async function ensureBaserowTable(spec: EnsureTableSpec): Promise<BaserowCatalog> {
  const before = await baserowCatalog();
  const exists = before.tables.some(
    (t) => t.name === spec.table && (t.base === undefined || t.base === spec.database),
  );
  if (exists) return before;

  await callMcp('nocode-baserow-schema-apply', {
    mode: 'apply',
    readBack: true,
    create: {
      workspace: true,
      base: true,
      tables: true,
      fields: true,
      sampleRows: (spec.rows?.length ?? 0) > 0,
    },
    schema: {
      workspaceName: spec.workspace,
      baseName: spec.database,
      tables: [
        {
          name: spec.table,
          fields: spec.columns,
          sampleRows: spec.rows ?? [],
          upsertKey: spec.rows?.length ? spec.columns[0]?.name : undefined,
        },
      ],
    },
  });

  return baserowCatalog();
}
