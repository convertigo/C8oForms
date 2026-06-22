import { Page, expect, test } from '@playwright/test';
import {
  SEL,
  c8oCall,
  createMcpTokenThroughSettingsUi,
  expectMcpTokenListed,
  login,
  openSettings,
  revokeMcpTokenThroughSettingsUi,
} from './helpers/studio';

/**
 * Characterization test for https://github.com/convertigo/C8oForms/issues/1404
 * Broken version: 2.2.0-beta209, before the MCP token settings UI existed.
 * Fixed version: 2.2.0-beta210, by 37734999.
 * Root cause: users had no Settings UI to create, list, copy-once, or revoke
 * their own MCP bearer tokens; 37734999 added the settings section and token
 * management sequences.
 * This test does not manipulate a C8oForms form fixture.
 */
test.setTimeout(120_000);

type McpTokenInfo = {
  name?: string;
  status?: string;
  token?: string;
};

function mcpResult(response: Record<string, unknown>): Record<string, unknown> {
  const document = response.document as Record<string, unknown> | undefined;
  return ((response.result as Record<string, unknown> | undefined) ?? (document?.result as Record<string, unknown> | undefined) ?? {});
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

test('#1404 - user settings manage MCP tokens without revealing existing token values', async ({ page }) => {
  const tokenName = `Issue 1404 ${Date.now()}`;
  let rawToken = '';

  await test.step('login and open settings', async () => {
    await login(page);
    await openSettings(page);
    await expect(page.locator(SEL.settingsMcpUrl), 'the MCP server URL should be displayed').toContainText(
      '/convertigo/api/mcp',
      { timeout: 30_000 },
    );
  });

  await test.step('create a named MCP token through Settings', async () => {
    rawToken = await createMcpTokenThroughSettingsUi(page, tokenName);
    expect(rawToken, 'the raw token should be shown immediately after creation').toMatch(/\S{20,}/);
    await expectMcpTokenStatus(page, tokenName, 'active');

    const safeList = await c8oCall(page, 'APIV2_McpTokenList', {});
    expect(JSON.stringify(safeList), 'listing existing MCP tokens should not return the raw token').not.toContain(rawToken);
  });

  await test.step('reload settings and confirm the raw token is no longer visible', async () => {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('page-settingspage').waitFor({ state: 'attached', timeout: 60_000 });
    await expect(page.locator(SEL.settingsMcpRoot), 'the MCP tokens settings section should reload').toBeVisible({
      timeout: 30_000,
    });
    await expectMcpTokenListed(page, tokenName);
    await expect(page.locator(SEL.settingsMcpCreatedToken), 'the one-shot token area should disappear after reload').toHaveCount(
      0,
      { timeout: 10_000 },
    );
    await expect(page.locator(SEL.settingsMcpRoot), 'existing token values must not be rendered again').not.toContainText(
      rawToken,
    );
    expect((await mcpTokenByName(page, tokenName))?.token, 'stored token metadata should not include the raw token').toBeUndefined();
  });

  await test.step('revoke the MCP token through Settings', async () => {
    await revokeMcpTokenThroughSettingsUi(page, tokenName);
    await expectMcpTokenStatus(page, tokenName, 'revoked');
  });
});
