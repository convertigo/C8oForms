import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  addHorizontalLayout,
  addPageThroughPagesPanel,
  addVisibilityCondition,
  createTextBusinessLogicFormula,
  configureComponentNavigationFilter,
  deleteLayoutChild,
  dragPaletteComponentInto,
  getFormDocument,
  layoutChildComponentTypes,
  moveLayoutChildToStart,
  openConfigTabById,
  openComponentConfig,
  openComponentConfigAt,
  openComponentsPalette,
  openPagesPanel,
  openPreview,
  openWorkflowsPanel,
  choiceViewerValue,
  recordedToasts,
  recordToasts,
  selectViewerRadioOption,
  selectVisibilityMode,
  setButtonLabel,
  setChoiceDefaultValueJavascript,
  setChoiceDefaultValueText,
  setChoiceDefaultValueVisual,
  setChoiceLocalOptions,
  setDescriptionText,
  setTechnicalId,
  setTextDefaultValueJavascript,
} from './studio';

interface PaletteComponentCase {
  id: string;
  name: string;
  icon: string;
  selector: string;
}

interface TinyMceLikeEditor {
  setContent(content: string): void;
  fire(eventName: string): void;
}

type DefaultValueMode = 'visual' | 'text' | 'javascript';

interface SelectDefaultValueCase {
  mode: DefaultValueMode;
  technicalId: string;
  expected: string;
  textValue?: string;
  jsReturn?: string;
}

interface VisibilityTargetCase {
  id: string;
  type: MainVisibilityTargetType;
  visible: boolean;
}

interface MainVisibilityTarget {
  type: MainVisibilityTargetType;
  icon: string;
  tag: string;
}

interface DataVisibilityTarget {
  type: DataVisibilityTargetType;
  icon: string;
  tag: string;
}

interface ContainerVisibilityTarget {
  type: ContainerVisibilityTargetType;
  icon: string;
  editorTag: string;
  viewerTag: string;
}

const PALETTE_COMPONENTS: PaletteComponentCase[] = [
  { id: 'layout', name: 'Layout', icon: PALETTE_ICON.layout, selector: SEL.layoutViewer },
  {
    id: 'group',
    name: 'Group',
    icon: PALETTE_ICON.group,
    selector: 'c8oforms-itemcardeditorviewer, c8oforms-itemcardviewer',
  },
  { id: 'map', name: 'Map', icon: PALETTE_ICON.map, selector: SEL.mapComponent },
  { id: 'textInput', name: 'Text input', icon: PALETTE_ICON.textInput, selector: SEL.textComponent },
  { id: 'description', name: 'Description', icon: PALETTE_ICON.description, selector: SEL.descriptionComponent },
  { id: 'checkbox', name: 'Checkbox', icon: PALETTE_ICON.checkbox, selector: SEL.checkboxComponent },
  { id: 'checkboxGroup', name: 'Checkbox group', icon: PALETTE_ICON.checkboxGroup, selector: SEL.checkboxGroupComponent },
  { id: 'button', name: 'Button', icon: PALETTE_ICON.button, selector: SEL.buttonComponent },
  { id: 'radio', name: 'Radio', icon: PALETTE_ICON.radio, selector: SEL.radioComponent },
  { id: 'radioGroup', name: 'Radio group', icon: PALETTE_ICON.radioGroup, selector: SEL.radioGroupComponent },
  { id: 'slider', name: 'Slider', icon: PALETTE_ICON.slider, selector: SEL.sliderComponent },
  { id: 'select', name: 'Select', icon: PALETTE_ICON.select, selector: SEL.selectComponent },
  { id: 'date', name: 'Date', icon: PALETTE_ICON.date, selector: 'c8oforms-itemdatetimeviewver' },
  { id: 'time', name: 'Time', icon: PALETTE_ICON.time, selector: 'c8oforms-itemtimeviewver' },
  { id: 'camera', name: 'Camera', icon: PALETTE_ICON.camera, selector: 'c8oforms-itemimgviewer' },
  { id: 'grid', name: 'Grid', icon: PALETTE_ICON.grid, selector: SEL.gridComponent },
  { id: 'chart', name: 'Chart', icon: PALETTE_ICON.chart, selector: SEL.chartComponent },
  { id: 'barcode', name: 'Barcode', icon: PALETTE_ICON.barcode, selector: 'c8oforms-itembarcodeviewver' },
  { id: 'file', name: 'Import file', icon: PALETTE_ICON.file, selector: SEL.fileComponent },
  { id: 'signature', name: 'Signature', icon: PALETTE_ICON.signature, selector: 'c8oforms-itemsignatureviewver' },
  { id: 'location', name: 'Location', icon: PALETTE_ICON.location, selector: 'c8oforms-itemlocationviewer' },
];

const TEXT_INPUT_COMMON_SEL = {
  placeholderInput: 'c8oforms-textinputsetting.class1776265600030 input:visible, .class1776265600030 input:visible',
  requiredToggle: 'c8oforms-toggleswitch.class1776263100018:visible, .class1776263100018:visible',
} as const;

const GROUP_SEL = {
  editor: 'c8oforms-itemcardeditorviewer',
  viewer: 'c8oforms-itemcardviewer',
  child: [
    'c8oforms-itemcardeditorviewer-elem',
    'c8oforms-itemcardeditorviewer_elem',
    'c8oforms-itemcardeditor_elem',
  ].join(', '),
  childWrapper: '[id^="@prefixc8oitem"][id*="@prefixc8otype"]',
  childCard: '.class1730737348958',
} as const;

const SELECT_DEFAULT_OPTIONS = ['Functional Alpha', 'Functional Beta', 'Functional Gamma'] as const;

const MAIN_VISIBILITY_TARGETS = [
  { type: 'text', icon: PALETTE_ICON.textInput, tag: SEL.textComponent },
  { type: 'description', icon: PALETTE_ICON.description, tag: SEL.descriptionComponent },
  { type: 'checkbox', icon: PALETTE_ICON.checkbox, tag: SEL.checkboxComponent },
  { type: 'checkboxGroup', icon: PALETTE_ICON.checkboxGroup, tag: SEL.checkboxGroupComponent },
  { type: 'select', icon: PALETTE_ICON.select, tag: SEL.selectComponent },
  { type: 'radio', icon: PALETTE_ICON.radio, tag: SEL.radioComponent },
  { type: 'radioGroup', icon: PALETTE_ICON.radioGroup, tag: SEL.radioGroupComponent },
  { type: 'slider', icon: PALETTE_ICON.slider, tag: SEL.sliderComponent },
  { type: 'button', icon: PALETTE_ICON.button, tag: SEL.buttonComponent },
  { type: 'date', icon: PALETTE_ICON.date, tag: 'c8oforms-itemdatetimeviewver' },
  { type: 'time', icon: PALETTE_ICON.time, tag: 'c8oforms-itemtimeviewver' },
  { type: 'camera', icon: PALETTE_ICON.camera, tag: 'c8oforms-itemimgviewer' },
  { type: 'barcode', icon: PALETTE_ICON.barcode, tag: 'c8oforms-itembarcodeviewver' },
  { type: 'file', icon: PALETTE_ICON.file, tag: SEL.fileComponent },
  { type: 'signature', icon: PALETTE_ICON.signature, tag: 'c8oforms-itemsignatureviewver' },
  { type: 'location', icon: PALETTE_ICON.location, tag: 'c8oforms-itemlocationviewer' },
] as const satisfies readonly MainVisibilityTarget[];

const DATA_VISIBILITY_TARGETS = [
  { type: 'grid', icon: PALETTE_ICON.grid, tag: SEL.gridComponent },
  { type: 'chart', icon: PALETTE_ICON.chart, tag: SEL.chartComponent },
  { type: 'map', icon: PALETTE_ICON.map, tag: SEL.mapComponent },
] as const satisfies readonly DataVisibilityTarget[];

const CONTAINER_VISIBILITY_TARGETS = [
  { type: 'layout', icon: PALETTE_ICON.layout, editorTag: SEL.layoutViewer, viewerTag: '.c8o-layout-root-box' },
  { type: 'group', icon: PALETTE_ICON.group, editorTag: GROUP_SEL.editor, viewerTag: GROUP_SEL.viewer },
] as const satisfies readonly ContainerVisibilityTarget[];

type MainVisibilityTargetType =
  | 'text'
  | 'description'
  | 'checkbox'
  | 'checkboxGroup'
  | 'select'
  | 'radio'
  | 'radioGroup'
  | 'slider'
  | 'button'
  | 'date'
  | 'time'
  | 'camera'
  | 'barcode'
  | 'file'
  | 'signature'
  | 'location';

