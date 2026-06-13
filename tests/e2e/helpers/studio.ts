import { Page, expect } from '@playwright/test';

/**
 * Selectors are Convertigo priority CSS classes (classNNNN): the priority is
 * the stable bean id from the project YAML, so it survives rebuilds and
 * label/i18n changes. To resolve one, grep the priority in _c8oProject/.
 */
export const SEL = {
  // loginPage.yaml
  loginReveal: '.class1757337975297', // SubmitButton1
  emailInput: '.class1757337975207 input', // email > TextInput
  passwordInput: '.class1757337975249 input', // password > TextInput
  // editor — component overlay ("click to configure")
  componentOverlay: '.class1776441955089',
  // component config panel tabs (one bean repeated per tab, filtered by label)
  configTab: '.class1775835275881',
  // config panel close button
  configClose: '.class1775818868859',
  // MapDataInteractionsEditor.yaml — height setting input
  mapHeightInput: '.class1776769000114 input',
  // itemMapViewer.yaml — rendered leaflet map
  mapViewer: 'lib_leaflet-leafletmap.class1734447691502',
  // editorPage.yaml — "Aperçu" button opening the viewer/preview
  previewButton: '.class1773331718985',
  // editor canvas wrapper of a map component
  mapComponent: 'c8oforms-itemmapviewer',
  // selectorPage.yaml — the "blank form" card (bound to the createNewForm action)
  blankFormCard: '.class1645547241644',
  // ion-alert prompt shown by createNewForm (stable CSS classes set in the action code)
  createFormTitleInput: 'input.alert-input',
  createFormSaveButton: 'button.btn--createapp-save',
  // component config header — "Identifiant technique" input
  technicalIdInput: '.class1776763411136 input',
};

/**
 * Palette components share the same priority class, so the stable, non-i18n
 * discriminator is each tile's icon SVG filename. Extend as needed.
 */
export const PALETTE_ICON = {
  map: 'map.svg',
  textInput: 'icn_input_txt.svg',
  description: 'icn_title.svg',
  checkbox: 'icn_checkbox.svg',
  select: 'icn_select.svg',
  date: 'icn_calendar.svg',
  chart: 'icn_chart.svg',
  grid: 'icn_sheet.svg',
} as const;

// Credentials come from tests/.env (loaded by playwright.config.ts via dotenv),
// never hardcoded. See tests/.env.example. For this disposable account the
// password equals the login, so C8OFORMS_TEST_PASSWORD defaults to the user.
export const TEST_USER = process.env.C8OFORMS_TEST_USER ?? '';
export const TEST_PASSWORD = process.env.C8OFORMS_TEST_PASSWORD ?? TEST_USER;

