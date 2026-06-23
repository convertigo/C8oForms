import type { Response } from '@playwright/test';
import { expect, test, type Page } from './fixtures';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureButtonFlowBaserowAddRow,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setCheckboxLocalOptions,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1396
 *
 * Found in 2.2.0-beta190. The Baserow Add Row sequences accepted Checkbox
 * values for a multiple_select field but did not normalize them to the Baserow
 * option-id format, so the row was created/updated while the multi-select cell
 * stayed empty. Fix 134391077d33c4f0305d216e162963d8a800df40 in
 * c8oprj-lib-baserow added normalizeMultipleSelectValue for forms_AddRow and
 * forms_AddRowFromData.
 *
 * The C8oForms form is built only through Studio UI. The external Baserow
 * table is ensure-created first, then selected through the button flow action
 * configuration UI. The final Baserow read only verifies the external result.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1396 Checkbox Multiple Select';
const NAME_COLUMN = 'Name';
const TAGS_COLUMN = 'Tags';
const OPTIONS = ['Alpha', 'Beta', 'Gamma'];
const SELECTED_OPTIONS = ['Alpha', 'Gamma'];
const TEXT_TECHNICAL_ID = 'row_name_1396';
const CHECKBOX_TECHNICAL_ID = 'tags_1396';
const BUTTON_TECHNICAL_ID = 'submit_1396';

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.setTimeout(240_000);

test('#1396 - Checkbox Add Row stores Baserow multiple select values', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: NAME_COLUMN,
    columns: [
      { name: NAME_COLUMN, type: 'text' },
      { name: TAGS_COLUMN, type: 'multiple_select', values: OPTIONS },
    ],
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1396 checkbox baserow ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.textInput);
  await openComponentConfig(page, SEL.textComponent);
  await setTechnicalId(page, TEXT_TECHNICAL_ID);
  await closeComponentConfig(page);

  await addComponent(page, PALETTE_ICON.checkbox);
  await openComponentConfig(page, SEL.checkboxComponent);
  await setTechnicalId(page, CHECKBOX_TECHNICAL_ID);
  await setCheckboxLocalOptions(page, OPTIONS);
  await closeComponentConfig(page);

  await addComponent(page, PALETTE_ICON.button);
  await openComponentConfig(page, SEL.buttonComponent);
  await setTechnicalId(page, BUTTON_TECHNICAL_ID);
  await closeComponentConfig(page);

  await configureButtonFlowBaserowAddRow(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: [NAME_COLUMN, TAGS_COLUMN],
    flowName: /Flow button/i,
    mappings: [
      { column: NAME_COLUMN, sourceLabel: TEXT_TECHNICAL_ID },
      { column: TAGS_COLUMN, sourceLabel: CHECKBOX_TECHNICAL_ID },
    ],
  });

  await openPreview(page, SEL.textComponent);
  const rowName = `row_1396_${Date.now()}`;
  await page.locator(`${SEL.textComponent} input`).first().fill(rowName);

  const checkbox = page.locator(SEL.checkboxComponent).first();
  for (const option of SELECTED_OPTIONS) {
    await checkbox.locator('ion-item').filter({ hasText: option }).first().click();
  }
  await installExecuteSequencesResponseCapture(page);
  const addRowResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/projects/C8Oforms/.json') &&
      (response.request().postData() ?? '').includes('APIV2_Execute_Sequences'),
    { timeout: 30_000 },
  );
  await page.locator(SEL.buttonComponent).getByRole('button').first().click();
  const addRowResponse = await addRowResponsePromise;
  const createdRow = await rowFromActionResponse(page, addRowResponse);

  expect(createdRow?.[NAME_COLUMN], 'the Text input value should be stored in the new Baserow row').toBe(rowName);
  const tags = multipleSelectValues(createdRow?.[TAGS_COLUMN]);
  expect(tags, 'the Checkbox values should be stored in the Baserow multiple_select column').toEqual(SELECTED_OPTIONS);
});

async function rowFromActionResponse(page: Page, response: Response): Promise<Record<string, unknown> | undefined> {
  expect(response.ok(), `Baserow Add Row action should answer 2xx, got HTTP ${response.status()}`).toBeTruthy();
  try {
    const json = (await response.json()) as Record<string, unknown>;
    return sequenceResult(json);
  } catch (error) {
    if (isFirefoxResponseBodyReadError(error)) {
      return sequenceResult(await capturedExecuteSequencesResponse(page));
    }
    throw error;
  }
}

