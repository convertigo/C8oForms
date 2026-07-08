import { test } from './fixtures';
import { runSingleTypeVisibility } from './helpers/visibility-matrix';

/**
 * Standalone (non-ticket) coverage: simple Visibility conditions show and hide
 * the chart type in batch B4. Chart is split into one form per assertion because
 * adding two charts in the same Firefox editor session is slow and unstable.
 * UI-authored, no document writes. See helpers/visibility-matrix.ts.
 */
test('Visibility: applies to chart component type - batch B4 visible (UI-authored)', async ({ page }) => {
  test.setTimeout(240_000);
  await runSingleTypeVisibility(page, 'Visibility chart visible B4', 'chart', true);
});

test('Visibility: applies to chart component type - batch B4 hidden (UI-authored)', async ({ page }) => {
  test.setTimeout(240_000);
  await runSingleTypeVisibility(page, 'Visibility chart hidden B4', 'chart', false);
});
