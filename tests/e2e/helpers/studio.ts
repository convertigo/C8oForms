import { Locator, Page, expect } from '@playwright/test';

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
  // component config panel "Configuration" section label
  configSectionLabel: '.span-configuration',
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
  textComponent: 'c8oforms-itemtextviewer',
  checkboxComponent: 'c8oforms-itemcheckboxviewer',
  checkboxGroupComponent: 'c8oforms-itemcheckboxgroupviewer',
  descriptionComponent: 'c8oforms-itemdescriptionviewer',
  buttonComponent: 'c8oforms-itembuttonviewer',
  selectComponent: 'c8oforms-itemselectviewver',
  radioComponent: 'c8oforms-itemradioviewver',
  radioGroupComponent: 'c8oforms-itemradiogroupviewver',
  businessLogicComponent: 'c8oforms-itemactionbusinesslogicviewer',
  gridComponent: 'c8oforms-itemgridviewer',
  choiceOptionInput:
    'ion-input.class1571404352333 input:visible, ion-input.class1778925100118 input:visible, ion-input.class1773855097792 input:visible, ion-input.class1588840079644 input:visible, ion-input.class1588839628131 input:visible, ion-input.class1588839628323 input:visible, ion-input.class1588839628332 input:visible',
  defaultValueTextButton: '.class1678818942504, .class1777544520720',
  defaultValueJavaScriptButton: '.class1678818942537, .class1777544520765',
  defaultValueVisualButton: '.class1781000000001',
  defaultValueGroupGrid: '.c8o-default-values-grid',
  defaultValueVisualOption: '.c8o-default-values-option',
  defaultValueMonacoEditor: 'c8oforms-monacoeditor',
  // selectorPage.yaml — the "blank form" card (bound to the createNewForm action)
  blankFormCard: '.class1645547241644',
  // ion-alert prompt shown by createNewForm (stable CSS classes set in the action code)
  createFormTitleInput: 'input.alert-input',
  createFormSaveButton: 'button.btn--createapp-save',
  // component config header — "Identifiant technique" input
  technicalIdInput: '.class1776763411136 input, .technical-id-input input',
  // editorPage.yaml — the page navigation buttons block (sharedTabs, holds the
  // submit/next/prev buttons). Clicking it opens the page settings.
  pageButtonsBlock: '.class1775139583527',
  pageButtonsHoverOverlay: '.class1776445186188',
  // page-settings section toggles (active section carries app-settings-btn-active)
  pageSettingsGeneralTab: '.class1779366500007',
  pageSettingsNavigationTab: '.class1779366500013',
  // Pages panel (left sidebar) + a page row's inline edit (pencil) action
  componentPanelButton: 'ion-button.class1773237045434, ion-button.class1780909504474',
  componentPaletteSearch: 'ion-searchbar.class1775889901001',
  pagesPanelButton: 'ion-button.class1773237523408, ion-button.class1780909504522',
  workflowsPanelButton: 'ion-button.class1773250515928, ion-button.class1780909504555',
  pageRow: '.class1749805611480',
  pageEditButton: '.class1650357059474',
  // page settings "Nom de la page" input (TextInputSetting)
  pageNameInput: '.class1776265600007 input',
  editorHomeButton: 'ion-button.class1774605933364',
  visibilityModeButton: 'button.class1775840591959',
  visibilityAddConditionButton: 'ion-button.class1758191882601',
  conditionFieldInput: '.class1758189195703 input',
  conditionFieldBrowseButton: 'ion-button.class1758189195718',
  conditionOperatorSelect: 'ion-select.class1758189195757',
  conditionValueTagInput: 'tag-input input',
  checkboxOptionInput: 'ion-input.class1588839628131 input',
  checkboxOptionAddButton: 'ion-button.class1587560901011',
  checkboxOptionDeleteButton: 'ion-button.class1588839628212',
  choiceOptionDeleteButton:
    'ion-button.class1571404352384, ion-button.class1778925100133, ion-button.class1773855179324, ion-button.class1588840079704, ion-button.class1588839628212, ion-button.class1588839628362',
  // per-option "selected by default" checkbox in a Checkbox component's config
  checkboxOptionDefaultToggle: 'ion-checkbox.class1588839628095',
  // sharedQuestionElem.yaml -> dataSourceEditor_GridRow_GridColSourcePicker_Group
  sourcePalette: '.class1775922875303',
  sourcePaletteCollapseAllButton: 'ion-button.class1780921035700',
  dataSourceSelectButton:
    'c8oforms-datasourcebutton button.class1775848361410, c8oforms-datasourcebutton button.c8o-btn',
  dataSourceConfigureButton:
    'c8oforms-datasourceconfigurebutton button.class1776013870072, c8oforms-datasourceconfigurebutton button.c8o-btn',
  publishButton: 'ion-button.class1773332457603, .class1650456634147 ion-button',
  publishedApplicationsTab: 'ion-button.class1761754757348',
  cardMenuButton: 'ion-button.class1606574763560',
  publishedPwaMenuItem: 'ion-popover ion-item.class1603801509434',
  pwaEditModal: 'ion-modal.modal-pwa-edition, ion-modal.modalCSV',
  pwaAccessToggle: 'c8oforms-toggleswitch.class1779878486939',
  pwaAccessToggleButton: 'button.class1775840591959',
  pwaLegacyAccessCheckbox: 'ion-checkbox.class1646907933319',
  pwaNameInput: 'ion-input.class1603802354868 input',
  pwaShortNameInput: 'ion-input.class1603803008204 input',
  pwaSaveButton: 'ion-button.class1762425668421, ion-button.class1649838959998',
  // Horizontal layout container (type "layout") rendered in the editor canvas,
  // and the wrapper around each child nested inside it.
  layoutViewer: 'c8oforms-itemlayouteditorviewer',
  layoutChild: 'c8oforms-itemlayouteditor_elem',
  // a nested child's card (hover target) and the button that opens its editor
  layoutChildCard: '.class1776776353779',
  layoutChildOpenButton: '.class1780649358276',
  // the empty-container "initial" drop button shown while a palette drag is active
  containerInitialDropZone: '.class1600440331787',
  // open component editor: the "Supprimer" (delete) button in the right rail
  componentDeleteButton: '.class1775818864338',
  // delete-confirmation ion-alert: the danger-styled "Oui"/confirm button
  // (the "Non" button is btn--info; both carry text-generic, so key on btn--danger)
  confirmDeleteYesButton: 'ion-alert button.btn--danger',
};

