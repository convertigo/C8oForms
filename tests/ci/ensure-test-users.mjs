#!/usr/bin/env node

import { appendFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const DEFAULT_USERS = [
  'testuser-convertigo@yopmail.com',
];

const FULLSYNC_USER_DB = 'lib_usermanager_fullsync';
const FORMS_DB = 'c8oforms_fs';
const REQUIRED_TEST_USER_LANGUAGE = 'fr';
const REQUIRED_TEST_USER_RIGHTS = {
  editing_rights: true,
  nocode_db_rights: true,
  formulas: true,
  publication: true,
};

let adminCookie = '';

function hasFlag(name) {
  return process.argv.includes(name);
}

function die(message) {
  console.error(message);
  process.exit(1);
}

function normalizeConvertigoEndpoint(raw) {
  if (!raw) {
    die('TEST_NOCODE_ENDPOINT or C8O_SERVER must be set');
  }
  const endpoint = raw.replace(/\/+$/, '');
  return endpoint.endsWith('/convertigo') ? endpoint : `${endpoint}/convertigo`;
}

function testUsers() {
  const raw = process.env.C8OFORMS_TEST_USERS || process.env.TEST_NOCODE_E2E_USERS || '';
  const users = raw
    .split(',')
    .map((user) => user.trim())
    .filter(Boolean);
  return users.length > 0 ? users : DEFAULT_USERS;
}

function passwordFor(user, index) {
  return process.env[`C8OFORMS_TEST_PASSWORD_${index + 1}`] || user;
}

function displayNameFor(user) {
  return user.split('@')[0];
}

function oneBasedIndex(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed - 1 : null;
}

function selectedUserIndex(users) {
  const explicit = oneBasedIndex(process.env.C8OFORMS_TEST_USER_INDEX);
  return explicit === null ? 0 : explicit % users.length;
}

function collectSetCookies(response) {
  if (response.headers.getSetCookie) {
    return response.headers.getSetCookie();
  }
  const cookie = response.headers.get('set-cookie');
  return cookie ? [cookie] : [];
}

function mergeCookies(cookieHeader, setCookies) {
  const jar = new Map();
  for (const part of (cookieHeader || '').split(/;\s*/)) {
    if (!part) continue;
    const [name, ...valueParts] = part.split('=');
    if (name && valueParts.length > 0) jar.set(name, valueParts.join('='));
  }
  for (const cookie of setCookies) {
    const first = cookie.split(';')[0];
    const [name, ...valueParts] = first.split('=');
    if (name && valueParts.length > 0) jar.set(name, valueParts.join('='));
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function adminService(endpoint, path, form) {
  const response = await fetch(`${endpoint}/admin/services/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(adminCookie ? { Cookie: adminCookie } : {}),
    },
    body: new URLSearchParams(form).toString(),
    redirect: 'follow',
  });
  const setCookie = collectSetCookies(response);
  if (setCookie.length > 0) {
    adminCookie = setCookie.map((cookie) => cookie.split(';')[0]).join('; ');
  }
  return { response, text: await response.text() };
}

async function adminLogin(endpoint) {
  const adminUser = process.env.CONVERTIGO_ADMIN_USER || process.env.TEST_NOCODE_USER || 'admin';
  const adminPassword = process.env.CONVERTIGO_ADMIN_PASSWORD || process.env.TEST_NOCODE_PASSWORD || '';
  if (!adminPassword) {
    die('CONVERTIGO_ADMIN_PASSWORD or TEST_NOCODE_PASSWORD must be set');
  }
  const { response, text } = await adminService(endpoint, 'engine.Authenticate', {
    authType: 'login',
    authUserName: adminUser,
    authPassword: adminPassword,
  });
  if (!response.ok || /<error/i.test(text)) {
    die(`Convertigo admin authentication failed for ${adminUser}`);
  }
}

async function fullSyncRequest(endpoint, db, id, options = {}) {
  const response = await fetch(`${endpoint}/fullsync/${db}/${encodeURIComponent(id)}`, {
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
  return { response, text, json };
}

async function c8oSequence(endpoint, sequence, params) {
  const response = await fetch(`${endpoint}/projects/C8Oforms/.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(adminCookie ? { Cookie: adminCookie } : {}),
    },
    body: new URLSearchParams({
      __sequence: sequence,
      ...params,
    }).toString(),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!response.ok || json?.error || json?.document?.error || /<error/i.test(text)) {
    throw new Error(`C8Oforms.${sequence} failed: ${response.status} ${text.slice(0, 500)}`);
  }
  return { response, text, json };
}

async function c8oSessionSequence(endpoint, sequence, params, cookie = '') {
  const response = await fetch(`${endpoint}/projects/C8Oforms/.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: new URLSearchParams({
      __project: 'C8Oforms',
      __sequence: sequence,
      ...params,
    }).toString(),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  const nextCookie = mergeCookies(cookie, collectSetCookies(response));
  if (!response.ok || json?.error || json?.document?.error || /<error/i.test(text)) {
    throw new Error(`C8Oforms.${sequence} failed: ${response.status} ${text.slice(0, 500)}`);
  }
  return { response, text, json, cookie: nextCookie };
}

async function c8oSessionMultipartSequence(endpoint, sequence, params, cookie = '') {
  const form = new FormData();
  const fields = {
    __localCache_ttl: '3000',
    __disableAutologin: 'false',
    __project: 'C8Oforms',
    __sequence: sequence,
    __uuid: `web-${randomUUID()}`,
    ...params,
  };
  for (const [name, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      form.append(name, String(value));
    }
  }

  const response = await fetch(`${endpoint}/projects/C8Oforms/.json`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Referer: `${endpoint}/projects/C8Oforms/DisplayObjects/mobile/selector/nocodedatabase/:folder/:sub/true/true`,
      'x-convertigo-mb': '8.4.0',
      'x-convertigo-sdk': '4.0.27-beta6',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: form,
    redirect: 'follow',
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  const nextCookie = mergeCookies(cookie, collectSetCookies(response));
  if (!response.ok || json?.error || json?.document?.error || /<error/i.test(text)) {
    throw new Error(`C8Oforms.${sequence} failed: ${response.status} ${text.slice(0, 500)}`);
  }
  return { response, text, json, cookie: nextCookie };
}

async function getDocument(endpoint, db, id) {
  const { response, text, json } = await fullSyncRequest(endpoint, db, id);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Could not read ${db}/${id}: ${response.status} ${text.slice(0, 300)}`);
  }
  return json;
}

async function loginWorks(endpoint, user, password) {
  const response = await fetch(`${endpoint}/projects/C8Oforms/.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      __project: 'C8Oforms',
      __sequence: 'Login',
      email: user,
      password,
    }).toString(),
  });
  const text = await response.text();
  if (!response.ok) {
    return false;
  }
  try {
    const json = JSON.parse(text);
    return json?.document?.ok === 'true' || json?.document?.ok === true || json?.ok === 'true' || json?.ok === true;
  } catch {
    return /<ok>true<\/ok>/.test(text);
  }
}

function loginOk(json, text) {
  return json?.document?.ok === 'true' || json?.document?.ok === true || json?.ok === 'true' || json?.ok === true || /<ok>true<\/ok>/.test(text);
}

async function loginSession(endpoint, user, password) {
  const result = await c8oSessionSequence(endpoint, 'Login', {
    email: user,
    password,
  });
  if (!loginOk(result.json, result.text)) {
    throw new Error(`Login failed for ${user}`);
  }
  if (!result.cookie) {
    throw new Error(`Login for ${user} did not return a session cookie`);
  }
  return result.cookie;
}

function settingIsReady(settings, user) {
  return (
    settings &&
    settings.mail === user &&
    settings.language === REQUIRED_TEST_USER_LANGUAGE &&
    (settings.c8o_view_type_users === true || settings.c8o_view_type_users === 'true') &&
    Object.entries(REQUIRED_TEST_USER_RIGHTS).every(([key, value]) => settingBoolean(settings, key) === value)
  );
}

function settingBoolean(settings, key) {
  return settings?.[key] === true || settings?.[key] === 'true';
}

async function addUser(endpoint, user, password) {
  await c8oSequence(endpoint, 'AddUser', {
    user,
    password,
    // false → the account lands on the "Édition" home (where the blank-form card
    // lives) instead of the default "Base de données"/published view, so
    // createBlankForm finds its entry point. (Existing accounts already fixed.)
    published_First: 'false',
    editing_rights: 'true',
    language: REQUIRED_TEST_USER_LANGUAGE,
    name: displayNameFor(user),
    surname: '',
    displayName: displayNameFor(user),
  });
}

async function changePassword(endpoint, user, password) {
  await c8oSequence(endpoint, 'ChangePassword', {
    user,
    newPwd: password,
  });
}

async function grantTestUserRights(endpoint, user) {
  const meta = {
    _id: `C8Oreserved_${user}`,
    mail: user,
    provider: 'forms',
    language: REQUIRED_TEST_USER_LANGUAGE,
    c8o_view_type_users: true,
    ...REQUIRED_TEST_USER_RIGHTS,
  };
  const patched = await c8oSequence(endpoint, 'admin_user_patch', {
    meta: JSON.stringify(meta),
  });
  if (!patchSucceeded(patched.json)) {
    throw new Error(`C8Oforms.admin_user_patch failed for ${user}: ${patched.text.slice(0, 500)}`);
  }
}

const FULLSYNC_DATA_DBS = ['c8oforms_fs', 'c8oforms_response_fs'];

function shouldResetUserData() {
  const v = process.env.E2E_RESET_USER_DATA;
  return v === '1' || v === 'true';
}

// Delete every document a test user owns — edition forms (drafts), published
// forms and their _pwa_document/_anonymous counterparts, folders and responses —
// so each CI run starts from a clean, light account (a bloated FullSync makes
// the editor slow to load). Runs as admin (engine TEST_PLATFORM_PRIVATE), which
// can query/delete across the per-user FullSync ACL. The user's settings doc
// (C8Oreserved_) and shared design/template docs are preserved.
async function cleanupUserData(endpoint, user) {
  let total = 0;
  for (const db of FULLSYNC_DATA_DBS) {
    const docs = await findUserOwnedDocs(endpoint, db, user);
    if (docs.length === 0) continue;
    await bulkDeleteDocs(endpoint, db, docs);
    total += docs.length;
  }
  console.log(`reset ${total} leftover document(s) for ${user}`);
}

// Ownership is split: edition/published/folders/anonymous carry creator == user,
// but PWA documents (published_<id>_pwa_document) have no creator and only
// ~c8oAcl == user, while anonymous docs (published_<id>_anonymous) carry creator
// but a hashed ~c8oAcl. Matching on EITHER catches every owned doc type.
async function findUserOwnedDocs(endpoint, db, user) {
  const found = [];
  let bookmark = null;
  for (let page = 0; page < 1000; page++) {
    const body = {
      selector: { $or: [{ creator: user }, { '~c8oAcl': user }] },
      fields: ['_id', '_rev'],
      limit: 500,
    };
    if (bookmark) body.bookmark = bookmark;
    const response = await fetch(`${endpoint}/fullsync/${db}/_find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(adminCookie ? { Cookie: adminCookie } : {}) },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`FullSync _find on ${db} failed for ${user}: ${response.status} ${(await response.text()).slice(0, 300)}`);
    }
    const json = await response.json();
    // Never delete the user settings doc or shared design docs.
    const docs = (json.docs || []).filter((d) => !d._id.startsWith('C8Oreserved_') && !d._id.startsWith('_design'));
    found.push(...docs);
    bookmark = json.bookmark;
    if (!json.docs || json.docs.length < 500) break;
  }
  return found;
}

