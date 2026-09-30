import { test } from './fixtures';
import {
  assertExcludedGridColumnLeavesDisplayedCountThroughUi,
  assertFilteredGridSourceItemsSelectOnFirstClickThroughUi,
  assertGridJavaScriptFilterAwaitsAsyncValueThroughUi,
  assertGridLongTableNameLayoutThroughUi,
  assertGridMultipleRowSelectionCheckboxesThroughUi,
  assertGridSourceSearchPlaceholdersThroughUi,
  assertGridSourceColumnSearchFiltersLiveThroughUi,
  assertGridUrlColumnTypeAndRenderingThroughUi,
  assertMissingGridSourceTableErrorThroughUi,
  configureGridBaserowTableAndAssertViewerRowsThroughUi,
  exerciseGridFilterSortSelectionAndReloadThroughUi,
  exerciseGridSourceFooterAndPaginationThroughUi,
  exerciseGridTypedBaserowFormattingThroughUi,
} from './helpers/functional-sources';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

// Grid part of the sources contract; the Select/palette part lives in
// functional-sources-select.spec.ts and Chart/Map in functional-sources-chart-map.spec.ts.
// The contract is split so no single file outweighs a CI shard.
test.describe('No-Code Studio functional sources contract - Grid', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('SRC-002 - configure a Baserow table for Grid', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureGridBaserowTableAndAssertViewerRowsThroughUi(page);
  });

  // #1265: picker searches filter live, so their placeholders must not advertise Enter.
  test('SRC-012 #1265 - source searches no longer advertise Enter', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertGridSourceSearchPlaceholdersThroughUi(page);
  });

  /** #1288: reported in beta106, fixed by 47fce0da in beta108 and QA-validated in beta108. */
  test('SRC-013 #1288 - source column search filters without Enter', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertGridSourceColumnSearchFiltersLiveThroughUi(page);
  });

  /** #1270: reported in beta102, fixed by 581a0128 in beta105 and QA-validated in beta107. */
  test('SRC-014 #1270 - excluded columns leave the displayed count', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertExcludedGridColumnLeavesDisplayedCountThroughUi(page);
  });

  /**
   * #1277: reported while beta104 was current. Fixes 69b2d2be, 1e460bcf and
   * 6ae70dc3 shipped in beta105/beta108/beta111; QA validated beta112.
   */
  test('SRC-015 #1277 - long source table names stay truncated and selectable', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertGridLongTableNameLayoutThroughUi(page);
  });

  /**
   * #1254: reported in beta94, fixed by 6d029486 in beta98 and QA-validated in beta101.
   * #1264: reported while beta101 was current, fixed by ed29dce7 in beta103 and QA-validated in beta104.
   */
  test('SRC-016 #1254 #1264 - filtered source picker items reset search and select on one click', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertFilteredGridSourceItemsSelectOnFirstClickThroughUi(page);
  });

  // #1268 recognizes URL metadata; #1261 renders only typed URL fields as safe links.
  test('CMP-GRID-003 #1261 #1268 - URL source type and viewer links', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertGridUrlColumnTypeAndRenderingThroughUi(page);
  });

  test('CMP-GRID-001 - Grid source footer and pagination', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseGridSourceFooterAndPaginationThroughUi(page);
  });

  // #1269/#1304: individual hidden-column state persists, including when a row contains null.
  test('CMP-GRID-002 - Grid filter sort row selection and reload', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseGridFilterSortSelectionAndReloadThroughUi(page);
  });

  /**
   * #1250: reported while beta76 was current. Fix 4e2213be first shipped in
   * beta87; QA validated the async filter runtime in beta112.
   */
  test('CMP-GRID-002 #1250 - Grid JavaScript filter awaits its async value', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertGridJavaScriptFilterAwaitsAsyncValueThroughUi(page);
  });

  /** #1275: reported while beta104 was current, fixed by f2d7d0df and QA-validated in beta108. */
  test('CMP-GRID-002 #1275 - multiple-row selection checkboxes use Grid glyphs and stay aligned', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertGridMultipleRowSelectionCheckboxesThroughUi(page);
  });

  test('CMP-GRID-001 - Grid typed Baserow formatting', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseGridTypedBaserowFormattingThroughUi(page);
  });

  test('SRC-009 - missing Grid source table reports an error without loader', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertMissingGridSourceTableErrorThroughUi(page);
  });
});
