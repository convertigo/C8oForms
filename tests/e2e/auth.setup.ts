import { test as setup } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { login } from './helpers/studio';
import { STORAGE_STATE } from './helpers/auth-state';

/**
 * Authenticate once for the whole run and persist the session. Every other spec
 * reuses this storage state (config `use.storageState`), so the login UI flow is
 * driven only here instead of in every test — far fewer auth round-trips against
 * the shared engine. The dedicated login journey (journeys.spec.ts) opts out of
 * the stored state so it still exercises the real login UI.
 *
 * The credentials default to the current run's test user (resolved from
 * C8OFORMS_TEST_USER_INDEX), so in CI each browser job saves its own user state.
 */
setup('authenticate', async ({ page }) => {
  await login(page);
  mkdirSync(dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
