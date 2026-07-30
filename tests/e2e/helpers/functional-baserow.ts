import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { c8oCall } from './studio';

type JsonRecord = Record<string, unknown>;
type BaserowRowData = Record<string, string | number | boolean | null>;

interface BaserowApiSession {
  apiBaseUrl: string;
  accessToken: string;
}

interface BaserowListedRow extends JsonRecord {
  id: number | string;
}

export async function replaceBaserowTableRows(
  page: Page,
  tableId: number | string | undefined,
  rows: BaserowRowData[],
): Promise<void> {
  await test.step('Replace functional Baserow table rows', async () => {
    const numericTableId = Number(tableId);
    expect(Number.isFinite(numericTableId), 'functional Baserow table id should be available for row replacement').toBe(true);

    const request = page.request;
    const session = await baserowApiSession(page);
    const headers = { Authorization: `JWT ${session.accessToken}` };
    const existingRows = await listBaserowRows(request, session.apiBaseUrl, numericTableId, headers);

    const rowsToPatch = Math.min(existingRows.length, rows.length);
    for (let index = 0; index < rowsToPatch; index += 1) {
      await patchBaserowRow(request, session.apiBaseUrl, numericTableId, existingRows[index].id, rows[index], headers);
    }

    for (let index = rows.length; index < existingRows.length; index += 1) {
      await deleteBaserowRow(request, session.apiBaseUrl, numericTableId, existingRows[index].id, headers);
    }

    for (let index = existingRows.length; index < rows.length; index += 1) {
      await createBaserowRow(request, session.apiBaseUrl, numericTableId, rows[index], headers);
    }

    const actualRows = await listBaserowRows(request, session.apiBaseUrl, numericTableId, headers);
    expect(projectRows(actualRows, rows), 'functional Baserow table rows should match the controlled fixture').toEqual(rows);
  });
}

async function baserowApiSession(page: Page): Promise<BaserowApiSession> {
  let token: string | null = null;
  let iframe: string | null = null;
  await expect
    .poll(
      async () => {
        const accountResponse = await c8oCall(page, 'BaserowAccount', {});
        const account = sequenceResult(accountResponse);
        token = stringField(account, 'token');
        iframe = stringField(account, 'iframe');
        return Boolean(token && iframe);
      },
      {
        message: 'C8Oforms.BaserowAccount should finish provisioning token/iframe',
        timeout: 60_000,
        intervals: [1_000, 2_000, 5_000, 10_000],
      },
    )
    .toBe(true);
  if (!token || !iframe) {
    throw new Error('C8Oforms.BaserowAccount did not return token/iframe after provisioning');
  }

  let jwtToken: string | null = null;
  await expect
    .poll(
      async () => {
        const checkLogin = await page.request.post(`${iframe!.replace(/\/+$/, '')}/.json`, {
          form: {
            __sequence: 'CheckLogin',
            token: token!,
          },
          timeout: 60_000,
        });
        if (!checkLogin.ok()) return false;
        const checkLoginJson = await checkLogin.json().catch(() => ({}));
        jwtToken = stringField(checkLoginJson as JsonRecord, 'jwt_token');
        return Boolean(jwtToken);
      },
      {
        message: 'Baserow CheckLogin should return jwt_token after account provisioning',
        timeout: 60_000,
        intervals: [1_000, 2_000, 5_000, 10_000],
      },
    )
    .toBe(true);
  if (!jwtToken) {
    throw new Error('Baserow CheckLogin did not return jwt_token after provisioning');
  }

  const apiBaseUrl = await baserowBackendUrl(page, iframe);
  return {
    apiBaseUrl,
    accessToken: await refreshBaserowAccessToken(page.request, apiBaseUrl, jwtToken),
  };
}