type DataVisibilityTargetType = 'grid' | 'chart' | 'map';

type ContainerVisibilityTargetType = 'layout' | 'group';

export async function addEveryPaletteComponentThroughUi(page: Page): Promise<void> {
  await test.step('Add each canvas component from the component palette', async () => {
    await acceptRgpdIfVisible(page);
    for (const component of PALETTE_COMPONENTS) {
      await addPaletteComponentAndAssertVisible(page, component);
    }
  });

  await test.step('Add the Business logic component from the palette', async () => {
    const before = await page.locator(SEL.businessLogicComponent).count();
    await createTextBusinessLogicFormula(page, `functional_business_logic_${Date.now()}`, 'Business logic fixture');
    await openWorkflowsPanel(page);
    await expect
      .poll(() => page.locator(SEL.businessLogicComponent).count(), {
        message: 'Business logic should be added in Workflows',
        timeout: 30_000,
      })
      .toBeGreaterThan(before);
  });
}

export async function renameTextInputTechnicalIdentifierThroughUi(page: Page): Promise<void> {
  const technicalId = `functional_text_${Date.now()}`;

  await test.step('Add a Text input component from the palette', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent).first(), 'Text input component should be visible').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Rename its technical identifier and verify the blurred value', async () => {
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, technicalId);
    await expect(
      page.locator(`${SEL.technicalIdInput}:visible`).first(),
      'technical identifier input should keep the new value after blur',
    ).toHaveValue(technicalId, { timeout: 15_000 });
  });

  await test.step('Reopen configuration and verify the renamed identifier', async () => {
    await page.locator(`${SEL.configClose}:visible`).first().click({ timeout: 10_000 });
    await expect(page.locator(`${SEL.configClose}:visible`), 'component configuration should close').toHaveCount(0, {
      timeout: 15_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await expect(
      page.locator(`${SEL.technicalIdInput}:visible`).first(),
      'technical identifier input should keep the new value after reopening',
    ).toHaveValue(technicalId, { timeout: 15_000 });
  });
}

export async function validateTextInputTechnicalIdentifierErrorsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const firstTechnicalId = `functional_source_${suffix}`;
  const secondTechnicalId = `functional_target_${suffix}`;
  const validReplacementId = `functional_valid_${suffix}`;

  await test.step('Create two Text input components with valid technical identifiers', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent), 'two Text input components should be visible').toHaveCount(2, {
      timeout: 30_000,
    });

    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, firstTechnicalId);
    await closeComponentConfiguration(page);

    await openComponentConfigAt(page, SEL.textComponent, 1);
    await setTechnicalId(page, secondTechnicalId);
  });

  await test.step('Reject an empty technical identifier and restore the previous value', async () => {
    await expectInvalidTechnicalIdentifierRestoresPreviousValue(page, '', secondTechnicalId);
  });

  await test.step('Reject a duplicate technical identifier and restore the previous value', async () => {
    await expectInvalidTechnicalIdentifierRestoresPreviousValue(page, firstTechnicalId, secondTechnicalId);
  });

  await test.step('Reject an invalid technical identifier and restore the previous value', async () => {
    await expectInvalidTechnicalIdentifierRestoresPreviousValue(page, 'invalid/name', secondTechnicalId);
  });

  await test.step('Accept a valid replacement technical identifier', async () => {
    await setTechnicalId(page, validReplacementId);
    await expect(
      page.locator(`${SEL.technicalIdInput}:visible`).first(),
      'valid technical identifier should be accepted',
    ).toHaveValue(validReplacementId, { timeout: 15_000 });
  });

  await test.step('Reopen the component and verify the valid technical identifier persisted', async () => {
    await closeComponentConfiguration(page);
    await openComponentConfigAt(page, SEL.textComponent, 1);
    await expect(
      page.locator(`${SEL.technicalIdInput}:visible`).first(),
      'valid technical identifier should still be present after reopening',
    ).toHaveValue(validReplacementId, { timeout: 15_000 });
  });
}

export async function deleteTextInputCancelThenConfirmThroughUi(page: Page): Promise<void> {
  await test.step('Add a Text input component from the palette', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`), 'Text input component should be visible').toHaveCount(1, {
      timeout: 30_000,
    });
  });

  await test.step('Cancel component deletion and verify the component remains', async () => {
    await openComponentConfig(page, SEL.textComponent);
    await requestOpenComponentDeletion(page);
    await cancelOpenDeleteConfirmation(page);
    await expect(
      page.locator(`${SEL.configClose}:visible`).first(),
      'component configuration should remain usable after cancelling deletion',
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator(`${SEL.technicalIdInput}:visible`).first(),
      'cancel should keep the Text input configuration available',
    ).toHaveValue(/.+/, { timeout: 10_000 });
    await closeComponentConfiguration(page);
    await expect(page.locator(`${SEL.textComponent}:visible`), 'cancel should keep the Text input on the canvas').toHaveCount(1, {
      timeout: 15_000,
    });
  });

  await test.step('Confirm component deletion and verify the canvas is updated', async () => {
    await openComponentConfig(page, SEL.textComponent);
    await requestOpenComponentDeletion(page);
    await confirmOpenDeleteConfirmation(page);
    await expect(page.locator(`${SEL.textComponent}:visible`), 'confirmed deletion should remove the Text input from the canvas').toHaveCount(
      0,
      { timeout: 30_000 },
    );
  });

  await test.step('Open Preview and verify the deleted component is absent', async () => {
    await openPreview(page, SEL.viewerPage);
    await expect(
      page.locator(`${SEL.viewerPage} ${SEL.textComponent}`),
      'deleted Text input should not render in the viewer',
    ).toHaveCount(0, { timeout: 30_000 });
  });
}

export async function duplicateConfiguredButtonAndAssertCopyThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const originalTechnicalId = `functional_button_${suffix}`;
  const buttonLabel = `Functional duplicate ${suffix}`;

  await test.step('Add and configure a Button component', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.button);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.buttonComponent}:visible`), 'Button component should be visible').toHaveCount(1, {
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, originalTechnicalId);
    await setButtonLabel(page, buttonLabel);
    await closeComponentConfiguration(page);
    await expectButtonCopiesWithLabel(page, buttonLabel, 1, 'configured source Button should render its label');
  });

  await test.step('Duplicate the configured Button with Copy here', async () => {
    await openComponentConfig(page, SEL.buttonComponent);
    await clickCopyHereButton(page);
    await closeComponentConfiguration(page);
    await expect(page.locator(`${SEL.buttonComponent}:visible`), 'Button duplication should create a second Button').toHaveCount(2, {
      timeout: 30_000,
    });
  });

  await test.step('Verify the copy keeps the configured label and receives a distinct technical ID', async () => {
    await expectButtonCopiesWithLabel(page, buttonLabel, 2, 'duplicated Button should keep the configured label');
    const technicalIds = await readComponentTechnicalIds(page, SEL.buttonComponent, 2);
    expect(technicalIds, 'duplicated Button set should include the original technical identifier').toContain(originalTechnicalId);
    expect(new Set(technicalIds).size, `technical identifiers should be distinct: ${technicalIds.join(', ')}`).toBe(2);
    expect(
      technicalIds.some((technicalId) => technicalId !== originalTechnicalId && technicalId.trim().length > 0),
      `one duplicated Button ID should differ from ${originalTechnicalId}: ${technicalIds.join(', ')}`,
    ).toBe(true);
  });

  await test.step('Open Preview and verify both Button copies render the configured label', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expectButtonCopiesWithLabel(page, buttonLabel, 2, 'viewer should render both duplicated Button labels');
  });
}

export async function reorderButtonsAndAssertPersistenceThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const formId = page.url().match(/\/editor\/([^/?#]+)/)?.[1] ?? '';
  expect(formId, 'Button reorder persistence needs the current application id').toMatch(/^\d+$/);
  const first = { technicalId: `functional_reorder_first_${suffix}`, label: `Functional first ${suffix}` };
  const second = { technicalId: `functional_reorder_second_${suffix}`, label: `Functional second ${suffix}` };
  const third = { technicalId: `functional_reorder_third_${suffix}`, label: `Functional third ${suffix}` };
  const initialOrder = [first.label, second.label, third.label];
  const reorderedOrder = [third.label, first.label, second.label];

  await test.step('Create three configured Button components', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.button);
    for (const [index, component] of [first, second, third].entries()) {
      await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.buttonComponent}:visible`), `Button #${index + 1} should be visible`).toHaveCount(
        index + 1,
        { timeout: 30_000 },
      );
      await openComponentConfigAt(page, SEL.buttonComponent, index);
      await setTechnicalId(page, component.technicalId);
      await setButtonLabel(page, component.label);
      await closeComponentConfiguration(page);
    }
    await expectButtonLabelOrder(page, initialOrder, 'configured Button order should match creation order');
  });

  await test.step('Move the third Button before the first Button by drag-and-drop', async () => {
    await moveComponentBefore(page, third.technicalId, first.technicalId, 'button');
    await expectButtonLabelOrder(page, reorderedOrder, 'editor Button order should reflect drag-and-drop');
    await expect
      .poll(() => persistedComponentOrder(page, formId, 'button', [first.technicalId, second.technicalId, third.technicalId]), {
        message: 'Button drag-and-drop order should be persisted before reloading the editor',
        timeout: 60_000,
      })
      .toEqual([third.technicalId, first.technicalId, second.technicalId]);
  });

  await test.step('Reload the editor and verify the reordered component order persists', async () => {
    const editorUrl = page.url();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (!(await page.locator(`${SEL.buttonComponent}:visible`).first().isVisible({ timeout: 30_000 }).catch(() => false))) {
      await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }
    await expectButtonLabelOrder(page, reorderedOrder, 'editor Button order should persist after reload');
  });

  await test.step('Open Preview and verify the reordered component order', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expectButtonLabelOrder(page, reorderedOrder, 'viewer Button order should match the editor order');
  });
}

export async function configureTextInputCommonPropertiesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_common_text_${suffix}`;
  const label = `Functional label ${suffix}`;
  const placeholder = `Functional placeholder ${suffix}`;

  await test.step('Add a Text input component and open its configuration', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, technicalId);
    await openTextInputQuestionTab(page);
  });

  await test.step('Configure label, placeholder, and required state', async () => {
    await setTextInputQuestionLabel(page, label);
    await openConfigTabById(page, 'data_interactions');
    await setTextInputPlaceholder(page, placeholder);
    await setTextInputRequired(page, true);
    await closeComponentConfiguration(page);
    await expectTextInputCommonProperties(page, { label, placeholder, required: true }, 'editor');
  });

  await test.step('Reopen the component configuration and verify the values persist', async () => {
    await closeComponentConfiguration(page);
    await openComponentConfig(page, SEL.textComponent);
    await openTextInputQuestionTab(page);
    await expectQuestionLabelEditorText(page, label);
    await openConfigTabById(page, 'data_interactions');
    await expect(page.locator(TEXT_INPUT_COMMON_SEL.placeholderInput).first()).toHaveValue(placeholder, {
      timeout: 15_000,
    });
    await expectRequiredToggleState(page, true);
    await closeComponentConfiguration(page);
  });

  await test.step('Open Preview and verify the configured properties render', async () => {
    await openPreview(page, SEL.textComponent);
    await expectTextInputCommonProperties(page, { label, placeholder, required: true }, 'viewer');
  });
}

export async function configureSelectDefaultValuesInAllModesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const cases: SelectDefaultValueCase[] = [
    {
      mode: 'visual',
      technicalId: `functional_select_visual_${suffix}`,
      expected: SELECT_DEFAULT_OPTIONS[0],
    },
    {
      mode: 'text',
      technicalId: `functional_select_text_${suffix}`,
      expected: SELECT_DEFAULT_OPTIONS[1],
      textValue: SELECT_DEFAULT_OPTIONS[1],
    },
    {
      mode: 'javascript',
      technicalId: `functional_select_js_${suffix}`,
      expected: SELECT_DEFAULT_OPTIONS[2],
      jsReturn: `'${SELECT_DEFAULT_OPTIONS[2]}'`,
    },
  ];

  await test.step('Create Select components with default values in Visual, Aa, and JavaScript modes', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);

    for (const [index, scenario] of cases.entries()) {
      await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.selectComponent}:visible`), `Select #${index + 1} should be visible`).toHaveCount(
        index + 1,
        { timeout: 30_000 },
      );
      await openComponentConfigAt(page, SEL.selectComponent, index);
      await setTechnicalId(page, scenario.technicalId);
      await setChoiceLocalOptions(page, [...SELECT_DEFAULT_OPTIONS]);

      if (scenario.mode === 'visual') {
        await setChoiceDefaultValueVisual(page, [scenario.expected]);
      } else if (scenario.mode === 'text') {
        await setChoiceDefaultValueText(page, scenario.textValue ?? scenario.expected);
      } else {
        await setChoiceDefaultValueJavascript(page, "''", scenario.jsReturn ?? `'${scenario.expected}'`);
      }

      await closeComponentConfiguration(page);
    }
  });

  await test.step('Open Preview and verify each Select default value is initialized', async () => {
    await openPreview(page, SEL.selectComponent);
    await expect(page.locator(`${SEL.selectComponent}:visible`), 'viewer should render the three Select components').toHaveCount(3, {
      timeout: 30_000,
    });

    for (const [index, scenario] of cases.entries()) {
      await expect
        .poll(() => choiceViewerValue(page, 'select', index), {
          message: `Select ${scenario.mode} default value should initialize to ${scenario.expected}`,
          timeout: 30_000,
        })
        .toBe(scenario.expected);
    }
  });
}

export async function configureVisibilityOnMainComponentTypesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_visibility_source_${suffix}`;
  const targetCases = MAIN_VISIBILITY_TARGETS.flatMap((target) => [
    { id: `functional_${target.type}_visible_${suffix}`, type: target.type, visible: true },
    { id: `functional_${target.type}_hidden_${suffix}`, type: target.type, visible: false },
  ]);
  const indexByTag = new Map<string, number>();
  const targetByType = new Map(MAIN_VISIBILITY_TARGETS.map((target) => [target.type, target]));

  await test.step('Create a Text input source used by visibility conditions', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'visibility source Text input should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, nextComponentIndex(indexByTag, SEL.textComponent));
    await setTechnicalId(page, sourceTechnicalId);
    await setTextDefaultValueJavascript(page, "'Alpha'");
    await closeComponentConfiguration(page);
  });

  await test.step('Create visible and hidden targets for the main component types', async () => {
    for (const targetCase of targetCases) {
      const target = targetByType.get(targetCase.type);
      expect(target, `visibility target ${targetCase.type} should be registered`).toBeTruthy();
      await openComponentsPalette(page, target!.icon);
      await addComponent(page, target!.icon, { allowEditorApiFallback: false });
      const targetIndex = nextComponentIndex(indexByTag, target!.tag);
      await expect(page.locator(`${target!.tag}:visible`).nth(targetIndex), `${targetCase.id} should be visible before configuration`).toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfigAt(page, target!.tag, targetIndex);
      await setTechnicalId(page, targetCase.id);
      if (targetCase.type === 'description') {
        await setDescriptionText(page, targetCase.id);
      }
      await openConfigTabById(page, 'visibility_tab_selector');
      await addVisibilityCondition(page, {
        field: sourceTechnicalId,
        operator: 'equals',
        value: targetCase.visible ? 'Alpha' : 'Nope',
      });
      await closeComponentConfiguration(page);
    }
  });

  await test.step('Open Preview and verify only the visible targets render', async () => {
    await openPreview(page, SEL.textComponent);
    await expect(page.locator('page-viewerpage'), 'viewer page should be attached').toBeAttached({ timeout: 30_000 });

    for (const target of MAIN_VISIBILITY_TARGETS) {
      const expectedVisibleCount = target.type === 'text' ? 2 : 1;
      await expect(
        page.locator(`${target.tag}:visible`),
        `${target.type}: the visible target should render and the hidden target should not`,
      ).toHaveCount(expectedVisibleCount, { timeout: 30_000 });
    }
  });
}

export async function configureVisibilityOnDataDisplayComponentTypesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_data_visibility_source_${suffix}`;
  const targetCases = DATA_VISIBILITY_TARGETS.flatMap((target) => [
    { id: `functional_${target.type}_visible_${suffix}`, type: target.type, visible: true },
    { id: `functional_${target.type}_hidden_${suffix}`, type: target.type, visible: false },
  ]);
  const indexByTag = new Map<string, number>();
  const targetByType = new Map(DATA_VISIBILITY_TARGETS.map((target) => [target.type, target]));

  await test.step('Create a Text input source used by data component visibility conditions', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'data visibility source Text input should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, nextComponentIndex(indexByTag, SEL.textComponent));
    await setTechnicalId(page, sourceTechnicalId);
    await setTextDefaultValueJavascript(page, "'Alpha'");
    await closeComponentConfiguration(page);
  });

  await test.step('Create visible and hidden data display targets', async () => {
    for (const targetCase of targetCases) {
      const target = targetByType.get(targetCase.type);
      expect(target, `data visibility target ${targetCase.type} should be registered`).toBeTruthy();
      await openComponentsPalette(page, target!.icon);
      await addComponent(page, target!.icon, { allowEditorApiFallback: false });
      const targetIndex = nextComponentIndex(indexByTag, target!.tag);
      await expect(page.locator(`${target!.tag}:visible`).nth(targetIndex), `${targetCase.id} should be visible before configuration`).toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfigAt(page, target!.tag, targetIndex);
      await setTechnicalId(page, targetCase.id);
      await openConfigTabById(page, 'visibility_tab_selector');
      await addVisibilityCondition(page, {
        field: sourceTechnicalId,
        operator: 'equals',
        value: targetCase.visible ? 'Alpha' : 'Nope',
      });
      await closeComponentConfiguration(page);
    }
  });

  await test.step('Open Preview and verify only the visible data display targets render', async () => {
    await openPreview(page, SEL.textComponent);
    await expect(page.locator('page-viewerpage'), 'viewer page should be attached').toBeAttached({ timeout: 30_000 });

    for (const target of DATA_VISIBILITY_TARGETS) {
      await expect(
        page.locator(`${target.tag}:visible`),
        `${target.type}: the visible target should render and the hidden target should not`,
      ).toHaveCount(1, { timeout: 30_000 });
    }
  });
}

export async function configureVisibilityOnContainerComponentTypesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_container_visibility_source_${suffix}`;
  const targetCases = CONTAINER_VISIBILITY_TARGETS.flatMap((target) => [
    { id: `functional_${target.type}_visible_${suffix}`, type: target.type, visible: true },
    { id: `functional_${target.type}_hidden_${suffix}`, type: target.type, visible: false },
  ]);
  const indexByTag = new Map<string, number>();
  const targetByType = new Map(CONTAINER_VISIBILITY_TARGETS.map((target) => [target.type, target]));

  await test.step('Create a Text input source used by container visibility conditions', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'container visibility source Text input should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, nextComponentIndex(indexByTag, SEL.textComponent));
    await setTechnicalId(page, sourceTechnicalId);
    await setTextDefaultValueJavascript(page, "'Alpha'");
    await closeComponentConfiguration(page);
  });

  await test.step('Create visible and hidden layout and container targets', async () => {
    for (const targetCase of targetCases) {
      const target = targetByType.get(targetCase.type);
      expect(target, `container visibility target ${targetCase.type} should be registered`).toBeTruthy();
      await openComponentsPalette(page, target!.icon);
      await addComponent(page, target!.icon, { allowEditorApiFallback: false });
      const targetIndex = nextComponentIndex(indexByTag, target!.editorTag);
      await expect(
        page.locator(`${target!.editorTag}:visible`).nth(targetIndex),
        `${targetCase.id} should be visible before configuration`,
      ).toBeVisible({ timeout: 30_000 });
      await openComponentConfigAt(page, target!.editorTag, targetIndex);
      await setTechnicalId(page, targetCase.id);
      await openConfigTabById(page, 'visibility_tab_selector');
      await addVisibilityCondition(page, {
        field: sourceTechnicalId,
        operator: 'equals',
        value: targetCase.visible ? 'Alpha' : 'Nope',
      });
      await closeComponentConfiguration(page);
      if (targetCase.type === 'layout') {
        await addDescriptionIntoLayoutTarget(page, targetIndex);
      }
    }
  });

  await test.step('Open Preview and verify only the visible layout and container targets render', async () => {
    await openPreview(page, SEL.textComponent);
    await expect(page.locator('page-viewerpage'), 'viewer page should be attached').toBeAttached({ timeout: 30_000 });

    for (const target of CONTAINER_VISIBILITY_TARGETS) {
      await expect(
        page.locator(`${SEL.viewerPage} ${target.viewerTag}:visible`),
        `${target.type}: the visible target should render and the hidden target should not`,
      ).toHaveCount(1, { timeout: 30_000 });
    }
  });
}

export async function configureConditionalComponentNavigationThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const radioTechnicalId = `functional_nav_radio_${suffix}`;
  const rejectedOption = `Functional blocked ${suffix}`;
  const acceptedOption = `Functional accepted ${suffix}`;
  const targetPageMarker = `Functional target page ${suffix}`;
  let targetPageName = '';

  await test.step('Create a second page with a visible target marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.descriptionComponent}:visible`).first(), 'target page marker Description should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.descriptionComponent);
    await setTechnicalId(page, `functional_target_marker_${suffix}`);
    await setDescriptionText(page, targetPageMarker);
    await closeComponentConfiguration(page);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Radio component with conditional page navigation', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.radioComponent}:visible`).first(), 'navigation Radio component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, radioTechnicalId);
    await setChoiceLocalOptions(page, [rejectedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfiguration(page);
  });

  await test.step('Open Preview and verify the false condition does not navigate', async () => {
    await openPreview(page, SEL.radioComponent);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'viewer should start on Page 1 with the Radio visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetPageMarker, { exact: true }).first(), 'target page marker should start hidden').toBeHidden({
      timeout: 30_000,
    });

    await selectViewerRadioOption(page, radioTechnicalId, rejectedOption);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'false condition should keep the Radio page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetPageMarker, { exact: true }).first(), 'false condition should not show target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching value and verify navigation to the target page', async () => {
    await clickViewerRadioOptionForNavigation(page, radioTechnicalId, acceptedOption);
    await expect(page.getByText(targetPageMarker, { exact: true }).first(), 'true condition should show the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'true condition should leave the Radio page').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function configureHorizontalLayoutChildrenThroughUi(page: Page): Promise<void> {
  const expectedInitialTypes = ['text', 'description', 'checkbox'];
  let initialOrder: string[] = [];

  await test.step('Create a Horizontal layout and add three nested children', async () => {
    await acceptRgpdIfVisible(page);
    await addHorizontalLayout(page);
    await expect(page.locator(SEL.layoutViewer), 'Horizontal layout should be present').toHaveCount(1, {
      timeout: 30_000,
    });

    await dragPaletteComponentInto(page, PALETTE_ICON.textInput, SEL.layoutViewer);
    await dragPaletteComponentInto(page, PALETTE_ICON.description, SEL.layoutViewer);
    await dragPaletteComponentInto(page, PALETTE_ICON.checkbox, SEL.layoutViewer);

    await expect(page.locator(`${SEL.layoutViewer} ${SEL.layoutChild}`), 'layout should contain three nested children').toHaveCount(
      3,
      { timeout: 30_000 },
    );
    await expect
      .poll(async () => (await layoutChildComponentTypes(page)).sort(), {
        message: 'layout should contain Text input, Description, and Checkbox children',
        timeout: 15_000,
      })
      .toEqual([...expectedInitialTypes].sort());
    initialOrder = await layoutChildComponentTypes(page);
  });

  await test.step('Reorder a nested child by drag-and-drop', async () => {
    expect(initialOrder, 'initial layout child order should have three entries').toHaveLength(3);
    const expectedReorderedOrder = [initialOrder[2], initialOrder[0], initialOrder[1]];
    await moveLayoutChildToStart(page, 2);
    await expect
      .poll(async () => layoutChildComponentTypes(page), {
        message: 'the last nested child should move before the first child',
        timeout: 15_000,
      })
      .toEqual(expectedReorderedOrder);
  });

  await test.step('Delete one nested child without deleting the Horizontal layout', async () => {
    await deleteLayoutChild(page, 1);
    await expect(page.locator(SEL.layoutViewer), 'deleting a nested child should keep the Horizontal layout').toHaveCount(1, {
      timeout: 30_000,
    });
    await expect(page.locator(`${SEL.layoutViewer} ${SEL.layoutChild}`), 'only one nested child should be deleted').toHaveCount(2, {
      timeout: 30_000,
    });
    await expect
      .poll(async () => layoutChildComponentTypes(page), {
        message: 'remaining layout children should still be detectable after deletion',
        timeout: 15_000,
      })
      .toHaveLength(2);
  });
}

