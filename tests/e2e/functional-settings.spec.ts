import { test } from '@playwright/test';
import {
  verifyGdprViewerToastConfigurationThroughUi,
  verifyGdprMenuLanguageConfigurationThroughUi,
  manageHomePagePreferenceThroughSettingsUi,
  manageMcpTokenThroughSettingsUi,
  verifyCustomHeaderLogoServerSymbolThroughUi,
} from './helpers/functional-settings';
import { loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional settings contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('SET-001 - manage user MCP tokens', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await manageMcpTokenThroughSettingsUi(page);
  });

  test('SET-002 - manage default home page preference', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await manageHomePagePreferenceThroughSettingsUi(page);
  });

  test('SET-003 - custom header logo server symbol impacts the viewer', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await verifyCustomHeaderLogoServerSymbolThroughUi(page);
  });

  test('SET-003 - GDPR viewer toast configuration impacts the published viewer', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyGdprViewerToastConfigurationThroughUi(page);
  });

  test('SET-003 - GDPR menu configuration follows the active Studio language', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyGdprMenuLanguageConfigurationThroughUi(page);
  });
});