export async function login(page: Page): Promise<void> {
  if (!TEST_USER) {
    throw new Error(
      'Test user not configured. Copy tests/.env.example to tests/.env and set C8OFORMS_TEST_USER.',
    );
  }
  await page.goto('./', { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator(SEL.loginReveal).first().click();
  const email = page.locator(SEL.emailInput);
  await email.waitFor({ state: 'visible', timeout: 15_000 });
  await email.fill(TEST_USER);
  await page.locator(SEL.passwordInput).fill(TEST_PASSWORD);
  await page.locator(SEL.loginReveal).first().click();
  await page.waitForURL('**/selector/**', { timeout: 30_000 });
}

/** The editor keeps live connections open: never wait for networkidle here. */
export async function openEditor(page: Page, formId: string): Promise<void> {
  await page.goto(`./editor/${formId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
}

/**
 * Open a component's configuration panel.
 *
 * Two quirks of the editor make this non-trivial, and both bite silently:
 * 1. The "click to configure" overlay is shown on **mouse-enter** of the
 *    component, and it is not a DOM descendant of the component — it only
 *    covers it geometrically. After closing the panel the cursor is already
 *    inside the zone, so no enter fires and the overlay stays hidden. We move
 *    the mouse out, then back over the component, to force the enter.
 * 2. There can be several overlays on the canvas, so we click the one whose box
 *    contains the component's center (clamped near the top for tall components).
 */
export async function openComponentConfig(page: Page, componentTag: string): Promise<void> {
  const comp = page.locator(componentTag).first();
  await comp.waitFor({ state: 'visible', timeout: 30_000 });
  await comp.scrollIntoViewIfNeeded();

  await page.mouse.move(5, 5); // leave the component zone so re-entering fires mouse-enter
  await page.waitForTimeout(400);
  const box = await comp.boundingBox();
  if (box) {
    const yOffset = Math.min(Math.max(box.height / 2, 20), box.height - 5, 200);
    await page.mouse.move(box.x + box.width / 2, box.y + yOffset);
  }

  let overlayIndex = -1;
  for (let attempt = 0; attempt < 12 && overlayIndex < 0; attempt++) {
    await page.waitForTimeout(300);
    overlayIndex = await page.evaluate(
      ({ tag, overlaySel }) => {
        const target = document.querySelector(tag);
        if (!target) return -1;
        const t = target.getBoundingClientRect();
        const cx = t.x + t.width / 2;
        const cy = t.y + Math.min(t.height / 2, 200);
        return [...document.querySelectorAll(overlaySel)].findIndex((o) => {
          const r = o.getBoundingClientRect();
          return r.width > 0 && cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height;
        });
      },
      { tag: componentTag, overlaySel: SEL.componentOverlay },
    );
  }
  expect(overlayIndex, `no config overlay covers ${componentTag}`).toBeGreaterThanOrEqual(0);
  await page.locator(SEL.componentOverlay).nth(overlayIndex).click();
  await expect(page.locator(SEL.configClose).first()).toBeVisible({ timeout: 15_000 });
}

/** Rendered height (px) of the first leaflet map on the page. */
export async function mapHeight(page: Page): Promise<number> {
  return page
    .locator(SEL.mapViewer)
    .first()
    .evaluate((el) => Math.round(el.getBoundingClientRect().height));
}

/**
 * Set the map height in the open Data & Interactions panel and close it.
 * Pass an empty string to clear the field (back to default).
 */
export async function setMapHeightAndClose(page: Page, value: string): Promise<void> {
  const input = page.locator(SEL.mapHeightInput).first();
  await input.waitFor({ state: 'visible', timeout: 15_000 });
  await input.fill(value);
  await page.waitForTimeout(1_000); // editor applies the value through a change handler
  await closeComponentConfig(page);
  await page.waitForTimeout(1_500);
}

/** Click "Aperçu" and wait for the viewer/preview to render the form. */
export async function openPreview(page: Page): Promise<void> {
  await page.locator(SEL.previewButton).first().click();
  await page.waitForURL('**/viewer/**', { timeout: 30_000 });
  await page.locator(SEL.mapViewer).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_000);
}

export async function openConfigTab(page: Page, label: string): Promise<void> {
  await page.locator(SEL.configTab).filter({ hasText: label }).first().click();
}

export async function closeComponentConfig(page: Page): Promise<void> {
  await page.locator(SEL.configClose).first().click();
  await page.locator(SEL.configClose).waitFor({ state: 'hidden', timeout: 15_000 });
}

// ── Authoring journeys (reusable building blocks) ───────────────────────────
// These drive the real UI, so they double as tests of each journey AND as a way
// for any spec to build its own fixture instead of relying on a pre-existing
// form. Run them against a current version — the authoring UI selectors are not
// guaranteed stable on the older versions used for red/green verification.

/**
 * From the selector/home (where login lands), create a blank form and land in
 * the editor. Returns the new form's id (from the editor URL).
 */
export async function createBlankForm(page: Page, title = `E2E ${Date.now()}`): Promise<string> {
  await page.locator(SEL.blankFormCard).first().click();
  const input = page.locator(SEL.createFormTitleInput);
  await input.waitFor({ state: 'visible', timeout: 15_000 });
  await input.fill(title);
  await page.locator(SEL.createFormSaveButton).click();
  await page.waitForURL('**/editor/**', { timeout: 30_000 });
  const id = page.url().match(/editor\/(\d+)/)?.[1];
  if (!id) throw new Error('could not read the new form id from the editor URL');
  // Wait for the editor to be interactive (palette rendered) before returning,
  // otherwise a follow-up addComponent fires before the canvas can accept it.
  await page.locator('[draggable="true"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_500);
  return id;
}

/**
 * Add a component to the current page by double-clicking its palette tile.
 * `icon` is the tile's icon filename — use a PALETTE_ICON entry. Verifies the
 * add took (the palette dblclick occasionally only selects the tile), retrying
 * once.
 */
export async function addComponent(page: Page, icon: string): Promise<void> {
  const tile = page.locator(`[draggable="true"]:has(img[src$="${icon}"])`).first();
  const before = await countComponents(page);
  for (let attempt = 0; attempt < 2; attempt++) {
    await tile.scrollIntoViewIfNeeded();
    await tile.dblclick();
    try {
      await expect.poll(() => countComponents(page), { timeout: 8_000 }).toBeGreaterThan(before);
      return;
    } catch {
      // selected but not added — try again
    }
  }
  throw new Error(`component with icon ${icon} was not added to the page`);
}

/** Count component nodes on the canvas (their tag starts with c8oforms-item…). */
export async function countComponents(page: Page): Promise<number> {
  return page.evaluate(
    () => [...document.querySelectorAll('*')].filter((e) => e.tagName.toLowerCase().startsWith('c8oforms-item')).length,
  );
}

/**
 * Rename the technical identifier of the component whose config panel is open.
 */
export async function setTechnicalId(page: Page, value: string): Promise<void> {
  const input = page.locator(SEL.technicalIdInput).first();
  await input.waitFor({ state: 'visible', timeout: 15_000 });
  await input.fill(value);
  await input.blur();
  await page.waitForTimeout(1_500); // editor persists the rename on blur
}

/**
 * Full fixture builder: create a blank form, add a map, name it `technicalId`,
 * and return the form id. Leaves you in the editor with the map present and the
 * config panel closed. Used by specs that need a one-map form without depending
 * on a pre-existing document.
 */
export async function createFormWithMap(
  page: Page,
  opts: { title?: string; technicalId?: string } = {},
): Promise<string> {
  const id = await createBlankForm(page, opts.title ?? `Repro map ${Date.now()}`);
  await addComponent(page, PALETTE_ICON.map);
  await page.locator(SEL.mapViewer).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, SEL.mapComponent);
  await setTechnicalId(page, opts.technicalId ?? 'map_repro');
  await closeComponentConfig(page);
  return id;
}