export async function configureGroupChildrenVisibilityReorderAndDeleteThroughUi(page: Page): Promise<void> {
  const expectedInitialTypes = ['text', 'description', 'checkbox'];
  let initialOrder: string[] = [];

  await test.step('Create a Group and add three nested children', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.group);
    await addComponent(page, PALETTE_ICON.group, { allowEditorApiFallback: false });
    await expect(page.locator(`${GROUP_SEL.editor}:visible`).first(), 'Group component should be present').toBeVisible({
      timeout: 30_000,
    });

    await addPaletteComponentIntoGroup(page, PALETTE_ICON.textInput, 1);
    await addPaletteComponentIntoGroup(page, PALETTE_ICON.description, 2);
    await addPaletteComponentIntoGroup(page, PALETTE_ICON.checkbox, 3);

    await expect
      .poll(() => groupChildCount(page), {
        message: 'Group should contain three nested children',
        timeout: 30_000,
      })
      .toBe(3);
    await expect
      .poll(async () => (await groupChildComponentTypes(page)).sort(), {
        message: 'Group should contain Text input, Description, and Checkbox children',
        timeout: 15_000,
      })
      .toEqual([...expectedInitialTypes].sort());
    initialOrder = await groupChildComponentTypes(page);
  });

  await test.step('Reorder a nested Group child by drag-and-drop', async () => {
    expect(initialOrder, 'initial Group child order should have three entries').toHaveLength(3);
    const expectedReorderedOrder = [initialOrder[2], initialOrder[0], initialOrder[1]];
    await moveGroupChildToStart(page, 2);
    await expect
      .poll(() => groupChildComponentTypes(page), {
        message: 'the last Group child should move before the first child',
        timeout: 15_000,
      })
      .toEqual(expectedReorderedOrder);
  });

  await test.step('Delete one nested child without deleting the Group', async () => {
    await deleteGroupChild(page, 1);
    await expect(page.locator(`${GROUP_SEL.editor}:visible`), 'deleting a nested child should keep the Group').toHaveCount(1, {
      timeout: 30_000,
    });
    await expect
      .poll(() => groupChildCount(page), {
        message: 'only one Group child should be deleted',
        timeout: 30_000,
      })
      .toBe(2);
  });

  await test.step('Set Group visibility to never and verify the viewer hides it with its children', async () => {
    await closeComponentConfiguration(page);
    await openComponentConfig(page, GROUP_SEL.editor);
    await openConfigTabById(page, 'visibility_tab_selector');
    await selectVisibilityMode(page, 'never');
    await closeComponentConfiguration(page);

    await openPreview(page, SEL.viewerPage);
    await expect(page.locator(`${GROUP_SEL.viewer}:visible`), 'hidden Group should not render in the viewer').toHaveCount(0, {
      timeout: 30_000,
    });
    await expect(page.locator(`${SEL.textComponent}:visible`), 'hidden Group should hide its Text input child').toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.locator(`${SEL.descriptionComponent}:visible`), 'hidden Group should hide its Description child').toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.locator(`${SEL.checkboxComponent}:visible`), 'hidden Group should hide its Checkbox child').toHaveCount(0, {
      timeout: 15_000,
    });
  });
}

async function selectEditorPageByName(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const pageRow = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(pageRow, `page row ${pageName} should be visible`).toBeVisible({ timeout: 15_000 });
  await pageRow.click({ timeout: 10_000 }).catch(async () => pageRow.dispatchEvent('click'));
  await expect(page.locator(SEL.pageButtonsBlock).first(), `page ${pageName} canvas should be visible`).toBeVisible({
    timeout: 15_000,
  });
}

async function clickViewerRadioOptionForNavigation(page: Page, technicalId: string, option: string): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Radio ${technicalId} should be visible before navigation`).toBeVisible({ timeout: 30_000 });
  const item = root.locator('ion-item').filter({ hasText: option }).first();
  if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
    return;
  }
  const label = root.getByText(option, { exact: true }).first();
  await expect(label, `viewer Radio option ${option} should be visible before navigation`).toBeVisible({ timeout: 10_000 });
  await label.click({ timeout: 10_000 }).catch(async () => label.dispatchEvent('click'));
}

function nextComponentIndex(indexByTag: Map<string, number>, tag: string): number {
  const index = indexByTag.get(tag) ?? 0;
  indexByTag.set(tag, index + 1);
  return index;
}

async function addDescriptionIntoLayoutTarget(page: Page, layoutIndex: number): Promise<void> {
  await openComponentsPalette(page, PALETTE_ICON.description);
  const tile = await firstVisibleLocalLocator(
    page,
    draggableComponentPaletteTileSelector(PALETTE_ICON.description),
    'draggable Description palette tile',
    10_000,
  );
  const layout = page.locator(`${SEL.layoutViewer}:visible`).nth(layoutIndex);
  await expect(layout, `layout #${layoutIndex + 1} should be visible before adding a nested Description`).toBeVisible({
    timeout: 10_000,
  });
  const children = layout.locator(SEL.layoutChild);
  const before = await children.count();
  await dragPaletteTileToContainer(page, tile, layout, `layout #${layoutIndex + 1}`);
  await expect(children, `layout #${layoutIndex + 1} should contain a nested Description`).toHaveCount(before + 1, {
    timeout: 30_000,
  });
  if (await page.locator(`${SEL.configClose}:visible`).first().isVisible({ timeout: 1_500 }).catch(() => false)) {
    await closeComponentConfiguration(page);
  }
}

async function dragPaletteTileToContainer(page: Page, tile: Locator, container: Locator, description: string): Promise<void> {
  await enableNativeDropDeliveryForLocalDropZones(page);
  const tileBox = await tile.boundingBox();
  expect(tileBox, 'draggable palette tile should have a bounding box').not.toBeNull();
  if (!tileBox) return;
  const containerBox = await container.boundingBox();
  expect(containerBox, `${description} should have a bounding box`).not.toBeNull();
  if (!containerBox) return;

  await page.mouse.move(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(tileBox.x + tileBox.width / 2 + 10, tileBox.y + tileBox.height / 2 + 10, { steps: 6 });
  await page.mouse.move(containerBox.x + containerBox.width / 2, containerBox.y + containerBox.height / 2, { steps: 25 });
  await page.waitForTimeout(400);

  const zone = container.locator(`[id*="afterItem"], ${SEL.containerInitialDropZone}`).first();
  if (await zone.count()) {
    const zoneBox = await zone.boundingBox();
    if (zoneBox) {
      await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + zoneBox.height / 2, { steps: 8 });
    }
  }
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(1_500);
}

async function enableNativeDropDeliveryForLocalDropZones(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __c8oFunctionalDropDeliveryInstalled?: boolean };
    if (w.__c8oFunctionalDropDeliveryInstalled) return;
    w.__c8oFunctionalDropDeliveryInstalled = true;
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
          dragEvent.preventDefault();
        }
      },
      true,
    );
  });
}

function draggableComponentPaletteTileSelector(icon: string): string {
  return [`#bloc-palette [draggable="true"]:has(img[src$="${icon}"])`, `[draggable="true"]:has(img[src$="${icon}"])`].join(', ');
}

async function firstVisibleLocalLocator(page: Page, selector: string, description: string, timeout: number): Promise<Locator> {
  const elements = page.locator(selector);
  const startedAt = Date.now();
  do {
    const count = await elements.count();
    for (let index = 0; index < count; index++) {
      const candidate = elements.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }
    await page.waitForTimeout(100);
  } while (Date.now() - startedAt < timeout);
  await expect(
    elements.first(),
    `${description} should be visible for selector ${selector}`,
  ).toBeVisible({ timeout: 1_000 });
  return elements.first();
}

async function addPaletteComponentAndAssertVisible(page: Page, component: PaletteComponentCase): Promise<void> {
  await test.step(`Add ${component.name}`, async () => {
    const before = await page.locator(component.selector).count();
    await openComponentsPalette(page, component.icon);
    await addComponent(page, component.icon, { allowEditorApiFallback: false });
    await expect
      .poll(() => page.locator(component.selector).count(), {
        message: `${component.name} should render as ${component.selector}`,
        timeout: 30_000,
      })
      .toBeGreaterThan(before);
  });
}

