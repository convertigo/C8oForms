import { test } from './fixtures';
import { TYPE_BATCH_B1, runTypeVisibility } from './helpers/visibility-matrix';

/**
 * Standalone (non-ticket) coverage: a simple Visibility condition shows and hides
 * each form/content component type in batch B1: camera, table/grid, chart.
 * UI-authored, no document writes. See helpers/visibility-matrix.ts.
 */
test('Visibility: applies to every target component type - batch B1 (UI-authored)', async ({ page }) => {
  test.setTimeout(240_000);
  await runTypeVisibility(page, 'Visibility types B1', TYPE_BATCH_B1);
});