async function installExecuteSequencesResponseCapture(page: Page): Promise<void> {
  await page.evaluate(() => {
    type CapturedResponse = { json?: Record<string, unknown>; text?: string; error?: string };
    type CaptureWindow = Window & {
      __c8o1396ExecuteSequences?: CapturedResponse[];
      __c8o1396CaptureInstalled?: boolean;
    };
    type CapturedXhr = XMLHttpRequest & { __c8o1396Url?: string };

    const captureWindow = window as CaptureWindow;
    captureWindow.__c8o1396ExecuteSequences = [];
    if (captureWindow.__c8o1396CaptureInstalled) return;
    captureWindow.__c8o1396CaptureInstalled = true;

    const recordText = (text: string) => {
      const captured: CapturedResponse = { text };
      try {
        captured.json = text ? JSON.parse(text) : {};
      } catch (error) {
        captured.error = String((error as Error | undefined)?.message ?? error);
      }
      captureWindow.__c8o1396ExecuteSequences?.push(captured);
    };

    const recordError = (error: unknown) => {
      captureWindow.__c8o1396ExecuteSequences?.push({
        error: String((error as Error | undefined)?.message ?? error),
      });
    };

    const bodyTargetsExecuteSequences = (body: unknown): boolean => {
      if (body instanceof FormData) {
        for (const [key, value] of body.entries()) {
          if (key === '__sequence' && String(value) === 'APIV2_Execute_Sequences') return true;
          if (String(value).includes('APIV2_Execute_Sequences')) return true;
        }
        return false;
      }
      if (body instanceof URLSearchParams) {
        return body.get('__sequence') === 'APIV2_Execute_Sequences' || body.toString().includes('APIV2_Execute_Sequences');
      }
      return String(body ?? '').includes('APIV2_Execute_Sequences');
    };

    const urlTargetsC8oForms = (url: unknown): boolean => String(url ?? '').includes('/projects/C8Oforms/.json');

    const originalFetch = captureWindow.fetch.bind(captureWindow);
    captureWindow.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      const url = input instanceof Request ? input.url : String(input);
      if (urlTargetsC8oForms(url) && bodyTargetsExecuteSequences(init?.body)) {
        response.clone().text().then(recordText).catch(recordError);
      }
      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function open(method: string, url: string | URL) {
      (this as CapturedXhr).__c8o1396Url = String(url);
      return (originalOpen as (...args: unknown[]) => void).apply(this, Array.from(arguments));
    } as typeof XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.send = function send(body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this as CapturedXhr;
      if (urlTargetsC8oForms(xhr.__c8o1396Url) && bodyTargetsExecuteSequences(body)) {
        xhr.addEventListener('load', () => recordText(xhr.responseText));
        xhr.addEventListener('error', () => recordError('XMLHttpRequest error while reading APIV2_Execute_Sequences'));
      }
      return (originalSend as (...args: unknown[]) => void).apply(this, Array.from(arguments));
    } as typeof XMLHttpRequest.prototype.send;
  });
}

async function capturedExecuteSequencesResponse(page: Page): Promise<Record<string, unknown>> {
  await page.waitForFunction(
    () => ((window as Window & { __c8o1396ExecuteSequences?: unknown[] }).__c8o1396ExecuteSequences ?? []).length > 0,
    undefined,
    { timeout: 10_000 },
  );
  const captured = await page.evaluate(() => {
    const responses = (window as Window & {
      __c8o1396ExecuteSequences?: Array<{ json?: Record<string, unknown>; text?: string; error?: string }>;
    }).__c8o1396ExecuteSequences ?? [];
    return responses.at(-1);
  });

  if (captured?.json) {
    return captured.json;
  }
  throw new Error(`Unable to read captured APIV2_Execute_Sequences response: ${captured?.error ?? captured?.text ?? 'empty capture'}`);
}

function isFirefoxResponseBodyReadError(error: unknown): boolean {
  return /Network\.getResponseBody|NS_ERROR_INVALID_CONTENT_ENCODING/i.test(String((error as Error | undefined)?.message ?? error));
}

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  if (!table) {
    console.warn(`Baserow catalog read-back did not include ${TABLE}; continuing because older C8oForms tags cannot always read back MCP-created Baserow fixtures.`);
    return;
  }

  const columns = (table?.columns ?? []) as Record<string, unknown>[];
  const nameColumn = columns.find((column) => column.name === NAME_COLUMN);
  const tagsColumn = columns.find((column) => column.name === TAGS_COLUMN);
  expect(nameColumn, `Baserow column ${NAME_COLUMN} should exist`).toBeTruthy();
  expect(nameColumn?.type, `Baserow column ${NAME_COLUMN} should be a Text field`).toBe('text');
  expect(tagsColumn, `Baserow column ${TAGS_COLUMN} should exist`).toBeTruthy();
  expect(tagsColumn?.type, `Baserow column ${TAGS_COLUMN} should be a Multiple select field`).toBe('multiple_select');
  expect(multipleSelectOptions(tagsColumn), `Baserow column ${TAGS_COLUMN} should expose the expected options`).toEqual(
    expect.arrayContaining(OPTIONS),
  );
}

function multipleSelectOptions(column: Record<string, unknown> | undefined): string[] {
  if (!column) return [];
  const rawOptions = [column.select_options, column.options, column.values].find(Array.isArray) as unknown[] | undefined;
  return (rawOptions ?? [])
    .map((option) => (typeof option === 'string' ? option : optionValue(option)))
    .filter((value): value is string => Boolean(value));
}

function multipleSelectValues(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return values
    .map((entry) => (typeof entry === 'string' ? entry : optionValue(entry)))
    .filter((entry): entry is string => Boolean(entry));
}

function optionValue(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  for (const key of ['value', 'name', 'label']) {
    if (typeof record[key] === 'string') return record[key] as string;
  }
  return undefined;
}

function sequenceResult(json: Record<string, unknown>): Record<string, unknown> | undefined {
  const document = json.document as Record<string, unknown> | undefined;
  return (
    (document?.result as Record<string, unknown> | undefined) ??
    (json.result as Record<string, unknown> | undefined) ??
    (json.response as Record<string, unknown> | undefined) ??
    document
  );
}