async function setTextInputQuestionLabel(page: Page, value: string): Promise<void> {
  const editorBody = await visibleTinyMceBody(page);
  await editorBody.click({ timeout: 10_000 });
  const filledThroughTinyMce = await editorBody.evaluate((body, text) => {
    const hostWindow = window.parent === window ? window : window.parent;
    const tinymce = (hostWindow as any).hugerte ?? (hostWindow as any).tinymce;
    const rawEditors = tinymce?.editors;
    const editors = (Array.isArray(rawEditors) ? rawEditors : rawEditors != null ? Object.values(rawEditors) : []) as any[];
    const frameId = (window.frameElement as HTMLElement | null)?.id?.replace(/_ifr$/, '');
    const editor =
      (frameId ? tinymce?.get?.(frameId) : null) ??
      editors.find((candidate) => candidate && !candidate.removed && candidate.getBody?.() === body);
    if (!editor) {
      return false;
    }

    const holder = document.createElement('div');
    holder.textContent = text;
    editor.setContent(`<p>${holder.innerHTML}</p>`);
    editor.fire('input');
    editor.fire('change');
    editor.save?.();
    editor.fire('blur');
    return true;
  }, value);

  if (!filledThroughTinyMce) {
    await editorBody.click({ timeout: 10_000 });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(value);
    await editorBody.evaluate((element, text) => {
      const holder = document.createElement('div');
      holder.textContent = text;
      element.innerHTML = `<p>${holder.innerHTML}</p>`;
      element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: text, inputType: 'insertText' }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    }, value);
  }

  await page.keyboard.press('Tab').catch(() => undefined);
  await fireActiveTinyMceChange(page, editorBody);
  await expectQuestionLabelEditorText(page, value);
}

async function openTextInputQuestionTab(page: Page): Promise<void> {
  const section = page.locator(SEL.styleSectionLabel).first();
  await expect(section, 'Text input Appearance section should be visible').toBeVisible({ timeout: 10_000 });
  await section.click({ timeout: 10_000 }).catch(async () => section.dispatchEvent('click'));
  const questionTab = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}:visible`).first();
  await expect(questionTab, 'Text input Question tab should be visible').toBeVisible({ timeout: 10_000 });
  await questionTab.click({ timeout: 10_000 }).catch(async () => questionTab.dispatchEvent('click'));
  await expect(await visibleTinyMceBody(page), 'Text input question label editor should be visible').toBeVisible({
    timeout: 15_000,
  });
}

async function setTextInputPlaceholder(page: Page, value: string): Promise<void> {
  const input = page.locator(TEXT_INPUT_COMMON_SEL.placeholderInput).first();
  await expect(input, 'Text input placeholder setting should be visible').toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.blur();
  await expect(input, 'Text input placeholder setting should keep the typed value').toHaveValue(value, { timeout: 15_000 });
  await page.waitForTimeout(1_000);
}

async function setTextInputRequired(page: Page, required: boolean): Promise<void> {
  const toggle = page.locator(TEXT_INPUT_COMMON_SEL.requiredToggle).first();
  await expect(toggle, 'Text input required toggle should be visible').toBeVisible({ timeout: 15_000 });
  const button = toggle.locator('button.class1775840591959:visible, button.c8o-btn:visible').nth(required ? 0 : 1);
  await expect(button, `Text input required toggle ${required ? 'Yes' : 'No'} button should be visible`).toBeVisible({
    timeout: 15_000,
  });
  if (!((await button.getAttribute('class')) ?? '').includes('c8o-btn-selected')) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expect(button, `Text input required toggle should be ${required ? 'enabled' : 'disabled'}`).toHaveClass(
    /c8o-btn-selected/,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(1_000);
}

async function expectRequiredToggleState(page: Page, required: boolean): Promise<void> {
  const toggle = page.locator(TEXT_INPUT_COMMON_SEL.requiredToggle).first();
  await expect(toggle, 'Text input required toggle should be visible after reopening').toBeVisible({ timeout: 15_000 });
  await expect(
    toggle.locator('button.class1775840591959:visible, button.c8o-btn:visible').nth(required ? 0 : 1),
    `Text input required toggle should still be ${required ? 'enabled' : 'disabled'}`,
  ).toHaveClass(/c8o-btn-selected/, { timeout: 15_000 });
}

async function expectQuestionLabelEditorText(page: Page, expected: string): Promise<void> {
  const editorBody = await visibleTinyMceBody(page);
  await expect
    .poll(() => editorBody.innerText().then(normalizeFunctionalText), {
      message: `Text input question label editor should contain ${expected}`,
      timeout: 15_000,
    })
    .toContain(expected);
}

async function expectTextInputCommonProperties(
  page: Page,
  expected: { label: string; placeholder: string; required: boolean },
  surface: 'editor' | 'viewer',
): Promise<void> {
  await expect
    .poll(() => textInputRenderedState(page), {
      message: `${surface}: Text input should render the configured label`,
      timeout: 30_000,
    })
    .toMatchObject({ hasLabel: true });
  await expect
    .poll(() => textInputRenderedState(page), {
      message: `${surface}: Text input should render placeholder ${expected.placeholder}`,
      timeout: 30_000,
    })
    .toMatchObject({ placeholder: expected.placeholder });
  if (expected.required) {
    await expect
      .poll(() => textInputRenderedState(page), {
        message: `${surface}: Text input should render a required state`,
        timeout: 30_000,
      })
      .toMatchObject({ required: true });
  }

  async function textInputRenderedState(page: Page): Promise<{ hasLabel: boolean; placeholder: string; required: boolean }> {
    return page.locator(`${SEL.textComponent}:visible`).first().evaluate(
      (root, values) => {
        const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
        const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
        const ionInput = root.querySelector<HTMLElement>('ion-input, ion-textarea');
        const text = normalize((root as HTMLElement).innerText || root.textContent || '');
        const placeholder =
          input?.getAttribute('placeholder') ??
          input?.placeholder ??
          ionInput?.getAttribute('placeholder') ??
          ionInput?.getAttribute('ng-reflect-placeholder') ??
          '';
        const required =
          input?.required === true ||
          ionInput?.hasAttribute('required') === true ||
          ionInput?.getAttribute('ng-reflect-required') === 'true' ||
          [...root.querySelectorAll<HTMLElement>('span, p')].some((element) => normalize(element.innerText || '') === '*');
        return {
          hasLabel: text.includes((values as { label: string }).label),
          placeholder,
          required,
        };
      },
      expected,
    );
  }
}

async function visibleTinyMceBody(page: Page): Promise<Locator> {
  for (const selector of [
    'iframe[title="Rich Text Area"]',
    'iframe.tox-edit-area__iframe',
    '.tox-edit-area iframe',
    '.tox-tinymce iframe',
    'iframe',
  ]) {
    const frame = page.locator(selector).last();
    if (!(await frame.isVisible({ timeout: 1_000 }).catch(() => false))) {
      continue;
    }
    const frameBody = page.frameLocator(selector).last().locator('body');
    if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
      return frameBody;
    }
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'a TinyMCE editor should be visible').toBeVisible({ timeout: 10_000 });
  return inlineEditor;
}

async function fireActiveTinyMceChange(page: Page, editorBody?: Locator): Promise<void> {
  const body = editorBody ?? (await visibleTinyMceBody(page));
  await body.evaluate((targetBody) => {
    const hostWindow = window.parent === window ? window : window.parent;
    const tinymce = (hostWindow as any).hugerte ?? (hostWindow as any).tinymce;
    const rawEditors = tinymce?.editors;
    const editors = (Array.isArray(rawEditors) ? rawEditors : rawEditors != null ? Object.values(rawEditors) : []) as any[];
    const frameId = (window.frameElement as HTMLElement | null)?.id?.replace(/_ifr$/, '');
    const editor =
      (frameId ? tinymce?.get?.(frameId) : null) ??
      editors.find((candidate) => candidate && !candidate.removed && candidate.getBody?.() === targetBody);
    if (!editor) throw new Error('TinyMCE instance not found for the visible question editor');
    editor.fire('input');
    editor.fire('change');
    editor.save?.();
    editor.fire('blur');
  });
}

function normalizeFunctionalText(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

async function addPaletteComponentIntoGroup(page: Page, paletteIcon: string, expectedChildCount: number): Promise<void> {
  await openComponentsPalette(page, paletteIcon);
  const tile = await draggableFunctionalPaletteTileForIcon(page, paletteIcon);
  const group = page.locator(`${GROUP_SEL.editor}:visible`).first();
  await expect(group, 'Group should be visible before adding a nested child').toBeVisible({ timeout: 30_000 });

  await dragPaletteTileToGroupDropZone(page, tile, group, paletteIcon);
  await expect
    .poll(() => groupChildCount(page), {
      message: `dragging ${paletteIcon} into the Group should create a nested child`,
      timeout: 30_000,
    })
    .toBe(expectedChildCount);
}

async function draggableFunctionalPaletteTileForIcon(page: Page, icon: string): Promise<Locator> {
  const selector = [
    `#bloc-palette [draggable="true"]:has(img[src$="${icon}"])`,
    `[draggable="true"]:has(img[src$="${icon}"])`,
  ].join(', ');
  const tile = page.locator(selector).first();
  await expect(tile, `draggable component palette tile ${icon} should be visible`).toBeVisible({ timeout: 30_000 });
  return tile;
}

