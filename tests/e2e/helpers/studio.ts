import { Locator, Page, expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Selectors are Convertigo priority CSS classes (classNNNN): the priority is
 * the stable bean id from the project YAML, so it survives rebuilds and
 * label/i18n changes. To resolve one, grep the priority in _c8oProject/.
 */
export const SEL = {
  // loginPage.yaml
  loginReveal: '.class1757337975297, .class1770718494991', // SubmitButton1, plus legacy beta107 login button
  loginPageRoot: 'page-loginpage',
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
  styleSectionLabel: '.span-style',
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
  // viewerPage.yaml — rendered viewer and default submit button
  viewerPage: 'page-viewerpage',
  viewerSubmitButton: [
    'page-viewerpage ion-button.class1543865084771',
    'page-viewerpage ion-tab-button.class1664274551545',
    'page-viewerpage ion-tab-button:has(ion-icon[name="send-outline"])',
    'page-viewerpage ion-footer [role="tab"]',
  ].join(', '),
  // responseCompleted.yaml — post-submit transition page
  publishedToolbar: 'page-viewerpage c8oforms-toolbarcomponentui div.toolbar, c8oforms-toolbarcomponentui div.toolbar',
  publishedToolbarMenuButton:
    'page-viewerpage c8oforms-toolbarcomponentui div.left-section ion-button.class1757346419324, c8oforms-toolbarcomponentui div.left-section ion-button.class1757346419324, c8oforms-toolbarcomponentui div.left-section ion-button:has(ion-icon[src$="menu.svg"])',
  publishedToolbarReloadButton:
    'page-viewerpage c8oforms-toolbarcomponentui div.right-section ion-button.class1777889913268, c8oforms-toolbarcomponentui div.right-section ion-button.class1777889913268, c8oforms-toolbarcomponentui div.right-section ion-button:has(ion-icon[src$="refresh-ccw.svg"])',
  responseCompletedPage: 'page-responsecompleted',
  responseCompletedLogo: 'page-responsecompleted img.class1684922008750',
  // editor canvas wrapper of a map component
  mapComponent: 'c8oforms-itemmapviewer',
  textComponent: 'c8oforms-itemtextviewer',
  checkboxComponent: 'c8oforms-itemcheckboxviewer',
  checkboxGroupComponent: 'c8oforms-itemcheckboxgroupviewer',
  descriptionComponent: 'c8oforms-itemdescriptionviewer',
  buttonComponent: 'c8oforms-itembuttonviewer',
  buttonLabelInput: 'c8oforms-textinputsetting.class1776707403149 input, .class1776707403149 input',
  buttonDisplayModeSwitch: '.class1782410200003',
  buttonAdvancedTextEditor:
    ':is(c8oforms-datasourceeditor.class1782410100001, c8oforms-datasourceeditor:has(.tox-tinymce))',
  buttonIconNameInput: '.class1776709887054 input',
  buttonIconClearButton: 'ion-icon.class1780311333214, .class1780311333214',
  buttonRenderedIcon: 'c8oforms-itembuttonviewer ion-button ion-icon',
  selectComponent: 'c8oforms-itemselectviewver',
  radioComponent: 'c8oforms-itemradioviewver',
  radioGroupComponent: 'c8oforms-itemradiogroupviewver',
  sliderComponent: 'c8oforms-itemsliderviewver',
  sliderMinValueInput: 'c8oforms-textinputsetting.class1776351300004 input, .class1776351300004 input',
  sliderMaxValueInput: 'c8oforms-textinputsetting.class1776351300013 input, .class1776351300013 input',
  sliderMinLabelInput: 'c8oforms-textinputsetting.class1776351300031 input, .class1776351300031 input',
  sliderMaxLabelInput: 'c8oforms-textinputsetting.class1776351300040 input, .class1776351300040 input',
  sliderStepInput: 'c8oforms-textinputsetting.class1776351300022 input, .class1776351300022 input',
  businessLogicComponent: 'c8oforms-itemactionbusinesslogicviewer',
  gridComponent: 'c8oforms-itemgridviewer',
  gridFooterSetting: '.class1782121400000',
  gridPaginationSetting: '.class1782121400010',
  gridRowsPerPageSetting: '.class1782121400030',
  chartComponent: 'c8oforms-itemchartviewer',
  fileComponent: 'c8oforms-itemfileviewver',
  chartHeightModeToggle: '.class1780577000001',
  chartPersonalizedHeightInput: '.class1776605300014 input',
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
  selectorPageRoot: 'page-selectorpage',
  blankFormCard: '.class1645547241644',
  createFolderButton: 'ion-button.class1761574287753, ion-button.class1645547180559',
  createFolderAlert: 'ion-alert.alert-custom-createfolder:not(.overlay-hidden)',
  createFolderTitleInput: 'input.alert-input',
  createFolderSaveButton: 'button.custom-btn-validation-createfolder',
  createFolderCancelButton: 'button.custom-btn-dismiss-createfolder',
  // ion-alert prompt shown by createNewForm (stable CSS classes set in the action code)
  createFormTitleInput: 'input.alert-input',
  createFormSaveButton: 'button.btn--createapp-save',
  createFormCancelButton: 'button.btn--createapp-cancel',
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
  appSettingsPanelButton: 'ion-button.class1774952185775, ion-button.class1780909504441',
  appSettingsCategories: '.app-settings-categories',
  componentPanelButton: 'ion-button.class1773237045434, ion-button.class1780909504474',
  componentPaletteSearch: 'ion-searchbar.class1775889901001',
  pagesPanelButton: 'ion-button.class1773237523408, ion-button.class1780909504522',
  workflowsPanelButton: 'ion-button.class1773250515928, ion-button.class1780909504555',
  workflowsSearchbar: 'ion-searchbar.class1774523913949',
  workflowEntry: '#bloc-palette [draggable="true"]',
  buttonWorkflowEntry: '#bloc-palette [draggable="true"]:not(#unique_formulas):not(#unique_submit)',
  submitFlowButton: '#unique_submit',
  pageRow: '.class1775140559440, .class1749805611480, .class1650357059456, .class1650357059543',
  pageEditButton:
    '[title^="Modifier la page"], [aria-label^="Modifier la page"], [title^="Edit page"], [aria-label^="Edit page"], .class1775140098599, .class1774949227812, .class1650357059474, .class1775140098605, .class1774948900804',
  pageDeleteAction:
    '.class1775140098632, .class1774949276438, [data-id="delete-action-pages"], ion-icon[src$="trash-2.svg"], img[src$="trash-2.svg"]',
  pageAddButton: '.class1750084426535, ion-button.class1780583331059, ion-button.class1773251124192',
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
  mapSourceModeRow: 'ion-row.class1777130000001',
  publishButton: 'ion-button.class1773332457603, .class1650456634147 ion-button',
  publishedApplicationsTab: 'ion-button.class1761754757348',
  publishedQrButton: 'page-selectorpage ion-button.class1761581105514',
  selectorSearchToggleButton: 'ion-item.form-item ion-button.btn',
  selectorSearchByNameInput: 'page-selectorpage input',
  selectorFilterInlineToggleButton: 'ion-button.class1772117859505',
  selectorFilterPopoverButton: 'ion-button.class1750686602638',
  selectorFiltersPopover: 'ion-popover:not(.overlay-hidden)',
  selectorMyApplicationsButton: 'ion-button.class1761746283533',
  selectorMyApplicationsCheckbox: 'ion-checkbox.class1750693244025',
  selectorHideFoldersButton: 'ion-button.class1761751296593',
  selectorHideFoldersCheckbox: 'ion-checkbox.class1750693290583',
  selectorApplyFiltersButton: 'ion-button.class1750693491899',
  selectorCardTitle: '.class1603968061706',
  selectorListTitle: '.class1780484375240',
  cardMenuButton: 'ion-button.class1606574763560',
  selectorCollaboratorsMenuItem:
    'ion-item.class1594313281739, ion-item:has(ion-icon.class1603730321735)',
  editorMoreActionsButton: '#more-actions-menu-editor, ion-button.class1757346419354',
  editorMoreActionsPopover: 'ion-popover:not(.overlay-hidden):visible',
  editorMoreActionsCollaboratorsMenuItem:
    'ion-item.class1773329574106, ion-item:has(ion-icon[src*="user-plus.svg"]), ion-item:has(img[src*="user-plus.svg"]), ion-item',
  editorToolbarCollaboratorsButton:
    'page-editorpage .class1650456634183 ion-button, page-editorpage ion-button:has(ion-icon[src*="user-plus.svg"])',
  collaboratorsModal: 'ion-modal.show-modal page-manageaccessrights',
  collaboratorSearchInput: 'c8oforms-ngxtaginputcustomc8oforms ng-select input[role="combobox"], tag-input input',
  collaboratorAutocompleteOption: 'ng-dropdown-panel .ng-option, tag-input-dropdown .ng2-menu-item, ng2-dropdown-menu .ng2-menu-item',
  collaboratorsSaveButton:
    'ion-footer ion-button.class1779974149500, ion-footer ion-button.class1779974149590, ion-footer ion-button.class1591882841533',
  collaboratorsCsvInput: 'input#manageAccessCsvCollabInput[type="file"][accept*=".csv"]',
  collaboratorsCsvButton: 'div:has(> input#manageAccessCsvCollabInput[type="file"]) > ion-button',
  publishedShareMenuItem:
    'ion-popover ion-item.class1578663445209, ion-popover ion-item:has(ion-icon.class1603730319967), ion-popover ion-item:has(ion-icon[src*="share.svg"])',
  publishedPwaMenuItem: 'ion-popover ion-item.class1603801509434',
  shareAnonymousToggleSwitch: 'c8oforms-toggleswitch.class1779971800000, .class1779971800000',
  shareAnonymousLegacyToggle: 'ion-toggle.class1706176223747, ion-toggle.class1762164887460',
  shareQrLabel:
    'ion-text.class1762364265345, ion-text.class1762365028957, .class1762364265345, .class1762365028957',
  shareNotificationToggle: 'c8oforms-toggleswitch.class1762249213239, .class1762249213239',
  shareNotificationToggleButton: 'button.class1775840591959, button.c8o-btn',
  shareSubjectInput:
    'c8oforms-textinputsetting.class1779965325160 input, .class1779965325160 input, ion-input.class1762190514117 input, .class1762190514117 input',
  shareBodyEditorFrame: 'iframe.tox-edit-area__iframe, iframe[title="Rich Text Area"]',
  pwaEditModal: 'ion-modal.modal-pwa-edition.show-modal, ion-modal.modalCSV.show-modal',
  pwaAccessToggle: '.class1779878486939:visible',
  pwaAccessToggleButton: 'button.class1775840591959',
  pwaLegacyAccessCheckbox: 'ion-checkbox.class1646907933319',
  pwaIconEditor: '.icon-picker, .class1779811544755, .class1603800885985',
  pwaIconEditButton: 'ion-button.class1649864949366, ion-button.buttonEditIcon',
  pwaNameInput: 'ion-input.class1603802354868 input',
  pwaShortNameInput: 'ion-input.class1603803008204 input, ion-input.class1762428297567 input',
  pwaSaveButton:
    'ion-button.class1762425668421, ion-button.class1649838959998, ion-button:has-text("Save"), ion-button:has-text("Enregistrer"), ion-button:has-text("Sauvegarder"), ion-button:has-text("Publier"), ion-button:has-text("Publish")',
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
  flowConditionVisualModeButton: '.flow-condition-editor ion-button.class1743536234020, .flow-condition-editor ion-button.class1777544520315',
  flowConditionBuilder:
    '.flow-condition-editor c8oforms-visibleifgroupeditor, .flow-condition-editor c8oforms-conditionvisibleif, .flow-condition-editor c8oforms-filterbr, .flow-condition-editor ion-select',
  flowConditionTextExpressionEditor: '.flow-condition-editor .condition-help, .flow-condition-editor ion-searchbar',
  flowConditionFieldBrowseButton:
    '.flow-condition-editor ion-button.class1595231678502, .flow-condition-editor ion-item.form-item--small ion-button.initial.btn, .flow-condition-editor ion-item:has(input[disabled]) ion-button:has(ion-icon[name="ellipsis-horizontal-outline"]), .flow-condition-editor button',
  flowConditionFieldInput:
    '.flow-condition-editor ion-input.class1758189195706, .flow-condition-editor ion-input[title], .flow-condition-editor input[disabled]',
  flowConditionTextModeButton:
    '.flow-condition-editor ion-button.class1678818942504, .flow-condition-editor ion-button.class1777544520720, .flow-condition-editor ion-button:has(ion-icon[name="text-outline"])',
  flowConditionJavaScriptModeButton:
    '.flow-condition-editor ion-button.class1678818942537, .flow-condition-editor ion-button.class1777544520765, .flow-condition-editor ion-button:has(ion-icon[name="logo-javascript"])',
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
  | 'button_state_tab_selector'
  | 'navigation_tab_selector'
  | 'defaultvalue'
  | 'data_interactions';

type ChartHeightMode = 'auto' | 'personalized';
type GridPaginationMode = 'all_rows' | 'paginated';
export type StudioLanguage = 'en' | 'fr' | 'es' | 'it';
export type VisibilityMode = 'always' | 'never' | 'auth_required' | 'no_auth_required' | 'condition';
export type ButtonStateMode = 'always_enabled' | 'enabled_when_condition' | 'disabled_when_condition';

export interface PublishedToolbarButtonThemeState {
  color: string;
  iconColor: string;
  cssColor: string;
  background: string;
  hoverBackground: string;
  boxShadow: string;
  visibility: string;
  nativeBackgroundColor: string;
  nativeColor: string;
  className: string;
}

export interface PublishedToolbarThemeState {
  toolbarColor: string;
  toolbarBackgroundColor: string;
  toolbarVisibility: string;
  menu: PublishedToolbarButtonThemeState;
  reload: PublishedToolbarButtonThemeState;
}

export async function setStudioLanguageBeforeLoad(page: Page, lang: StudioLanguage): Promise<void> {
  await page.addInitScript((value) => {
    window.localStorage.setItem('lang', value);
  }, lang);
}

export async function reloadStudioWithLanguage(page: Page, lang: StudioLanguage): Promise<void> {
  await test.step(`Reload Studio with ${lang} language`, async () => {
    await page.evaluate((value) => {
      window.localStorage.setItem('lang', value);
    }, lang);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expectRoute(page, ROUTE.selector, 30_000);
    await expect(page.locator(SEL.blankFormCard), 'selector page should be ready after language reload').toBeVisible({
      timeout: 30_000,
    });
  });
}

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
  selector: /(?:\/selector(?:\/|$)|\/selectorPage(?:\/|$))/,
  editor: /(?:\/editor\/|\/editorPage(?:\/|$))/,
  viewer: /(?:\/viewer\/|\/viewerPage(?:\/|$))/,
  settings: /\/settings(?:\/|$)/,
} as const;

const SELECTOR_EMPTY_FORM_LIST_RE =
  /(?:No applications found|Aucune application trouvée|No se encontraron aplicaciones|Nessuna applicazione trovata)/i;
const SELECTOR_RESULT_COUNT_RE = /(\d+)\s*(?:result\(s\)|résultat\(s\)|resultado\(s\)|risultato \(i\))/i;

const SELECTOR_AUTH_GUARD_SETTLE_MS = 5_000;

async function expectRoute(page: Page, route: RegExp, timeout = 30_000): Promise<void> {
  await expect(page).toHaveURL(route, { timeout });
}

/**
 * Palette components share the same priority class. Prefer the icon SVG
 * filename, and fall back to the palette's stable object type when deployed
 * assets rewrite the rendered image src.
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
  mailAction: 'forms_notify_response_simple_by_mail_simple.svg',
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

const PALETTE_SEARCH_TERM_BY_ICON: Record<string, string> = {
  ...PALETTE_TYPE_BY_ICON,
  [PALETTE_ICON.businessLogic]: 'business_logic',
  [PALETTE_ICON.toastAction]: 'toast',
  [PALETTE_ICON.forLoop]: 'for_loop',
  [PALETTE_ICON.conditionAction]: 'if_else',
  [PALETTE_ICON.submitAction]: 'submit',
  [PALETTE_ICON.mailAction]: 'mail',
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

export interface AlertValidationButtonState {
  disabled: boolean;
  ariaDisabled: string | null;
  hasDisabledClass: boolean;
  pointerEvents: string;
  opacity: number;
  cursor: string;
  filter: string;
}

export interface AddComponentOptions {
  allowEditorApiFallback?: boolean;
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
    if (await selectorIsReadyAfterAuthGuard(page, attempt === 0 ? 8_000 : 1_000)) {
      return;
    }
    const attemptSucceeded = await loginOnce(page, user, password).catch(() => false);
    if (attemptSucceeded || (await selectorIsReady(page, 15_000))) {
      return;
    }
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => undefined);
  }
  await expect
    .poll(() => selectorIsReady(page, 1_000), {
      message: 'selector page should be ready after login',
      timeout: 30_000,
    })
    .toBe(true);
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
  if (await loginPageIsVisible(page, 500)) {
    return false;
  }
  return selectorCandidateIsReady(page, timeout);
}

async function selectorIsReadyAfterAuthGuard(page: Page, timeout: number): Promise<boolean> {
  const startedAt = Date.now();
  let readySince: number | null = null;
  do {
    if (await loginPageIsVisible(page, 250)) {
      return false;
    }

    if (await selectorCandidateIsReady(page, 250)) {
      readySince ??= Date.now();
      if (Date.now() - readySince >= SELECTOR_AUTH_GUARD_SETTLE_MS) {
        return true;
      }
    } else {
      readySince = null;
    }
    await page.waitForTimeout(250);
  } while (Date.now() - startedAt < timeout);

  return false;
}

async function loginPageIsVisible(page: Page, timeout: number): Promise<boolean> {
  if (await firstVisibleLocatorOrNull(page, SEL.loginReveal, timeout)) {
    return true;
  }
  return page.locator(`${SEL.loginPageRoot}:visible`).first().isVisible({ timeout: 500 }).catch(() => false);
}

async function selectorCandidateIsReady(page: Page, timeout: number): Promise<boolean> {
  if (
    (await expectRoute(page, ROUTE.selector, timeout).then(() => true).catch(() => false)) &&
    (await page.locator(SEL.selectorPageRoot).first().isVisible({ timeout: 1_000 }).catch(() => false))
  ) {
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

export async function openPublishedViewer(page: Page, formId: string, waitForSelector = SEL.viewerPage): Promise<void> {
  const publishedId = formId.startsWith('published_') ? formId : `published_${formId}`;
  await test.step(`Open published viewer ${publishedId}`, async () => {
    let targetId = '';
    await expect
      .poll(
        async () => {
          const pwa = await getPwaDocument(page, publishedId);
          targetId = publishedViewerTargetId(pwa, publishedId);
          return targetId;
        },
        {
          message: `published PWA document ${publishedId}_pwa_document should be ready`,
          timeout: 60_000,
        },
      )
      .not.toBe('');

    const pwaPath = `../pwas/${targetId}/index.html`;
    await waitForPublishedPwaRoute(page, pwaPath);
    await page.goto(pwaPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator(SEL.viewerPage).waitFor({ state: 'attached', timeout: 60_000 });
    await page.locator(waitForSelector).first().waitFor({ state: 'visible', timeout: 60_000 });
    await page.waitForTimeout(2_000);
  });
}

function publishedViewerTargetId(pwa: JsonRecord | null, fallbackPublishedId: string): string {
  if (!pwa) {
    return '';
  }
  if (typeof pwa.targetId === 'string' && pwa.targetId) {
    return pwa.targetId;
  }
  if (typeof pwa.anonymousKey === 'string' && pwa.anonymousKey) {
    return pwa.anonymousKey;
  }
  return fallbackPublishedId;
}

async function waitForPublishedPwaRoute(page: Page, relativePath: string): Promise<void> {
  const absoluteUrl = new URL(relativePath, page.url()).toString();
  await expect
    .poll(
      async () => {
        const response = await page.request.get(absoluteUrl, { failOnStatusCode: false, timeout: 10_000 });
        return response.status();
      },
      {
        message: `published PWA route should be available at ${absoluteUrl}`,
        timeout: 90_000,
      },
    )
    .toBe(200);
}

export async function publishedViewerToolbarThemeState(page: Page): Promise<PublishedToolbarThemeState> {
  return test.step('Read published viewer toolbar theme styles', async () => {
    const toolbar = page.locator(SEL.publishedToolbar).first();
    const menuButton = page.locator(SEL.publishedToolbarMenuButton).first();
    const reloadButton = page.locator(SEL.publishedToolbarReloadButton).first();

    await expect(toolbar, 'published viewer toolbar should be visible').toBeVisible({ timeout: 30_000 });
    await expect(menuButton, 'published viewer menu button should be visible').toBeVisible({ timeout: 15_000 });
    await expect(reloadButton, 'published viewer reload button should be visible').toBeVisible({ timeout: 15_000 });

    const toolbarState = await toolbar.evaluate((el) => {
      const style = window.getComputedStyle(el as HTMLElement);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        visibility: style.visibility,
      };
    });

    return {
      toolbarColor: toolbarState.color,
      toolbarBackgroundColor: toolbarState.backgroundColor,
      toolbarVisibility: toolbarState.visibility,
      menu: await readToolbarButtonThemeState(menuButton),
      reload: await readToolbarButtonThemeState(reloadButton),
    };
  });
}

async function readToolbarButtonThemeState(button: Locator): Promise<PublishedToolbarButtonThemeState> {
  return button.evaluate((el) => {
    const host = el as HTMLElement;
    const style = window.getComputedStyle(host);
    const icon = host.querySelector('ion-icon');
    const iconStyle = icon ? window.getComputedStyle(icon as HTMLElement) : null;
    const native = host.shadowRoot?.querySelector('[part="native"]') as HTMLElement | null;
    const nativeStyle = native ? window.getComputedStyle(native) : null;

    return {
      color: style.color,
      iconColor: iconStyle?.color ?? '',
      cssColor: style.getPropertyValue('--color').trim(),
      background: style.getPropertyValue('--background').trim(),
      hoverBackground: style.getPropertyValue('--toolbar-button-hover-background').trim(),
      boxShadow: style.getPropertyValue('--box-shadow').trim(),
      visibility: style.visibility,
      nativeBackgroundColor: nativeStyle?.backgroundColor ?? '',
      nativeColor: nativeStyle?.color ?? '',
      className: host.className,
    };
  });
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

export async function setCurrentUserStudioLanguage(
  page: Page,
  lang: StudioLanguage,
  credentials: LoginCredentials = CURRENT_TEST_CREDENTIALS,
): Promise<void> {
  await test.step(`Persist current user Studio language to ${lang}`, async () => {
    await c8oCall(page, 'SetLanguage', { email: credentials.user, language: lang });
    await reloadStudioWithLanguage(page, lang);
  });
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

export async function openEditorCollaboratorsModal(page: Page): Promise<Locator> {
  return test.step('Open the editor collaborators modal', async () => {
    await expectRoute(page, ROUTE.editor);
    await dismissVisiblePopovers(page);

    const modal = page.locator(SEL.collaboratorsModal).last();
    if (await clickEditorMoreActionsCollaborators(page, modal)) {
      return modal;
    }

    const toolbarButton = page.locator(SEL.editorToolbarCollaboratorsButton).first();
    await expect(toolbarButton, 'editor toolbar collaborators button should be available').toBeVisible({
      timeout: 10_000,
    });
    await toolbarButton.click({ timeout: 5_000 }).catch(async () => toolbarButton.dispatchEvent('click'));
    await expect(modal, 'the collaborators modal should open from the editor toolbar').toBeVisible({
      timeout: 30_000,
    });
    return modal;
  });
}

export async function expectCollaboratorsCsvImportAvailable(page: Page): Promise<void> {
  await test.step('Assert collaborators CSV import opens the file picker', async () => {
    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'the collaborators modal should be visible before checking CSV import').toBeVisible({
      timeout: 30_000,
    });

    const input = modal.locator(SEL.collaboratorsCsvInput).first();
    await expect(input, 'CSV import should expose a .csv file input in the collaborators modal').toBeAttached({
      timeout: 10_000,
    });

    const button = modal.locator(SEL.collaboratorsCsvButton).first();
    await expect(button, 'CSV import should expose a visible button associated with the file input').toBeVisible({
      timeout: 10_000,
    });

    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10_000 });
    await button.click({ timeout: 5_000 }).catch(async () => button.dispatchEvent('click'));
    const fileChooser = await fileChooserPromise;
    expect(fileChooser.isMultiple(), 'the collaborators CSV import should choose a single CSV file').toBe(false);
  });
}

async function clickEditorMoreActionsCollaborators(page: Page, modal: Locator): Promise<boolean> {
  const moreActions = page.locator(SEL.editorMoreActionsButton).first();
  if (!(await moreActions.isVisible({ timeout: 3_000 }).catch(() => false))) {
    return false;
  }

  await moreActions.click({ timeout: 5_000 }).catch(async () => moreActions.dispatchEvent('click'));
  const popover = page.locator(SEL.editorMoreActionsPopover).last();
  if (!(await popover.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return false;
  }

  const item = popover.locator(SEL.editorMoreActionsCollaboratorsMenuItem).first();
  if (await item.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await item.click({ timeout: 5_000 }).catch(async () => item.dispatchEvent('click'));
  } else {
    const clicked = await page.evaluate(() => {
      const isVisible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const popovers = [...document.querySelectorAll('ion-popover:not(.overlay-hidden)')]
        .filter(isVisible)
        .reverse();
      for (const root of popovers) {
        const items = [...root.querySelectorAll('ion-item')].filter(isVisible);
        const match = (items.find(
          (candidate) =>
            (candidate.classList.contains('class1773329574106') ||
              !!candidate.querySelector('ion-icon[src*="user-plus.svg"], img[src*="user-plus.svg"]')),
        ) ?? items[0]) as HTMLElement | undefined;
        if (match) {
          match.click();
          return true;
        }
      }
      return false;
    });
    if (!clicked) {
      return false;
    }
  }

  return modal
    .waitFor({ state: 'visible', timeout: 30_000 })
    .then(() => true)
    .catch(() => false);
}

export async function searchSelectorApplicationsByName(page: Page, query: string): Promise<void> {
  await expectRoute(page, ROUTE.selector);
  const visibleNameInput = page.locator(`${SEL.selectorSearchByNameInput}:visible`).first();
  if (!(await visibleNameInput.isVisible({ timeout: 1_000 }).catch(() => false))) {
    await page.locator(SEL.selectorSearchToggleButton).first().click();
    await expect(visibleNameInput, 'selector advanced search name input should be visible').toBeVisible({
      timeout: 15_000,
    });
  }

  await visibleNameInput.fill(query);
  await fillInputValue(page, SEL.selectorSearchByNameInput, query, 'selector advanced search name input');
  await page.getByRole('button', { name: /^(Search|Rechercher|Buscar|Cerca)$/i }).last().click();
  await page.waitForTimeout(1_500);
}

export async function expectSelectorSearchKeepsSingleApplication(page: Page, title: string): Promise<void> {
  await test.step(`Assert selector search is still filtered to ${title}`, async () => {
    await expect
      .poll(async () => selectorSearchSummary(page, title), {
        message: `selector results should stay filtered to only "${title}"`,
        timeout: 30_000,
      })
      .toEqual({ hasSingleResultSummary: true, hasSearchTerm: true });
  });
}

export async function addFirstAvailableCollaboratorFromSelectorCard(page: Page, title: string): Promise<string> {
  return test.step(`Add a collaborator to ${title} from its selector card`, async () => {
    await openSelectorCardCollaboratorsModal(page, title);

    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'the collaborators modal should be visible').toBeVisible({ timeout: 30_000 });

    const input = modal.locator(SEL.collaboratorSearchInput).first();
    await expect(input, 'collaborator autocomplete input should be visible').toBeVisible({ timeout: 30_000 });
    await input.fill('test');

    const option = page.locator(SEL.collaboratorAutocompleteOption).first();
    await expect(option, 'at least one collaborator autocomplete option should be available').toBeVisible({
      timeout: 15_000,
    });
    const optionText = normalizeWhitespace(await option.innerText());
    await option.click();

    const collaboratorMail = optionText.split(/\s+/).find((token) => token.includes('@')) ?? optionText;
    await expect(modal.locator('ion-item').filter({ hasText: collaboratorMail }).first(), 'selected collaborator should be listed').toBeVisible({
      timeout: 15_000,
    });

    await modal.locator(SEL.collaboratorsSaveButton).first().click();
    await expect(modal, 'collaborators modal should close after saving').toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(2_000);
    return collaboratorMail;
  });
}

export async function sharePublishedApplicationWithNotification(
  page: Page,
  title: string,
  options: { recipientQuery?: string; subject: string; body: string },
): Promise<string> {
  return test.step(`Configure a Share application email notification for ${title}`, async () => {
    await openPublishedShareApplicationModal(page, title);
    const modal = page.locator(SEL.collaboratorsModal).last();
    const recipient = await selectFirstShareApplicationRecipient(page, modal, options.recipientQuery ?? 'test');
    await enableShareApplicationEmailNotification(modal);
    await fillShareApplicationNotificationFields(page, modal, options.subject, options.body);
    return recipient;
  });
}

export async function openPublishedShareApplicationModal(page: Page, title: string): Promise<void> {
  await test.step(`Open Share application modal for published application ${title}`, async () => {
    await openPublishedApplicationsTab(page);
    await openPublishedSelectorCardShareMenuItem(page, title);
    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'Share application should open the access-rights modal').toBeVisible({ timeout: 30_000 });
    await expect(modal, 'Share application modal title should be visible').toContainText(
      /Partager l'application|Share the application/i,
      { timeout: 15_000 },
    );
  });
}

const SHARE_YES_OPTION_RE = /^(Oui|Yes|Si|S\u00ed|S\u00ec)$/i;
const SHARE_SAVE_BUTTON_RE = /^(Save(?: settings)?|Enregistrer.*|Sauvegarder.*|Guardar.*|Salva.*)$/i;
const SHARE_ANONYMOUS_LINK_RE = /(?:lien anonyme|anonymous link|enlace an[o\u00f3]nimo|collegamento anonimo)/i;
const SHARE_PUBLIC_QR_LABEL_RE =
  /(?:QR Code|C[o\u00f3]digo QR)\s*-\s*(?:Lien public|Public link|Enlace p[\u00fa]blico|Link pubblico)/i;

export async function configurePublishedApplicationPublicLinkAndAssertQrLabel(
  page: Page,
  title: string,
): Promise<void> {
  await test.step(`Enable the public share link and verify its QR label for ${title}`, async () => {
    await openPublishedShareApplicationModal(page, title);
    const modal = page.locator(SEL.collaboratorsModal).last();
    await expect(modal, 'Share application access-rights modal should be visible').toBeVisible({ timeout: 30_000 });

    const publicLinkToggleWasAvailable = await enableShareApplicationAnonymousPublicLink(page, modal);
    await expectShareApplicationPublicQrLabel(modal);
    if (!publicLinkToggleWasAvailable) {
      return;
    }
    await saveShareApplicationModal(page, modal);

    await openPublishedShareApplicationModal(page, title);
    const reopened = page.locator(SEL.collaboratorsModal).last();
    await expect(reopened, 'Share application access-rights modal should reopen').toBeVisible({ timeout: 30_000 });
    await expectShareApplicationAnonymousPublicLinkEnabled(reopened);
    await expectShareApplicationPublicQrLabel(reopened);
    await saveShareApplicationModal(page, reopened);
  });
}

async function enableShareApplicationAnonymousPublicLink(page: Page, modal: Locator): Promise<boolean> {
  const modernToggle = await shareApplicationAnonymousToggleSwitch(modal);
  if (modernToggle) {
    const yesButton = await shareApplicationYesButton(modernToggle);
    const selected = await yesButton.evaluate((el) => el.classList.contains('c8o-btn-selected')).catch(() => false);
    if (!selected) {
      await yesButton.click({ timeout: 10_000 }).catch(async () => yesButton.dispatchEvent('click'));
    }
    await expect(yesButton, 'anonymous/public share link should be set to Yes/Oui').toHaveClass(/c8o-btn-selected/, {
      timeout: 10_000,
    });
    return true;
  }

  const legacyToggle = await firstVisibleChildOrNull(modal, SEL.shareAnonymousLegacyToggle, 15_000);
  if (!legacyToggle) {
    return false;
  }

  if (!(await isIonToggleChecked(legacyToggle))) {
    await legacyToggle.click({ timeout: 10_000 }).catch(async () => legacyToggle.click({ force: true, timeout: 5_000 }));
  }
  await waitForIonicLoading(page, 15_000);
  await expect.poll(() => isIonToggleChecked(legacyToggle), { timeout: 10_000 }).toBe(true);
  return true;
}

async function expectShareApplicationAnonymousPublicLinkEnabled(modal: Locator): Promise<void> {
  const modernToggle = await shareApplicationAnonymousToggleSwitch(modal);
  if (modernToggle) {
    const yesButton = await shareApplicationYesButton(modernToggle);
    await expect(yesButton, 'anonymous/public share link should still be set to Yes/Oui after reopening').toHaveClass(
      /c8o-btn-selected/,
      { timeout: 10_000 },
    );
    return;
  }

  const legacyToggle = await firstVisibleChildOrNull(modal, SEL.shareAnonymousLegacyToggle, 15_000);
  if (!legacyToggle) {
    throw new Error('Share application modal did not expose an anonymous/public link toggle after reopening');
  }
  await expect
    .poll(() => isIonToggleChecked(legacyToggle), {
      message: 'anonymous/public share link should still be enabled after reopening',
      timeout: 10_000,
    })
    .toBe(true);
}

async function expectShareApplicationPublicQrLabel(modal: Locator): Promise<void> {
  await expect
    .poll(
      async () => {
        const labels = await visibleShareApplicationQrLabels(modal);
        return labels.find((label) => SHARE_PUBLIC_QR_LABEL_RE.test(label)) ?? labels.join(' | ');
      },
      {
        message: 'the anonymous/public share QR code should use the public-link label',
        timeout: 20_000,
      },
    )
    .toMatch(SHARE_PUBLIC_QR_LABEL_RE);
}

async function shareApplicationAnonymousToggleSwitch(modal: Locator): Promise<Locator | null> {
  const labelled = modal.locator(SEL.shareAnonymousToggleSwitch).filter({ hasText: SHARE_ANONYMOUS_LINK_RE }).first();
  if (await labelled.isVisible({ timeout: 1_000 }).catch(() => false)) {
    return labelled;
  }
  return firstVisibleChildOrNull(modal, SEL.shareAnonymousToggleSwitch, 3_000);
}

async function shareApplicationYesButton(toggle: Locator): Promise<Locator> {
  const buttons = toggle.locator(SEL.shareNotificationToggleButton);
  const byText = buttons.filter({ hasText: SHARE_YES_OPTION_RE }).first();
  const button = (await byText.isVisible({ timeout: 1_000 }).catch(() => false)) ? byText : buttons.first();
  await expect(button, 'the toggle should expose a Yes/Oui option').toBeVisible({ timeout: 10_000 });
  return button;
}

async function visibleShareApplicationQrLabels(modal: Locator): Promise<string[]> {
  return modal.evaluate((root, labelSelector) => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const isVisible = (el: Element): el is HTMLElement => {
      const element = el as HTMLElement;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };

    const classCandidates = [...root.querySelectorAll(labelSelector)].filter(isVisible);
    const broadCandidates = [...root.querySelectorAll('ion-text, span, div, p')].filter(isVisible);
    const candidates = classCandidates.length > 0 ? classCandidates : broadCandidates;
    const labels: string[] = [];
    for (const candidate of candidates) {
      const text = normalize(candidate.innerText || candidate.textContent || '');
      if (!/(?:QR Code|C[o\u00f3]digo QR)/i.test(text) || !/(?:Lien|link|Enlace|Link)/i.test(text)) {
        continue;
      }
      if (!labels.includes(text)) {
        labels.push(text);
      }
    }
    return labels;
  }, SEL.shareQrLabel);
}

async function saveShareApplicationModal(page: Page, modal: Locator): Promise<void> {
  const selectorButton = await firstVisibleChildOrNull(modal, SEL.collaboratorsSaveButton, 5_000);
  const namedButton = modal.getByRole('button', { name: SHARE_SAVE_BUTTON_RE }).last();
  const button = selectorButton ?? ((await namedButton.isVisible({ timeout: 2_000 }).catch(() => false)) ? namedButton : null);
  if (!button) {
    throw new Error('Share application modal did not expose a Save button');
  }

  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await expect(modal, 'Share application modal should close after saving').toBeHidden({ timeout: 30_000 });
  await waitForIonicLoading(page, 15_000);
}

async function selectFirstShareApplicationRecipient(page: Page, modal: Locator, query: string): Promise<string> {
  const input = modal.locator(SEL.collaboratorSearchInput).first();
  await expect(input, 'Share application should expose the user/group autocomplete').toBeVisible({ timeout: 30_000 });
  await input.fill(query);

  const option = page.locator(SEL.collaboratorAutocompleteOption).first();
  await expect(option, 'at least one user or group should be available to share with').toBeVisible({ timeout: 20_000 });
  const optionText = normalizeWhitespace(await option.innerText());
  await option.click();

  const recipient = optionText.split(/\s+/).find((token) => token.includes('@')) ?? optionText;
  await expect
    .poll(() => modal.innerText().then((text) => normalizeWhitespace(text)), {
      message: `the selected recipient ${recipient} should be listed before enabling notification`,
      timeout: 15_000,
    })
    .toContain(recipient);

  return recipient;
}

async function enableShareApplicationEmailNotification(modal: Locator): Promise<void> {
  const toggle = modal.locator(SEL.shareNotificationToggle).filter({ hasText: /Envoyer une notification|Send an email notification/i }).first();
  await expect(toggle, 'Share application should expose the Send an email notification toggle').toBeVisible({
    timeout: 20_000,
  });

  const yesByText = toggle.locator(SEL.shareNotificationToggleButton).filter({ hasText: /^(Oui|Yes)$/i }).first();
  const yesButton = (await yesByText.isVisible({ timeout: 1_000 }).catch(() => false))
    ? yesByText
    : toggle.locator(SEL.shareNotificationToggleButton).first();
  await expect(yesButton, 'the notification toggle should expose a Yes/Oui option').toBeVisible({ timeout: 10_000 });
  await yesButton.click({ timeout: 10_000 }).catch(async () => yesButton.dispatchEvent('click'));
  await expect(yesButton, 'the notification toggle should be set to Yes/Oui').toHaveClass(/c8o-btn-selected/, {
    timeout: 10_000,
  });
}

async function fillShareApplicationNotificationFields(
  page: Page,
  modal: Locator,
  subject: string,
  body: string,
): Promise<void> {
  const subjectInput = modal.locator(SEL.shareSubjectInput).first();
  await expect(subjectInput, 'choosing Yes/Oui should reveal Email subject').toBeVisible({ timeout: 15_000 });
  await subjectInput.fill(subject);
  await subjectInput.dispatchEvent('input');
  await subjectInput.dispatchEvent('change');
  await subjectInput.blur();
  await expect(subjectInput, 'Email subject should keep the typed value').toHaveValue(subject, { timeout: 10_000 });

  await expect(modal, 'choosing Yes/Oui should reveal Email body').toContainText(/Corps du courriel|Email body/i, {
    timeout: 15_000,
  });
  await fillShareApplicationTinyMceBody(page, modal, body);
}

async function fillShareApplicationTinyMceBody(page: Page, modal: Locator, value: string): Promise<void> {
  const iframe = modal.locator(SEL.shareBodyEditorFrame).last();
  if (await iframe.isVisible({ timeout: 15_000 }).catch(() => false)) {
    const body = iframe.contentFrame().locator('body');
    await expect(body, 'Email body TinyMCE iframe should be editable').toBeVisible({ timeout: 10_000 });
    await body.click();
    await body.fill(value);
    await fireActiveTinyMceChange(page);
    await expect(body, 'Email body should keep the typed value').toContainText(value, { timeout: 10_000 });
    return;
  }

  const inlineEditor = modal.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'Email body TinyMCE editor should be editable').toBeVisible({ timeout: 10_000 });
  await inlineEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(value);
  await fireActiveTinyMceChange(page);
  await expect(inlineEditor, 'Email body should keep the typed value').toContainText(value, { timeout: 10_000 });
}

async function openPublishedSelectorCardShareMenuItem(page: Page, title: string): Promise<void> {
  for (let pass = 0; pass < 2; pass++) {
    await dismissVisiblePopovers(page);
    await dismissVisibleToasts(page);
    await expandSelectorSideMenuIfCardMenusAreCollapsed(page, title);
    const cardId = await selectorApplicationCardId(page, title);
    const card = page.locator(`[id="${cardId}"]:visible`).first();
    await expect(card, `published application card ${title} should be visible`).toBeVisible({ timeout: 30_000 });

    const menuOverlayId = cardId.replace(/^idcard/, 'idcardO');
    const cardMenu = card.locator(SEL.cardMenuButton).first();
    const overlayMenu = page.locator(`[id="${menuOverlayId}"]:visible`).locator(SEL.cardMenuButton).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      await dismissVisiblePopovers(page);
      if (await clickVisibleSelectorCardMenuByTitle(page, title)) {
        if (await clickVisibleSelectorShareMenuItem(page)) {
          return;
        }
      }

      await revealSelectorCardMenu(page, card);

      for (const menu of [overlayMenu, cardMenu]) {
        if (!(await menu.isVisible({ timeout: 1_000 }).catch(() => false))) {
          continue;
        }

        await clickSelectorCardMenuButton(page, menu);
        if (await clickVisibleSelectorShareMenuItem(page)) {
          return;
        }
      }

      if (await clickVisibleSelectorCardMenuById(page, cardId)) {
        if (await clickVisibleSelectorShareMenuItem(page)) {
          return;
        }
      }
    }

    if (pass === 0) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() => undefined);
      await waitForIonicLoading(page, 20_000);
      await openPublishedApplicationsTab(page);
    }
  }

  throw new Error(`Could not open Share application menu item for published application ${title}`);
}

async function expandSelectorSideMenuIfCardMenusAreCollapsed(page: Page, title: string): Promise<void> {
  const collapsed = await page.evaluate(
    ({ titleSelector, expectedTitle }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const title = [...document.querySelectorAll(titleSelector)].find((candidate) =>
        normalize((candidate as HTMLElement).innerText).includes(expectedTitle),
      ) as HTMLElement | undefined;
      const card = title?.closest('[id^="idcard"]:not([id^="idcardO"]), c8oforms-cardselector, ion-col');
      if (!card) {
        return false;
      }
      const rect = (card as HTMLElement).getBoundingClientRect();
      return rect.left < 100;
    },
    { titleSelector: `${SEL.selectorCardTitle}, ${SEL.selectorListTitle}`, expectedTitle: title },
  );
  if (!collapsed) {
    return;
  }

  await page.mouse.click(37, 28).catch(() => undefined);
  await page.waitForTimeout(900);
}

async function dismissVisibleToasts(page: Page): Promise<void> {
  const toast = page.locator('ion-toast:not(.overlay-hidden), ion-toast.show-toast').last();
  if (!(await toast.isVisible({ timeout: 500 }).catch(() => false))) {
    return;
  }

  const button = toast.locator('button, .toast-button').filter({ hasText: /^(OK|Close|Fermer)$/i }).first();
  if (await button.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await button.click({ timeout: 3_000 }).catch(() => undefined);
  }
  await toast.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
}

async function clickVisibleSelectorCardMenuById(page: Page, cardId: string): Promise<boolean> {
  await page.waitForTimeout(250);
  return page.evaluate((id) => {
    const isVisible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const suffix = id.replace(/^idcard/, '');
    const roots = [...document.querySelectorAll(`[id="${id}"], [id="idcardO${suffix}"]`)].filter(isVisible);
    for (const root of roots.reverse()) {
      const buttons = [...root.querySelectorAll('ion-button')].filter(isVisible).reverse();
      const menu =
        buttons.find((button) => button.classList.contains('class1606574763560')) ??
        buttons.find((button) => !!button.querySelector('ion-icon[name*="ellipsis"], ion-icon.class1606574808458')) ??
        buttons[0];
      if (menu) {
        menu.click();
        return true;
      }
    }
    return false;
  }, cardId);
}

async function clickVisibleSelectorCardMenuByTitle(page: Page, title: string): Promise<boolean> {
  const menuPoint = await hoverVisibleSelectorCardByTitle(page, title);
  if (!menuPoint) {
    return false;
  }

  await page.mouse.click(menuPoint.x, menuPoint.y).catch(() => undefined);
  if (
    await page
      .locator('ion-popover:not(.overlay-hidden):visible page-popoverpageselector')
      .last()
      .waitFor({ state: 'visible', timeout: 1_500 })
      .then(() => true)
      .catch(() => false)
  ) {
    return true;
  }

  const clicked = await page.evaluate(
    ({ titleSelector, expectedTitle }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const expectedPrefix = expectedTitle.slice(0, Math.min(32, expectedTitle.length));
      const isVisible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        if (
          box.width <= 0 ||
          box.height <= 0 ||
          box.right <= 0 ||
          box.bottom <= 0 ||
          box.left >= window.innerWidth ||
          box.top >= window.innerHeight ||
          style.display === 'none' ||
          style.visibility === 'hidden'
        ) {
          return false;
        }
        const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return !!hit && (el.contains(hit) || hit.contains(el));
      };
      const clickableCenter = (el: Element) => {
        const box = (el as HTMLElement).getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      };
      const dispatchPointerClick = (el: HTMLElement): boolean => {
        const center = clickableCenter(el);
        for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
          el.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              clientX: center.x,
              clientY: center.y,
              view: window,
            }),
          );
        }
        return true;
      };

      const title = [...document.querySelectorAll(titleSelector)]
        .filter(isVisible)
        .find((candidate) => {
          const text = normalize((candidate as HTMLElement).innerText);
          return text.includes(expectedTitle) || (expectedPrefix.length > 0 && text.includes(expectedPrefix));
        }) as HTMLElement | undefined;
      const card =
        title?.closest('[id^="idcard"]:not([id^="idcardO"])') ??
        title?.closest('c8oforms-cardselector') ??
        title?.closest('ion-col');
      if (!card || !isVisible(card)) {
        return false;
      }
      const rect = (card as HTMLElement).getBoundingClientRect();

      const scopedButtons = [...card.querySelectorAll('ion-button, button, [role="button"]')].filter(isVisible);
      const documentButtons = [...document.querySelectorAll('ion-button, button, [role="button"]')]
        .filter(isVisible)
        .filter((candidate) => {
          const box = (candidate as HTMLElement).getBoundingClientRect();
          return (
            box.left >= rect.left - 20 &&
            box.right <= rect.right + 20 &&
            box.top >= rect.top - 20 &&
            box.bottom <= rect.bottom + 20
          );
        });
      const buttons = [...new Set([...scopedButtons, ...documentButtons])] as HTMLElement[];
      const menu =
        buttons.find((button) => button.classList.contains('class1606574763560')) ??
        buttons.find((button) => !!button.querySelector('ion-icon[name*="ellipsis"], ion-icon.class1606574808458'));
      if (menu) {
        return dispatchPointerClick(menu);
      }
      return false;
    },
    { titleSelector: `${SEL.selectorCardTitle}, ${SEL.selectorListTitle}`, expectedTitle: title },
  );
  if (!clicked) {
    return false;
  }
  await page
    .locator('ion-popover:not(.overlay-hidden):visible page-popoverpageselector')
    .last()
    .waitFor({ state: 'visible', timeout: 2_000 })
    .then(() => true)
    .catch(() => false);
  return true;
}

async function hoverVisibleSelectorCardByTitle(page: Page, title: string): Promise<{ x: number; y: number } | null> {
  const points = await page.evaluate(
    ({ titleSelector, expectedTitle }) => {
      const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const expectedPrefix = expectedTitle.slice(0, Math.min(32, expectedTitle.length));
      const isVisible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        if (
          box.width <= 0 ||
          box.height <= 0 ||
          box.right <= 0 ||
          box.bottom <= 0 ||
          box.left >= window.innerWidth ||
          box.top >= window.innerHeight ||
          style.display === 'none' ||
          style.visibility === 'hidden'
        ) {
          return false;
        }
        const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return !!hit && (el.contains(hit) || hit.contains(el));
      };

      const title = [...document.querySelectorAll(titleSelector)]
        .filter(isVisible)
        .find((candidate) => {
          const text = normalize((candidate as HTMLElement).innerText);
          return text.includes(expectedTitle) || (expectedPrefix.length > 0 && text.includes(expectedPrefix));
        }) as HTMLElement | undefined;
      const card =
        title?.closest('[id^="idcard"]:not([id^="idcardO"])') ??
        title?.closest('c8oforms-cardselector') ??
        title?.closest('ion-col');
      if (!card || !isVisible(card)) {
        return null;
      }
      const rect = (card as HTMLElement).getBoundingClientRect();
      return {
        hover: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        menu: { x: rect.right - 24, y: rect.top + 20 },
      };
    },
    { titleSelector: `${SEL.selectorCardTitle}, ${SEL.selectorListTitle}`, expectedTitle: title },
  );
  if (!points) {
    return null;
  }

  await page.mouse.move(points.hover.x, points.hover.y, { steps: 5 }).catch(() => undefined);
  await page
    .evaluate(
      ({ titleSelector, expectedTitle, point }) => {
        const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
        const title = [...document.querySelectorAll(titleSelector)].find((candidate) =>
          normalize((candidate as HTMLElement).innerText).includes(expectedTitle),
        ) as HTMLElement | undefined;
        const card = title?.closest('[id^="idcard"]:not([id^="idcardO"])') as HTMLElement | null;
        const host = card?.closest('c8oforms-cardselector') as HTMLElement | null;
        const targets = [host, card].filter((target): target is HTMLElement => !!target);
        for (const target of targets) {
          for (const type of ['pointerover', 'mouseover', 'mouseenter', 'mousemove']) {
            target.dispatchEvent(
              new MouseEvent(type, {
                bubbles: type !== 'mouseenter',
                cancelable: true,
                clientX: point.x,
                clientY: point.y,
                view: window,
              }),
            );
          }
        }
      },
      {
        titleSelector: `${SEL.selectorCardTitle}, ${SEL.selectorListTitle}`,
        expectedTitle: title,
        point: points.hover,
      },
    )
    .catch(() => undefined);
  await page.waitForTimeout(600);
  return points.menu;
}

async function clickVisibleSelectorShareMenuItem(page: Page): Promise<boolean> {
  const popover = page.locator('ion-popover:not(.overlay-hidden):visible page-popoverpageselector').last();
  if (!(await popover.isVisible({ timeout: 500 }).catch(() => false))) {
    return false;
  }

  const item = popover.locator(SEL.publishedShareMenuItem).first();
  if (await item.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await item.click({ timeout: 3_000 }).catch(async () => {
      await item.evaluate((el) => (el as HTMLElement).click());
    });
  } else {
    const clicked = await page.evaluate(() => {
      const isVisible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };

      const popovers = [...document.querySelectorAll('ion-popover:not(.overlay-hidden) page-popoverpageselector')]
        .filter(isVisible)
        .reverse();
      for (const root of popovers) {
        const item = [...root.querySelectorAll('ion-item')].find((candidate) => {
          const text = ((candidate as HTMLElement).innerText ?? '').replace(/\u00a0/g, ' ').trim().toLowerCase();
          return (
            isVisible(candidate) &&
            (candidate.classList.contains('class1578663445209') ||
              candidate.querySelector('ion-icon.class1603730319967') ||
              text === 'share application' ||
              text === "partager l'application")
          );
        }) as HTMLElement | undefined;
        if (item) {
          item.click();
          return true;
        }
      }
      return false;
    });
    if (!clicked) {
      return false;
    }
  }

  return page
    .locator(SEL.collaboratorsModal)
    .last()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false);
}

async function openSelectorCardCollaboratorsModal(page: Page, title: string): Promise<void> {
  await expectRoute(page, ROUTE.selector);
  await dismissVisiblePopovers(page);
  const cardId = await selectorApplicationCardId(page, title);
  const card = page.locator(`[id="${cardId}"]`).first();
  await expect(card, `selector should show application card ${title}`).toBeVisible({ timeout: 30_000 });

  const menuOverlayId = cardId.replace(/^idcard/, 'idcardO');
  const cardMenu = card.locator(SEL.cardMenuButton).first();
  const overlayMenu = page.locator(`[id="${menuOverlayId}"] ${SEL.cardMenuButton}`).first();
  for (let attempt = 0; attempt < 3; attempt++) {
    await dismissVisiblePopovers(page);
    await revealSelectorCardMenu(page, card);

    for (const menu of [overlayMenu, cardMenu]) {
      if (!(await menu.isVisible({ timeout: 1_000 }).catch(() => false))) {
        continue;
      }

      await clickSelectorCardMenuButton(page, menu);
      if (await clickVisibleSelectorCollaboratorsMenuItem(page)) {
        return;
      }

      await dismissVisiblePopovers(page);
      await revealSelectorCardMenu(page, card);
    }
  }

  throw new Error(`Could not open collaborators menu item for selector card ${title}`);
}

async function revealSelectorCardMenu(page: Page, card: Locator): Promise<void> {
  await card.hover({ timeout: 2_000 }).catch(async () => {
    await card.dispatchEvent('mouseenter');
  });
  await page.waitForTimeout(300);
}

async function clickSelectorCardMenuButton(page: Page, menu: Locator): Promise<void> {
  await menu.click({ timeout: 3_000, force: true }).catch(async () => {
    await menu.evaluate((el) => (el as HTMLElement).click()).catch(async () => {
      await menu.dispatchEvent('click').catch(() => undefined);
    });
  });
  await page
    .locator('ion-popover:not(.overlay-hidden):visible page-popoverpageselector')
    .last()
    .waitFor({ state: 'visible', timeout: 2_000 })
    .catch(() => undefined);
}

async function clickVisibleSelectorCollaboratorsMenuItem(page: Page): Promise<boolean> {
  const popover = page.locator('ion-popover:not(.overlay-hidden):visible page-popoverpageselector').last();
  if (!(await popover.isVisible({ timeout: 500 }).catch(() => false))) {
    return false;
  }

  const item = popover.locator(SEL.selectorCollaboratorsMenuItem).first();
  if (await item.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await item.click({ timeout: 3_000 }).catch(async () => {
      await item.evaluate((el) => (el as HTMLElement).click());
    });
  } else {
    const clicked = await page.evaluate(() => {
      const isVisible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };

      const popovers = [...document.querySelectorAll('ion-popover:not(.overlay-hidden) page-popoverpageselector')]
        .filter(isVisible)
        .reverse();
      for (const root of popovers) {
        const item = [...root.querySelectorAll('ion-item')].find(
          (candidate) =>
            isVisible(candidate) &&
            (candidate.classList.contains('class1594313281739') ||
              candidate.querySelector('ion-icon.class1603730321735')),
        ) as HTMLElement | undefined;
        if (item) {
          item.click();
          return true;
        }
      }
      return false;
    });
    if (!clicked) {
      return false;
    }
  }

  return page
    .locator(SEL.collaboratorsModal)
    .last()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false);
}

async function selectorApplicationCardId(page: Page, title: string): Promise<string> {
  const startedAt = Date.now();
  do {
    const cardId = await page.evaluate(
      ({ titleSelector, expectedTitle }) => {
        const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
        const expectedPrefix = expectedTitle.slice(0, Math.min(32, expectedTitle.length));
        const isVisible = (el: Element): el is HTMLElement => {
          const box = (el as HTMLElement).getBoundingClientRect();
          const style = getComputedStyle(el);
          return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        };

        for (const title of [...document.querySelectorAll(titleSelector)].filter(isVisible)) {
          if (normalize((title as HTMLElement).innerText) !== expectedTitle) {
            continue;
          }
          const card = title.closest('[id^="idcard"]:not([id^="idcardO"])') as HTMLElement | null;
          return card?.id ?? null;
        }

        for (const card of [...document.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')].filter(isVisible)) {
          const text = normalize((card as HTMLElement).innerText);
          if (text.includes(expectedTitle) || (expectedPrefix.length > 0 && text.includes(expectedPrefix))) {
            return (card as HTMLElement).id;
          }
        }
        return null;
      },
      { titleSelector: `${SEL.selectorCardTitle}, ${SEL.selectorListTitle}`, expectedTitle: title },
    );

    if (cardId) {
      return cardId;
    }
    await page.waitForTimeout(500);
  } while (Date.now() - startedAt < 30_000);

  throw new Error(`Could not resolve selector card id for ${title}`);
}

async function dismissVisiblePopovers(page: Page): Promise<void> {
  const visiblePopovers = page.locator('ion-popover:not(.overlay-hidden):visible');
  const hasVisiblePopover = async () => (await visiblePopovers.count().catch(() => 0)) > 0;

  for (let attempt = 0; attempt < 2 && (await hasVisiblePopover()); attempt++) {
    await page.keyboard.press('Escape').catch(() => undefined);
    await page.waitForTimeout(200);
    if (!(await hasVisiblePopover())) return;

    await page.mouse.click(5, 5).catch(() => undefined);
    await page.waitForTimeout(200);
  }

  if (await hasVisiblePopover()) {
    await page.evaluate(async () => {
      const visible = (el: Element) => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const popovers = [...document.querySelectorAll('ion-popover:not(.overlay-hidden)')].filter(visible);
      await Promise.all(
        popovers.map((popover) => {
          const dismiss = (popover as HTMLElement & { dismiss?: () => Promise<boolean> }).dismiss;
          return dismiss?.call(popover).catch(() => false);
        }),
      );
    });
    await expect(visiblePopovers, 'visible popovers should be dismissed before interacting with selector cards').toHaveCount(0, {
      timeout: 3_000,
    });
  }
}

async function selectorSearchSummary(
  page: Page,
  title: string,
): Promise<{ hasSingleResultSummary: boolean; hasSearchTerm: boolean }> {
  return page.locator('page-selectorpage').evaluate((root, expectedTitle) => {
    const text = (root as HTMLElement).innerText.replace(/\u00a0/g, ' ');
    return {
      hasSingleResultSummary: /(?:^|\n)\s*1\s+(?:results?\(s\)|r[ée]sultat\(s\)|resultado\(s\)|risultato\s*\(i\))/i.test(text),
      hasSearchTerm: text.includes(expectedTitle),
    };
  }, title);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

async function publishedQrButton(page: Page): Promise<Locator> {
  await expectRoute(page, ROUTE.selector);
  return firstVisibleLocator(page, SEL.publishedQrButton, 'Published Applications QR button', 15_000);
}

async function publishedQrButtonText(button: Locator): Promise<string> {
  return normalizeWhitespace(await button.innerText({ timeout: 2_000 }).catch(() => ''));
}

async function readPublishedQrTooltipMessage(page: Page, button: Locator): Promise<string> {
  const reflected = await button
    .evaluate((el) => {
      const host = el as HTMLElement;
      const values = [
        host.getAttribute('ng-reflect-message'),
        host.getAttribute('mattooltip'),
        host.getAttribute('title'),
      ];
      return values.find((value) => value?.trim()) ?? '';
    })
    .catch(() => '');

  if (reflected.trim()) {
    return normalizeWhitespace(reflected);
  }

  await button.hover({ timeout: 5_000 }).catch(() => undefined);
  await page.waitForTimeout(600);
  const tooltip = normalizeWhitespace(await visibleTooltipText(page));
  await page.mouse.move(5, 5).catch(() => undefined);
  return tooltip;
}

async function visibleTooltipText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const tooltipSelectors = ['.mat-tooltip', 'mat-tooltip-component', '.mdc-tooltip__surface', '[role="tooltip"]'];
    return tooltipSelectors
      .flatMap((selector) => [...document.querySelectorAll(selector)])
      .filter(visible)
      .map((el) => (el as HTMLElement).innerText || el.textContent || '')
      .join(' ');
  });
}

export type SelectorHighlightedTitleLayout = {
  text: string;
  html: string;
  highlightedText: string;
  display: string;
  whiteSpace: string;
  spaceBeforeHighlightWidth: number;
  spaceAfterHighlightWidth: number;
};

export async function waitForSelectorHighlightedTitleLayout(
  page: Page,
  marker: string,
  highlightedText: string,
): Promise<SelectorHighlightedTitleLayout> {
  let latestLayout: SelectorHighlightedTitleLayout | null = null;

  await expect
    .poll(
      async () => {
        latestLayout = await selectorHighlightedTitleLayout(page, marker, highlightedText);
        return latestLayout?.html ?? '';
      },
      {
        message: `selector search results should include a highlighted title containing "${marker}"`,
        timeout: 30_000,
      },
    )
    .not.toBe('');

  if (!latestLayout) {
    throw new Error(`selector highlighted title containing "${marker}" was not found`);
  }
  return latestLayout;
}

async function selectorHighlightedTitleLayout(
  page: Page,
  marker: string,
  highlightedText: string,
): Promise<SelectorHighlightedTitleLayout | null> {
  return page.evaluate(
    ({ titleSelector, markerText, highlightText }) => {
      const isVisible = (el: Element): el is HTMLElement => {
        const box = (el as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(el);
        return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const normalize = (text: string) => text.replace(/\u00a0/g, ' ');
      const measureBoundarySpace = (node: ChildNode | null, side: 'before' | 'after') => {
        if (!node || node.nodeType !== Node.TEXT_NODE) return 0;
        const text = node.textContent ?? '';
        const index = side === 'before' ? text.length - 1 : 0;
        if (text[index] !== ' ') return 0;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const width = Math.round(range.getBoundingClientRect().width * 10) / 10;
        range.detach();
        return width;
      };

      for (const title of [...document.querySelectorAll(titleSelector)].filter(isVisible)) {
        if (!normalize(title.textContent ?? '').includes(markerText)) {
          continue;
        }
        const strong = [...title.querySelectorAll('strong')].find((candidate) =>
          normalize(candidate.textContent ?? '').toUpperCase().includes(highlightText.toUpperCase()),
        );
        if (!strong) {
          continue;
        }

        const style = getComputedStyle(title);
        return {
          text: normalize(title.innerText).trimEnd(),
          html: title.innerHTML,
          highlightedText: normalize((strong as HTMLElement).innerText),
          display: style.display,
          whiteSpace: style.whiteSpace,
          spaceBeforeHighlightWidth: measureBoundarySpace(strong.previousSibling, 'before'),
          spaceAfterHighlightWidth: measureBoundarySpace(strong.nextSibling, 'after'),
        };
      }

      return null;
    },
    {
      titleSelector: `${SEL.selectorCardTitle}, ${SEL.selectorListTitle}`,
      markerText: marker,
      highlightText: highlightedText,
    },
  );
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

export async function selectChartHeightMode(page: Page, mode: ChartHeightMode): Promise<void> {
  await test.step(`Select Chart height mode: ${mode}`, async () => {
    const button = chartHeightModeButton(page, mode);
    await expect(button, `Chart ${mode} height mode button should be visible`).toBeVisible({ timeout: 15_000 });
    await button.click();
    await expectChartHeightModeSelected(page, mode);
  });
}

export async function expectChartHeightModeSelected(page: Page, mode: ChartHeightMode): Promise<void> {
  await test.step(`Assert Chart height mode is ${mode}`, async () => {
    const button = chartHeightModeButton(page, mode);
    await expect
      .poll(async () => (await button.getAttribute('class')) ?? '', {
        message: `Chart ${mode} height mode button should be selected`,
        timeout: 10_000,
      })
      .toContain('c8o-btn-selected');
  });
}

export async function expectChartPersonalizedHeightInput(page: Page, visible: boolean): Promise<void> {
  await test.step(`Assert Chart personalized height input is ${visible ? 'visible' : 'hidden'}`, async () => {
    const input = page.locator(`${SEL.chartPersonalizedHeightInput}:visible`).first();
    if (visible) {
      await expect(input, 'Chart personalized height input should be visible').toBeVisible({ timeout: 10_000 });
    } else {
      await expect(input, 'Chart personalized height input should be hidden in automatic mode').toHaveCount(0, {
        timeout: 10_000,
      });
    }
  });
}

export async function setChartPersonalizedHeight(page: Page, value: string): Promise<void> {
  await test.step(`Set Chart personalized height to ${value}`, async () => {
    const input = page.locator(`${SEL.chartPersonalizedHeightInput}:visible`).first();
    await expect(input, 'Chart personalized height input should be visible before editing').toBeVisible({ timeout: 10_000 });
    await input.fill(value);
    await input.blur();
    await expect(input, 'Chart personalized height input should keep the edited value').toHaveValue(value, {
      timeout: 10_000,
    });
    await page.waitForTimeout(800);
  });
}

function chartHeightModeButton(page: Page, mode: ChartHeightMode): Locator {
  const index = mode === 'auto' ? 0 : 1;
  return page.locator(`${SEL.chartHeightModeToggle} button.c8o-btn:visible`).nth(index);
}

/** Click "Aperçu" and wait for the viewer/preview to render the form. */
export async function openPreview(page: Page, waitForSelector = SEL.mapViewer): Promise<void> {
  await page.locator(SEL.previewButton).first().click();
  await expectRoute(page, ROUTE.viewer);
  await page.locator(waitForSelector).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_000);
}

