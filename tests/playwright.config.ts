import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { STORAGE_STATE } from './e2e/helpers/auth-state';

// Load tests/.env so credentials (test user, base URL) stay out of the code.
// Copy .env.example to .env to get started.
dotenv.config();

/**
 * E2E regression tests for C8oForms.
 *
 * The app is reached in one of two ways, depending on how it is served:
 *   - Convertigo server (localhost:18080, test-repro, ...): the app lives under
 *     /convertigo/projects/C8Oforms/DisplayObjects/mobile/. Set C8OFORMS_BASE_URL
 *     to the server host and that path is appended for you.
 *   - Dev server (ng serve): the app is served at the root, e.g.
 *     http://localhost:41378/. Set C8OFORMS_APP_URL to that full URL; it is used
 *     as-is. C8OFORMS_APP_URL takes precedence over C8OFORMS_BASE_URL.
 */
function resolveAppUrl(): string {
  const withSlash = (u: string) => (u.endsWith('/') ? u : `${u}/`);
  const direct = process.env.C8OFORMS_APP_URL;
  if (direct) return withSlash(direct);
  const server = (process.env.C8OFORMS_BASE_URL ?? 'https://test-repro.convertigo.net').replace(/\/+$/, '');
  return `${server}/convertigo/projects/C8Oforms/DisplayObjects/mobile/`;
}
const baseURL = resolveAppUrl();
const supportedBrowsers = ['chromium', 'firefox', 'webkit'] as const;
type SupportedBrowser = typeof supportedBrowsers[number];

function resolveBrowser(): SupportedBrowser {
  const browser = process.env.C8OFORMS_BROWSER;
  return supportedBrowsers.includes(browser as SupportedBrowser) ? (browser as SupportedBrowser) : 'chromium';
}

const browserName = resolveBrowser();
const deviceName: Record<SupportedBrowser, keyof typeof devices> = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};
const reporter = process.env.C8OFORMS_RUNNER_PROGRESS === '1'
  ? [['list'], ['./runner/progress-reporter.ts'], ['json', { outputFile: 'test-results/results.json' }]]
  : [['list'], ['json', { outputFile: 'test-results/results.json' }]];

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 3,
  reporter,
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Slow every action down so a tester can follow along in --headed mode.
    // Set C8OFORMS_SLOWMO to milliseconds (the runner UI drives this).
    launchOptions: { slowMo: Number(process.env.C8OFORMS_SLOWMO ?? 0) },
  },
  projects: [
    {
      // Logs in once and saves the session to STORAGE_STATE.
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices[deviceName[browserName]], browserName },
    },
    {
      name: browserName,
      use: { ...devices[deviceName[browserName]], browserName, storageState: STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
});
