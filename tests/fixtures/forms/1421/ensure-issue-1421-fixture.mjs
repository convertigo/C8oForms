import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = join(here, '..', '..', '..');
dotenv.config({ path: join(testsDir, '.env') });

const FIXTURE_TITLE = 'test ano 1421';
const FIXTURE_DIR = here;
const FULLSYNC_DB = 'c8oforms_fs';
const DRAFT_ID = '1670939636590';
const PUBLISHED_ID = `published_${DRAFT_ID}`;
const ANONYMOUS_ID = `${PUBLISHED_ID}_anonymous`;
const PWA_ID = `${PUBLISHED_ID}_pwa_document`;
const FIXTURE_FILES = [
  'legacy_forms_edition_1421.json',
  'legacy_forms_published_1421.json',
  'legacy_forms_published_anonymous_1421.json',
  'legacy_forms_pwa_document_1421.json',
];
const TEST_USER = process.env.C8OFORMS_TEST_USER ?? '';
const TEST_PASSWORD = process.env.C8OFORMS_TEST_PASSWORD ?? TEST_USER;
const SERVER = (process.env.C8O_SERVER || process.env.C8OFORMS_BASE_URL || 'https://test-repro.convertigo.net').replace(
  /\/+$/,
  '',
);
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = process.env.CONVERTIGO_ADMIN_PASSWORD ?? '';
let adminCookie = '';

function appBaseUrl() {
  const direct = process.env.C8OFORMS_APP_URL;
  if (direct) return direct.endsWith('/') ? direct : `${direct}/`;
  const server = (process.env.C8OFORMS_BASE_URL ?? 'https://test-repro.convertigo.net').replace(/\/+$/, '');
  return `${server}/convertigo/projects/C8Oforms/DisplayObjects/mobile/`;
}

async function withBrowser(callback) {
  const browser = await chromium.launch({
    headless: process.env.HEADED !== '1',
    slowMo: Number(process.env.C8OFORMS_SLOWMO ?? 0),
  });
  const context = await browser.newContext({
    baseURL: appBaseUrl(),
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  try {
    return await callback(page);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function firstVisible(pageOrLocator, selectors, description, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const locator = pageOrLocator.locator(selector);
      const count = await locator.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const item = locator.nth(i);
        if (await item.isVisible().catch(() => false)) {
          return item;
        }
      }
    }
    if ('waitForTimeout' in pageOrLocator) {
      await pageOrLocator.waitForTimeout(250);
    } else {
      await pageOrLocator.page().waitForTimeout(250);
    }
  }
  throw new Error(`No visible ${description} found (${selectors.join(', ')})`);
}

async function login(page) {
  if (!TEST_USER) {
    throw new Error('C8OFORMS_TEST_USER is not set in tests/.env');
  }
  await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const modernReveal = page.locator('.class1757337975297').first();
  if (await modernReveal.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false)) {
    await modernReveal.click();
    await firstVisible(page, ['.class1757337975207 input'], 'modern email input').then((input) => input.fill(TEST_USER));
    await firstVisible(page, ['.class1757337975249 input'], 'modern password input').then((input) =>
      input.fill(TEST_PASSWORD),
    );
    await modernReveal.click();
    await page.waitForURL('**/selector/**', { timeout: 60_000 });
    return;
  }

  const email = await firstVisible(
    page,
    ['ion-input#email input', '#email input', '.class1645091280680 input', 'input[type="email"]'],
    'legacy email input',
  );
  await email.fill(TEST_USER);
  const passwordVisible = await page
    .locator('ion-input#pass input, #pass input, .class1645091280752 input, input[type="password"]')
    .first()
    .isVisible()
    .catch(() => false);
  if (!passwordVisible) {
    await firstVisible(
      page,
      ['ion-button.class1645091280824', 'button.class1645091280824'],
      'legacy continue button',
    ).then((button) => button.click());
  }
  const password = await firstVisible(
    page,
    ['ion-input#pass input', '#pass input', '.class1645091280752 input', 'input[type="password"]'],
    'legacy password input',
  );
  await password.fill(TEST_PASSWORD);
  await firstVisible(
    page,
    ['ion-button.class1645091280806', 'button.class1645091280806'],
    'legacy submit button',
  ).then((button) => button.click());
  await page.waitForURL('**/selector/**', { timeout: 60_000 });
}