async function refreshBaserowAccessToken(request: APIRequestContext, apiBaseUrl: string, refreshToken: string): Promise<string> {
  const response = await request.post(`${apiBaseUrl}/api/user/token-refresh/`, {
    data: { refresh_token: refreshToken },
  });
  const json = await jsonResponse(response, 'Baserow token refresh');
  const accessToken =
    stringField(json, 'access_token') ??
    stringField(json, 'access') ??
    stringField(json, 'token') ??
    stringField(json, 'jwt_token');
  if (!accessToken) {
    throw new Error(`Baserow token refresh did not return an access token: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return accessToken;
}

async function baserowBackendUrl(page: Page, iframe: string): Promise<string> {
  const configured =
    process.env.C8OFORMS_BASEROW_API_URL?.trim() ??
    process.env.BASEROW_API_URL?.trim() ??
    '';
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  const origin = new URL(iframe).origin;
  const dashboard = await page.request.get(`${origin}/dashboard/`, { failOnStatusCode: false });
  if (dashboard.ok()) {
    const html = await dashboard.text();
    const match = html.match(/PUBLIC_BACKEND_URL:"([^"]+)"/);
    if (match?.[1]) {
      return match[1].replace(/\\u002F/g, '/').replace(/\/+$/, '');
    }
  }

  return 'https://baserow-backend.convertigo.net';
}

async function listBaserowRows(
  request: APIRequestContext,
  apiBaseUrl: string,
  tableId: number,
  headers: Record<string, string>,
): Promise<BaserowListedRow[]> {
  const rows: BaserowListedRow[] = [];
  let nextUrl: string | null = `${apiBaseUrl}/api/database/rows/table/${tableId}/?user_field_names=true&size=200`;

  for (let pageIndex = 0; nextUrl && pageIndex < 20; pageIndex += 1) {
    const response = await request.get(nextUrl, { headers });
    const payload = await jsonResponse(response, `Baserow list rows for table ${tableId}`);
    const results = Array.isArray(payload.results) ? payload.results : Array.isArray(payload) ? payload : [];
    for (const result of results) {
      if (isRecord(result) && (typeof result.id === 'number' || typeof result.id === 'string')) {
        rows.push(result as BaserowListedRow);
      }
    }
    nextUrl = typeof payload.next === 'string' && payload.next ? payload.next : null;
  }

  return rows;
}

async function patchBaserowRow(
  request: APIRequestContext,
  apiBaseUrl: string,
  tableId: number,
  rowId: number | string,
  row: BaserowRowData,
  headers: Record<string, string>,
): Promise<void> {
  const response = await request.patch(`${apiBaseUrl}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
    headers,
    data: row,
  });
  await jsonResponse(response, `Baserow patch row ${rowId} in table ${tableId}`);
}

async function createBaserowRow(
  request: APIRequestContext,
  apiBaseUrl: string,
  tableId: number,
  row: BaserowRowData,
  headers: Record<string, string>,
): Promise<void> {
  const response = await request.post(`${apiBaseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`, {
    headers,
    data: row,
  });
  await jsonResponse(response, `Baserow create row in table ${tableId}`);
}

async function deleteBaserowRow(
  request: APIRequestContext,
  apiBaseUrl: string,
  tableId: number,
  rowId: number | string,
  headers: Record<string, string>,
): Promise<void> {
  const response = await request.delete(`${apiBaseUrl}/api/database/rows/table/${tableId}/${rowId}/`, { headers });
  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`Baserow delete row ${rowId} in table ${tableId} failed: HTTP ${response.status()} ${text.slice(0, 500)}`);
  }
}

async function jsonResponse(response: { ok(): boolean; status(): number; text(): Promise<string> }, description: string): Promise<JsonRecord> {
  const text = await response.text();
  let json: JsonRecord = {};
  try {
    json = text ? (JSON.parse(text) as JsonRecord) : {};
  } catch {
    throw new Error(`${description} returned non-JSON: HTTP ${response.status()} ${text.slice(0, 500)}`);
  }
  if (!response.ok() || json.error) {
    throw new Error(`${description} failed: HTTP ${response.status()} ${JSON.stringify(json).slice(0, 500)}`);
  }
  return json;
}

function sequenceResult(json: JsonRecord): JsonRecord {
  const document = isRecord(json.document) ? json.document : null;
  const documentResult = document && isRecord(document.result) ? document.result : null;
  const rootResult = isRecord(json.result) ? json.result : null;
  return documentResult ?? rootResult ?? document ?? json;
}

function stringField(record: JsonRecord, field: string): string | null {
  const value = record[field];
  return typeof value === 'string' && value.trim() ? value : null;
}

function projectRows(actualRows: BaserowListedRow[], expectedRows: BaserowRowData[]): BaserowRowData[] {
  const fields = Object.keys(expectedRows[0] ?? {});
  return actualRows.map((row) => {
    const projected: BaserowRowData = {};
    for (const field of fields) {
      const value = row[field];
      projected[field] =
        typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null ? value : String(value ?? '');
    }
    return projected;
  });
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
