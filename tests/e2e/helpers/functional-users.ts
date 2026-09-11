import { test } from '@playwright/test';
import type { LoginCredentials } from './studio';

const FORMS_DB = 'c8oforms_fs';
const RESPONSE_DB = 'c8oforms_response_fs';
const FUNCTIONAL_LANGUAGE = 'fr';
const FUNCTIONAL_RIGHTS = {
  editing_rights: true,
  nocode_db_rights: true,
  formulas: true,
  publication: true,
};

export type EnsureFunctionalUserOptions = {
  resetOwnedData?: boolean;
  admin?: boolean;
};

type JsonRecord = Record<string, unknown>;

export interface FunctionalAdminSequenceClient {
  callSequence(sequence: string, params: Record<string, string>): Promise<JsonRecord>;
}

export function functionalUserProvisioningAvailable(): boolean {
  return Boolean(adminPassword());
}

export async function ensureFunctionalUserIfPossible(
  credentials: LoginCredentials,
  options: EnsureFunctionalUserOptions = {},
): Promise<void> {
  if (!functionalUserProvisioningAvailable()) {
    return;
  }

  await test.step(`Ensure functional Studio user ${credentials.user}`, async () => {
    const admin = new FunctionalUserAdminClient();
    await admin.login();
    await admin.ensureUser(credentials, options);
  });
}

export async function createFunctionalAdminSequenceClient(): Promise<FunctionalAdminSequenceClient> {
  const admin = new FunctionalUserAdminClient();
  await admin.login();
  return admin;
}

class FunctionalUserAdminClient {
  private readonly endpoint = resolveConvertigoEndpoint();
  private readonly user = process.env.CONVERTIGO_ADMIN_USER || process.env.TEST_NOCODE_USER || 'admin';
  private readonly password = adminPassword();
  private cookie = '';

  async login(): Promise<void> {
    if (!this.password) {
      throw new Error('CONVERTIGO_ADMIN_PASSWORD is required to provision functional Studio users');
    }
    await this.callAdminService('engine.Authenticate', {
      authType: 'login',
      authUserName: this.user,
      authPassword: this.password,
    });
  }

  async ensureUser(credentials: LoginCredentials, options: EnsureFunctionalUserOptions): Promise<void> {
    await this.addUser(credentials);
    if (!(await this.loginWorks(credentials))) {
      await this.changePassword(credentials);
    }
    await this.grantFunctionalRights(credentials.user, options);
    if (options.resetOwnedData) {
      await this.cleanupOwnedData(credentials.user);
    }
    if (!(await this.loginWorks(credentials))) {
      throw new Error(`Functional Studio user ${credentials.user} was provisioned but cannot log in`);
    }
  }

  private async addUser(credentials: LoginCredentials): Promise<void> {
    await this.callSequence('AddUser', {
      user: credentials.user,
      password: credentials.password ?? credentials.user,
      published_First: 'false',
      editing_rights: 'true',
      language: FUNCTIONAL_LANGUAGE,
      name: displayNameFor(credentials.user),
      surname: '',
      displayName: displayNameFor(credentials.user),
    });
  }

  private async changePassword(credentials: LoginCredentials): Promise<void> {
    await this.callSequence('ChangePassword', {
      user: credentials.user,
      newPwd: credentials.password ?? credentials.user,
    });
  }

  private async grantFunctionalRights(user: string, options: EnsureFunctionalUserOptions): Promise<void> {
    const response = await this.callSequence('admin_user_patch', {
      meta: JSON.stringify({
        _id: `C8Oreserved_${user}`,
        mail: user,
        provider: 'forms',
        language: FUNCTIONAL_LANGUAGE,
        c8o_view_type_users: true,
        ...FUNCTIONAL_RIGHTS,
        ...(options.admin ? { admin: true, admin_readonly: false } : {}),
      }),
    });
    if (!patchSucceeded(response)) {
      throw new Error(`C8Oforms.admin_user_patch failed for ${user}: ${JSON.stringify(response).slice(0, 500)}`);
    }
  }

  private async cleanupOwnedData(user: string): Promise<void> {
    for (const db of [FORMS_DB, RESPONSE_DB]) {
      const docs = await this.findOwnedDocs(db, user);
      if (docs.length === 0) {
        continue;
      }
      await this.bulkDelete(db, docs);
    }
  }

  private async findOwnedDocs(db: string, user: string): Promise<Array<{ _id: string; _rev: string }>> {
    const found: Array<{ _id: string; _rev: string }> = [];
    let bookmark: string | undefined;
    for (let page = 0; page < 100; page++) {
      const body: JsonRecord = {
        selector: { $or: [{ creator: user }, { '~c8oAcl': user }] },
        fields: ['_id', '_rev'],
        limit: 500,
      };
      if (bookmark) {
        body.bookmark = bookmark;
      }

      const response = await fetch(`${this.endpoint}/fullsync/${db}/_find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.cookie ? { Cookie: this.cookie } : {}),
        },
        body: JSON.stringify(body),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`FullSync _find on ${db} failed for ${user}: ${response.status} ${text.slice(0, 300)}`);
      }

      const json = text ? (JSON.parse(text) as { docs?: Array<{ _id: string; _rev: string }>; bookmark?: string }) : {};
      const docs = (json.docs ?? []).filter(
        (doc) =>
          !doc._id.startsWith('C8Oreserved_') &&
          !doc._id.startsWith('_design') &&
          !doc._id.endsWith('_baserow'),
      );
      found.push(...docs);
      bookmark = json.bookmark;
      if (!json.docs || json.docs.length < 500) {
        break;
      }
    }
    return found;
  }

  private async bulkDelete(db: string, docs: Array<{ _id: string; _rev: string }>): Promise<void> {
    const response = await fetch(`${this.endpoint}/fullsync/${db}/_bulk_docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: JSON.stringify({
        docs: docs.map((doc) => ({ _id: doc._id, _rev: doc._rev, _deleted: true })),
      }),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`FullSync _bulk_docs delete on ${db} failed: ${response.status} ${text.slice(0, 300)}`);
    }
  }