export function viewerTextInput(page: Page, technicalId: string): Locator {
  return page.locator(`ion-input#${technicalId} input, input#${technicalId}, [id="${technicalId}"] input`).first();
}

export async function visibleDataGridRow(page: Page, text: string, timeout = 45_000): Promise<Locator> {
  const row = page.locator('.ag-center-cols-container .ag-row').filter({ hasText: text }).first();
  await expect(row, `the Data Grid row ${text} should render`).toBeVisible({ timeout });
  await expect
    .poll(() => normalizedLocatorText(row), {
      message: `the Data Grid row ${text} should expose its visible cell text`,
      timeout: 15_000,
    })
    .toContain(text);
  return row;
}

export async function normalizedLocatorText(locator: Locator): Promise<string> {
  return (await locator.innerText()).replace(/\s+/g, ' ').trim();
}

export async function submitViewerForm(page: Page): Promise<void> {
  await test.step('Submit the viewer form', async () => {
    await expectRoute(page, ROUTE.viewer);
    const submit = await firstVisibleLocator(page, SEL.viewerSubmitButton, 'viewer submit button', 30_000);
    await submit.scrollIntoViewIfNeeded().catch(() => undefined);
    await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
    await confirmAlertIfVisible(page);
    await page.locator(SEL.responseCompletedPage).waitFor({ state: 'attached', timeout: 60_000 });
  });
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

async function openStyleSection(page: Page): Promise<void> {
  const section = page.locator(SEL.styleSectionLabel).first();
  await expect(section, 'style section should be visible').toBeVisible({ timeout: 10_000 });
  await section.click({ timeout: 10_000 }).catch(async () => section.dispatchEvent('click'));
  const scopedTabs = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}`).first();
  await expect(scopedTabs, 'style tabs should be mounted').toBeAttached({ timeout: 10_000 });
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
  await expect(tabs.first(), 'at least one button style tab should be visible').toBeVisible({ timeout: 15_000 });

  const tabTexts = (await visibleTexts(page, `${SEL.styleTabsContainer} ${SEL.styleTab}`)).map(searchableVisibleText);
  for (const genericQuestionLabel of ['question', 'pregunta', 'domanda']) {
    expect(tabTexts, 'Button style tabs must not expose the generic Question section').not.toContain(
      genericQuestionLabel,
    );
  }

  await openButtonStyleLabelSection(page);
  await expect(page.locator(SEL.buttonLabelInput).first(), 'button visual style section should remain accessible').toBeVisible({
    timeout: 15_000,
  });
  await openButtonIconStyleSection(page);
  await expect(page.locator(SEL.buttonIconNameInput).first(), 'button icon style section should remain accessible').toBeVisible({
    timeout: 15_000,
  });
}

export async function expectFileComponentHasNoNavigationConfigTab(page: Page): Promise<void> {
  await test.step('Assert Import file configuration does not expose Navigation', async () => {
    await openConfigurationSection(page);
    const tabs = await visibleConfigTabs(page);
    await expect(tabs.first(), 'Import file configuration tabs should be visible').toBeVisible({ timeout: 15_000 });

    const visibleTabCount = await tabs.count();
    expect(
      await configTabIndexById(page, 'navigation_tab_selector'),
      `Import file should not expose the empty Navigation tab; visible config tab count is ${visibleTabCount}`,
    ).toBeNull();
    expect(
      visibleTabCount,
      'Import file should expose Data & Interactions, File/Image submissions, and Visibility only',
    ).toBe(3);
  });
}

export async function expectSliderBoundsUseNumberInputs(page: Page): Promise<void> {
  await test.step('Assert Slider Min and Max settings use numeric inputs', async () => {
    await openConfigTabById(page, 'data_interactions');

    const step = page.locator(SEL.sliderStepInput).first();
    await expect(step, 'Slider Data & Interactions should expose the Step setting').toBeVisible({ timeout: 15_000 });
    await expect(step, 'Slider Step is the reference numeric setting').toHaveAttribute('type', 'number', {
      timeout: 15_000,
    });

    for (const [name, selector] of [
      ['Min value', SEL.sliderMinValueInput],
      ['Max value', SEL.sliderMaxValueInput],
    ] as const) {
      const input = page.locator(selector).first();
      await expect(input, `Slider Data & Interactions should expose ${name}`).toBeVisible({ timeout: 15_000 });
      await expect(input, `Slider ${name} should be a native numeric input like Step`).toHaveAttribute('type', 'number', {
        timeout: 15_000,
      });
    }
  });
}

export async function setSliderBoundaryLabels(page: Page, labels: { min: string; max: string }): Promise<void> {
  await test.step('Set Slider boundary labels', async () => {
    await openConfigTabById(page, 'data_interactions');

    const minLabel = page.locator(SEL.sliderMinLabelInput).first();
    await expect(minLabel, 'Slider Data & Interactions should expose Min Label').toBeVisible({ timeout: 15_000 });
    await minLabel.fill(labels.min);
    await minLabel.blur();

    const maxLabel = page.locator(SEL.sliderMaxLabelInput).first();
    await expect(maxLabel, 'Slider Data & Interactions should expose Max Label').toBeVisible({ timeout: 15_000 });
    await maxLabel.fill(labels.max);
    await maxLabel.blur();

    await expect(minLabel, 'Slider Min Label should keep the typed value').toHaveValue(labels.min, { timeout: 15_000 });
    await expect(maxLabel, 'Slider Max Label should keep the typed value').toHaveValue(labels.max, { timeout: 15_000 });
    await page.waitForTimeout(750);
  });
}

export async function expectSliderBoundaryLabelsInConfig(page: Page, labels: { min: string; max: string }): Promise<void> {
  await test.step('Assert Slider boundary labels are available in configuration', async () => {
    await openConfigTabById(page, 'data_interactions');

    await expect(page.locator(SEL.sliderMinLabelInput).first(), 'Slider Min Label should be present').toHaveValue(labels.min, {
      timeout: 15_000,
    });
    await expect(page.locator(SEL.sliderMaxLabelInput).first(), 'Slider Max Label should be present').toHaveValue(labels.max, {
      timeout: 15_000,
    });
  });
}

export async function expectImportFilePreviewOpensDedicatedUploadModal(page: Page): Promise<void> {
  await test.step('Assert Import file preview opens the dedicated upload modal', async () => {
    const modal = await openImportFileUploadModalFromPreview(page);

    const classList = await expect
      .poll(
        () =>
          modal.evaluate((element) => {
            return [...(element as HTMLElement).classList];
          }),
        {
          message: 'Import file preview should open the dedicated file upload modal, not the application import modal',
          timeout: 15_000,
        },
      )
      .toContain('modal-custom-import-file')
      .then(() => modal.evaluate((element) => [...(element as HTMLElement).classList]));

    expect(classList, 'Import file preview must not use the fullscreen application import modal class').not.toContain(
      'alwaysFullScreen',
    );

    const input = modal.locator('input[type="file"]').first();
    await expect(input, 'Import file modal should expose a file chooser input').toBeAttached({ timeout: 10_000 });
    const fileInput = await input.evaluate((element) => {
      const inputElement = element as HTMLInputElement;
      return {
        accept: inputElement.getAttribute('accept') ?? '',
        multiple: inputElement.multiple,
      };
    });
    expect(fileInput.accept, 'Import file modal should not restrict uploads to .c8oforms projects').not.toContain(
      '.c8oforms',
    );

    const modalText = normalizeWhitespace(await modal.innerText({ timeout: 10_000 })).toLowerCase();
    expect(modalText, 'Import file modal should not display .c8oforms project import wording').not.toContain(
      '.c8oforms',
    );
  });
}

export async function expectButtonStyleTabsTranslatedToEnglish(page: Page): Promise<void> {
  await test.step('Assert Button style tabs are translated in English', async () => {
    const container = page.locator(SEL.styleTabsContainer).first();
    await expect(container, 'button style tabs should be visible').toBeVisible({ timeout: 15_000 });
    await expect(
      container.locator(`${SEL.styleTab}:visible`).first(),
      'at least one button style tab should be visible',
    ).toBeVisible({ timeout: 15_000 });

    const tabTexts = await visibleTexts(page, `${SEL.styleTabsContainer} ${SEL.styleTab}`);
    expect(tabTexts, 'Button style tab label should be translated to English').toContain('Button style');
    expect(tabTexts, 'Button icon tab label should be translated to English').toContain('Button icon');
    expect(tabTexts, 'Button style tab should not keep the French hardcoded label').not.toContain('Style du bouton');
    expect(tabTexts, 'Button icon tab should not keep the French hardcoded label').not.toContain('Icone du bouton');
    expect(tabTexts, 'Button icon tab should not keep the French hardcoded label').not.toContain('Icône du bouton');
  });
}

export async function setButtonLabel(page: Page, value: string): Promise<void> {
  await test.step(`Set Button label to ${value}`, async () => {
    await openButtonStyleLabelSection(page);
    const input = page.locator(SEL.buttonLabelInput).first();
    await expect(input, 'button label input should be visible').toBeVisible({ timeout: 15_000 });
    await input.fill(value);
    await input.blur();
    await expect(input, 'button label input should keep the typed value').toHaveValue(value, { timeout: 10_000 });
    await page.waitForTimeout(1_500);
  });
}

export async function setButtonAdvancedRichLabel(
  page: Page,
  content: { boldText: string; italicText: string },
): Promise<void> {
  await test.step('Set Button advanced rich label', async () => {
    await openButtonStyleLabelSection(page);
    await selectButtonDisplayMode(page, 'advanced');

    const editorRoot = page.locator(`${SEL.buttonAdvancedTextEditor}:visible`).first();
    await expect(editorRoot, 'Button advanced mode should expose a TinyMCE HTML editor').toBeVisible({
      timeout: 20_000,
    });
    await expect(
      editorRoot.locator('.tox-tinymce, editor, textarea').first(),
      'Button advanced HTML editor should be mounted',
    ).toBeAttached({ timeout: 20_000 });

    await typeVisibleTinyMceRichContent(page, editorRoot, content);
    await page.keyboard.press('Tab').catch(() => undefined);
    await page.waitForTimeout(1_500);
  });
}

export async function expectButtonRenderedLabel(page: Page, expected: string, surface: 'editor' | 'viewer'): Promise<void> {
  await test.step(`Assert Button label in ${surface}`, async () => {
    const component = page.locator(`${SEL.buttonComponent}:visible`).first();
    await expect(component, `Button component should be visible in ${surface}`).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => renderedButtonText(component), {
        message: `${surface}: Button should render label ${expected}`,
        timeout: 15_000,
      })
      .toContain(expected);
  });
}

export async function expectButtonRenderedHtmlLabel(
  page: Page,
  expected: { texts: string[]; htmlPattern: RegExp },
  surface: 'editor' | 'viewer',
): Promise<void> {
  await test.step(`Assert Button advanced HTML label in ${surface}`, async () => {
    const component = page.locator(`${SEL.buttonComponent}:visible`).first();
    await expect(component, `Button component should be visible in ${surface}`).toBeVisible({ timeout: 30_000 });

    for (const text of expected.texts) {
      await expect
        .poll(() => renderedButtonText(component), {
          message: `${surface}: Button should render text ${text}`,
          timeout: 20_000,
        })
        .toContain(text);
    }

    await expect
      .poll(() => renderedButtonHtml(component), {
        message: `${surface}: Button should render the rich HTML label`,
        timeout: 20_000,
      })
      .toMatch(expected.htmlPattern);
  });
}

async function openButtonStyleLabelSection(page: Page): Promise<void> {
  await openStyleSection(page);
  const input = page.locator(SEL.buttonLabelInput).first();
  const displayModeSwitch = page.locator(`${SEL.buttonDisplayModeSwitch}:visible`).first();
  if (
    (await input.isVisible({ timeout: 1_500 }).catch(() => false)) ||
    (await displayModeSwitch.isVisible({ timeout: 1_500 }).catch(() => false))
  ) {
    return;
  }

  const tabs = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}:visible`);
  await expect(tabs.first(), 'button style tabs should be visible').toBeVisible({ timeout: 15_000 });
  const count = await tabs.count();
  for (let i = 0; i < count; i++) {
    const tab = tabs.nth(i);
    await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
    if (
      (await input.isVisible({ timeout: 1_500 }).catch(() => false)) ||
      (await displayModeSwitch.isVisible({ timeout: 1_500 }).catch(() => false))
    ) {
      return;
    }
  }

  throw new Error(
    `Button label style section did not expose the label input. Visible style tabs: ${(await visibleTexts(page, SEL.styleTab)).join(' | ')}`,
  );
}

