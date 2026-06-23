// Uses the default per-test context (NOT the shared persistent one from
// fixtures.ts): #1421 must authenticate as the PRIMARY account so the legacy
// fixture's FullSync ACL matches. The shared context is pre-authenticated as the
// shard's own user and login() won't switch an already-open session, so on any
// non-primary shard (e.g. firefox shard 1 = user5) the fixture would be invisible.
import { test, expect } from '@playwright/test';
import {
  ISSUE_1421_FIXTURE_TITLE,
  PRIMARY_TEST_PASSWORD,
  PRIMARY_TEST_USER,
  acceptRgpdIfVisible,
  findLegacyAnonymousFixture,
  isMissingConfigObject,
  login,
  openAnonymousPwa,
} from './helpers/studio';

/**
 * Regression guard for https://github.com/convertigo/C8oForms/issues/1421
 * "Port anonymous form loading error handling improvements to 2.2.0"
 *
 * The real bug needs a CouchDB anonymous published document with NO config key
 * at all; recreating that exact legacy state through the current UI (or 2.1.12)
 * is no longer possible. So the test owns its precondition: beforeAll upserts the
 * four legacy FullSync documents from tests/fixtures/forms/1421 PLUS the two
 * documents a real "publish anonymous" creates server-side — the anonymous user
 * account (lib_usermanager_fullsync, password = the anonymous key, hashed
 * sha1Hex(key + '+' + salt)) and its group membership (c8ofullsyncgrp) — without
 * which the anonymous form is unreachable (insufficient permissions / 403).
 *
 * It then opens the form the way an end user does: the standalone PWA at
 * <DisplayObjects>/pwas/<anonymousKey>/index.html (served dynamically by the
 * engine). The studio /viewer route is auth-gated and shows "Unknown user" even
 * for a correctly published anonymous form, so openAnonymousPwa is used instead.
 */
test.beforeAll(async () => {
  // Dynamic import: the seed is an ESM .mjs and the spec is transpiled to CJS.
  const { ensureIssue1421Fixture } = await import('../fixtures/forms/1421/ensure-issue-1421-fixture.mjs');
  await ensureIssue1421Fixture();
});

test('#1421 - anonymous legacy form without config should still open', async ({ page, browser }, testInfo) => {
  test.setTimeout(90_000);

  await login(page, { user: PRIMARY_TEST_USER, password: PRIMARY_TEST_PASSWORD });
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
    await openAnonymousPwa(anonymousPage, fixture!.anonymousKey);
    await acceptRgpdIfVisible(anonymousPage);

    const formTitle = anonymousPage.getByText(ISSUE_1421_FIXTURE_TITLE, { exact: true }).first();
    const configErrorPattern =
      /oneRespByPerson|Cannot read (properties|property).*config|Cannot read (properties|property).*undefined/i;

    const deadline = Date.now() + 30_000;
    let renderState = 'loading after 30000ms';
    while (Date.now() < deadline) {
      if (await formTitle.isVisible().catch(() => false)) {
        renderState = 'form-rendered';
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

    await anonymousPage.waitForTimeout(1_000);
    const configErrors = runtimeErrors.filter((message) => configErrorPattern.test(message));
    expect(configErrors, 'loading should tolerate the missing config object').toEqual([]);
  } finally {
    await anonymousContext.close();
  }
});
