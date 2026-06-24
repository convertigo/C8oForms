type SymbolState = {
  exists: boolean;
  value: string;
};

export type RestoreGlobalSymbol = () => Promise<void>;

const LOCK_SYMBOL = 'C8Oforms.e2e.globalSymbolLock';
const LOCK_STALE_MS = 10 * 60_000;
const LOCK_TIMEOUT_MS = 120_000;

export async function setGlobalSymbolForTest(symbolName: string, value: string): Promise<RestoreGlobalSymbol> {
  const admin = new ConvertigoAdminSymbols();
  await admin.login();

  const owner = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await admin.acquireLock(owner);

  let previous: SymbolState | null = null;
  let restored = false;
  try {
    previous = await admin.getSymbol(symbolName);
    await admin.setSymbol(symbolName, value);
  } catch (error) {
    await admin.releaseLock(owner).catch(() => undefined);
    throw error;
  }

  return async () => {
    if (restored) {
      return;
    }
    restored = true;
    try {
      await admin.restoreSymbol(symbolName, previous);
    } finally {
      await admin.releaseLock(owner);
    }
  };
}

class ConvertigoAdminSymbols {
  private readonly endpoint = resolveConvertigoEndpoint();
  private readonly user = process.env.CONVERTIGO_ADMIN_USER || process.env.TEST_NOCODE_USER || 'admin';
  private readonly password = process.env.CONVERTIGO_ADMIN_PASSWORD || process.env.TEST_NOCODE_PASSWORD || '';
  private cookie = '';

  async login(): Promise<void> {
    if (!this.password) {
      throw new Error('CONVERTIGO_ADMIN_PASSWORD or TEST_NOCODE_PASSWORD is required to configure global symbols');
    }
    await this.call('engine.Authenticate', {
      authType: 'login',
      authUserName: this.user,
      authPassword: this.password,
    });
  }

  async getSymbol(symbolName: string): Promise<SymbolState> {
    const symbols = await this.listSymbols();
    const value = symbols.get(symbolName);
    return value == null ? { exists: false, value: '' } : { exists: true, value };
  }

  async setSymbol(symbolName: string, value: string): Promise<void> {
    const previous = await this.getSymbol(symbolName);
    if (previous.exists) {
      await this.call('global_symbols.Edit', { oldSymbolName: symbolName, symbolName, symbolValue: value });
    } else {
      await this.call('global_symbols.Add', { symbolName, symbolValue: value });
    }
  }

  async restoreSymbol(symbolName: string, previous: SymbolState): Promise<void> {
    if (previous.exists) {
      await this.setSymbol(symbolName, previous.value);
      return;
    }
    if ((await this.getSymbol(symbolName)).exists) {
      await this.call('global_symbols.Delete', { symbolName });
    }
  }

  async acquireLock(owner: string): Promise<void> {
    const deadline = Date.now() + LOCK_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const lock = await this.getSymbol(LOCK_SYMBOL);
      if (!lock.exists && (await this.tryAddSymbol(LOCK_SYMBOL, JSON.stringify({ owner, createdAt: Date.now() })))) {
        return;
      }

      if (lock.exists && lockIsStale(lock.value)) {
        await this.call('global_symbols.Delete', { symbolName: LOCK_SYMBOL }).catch(() => undefined);
        continue;
      }

      await wait(1_000);
    }
    throw new Error(`Timed out waiting for global-symbol lock ${LOCK_SYMBOL}`);
  }

  async releaseLock(owner: string): Promise<void> {
    const lock = await this.getSymbol(LOCK_SYMBOL);
    if (!lock.exists) {
      return;
    }
    const currentOwner = lockOwner(lock.value);
    if (currentOwner === owner) {
      await this.call('global_symbols.Delete', { symbolName: LOCK_SYMBOL });
    }
  }

  private async listSymbols(): Promise<Map<string, string>> {
    const xml = await this.call('global_symbols.List');
    const symbols = new Map<string, string>();
    for (const match of xml.matchAll(/<symbol\b([^>]*)\/>/g)) {
      const attrs = parseXmlAttributes(match[1]);
      if (attrs.name != null) {
        symbols.set(attrs.name, attrs.value ?? '');
      }
    }
    return symbols;
  }

  private async tryAddSymbol(symbolName: string, symbolValue: string): Promise<boolean> {
    const result = await this.rawCall('global_symbols.Add', { symbolName, symbolValue });
    if (serviceFailed(result.text)) {
      return false;
    }
    return true;
  }

  private async call(path: string, form: Record<string, string> = {}): Promise<string> {
    const result = await this.rawCall(path, form);
    if (!result.response.ok || serviceFailed(result.text)) {
      throw new Error(`Convertigo admin service ${path} failed: ${result.response.status} ${compactXml(result.text)}`);
    }
    return result.text;
  }

  private async rawCall(path: string, form: Record<string, string>): Promise<{ response: Response; text: string }> {
    const response = await fetch(`${this.endpoint}/admin/services/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: new URLSearchParams(form).toString(),
      redirect: 'follow',
    });

    const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const setCookies = getSetCookie ? getSetCookie.call(response.headers) : response.headers.get('set-cookie') ? [response.headers.get('set-cookie') as string] : [];
    if (setCookies.length > 0) {
      this.cookie = setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
    }

    return { response, text: await response.text() };
  }
}

function resolveConvertigoEndpoint(): string {
  const explicit = process.env.TEST_NOCODE_ENDPOINT || process.env.C8O_SERVER || process.env.C8OFORMS_BASE_URL || '';
  if (explicit) {
    const trimmed = explicit.replace(/\/+$/, '');
    return trimmed.endsWith('/convertigo') ? trimmed : `${trimmed}/convertigo`;
  }

  const appUrl = process.env.C8OFORMS_APP_URL || 'https://test-repro.convertigo.net/convertigo/projects/C8Oforms/DisplayObjects/mobile/';
  const url = new URL(appUrl);
  const convertigoPath = url.pathname.includes('/convertigo/') ? url.pathname.slice(0, url.pathname.indexOf('/convertigo/') + '/convertigo'.length) : '/convertigo';
  return `${url.origin}${convertigoPath}`;
}

function parseXmlAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(/([A-Za-z_:][A-Za-z0-9_:.-]*)="([^"]*)"/g)) {
    attrs[match[1]] = decodeXmlAttribute(match[2]);
  }
  return attrs;
}

function decodeXmlAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function serviceFailed(xml: string): boolean {
  return /<error\b/i.test(xml) || /\bstate="error"/i.test(xml);
}

function compactXml(xml: string): string {
  return xml.replace(/\s+/g, ' ').trim().slice(0, 500);
}

function lockOwner(value: string): string {
  try {
    const parsed = JSON.parse(value) as { owner?: unknown };
    return typeof parsed.owner === 'string' ? parsed.owner : '';
  } catch {
    return '';
  }
}

function lockIsStale(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as { createdAt?: unknown };
    return typeof parsed.createdAt === 'number' && Date.now() - parsed.createdAt > LOCK_STALE_MS;
  } catch {
    return true;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
