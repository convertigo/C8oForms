#!/usr/bin/env node

const DEFAULT_USERS = [
  'testuser-convertigo@yopmail.com',
];

const FULLSYNC_USER_DB = 'lib_usermanager_fullsync';
const FORMS_DB = 'c8oforms_fs';

let adminCookie = '';

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
  const setCookie = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : response.headers.get('set-cookie')
      ? [response.headers.get('set-cookie')]
      : [];
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
  console.log(`test user ${index + 1}: ${user} ready${actions.length > 0 ? ` (${actions.join(', ')})` : ''}`);
}

async function main() {
  const endpoint = normalizeConvertigoEndpoint(process.env.TEST_NOCODE_ENDPOINT || process.env.C8O_SERVER);
  await adminLogin(endpoint);

  const users = testUsers();
  if (users.length < 1) {
    die('Expected at least 1 test user');
  }

  for (const [index, user] of users.entries()) {
    await ensureUser(endpoint, user, passwordFor(user, index), index);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
