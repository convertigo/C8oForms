import { test } from '@playwright/test';
import { TYPE_BATCH_B, runTypeVisibility } from './helpers/visibility-matrix';

/**
 * Standalone (non-ticket) coverage: a simple Visibility condition shows and hides
 * each form/content component type in batch B — camera, table/grid, chart, map,
 * barcode, file import, signature, location, button. Layout containers (group,
 * horizontal layout) are out of scope — layout has #1363. UI-authored, no
 * document writes. See helpers/visibility-matrix.ts.
 */
test('Visibility: applies to every target component type — batch B (UI-authored)', async ({ page }) => {
  test.setTimeout(450_000);
  await runTypeVisibility(page, 'Visibility types B', TYPE_BATCH_B);
});
