import { test } from './fixtures';
import {
  assertBaserowSourcePickerIsolationThroughUi,
  configureSelectBaserowTableAndAssertPersistenceThroughUi,
  configureSelectSourceFilterJavaScriptPaletteValueThroughUi,
  exerciseSourcePaletteSectionsCollapseAndDragThroughUi,
  filterSelectBaserowSourceByHiddenTextColumnThroughUi,
  openSourceSelectionPanelFromSelectThroughUi,
  sortSelectBaserowSourceByHiddenColumnThroughUi,
} from './helpers/functional-sources';
import {
  createBlankApplicationThroughUi,
  functionalSecondaryMcpToken,
  functionalSecondaryUserCredentials,
  loginWithUsernamePassword,
} from './helpers/functional-studio';
import { ensureFunctionalUserIfPossible } from './helpers/functional-users';

// Select and Source Palette part of the sources contract; Grid lives in
// functional-sources-grid.spec.ts and Chart/Map in functional-sources-chart-map.spec.ts.
test.describe('No-Code Studio functional sources contract - Select and palette', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('SRC-001 - open source selection panel from a compatible component', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await openSourceSelectionPanelFromSelectThroughUi(page);
  });

  test('SRC-003 - configure Select from Baserow', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureSelectBaserowTableAndAssertPersistenceThroughUi(page);
  });

  test('SRC-006 - filter Select source by hidden text column', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await filterSelectBaserowSourceByHiddenTextColumnThroughUi(page);
  });

  test('SRC-006 - configure Select source filter JavaScript palette value', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureSelectSourceFilterJavaScriptPaletteValueThroughUi(page);
  });

  test.fixme('SRC-006 - JavaScript source filter runtime behavior contract', async () => {
    // Requires a product contract: current exploration persisted the JS value but viewer rows stayed unfiltered.
  });

  test('SRC-007 - sort Select source by hidden column', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await sortSelectBaserowSourceByHiddenColumnThroughUi(page);
  });

  test('SRC-008 - Source Palette sections collapse and drag payload', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseSourcePaletteSectionsCollapseAndDragThroughUi(page);
  });

  test('SRC-010 - Baserow source picker isolates configured users', async ({ page, browser }) => {
    test.setTimeout(600_000);
    const secondaryUser = functionalSecondaryUserCredentials();
    const secondaryMcpToken = functionalSecondaryMcpToken();
    const primaryMcpToken = process.env.C8OFORMS_MCP_TOKEN ?? process.env['greg-forms-codex'];
    test.skip(
      !secondaryUser || !secondaryMcpToken || !primaryMcpToken,
      'Set C8OFORMS_FUNCTIONAL_SECONDARY_USER/PASSWORD or CONVERTIGO_ADMIN_PASSWORD, plus C8OFORMS_FUNCTIONAL_SECONDARY_MCP_TOKEN, to run Baserow source isolation.',
    );

    await ensureFunctionalUserIfPossible(secondaryUser!);
    await loginWithUsernamePassword(page);
    await assertBaserowSourcePickerIsolationThroughUi(page, browser, secondaryUser!, secondaryMcpToken!);
  });
});