  private async loginWorks(credentials: LoginCredentials): Promise<boolean> {
    const result = await this.rawPost(
      `${this.endpoint}/projects/C8Oforms/.json`,
      {
        __project: 'C8Oforms',
        __sequence: 'Login',
        email: credentials.user,
        password: credentials.password ?? credentials.user,
      },
      false,
    );
    if (!result.response.ok) {
      return false;
    }
    try {
      const json = result.text ? (JSON.parse(result.text) as JsonRecord) : {};
      return loginSucceeded(json, result.text);
    } catch {
      return /<ok>true<\/ok>/i.test(result.text);
    }
  }

  private async callAdminService(path: string, form: Record<string, string>): Promise<string> {
    const result = await this.rawPost(`${this.endpoint}/admin/services/${path}`, form, true);
    if (!result.response.ok || serviceFailed(result.text)) {
      throw new Error(`Convertigo admin service ${path} failed: ${result.response.status} ${compactResponse(result.text)}`);
    }
    return result.text;
  }

  async callSequence(sequence: string, params: Record<string, string>): Promise<JsonRecord> {
    const result = await this.rawPost(
      `${this.endpoint}/projects/C8Oforms/.json`,
      { __project: 'C8Oforms', __sequence: sequence, ...params },
      true,
    );
    let json: JsonRecord;
    try {
      json = result.text ? (JSON.parse(result.text) as JsonRecord) : {};
    } catch {
      throw new Error(`C8o ${sequence} returned non-JSON: ${result.text.slice(0, 300)}`);
    }
    if (!result.response.ok || json.error || asRecord(json.document)?.error) {
      throw new Error(`C8o ${sequence} failed: ${JSON.stringify(json).slice(0, 500)}`);
    }
    return json;
  }

  private async rawPost(
    url: string,
    form: Record<string, string>,
    includeAdminCookie: boolean,
  ): Promise<{ response: Response; text: string }> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(includeAdminCookie && this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: new URLSearchParams(form).toString(),
      redirect: 'follow',
    });

    const setCookies = collectSetCookies(response);
    if (includeAdminCookie && setCookies.length > 0) {
      this.cookie = mergeCookieHeader(this.cookie, setCookies);
    }

    return { response, text: await response.text() };
  }
}

function adminPassword(): string {
  return process.env.CONVERTIGO_ADMIN_PASSWORD || process.env.TEST_NOCODE_PASSWORD || '';
}

function resolveConvertigoEndpoint(): string {
  const explicit = process.env.TEST_NOCODE_ENDPOINT || process.env.C8O_SERVER || process.env.C8OFORMS_BASE_URL || '';
  if (explicit) {
    const trimmed = explicit.replace(/\/+$/, '');
    return trimmed.endsWith('/convertigo') ? trimmed : `${trimmed}/convertigo`;
  }

  const appUrl = process.env.C8OFORMS_APP_URL || 'https://test-repro.convertigo.net/convertigo/projects/C8Oforms/DisplayObjects/mobile/';
  const url = new URL(appUrl);
  const convertigoPath = url.pathname.includes('/convertigo/')
    ? url.pathname.slice(0, url.pathname.indexOf('/convertigo/') + '/convertigo'.length)
    : '/convertigo';
  return `${url.origin}${convertigoPath}`;
}

function displayNameFor(user: string): string {
  return user.split('@')[0];
}

function collectSetCookies(response: Response): string[] {
  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  if (getSetCookie) {
    return getSetCookie.call(response.headers);
  }
  const cookie = response.headers.get('set-cookie');
  return cookie ? [cookie] : [];
}

function mergeCookieHeader(existing: string, setCookies: string[]): string {
  const cookies = new Map<string, string>();
  for (const pair of existing.split(';').map((value) => value.trim()).filter(Boolean)) {
    cookies.set(pair.split('=', 1)[0], pair);
  }
  for (const setCookie of setCookies) {
    const pair = setCookie.split(';', 1)[0].trim();
    if (pair) {
      cookies.set(pair.split('=', 1)[0], pair);
    }
  }
  return [...cookies.values()].join('; ');
}

function loginSucceeded(json: JsonRecord, text: string): boolean {
  const document = asRecord(json.document);
  return json.ok === true || json.ok === 'true' || document?.ok === true || document?.ok === 'true' || /<ok>true<\/ok>/i.test(text);
}

function patchSucceeded(json: JsonRecord): boolean {
  const document = asRecord(json.document);
  const object = asRecord(document?.object);
  return (
    json.success === true ||
    json.success === 'true' ||
    document?.success === true ||
    document?.success === 'true' ||
    object?.success === true ||
    object?.success === 'true'
  );
}

function serviceFailed(text: string): boolean {
  return /<error\b/i.test(text) || /\bstate="error"/i.test(text);
}

function compactResponse(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 500);
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}
