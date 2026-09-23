import { test } from '@playwright/test';
import {
  assertSelectorFiltersThroughUi,
  expectInvalidUsernamePasswordLoginRejected,
  expectForgottenPasswordModalOpensAndCloses,
  expectNoCodeDashboardReady,
  expectProtectedRouteRedirectsToLogin,
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

  test('AUTH-001 - log in with the current username/password test user', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await expectNoCodeDashboardReady(page);
  });

  test('AUTH-002 - log out and redirect protected routes to login', async ({ page }) => {
    await loginWithUsernamePassword(page);
    await logoutFromNoCodeDashboard(page);
    await expectProtectedRouteRedirectsToLogin(page);
  });

  test('AUTH-005 - reject invalid username/password credentials', async ({ page }) => {
    await expectInvalidUsernamePasswordLoginRejected(page);
  });

  test('AUTH-006 - open and close the forgotten password modal', async ({ page }) => {
    await expectForgottenPasswordModalOpensAndCloses(page);
  });

  test('APP-009 - selector filters', async ({ page }) => {
    test.setTimeout(240_000);
    await loginAsAdminWithUsernamePassword(page);
    await assertSelectorFiltersThroughUi(page);
  });
});
