import { Locator, Page, expect, test } from '@playwright/test';

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
  // settingsPage.yaml — MCP tokens section
  settingsMcpRoot: '.class1781107106295',
  settingsMcpUrl: '.class1781107106327',
  settingsMcpTokenNameInput: 'ion-input.class1781107106349 input, .class1781107106349 input',
  settingsMcpCreateButton: 'ion-button.class1781107106355',
  settingsMcpCreatedToken: '.class1781107109433',
  settingsMcpTokenRow: '.class1781107109455',
  settingsMcpRevokeButton: 'ion-button.class1781107109485',
  // editor — component overlay ("click to configure")
  componentOverlay: '.class1776441955089',
  // component/action config panel tab buttons, selected by stable ids in helpers
  configTab: ':is(.class1775835275881, .toast-action-tab-button)',
  configTabsContainer: '[data-main-editor-tabs-buttons="configuration"]',
  // component style panel tabs
  styleTab: '.class1775832335416',
  styleTabsContainer: '[data-main-editor-tabs-buttons="style"]',
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
  defaultValueEditorWithPalette: 'c8oforms-defaultvalueeditorwithpalette',
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
  submitFlowButton: '#unique_submit',
  pageRow: '.class1775140559440, .class1749805611480, .class1650357059456, .class1650357059543',
  pageEditButton:
    '[title^="Modifier la page"], [aria-label^="Modifier la page"], [title^="Edit page"], [aria-label^="Edit page"], .class1775140098599, .class1774949227812, .class1650357059474, .class1775140098605, .class1774948900804',
  pageDeleteAction:
    '.class1775140098632, .class1774949276438, [data-id="delete-action-pages"], ion-icon[src$="trash-2.svg"], img[src$="trash-2.svg"]',
  pageAddButton: '.class1750084426535',
  pageSearchbar: 'ion-searchbar.class1774460274462',
  pageSettingsCard: '.class1650357060215',
  pageSettingsCloseButton: '.c8o-btn-close',
  // page settings "Nom de la page" input (TextInputSetting)
  pageNameInput: '.class1776265600007 input, ion-input.class1775119427737 input, .class1775119427737 input',
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
  pwaEditModal: 'ion-modal.modal-pwa-edition.show-modal, ion-modal.modalCSV.show-modal',
  pwaAccessToggle: '.class1779878486939:visible',
  pwaAccessToggleButton: 'button.class1775840591959',
  pwaLegacyAccessCheckbox: 'ion-checkbox.class1646907933319',
  pwaIconEditor: '.icon-picker, .class1779811544755, .class1603800885985',
  pwaIconEditButton: 'ion-button.class1649864949366, ion-button.buttonEditIcon',
  pwaNameInput: 'ion-input.class1603802354868 input',
  pwaShortNameInput: 'ion-input.class1603803008204 input',
  pwaSaveButton: 'ion-button.class1762425668421, ion-button.class1649838959998',
  wallpaperModal: 'ion-modal.modal-custom--hw-100, ion-modal.modal-custom, ion-modal.modalCSV',
  wallpaperColorSegmentButton: 'ion-segment-button.class1774608193139, ion-segment-button.class1648553976686',
  wallpaperSaveButton: 'ion-button.class1774608108762, ion-button.class1586166864663',
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
  flowLoopActionCard: 'ion-row[id*="@prefixc8oitem"][id*="@prefixc8otypefor_loop"]',
  flowLoopActionEditor: 'c8oforms-itemforloopeditor1',
  flowLoopConditionRow: '.for-loop-condition-row',
  flowLoopPaletteButton: 'c8oforms-itemforloopeditor1 ion-button.class1777542949212',
  flowConditionActionCard: 'ion-row[id*="@prefixc8oitem"][id*="@prefixc8otypeif_else"]',
  flowConditionEditor: '.flow-condition-editor',
  flowConditionVisualModeButton: 'ion-button.class1743536234020, ion-button.class1777544520315',
  flowConditionBuilder: '.flow-condition-editor c8oforms-conditionvisibleif, .flow-condition-editor ion-select',
  flowConditionFieldBrowseButton: '.flow-condition-editor ion-button.class1595231678502',
  flowConditionFieldInput: '.flow-condition-editor input[disabled]',
  flowConditionTextModeButton: '.flow-condition-editor ion-button:has(ion-icon[name="text-outline"])',
  flowConditionJavaScriptModeButton: '.flow-condition-editor ion-button:has(ion-icon[name="logo-javascript"])',
  flowSubmitActionCard: 'ion-row[id*="@prefixc8oitemsubmit"][id*="@prefixc8otypesubmit"]',
  flowToastActionCard: 'ion-row[id*="@prefixc8oitem"][id*="@prefixc8otypetoast"]',
  toastActionTabButton: 'button.toast-action-tab-button',
  toastMessageRow: '.toast-message-row',
  baserowActionAddVariableButton: 'c8oforms-button_variable.class1775996201019 button.class1775995541940',
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

type MainEditorConfigTab =
  | 'tab_selector_choice_source'
  | 'tab_selector_conf_source'
  | 'tab_selector_choice_action'
  | 'tab_selector_conf_action'
  | 'visibility_tab_selector'
  | 'navigation_tab_selector'
  | 'defaultvalue'
  | 'data_interactions';

export interface SourcePaletteSectionState {
  name: SourcePaletteSection;
  expanded: boolean;
  height: number;
  opacity: number;
  pointerEvents: string;
}

export interface SourcePaletteDragPayload {
  types: string[];
  textData: string;
  plainData: string;
  htmlData: string;
  typeData: string;
}