export const SOURCE_PALETTE_SECTION = {
  formulas: { header: '.class1732284059152', body: '.class1732284059188' },
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

export interface CheckboxDescriptionFixtureOptions {
  title?: string;
  checkboxTechnicalId?: string;
  descriptionTechnicalId?: string;
  checkboxOptions?: string[];
}

const DEFAULT_SOURCE_PALETTE_SECTIONS: SourcePaletteSection[] = [
  'formulas',
  'router',
  'application',
  'form',
  'user',
  'page',
  'translation',
  'c8o',
];

const ROUTE = {
  selector: /\/selector(?:\/|$)/,
  editor: /\/editor\//,
  viewer: /\/viewer\//,
} as const;

async function expectRoute(page: Page, route: RegExp, timeout = 30_000): Promise<void> {
  await expect(page).toHaveURL(route, { timeout });
}

/**
 * Palette components share the same priority class, so the stable, non-i18n
 * discriminator is each tile's icon SVG filename. Extend as needed.
 */
export const PALETTE_ICON = {
  layout: 'icn_layout.svg',
  group: 'icn_group.svg',
  map: 'map.svg',
  textInput: 'icn_input_txt.svg',
  description: 'icn_title.svg',
  checkbox: 'icn_checkbox.svg',
  checkboxGroup: 'icn_checkbox_group.svg',
  button: 'icn_button.svg',
  radio: 'icn_radio_btn.svg',
  radioGroup: 'icn_radio_btn_group.svg',
  slider: 'icn_slider.svg',
  select: 'icn_select.svg',
  date: 'icn_calendar.svg',
  time: 'icn_time.svg',
  camera: 'icn_camera.svg',
  grid: 'icn_sheet.svg',
  chart: 'icn_chart.svg',
  barcode: 'icn_codebar.svg',
  businessLogic: 'icn_business_logic.svg',
  file: 'icn_import.svg',
  signature: 'icn_sign.svg',
  location: 'location.svg',
} as const;

const PALETTE_TYPE_BY_ICON: Record<string, string> = {
  [PALETTE_ICON.layout]: 'layout',
  [PALETTE_ICON.group]: 'ion-card',
  [PALETTE_ICON.map]: 'map',
  [PALETTE_ICON.textInput]: 'text',
  [PALETTE_ICON.description]: 'description',
  [PALETTE_ICON.checkbox]: 'checkbox',
  [PALETTE_ICON.checkboxGroup]: 'checkbox_group',
  [PALETTE_ICON.button]: 'button',
  [PALETTE_ICON.radio]: 'radio',
  [PALETTE_ICON.radioGroup]: 'radio_group',
  [PALETTE_ICON.slider]: 'slider',
  [PALETTE_ICON.select]: 'select',
  [PALETTE_ICON.date]: 'datetime',
  [PALETTE_ICON.time]: 'time',
  [PALETTE_ICON.camera]: 'img',
  [PALETTE_ICON.grid]: 'grid',
  [PALETTE_ICON.chart]: 'chart',
  [PALETTE_ICON.barcode]: 'barcode',
  [PALETTE_ICON.file]: 'file',
  [PALETTE_ICON.signature]: 'signature',
  [PALETTE_ICON.location]: 'location',
};

export interface LoginCredentials {
  user: string;
  password?: string;
}

function configuredTestUsers(): string[] {
  return (process.env.C8OFORMS_TEST_USERS ?? process.env.TEST_NOCODE_E2E_USERS ?? '')
    .split(',')
    .map((user) => user.trim())
    .filter(Boolean);
}

function oneBasedIndex(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed - 1 : null;
}

function zeroBasedIndex(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function selectedTestUserIndex(userCount: number): number {
  const explicitIndex = oneBasedIndex(process.env.C8OFORMS_TEST_USER_INDEX);
  if (explicitIndex !== null) return explicitIndex % userCount;

  const parallelIndex = zeroBasedIndex(process.env.TEST_PARALLEL_INDEX);
  if (parallelIndex !== null) return parallelIndex % userCount;

  const workerIndex = zeroBasedIndex(process.env.TEST_WORKER_INDEX);
  if (workerIndex !== null) return workerIndex % userCount;

  return 0;
}

function credentialsForConfiguredUser(users: string[], index: number): LoginCredentials {
  const user = users[index];
  return {
    user,
    password: process.env[`C8OFORMS_TEST_PASSWORD_${index + 1}`] ?? user,
  };
}

function currentTestCredentials(users: string[]): LoginCredentials {
  if (users.length > 0) {
    return credentialsForConfiguredUser(users, selectedTestUserIndex(users.length));
  }

  const user = process.env.C8OFORMS_TEST_USER ?? '';
  return {
    user,
    password: process.env.C8OFORMS_TEST_PASSWORD ?? user,
  };
}

function primaryTestCredentials(users: string[]): LoginCredentials {
  const user = process.env.C8OFORMS_PRIMARY_TEST_USER ?? users[0] ?? process.env.C8OFORMS_TEST_USER ?? '';
  return {
    user,
    password:
      process.env.C8OFORMS_PRIMARY_TEST_PASSWORD ??
      (users.length > 0
        ? process.env.C8OFORMS_TEST_PASSWORD_1 ?? user
        : process.env.C8OFORMS_TEST_PASSWORD ?? user),
  };
}

// Credentials come from tests/.env (loaded by playwright.config.ts via dotenv)
// or from CI env. With C8OFORMS_TEST_USERS, each worker/shard selects a
// separate disposable account; passwords default to the selected login.
export const TEST_USERS = configuredTestUsers();
// Credentials for a specific configured test user (0-based). Used by multi-user
// specs (e.g. #1423 cross-user isolation) that must drive two distinct accounts.
export function credentialsForUserIndex(index: number): LoginCredentials {
  return credentialsForConfiguredUser(TEST_USERS, index);
}
const CURRENT_TEST_CREDENTIALS = currentTestCredentials(TEST_USERS);
const PRIMARY_TEST_CREDENTIALS = primaryTestCredentials(TEST_USERS);
export const TEST_USER = CURRENT_TEST_CREDENTIALS.user;
export const TEST_PASSWORD = CURRENT_TEST_CREDENTIALS.password ?? TEST_USER;
export const PRIMARY_TEST_USER = PRIMARY_TEST_CREDENTIALS.user;
export const PRIMARY_TEST_PASSWORD = PRIMARY_TEST_CREDENTIALS.password ?? PRIMARY_TEST_USER;
export const ISSUE_1421_FIXTURE_TITLE = 'test ano 1421';
export const ISSUE_1421_FIXTURE_PUBLISHED_ID = 'published_1670939636590';

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

export interface LegacyAnonymousFixture {
  title: string;
  draftId: string;
  publishedId: string;
  anonymousId: string;
  anonymousKey: string;
  anonymousDocument: JsonRecord;
}

export async function login(page: Page, credentials: LoginCredentials = CURRENT_TEST_CREDENTIALS): Promise<void> {
  const user = credentials.user;
  const password = credentials.password ?? user;
  if (!user) {
    throw new Error(
      'Test user not configured. Copy tests/.env.example to tests/.env and set C8OFORMS_TEST_USER or C8OFORMS_TEST_USERS.',
    );
  }
  await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  for (let attempt = 0; attempt < 4; attempt++) {
    if (await selectorIsReady(page, attempt === 0 ? 3_000 : 1_000)) {
      return;
    }
    const attemptSucceeded = await loginOnce(page, user, password).catch(() => false);
    if (attemptSucceeded || (await selectorIsReady(page, 15_000))) {
      return;
    }
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => undefined);
  }
  await expectRoute(page, ROUTE.selector, 30_000);
}

async function loginOnce(page: Page, user: string, password: string): Promise<boolean> {
  await waitForIonicLoading(page);
  await openLoginForm(page);
  if (await selectorIsReady(page, 500)) {
    return true;
  }
  await fillInputValue(page, SEL.emailInput, user, 'login email input');
  await fillInputValue(page, SEL.passwordInput, password, 'login password input');
  await waitForIonicLoading(page);
  const submit = await firstVisibleLocator(page, SEL.loginReveal, 'login submit button');
  await submit.click({ timeout: 20_000 }).catch(() => undefined);
  await waitForIonicLoading(page, 20_000);
  return selectorIsReady(page, 20_000);
}

async function selectorIsReady(page: Page, timeout: number): Promise<boolean> {
  if (await expectRoute(page, ROUTE.selector, timeout).then(() => true).catch(() => false)) {
    return true;
  }
  return firstVisibleLocatorOrNull(page, SEL.blankFormCard, timeout).then(Boolean).catch(() => false);
}

async function waitForIonicLoading(page: Page, timeout = 10_000): Promise<void> {
  await page.locator('ion-loading:not(.overlay-hidden)').waitFor({ state: 'hidden', timeout }).catch(() => undefined);
}

async function openLoginForm(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (await firstVisibleLocatorOrNull(page, SEL.emailInput, attempt === 0 ? 1_000 : 2_000)) {
      return;
    }

    const reveal = await firstVisibleLocatorOrNull(page, SEL.loginReveal, attempt === 0 ? 30_000 : 5_000);
    if (!reveal) break;
    await reveal.click({ timeout: 10_000 }).catch(async () => {
      await reveal.click({ force: true, timeout: 5_000 }).catch(() => undefined);
    });

    if (await firstVisibleLocatorOrNull(page, SEL.emailInput, 5_000)) {
      return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`login form did not open from ${page.url()}`);
}

async function fillInputValue(page: Page, selector: string, value: string, description: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const input = await firstVisibleLocatorOrNull(page, selector, attempt === 0 ? 30_000 : 5_000);
    if (!input) {
      await page.waitForTimeout(300);
      continue;
    }

    const filled = await input
      .fill(value, { timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!filled) {
      const assigned = await assignVisibleInputValue(page, selector, value).catch(() => false);
      if (!assigned) {
        await page.waitForTimeout(300);
        continue;
      }
    }

    const hasValue = await expect
      .poll(() => visibleInputValue(page, selector), { timeout: 5_000 })
      .toBe(value)
      .then(() => true)
      .catch(() => false);
    if (hasValue) return;
  }
  throw new Error(`could not fill ${description}`);
}

async function assignVisibleInputValue(page: Page, selector: string, value: string): Promise<boolean> {
  return page.evaluate(
    ({ inputSelector, inputValue }) => {
      const visible = (el: Element): el is HTMLInputElement => {
        if (!(el instanceof HTMLInputElement)) return false;
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const input = [...document.querySelectorAll(inputSelector)].find(visible);
      if (!input) return false;

      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (setter) {
        setter.call(input, inputValue);
      } else {
        input.value = inputValue;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, detail: { value: inputValue } }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    },
    { inputSelector: selector, inputValue: value },
  );
}

async function visibleInputValue(page: Page, selector: string): Promise<string | null> {
  return page.evaluate((inputSelector) => {
    const visible = (el: Element): el is HTMLInputElement => {
      if (!(el instanceof HTMLInputElement)) return false;
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    return [...document.querySelectorAll(inputSelector)].find(visible)?.value ?? null;
  }, selector).catch(() => null);
}

/** The editor keeps live connections open: never wait for networkidle here. */
export async function openEditor(page: Page, formId: string): Promise<void> {
  await page.goto(`./editor/${formId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
}

export async function openViewer(page: Page, formId: string, mode = ':edit', response = ':i'): Promise<void> {
  await page.goto(`./viewer/${formId}/${mode}/${response}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expectRoute(page, ROUTE.viewer, 60_000);
  await page.locator('page-viewerpage').waitFor({ state: 'attached', timeout: 60_000 });
}

/**
 * Open an anonymous form the way an end user actually does: through its
 * standalone PWA. The engine serves the PWA index dynamically at
 * <DisplayObjects>/pwas/<key>/index.html — one level above the mobile/ app
 * baseURL — as long as the published document exists. The app reads the key
 * from the path (getStandalonePwaId), authenticates the anonymous session and
 * loads the form via getAnonymousForm.
 *
 * The studio /viewer/<id>/<edit>/<i> route is NOT the anonymous entry point: it
 * is auth-gated and renders "Unknown user" / insufficient-permissions even for
 * a correctly published anonymous form. Use this helper instead.
 */
export async function openAnonymousPwa(page: Page, anonymousKey: string): Promise<void> {
  await page.goto(`../pwas/${anonymousKey}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
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

export function isMissingConfigObject(doc: JsonRecord): boolean {
  return !Object.prototype.hasOwnProperty.call(doc, 'config');
}

export async function findLegacyAnonymousFixture(
  page: Page,
  title = ISSUE_1421_FIXTURE_TITLE,
): Promise<LegacyAnonymousFixture | null> {
  const candidates = await findFormCandidatesByTitle(page, title);
  if (title === ISSUE_1421_FIXTURE_TITLE && !candidates.some((candidate) => candidate._id === ISSUE_1421_FIXTURE_PUBLISHED_ID)) {
    candidates.push({ _id: ISSUE_1421_FIXTURE_PUBLISHED_ID, name: title });
  }

  for (const candidate of candidates) {
    const candidateId = String(candidate._id ?? '');
    if (!candidateId) continue;

    const publishedId = candidateId.startsWith('published_') ? candidateId : `published_${candidateId}`;
    const draftId = publishedId.replace(/^published_/, '');
    const anonymousId = `${publishedId}_anonymous`;
    const [pwa, anonymousDocument] = await Promise.all([
      getPwaDocument(page, publishedId).catch(() => null),
      getFormDocument(page, anonymousId).catch(() => null),
    ]);
    const anonymousKey =
      typeof pwa?.anonymousKey === 'string' && pwa.anonymousKey
        ? pwa.anonymousKey
        : typeof pwa?.targetId === 'string'
          ? pwa.targetId
          : '';
    if (
      anonymousKey &&
      anonymousDocument &&
      String(anonymousDocument.name ?? '') === title &&
      isMissingConfigObject(anonymousDocument)
    ) {
      return { title, draftId, publishedId, anonymousId, anonymousKey, anonymousDocument };
    }
  }

  return null;
}

async function findFormCandidatesByTitle(page: Page, title: string): Promise<JsonRecord[]> {
  const seen = new Set<string>();
  const results: JsonRecord[] = [];
  for (const target of ['formsV2/search', 'published_formsV2/search']) {
    const response = await c8oCall(page, 'APIV2_ExecuteView', {
      target,
      dynamicParams: JSON.stringify({
        query: title,
        tag: [],
        subTag: [],
        filters: {
          hide_apps_i_created: false,
          hide_folders: true,
          show_all_apps: false,
        },
      }),
    }).catch(() => null);
    const docs = (((response?.res as JsonRecord | undefined)?.docs ?? []) as unknown[]).filter(isJsonRecord);
    for (const doc of docs) {
      const id = String(doc._id ?? '');
      if (String(doc.name ?? '') !== title || !id || seen.has(id)) {
        continue;
      }
      seen.add(id);
      results.push(doc);
    }
  }
  return results;
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
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
  await openComponentConfigAt(page, componentTag, 0);
}

export async function openComponentConfigAt(page: Page, componentTag: string, index: number): Promise<void> {
  const comp = page.locator(`${componentTag}:visible`).nth(index);
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
      ({ tag, targetIndex, overlaySel }) => {
        const visible = (el: Element) => {
          const r = (el as HTMLElement).getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
        };
        const target = [...document.querySelectorAll(tag)].filter(visible)[targetIndex];
        if (!target) return -1;
        const t = target.getBoundingClientRect();
        const centerX = t.x + t.width / 2;
        const points = [
          { x: centerX, y: t.y + Math.min(Math.max(t.height / 2, 20), Math.max(t.height - 5, 5), 200) },
          { x: centerX, y: t.y + Math.min(Math.max(t.height * 0.25, 10), Math.max(t.height - 5, 5)) },
          { x: t.x + Math.min(Math.max(t.width * 0.25, 20), Math.max(t.width - 5, 5)), y: t.y + Math.min(20, Math.max(t.height - 5, 5)) },
        ];
        return [...document.querySelectorAll(overlaySel)].findIndex((o) => {
          const r = o.getBoundingClientRect();
          return (
            r.width > 0 &&
            r.height > 0 &&
            points.some((p) => p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height)
          );
        });
      },
      { tag: componentTag, targetIndex: index, overlaySel: SEL.componentOverlay },
    );
  }

  const configClose = page.locator(SEL.configClose).first();
  const opened = () => configClose.waitFor({ state: 'visible', timeout: 1_500 }).then(() => true).catch(() => false);
  if (overlayIndex >= 0) {
    await page.locator(SEL.componentOverlay).nth(overlayIndex).dispatchEvent('click');
    await expect(configClose).toBeVisible({ timeout: 15_000 });
    return;
  }

  await comp.dispatchEvent('click').catch(() => undefined);
  if (await opened()) {
    return;
  }

  const visibleOverlays = page.locator(`${SEL.componentOverlay}:visible`);
  const overlayCount = await visibleOverlays.count();
  if (overlayCount > 0) {
    await visibleOverlays.last().dispatchEvent('click').catch(() => undefined);
    if (await opened()) {
      return;
    }
  }

  throw new Error(`no config overlay covers ${componentTag} at index ${index}`);
}

export async function openComponentConfigByTechnicalId(page: Page, technicalId: string): Promise<void> {
  const label = page.getByText(technicalId, { exact: true }).first();
  await expect(label, `component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  await label.click();
  await expect(page.locator(SEL.configClose).first()).toBeVisible({ timeout: 15_000 });
}

export async function reopenEditorFromHome(page: Page, title: string): Promise<void> {
  await page.locator(SEL.editorHomeButton).first().click();
  await expectRoute(page, ROUTE.selector);
  const card = page.locator('[id^="idcard"]').filter({ hasText: title }).first();
  await expect(card, `home should show form card ${title}`).toBeVisible({ timeout: 30_000 });
  await card.click();
  await expectRoute(page, ROUTE.editor);
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
export async function openPreview(page: Page, waitForSelector = SEL.mapViewer): Promise<void> {
  await page.locator(SEL.previewButton).first().click();
  await expectRoute(page, ROUTE.viewer);
  await page.locator(waitForSelector).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_000);
}

export async function openConfigurationSection(page: Page): Promise<void> {
  await clickVisibleByText(page, SEL.configSectionLabel, /^configuration$/i, 'configuration section');
  await expect(page.locator(SEL.configTab).first(), 'configuration tabs should be mounted').toBeAttached({
    timeout: 10_000,
  });
  await page.waitForTimeout(350);
}

export async function openConfigTab(page: Page, label: string | RegExp): Promise<void> {
  if (await clickVisibleByText(page, SEL.configTab, label, `config tab ${label}`, false, 5_000)) {
    await page.waitForTimeout(350);
    return;
  }

  await openConfigurationSection(page);
  if (await clickVisibleByText(page, SEL.configTab, label, `config tab ${label}`, false, 5_000)) {
    await page.waitForTimeout(350);
    return;
  }

  throw new Error(`No visible config tab matches ${label}. Visible tabs: ${(await visibleTexts(page, SEL.configTab)).join(' | ')}`);
}

async function clickVisibleByText(
  page: Page,
  selector: string,
  label: string | RegExp,
  description: string,
  required = true,
  timeout = 0,
): Promise<boolean> {
  const deadline = Date.now() + timeout;
  do {
    const elements = page.locator(selector);
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      if (!(await element.isVisible().catch(() => false))) continue;
      const text = normalizeVisibleText(await element.innerText().catch(() => ''));
      if (visibleTextMatches(text, label)) {
        await element.click();
        return true;
      }
    }
    if (Date.now() < deadline) {
      await page.waitForTimeout(250);
    }
  } while (Date.now() < deadline);

  if (required) {
    throw new Error(`No visible ${description} matches ${label}`);
  }
  return false;
}

function normalizeVisibleText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function searchableVisibleText(text: string): string {
  return normalizeVisibleText(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function visibleTextMatches(text: string, label: string | RegExp): boolean {
  const visible = normalizeVisibleText(text);
  const searchable = searchableVisibleText(text);
  if (typeof label === 'string') {
    return searchable === searchableVisibleText(label);
  }
  label.lastIndex = 0;
  if (label.test(visible)) return true;
  label.lastIndex = 0;
  return label.test(searchable);
}

async function visibleTexts(page: Page, selector: string): Promise<string[]> {
  const out: string[] = [];
  const elements = page.locator(selector);
  const count = await elements.count();
  for (let i = 0; i < count; i++) {
    const element = elements.nth(i);
    if (await element.isVisible().catch(() => false)) {
      out.push(normalizeVisibleText(await element.innerText().catch(() => '')));
    }
  }
  return out.filter(Boolean);
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

export async function acceptRgpdIfVisible(page: Page, timeout = 2_000): Promise<void> {
  await page.waitForTimeout(300);
  const rgpd = page.getByText(/JE SUIS D['’]ACCORD|I AGREE/i).last();
  if (await rgpd.isVisible({ timeout }).catch(() => false)) {
    await rgpd.click({ force: true });
    await page.locator('ion-toast').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
  }
}

// ── Authoring journeys (reusable building blocks) ───────────────────────────
// These drive the real UI, so they double as tests of each journey AND as a way
// for any spec to build its own fixture instead of relying on a pre-existing
// form. Run them against a current version — the authoring UI selectors are not
// guaranteed stable on the older versions used for red/green verification.

export interface BaserowGridSourceOptions {
  workspace: string;
  database: string;
  table: string;
  expectedColumns?: string[];
}

export interface BaserowSelectSourceOptions extends BaserowGridSourceOptions {
  displayColumn: string;
  valueColumn: string;
}

const SELECT_SOURCE_TABLE_PICKER_BUTTON = 'button.class1776013870072';
const SELECT_SOURCE_COLUMN_ROW = 'ion-item.class1776161384798';
const SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX = 'ion-checkbox.class1776352302823';
const SELECT_SOURCE_VALUE_COLUMN_CHECKBOX = 'ion-checkbox.class1776352314668';

export async function configureGridBaserowSource(page: Page, source: BaserowGridSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await page.locator('.class1775835275863').first().click();
  await openConfigTab(page, /Choix de la source|Source choice|Source selection/i);

  await activateDataSourceMode(page);
  await selectDataSourceEntry(page, pickerTimeout, 'getData');

  await openConfigTab(page, /Configuration de la source|Source configuration/i);
  await acceptRgpdIfVisible(page);
  await clickFirstVisible(page, SEL.dataSourceConfigureButton, 'Baserow table configure button', pickerTimeout, true);

  const tablePicker = page.locator('ion-modal').last();
  await expect(tablePicker, 'Baserow table picker should be visible').toBeVisible({ timeout: pickerTimeout });
  await expect(tablePicker.getByText(source.workspace, { exact: true })).toBeVisible({ timeout: pickerTimeout });
  await tablePicker.getByText(source.workspace, { exact: true }).click();
  await expect(tablePicker.getByText(source.database, { exact: true })).toBeVisible({ timeout: pickerTimeout });
  await tablePicker.getByText(source.database, { exact: true }).click();
  await expect(tablePicker.getByText(source.table, { exact: true })).toBeVisible({ timeout: pickerTimeout });
  await tablePicker.getByText(source.table, { exact: true }).click();

  await expect(tablePicker.locator('.class1776246576145')).toContainText(source.table, { timeout: pickerTimeout });
  for (const column of source.expectedColumns ?? []) {
    await expect(tablePicker.locator('.class1776267952308'), `Baserow column ${column} should be selectable`).toContainText(
      column,
      { timeout: pickerTimeout },
    );
  }
  await acceptRgpdIfVisible(page);
  await tablePicker.locator('ion-button.class1776244653366').click();
  await expect(tablePicker).toBeHidden({ timeout: pickerTimeout });
  await page.waitForTimeout(1_500);

  const sourceSummary = page.locator('.class1776013865512').first();
  await expect(sourceSummary).toContainText(source.table, { timeout: pickerTimeout });
  for (const column of source.expectedColumns ?? []) {
    await expect(sourceSummary, `Baserow source summary should contain ${column}`).toContainText(column, {
      timeout: pickerTimeout,
    });
  }
}

export async function configureSelectBaserowSource(page: Page, source: BaserowSelectSourceOptions): Promise<void> {
  await acceptRgpdIfVisible(page);
  const configurationSection = page.locator('.class1775835275863').first();
  if (await configurationSection.isVisible().catch(() => false)) {
    await configurationSection.click();
  }

  await openConfigTab(page, /Choix de la source|Source choice|Source selection/i);
  const sourceModeButtons = page.locator('button.class1775840591959');
  if ((await sourceModeButtons.count()) > 1) {
    await sourceModeButtons.nth(1).click();
  } else {
    await page.getByText(/Depuis une source de donn.es|From a data source/i).first().click();
  }

  await selectDataSourceEntry(page, 60_000, 'getSelectData');

  await openConfigTab(page, /Configuration de la source|Source configuration/i);
  await acceptRgpdIfVisible(page);
  const tablePicker = await openSelectBaserowTablePicker(page);
  await expect(tablePicker.getByText(source.workspace, { exact: true })).toBeVisible({ timeout: 20_000 });
  await tablePicker.getByText(source.workspace, { exact: true }).click();
  await expect(tablePicker.getByText(source.database, { exact: true })).toBeVisible({ timeout: 20_000 });
  await tablePicker.getByText(source.database, { exact: true }).click();
  await expect(tablePicker.getByText(source.table, { exact: true })).toBeVisible({ timeout: 20_000 });
  await tablePicker.getByText(source.table, { exact: true }).click();

  await expect(tablePicker.locator('.class1776246576145')).toContainText(source.table, { timeout: 20_000 });
  for (const column of source.expectedColumns ?? []) {
    await expect(tablePicker.locator('.class1776267952308'), `Baserow column ${column} should be selectable`).toContainText(
      column,
      { timeout: 15_000 },
    );
  }
  await setSingleSelectSourceColumn(tablePicker, SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX, source.displayColumn);
  await setSingleSelectSourceColumn(tablePicker, SELECT_SOURCE_VALUE_COLUMN_CHECKBOX, source.valueColumn);

  await acceptRgpdIfVisible(page);
  await tablePicker.locator('ion-button.class1776244653366').click();
  await expect(tablePicker).toBeHidden({ timeout: 20_000 });
  await page.waitForTimeout(1_500);

  const sourceSummary = page.locator('.class1776013865512').first();
  await expect(sourceSummary).toContainText(source.table, { timeout: 15_000 });
  await expect(sourceSummary, `Baserow source summary should contain ${source.displayColumn}`).toContainText(
    source.displayColumn,
    { timeout: 15_000 },
  );
  await expect(sourceSummary, `Baserow source summary should contain ${source.valueColumn}`).toContainText(source.valueColumn, {
    timeout: 15_000,
  });
}

async function activateDataSourceMode(page: Page): Promise<void> {
  const sourceModeButtons = page.locator('button.class1775840591959');
  if ((await sourceModeButtons.count()) > 1) {
    await sourceModeButtons.nth(1).click();
    return;
  }
  await page.getByText(/Depuis une source de donn.es|From a data source/i).first().click();
}

async function selectDataSourceEntry(page: Page, timeout: number, entry: 'getData' | 'getSelectData'): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await clickFirstVisible(page, SEL.dataSourceSelectButton, 'Baserow source select button', timeout, true);
    const sourcePicker = page.locator('ion-modal:visible').last();
    await expect(sourcePicker, 'Baserow source picker modal should open').toBeVisible({ timeout });

    const sourceButton = sourcePicker.locator(SEL.dataSourceSelectButton).nth(entry === 'getSelectData' ? 1 : 0);
    const sourceReady = await expect(sourceButton).toBeVisible({ timeout: 20_000 }).then(() => true).catch(() => false);
    if (sourceReady) {
      await sourceButton.click({ timeout: 10_000 }).catch(async () => {
        await sourceButton.dispatchEvent('click');
      });
      await sourcePicker.locator('ion-button.class1599830132445').last().click({ timeout: 10_000 });
      await expect(sourcePicker).toBeHidden({ timeout });
      await page.waitForTimeout(1_500);
      return;
    }

    await closeTopModal(page);
    await page.waitForTimeout(1_500 * (attempt + 1));
  }
  throw new Error(`Baserow source picker opened without the ${entry} source`);
}

async function closeTopModal(page: Page): Promise<void> {
  const modal = page.locator('ion-modal:visible').last();
  if (!(await modal.isVisible({ timeout: 2_000 }).catch(() => false))) {
    return;
  }
  const cancel = modal.locator('ion-button.class1599830132430').last();
  if (await cancel.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await cancel.click({ timeout: 5_000 }).catch(() => undefined);
  } else {
    await page.keyboard.press('Escape').catch(() => undefined);
  }
  await expect(modal).toBeHidden({ timeout: 15_000 }).catch(() => undefined);
}

export async function openSelectBaserowSourceConfiguration(page: Page): Promise<void> {
  await acceptRgpdIfVisible(page);
  const configurationSection = page.locator('.class1775835275863').first();
  if (await configurationSection.isVisible().catch(() => false)) {
    await configurationSection.click();
  }
  await openConfigTab(page, /Configuration de la source|Source configuration/i);
}

export async function openSelectBaserowTablePicker(page: Page): Promise<Locator> {
  await page.locator(SELECT_SOURCE_TABLE_PICKER_BUTTON).first().click();
  const tablePicker = page.locator('ion-modal').last();
  await expect(tablePicker, 'Baserow table picker should be visible').toBeVisible({ timeout: 15_000 });
  return tablePicker;
}

export async function checkedSelectBaserowDisplayColumns(modal: Locator, candidates: string[]): Promise<string[]> {
  return checkedSelectBaserowColumns(modal, SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX, candidates);
}

export async function checkedSelectBaserowValueColumns(modal: Locator, candidates: string[]): Promise<string[]> {
  return checkedSelectBaserowColumns(modal, SELECT_SOURCE_VALUE_COLUMN_CHECKBOX, candidates);
}

export async function settledSelectBaserowDisplayColumns(modal: Locator, candidates: string[]): Promise<string[]> {
  return settledSelectBaserowColumns(() => checkedSelectBaserowDisplayColumns(modal, candidates));
}

export async function settledSelectBaserowValueColumns(modal: Locator, candidates: string[]): Promise<string[]> {
  return settledSelectBaserowColumns(() => checkedSelectBaserowValueColumns(modal, candidates));
}

export async function expectSelectBaserowColumnsVisible(modal: Locator, columns: string[]): Promise<void> {
  for (const column of columns) {
    await expect(selectSourceColumnRow(modal, column), `Baserow column ${column} should be visible`).toBeVisible({
      timeout: 15_000,
    });
  }
}

async function checkedSelectBaserowColumns(modal: Locator, checkboxSelector: string, candidates: string[]): Promise<string[]> {
  const checked: string[] = [];
  for (const name of candidates) {
    const row = selectSourceColumnRow(modal, name);
    if ((await row.count()) === 0) continue;
    const checkbox = row.locator(checkboxSelector).first();
    if ((await checkbox.count()) === 0) continue;
    if ((await checkbox.getAttribute('aria-checked')) === 'true') {
      checked.push(name);
    }
  }
  return checked;
}

async function settledSelectBaserowColumns(read: () => Promise<string[]>): Promise<string[]> {
  const startedAt = Date.now();
  let stableSince = startedAt;
  let previous = JSON.stringify(await read());
  const timeoutMs = 3_000;
  const stableMs = 750;

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = JSON.stringify(await read());
    if (current !== previous) {
      previous = current;
      stableSince = Date.now();
      continue;
    }
    if (Date.now() - stableSince >= stableMs) {
      break;
    }
  }

  return JSON.parse(previous) as string[];
}

async function setSingleSelectSourceColumn(modal: Locator, checkboxSelector: string, targetColumn: string): Promise<void> {
  const targetRow = selectSourceColumnRow(modal, targetColumn);
  await expect(targetRow, `Baserow column ${targetColumn} should be available`).toBeVisible({ timeout: 15_000 });

  const rows = modal.locator(SELECT_SOURCE_COLUMN_ROW);
  const count = await rows.count();
  for (let index = 0; index < count; index++) {
    const row = rows.nth(index);
    const checkbox = row.locator(checkboxSelector).first();
    if ((await checkbox.count()) === 0) continue;

    const rowText = (await row.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const isTarget = rowText === targetColumn || rowText.split(/\s+/).includes(targetColumn);
    const checked = (await checkbox.getAttribute('aria-checked')) === 'true';
    if (checked !== isTarget) {
      await checkbox.click();
      await expect
        .poll(() => checkbox.getAttribute('aria-checked'), {
          message: `Baserow column ${rowText || index} checked state should become ${isTarget}`,
          timeout: 5_000,
        })
        .toBe(isTarget ? 'true' : 'false');
    }
  }
}

function selectSourceColumnRow(modal: Locator, name: string): Locator {
  return modal.locator(SELECT_SOURCE_COLUMN_ROW).filter({ hasText: new RegExp(`(^|\\s)${escapeRegExp(name)}(\\s|$)`) }).first();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
  if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await toggle.locator(SEL.pwaAccessToggleButton).nth(mode === 'authenticated' ? 0 : 1).click();
  } else {
    const legacyCheckbox = modal.locator(SEL.pwaLegacyAccessCheckbox).first();
    await expect(legacyCheckbox, 'the legacy PWA access checkbox should be visible').toBeVisible({ timeout: 30_000 });
    const checked = await legacyCheckbox.evaluate((el) => (el as HTMLInputElement).checked === true);
    const shouldBeChecked = mode === 'authenticated';
    if (checked !== shouldBeChecked) {
      await legacyCheckbox.click();
    }
  }
  await modal.locator(SEL.pwaSaveButton).first().click();
  await expect(modal).toBeHidden({ timeout: 60_000 });
}

/**
 * From the selector/home (where login lands), create a blank form and land in
 * the editor. Returns the new form's id (from the editor URL).
 */
export async function createBlankForm(page: Page, title = `E2E ${Date.now()}`): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.locator(SEL.blankFormCard).first().click();
    const input = page.locator(SEL.createFormTitleInput);
    await input.waitFor({ state: 'visible', timeout: 15_000 });
    await input.fill('');
    await input.type(title, { delay: 5 });
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');

    const save = page.locator(SEL.createFormSaveButton).first();
    await expect
      .poll(
        () =>
          save.evaluate((el) => {
            const button = el as HTMLButtonElement;
            const style = window.getComputedStyle(button);
            return !button.disabled && button.getAttribute('aria-disabled') !== 'true' && style.pointerEvents !== 'none';
          }),
        {
          message: 'create form save button should become enabled',
          timeout: 5_000,
        },
      )
      .toBe(true);

    await save.click();
    if (await expectRoute(page, ROUTE.editor, 25_000).then(() => true).catch(() => false)) {
      break;
    }

    const existingCard = page.locator('[id^="idcard"]').filter({ hasText: title }).first();
    if (await existingCard.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await existingCard.click();
      if (await expectRoute(page, ROUTE.editor, 30_000).then(() => true).catch(() => false)) {
        break;
      }
    }

    const alert = page.locator('ion-alert.alert-custom-createapp').first();
    if (await alert.isVisible().catch(() => false)) {
      await input.press('Enter').catch(() => undefined);
      if (await expectRoute(page, ROUTE.editor, 25_000).then(() => true).catch(() => false)) {
        break;
      }
      await page.keyboard.press('Escape').catch(() => undefined);
      await expect(alert).toBeHidden({ timeout: 5_000 }).catch(() => undefined);
    }

    if (attempt === 2) {
      throw new Error(`form "${title}" was not opened in the editor; current URL is ${page.url()}`);
    }
  }

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
export async function openComponentsPalette(page: Page, waitForIcon = PALETTE_ICON.select): Promise<void> {
  await acceptRgpdIfVisible(page);
  const tileSelector = componentPaletteTileSelector(waitForIcon);
  if (await firstVisibleLocatorOrNull(page, tileSelector, 1_000)) {
    return;
  }
  if (!(await page.locator(SEL.componentPaletteSearch).first().isVisible({ timeout: 1_000 }).catch(() => false))) {
    await clickFirstVisible(page, SEL.componentPanelButton, 'component palette panel');
  }
  for (let attempt = 0; attempt < 8; attempt++) {
    if (await firstVisibleLocatorOrNull(page, tileSelector, 500)) {
      return;
    }
    await page.locator(tileSelector).first().scrollIntoViewIfNeeded().catch(() => undefined);
    if (await firstVisibleLocatorOrNull(page, tileSelector, 500)) {
      return;
    }
    await page.mouse.move(180, 350);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(250);
  }
  await firstVisibleLocator(page, tileSelector, `component palette tile ${waitForIcon}`);
}

export async function openWorkflowsPanel(page: Page): Promise<void> {
  await acceptRgpdIfVisible(page);
  if (await page.locator(`${SEL.businessLogicComponent}:visible`).first().isVisible({ timeout: 1_000 }).catch(() => false)) {
    return;
  }
  await clickFirstVisible(page, SEL.workflowsPanelButton, 'workflows panel');
  await page.waitForTimeout(800);
}

export async function openFirstPageFlow(page: Page): Promise<void> {
  await clickFirstVisible(page, SEL.pagesPanelButton, 'pages panel');
  await page.waitForTimeout(800);
  await openComponentsPalette(page, PALETTE_ICON.select);
  await page.waitForTimeout(800);
}

export async function createTextBusinessLogicFormula(
  page: Page,
  technicalId: string,
  textValue: string,
): Promise<void> {
  const before = await page.locator(SEL.businessLogicComponent).count();
  for (let attempt = 0; attempt < 3; attempt++) {
    await openComponentsPalette(page, PALETTE_ICON.businessLogic);
    const tile = await firstVisibleLocator(
      page,
      componentPaletteTileSelector(PALETTE_ICON.businessLogic),
      'business logic formula palette tile',
    );
    await tile.scrollIntoViewIfNeeded().catch(() => undefined);
    await tile.dblclick({ force: true, delay: 75 }).catch(() => undefined);
    await openWorkflowsPanel(page);
    if (
      await expect
        .poll(() => page.locator(SEL.businessLogicComponent).count(), { timeout: 10_000 })
        .toBeGreaterThan(before)
        .then(() => true)
        .catch(() => false)
    ) {
      break;
    }
    await openFirstPageFlow(page);
  }
  await openWorkflowsPanel(page);
  await expect(page.locator(SEL.businessLogicComponent).nth(before), `${technicalId} should be added to Workflows`).toBeVisible({
    timeout: 30_000,
  });
  const formulaIndex = before;
  await openBusinessLogicFormulaConfig(page, formulaIndex);
  await setTechnicalId(page, technicalId);
  await fillVisibleTinyMceText(page, textValue, 'business logic formula text editor');
  await closeBusinessLogicFormulaConfig(page);
  await openFirstPageFlow(page);
}

async function openBusinessLogicFormulaConfig(page: Page, index: number): Promise<void> {
  const formula = page.locator(`${SEL.businessLogicComponent}:visible`).nth(index);
  await expect(formula, `business logic formula #${index} should be visible`).toBeVisible({ timeout: 30_000 });
  await formula.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await formula.hover();
  await page.waitForTimeout(500);
  const box = await formula.boundingBox();
  if (!box) throw new Error(`business logic formula #${index} has no clickable box`);
  await page.mouse.click(box.x + Math.min(box.width / 2, box.width - 5), box.y + Math.min(box.height / 2, box.height - 5));
  await firstVisibleLocator(page, SEL.technicalIdInput, 'business logic technical identifier input');
}

async function closeBusinessLogicFormulaConfig(page: Page): Promise<void> {
  const configClose = page.locator(`${SEL.configClose}:visible`).first();
  if (await configClose.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await configClose.click();
  } else {
    await page.getByRole('button', { name: /Fermer|Close/i }).last().click();
  }
  await page.waitForTimeout(800);
}

export async function addComponent(page: Page, icon: string): Promise<void> {
  const tileSelector = componentPaletteTileSelector(icon);
  const before = await countComponents(page);
  for (let attempt = 0; attempt < 3; attempt++) {
    await acceptRgpdIfVisible(page);
    const tile = await firstVisibleLocator(page, tileSelector, `component palette tile ${icon}`);
    try {
      await tile.scrollIntoViewIfNeeded({ timeout: 5_000 });
      await tile.dblclick({ delay: 75, timeout: 5_000 });
    } catch {
      await page.waitForTimeout(500);
      continue;
    }
    try {
      await expect.poll(() => countComponents(page), { timeout: 12_000 }).toBeGreaterThan(before);
      return;
    } catch {
      // selected but not added — try again
    }
  }
  const type = PALETTE_TYPE_BY_ICON[icon];
  if (type) {
    const added = await addComponentThroughEditorApi(page, type);
    if (added) {
      await expect.poll(() => countComponents(page), { timeout: 12_000 }).toBeGreaterThan(before);
      return;
    }
  }
  throw new Error(`component with icon ${icon} was not added to the page`);
}

async function addComponentThroughEditorApi(page: Page, type: string): Promise<boolean> {
  return page.evaluate((componentType) => {
    const seen = new Set<object>();
    const candidates: any[] = [];
    const visit = (entry: unknown) => {
      if (
        entry &&
        typeof entry === 'object' &&
        !seen.has(entry) &&
        typeof (entry as any).addElement === 'function' &&
        Array.isArray((entry as any).formsList)
      ) {
        seen.add(entry);
        candidates.push(entry);
      }
    };
    const visitMaybeContext = (value: unknown) => {
      if (Array.isArray(value)) {
        for (const entry of value) {
          visit(entry);
        }
      } else {
        visit(value);
      }
    };

    for (const element of document.querySelectorAll('*')) {
      const rawElement = element as unknown as Record<string, unknown>;
      visitMaybeContext((rawElement as any).__ngContext__);
      for (const key of Object.getOwnPropertyNames(rawElement)) {
        visitMaybeContext(rawElement[key]);
      }
    }

    const editor = candidates.find((candidate) => candidate.form != null && candidate.local != null) ?? candidates[0];
    if (!editor) {
      return false;
    }
    editor.addElement(componentType);
    try {
      editor.ref?.detectChanges?.();
    } catch {
      // Angular may already schedule change detection after updateState().
    }
    return true;
  }, type);
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
  const input = await firstVisibleLocator(page, SEL.technicalIdInput, 'technical identifier input');
  await input.fill(value);
  await input.blur();
  await page.waitForTimeout(1_500); // editor persists the rename on blur
}

function componentPaletteTileSelector(icon: string): string {
  return [
    `[draggable="true"]:has(img[src$="${icon}"])`,
    `ion-col.class1650357035574:has(img[src$="${icon}"])`,
  ].join(', ');
}

async function firstVisibleLocator(page: Page, selector: string, description: string, timeout = 15_000): Promise<Locator> {
  const locator = await firstVisibleLocatorOrNull(page, selector, timeout);
  if (!locator) {
    throw new Error(`No visible ${description} found for selector ${selector}`);
  }
  return locator;
}

async function firstVisibleLocatorOrNull(page: Page, selector: string, timeout: number): Promise<Locator | null> {
  const elements = page.locator(selector);
  const startedAt = Date.now();
  do {
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      if (await elements.nth(i).isVisible().catch(() => false)) {
        return elements.nth(i);
      }
    }
    if (timeout <= 0) {
      return null;
    }
    await page.waitForTimeout(100);
  } while (Date.now() - startedAt < timeout);

  const count = await elements.count();
  for (let i = 0; i < count; i++) {
    if (await elements.nth(i).isVisible().catch(() => false)) {
      return elements.nth(i);
    }
  }
  return null;
}

export async function setChoiceLocalOptions(page: Page, values: string[]): Promise<void> {
  if (values.length === 0) {
    throw new Error('setChoiceLocalOptions needs at least one value');
  }

  await openConfigTab(page, /Configuration de la source|Source configuration/i);
  await expect
    .poll(() => page.locator(SEL.choiceOptionInput).count(), {
      message: 'choice local options should be visible',
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  while ((await page.locator(SEL.choiceOptionInput).count()) < values.length) {
    const before = await page.locator(SEL.choiceOptionInput).count();
    await page.locator(SEL.checkboxOptionAddButton).first().click();
    await expect
      .poll(() => page.locator(SEL.choiceOptionInput).count(), {
        message: 'adding a choice option should create an editable input',
        timeout: 10_000,
      })
      .toBeGreaterThan(before);
  }

  while ((await page.locator(SEL.choiceOptionInput).count()) > values.length) {
    const before = await page.locator(SEL.choiceOptionInput).count();
    await page.locator(SEL.choiceOptionDeleteButton).last().click();
    await expect
      .poll(() => page.locator(SEL.choiceOptionInput).count(), {
        message: 'deleting a choice option should remove its input',
        timeout: 10_000,
      })
      .toBeLessThan(before);
  }

  for (const [index, value] of values.entries()) {
    const input = page.locator(SEL.choiceOptionInput).nth(index);
    await input.fill(value);
    await input.blur();
  }
  await page.waitForTimeout(1_000);
}

export async function setCheckboxLocalOptions(page: Page, values: string[]): Promise<void> {
  await setChoiceLocalOptions(page, values);
}

const DEFAULT_VALUE_TAB = /Valeur par d|Default value|defaultvalue/i;

async function openDefaultValueTextMode(page: Page): Promise<void> {
  await openConfigTab(page, DEFAULT_VALUE_TAB);
  await clickFirstVisible(page, SEL.defaultValueTextButton, 'default value text mode');
  await confirmAlertIfVisible(page);
}

async function openDefaultValueJavascriptMode(page: Page): Promise<void> {
  await openConfigTab(page, DEFAULT_VALUE_TAB);
  await clickFirstVisible(page, SEL.defaultValueJavaScriptButton, 'default value JavaScript mode');
  await confirmAlertIfVisible(page);
}

async function openDefaultValueVisualMode(page: Page): Promise<void> {
  await openConfigTab(page, DEFAULT_VALUE_TAB);
  await clickFirstVisible(page, SEL.defaultValueVisualButton, 'default value visual mode');
  await confirmAlertIfVisible(page);
}

export async function setChoiceDefaultValueVisual(page: Page, values: string[]): Promise<void> {
  await openDefaultValueVisualMode(page);
  await expect(page.locator(SEL.defaultValueVisualOption).first(), 'default value visual options should be visible').toBeVisible({
    timeout: 15_000,
  });

  for (const value of values) {
    const option = page.locator(SEL.defaultValueVisualOption).filter({ hasText: value }).first();
    await expect(option, `default value visual option ${value} should be visible`).toBeVisible({ timeout: 10_000 });
    if (!(await option.evaluate((el) => el.classList.contains('c8o-default-values-option-selected')))) {
      await option.click();
    }
    await expect
      .poll(() => option.evaluate((el) => el.classList.contains('c8o-default-values-option-selected')), {
        message: `default value visual option ${value} should be selected`,
        timeout: 10_000,
      })
      .toBe(true);
  }

  await page.waitForTimeout(700);
}

export async function setChoiceGroupDefaultValueVisual(
  page: Page,
  valuesByLine: Record<string, string | string[]>,
): Promise<void> {
  await openDefaultValueVisualMode(page);

  const grid = page.locator(SEL.defaultValueGroupGrid).first();
  await expect(grid, 'default value group matrix should be visible').toBeVisible({ timeout: 15_000 });

  for (const [line, rawValues] of Object.entries(valuesByLine)) {
    const values = (Array.isArray(rawValues) ? rawValues : [rawValues]).filter((value) => String(value).trim() !== '');
    for (const value of values) {
      const optionIndex = await grid.locator('thead th').evaluateAll(
        (headers, optionLabel) =>
          headers.findIndex((header, index) => index > 0 && (header.textContent ?? '').trim() === optionLabel) - 1,
        value,
      );
      if (optionIndex < 0) {
        throw new Error(`default value matrix option ${value} was not found`);
      }

      const row = grid.locator('tbody tr').filter({ hasText: line }).first();
      await expect(row, `default value matrix row ${line} should be visible`).toBeVisible({ timeout: 10_000 });
      const cell = row.locator('.c8o-default-values-cell').nth(optionIndex);
      await cell.click();
      await expect
        .poll(
          () =>
            cell.locator('ion-radio, ion-checkbox').first().evaluate((el) => {
              const input = el as HTMLElement & { checked?: boolean };
              return input.checked === true || input.getAttribute('aria-checked') === 'true';
            }),
          {
            message: `default value matrix cell ${line}/${value} should be selected`,
            timeout: 10_000,
          },
        )
        .toBe(true);
    }
  }

  await page.waitForTimeout(700);
}

export async function setChoiceDefaultValueText(page: Page, value: string): Promise<void> {
  await openDefaultValueTextMode(page);
  await fillVisibleTinyMceText(page, value, 'default value text editor');
}

async function fillVisibleTinyMceText(page: Page, value: string, description: string): Promise<void> {
  const editorBody = await visibleTinyMceBody(page);
  await editorBody.click();
  const filledThroughTinyMce = await page.evaluate((text) => {
    const tinymce = (window as any).tinymce;
    const editor = tinymce?.activeEditor;
    if (!editor) return false;

    const holder = document.createElement('div');
    holder.textContent = text;
    editor.setContent(holder.innerHTML);
    editor.fire('input');
    editor.fire('change');
    editor.fire('blur');
    return true;
  }, value);
  if (!filledThroughTinyMce) {
    await editorBody.fill(value);
  }
  await page.keyboard.press('Tab');
  await fireActiveTinyMceChange(page);
  await expect
    .poll(() => editorBody.innerText(), {
      message: `${description} should contain ${value}`,
      timeout: 15_000,
    })
    .toContain(value);
  await page.waitForTimeout(1_000);
}

export async function setChoiceDefaultValueFromSourcePalette(
  page: Page,
  section: SourcePaletteSection,
  label: string,
): Promise<void> {
  await openDefaultValueTextMode(page);
  await dragSourcePaletteEntryToTinyMce(page, section, label);
}

export async function setChoiceDefaultValueJavascript(
  page: Page,
  emptyReturnExpression: string,
  returnExpression: string,
): Promise<void> {
  await setDefaultValueJavascriptReturn(page, emptyReturnExpression, returnExpression);
}

export type ChoiceViewerKind = 'select' | 'radio' | 'checkbox' | 'radioGroup' | 'checkboxGroup';

export type ChoiceViewerValue = string | string[] | Record<string, string | string[]>;

export async function choiceViewerValue(
  page: Page,
  kind: ChoiceViewerKind,
  index: number,
): Promise<ChoiceViewerValue> {
  const tag =
    kind === 'select'
      ? SEL.selectComponent
      : kind === 'radio'
        ? SEL.radioComponent
        : kind === 'checkbox'
          ? SEL.checkboxComponent
          : kind === 'radioGroup'
            ? SEL.radioGroupComponent
            : SEL.checkboxGroupComponent;

  return page.evaluate(
    ({ componentTag, componentIndex, choiceKind }) => {
      const visible = (el: Element) => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const root = [...document.querySelectorAll(componentTag)].filter(visible)[componentIndex] as HTMLElement | undefined;
      if (!root) {
        return choiceKind === 'checkbox' ? [] : choiceKind === 'checkboxGroup' || choiceKind === 'radioGroup' ? {} : '';
      }

      const uniqueMatches = (pattern: RegExp) => {
        const text = (root.textContent ?? '').replace(/\s+/g, ' ');
        return [...text.matchAll(pattern)].map((match) => match[0]).filter((value, idx, all) => all.indexOf(value) === idx);
      };

      if (choiceKind === 'select') {
        const select = root.querySelector('ion-select') as (HTMLElement & { value?: unknown }) | null;
        return typeof select?.value === 'string' ? select.value : select?.value == null ? '' : String(select.value);
      }

      if (choiceKind === 'radio' || choiceKind === 'radioGroup') {
        const radioGroups = [...root.querySelectorAll('ion-radio-group')].filter(visible) as (HTMLElement & {
          value?: unknown;
        })[];
        if (choiceKind === 'radioGroup') {
          const lineLabels = uniqueMatches(/\bLine \d+\b/g);
          return Object.fromEntries(
            radioGroups.map((radioGroup, lineIndex) => {
              const rawValue = radioGroup.value;
              const value =
                typeof rawValue === 'string' ? rawValue : rawValue == null ? '' : String(rawValue);
              return [lineLabels[lineIndex] ?? `Line ${lineIndex + 1}`, value];
            }),
          );
        }
        const radioGroup = radioGroups[0];
        return typeof radioGroup?.value === 'string'
          ? radioGroup.value
          : radioGroup?.value == null
            ? ''
            : String(radioGroup.value);
      }

      const checkedCheckboxes = [...root.querySelectorAll('ion-checkbox')]
        .filter((checkbox) => {
          const cb = checkbox as HTMLElement & { checked?: boolean };
          return visible(cb) && (cb.checked === true || cb.getAttribute('aria-checked') === 'true');
        });
      if (choiceKind === 'checkboxGroup') {
        const lineLabels = uniqueMatches(/\bLine \d+\b/g);
        const optionLabels = uniqueMatches(/\bOption \d+\b/g);
        const optionCount = optionLabels.length || 1;
        const result: Record<string, string[]> = {};
        for (const line of lineLabels) {
          result[line] = [];
        }
        for (const checkbox of checkedCheckboxes) {
          const checkboxIndex = [...root.querySelectorAll('ion-checkbox')].filter((cb) => visible(cb)).indexOf(checkbox);
          const lineIndex = Math.floor(checkboxIndex / optionCount);
          const optionIndex = checkboxIndex % optionCount;
          const line = lineLabels[lineIndex] ?? `Line ${lineIndex + 1}`;
          if (!result[line]) result[line] = [];
          result[line].push(optionLabels[optionIndex] ?? `Option ${optionIndex + 1}`);
        }
        return result;
      }

      return checkedCheckboxes
        .map((checkbox) => ((checkbox.closest('ion-item') ?? checkbox.parentElement ?? checkbox).textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    },
    { componentTag: tag, componentIndex: index, choiceKind: kind },
  );
}

export async function expectComponentHeaderDefaultValueIndicator(
  page: Page,
  componentSelector: string,
  index: number,
  technicalId: string,
): Promise<void> {
  const component = page.locator(`${componentSelector}:visible`).nth(index);
  await expect(component, `component ${componentSelector} #${index} should be visible`).toBeVisible({ timeout: 30_000 });
  await component.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await component.hover();
  const technicalIdText = page.getByText(technicalId).first();
  await expect(technicalIdText, `component header text ${technicalId} should be visible`).toBeVisible({ timeout: 10_000 });
  const header = technicalIdText.locator('xpath=ancestor::c8oforms-headercomponents[1]');
  await expect(
    header.locator('ion-icon[name="bookmark-outline"], ion-icon[ng-reflect-name="bookmark-outline"]').first(),
    `component ${technicalId} should show the default value indicator`,
  ).toBeVisible({ timeout: 10_000 });
}

/**
 * Mark a Checkbox component option as selected by default (so it carries a value
 * at runtime in the viewer), by toggling its per-option "selected" checkbox.
 * Call after setCheckboxLocalOptions, with the option's 0-based index.
 */
export async function setCheckboxDefaultSelected(page: Page, optionIndex: number): Promise<void> {
  const toggle = page.locator(SEL.checkboxOptionDefaultToggle).nth(optionIndex);
  await toggle.waitFor({ state: 'visible', timeout: 10_000 });
  await toggle.click();
  await page.waitForTimeout(300);
}

export async function createFormWithCheckboxAndDescription(
  page: Page,
  opts: CheckboxDescriptionFixtureOptions = {},
): Promise<string> {
  const formId = await createBlankForm(page, opts.title ?? `Repro checkbox visibility ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.checkbox);
  await page.locator(SEL.checkboxComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, SEL.checkboxComponent);
  await setTechnicalId(page, opts.checkboxTechnicalId ?? 'checkbox1');
  await setCheckboxLocalOptions(page, opts.checkboxOptions ?? ['Oui']);
  await closeComponentConfig(page);

  await addComponent(page, PALETTE_ICON.description);
  await page.locator(SEL.descriptionComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, SEL.descriptionComponent);
  await setTechnicalId(page, opts.descriptionTechnicalId ?? 'desc1');
  await closeComponentConfig(page);

  return formId;
}

export async function openComponentVisibilityConfig(page: Page, technicalId: string): Promise<void> {
  await openComponentConfigByTechnicalId(page, technicalId);
  await openConfigTab(page, /Visibilit|Visibility/i);
}

export async function openComponentVisibilityConfigBySelector(page: Page, componentTag: string): Promise<void> {
  await openComponentConfig(page, componentTag);
  await openConfigTab(page, /Visibilit|Visibility/i);
}

export interface SourceCompletionPopoverState {
  labels: string[];
  items: Array<{
    label: string;
    imageSrc: string;
  }>;
  overflowY: string;
  maxHeight: string;
  clientHeight: number;
  scrollHeight: number;
  searchIconTop: number | null;
  searchIconLeft: number | null;
}

export async function openVisibilityConditionFieldPicker(page: Page): Promise<void> {
  await page.locator(SEL.visibilityModeButton).filter({ hasText: /Selon une condition|condition/i }).first().click();
  await page.locator(SEL.visibilityAddConditionButton).first().click();
  await page.locator(SEL.conditionFieldBrowseButton).first().click();
  await sourceCompletionPopover(page).waitFor({ state: 'visible', timeout: 10_000 });
}

export function sourceCompletionPopover(page: Page): Locator {
  return page.locator('ion-popover.C8Oforms_PopOverSourceCompletionCSS, ion-popover:has(ion-searchbar)').last();
}

export async function sourceCompletionPopoverState(page: Page): Promise<SourceCompletionPopoverState> {
  const popover = sourceCompletionPopover(page);
  await expect(popover.locator('ion-searchbar'), 'source completion popover should expose a search bar').toBeVisible({
    timeout: 10_000,
  });
  const list = popover.locator('ion-list').first();
  await expect(list, 'source completion popover should expose a bounded list').toBeVisible({ timeout: 10_000 });

  return popover.evaluate((root) => {
    const normalize = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();
    const listEl = root.querySelector('ion-list') as HTMLElement | null;
    if (!listEl) {
      throw new Error('source completion list not found');
    }

    const style = getComputedStyle(listEl);
    const searchbar = root.querySelector('ion-searchbar') as HTMLElement & { shadowRoot?: ShadowRoot | null };
    const searchRoot = searchbar?.shadowRoot ?? searchbar;
    const searchIcon = searchRoot?.querySelector('.searchbar-search-icon') as HTMLElement | null;
    const searchbarBox = searchbar?.getBoundingClientRect();
    const searchIconBox = searchIcon?.getBoundingClientRect();

    return {
      labels: [...root.querySelectorAll('ion-list ion-item ion-label')]
        .map((label) => normalize(label.textContent))
        .filter(Boolean),
      items: [...root.querySelectorAll('ion-list ion-item')].flatMap((item) => {
        const label = normalize(item.querySelector('ion-label')?.textContent);
        if (!label) {
          return [];
        }
        const image = item.querySelector('img') as HTMLImageElement | null;
        return [{ label, imageSrc: image?.getAttribute('src') ?? '' }];
      }),
      overflowY: style.overflowY,
      maxHeight: style.maxHeight,
      clientHeight: Math.round(listEl.clientHeight),
      scrollHeight: Math.round(listEl.scrollHeight),
      searchIconTop:
        searchbarBox && searchIconBox ? Math.round((searchIconBox.top - searchbarBox.top) * 10) / 10 : null,
      searchIconLeft:
        searchbarBox && searchIconBox ? Math.round((searchIconBox.left - searchbarBox.left) * 10) / 10 : null,
    };
  });
}

export async function fillSourceCompletionSearch(page: Page, value: string): Promise<void> {
  const searchbar = sourceCompletionPopover(page).locator('ion-searchbar').first();
  await expect(searchbar, 'source completion search bar should be visible').toBeVisible({ timeout: 10_000 });
  const input = searchbar.locator('input').first();
  if (await input.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await input.fill(value);
  } else {
    await searchbar.evaluate((el, text) => {
      const search = el as HTMLElement & { shadowRoot?: ShadowRoot | null; value?: string };
      const inputEl = (search.shadowRoot ?? search).querySelector('input') as HTMLInputElement | null;
      if (!inputEl) {
        throw new Error('source completion search input not found');
      }
      search.value = text;
      inputEl.value = text;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, detail: { value: text } }));
    }, value);
  }
  await page.waitForTimeout(350);
}

/**
 * Visibility condition operator keys, in the order the operator `ion-select`
 * lists them. The select uses the popover interface, so options render as
 * `ion-select-popover ion-item`; we resolve the right one by the underlying
 * `ion-select-option` value (language-agnostic), never by its i18n label.
 */
export type VisibilityOperator =
  | 'equals'
  | 'different'
  | 'minus'
  | 'minusequals'
  | 'greater'
  | 'greaterequals'
  | 'among_following'
  | 'out_following'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_filled';

/** Switch the visibility config to condition mode and add a condition on a field. */
export async function startVisibilityCondition(page: Page, fieldTechnicalId: string): Promise<void> {
  await page.locator(SEL.visibilityModeButton).filter({ hasText: /Selon une condition|condition/i }).first().click();
  await page.locator(SEL.visibilityAddConditionButton).first().click();
  await page.locator(SEL.conditionFieldBrowseButton).first().click();
  await page.locator('ion-popover ion-item').filter({ hasText: fieldTechnicalId }).first().click();
  await expect(page.locator(SEL.conditionFieldInput).first()).toHaveValue(fieldTechnicalId);
}

/** Pick the condition operator by its stable value (not its i18n label). */
export async function setVisibilityOperator(page: Page, operator: VisibilityOperator): Promise<void> {
  const select = page.locator(SEL.conditionOperatorSelect).first();
  const index = await select.evaluate(
    (el, op) => Array.from(el.querySelectorAll('ion-select-option')).findIndex((o) => (o as HTMLOptionElement & { value?: string }).value === op),
    operator,
  );
  if (index < 0) throw new Error(`unknown visibility operator: ${operator}`);
  await acceptRgpdIfVisible(page, 500);
  await select.click();
  await acceptRgpdIfVisible(page, 500);
  const items = page.locator('ion-select-popover ion-item');
  await items.first().waitFor({ state: 'visible', timeout: 8_000 });
  await items.nth(index).click();
  await expect
    .poll(() => select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
      message: `visibility operator should be ${operator}`,
      timeout: 8_000,
    })
    .toBe(operator);
}

export async function configureVisibilityEqualsField(page: Page, fieldTechnicalId: string): Promise<void> {
  await startVisibilityCondition(page, fieldTechnicalId);
  await setVisibilityOperator(page, 'equals');
}

export async function fillVisibilityTagValue(page: Page, value: string): Promise<void> {
  await page.locator(SEL.conditionValueTagInput).first().fill(value);
  await page.keyboard.press('Enter');
}

/** Set a Description component's visible content through its main TinyMCE editor. */
export async function setDescriptionText(page: Page, text: string): Promise<void> {
  const frame = page.frameLocator('iframe.tox-edit-area__iframe').first().locator('body');
  if (await frame.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await frame.click();
    await frame.fill(text);
    return;
  }
  const inline = page.locator('[contenteditable="true"].mce-content-body').first();
  await expect(inline, 'description should expose a TinyMCE content editor').toBeVisible({ timeout: 10_000 });
  await inline.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(text);
}

export interface VisibilityConditionSpec {
  field: string;
  operator: VisibilityOperator;
  /** Literal value(s). A single string fills the text editor; an array fills the
   * chip/tag editor used by the multiple operators. Omit for is_filled/is_empty. */
  value?: string | string[];
}

/**
 * Add one visibility condition entirely through the UI: condition mode → field →
 * operator → value. The value editor is chosen from what the operator renders:
 * `is_filled`/`is_empty` take no value, the multiple operators expose a chip
 * editor, everything else exposes the TinyMCE text editor.
 */
export async function addVisibilityCondition(page: Page, spec: VisibilityConditionSpec): Promise<void> {
  await startVisibilityCondition(page, spec.field);
  await setVisibilityOperator(page, spec.operator);

  // is_filled / is_empty take no right-hand value.
  if (spec.operator !== 'is_filled' && spec.operator !== 'is_empty') {
    await page.waitForTimeout(300);
    const values = Array.isArray(spec.value) ? spec.value : spec.value != null ? [spec.value] : [];
    const chipEditor = page.locator(SEL.conditionValueTagInput).first();
    if (await chipEditor.isVisible({ timeout: 1_500 }).catch(() => false)) {
      for (const value of values) await fillVisibilityTagValue(page, value);
    } else if (values.length) {
      await fillVisibilityValueTextEditor(page, values[0]);
    }
  }

  // The condition editor saves asynchronously (ionChange -> save emit). Let that
  // settle so the operator/value persists before the caller closes the panel —
  // otherwise the last-authored condition can be lost (this bit is what made an
  // is_empty condition look like a viewer bug).
  await page.waitForTimeout(1_000);
}

export function visibilityValueChip(page: Page, value: string) {
  return page.locator('tag').filter({ hasText: value }).first();
}

export async function fillVisibilityValueTextEditor(page: Page, value: string): Promise<void> {
  const frameBody = page.frameLocator('iframe.tox-edit-area__iframe').last().locator('body');
  if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await frameBody.fill(value);
    return;
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'visibility value should expose a TinyMCE text editor').toBeVisible({ timeout: 10_000 });
  await inlineEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(value);
  await page.keyboard.press('Tab');
}

export async function expectVisibilityValueTextEditorToContain(page: Page, value: string): Promise<void> {
  const frameBody = page.frameLocator('iframe.tox-edit-area__iframe').last().locator('body');
  if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await expect(frameBody).toContainText(value, { timeout: 10_000 });
    return;
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'visibility value text editor should contain the configured value').toContainText(value, {
    timeout: 10_000,
  });
}

export async function setTextDefaultValueJavascript(page: Page, returnExpression: string): Promise<void> {
  await setDefaultValueJavascriptReturn(page, "''", returnExpression);
}

async function setDefaultValueJavascriptReturn(
  page: Page,
  emptyReturnExpression: string,
  returnExpression: string,
): Promise<void> {
  await openDefaultValueJavascriptMode(page);
  const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
  await expect(editor, 'default value JavaScript editor should be visible').toBeVisible({ timeout: 15_000 });
  await editor.click();
  await expect(editor, 'default value JavaScript editor should keep the generated async wrapper').toContainText(
    `return ${emptyReturnExpression};`,
    { timeout: 10_000 },
  );
  await page.keyboard.press('Control+F');
  await page.keyboard.type(`return ${emptyReturnExpression};`);
  await page.keyboard.press('Escape');
  await page.keyboard.type(`return ${returnExpression};`);
  await page.keyboard.press('Tab');

  await expect(editor, 'default value JavaScript editor should contain the expected expression').toContainText(
    `return ${returnExpression};`,
    { timeout: 10_000 },
  );
  await page.waitForTimeout(1_000);
}

export async function setTextDefaultValueFromUserEmailPalette(page: Page): Promise<void> {
  await openDefaultValueTextMode(page);
  await dragUserEmailPaletteToTinyMce(page);
}

async function clickFirstVisible(
  page: Page,
  selector: string,
  description: string,
  timeout = 15_000,
  dispatchFallback = false,
): Promise<void> {
  const locator = await firstVisibleLocator(page, selector, description, timeout);
  if (!dispatchFallback) {
    await locator.click();
    return;
  }
  await locator.click({ timeout: 10_000 }).catch(async () => {
    await locator.dispatchEvent('click');
  });
}

export async function dragUserEmailPaletteToTinyMce(page: Page): Promise<void> {
  await dragSourcePaletteEntryToTinyMce(page, 'user', 'email');
}

export async function dragSourcePaletteEntryToTinyMce(
  page: Page,
  section: SourcePaletteSection,
  label: string,
): Promise<void> {
  await ensureSourcePaletteSectionExpanded(page, section, label);
  await dragPaletteEntryToEditor(page, section, label);
}

async function ensureSourcePaletteSectionExpanded(page: Page, section: SourcePaletteSection, label?: string): Promise<void> {
  if (label) {
    const visibleEntry = sourcePaletteEntryLocator(page, label);
    if (await visibleEntry.isVisible({ timeout: 1_500 }).catch(() => false)) {
      return;
    }
  }

  const expanded = await page.locator(SOURCE_PALETTE_SECTION[section].body).evaluateAll((elements) =>
    elements.some((el) => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.height > 5 && Number(style.opacity) > 0.5 && style.pointerEvents !== 'none';
    }),
  );
  if (expanded) {
    return;
  }

  const header = await firstVisibleLocator(page, SOURCE_PALETTE_SECTION[section].header, `source palette section ${section}`);
  await header.click();
  await page.waitForTimeout(350);
}

async function dragPaletteEntryToEditor(page: Page, section: SourcePaletteSection, label: string): Promise<void> {
  const editorBody = await visibleTinyMceBody(page);
  await editorBody.click();

  const globalTile = sourcePaletteEntryLocator(page, label);
  const scopedTile = page
    .locator(`${SOURCE_PALETTE_SECTION[section].body} [draggable="true"]:visible`)
    .filter({ hasText: label })
    .last();
  const tile = (await globalTile.isVisible({ timeout: 1_000 }).catch(() => false))
    ? globalTile
    : (await scopedTile.isVisible({ timeout: 1_000 }).catch(() => false))
      ? scopedTile
      : globalTile;
  await expect(tile, `source palette entry ${label} should be visible`).toBeVisible({ timeout: 15_000 });

  const before = await editorBody.locator('svg[id^="clickable-"]').count();
  await tile.dragTo(editorBody).catch(() => undefined);
  await page.waitForTimeout(1_000);
  await fireActiveTinyMceChange(page);
  if (await editorContainsPaletteEntry(editorBody, label, before)) {
    return;
  }

  const payload = await page.evaluate(
    ({ entryLabel, sourceSectionBody, sourcePaletteRoot }) => {
      const visible = (el: Element) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      };
      const root =
        [...document.querySelectorAll(sourceSectionBody)].filter(visible).pop() ||
        [...document.querySelectorAll(sourcePaletteRoot)].filter(visible).pop() ||
        document;
      const source = [...root.querySelectorAll('[draggable="true"]')]
        .filter(visible)
        .find((el) => (el.textContent ?? '').trim().toLowerCase().includes(entryLabel.toLowerCase()));
      if (!source) return { ok: false, html: '' };

      const dataTransfer = new DataTransfer();
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }));
      return { ok: true, html: dataTransfer.getData('text/html') };
    },
    { entryLabel: label, sourceSectionBody: SOURCE_PALETTE_SECTION[section].body, sourcePaletteRoot: SEL.sourcePalette },
  );
  expect(payload.ok, `could not get drag payload for ${label}`).toBe(true);

  await page.evaluate((html) => {
    const tinymce = (window as any).tinymce;
    tinymce?.activeEditor?.insertContent(html);
  }, payload.html);
  await fireActiveTinyMceChange(page);
  await expect
    .poll(() => editorContainsPaletteEntry(editorBody, label, before), {
      message: `TinyMCE editor should contain the ${label} Source Palette token`,
      timeout: 10_000,
    })
    .toBe(true);
}

function sourcePaletteEntryLocator(page: Page, label: string): Locator {
  return page.locator('[draggable="true"]:visible').filter({ hasText: label }).last();
}

async function editorContainsPaletteEntry(editorBody: Locator, label: string, previousSvgCount = 0): Promise<boolean> {
  const svgCount = await editorBody.locator('svg[id^="clickable-"]').count().catch(() => 0);
  if (svgCount > previousSvgCount) {
    return true;
  }
  const text = await editorBody.innerText().catch(() => '');
  return normalizeVisibleText(text).toLowerCase().includes(label.toLowerCase());
}

async function visibleTinyMceBody(page: Page): Promise<Locator> {
  const frameBody = page.frameLocator('iframe[title="Rich Text Area"]').last().locator('body');
  if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
    return frameBody;
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'a TinyMCE editor should be visible').toBeVisible({ timeout: 10_000 });
  return inlineEditor;
}

async function fireActiveTinyMceChange(page: Page): Promise<void> {
  await page.evaluate(() => {
    const tinymce = (window as any).tinymce;
    tinymce?.activeEditor?.fire('change');
    tinymce?.activeEditor?.fire('blur');
  });
}

async function confirmAlertIfVisible(page: Page): Promise<void> {
  const alert = page.locator('ion-alert').last();
  if (!(await alert.isVisible({ timeout: 1_500 }).catch(() => false))) {
    return;
  }
  await alert.locator('button.btn--primary').first().click();
  await alert.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
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

/**
 * Open the page settings by clicking the page **navigation buttons block** (the
 * shared tab bar at the bottom of the page that holds the submit/next/prev
 * buttons). Waits for the General/Navigation section toggles to be present so a
 * caller can assert which section opened. Used by #1392.
 */
export async function openPageButtonsConfig(page: Page): Promise<void> {
  const block = page.locator(SEL.pageButtonsBlock).first();
  await block.waitFor({ state: 'visible', timeout: 30_000 });
  await block.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  const box = await block.boundingBox();
  if (!box) {
    throw new Error('page navigation buttons block has no bounding box');
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.locator(SEL.pageButtonsHoverOverlay).first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  // Context guard: the page settings must have opened (both section toggles render).
  await expect(page.locator(SEL.pageSettingsGeneralTab).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(SEL.pageSettingsNavigationTab).first()).toBeVisible({ timeout: 15_000 });
}

/** Which page-settings section is active: 'general' | 'navigation' | 'unknown'. */
export async function activePageSettingsSection(page: Page): Promise<'general' | 'navigation' | 'unknown'> {
  const navActive = await page.locator(SEL.pageSettingsNavigationTab).first().evaluate((el) =>
    el.classList.contains('app-settings-btn-active'),
  );
  if (navActive) return 'navigation';
  const genActive = await page.locator(SEL.pageSettingsGeneralTab).first().evaluate((el) =>
    el.classList.contains('app-settings-btn-active'),
  );
  return genActive ? 'general' : 'unknown';
}

/**
 * Open a page's General settings (where the "Nom de la page" field lives) and
 * leave the General section active. Two affordances reach the same panel and the
 * stable selectors drift across the beta line, so try both and converge on the
 * name field being visible:
 *   1. the page navigation buttons block (2.2 line, e.g. beta233);
 *   2. the Pages panel pencil (older line, e.g. beta158).
 * Used by #1383.
 */
export async function openPageSettings(page: Page): Promise<void> {
  const nameInput = page.locator(SEL.pageNameInput).first();

  // Ensure the General section is shown (the name field lives there) and visible.
  const ensureGeneralName = async (timeout: number): Promise<boolean> => {
    if (await nameInput.isVisible().catch(() => false)) return true;
    const general = page.locator(SEL.pageSettingsGeneralTab).first();
    if (await general.count()) await general.click().catch(() => {});
    return nameInput
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  };

  // Path 1: the page navigation buttons block.
  try {
    await openPageButtonsConfig(page);
    if (await ensureGeneralName(5_000)) return;
  } catch {
    // fall through to the Pages panel
  }

  // Path 2: the Pages panel → hover the page row → click its edit pencil.
  await page.locator(SEL.pagesPanelButton).first().click();
  const row = page.locator(SEL.pageRow).first();
  if (await row.count()) {
    await row.hover().catch(() => {});
    const pencil = page.locator(SEL.pageEditButton).first();
    if (await pencil.count()) await pencil.click().catch(() => {});
  }
  if (await ensureGeneralName(8_000)) return;

  throw new Error('Could not open the page settings: the page name field never became visible.');
}

/**
 * Start recording ion-toast messages. Toasts auto-dismiss after a couple of
 * seconds, so a point-in-time DOM read races against them; install a
 * MutationObserver up front and collect each toast's `message` as it appears.
 * Call before the action that should raise a toast, then read `recordedToasts`.
 */
export async function recordToasts(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __c8oToasts?: string[] };
    if (w.__c8oToasts) return;
    w.__c8oToasts = [];
    const grab = (n: HTMLElement & { message?: string }) => {
      const msg = (n.message ?? n.textContent ?? '').trim();
      if (msg && w.__c8oToasts![w.__c8oToasts!.length - 1] !== msg) w.__c8oToasts!.push(msg);
    };
    const obs = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if ((node as HTMLElement).nodeName === 'ION-TOAST') {
            const toast = node as HTMLElement & { message?: string };
            grab(toast);
            // the message property may be assigned just after insertion
            setTimeout(() => grab(toast), 80);
          }
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });
}

/** Messages captured since `recordToasts` was called. */
export async function recordedToasts(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const w = window as unknown as { __c8oToasts?: string[] };
    return w.__c8oToasts ? [...w.__c8oToasts] : [];
  });
}

/**
 * Add a Horizontal layout container to the current page by double-clicking its
 * palette tile (icon icn_layout.svg). The layout renders as `layoutViewer`.
 * A dblclick fired before the editor is interactive only selects the tile, so
 * wait for the tile, then retry once if the layout did not get added.
 */
export async function addHorizontalLayout(page: Page): Promise<void> {
  const tile = page.locator(`[draggable="true"]:has(img[src$="${PALETTE_ICON.layout}"])`).first();
  await tile.waitFor({ state: 'visible', timeout: 30_000 });
  const layout = page.locator(SEL.layoutViewer);
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.waitForTimeout(1_200);
    await tile.dblclick();
    try {
      await expect(layout).toHaveCount(1, { timeout: 8_000 });
      return;
    } catch {
      // editor was not interactive yet; retry once
    }
  }
  await expect(layout, 'the Horizontal layout was not added to the page').toHaveCount(1, { timeout: 5_000 });
}

/**
 * Drag a palette component (by its icon SVG) into a container element (e.g. a
 * Horizontal layout). Containers of type "layout" only accept children via
 * drag-and-drop, not the double-click add. This is a *real* pointer drag:
 * Playwright/Chromium intercepts native HTML5 drag-and-drop, so pressing the
 * tile and moving the mouse in steps to the container fires the app's genuine
 * dragstart/dragover/drop handlers (which nest the component). The container's
 * active drop zone only appears once the drag is in progress, so aim for it
 * mid-drag before releasing.
 */
export async function dragPaletteComponentInto(
  page: Page,
  paletteIcon: string,
  containerSelector: string,
): Promise<void> {
  const tile = page.locator(`[draggable="true"]:has(img[src$="${paletteIcon}"])`).first();
  const tb = await tile.boundingBox();
  if (!tb) throw new Error(`Palette tile not found for icon ${paletteIcon}`);

  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.mouse.down();
  // a small initial move starts the native drag
  await page.mouse.move(tb.x + tb.width / 2 + 10, tb.y + tb.height / 2 + 10, { steps: 6 });

  const container = page.locator(containerSelector).first();
  const cb = await container.boundingBox();
  if (!cb) throw new Error(`drop container not found: ${containerSelector}`);
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2, { steps: 25 });
  await page.waitForTimeout(400);

  // if the container exposes an explicit drop zone while dragging, aim for it
  const zone = page
    .locator(`${containerSelector} [id*="afterItem"], ${containerSelector} ${SEL.containerInitialDropZone}`)
    .first();
  if (await zone.count()) {
    const zb = await zone.boundingBox();
    if (zb) await page.mouse.move(zb.x + zb.width / 2, zb.y + zb.height / 2, { steps: 8 });
  }
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(1_500);
}

/**
 * Delete a child nested inside a Horizontal layout, then confirm the
 * "Voulez-vous supprimer cet élément ?" dialog. `index` selects which nested
 * child (0-based, canvas order).
 *
 * The layout-child UI was refactored after #1363 was fixed, so the gesture to
 * reach the child's delete differs by version and both are handled:
 *   - new UI (e.g. beta233): hovering the child reveals a button that opens the
 *     child's own editor, whose "Supprimer" deletes just that child;
 *   - old UI (e.g. beta151, where the bug lives): clicking the child opens its
 *     config panel, whose trash — wrongly bound to the parent — deletes the whole
 *     layout (the bug).
 * Both end on the same `componentDeleteButton` + danger-styled "Oui" confirm, so
 * the spec's assertion (does the layout survive?) is what distinguishes them.
 */
export async function deleteLayoutChild(page: Page, index = 0): Promise<void> {
  const card = page.locator(SEL.layoutChildCard).nth(index);
  const box = await card.boundingBox();
  if (!box) throw new Error(`layout child card #${index} not found`);

  // Hover the child (mouseenter) so any hover affordance renders.
  await page.mouse.move(5, 5);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.waitForTimeout(600);

  const openButton = page.locator(SEL.layoutChildOpenButton).first();
  if (await openButton.count()) {
    // new UI: open the child's own editor
    await openButton.click();
  } else {
    // old UI: click the child to open its config panel
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  const del = page.locator(`${SEL.componentDeleteButton}:visible`).first();
  await del.waitFor({ state: 'visible', timeout: 10_000 });
  await del.click();
  await page.locator('ion-alert').first().waitFor({ state: 'visible', timeout: 8_000 });
  await page.locator(SEL.confirmDeleteYesButton).first().click();
  await page.waitForTimeout(1_500);
}
