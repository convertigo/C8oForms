import { test } from '@playwright/test';
import { OPERATOR_CASES, OPERATOR_SOURCES, runVisibilityCases } from './helpers/visibility-matrix';

/**
 * Standalone (non-ticket) coverage: every condition operator the Visibility UI
 * exposes resolves correctly in the viewer — equals, different, contains,
 * not_contains, greater, greaterequals, minus, minusequals, is_filled, is_empty
 * (text/numeric source), and among_following / out_following (checkbox source
 * with a default-selected value), in both the visible and hidden directions.
 * UI-authored, no document writes. See helpers/visibility-matrix.ts.
 */
test('Visibility: every condition operator resolves in the viewer (UI-authored)', async ({ page }) => {
  test.setTimeout(450_000);
  await runVisibilityCases(page, 'Visibility operators', OPERATOR_SOURCES, OPERATOR_CASES);
});
