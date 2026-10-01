import { test } from '@playwright/test';
import {
  assertSelectorFiltersThroughUi,
  expectInvalidUsernamePasswordLoginRejected,
  expectForgottenPasswordModalOpensAndCloses,
  expectLoginSymbolsThroughUi,
  expectNoCodeDashboardReady,
  expectProtectedRouteRedirectsToLogin,
  expectSelectorUserSearchFilterVisibilityThroughUi,
  loginWithUsernamePassword,
  logoutFromNoCodeDashboard,
} from './helpers/functional-studio';
import { loginAsAdminWithUsernamePassword } from './helpers/functional-admin';

// Authoring tests that need their own sign-in state, so they keep Playwright's
// fresh per-test context instead of the shared signed-in one of ./fixtures:
// the login form and forgotten-password modal need a signed-out start, logout
// would sign the shared context out, and login() never switches an already
// signed-in context to the admin account.
test.describe('No-Code Studio functional authoring - sign-in and identity', () => {
  test.describe.configure({ timeout: 180_000 });

  // #1064/#1073: the current login-card redesign remains usable end to end.
  test('AUTH-001 - log in with the current username/password test user', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await expectNoCodeDashboardReady(page);
  });

  test('AUTH-002 - log out and redirect protected routes to login', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await logoutFromNoCodeDashboard(page);
    await expectProtectedRouteRedirectsToLogin(page);
  });

  // #1073: the redesigned login page preserves explicit invalid-login feedback.
  test('AUTH-005 - reject invalid username/password credentials', async ({ page }) => {
    await expectInvalidUsernamePasswordLoginRejected(page);
  });

  // #1064/#1073: the redesigned card preserves the forgotten-password journey.
  test('AUTH-006 - open and close the forgotten password modal', async ({ page }) => {
    await expectForgottenPasswordModalOpensAndCloses(page);
  });

  /**
   * #1259 was reported while 2.2.0-beta95 was current. The initial change in
   * 8fa88725 added C8Oforms.IdentifierPlaceHolderValue in 2.2.0-beta96, but QA
   * found in 2.2.0-beta120 that C8Oforms.IdentifierValue still left the static
   * translated "Username" label on screen. Commit 384db01d bound that label to
   * the discovered symbol value with its translation as fallback; it first
   * shipped in 2.2.0-beta177 and was historically validated in 2.2.0-beta178.
   *
   * #1391 was reported in 2.2.0-beta178. Commit 59e76b4d exposed the
   * customHeaderDescription, customContentTitle, and customContentDescription
   * server symbols in 2.2.0-beta200; QA historically validated all three in
   * 2.2.0-beta205.
   *
   * This is a latest-only characterization. Its test-nocode runtime validation
   * remains pending; no historical red phase or deployment is part of this spec.
   */
  test('AUTH-007 #1259 #1391 - login labels, placeholder, and brand text honor server symbols', async ({ page }) => {
    test.setTimeout(360_000);
    await expectLoginSymbolsThroughUi(page);
  });

  test('APP-009 - selector filters', async ({ page }) => {
    test.setTimeout(240_000);
    await loginAsAdminWithUsernamePassword(page);
    await assertSelectorFiltersThroughUi(page);
  });

  /**
   * #1344 was reported while 2.2.0-beta138 was current. Commit acfe2bb8
   * restricted the selector's user-search block to administrators and first
   * shipped in 2.2.0-beta139; QA historically validated it in 2.2.0-beta142.
   * Current test-nocode runtime validation remains pending.
   */
  test('APP-011 #1344 - selector user search is hidden from non-administrators', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await expectSelectorUserSearchFilterVisibilityThroughUi(page, false);
  });

  test('APP-011 #1344 - selector user search remains available to administrators', async ({ page }) => {
    await loginAsAdminWithUsernamePassword(page);
    await expectSelectorUserSearchFilterVisibilityThroughUi(page, true);
  });
});