async function selectButtonDisplayMode(page: Page, mode: 'normal' | 'advanced'): Promise<void> {
  const switchRoot = page.locator(`${SEL.buttonDisplayModeSwitch}:visible`).first();
  await expect(switchRoot, 'Button style should expose the display mode switch').toBeVisible({ timeout: 15_000 });

  const button = switchRoot.locator('button.c8o-btn:visible').nth(mode === 'advanced' ? 1 : 0);
  await expect(button, `Button display mode ${mode} option should be visible`).toBeVisible({ timeout: 10_000 });
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await expect(button, `Button display mode should be ${mode}`).toHaveClass(/c8o-btn-selected/, { timeout: 10_000 });
  await page.waitForTimeout(800);
}

async function typeVisibleTinyMceRichContent(
  page: Page,
  editorRoot: Locator,
  content: { boldText: string; italicText: string },
): Promise<void> {
  const body = editorRoot.frameLocator('iframe.tox-edit-area__iframe').locator('body');
  await expect(body, 'TinyMCE editable iframe body should be visible').toBeVisible({ timeout: 20_000 });

  await body.click({ timeout: 10_000 });
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');

  await page.keyboard.press('Control+B');
  await page.keyboard.type(content.boldText);
  await page.keyboard.press('Control+B');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.press('Control+I');
  await page.keyboard.type(content.italicText);
  await page.keyboard.press('Control+I');

  for (const fragment of [content.boldText, content.italicText]) {
    await expect
      .poll(() => body.innerText().then(normalizeWhitespace), {
        message: `TinyMCE should contain the typed fragment ${fragment}`,
        timeout: 10_000,
      })
      .toContain(fragment);
  }
}

async function renderedButtonText(component: Locator): Promise<string> {
  return normalizeWhitespace(await component.innerText({ timeout: 2_000 }).catch(() => ''));
}

async function renderedButtonHtml(component: Locator): Promise<string> {
  return component.evaluate((root) => {
    const button =
      root.querySelector('[role="button"]') ??
      root.querySelector('ion-button') ??
      root.querySelector('button') ??
      root;
    return (button as HTMLElement).innerHTML;
  });
}

export async function openButtonIconStyleSection(page: Page): Promise<void> {
  const container = page.locator(SEL.styleTabsContainer).first();
  await expect(container, 'button style tabs should be visible').toBeVisible({ timeout: 15_000 });

  const tabs = container.locator(`${SEL.styleTab}:visible`);
  await expect(tabs.first(), 'at least one button style tab should be visible').toBeVisible({ timeout: 15_000 });

  const count = await tabs.count();
  for (let i = 0; i < count; i++) {
    const tab = tabs.nth(i);
    await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
    if (await firstVisibleLocatorOrNull(page, SEL.buttonIconNameInput, 1_500)) {
      return;
    }
  }

  throw new Error(
    `Button icon style section did not expose the icon name input. Visible style tabs: ${(await visibleTexts(page, SEL.styleTab)).join(' | ')}`,
  );
}

export async function expectButtonDefaultIconName(page: Page, expectedIcon = 'bulb'): Promise<void> {
  await test.step(`Assert Button default icon is ${expectedIcon}`, async () => {
    await openButtonIconStyleSection(page);
    await expect(
      page.locator(SEL.buttonIconNameInput).first(),
      `new Button components should default to the available ${expectedIcon} icon`,
    ).toHaveValue(expectedIcon, { timeout: 15_000 });
  });
}

export async function clearButtonIcon(page: Page): Promise<void> {
  await test.step('Clear Button icon', async () => {
    await openButtonIconStyleSection(page);
    const clearButton = page.locator(SEL.buttonIconClearButton).first();
    await expect(
      clearButton,
      'Button icon section should expose a clear control so the button can be text-only',
    ).toBeVisible({ timeout: 10_000 });
    await clearButton.click({ timeout: 10_000 }).catch(async () => clearButton.dispatchEvent('click'));
    await expect(page.locator(SEL.buttonIconNameInput).first(), 'button icon name should be cleared').toHaveValue('', {
      timeout: 15_000,
    });
  });
}

export async function expectButtonRenderedWithoutIcon(page: Page): Promise<void> {
  await test.step('Assert Button renders without an icon', async () => {
    await expect(
      page.locator(SEL.buttonRenderedIcon),
      'a text-only Button should not render an icon in the editor canvas',
    ).toHaveCount(0, { timeout: 15_000 });
  });
}

export async function expectRenderedButtonEnabled(page: Page, enabled: boolean, surface = 'viewer'): Promise<void> {
  const button = page.locator(`${SEL.buttonComponent}:visible ion-button:visible, ${SEL.buttonComponent}:visible [role="button"]:visible`).first();
  await expect(button, `${surface} Button should remain visible`).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(() => renderedButtonDisabled(button), {
      message: `${surface} Button should be ${enabled ? 'enabled' : 'disabled'}`,
      timeout: 15_000,
    })
    .toBe(!enabled);
}

async function renderedButtonDisabled(button: Locator): Promise<boolean> {
  return button.evaluate((element) => {
    const host = element as HTMLElement & { disabled?: unknown; shadowRoot?: ShadowRoot | null };
    const shadowButton = host.shadowRoot?.querySelector('button') as HTMLButtonElement | null;
    return (
      host.hasAttribute('disabled') ||
      host.getAttribute('aria-disabled') === 'true' ||
      host.classList.contains('button-disabled') ||
      host.disabled === true ||
      shadowButton?.disabled === true ||
      shadowButton?.getAttribute('aria-disabled') === 'true'
    );
  });
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
  button_state_tab_selector: ['state', 'etat', 'estado', 'stato'],
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
    case 'button_state_tab_selector':
      return visibleTabCount === 4 ? 1 : null;
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
  const closeButton = page.locator(`${SEL.configClose}:visible`).first();
  if (await closeButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await closeButton.click({ timeout: 5_000 }).catch(async () => closeButton.dispatchEvent('click'));
    if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeButton.dispatchEvent('click').catch(() => undefined);
    }
  } else {
    const genericCloseButton = page.locator('.c8o-btn-close:visible, button.c8o-btn-close:visible').last();
    if (await genericCloseButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await genericCloseButton.click({ timeout: 5_000 }).catch(async () => genericCloseButton.dispatchEvent('click'));
    }
  }

  await expect
    .poll(() => page.locator(`${SEL.configClose}:visible`).count(), {
      message: 'component configuration close button should disappear after closing the panel',
      timeout: 15_000,
    })
    .toBe(0);
}

export async function deleteOpenComponent(page: Page): Promise<void> {
  await test.step('Delete the currently opened component through the configuration panel', async () => {
    const del = page.locator(`${SEL.componentDeleteButton}:visible`).first();
    await expect(del, 'component delete button should be visible').toBeVisible({ timeout: 10_000 });
    await del.click({ timeout: 5_000 }).catch(async () => del.dispatchEvent('click'));

    const confirm = page.locator(SEL.confirmDeleteYesButton).last();
    await expect(confirm, 'component delete confirmation should be visible').toBeVisible({ timeout: 10_000 });
    await confirm.click({ timeout: 5_000 }).catch(async () => confirm.dispatchEvent('click'));
    await page.waitForTimeout(1_500);
  });
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
  allowLegacySourceSummaryMissing?: boolean;
}

export interface BaserowSelectSourceOptions extends BaserowGridSourceOptions {
  displayColumn: string;
  valueColumn: string;
}

export interface BaserowChartSourceOptions extends BaserowGridSourceOptions {
  categoryColumn: string;
  valueColumns: string[];
}

export interface BaserowMapSourceOptions extends BaserowGridSourceOptions {
  titleColumn: string;
  latitudeColumn: string;
  longitudeColumn: string;
}

export type DataSourceSortOrder = 'asc' | 'desc';

export interface DataSourceSortOptions {
  column: string;
  order?: DataSourceSortOrder;
}