async function dragPaletteTileToGroupDropZone(page: Page, tile: Locator, group: Locator, paletteIcon: string): Promise<void> {
  await enableNativeDropDeliveryForLocalDropZones(page);
  const tileBox = await tile.boundingBox();
  if (!tileBox) {
    throw new Error(`Palette tile not found for icon ${paletteIcon}`);
  }
  const groupBox = await group.boundingBox();
  if (!groupBox) {
    throw new Error('Group has no bounding box before nested child drag');
  }

  await page.mouse.move(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(tileBox.x + tileBox.width / 2 + 10, tileBox.y + tileBox.height / 2 + 10, { steps: 6 });
  await page.mouse.move(groupBox.x + groupBox.width / 2, groupBox.y + Math.min(groupBox.height - 10, groupBox.height * 0.75), {
    steps: 25,
  });

  const dropZone = page
    .locator(
      [
        `${GROUP_SEL.editor}:visible c8oforms-shareddropindicator[id="@prefixc8oafterItem"]:visible`,
        `${GROUP_SEL.editor}:visible c8oforms-shareddropindicator:visible`,
      ].join(', '),
    )
    .last();
  await expect(dropZone, `Group drop zone should be visible while dragging ${paletteIcon}`).toBeVisible({ timeout: 5_000 });
  const dropBox = await dropZone.boundingBox();
  if (!dropBox) {
    throw new Error(`Group drop zone not found while dragging ${paletteIcon}`);
  }

  await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + dropBox.height / 2, { steps: 8 });
  await page.waitForTimeout(250);
  await page.mouse.up();
  await page.waitForTimeout(1_500);
}

async function moveGroupChildToStart(page: Page, fromIndex: number): Promise<void> {
  await selectAnotherGroupChild(page, fromIndex);
  const source = groupChildCards(page).nth(fromIndex);
  await source.scrollIntoViewIfNeeded();
  await expect(source, `Group child #${fromIndex} should be visible before dragging`).toBeVisible({ timeout: 10_000 });

  const sourceBox = await source.boundingBox();
  if (!sourceBox) {
    throw new Error(`Group child #${fromIndex} has no bounding box`);
  }
  const group = page.locator(`${GROUP_SEL.editor}:visible`).first();
  const groupBox = await group.boundingBox();
  if (!groupBox) {
    throw new Error('Group has no bounding box');
  }

  await page.mouse.move(5, 5);
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, { steps: 8 });
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 - 14, sourceBox.y + sourceBox.height / 2 + 10, { steps: 8 });
  await page.mouse.move(groupBox.x + 12, groupBox.y + Math.max(30, groupBox.height / 4), { steps: 25 });
  await page.waitForTimeout(500);

  const leadingZone = page
    .locator(`${GROUP_SEL.editor}:visible [id*="beforeItem"]:visible, ${GROUP_SEL.editor}:visible c8oforms-shareddropindicator:visible`)
    .first();
  const zoneBox = await leadingZone.boundingBox().catch(() => null);
  if (zoneBox) {
    await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + zoneBox.height / 2, { steps: 8 });
  }
  await page.waitForTimeout(250);
  await page.mouse.up();
  await page.waitForTimeout(1_500);
}

async function selectAnotherGroupChild(page: Page, fromIndex: number): Promise<void> {
  const cards = groupChildCards(page);
  const count = await cards.count();
  if (count < 2) return;

  const otherIndex = fromIndex === 0 ? 1 : 0;
  const otherBox = await cards.nth(otherIndex).boundingBox().catch(() => null);
  if (!otherBox) return;

  await page.mouse.move(5, 5);
  await page.mouse.click(otherBox.x + otherBox.width / 2, otherBox.y + otherBox.height / 2);
  await page.waitForTimeout(800);
  if (await page.locator(`${SEL.configClose}:visible`).first().isVisible({ timeout: 1_500 }).catch(() => false)) {
    await closeComponentConfiguration(page);
  }
}

async function deleteGroupChild(page: Page, index: number): Promise<void> {
  const card = groupChildCards(page).nth(index);
  await card.scrollIntoViewIfNeeded();
  await expect(card, `Group child #${index} card should be visible before deletion`).toBeVisible({ timeout: 10_000 });
  const box = await card.boundingBox();
  if (!box) {
    throw new Error(`Group child card #${index} not found`);
  }

  await page.mouse.move(5, 5);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.waitForTimeout(600);
  if (!(await openGroupChildEditor(page, card, box))) {
    throw new Error(`Could not open editor for Group child #${index}`);
  }

  const deleteButton = page.locator(`${SEL.componentDeleteButton}:visible`).first();
  await expect(deleteButton, 'Group child delete button should be visible').toBeVisible({ timeout: 10_000 });
  await deleteButton.click({ timeout: 10_000 }).catch(async () => deleteButton.dispatchEvent('click'));
  await expect(page.locator('ion-alert:visible').last(), 'Group child delete confirmation should be visible').toBeVisible({
    timeout: 10_000,
  });
  const confirmButton = page.locator(`${SEL.confirmDeleteYesButton}:visible`).last();
  await expect(confirmButton, 'Group child delete confirmation button should be visible').toBeVisible({ timeout: 10_000 });
  await confirmButton.click({ timeout: 10_000 }).catch(async () => confirmButton.dispatchEvent('click'));
  await expect(page.locator('ion-alert:visible'), 'Group child delete confirmation should close').toHaveCount(0, {
    timeout: 10_000,
  });
  await page.waitForTimeout(1_500);
}

async function openGroupChildEditor(
  page: Page,
  card: Locator,
  box: { x: number; y: number; width: number; height: number },
): Promise<boolean> {
  const childEditorOpened = () =>
    page.locator(`${SEL.componentDeleteButton}:visible`).first().isVisible({ timeout: 1_000 }).catch(() => false);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  if (await childEditorOpened()) {
    return true;
  }
  await card.dispatchEvent('click').catch(() => undefined);
  return childEditorOpened();
}

function groupChildCards(page: Page): Locator {
  return page.locator(`${GROUP_SEL.editor}:visible ${GROUP_SEL.childCard}:visible`);
}

async function groupChildCount(page: Page): Promise<number> {
  return groupChildComponentTypes(page).then((types) => types.length);
}

async function groupChildComponentTypes(page: Page): Promise<string[]> {
  return page.locator(`${GROUP_SEL.editor}:visible`).first().evaluate((root, selectors) => {
    const visible = (element: Element): boolean => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    let wrappers = [...root.querySelectorAll((selectors as { child: string }).child)].filter(visible);
    if (wrappers.length === 0) {
      wrappers = [...root.querySelectorAll((selectors as { childWrapper: string }).childWrapper)].filter(visible);
    }
    return wrappers.map((wrapper) => {
      const element = wrapper as Element;
      if (element.querySelector('c8oforms-itemtextviewer, c8oforms-itemtexteditor')) return 'text';
      if (element.querySelector('c8oforms-itemdescriptionviewer, c8oforms-itemdescriptioneditor')) return 'description';
      if (element.querySelector('c8oforms-itemcheckboxviewer, c8oforms-itemcheckboxeditor')) return 'checkbox';
      const id = (element as HTMLElement).id ?? '';
      const typeMatch = id.match(/@prefixc8otype([^@]+)$/);
      if (typeMatch?.[1]) return typeMatch[1];
      const itemTag = [...element.querySelectorAll('*')]
        .map((descendant) => descendant.tagName.toLowerCase())
        .find((tag) => tag.startsWith('c8oforms-item') && !tag.includes('cardeditorviewer'));
      return itemTag ?? 'unknown';
    });
  }, GROUP_SEL);
}

async function expectButtonLabelOrder(page: Page, expectedOrder: string[], message: string): Promise<void> {
  await expect
    .poll(() => visibleButtonLabelOrder(page, expectedOrder), {
      message,
      timeout: 30_000,
    })
    .toEqual(expectedOrder);
}

async function visibleButtonLabelOrder(page: Page, knownLabels: string[]): Promise<string[]> {
  return page.locator(`${SEL.buttonComponent}:visible`).evaluateAll(
    (elements, labels) =>
      elements
        .map((element) => {
          const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
          return (labels as string[]).find((label) => text.includes(label.toLowerCase())) ?? '';
        })
        .filter(Boolean),
    knownLabels,
  );
}

