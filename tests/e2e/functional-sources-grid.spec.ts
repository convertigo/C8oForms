import { test } from './fixtures';
import {
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

  test('CMP-GRID-001 - Grid source footer and pagination', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseGridSourceFooterAndPaginationThroughUi(page);
  });

  test('CMP-GRID-002 - Grid filter sort row selection and reload', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseGridFilterSortSelectionAndReloadThroughUi(page);
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
