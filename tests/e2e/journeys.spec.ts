import { test, expect } from '@playwright/test';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  countComponents,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Authoring smoke journeys — one test per core action a user takes to build a
 * form. They exercise the real UI and the same helpers other specs reuse, so
 * each new ticket composes these helpers instead of re-testing these paths.
 * Each test is independent and builds its own form.
 *
 * Run against a current version — the authoring UI is not guaranteed identical
 * on the older versions used for red/green regression verification.
 */

// Opt out of the shared authenticated storage state: these journeys (especially
// "log in") must exercise the real login UI from a clean, unauthenticated
// context, instead of starting from the pre-saved session every other spec uses.
test.use({ storageState: undefined });

test('journey: log in', async ({ page }) => {
  await login(page);
  // Landing on the authenticated home: the blank-form card is only there once
  // logged in.
  await expect(page.locator(SEL.blankFormCard).first()).toBeVisible({ timeout: 15_000 });
});

test('journey: create a blank form', async ({ page }) => {
  await login(page);
  const id = await createBlankForm(page, `Journey create ${Date.now()}`);
  expect(id, 'a new form id is returned from the editor URL').toMatch(/^\d+$/);
  expect(await countComponents(page), 'the new form starts blank').toBe(0);
});

test('journey: add a Map component', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Journey add ${Date.now()}`);
  await addComponent(page, PALETTE_ICON.map);
  await expect(page.locator(SEL.mapViewer).first()).toBeVisible({ timeout: 30_000 });
  expect(await countComponents(page), 'the page now has a component').toBeGreaterThan(0);
});

test('journey: rename a component technical identifier', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Journey rename ${Date.now()}`);
  await addComponent(page, PALETTE_ICON.map);
  await page.locator(SEL.mapViewer).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, SEL.mapComponent);
  await setTechnicalId(page, 'map_repro');
  await expect(page.locator(SEL.technicalIdInput).first()).toHaveValue('map_repro');
});