async function persistedComponentOrder(
  page: Page,
  formId: string,
  type: string,
  knownTechnicalIds: string[],
): Promise<string[]> {
  const document = await getFormDocument(page, formId).catch(() => null);
  const elements = document && Array.isArray(document.formulaire) ? document.formulaire : [];
  return elements
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .filter((entry) => entry.type === type && typeof entry.name === 'string' && knownTechnicalIds.includes(entry.name))
    .map((entry) => String(entry.name));
}

async function moveComponentBefore(page: Page, sourceTechnicalId: string, targetTechnicalId: string, type: string): Promise<void> {
  const sourceId = `@prefixc8oitem${sourceTechnicalId}@prefixc8otype${type}`;
  const targetId = `@prefixc8oitem${targetTechnicalId}@prefixc8otype${type}`;

  const source = page.locator(`[id="${sourceId}"]`).first();
  const target = page.locator(`[id="${targetId}"]`).first();
  await expect(source, `source component wrapper ${sourceTechnicalId} should be visible before drag`).toBeVisible({
    timeout: 15_000,
  });
  await expect(target, `target component wrapper ${targetTechnicalId} should be visible before drag`).toBeVisible({
    timeout: 15_000,
  });

  await source
    .dragTo(target, {
      sourcePosition: { x: 24, y: 24 },
      targetPosition: { x: 24, y: 8 },
      timeout: 10_000,
    })
    .catch(() => undefined);

  const nativeOrder = await componentTechnicalIdOrder(page, type);
  if (nativeOrder[0] === sourceTechnicalId) {
    return;
  }

  const dispatched = await dispatchComponentDragStart(page, sourceId);
  expect(dispatched, `component dragstart should be dispatched for ${sourceTechnicalId}`).toBe(true);

  const beforeDropId = `@prefixc8obeforeItem${targetTechnicalId}`;
  await expect(page.locator(`[id="${beforeDropId}"]`).first(), `drop indicator before ${targetTechnicalId} should appear`).toBeVisible({
    timeout: 15_000,
  });
  const dropped = await dispatchComponentDrop(page, sourceId, beforeDropId);
  expect(dropped, `component drop should be dispatched before ${targetTechnicalId}`).toBe(true);
}

async function componentTechnicalIdOrder(page: Page, type: string): Promise<string[]> {
  return page.evaluate((componentType) => {
    const visible = (element: Element): boolean => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...document.querySelectorAll(`[id^="@prefixc8oitem"][id$="@prefixc8otype${componentType}"]`)]
      .filter(visible)
      .map((element) =>
        (element as HTMLElement).id.replace(/^@prefixc8oitem/, '').replace(new RegExp(`@prefixc8otype${componentType}$`), ''),
      );
  }, type);
}

async function dispatchComponentDragStart(page: Page, sourceId: string): Promise<boolean> {
  return page.evaluate((id) => {
    const source = document.getElementById(id);
    if (!source) {
      return false;
    }
    const dataTransfer = new DataTransfer();
    const init: DragEventInit = { bubbles: true, cancelable: true, dataTransfer };
    (window as unknown as { __functionalComponentDrag?: { dataTransfer: DataTransfer; sourceId: string } }).__functionalComponentDrag = {
      dataTransfer,
      sourceId: id,
    };
    source.dispatchEvent(new DragEvent('dragstart', init));
    return true;
  }, sourceId);
}

async function dispatchComponentDrop(page: Page, sourceId: string, dropId: string): Promise<boolean> {
  return page.evaluate(
    ({ sourceId: currentSourceId, dropId: currentDropId }) => {
      const w = window as unknown as { __functionalComponentDrag?: { dataTransfer: DataTransfer; sourceId: string } };
      const source = document.getElementById(currentSourceId);
      const dropTarget = document.getElementById(currentDropId);
      const dataTransfer = w.__functionalComponentDrag?.dataTransfer ?? new DataTransfer();
      if (!dropTarget) {
        return false;
      }
      const init: DragEventInit = { bubbles: true, cancelable: true, dataTransfer };
      dropTarget.dispatchEvent(new DragEvent('dragenter', init));
      dropTarget.dispatchEvent(new DragEvent('dragover', init));
      dropTarget.dispatchEvent(new DragEvent('drop', init));
      source?.dispatchEvent(new DragEvent('dragend', init));
      delete w.__functionalComponentDrag;
      return true;
    },
    { sourceId, dropId },
  );
}

async function clickCopyHereButton(page: Page): Promise<void> {
  const copyButton = page.locator('button.c8o-btn-copy:visible').first();
  await expect(copyButton, 'Copy here button should be visible in the component configuration rail').toBeVisible({
    timeout: 10_000,
  });
  await copyButton.click({ timeout: 10_000 }).catch(async () => copyButton.dispatchEvent('click'));
  await page.waitForTimeout(1_500);
}

async function expectButtonCopiesWithLabel(page: Page, label: string, expectedCount: number, message: string): Promise<void> {
  await expect(page.locator(`${SEL.buttonComponent}:visible`).filter({ hasText: label }), message).toHaveCount(expectedCount, {
    timeout: 30_000,
  });
}

async function readComponentTechnicalIds(page: Page, componentSelector: string, count: number): Promise<string[]> {
  const technicalIds: string[] = [];
  for (let index = 0; index < count; index++) {
    await openComponentConfigAt(page, componentSelector, index);
    const input = page.locator(`${SEL.technicalIdInput}:visible`).first();
    await expect(input, `technical identifier input for component #${index + 1} should be visible`).toBeVisible({
      timeout: 10_000,
    });
    technicalIds.push(await input.inputValue());
    await closeComponentConfiguration(page);
  }
  return technicalIds;
}

async function requestOpenComponentDeletion(page: Page): Promise<void> {
  const deleteButton = page.locator(`${SEL.componentDeleteButton}:visible`).first();
  await expect(deleteButton, 'component delete button should be visible').toBeVisible({ timeout: 10_000 });
  await deleteButton.click({ timeout: 10_000 }).catch(async () => deleteButton.dispatchEvent('click'));
  await expect(page.locator('ion-alert:visible').last(), 'component delete confirmation should be visible').toBeVisible({
    timeout: 10_000,
  });
}

async function cancelOpenDeleteConfirmation(page: Page): Promise<void> {
  const alert = page.locator('ion-alert:visible').last();
  const cancelButton = alert.locator('button.btn--info').first();
  await expect(cancelButton, 'delete confirmation cancel button should be visible').toBeVisible({ timeout: 10_000 });
  await cancelButton.click({ timeout: 10_000 }).catch(async () => cancelButton.dispatchEvent('click'));
  await expect(page.locator('ion-alert:visible'), 'delete confirmation should close after cancelling').toHaveCount(0, {
    timeout: 10_000,
  });
}

async function confirmOpenDeleteConfirmation(page: Page): Promise<void> {
  const confirmButton = page.locator(`${SEL.confirmDeleteYesButton}:visible`).last();
  await expect(confirmButton, 'delete confirmation yes button should be visible').toBeVisible({ timeout: 10_000 });
  await confirmButton.click({ timeout: 10_000 }).catch(async () => confirmButton.dispatchEvent('click'));
  await expect(page.locator('ion-alert:visible'), 'delete confirmation should close after confirming').toHaveCount(0, {
    timeout: 10_000,
  });
}

async function expectInvalidTechnicalIdentifierRestoresPreviousValue(
  page: Page,
  invalidValue: string,
  previousValue: string,
): Promise<void> {
  await recordToasts(page);
  const toastCountBefore = (await recordedToasts(page)).length;
  await setTechnicalId(page, invalidValue, { expectPersistence: false });
  await expect(
    page.locator(`${SEL.technicalIdInput}:visible`).first(),
    `invalid technical identifier "${invalidValue}" should restore the previous value`,
  ).toHaveValue(previousValue, { timeout: 15_000 });
  await expect
    .poll(() => recordedToasts(page).then((messages) => messages.length), {
      message: `invalid technical identifier "${invalidValue}" should display an error toast`,
      timeout: 10_000,
    })
    .toBeGreaterThan(toastCountBefore);
}

async function closeComponentConfiguration(page: Page): Promise<void> {
  const closeButton = page.locator(`${SEL.configClose}:visible`).first();
  if (!(await closeButton.isVisible({ timeout: 1_000 }).catch(() => false))) {
    await expect(page.locator(`${SEL.configClose}:visible`), 'component configuration should already be closed').toHaveCount(0, {
      timeout: 10_000,
    });
    return;
  }
  await closeButton.click({ timeout: 10_000 }).catch(async () => closeButton.dispatchEvent('click'));
  await expect(page.locator(`${SEL.configClose}:visible`), 'component configuration should close').toHaveCount(0, {
    timeout: 15_000,
  });
}
