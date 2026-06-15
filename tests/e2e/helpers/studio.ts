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
  editorHomeButton: 'ion-button.class1774605933364',
  visibilityModeButton: 'button.class1775840591959',
  visibilityAddConditionButton: 'ion-button.class1758191882601',
  conditionFieldInput: '.class1758189195703 input',
  conditionFieldBrowseButton: 'ion-button.class1758189195718',
  conditionOperatorSelect: 'ion-select.class1758189195757',
  conditionValueTagInput: 'tag-input input',
  // sharedQuestionElem.yaml -> dataSourceEditor_GridRow_GridColSourcePicker_Group
  sourcePalette: '.class1775922875303',
  sourcePaletteCollapseAllButton: 'ion-button.class1780921035700',
  publishedApplicationsTab: 'ion-button.class1761754757348',
  cardMenuButton: 'ion-button.class1606574763560',
  publishedPwaMenuItem: 'ion-popover ion-item.class1603801509434',
  pwaEditModal: 'ion-modal.modal-pwa-edition',
  pwaAccessToggle: 'c8oforms-toggleswitch.class1779878486939',
  pwaAccessToggleButton: 'button.class1775840591959',
  pwaSaveButton: 'ion-button.class1762425668421',
};

export const SOURCE_PALETTE_SECTION = {
  router: { header: '.class1732284059236', body: '.class1732284059272' },
  application: { header: '.class1732284059317', body: '.class1732284059353' },
  form: { header: '.class1732284059398', body: '.class1732284059434' },
  user: { header: '.class1732284059479', body: '.class1732284059515' },
  page: { header: '.class1732284059560', body: '.class1732284059596' },
  translation: { header: '.class1732284059641', body: '.class1732284059677' },
  c8o: { header: '.class1732284059722', body: '.class1732284059758' },
} as const;

export type SourcePaletteSection = keyof typeof SOURCE_PALETTE_SECTION;

export interface SourcePaletteSectionState {
  name: SourcePaletteSection;
  expanded: boolean;
  height: number;
  opacity: number;
  pointerEvents: string;
}

const DEFAULT_SOURCE_PALETTE_SECTIONS: SourcePaletteSection[] = [
  'router',
  'application',
  'form',
  'user',
  'page',
  'translation',
  'c8o',
];

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

type JsonRecord = Record<string, unknown>;

export type FormElement = JsonRecord & {
  id?: number;
  name: string;
  type: string;
  config?: JsonRecord & { page?: string };
};

export interface CreatedFormDocument {
  id: string;
  document: JsonRecord;
  pageTechName: string;
}

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