export type DataSourceFilterOperator =
  | 'equal'
  | 'not_equal'
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

export interface DataSourceFilterMonacoPaletteOptions {
  column?: string;
  operator?: DataSourceFilterOperator;
  sourceSection: SourcePaletteSection;
  sourceLabel: string;
  expectedCode: string;
}

export interface DataSourceFilterTextValueOptions {
  column: string;
  operator?: DataSourceFilterOperator;
  value: string;
}

export interface MonacoDropPayload extends SourcePaletteDragPayload {
  internalData: string;
}

export interface BaserowAddRowActionConfigOptions extends BaserowGridSourceOptions {
  flowName?: string | RegExp;
}

export interface BaserowAddRowActionOptions extends BaserowAddRowActionConfigOptions {
  mappings: Array<{
    column: string;
    sourceSection?: SourcePaletteSection;
    sourceLabel: string;
  }>;
}

export type MailActionVariable = 'to' | 'subject' | 'body' | 'summary';

const SELECT_SOURCE_TABLE_PICKER_BUTTON = SEL.dataSourceConfigureButton;
const BASEROW_ACTION_VARIABLE_ROW = 'ion-item.class1743090805947';
const BASEROW_ACTION_VARIABLE_INPUT = `${BASEROW_ACTION_VARIABLE_ROW} input`;
const BASEROW_ACTION_VARIABLE_BUTTON = 'c8oforms-button_variable.class1775996201011 button.class1775995541940';
const BASEROW_ACTION_SOURCE_PALETTE_BUTTON = 'ion-button.class1776001071909';
const MAIL_ACTION_VARIABLE_BUTTON = 'button.figma-button.class1775995541940';
const MAIL_ACTION_VARIABLE_INDEX: Record<MailActionVariable, number> = {
  to: 0,
  subject: 4,
  body: 5,
  summary: 7,
};
const MAIL_ACTION_SUMMARY_CHECKBOX = 'ion-checkbox.class1734434873771';
const MAIL_ACTION_PICKER_BUTTON = `c8oforms-datasourcebutton:has(img[src*="${PALETTE_ICON.mailAction}"])`;
const SOURCE_PALETTE_ROOT = `${SEL.sourcePalette}, .class1776003235786`;
const SOURCE_PALETTE_ROOT_VISIBLE = `${SEL.sourcePalette}:visible, .class1776003235786:visible`;
const SELECT_SOURCE_COLUMN_ROW = 'ion-item.class1776161384798';
const SELECT_SOURCE_DISPLAY_COLUMN_CHECKBOX = 'ion-checkbox.class1776352302823';
const SELECT_SOURCE_VALUE_COLUMN_CHECKBOX = 'ion-checkbox.class1776352314668';
const CHART_SOURCE_ROLE_CHECKBOX = 'ion-checkbox.modal-configure-role-checkbox';
const MAP_SOURCE_ROLE_CHECKBOX = 'ion-checkbox.modal-configure-role-checkbox';
const DATA_SOURCE_EDITOR_ACTION_BUTTON = 'button.class1775995541940';
const DATA_SOURCE_FILTER_ACTION_INDEX = 1;
const DATA_SOURCE_FILTER_ADD_BUTTON = 'ion-button.class1758191882601';
const DATA_SOURCE_FILTER_FIELD_INPUT = '.class1758189195703 input';
const DATA_SOURCE_FILTER_FIELD_BROWSE_BUTTON = 'ion-button.class1758189195718';
const DATA_SOURCE_FILTER_OPERATOR_SELECT = 'ion-select.class1758189195757';
const DATA_SOURCE_SORT_ACTION_INDEX = 2;
const DATA_SOURCE_SORT_ADD_FIELD_BUTTON = 'ion-button.class1758273392231';
const DATA_SOURCE_SORT_ASC_BUTTON = '.class1758275049219';
const DATA_SOURCE_SORT_DESC_BUTTON = '.class1758275831002';
const SOURCE_SELECT_TRIGGER = 'ion-item.class1648542300891';
const SOURCE_SELECT_DROPDOWN = '.class1599133954837';

export async function configureGridBaserowSource(page: Page, source: BaserowGridSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await page.locator('.class1775835275863').first().click();
  await openConfigTabById(page, 'tab_selector_choice_source');

  await activateDataSourceMode(page);
  await selectDataSourceEntry(page, pickerTimeout, 'getData');
  await configureGridBaserowTable(page, source, pickerTimeout);
}

export async function configureGridBaserowTable(
  page: Page,
  source: BaserowGridSourceOptions,
  pickerTimeout = 60_000,
): Promise<void> {
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
  if (source.allowLegacySourceSummaryMissing && !(await sourceSummary.isVisible({ timeout: 5_000 }).catch(() => false))) {
    await expect(
      page.locator(`${DATA_SOURCE_EDITOR_ACTION_BUTTON}:visible`).first(),
      'the legacy data source configuration should return to the action list after saving the table',
    ).toBeVisible({ timeout: 15_000 });
    return;
  }
  await expect(sourceSummary).toContainText(source.table, { timeout: pickerTimeout });
  for (const column of source.expectedColumns ?? []) {
    await expect(sourceSummary, `Baserow source summary should contain ${column}`).toContainText(column, {
      timeout: pickerTimeout,
    });
  }
}

export async function configureChartBaserowSource(page: Page, source: BaserowChartSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await test.step(`Configure Chart Baserow source ${source.table}`, async () => {
    await acceptRgpdIfVisible(page);
    const configurationSection = page.locator('.class1775835275863').first();
    if (await configurationSection.isVisible().catch(() => false)) {
      await configurationSection.click();
    }

    await openConfigTabById(page, 'tab_selector_choice_source');
    await selectDataSourceEntry(page, pickerTimeout, 'getData');

    await openConfigTabById(page, 'tab_selector_conf_source');
    await acceptRgpdIfVisible(page);
    await clickFirstVisible(page, SEL.dataSourceConfigureButton, 'Chart Baserow table configure button', pickerTimeout, true);

    const tablePicker = page.locator('ion-modal').last();
    await expect(tablePicker, 'Chart Baserow table picker should be visible').toBeVisible({ timeout: pickerTimeout });
    await expect(tablePicker.getByText(source.workspace, { exact: true })).toBeVisible({ timeout: pickerTimeout });
    await tablePicker.getByText(source.workspace, { exact: true }).click();
    await expect(tablePicker.getByText(source.database, { exact: true })).toBeVisible({ timeout: pickerTimeout });
    await tablePicker.getByText(source.database, { exact: true }).click();
    await expect(tablePicker.getByText(source.table, { exact: true })).toBeVisible({ timeout: pickerTimeout });
    await tablePicker.getByText(source.table, { exact: true }).click();

    await expect(tablePicker.locator('.class1776246576145')).toContainText(source.table, { timeout: pickerTimeout });
    const columns = source.expectedColumns ?? [source.categoryColumn, ...source.valueColumns];
    for (const column of columns) {
      await expect(tablePicker.locator('.class1776267952308'), `Baserow column ${column} should be selectable`).toContainText(
        column,
        { timeout: pickerTimeout },
      );
    }

    await setChartSourceColumnRole(tablePicker, 'category', source.categoryColumn, true);
    for (const column of columns) {
      await setChartSourceColumnRole(tablePicker, 'value', column, source.valueColumns.includes(column));
    }

    await expect
      .poll(() => checkedChartBaserowColumns(tablePicker, columns), {
        message: 'Chart Baserow roles should be selected through the Category/Value checkboxes',
        timeout: 10_000,
      })
      .toEqual({ category: [source.categoryColumn], value: source.valueColumns });

    await acceptRgpdIfVisible(page);
    await tablePicker.locator('ion-button.class1776244653366').click();
    await expect(tablePicker).toBeHidden({ timeout: pickerTimeout });
    await page.waitForTimeout(1_500);

    const sourceSummary = page.locator('.class1776013865512').first();
    await expect(sourceSummary).toContainText(source.table, { timeout: pickerTimeout });
    for (const column of [source.categoryColumn, ...source.valueColumns]) {
      await expect(sourceSummary, `Baserow source summary should contain ${column}`).toContainText(column, {
        timeout: pickerTimeout,
      });
    }
  });
}

export async function expectChartBaserowSourceRoles(page: Page, source: BaserowChartSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await test.step('Assert Chart Baserow Category/Value roles persist', async () => {
    await openConfigTabById(page, 'tab_selector_conf_source');
    await acceptRgpdIfVisible(page);
    await clickFirstVisible(page, SEL.dataSourceConfigureButton, 'Chart Baserow table configure button', pickerTimeout, true);

    const tablePicker = page.locator('ion-modal').last();
    await expect(tablePicker, 'Chart Baserow table picker should reopen').toBeVisible({ timeout: pickerTimeout });
    await expect(tablePicker.locator('.class1776246576145')).toContainText(source.table, { timeout: pickerTimeout });

    const columns = source.expectedColumns ?? [source.categoryColumn, ...source.valueColumns];
    for (const column of columns) {
      await expect(selectSourceColumnRow(tablePicker, column), `Baserow column ${column} should be visible on reopen`).toBeVisible({
        timeout: 15_000,
      });
    }
    await expect
      .poll(() => checkedChartBaserowColumns(tablePicker, columns), {
        message: 'reopened Chart source should keep the selected Category/Value roles',
        timeout: 10_000,
      })
      .toEqual({ category: [source.categoryColumn], value: source.valueColumns });

    await tablePicker.locator('ion-button.class1776244653366').click();
    await expect(tablePicker).toBeHidden({ timeout: pickerTimeout });
    await page.waitForTimeout(1_000);
  });
}

export async function configureMapBaserowSource(page: Page, source: BaserowMapSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await test.step(`Configure Map Baserow source ${source.table}`, async () => {
    await openConfigurationSection(page);
    const hasDedicatedSourceSelectionTab = await tryOpenConfigTabById(page, 'tab_selector_choice_source');
    if (!hasDedicatedSourceSelectionTab) {
      await openConfigTabById(page, 'tab_selector_conf_source');
    }
    await activateMapDataSourceMode(page);
    await selectDataSourceEntry(page, pickerTimeout, 'getData');

    await openConfigTabById(page, 'tab_selector_conf_source');
    await acceptRgpdIfVisible(page);
    await clickFirstVisible(page, SEL.dataSourceConfigureButton, 'Map Baserow table configure button', pickerTimeout, true);

    const tablePicker = page.locator('ion-modal').last();
    await expect(tablePicker, 'Map Baserow table picker should be visible').toBeVisible({ timeout: pickerTimeout });
    await expect(tablePicker.getByText(source.workspace, { exact: true })).toBeVisible({ timeout: pickerTimeout });
    await tablePicker.getByText(source.workspace, { exact: true }).click();
    await expect(tablePicker.getByText(source.database, { exact: true })).toBeVisible({ timeout: pickerTimeout });
    await tablePicker.getByText(source.database, { exact: true }).click();
    await expect(tablePicker.getByText(source.table, { exact: true })).toBeVisible({ timeout: pickerTimeout });
    await tablePicker.getByText(source.table, { exact: true }).click();

    await expect(tablePicker.locator('.class1776246576145')).toContainText(source.table, { timeout: pickerTimeout });
    const columns = source.expectedColumns ?? [source.titleColumn, source.latitudeColumn, source.longitudeColumn];
    for (const column of columns) {
      await expect(tablePicker.locator('.class1776267952308'), `Baserow column ${column} should be selectable`).toContainText(
        column,
        { timeout: pickerTimeout },
      );
    }

    await setMapSourceColumnRole(tablePicker, 'title', source.titleColumn, true);
    await setMapSourceColumnRole(tablePicker, 'latitude', source.latitudeColumn, true);
    await setMapSourceColumnRole(tablePicker, 'longitude', source.longitudeColumn, true);

    await expect
      .poll(() => checkedMapBaserowColumns(tablePicker, columns), {
        message: 'Map Baserow roles should be selected through the Latitude/Longitude/Label checkboxes',
        timeout: 10_000,
      })
      .toEqual({
        title: [source.titleColumn],
        latitude: [source.latitudeColumn],
        longitude: [source.longitudeColumn],
      });

    await acceptRgpdIfVisible(page);
    await tablePicker.locator('ion-button.class1776244653366').click();
    await expect(tablePicker).toBeHidden({ timeout: pickerTimeout });
    await page.waitForTimeout(1_500);

    const sourceSummary = page.locator('.class1776013865512').first();
    await expect(sourceSummary).toContainText(source.table, { timeout: pickerTimeout });
    for (const column of [source.titleColumn, source.latitudeColumn, source.longitudeColumn]) {
      await expect(sourceSummary, `Map Baserow source summary should contain ${column}`).toContainText(column, {
        timeout: pickerTimeout,
      });
    }
  });
}

export async function expectMapBaserowSourceRoles(page: Page, source: BaserowMapSourceOptions): Promise<void> {
  const pickerTimeout = 60_000;
  await test.step('Assert Map Baserow Latitude/Longitude roles persist', async () => {
    await openConfigTabById(page, 'tab_selector_conf_source');
    await acceptRgpdIfVisible(page);
    await clickFirstVisible(page, SEL.dataSourceConfigureButton, 'Map Baserow table configure button', pickerTimeout, true);

    const tablePicker = page.locator('ion-modal').last();
    await expect(tablePicker, 'Map Baserow table picker should reopen').toBeVisible({ timeout: pickerTimeout });
    await expect(tablePicker.locator('.class1776246576145')).toContainText(source.table, { timeout: pickerTimeout });

    const columns = source.expectedColumns ?? [source.titleColumn, source.latitudeColumn, source.longitudeColumn];
    for (const column of columns) {
      await expect(selectSourceColumnRow(tablePicker, column), `Baserow column ${column} should be visible on reopen`).toBeVisible({
        timeout: 15_000,
      });
    }

    await expect
      .poll(() => checkedMapBaserowColumns(tablePicker, columns), {
        message: 'reopened Map source should keep the selected Latitude/Longitude/Label roles',
        timeout: 10_000,
      })
      .toEqual({
        title: [source.titleColumn],
        latitude: [source.latitudeColumn],
        longitude: [source.longitudeColumn],
      });

    await tablePicker.locator('ion-button.class1776244653366').click();
    await expect(tablePicker).toBeHidden({ timeout: pickerTimeout });
    await page.waitForTimeout(1_000);
  });
}