async function c8oCall(page, sequence, params) {
  return page.evaluate(
    async ({ sequenceName, sequenceParams }) => {
      const formData = new FormData();
      formData.append('__project', 'C8Oforms');
      formData.append('__sequence', sequenceName);
      for (const [key, value] of Object.entries(sequenceParams)) {
        if (value === undefined || value === null) continue;
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
      const response = await fetch(`${location.origin}/convertigo/projects/C8Oforms/.json`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const text = await response.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`C8o ${sequenceName} returned non-JSON: ${text.slice(0, 300)}`);
      }
      if (!response.ok || json.error) {
        throw new Error(`C8o ${sequenceName} failed: ${JSON.stringify(json).slice(0, 500)}`);
      }
      return json;
    },
    { sequenceName: sequence, sequenceParams: params },
  );
}

async function executeView(page, target, title) {
  const response = await c8oCall(page, 'APIV2_ExecuteView', {
    target,
    dynamicParams: JSON.stringify({
      query: title,
      tag: [],
      subTag: [],
      filters: {
        hide_apps_i_created: false,
        hide_folders: true,
        show_all_apps: false,
      },
    }),
  }).catch(() => null);
  return response?.res?.docs ?? [];
}

async function getFormDocument(page, id) {
  const response = await c8oCall(page, 'APIV2_getDocument', { id }).catch(() => null);
  return response?.res && typeof response.res === 'object' ? response.res : null;
}

async function getPwaDocument(page, publishedId) {
  const id = publishedId.startsWith('published_') ? publishedId : `published_${publishedId}`;
  const response = await c8oCall(page, 'APIV2_getPWA', { id: `${id}_pwa_document` }).catch(() => null);
  return response?.res?.pwa ?? null;
}

function anonymousKeyFromPwa(pwa) {
  if (typeof pwa?.anonymousKey === 'string' && pwa.anonymousKey) return pwa.anonymousKey;
  if (typeof pwa?.targetId === 'string' && pwa.targetId) return pwa.targetId;
  return '';
}

function isMissingConfigObject(doc) {
  return !!doc && !Object.prototype.hasOwnProperty.call(doc, 'config');
}

async function findLegacyFixture(page) {
  const docs = [
    { _id: PUBLISHED_ID, name: FIXTURE_TITLE },
    ...(await executeView(page, 'formsV2/search', FIXTURE_TITLE)),
    ...(await executeView(page, 'published_formsV2/search', FIXTURE_TITLE)),
  ];
  const seen = new Set();
  for (const doc of docs) {
    if (!doc || doc.name !== FIXTURE_TITLE || !doc._id || seen.has(doc._id)) continue;
    seen.add(doc._id);
    const publishedId = String(doc._id).startsWith('published_') ? String(doc._id) : `published_${doc._id}`;
    const draftId = publishedId.replace(/^published_/, '');
    const anonymousId = `${publishedId}_anonymous`;
    const [pwa, anonymousDocument] = await Promise.all([
      getPwaDocument(page, publishedId),
      getFormDocument(page, anonymousId),
    ]);
    const anonymousKey = anonymousKeyFromPwa(pwa);
    if (anonymousKey && anonymousDocument?.name === FIXTURE_TITLE && isMissingConfigObject(anonymousDocument)) {
      return { draftId, publishedId, anonymousId, anonymousKey, anonymousDocument };
    }
  }
  return null;
}

async function adminEngine(path, form) {
  const body = new URLSearchParams(form).toString();
  const response = await fetch(`${SERVER}/convertigo/admin/services/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(adminCookie ? { Cookie: adminCookie } : {}),
    },
    body,
    redirect: 'follow',
  });
  const setCookie = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : response.headers.get('set-cookie')
      ? [response.headers.get('set-cookie')]
      : [];
  if (setCookie.length) {
    adminCookie = setCookie.map((cookie) => cookie.split(';')[0]).join('; ');
  }
  return { response, text: await response.text() };
}

async function adminLogin() {
  if (!ADMIN_PASSWORD) {
    throw new Error('CONVERTIGO_ADMIN_PASSWORD is not set in tests/.env');
  }
  const { response, text } = await adminEngine('engine.Authenticate', {
    authType: 'login',
    authUserName: ADMIN_USER,
    authPassword: ADMIN_PASSWORD,
  });
  if (!response.ok || /<error/i.test(text)) {
    throw new Error('Convertigo admin authentication failed');
  }
}

async function fullSyncRequest(path, options = {}) {
  const response = await fetch(`${SERVER}/convertigo/fullsync/${FULLSYNC_DB}/${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.headers ?? {}),
      ...(adminCookie ? { Cookie: adminCookie } : {}),
    },
    body: options.body,
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    text,
    json,
  };
}