export async function openViewer(page: Page, formId: string, mode = ':edit', response = ':i'): Promise<void> {
  await page.goto(`./viewer/${formId}/${mode}/${response}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
}

export async function c8oCall(page: Page, sequence: string, params: Record<string, unknown>): Promise<JsonRecord> {
  return page.evaluate(
    async ({ sequenceName, sequenceParams }) => {
      const formData = new FormData();
      formData.append('__project', 'C8Oforms');
      formData.append('__sequence', sequenceName);
      for (const [key, value] of Object.entries(sequenceParams)) {
        if (value === undefined || value === null) continue;
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      }

      const response = await fetch(`${location.origin}/convertigo/projects/C8Oforms/.json`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const text = await response.text();
      let json: Record<string, unknown>;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`C8o ${sequenceName} returned non-JSON: ${text.slice(0, 300)}`);
      }
      if (!response.ok || (json as { error?: unknown }).error) {
        throw new Error(`C8o ${sequenceName} failed: ${JSON.stringify(json).slice(0, 500)}`);
      }
      return json;
    },
    { sequenceName: sequence, sequenceParams: params },
  );
}

export async function getFormDocument(page: Page, formId: string): Promise<JsonRecord> {
  const response = await c8oCall(page, 'APIV2_getDocument', { id: formId });
  const doc = (response.res ?? (response as { document?: unknown }).document) as JsonRecord | undefined;
  if (!doc || typeof doc !== 'object') {
    throw new Error(`APIV2_getDocument did not return a document for ${formId}`);
  }
  return doc;
}

export async function getPwaDocument(page: Page, formId: string): Promise<JsonRecord | null> {
  const id = formId.startsWith('published_') ? formId : `published_${formId}`;
  const response = await c8oCall(page, 'APIV2_getPWA', { id: `${id}_pwa_document` }).catch(() => null);
  return ((response?.res as JsonRecord | undefined)?.pwa as JsonRecord | undefined) ?? null;
}

export async function publishFormWithPwa(
  page: Page,
  formId: string,
  pwa: JsonRecord & { notAnonymous: boolean },
): Promise<void> {
  const form = await getFormDocument(page, formId);
  await c8oCall(page, 'APIV2_Publish', {
    id: formId,
    rev: form._rev,
    meta: JSON.stringify({
      publishing: true,
      pwa: {
        backgroundColor: '#ffffff',
        name: String(form.name ?? `PWA ${formId}`),
        shortName: String(form.name ?? `PWA ${formId}`),
        themeColor: '#0cbbe7',
        querystr: '',
        thumbnail: {
          fromVar: false,
          fromId: formId,
          content_type: '',
        },
        originalThumbnail: (form.thumbnail as JsonRecord | undefined) ?? defaultThumbnail(),
        originalFormId: `published_${formId}`,
        ...pwa,
      },
    }),
  });
}

export async function createFormDocument(
  page: Page,
  title: string,
  elements: FormElement[] = [],
): Promise<CreatedFormDocument> {
  const now = Date.now();
  const pageTechName = `Page${now}`;
  const preparedElements = elements.map((element, index) => ({
    ...element,
    id: element.id ?? now + index + 1,
    config: {
      ...(element.config ?? {}),
      page: element.config?.page ?? pageTechName,
    },
  }));

  const document = {
    name: title,
    tag: '',
    formulaire: preparedElements,
    flows: [
      { id: 'formulas', name: 'Formulas', elements: [] },
      { id: 'submit', name: 'Submit', elements: [] },
    ],
    actions: [],
    technicalVersion: '1.0.20',
    config: {
      schemaVersion: 1,
      editor: true,
    },
    pages: [
      {
        name: 'Page 1',
        pageTechName,
        desc: '',
        positionTab: 'bottom',
        enabledTab: false,
        included: true,
        enabledButtons: true,
        positionButtons: 'tab',
        iconName: 'sticky-note',
        checkMandatoryInCurrentPage: true,
        individualNavigation: false,
      },
    ],
    navigation: {
      included: true,
      positionTab: 'bottom',
      enabledTab: false,
      enabledButtons: true,
      positionButtons: 'standard',
      checkMandatoryInCurrentPage: true,
      appliedConfiguration: 'global',
    },
    globalNavigationEnabled: false,
    loopToForm: true,
    thumbnail: defaultThumbnail(),
  };

  const response = await c8oCall(page, 'APIV2_updateFormulaireDocument', {
    meta: JSON.stringify(document),
  });
  const res = (response.res ?? response) as JsonRecord;
  const id = String(res.id ?? res._id ?? '');
  if (!id) {
    throw new Error(`APIV2_updateFormulaireDocument did not return a form id: ${JSON.stringify(response)}`);
  }
  return { id, document, pageTechName };
}

export function textElement(name: string, options: JsonRecord = {}): FormElement {
  return {
    type: 'text',
    name,
    config: {
      mandatory: false,
      placeholder: 'Votre reponse',
      type: 'text',
      clearInput: false,
      short: true,
      disabled: false,
      label: name,
      html: `<p>${name}</p>`,
      personalized: true,
      ...(options.config as JsonRecord | undefined),
    },
    sources: options.sources,
  };
}

export function gridElement(name: string, columns: string[], options: JsonRecord = {}): FormElement {
  return {
    type: 'grid',
    name,
    config: {
      sourceEnabled: false,
      mandatory: false,
      disabled: false,
      label: name,
      html: `<p>${name}</p>`,
      personalized: true,
      returned_value: 'row_selected',
      AutoSizeColumns: true,
      columns: columns.map((column) => ({ name: column, type: 'text' })),
      ...(options.config as JsonRecord | undefined),
    },
    conditions: options.conditions,
  };
}

export function sourceSelectElement(name: string, options: JsonRecord = {}): FormElement {
  return {
    type: 'select',
    name,
    config: {
      sourceEnabled: true,
      mandatory: false,
      cancelText: 'Cancel',
      okText: 'OK',
      type: 'popover',
      placeholder: 'Choisir une reponse',
      disabled: false,
      label: name,
      html: `<p>${name}</p>`,
      personalized: true,
      ...(options.config as JsonRecord | undefined),
    },
    children: [],
    sources: options.sources,
  };
}

export function checkboxElement(name: string, values: string[], options: JsonRecord = {}): FormElement {
  const selectedValues = (options.selectedValues as string[] | undefined) ?? values;
  const base = Date.now();
  return {
    type: 'checkbox',
    name,
    children: values.map((value, index) => ({
      value,
      selected: selectedValues.includes(value),
      label_color: '#202124',
      position: 'unset',
      id: `${base}${index}`,
    })),
    config: {
      mandatory: false,
      checked: false,
      disabled: false,
      html: name,
      personalized: true,
      ...(options.config as JsonRecord | undefined),
    },
    conditions: options.conditions,
    sources: options.sources,
  };
}

export function descriptionElement(name: string, html: string, options: JsonRecord = {}): FormElement {
  return {
    type: 'description',
    name,
    config: {
      html,
      personalized: true,
      ...(options.config as JsonRecord | undefined),
    },
    conditions: options.conditions,
    sources: options.sources,
  };
}

export function visibleIfFieldEquals(fieldName: string, value: string): JsonRecord {
  return {
    visibleIf: {
      type: 'visibleIf',
      condVisible: 'and',
      conds: [
        {
          type: 'visibleIf',
          subject: 'field',
          operator: 'equals',
          val1: { str: fieldName, type: 'text', source: true },
          val2: { str: value, type: 'text', source: false },
        },
      ],
      groups: [],
    },
  };
}

function defaultThumbnail(): JsonRecord {
  return {
    enabled: true,
    index: null,
    random: '',
    type: 'color',
    color: '#0cbbe7',
  };
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

export async function openComponentConfigByTechnicalId(page: Page, technicalId: string): Promise<void> {
  const label = page.getByText(technicalId, { exact: true }).first();
  await expect(label, `component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  await label.click();
  await expect(page.locator(SEL.configClose).first()).toBeVisible({ timeout: 15_000 });
}

export async function reopenEditorFromHome(page: Page, title: string): Promise<void> {
  await page.locator(SEL.editorHomeButton).first().click();
  await page.waitForURL('**/selector/**', { timeout: 30_000 });
  const card = page.locator('[id^="idcard"]').filter({ hasText: title }).first();
  await expect(card, `home should show form card ${title}`).toBeVisible({ timeout: 30_000 });
  await card.click();
  await page.waitForURL('**/editor/**', { timeout: 30_000 });
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
  const tabs = page.locator(SEL.configTab).filter({ hasText: label });
  const count = await tabs.count();
  for (let i = 0; i < count; i++) {
    const tab = tabs.nth(i);
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      return;
    }
  }
  await tabs.first().click();
}

