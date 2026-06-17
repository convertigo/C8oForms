import { test } from '@playwright/test';
import { TYPE_BATCH_A, runTypeVisibility } from './helpers/visibility-matrix';

/**
 * Standalone (non-ticket) coverage: a simple Visibility condition shows and hides
 * each form/content component type in batch A — text, checkbox, checkbox group,
 * description, select, radio, radio grid, slider, date, time. UI-authored, no
 * document writes. See helpers/visibility-matrix.ts.
 */
test('Visibility: applies to every target component type — batch A (UI-authored)', async ({ page }) => {
  test.setTimeout(450_000);
  await runTypeVisibility(page, 'Visibility types A', TYPE_BATCH_A);
});