async function tryOpenConfigTabById(page: Page, tabId: MainEditorConfigTab): Promise<boolean> {
  try {
    await openConfigTabById(page, tabId);
    return true;
  } catch (error) {
    if (String((error as Error | undefined)?.message ?? error).includes('No visible config tab matches id')) {
      return false;
    }
    throw error;
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

export async function openMapDataSourcePicker(page: Page): Promise<Locator> {
  return test.step('Open the Map data source picker', async () => {
    await openConfigurationSection(page);
    await openConfigTabById(page, 'tab_selector_choice_source');
    await activateMapDataSourceMode(page);

    const sourceButton = await firstVisibleLocator(page, SEL.dataSourceSelectButton, 'Map data source selection button', 15_000);
    await sourceButton.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
    await sourceButton.click({ timeout: 10_000 }).catch(async () => sourceButton.dispatchEvent('click'));

    const sourcePicker = page.locator('ion-modal:visible').last();
    await expect(sourcePicker, 'Map source selection panel should open').toBeVisible({ timeout: 15_000 });
    return sourcePicker;
  });
}

async function activateMapDataSourceMode(page: Page): Promise<void> {
  const sourceModeButtons = page.locator(`${SEL.mapSourceModeRow}:visible button.c8o-btn:visible`);
  await expect(sourceModeButtons.first(), 'Map source mode toggle should be visible').toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => sourceModeButtons.count(), {
      message: 'Map source mode toggle should expose local and data-source choices',
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(2);

  const dataSourceButton = sourceModeButtons.nth(1);
  await dataSourceButton.click({ timeout: 10_000 }).catch(async () => dataSourceButton.dispatchEvent('click'));
  await expect(dataSourceButton, 'Map source mode should switch to data source').toHaveClass(/c8o-btn-selected/, {
    timeout: 10_000,
  });
}

export async function openGridFormattingTab(page: Page): Promise<void> {
  await test.step('Open the Data Grid formatting configuration tab', async () => {
    await openStyleSection(page);
    const tabs = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}:visible`);
    await expect(tabs.first(), 'Data Grid style tabs should be visible').toBeVisible({ timeout: 15_000 });

    const count = await tabs.count();
    for (let index = 0; index < count; index++) {
      const tab = tabs.nth(index);
      await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
      await page.waitForTimeout(350);
      const footerVisible = await page.locator(`${SEL.gridFooterSetting}:visible`).first().isVisible({ timeout: 1_000 }).catch(() => false);
      const paginationVisible = await page
        .locator(`${SEL.gridPaginationSetting}:visible`)
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false);
      if (footerVisible && paginationVisible) {
        return;
      }
    }

    throw new Error(`Data Grid formatting controls were not found. Visible style tabs: ${(await visibleTexts(page, SEL.styleTab)).join(' | ')}`);
  });
}

export async function expectGridFooterAndPaginationSettings(page: Page): Promise<void> {
  await test.step('Assert Data Grid footer and pagination settings are available', async () => {
    await expectGridToggleButtonCount(page, SEL.gridFooterSetting, 2, 'Grid footer setting');
    await expectGridToggleButtonCount(page, SEL.gridPaginationSetting, 2, 'Grid pagination setting');
    await expect(page.locator(`${SEL.gridRowsPerPageSetting}:visible`).first(), 'Rows per page setting should be visible').toBeVisible({
      timeout: 15_000,
    });
    const rowsInput = page.locator(`${SEL.gridRowsPerPageSetting} input:visible`).first();
    await expect(rowsInput, 'Rows per page input should be numeric').toHaveAttribute('type', 'number', { timeout: 10_000 });
    await expect(rowsInput, 'Rows per page input should enforce a positive minimum').toHaveAttribute('min', '1', {
      timeout: 10_000,
    });
  });
}

export async function setGridFooterEnabled(page: Page, enabled: boolean): Promise<void> {
  await clickGridSettingButton(page, SEL.gridFooterSetting, enabled ? 1 : 0, `Grid footer ${enabled ? 'enabled' : 'disabled'}`);
}

export async function setGridPaginationMode(page: Page, mode: GridPaginationMode): Promise<void> {
  await clickGridSettingButton(page, SEL.gridPaginationSetting, mode === 'paginated' ? 1 : 0, `Grid pagination ${mode}`);
}

export async function setGridRowsPerPage(page: Page, value: string): Promise<void> {
  const input = page.locator(`${SEL.gridRowsPerPageSetting} input:visible`).first();
  await expect(input, 'Rows per page input should be visible before editing').toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.blur();
  await expect(input, 'Rows per page input should keep the configured value').toHaveValue(value, { timeout: 15_000 });
}

export async function expectGridRowsPerPageValue(page: Page, value: string): Promise<void> {
  const input = page.locator(`${SEL.gridRowsPerPageSetting} input:visible`).first();
  await expect(input, 'Rows per page input should be visible').toBeVisible({ timeout: 15_000 });
  await expect(input, `Rows per page input should contain ${value}`).toHaveValue(value, { timeout: 15_000 });
}

export async function expectGridRowsPerPageVisible(page: Page, visible: boolean): Promise<void> {
  const row = page.locator(`${SEL.gridRowsPerPageSetting}:visible`);
  if (visible) {
    await expect(row.first(), 'Rows per page setting should be visible when pagination is enabled').toBeVisible({
      timeout: 15_000,
    });
  } else {
    await expect(row, 'Rows per page setting should be hidden when all rows are displayed').toHaveCount(0, {
      timeout: 15_000,
    });
  }
}

async function expectGridToggleButtonCount(
  page: Page,
  settingSelector: string,
  expected: number,
  description: string,
): Promise<void> {
  await expect(
    page.locator(`${settingSelector}:visible button.c8o-btn:visible`),
    `${description} should expose ${expected} mode buttons`,
  ).toHaveCount(expected, { timeout: 15_000 });
}

async function clickGridSettingButton(page: Page, settingSelector: string, index: number, description: string): Promise<void> {
  const buttons = page.locator(`${settingSelector}:visible button.c8o-btn:visible`);
  await expect(buttons, `${description} buttons should be visible`).toHaveCount(2, { timeout: 15_000 });
  const button = buttons.nth(index);
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await expect(button, `${description} button should be selected`).toHaveClass(/c8o-btn-selected/, { timeout: 15_000 });
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

export async function openDataSourceFilterPanel(page: Page): Promise<void> {
  await test.step('Open the data source Filter panel', async () => {
    const actions = page.locator(`${DATA_SOURCE_EDITOR_ACTION_BUTTON}:visible`);
    const filterAction = actions.nth(DATA_SOURCE_FILTER_ACTION_INDEX);
    await expect(filterAction, 'the data source Filter action should be visible').toBeVisible({ timeout: 15_000 });
    await filterAction.click({ timeout: 10_000 }).catch(async () => filterAction.dispatchEvent('click'));
    await expect(filterAction, 'the data source Filter action should be selected').toHaveClass(/figma-button--selected/, {
      timeout: 10_000,
    });
  });
}

export async function configureDataSourceFilterMonacoPaletteValue(
  page: Page,
  options: DataSourceFilterMonacoPaletteOptions,
): Promise<MonacoDropPayload> {
  const stepLabel = options.column
    ? `Configure data source filter ${options.column} from the Source Palette`
    : 'Configure a data source filter Monaco value from the Source Palette';
  return test.step(stepLabel, async () => {
    await openDataSourceFilterPanel(page);
    await addDataSourceFilterRow(page);
    if (options.column) {
      await selectDataSourceFilterField(page, options.column);
      await setDataSourceFilterOperator(page, options.operator ?? 'equal');
    }
    await switchDataSourceFilterValueToJavaScript(page);
    return dropSourcePaletteEntryIntoVisibleMonaco(page, options.sourceSection, options.sourceLabel, options.expectedCode);
  });
}

export async function configureDataSourceFilterTextValue(
  page: Page,
  options: DataSourceFilterTextValueOptions,
): Promise<void> {
  await test.step(`Configure data source filter ${options.column} text value`, async () => {
    await openDataSourceFilterPanel(page);
    await addDataSourceFilterRow(page);
    await selectDataSourceFilterField(page, options.column);
    await setDataSourceFilterOperator(page, options.operator ?? 'equal');
    await fillVisibilityValueTextEditor(page, options.value);
    await expectVisibilityValueTextEditorToContain(page, options.value);
  });
}

async function addDataSourceFilterRow(page: Page): Promise<void> {
  const addFilter = page.locator(`c8oforms-datasourceeditor ${DATA_SOURCE_FILTER_ADD_BUTTON}:visible`).last();
  await expect(addFilter, 'the data source Filter add-row button should be visible').toBeVisible({ timeout: 15_000 });
  await addFilter.click({ timeout: 10_000 }).catch(async () => addFilter.dispatchEvent('click'));
  await expect(
    page.locator(`c8oforms-datasourceeditor ${DATA_SOURCE_FILTER_FIELD_BROWSE_BUTTON}:visible`).last(),
    'the data source Filter field picker button should appear',
  ).toBeVisible({ timeout: 15_000 });
}

async function selectDataSourceFilterField(page: Page, column: string): Promise<void> {
  const fieldButton = page.locator(`c8oforms-datasourceeditor ${DATA_SOURCE_FILTER_FIELD_BROWSE_BUTTON}:visible`).last();
  await expect(fieldButton, 'the data source Filter field picker button should be visible').toBeVisible({ timeout: 15_000 });
  await fieldButton.click({ timeout: 10_000 }).catch(async () => fieldButton.dispatchEvent('click'));

  const popover = sourceCompletionPopover(page);
  await expect(popover, 'the data source Filter field picker should open').toBeVisible({ timeout: 15_000 });
  const option = popover.locator('ion-item').filter({ hasText: column }).first();
  await expect(option, `the data source Filter field ${column} should be selectable`).toBeVisible({ timeout: 15_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));

  await expect(
    page.locator(`c8oforms-datasourceeditor ${DATA_SOURCE_FILTER_FIELD_INPUT}:visible`).last(),
    `the data source Filter field should be ${column}`,
  ).toHaveValue(column, { timeout: 15_000 });
}

async function setDataSourceFilterOperator(page: Page, operator: DataSourceFilterOperator): Promise<void> {
  const select = page.locator(`c8oforms-datasourceeditor ${DATA_SOURCE_FILTER_OPERATOR_SELECT}:visible`).last();
  await expect(select, 'the data source Filter operator selector should be visible').toBeVisible({ timeout: 15_000 });
  const optionState = await select.evaluate((el, op) => {
    const values = Array.from(el.querySelectorAll('ion-select-option')).map((option) =>
      String((option as HTMLOptionElement & { value?: string }).value ?? ''),
    );
    return { index: values.indexOf(op), values };
  }, operator);
  if (optionState.index < 0) {
    throw new Error(`unknown data source Filter operator ${operator}; available operators: ${optionState.values.join(', ')}`);
  }

  await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
  const items = page.locator('ion-select-popover ion-item');
  await items.first().waitFor({ state: 'visible', timeout: 10_000 });
  await items.nth(optionState.index).click({ timeout: 10_000 }).catch(async () => items.nth(optionState.index).dispatchEvent('click'));
  await expect
    .poll(() => select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
      message: `data source Filter operator should be ${operator}`,
      timeout: 10_000,
    })
    .toBe(operator);
}

async function switchDataSourceFilterValueToJavaScript(page: Page): Promise<void> {
  const jsButton = page
    .locator('c8oforms-datasourceeditor ion-button:visible')
    .filter({ has: page.locator('ion-icon[name="logo-javascript"]') })
    .last();
  await expect(jsButton, 'the data source Filter JavaScript value button should be visible').toBeVisible({ timeout: 15_000 });
  await jsButton.click({ timeout: 10_000 }).catch(async () => jsButton.dispatchEvent('click'));

  const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
  if (await alert.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await alert.locator('button').last().click({ timeout: 10_000 }).catch(async () => alert.locator('button').last().dispatchEvent('click'));
  }
  await visibleMonacoEditor(page, 'data source Filter JavaScript value editor');
}

export async function configureDataSourceSort(page: Page, options: DataSourceSortOptions): Promise<void> {
  await test.step(`Configure data source sort by ${options.column}`, async () => {
    await openDataSourceSortPanel(page);

    const addSortField = page.locator(`${DATA_SOURCE_SORT_ADD_FIELD_BUTTON}:visible`).last();
    await expect(addSortField, 'the data source Sort add-field button should be visible').toBeVisible({ timeout: 15_000 });
    await addSortField.click({ timeout: 10_000 }).catch(async () => addSortField.dispatchEvent('click'));

    const popover = page.locator('ion-popover:not(.overlay-hidden)').last();
    await expect(popover, 'the sort column picker should open').toBeVisible({ timeout: 15_000 });
    await popover.locator('ion-searchbar input').fill(options.column);

    const columnOption = popover.locator('ion-item').filter({ hasText: options.column }).first();
    await expect(columnOption, `the sort column ${options.column} should be listed`).toBeVisible({ timeout: 15_000 });
    await columnOption.click({ timeout: 10_000 }).catch(async () => columnOption.dispatchEvent('click'));

    await expect
      .poll(() => visibleInputValues(page), {
        message: `the data source Sort panel should keep ${options.column}`,
        timeout: 15_000,
      })
      .toContain(options.column);

    const orderButtonSelector = (options.order ?? 'asc') === 'desc' ? DATA_SOURCE_SORT_DESC_BUTTON : DATA_SOURCE_SORT_ASC_BUTTON;
    const orderButton = page.locator(`${orderButtonSelector}:visible`).first();
    await expect(orderButton, 'the data source Sort order button should be visible').toBeVisible({ timeout: 15_000 });
    await orderButton.click({ timeout: 10_000 }).catch(async () => orderButton.dispatchEvent('click'));
    await page.waitForTimeout(1_000);
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

export async function setGridReturnedValueToRowSelected(page: Page): Promise<void> {
  await test.step('Set Data Grid returned value to selected row', async () => {
    await openConfigTabById(page, 'data_interactions');
    const returnedValue = page.locator('.class1775842589999');
    const select = returnedValue.locator('ion-select').first();
    if (await select.isVisible({ timeout: 1_000 }).catch(() => false)) {
      const optionIndex = await select.evaluate((el) =>
        Array.from(el.querySelectorAll('ion-select-option')).findIndex(
          (option) => (option as HTMLOptionElement & { value?: string }).value === 'row_selected',
        ),
      );
      expect(optionIndex, 'row_selected option should exist').toBeGreaterThanOrEqual(0);
      await select.click();
      await page.locator('ion-select-popover ion-item').nth(optionIndex).click();
      await expect
        .poll(() => select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
          message: 'grid returned value should be row_selected',
          timeout: 10_000,
        })
        .toBe('row_selected');
      return;
    }

    const returnedValueButtons = returnedValue.locator('button.class1776074264497:visible');
    await expect(returnedValueButtons.nth(2), 'grid returned value row_selected button should be visible').toBeVisible({
      timeout: 10_000,
    });
    const rowSelectedButton = returnedValueButtons.nth(2);
    await rowSelectedButton.click({ timeout: 10_000 }).catch(async () => rowSelectedButton.dispatchEvent('click'));
    await expect
      .poll(() => rowSelectedButton.evaluate((el) => el.classList.contains('c8o-btn-selected')), {
        message: 'grid returned value should be row_selected',
        timeout: 10_000,
      })
      .toBe(true);
  });
}

export async function selectTinyMcePathBadgeTreeValue(page: Page, label: string, expectedPath: string): Promise<void> {
  await test.step(`Select ${label} from the TinyMCE path badge tree`, async () => {
    await clickTinyMcePathBadgeEditButton(page);

    const treeview = page.locator('ion-modal.modalCSV').last();
    await expect(treeview, 'source tree modal should be visible').toBeVisible({ timeout: 15_000 });
    await expect(treeview.getByText(label, { exact: true }), `source tree label ${label} should be visible`).toBeVisible({
      timeout: 45_000,
    });

    await clickChooseButtonForTreeLabel(page, label);
    await acceptRgpdIfVisible(page, 500);
    await expect(treeview, 'source tree modal should close after choosing a value').toBeHidden({ timeout: 15_000 });
    await expectTinyMcePathBadge(page, expectedPath);
  });
}

export async function expectTinyMcePathBadge(page: Page, expectedPath: string): Promise<void> {
  await expect
    .poll(() => tinyMcePathBadgePaths(page), {
      message: `TinyMCE editor should contain path badge ${expectedPath}`,
      timeout: 10_000,
    })
    .toContain(expectedPath);
}

export async function sourceSelectVisibleOptions(
  page: Page,
  expectedOptions: string[],
  forbiddenOptions: string[] = [],
): Promise<string[]> {
  return test.step('Read visible source Select options', async () => {
    if (expectedOptions.length === 0) {
      throw new Error('sourceSelectVisibleOptions needs at least one expected option');
    }

    const select = page.locator(SEL.selectComponent).first();
    await expect(select, 'the source Select should render in Preview').toBeVisible({ timeout: 30_000 });

    const trigger = select.locator(`${SOURCE_SELECT_TRIGGER}, button`).first();
    await expect(trigger, 'the source Select trigger should be visible').toBeVisible({ timeout: 15_000 });
    await clickLocatorCenterWithMouse(page, trigger, 'source Select trigger');

    const dropdown = page
      .locator(`${SOURCE_SELECT_DROPDOWN}:visible, cdk-virtual-scroll-viewport:visible`)
      .filter({ hasText: expectedOptions[0] })
      .last();
    await expect(dropdown, 'the source Select dropdown should open with source data').toBeVisible({ timeout: 30_000 });
    for (const option of expectedOptions) {
      await expect(dropdown, `the source Select dropdown should include ${option}`).toContainText(option, { timeout: 30_000 });
    }
    for (const option of forbiddenOptions) {
      await expect(dropdown, `the source Select dropdown should not include ${option}`).not.toContainText(option, {
        timeout: 5_000,
      });
    }

    return dropdown.evaluate((root, expected) => {
      const expectedSet = new Set(expected as string[]);
      const seen = new Set<string>();
      const out: string[] = [];
      for (const element of root.querySelectorAll<HTMLElement>('ion-item, [role="option"], button, div')) {
        const text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
        if (expectedSet.has(text) && !seen.has(text)) {
          seen.add(text);
          out.push(text);
        }
      }
      return out;
    }, expectedOptions);
  });
}

async function visibleInputValues(page: Page): Promise<string[]> {
  return page
    .locator('input:visible')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value || '').filter(Boolean));
}

async function clickLocatorCenterWithMouse(page: Page, locator: Locator, description: string): Promise<void> {
  await locator.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  const box = await locator.boundingBox();
  expect(box, `${description} should have a clickable box`).not.toBeNull();

  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
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

export async function openButtonFlowBaserowAddRowConfiguration(
  page: Page,
  source: BaserowAddRowActionConfigOptions,
): Promise<void> {
  await test.step('Open the Button workflow Add Row action configuration', async () => {
    await openButtonFlowBaserowAddRowConfigurationOnce(page, source);
  });
}

export async function openButtonFlowBaserowAddRowActionConfiguration(
  page: Page,
  flowName?: string | RegExp,
): Promise<void> {
  await test.step('Open the Button workflow Add Row action configuration', async () => {
    await openButtonFlowBaserowAddRowActionConfigurationOnce(page, flowName);
  });
}

export async function addBaserowAddRowColumnMapping(page: Page, column: string): Promise<void> {
  await test.step(`Add Baserow Add Row mapping for ${column}`, async () => {
    await ensureBaserowActionVariableRow(page, column);
  });
}

export async function expectBaserowAddRowColumnMappingDeletable(page: Page, column: string): Promise<void> {
  await test.step(`Delete Baserow Add Row mapping for ${column}`, async () => {
    await selectBaserowActionVariable(page, column);
    const rowButton = baserowActionVariableButton(page, column);
    const deleteAction = rowButton.locator('.figma-button__action').first();
    await expect(deleteAction, `Baserow Add Row mapping ${column} should expose a delete action`).toBeVisible({
      timeout: 10_000,
    });

    const before = await page.locator(BASEROW_ACTION_VARIABLE_BUTTON).count();
    await deleteAction.click({ timeout: 5_000 }).catch(async () => deleteAction.dispatchEvent('click'));

    const alert = page.locator('ion-alert').last();
    await expect(alert, `Baserow Add Row mapping ${column} delete confirmation should open`).toBeVisible({
      timeout: 10_000,
    });
    await alert.locator('button').last().click({ timeout: 5_000 });
    await expect(alert).toBeHidden({ timeout: 10_000 });

    await expect
      .poll(() => isBaserowActionColumnMapped(page, column), {
        message: `Baserow Add Row mapping ${column} should be removed`,
        timeout: 10_000,
      })
      .toBe(false);
    await expect
      .poll(() => page.locator(BASEROW_ACTION_VARIABLE_BUTTON).count(), {
        message: 'Baserow Add Row mapping list should shrink after deletion',
        timeout: 10_000,
      })
      .toBeLessThan(before);
  });
}

export async function setBaserowAddRowColumnMappingJavaScriptReturn(
  page: Page,
  column: string,
  returnExpression: string,
): Promise<void> {
  await test.step(`Set Baserow Add Row mapping ${column} JavaScript value`, async () => {
    await selectBaserowActionVariable(page, column);
    await openBaserowActionVariableJavaScriptMode(page, column);
    await replaceVisibleMonacoReturn(page, returnExpression, `Baserow Add Row mapping ${column}`);
  });
}

export async function expectBaserowAddRowColumnMappingJavaScriptContains(
  page: Page,
  column: string,
  expected: string,
): Promise<void> {
  await test.step(`Assert Baserow Add Row mapping ${column} JavaScript contains ${expected}`, async () => {
    await selectBaserowActionVariable(page, column);
    await openBaserowActionVariableJavaScriptMode(page, column);
    const editor = await visibleMonacoEditor(page, `Baserow Add Row mapping ${column} JavaScript editor`);
    await expect(editor, `Baserow Add Row mapping ${column} JavaScript should contain ${expected}`).toContainText(expected, {
      timeout: 10_000,
    });
  });
}

export async function expectBaserowAddRowColumnMappingJavaScriptNotContains(
  page: Page,
  column: string,
  forbidden: string,
): Promise<void> {
  await test.step(`Assert Baserow Add Row mapping ${column} JavaScript does not contain ${forbidden}`, async () => {
    await selectBaserowActionVariable(page, column);
    await openBaserowActionVariableJavaScriptMode(page, column);
    const editor = await visibleMonacoEditor(page, `Baserow Add Row mapping ${column} JavaScript editor`);
    await expect(editor, `Baserow Add Row mapping ${column} JavaScript should not reuse ${forbidden}`).not.toContainText(
      forbidden,
      { timeout: 5_000 },
    );
  });
}

async function openBaserowActionVariableJavaScriptMode(page: Page, column: string): Promise<void> {
  await clickFirstVisible(page, SEL.defaultValueJavaScriptButton, `Baserow action variable ${column} JavaScript mode`, 10_000, true);
  await confirmAlertIfVisible(page);
  await visibleMonacoEditor(page, `Baserow Add Row mapping ${column} JavaScript editor`);
}

async function visibleMonacoEditor(page: Page, description: string): Promise<Locator> {
  const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
  await expect(editor, description).toBeVisible({ timeout: 15_000 });
  return editor;
}

async function replaceVisibleMonacoReturn(page: Page, returnExpression: string, description: string): Promise<void> {
  const editor = await visibleMonacoEditor(page, `${description} JavaScript editor`);
  const expectedLine = `return ${returnExpression};`;
  const code = `(async ()=>{\n\t${expectedLine}\n})();`;
  await editor.click();
  await expect(editor, `${description} JavaScript editor should expose a return statement`).toContainText('return', {
    timeout: 10_000,
  });
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(code);
  await page.keyboard.press('Tab');
  await expect(editor, `${description} JavaScript editor should contain ${expectedLine}`).toContainText(expectedLine, {
    timeout: 10_000,
  });
  await page.waitForTimeout(1_000);
}

async function openButtonWorkflow(page: Page, flowName?: string | RegExp): Promise<void> {
  await openWorkflowsPanel(page);
  let flow = await defaultButtonWorkflowLocator(page);
  if (flowName) {
    const namedFlow = page.locator(SEL.workflowEntry).filter({ hasText: flowName }).first();
    if (await namedFlow.isVisible({ timeout: 2_000 }).catch(() => false)) {
      flow = namedFlow;
    } else if (!isButtonWorkflowLabelHint(flowName)) {
      flow = namedFlow;
    }
  }
  await expect(flow, 'button flow should be available in Workflows').toBeVisible({ timeout: 30_000 });
  await flow.click({ timeout: 10_000 }).catch(async () => flow.dispatchEvent('click'));
  await page.waitForTimeout(1_000);
}

async function defaultButtonWorkflowLocator(page: Page): Promise<Locator> {
  const buttonFlow = page.locator(SEL.buttonWorkflowEntry).first();
  if (await buttonFlow.isVisible({ timeout: 1_500 }).catch(() => false)) {
    const label = normalizeVisibleText(await buttonFlow.innerText().catch(() => ''));
    if (!/^(Formulas|Triggered on Submission)$/i.test(label)) {
      return buttonFlow;
    }
  }

  const flowEntries = page.locator(SEL.workflowEntry);
  const count = await flowEntries.count();
  for (let i = count - 1; i >= 0; i--) {
    const candidate = flowEntries.nth(i);
    if (!(await candidate.isVisible({ timeout: 500 }).catch(() => false))) {
      continue;
    }
    const label = normalizeVisibleText(await candidate.innerText().catch(() => ''));
    if (/flow\s*button/i.test(label)) {
      return candidate;
    }
  }

  if (count > 2) {
    return flowEntries.last();
  }
  return buttonFlow;
}

function isButtonWorkflowLabelHint(flowName: string | RegExp): boolean {
  const value = typeof flowName === 'string' ? flowName : flowName.source;
  return /flow\s*button/i.test(value);
}

async function openButtonFlowBaserowAddRowActionConfigurationOnce(
  page: Page,
  flowName?: string | RegExp,
): Promise<void> {
  const timeout = 60_000;
  await openButtonWorkflow(page, flowName);

  await clickFirstVisible(page, SEL.componentPanelButton, 'action palette panel', 15_000, true);
  const actionTile = await paletteTileForIcon(page, PALETTE_ICON.baserowAddRowFromData, 'Baserow Add Row action');
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
}

async function openButtonFlowBaserowAddRowConfigurationOnce(
  page: Page,
  source: BaserowAddRowActionConfigOptions,
): Promise<void> {
  await openButtonFlowBaserowAddRowActionConfigurationOnce(page, source.flowName);

  const timeout = 60_000;
  await selectBaserowTableFromCurrentAction(page, source, timeout);
}

async function configureButtonFlowBaserowAddRowOnce(page: Page, source: BaserowAddRowActionOptions): Promise<void> {
  await openButtonFlowBaserowAddRowConfigurationOnce(page, source);

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
    const actionTile = await paletteTileForIcon(page, icon, `${actionName} action`);

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

export async function openButtonFlowMailActionConfig(page: Page, flowName?: string | RegExp): Promise<void> {
  await openButtonFlowActionConfig(page, {
    flowName,
    icon: PALETTE_ICON.mailAction,
    actionCardSelector: SEL.flowSubmitActionCard,
    actionName: 'Send mail',
  });
  await openConfigTabById(page, 'tab_selector_conf_action');
  await expectMailActionVariableButtons(page);
}

export async function setMailActionTextVariable(page: Page, variable: Extract<MailActionVariable, 'to'>, value: string): Promise<void> {
  await test.step(`Set Mail action ${variable} text value`, async () => {
    await selectMailActionVariable(page, variable);
    const textMode = await firstVisibleLocatorOrNull(page, SEL.defaultValueTextButton, 1_500);
    if (textMode) {
      await textMode.click({ timeout: 5_000 }).catch(async () => textMode.dispatchEvent('click'));
      await confirmAlertIfVisible(page);
    }
    await fillVisibleTinyMceText(page, value, `Mail action ${variable} text editor`);
  });
}

export async function setMailActionSubjectJavaScriptReturn(page: Page, returnExpression: string): Promise<void> {
  await test.step('Set Mail action subject JavaScript value', async () => {
    await selectMailActionVariable(page, 'subject');
    await clickFirstVisible(page, SEL.defaultValueJavaScriptButton, 'Mail action subject JavaScript mode', 10_000, true);
    await confirmAlertIfVisible(page);
    await replaceVisibleMonacoReturn(page, returnExpression, 'Mail action subject');
  });
}

export async function setMailActionBodyTextWithUserName(page: Page, text: string): Promise<void> {
  await test.step('Set Mail action body with text and current user name token', async () => {
    await selectMailActionVariable(page, 'body');
    await fillVisibleTinyMceText(page, text, 'Mail action body editor');
    await ensureActionSourcePaletteVisible(page);
    await dragUserNamePaletteToTinyMce(page);

    const content = await tinyMceEditorContent(page);
    expect(content.text, 'Mail action body should keep the typed text').toContain(text);
    expect(
      content.chipCount > 0 || normalizeVisibleText(content.text).toLowerCase().includes('name'),
      'Mail action body should contain the dragged current user name token',
    ).toBe(true);
  });
}

export async function ensureMailActionSummaryChecked(page: Page): Promise<void> {
  await test.step('Ensure Mail action Form summary is checked', async () => {
    await selectMailActionVariable(page, 'summary');
    const checkbox = await mailActionSummaryCheckbox(page);
    if (!(await mailActionSummaryChecked(checkbox))) {
      await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
    }
    await expect
      .poll(() => mailActionSummaryChecked(checkbox), {
        message: 'Mail action Form summary checkbox should be checked',
        timeout: 10_000,
      })
      .toBe(true);
    await page.waitForTimeout(700);
  });
}

export async function reselectMailActionFromActionSelection(page: Page): Promise<void> {
  await test.step('Return to Action selection and reselect the Mail action', async () => {
    await openConfigTabById(page, 'tab_selector_choice_action');
    await clickFirstVisible(page, SEL.dataSourceSelectButton, 'Mail action select button', 15_000, true);

    const actionPicker = page.locator('ion-modal:visible').last();
    await expect(actionPicker, 'Mail action picker should be visible').toBeVisible({ timeout: 15_000 });
    const mailAction = actionPicker.locator(MAIL_ACTION_PICKER_BUTTON).first();
    await expect(mailAction, 'Mail action should be available in the action picker').toBeVisible({ timeout: 30_000 });
    await mailAction.click({ timeout: 10_000 }).catch(async () => mailAction.dispatchEvent('click'));

    await actionPicker.locator('ion-footer ion-button').last().click({ timeout: 10_000 });
    await cancelOverwriteAlertIfVisible(page);
    const closedAfterValidation = await actionPicker.waitFor({ state: 'hidden', timeout: 5_000 }).then(
      () => true,
      () => false,
    );
    if (!closedAfterValidation) {
      const cancelButton = actionPicker.locator('ion-footer ion-button').first();
      await cancelButton.click({ timeout: 5_000, force: true }).catch(async () => cancelButton.dispatchEvent('click'));
      await expect(actionPicker, 'Mail action picker should close after cancelling overwrite').toBeHidden({ timeout: 15_000 });
    }

    await openConfigTabById(page, 'tab_selector_conf_action');
    await expectMailActionVariableButtons(page);
  });
}

export async function expectMailActionTextVariableContains(
  page: Page,
  variable: Extract<MailActionVariable, 'to'>,
  expected: string,
): Promise<void> {
  await test.step(`Assert Mail action ${variable} text value is preserved`, async () => {
    await selectMailActionVariable(page, variable);
    await expect
      .poll(async () => (await tinyMceEditorContent(page)).text, {
        message: `Mail action ${variable} should contain ${expected}`,
        timeout: 10_000,
      })
      .toContain(expected);
  });
}

export async function expectMailActionSubjectJavaScriptContains(page: Page, returnExpression: string): Promise<void> {
  await test.step('Assert Mail action subject JavaScript value is preserved', async () => {
    await selectMailActionVariable(page, 'subject');
    await clickFirstVisible(page, SEL.defaultValueJavaScriptButton, 'Mail action subject JavaScript mode', 10_000, true);
    await confirmAlertIfVisible(page);
    const editor = await visibleMonacoEditor(page, 'Mail action subject JavaScript editor');
    await expect(editor, 'Mail action subject JavaScript should keep the configured return expression').toContainText(
      `return ${returnExpression};`,
      { timeout: 10_000 },
    );
  });
}

export async function expectMailActionBodyContainsUserName(page: Page, text: string): Promise<void> {
  await test.step('Assert Mail action body text and current user name token are preserved', async () => {
    await selectMailActionVariable(page, 'body');
    const content = await tinyMceEditorContent(page);
    expect(content.text, 'Mail action body should keep the typed text').toContain(text);
    expect(
      content.chipCount > 0 || normalizeVisibleText(content.text).toLowerCase().includes('name'),
      'Mail action body should keep the current user name token',
    ).toBe(true);
  });
}

export async function expectMailActionSummaryChecked(page: Page): Promise<void> {
  await test.step('Assert Mail action Form summary remains checked', async () => {
    await selectMailActionVariable(page, 'summary');
    const checkbox = await mailActionSummaryCheckbox(page);
    await expect
      .poll(() => mailActionSummaryChecked(checkbox), {
        message: 'Mail action Form summary checkbox should remain checked',
        timeout: 10_000,
      })
      .toBe(true);
  });
}

async function expectMailActionVariableButtons(page: Page): Promise<void> {
  await expect
    .poll(() => page.locator(MAIL_ACTION_VARIABLE_BUTTON).count(), {
      message: 'Mail action configuration should expose all expected variables',
      timeout: 15_000,
    })
    .toBeGreaterThan(MAIL_ACTION_VARIABLE_INDEX.summary);
}

async function selectMailActionVariable(page: Page, variable: MailActionVariable): Promise<void> {
  await expectMailActionVariableButtons(page);
  const button = page.locator(MAIL_ACTION_VARIABLE_BUTTON).nth(MAIL_ACTION_VARIABLE_INDEX[variable]);
  await expect(button, `Mail action ${variable} variable should be visible`).toBeVisible({ timeout: 10_000 });
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await expect(button, `Mail action ${variable} variable should be selected`).toHaveClass(/figma-button--selected/, {
    timeout: 10_000,
  });
  await page.waitForTimeout(500);
}

async function mailActionSummaryCheckbox(page: Page): Promise<Locator> {
  const checkbox = page.locator(MAIL_ACTION_SUMMARY_CHECKBOX).last();
  await expect(checkbox, 'Mail action Form summary checkbox should be visible').toBeVisible({ timeout: 10_000 });
  return checkbox;
}

async function mailActionSummaryChecked(checkbox: Locator): Promise<boolean> {
  return checkbox.evaluate((el) => {
    const input = el as HTMLElement & { checked?: boolean };
    return input.checked === true || input.getAttribute('aria-checked') === 'true';
  });
}

async function cancelOverwriteAlertIfVisible(page: Page): Promise<void> {
  const alert = page.locator('ion-alert').last();
  if (!(await alert.isVisible({ timeout: 1_500 }).catch(() => false))) {
    return;
  }
  const cancelButton = alert.locator('button.btn--info, button.alert-button-role-cancel, button.alert-button').first();
  await expect(cancelButton, 'overwrite alert should expose a cancel button').toBeVisible({ timeout: 5_000 });
  await cancelButton.click({ timeout: 5_000 });
  await alert.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
}

async function ensureActionSourcePaletteVisible(page: Page): Promise<void> {
  if (await firstVisibleLocatorOrNull(page, SOURCE_PALETTE_ROOT_VISIBLE, 1_500)) {
    return;
  }
  const paletteButton = await firstVisibleLocatorOrNull(page, BASEROW_ACTION_SOURCE_PALETTE_BUTTON, 5_000);
  if (paletteButton) {
    await paletteButton.click({ timeout: 5_000 }).catch(async () => paletteButton.dispatchEvent('click'));
  }
  await firstVisibleLocator(page, SOURCE_PALETTE_ROOT_VISIBLE, 'action Source Palette', 10_000);
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

export async function expectConditionActionModesSwitchable(page: Page, fieldTechnicalId?: string): Promise<void> {
  await test.step('Check the If condition editor', async () => {
    const conditionEditor = page.locator(SEL.flowConditionEditor).last();
    await expect(conditionEditor, 'Condition action should expose the If editor').toBeVisible({ timeout: 15_000 });
    await expectFlowConditionModeButtons(page);
    await expectFlowConditionFieldsMode(page, fieldTechnicalId);
  });

  await test.step('Switch the If condition to text mode', async () => {
    await clickFlowConditionMode(page, 'text');
    await confirmAlertIfVisible(page);
    await expect(page.locator(SEL.flowConditionTextExpressionEditor).first(), 'Condition Aa expression editor should become visible').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Switch the If condition to JavaScript mode', async () => {
    await clickFlowConditionMode(page, 'javascript');
    await confirmAlertIfVisible(page);
    const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
    await expect(editor, 'Condition JavaScript editor should become visible after clicking JS mode').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Switch the If condition back to text mode', async () => {
    await clickFlowConditionMode(page, 'text');
    await confirmAlertIfVisible(page);
    await expect(page.locator(SEL.flowConditionTextExpressionEditor).first(), 'Condition Aa expression editor should become visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last(),
      'Condition JavaScript editor should be hidden after returning to Aa mode',
    ).toBeHidden({ timeout: 15_000 });
  });

  await test.step('Switch the If condition back to field/operator mode', async () => {
    await clickFlowConditionMode(page, 'fields');
    await confirmAlertIfVisible(page);
    await expectFlowConditionFieldsMode(page, fieldTechnicalId);
    await expect(
      page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last(),
      'Condition JavaScript editor should be hidden after returning to field/operator mode',
    ).toBeHidden({ timeout: 15_000 });
  });
}

type FlowConditionMode = 'fields' | 'text' | 'javascript';

async function expectFlowConditionModeButtons(page: Page): Promise<void> {
  await lastVisibleLocator(page, SEL.flowConditionVisualModeButton, 'Condition Fields mode button');
  await lastVisibleLocator(page, SEL.flowConditionTextModeButton, 'Condition Aa mode button');
  await lastVisibleLocator(page, SEL.flowConditionJavaScriptModeButton, 'Condition JavaScript mode button');
}

async function clickFlowConditionMode(page: Page, mode: FlowConditionMode): Promise<void> {
  const selector =
    mode === 'fields'
      ? SEL.flowConditionVisualModeButton
      : mode === 'text'
        ? SEL.flowConditionTextModeButton
        : SEL.flowConditionJavaScriptModeButton;
  const button = await lastVisibleLocator(page, selector, `Condition ${mode} mode button`);
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
}

async function expectFlowConditionFieldsMode(page: Page, fieldTechnicalId?: string): Promise<void> {
  await expect(page.locator(SEL.flowConditionBuilder).first(), 'Condition field/operator builder should be visible').toBeVisible({
    timeout: 15_000,
  });
  if (fieldTechnicalId) {
    await expectFlowConditionSelectedField(page, fieldTechnicalId);
  }
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

    const item = popover.getByRole('button', { name: new RegExp(`^\\s*${escapeRegExp(fieldTechnicalId)}\\s*$`) }).last();
    await expect(item, `If condition picker should list ${fieldTechnicalId}`).toBeVisible({ timeout: 10_000 });
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));

    await expectFlowConditionSelectedField(page, fieldTechnicalId);
  });
}

export async function expectFlowConditionSelectedField(page: Page, fieldTechnicalId: string): Promise<void> {
  await expect
    .poll(async () => (await flowConditionSelectedFieldTexts(page)).includes(fieldTechnicalId), {
      message: `If condition field input should keep ${fieldTechnicalId}`,
      timeout: 10_000,
    })
    .toBe(true);
}

async function flowConditionSelectedFieldTexts(page: Page): Promise<string[]> {
  const editor = page.locator(SEL.flowConditionEditor).last();
  await expect(editor, 'Condition action should expose the If editor').toBeVisible({ timeout: 15_000 });
  return editor.evaluate((root, selector) => {
    const visible = (el: Element) => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    const readValue = (element: Element) => {
      const host = element as HTMLElement & { value?: unknown; shadowRoot?: ShadowRoot | null };
      const input = element instanceof HTMLInputElement ? element : (host.shadowRoot?.querySelector('input') as HTMLInputElement | null);
      const raw = [
        input?.value ??
          undefined,
        typeof host.value === 'string' ? host.value : undefined,
        element.getAttribute('title') ?? undefined,
        input?.getAttribute('title') ?? undefined,
        element.getAttribute('value') ?? undefined,
        element.textContent ?? undefined,
      ].find((value) => value != null && String(value).trim() !== '');
      return String(raw).replace(/\s+/g, ' ').trim();
    };

    return [...root.querySelectorAll(selector)]
      .filter(visible)
      .map(readValue)
      .filter(Boolean);
  }, SEL.flowConditionFieldInput);
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
  await selectVisibilityMode(page, 'condition');
  await expect(page.locator(SEL.visibilityAddConditionButton).first(), 'visibility condition add button should be visible').toBeVisible({
    timeout: 10_000,
  });
}

function visibilityModeButtonIndex(mode: VisibilityMode): number {
  switch (mode) {
    case 'always':
      return 0;
    case 'never':
      return 1;
    case 'auth_required':
      return 2;
    case 'no_auth_required':
      return 3;
    case 'condition':
      return 4;
  }
}

async function visibilityModeButton(page: Page, mode: VisibilityMode): Promise<Locator> {
  const modeButtons = page.locator(`${SEL.visibilityModeButton}:visible`);
  const count = await modeButtons.count();
  if (count < 5) {
    throw new Error(`visibility mode toggle should expose 5 buttons, found ${count}`);
  }

  // Other ToggleSwitch instances can share this button class; the Visibility
  // group is the five-button group whose last entry is condition mode.
  return modeButtons.nth(count - 5 + visibilityModeButtonIndex(mode));
}

export async function selectVisibilityMode(page: Page, mode: VisibilityMode): Promise<void> {
  const button = await visibilityModeButton(page, mode);
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await page.waitForTimeout(500);
}

export async function expectVisibilityModeSelected(page: Page, mode: VisibilityMode): Promise<void> {
  const button = await visibilityModeButton(page, mode);
  await expect
    .poll(async () => (await button.getAttribute('class')) ?? '', {
      message: `Visibility mode should stay selected: ${mode}`,
      timeout: 10_000,
    })
    .toContain('c8o-btn-selected');
}

function buttonStateModeButtonIndex(mode: ButtonStateMode): number {
  switch (mode) {
    case 'always_enabled':
      return 0;
    case 'enabled_when_condition':
      return 1;
    case 'disabled_when_condition':
      return 2;
  }
}

async function buttonStateModeButton(page: Page, mode: ButtonStateMode): Promise<Locator> {
  const modeButtons = page.locator(`${SEL.visibilityModeButton}:visible`);
  const count = await modeButtons.count();
  if (count < 3) {
    throw new Error(`button state toggle should expose 3 buttons, found ${count}`);
  }

  return modeButtons.nth(count - 3 + buttonStateModeButtonIndex(mode));
}

export async function selectButtonStateMode(page: Page, mode: ButtonStateMode): Promise<void> {
  const button = await buttonStateModeButton(page, mode);
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await page.waitForTimeout(500);
}

export async function expectButtonStateModeSelected(page: Page, mode: ButtonStateMode): Promise<void> {
  const button = await buttonStateModeButton(page, mode);
  await expect
    .poll(async () => (await button.getAttribute('class')) ?? '', {
      message: `Button state mode should stay selected: ${mode}`,
      timeout: 10_000,
    })
    .toContain('c8o-btn-selected');
}

async function activateButtonStateConditionMode(
  page: Page,
  mode: Exclude<ButtonStateMode, 'always_enabled'> = 'enabled_when_condition',
): Promise<void> {
  await selectButtonStateMode(page, mode);
  await expect(page.locator(SEL.visibilityAddConditionButton).first(), 'button state condition add button should be visible').toBeVisible({
    timeout: 10_000,
  });
}

export async function cancelVisibilityModeSwitch(page: Page, targetMode: VisibilityMode): Promise<void> {
  await selectVisibilityMode(page, targetMode);

  const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
  await expect(alert, 'switching away from conditional Visibility should ask for confirmation').toBeVisible({
    timeout: 10_000,
  });

  const cancel = alert.locator('button.alert-button-role-cancel').first();
  await expect(cancel, 'Visibility mode switch confirmation should expose a cancel button').toBeVisible({
    timeout: 10_000,
  });
  await cancel.click({ timeout: 5_000 }).catch(async () => cancel.dispatchEvent('click'));
  await expect(alert, 'Visibility mode switch confirmation should close after Cancel').toBeHidden({
    timeout: 10_000,
  });
  await page.waitForTimeout(800);
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

  await fillBaserowActionColumnInput(page, column);
  await expectBaserowActionColumnMapped(page, column);
}

async function fillBaserowActionColumnInput(page: Page, column: string): Promise<void> {
  const columnIonInput = page.locator(`${BASEROW_ACTION_VARIABLE_ROW} ion-input`).last();
  const columnInput = columnIonInput.locator('input').first();
  await expect(columnInput, `Baserow action column input for ${column} should be visible`).toBeVisible({ timeout: 10_000 });
  await columnInput.scrollIntoViewIfNeeded().catch(() => undefined);
  await columnInput.fill(column);
  await columnIonInput.evaluate((element, value) => {
    const host = element as HTMLElement & { value?: string };
    const input = ((host.shadowRoot ?? host).querySelector('input') ?? host.querySelector('input')) as HTMLInputElement | null;
    host.value = value;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      input.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, composed: true, detail: { value } }));
      input.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
    }
    host.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, composed: true, detail: { value } }));
    host.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
  }, column);
  await columnInput.press('Tab').catch(() => undefined);
  await expect
    .poll(() => columnInput.inputValue().catch(() => ''), {
      message: `Baserow action column input should keep ${column}`,
      timeout: 5_000,
    })
    .toBe(column);
  await page.waitForTimeout(500);
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
  await expectBaserowActionVariableEditorContains(page, column, sourceLabel);
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
  await button.scrollIntoViewIfNeeded().catch(() => undefined);
  if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
    await button.click({ timeout: 5_000 }).catch(async () => button.dispatchEvent('click'));
  } else {
    await button.dispatchEvent('click');
  }

  await expect
    .poll(() => currentBaserowActionColumn(page), {
      message: `Baserow action variable ${column} should be selected`,
      timeout: 10_000,
    })
    .toBe(column);
}

async function currentBaserowActionColumn(page: Page): Promise<string> {
  return page.locator(BASEROW_ACTION_VARIABLE_INPUT).last().inputValue().catch(() => '');
}

async function expectBaserowActionVariableEditorContains(page: Page, column: string, sourceLabel: string): Promise<void> {
  await selectBaserowActionVariable(page, column);
  const editorBody = await visibleTinyMceBody(page);
  await expect
    .poll(() => editorContainsPaletteEntry(editorBody, sourceLabel), {
      message: `Baserow action variable ${column} should contain ${sourceLabel}`,
      timeout: 10_000,
    })
    .toBe(true);
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

async function checkedChartBaserowColumns(modal: Locator, candidates: string[]): Promise<{ category: string[]; value: string[] }> {
  const checked = { category: [] as string[], value: [] as string[] };
  for (const name of candidates) {
    const row = selectSourceColumnRow(modal, name);
    if ((await row.count()) === 0) continue;
    const roleCheckboxes = row.locator(CHART_SOURCE_ROLE_CHECKBOX);
    if ((await roleCheckboxes.count()) < 2) continue;
    if ((await roleCheckboxes.nth(0).getAttribute('aria-checked')) === 'true') checked.category.push(name);
    if ((await roleCheckboxes.nth(1).getAttribute('aria-checked')) === 'true') checked.value.push(name);
  }
  return checked;
}

async function checkedMapBaserowColumns(
  modal: Locator,
  candidates: string[],
): Promise<{ title: string[]; latitude: string[]; longitude: string[] }> {
  const checked = { title: [] as string[], latitude: [] as string[], longitude: [] as string[] };
  for (const name of candidates) {
    const row = selectSourceColumnRow(modal, name);
    if ((await row.count()) === 0) continue;
    const roleCheckboxes = row.locator(MAP_SOURCE_ROLE_CHECKBOX);
    if ((await roleCheckboxes.count()) < 3) continue;
    if ((await roleCheckboxes.nth(0).getAttribute('aria-checked')) === 'true') checked.latitude.push(name);
    if ((await roleCheckboxes.nth(1).getAttribute('aria-checked')) === 'true') checked.longitude.push(name);
    if ((await roleCheckboxes.nth(2).getAttribute('aria-checked')) === 'true') checked.title.push(name);
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

async function setChartSourceColumnRole(
  modal: Locator,
  role: 'category' | 'value',
  targetColumn: string,
  checked: boolean,
): Promise<void> {
  const row = selectSourceColumnRow(modal, targetColumn);
  await expect(row, `Baserow column ${targetColumn} should be available for Chart ${role}`).toBeVisible({ timeout: 15_000 });

  const checkbox = row.locator(CHART_SOURCE_ROLE_CHECKBOX).nth(role === 'category' ? 0 : 1);
  await expect(checkbox, `Chart ${role} checkbox for ${targetColumn} should be visible`).toBeVisible({ timeout: 15_000 });
  const current = (await checkbox.getAttribute('aria-checked')) === 'true';
  if (current !== checked) {
    await checkbox.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
    await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
    await expect
      .poll(() => checkbox.getAttribute('aria-checked'), {
        message: `Chart ${role} checkbox for ${targetColumn} should become ${checked}`,
        timeout: 5_000,
      })
      .toBe(checked ? 'true' : 'false');
  }
}

async function setMapSourceColumnRole(
  modal: Locator,
  role: 'title' | 'latitude' | 'longitude',
  targetColumn: string,
  checked: boolean,
): Promise<void> {
  const row = selectSourceColumnRow(modal, targetColumn);
  await expect(row, `Baserow column ${targetColumn} should be available for Map ${role}`).toBeVisible({ timeout: 15_000 });

  const roleIndex = role === 'latitude' ? 0 : role === 'longitude' ? 1 : 2;
  const checkbox = row.locator(MAP_SOURCE_ROLE_CHECKBOX).nth(roleIndex);
  await expect(checkbox, `Map ${role} checkbox for ${targetColumn} should be visible`).toBeVisible({ timeout: 15_000 });
  const current = (await checkbox.getAttribute('aria-checked')) === 'true';
  if (current !== checked) {
    await checkbox.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
    await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
    await expect
      .poll(() => checkbox.getAttribute('aria-checked'), {
        message: `Map ${role} checkbox for ${targetColumn} should become ${checked}`,
        timeout: 5_000,
      })
      .toBe(checked ? 'true' : 'false');
  }
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
type PublishedQrButtonMode = 'show' | 'hide';

const PUBLISHED_APPLICATIONS_TAB_RE = /^(Published Apps|Published|Applications publi[ée]es)$/i;
const PUBLISHED_APPLICATIONS_VIEW_RE =
  /Application publishing|Publication des applications|no-code publishing workspace|espace de publication no-code|Applications en production|Applications in production|Vos applications d[ée]ploy[ée]es|Your deployed applications/i;

const PUBLISHED_QR_LABEL_RE: Record<PublishedQrButtonMode, RegExp> = {
  show: /^(?:Voir|View|Ver|Vedi)\s+QR$/i,
  hide: /^(?:Masquer|Hide|Ocultar|Nascondi)\s+QR$/i,
};

const PUBLISHED_QR_TOOLTIP_RE: Record<PublishedQrButtonMode, RegExp> = {
  show: /(?:Afficher|Display|Muestra|Visualizza).*QR/i,
  hide: /(?:Masquer|Hide|Oculta|Nascondi).*QR/i,
};

const PUBLISHED_QR_IMPORT_TOOLTIP_RE = /(?:Importer|Import|Importar|Importa).*(?:application|aplicaci|applicazione)/i;

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

export async function openPublishedApplicationsTab(page: Page): Promise<void> {
  await test.step('open the Published Applications selector tab', async () => {
    await returnToSelectorFromEditor(page);
    await dismissVisiblePopovers(page);
    for (let attempt = 0; attempt < 4; attempt++) {
      if (await publishedApplicationsViewIsActive(page)) {
        break;
      }

      const tab = await publishedApplicationsTabLocator(page);
      await tab.click({ timeout: 10_000, force: attempt > 0 }).catch(async () => tab.dispatchEvent('click'));
      await waitForIonicLoading(page, 10_000);
      await page.waitForTimeout(800);
      if (!(await publishedApplicationsViewIsActive(page))) {
        await clickPublishedApplicationsTabByDom(page);
        await waitForIonicLoading(page, 10_000);
        await page.waitForTimeout(800);
      }
      if (await publishedApplicationsViewIsActive(page)) {
        break;
      }
    }
    await expect
      .poll(() => publishedApplicationsViewIsActive(page), {
        message: 'the Published Applications selector tab should be active before opening a published card menu',
        timeout: 10_000,
      })
      .toBe(true);
    await page.waitForTimeout(500);
  });
}

async function publishedApplicationsTabLocator(page: Page): Promise<Locator> {
  const stable = page.locator(SEL.publishedApplicationsTab).filter({ hasText: PUBLISHED_APPLICATIONS_TAB_RE }).first();
  if (await stable.isVisible({ timeout: 1_500 }).catch(() => false)) {
    return stable;
  }

  const byText = page
    .locator('page-selectorpage ion-button, page-selectorpage button, page-selectorpage [role="button"]')
    .filter({ hasText: PUBLISHED_APPLICATIONS_TAB_RE })
    .first();
  if (await byText.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return byText;
  }

  return firstVisibleLocator(page, SEL.publishedApplicationsTab, 'Published Applications tab', 5_000);
}

async function clickPublishedApplicationsTabByDom(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const isVisible = (el: Element): el is HTMLElement => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const tab = [...document.querySelectorAll('ion-button, button, [role="button"]')]
      .filter(isVisible)
      .find((candidate) => /^(Published Apps|Published|Applications publi[ée]es)$/i.test(normalize((candidate as HTMLElement).innerText)));
    if (!tab) {
      return false;
    }
    const element = tab as HTMLElement;
    const rect = element.getBoundingClientRect();
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
      element.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          view: window,
        }),
      );
    }
    element.click();
    return true;
  });
}

async function publishedApplicationsViewIsActive(page: Page): Promise<boolean> {
  const root = page.locator('page-selectorpage').first();
  const rootVisible = await root.isVisible({ timeout: 1_000 }).catch(() => false);

  if (rootVisible) {
    const activePublishedTab = root
      .locator('ion-button.btn--tab-active, ion-button.TabSelected, ion-button.tab-selected, .btn--tab-active, .TabSelected')
      .filter({ hasText: PUBLISHED_APPLICATIONS_TAB_RE })
      .first();
    if (await activePublishedTab.isVisible({ timeout: 500 }).catch(() => false)) {
      return true;
    }

    const rootText = normalizeWhitespace(await root.innerText({ timeout: 1_000 }).catch(() => ''));
    if (PUBLISHED_APPLICATIONS_VIEW_RE.test(rootText)) {
      return true;
    }
  }

  const pageText = normalizeWhitespace(await page.locator('body').innerText({ timeout: 1_000 }).catch(() => ''));
  return PUBLISHED_APPLICATIONS_VIEW_RE.test(pageText);
}

export async function expectPublishedQrButtonMode(page: Page, mode: PublishedQrButtonMode): Promise<void> {
  await test.step(`assert the published QR button is in ${mode} mode`, async () => {
    const button = await publishedQrButton(page);
    await expect
      .poll(() => publishedQrButtonText(button), {
        message: `published QR button label should match ${PUBLISHED_QR_LABEL_RE[mode]}`,
        timeout: 10_000,
      })
      .toMatch(PUBLISHED_QR_LABEL_RE[mode]);
  });
}

export async function expectPublishedQrTooltipMode(page: Page, mode: PublishedQrButtonMode): Promise<void> {
  await test.step(`assert the published QR tooltip is in ${mode} mode`, async () => {
    const button = await publishedQrButton(page);
    await expect
      .poll(() => readPublishedQrTooltipMessage(page, button), {
        message: `published QR tooltip should match ${PUBLISHED_QR_TOOLTIP_RE[mode]}`,
        timeout: 10_000,
      })
      .toMatch(PUBLISHED_QR_TOOLTIP_RE[mode]);

    const tooltip = await readPublishedQrTooltipMessage(page, button);
    expect(tooltip, 'published QR tooltip should not reuse the Import application tooltip').not.toMatch(
      PUBLISHED_QR_IMPORT_TOOLTIP_RE,
    );
  });
}

export async function clickPublishedQrButton(page: Page): Promise<void> {
  await test.step('click the published QR button', async () => {
    const button = await publishedQrButton(page);
    await button.scrollIntoViewIfNeeded();
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
    await waitForIonicLoading(page, 10_000);
  });
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
    const hasModernIconArea = await iconArea.isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasModernIconArea) {
      await iconArea.click({ force: true }).catch(() => undefined);
    } else {
      const editButton = modal.locator(SEL.pwaIconEditButton).first();
      if (!(await editButton.isVisible({ timeout: 2_000 }).catch(() => false))) {
        return;
      }
      await editButton.click({ force: true, timeout: 2_000 }).catch(() => undefined);
    }

    if (!(await wallpaperModal.isVisible({ timeout: 3_000 }).catch(() => false))) {
      await modal
        .locator(SEL.pwaIconEditButton)
        .first()
        .click({ force: true, timeout: 2_000 })
        .catch(() => undefined);
    }

    if (!hasModernIconArea && !(await wallpaperModal.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return;
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
  if (!(await legacyCheckbox.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return;
  }
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

async function isIonToggleChecked(toggle: Locator): Promise<boolean> {
  const ariaChecked = await toggle.getAttribute('aria-checked').catch(() => null);
  if (ariaChecked != null) {
    return ariaChecked === 'true';
  }
  return toggle.evaluate((el) => {
    const input = el as HTMLInputElement;
    return input.checked === true || el.classList.contains('toggle-checked') || el.getAttribute('ng-reflect-checked') === 'true';
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
    await clickPwaSaveButton(modal);
    await confirmPwaAnonymousWarningIfVisible(page);
    await expect(modal).toBeHidden({ timeout: 60_000 });
  });
}

async function clickPwaSaveButton(modal: Locator): Promise<void> {
  const page = modal.page();
  const actionLabel =
    /(Save|Enregistrer|Sauvegarder|Publier(?: l['’]application)?|Publish(?: application)?|OK|Valider|Next|Suivant|Continue|Continuer)/i;

  for (let step = 0; step < 5; step++) {
    if (!(await modal.isVisible({ timeout: 1_000 }).catch(() => false))) {
      return;
    }

    await uploadLegacyPwaIconIfVisible(page, modal);

    const candidates = [
      page.getByRole('dialog').last().getByRole('button', { name: actionLabel }).last(),
      modal
        .locator('ion-footer ion-button, ion-toolbar ion-button, ion-button, button')
        .filter({ hasText: actionLabel })
        .last(),
      modal.locator(SEL.pwaSaveButton).last(),
    ];
    let clicked = false;
    for (const action of candidates) {
      if (!(await action.isVisible({ timeout: 1_000 }).catch(() => false))) {
        continue;
      }
      await action.scrollIntoViewIfNeeded({ timeout: 2_000 }).catch(() => undefined);
      await action.click({ timeout: 10_000 }).catch(async () => action.dispatchEvent('click'));
      clicked = true;
      break;
    }
    if (!clicked) {
      clicked = await clickPwaWizardActionByDom(page, actionLabel.source);
    }
    if (!clicked) {
      await expect(candidates[0], 'the PWA editor should expose a visible wizard action button').toBeVisible({
        timeout: 10_000,
      });
    }

    await page.waitForTimeout(800);
    await waitForIonicLoading(page, 10_000);
    if (!(await modal.isVisible({ timeout: 1_000 }).catch(() => false))) {
      return;
    }
  }

  throw new Error('Could not complete the PWA publication wizard');
}

function resolvePwaTestIconPath(): string {
  const candidates = [
    path.resolve(process.cwd(), '..', 'DisplayObjects', 'mobile', 'assets', 'icon_512x512.png'),
    path.resolve(process.cwd(), 'DisplayObjects', 'mobile', 'assets', 'icon_512x512.png'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

async function uploadLegacyPwaIconIfVisible(page: Page, modal: Locator): Promise<void> {
  const chooseButton = page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: /(Choose|Choisir|Sélectionner|Selectionner).*(image|ic[oô]ne|icon)/i })
    .last();
  const modalInput = modal.locator('input[type="file"][accept*="image"], input[type="file"]').last();
  const pageInput = page.locator('ion-modal.show-modal input[type="file"][accept*="image"], ion-modal.show-modal input[type="file"]').last();
  const hasInput =
    (await modalInput.count().catch(() => 0)) > 0 || (await pageInput.count().catch(() => 0)) > 0;
  const hasChooseButton = await chooseButton.isVisible({ timeout: 500 }).catch(() => false);
  if (!hasInput && !hasChooseButton) {
    return;
  }

  const iconPath = resolvePwaTestIconPath();
  const input = (await modalInput.count().catch(() => 0)) > 0 ? modalInput : pageInput;
  if ((await input.count().catch(() => 0)) > 0) {
    await input.setInputFiles(iconPath, { timeout: 10_000 });
  } else {
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10_000 });
    await chooseButton.click({ timeout: 5_000 }).catch(async () => chooseButton.dispatchEvent('click'));
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(iconPath);
  }

  await page.waitForTimeout(1_000);
  await waitForIonicLoading(page, 10_000);
}

async function clickPwaWizardActionByDom(page: Page, actionPattern: string): Promise<boolean> {
  return page.evaluate((source) => {
    const labelRe = new RegExp(source, 'i');
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const isAvailable = (el: Element): el is HTMLElement => {
      const style = getComputedStyle(el);
      const button = el as HTMLButtonElement;
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !button.disabled &&
        !el.classList.contains('button-disabled') &&
        el.getAttribute('aria-disabled') !== 'true'
      );
    };
    const labelOf = (el: Element) =>
      normalize(
        [
          (el as HTMLElement).innerText,
          el.textContent,
          el.getAttribute('aria-label'),
          el.getAttribute('title'),
        ]
          .filter(Boolean)
          .join(' '),
      );
    const clickElement = (el: HTMLElement): boolean => {
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const box = el.getBoundingClientRect();
      const clientX = Math.min(Math.max(box.left + box.width / 2, 1), window.innerWidth - 1);
      const clientY = Math.min(Math.max(box.top + box.height / 2, 1), window.innerHeight - 1);
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        el.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            view: window,
          }),
        );
      }
      el.click();
      return true;
    };

    const roots = [...document.querySelectorAll('ion-modal.show-modal, ion-modal.modal-pwa-edition, ion-modal.modalCSV')].filter(
      isAvailable,
    );
    for (const root of roots.reverse()) {
      const button = [...root.querySelectorAll('ion-button, button, [role="button"]')]
        .filter(isAvailable)
        .filter((candidate) => labelRe.test(labelOf(candidate)))
        .at(-1) as HTMLElement | undefined;
      if (button) {
        return clickElement(button);
      }
    }

    const globalButton = [...document.querySelectorAll('ion-button, button, [role="button"]')]
      .filter(isAvailable)
      .filter((candidate) => labelRe.test(labelOf(candidate)))
      .at(-1) as HTMLElement | undefined;
    return globalButton ? clickElement(globalButton) : false;
  }, actionPattern);
}

export async function openCreateApplicationPrompt(page: Page): Promise<Locator> {
  const alert = await openCreateFormPrompt(page);
  await waitForPresentedCreateFormAlert(alert);
  return alert;
}

export async function openCreateFolderPrompt(page: Page): Promise<Locator> {
  await waitForSelectorHomeReadyForCreate(page);

  const button = await firstVisibleLocator(page, SEL.createFolderButton, 'create folder button', 15_000);
  await button.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  await button.click({ timeout: 10_000 });

  const alert = page.locator(SEL.createFolderAlert).last();
  await expect(alert, 'create folder prompt should be visible after one create-folder click').toBeVisible({ timeout: 15_000 });
  await waitForPresentedPromptInput(alert, 'create folder prompt should be presented and editable');
  return alert;
}

export async function createSelectorFolder(page: Page, title: string): Promise<void> {
  await test.step(`Create selector folder ${title}`, async () => {
    await setSelectorHideFoldersFilter(page, false);
    const alert = await openCreateFolderPrompt(page);

    const input = alert.locator(SEL.createFolderTitleInput).first();
    await expect(input, 'create folder title input should be visible').toBeVisible({ timeout: 15_000 });
    await input.fill(title, { timeout: 15_000 });
    await expect(input, 'create folder title should be filled before saving').toHaveValue(title, { timeout: 10_000 });

    const save = alert.locator(SEL.createFolderSaveButton).first();
    await expect(save, 'create folder save button should be visible').toBeVisible({ timeout: 10_000 });
    await expect
      .poll(() => locatorCanBeClicked(save), {
        message: 'create folder save button should be enabled before clicking',
        timeout: 10_000,
      })
      .toBe(true);

    await save.click({ timeout: 10_000 }).catch(async () => save.dispatchEvent('click'));
    await expect(alert, 'create folder prompt should close after saving').toBeHidden({ timeout: 15_000 });
    await waitForIonicLoading(page, 10_000);
    await expectSelectorFolderVisible(page, title);
  });
}

export async function setSelectorHideFoldersFilter(page: Page, enabled: boolean): Promise<void> {
  await test.step(`${enabled ? 'Enable' : 'Disable'} Hide folders selector filter`, async () => {
    await expectRoute(page, ROUTE.selector);
    await waitForSelectorHomeReadyForCreate(page);

    let button = await firstVisibleLocatorOrNull(page, SEL.selectorHideFoldersButton, 1_500);
    if (!button) {
      await openSelectorInlineFiltersIfAvailable(page);
      button = await firstVisibleLocatorOrNull(page, SEL.selectorHideFoldersButton, 5_000);
    }

    if (button) {
      await button.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
      if ((await selectorHideFoldersQuickFilterEnabled(page)) !== enabled) {
        await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
      }

      await expect
        .poll(() => selectorHideFoldersQuickFilterEnabled(page), {
          message: `Hide folders quick filter should be ${enabled ? 'enabled' : 'disabled'}`,
          timeout: 10_000,
        })
        .toBe(enabled);
    } else {
      await setSelectorHideFoldersFilterViaPopover(page, enabled);
    }

    await waitForIonicLoading(page, 10_000);
    await waitForSelectorFormListLoaded(page);
  });
}

export async function setSelectorMyApplicationsFilter(page: Page, enabled: boolean): Promise<void> {
  await test.step(`${enabled ? 'Enable' : 'Disable'} My applications selector filter`, async () => {
    await expectRoute(page, ROUTE.selector);
    await waitForSelectorHomeReadyForCreate(page);

    let button = await firstVisibleLocatorOrNull(page, SEL.selectorMyApplicationsButton, 1_500);
    if (!button) {
      await openSelectorInlineFiltersIfAvailable(page);
      button = await firstVisibleLocatorOrNull(page, SEL.selectorMyApplicationsButton, 5_000);
    }

    if (button) {
      await button.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
      if ((await selectorMyApplicationsQuickFilterEnabled(page)) !== enabled) {
        await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
      }
      await expectSelectorMyApplicationsFilterEnabled(page, enabled);
    } else {
      await setSelectorMyApplicationsFilterViaPopover(page, enabled);
    }

    await waitForIonicLoading(page, 10_000);
    await waitForSelectorFormListLoaded(page);
  });
}

export async function expectSelectorMyApplicationsFilterEnabled(page: Page, enabled: boolean): Promise<void> {
  await test.step(`Assert My applications selector filter is ${enabled ? 'enabled' : 'disabled'}`, async () => {
    let button = await firstVisibleLocatorOrNull(page, SEL.selectorMyApplicationsButton, 1_500);
    if (!button) {
      await openSelectorInlineFiltersIfAvailable(page);
      button = await firstVisibleLocatorOrNull(page, SEL.selectorMyApplicationsButton, 5_000);
    }

    if (button) {
      await expect
        .poll(() => selectorMyApplicationsQuickFilterEnabled(page), {
          message: `My applications quick filter should be ${enabled ? 'enabled' : 'disabled'}`,
          timeout: 10_000,
        })
        .toBe(enabled);
      return;
    }

    await expectSelectorMyApplicationsFilterViaPopover(page, enabled);
  });
}

export async function reloadSelectorPage(page: Page): Promise<void> {
  await test.step('Reload the selector page', async () => {
    await expectRoute(page, ROUTE.selector);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expectRoute(page, ROUTE.selector);
    await expect(page.locator(SEL.selectorPageRoot).first(), 'selector page should be visible after reload').toBeVisible({
      timeout: 30_000,
    });
    await waitForSelectorHomeReadyForCreate(page);
  });
}

export async function expectSelectorApplicationVisible(page: Page, title: string): Promise<void> {
  await test.step(`Assert selector application ${title} is visible`, async () => {
    await expect
      .poll(() => selectorApplicationVisible(page, title), {
        message: `selector application "${title}" should be visible`,
        timeout: 30_000,
      })
      .toBe(true);
  });
}

export async function expectSelectorFolderVisible(page: Page, title: string): Promise<void> {
  await test.step(`Assert selector folder ${title} is visible`, async () => {
    await expect
      .poll(() => selectorFolderVisible(page, title), {
        message: `selector folder "${title}" should be visible`,
        timeout: 30_000,
      })
      .toBe(true);
  });
}

export async function expectSelectorFolderHidden(page: Page, title: string): Promise<void> {
  await test.step(`Assert selector folder ${title} is hidden`, async () => {
    await expect
      .poll(() => selectorFolderVisible(page, title), {
        message: `selector folder "${title}" should be hidden`,
        timeout: 30_000,
      })
      .toBe(false);
  });
}

export async function alertValidationButtonState(
  alert: Locator,
  buttonSelector: string,
): Promise<AlertValidationButtonState> {
  const button = alert.locator(buttonSelector).first();
  await expect(button, 'alert validation button should be visible').toBeVisible({ timeout: 10_000 });

  return button.evaluate((el) => {
    const element = el as HTMLElement & { disabled?: boolean };
    const style = window.getComputedStyle(element);
    return {
      disabled: element.disabled === true,
      ariaDisabled: element.getAttribute('aria-disabled'),
      hasDisabledClass: element.classList.contains('alert-button-disabled'),
      pointerEvents: style.pointerEvents,
      opacity: Number.parseFloat(style.opacity || '1'),
      cursor: style.cursor,
      filter: style.filter,
    };
  });
}

async function locatorCanBeClicked(locator: Locator): Promise<boolean> {
  if (!(await locator.isVisible({ timeout: 500 }).catch(() => false))) {
    return false;
  }
  return locator.evaluate((el) => {
    const element = el as HTMLElement & { disabled?: boolean };
    const style = window.getComputedStyle(element);
    return element.disabled !== true && element.getAttribute('aria-disabled') !== 'true' && style.pointerEvents !== 'none';
  });
}

async function selectorHideFoldersQuickFilterEnabled(page: Page): Promise<boolean> {
  return page.locator(SEL.selectorHideFoldersButton).evaluateAll((buttons) => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const button = buttons.find(visible);
    return !!button?.classList.contains('btn--allfolders');
  });
}

async function selectorMyApplicationsQuickFilterEnabled(page: Page): Promise<boolean> {
  return page.locator(SEL.selectorMyApplicationsButton).evaluateAll((buttons) => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const button = buttons.find(visible);
    return !!button?.classList.contains('btn--myapps');
  });
}

async function openSelectorInlineFiltersIfAvailable(page: Page): Promise<void> {
  const toggle = await firstVisibleLocatorOrNull(page, SEL.selectorFilterInlineToggleButton, 1_000);
  if (!toggle) {
    return;
  }
  await toggle.click({ timeout: 10_000 }).catch(async () => toggle.dispatchEvent('click'));
}

async function setSelectorHideFoldersFilterViaPopover(page: Page, enabled: boolean): Promise<void> {
  const openButton = await firstVisibleLocator(page, SEL.selectorFilterPopoverButton, 'selector filters popover button', 15_000);
  await openButton.click({ timeout: 10_000 }).catch(async () => openButton.dispatchEvent('click'));

  const popover = page.locator(SEL.selectorFiltersPopover).last();
  await expect(popover, 'selector filters popover should open').toBeVisible({ timeout: 15_000 });

  const checkbox = popover.locator(SEL.selectorHideFoldersCheckbox).first();
  await expect(checkbox, 'Hide folders checkbox should be visible in filters popover').toBeVisible({ timeout: 10_000 });
  if ((await ionCheckboxChecked(checkbox)) !== enabled) {
    await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
  }
  await expect
    .poll(() => ionCheckboxChecked(checkbox), {
      message: `Hide folders checkbox should be ${enabled ? 'checked' : 'unchecked'}`,
      timeout: 10_000,
    })
    .toBe(enabled);

  const apply = popover.locator(SEL.selectorApplyFiltersButton).first();
  await expect(apply, 'filters popover apply button should be visible').toBeVisible({ timeout: 10_000 });
  await apply.click({ timeout: 10_000 }).catch(async () => apply.dispatchEvent('click'));
  await expect(popover, 'selector filters popover should close after applying').toBeHidden({ timeout: 15_000 });
}

async function expectSelectorMyApplicationsFilterViaPopover(page: Page, enabled: boolean): Promise<void> {
  const openButton = await firstVisibleLocator(page, SEL.selectorFilterPopoverButton, 'selector filters popover button', 15_000);
  await openButton.click({ timeout: 10_000 }).catch(async () => openButton.dispatchEvent('click'));

  const popover = page.locator(SEL.selectorFiltersPopover).last();
  await expect(popover, 'selector filters popover should open').toBeVisible({ timeout: 15_000 });

  const checkbox = popover.locator(SEL.selectorMyApplicationsCheckbox).first();
  await expect(checkbox, 'My applications checkbox should be visible in filters popover').toBeVisible({ timeout: 10_000 });
  await expect
    .poll(() => ionCheckboxChecked(checkbox), {
      message: `My applications checkbox should be ${enabled ? 'checked' : 'unchecked'}`,
      timeout: 10_000,
    })
    .toBe(enabled);

  const apply = popover.locator(SEL.selectorApplyFiltersButton).first();
  await apply.click({ timeout: 10_000 }).catch(async () => apply.dispatchEvent('click'));
  await expect(popover, 'selector filters popover should close after applying').toBeHidden({ timeout: 15_000 });
}

async function setSelectorMyApplicationsFilterViaPopover(page: Page, enabled: boolean): Promise<void> {
  const openButton = await firstVisibleLocator(page, SEL.selectorFilterPopoverButton, 'selector filters popover button', 15_000);
  await openButton.click({ timeout: 10_000 }).catch(async () => openButton.dispatchEvent('click'));

  const popover = page.locator(SEL.selectorFiltersPopover).last();
  await expect(popover, 'selector filters popover should open').toBeVisible({ timeout: 15_000 });

  const checkbox = popover.locator(SEL.selectorMyApplicationsCheckbox).first();
  await expect(checkbox, 'My applications checkbox should be visible in filters popover').toBeVisible({ timeout: 10_000 });
  if ((await ionCheckboxChecked(checkbox)) !== enabled) {
    await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
  }
  await expect
    .poll(() => ionCheckboxChecked(checkbox), {
      message: `My applications checkbox should be ${enabled ? 'checked' : 'unchecked'}`,
      timeout: 10_000,
    })
    .toBe(enabled);

  const apply = popover.locator(SEL.selectorApplyFiltersButton).first();
  await expect(apply, 'filters popover apply button should be visible').toBeVisible({ timeout: 10_000 });
  await apply.click({ timeout: 10_000 }).catch(async () => apply.dispatchEvent('click'));
  await expect(popover, 'selector filters popover should close after applying').toBeHidden({ timeout: 15_000 });
}

async function ionCheckboxChecked(checkbox: Locator): Promise<boolean> {
  return checkbox.evaluate((el) => {
    const host = el as HTMLElement & { checked?: boolean };
    const input = host.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    return (
      host.checked === true ||
      input?.checked === true ||
      host.classList.contains('checkbox-checked') ||
      host.getAttribute('aria-checked') === 'true'
    );
  });
}

async function selectorApplicationVisible(page: Page, title: string): Promise<boolean> {
  return page.evaluate(({ expectedTitle }) => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const isFolderCard = (card: HTMLElement) =>
      card.classList.contains('card-container--folder') ||
      !!card.querySelector('ion-icon[src*="folder.svg"], ion-icon[src*="folder-open.svg"], img[src*="folder.svg"], img[src*="folder-open.svg"]');

    return [...document.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')]
      .filter(visible)
      .some((card) => !isFolderCard(card as HTMLElement) && normalize((card as HTMLElement).innerText).includes(expectedTitle));
  }, { expectedTitle: title });
}

async function selectorFolderVisible(page: Page, title: string): Promise<boolean> {
  return page.evaluate((expectedTitle) => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const isFolderCard = (card: HTMLElement) =>
      card.classList.contains('card-container--folder') ||
      !!card.querySelector('ion-icon[src*="folder.svg"], ion-icon[src*="folder-open.svg"], img[src*="folder.svg"], img[src*="folder-open.svg"]');

    return [...document.querySelectorAll('[id^="idcard"]:not([id^="idcardO"])')]
      .filter(visible)
      .some((card) => isFolderCard(card) && normalize(card.innerText).includes(expectedTitle));
  }, title);
}

/**
 * From the selector/home (where login lands), create a blank form and land in
 * the editor. Returns the new form's id (from the editor URL).
 */
export async function createBlankForm(page: Page, title = `E2E ${Date.now()}`): Promise<string> {
  const alert = await openCreateApplicationPrompt(page);
  const input = alert.locator(SEL.createFormTitleInput).first();
  await expect(input, 'create form title input should be visible').toBeVisible({ timeout: 15_000 });
  await input.fill(title, { timeout: 15_000 });
  await expect(input, 'create form title should be filled before saving').toHaveValue(title, { timeout: 10_000 });

  const save = alert.locator(SEL.createFormSaveButton).first();
  await expect(save, 'create form save button should be visible').toBeVisible({ timeout: 10_000 });
  await expect
    .poll(
      async () => {
        if (!(await save.isVisible({ timeout: 500 }).catch(() => false))) {
          return false;
        }
        return save.evaluate((el) => {
          const element = el as HTMLElement & { disabled?: boolean };
          const style = window.getComputedStyle(element);
          return element.disabled !== true && element.getAttribute('aria-disabled') !== 'true' && style.pointerEvents !== 'none';
        });
      },
      {
        message: 'create form save button should become enabled',
        timeout: 10_000,
      },
    )
    .toBe(true);

  await save.click({ timeout: 10_000 });

  if (!(await expectRoute(page, ROUTE.editor, 60_000).then(() => true).catch(() => false))) {
    if (!(await openCreatedFormFromSelector(page, title))) {
      const createdInSelector = await page.getByText(title, { exact: true }).first().isVisible({ timeout: 2_000 }).catch(() => false);
      throw new Error(
        createdInSelector
          ? `form "${title}" was created but could not be opened in the editor; current URL is ${page.url()}`
          : `form "${title}" was not opened in the editor after creation; current URL is ${page.url()}`,
      );
    }
  }

  const id = editorFormId(page.url());
  if (!id) throw new Error('could not read the new form id from the editor URL');
  // Wait for the editor to be interactive (palette rendered) before returning,
  // otherwise a follow-up addComponent fires before the canvas can accept it.
  await page.locator('[draggable="true"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_500);
  return id;
}

async function openCreatedFormFromSelector(page: Page, title: string): Promise<boolean> {
  if (!(await selectorIsReady(page, 2_000))) {
    await login(page);
  }

  await waitForSelectorHomeReadyForCreate(page);
  const cards = page.locator('[id^="idcard"]:not([id^="idcardO"])');
  let card = cards.filter({ hasText: title }).first();
  if (!(await card.isVisible({ timeout: 10_000 }).catch(() => false))) {
    card = cards.filter({ hasText: title.slice(0, 29) }).first();
  }
  if (!(await card.isVisible({ timeout: 10_000 }).catch(() => false))) {
    return false;
  }

  await card.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  await card.click({ timeout: 10_000 }).catch(async () => card.dispatchEvent('click'));
  return expectRoute(page, ROUTE.editor, 60_000)
    .then(() => true)
    .catch(() => false);
}

function editorFormId(url: string): string | null {
  return url.match(/\/editor\/([^/?#]+)/)?.[1] ?? url.match(/\/login\/([^/?#]+)\/editorPage(?:\/|$)/)?.[1] ?? null;
}

async function openCreateFormPrompt(page: Page): Promise<Locator> {
  const alertSelector = 'ion-alert.alert-custom-createapp:not(.overlay-hidden)';
  await waitForSelectorHomeReadyForCreate(page);

  const card = await firstVisibleLocator(page, SEL.blankFormCard, 'blank form card', 15_000);
  await card.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
  await card.click({ timeout: 10_000 });

  const alert = page.locator(alertSelector).last();
  await expect(alert, 'create form prompt should be visible after one blank-form click').toBeVisible({ timeout: 15_000 });
  return alert;
}

async function waitForSelectorHomeReadyForCreate(page: Page): Promise<void> {
  await expect
    .poll(() => selectorIsReady(page, 1_000), {
      message: 'selector page should be ready before creating a form',
      timeout: 30_000,
    })
    .toBe(true);
  await waitForIonicLoading(page, 10_000);
  await waitForSelectorFormListLoaded(page);
}

async function waitForSelectorFormListLoaded(page: Page): Promise<void> {
  await expect
    .poll(() => selectorFormListState(page), {
      message: 'selector form list should finish loading before creating a form',
      timeout: 30_000,
    })
    .toMatch(/^ready:/);
}

async function selectorFormListState(page: Page): Promise<string> {
  const root = await selectorPageRoot(page);
  const text = await root.innerText({ timeout: 500 }).catch(() => '');
  const count = selectorResultCount(text);
  const skeletonCount = await root.locator('ion-skeleton-text:visible').count().catch(() => 0);
  if (skeletonCount > 0 || count == null) {
    if (skeletonCount === 0) {
      const hasLegacyCreateCard = await root.locator(SEL.blankFormCard).first().isVisible({ timeout: 500 }).catch(() => false);
      const hasLegacyApplicationCard = await root
        .locator(`${SEL.selectorCardTitle}, ${SEL.selectorListTitle}, [id^="idcard"]:not([id^="idcardO"])`)
        .first()
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (hasLegacyCreateCard || hasLegacyApplicationCard) {
        return hasLegacyApplicationCard ? 'ready:legacy-cards' : 'ready:legacy-create';
      }
    }
    return `loading:count=${count ?? 'unset'} skeletons=${skeletonCount}`;
  }

  if (count === 0) {
    return SELECTOR_EMPTY_FORM_LIST_RE.test(text) ? 'ready:empty' : 'loading:empty-message-missing';
  }

  const hasCard = await root
    .locator(`${SEL.selectorCardTitle}, ${SEL.selectorListTitle}, [id^="idcard"]:not([id^="idcardO"])`)
    .first()
    .isVisible({ timeout: 500 })
    .catch(() => false);
  return hasCard ? `ready:cards:${count}` : `loading:cards-missing:${count}`;
}

function selectorResultCount(text: string): number | null {
  const match = text.match(SELECTOR_RESULT_COUNT_RE);
  return match ? Number(match[1]) : null;
}

async function waitForPresentedCreateFormAlert(alert: Locator): Promise<void> {
  await waitForPresentedPromptInput(alert, 'create form prompt should be presented and editable');
}

async function selectorPageRoot(page: Page): Promise<Locator> {
  const root = page.locator(SEL.selectorPageRoot).first();
  if (await root.isVisible({ timeout: 500 }).catch(() => false)) {
    return root;
  }
  return page.locator('body');
}

async function waitForPresentedPromptInput(alert: Locator, message: string): Promise<void> {
  await expect
    .poll(
      () =>
        alert.evaluate((el) => {
          const host = el as HTMLElement;
          const wrapper = host.querySelector('.alert-wrapper') as HTMLElement | null;
          const input = host.querySelector('input.alert-input') as HTMLInputElement | null;
          if (!wrapper || !input || host.classList.contains('overlay-hidden')) {
            return false;
          }

          const wrapperStyle = window.getComputedStyle(wrapper);
          const inputStyle = window.getComputedStyle(input);
          const rect = input.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            wrapperStyle.display !== 'none' &&
            wrapperStyle.visibility !== 'hidden' &&
            inputStyle.display !== 'none' &&
            inputStyle.visibility !== 'hidden' &&
            !input.disabled &&
            !input.readOnly
          );
        }),
      {
        message,
        timeout: 15_000,
      },
    )
    .toBe(true);
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
  if (await paletteTileForIconOrNull(page, waitForIcon, 1_000)) {
    return;
  }
  if (!(await page.locator(SEL.componentPaletteSearch).first().isVisible({ timeout: 1_000 }).catch(() => false))) {
    await clickFirstVisible(page, SEL.componentPanelButton, 'component palette panel');
  }
  for (let attempt = 0; attempt < 8; attempt++) {
    if (await paletteTileForIconOrNull(page, waitForIcon, 500)) {
      return;
    }
    await page.locator(tileSelector).first().scrollIntoViewIfNeeded().catch(() => undefined);
    if (await paletteTileForIconOrNull(page, waitForIcon, 500)) {
      return;
    }
    await page.mouse.move(180, 350);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(250);
  }
  await paletteTileForIcon(page, waitForIcon, `component palette tile ${waitForIcon}`);
}

export async function openWorkflowsPanel(page: Page): Promise<void> {
  await acceptRgpdIfVisible(page);
  if (await page.locator(`${SEL.businessLogicComponent}:visible`).first().isVisible({ timeout: 1_000 }).catch(() => false)) {
    return;
  }
  await clickFirstVisible(page, SEL.workflowsPanelButton, 'workflows panel');
  await page.waitForTimeout(800);
}

export async function openFirstWorkflowSection(page: Page): Promise<void> {
  await test.step('Open the first Workflows section', async () => {
    await openWorkflowsPanel(page);
    await expect(page.locator(SEL.workflowsSearchbar).first(), 'Workflows panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    const entry = page.locator(SEL.workflowEntry).first();
    await expect(entry, 'the first Workflows entry should be visible').toBeVisible({ timeout: 15_000 });
    await entry.click({ timeout: 10_000 }).catch(async () => entry.dispatchEvent('click'));
    await page.waitForTimeout(800);
  });
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
    const tile = await paletteTileForIcon(page, PALETTE_ICON.businessLogic, 'business logic formula palette tile');
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

export async function addComponent(page: Page, icon: string, options: AddComponentOptions = {}): Promise<void> {
  const before = await countComponents(page);
  for (let attempt = 0; attempt < 3; attempt++) {
    await acceptRgpdIfVisible(page);
    const tile = await paletteTileForIcon(page, icon, `component palette tile ${icon}`);
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
  if (options.allowEditorApiFallback === false) {
    throw new Error(`component with icon ${icon} was not added to the page through the palette UI`);
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

async function openImportFileUploadModalFromPreview(page: Page): Promise<Locator> {
  return test.step('Open Import file upload modal from preview', async () => {
    await expectRoute(page, ROUTE.viewer);
    const component = page.locator(`${SEL.fileComponent}:visible`).first();
    await expect(component, 'Import file component should be visible in preview before opening the modal').toBeVisible({
      timeout: 30_000,
    });
    await component.scrollIntoViewIfNeeded();

    const button = component.locator('ion-button:visible, button:visible').first();
    await expect(button, 'Import file preview should expose a visible add-file button').toBeVisible({ timeout: 10_000 });
    await button.click({ timeout: 10_000 }).catch(async () => component.click({ timeout: 10_000 }));

    const modal = page.locator('ion-modal:not(.overlay-hidden)').last();
    await expect(modal, 'Import file click should open a modal').toBeVisible({ timeout: 30_000 });
    await expect(modal.locator('input[type="file"]').first(), 'Import file modal should contain a file input').toBeAttached({
      timeout: 30_000,
    });
    return modal;
  });
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

async function paletteTileForIcon(page: Page, icon: string, description: string, timeout = 30_000): Promise<Locator> {
  const locator = await paletteTileForIconOrNull(page, icon, timeout);
  if (!locator) {
    throw new Error(`No visible ${description} found for icon ${icon}`);
  }
  return locator;
}

async function draggablePaletteTileForIcon(page: Page, icon: string, description: string, timeout = 30_000): Promise<Locator> {
  await paletteTileForIcon(page, icon, description, timeout);
  const locator = await firstVisibleLocatorOrNull(page, draggableComponentPaletteTileSelector(icon), timeout);
  if (!locator) {
    throw new Error(`No visible draggable ${description} found for icon ${icon}`);
  }
  return locator;
}

async function paletteTileForIconOrNull(page: Page, icon: string, timeout: number): Promise<Locator | null> {
  const startedAt = Date.now();
  const tileSelector = componentPaletteTileSelector(icon);
  const byIcon = await firstVisibleLocatorOrNull(page, tileSelector, Math.min(timeout, 1_000));
  if (byIcon) {
    return byIcon;
  }

  const searchTerm = PALETTE_SEARCH_TERM_BY_ICON[icon];
  const remainingAfterIcon = Math.max(0, timeout - (Date.now() - startedAt));
  if (!searchTerm || remainingAfterIcon <= 0) {
    return firstVisibleLocatorOrNull(page, tileSelector, remainingAfterIcon);
  }

  const searchbar = page.locator(SEL.componentPaletteSearch).first();
  if (!(await searchbar.isVisible({ timeout: Math.min(remainingAfterIcon, 1_000) }).catch(() => false))) {
    return firstVisibleLocatorOrNull(page, tileSelector, Math.max(0, timeout - (Date.now() - startedAt)));
  }

  await fillComponentPaletteSearch(page, searchTerm);
  const remainingAfterSearch = Math.max(0, timeout - (Date.now() - startedAt));
  return firstVisibleLocatorOrNull(page, paletteTileCandidateSelector(), remainingAfterSearch);
}

async function fillComponentPaletteSearch(page: Page, query: string): Promise<void> {
  const searchbar = page.locator(SEL.componentPaletteSearch).first();
  await expect(searchbar, 'component palette search should be visible').toBeVisible({ timeout: 15_000 });
  await searchbar.evaluate((element, value) => {
    const search = element as HTMLElement & { value?: string; shadowRoot?: ShadowRoot | null };
    const root = search.shadowRoot ?? search;
    const input = root.querySelector('input') as HTMLInputElement | null;
    search.value = value;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
    search.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, composed: true, detail: { value } }));
    search.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
  }, query);
  await page.waitForTimeout(300);
}

function paletteTileCandidateSelector(): string {
  return [
    '#bloc-palette [draggable="true"]',
    '#bloc-palette ion-col.class1650357035574',
    'ion-col.class1650357035574',
  ].join(', ');
}

function componentPaletteTileSelector(icon: string): string {
  return [
    `#bloc-palette [draggable="true"]:has(img[src$="${icon}"])`,
    `#bloc-palette ion-col.class1650357035574:has(img[src$="${icon}"])`,
    `[draggable="true"]:has(img[src$="${icon}"])`,
    `ion-col.class1650357035574:has(img[src$="${icon}"])`,
  ].join(', ');
}

function draggableComponentPaletteTileSelector(icon: string): string {
  return [
    `#bloc-palette [draggable="true"]:has(img[src$="${icon}"])`,
    `[draggable="true"]:has(img[src$="${icon}"])`,
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

async function firstVisibleChildOrNull(root: Locator, selector: string, timeout: number): Promise<Locator | null> {
  const startedAt = Date.now();
  do {
    const elements = root.locator(selector);
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      if (await elements.nth(i).isVisible().catch(() => false)) {
        return elements.nth(i);
      }
    }
    if (timeout <= 0) {
      return null;
    }
    await root.page().waitForTimeout(100);
  } while (Date.now() - startedAt < timeout);

  const elements = root.locator(selector);
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
  const currentText = await editorBody.innerText().catch(() => '');
  if (!normalizeVisibleText(currentText).includes(value)) {
    await editorBody.click();
    await editorBody.evaluate((element, text) => {
      const holder = document.createElement('div');
      holder.textContent = text;
      element.innerHTML = holder.innerHTML;
      element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: text, inputType: 'insertText' }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    }, value);
    await page.keyboard.press('Tab');
    await fireActiveTinyMceChange(page);
  }
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

export async function openButtonStateConfigBySelector(page: Page, componentTag = SEL.buttonComponent): Promise<void> {
  await openComponentConfig(page, componentTag);
  await openConfigTabById(page, 'button_state_tab_selector');
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

const VISIBILITY_CONDITION_ELEMENT_PLACEHOLDER_RE =
  /^(Element|L['\u2019]\u00e9l\u00e9ment|El elemento|L['\u2019]elemento)$/i;
const VISIBILITY_CONDITION_COLUMN_PLACEHOLDER_RE = /^(Column|La colonne|La columna|La colonna)$/i;

export async function addVisibilityConditionAndExpectGenericElementPlaceholder(page: Page): Promise<void> {
  await test.step('Add a Visibility condition and assert the left field placeholder is generic', async () => {
    await activateVisibilityConditionMode(page);
    await page.locator(SEL.visibilityAddConditionButton).first().click();

    const fieldInput = page.locator(SEL.conditionFieldInput).first();
    await expect(fieldInput, 'the left-hand Visibility condition field should be visible').toBeVisible({
      timeout: 10_000,
    });

    await expect
      .poll(
        async () => normalizeWhitespace((await fieldInput.getAttribute('placeholder')) ?? ''),
        {
          message: 'Visibility condition field placeholder should describe a generic element, not a grid column',
          timeout: 10_000,
        },
      )
      .toMatch(VISIBILITY_CONDITION_ELEMENT_PLACEHOLDER_RE);

    const placeholder = normalizeWhitespace((await fieldInput.getAttribute('placeholder')) ?? '');
    expect(placeholder, 'Visibility condition field placeholder should not reuse the Grid column wording').not.toMatch(
      VISIBILITY_CONDITION_COLUMN_PLACEHOLDER_RE,
    );
  });
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

export async function expectVisibilityConditionConfigured(
  page: Page,
  fieldTechnicalId: string,
  operator: VisibilityOperator,
  value?: string,
): Promise<void> {
  await expect(page.locator(SEL.visibilityAddConditionButton).first(), 'visibility condition controls should remain visible').toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(SEL.conditionFieldInput).first(), 'visibility condition field should remain configured').toHaveValue(
    fieldTechnicalId,
    { timeout: 10_000 },
  );

  const select = page.locator(SEL.conditionOperatorSelect).first();
  await expect
    .poll(() => select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
      message: `visibility operator should remain ${operator}`,
      timeout: 10_000,
    })
    .toBe(operator);

  if (value != null) {
    await expectVisibilityValueTextEditorToContain(page, value);
  }
}

export async function fillVisibilityTagValue(page: Page, value: string): Promise<void> {
  const tagInput = page.locator('tag-input:visible').last();
  const input = tagInput.locator('input').first();
  await expect(input, 'visibility tag value input should be visible').toBeVisible({ timeout: 10_000 });
  await input.fill(value);
  await page.keyboard.press('Enter');
  await expect(tagInput.locator('tag').filter({ hasText: value }).first(), `visibility tag ${value} should be added`).toBeVisible({
    timeout: 10_000,
  });
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

export interface ButtonStateConditionSpec extends VisibilityConditionSpec {
  mode?: Exclude<ButtonStateMode, 'always_enabled'>;
}

export async function addButtonStateCondition(page: Page, spec: ButtonStateConditionSpec): Promise<void> {
  await activateButtonStateConditionMode(page, spec.mode ?? 'enabled_when_condition');
  await page.locator(SEL.visibilityAddConditionButton).first().click();
  await page.locator(SEL.conditionFieldBrowseButton).first().click();
  await page.locator('ion-popover ion-item').filter({ hasText: spec.field }).first().click();
  await expect(page.locator(SEL.conditionFieldInput).first(), 'button state condition field should be configured').toHaveValue(
    spec.field,
    { timeout: 10_000 },
  );

  await setVisibilityOperator(page, spec.operator);

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

async function lastVisibleLocator(page: Page, selector: string, description: string, timeout = 15_000): Promise<Locator> {
  const deadline = Date.now() + timeout;
  let lastCount = 0;

  while (Date.now() < deadline) {
    const elements = page.locator(selector);
    const count = await elements.count();
    lastCount = count;

    for (let i = count - 1; i >= 0; i--) {
      const candidate = elements.nth(i);
      if (await candidate.isVisible({ timeout: 500 }).catch(() => false)) {
        return candidate;
      }
    }
    await page.waitForTimeout(250);
  }

  throw new Error(`No visible ${description} found for selector ${selector} (${lastCount} candidates)`);
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

export async function dragUserNamePaletteToTinyMce(page: Page): Promise<void> {
  const labels = ['name', 'nom', 'nombre', 'nome'];
  await ensureSourcePaletteSectionExpanded(page, 'user');

  const visibleEntries = await page
    .locator(`${SOURCE_PALETTE_SECTION.user.body} [draggable="true"]:visible`)
    .evaluateAll((elements) => elements.map((element) => (element.textContent ?? '').replace(/\s+/g, ' ').trim()));
  const label =
    labels.find((candidate) => visibleEntries.some((entry) => entry.toLowerCase() === candidate.toLowerCase())) ??
    labels.find((candidate) => visibleEntries.some((entry) => entry.toLowerCase().includes(candidate.toLowerCase()))) ??
    'name';

  await dragSourcePaletteEntryToTinyMceStrict(page, 'user', label);
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

export async function dropSourcePaletteEntryIntoVisibleMonaco(
  page: Page,
  section: SourcePaletteSection,
  label: string,
  expectedText: string,
): Promise<MonacoDropPayload> {
  await ensureSourcePaletteSectionExpanded(page, section, label);
  const editor = await visibleMonacoEditor(page, 'Monaco editor receiving a Source Palette drop');
  const tile = sourcePaletteEntryLocator(page, label);
  await expect(tile, `source palette entry ${label} should be visible`).toBeVisible({ timeout: 15_000 });

  const payload = await page.evaluate((entryLabel) => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el as HTMLElement);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };

    const source = [...document.querySelectorAll('[draggable="true"]')]
      .filter(visible)
      .filter((el) => (el.textContent ?? '').includes(entryLabel))
      .pop();
    const target = [...document.querySelectorAll('c8oforms-monacoeditor .monaco-editor')].filter(visible).pop();
    if (!source || !target) {
      throw new Error(`missing Source Palette entry or Monaco editor: source=${!!source} target=${!!target}`);
    }

    const box = target.getBoundingClientRect();
    const dataTransfer = new DataTransfer();
    const eventInit = {
      bubbles: true,
      cancelable: true,
      dataTransfer,
      clientX: box.left + box.width * 0.4,
      clientY: box.top + box.height * 0.45,
    };

    source.dispatchEvent(new DragEvent('dragstart', eventInit));
    const out = {
      types: Array.from(dataTransfer.types),
      textData: dataTransfer.getData('text'),
      plainData: dataTransfer.getData('text/plain'),
      htmlData: dataTransfer.getData('text/html'),
      typeData: dataTransfer.getData('type'),
      internalData: dataTransfer.getData('__c8oformsdrag_source'),
    };
    target.dispatchEvent(new DragEvent('dragover', eventInit));
    target.dispatchEvent(new DragEvent('drop', eventInit));
    return out;
  }, label);

  await expect
    .poll(() => editor.innerText().then(normalizeVisibleText), {
      message: `Source Palette drop should insert ${expectedText} into Monaco; payload=${JSON.stringify(payload)}`,
      timeout: 15_000,
    })
    .toContain(expectedText);
  return payload;
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

async function clickTinyMcePathBadgeEditButton(page: Page): Promise<void> {
  const frameBadge = page.frameLocator('iframe[title="Rich Text Area"]').last().locator('svg[id^="clickable-"]').first();
  if (await frameBadge.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await frameBadge.click();
    return;
  }

  const inlineBadge = page.locator('svg[id^="clickable-"], span[c8otype="path"], span.styleBadge').last();
  await expect(inlineBadge, 'TinyMCE path badge edit button should be visible').toBeVisible({ timeout: 10_000 });
  await inlineBadge.click();
}

async function tinyMcePathBadgePaths(page: Page): Promise<string[]> {
  const frameBody = page.frameLocator('iframe[title="Rich Text Area"]').last().locator('body');
  if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
    return frameBody.evaluate((body) =>
      Array.from(body.querySelectorAll<HTMLElement>('[c8opath]'))
        .map((element) => element.getAttribute('c8opath') ?? '')
        .filter(Boolean),
    );
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'TinyMCE editor should be visible before reading path badges').toBeVisible({ timeout: 10_000 });
  return inlineEditor.evaluate((body) =>
    Array.from(body.querySelectorAll<HTMLElement>('[c8opath]'))
      .map((element) => element.getAttribute('c8opath') ?? '')
      .filter(Boolean),
  );
}

async function clickChooseButtonForTreeLabel(page: Page, label: string): Promise<void> {
  const center = await page.evaluate((wantedLabel) => {
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
    };
    const modal = [...document.querySelectorAll('ion-modal.modalCSV')].filter(visible).pop();
    if (!modal) return null;

    const labelEl = [...modal.querySelectorAll('ion-label, p, span, div')]
      .filter(visible)
      .find((el) => (el.textContent ?? '').trim() === wantedLabel);
    if (!labelEl) return null;

    const labelBox = (labelEl as HTMLElement).getBoundingClientRect();
    const labelY = labelBox.y + labelBox.height / 2;
    const buttons = [...modal.querySelectorAll('ion-button, button')]
      .filter(visible)
      .filter((el) => !(el as HTMLButtonElement).disabled);

    let best: DOMRect | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const button of buttons) {
      const box = (button as HTMLElement).getBoundingClientRect();
      if (box.x < labelBox.x) continue;
      const score = Math.abs(box.y + box.height / 2 - labelY) + Math.max(0, box.x - labelBox.x - 500);
      if (score < bestScore) {
        bestScore = score;
        best = box;
      }
    }
    return best ? { x: best.x + best.width / 2, y: best.y + best.height / 2 } : null;
  }, label);

  expect(center, `could not find a choose-value button for ${label}`).not.toBeNull();
  await page.mouse.click(center!.x, center!.y);
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

export async function addPageThroughPagesPanel(page: Page): Promise<string> {
  return test.step('Add a page through the Pages panel', async () => {
    await openPagesPanel(page);
    const pageRows = page.locator(SEL.pageRow);
    const beforeNames = await visiblePageRowNames(pageRows);
    const addPage = await firstVisibleLocator(page, SEL.pageAddButton, 'Pages add page button', 15_000);
    await addPage.click({ timeout: 10_000 }).catch(async () => addPage.dispatchEvent('click'));
    await expect
      .poll(() => visiblePageRowNames(pageRows), {
        message: 'adding a page should create a new page row',
        timeout: 15_000,
      })
      .toHaveLength(beforeNames.length + 1);
    const afterNames = await visiblePageRowNames(pageRows);
    const newPageName = afterNames.find((name) => !beforeNames.includes(name));
    if (!newPageName) {
      throw new Error(`Could not identify the newly added page. Before: ${beforeNames.join(', ')}; after: ${afterNames.join(', ')}`);
    }
    await expect(pageRows.filter({ hasText: newPageName }).first(), `new page ${newPageName} should be listed`).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(1_000);
    return newPageName;
  });
}

async function visiblePageRowNames(pageRows: Locator): Promise<string[]> {
  const names: string[] = [];
  const count = await pageRows.count();
  for (let index = 0; index < count; index++) {
    const row = pageRows.nth(index);
    if (!(await row.isVisible().catch(() => false))) {
      continue;
    }
    const text = (await row.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const match = text.match(/\bPage\s+\d+\b/);
    if (match && !names.includes(match[0])) {
      names.push(match[0]);
    }
  }
  return names;
}

export async function openComponentNavigationConfig(page: Page, componentSelector: string): Promise<void> {
  await test.step('Open component Navigation configuration', async () => {
    await openComponentConfig(page, componentSelector);
    await openConfigTabById(page, 'navigation_tab_selector');
    await expect(page.locator('c8oforms-filterbradd').first(), 'Navigation condition add controls should be visible').toBeVisible({
      timeout: 15_000,
    });
  });
}

export type NavigationFilterOperator = 'equals' | 'different' | 'contains' | 'not_contains' | 'equal' | 'not_equal';

export interface NavigationFilterSpec {
  field: string;
  value: string;
  operator?: NavigationFilterOperator;
  action?: 'goTo' | 'authorize';
  pageName?: string;
}

export async function configureComponentNavigationFilter(page: Page, spec: NavigationFilterSpec): Promise<void> {
  await test.step(`Configure component Navigation filter ${spec.field} = ${spec.value}`, async () => {
    await ensureNavigationFilterRow(page);
    const currentField = await navigationFilterFieldInput(page).inputValue().catch(() => '');
    if (currentField !== spec.field) {
      await selectNavigationFilterField(page, spec.field);
    }
    await selectIonOptionByValue(page, navigationFilterOperatorSelect(page), spec.operator ?? 'equals', 'Navigation filter operator');
    await expectNavigationFilterUsesTextValueEditor(page);
    await fillVisibilityValueTextEditor(page, spec.value);
    await expectVisibilityValueTextEditorToContain(page, spec.value);
    if (spec.action) {
      await selectIonOptionByValue(page, navigationFilterActionSelect(page), spec.action, 'Navigation filter action');
    }
    if (spec.pageName) {
      await selectNavigationFilterTargetPage(page, spec.pageName);
    }
    await page.waitForTimeout(1_000);
  });
}

export async function expectComponentNavigationFilter(page: Page, spec: NavigationFilterSpec): Promise<void> {
  await test.step(`Assert component Navigation filter persisted ${spec.field} = ${spec.value}`, async () => {
    const row = navigationFilterRow(page);
    await expect(row, 'Navigation filter row should be visible after reopening').toBeVisible({ timeout: 15_000 });
    await expect(navigationFilterFieldInput(page), 'Navigation filter field should persist').toHaveValue(spec.field, {
      timeout: 10_000,
    });
    await expect
      .poll(() => navigationFilterOperatorSelect(page).evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
        message: `Navigation filter operator should persist as ${spec.operator ?? 'equals'}`,
        timeout: 10_000,
      })
      .toBe(spec.operator ?? 'equals');
    await expectNavigationFilterUsesTextValueEditor(page);
    await expectVisibilityValueTextEditorToContain(page, spec.value);
    if (spec.action) {
      await expect
        .poll(() => navigationFilterActionSelect(page).evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
          message: `Navigation filter action should persist as ${spec.action}`,
          timeout: 10_000,
        })
        .toBe(spec.action);
    }
    if (spec.pageName) {
      await expect(navigationFilterTargetPageSelect(page), `Navigation filter target page should show ${spec.pageName}`).toContainText(
        spec.pageName,
        { timeout: 10_000 },
      );
    }
  });
}

async function ensureNavigationFilterRow(page: Page): Promise<void> {
  if (await navigationFilterRow(page).isVisible({ timeout: 1_000 }).catch(() => false)) {
    return;
  }
  const addNavigationRule = page
    .locator('c8oforms-filterbradd ion-button.class1758191882625:visible, c8oforms-filterbradd ion-button:has-text("Add navigation rule"):visible')
    .first();
  await expect(addNavigationRule, 'Navigation Add navigation rule button should be visible').toBeVisible({ timeout: 15_000 });
  await addNavigationRule.click({ timeout: 10_000 }).catch(async () => addNavigationRule.dispatchEvent('click'));
  await expect(navigationFilterRow(page), 'Navigation filter row should be added').toBeVisible({ timeout: 15_000 });
}

async function selectNavigationFilterField(page: Page, fieldTechnicalId: string): Promise<void> {
  const browse = navigationFilterRow(page).locator('ion-button.class1758189195718').first();
  await expect(browse, 'Navigation filter field browse button should be visible').toBeVisible({ timeout: 15_000 });
  await browse.click({ timeout: 10_000 }).catch(async () => browse.dispatchEvent('click'));

  const popover = page.locator('ion-popover:not(.overlay-hidden)').last();
  await expect(popover, 'Navigation filter field picker should open').toBeVisible({ timeout: 15_000 });
  const search = popover.locator('ion-searchbar input, input[type="search"], input').first();
  if (await search.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await search.fill(fieldTechnicalId);
    await page.waitForTimeout(300);
  }
  const option = popover.locator('ion-item, button, [role="option"]').filter({ hasText: fieldTechnicalId }).first();
  await expect(option, `Navigation filter field ${fieldTechnicalId} should be selectable`).toBeVisible({ timeout: 15_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(navigationFilterFieldInput(page), 'Navigation filter field should be configured').toHaveValue(fieldTechnicalId, {
    timeout: 10_000,
  });
}

async function selectNavigationFilterTargetPage(page: Page, pageName: string): Promise<void> {
  const select = navigationFilterTargetPageSelect(page);
  await expect(select, 'Navigation filter target page select should be visible').toBeVisible({ timeout: 15_000 });
  await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
  const items = page.locator('ion-select-popover ion-item');
  await items.first().waitFor({ state: 'visible', timeout: 8_000 });
  const option = items.filter({ hasText: pageName }).first();
  await expect(option, `Navigation target page ${pageName} should be selectable`).toBeVisible({ timeout: 10_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(select, `Navigation target page should display ${pageName}`).toContainText(pageName, { timeout: 10_000 });
}

async function selectIonOptionByValue(page: Page, select: Locator, value: string, description: string): Promise<void> {
  await expect(select, `${description} select should be visible`).toBeVisible({ timeout: 15_000 });
  const optionIndex = await select.evaluate(
    (el, expectedValue) =>
      Array.from(el.querySelectorAll('ion-select-option')).findIndex(
        (option) => String((option as HTMLElement & { value?: unknown }).value ?? option.getAttribute('value') ?? '') === expectedValue,
      ),
    value,
  );
  if (optionIndex < 0) {
    throw new Error(`${description} option ${value} should exist`);
  }
  await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
  const items = page.locator('ion-select-popover ion-item');
  await items.first().waitFor({ state: 'visible', timeout: 8_000 });
  await items.nth(optionIndex).click({ timeout: 10_000 }).catch(async () => items.nth(optionIndex).dispatchEvent('click'));
  await expect
    .poll(() => select.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
      message: `${description} should be ${value}`,
      timeout: 10_000,
    })
    .toBe(value);
}

async function expectNavigationFilterUsesTextValueEditor(page: Page): Promise<void> {
  await expect(
    page.locator('c8oforms-filterbr:visible tag-input input:visible'),
    'Select page Navigation filters should use the simple text value editor, not the chip editor',
  ).toHaveCount(0, { timeout: 2_000 });
  await expect(
    page.locator('c8oforms-filterbr:visible .tox-edit-area, c8oforms-filterbr:visible [contenteditable="true"].mce-content-body').last(),
    'Navigation filter text value editor should be visible',
  ).toBeVisible({ timeout: 15_000 });
}

function navigationFilterRow(page: Page): Locator {
  return page.locator('c8oforms-filterbr:visible').first();
}

function navigationFilterFieldInput(page: Page): Locator {
  return navigationFilterRow(page).locator('ion-input.class1758189195706 input, .class1758189195706 input').first();
}

function navigationFilterOperatorSelect(page: Page): Locator {
  return navigationFilterRow(page).locator('ion-select.class1758189195757').first();
}

function navigationFilterActionSelect(page: Page): Locator {
  return navigationFilterGroup(page).locator('ion-select.class1776120500008').first();
}

function navigationFilterTargetPageSelect(page: Page): Locator {
  return navigationFilterGroup(page).locator('ion-select.class1776120500019').first();
}

function navigationFilterGroup(page: Page): Locator {
  return page.locator('c8oforms-visibleifgroupeditor:visible').first();
}

export async function expectPagesPanelDefaultAfterWorkflowNavigation(page: Page): Promise<void> {
  await test.step('Navigate from an active workflow to the first page', async () => {
    const button = page.locator(SEL.pagesPanelButton).first();
    await expect(button, 'Pages sidebar button should be visible after opening Workflows').toBeVisible({ timeout: 15_000 });

    await button.click({ timeout: 5_000 }).catch(async () => {
      await button.click({ force: true, timeout: 5_000 });
    });

    await expect(
      page.locator(SEL.pageSearchbar).first(),
      'Pages panel search should replace the active Workflow content after clicking Pages',
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator(SEL.pageRow).first(),
      'Pages panel should show the first page after leaving Workflows',
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator(SEL.pageButtonsBlock).first(),
      'the editor canvas should switch from Workflow content back to the first page',
    ).toBeVisible({ timeout: 15_000 });
  });
}

export async function openApplicationSettingsFromSidebar(page: Page): Promise<void> {
  await test.step('Open application settings from the editor sidebar', async () => {
    const button = await firstVisibleLocator(page, SEL.appSettingsPanelButton, 'application settings sidebar button');
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
    await expect(
      page.locator(SEL.appSettingsCategories).first(),
      'application settings categories should be visible after clicking the settings sidebar button',
    ).toBeVisible({ timeout: 15_000 });
  });
}

export async function expectEditorSidebarButtonsVisible(page: Page): Promise<void> {
  await test.step('Assert editor sidebar buttons remain visible', async () => {
    await firstVisibleLocator(page, SEL.appSettingsPanelButton, 'application settings sidebar button', 10_000);
    await firstVisibleLocator(page, SEL.componentPanelButton, 'component palette sidebar button', 10_000);
    await firstVisibleLocator(page, SEL.pagesPanelButton, 'Pages sidebar button', 10_000);
    await firstVisibleLocator(page, SEL.workflowsPanelButton, 'Workflows sidebar button', 10_000);
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
  const layout = page.locator(SEL.layoutViewer);
  for (let attempt = 0; attempt < 4; attempt++) {
    await acceptRgpdIfVisible(page);
    const tile = await paletteTileForIcon(page, PALETTE_ICON.layout, 'Horizontal layout palette tile');
    await page.waitForTimeout(1_000);
    await tile.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
    await tile.dblclick({ delay: 75, timeout: 5_000 }).catch(async () => {
      await page.waitForTimeout(500);
    });
    try {
      await expect(layout).toHaveCount(1, { timeout: 10_000 });
      return;
    } catch {
      // editor was not interactive yet; retry
    }
  }
  await expect(layout, 'the Horizontal layout was not added to the page').toHaveCount(1, { timeout: 10_000 });
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
  await enableNativeDropDeliveryForLayoutDropZones(page);
  const tile = await draggablePaletteTileForIcon(page, paletteIcon, `palette tile ${paletteIcon}`);
  const container = page.locator(containerSelector).first();
  const children = page.locator(`${containerSelector} ${SEL.layoutChild}`);
  const before = await children.count();

  await dragPaletteComponentWithPointer(page, tile, container, containerSelector, paletteIcon);
  if (await waitForLayoutChildCount(children, before + 1, 6_000)) {
    return;
  }

  await page.mouse.up().catch(() => undefined);
  await page.waitForTimeout(500);
  await dragPaletteComponentWithDragTo(page, tile, container, paletteIcon);
  if (await waitForLayoutChildCount(children, before + 1, 8_000)) {
    return;
  }

  await expect(
    children,
    `dragging ${paletteIcon} into ${containerSelector} should add a nested layout child`,
  ).toHaveCount(before + 1, { timeout: 3_000 });
}

async function enableNativeDropDeliveryForLayoutDropZones(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __c8oLayoutDropDeliveryInstalled?: boolean };
    if (w.__c8oLayoutDropDeliveryInstalled) return;
    w.__c8oLayoutDropDeliveryInstalled = true;
    document.addEventListener(
      'dragover',
      (event) => {
        const dragEvent = event as DragEvent;
        const target = event.target as Element | null;
        const dataTransfer = dragEvent.dataTransfer;
        if (
          target?.closest?.('c8oforms-shareddropindicator, .class1600440331787') &&
          dataTransfer &&
          Array.from(dataTransfer.types || []).includes('__c8oformsdrag')
        ) {
          // Firefox only delivers a native drop if dragover was synchronously
          // cancelled. C8Oforms still handles the real drop event itself.
          dragEvent.preventDefault();
        }
      },
      true,
    );
  });
}

async function dragPaletteComponentWithPointer(
  page: Page,
  tile: Locator,
  container: Locator,
  containerSelector: string,
  paletteIcon: string,
): Promise<void> {
  const tb = await tile.boundingBox();
  if (!tb) throw new Error(`Palette tile not found for icon ${paletteIcon}`);

  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.mouse.down();
  // a small initial move starts the native drag
  await page.mouse.move(tb.x + tb.width / 2 + 10, tb.y + tb.height / 2 + 10, { steps: 6 });

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

async function dragPaletteComponentWithDragTo(
  page: Page,
  tile: Locator,
  container: Locator,
  paletteIcon: string,
): Promise<void> {
  await expect(tile, `draggable palette tile ${paletteIcon} should be visible`).toBeVisible({ timeout: 10_000 });
  await expect(container, 'drop container should be visible').toBeVisible({ timeout: 10_000 });
  await tile.dragTo(container).catch(() => undefined);
  await page.waitForTimeout(1_500);
}

async function waitForLayoutChildCount(children: Locator, expected: number, timeout: number): Promise<boolean> {
  return expect
    .poll(() => children.count(), {
      message: `layout should contain ${expected} nested child component(s)`,
      timeout,
    })
    .toBe(expected)
    .then(() => true)
    .catch(() => false);
}

const LAYOUT_CHILD_COMPONENT_SELECTORS = [
  { type: 'text', selector: `${SEL.textComponent}, c8oforms-itemtexteditor` },
  { type: 'description', selector: `${SEL.descriptionComponent}, c8oforms-itemdescriptioneditor` },
  { type: 'checkbox', selector: `${SEL.checkboxComponent}, c8oforms-itemcheckboxeditor` },
  { type: 'button', selector: `${SEL.buttonComponent}, c8oforms-itembuttoneditor` },
] as const;

export async function layoutChildComponentTypes(page: Page): Promise<string[]> {
  return page.locator(`${SEL.layoutViewer} ${SEL.layoutChild}`).evaluateAll((children, candidates) => {
    return children.map((child) => {
      const element = child as Element;
      for (const candidate of candidates) {
        if (element.querySelector(candidate.selector)) {
          return candidate.type;
        }
      }

      const itemTag = Array.from(element.querySelectorAll('*'))
        .map((descendant) => descendant.tagName.toLowerCase())
        .find((tag) => tag.startsWith('c8oforms-item') && !tag.includes('layouteditor'));
      return itemTag ?? 'unknown';
    });
  }, LAYOUT_CHILD_COMPONENT_SELECTORS);
}

/**
 * Reorder a child already nested in a Horizontal layout by dragging it to the
 * final layout child drop zone. The caller must assert the final DOM order; the
 * helper only performs the user gesture.
 */
export async function moveLayoutChildToEnd(page: Page, fromIndex = 0): Promise<void> {
  await enableNativeDropDeliveryForLayoutDropZones(page);

  await selectAnotherLayoutChild(page, fromIndex);
  const sourceChild = page.locator(`${SEL.layoutViewer} ${SEL.layoutChild}`).nth(fromIndex);
  const source = sourceChild.locator(SEL.layoutChildCard).first();
  await dragLayoutChildToEndWithPointer(page, source, fromIndex);
}

/**
 * Drag an existing nested child to the leading layout drop zone. This is the
 * #1364-sensitive path: beta151 lacks a usable before/between-child drop zone,
 * so the DOM order remains unchanged.
 */
export async function moveLayoutChildToStart(page: Page, fromIndex: number): Promise<void> {
  await enableNativeDropDeliveryForLayoutDropZones(page);

  await selectAnotherLayoutChild(page, fromIndex);
  const sourceChild = page.locator(`${SEL.layoutViewer} ${SEL.layoutChild}`).nth(fromIndex);
  const source = sourceChild.locator(SEL.layoutChildCard).first();
  await dragLayoutChildToStartWithPointer(page, source, fromIndex);
}

async function selectAnotherLayoutChild(page: Page, fromIndex: number): Promise<void> {
  const children = page.locator(`${SEL.layoutViewer} ${SEL.layoutChild}`);
  const count = await children.count();
  if (count < 2) return;

  const otherIndex = fromIndex === 0 ? 1 : 0;
  const other = children.nth(otherIndex);
  const card = other.locator(SEL.layoutChildCard).first();
  const box = (await card.boundingBox().catch(() => null)) ?? (await other.boundingBox().catch(() => null));
  if (!box) return;

  await page.mouse.move(5, 5);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(800);

  if (await page.locator(`${SEL.configClose}:visible`).first().isVisible({ timeout: 1_500 }).catch(() => false)) {
    await closeComponentConfig(page);
    await expect(page.locator(SEL.layoutViewer), 'the Horizontal layout should be visible after closing child editor').toBeVisible({
      timeout: 10_000,
    });
  }
}

async function dragLayoutChildToEndWithPointer(page: Page, source: Locator, fromIndex: number): Promise<void> {
  await source.scrollIntoViewIfNeeded();
  await expect(source, `layout child #${fromIndex} should be visible before dragging`).toBeVisible({ timeout: 10_000 });

  const sourceBox = await source.boundingBox();
  if (!sourceBox) throw new Error(`layout child #${fromIndex} has no bounding box`);

  await page.mouse.move(5, 5);
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, { steps: 8 });
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 14, sourceBox.y + sourceBox.height / 2 + 10, {
    steps: 8,
  });

  const layout = page.locator(SEL.layoutViewer).first();
  const layoutBox = await layout.boundingBox();
  if (!layoutBox) throw new Error('Horizontal layout has no bounding box');

  await page.mouse.move(layoutBox.x + layoutBox.width - 12, layoutBox.y + layoutBox.height / 2, { steps: 25 });
  await page.waitForTimeout(500);

  const zone = await layoutChildDropZoneLocator(page, 1_000);
  const zoneBox = zone ? await zone.boundingBox() : null;
  if (zoneBox) {
    await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + zoneBox.height / 2, { steps: 8 });
  }

  await page.waitForTimeout(250);
  await page.mouse.up();
  await page.waitForTimeout(1_500);
}

async function dragLayoutChildToStartWithPointer(page: Page, source: Locator, fromIndex: number): Promise<void> {
  await source.scrollIntoViewIfNeeded();
  await expect(source, `layout child #${fromIndex} should be visible before dragging`).toBeVisible({ timeout: 10_000 });

  const sourceBox = await source.boundingBox();
  if (!sourceBox) throw new Error(`layout child #${fromIndex} has no bounding box`);

  await page.mouse.move(5, 5);
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, { steps: 8 });
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 - 14, sourceBox.y + sourceBox.height / 2 + 10, {
    steps: 8,
  });

  const layout = page.locator(SEL.layoutViewer).first();
  const layoutBox = await layout.boundingBox();
  if (!layoutBox) throw new Error('Horizontal layout has no bounding box');

  await page.mouse.move(layoutBox.x + 12, layoutBox.y + layoutBox.height / 2, { steps: 25 });
  await page.waitForTimeout(500);

  const zone = await layoutChildLeadingDropZoneLocator(page, 1_000);
  const zoneBox = zone ? await zone.boundingBox() : null;
  if (zoneBox) {
    await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + zoneBox.height / 2, { steps: 8 });
  }

  await page.waitForTimeout(250);
  await page.mouse.up();
  await page.waitForTimeout(1_500);
}

