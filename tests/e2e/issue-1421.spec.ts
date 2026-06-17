import { test, expect } from '@playwright/test';
import {
  ISSUE_1421_FIXTURE_TITLE,
  acceptRgpdIfVisible,
  findLegacyAnonymousFixture,
  isMissingConfigObject,
  login,
  openViewer,
} from './helpers/studio';

/**
 * Regression guard for https://github.com/convertigo/C8oForms/issues/1421
 * "Port anonymous form loading error handling improvements to 2.2.0"
 *
 * The real bug needs a CouchDB anonymous published document with NO config key
 * at all; recreating that exact legacy state through the current UI (or 2.1.12)
 * is no longer possible. So the test owns its precondition: beforeAll upserts the
 * four legacy FullSync documents from tests/fixtures/forms/1421 (idempotent,
 * admin-only — the same logic as `npm run seed:1421`), then the test reads it and
 * opens its anonymous viewer.
 */
test.beforeAll(async () => {
  // Dynamic import: the seed is an ESM .mjs and the spec is transpiled to CJS.
  const { ensureIssue1421Fixture } = await import('../fixtures/forms/1421/ensure-issue-1421-fixture.mjs');
  await ensureIssue1421Fixture();
});

test('#1421 - anonymous legacy form without config should still open', async ({ page, browser }, testInfo) => {
  test.setTimeout(90_000);

  await login(page);
  const fixture = await findLegacyAnonymousFixture(page);
  expect(
    fixture,
    [
      `Missing legacy anonymous fixture "${ISSUE_1421_FIXTURE_TITLE}".`,
      'Run: npm --prefix tests run seed:1421',
      'The seed inserts the four CouchDB fixture documents from tests/fixtures/forms/1421',
      'and verifies that the anonymous document has no top-level config property.',
    ].join(' '),
  ).not.toBeNull();
  expect(
    isMissingConfigObject(fixture!.anonymousDocument),
    'the legacy anonymous fixture must not contain a config object; missing only config.oneRespByPerson is not enough for #1421',
  ).toBe(true);

  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== 'string') {
    throw new Error('Playwright baseURL is required to open the anonymous viewer in an isolated context.');
  }

  const anonymousContext = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
  });
  const anonymousPage = await anonymousContext.newPage();
  const runtimeErrors: string[] = [];
  anonymousPage.on('pageerror', (error) => runtimeErrors.push(error.message));
  anonymousPage.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(message.text());
    }
  });

  try {
    await openViewer(anonymousPage, fixture!.publishedId, 'false', fixture!.anonymousKey);
    await acceptRgpdIfVisible(anonymousPage);

    const formTitle = anonymousPage.getByText(ISSUE_1421_FIXTURE_TITLE, { exact: true }).first();
    const insufficientPermissions = anonymousPage.getByText(
      /permissions suffisantes|sufficient permissions|permisos suficientes|permessi sufficienti/i,
    );
    const configErrorPattern =
      /oneRespByPerson|Cannot read (properties|property).*config|Cannot read (properties|property).*undefined/i;

    const deadline = Date.now() + 30_000;
    let renderState = 'loading after 30000ms';
    while (Date.now() < deadline) {
      if (await formTitle.isVisible().catch(() => false)) {
        renderState = 'form-rendered';
        break;
      }
      if (await insufficientPermissions.first().isVisible().catch(() => false)) {
        renderState = 'insufficient-permissions';
        break;
      }
      const configError = runtimeErrors.find((message) => configErrorPattern.test(message));
      if (configError) {
        renderState = `runtime-error: ${configError.slice(0, 160)}`;
        break;
      }
      await anonymousPage.waitForTimeout(250);
    }

    expect(
      renderState,
      'the anonymous legacy form should render without permissions/config errors',
    ).toBe('form-rendered');

    await expect(
      insufficientPermissions,
      'the anonymous viewer should not show an insufficient-permissions error',
    ).toHaveCount(0);

    await anonymousPage.waitForTimeout(1_000);
    const configErrors = runtimeErrors.filter((message) => configErrorPattern.test(message));
    expect(configErrors, 'loading should tolerate the missing config object').toEqual([]);
  } finally {
    await anonymousContext.close();
  }
});