async function getFullSyncDocument(id) {
  const response = await fullSyncRequest(encodeURIComponent(id));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Could not read ${id} from ${FULLSYNC_DB}: ${response.status} ${response.text.slice(0, 300)}`);
  }
  return response.json;
}

async function putFullSyncDocument(document) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const existing = await getFullSyncDocument(document._id);
    const payload = { ...document };
    if (existing?._rev) {
      payload._rev = existing._rev;
    }
    const response = await fullSyncRequest(encodeURIComponent(document._id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { id: document._id, rev: response.json?.rev, updated: !!existing };
    if (response.status === 409 && attempt === 0) continue;
    throw new Error(`Could not write ${document._id} to ${FULLSYNC_DB}: ${response.status} ${response.text.slice(0, 500)}`);
  }
  throw new Error(`Could not write ${document._id} to ${FULLSYNC_DB}: conflicted twice`);
}

async function loadFixtureDocuments() {
  const docs = [];
  for (const file of FIXTURE_FILES) {
    const raw = await readFile(join(FIXTURE_DIR, file), 'utf8');
    const parsed = JSON.parse(raw);
    docs.push(prepareDocument(parsed));
  }
  validateFixtureDocuments(docs);
  return docs;
}

function prepareDocument(document) {
  const prepared = replaceLegacyUser(document);
  delete prepared._rev;
  delete prepared._attachments;

  if (prepared._id === PWA_ID && !prepared.anonymousKey && typeof prepared.targetId === 'string') {
    prepared.anonymousKey = prepared.targetId;
  }
  return prepared;
}

function replaceLegacyUser(value) {
  if (typeof value === 'string') {
    return value === 'user@example.com' ? TEST_USER : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceLegacyUser(item));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        const preparedKey = key === 'C8Oreserved_user@example.com' ? `C8Oreserved_${TEST_USER}` : key;
        return [preparedKey, replaceLegacyUser(item)];
      }),
    );
  }
  return value;
}

function validateFixtureDocuments(docs) {
  const byId = new Map(docs.map((doc) => [doc._id, doc]));
  for (const id of [DRAFT_ID, PUBLISHED_ID, ANONYMOUS_ID, PWA_ID]) {
    if (!byId.has(id)) {
      throw new Error(`Missing #1421 fixture document ${id}`);
    }
  }
  for (const doc of docs) {
    if (doc.name !== FIXTURE_TITLE) {
      throw new Error(`Fixture document ${doc._id} has unexpected name "${doc.name}", expected "${FIXTURE_TITLE}"`);
    }
  }
  const anonymousDocument = byId.get(ANONYMOUS_ID);
  if (!isMissingConfigObject(anonymousDocument)) {
    throw new Error(`${ANONYMOUS_ID} must not contain a top-level config property`);
  }
  const pwa = byId.get(PWA_ID);
  if (!anonymousKeyFromPwa(pwa)) {
    throw new Error(`${PWA_ID} must contain targetId or anonymousKey`);
  }
}

async function seedFixture() {
  await adminLogin();
  const docs = await loadFixtureDocuments();
  const results = [];
  for (const doc of docs) {
    results.push(await putFullSyncDocument(doc));
  }
  return results;
}

async function waitForFixture(page) {
  const deadline = Date.now() + 60_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const fixture = await findLegacyFixture(page);
      if (fixture) return fixture;
    } catch (error) {
      lastError = error;
    }
    await page.waitForTimeout(1_000);
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error(`Could not find the seeded #1421 fixture "${FIXTURE_TITLE}"`);
}

async function main() {
  await withBrowser(async (page) => {
    await login(page);
    const existing = await findLegacyFixture(page);
    if (existing) {
      console.log(`issue-1421 fixture already exists: ${existing.anonymousId}`);
      return;
    }

    const results = await seedFixture();
    for (const result of results) {
      console.log(`${result.updated ? 'updated' : 'inserted'} ${result.id}`);
    }
    const fixture = await waitForFixture(page);
    console.log(`issue-1421 fixture ready: ${fixture.anonymousId}`);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