async function layoutChildDropZoneLocator(page: Page, timeout: number): Promise<Locator | null> {
  const selector = [
    `${SEL.layoutViewer} c8oforms-shareddropindicator`,
    `${SEL.layoutViewer} [id*="afterItem"]`,
    `${SEL.layoutViewer} ${SEL.containerInitialDropZone}`,
  ].join(', ');
  return lastVisibleLocator(page, selector, 'layout child reorder drop zone', timeout).catch(() => null);
}

async function layoutChildLeadingDropZoneLocator(page: Page, timeout: number): Promise<Locator | null> {
  const selector = [
    `${SEL.layoutViewer} .class1780324100000 c8oforms-shareddropindicator`,
    `${SEL.layoutViewer} [id*="beforeItem"]`,
  ].join(', ');
  return firstVisibleLocator(page, selector, 'layout child leading drop zone', timeout).catch(() => null);
}

// Helpers for opening a nested layout child's own editor across UI variants.
async function visibleLayoutChildOpenButtonForCard(
  page: Page,
  card: Locator,
  cardBox: { x: number; y: number; width: number; height: number },
): Promise<Locator | null> {
  const scoped = card.locator(SEL.layoutChildOpenButton).first();
  if (await scoped.isVisible({ timeout: 1_500 }).catch(() => false)) {
    return scoped;
  }

  const visibleButtons = page.locator(`${SEL.layoutChildOpenButton}:visible`);
  const count = await visibleButtons.count();
  for (let i = 0; i < count; i++) {
    const candidate = visibleButtons.nth(i);
    const box = await candidate.boundingBox().catch(() => null);
    if (!box) continue;

    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    if (
      center.x >= cardBox.x &&
      center.x <= cardBox.x + cardBox.width &&
      center.y >= cardBox.y &&
      center.y <= cardBox.y + cardBox.height
    ) {
      return candidate;
    }
  }

  return null;
}