async function bulkDeleteDocs(endpoint, db, docs) {
  const payload = { docs: docs.map((d) => ({ _id: d._id, _rev: d._rev, _deleted: true })) };
  const response = await fetch(`${endpoint}/fullsync/${db}/_bulk_docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(adminCookie ? { Cookie: adminCookie } : {}) },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`FullSync _bulk_docs delete on ${db} failed: ${response.status} ${(await response.text()).slice(0, 300)}`);
  }
}

function patchSucceeded(json) {
  return (
    json?.success === true ||
    json?.success === 'true' ||
    json?.document?.success === true ||
    json?.document?.success === 'true' ||
    json?.document?.object?.success === true ||
    json?.document?.object?.success === 'true'
  );
}

function sequenceResult(json) {
  return json?.document?.result ?? json?.result ?? json?.document ?? json;
}

function sequenceError(json) {
  return json?.document?.error ?? json?.error ?? null;
}

function mcpUrl(endpoint) {
  return `${endpoint.replace(/\/+$/, '')}/api/mcp`;
}

function exportEnv(name, value) {
  if (process.env.GITHUB_ENV) {
    appendFileSync(process.env.GITHUB_ENV, `${name}=${value}\n`);
  } else {
    console.log(`${name}=${value}`);
  }
}

async function createMcpToken(endpoint, user, password, index) {
  const cookie = await loginSession(endpoint, user, password);
  await provisionBaserowAccount(endpoint, user, cookie);
  const tokenName = `C8oForms e2e shard ${index + 1}`;
  const created = await c8oSessionSequence(endpoint, 'APIV2_McpTokenCreate', { name: tokenName }, cookie);
  const result = sequenceResult(created.json);
  if (result?.status !== 'ok' || !result?.token) {
    throw new Error(`C8Oforms.APIV2_McpTokenCreate failed for ${user}: ${JSON.stringify(result).slice(0, 500)}`);
  }
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::add-mask::${result.token}`);
  }
  exportEnv('C8OFORMS_MCP_TOKEN', result.token);
  exportEnv('C8OFORMS_MCP_URL', result.mcpUrl || mcpUrl(endpoint));
  console.log(`MCP token ready for test user ${index + 1}: ${user}`);
}

