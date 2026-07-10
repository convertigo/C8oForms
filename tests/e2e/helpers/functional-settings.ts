import { expect, test, type Locator, type Page } from '@playwright/test';
import { setGlobalSymbolForTest, type RestoreGlobalSymbol } from './admin-symbols';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  c8oCall,
  createBlankForm,
  createMcpTokenThroughSettingsUi,
  expectMcpTokenListed,
  openPublishedViewer,
  openPreview,
  openSettings,
  publishCurrentFormWithPwa,
  revokeMcpTokenThroughSettingsUi,
  submitViewerForm,
  type StudioLanguage,
} from './studio';

type McpTokenInfo = {
  name?: string;
  status?: string;
  token?: string;
};

const SETTINGS_HOME_PAGE_SELECT = [
  'page-settingspage ion-select.class1764696178184:visible',
  'page-settingspage ion-select.class1764696261315:visible',
  'page-settingspage ion-select.class1601543680535:visible',
].join(', ');
const CUSTOM_HEADER_LOGO_SYMBOL = 'C8Oforms.customHeaderLogo';
const CUSTOM_HEADER_LOGO = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#116e7c"/><text x="100" y="116" text-anchor="middle" font-family="Arial" font-size="54" fill="#ffffff">F</text></svg>',
).toString('base64')}`;

type LogoMetrics = {
  src: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
};

type GdprLanguage = 'fr' | 'en' | 'es' | 'it';
type GdprLocalizedText = Record<GdprLanguage, string>;
type GdprConfig = {
  toast_viewers_description: GdprLocalizedText;
  toast_builders_description: GdprLocalizedText;
  symbols: {
    menu: GdprLocalizedText;
    toast: GdprLocalizedText;
  };
  dpo_section: Record<string, unknown>;
  sections: Record<string, unknown>;
};
type RestoreGdprConfig = () => Promise<void>;

const GDPR_LANGUAGES: GdprLanguage[] = ['fr', 'en', 'es', 'it'];

export async function manageMcpTokenThroughSettingsUi(page: Page): Promise<void> {
  const tokenName = `Functional MCP ${Date.now()}`;
  let rawToken = '';

  await test.step('Open Settings and verify the MCP section', async () => {
    await openSettings(page);
    await expect(page.locator(SEL.settingsMcpUrl), 'MCP server URL should be displayed').toContainText(
      '/convertigo/api/mcp',
      { timeout: 30_000 },
    );
  });

  await test.step('Create a named MCP token and verify the one-shot value', async () => {
    rawToken = await createMcpTokenThroughSettingsUi(page, tokenName);
    expect(rawToken, 'raw MCP token should be shown immediately after creation').toMatch(/\S{20,}/);
    await expectMcpTokenStatus(page, tokenName, 'active');

    const safeList = await c8oCall(page, 'APIV2_McpTokenList', {});
    expect(JSON.stringify(safeList), 'listing existing MCP tokens should not return the raw token').not.toContain(rawToken);
  });

  await test.step('Reload Settings and verify existing tokens stay masked', async () => {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('page-settingspage').waitFor({ state: 'attached', timeout: 60_000 });
    await expect(page.locator(SEL.settingsMcpRoot), 'MCP tokens settings section should reload').toBeVisible({
      timeout: 30_000,
    });
    await expectMcpTokenListed(page, tokenName);
    await expect(page.locator(SEL.settingsMcpCreatedToken), 'one-shot token area should disappear after reload').toHaveCount(
      0,
      { timeout: 10_000 },
    );
    await expect(page.locator(SEL.settingsMcpRoot), 'existing token values must not be rendered again').not.toContainText(
      rawToken,
    );
    expect((await mcpTokenByName(page, tokenName))?.token, 'stored token metadata should not include the raw token').toBeUndefined();
  });

  await test.step('Revoke the MCP token through Settings', async () => {
    await revokeMcpTokenThroughSettingsUi(page, tokenName);
    await expectMcpTokenStatus(page, tokenName, 'revoked');
  });
}

export async function manageHomePagePreferenceThroughSettingsUi(page: Page): Promise<void> {
  let originalValue = 'false';
  let targetValue = 'true';

  await test.step('Open Settings and read the current default home page preference', async () => {
    await openSettings(page);
    await expectProfileIdentityVisible(page);
    originalValue = normalizePublishedFirst(await currentPublishedFirstPreference(page));
    targetValue = originalValue === 'true' ? 'false' : 'true';
    await expectHomePageSelectValue(page, originalValue);
  });

  try {
    await test.step(`Change the default home page preference to ${targetValue}`, async () => {
      await setHomePagePreference(page, targetValue);
      await expectPublishedFirstPreference(page, targetValue);
    });

    await test.step('Reload Settings and verify the default home page preference persists', async () => {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.locator('page-settingspage').waitFor({ state: 'attached', timeout: 60_000 });
      await expectHomePageSelectValue(page, targetValue);
      await expectPublishedFirstPreference(page, targetValue);
    });
  } finally {
    await test.step('Restore the original default home page preference', async () => {
      await c8oCall(page, 'APIV2_OverrideUserSettings', {
        meta: JSON.stringify({ published_First: originalValue }),
      });
      await expectPublishedFirstPreference(page, originalValue);
    });
  }
}

export async function verifyCustomHeaderLogoServerSymbolThroughUi(page: Page): Promise<void> {
  let restoreHeaderLogo: RestoreGlobalSymbol | undefined;

  try {
    await test.step('Set the custom header logo server symbol', async () => {
      restoreHeaderLogo = await setGlobalSymbolForTest(CUSTOM_HEADER_LOGO_SYMBOL, CUSTOM_HEADER_LOGO);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.locator(SEL.selectorPageRoot).waitFor({ state: 'attached', timeout: 60_000 });
    });

    await test.step('Create and submit a simple application through Studio UI', async () => {
      await createBlankForm(page, `Functional custom logo ${Date.now()}`);
      await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
      await openPreview(page, SEL.textComponent);
      await submitViewerForm(page);
      await expect(page.locator(SEL.responseCompletedPage), 'response completion page should render after submission').toBeAttached({
        timeout: 60_000,
      });
    });

    await test.step('Verify the custom logo server symbol impacts the viewer completion page', async () => {
      const metrics = await responseCompletedLogoMetrics(page);
      expect(metrics.src, 'response completion should render the configured custom header logo').toBe(CUSTOM_HEADER_LOGO);
      expect(metrics.naturalWidth, 'the custom logo fixture should load with its intrinsic width').toBe(200);
      expect(metrics.naturalHeight, 'the custom logo fixture should load with its intrinsic height').toBe(200);
      expect(metrics.height, `custom logo height should stay constrained; metrics=${JSON.stringify(metrics)}`).toBeLessThanOrEqual(60);
    });
  } finally {
    await test.step('Restore the custom header logo server symbol', async () => {
      await restoreHeaderLogo?.();
    });
  }
}

export async function verifyGdprViewerToastConfigurationThroughUi(page: Page): Promise<void> {
  const toastText = `Functional GDPR viewer toast ${Date.now()}`;
  let restoreGdprConfig: RestoreGdprConfig | undefined;
  let formId = '';

  try {
    await test.step('Set the GDPR viewer toast configuration', async () => {
      restoreGdprConfig = await setGdprViewerToastForTest(toastText);
    });

    await test.step('Create and publish a simple application through Studio UI', async () => {
      formId = await createBlankForm(page, `Functional GDPR viewer toast ${Date.now()}`);
      await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
      await publishCurrentFormWithPwa(page, 'anonymous');
    });

    await test.step('Open the published viewer and verify the configured GDPR toast appears', async () => {
      await openPublishedViewer(page, formId);
      await expect(page.locator(SEL.viewerPage), 'published viewer should render for GDPR toast checks').toBeVisible({
        timeout: 60_000,
      });
      await expect
        .poll(async () => visibleToastMessages(page).then((messages) => messages.some((message) => message.includes(toastText))), {
          message: `published viewer should show the configured GDPR toast "${toastText}"`,
          timeout: 30_000,
        })
        .toBe(true);
    });
  } finally {
    await test.step('Restore the GDPR viewer toast configuration', async () => {
      await restoreGdprConfig?.();
    });
  }
}

export async function verifyGdprMenuLanguageConfigurationThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const fixture = Object.fromEntries(
    GDPR_LANGUAGES.map((lang) => [
      lang,
      {
        title: `Functional GDPR ${lang.toUpperCase()} title ${suffix}`,
        description: `Functional GDPR ${lang.toUpperCase()} description ${suffix}`,
        dpoTitle: `Functional DPO ${lang.toUpperCase()} title ${suffix}`,
      },
    ]),
  ) as Record<GdprLanguage, { title: string; description: string; dpoTitle: string }>;
  let restoreGdprConfig: RestoreGdprConfig | undefined;
  let originalLanguage: StudioLanguage = 'fr';

  try {
    await test.step('Set language-specific GDPR menu configuration', async () => {
      originalLanguage = normalizedStudioLanguage(normalizedSetting((await currentUserSettings(page)).language));
      restoreGdprConfig = await setGdprMenuForTest(fixture);
    });

    for (const lang of GDPR_LANGUAGES) {
      await test.step(`Open GDPR page in ${lang} and verify the configured menu text`, async () => {
        await setStudioLanguageForGdprNavigation(page, lang);
        await openGdprPage(page);
        await expectGdprRenderedText(page, fixture[lang].title);
        await expectGdprRenderedText(page, fixture[lang].description);
      });
    }
  } finally {
    await test.step('Restore the GDPR menu configuration and Studio language', async () => {
      await restoreGdprConfig?.();
      await setStudioLanguageForGdprNavigation(page, originalLanguage).catch(() => undefined);
    });
  }
}

function mcpResult(response: Record<string, unknown>): Record<string, unknown> {
  const document = response.document as Record<string, unknown> | undefined;
  return ((response.result as Record<string, unknown> | undefined) ?? (document?.result as Record<string, unknown> | undefined) ?? {});
}

async function setGdprViewerToastForTest(message: string): Promise<RestoreGdprConfig> {
  return setGdprConfigForTest((next) => {
    for (const lang of GDPR_LANGUAGES) {
      next.toast_viewers_description[lang] = message;
    }
  });
}

async function setGdprMenuForTest(
  fixture: Record<GdprLanguage, { title: string; description: string; dpoTitle: string }>,
): Promise<RestoreGdprConfig> {
  return setGdprConfigForTest((next) => {
    for (const lang of GDPR_LANGUAGES) {
      next.symbols.menu[lang] = '';
      next.sections[lang] = [
        {
          title: fixture[lang].title,
          description: fixture[lang].description,
          icon: { color: 'var(--ion-color-primary)', backgroundColor: 'transparent', name: 'database' },
        },
      ];
      next.dpo_section[lang] = {
        title: fixture[lang].dpoTitle,
        description: `Functional DPO ${lang.toUpperCase()} description`,
        email: `functional-${lang}@example.test`,
      };
    }
  });
}

async function setGdprConfigForTest(updateConfig: (config: GdprConfig) => void): Promise<RestoreGdprConfig> {
  const admin = new FunctionalConvertigoAdminClient();
  await admin.login();

  const previous = await admin.readGdprConfig();
  const next = cloneJson(previous);
  updateConfig(next);
  await admin.writeGdprConfig(next);

  let restored = false;
  return async () => {
    if (restored) {
      return;
    }
    restored = true;
    await admin.writeGdprConfig(previous);
  };
}

class FunctionalConvertigoAdminClient {
  private readonly endpoint = resolveConvertigoEndpoint();
  private readonly user = process.env.CONVERTIGO_ADMIN_USER || process.env.TEST_NOCODE_USER || 'admin';
  private readonly password = process.env.CONVERTIGO_ADMIN_PASSWORD || process.env.TEST_NOCODE_PASSWORD || '';
  private cookie = '';

  async login(): Promise<void> {
    if (!this.password) {
      throw new Error('CONVERTIGO_ADMIN_PASSWORD or TEST_NOCODE_PASSWORD is required to configure GDPR settings');
    }
    await this.callAdminService('engine.Authenticate', {
      authType: 'login',
      authUserName: this.user,
      authPassword: this.password,
    });
  }

  async readGdprConfig(): Promise<GdprConfig> {
    const response = await this.callSequence('admin_gdrp_get', {});
    return normalizeGdprConfig(gdprData(response));
  }

  async writeGdprConfig(config: GdprConfig): Promise<void> {
    const response = await this.callSequence('admin_gdrp_upsert', { meta: JSON.stringify(config) });
    const document = asRecord(response.document);
    const success = response.success ?? document?.success;
    if (success !== true && success !== 'true') {
      throw new Error(`C8o admin_gdrp_upsert failed: ${JSON.stringify(response).slice(0, 500)}`);
    }
  }

  private async callAdminService(path: string, form: Record<string, string>): Promise<string> {
    const result = await this.rawPost(`${this.endpoint}/admin/services/${path}`, form);
    if (!result.response.ok || serviceFailed(result.text)) {
      throw new Error(`Convertigo admin service ${path} failed: ${result.response.status} ${compactServiceResponse(result.text)}`);
    }
    return result.text;
  }

  private async callSequence(sequence: string, params: Record<string, string>): Promise<Record<string, unknown>> {
    const form = { __project: 'C8Oforms', __sequence: sequence, ...params };
    const result = await this.rawPost(`${this.endpoint}/projects/C8Oforms/.json`, form);
    let json: Record<string, unknown>;
    try {
      json = result.text ? (JSON.parse(result.text) as Record<string, unknown>) : {};
    } catch {
      throw new Error(`C8o ${sequence} returned non-JSON: ${result.text.slice(0, 300)}`);
    }
    if (!result.response.ok || json.error) {
      throw new Error(`C8o ${sequence} failed: ${JSON.stringify(json).slice(0, 500)}`);
    }
    return json;
  }

  private async rawPost(url: string, form: Record<string, string>): Promise<{ response: Response; text: string }> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: new URLSearchParams(form).toString(),
      redirect: 'follow',
    });

    const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const setCookies = getSetCookie
      ? getSetCookie.call(response.headers)
      : response.headers.get('set-cookie')
        ? [response.headers.get('set-cookie') as string]
        : [];
    if (setCookies.length > 0) {
      this.cookie = setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
    }

    return { response, text: await response.text() };
  }
}

async function visibleToastMessages(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('ion-toast')).map((toast) =>
      String(((toast as HTMLElement & { message?: unknown }).message ?? toast.textContent ?? '')).trim(),
    ),
  );
}

async function openGdprPage(page: Page): Promise<void> {
  await page.goto('./path-to-gdrppage', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expectGdprPageReady(page);
}

async function setStudioLanguageForGdprNavigation(page: Page, lang: StudioLanguage): Promise<void> {
  const settings = await currentUserSettings(page);
  const email = profileEmail(settings);
  expect(email, 'current user email should be available before changing Studio language').not.toBe('');
  await c8oCall(page, 'SetLanguage', { email, language: lang });
  await page.evaluate((value) => window.localStorage.setItem('lang', value), lang);
}

async function expectGdprPageReady(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const root = document.querySelector('page-gdrppage, page-gdrppage, ion-router-outlet .ion-page:not(.ion-page-hidden)');
          return !!root && !/login/i.test(root.tagName);
        }),
      {
        message: 'GDPR page should render after navigation',
        timeout: 60_000,
      },
    )
    .toBe(true);
}

async function expectGdprRenderedText(page: Page, expected: string): Promise<void> {
  await expect
    .poll(() => gdprVisibleTextAndInputValues(page).then((text) => text.includes(expected)), {
      message: `GDPR page should render configured text "${expected}"`,
      timeout: 30_000,
    })
    .toBe(true);
}

async function gdprVisibleTextAndInputValues(page: Page): Promise<string> {
  return page.evaluate(() => {
    const root = document.querySelector('page-gdrppage') ?? document.body;
    const inputValues = Array.from(root.querySelectorAll('input, textarea, ion-input, ion-textarea'))
      .map((node) => {
        const element = node as HTMLInputElement & { value?: unknown };
        return typeof element.value === 'string' ? element.value : '';
      })
      .filter(Boolean);
    return [root.textContent ?? '', ...inputValues].join('\n');
  });
}

function normalizedStudioLanguage(value: string): StudioLanguage {
  return GDPR_LANGUAGES.includes(value as GdprLanguage) ? (value as StudioLanguage) : 'fr';
}

function gdprData(response: Record<string, unknown>): Record<string, unknown> {
  const document = asRecord(response.document);
  return parseJsonRecord(response.data) ?? parseJsonRecord(document?.data) ?? {};
}

function normalizeGdprConfig(data: Record<string, unknown>): GdprConfig {
  const symbols = asRecord(data.symbols) ?? {};
  return {
    toast_viewers_description: localizedText(data.toast_viewers_description),
    toast_builders_description: localizedText(data.toast_builders_description),
    symbols: {
      menu: localizedText(symbols.menu),
      toast: localizedText(symbols.toast),
    },
    dpo_section: cloneJson(asRecord(data.dpo_section) ?? defaultDpoSection()),
    sections: cloneJson(asRecord(data.sections) ?? defaultGdprSections()),
  };
}

function localizedText(value: unknown): GdprLocalizedText {
  const record = asRecord(value) ?? {};
  return Object.fromEntries(GDPR_LANGUAGES.map((lang) => [lang, typeof record[lang] === 'string' ? record[lang] : ''])) as GdprLocalizedText;
}

function defaultDpoSection(): Record<string, unknown> {
  return Object.fromEntries(GDPR_LANGUAGES.map((lang) => [lang, { title: '', description: '', email: '' }]));
}

function defaultGdprSections(): Record<string, unknown> {
  const icon = { color: 'var(--ion-color-primary)', backgroundColor: 'transparent', name: 'database' };
  return Object.fromEntries(GDPR_LANGUAGES.map((lang) => [lang, [{ title: '', description: '', icon }]]));
}

function parseJsonRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return asRecord(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

function serviceFailed(text: string): boolean {
  return /<error\b/i.test(text) || /\bstate="error"/i.test(text);
}

function compactServiceResponse(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 500);
}

async function responseCompletedLogoMetrics(page: Page): Promise<LogoMetrics> {
  const logo = page.locator(SEL.responseCompletedLogo).first();
  await expect(logo, 'response completion custom logo should be visible').toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      () =>
        logo.evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        }),
      {
        message: 'response completion custom logo image should finish loading',
        timeout: 15_000,
      },
    )
    .toBe(true);

  return logo.evaluate((node) => {
    const image = node as HTMLImageElement;
    const box = image.getBoundingClientRect();
    return {
      src: image.src,
      width: box.width,
      height: box.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    };
  });
}

function settingsResult(response: Record<string, unknown>): Record<string, unknown> {
  const document = response.document as Record<string, unknown> | undefined;
  return ((response.res as Record<string, unknown> | undefined) ?? (document?.res as Record<string, unknown> | undefined) ?? {});
}

async function listMcpTokens(page: Page): Promise<McpTokenInfo[]> {
  const response = await c8oCall(page, 'APIV2_McpTokenList', {});
  const tokens = mcpResult(response).tokens;
  return (Array.isArray(tokens) ? tokens : tokens ? [tokens] : []) as McpTokenInfo[];
}

async function mcpTokenByName(page: Page, tokenName: string): Promise<McpTokenInfo | null> {
  return (await listMcpTokens(page)).find((token) => token.name === tokenName) ?? null;
}

async function expectMcpTokenStatus(page: Page, tokenName: string, status: string): Promise<void> {
  await expect
    .poll(async () => (await mcpTokenByName(page, tokenName))?.status ?? '', {
      message: `MCP token ${tokenName} should have status ${status}`,
      timeout: 30_000,
    })
    .toBe(status);
}

async function currentPublishedFirstPreference(page: Page): Promise<unknown> {
  const response = await c8oCall(page, 'getCurrentUserSettings', {});
  return settingsResult(response).published_First;
}

async function currentUserSettings(page: Page): Promise<Record<string, unknown>> {
  const response = await c8oCall(page, 'getCurrentUserSettings', {});
  return settingsResult(response);
}

async function expectProfileIdentityVisible(page: Page): Promise<void> {
  const settings = await currentUserSettings(page);
  const initials = profileInitials(settings);
  expect(initials, 'current user settings should provide displayable profile initials').toMatch(/^[A-Z?]{1,2}$/);

  const menu = page.getByRole('navigation', { name: /menu/i }).first();
  await expect(menu, 'Settings menu should expose the current user profile area').toBeVisible({
    timeout: 15_000,
  });

  const profileLabel = profileDisplayLabel(settings);
  if (profileLabel) {
    await expect(menu, `Settings menu should display the current user profile label ${profileLabel}`).toContainText(
      profileLabel,
      { timeout: 15_000 },
    );
  } else {
    await expect(menu, `Settings menu should display the current user profile initials ${initials}`).toContainText(
      initials,
      { timeout: 15_000 },
    );
  }

  const email = profileEmail(settings);
  if (email) {
    await expect(menu, `Settings menu should display the current user email ${email}`).toContainText(email, {
      timeout: 15_000,
    });
  }
}

function profileInitials(settings: Record<string, unknown>): string {
  const displayName = normalizedSetting(settings.displayName);
  if (displayName) {
    return displayName.slice(0, 1).toUpperCase();
  }

  const name = normalizedSetting(settings.name);
  const surname = normalizedSetting(settings.surname);
  if (name) {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  }

  return 'U';
}

function profileDisplayLabel(settings: Record<string, unknown>): string {
  const displayName = normalizedSetting(settings.displayName);
  if (displayName) {
    return displayName;
  }
  return `${normalizedSetting(settings.name)} ${normalizedSetting(settings.surname)}`.trim();
}

function profileEmail(settings: Record<string, unknown>): string {
  return (
    normalizedSetting(settings.email) ||
    normalizedSetting(settings.mail) ||
    normalizedSetting(settings.user) ||
    normalizedSetting(settings.username)
  );
}

function normalizedSetting(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : '';
  return text && text !== 'undefined' ? text : '';
}

async function expectPublishedFirstPreference(page: Page, expectedValue: string): Promise<void> {
  await expect
    .poll(async () => normalizePublishedFirst(await currentPublishedFirstPreference(page)), {
      message: `published_First user preference should be ${expectedValue}`,
      timeout: 30_000,
    })
    .toBe(expectedValue);
}

async function setHomePagePreference(page: Page, value: string): Promise<void> {
  const select = await homePagePreferenceSelect(page);
  await selectIonOptionByValue(page, select, value, 'Settings default home page');
}

async function expectHomePageSelectValue(page: Page, expectedValue: string): Promise<void> {
  const select = await homePagePreferenceSelect(page);
  await expect
    .poll(() => select.evaluate((element) => String((element as HTMLElement & { value?: unknown }).value ?? '')), {
      message: `Settings default home page select should be ${expectedValue}`,
      timeout: 15_000,
    })
    .toBe(expectedValue);
}

async function homePagePreferenceSelect(page: Page): Promise<Locator> {
  const select = page.locator(SETTINGS_HOME_PAGE_SELECT).first();
  await expect(select, 'Settings default home page select should be visible').toBeVisible({ timeout: 15_000 });
  return select;
}

async function selectIonOptionByValue(page: Page, select: Locator, value: string, description: string): Promise<void> {
  await expect(select, `${description} select should be visible`).toBeVisible({ timeout: 15_000 });
  const optionIndex = await select.evaluate(
    (element, expectedValue) =>
      Array.from(element.querySelectorAll('ion-select-option')).findIndex(
        (option) => String((option as HTMLElement & { value?: unknown }).value ?? option.getAttribute('value') ?? '') === expectedValue,
      ),
    value,
  );
  if (optionIndex < 0) {
    throw new Error(`${description} option ${value} should exist`);
  }

  await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
  const items = page.locator('ion-select-popover ion-item');
  await items.first().waitFor({ state: 'visible', timeout: 8_000 });
  await items.nth(optionIndex).click({ timeout: 10_000 }).catch(async () => items.nth(optionIndex).dispatchEvent('click'));
  await expect
    .poll(() => select.evaluate((element) => String((element as HTMLElement & { value?: unknown }).value ?? '')), {
      message: `${description} should be ${value}`,
      timeout: 10_000,
    })
    .toBe(value);
}

function normalizePublishedFirst(value: unknown): string {
  return value === true || value === 'true' ? 'true' : 'false';
}