export interface FlowConditionOperatorSelectState {
  value: string | null;
  optionValues: string[];
  text: string;
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
  settings: /\/settings(?:\/|$)/,
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
  toastAction: 'icn_toast.svg',
  file: 'icn_import.svg',
  signature: 'icn_sign.svg',
  location: 'location.svg',
  forLoop: 'icn_for_loop.svg',
  conditionAction: 'icn_if_else.svg',
  submitAction: 'icn_submit.svg',
  baserowAddRowFromData: 'forms_AddRowFromData.svg',
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

export async function openSettings(page: Page): Promise<void> {
  await test.step('open user settings', async () => {
    await page.goto('./settings', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectRoute(page, ROUTE.settings, 60_000);
    await page.locator('page-settingspage').waitFor({ state: 'attached', timeout: 60_000 });
    await expect(page.locator(SEL.settingsMcpRoot), 'the MCP tokens settings section should be visible').toBeVisible({
      timeout: 30_000,
    });
  });
}

export function mcpTokenRow(page: Page, tokenName: string): Locator {
  return page.locator(SEL.settingsMcpTokenRow).filter({ hasText: tokenName }).first();
}

export async function expectMcpTokenListed(page: Page, tokenName: string): Promise<Locator> {
  return test.step(`assert MCP token ${tokenName} is listed`, async () => {
    const row = mcpTokenRow(page, tokenName);
    await expect(row, `MCP token ${tokenName} should be listed`).toBeVisible({ timeout: 30_000 });
    return row;
  });
}

export async function createMcpTokenThroughSettingsUi(page: Page, tokenName: string): Promise<string> {
  return test.step(`create MCP token ${tokenName}`, async () => {
    await expect(page.locator(SEL.settingsMcpRoot), 'the MCP tokens settings section should be visible').toBeVisible({
      timeout: 30_000,
    });
    await fillInputValue(page, SEL.settingsMcpTokenNameInput, tokenName, 'MCP token name input');
    const createButton = page.locator(SEL.settingsMcpCreateButton).first();
    await expect(createButton, 'the MCP token create button should be enabled').toBeEnabled({ timeout: 10_000 });
    await createButton.click();

    const token = page.locator(SEL.settingsMcpCreatedToken).first();
    await expect(token, 'the newly created MCP token should be displayed once').toBeVisible({ timeout: 30_000 });
    let tokenValue = '';
    await expect
      .poll(
        async () => {
          tokenValue = (await token.innerText().catch(() => '')).trim();
          return tokenValue.length;
        },
        {
          message: 'the newly created MCP token value should be populated',
          timeout: 30_000,
        },
      )
      .toBeGreaterThan(20);
    await expectMcpTokenListed(page, tokenName);
    return tokenValue;
  });
}

export async function revokeMcpTokenThroughSettingsUi(page: Page, tokenName: string): Promise<void> {
  await test.step(`revoke MCP token ${tokenName}`, async () => {
    const row = await expectMcpTokenListed(page, tokenName);
    const revokeButton = row.locator(SEL.settingsMcpRevokeButton).first();
    await expect(revokeButton, `MCP token ${tokenName} should expose a revoke button`).toBeVisible({ timeout: 10_000 });
    await revokeButton.click();
  });
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
  const cards = page.locator('[id^="idcard"]');
  let card = cards.filter({ hasText: title }).first();
  if (!(await card.isVisible({ timeout: 10_000 }).catch(() => false))) {
    card = cards.filter({ hasText: title.slice(0, 29) }).first();
  }
  await expect(card, `home should show form card ${title}`).toBeVisible({ timeout: 30_000 });
  await card.click();
  await expectRoute(page, ROUTE.editor);
}

export async function returnToSelectorFromEditor(page: Page): Promise<void> {
  if (ROUTE.selector.test(page.url())) {
    return;
  }
  await page.locator(SEL.editorHomeButton).first().click();
  await expectRoute(page, ROUTE.selector);
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
  const section = page.locator(SEL.configSectionLabel).first();
  await expect(section, 'configuration section should be visible').toBeVisible({ timeout: 10_000 });
  await section.click({ timeout: 10_000 }).catch(async () => section.dispatchEvent('click'));
  const scopedTabs = page.locator(`${SEL.configTabsContainer} ${SEL.configTab}`).first();
  const mounted = await scopedTabs.waitFor({ state: 'attached', timeout: 10_000 }).then(() => true).catch(() => false);
  if (!mounted) {
    await expect(page.locator(SEL.configTab).first(), 'configuration tabs should be mounted').toBeAttached({ timeout: 10_000 });
  }
  await page.waitForTimeout(350);
}

export async function openConfigTabById(page: Page, tabId: MainEditorConfigTab): Promise<void> {
  if (await clickConfigTabById(page, tabId)) {
    await page.waitForTimeout(350);
    return;
  }
  if (await clickConfigTabByFallbackText(page, tabId)) {
    await page.waitForTimeout(350);
    return;
  }
  if (await clickConfigTabByFallbackIndex(page, tabId)) {
    await page.waitForTimeout(350);
    return;
  }

  await openConfigurationSection(page);
  if (await clickConfigTabById(page, tabId)) {
    await page.waitForTimeout(350);
    return;
  }
  if (await clickConfigTabByFallbackText(page, tabId)) {
    await page.waitForTimeout(350);
    return;
  }
  if (await clickConfigTabByFallbackIndex(page, tabId)) {
    await page.waitForTimeout(350);
    return;
  }

  throw new Error(`No visible config tab matches id ${tabId}. Visible tabs: ${(await visibleTexts(page, SEL.configTab)).join(' | ')}`);
}

export async function expectButtonStyleTabsOnly(page: Page): Promise<void> {
  const container = page.locator(SEL.styleTabsContainer).first();
  await expect(container, 'button style tabs should be visible').toBeVisible({ timeout: 15_000 });

  const tabs = container.locator(`${SEL.styleTab}:visible`);
  await expect(
    tabs,
    'Button style tabs should expose only the two button-specific sections; the generic Question tab must be absent.',
  ).toHaveCount(2);
  await expect(tabs.first(), 'button visual style section should remain accessible').toBeVisible();
  await expect(tabs.nth(1), 'button icon style section should remain accessible').toBeVisible();
}

async function clickConfigTabById(page: Page, tabId: MainEditorConfigTab): Promise<boolean> {
  const tabs = await visibleConfigTabs(page);
  const index = await configTabIndexById(page, tabId);
  if (index === null || index < 0) {
    return false;
  }

  const tab = tabs.nth(index);
  if (!(await tab.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return false;
  }
  await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
  return true;
}

const CONFIG_TAB_FALLBACK_TEXT: Partial<Record<MainEditorConfigTab, string[]>> = {
  tab_selector_choice_source: ['source selection', 'choix de la source', 'eleccion de la fuente', 'scelta della sorgente'],
  tab_selector_conf_source: [
    'source configuration',
    'configuration de la source',
    'configuracion de la fuente',
    'configurazione della sorgente',
  ],
  defaultvalue: ['default value', 'valeur par defaut', 'valor por defecto', 'valore predefinito'],
  data_interactions: ['data & interactions', 'donnees & interactions', 'datos e interacciones', 'dati e interazioni'],
  visibility_tab_selector: ['visibility', 'visibilite', 'visibilidad', 'visibilita'],
  navigation_tab_selector: ['navigation', 'navegacion', 'navigazione'],
};

async function clickConfigTabByFallbackText(page: Page, tabId: MainEditorConfigTab): Promise<boolean> {
  const labels = CONFIG_TAB_FALLBACK_TEXT[tabId]?.map(searchableVisibleText);
  if (!labels?.length) {
    return false;
  }

  const tabs = await visibleConfigTabs(page);
  const count = await tabs.count();
  for (let index = 0; index < count; index++) {
    const tab = tabs.nth(index);
    const text = searchableVisibleText(await tab.innerText().catch(() => ''));
    if (labels.includes(text)) {
      await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
      return true;
    }
  }
  return false;
}

async function clickConfigTabByFallbackIndex(page: Page, tabId: MainEditorConfigTab): Promise<boolean> {
  const tabs = await visibleConfigTabs(page);
  const index = fallbackConfigTabIndex(tabId, await tabs.count());
  if (index == null) {
    return false;
  }

  const tab = tabs.nth(index);
  if (!(await tab.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return false;
  }
  await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
  return true;
}

async function visibleConfigTabs(page: Page): Promise<Locator> {
  const scoped = page.locator(`${SEL.configTabsContainer} ${SEL.configTab}:visible`);
  if ((await scoped.count()) > 0) {
    return scoped;
  }
  return page.locator(`${SEL.configTab}:visible`);
}

function visibleSourcePaletteRoot(page: Page): Locator {
  return page.locator(SOURCE_PALETTE_ROOT_VISIBLE).last();
}

function fallbackConfigTabIndex(tabId: MainEditorConfigTab, visibleTabCount: number): number | null {
  if (visibleTabCount <= 0) return null;
  const hasSourceChoiceTab = visibleTabCount >= 5;
  switch (tabId) {
    case 'tab_selector_choice_source':
      return hasSourceChoiceTab ? 0 : null;
    case 'tab_selector_choice_action':
      return visibleTabCount === 2 || visibleTabCount >= 6 ? 0 : null;
    case 'tab_selector_conf_source':
      if (visibleTabCount === 4) return 0;
      return hasSourceChoiceTab ? 1 : null;
    case 'tab_selector_conf_action':
      if (visibleTabCount === 2) return 1;
      return visibleTabCount >= 6 ? visibleTabCount - 5 : null;
    case 'defaultvalue':
      return hasSourceChoiceTab ? visibleTabCount - 4 : visibleTabCount > 1 ? 1 : null;
    case 'data_interactions':
      if (visibleTabCount === 4) return 1;
      return hasSourceChoiceTab ? visibleTabCount - 3 : 0;
    case 'visibility_tab_selector':
      return visibleTabCount > 1 ? visibleTabCount - 2 : null;
    case 'navigation_tab_selector':
      return visibleTabCount - 1;
    default:
      return null;
  }
}

async function configTabIndexById(page: Page, tabId: MainEditorConfigTab): Promise<number | null> {
  return page
    .evaluate((targetTabId) => {
      const seen = new Set<object>();
      const candidates: any[] = [];
      const visit = (entry: unknown) => {
        if (
          entry &&
          typeof entry === 'object' &&
          !seen.has(entry) &&
          typeof (entry as any).getMainEditorTabIds === 'function' &&
          typeof (entry as any).getActiveMainEditorItem === 'function' &&
          (entry as any).local != null
        ) {
          seen.add(entry);
          candidates.push(entry);
        }
      };
      const visitMaybeContext = (value: unknown) => {
        if (Array.isArray(value)) {
          for (const entry of value) visit(entry);
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

      const visible = (el: Element) => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const visibleConfigTabs = [
        ...document.querySelectorAll('[data-main-editor-tabs-buttons="configuration"] .class1775835275881, [data-main-editor-tabs-buttons="configuration"] .toast-action-tab-button'),
      ].filter(visible);
      if (visibleConfigTabs.length === 0) return null;

      for (const editor of candidates) {
        const ids = [editor.idselected, editor.idselectedC].filter((id) => id != null && id !== '');
        const items = ids
          .map((id) => editor.getEditorChildById?.(id) ?? editor.getElementByID?.(id))
          .filter((item) => item != null);
        for (const baseItem of items) {
          const item = editor.getActiveMainEditorItem(baseItem) ?? baseItem;
          const tabIds = editor.getMainEditorTabIds(item, 'configuration') ?? [];
          const index = tabIds.indexOf(targetTabId);
          if (index !== -1 && index < visibleConfigTabs.length) {
            return index;
          }
        }
      }
      return null;
    }, tabId)
    .catch(() => null);
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
  await visibleSourcePaletteRoot(page).waitFor({ state: 'visible', timeout: 15_000 });
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
  const header = visibleSourcePaletteRoot(page).locator(SOURCE_PALETTE_SECTION[section].header).first();
  await expect(header, `source palette section ${section} should be visible`).toBeVisible({ timeout: 15_000 });
  await header.click();
  await page.waitForTimeout(350);
}

export async function sourcePaletteSectionStates(
  page: Page,
  sections: SourcePaletteSection[] = DEFAULT_SOURCE_PALETTE_SECTIONS,
): Promise<SourcePaletteSectionState[]> {
  await visibleSourcePaletteRoot(page).waitFor({ state: 'visible', timeout: 15_000 });
  return page.evaluate(
    ({ rootSelector, definitions, sectionNames }) => {
      const isRenderable = (el: Element | null): el is HTMLElement => {
        if (!(el instanceof HTMLElement)) return false;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      };
      const root = [...document.querySelectorAll(rootSelector)].filter(isRenderable).pop() || document;

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
      rootSelector: SOURCE_PALETTE_ROOT,
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
  const toast = page.locator('ion-toast:visible').last();
  if (await toast.isVisible({ timeout }).catch(() => false)) {
    const action = toast.locator('button, ion-button').last();
    if (await action.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await action.click({ force: true }).catch(async () => action.dispatchEvent('click'));
    }
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

export interface BaserowAddRowActionOptions extends BaserowGridSourceOptions {
  flowName?: string | RegExp;
  mappings: Array<{
    column: string;
    sourceSection?: SourcePaletteSection;
    sourceLabel: string;
  }>;
}

const SELECT_SOURCE_TABLE_PICKER_BUTTON = SEL.dataSourceConfigureButton;
const BASEROW_ACTION_VARIABLE_ROW = 'ion-item.class1743090805947';
const BASEROW_ACTION_VARIABLE_INPUT = `${BASEROW_ACTION_VARIABLE_ROW} input`;
const BASEROW_ACTION_VARIABLE_BUTTON = 'c8oforms-button_variable.class1775996201011 button.class1775995541940';
const BASEROW_ACTION_SOURCE_PALETTE_BUTTON = 'ion-button.class1776001071909';
const SOURCE_PALETTE_ROOT = `${SEL.sourcePalette}, .class1776003235786`;
const SOURCE_PALETTE_ROOT_VISIBLE = `${SEL.sourcePalette}:visible, .class1776003235786:visible`;
const SELECT_SOURCE_COLUMN_ROW = 'ion-item.class1776161384798';
const SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX = 'ion-checkbox.class1776352302823';
const SELECT_SOURCE_VALUE_COLUMN_CHECKBOX = 'ion-checkbox.class1776352314668';
const DATA_SOURCE_EDITOR_ACTION_BUTTON = 'button.class1775995541940';
const DATA_SOURCE_SORT_ACTION_INDEX = 2;

export async function configureGridBaserowSource(page: Page, source: BaserowGridSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await page.locator('.class1775835275863').first().click();
  await openConfigTabById(page, 'tab_selector_choice_source');

  await activateDataSourceMode(page);
  await selectDataSourceEntry(page, pickerTimeout, 'getData');

  await openConfigTabById(page, 'tab_selector_conf_source');
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

export async function selectGridBaserowSourceWithoutTable(page: Page): Promise<void> {
  await test.step('Select the Baserow data source without configuring a table', async () => {
    await openConfigurationSection(page);
    await openConfigTabById(page, 'tab_selector_choice_source');
    await activateDataSourceMode(page);
    await selectDataSourceEntry(page, 60_000, 'getData');

    await openConfigTabById(page, 'tab_selector_conf_source');
    await expect(
      page.locator(`${DATA_SOURCE_EDITOR_ACTION_BUTTON}:visible`).first(),
      'the data source configuration actions should be visible',
    ).toBeVisible({ timeout: 15_000 });
  });
}

export async function openDataSourceSortPanel(page: Page): Promise<void> {
  await test.step('Open the data source Sort panel', async () => {
    const actions = page.locator(`${DATA_SOURCE_EDITOR_ACTION_BUTTON}:visible`);
    const sortAction = actions.nth(DATA_SOURCE_SORT_ACTION_INDEX);
    await expect(sortAction, 'the data source Sort action should be visible').toBeVisible({ timeout: 15_000 });
    await sortAction.click({ timeout: 10_000 }).catch(async () => sortAction.dispatchEvent('click'));
    await expect(sortAction, 'the data source Sort action should be selected').toHaveClass(/figma-button--selected/, {
      timeout: 10_000,
    });
  });
}

export async function expectDataSourceSortMissingConfigResolved(page: Page): Promise<void> {
  const progress = page.locator('c8oforms-datasourceeditor ion-progress-bar:visible');
  await expect(
    progress,
    'Sort should report the missing table/source configuration instead of showing an endless progress bar.',
  ).toHaveCount(0);

  await expect(
    page.locator('c8oforms-datasourceeditor p:visible').first(),
    'Sort should render a visible missing-configuration message.',
  ).toBeVisible({ timeout: 15_000 });
}

export async function configureSelectBaserowSource(page: Page, source: BaserowSelectSourceOptions): Promise<void> {
  await acceptRgpdIfVisible(page);
  const configurationSection = page.locator('.class1775835275863').first();
  if (await configurationSection.isVisible().catch(() => false)) {
    await configurationSection.click();
  }

  await openConfigTabById(page, 'tab_selector_choice_source');
  await activateDataSourceMode(page);

  await selectDataSourceEntry(page, 60_000, 'getSelectData');

  await openConfigTabById(page, 'tab_selector_conf_source');
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

export async function configureButtonFlowBaserowAddRow(page: Page, source: BaserowAddRowActionOptions): Promise<void> {
  // Resilience for this flow is layered: the picker re-clicks each level until it
  // advances (slow lazy fetches), and the spec uses test-level retries to re-run
  // from scratch when the editor content intermittently stalls on
  // "Page loading in progress". A hard page.reload() does NOT recover that stall
  // (the reloaded editor stays empty), so we drive the flow once here.
  await configureButtonFlowBaserowAddRowOnce(page, source);
}

async function openButtonWorkflow(page: Page, flowName?: string | RegExp): Promise<void> {
  await openWorkflowsPanel(page);
  let flow = flowName
    ? page.locator('[draggable="true"]').filter({ hasText: flowName }).first()
    : page.locator(SEL.submitFlowButton).first();
  if (!flowName && !(await flow.isVisible({ timeout: 2_000 }).catch(() => false))) {
    flow = page.locator('[draggable="true"]').filter({ hasText: /Flow button/i }).first();
  }
  await expect(flow, 'button flow should be available in Workflows').toBeVisible({ timeout: 30_000 });
  await flow.click({ timeout: 10_000 }).catch(async () => flow.dispatchEvent('click'));
  await page.waitForTimeout(1_000);
}

async function configureButtonFlowBaserowAddRowOnce(page: Page, source: BaserowAddRowActionOptions): Promise<void> {
  const timeout = 60_000;
  await openButtonWorkflow(page, source.flowName);

  await clickFirstVisible(page, SEL.componentPanelButton, 'action palette panel', 15_000, true);
  const actionTile = page.locator(componentPaletteTileSelector(PALETTE_ICON.baserowAddRowFromData)).last();
  await expect(actionTile, 'Baserow Add Row action should be available in the action palette').toBeVisible({
    timeout: 30_000,
  });
  const actionSelector = SEL.flowSubmitActionCard;
  const before = await page.locator(actionSelector).count();
  // Add the action only if the flow does not already carry one (idempotent on
  // a reload-retry where a previous attempt already added it).
  if (before === 0) {
    await actionTile.dblclick({ force: true, delay: 75 });
    await expect
      .poll(() => page.locator(actionSelector).count(), {
        message: 'Baserow Add Row action should be added to the flow',
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
  }

  const action = page.locator(actionSelector).last();
  await action.click();
  await page.waitForTimeout(1_000);
  await openConfigTabById(page, 'tab_selector_conf_action');
  if (!(await firstVisibleLocatorOrNull(page, SELECT_SOURCE_TABLE_PICKER_BUTTON, 1_000))) {
    await selectBaserowAddRowAction(page, timeout);
    await openConfigTabById(page, 'tab_selector_conf_action');
  }
  await page.waitForTimeout(1_000);

  await selectBaserowTableFromCurrentAction(page, source, timeout);

  for (const mapping of source.mappings) {
    await ensureBaserowActionVariableRow(page, mapping.column);
  }
  for (const mapping of source.mappings) {
    await mapBaserowActionVariable(page, mapping.column, mapping.sourceSection ?? 'form', mapping.sourceLabel);
  }

  const close = page.locator('button.class1741109898862, .c8o-btn-close.class1741109898862').last();
  if (await close.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await close.click({ timeout: 10_000 }).catch(async () => close.dispatchEvent('click'));
  } else {
    throw new Error('flow action close button is not visible');
  }
  await page.waitForTimeout(1_500);
}

async function selectBaserowAddRowAction(page: Page, timeout: number): Promise<void> {
  await openConfigTabById(page, 'tab_selector_choice_action');
  await clickFirstVisible(page, SEL.dataSourceSelectButton, 'Baserow action select button', timeout, true);

  const actionPicker = page.locator('ion-modal:visible').last();
  await expect(actionPicker, 'Baserow action picker should be visible').toBeVisible({ timeout });

  let addRowAction = actionPicker
    .locator('c8oforms-datasourcebutton:has(img[src*="/projects/lib_BaseRow/logos/forms_AddRowFromData.svg"])')
    .first();
  if (!(await addRowAction.isVisible({ timeout: 5_000 }).catch(() => false))) {
    addRowAction = actionPicker.locator('c8oforms-datasourcebutton:has(img[src*="/projects/lib_BaseRow/logos/forms_AddRow.svg"])').first();
  }
  await expect(addRowAction, 'Baserow Add Row action should be available in the action picker').toBeVisible({ timeout });
  await addRowAction.click({ timeout: 10_000 }).catch(async () => addRowAction.dispatchEvent('click'));

  await actionPicker.locator('ion-footer ion-button').last().click({ timeout: 10_000 });
  await expect(actionPicker).toBeHidden({ timeout });
  await page.waitForTimeout(1_500);
}

interface ButtonFlowActionOptions {
  flowName?: string | RegExp;
  icon: string;
  actionCardSelector: string;
  actionName: string;
}

async function openButtonFlowActionConfig(
  page: Page,
  { flowName, icon, actionCardSelector, actionName }: ButtonFlowActionOptions,
): Promise<void> {
  await test.step('Open the Button workflow', async () => {
    await openButtonWorkflow(page, flowName);
  });

  await test.step(`Add the ${actionName} action`, async () => {
    await clickFirstVisible(page, SEL.componentPanelButton, 'action palette panel', 15_000, true);
    const actionTile = page.locator(componentPaletteTileSelector(icon)).last();
    await expect(actionTile, `${actionName} action should be available in the action palette`).toBeVisible({
      timeout: 30_000,
    });

    const before = await page.locator(actionCardSelector).count();
    await actionTile.dblclick({ force: true, delay: 75 });
    await expect
      .poll(() => page.locator(actionCardSelector).count(), {
        message: `${actionName} action should be added to the flow`,
        timeout: 15_000,
      })
      .toBeGreaterThan(before);
  });

  await test.step(`Open the ${actionName} action configuration`, async () => {
    const action = page.locator(actionCardSelector).last();
    await expect(action, `${actionName} action card should be visible in the flow`).toBeVisible({ timeout: 15_000 });
    await action.click();
    await page.waitForTimeout(1_000);
  });
}

export async function openButtonFlowLoopActionConfig(page: Page, flowName?: string | RegExp): Promise<void> {
  await openButtonFlowActionConfig(page, {
    flowName,
    icon: PALETTE_ICON.forLoop,
    actionCardSelector: SEL.flowLoopActionCard,
    actionName: 'Loop',
  });
}

interface ClippedElementState {
  width: number;
  height: number;
  visibleWidth: number;
  visibleHeight: number;
  visibleWidthRatio: number;
  visibleHeightRatio: number;
  clippingAncestors: string[];
  wrapperOverflows: string[];
}

export async function expectLoopActionPaletteButtonFullyVisible(page: Page): Promise<void> {
  await test.step('Assert the Loop action Palette button is fully visible', async () => {
    await expect(page.locator(SEL.flowLoopActionEditor).last(), 'Loop action editor should be visible').toBeVisible({
      timeout: 15_000,
    });
    const button = page.locator(SEL.flowLoopPaletteButton).last();
    await expect(button, 'Loop action Palette button should be mounted').toBeVisible({ timeout: 15_000 });

    const state = await page.locator(SEL.flowLoopActionEditor).last().evaluate((editor): ClippedElementState => {
      const buttonEl = editor.querySelector('ion-button.class1777542949212');
      if (!(buttonEl instanceof HTMLElement)) {
        throw new Error('Loop action Palette button was not found inside the Loop action editor');
      }

      const rect = buttonEl.getBoundingClientRect();
      let left = rect.left;
      let top = rect.top;
      let right = rect.right;
      let bottom = rect.bottom;
      const clippingAncestors: string[] = [];
      const wrapperOverflows: string[] = [];
      const wrappers = [
        editor.querySelector('.flow-editor-row.for-loop-condition-row'),
        editor.querySelector('.for-loop-condition-col'),
        editor.querySelector('c8oforms-defaultvalueeditorwithpalette.class1743173372803'),
      ].filter((node): node is Element => node instanceof Element);

      for (const wrapper of wrappers) {
        const style = getComputedStyle(wrapper);
        const clipsX = style.overflowX !== 'visible';
        const clipsY = style.overflowY !== 'visible';
        const className = typeof wrapper.className === 'string' ? wrapper.className : '';
        wrapperOverflows.push(`${wrapper.tagName.toLowerCase()}.${className}(${style.overflowX}/${style.overflowY})`);

        if (!clipsX && !clipsY) continue;

        const ancestorRect = wrapper.getBoundingClientRect();
        if (clipsX) {
          left = Math.max(left, ancestorRect.left);
          right = Math.min(right, ancestorRect.right);
        }
        if (clipsY) {
          top = Math.max(top, ancestorRect.top);
          bottom = Math.min(bottom, ancestorRect.bottom);
        }

        clippingAncestors.push(`${wrapper.tagName.toLowerCase()}.${className}(${style.overflowX}/${style.overflowY})`);
      }

      const width = rect.width;
      const height = rect.height;
      const visibleWidth = Math.max(0, right - left);
      const visibleHeight = Math.max(0, bottom - top);
      return {
        width,
        height,
        visibleWidth,
        visibleHeight,
        visibleWidthRatio: width > 0 ? visibleWidth / width : 0,
        visibleHeightRatio: height > 0 ? visibleHeight / height : 0,
        clippingAncestors,
        wrapperOverflows,
      };
    });

    expect(
      state.visibleWidthRatio,
      `Loop action Palette button should not be clipped horizontally; visible ${state.visibleWidth.toFixed(
        1,
      )}/${state.width.toFixed(1)}px, clipping wrappers: ${state.clippingAncestors.join(
        ' -> ',
      )}; wrapper overflows: ${state.wrapperOverflows.join(' -> ')}`,
    ).toBeGreaterThanOrEqual(0.95);
    expect(
      state.visibleHeightRatio,
      `Loop action Palette button should not be clipped vertically; visible ${state.visibleHeight.toFixed(
        1,
      )}/${state.height.toFixed(1)}px`,
    ).toBeGreaterThanOrEqual(0.95);
  });
}

export async function openButtonFlowConditionActionConfig(page: Page, flowName?: string | RegExp): Promise<void> {
  await openButtonFlowActionConfig(page, {
    flowName,
    icon: PALETTE_ICON.conditionAction,
    actionCardSelector: SEL.flowConditionActionCard,
    actionName: 'Condition',
  });
}

export async function openButtonFlowToastActionConfig(page: Page, flowName?: string | RegExp): Promise<void> {
  await openButtonFlowActionConfig(page, {
    flowName,
    icon: PALETTE_ICON.toastAction,
    actionCardSelector: SEL.flowToastActionCard,
    actionName: 'Toast',
  });
}

export async function openToastActionMessageEditor(page: Page): Promise<void> {
  await test.step('Open the Toast message editor', async () => {
    const messageRow = page.locator(SEL.toastMessageRow).last();
    if (!(await messageRow.isVisible({ timeout: 1_000 }).catch(() => false))) {
      const tab =
        (await page
          .locator(`${SEL.toastActionTabButton}:visible`)
          .filter({ hasText: /^(Message|Mensaje|Messaggio)$/i })
          .last()
          .isVisible({ timeout: 1_000 })
          .catch(() => false))
          ? page
              .locator(`${SEL.toastActionTabButton}:visible`)
              .filter({ hasText: /^(Message|Mensaje|Messaggio)$/i })
              .last()
          : page.getByRole('button', { name: /^(Message|Mensaje|Messaggio)$/i }).last();
      await expect(tab, 'Toast action should expose a Message tab').toBeVisible({ timeout: 15_000 });
      await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
    }
    await expect(messageRow, 'Toast message row should be visible').toBeVisible({ timeout: 15_000 });
    const editor = page.locator(`${SEL.toastMessageRow} ${SEL.defaultValueEditorWithPalette}`).last();
    await expect(editor, 'Toast message should use the sourceable text editor').toBeVisible({ timeout: 15_000 });
  });
}

export async function expectLoopActionIteratorModesConfigurable(page: Page, textIterator: string): Promise<void> {
  await test.step('Check the Loop iterator editor', async () => {
    const loopRow = page.locator(SEL.flowLoopConditionRow).last();
    await expect(loopRow, 'Loop action should expose the iterator editor row').toBeVisible({ timeout: 15_000 });
    await expect(
      loopRow.locator(SEL.defaultValueEditorWithPalette),
      'Loop action should mount the iterator editor with palette',
    ).toBeVisible({ timeout: 15_000 });
  });

  await test.step('Configure the Loop iterator in text mode', async () => {
    await clickFirstVisible(page, SEL.defaultValueTextButton, 'Loop iterator text mode');
    await confirmAlertIfVisible(page);
    await fillVisibleTinyMceText(page, textIterator, 'Loop iterator text editor');
  });

  await test.step('Switch the Loop iterator to JavaScript mode', async () => {
    await clickFirstVisible(page, SEL.defaultValueJavaScriptButton, 'Loop iterator JavaScript mode');
    await confirmAlertIfVisible(page);
    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, 'Loop iterator JavaScript editor should be visible').toBeVisible({ timeout: 15_000 });
    await expect(editor, 'Loop iterator JavaScript editor should keep the generated async wrapper').toContainText('return', {
      timeout: 10_000,
    });
  });
}

export async function expectConditionActionModesSwitchable(page: Page): Promise<void> {
  await test.step('Check the If condition editor', async () => {
    const conditionEditor = page.locator(SEL.flowConditionEditor).last();
    await expect(conditionEditor, 'Condition action should expose the If editor').toBeVisible({ timeout: 15_000 });
    await expect(page.locator(SEL.flowConditionVisualModeButton).last(), 'Condition action should expose field/operator mode').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.flowConditionBuilder).first(), 'Condition field/operator builder should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.flowConditionTextModeButton).last(), 'Condition action should expose Aa mode').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.flowConditionJavaScriptModeButton).last(), 'Condition action should expose JavaScript mode').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Switch the If condition to text mode', async () => {
    await clickFirstVisible(page, SEL.flowConditionTextModeButton, 'Condition text mode');
    await confirmAlertIfVisible(page);
    await expect(await visibleTinyMceBody(page), 'Condition text editor should become visible after clicking Aa mode').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Switch the If condition to JavaScript mode', async () => {
    await clickFirstVisible(page, SEL.flowConditionJavaScriptModeButton, 'Condition JavaScript mode');
    await confirmAlertIfVisible(page);
    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, 'Condition JavaScript editor should become visible after clicking JS mode').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Switch the If condition back to text mode', async () => {
    await clickFirstVisible(page, SEL.flowConditionTextModeButton, 'Condition text mode');
    await confirmAlertIfVisible(page);
    await expect(await visibleTinyMceBody(page), 'Condition text editor should become visible after clicking Aa mode').toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last(),
      'Condition JavaScript editor should be hidden after returning to Aa mode',
    ).toBeHidden({ timeout: 15_000 });
  });

  await test.step('Switch the If condition back to field/operator mode', async () => {
    await clickFirstVisible(page, SEL.flowConditionVisualModeButton, 'Condition field/operator mode');
    await confirmAlertIfVisible(page);
    await expect(page.locator(SEL.flowConditionBuilder).first(), 'Condition field/operator builder should be visible again').toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last(),
      'Condition JavaScript editor should be hidden after returning to field/operator mode',
    ).toBeHidden({ timeout: 15_000 });
  });
}

export async function expectConditionActionConfigurationTabsOnlyIf(page: Page): Promise<void> {
  await test.step('Check that the Condition action configuration only exposes the If tab', async () => {
    await expect(page.locator(SEL.flowConditionEditor).last(), 'Condition action should expose the If editor').toBeVisible({
      timeout: 15_000,
    });
    await expect
      .poll(
        async () =>
          page.locator(SEL.toastActionTabButton).evaluateAll((buttons) => {
            const visible = (el: Element) => {
              const box = (el as HTMLElement).getBoundingClientRect();
              const style = getComputedStyle(el);
              return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
            };
            return buttons.filter(visible).length;
          }),
        {
          message: 'Condition action configuration should not expose empty Then/Else tabs',
          timeout: 10_000,
        },
      )
      .toBe(1);

    const visibleTabClasses = await page.locator(SEL.toastActionTabButton).evaluateAll((buttons) => {
      const visible = (el: Element) => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };
      return buttons.filter(visible).map((button) => (button as HTMLElement).className);
    });
    expect(visibleTabClasses[0], 'the single Condition configuration tab should be selected').toContain('c8o-btn-active-style');
  });
}

export async function selectFlowConditionField(page: Page, fieldTechnicalId: string): Promise<void> {
  await test.step(`Select ${fieldTechnicalId} in the If condition`, async () => {
    await clickFirstVisible(page, SEL.flowConditionFieldBrowseButton, 'If condition field picker', 15_000, true);
    const popover = page.locator('ion-popover:visible').last();
    await expect(popover.locator('page-popoverinputs, ion-list').first(), 'If condition picker should be visible').toBeVisible({
      timeout: 10_000,
    });

    const item = popover
      .locator('ion-button')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(fieldTechnicalId)}\\s*$`) })
      .last();
    await expect(item, `If condition picker should list ${fieldTechnicalId}`).toBeVisible({ timeout: 10_000 });
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));

    await expect(page.locator(SEL.flowConditionFieldInput).last(), 'If condition field input should keep the selected field').toHaveValue(
      fieldTechnicalId,
      { timeout: 10_000 },
    );
  });
}

export async function flowConditionOperatorSelectStates(page: Page): Promise<FlowConditionOperatorSelectState[]> {
  const editor = page.locator(SEL.flowConditionEditor).last();
  await expect(editor, 'Condition action should expose the If editor').toBeVisible({ timeout: 15_000 });
  return editor.evaluate((root) => {
    const visible = (el: Element) => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    return [...root.querySelectorAll('ion-select')]
      .filter(visible)
      .map((select) => {
        const optionValues = [...select.querySelectorAll('ion-select-option')]
          .map((option) => {
            const raw = (option as HTMLElement & { value?: unknown }).value ?? option.getAttribute('value');
            return raw == null ? '' : String(raw);
          })
          .filter(Boolean);
        const value = (select as HTMLElement & { value?: unknown }).value;
        return {
          value: value == null ? null : String(value),
          optionValues,
          text: (select.textContent ?? '').replace(/\s+/g, ' ').trim(),
        };
      })
      .filter((select) => select.optionValues.includes('equals') && select.optionValues.includes('different'));
  });
}

export async function expectFlowConditionOperatorSelectForField(page: Page, fieldTechnicalId: string): Promise<void> {
  await test.step(`Check operator select for ${fieldTechnicalId}`, async () => {
    await expect
      .poll(
        async () => {
          const states = await flowConditionOperatorSelectStates(page);
          return states.some(
            (state) => state.optionValues.includes('equals') && state.optionValues.includes('different') && state.optionValues.includes('is_empty'),
          );
        },
        {
          message: `If condition should show a field operator select for ${fieldTechnicalId}`,
          timeout: 10_000,
        },
      )
      .toBe(true);
  });
}

export async function setTextDefaultValueJavascriptCode(page: Page, code: string): Promise<void> {
  await test.step('Write JavaScript default value code', async () => {
    await openDefaultValueJavascriptMode(page);
    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, 'default value JavaScript editor should be visible').toBeVisible({ timeout: 15_000 });
    await editor.click();
    await expect(editor, 'default value JavaScript editor should keep the generated async wrapper').toContainText("return '';", {
      timeout: 10_000,
    });
    await page.keyboard.press('Control+F');
    await page.keyboard.type("return '';");
    await page.keyboard.press('Escape');
    await page.keyboard.type(code);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1_000);
  });
}

export async function expectDefaultValueJavaScriptEditorKeeps(page: Page, expected: string): Promise<void> {
  await test.step('Assert JavaScript editor content', async () => {
    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, `JavaScript editor should keep ${expected}`).toContainText(expected, { timeout: 15_000 });
    await expect(editor, 'JavaScript editor should not rewrite the dynamic field lookup to null').not.toContainText(/\bnull\b/, {
      timeout: 5_000,
    });
  });
}

async function activateDataSourceMode(page: Page): Promise<void> {
  const sourceModeButtons = page.locator('button.class1775840591959:visible');
  if ((await sourceModeButtons.count()) > 1) {
    await sourceModeButtons.nth(1).click();
    return;
  }
  throw new Error('data source mode toggle is not available');
}

async function activateVisibilityConditionMode(page: Page): Promise<void> {
  const modeButtons = page.locator(`${SEL.visibilityModeButton}:visible`);
  if ((await modeButtons.count()) > 0) {
    await modeButtons.last().click();
    await expect(page.locator(SEL.visibilityAddConditionButton).first(), 'visibility condition add button should be visible').toBeVisible({
      timeout: 10_000,
    });
    return;
  }
  throw new Error('visibility condition mode toggle is not available');
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

// Click a breadcrumb entry (workspace/database/table) and re-click until the
// next level shows up. The Baserow picker fetches each level lazily, so a slow
// or dropped fetch (or a transient "Page loading in progress" overlay) can leave
// the next level missing; re-clicking the same entry re-triggers the fetch.
async function clickBaserowPickerEntryUntil(
  page: Page,
  picker: Locator,
  label: string,
  advanced: () => Promise<boolean>,
  timeout: number,
): Promise<void> {
  const deadline = Date.now() + timeout;
  let lastError: unknown;
  while (Date.now() < deadline) {
    if (await advanced().catch(() => false)) return;
    const entry = picker.getByText(label, { exact: true }).first();
    if (await entry.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await entry.click({ timeout: 5_000 }).catch(async (error) => {
        lastError = error;
        await entry.dispatchEvent('click').catch(() => undefined);
      });
      for (let i = 0; i < 8; i++) {
        if (await advanced().catch(() => false)) return;
        await page.waitForTimeout(1_000);
      }
    } else {
      await page.waitForTimeout(1_000);
    }
  }
  throw new Error(`Baserow picker did not advance after selecting "${label}"${lastError ? `: ${lastError}` : ''}`);
}

async function selectBaserowTableFromCurrentAction(
  page: Page,
  source: BaserowGridSourceOptions,
  timeout: number,
): Promise<void> {
  await acceptRgpdIfVisible(page);
  await clickFirstVisible(page, SELECT_SOURCE_TABLE_PICKER_BUTTON, 'Baserow action table picker button', timeout, true);
  const tablePicker = page.locator('ion-modal:visible').last();
  await expect(tablePicker, 'Baserow action table picker should be visible').toBeVisible({ timeout });

  const summary = tablePicker.locator('.class1776246576145');
  const tableSelected = async (): Promise<boolean> =>
    ((await summary.first().textContent({ timeout: 2_000 }).catch(() => '')) ?? '').includes(source.table);

  // Idempotent: on a reload-retry the action may already point at this table, so
  // the picker opens straight into its column view with no breadcrumb to walk.
  if (!(await tableSelected())) {
    const databaseVisible = async (): Promise<boolean> =>
      tablePicker.getByText(source.database, { exact: true }).first().isVisible().catch(() => false);
    const tableVisible = async (): Promise<boolean> =>
      tablePicker.getByText(source.table, { exact: true }).first().isVisible().catch(() => false);

    await clickBaserowPickerEntryUntil(page, tablePicker, source.workspace, databaseVisible, timeout);
    await clickBaserowPickerEntryUntil(page, tablePicker, source.database, tableVisible, timeout);
    await clickBaserowPickerEntryUntil(page, tablePicker, source.table, tableSelected, timeout);
  }

  await expect(summary).toContainText(source.table, { timeout });
  for (const column of source.expectedColumns ?? []) {
    await expect(tablePicker.locator('.class1776267952308'), `Baserow column ${column} should be selectable`).toContainText(
      column,
      { timeout },
    );
  }
  await acceptRgpdIfVisible(page);
  await tablePicker.locator('ion-button.class1776244653366').click();
  await expect(tablePicker).toBeHidden({ timeout });
  await page.waitForTimeout(1_500);
}

async function ensureBaserowActionVariableRow(page: Page, column: string): Promise<void> {
  if (await isBaserowActionColumnMapped(page, column)) {
    return;
  }

  const before = await page.locator(BASEROW_ACTION_VARIABLE_BUTTON).count();
  await clickFirstUncovered(
    page,
    page.locator(SEL.baserowActionAddVariableButton),
    `Baserow action add-variable button for ${column}`,
    30_000,
  );
  await expect
    .poll(() => page.locator(BASEROW_ACTION_VARIABLE_BUTTON).count(), {
      message: `Baserow action variable row for ${column} should be added`,
      timeout: 10_000,
    })
    .toBeGreaterThan(before);

  const columnInput = page.locator(BASEROW_ACTION_VARIABLE_INPUT).last();
  await expect(columnInput, `Baserow action column input for ${column} should be visible`).toBeVisible({ timeout: 10_000 });
  await columnInput.scrollIntoViewIfNeeded().catch(() => undefined);
  await columnInput.fill(column);
  await expect
    .poll(() => columnInput.inputValue().catch(() => ''), {
      message: `Baserow action column input should keep ${column}`,
      timeout: 5_000,
    })
    .toBe(column);
  await columnInput.press('Tab').catch(() => undefined);
  await expectBaserowActionColumnMapped(page, column);
}

async function mapBaserowActionVariable(
  page: Page,
  column: string,
  sourceSection: SourcePaletteSection,
  sourceLabel: string,
): Promise<void> {
  await selectBaserowActionVariable(page, column);
  await ensureBaserowActionSourcePaletteVisible(page, column);
  await dragSourcePaletteEntryToTinyMce(page, sourceSection, sourceLabel);
}

async function ensureBaserowActionSourcePaletteVisible(page: Page, column: string): Promise<void> {
  if (await visibleSourcePaletteRoot(page).isVisible({ timeout: 1_000 }).catch(() => false)) {
    return;
  }

  await clickFirstUncovered(
    page,
    page.locator(BASEROW_ACTION_SOURCE_PALETTE_BUTTON),
    `Baserow action source palette button for ${column}`,
    10_000,
  );
  await expect(visibleSourcePaletteRoot(page), `Source Palette should open for ${column}`).toBeVisible({
    timeout: 10_000,
  });
}

async function selectBaserowActionVariable(page: Page, column: string): Promise<void> {
  const button = baserowActionVariableButton(page, column);
  await expect(button, `Baserow action variable ${column} should exist`).toHaveCount(1, { timeout: 10_000 });
  if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
    await button.click({ timeout: 5_000 }).catch(async () => button.dispatchEvent('click'));
  } else {
    await button.dispatchEvent('click');
  }

  await expect
    .poll(() => page.locator(BASEROW_ACTION_VARIABLE_INPUT).last().inputValue().catch(() => ''), {
      message: `Baserow action variable ${column} should be selected`,
      timeout: 10_000,
    })
    .toBe(column);
}

async function isBaserowActionColumnMapped(page: Page, column: string): Promise<boolean> {
  if ((await baserowActionVariableButton(page, column).count().catch(() => 0)) > 0) {
    return true;
  }

  const inputs = page.locator(BASEROW_ACTION_VARIABLE_INPUT);
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    if ((await inputs.nth(i).inputValue().catch(() => '')) === column) {
      return true;
    }
  }
  return false;
}

async function expectBaserowActionColumnMapped(page: Page, column: string): Promise<void> {
  await expect
    .poll(() => isBaserowActionColumnMapped(page, column), {
      message: `Baserow action mapping for ${column} should exist`,
      timeout: 10_000,
    })
    .toBe(true);
}

function baserowActionVariableButton(page: Page, column: string): Locator {
  return page.locator(BASEROW_ACTION_VARIABLE_BUTTON).filter({ hasText: column }).first();
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
  await openConfigTabById(page, 'tab_selector_conf_source');
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

type PwaAccessMode = 'authenticated' | 'anonymous';

function pwaAccessButtonIndex(mode: PwaAccessMode): number {
  return mode === 'authenticated' ? 0 : 1;
}

function shortDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function visiblePwaAccessButtonClasses(modal: Locator): Promise<string[]> {
  return modal.locator(SEL.pwaAccessToggleButton).evaluateAll((buttons) =>
    buttons
      .filter((button) => {
        const element = button as HTMLElement;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((button) => (button as HTMLElement).className),
  );
}

async function waitForVisiblePwaAccessButtonClasses(modal: Locator, timeout = 5_000): Promise<string[]> {
  const deadline = Date.now() + timeout;
  let classes: string[] = [];
  do {
    classes = await visiblePwaAccessButtonClasses(modal).catch(() => []);
    if (classes.length >= 2) {
      return classes;
    }
    await shortDelay(250);
  } while (Date.now() < deadline);
  return classes;
}

async function clickVisiblePwaAccessButton(modal: Locator, mode: PwaAccessMode): Promise<boolean> {
  return modal.locator(SEL.pwaAccessToggleButton).evaluateAll((buttons, selectedIndex) => {
    const visibleButtons = buttons.filter((button) => {
      const element = button as HTMLElement;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    const button = visibleButtons[selectedIndex] as HTMLElement | undefined;
    if (!button) {
      return false;
    }
    button.click();
    return true;
  }, pwaAccessButtonIndex(mode));
}

export async function openPublishedPwaEditor(page: Page, title: string): Promise<void> {
  await test.step(`open published PWA editor for ${title}`, async () => {
    await returnToSelectorFromEditor(page);
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
  });
}

export async function publishCurrentFormWithPwa(page: Page, mode: PwaAccessMode): Promise<void> {
  await test.step(`publish current form as ${mode} PWA`, async () => {
    await expect(page.locator(SEL.publishButton).first(), 'the editor publish button should be visible').toBeVisible({
      timeout: 30_000,
    });
    await page.locator(SEL.publishButton).first().click();
    const modal = page.locator(SEL.pwaEditModal).last();
    await expect(modal, 'publishing should open the PWA editor modal').toBeVisible({ timeout: 60_000 });
    await ensurePwaIconConfiguredThroughUi(page, modal);
    await ensurePwaTextInputsFilled(modal);
    await setPwaAccessModeAndSave(page, mode);
  });
}

async function ensurePwaIconConfiguredThroughUi(page: Page, modal: Locator): Promise<void> {
  await test.step('configure the PWA icon with a color through the UI', async () => {
    const wallpaperModal = page.locator(SEL.wallpaperModal).last();
    const iconArea = modal.locator(SEL.pwaIconEditor).first();
    await acceptRgpdIfVisible(page);
    await expect(iconArea, 'the PWA icon editor should be visible').toBeVisible({ timeout: 30_000 });
    await iconArea.click({ force: true }).catch(() => undefined);

    if (!(await wallpaperModal.isVisible({ timeout: 3_000 }).catch(() => false))) {
      await modal
        .locator(SEL.pwaIconEditButton)
        .first()
        .click({ force: true, timeout: 2_000 })
        .catch(() => undefined);
    }

    await expect(wallpaperModal, 'the thumbnail/color picker modal should open').toBeVisible({ timeout: 30_000 });
    const colorSegment = wallpaperModal.locator(SEL.wallpaperColorSegmentButton).first();
    if (await colorSegment.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await colorSegment.click().catch(() => undefined);
    }
    await wallpaperModal.locator(SEL.wallpaperSaveButton).first().click();
    await expect(wallpaperModal).toBeHidden({ timeout: 30_000 });
    await expect(modal, 'the PWA editor modal should still be visible after icon selection').toBeVisible({
      timeout: 30_000,
    });
  });
}

async function ensurePwaTextInputsFilled(modal: Locator): Promise<void> {
  for (const selector of [SEL.pwaNameInput, SEL.pwaShortNameInput]) {
    const input = modal.locator(selector).first();
    if (!(await input.isVisible({ timeout: 2_000 }).catch(() => false))) {
      continue;
    }
    const value = await input.inputValue().catch(() => '');
    if (!value.trim()) {
      await input.fill(`PWA ${Date.now()}`);
      await input.dispatchEvent('input');
      await input.dispatchEvent('change');
    }
  }
}

export async function expectPwaAccessModeSelected(page: Page, mode: PwaAccessMode): Promise<void> {
  await test.step(`assert PWA access mode is ${mode}`, async () => {
    const modal = page.locator(SEL.pwaEditModal).last();
    await expect(modal, 'the PWA editor modal should be open').toBeVisible({ timeout: 30_000 });
    const selectedIndex = pwaAccessButtonIndex(mode);
    const buttonClasses = await waitForVisiblePwaAccessButtonClasses(modal);
    if (buttonClasses.length >= 2) {
      await expect
        .poll(async () => (await visiblePwaAccessButtonClasses(modal))[selectedIndex] ?? '', {
          message: `PWA ${mode} toggle button should be selected`,
          timeout: 30_000,
        })
        .toContain('c8o-btn-selected');
      return;
    }

    const legacyCheckbox = modal.locator(SEL.pwaLegacyAccessCheckbox).first();
    await expect(legacyCheckbox, 'the legacy PWA access checkbox should be visible').toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => isIonCheckboxChecked(legacyCheckbox), {
        message: `legacy PWA access checkbox should reflect ${mode}`,
        timeout: 10_000,
      })
      .toBe(mode === 'authenticated');
  });
}

async function selectPwaAccessMode(modal: Locator, mode: PwaAccessMode): Promise<void> {
  const selectedIndex = pwaAccessButtonIndex(mode);
  if ((await waitForVisiblePwaAccessButtonClasses(modal)).length >= 2) {
    expect(await clickVisiblePwaAccessButton(modal, mode), `PWA ${mode} toggle button should be clickable`).toBe(true);
    await expect
      .poll(async () => (await visiblePwaAccessButtonClasses(modal))[selectedIndex] ?? '', {
        message: `PWA ${mode} toggle button should be selected after clicking it`,
        timeout: 10_000,
      })
      .toContain('c8o-btn-selected');
    return;
  }

  const legacyCheckbox = modal.locator(SEL.pwaLegacyAccessCheckbox).first();
  await expect(legacyCheckbox, 'the legacy PWA access checkbox should be visible').toBeVisible({ timeout: 30_000 });
  const checked = await isIonCheckboxChecked(legacyCheckbox);
  const shouldBeChecked = mode === 'authenticated';
  if (checked !== shouldBeChecked) {
    await legacyCheckbox.click();
  }
}

async function isIonCheckboxChecked(checkbox: Locator): Promise<boolean> {
  const ariaChecked = await checkbox.getAttribute('aria-checked').catch(() => null);
  if (ariaChecked != null) {
    return ariaChecked === 'true';
  }
  return checkbox.evaluate((el) => {
    const input = el as HTMLInputElement;
    return input.checked === true || el.classList.contains('checkbox-checked') || el.getAttribute('ng-reflect-checked') === 'true';
  });
}

async function confirmPwaAnonymousWarningIfVisible(page: Page): Promise<void> {
  const confirmButton = page.locator('ion-alert button.alert-button-role-confirm').last();
  if (await confirmButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const alert = page.locator('ion-alert').last();
    await confirmButton.click();
    await expect(alert).toBeHidden({ timeout: 15_000 });
  }
}

export async function setPwaAccessModeAndSave(page: Page, mode: PwaAccessMode): Promise<void> {
  await test.step(`save PWA access as ${mode}`, async () => {
    const modal = page.locator(SEL.pwaEditModal).last();
    await expect(modal, 'the PWA editor modal should be open').toBeVisible({ timeout: 30_000 });
    await selectPwaAccessMode(modal, mode);
    await acceptRgpdIfVisible(page);
    await modal.locator(SEL.pwaSaveButton).first().click();
    await confirmPwaAnonymousWarningIfVisible(page);
    await expect(modal).toBeHidden({ timeout: 60_000 });
  });
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
    const genericClose = page.locator('.c8o-btn-close:visible, button.c8o-btn-close:visible').last();
    if (await genericClose.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await genericClose.click({ timeout: 5_000 }).catch(async () => genericClose.dispatchEvent('click'));
    } else if (await page.locator(`${SEL.technicalIdInput}:visible`).first().isVisible({ timeout: 500 }).catch(() => false)) {
      throw new Error('business logic config close button is not visible');
    }
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

  await openConfigTabById(page, 'tab_selector_conf_source');
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

async function openDefaultValueTextMode(page: Page): Promise<void> {
  await openConfigTabById(page, 'defaultvalue');
  await clickFirstVisible(page, SEL.defaultValueTextButton, 'default value text mode');
  await confirmAlertIfVisible(page);
}

async function openDefaultValueJavascriptMode(page: Page): Promise<void> {
  await openConfigTabById(page, 'defaultvalue');
  await clickFirstVisible(page, SEL.defaultValueJavaScriptButton, 'default value JavaScript mode');
  await confirmAlertIfVisible(page);
}

async function openDefaultValueVisualMode(page: Page): Promise<void> {
  await openConfigTabById(page, 'defaultvalue');
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

export async function setTextDefaultValueText(page: Page, value: string): Promise<void> {
  await setChoiceDefaultValueText(page, value);
}

export async function expectViewerTextInputValue(page: Page, index: number, expected: string): Promise<void> {
  await test.step(`Assert Text input ${index + 1} displays ${expected}`, async () => {
    const input = page.locator(`${SEL.textComponent} ion-input input, ${SEL.textComponent} input`).nth(index);
    await expect(input, `viewer Text input ${index + 1} should be visible`).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => input.inputValue(), {
        message: `viewer Text input ${index + 1} should contain ${expected}`,
        timeout: 15_000,
      })
      .toBe(expected);
  });
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

export async function fillToastMessageText(page: Page, value: string): Promise<void> {
  await openToastActionMessageEditor(page);
  await fillVisibleTinyMceText(page, value, 'Toast message text editor');
}

export async function tinyMceEditorContent(page: Page): Promise<{ html: string; text: string; chipCount: number }> {
  const editorBody = await visibleTinyMceBody(page);
  return {
    html: await editorBody.innerHTML(),
    text: await editorBody.innerText(),
    chipCount: await editorBody.locator('svg[id^="clickable-"], span[c8otype="path"], span.styleBadge').count(),
  };
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
  await openConfigTabById(page, 'visibility_tab_selector');
}

export async function openComponentVisibilityConfigBySelector(page: Page, componentTag: string): Promise<void> {
  await openComponentConfig(page, componentTag);
  await openConfigTabById(page, 'visibility_tab_selector');
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
  await activateVisibilityConditionMode(page);
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
  await activateVisibilityConditionMode(page);
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

async function clickFirstUncovered(page: Page, locator: Locator, description: string, timeout = 15_000): Promise<void> {
  const deadline = Date.now() + timeout;
  let lastError: unknown;

  while (Date.now() < deadline) {
    await waitForIonicLoading(page, 1_000);
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const candidate = locator.nth(i);
      if (!(await candidate.isVisible({ timeout: 500 }).catch(() => false))) {
        continue;
      }
      await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
      if (!(await receivesPointerEvents(candidate).catch(() => false))) {
        continue;
      }
      try {
        await candidate.click({ timeout: 2_000 });
        return;
      } catch (error) {
        lastError = error;
      }
    }
    await page.waitForTimeout(250);
  }

  throw new Error(`${description} was not clickable without being intercepted${lastError ? `: ${lastError}` : ''}`);
}

async function receivesPointerEvents(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const rect = (element as HTMLElement).getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
    const topElement = document.elementFromPoint(x, y);
    const root = topElement?.getRootNode();
    const host = root instanceof ShadowRoot ? root.host : null;
    return !!topElement && (topElement === element || element.contains(topElement) || host === element);
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

export async function sourcePaletteEntryDragPayload(
  page: Page,
  section: SourcePaletteSection,
  label: string,
): Promise<SourcePaletteDragPayload> {
  await ensureSourcePaletteSectionExpanded(page, section, label);
  const tile = sourcePaletteEntryLocator(page, label);
  await expect(tile, `source palette entry ${label} should be visible`).toBeVisible({ timeout: 15_000 });
  return tile.evaluate((el) => {
    const dataTransfer = new DataTransfer();
    el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
    return {
      types: [...dataTransfer.types],
      textData: dataTransfer.getData('text'),
      plainData: dataTransfer.getData('text/plain'),
      htmlData: dataTransfer.getData('text/html'),
      typeData: dataTransfer.getData('type'),
    };
  });
}

export async function dragSourcePaletteEntryToTinyMceStrict(
  page: Page,
  section: SourcePaletteSection,
  label: string,
): Promise<void> {
  await ensureSourcePaletteSectionExpanded(page, section, label);
  const editorBody = await visibleTinyMceBody(page);
  await editorBody.click();
  const tile = sourcePaletteEntryLocator(page, label);
  await expect(tile, `source palette entry ${label} should be visible`).toBeVisible({ timeout: 15_000 });
  const before = await editorBody.locator('svg[id^="clickable-"], span[c8otype="path"], span.styleBadge').count();
  await tile.dragTo(editorBody);
  await page.waitForTimeout(1_000);
  await fireActiveTinyMceChange(page);
  await expect
    .poll(
      async () => {
        const state = await tinyMceEditorContent(page);
        return state.chipCount > before || normalizeVisibleText(state.text).toLowerCase().includes(label.toLowerCase());
      },
      {
        message: `real Source Palette drag should insert the ${label} token into TinyMCE`,
        timeout: 10_000,
      },
    )
    .toBe(true);
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
  const confirmButton = alert
    .locator('button.btn--primary, button.alert-button-role-confirm, button.alert-button')
    .last();
  await expect(confirmButton, 'confirmation alert should expose a confirm button').toBeVisible({ timeout: 5_000 });
  await confirmButton.click();
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
    if (await nameInput.isVisible().catch(() => false)) return true;
    const pageSettingsCard = page.locator(SEL.pageSettingsCard).first();
    if (await pageSettingsCard.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await pageSettingsCard.click().catch(() => {});
    }
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

export async function openPagesPanel(page: Page): Promise<void> {
  await test.step('Open the Pages panel', async () => {
    const visibleClose = await firstVisibleLocatorOrNull(page, SEL.pageSettingsCloseButton, 1_000);
    if (visibleClose) {
      await visibleClose.click();
      await page.waitForTimeout(500);
    }
    if (await page.locator(SEL.pageRow).first().isVisible({ timeout: 1_000 }).catch(() => false)) {
      return;
    }
    if (await page.locator(SEL.pageAddButton).first().isVisible({ timeout: 1_000 }).catch(() => false)) {
      await expect(page.locator(SEL.pageRow).first(), 'Pages panel is open but no page row is visible').toBeVisible({
        timeout: 5_000,
      });
      return;
    }
    const button = page.locator(SEL.pagesPanelButton).first();
    await expect(button, 'Pages panel button should be visible').toBeVisible({ timeout: 15_000 });
    for (let attempt = 0; attempt < 3; attempt++) {
      await button.click({ timeout: 5_000 }).catch(async () => {
        await button.click({ force: true, timeout: 5_000 });
      });
      if (await page.locator(SEL.pageRow).first().isVisible({ timeout: 3_000 }).catch(() => false)) {
        return;
      }
    }
    throw new Error('Pages panel did not open after clicking the Pages menu.');
  });
}

export async function renameCurrentPageFromPagesPanel(page: Page, name: string): Promise<void> {
  await test.step('Rename the current page from the Pages panel', async () => {
    await openPagesPanel(page);
    const row = page.locator(SEL.pageRow).first();
    await expect(row, 'the default page row should be visible').toBeVisible({ timeout: 15_000 });
    await row.hover();
    const editAction = await firstVisibleLocatorOrNull(page, SEL.pageEditButton, 5_000);
    if (editAction) {
      await editAction.click();
    } else {
      const rowBox = await row.boundingBox();
      const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
      expect(rowBox, 'the default page row should have a bounding box').not.toBeNull();
      expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
      if (!rowBox || !panelBox) return;
      await page.mouse.click(panelBox.x + panelBox.width - 86, rowBox.y + rowBox.height / 2);
    }

    const input = page.locator(SEL.pageNameInput).first();
    await expect(input, 'page name input should be visible after clicking the page edit action').toBeVisible({
      timeout: 15_000,
    });
    await input.fill(name);
    await input.blur();
    await expect(input, 'page name input should keep the new name').toHaveValue(name, { timeout: 10_000 });
    await page.waitForTimeout(1_000);
    const closeButton = await firstVisibleLocatorOrNull(page, SEL.pageSettingsCloseButton, 3_000);
    if (closeButton) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  });
}

export async function expectPageDeleteActionVisibleForPage(page: Page, pageName: string): Promise<void> {
  await test.step('Assert the page delete action is visible', async () => {
    await openPagesPanel(page);
    const row = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
    await expect(row, `page row ${pageName} should be visible`).toBeVisible({ timeout: 15_000 });
    await row.hover();

    const deleteAction = await firstVisibleLocator(page, SEL.pageDeleteAction, `delete action for page ${pageName}`, 5_000);
    await expect(deleteAction, `delete action for page ${pageName} should be visible on hover`).toBeVisible({
      timeout: 5_000,
    });

    const boxes = await Promise.all([row.boundingBox(), deleteAction.boundingBox(), page.locator(SEL.pageSearchbar).first().boundingBox()]);
    const [rowBox, actionBox, searchBox] = boxes;
    expect(rowBox, `page row ${pageName} should have a bounding box`).not.toBeNull();
    expect(actionBox, `delete action for page ${pageName} should have a bounding box`).not.toBeNull();
    expect(searchBox, 'Pages panel should have a bounding box').not.toBeNull();
    if (!rowBox || !actionBox || !searchBox) return;

    expect(actionBox.width, 'delete action should have a visible width').toBeGreaterThan(0);
    expect(actionBox.height, 'delete action should have a visible height').toBeGreaterThan(0);
    expect(actionBox.x + actionBox.width, 'delete action should remain inside the Pages panel on the right').toBeLessThanOrEqual(
      searchBox.x + searchBox.width + 1,
    );
  });
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
