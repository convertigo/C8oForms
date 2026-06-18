import { test, expect } from '@playwright/test';
import {
  SEL,
  login,
  createFormWithMap,
  openComponentConfig,
  openConfigTab,
  setMapHeightAndClose,
  openPreview,
  mapHeight,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1412
 * "Map height breaks after opening Data & Interactions"
 *
 * Found in 2.2.0-beta214, fixed by 089c2e51c (first released in 2.2.0-beta221).
 * Root cause: the Data & Interactions editor stored config.minHeight without the
 * px unit, producing invalid CSS that collapsed the map to ~44px — in both the
 * editor canvas and the rendered viewer.
 *
 * Each test builds its own fresh one-map fixture through the UI (createFormWithMap)
 * — no dependency on a pre-existing document, full per-test isolation.
 */
const DATA_TAB = /donnees.*interactions|data.*interactions/i;

test('#1412 — a configured height applies to the map (editor and viewer)', async ({ page }) => {
  await login(page);
  // createFormWithMap leaves the map visible. A missing map means a broken setup,
  // not a fixed bug.
  await createFormWithMap(page, { technicalId: 'map_repro' });

  await openComponentConfig(page, SEL.mapComponent);
  await openConfigTab(page, DATA_TAB);
  await setMapHeightAndClose(page, '600');

  // Editor canvas
  await expect
    .poll(() => mapHeight(page), {
      message: 'editor: the map should be ~600px tall',
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(550);

  // Rendered viewer (Aperçu) — the bug collapsed this one too
  await openPreview(page);
  await expect
    .poll(() => mapHeight(page), {
      message: 'viewer: the map should be ~600px tall',
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(550);
});