export async function waitForSourcePaletteSections(
  page: Page,
  minimum = 3,
  preferred: SourcePaletteSection[] = DEFAULT_SOURCE_PALETTE_SECTIONS,
): Promise<SourcePaletteSection[]> {
  await page.locator(SEL.sourcePalette).first().waitFor({ state: 'visible', timeout: 15_000 });
  await expect
    .poll(async () => (await sourcePaletteSectionStates(page, preferred)).length, {
      message: `source palette should expose at least ${minimum} sections`,
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(minimum);

  return (await sourcePaletteSectionStates(page, preferred)).map((state) => state.name).slice(0, minimum);
}

export async function clickSourcePaletteCollapseAll(page: Page): Promise<void> {
  const button = page.locator(SEL.sourcePaletteCollapseAllButton).first();
  await expect(button, 'source palette collapse-all action should be visible').toBeVisible({ timeout: 15_000 });
  await button.click();
  await page.waitForTimeout(350);
}

export async function clickSourcePaletteSection(page: Page, section: SourcePaletteSection): Promise<void> {
  const header = page.locator(`${SEL.sourcePalette} ${SOURCE_PALETTE_SECTION[section].header}`).first();
  await expect(header, `source palette section ${section} should be visible`).toBeVisible({ timeout: 15_000 });
  await header.click();
  await page.waitForTimeout(350);
}

export async function sourcePaletteSectionStates(
  page: Page,
  sections: SourcePaletteSection[] = DEFAULT_SOURCE_PALETTE_SECTIONS,
): Promise<SourcePaletteSectionState[]> {
  await page.locator(SEL.sourcePalette).first().waitFor({ state: 'visible', timeout: 15_000 });
  return page.evaluate(
    ({ rootSelector, definitions, sectionNames }) => {
      const root = document.querySelector(rootSelector) || document;
      const isRenderable = (el: Element | null): el is HTMLElement => {
        if (!(el instanceof HTMLElement)) return false;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      };

      return sectionNames.flatMap((name) => {
        const def = definitions[name];
        const header = root.querySelector(def.header);
        const body = root.querySelector(def.body);
        if (!isRenderable(header) || !(body instanceof HTMLElement)) return [];

        const style = getComputedStyle(body);
        const box = body.getBoundingClientRect();
        const opacity = Number(style.opacity);
        return [
          {
            name,
            expanded: opacity > 0.5 && style.pointerEvents !== 'none' && box.height > 5,
            height: Math.round(box.height),
            opacity,
            pointerEvents: style.pointerEvents,
          },
        ];
      });
    },
    {
      rootSelector: SEL.sourcePalette,
      definitions: SOURCE_PALETTE_SECTION,
      sectionNames: sections,
    },
  );
}

export async function closeComponentConfig(page: Page): Promise<void> {
  await page.locator(SEL.configClose).first().click();
  await page.locator(SEL.configClose).waitFor({ state: 'hidden', timeout: 15_000 });
}

export async function acceptRgpdIfVisible(page: Page): Promise<void> {
  await page.waitForTimeout(300);
  const rgpd = page.getByText(/JE SUIS D['’]ACCORD/i).last();
  if (await rgpd.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await rgpd.click({ force: true });
    await page.locator('ion-toast').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
  }
}

// ── Authoring journeys (reusable building blocks) ───────────────────────────
// These drive the real UI, so they double as tests of each journey AND as a way
// for any spec to build its own fixture instead of relying on a pre-existing
// form. Run them against a current version — the authoring UI selectors are not
// guaranteed stable on the older versions used for red/green verification.

export async function openPublishedPwaEditor(page: Page, title: string): Promise<void> {
  await page.locator(SEL.publishedApplicationsTab).first().click();
  if (await page.locator('ion-popover').isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await page.locator('ion-popover').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
  }
  const card = page.locator('[id^="idcard"]').filter({ hasText: title }).first();
  await expect(card, `published form card ${title} should be visible`).toBeVisible({ timeout: 30_000 });
  const menu = card.locator(SEL.cardMenuButton).first();
  for (let attempt = 0; attempt < 3; attempt++) {
    await card.hover();
    await page.waitForTimeout(500);
    await menu.click({ timeout: 2_000 }).catch(async () => {
      await menu.evaluate((el) => (el as HTMLElement).click());
    });
    if (
      await page
        .locator(SEL.publishedPwaMenuItem)
        .first()
        .waitFor({ state: 'visible', timeout: 2_000 })
        .then(() => true)
        .catch(() => false)
    ) {
      break;
    }
  }
  const pwaMenuItem = page.locator(SEL.publishedPwaMenuItem).first();
  await expect(pwaMenuItem, 'the published card menu should expose the PWA editor action').toBeVisible({
    timeout: 5_000,
  });
  await pwaMenuItem.click();
  await page.locator(SEL.pwaEditModal).waitFor({ state: 'visible', timeout: 30_000 });
}

export async function setPwaAccessModeAndSave(page: Page, mode: 'authenticated' | 'anonymous'): Promise<void> {
  const modal = page.locator(SEL.pwaEditModal).last();
  const toggle = modal.locator(SEL.pwaAccessToggle).first();
  await expect(toggle, 'the PWA access-mode toggle should be visible').toBeVisible({ timeout: 30_000 });
  await toggle.locator(SEL.pwaAccessToggleButton).nth(mode === 'authenticated' ? 0 : 1).click();
  await modal.locator(SEL.pwaSaveButton).first().click();
  await expect(modal).toBeHidden({ timeout: 60_000 });
}

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
  for (let attempt = 0; attempt < 3; attempt++) {
    await acceptRgpdIfVisible(page);
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
