#!/usr/bin/env node

import { appendFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const DEFAULT_USERS = [
  'testuser-convertigo@yopmail.com',
];

const FULLSYNC_USER_DB = 'lib_usermanager_fullsync';
const FORMS_DB = 'c8oforms_fs';

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
    (settings.editing_rights === true || settings.editing_rights === 'true') &&
    (settings.c8o_view_type_users === true || settings.c8o_view_type_users === 'true')
  );
}

async function addUser(endpoint, user, password) {
  await c8oSequence(endpoint, 'AddUser', {
    user,
    password,
    published_First: 'true',
    editing_rights: 'true',
    language: 'en',
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
