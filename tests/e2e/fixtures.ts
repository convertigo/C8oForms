import { test as base, expect, type BrowserContext } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { login } from './helpers/studio';

/**
 * Worker-scoped persistent browser context.
 *
 * C8oForms is a PWA: the first load fetches ~220 assets (~18s) which the service
 * worker then caches; a warm load is ~1.6s. Playwright's default fresh context
 * per test has an empty cache, so every test re-fetches the whole app — slow and
 * a heavy load on the shared engine. Here each worker keeps ONE persistent
 * context (its own userDataDir): the SW caches the app once, authenticates once,
 * and every test reuses both. Tests still get a fresh page for DOM isolation.
 *
 * Specs that need this import { test, expect } from './fixtures' instead of
 * '@playwright/test'.
 */
type WorkerFixtures = { pwaContext: BrowserContext };

export const test = base.extend<Record<string, never>, WorkerFixtures>({
  pwaContext: [
    async ({ playwright, browserName }, use, workerInfo) => {
      const userDataDir = mkdtempSync(join(tmpdir(), `c8o-pwa-${browserName}-w${workerInfo.workerIndex}-`));
      const context = await playwright[browserName].launchPersistentContext(userDataDir, {
        viewport: { width: 1440, height: 900 },
        // A shared persistent context has one locale/timezone for all its tests.
        // The suite is i18n-neutral (selectors, not visible text), and timezone
        // only matters to the Baserow date specs (#1058/#1416), which expect
        // exactly this one — so fixing it here lets those specs use the warm
        // cache too. Specs needing a different locale/timezone (e.g. #1355 en-US)
        // stay on the default per-test context instead of this fixture.
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
      });
      // Warm the service-worker cache and authenticate once for the whole worker.
      const warmup = await context.newPage();
      await login(warmup);
      await warmup.close();
      await use(context);
      await context.close();
      await removeUserDataDir(userDataDir);
    },
    { scope: 'worker' },
  ],

  // Share the persistent context across tests (cache + auth reused)...
  context: async ({ pwaContext }, use) => {
    await use(pwaContext);
  },

  // ...but give each test its own page, sized to its requested viewport.
  page: async ({ pwaContext, viewport }, use) => {
    const page = await pwaContext.newPage();
    if (viewport) {
      await page.setViewportSize(viewport);
    }
    await use(page);
    await page.close();
  },
});

export { expect };
// Re-export the common Playwright types so specs can import everything they need
// from './fixtures' instead of '@playwright/test'.
export type { Page, Locator, Browser, BrowserContext } from '@playwright/test';

async function removeUserDataDir(userDataDir: string): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      return;
    } catch (error) {
      if (!isTransientRemoveError(error) || attempt === 4) {
        throw error;
      }
      await sleep(500 * (attempt + 1));
    }
  }
}

function isTransientRemoveError(error: unknown): boolean {
  const code = (error as { code?: string } | undefined)?.code;
  return code === 'EBUSY' || code === 'ENOTEMPTY' || code === 'EPERM';
}
