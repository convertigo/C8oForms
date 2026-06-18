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
 * Regression test for the REOPENED part of
 * https://github.com/convertigo/C8oForms/issues/1412
 * Reported 2026-06-12 by gregory-vorbe: after setting a height then clearing the
 * field, the map collapses instead of falling back to its ~400px default — in
 * both the editor and the viewer.
 *
 * Root cause: a side effect of the first fix (089c2e51c), which appends "px" to
 * the value and turns an empty string into the invalid CSS "px".
 *
 * STATUS: OPEN. This test is EXPECTED TO FAIL until the bug is fixed — it is a
 * red reminder that there is work to do, not a flake. Do NOT mark it test.fail():
 * we want it red so it is fixed. When the fix lands it turns green on its own;
 * then record the fixed version in regression-manifest.json.
 *
 * Each test builds its own fresh one-map fixture through the UI (createFormWithMap)
 * — no dependency on a pre-existing document, full per-test isolation.
 */
const DATA_TAB = /donnees.*interactions|data.*interactions/i;
const DEFAULT_HEIGHT_MIN = 300; // a correct fallback renders ~400px; the bug collapses to ~44px

test('#1412 (reopened) — clearing the height should fall back to the default (editor and viewer)', async ({
  page,
}) => {
  await login(page);
  // createFormWithMap leaves the map visible.
  await createFormWithMap(page, { technicalId: 'map_repro' });

  // Set a height, then clear it.
  await openComponentConfig(page, SEL.mapComponent);
  await openConfigTab(page, DATA_TAB);
  await setMapHeightAndClose(page, '550');

  await openComponentConfig(page, SEL.mapComponent);
  await openConfigTab(page, DATA_TAB);
  await setMapHeightAndClose(page, '');

  // Editor: a cleared height should fall back to the ~400px default, not collapse.
  expect(await mapHeight(page), 'editor: the map must not collapse after clearing the height').toBeGreaterThanOrEqual(
    DEFAULT_HEIGHT_MIN,
  );

  // Viewer: same expectation in the rendered preview.
  await openPreview(page);
  expect(await mapHeight(page), 'viewer: the map must not collapse after clearing the height').toBeGreaterThanOrEqual(
    DEFAULT_HEIGHT_MIN,
  );
});