async function provisionBaserowAccount(endpoint, user, cookie) {
  const account = await c8oSessionMultipartSequence(endpoint, 'BaserowAccount', {}, cookie);
  const error = sequenceError(account.json);
  if (error) {
    throw new Error(`C8Oforms.BaserowAccount failed for ${user}: ${JSON.stringify(error).slice(0, 500)}`);
  }
  const result = sequenceResult(account.json);
  const token = result?.token;
  const iframe = result?.iframe;
  if (!token || !iframe) {
    throw new Error(`C8Oforms.BaserowAccount did not return token/iframe for ${user}`);
  }
  await provisionBaserowIframe(iframe, token, user);
  console.log(`Baserow account ready for ${user}`);
}

async function provisionBaserowIframe(iframe, token, user) {
  const url = `${String(iframe).replace(/\/+$/, '')}/.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      __sequence: 'CheckLogin',
      token,
    }).toString(),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!response.ok || json?.error || !json?.jwt_token) {
    throw new Error(`Baserow iframe CheckLogin failed for ${user}: ${response.status} ${text.slice(0, 500)}`);
  }
}

async function ensureUser(endpoint, user, password, index) {
  const settingsId = `C8Oreserved_${user}`;
  let existingAccount = await getDocument(endpoint, FULLSYNC_USER_DB, user);
  let existingSettings = await getDocument(endpoint, FORMS_DB, settingsId);
  let canLogin = existingAccount ? await loginWorks(endpoint, user, password) : false;
  const actions = [];

  if (!existingAccount || !settingIsReady(existingSettings, user)) {
    await addUser(endpoint, user, password);
    actions.push('AddUser');
    existingAccount = await getDocument(endpoint, FULLSYNC_USER_DB, user);
    existingSettings = await getDocument(endpoint, FORMS_DB, settingsId);
    canLogin = existingAccount ? await loginWorks(endpoint, user, password) : false;
  }

  if (existingAccount && !canLogin) {
    await changePassword(endpoint, user, password);
    actions.push('ChangePassword');
    canLogin = await loginWorks(endpoint, user, password);
  }

  await grantTestUserRights(endpoint, user);
  actions.push('GrantRights');
  existingSettings = await getDocument(endpoint, FORMS_DB, settingsId);

  if (!existingAccount) {
    throw new Error(`C8Oforms.AddUser did not create account ${user}`);
  }
  if (!settingIsReady(existingSettings, user)) {
    throw new Error(`C8Oforms.AddUser did not prepare settings ${settingsId}`);
  }
  if (!canLogin) {
    throw new Error(`Prepared ${user} but login still fails with login=${user}`);
  }
  await provisionBaserowAccount(endpoint, user, await loginSession(endpoint, user, password));
  if (shouldResetUserData()) {
    await cleanupUserData(endpoint, user);
  }
  console.log(`test user ${index + 1}: ${user} ready${actions.length > 0 ? ` (${actions.join(', ')})` : ''}`);
}

async function main() {
  const endpoint = normalizeConvertigoEndpoint(process.env.TEST_NOCODE_ENDPOINT || process.env.C8O_SERVER || process.env.C8OFORMS_BASE_URL);
  const users = testUsers();
  if (users.length < 1) {
    die('Expected at least 1 test user');
  }

  if (hasFlag('--emit-mcp-token')) {
    const index = selectedUserIndex(users);
    const user = users[index];
    await createMcpToken(endpoint, user, passwordFor(user, index), index);
    return;
  }

  await adminLogin(endpoint);

  for (const [index, user] of users.entries()) {
    await ensureUser(endpoint, user, passwordFor(user, index), index);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