async function openLayoutChildEditor(
  page: Page,
  card: Locator,
  box: { x: number; y: number; width: number; height: number },
  index: number,
): Promise<void> {
  const childEditorOpened = () =>
    page.locator(`${SEL.componentDeleteButton}:visible`).first().isVisible({ timeout: 1_000 }).catch(() => false);
  const clickBoxCenter = async (targetBox: { x: number; y: number; width: number; height: number } | null) => {
    if (!targetBox) return false;
    await page.mouse.click(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    return childEditorOpened();
  };

  const openButton = await visibleLayoutChildOpenButtonForCard(page, card, box);
  if (openButton) {
    // The hover overlay can sit below the draggable child root. A locator click
    // waits for pointer-events; use the observed point, then dispatch bounded.
    if (await clickBoxCenter(await openButton.boundingBox().catch(() => null))) return;
    await openButton.dispatchEvent('click').catch(() => undefined);
    if (await childEditorOpened()) return;
  }

  // Old UI, and fallback for builds where the whole child card is the affordance.
  if (await clickBoxCenter(box)) return;
  await card.dispatchEvent('click').catch(() => undefined);
  if (await childEditorOpened()) return;

  throw new Error(`Could not open editor for layout child #${index}`);
}

/**
 * Delete a child nested inside a Horizontal layout, then confirm the dialog.
 * `index` selects which nested child (0-based, canvas order).
 *
 * The layout-child UI differs by version: newer builds expose a hovered child
 * editor affordance, while the old buggy build opens a config panel from the
 * child card. Both paths converge on the same delete button and confirmation.
 */
export async function deleteLayoutChild(page: Page, index = 0): Promise<void> {
  const card = page.locator(SEL.layoutChildCard).nth(index);
  const box = await card.boundingBox();
  if (!box) throw new Error(`layout child card #${index} not found`);

  // Hover the child (mouseenter) so any hover affordance renders.
  await page.mouse.move(5, 5);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.waitForTimeout(600);

  await openLayoutChildEditor(page, card, box, index);

  const del = page.locator(`${SEL.componentDeleteButton}:visible`).first();
  await del.waitFor({ state: 'visible', timeout: 5_000 });
  await del.click({ timeout: 5_000 }).catch(async () => del.dispatchEvent('click'));
  await page.locator('ion-alert').first().waitFor({ state: 'visible', timeout: 5_000 });
  await page.locator(SEL.confirmDeleteYesButton).first().click({ timeout: 5_000 });
  await page.waitForTimeout(1_500);
}
