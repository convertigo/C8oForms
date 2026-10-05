import { expect, test, type Locator, type Page } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './baserow';
import { replaceBaserowTableRows } from './functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  addButtonStateCondition,
  checkViewerCheckboxOption,
  clickSelectBaserowColumnRole,
  choiceViewerValue,
  clearButtonIcon,
  closeComponentConfig,
  configureSelectBaserowSource,
  configureVisibleTinyMceSpacingThroughUi,
  createTextBusinessLogicFormula,
  dragSourcePaletteEntryToTinyMce,
  dropSourcePaletteEntryIntoVisibleMonaco,
  checkedSelectBaserowDisplayColumns,
  checkedSelectBaserowValueColumns,
  expectButtonDefaultIconName,
  expectButtonRenderedHtmlLabel,
  expectButtonRenderedLabel,
  expectButtonRenderedWithoutIcon,
  expectButtonStateModeSelected,
  expectDefaultValueJavaScriptEditorKeeps,
  expectRenderedButtonEnabled,
  expectViewerTextInputValue,
  fillToastMessageText,
  fillViewerTextInput,
  mapHeight,
  openComponentConfig,
  openComponentConfigByTechnicalId,
  openComponentConfigAt,
  openConfigTabById,
  openEditor,
  openButtonFlowToastActionConfig,
  openComponentsPalette,
  openPreview,
  openTextDefaultValueJavascriptModeThroughUi,
  openSelectBaserowSourceConfiguration,
  openSelectBaserowTablePicker,
  openStyleTabById,
  openWorkflowsPanel,
  recordedToasts,
  recordToasts,
  saveSelectBaserowTablePicker,
  settledSelectBaserowDisplayColumns,
  settledSelectBaserowValueColumns,
  expectSelectBaserowColumnsVisible,
  setCheckboxDefaultSelected,
  setCheckboxLocalOptions,
  selectViewerRadioOption,
  setButtonAdvancedRichLabel,
  setButtonLabel,
  setDescriptionText,
  setChoiceDefaultValueJavascript,
  setChoiceDefaultValueFromSourcePalette,
  setChoiceDefaultValueText,
  setChoiceGroupDefaultValueVisual,
  setChoiceLocalOptions,
  setMapHeightAndClose,
  setTechnicalId,
  setTextDefaultValueFromUserEmailPalette,
  setTextDefaultValueJavascript,
  setTextDefaultValueJavascriptCode,
  setTextDefaultValueText,
  submitViewerForm,
  TEST_USER,
  tinyMceEditorContent,
  type ChoiceViewerKind,
  viewerTextInput,
} from './studio';

const FUNCTIONAL_BASEROW_WORKSPACE = 'C8oForms E2E';
const FUNCTIONAL_BASEROW_BASE = 'Functional Fixtures';
const CHECKBOX_SOURCE_TABLE = 'Functional Checkbox Source Options v3';
const CHECKBOX_SOURCE_LABEL = 'Name';
const CHECKBOX_SOURCE_VALUE = 'Value';
const CHECKBOX_SOURCE_ROWS = [
  { [CHECKBOX_SOURCE_LABEL]: 'Functional Baserow Alpha', [CHECKBOX_SOURCE_VALUE]: 'functional-alpha' },
  { [CHECKBOX_SOURCE_LABEL]: 'Functional Baserow Bravo', [CHECKBOX_SOURCE_VALUE]: 'functional-bravo' },
  { [CHECKBOX_SOURCE_LABEL]: 'Functional Baserow Charlie', [CHECKBOX_SOURCE_VALUE]: 'functional-charlie' },
];

const TEXT_INPUT_VALUE_SEL = {
  placeholderInput: 'c8oforms-textinputsetting.class1776265600030 input:visible, .class1776265600030 input:visible',
  requiredToggle: 'c8oforms-toggleswitch.class1776263100018:visible, .class1776263100018:visible',
} as const;
const DATE_COMPONENT = 'c8oforms-itemdatetimeviewver';
const DATE_VALUE_SEL = {
  minInput: 'c8oforms-textinputsetting.class1776351200013 input, .class1776351200013 input',
  maxInput: 'c8oforms-textinputsetting.class1776351200022 input, .class1776351200022 input',
  displayFormatToggle: 'c8oforms-toggleswitch.class1776501100004:visible, .class1776501100004:visible',
  entryModeToggle: 'c8oforms-toggleswitch.class1789377621400:visible, .class1789377621400:visible',
} as const;
const TIME_COMPONENT = 'c8oforms-itemtimeviewver';
const TIME_VALUE_SEL = {
  displayFormatToggle: 'c8oforms-toggleswitch.class1776501200004:visible, .class1776501200004:visible',
} as const;

export async function exerciseTextInputCoreBehaviorThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_text_value_${suffix}`;
  const label = `Functional text label ${suffix}`;
  const placeholder = `Functional text placeholder ${suffix}`;
  const defaultValue = `Functional default ${suffix}`;
  const submittedValue = `Functional submitted ${suffix}`;

  await test.step('Create and configure a required Text input', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Text input component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, technicalId);
    await openTextInputQuestionTab(page);
    await setDescriptionText(page, label);
    await openConfigTabById(page, 'data_interactions');
    await setTextInputPlaceholder(page, placeholder);
    await setTextInputRequired(page, true);
    await setTextDefaultValueText(page, defaultValue);
    await closeComponentConfiguration(page);
  });

  await test.step('Open Preview and verify label, placeholder, required, and default value', async () => {
    await openPreview(page, SEL.textComponent);
    const component = page.locator(`#${technicalId}`).first();
    await expect(component, 'viewer Text input component should be visible').toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('textbox', { name: label }).first(), 'viewer Text input should expose the configured label').toBeVisible({
      timeout: 30_000,
    });

    const input = viewerTextInput(page, technicalId);
    await expect(input, 'viewer Text input native input should be visible').toBeVisible({ timeout: 30_000 });
    await expect(input, 'viewer Text input should render the configured placeholder').toHaveAttribute('placeholder', placeholder, {
      timeout: 15_000,
    });
    await expect(input, 'viewer Text input should render the configured default value').toHaveValue(defaultValue, {
      timeout: 15_000,
    });
    await expectTextInputRequiredInViewer(page, technicalId);
  });

  await test.step('Clear the required value and verify submit is blocked', async () => {
    await fillViewerTextInput(page, technicalId, '');
    await clickViewerSubmit(page);
    await expect(page.locator(SEL.responseCompletedPage), 'required empty Text input should block submission').toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(viewerTextInput(page, technicalId), 'blocked submission should keep the Text input visible').toBeVisible({
      timeout: 10_000,
    });
  });

  await test.step('Fill a viewer value and submit the response', async () => {
    await fillViewerTextInput(page, technicalId, submittedValue);
    await expect(viewerTextInput(page, technicalId), 'viewer Text input should keep the submitted value').toHaveValue(submittedValue, {
      timeout: 10_000,
    });
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'submitted response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseTextInputAdvancedDefaultValuesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_text_source_${suffix}`;
  const sourceValue = `Functional source ${suffix}`;
  const aaValue = `Functional Aa ${suffix}`;
  const jsValue = `Functional JS ${suffix}`;
  const dynamicLookup = 'fields[id]';

  await test.step('Create a source Text input with an Aa default value', async () => {
    await addConfiguredTextInput(page, 0, sourceTechnicalId, async () => {
      await setTextDefaultValueText(page, sourceValue);
    });
  });

  await test.step('Create a Text input with an Aa default value', async () => {
    await addConfiguredTextInput(page, 1, `functional_text_aa_${suffix}`, async () => {
      await setTextDefaultValueText(page, aaValue);
    });
  });

  await test.step('Create a Text input with a JavaScript default value', async () => {
    await addConfiguredTextInput(page, 2, `functional_text_js_${suffix}`, async () => {
      await setTextDefaultValueJavascript(page, `'${jsValue}'`);
    });
  });

  await test.step('Create a Text input with a dynamic fields[id] JavaScript default value', async () => {
    await addConfiguredTextInput(page, 3, `functional_text_fields_${suffix}`, async () => {
      await setTextDefaultValueJavascriptCode(page, `const id = "${sourceTechnicalId}";\n\treturn ${dynamicLookup};`);
      await expectDefaultValueJavaScriptEditorKeeps(page, dynamicLookup);
    });
  });

  await test.step('Create a Text input with a Source Palette default value', async () => {
    await addConfiguredTextInput(page, 4, `functional_text_palette_${suffix}`, async () => {
      await setTextDefaultValueFromUserEmailPalette(page);
    });
  });

  await test.step('Open Preview and verify all advanced default values', async () => {
    await openPreview(page, SEL.textComponent);
    await expectViewerTextInputValue(page, 0, sourceValue);
    await expectViewerTextInputValue(page, 1, aaValue);
    await expectViewerTextInputValue(page, 2, jsValue);
    await expectViewerTextInputValue(page, 3, sourceValue);
    await expectViewerTextInputValue(page, 4, TEST_USER);
  });
}

export async function exerciseDescriptionRichTextAndSourcePaletteThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const descriptionTechnicalId = `functional_description_${suffix}`;
  const chipSourceTechnicalId = `functional_description_chip_source_${suffix}`;
  const chipSourceValue = `Functional chip source ${suffix}`;
  const textTechnicalId = `functional_text_rich_question_${suffix}`;
  const introText = `Functional description intro ${suffix}`;
  const boldText = `Functional bold ${suffix}`;
  const italicText = `Functional italic ${suffix}`;
  const questionText = `Functional rich question ${suffix}`;
  const spacing = { marginBottom: '16px', padding: '12px' };
  let configuredChipPresentation: SourcePaletteChipPresentation | null = null;
  let richQuestionIndex = -1;

  await test.step('Create another component as the Description source-chip value', async () => {
    await addConfiguredTextInput(page, 0, chipSourceTechnicalId, async () => {
      await setTextDefaultValueText(page, chipSourceValue);
    });
  });

  await test.step('Create and configure a Description with rich text and a Source Palette value', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.descriptionComponent}:visible`).first(), 'Description component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.descriptionComponent);
    await setTechnicalId(page, descriptionTechnicalId);
    await setDescriptionRichText(page, { introText, boldText, italicText });
    await dragSourcePaletteEntryToTinyMce(page, 'form', chipSourceTechnicalId);
    await moveExistingSourcePaletteChipWithinVisibleHugeRte(page);
    configuredChipPresentation = await sourcePaletteChipPresentation(await visibleTinyMceBody(page));
    await appendLargeDescriptionAndAssertInternalHugeRteScroll(page, suffix);
    await configureVisibleTinyMceSpacingThroughUi(page, spacing);
    await openConfigTabById(page, 'data_interactions');
    await expectDescriptionRichTextEditorHidden(page);
    await closeComponentConfig(page);
  });

  await test.step('Verify Description rendering in the editor canvas', async () => {
    const component = await visibleDescriptionComponent(page, descriptionTechnicalId);
    await expectDescriptionText(component, [introText, boldText, italicText], 'editor');
    await expectDescriptionRichMarkup(component, { boldText, italicText }, 'editor');
    await expectDescriptionSpacing(component, introText, spacing, 'editor');
    expect(
      await sourcePaletteChipPresentation(component),
      'editor canvas should generate the same Source Palette chip presentation as the Aa configuration editor',
    ).toEqual(configuredChipPresentation);
  });

  await test.step('Create a Text input with a persistent rich-text question', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    const before = await page.locator(SEL.textComponent).count();
    richQuestionIndex = before;
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    const textComponent = page.locator(SEL.textComponent).nth(before);
    await expect(textComponent, 'Text input component should be visible').toBeVisible({ timeout: 30_000 });

    await openComponentConfigAt(page, SEL.textComponent, before);
    await setTechnicalId(page, textTechnicalId);
    await openTextInputQuestionTab(page);
    await typeVisibleRichTextValueThroughUi(page, questionText, 'Text input question');
    await closeComponentConfig(page);
    await expect(textComponent, 'Text input should render the rich question in the editor').toContainText(questionText, {
      timeout: 30_000,
    });

    await openComponentConfigAt(page, SEL.textComponent, before);
    await openTextInputQuestionTab(page);
    await expect(await visibleTinyMceBody(page), 'Text input rich question should persist after reopening').toContainText(
      questionText,
      { timeout: 15_000 },
    );
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Description and Text input rich-text rendering', async () => {
    await openPreview(page, SEL.textComponent);
    const description = await visibleDescriptionComponent(page, descriptionTechnicalId);
    await expectDescriptionText(description, [introText, boldText, italicText, chipSourceValue], 'viewer');
    await expectDescriptionRichMarkup(description, { boldText, italicText }, 'viewer');
    await expectDescriptionSpacing(description, introText, spacing, 'viewer');
    expect(
      countTextOccurrences(await description.innerText(), chipSourceValue),
      'Preview should render exactly one source value after the chip was moved inside HugeRTE',
    ).toBe(1);
    await expect(
      page.locator(`${SEL.textComponent}:visible`).nth(richQuestionIndex),
      'Preview Text input should render the persisted rich question',
    ).toContainText(questionText, { timeout: 30_000 });
  });
}

type SourceChipMoveState = {
  count: number;
  precedingTextLength: number;
  chipLeft: number;
  chipTop: number;
};

async function moveExistingSourcePaletteChipWithinVisibleHugeRte(page: Page): Promise<void> {
  await test.step('Move the existing source chip inside HugeRTE without duplicating it', async () => {
    const body = await visibleTinyMceBody(page);
    const chip = body.locator('[c8otype="path"]').first();
    await expect(chip, 'Description HugeRTE should contain one source chip before the internal move').toBeVisible({
      timeout: 15_000,
    });
    await expect(body.locator('[c8otype="path"]'), 'external Source Palette insertion should create exactly one chip').toHaveCount(1);

    const before = await sourceChipMoveState(body);
    expect(before.precedingTextLength, 'source chip should initially follow the configured Description text').toBeGreaterThan(10);

    await chip.dragTo(body, {
      targetPosition: { x: 2, y: 8 },
      timeout: 15_000,
    });

    await expect
      .poll(() => sourceChipMoveState(body), {
        message: 'the existing source chip should move toward the start of HugeRTE without creating a copy',
        timeout: 15_000,
      })
      .toMatchObject({ count: 1 });

    const after = await sourceChipMoveState(body);
    expect(after.count, 'internal source-chip drag must retain exactly one chip').toBe(1);
    expect(
      after.precedingTextLength,
      'internal source-chip drag should move the existing node before its original text position',
    ).toBeLessThan(before.precedingTextLength);
    expect(
      Math.abs(after.chipLeft - before.chipLeft) + Math.abs(after.chipTop - before.chipTop),
      'source chip should have a measurably different editor position after the move',
    ).toBeGreaterThan(2);

    await fireActiveTinyMceChange(page, body);
    await expect(body.locator('[c8otype="path"]'), 'moved source chip should persist as one editor node').toHaveCount(1);
  });
}

async function sourceChipMoveState(body: Locator): Promise<SourceChipMoveState> {
  return body.evaluate((root) => {
    const chips = [...root.querySelectorAll<HTMLElement>('[c8otype="path"]')];
    const chip = chips[0];
    if (!chip) {
      return { count: 0, precedingTextLength: -1, chipLeft: -1, chipTop: -1 };
    }
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(root);
    range.setEndBefore(chip);
    const rect = chip.getBoundingClientRect();
    return {
      count: chips.length,
      precedingTextLength: range.toString().length,
      chipLeft: Math.round(rect.left),
      chipTop: Math.round(rect.top),
    };
  });
}

async function appendLargeDescriptionAndAssertInternalHugeRteScroll(page: Page, suffix: number): Promise<void> {
  await test.step('Keep large Description content editable through HugeRTE internal scrolling', async () => {
    const body = await visibleTinyMceBody(page);
    await body.click();
    await page.keyboard.press('ControlOrMeta+End');
    for (let index = 1; index <= 48; index++) {
      await page.keyboard.insertText(`Functional large Description ${suffix} line ${index}`);
      await page.keyboard.press('Enter');
    }
    await fireActiveTinyMceChange(page, body);
    await expect(body, 'large Description should retain its final edited line').toContainText(
      `Functional large Description ${suffix} line 48`,
      { timeout: 15_000 },
    );

    const editorShell = page.locator('.tox.tox-hugerte:visible').last();
    const sidebarWrap = editorShell.locator('.tox-sidebar-wrap:visible').last();
    const editArea = editorShell.locator('.tox-edit-area:visible').last();
    await expect(editorShell, 'Description should expose the bounded non-inline HugeRTE shell').toBeVisible({ timeout: 15_000 });
    await expect(sidebarWrap, 'Description HugeRTE should expose its bounded sidebar wrapper').toBeVisible({ timeout: 15_000 });
    await expect(editArea, 'Description HugeRTE should keep a visible editing area').toBeVisible({ timeout: 15_000 });

    const layout = await editorShell.evaluate((shell) => {
      const shellBox = (shell as HTMLElement).getBoundingClientRect();
      const host = shell.closest('.c8o-description-hugerte-host') as HTMLElement | null;
      const sidebar = shell.querySelector('.tox-sidebar-wrap') as HTMLElement | null;
      const area = shell.querySelector('.tox-edit-area') as HTMLElement | null;
      const hostBox = host?.getBoundingClientRect();
      const sidebarBox = sidebar?.getBoundingClientRect();
      const areaBox = area?.getBoundingClientRect();
      return {
        hostFound: host != null,
        hostHeight: hostBox?.height ?? 0,
        hostBottom: hostBox?.bottom ?? 0,
        shellHeight: shellBox.height,
        shellBottom: shellBox.bottom,
        sidebarHeight: sidebarBox?.height ?? 0,
        editAreaHeight: areaBox?.height ?? 0,
        sidebarBottom: sidebarBox?.bottom ?? 0,
        viewportHeight: window.innerHeight,
      };
    });
    expect(layout.hostFound, 'Description HugeRTE should use the bounded flex host introduced for large content').toBe(true);
    expect(layout.shellHeight, 'large Description HugeRTE should retain a useful bounded height').toBeGreaterThanOrEqual(300);
    expect(layout.shellHeight, 'Description HugeRTE shell should fit its flex host').toBeLessThanOrEqual(layout.hostHeight + 1);
    expect(layout.shellBottom, 'Description HugeRTE shell should remain inside its flex host').toBeLessThanOrEqual(
      layout.hostBottom + 1,
    );
    expect(layout.hostBottom, 'Description HugeRTE host should remain inside the Studio viewport').toBeLessThanOrEqual(
      layout.viewportHeight + 1,
    );
    expect(layout.sidebarHeight, 'HugeRTE sidebar wrapper should retain usable editing height').toBeGreaterThan(100);
    expect(layout.editAreaHeight, 'HugeRTE edit area should retain usable editing height').toBeGreaterThan(100);
    expect(layout.sidebarBottom, 'HugeRTE sidebar wrapper should remain inside the editor shell').toBeLessThanOrEqual(
      layout.shellBottom + 1,
    );

    const scroll = await body.evaluate((root) => {
      const document = root.ownerDocument;
      const candidates = [root, document.documentElement, document.scrollingElement].filter(
        (candidate, index, all): candidate is HTMLElement =>
          candidate instanceof HTMLElement && all.indexOf(candidate) === index,
      );
      const scroller = candidates.sort(
        (left, right) => right.scrollHeight - right.clientHeight - (left.scrollHeight - left.clientHeight),
      )[0];
      const before = scroller.scrollTop;
      scroller.scrollTop = scroller.scrollHeight;
      scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
      return {
        frameBacked: document.defaultView?.frameElement?.tagName === 'IFRAME',
        clientHeight: scroller.clientHeight,
        scrollHeight: scroller.scrollHeight,
        before,
        after: scroller.scrollTop,
      };
    });
    expect(scroll.frameBacked, 'Description HugeRTE should keep content in its dedicated editable iframe').toBe(true);
    expect(scroll.scrollHeight - scroll.clientHeight, 'large Description should overflow the HugeRTE document').toBeGreaterThan(100);
    expect(scroll.after, 'large Description editing document should scroll independently').toBeGreaterThan(scroll.before);
  });
}

function countTextOccurrences(value: string, expected: string): number {
  return value.split(expected).length - 1;
}

type SourcePaletteChipPresentation = {
  badge: Record<string, string>;
  icon: Record<string, string> | null;
};

async function sourcePaletteChipPresentation(root: Locator): Promise<SourcePaletteChipPresentation> {
  const chip = root.locator('[c8otype="path"]:visible').last();
  await expect(chip, 'Source Palette chip should be visible').toBeVisible({ timeout: 15_000 });
  return chip.evaluate((element) => {
    const properties = ['fontSize', 'fontWeight', 'color', 'backgroundColor'] as const;
    const iconProperties = ['stroke', 'fill', 'color'] as const;
    const badgeStyle = getComputedStyle(element);
    const icon = element.querySelector('svg') as SVGElement | null;
    const iconStyle = icon ? getComputedStyle(icon) : null;
    return {
      badge: Object.fromEntries(properties.map((property) => [property, badgeStyle[property]])),
      icon: iconStyle
        ? Object.fromEntries(iconProperties.map((property) => [property, iconStyle[property]]))
        : null,
    };
  });
}

export async function exerciseCheckboxLocalOptionsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_checkbox_${suffix}`;
  const firstOption = `Functional first ${suffix}`;
  const defaultOption = `Functional default ${suffix}`;
  const submittedOption = `Functional submitted ${suffix}`;
  const deletedOption = `Functional deleted ${suffix}`;
  const initialOptions = [firstOption, defaultOption, submittedOption, deletedOption];
  const finalOptions = [firstOption, defaultOption, submittedOption];

  await test.step('Create a Checkbox and configure local options', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.checkbox);
    await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.checkboxComponent}:visible`).first(), 'Checkbox component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.checkboxComponent);
    await setTechnicalId(page, technicalId);
    await setCheckboxLocalOptions(page, initialOptions);
    await expectChoiceOptionInputValues(page, initialOptions);
    await setCheckboxLocalOptions(page, finalOptions);
    await expectChoiceOptionInputValues(page, finalOptions);
    await setCheckboxDefaultSelected(page, finalOptions[1]);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Checkbox option order and default selection', async () => {
    await openPreview(page, SEL.checkboxComponent);
    const component = await visibleChoiceComponent(page, technicalId, SEL.checkboxComponent);
    await expectChoiceOptionOrder(component, finalOptions, 'Checkbox viewer');
    await expect(component, 'deleted Checkbox option should not render in viewer').not.toContainText(deletedOption, {
      timeout: 5_000,
    });
    await expectCheckboxSelectedValues(page, 0, [defaultOption]);
  });

  await test.step('Select another Checkbox option and submit the viewer response', async () => {
    await checkViewerCheckboxOption(page, technicalId, submittedOption);
    await expectCheckboxSelectedValues(page, 0, [defaultOption, submittedOption]);
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Checkbox response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseChoiceAddControlsStayVisibleThroughUi(page: Page): Promise<void> {
  const scenarios = [
    { name: 'Checkbox', icon: PALETTE_ICON.checkbox, selector: SEL.checkboxComponent, scroller: SEL.checkboxOptionsScroller },
    { name: 'Radio', icon: PALETTE_ICON.radio, selector: SEL.radioComponent, scroller: SEL.radioOptionsScroller },
    { name: 'Select', icon: PALETTE_ICON.select, selector: SEL.selectComponent, scroller: SEL.selectOptionsScroller },
  ];

  for (const scenario of scenarios) {
    await test.step(`${scenario.name} keeps Add option fixed outside its overflowing list`, async () => {
      await acceptRgpdIfVisible(page);
      await openComponentsPalette(page, scenario.icon);
      await addComponent(page, scenario.icon, { allowEditorApiFallback: false });
      await openComponentConfig(page, scenario.selector);
      await setChoiceLocalOptions(
        page,
        Array.from({ length: 20 }, (_, index) => `Functional ${scenario.name} overflow ${index + 1}`),
      );
      await expectAddControlOutsideScroller(page, scenario.scroller, SEL.checkboxOptionAddButton, SEL.choiceOptionInput);
      await closeComponentConfig(page);
    });
  }
}

export async function exerciseChoiceGroupLineColumnAddControlsStayVisibleThroughUi(page: Page): Promise<void> {
  await test.step('Create a Checkbox Group and overflow its Line and Column lists', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.checkboxGroup);
    await addComponent(page, PALETTE_ICON.checkboxGroup, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.checkboxGroupComponent);
    await openConfigTabById(page, 'tab_selector_conf_source');

    await growChoiceGroupListAndAssertFixedAddControl(
      page,
      SEL.checkboxGroupLinesScroller,
      SEL.checkboxGroupAddLineButton,
      18,
      'Line',
    );
    await growChoiceGroupListAndAssertFixedAddControl(
      page,
      SEL.checkboxGroupColumnsScroller,
      SEL.checkboxGroupAddColumnButton,
      18,
      'Column',
    );
    await closeComponentConfig(page);
  });
}

export async function exerciseCheckboxBaserowSourceThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_checkbox_source_${suffix}`;
  const labels = CHECKBOX_SOURCE_ROWS.map((row) => row[CHECKBOX_SOURCE_LABEL]);

  await ensureFunctionalCheckboxBaserowFixture(page);

  await test.step('Create a Checkbox backed by a Baserow source', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.checkbox);
    await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.checkboxComponent}:visible`).first(), 'Baserow Checkbox component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.checkboxComponent);
    await setTechnicalId(page, technicalId);
    await configureSelectBaserowSource(page, {
      workspace: FUNCTIONAL_BASEROW_WORKSPACE,
      database: FUNCTIONAL_BASEROW_BASE,
      table: CHECKBOX_SOURCE_TABLE,
      expectedColumns: [CHECKBOX_SOURCE_LABEL, CHECKBOX_SOURCE_VALUE],
      displayColumn: CHECKBOX_SOURCE_LABEL,
      valueColumn: CHECKBOX_SOURCE_VALUE,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Baserow Checkbox options', async () => {
    await openPreview(page, SEL.checkboxComponent);
    const component = await visibleChoiceComponent(page, technicalId, SEL.checkboxComponent);
    await expectChoiceOptionOrder(component, labels, 'Baserow Checkbox viewer');
    await expectChoiceIonOptionCount(component, labels.length, 'Baserow Checkbox viewer');
  });

  await test.step('Select multiple Baserow Checkbox options and submit', async () => {
    const component = await visibleChoiceComponent(page, technicalId, SEL.checkboxComponent);
    await checkBaserowCheckboxOption(component, labels[0]);
    await checkBaserowCheckboxOption(component, labels[2]);
    await expectBaserowCheckboxSelectedLabels(component, [labels[0], labels[2]]);
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Baserow Checkbox response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseCheckboxBaserowSourceConfigurationThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_checkbox_source_config_${suffix}`;
  const expectedColumns = [CHECKBOX_SOURCE_LABEL, CHECKBOX_SOURCE_VALUE];

  await ensureFunctionalCheckboxBaserowFixture(page);

  await test.step('Create a Checkbox backed by a Baserow source', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.checkbox);
    await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.checkboxComponent}:visible`).first(), 'Baserow Checkbox component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.checkboxComponent);
    await setTechnicalId(page, technicalId);
    await configureSelectBaserowSource(page, {
      workspace: FUNCTIONAL_BASEROW_WORKSPACE,
      database: FUNCTIONAL_BASEROW_BASE,
      table: CHECKBOX_SOURCE_TABLE,
      expectedColumns,
      displayColumn: CHECKBOX_SOURCE_LABEL,
      valueColumn: CHECKBOX_SOURCE_VALUE,
    });
  });

  await test.step('Reopen Checkbox source configuration and verify persisted Baserow columns', async () => {
    await openSelectBaserowSourceConfiguration(page);
    const tablePicker = await openSelectBaserowTablePicker(page);
    await expectSelectBaserowColumnsVisible(tablePicker, expectedColumns);
    await expect
      .poll(() => checkedSelectBaserowDisplayColumns(tablePicker, expectedColumns), {
        message: 'Checkbox source Display column should persist after reopen',
        timeout: 10_000,
      })
      .toEqual([CHECKBOX_SOURCE_LABEL]);
    await expect
      .poll(() => checkedSelectBaserowValueColumns(tablePicker, expectedColumns), {
        message: 'Checkbox source Value column should persist after reopen',
        timeout: 10_000,
      })
      .toEqual([CHECKBOX_SOURCE_VALUE]);
    await closeSourceSelectionModal(tablePicker);
    await closeComponentConfig(page);
  });
}

export async function exerciseCheckboxGroupBaserowSingleAxisRolesThroughUi(page: Page): Promise<void> {
  const expectedColumns = [CHECKBOX_SOURCE_LABEL, CHECKBOX_SOURCE_VALUE];
  await ensureFunctionalCheckboxBaserowFixture(page);

  await test.step('Create a Checkbox Group backed by a Baserow source', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.checkboxGroup);
    await addComponent(page, PALETTE_ICON.checkboxGroup, { allowEditorApiFallback: false });
    await expect(
      page.locator(`${SEL.checkboxGroupComponent}:visible`).first(),
      'Baserow Checkbox Group component should be visible',
    ).toBeVisible({ timeout: 30_000 });

    await openComponentConfig(page, SEL.checkboxGroupComponent);
    await configureSelectBaserowSource(page, {
      workspace: FUNCTIONAL_BASEROW_WORKSPACE,
      database: FUNCTIONAL_BASEROW_BASE,
      table: CHECKBOX_SOURCE_TABLE,
      expectedColumns,
      displayColumn: CHECKBOX_SOURCE_LABEL,
      valueColumn: CHECKBOX_SOURCE_VALUE,
    });
  });

  await test.step('Switch each Checkbox Group axis and require automatic exclusivity', async () => {
    await openSelectBaserowSourceConfiguration(page);
    const tablePicker = await openSelectBaserowTablePicker(page);
    await expectSelectBaserowColumnsVisible(tablePicker, expectedColumns);
    await expect.poll(() => settledSelectBaserowDisplayColumns(tablePicker, expectedColumns)).toEqual([CHECKBOX_SOURCE_LABEL]);
    await expect.poll(() => settledSelectBaserowValueColumns(tablePicker, expectedColumns)).toEqual([CHECKBOX_SOURCE_VALUE]);

    await clickSelectBaserowColumnRole(tablePicker, CHECKBOX_SOURCE_VALUE, 'display');
    await expect
      .poll(() => settledSelectBaserowDisplayColumns(tablePicker, expectedColumns), {
        message: 'selecting a second Checkbox Group row axis should deselect the first',
        timeout: 10_000,
      })
      .toEqual([CHECKBOX_SOURCE_VALUE]);
    await expect.poll(() => settledSelectBaserowValueColumns(tablePicker, expectedColumns)).toEqual([CHECKBOX_SOURCE_VALUE]);

    await clickSelectBaserowColumnRole(tablePicker, CHECKBOX_SOURCE_LABEL, 'value');
    await expect
      .poll(() => settledSelectBaserowValueColumns(tablePicker, expectedColumns), {
        message: 'selecting a second Checkbox Group column axis should deselect the first',
        timeout: 10_000,
      })
      .toEqual([CHECKBOX_SOURCE_LABEL]);
    await expect.poll(() => settledSelectBaserowDisplayColumns(tablePicker, expectedColumns)).toEqual([CHECKBOX_SOURCE_VALUE]);
    await saveSelectBaserowTablePicker(tablePicker);
  });

  await test.step('Reopen the picker and verify both singleton axes persist', async () => {
    await openSelectBaserowSourceConfiguration(page);
    const tablePicker = await openSelectBaserowTablePicker(page);
    await expect.poll(() => settledSelectBaserowDisplayColumns(tablePicker, expectedColumns)).toEqual([CHECKBOX_SOURCE_VALUE]);
    await expect.poll(() => settledSelectBaserowValueColumns(tablePicker, expectedColumns)).toEqual([CHECKBOX_SOURCE_LABEL]);
    await closeSourceSelectionModal(tablePicker);
    await closeComponentConfig(page);
  });
}

export async function exerciseRadioLocalOptionsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_radio_${suffix}`;
  const defaultOption = `Functional radio default ${suffix}`;
  const selectedOption = `Functional radio selected ${suffix}`;
  const thirdOption = `Functional radio third ${suffix}`;
  const options = [defaultOption, selectedOption, thirdOption];

  await test.step('Create a Radio and configure local options with a default value', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.radioComponent}:visible`).first(), 'Radio component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, technicalId);
    await setChoiceLocalOptions(page, options);
    await expectChoiceOptionInputValues(page, options);
    await setChoiceDefaultValueText(page, defaultOption);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Radio option order and default value', async () => {
    await openPreview(page, SEL.radioComponent);
    const component = await visibleChoiceComponent(page, technicalId, SEL.radioComponent);
    await expectChoiceOptionOrder(component, options, 'Radio viewer');
    await expectRadioSelectedValue(page, 0, defaultOption);
  });

  await test.step('Select another Radio option and submit the viewer response', async () => {
    await selectViewerRadioOption(page, technicalId, selectedOption);
    await expectRadioSelectedValue(page, 0, selectedOption);
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Radio response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseRadioGroupDefaultValuesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const scenarios: ChoiceGroupDefaultScenario[] = [
    {
      mode: 'visual',
      technicalId: `functional_radio_group_visual_${suffix}`,
      expected: {
        'Line 1': 'Option 1',
        'Line 2': 'Option 2',
        'Line 3': '',
      },
    },
    {
      mode: 'text',
      technicalId: `functional_radio_group_text_${suffix}`,
      expected: {
        'Line 1': 'Option 2',
        'Line 2': 'Option 1',
        'Line 3': '',
      },
      textValue: '{"Line 1":"Option 2","Line 2":"Option 1"}',
    },
    {
      mode: 'js',
      technicalId: `functional_radio_group_js_${suffix}`,
      expected: {
        'Line 1': 'Option 1',
        'Line 2': 'Option 2',
        'Line 3': 'Option 1',
      },
      jsReturn: '{"Line 1":"Option 1","Line 2":"Option 2","Line 3":"Option 1"}',
    },
  ];

  await configureChoiceGroupDefaultScenarios(page, {
    kind: 'radioGroup',
    icon: PALETTE_ICON.radioGroup,
    selector: SEL.radioGroupComponent,
    scenarios,
  });

  await verifyChoiceGroupDefaultScenariosInViewer(page, {
    kind: 'radioGroup',
    selector: SEL.radioGroupComponent,
    scenarios,
  });
}

export async function exerciseRadioGroupCustomRowsOptionsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_radio_group_custom_${suffix}`;
  const lines = [`Radio row Alpha ${suffix}`, `Radio row Beta ${suffix}`, `Radio row Gamma ${suffix}`];
  const options = [`Radio option Red ${suffix}`, `Radio option Blue ${suffix}`];
  const expected: Record<string, string> = {
    [lines[0]]: options[0],
    [lines[1]]: options[1],
    [lines[2]]: '',
  };

  await createCustomChoiceGroup(page, {
    kind: 'radioGroup',
    icon: PALETTE_ICON.radioGroup,
    selector: SEL.radioGroupComponent,
    technicalId,
    lines,
    options,
    defaultValueText: JSON.stringify({
      [lines[0]]: options[0],
      [lines[1]]: options[1],
    }),
  });

  await test.step('Verify Radio Group columns align with their rows in the editor', async () => {
    const component = await visibleChoiceComponent(page, technicalId, SEL.radioGroupComponent);
    await expectRadioGroupRowsAndColumnsAligned(component, options, 'editor');
  });

  await verifyCustomChoiceGroupInViewer(page, {
    kind: 'radioGroup',
    selector: SEL.radioGroupComponent,
    technicalId,
    lines,
    options,
    expected,
    verifyRadioAlignment: true,
  });
}

export async function exerciseCheckboxGroupDefaultValuesThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const scenarios: ChoiceGroupDefaultScenario[] = [
    {
      mode: 'visual',
      technicalId: `functional_checkbox_group_visual_${suffix}`,
      expected: {
        'Line 1': ['Option 1'],
        'Line 2': ['Option 2'],
        'Line 3': [],
      },
    },
    {
      mode: 'text',
      technicalId: `functional_checkbox_group_text_${suffix}`,
      expected: {
        'Line 1': ['Option 1', 'Option 2'],
        'Line 2': [],
        'Line 3': ['Option 2'],
      },
      textValue: '{"Line 1":["Option 1","Option 2"],"Line 3":["Option 2"]}',
    },
    {
      mode: 'js',
      technicalId: `functional_checkbox_group_js_${suffix}`,
      expected: {
        'Line 1': ['Option 2'],
        'Line 2': ['Option 1', 'Option 2'],
        'Line 3': [],
      },
      jsReturn: '{"Line 1":["Option 2"],"Line 2":["Option 1","Option 2"]}',
    },
  ];

  await configureChoiceGroupDefaultScenarios(page, {
    kind: 'checkboxGroup',
    icon: PALETTE_ICON.checkboxGroup,
    selector: SEL.checkboxGroupComponent,
    scenarios,
  });

  await verifyChoiceGroupDefaultScenariosInViewer(page, {
    kind: 'checkboxGroup',
    selector: SEL.checkboxGroupComponent,
    scenarios,
  });
}

export async function exerciseCheckboxGroupCustomRowsOptionsThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_checkbox_group_custom_${suffix}`;
  const lines = [`Checkbox row Alpha ${suffix}`, `Checkbox row Beta ${suffix}`, `Checkbox row Gamma ${suffix}`];
  const options = [`Checkbox option Red ${suffix}`, `Checkbox option Blue ${suffix}`];
  const expected: Record<string, string[]> = {
    [lines[0]]: [options[0]],
    [lines[1]]: [options[1]],
    [lines[2]]: [options[0], options[1]],
  };

  await createCustomChoiceGroup(page, {
    kind: 'checkboxGroup',
    icon: PALETTE_ICON.checkboxGroup,
    selector: SEL.checkboxGroupComponent,
    technicalId,
    lines,
    options,
    defaultValueText: JSON.stringify(expected),
  });

  await verifyCustomChoiceGroupInViewer(page, {
    kind: 'checkboxGroup',
    selector: SEL.checkboxGroupComponent,
    technicalId,
    lines,
    options,
    expected,
  });
}

export async function exerciseSelectLocalOptionsSearchAndDropdownThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_select_${suffix}`;
  const options = Array.from({ length: 20 }, (_, index) => `Functional select ${String(index + 1).padStart(2, '0')} ${suffix}`);
  const defaultOption = options[4];

  await test.step('Create a Select with local options and a default value', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'Select component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, technicalId);
    await setChoiceLocalOptions(page, options);
    await expectChoiceOptionInputValues(page, options);
    await setChoiceDefaultValueText(page, defaultOption);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the Select default value', async () => {
    await openPreview(page, SEL.selectComponent);
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: `Select default value should initialize to ${defaultOption}`,
        timeout: 30_000,
      })
      .toBe(defaultOption);
  });

  await test.step('Return to Edit and verify the Select default value persists', async () => {
    const formId = page.url().match(/\/viewer\/([^/?#]+)/)?.[1] ?? '';
    expect(formId, 'Preview URL should expose the application id').not.toBe('');
    await openEditor(page, formId);
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'Select should reappear in Edit').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.selectComponent);
    await openConfigTabById(page, 'defaultvalue');
    await expect
      .poll(() => tinyMceEditorContent(page).then((content) => content.text), {
        message: `Select default value should remain ${defaultOption} after Preview`,
        timeout: 15_000,
      })
      .toContain(defaultOption);
    await closeComponentConfig(page);
  });

  await test.step('Open the Select dropdown and verify the list remains well sized', async () => {
    await openPreview(page, SEL.selectComponent);
    const component = await visibleChoiceComponent(page, technicalId, SEL.selectComponent);
    let dropdown = await openSelectDropdown(page, component, defaultOption);
    await expectSelectDropdownContains(dropdown, defaultOption);
    await closeSelectDropdown(page);

    dropdown = await openSelectDropdown(page, component, defaultOption);
    await expectSelectDropdownContains(dropdown, options[0]);
    await expectSelectDropdownBottomGap(page, dropdown, options.at(-1) ?? options[0]);
    await closeSelectDropdown(page);
  });
}

export async function exerciseButtonLabelIconRenderingThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_button_${suffix}`;
  const simpleLabel = `Functional button ${suffix}`;
  const richLabel = {
    boldText: `Functional button bold ${suffix}`,
    italicText: `Functional button italic ${suffix}`,
  };
  const expectedRichLabel = {
    texts: [richLabel.boldText, richLabel.italicText],
    htmlPattern: new RegExp(
      `<strong[^>]*>\\s*${escapeRegExp(richLabel.boldText)}\\s*<\\/strong>[\\s\\S]*<em[^>]*>\\s*${escapeRegExp(richLabel.italicText)}\\s*<\\/em>`,
      'i',
    ),
  };

  await test.step('Create a Button, configure its simple label, and clear its icon', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.button);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.buttonComponent}:visible`).first(), 'Button component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, technicalId);
    await setButtonLabel(page, simpleLabel);
    await expectButtonDefaultIconName(page);
    await clearButtonIcon(page);
    await closeComponentConfig(page);
  });

  await test.step('Verify the Button simple label and text-only state in the editor', async () => {
    await expectButtonRenderedLabel(page, simpleLabel, 'editor');
    await expectButtonRenderedWithoutIcon(page);
  });

  await test.step('Configure the Button advanced rich label', async () => {
    await openComponentConfig(page, SEL.buttonComponent);
    await setButtonAdvancedRichLabel(page, richLabel);
    await closeComponentConfig(page);
  });

  await test.step('Verify the Button rich label and text-only state in the editor', async () => {
    await expectButtonRenderedHtmlLabel(page, expectedRichLabel, 'editor');
    await expectButtonRenderedWithoutIcon(page);
  });

  await test.step('Open Preview and verify the Button rich label and text-only state', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expectButtonRenderedHtmlLabel(page, expectedRichLabel, 'viewer');
    await expectButtonRenderedWithoutIcon(page);
  });
}

export async function exerciseButtonStateConditionAndWorkflowThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_button_state_source_${suffix}`;
  const buttonTechnicalId = `functional_button_state_${suffix}`;
  const buttonLabel = `Functional state button ${suffix}`;
  const enabledValue = `enable-${suffix}`;
  const disabledValue = `blocked-${suffix}`;
  const toastMessage = `Functional button state toast ${suffix}`;

  await test.step('Create a Text source used by the Button state condition', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.textComponent}:visible`).first(), 'Button state Text source should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, sourceTechnicalId);
    await closeComponentConfig(page);
  });

  await test.step('Create a Button enabled only when the Text source matches', async () => {
    await openComponentsPalette(page, PALETTE_ICON.button);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.buttonComponent}:visible`).first(), 'conditional Button component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, buttonTechnicalId);
    await setButtonLabel(page, buttonLabel);
    await openConfigTabById(page, 'button_state_tab_selector');
    await addButtonStateCondition(page, {
      field: sourceTechnicalId,
      operator: 'equals',
      value: enabledValue,
      mode: 'enabled_when_condition',
    });
    await expectButtonStateModeSelected(page, 'enabled_when_condition');
    await closeComponentConfig(page);
  });

  await test.step('Configure a Toast action on the Button workflow', async () => {
    await openButtonFlowToastActionConfig(page);
    await fillToastMessageText(page, toastMessage);
  });

  await test.step('Open Preview and verify the Button starts disabled', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expect(page.getByRole('button', { name: buttonLabel }).first(), 'conditional Button should render in Preview').toBeVisible({
      timeout: 30_000,
    });
    await fillViewerTextInput(page, sourceTechnicalId, disabledValue);
    await expectRenderedButtonEnabled(page, false, 'viewer conditional');
  });

  await test.step('Enter the matching value, click the enabled Button, and verify its workflow runs', async () => {
    await fillViewerTextInput(page, sourceTechnicalId, enabledValue);
    await expectRenderedButtonEnabled(page, true, 'viewer conditional');
    await recordToasts(page);
    await clickViewerButtonByLabel(page, buttonTechnicalId, buttonLabel);
    await expect
      .poll(async () => (await recordedToasts(page)).join(' | '), {
        message: 'enabled Button should execute its configured Toast workflow',
        timeout: 30_000,
      })
      .toContain(toastMessage);
  });
}

export async function exerciseMapConfiguredHeightRenderingThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_map_${suffix}`;
  const configuredHeight = 540;
  const minimumRenderedHeight = configuredHeight - 50;

  await test.step('Create a Map and configure its height', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.map);
    await addComponent(page, PALETTE_ICON.map, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.mapComponent}:visible`).first(), 'Map component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(SEL.mapViewer).first(), 'Map renderer should be visible in editor').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.mapComponent);
    await setTechnicalId(page, technicalId);
    await openConfigTabById(page, 'data_interactions');
    await setMapHeightAndClose(page, String(configuredHeight));
  });

  await test.step('Verify the configured Map height in the editor canvas', async () => {
    await expect
      .poll(() => mapHeight(page), {
        message: `editor Map should render at least ${minimumRenderedHeight}px high`,
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(minimumRenderedHeight);
  });

  await test.step('Open Preview and verify the configured Map height in the viewer', async () => {
    await openPreview(page, SEL.mapViewer);
    await expect
      .poll(() => mapHeight(page), {
        message: `viewer Map should render at least ${minimumRenderedHeight}px high`,
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(minimumRenderedHeight);
  });
}

export async function exerciseMapHeightResetThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_map_reset_${suffix}`;
  const configuredHeight = 540;
  const defaultHeight = 400;
  const minimumConfiguredHeight = configuredHeight - 50;
  const minimumResetHeight = defaultHeight - 40;
  const maximumResetHeight = defaultHeight + 80;

  await test.step('Create a Map and configure a custom height before reset', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.map);
    await addComponent(page, PALETTE_ICON.map, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.mapComponent}:visible`).first(), 'Map component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(SEL.mapViewer).first(), 'Map renderer should be visible in editor').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.mapComponent);
    await setTechnicalId(page, technicalId);
    await openConfigTabById(page, 'data_interactions');
    await setMapHeightAndClose(page, String(configuredHeight));
  });

  await test.step('Verify the custom Map height before reset', async () => {
    await expect
      .poll(() => mapHeight(page), {
        message: `editor Map should render at least ${minimumConfiguredHeight}px high before reset`,
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(minimumConfiguredHeight);
  });

  await test.step('Clear the Map height and verify the editor returns to the default height', async () => {
    await openComponentConfig(page, SEL.mapComponent);
    await openConfigTabById(page, 'data_interactions');
    await setMapHeightAndClose(page, '');
    await expect
      .poll(() => mapHeight(page), {
        message: `editor Map should return close to the default ${defaultHeight}px height after reset`,
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(minimumResetHeight);
    await expect
      .poll(() => mapHeight(page), {
        message: `editor Map should not keep the custom ${configuredHeight}px height after reset`,
        timeout: 15_000,
      })
      .toBeLessThanOrEqual(maximumResetHeight);
  });

  await test.step('Reopen Map configuration and verify the reset value persisted', async () => {
    await openComponentConfig(page, SEL.mapComponent);
    await openConfigTabById(page, 'data_interactions');
    const input = page.locator(SEL.mapHeightInput).first();
    await expect(input, 'Map height input should reopen after reset').toBeVisible({ timeout: 15_000 });
    await expect(input, 'Map height input should not restore the custom value after reset').not.toHaveValue(String(configuredHeight), {
      timeout: 10_000,
    });
    const value = (await input.inputValue()).trim();
    expect(value, 'Map height reset should reopen as blank/default value').toMatch(/^(?:|400|400px)$/);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the reset Map height is used in the viewer', async () => {
    await openPreview(page, SEL.mapViewer);
    await expect
      .poll(() => mapHeight(page), {
        message: `viewer Map should render close to the default ${defaultHeight}px height after reset`,
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(minimumResetHeight);
    await expect
      .poll(() => mapHeight(page), {
        message: `viewer Map should not keep the custom ${configuredHeight}px height after reset`,
        timeout: 15_000,
      })
      .toBeLessThanOrEqual(maximumResetHeight);
  });
}

export async function exerciseBusinessLogicFormulaSourceThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const formulaTechnicalId = `functional_formula_${suffix}`;
  const selectTechnicalId = `functional_formula_select_${suffix}`;
  const formulaValue = `Functional formula ${suffix}`;
  const otherValue = `Functional other ${suffix}`;

  await test.step('Create a Business logic formula through Workflows', async () => {
    await createTextBusinessLogicFormula(page, formulaTechnicalId, formulaValue);
  });

  await test.step('Create a Select component using the formula from the Source Palette', async () => {
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'Select component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, selectTechnicalId);
    await setChoiceLocalOptions(page, [formulaValue, otherValue]);
    await setChoiceDefaultValueFromSourcePalette(page, 'formulas', formulaTechnicalId);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the formula source is evaluated by the viewer', async () => {
    await recordToasts(page);
    await openPreview(page, SEL.selectComponent);
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: 'Select default value should come from the Business logic formula',
        timeout: 30_000,
      })
      .toBe(formulaValue);
    expect(await recordedToasts(page), 'formula evaluation should not raise a parsing toast').not.toContain("Unexpected token '??'");
  });

  await test.step('Reload the viewer and verify the formula source is evaluated again', async () => {
    await page.reload();
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: 'Select default value should still come from the Business logic formula after viewer reload',
        timeout: 30_000,
      })
      .toBe(formulaValue);
  });
}

export async function exerciseBusinessLogicFormulaDropIntoJavascriptThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const formulaTechnicalId = `functional_formula_drop_${suffix}`;
  const textTechnicalId = `functional_formula_drop_target_${suffix}`;

  await test.step('Create a Business logic formula through Workflows', async () => {
    await createTextBusinessLogicFormula(page, formulaTechnicalId, `Functional formula drop ${suffix}`);
  });

  await test.step('Drop the formula from Source Palette into a Text JavaScript default value', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, textTechnicalId);
    await openTextDefaultValueJavascriptModeThroughUi(page);

    const payload = await dropSourcePaletteEntryIntoVisibleMonaco(
      page,
      'formulas',
      formulaTechnicalId,
      formulaTechnicalId,
    );
    expect(payload.internalData, 'formula drag should be identified as an internal Source Palette drag').toBe('true');
    expect(payload.plainData, 'formula drag should expose JavaScript text to Monaco').toContain(formulaTechnicalId);
    await closeComponentConfig(page);
  });

  await test.step('Reopen the Text default value and verify the dropped formula persists', async () => {
    await openComponentConfigByTechnicalId(page, textTechnicalId, SEL.textComponent);
    await openTextDefaultValueJavascriptModeThroughUi(page);
    await expect(
      page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last(),
      'reopened JavaScript default value should retain the dropped formula',
    ).toContainText(formulaTechnicalId, { timeout: 15_000 });
    await closeComponentConfig(page);
  });
}

export async function exerciseBusinessLogicDynamicFieldFormulaThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_formula_source_${suffix}`;
  const formulaTechnicalId = `functional_dynamic_formula_${suffix}`;
  const selectTechnicalId = `functional_dynamic_formula_select_${suffix}`;
  const initialValue = `Functional dynamic initial ${suffix}`;
  const editedValue = `Functional dynamic edited ${suffix}`;
  const otherValue = `Functional dynamic other ${suffix}`;

  await test.step('Create the Text source used by the dynamic formula', async () => {
    await addConfiguredTextInput(page, 0, sourceTechnicalId, async () => {
      await setTextDefaultValueText(page, initialValue);
    });
  });

  await test.step('Create a Business logic formula that returns the Text source value', async () => {
    await createTextBusinessLogicFormula(page, formulaTechnicalId, `Temporary formula ${suffix}`);
    await openBusinessLogicFormulaConfigByTechnicalId(page, formulaTechnicalId);
    await setBusinessLogicJavaScriptFormula(page, `const id = "${sourceTechnicalId}";\n\treturn fields[id];`, `fields[id]`);
    await closeComponentConfig(page);
  });

  await test.step('Create a Select component using the dynamic formula from the Source Palette', async () => {
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'dynamic formula Select component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, selectTechnicalId);
    await setChoiceLocalOptions(page, [initialValue, editedValue, otherValue]);
    await setChoiceDefaultValueFromSourcePalette(page, 'formulas', formulaTechnicalId);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the formula follows the Text source value', async () => {
    await recordToasts(page);
    await openPreview(page, SEL.textComponent);
    await expectViewerTextInputValue(page, 0, initialValue);
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: 'Select default value should come from the dynamic Business logic formula',
        timeout: 30_000,
      })
      .toBe(initialValue);

    await fillViewerTextInput(page, sourceTechnicalId, editedValue);
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: 'Select value should refresh when the Business logic source field changes',
        timeout: 30_000,
      })
      .toBe(editedValue);

    expect(await recordedToasts(page), 'dynamic formula evaluation should not raise a parsing toast').not.toContain("Unexpected token '??'");
  });
}

export async function exerciseSliderBoundsLabelsAndViewerValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_slider_${suffix}`;
  const min = 10;
  const max = 70;
  const stepValue = 5;
  const viewerValue = 25;
  const labels = {
    min: `Low ${suffix}`,
    max: `High ${suffix}`,
  };

  await test.step('Create a Slider and configure its bounds and labels', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.slider);
    await addComponent(page, PALETTE_ICON.slider, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.sliderComponent}:visible`).first(), 'Slider component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.sliderComponent);
    await setTechnicalId(page, technicalId);
    await setSliderDataInteractionValues(page, {
      min: String(min),
      max: String(max),
      step: String(stepValue),
      minLabel: labels.min,
      maxLabel: labels.max,
    });
    await setSliderStyleValues(page, { pin: true, snaps: true });
    await closeComponentConfig(page);
  });

  await test.step('Reopen the Slider configuration and verify values persisted', async () => {
    await openComponentConfig(page, SEL.sliderComponent);
    await expectSliderDataInteractionValues(page, {
      min: String(min),
      max: String(max),
      step: String(stepValue),
      minLabel: labels.min,
      maxLabel: labels.max,
    });
    await expectSliderStyleValues(page, { pin: true, snaps: true });
    await closeComponentConfig(page);
  });

  await test.step('Verify the Slider labels and value in the editor canvas', async () => {
    const component = await visibleSliderComponent(page, technicalId);
    await expectSliderBoundaryLabels(component, labels, 'editor Slider');
    await expectSliderControlState(component, { min, max, step: stepValue, value: min }, 'editor Slider');
    await expectSliderStyleRendering(component, 'editor Slider');
  });

  await test.step('Open Preview and verify the Slider labels and editable value in the viewer', async () => {
    await openPreview(page, SEL.sliderComponent);
    const component = await visibleSliderComponent(page, technicalId);
    await expectSliderBoundaryLabels(component, labels, 'viewer Slider');
    await expectSliderControlState(component, { min, max, step: stepValue, value: min }, 'viewer Slider initial state');
    await expectSliderStyleRendering(component, 'viewer Slider');
    await setSliderControlValue(page, component, viewerValue, 'viewer Slider');
    await expectSliderControlState(component, { min, max, step: stepValue, value: viewerValue }, 'viewer Slider updated state');
  });
}

export async function exerciseDateDefaultBoundsFormatAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_date_${suffix}`;
  const minDate = '2026-02-01';
  const maxDate = '2026-12-31';
  const defaultDate = '2026-07-14';
  const editedDate = '2026-08-15';
  const formattedDefaultDate = '14/07/2026';
  const formattedEditedDate = '15/08/2026';

  await test.step('Create a Date component and configure bounds and default value', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.date);
    await addComponent(page, PALETTE_ICON.date, { allowEditorApiFallback: false });
    await expect(page.locator(`${DATE_COMPONENT}:visible`).first(), 'Date component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, DATE_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setDateBounds(page, { min: minDate, max: maxDate });
    await setChoiceDefaultValueText(page, defaultDate);
    await closeComponentConfig(page);
  });

  await test.step('Reopen Date configuration and verify bounds persisted', async () => {
    await openComponentConfig(page, DATE_COMPONENT);
    await expectDateBounds(page, { min: minDate, max: maxDate });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Date default rendering and submission', async () => {
    await openPreview(page, DATE_COMPONENT);
    const component = await visibleDateComponent(page, technicalId);
    const input = visibleDateInput(component);
    await expect(input, 'Date viewer input should be visible').toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => input.inputValue(), {
        message: `Date viewer should render ${defaultDate} as ${formattedDefaultDate}`,
        timeout: 30_000,
      })
      .toBe(formattedDefaultDate);

    await setViewerDateValue(page, component, technicalId, editedDate);
    await expect
      .poll(() => input.inputValue(), {
        message: `Date viewer should keep the edited picker value ${editedDate} as ${formattedEditedDate}`,
        timeout: 30_000,
      })
      .toBe(formattedEditedDate);

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Date response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseDateAlternateDisplayFormatThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_date_format_${suffix}`;
  const defaultDate = '2026-07-14';
  const editedDate = '2026-08-15';
  const displayFormat = 'YYYY/MM/DD';

  await test.step('Create a Date component with an alternate display format', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.date);
    await addComponent(page, PALETTE_ICON.date, { allowEditorApiFallback: false });
    await expect(page.locator(`${DATE_COMPONENT}:visible`).first(), 'Date component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, DATE_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setChoiceDefaultValueText(page, defaultDate);
    await setDateDisplayFormat(page, displayFormat, 4);
    await closeComponentConfig(page);
  });

  await test.step('Reopen Date configuration and verify the display format persisted', async () => {
    await openComponentConfig(page, DATE_COMPONENT);
    await expectDateDisplayFormat(page, displayFormat, 4);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the alternate Date format keeps the picker usable for submission', async () => {
    await openPreview(page, DATE_COMPONENT);
    const component = await visibleDateComponent(page, technicalId);
    const input = visibleDateInput(component);
    await expect(input, 'Date viewer input should be visible').toBeVisible({ timeout: 30_000 });
    await expect(input, 'Date viewer should render the configured default date').toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/, {
      timeout: 30_000,
    });

    await setViewerDateValue(page, component, technicalId, editedDate);
    await expect(input, 'Date viewer should keep the edited picker value').toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/, {
      timeout: 30_000,
    });

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Date response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

/** #1490: manual Date input is explicit, persistent, strictly validated, and accessible. */
export async function exerciseDateManualInputValidationThroughUi(page: Page): Promise<void> {
  const technicalId = `functional_date_manual_${Date.now()}`;

  await test.step('Create a Date with calendar and manual input enabled', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.date);
    await addComponent(page, PALETTE_ICON.date, { allowEditorApiFallback: false });
    await openComponentConfig(page, DATE_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setDateEntryMode(page, 'both');
    await closeComponentConfig(page);
  });

  await test.step('Reopen Date configuration and retain the entry mode', async () => {
    await openComponentConfig(page, DATE_COMPONENT);
    await expectDateEntryMode(page, 'both');
    await closeComponentConfig(page);
  });

  await test.step('Reject an impossible manual date with accessible feedback', async () => {
    await openPreview(page, DATE_COMPONENT);
    const component = await visibleDateComponent(page, technicalId);
    const manualHost = component.locator('ion-input:visible').first();
    const manualInput = manualHost.locator('input:visible').first();
    await expect(manualInput, 'manual Date input should be visible without browser accessibility mode').toBeVisible({
      timeout: 30_000,
    });
    await expect(manualInput, 'manual Date input should advertise the configured date format').toHaveAttribute(
      'placeholder',
      'DD/MM/YYYY',
    );
    await expect(component.locator('ion-button:visible').first(), 'both mode should retain a calendar trigger').toBeVisible({
      timeout: 15_000,
    });

    await commitManualDate(manualHost, manualInput, '31/02/2026');
    await expect(manualHost, 'an impossible manual Date should be marked invalid').toHaveAttribute('aria-invalid', 'true', {
      timeout: 15_000,
    });
    const error = component.locator('[role="alert"][aria-live="polite"]');
    await expect(error, 'invalid Date feedback should be exposed as a live alert').toBeVisible({ timeout: 15_000 });
    await expect(manualHost, 'invalid Date input should reference its error').toHaveAttribute('aria-describedby', /date_error_/);

    await commitManualDate(manualHost, manualInput, '29/02/2024');
    await expect(manualHost, 'a valid leap-day manual Date should clear invalid state').toHaveAttribute('aria-invalid', 'false', {
      timeout: 15_000,
    });
    await expect(error, 'valid manual Date should clear the live error').toHaveCount(0, { timeout: 15_000 });
    await expect(manualInput, 'valid manual Date text should remain visible').toHaveValue('29/02/2024');
  });

  await test.step('Submit the valid manually entered Date', async () => {
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'valid manual Date should allow form submission').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseTimeDefaultFormatInputAndSubmitThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_time_${suffix}`;
  const defaultTime = '09:45';
  const editedTime = '10:30';

  await test.step('Create a Time component and configure a default value', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.time);
    await addComponent(page, PALETTE_ICON.time, { allowEditorApiFallback: false });
    await expect(page.locator(`${TIME_COMPONENT}:visible`).first(), 'Time component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, TIME_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setChoiceDefaultValueText(page, defaultTime);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify Time default format, viewer input, and submission', async () => {
    await openPreview(page, TIME_COMPONENT);
    const component = await visibleTimeComponent(page, technicalId);
    const input = visibleTimeInput(component);
    await expect(input, 'Time viewer input should be visible').toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => input.inputValue(), {
        message: `Time viewer should render the default value in HH:mm format`,
        timeout: 30_000,
      })
      .toBe(defaultTime);

    await setViewerTimeValue(page, component, technicalId, editedTime);
    await expect
      .poll(() => input.inputValue(), {
        message: `Time viewer should keep the edited value ${editedTime}`,
        timeout: 30_000,
      })
      .toBe(editedTime);

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Time response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function exerciseTimeAlternateDisplayFormatThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const technicalId = `functional_time_format_${suffix}`;
  const defaultTime = '09:45';
  const editedTime = '10:30';
  const displayFormat = 'hh:mm:ss:A';

  await test.step('Create a Time component with a 12-hour seconds display format', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, PALETTE_ICON.time);
    await addComponent(page, PALETTE_ICON.time, { allowEditorApiFallback: false });
    await expect(page.locator(`${TIME_COMPONENT}:visible`).first(), 'Time component should be visible').toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, TIME_COMPONENT);
    await setTechnicalId(page, technicalId);
    await setChoiceDefaultValueText(page, defaultTime);
    await setTimeDisplayFormat(page, displayFormat, 3);
    await closeComponentConfig(page);
  });

  await test.step('Reopen Time configuration and verify the display format persisted', async () => {
    await openComponentConfig(page, TIME_COMPONENT);
    await expectTimeDisplayFormat(page, displayFormat, 3);
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the alternate format keeps the picker usable for submission', async () => {
    await openPreview(page, TIME_COMPONENT);
    const component = await visibleTimeComponent(page, technicalId);
    const input = visibleTimeInput(component);
    await expect(input, 'Time viewer input should be visible').toBeVisible({ timeout: 30_000 });
    await expect(input, 'Time viewer should render the configured default value').toHaveValue(defaultTime, {
      timeout: 30_000,
    });

    const { popover, datetime } = await openTimePickerPopover(page, component, technicalId);
    await confirmTimePickerValue(popover, datetime, editedTime);

    await expect(input, 'Time viewer should keep the edited value after using a 12-hour format picker').toHaveValue(editedTime, {
      timeout: 30_000,
    });
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Time response completion page should render').toBeAttached({
      timeout: 60_000,
    });
  });
}

async function openBusinessLogicFormulaConfigByTechnicalId(page: Page, technicalId: string): Promise<void> {
  await openWorkflowsPanel(page);
  const formula = page.locator(`${SEL.businessLogicComponent}:visible`).filter({ hasText: technicalId }).first();
  const fallback = page.locator(`${SEL.businessLogicComponent}:visible`).last();
  const target = (await formula.isVisible({ timeout: 5_000 }).catch(() => false)) ? formula : fallback;
  await expect(target, `Business logic formula ${technicalId} should be visible in Workflows`).toBeVisible({ timeout: 30_000 });
  await target.scrollIntoViewIfNeeded().catch(() => undefined);
  await page.mouse.move(5, 5);
  await target.hover();
  await page.waitForTimeout(500);
  const box = await target.boundingBox();
  expect(box, `Business logic formula ${technicalId} should have a clickable box`).not.toBeNull();
  await page.mouse.click(box!.x + Math.min(box!.width / 2, box!.width - 5), box!.y + Math.min(box!.height / 2, box!.height - 5));

  const technicalIdInput = page.locator(`${SEL.technicalIdInput}:visible`).first();
  await expect(technicalIdInput, `Business logic formula ${technicalId} configuration should open`).toBeVisible({
    timeout: 15_000,
  });
  await expect(technicalIdInput, `Business logic formula technical id should remain ${technicalId}`).toHaveValue(technicalId, {
    timeout: 10_000,
  });
}

async function setBusinessLogicJavaScriptFormula(page: Page, code: string, expectedText: string): Promise<void> {
  const jsButton = page.locator(`${SEL.defaultValueJavaScriptButton}:visible`).last();
  await expect(jsButton, 'Business logic JavaScript mode button should be visible').toBeVisible({ timeout: 15_000 });
  await jsButton.click({ timeout: 10_000 }).catch(async () => jsButton.dispatchEvent('click'));

  const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
  if (await alert.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await alert.locator('button').last().click({ timeout: 10_000 }).catch(async () => alert.locator('button').last().dispatchEvent('click'));
  }

  const editor = page.locator(`${SEL.defaultValueMonacoEditor} .monaco-editor`).last();
  await expect(editor, 'Business logic JavaScript editor should be visible').toBeVisible({ timeout: 15_000 });
  await editor.click();
  await expect(editor, 'Business logic JavaScript editor should expose a return statement').toContainText('return', {
    timeout: 10_000,
  });
  await page.keyboard.press('Control+F');
  await page.keyboard.type("return '';");
  await page.keyboard.press('Escape');
  await page.keyboard.type(code);
  await page.keyboard.press('Tab');
  await expect(editor, `Business logic JavaScript editor should keep ${expectedText}`).toContainText(expectedText, {
    timeout: 15_000,
  });
  await expect(editor, 'Business logic JavaScript editor should not rewrite the dynamic field lookup to null').not.toContainText(/\bnull\b/, {
    timeout: 5_000,
  });
  await page.waitForTimeout(1_000);
}

async function addConfiguredTextInput(
  page: Page,
  index: number,
  technicalId: string,
  configureDefaultValue: () => Promise<void>,
): Promise<void> {
  await acceptRgpdIfVisible(page);
  await openComponentsPalette(page, PALETTE_ICON.textInput);
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await expect(page.locator(`${SEL.textComponent}:visible`), `Text input ${index + 1} should be added`).toHaveCount(index + 1, {
    timeout: 30_000,
  });
  await openComponentConfigAt(page, SEL.textComponent, index);
  await setTechnicalId(page, technicalId);
  await configureDefaultValue();
  await closeComponentConfig(page);
}

async function ensureFunctionalCheckboxBaserowFixture(page: Page): Promise<void> {
  await test.step('Ensure the functional Checkbox Baserow source table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: FUNCTIONAL_BASEROW_WORKSPACE,
      database: FUNCTIONAL_BASEROW_BASE,
      table: CHECKBOX_SOURCE_TABLE,
      primaryField: CHECKBOX_SOURCE_LABEL,
      columns: [
        { name: CHECKBOX_SOURCE_LABEL, type: 'text' },
        { name: CHECKBOX_SOURCE_VALUE, type: 'text' },
      ],
    });
    const table = assertFunctionalCheckboxBaserowFixture(catalog);
    await replaceBaserowTableRows(page, table.id, CHECKBOX_SOURCE_ROWS);
  });
}

function assertFunctionalCheckboxBaserowFixture(catalog: BaserowCatalog): BaserowCatalog['tables'][number] {
  const table = catalog.tables.find((candidate) => candidate.name === CHECKBOX_SOURCE_TABLE);
  expect(table, `Baserow table ${CHECKBOX_SOURCE_TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of [CHECKBOX_SOURCE_LABEL, CHECKBOX_SOURCE_VALUE]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${CHECKBOX_SOURCE_TABLE}.${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${CHECKBOX_SOURCE_TABLE}.${columnName} should be a Text field`).toBe('text');
  }
  return table!;
}

type ChoiceGroupDefaultMode = 'visual' | 'text' | 'js';
type ChoiceGroupExpected = Record<string, string | string[]>;
type ChoiceGroupKind = Extract<ChoiceViewerKind, 'radioGroup' | 'checkboxGroup'>;

interface ChoiceGroupDefaultScenario {
  mode: ChoiceGroupDefaultMode;
  technicalId: string;
  expected: ChoiceGroupExpected;
  textValue?: string;
  jsReturn?: string;
}

async function configureChoiceGroupDefaultScenarios(
  page: Page,
  config: { kind: ChoiceGroupKind; icon: string; selector: string; scenarios: ChoiceGroupDefaultScenario[] },
): Promise<void> {
  for (const [index, scenario] of config.scenarios.entries()) {
    await test.step(`Create a ${config.kind} with ${scenario.mode} default values`, async () => {
      await acceptRgpdIfVisible(page);
      await openComponentsPalette(page, config.icon);
      await addComponent(page, config.icon, { allowEditorApiFallback: false });
      await expect(page.locator(`${config.selector}:visible`), `${config.kind} component ${index + 1} should be added`).toHaveCount(
        index + 1,
        { timeout: 30_000 },
      );

      await openComponentConfigAt(page, config.selector, index);
      await setTechnicalId(page, scenario.technicalId);
      await configureChoiceGroupDefaultValue(page, scenario);
      await closeComponentConfig(page);
    });
  }
}

async function configureChoiceGroupDefaultValue(page: Page, scenario: ChoiceGroupDefaultScenario): Promise<void> {
  if (scenario.mode === 'visual') {
    await setChoiceGroupDefaultValueVisual(page, scenario.expected);
    return;
  }

  if (scenario.mode === 'text') {
    await setChoiceDefaultValueText(page, scenario.textValue ?? JSON.stringify(scenario.expected));
    return;
  }

  await setChoiceDefaultValueJavascript(page, '{}', scenario.jsReturn ?? JSON.stringify(scenario.expected));
}

async function verifyChoiceGroupDefaultScenariosInViewer(
  page: Page,
  config: { kind: ChoiceGroupKind; selector: string; scenarios: ChoiceGroupDefaultScenario[] },
): Promise<void> {
  await test.step(`Open Preview and verify ${config.kind} default values`, async () => {
    await openPreview(page, config.selector);
    await expect(page.locator(`${config.selector}:visible`), `${config.kind} components should render in viewer`).toHaveCount(
      config.scenarios.length,
      { timeout: 30_000 },
    );

    for (const [index, scenario] of config.scenarios.entries()) {
      await expect
        .poll(() => choiceViewerValue(page, config.kind, index), {
          message: `${scenario.technicalId} should render ${JSON.stringify(scenario.expected)}`,
          timeout: 30_000,
        })
        .toEqual(scenario.expected);
    }

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), `${config.kind} response completion page should render`).toBeAttached({
      timeout: 60_000,
    });
  });
}

async function createCustomChoiceGroup(
  page: Page,
  config: {
    kind: ChoiceGroupKind;
    icon: string;
    selector: string;
    technicalId: string;
    lines: string[];
    options: string[];
    defaultValueText: string;
  },
): Promise<void> {
  await test.step(`Create a ${config.kind} with custom rows and options`, async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, config.icon);
    await addComponent(page, config.icon, { allowEditorApiFallback: false });
    await expect(page.locator(`${config.selector}:visible`).first(), `${config.kind} component should be visible`).toBeVisible({
      timeout: 30_000,
    });

    await openComponentConfig(page, config.selector);
    await setTechnicalId(page, config.technicalId);
    await setChoiceGroupRowsAndOptions(page, config.lines, config.options);
    await setChoiceDefaultValueText(page, config.defaultValueText);
    await closeComponentConfig(page);
  });

  await test.step(`Reopen the ${config.kind} and verify custom rows and options persisted`, async () => {
    await openComponentConfig(page, config.selector);
    await expectChoiceGroupRowsAndOptions(page, config.lines, config.options);
    await closeComponentConfig(page);
  });
}

async function setChoiceGroupRowsAndOptions(page: Page, lines: string[], options: string[]): Promise<void> {
  await openConfigTabById(page, 'tab_selector_conf_source');
  await expectChoiceGroupRowsAndOptions(page, ['Line 1', 'Line 2', 'Line 3'], ['Option 1', 'Option 2']);

  for (const [index, value] of lines.entries()) {
    await fillVisibleInputByValue(page, `Line ${index + 1}`, value, `choice group line ${index + 1}`);
  }
  for (const [index, value] of options.entries()) {
    await fillVisibleInputByValue(page, `Option ${index + 1}`, value, `choice group option ${index + 1}`);
  }

  await page.waitForTimeout(1_000);
  await expectChoiceGroupRowsAndOptions(page, lines, options);
}

async function expectChoiceGroupRowsAndOptions(page: Page, lines: string[], options: string[]): Promise<void> {
  await openConfigTabById(page, 'tab_selector_conf_source');
  for (const line of lines) {
    await expectVisibleInputValue(page, line, `choice group row ${line}`);
  }
  for (const option of options) {
    await expectVisibleInputValue(page, option, `choice group option ${option}`);
  }
}

async function fillVisibleInputByValue(page: Page, currentValue: string, nextValue: string, description: string): Promise<void> {
  const input = await visibleInputByValue(page, currentValue, description);
  await input.fill(nextValue);
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  await input.blur();
  await expect(input, `${description} should keep ${nextValue}`).toHaveValue(nextValue, { timeout: 10_000 });
}

async function expectVisibleInputValue(page: Page, value: string, description: string): Promise<void> {
  const input = await visibleInputByValue(page, value, description);
  await expect(input, `${description} should be visible`).toBeVisible({ timeout: 10_000 });
}

async function visibleInputByValue(page: Page, value: string, description: string): Promise<Locator> {
  const inputs = page.locator('ion-input input:visible, input:visible');
  await expect
    .poll(
      async () => {
        const values: string[] = [];
        const count = await inputs.count();
        for (let index = 0; index < count; index += 1) {
          if (await inputs.nth(index).isVisible().catch(() => false)) {
            values.push(await inputs.nth(index).inputValue().catch(() => ''));
          }
        }
        return values;
      },
      {
        message: `${description} input with value ${value} should be visible`,
        timeout: 15_000,
      },
    )
    .toContain(value);

  const count = await inputs.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = inputs.nth(index);
    if ((await candidate.isVisible().catch(() => false)) && (await candidate.inputValue().catch(() => '')) === value) {
      return candidate;
    }
  }
  throw new Error(`No visible input found for ${description} with value ${value}`);
}

async function verifyCustomChoiceGroupInViewer(
  page: Page,
  config: {
    kind: ChoiceGroupKind;
    selector: string;
    technicalId: string;
    lines: string[];
    options: string[];
    expected: ChoiceGroupExpected;
    verifyRadioAlignment?: boolean;
  },
): Promise<void> {
  await test.step(`Open Preview and verify ${config.kind} custom rows and options`, async () => {
    await openPreview(page, config.selector);
    const component = page.locator(`#${config.technicalId}`).first();
    await expect(component, `${config.kind} ${config.technicalId} should render in Preview`).toBeVisible({
      timeout: 30_000,
    });

    for (const line of config.lines) {
      await expect(component.getByText(line, { exact: true }).first(), `${line} should render in Preview`).toBeVisible({
        timeout: 30_000,
      });
    }
    for (const option of config.options) {
      await expect(component.getByText(option, { exact: true }).first(), `${option} should render in Preview`).toBeVisible({
        timeout: 30_000,
      });
    }

    if (config.verifyRadioAlignment) {
      await expectRadioGroupRowsAndColumnsAligned(component, config.options, 'viewer');
    }

    await expect
      .poll(() => customChoiceGroupViewerValue(component, config.kind, config.lines, config.options), {
        message: `${config.technicalId} should render the configured custom default values`,
        timeout: 30_000,
      })
      .toEqual(config.expected);

    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), `${config.kind} custom response completion page should render`).toBeAttached({
      timeout: 60_000,
    });
  });
}

async function expectRadioGroupRowsAndColumnsAligned(
  component: Locator,
  optionLabels: string[],
  surface: 'editor' | 'viewer',
): Promise<void> {
  const metrics = await component.evaluate((root, labels) => {
    const visible = (element: Element): boolean => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const normalize = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();
    const tableCell = (element: Element | null): HTMLElement | null => {
      let current = element as HTMLElement | null;
      while (current && current !== root) {
        if (getComputedStyle(current).display === 'table-cell') {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };
    const box = (element: HTMLElement | null) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: Math.round(rect.x * 10) / 10, width: Math.round(rect.width * 10) / 10 };
    };

    const elements = [...root.querySelectorAll('*')].filter(visible);
    const headers = labels.map((label) => {
      const text = elements.find((element) => normalize(element.textContent) === label) ?? null;
      return box(tableCell(text));
    });
    const groups = [...root.querySelectorAll('ion-radio-group')].filter(visible);
    return {
      headers,
      wrappers: groups.map((group) => {
        const wrapper = group.querySelector('.radio-group-wrapper');
        return wrapper ? getComputedStyle(wrapper).display : null;
      }),
      rows: groups.map((group) => [...group.querySelectorAll('ion-radio')].filter(visible).map((radio) => box(tableCell(radio)))),
    };
  }, optionLabels);

  expect(metrics.headers, `${surface}: every Radio Group option should have a table-cell header`).not.toContain(null);
  expect(metrics.rows.length, `${surface}: Radio Group should render more than one row`).toBeGreaterThan(1);
  const renderedWrappers = metrics.wrappers.filter((display): display is string => display != null);
  expect(
    renderedWrappers,
    `${surface}: any Ionic Radio Group wrapper should not introduce an extra layout box`,
  ).toEqual(renderedWrappers.map(() => 'contents'));

  for (const [rowIndex, row] of metrics.rows.entries()) {
    expect(row, `${surface}: Radio Group row ${rowIndex + 1} should expose one cell per option`).toHaveLength(optionLabels.length);
    expect(row, `${surface}: Radio Group row ${rowIndex + 1} cells should be measurable`).not.toContain(null);
    for (const [columnIndex, cell] of row.entries()) {
      const header = metrics.headers[columnIndex];
      expect(Math.abs(cell!.x - header!.x), `${surface}: Radio Group column ${columnIndex + 1} x alignment`).toBeLessThanOrEqual(2);
      expect(
        Math.abs(cell!.width - header!.width),
        `${surface}: Radio Group column ${columnIndex + 1} width alignment`,
      ).toBeLessThanOrEqual(2);
    }
  }
}

async function customChoiceGroupViewerValue(
  component: Locator,
  kind: ChoiceGroupKind,
  lines: string[],
  options: string[],
): Promise<ChoiceGroupExpected> {
  return component.evaluate(
    (root, args) => {
      const visible = (element: Element): boolean => {
        const box = (element as HTMLElement).getBoundingClientRect();
        const style = getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };

      if (args.kind === 'radioGroup') {
        const radioGroups = [...root.querySelectorAll('ion-radio-group')].filter(visible) as (HTMLElement & {
          value?: unknown;
        })[];
        return Object.fromEntries(
          args.lines.map((line, index) => {
            const rawValue = radioGroups[index]?.value;
            return [line, typeof rawValue === 'string' ? rawValue : rawValue == null ? '' : String(rawValue)];
          }),
        );
      }

      const checkboxes = [...root.querySelectorAll('ion-checkbox')].filter(visible) as (HTMLElement & { checked?: boolean })[];
      const result: Record<string, string[]> = Object.fromEntries(args.lines.map((line) => [line, []]));
      for (const [index, checkbox] of checkboxes.entries()) {
        if (checkbox.checked === true || checkbox.getAttribute('aria-checked') === 'true') {
          const line = args.lines[Math.floor(index / args.options.length)] ?? `Line ${Math.floor(index / args.options.length) + 1}`;
          const option = args.options[index % args.options.length] ?? `Option ${(index % args.options.length) + 1}`;
          result[line].push(option);
        }
      }
      return result;
    },
    { kind, lines, options },
  );
}

async function expectChoiceOptionInputValues(page: Page, expectedValues: string[]): Promise<void> {
  const inputs = page.locator(SEL.choiceOptionInput);
  await expect(inputs, 'choice local option inputs should match the expected count').toHaveCount(expectedValues.length, {
    timeout: 15_000,
  });

  for (const [index, value] of expectedValues.entries()) {
    await expect(inputs.nth(index), `choice option ${index + 1} should keep ${value}`).toHaveValue(value, {
      timeout: 10_000,
    });
  }
}

async function growChoiceGroupListAndAssertFixedAddControl(
  page: Page,
  scrollerSelector: string,
  addButtonSelector: string,
  targetCount: number,
  label: string,
): Promise<void> {
  const scroller = page.locator(`${scrollerSelector}:visible`).first();
  const addButton = page.locator(`${addButtonSelector}:visible`).first();
  await expect(scroller, `${label} list should be visible`).toBeVisible({ timeout: 15_000 });
  await expect(addButton, `Add ${label} should be visible`).toBeVisible({ timeout: 15_000 });
  const inputs = scroller.locator('input:visible');

  while ((await inputs.count()) < targetCount) {
    const before = await inputs.count();
    await addButton.click({ timeout: 10_000 }).catch(async () => addButton.dispatchEvent('click'));
    await expect
      .poll(() => inputs.count(), {
        message: `Add ${label} should append an editable entry`,
        timeout: 10_000,
      })
      .toBeGreaterThan(before);
  }

  await expectAddControlOutsideScroller(page, scrollerSelector, addButtonSelector, 'input:visible');
}

async function expectAddControlOutsideScroller(
  page: Page,
  scrollerSelector: string,
  addButtonSelector: string,
  itemSelector: string,
): Promise<void> {
  const scroller = page.locator(`${scrollerSelector}:visible`).first();
  const addButton = page.locator(`${addButtonSelector}:visible`).first();
  await expect(scroller, 'choice list scroller should be visible').toBeVisible({ timeout: 15_000 });
  await expect(addButton, 'choice Add control should remain visible').toBeVisible({ timeout: 15_000 });

  const metrics = await scroller.evaluate((element) => ({
    clientHeight: (element as HTMLElement).clientHeight,
    scrollHeight: (element as HTMLElement).scrollHeight,
  }));
  expect(metrics.scrollHeight, 'choice list should genuinely overflow before checking the fixed Add control').toBeGreaterThan(
    metrics.clientHeight,
  );

  const beforeBox = await addButton.boundingBox();
  expect(beforeBox, 'choice Add control should have a bounding box before list scrolling').not.toBeNull();
  await scroller.evaluate((element) => {
    (element as HTMLElement).scrollTop = (element as HTMLElement).scrollHeight;
  });
  await expect.poll(() => scroller.evaluate((element) => (element as HTMLElement).scrollTop)).toBeGreaterThan(0);
  await expect(addButton, 'choice Add control should remain visible after list scrolling').toBeVisible({ timeout: 10_000 });
  const afterBox = await addButton.boundingBox();
  expect(afterBox, 'choice Add control should keep a bounding box after list scrolling').not.toBeNull();
  expect(Math.abs(afterBox!.y - beforeBox!.y), 'choice Add control should stay vertically fixed while its list scrolls').toBeLessThanOrEqual(
    2,
  );

  const items = scroller.locator(itemSelector);
  const beforeCount = await items.count();
  await addButton.click({ timeout: 10_000 }).catch(async () => addButton.dispatchEvent('click'));
  await expect
    .poll(() => items.count(), {
      message: 'fixed choice Add control should remain usable after list scrolling',
      timeout: 10_000,
    })
    .toBeGreaterThan(beforeCount);
}

async function visibleChoiceComponent(page: Page, technicalId: string, componentSelector: string): Promise<Locator> {
  const byTechnicalId = page.locator(`#${technicalId}`).first();
  if (await byTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return byTechnicalId;
  }

  const fallback = page.locator(`${componentSelector}:visible`).first();
  await expect(fallback, `choice component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

async function expectChoiceOptionOrder(component: Locator, expectedValues: string[], description: string): Promise<void> {
  await expect
    .poll(
      () =>
        component.evaluate((root) =>
          [...root.querySelectorAll('ion-item')]
            .map((item) => (item.textContent ?? '').replace(/\s+/g, ' ').trim())
            .filter(Boolean),
        ),
      {
        message: `${description} should render options in configured order`,
        timeout: 20_000,
      },
    )
    .toEqual(expectedValues);
}

async function expectChoiceIonOptionCount(component: Locator, expectedCount: number, description: string): Promise<void> {
  await expect
    .poll(
      () =>
        component.evaluate((root) => {
          const visible = (element: Element) => {
            const box = (element as HTMLElement).getBoundingClientRect();
            const style = getComputedStyle(element);
            return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          };
          return [...root.querySelectorAll('ion-checkbox, ion-radio')].filter(visible).length;
        }),
      {
        message: `${description} should render exactly ${expectedCount} visible choice options`,
        timeout: 20_000,
      },
    )
    .toBe(expectedCount);
}

async function checkBaserowCheckboxOption(component: Locator, option: string): Promise<void> {
  const checkbox = component.getByRole('checkbox', { name: option }).first();
  await expect(checkbox, `Baserow Checkbox option ${option} should be visible`).toBeVisible({ timeout: 10_000 });
  await checkbox.scrollIntoViewIfNeeded().catch(() => undefined);
  const box = await checkbox.boundingBox();
  await checkbox
    .click({
      timeout: 10_000,
      position: box ? { x: Math.min(9, box.width / 2), y: box.height / 2 } : undefined,
    })
    .catch(async () => checkbox.dispatchEvent('click'));
  await expectBaserowCheckboxSelectedLabels(component, [option], { partial: true });
}

async function expectBaserowCheckboxSelectedLabels(
  component: Locator,
  expectedLabels: string[],
  options: { partial?: boolean } = {},
): Promise<void> {
  const expected = options.partial ? expect.arrayContaining(expectedLabels) : expectedLabels;
  await expect
    .poll(() => baserowCheckboxSelectedLabels(component), {
      message: `Baserow Checkbox selected labels should ${options.partial ? 'include' : 'equal'} ${JSON.stringify(expectedLabels)}`,
      timeout: 10_000,
    })
    .toEqual(expected);
}

async function baserowCheckboxSelectedLabels(component: Locator): Promise<string[]> {
  return component.evaluate((root) => {
    const visible = (element: Element) => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...root.querySelectorAll('ion-checkbox')]
      .filter((checkbox) => {
        const cb = checkbox as HTMLElement & { checked?: boolean };
        return visible(cb) && (cb.checked === true || cb.getAttribute('aria-checked') === 'true');
      })
      .map((checkbox) => ((checkbox.closest('ion-item') ?? checkbox.parentElement ?? checkbox).textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  });
}

async function clickViewerButtonByLabel(page: Page, technicalId: string, label: string): Promise<void> {
  const buttonByRole = page.getByRole('button', { name: label }).first();
  if (await buttonByRole.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await buttonByRole.click({ timeout: 10_000 }).catch(async () => buttonByRole.dispatchEvent('click'));
    return;
  }

  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Button ${technicalId} should be visible before clicking`).toBeVisible({ timeout: 30_000 });
  await root.click({ timeout: 10_000 }).catch(async () => root.dispatchEvent('click'));
}

async function setSliderDataInteractionValues(
  page: Page,
  values: { min: string; max: string; step: string; minLabel: string; maxLabel: string },
): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  await fillSliderSetting(page, SEL.sliderMinValueInput, values.min, 'Slider Min value');
  await fillSliderSetting(page, SEL.sliderMaxValueInput, values.max, 'Slider Max value');
  await fillSliderSetting(page, SEL.sliderStepInput, values.step, 'Slider Step');
  await fillSliderSetting(page, SEL.sliderMinLabelInput, values.minLabel, 'Slider Min Label');
  await fillSliderSetting(page, SEL.sliderMaxLabelInput, values.maxLabel, 'Slider Max Label');
  await page.waitForTimeout(750);
}

async function expectSliderDataInteractionValues(
  page: Page,
  values: { min: string; max: string; step: string; minLabel: string; maxLabel: string },
): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  await expectSliderSetting(page, SEL.sliderMinValueInput, values.min, 'Slider Min value');
  await expectSliderSetting(page, SEL.sliderMaxValueInput, values.max, 'Slider Max value');
  await expectSliderSetting(page, SEL.sliderStepInput, values.step, 'Slider Step');
  await expectSliderSetting(page, SEL.sliderMinLabelInput, values.minLabel, 'Slider Min Label');
  await expectSliderSetting(page, SEL.sliderMaxLabelInput, values.maxLabel, 'Slider Max Label');
}

async function setSliderStyleValues(page: Page, values: { pin: boolean; snaps: boolean }): Promise<void> {
  await openSliderStyleTab(page);
  await setSliderStyleToggle(page, 0, values.pin, 'Slider Pin');
  await setSliderStyleToggle(page, 1, values.snaps, 'Slider Snaps');
  await page.waitForTimeout(750);
}

async function expectSliderStyleValues(page: Page, values: { pin: boolean; snaps: boolean }): Promise<void> {
  await openSliderStyleTab(page);
  await expectSliderStyleToggle(page, 0, values.pin, 'Slider Pin');
  await expectSliderStyleToggle(page, 1, values.snaps, 'Slider Snaps');
}

async function openSliderStyleTab(page: Page): Promise<void> {
  await openStyleTabById(page, 'forms_slider_style');
  await expect(page.locator('c8oforms-toggleswitch:visible').first(), 'Slider style settings should be visible').toBeVisible({
    timeout: 15_000,
  });
}

async function setSliderStyleToggle(page: Page, index: number, enabled: boolean, description: string): Promise<void> {
  const button = sliderStyleToggleButton(page, index, enabled);
  await expect(button, `${description} ${enabled ? 'Yes' : 'No'} option should be visible`).toBeVisible({ timeout: 15_000 });
  if (!(await button.evaluate((element) => element.classList.contains('c8o-btn-selected')).catch(() => false))) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expectSliderStyleToggle(page, index, enabled, description);
}

async function expectSliderStyleToggle(page: Page, index: number, enabled: boolean, description: string): Promise<void> {
  const button = sliderStyleToggleButton(page, index, enabled);
  await expect(button, `${description} should be ${enabled ? 'enabled' : 'disabled'}`).toHaveClass(/c8o-btn-selected/, {
    timeout: 10_000,
  });
}

function sliderStyleToggleButton(page: Page, toggleIndex: number, enabled: boolean): Locator {
  const toggle = page.locator('c8oforms-toggleswitch:visible').nth(toggleIndex);
  return toggle.locator('button.c8o-btn:visible').nth(enabled ? 0 : 1);
}

async function fillSliderSetting(page: Page, selector: string, value: string, description: string): Promise<void> {
  const input = page.locator(selector).first();
  await expect(input, `${description} setting should be visible`).toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  await input.blur();
  await expect(input, `${description} setting should keep ${value}`).toHaveValue(value, { timeout: 15_000 });
}

async function expectSliderSetting(page: Page, selector: string, value: string, description: string): Promise<void> {
  await expect(page.locator(selector).first(), `${description} should persist`).toHaveValue(value, { timeout: 15_000 });
}

async function visibleSliderComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${SEL.sliderComponent}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${SEL.sliderComponent}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${SEL.sliderComponent}:visible`).first();
  await expect(fallback, `Slider component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

async function setDateBounds(page: Page, values: { min: string; max: string }): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  await fillDateSetting(page, DATE_VALUE_SEL.minInput, values.min, 'Date Min value');
  await fillDateSetting(page, DATE_VALUE_SEL.maxInput, values.max, 'Date Max value');
  await page.waitForTimeout(750);
}

async function setDateEntryMode(page: Page, mode: 'calendar' | 'manual' | 'both'): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  const buttons = page.locator(DATE_VALUE_SEL.entryModeToggle).first().locator('button.c8o-btn:visible');
  await expect(buttons, 'Date entry mode should expose calendar, manual, and combined choices').toHaveCount(3, {
    timeout: 15_000,
  });
  const index = mode === 'calendar' ? 0 : mode === 'manual' ? 1 : 2;
  const button = buttons.nth(index);
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  await expectDateEntryMode(page, mode);
}

async function expectDateEntryMode(page: Page, mode: 'calendar' | 'manual' | 'both'): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  const index = mode === 'calendar' ? 0 : mode === 'manual' ? 1 : 2;
  await expect(
    page.locator(DATE_VALUE_SEL.entryModeToggle).first().locator('button.c8o-btn:visible').nth(index),
    `Date entry mode ${mode} should be selected`,
  ).toHaveClass(/c8o-btn-selected/, { timeout: 15_000 });
}

async function expectDateBounds(page: Page, values: { min: string; max: string }): Promise<void> {
  await openConfigTabById(page, 'data_interactions');
  await expect(page.locator(DATE_VALUE_SEL.minInput).first(), 'Date Min value should persist').toHaveValue(values.min, {
    timeout: 15_000,
  });
  await expect(page.locator(DATE_VALUE_SEL.maxInput).first(), 'Date Max value should persist').toHaveValue(values.max, {
    timeout: 15_000,
  });
}

async function fillDateSetting(page: Page, selector: string, value: string, description: string): Promise<void> {
  const input = page.locator(selector).first();
  await expect(input, `${description} setting should be visible`).toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  await input.blur();
  await expect(input, `${description} setting should keep ${value}`).toHaveValue(value, { timeout: 15_000 });
}

async function setDateDisplayFormat(page: Page, format: string, optionIndex: number): Promise<void> {
  await openDisplayFormatStyleTab(page, DATE_VALUE_SEL.displayFormatToggle, 'Date display format');
  const button = displayFormatButton(page, DATE_VALUE_SEL.displayFormatToggle, format, optionIndex);
  await expect(button, `Date display format ${format} option should be visible`).toBeVisible({ timeout: 15_000 });
  if (!(await button.evaluate((element) => element.classList.contains('c8o-btn-selected')).catch(() => false))) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expectDateDisplayFormat(page, format, optionIndex);
}

async function expectDateDisplayFormat(page: Page, format: string, optionIndex: number): Promise<void> {
  await openDisplayFormatStyleTab(page, DATE_VALUE_SEL.displayFormatToggle, 'Date display format');
  await expect(
    displayFormatButton(page, DATE_VALUE_SEL.displayFormatToggle, format, optionIndex),
    `Date display format ${format} should be selected`,
  ).toHaveClass(/c8o-btn-selected/, { timeout: 15_000 });
}

async function visibleDateComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${DATE_COMPONENT}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${DATE_COMPONENT}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${DATE_COMPONENT}:visible`).first();
  await expect(fallback, `Date component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

function visibleDateInput(component: Locator): Locator {
  return component.locator('ion-input:visible input:visible, input:visible').first();
}

async function commitManualDate(host: Locator, input: Locator, value: string): Promise<void> {
  await input.fill(value);
  await host.dispatchEvent('ionChange', { detail: { value } });
  await input.blur();
  await expect(input, `manual Date should display ${value}`).toHaveValue(value, { timeout: 15_000 });
}

async function setViewerDateValue(page: Page, component: Locator, technicalId: string, value: string): Promise<void> {
  const trigger = component.locator(`[id="date_${technicalId}"]:visible`).first();
  if (await trigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await trigger.click({ timeout: 10_000 }).catch(async () => trigger.dispatchEvent('click'));
  } else {
    await component.locator('ion-input:visible, ion-button:visible').first().click({ timeout: 10_000 });
  }

  const popover = page.locator('ion-popover:not(.overlay-hidden):visible').last();
  await expect(popover, 'Date picker popover should open').toBeVisible({ timeout: 30_000 });
  const datetime = popover.locator('ion-datetime').first();
  await expect(datetime, 'Date picker should expose an ion-datetime').toBeVisible({ timeout: 15_000 });

  await datetime.evaluate((element, selectedValue) => {
    const ionDatetime = element as HTMLElement & { value?: string };
    ionDatetime.value = selectedValue;
    element.dispatchEvent(
      new CustomEvent('ionChange', {
        bubbles: true,
        composed: true,
        detail: { value: selectedValue },
      }),
    );
  }, value);

  const okButton = popover.locator('ion-button, button').filter({ hasText: /^Ok$/i }).last();
  if (await okButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await okButton.click({ timeout: 10_000 }).catch(async () => okButton.dispatchEvent('click'));
  } else {
    await popover.evaluate((element) => {
      const ionPopover = element as HTMLElement & { dismiss?: (data?: unknown, role?: string) => Promise<boolean> };
      return ionPopover.dismiss?.(undefined, 'datetime-confirm');
    });
  }

  await expect(popover, 'Date picker popover should close after confirmation').toBeHidden({ timeout: 30_000 });
}

async function visibleTimeComponent(page: Page, technicalId: string): Promise<Locator> {
  const rootWithTechnicalId = page.locator(`${TIME_COMPONENT}:visible`).filter({ has: page.locator(`#${technicalId}`) }).first();
  if (await rootWithTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return rootWithTechnicalId;
  }

  const hostById = page.locator(`${TIME_COMPONENT}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return hostById;
  }

  const fallback = page.locator(`${TIME_COMPONENT}:visible`).first();
  await expect(fallback, `Time component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

function visibleTimeInput(component: Locator): Locator {
  return component.locator('ion-input:visible input:visible, input:visible').first();
}

async function setViewerTimeValue(page: Page, component: Locator, technicalId: string, value: string): Promise<void> {
  const { popover, datetime } = await openTimePickerPopover(page, component, technicalId);
  await confirmTimePickerValue(popover, datetime, value);
}

async function openTimePickerPopover(
  page: Page,
  component: Locator,
  technicalId: string,
): Promise<{ popover: Locator; datetime: Locator }> {
  const trigger = component.locator(`[id="time_${technicalId}"]:visible`).first();
  if (await trigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await trigger.click({ timeout: 10_000 }).catch(async () => trigger.dispatchEvent('click'));
  } else {
    await component.locator('ion-input:visible, ion-button:visible').first().click({ timeout: 10_000 });
  }

  const popover = page.locator('ion-popover:not(.overlay-hidden):visible').last();
  await expect(popover, 'Time picker popover should open').toBeVisible({ timeout: 30_000 });
  const datetime = popover.locator('ion-datetime').first();
  await expect(datetime, 'Time picker should expose an ion-datetime').toBeVisible({ timeout: 15_000 });
  return { popover, datetime };
}

async function confirmTimePickerValue(popover: Locator, datetime: Locator, value: string): Promise<void> {
  await datetime.evaluate((element, selectedValue) => {
    const ionDatetime = element as HTMLElement & { value?: string };
    ionDatetime.value = selectedValue;
    element.dispatchEvent(
      new CustomEvent('ionChange', {
        bubbles: true,
        composed: true,
        detail: { value: selectedValue },
      }),
    );
  }, value);

  const okButton = popover.locator('ion-button, button').filter({ hasText: /^Ok$/i }).last();
  if (await okButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await okButton.click({ timeout: 10_000 }).catch(async () => okButton.dispatchEvent('click'));
  } else {
    await popover.evaluate((element) => {
      const ionPopover = element as HTMLElement & { dismiss?: (data?: unknown, role?: string) => Promise<boolean> };
      return ionPopover.dismiss?.(undefined, 'datetime-confirm');
    });
  }

  await expect(popover, 'Time picker popover should close after confirmation').toBeHidden({ timeout: 30_000 });
}

async function setTimeDisplayFormat(page: Page, format: string, optionIndex: number): Promise<void> {
  await openDisplayFormatStyleTab(page, TIME_VALUE_SEL.displayFormatToggle, 'Time display format');
  const button = displayFormatButton(page, TIME_VALUE_SEL.displayFormatToggle, format, optionIndex);
  await expect(button, `Time display format ${format} option should be visible`).toBeVisible({ timeout: 15_000 });
  if (!(await button.evaluate((element) => element.classList.contains('c8o-btn-selected')).catch(() => false))) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  }
  await expectTimeDisplayFormat(page, format, optionIndex);
}

async function expectTimeDisplayFormat(page: Page, format: string, optionIndex: number): Promise<void> {
  await openDisplayFormatStyleTab(page, TIME_VALUE_SEL.displayFormatToggle, 'Time display format');
  await expect(
    displayFormatButton(page, TIME_VALUE_SEL.displayFormatToggle, format, optionIndex),
    `Time display format ${format} should be selected`,
  ).toHaveClass(/c8o-btn-selected/, { timeout: 15_000 });
}

async function openDisplayFormatStyleTab(page: Page, toggleSelector: string, description: string): Promise<void> {
  const section = page.locator(SEL.styleSectionLabel).first();
  await expect(section, `${description} style section should be visible`).toBeVisible({ timeout: 10_000 });
  await section.click({ timeout: 10_000 }).catch(async () => section.dispatchEvent('click'));

  const tabs = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}:visible`);
  await expect(tabs.first(), `${description} style tabs should be visible`).toBeVisible({ timeout: 15_000 });
  const count = await tabs.count();
  for (let index = 0; index < count; index++) {
    const tab = tabs.nth(index);
    await tab.click({ timeout: 10_000 }).catch(async () => tab.dispatchEvent('click'));
    await page.waitForTimeout(350);
    if (await page.locator(toggleSelector).first().isVisible({ timeout: 1_000 }).catch(() => false)) {
      return;
    }
  }

  throw new Error(`${description} style tab did not expose the display format toggle`);
}

function displayFormatButton(page: Page, toggleSelector: string, format: string, optionIndex: number): Locator {
  const buttons = page.locator(toggleSelector).first().locator('button.c8o-btn:visible, button:visible');
  const byText = buttons.filter({ hasText: format }).first();
  return byText.or(buttons.nth(optionIndex)).first();
}

async function expectSliderBoundaryLabels(
  component: Locator,
  labels: { min: string; max: string },
  description: string,
): Promise<void> {
  await expect(component, `${description} should render the min label`).toContainText(labels.min, { timeout: 30_000 });
  await expect(component, `${description} should render the max label`).toContainText(labels.max, { timeout: 30_000 });
}

async function expectSliderControlState(
  component: Locator,
  expected: { min: number; max: number; step: number; value: number },
  description: string,
): Promise<void> {
  await expect
    .poll(() => sliderControlState(component), {
      message: `${description} should expose configured min max step and current value`,
      timeout: 30_000,
    })
    .toEqual(expected);
}

async function expectSliderStyleRendering(component: Locator, description: string): Promise<void> {
  await expect
    .poll(() => sliderStyleState(component), {
      message: `${description} should render value pin and tick marks`,
      timeout: 30_000,
    })
    .toEqual({ hasValueIndicator: true, hasTickMarks: true });
}

async function setSliderControlValue(page: Page, component: Locator, value: number, description: string): Promise<void> {
  const before = await sliderControlState(component);
  const distance = value - before.value;
  const stepCount = Math.abs(distance / before.step);
  expect(Number.isInteger(stepCount), `${description} target value should be reachable with the configured step`).toBe(true);

  const control = sliderControl(component);
  await control.focus();
  await page.waitForTimeout(200);
  const key = distance >= 0 ? 'ArrowRight' : 'ArrowLeft';
  for (let index = 0; index < stepCount; index += 1) {
    await control.press(key);
    await page.waitForTimeout(100);
  }

  await expect
    .poll(() => sliderControlState(component).then((state) => state.value), {
      message: `${description} should update to ${value}`,
      timeout: 10_000,
    })
    .toBe(value);
}

async function sliderControlState(component: Locator): Promise<{ min: number; max: number; step: number; value: number }> {
  const control = sliderControl(component);
  await expect(control, 'Slider control should be attached').toBeAttached({ timeout: 30_000 });

  return control.evaluate((element) => {
    const input = element as HTMLInputElement & { value?: string };
    const numericAttribute = (names: string[]): number => {
      for (const name of names) {
        const rawValue = name === 'value' ? input.value : element.getAttribute(name);
        const value = Number(rawValue);
        if (Number.isFinite(value)) {
          return value;
        }
      }
      return Number.NaN;
    };

    return {
      min: numericAttribute(['min', 'aria-valuemin']),
      max: numericAttribute(['max', 'aria-valuemax']),
      step: numericAttribute(['step']),
      value: numericAttribute(['value', 'aria-valuenow', 'ng-reflect-model']),
    };
  });
}

function sliderControl(component: Locator): Locator {
  return component.locator('input[type="range"], mat-slider input, .mat-mdc-slider input, [role="slider"], ion-range').first();
}

async function sliderStyleState(component: Locator): Promise<{ hasValueIndicator: boolean; hasTickMarks: boolean }> {
  const root = component.locator('mat-slider, .mat-mdc-slider, .mdc-slider').first();
  await expect(root, 'Slider Material root should be attached').toBeAttached({ timeout: 30_000 });
  return root.evaluate((element) => {
    const slider = element.matches('.mdc-slider') ? element : (element.querySelector('.mdc-slider') ?? element);
    return {
      hasValueIndicator:
        slider.classList.contains('mdc-slider--discrete') || slider.querySelector('.mdc-slider__value-indicator') != null,
      hasTickMarks:
        slider.classList.contains('mdc-slider--tick-marks') ||
        slider.querySelector('.mdc-slider__tick-marks, .mdc-slider__tick-mark--active, .mdc-slider__tick-mark--inactive') != null,
    };
  });
}

async function expectCheckboxSelectedValues(page: Page, index: number, expectedValues: string[]): Promise<void> {
  await expect
    .poll(
      async () => {
        const value = await choiceViewerValue(page, 'checkbox', index);
        return Array.isArray(value) ? value : [];
      },
      {
        message: `Checkbox viewer ${index + 1} selected values should be ${JSON.stringify(expectedValues)}`,
        timeout: 15_000,
      },
    )
    .toEqual(expectedValues);
}

async function expectRadioSelectedValue(page: Page, index: number, expectedValue: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const value = await choiceViewerValue(page, 'radio', index);
        return typeof value === 'string' ? value : '';
      },
      {
        message: `Radio viewer ${index + 1} selected value should be ${expectedValue}`,
        timeout: 15_000,
      },
    )
    .toBe(expectedValue);
}

async function openSelectDropdown(page: Page, component: Locator, expectedText: string): Promise<Locator> {
  const trigger = component.locator('ion-item.class1648542300891, ion-select, button, [role="button"]').first();
  await expect(trigger, 'Select trigger should be visible').toBeVisible({ timeout: 30_000 });
  await trigger.scrollIntoViewIfNeeded().catch(() => undefined);
  await trigger.click({ timeout: 10_000 }).catch(async () => trigger.dispatchEvent('click'));

  const dropdown = page
    .locator('ion-select-popover:visible, ion-alert:not(.overlay-hidden), ion-popover:visible, .class1599133954837:visible, cdk-virtual-scroll-viewport:visible')
    .filter({ hasText: expectedText })
    .last();
  await expect(dropdown, `Select dropdown should include ${expectedText}`).toBeVisible({ timeout: 30_000 });
  return dropdown;
}

async function expectSelectDropdownContains(dropdown: Locator, expectedText: string): Promise<void> {
  await expect(dropdown, `Select dropdown should contain ${expectedText}`).toContainText(expectedText, { timeout: 30_000 });
}

async function expectSelectDropdownBottomGap(page: Page, dropdown: Locator, lastOption: string): Promise<void> {
  await dropdown.evaluate((root) => {
    const scroller =
      root.querySelector<HTMLElement>('cdk-virtual-scroll-viewport') ??
      [...root.querySelectorAll<HTMLElement>('*')].find((element) => element.scrollHeight > element.clientHeight + 20) ??
      (root as HTMLElement);
    scroller.scrollTop = scroller.scrollHeight;
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(700);
  await expect(dropdown, `Select dropdown bottom should expose ${lastOption}`).toContainText(lastOption, { timeout: 30_000 });

  const bottomGap = await dropdown.evaluate((root, optionText) => {
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const scroller =
      root.querySelector<HTMLElement>('cdk-virtual-scroll-viewport') ??
      [...root.querySelectorAll<HTMLElement>('*')].find((element) => visible(element) && element.scrollHeight > element.clientHeight + 20) ??
      (root as HTMLElement);
    const scrollerBox = scroller.getBoundingClientRect();
    const last = [...root.querySelectorAll<HTMLElement>('ion-item, [role="option"], button, div')]
      .filter(visible)
      .filter((element) => (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim() === optionText)
      .sort((a, b) => a.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom)
      .at(-1);
    return last ? Math.round(scrollerBox.bottom - last.getBoundingClientRect().bottom) : 9999;
  }, lastOption);
  expect(bottomGap, 'Select dropdown should not leave a large blank zone after the last local option').toBeLessThan(120);
}

async function closeSelectDropdown(page: Page): Promise<void> {
  await page.keyboard.press('Escape').catch(() => undefined);
  await expect(
    page.locator('ion-select-popover:visible, ion-alert:not(.overlay-hidden), ion-popover:visible, .class1599133954837:visible, cdk-virtual-scroll-viewport:visible'),
    'Select dropdown should close',
  ).toHaveCount(0, { timeout: 10_000 });
}

async function closeSourceSelectionModal(modal: Locator): Promise<void> {
  const cancel = modal.locator('ion-button.class1599830132430:visible').last();
  if (await cancel.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await cancel.click({ timeout: 5_000 }).catch(async () => cancel.dispatchEvent('click'));
  } else {
    await modal.page().keyboard.press('Escape').catch(() => undefined);
  }
  await expect(modal, 'source selection modal should close').toBeHidden({ timeout: 15_000 });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function typeVisibleRichTextValueThroughUi(page: Page, text: string, context: string): Promise<void> {
  const editor = page.locator('.tox-hugerte:visible, .tox-tinymce:visible').last();
  await expect(editor, `${context} should use a rich-text editor instead of a plain field`).toBeVisible({ timeout: 15_000 });

  const toolbar = editor.locator('.tox-toolbar-overlord:visible, .tox-toolbar:visible').first();
  await expect(toolbar, `${context} rich-text toolbar should be visible`).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => toolbar.locator('button:visible').count(), {
      message: `${context} rich-text toolbar should expose formatting controls`,
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(3);

  const body = await visibleTinyMceBody(page);
  await body.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
  await page.keyboard.press('Tab');
  await expect(body, `${context} rich-text editor should keep the entered value`).toContainText(text, { timeout: 10_000 });
}

async function setDescriptionRichText(
  page: Page,
  content: { introText: string; boldText: string; italicText: string },
): Promise<void> {
  const body = await visibleTinyMceBody(page);
  await body.evaluate((targetBody, fragments) => {
    const document = targetBody.ownerDocument;
    const paragraph = document.createElement('p');
    const lineBreak = () => paragraph.append(document.createElement('br'));
    const strong = document.createElement('strong');
    const emphasis = document.createElement('em');

    strong.textContent = fragments.boldText;
    emphasis.textContent = fragments.italicText;
    paragraph.append(document.createTextNode(fragments.introText));
    lineBreak();
    paragraph.append(strong);
    lineBreak();
    paragraph.append(emphasis);
    lineBreak();
    paragraph.append(document.createTextNode('User email: '));
    targetBody.replaceChildren(paragraph);
  }, content);
  await fireActiveTinyMceChange(page, body);

  for (const fragment of [content.introText, content.boldText, content.italicText]) {
    await expect
      .poll(() => body.innerText(), {
        message: `Description TinyMCE editor should contain ${fragment}`,
        timeout: 10_000,
      })
      .toContain(fragment);
  }
}

async function visibleTinyMceBody(page: Page): Promise<Locator> {
  const inlineEditor = page
    .locator('[contenteditable="true"].mce-content-body:visible, .tox-edit-area [contenteditable="true"]:visible')
    .last();
  if (await inlineEditor.isVisible({ timeout: 500 }).catch(() => false)) {
    return inlineEditor;
  }

  for (const selector of ['iframe.tox-edit-area__iframe', 'iframe[title="Rich Text Area"]']) {
    const body = page.frameLocator(selector).last().locator('body');
    if (await body.isVisible({ timeout: 3_000 }).catch(() => false)) {
      return body;
    }
  }

  const eventualInlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(eventualInlineEditor, 'Description HugeRTE editor should be visible').toBeVisible({ timeout: 10_000 });
  return eventualInlineEditor;
}

async function expectDescriptionRichTextEditorHidden(page: Page): Promise<void> {
  await expect(
    page.locator(
      '[contenteditable="true"].mce-content-body:visible, .tox-edit-area [contenteditable="true"]:visible, iframe.tox-edit-area__iframe:visible, iframe[title="Rich Text Area"]:visible',
    ),
    'Description rich-text editor should be limited to the Question configuration tab',
  ).toHaveCount(0, { timeout: 10_000 });
}

async function fireActiveTinyMceChange(page: Page, editorBody?: Locator): Promise<void> {
  const body = editorBody ?? (await visibleTinyMceBody(page));
  await body.evaluate((targetBody) => {
    const frameWindow = targetBody.ownerDocument.defaultView as any;
    const hostWindow = frameWindow?.parent && frameWindow.parent !== frameWindow ? frameWindow.parent : frameWindow;
    const registries = [hostWindow?.hugerte, hostWindow?.tinymce, frameWindow?.hugerte, frameWindow?.tinymce].filter(
      (registry, index, all) => registry && all.indexOf(registry) === index,
    );
    const frameElement = frameWindow?.frameElement as HTMLIFrameElement | null;
    const frameId = frameElement?.id?.replace(/_ifr$/, '');
    const editorIds = [targetBody.id, frameId].filter(
      (id, index, all): id is string => Boolean(id) && all.indexOf(id) === index,
    );
    const matchesTarget = (candidate: any) => {
      if (!candidate || candidate.removed) return false;
      try {
        return (
          candidate.getBody?.() === targetBody ||
          candidate.iframeElement === frameElement ||
          candidate.iframeElement?.contentDocument?.body === targetBody ||
          (frameId != null && candidate.id === frameId)
        );
      } catch {
        return false;
      }
    };
    const editors = registries.flatMap((registry: any) => {
      const rawEditors = registry?.editors;
      return Array.isArray(rawEditors) ? rawEditors : rawEditors != null ? Object.values(rawEditors) : [];
    });
    const editor =
      registries.flatMap((registry: any) => editorIds.map((id) => registry.get?.(id))).find(matchesTarget) ??
      editors.find(matchesTarget);
    if (!editor) throw new Error('HugeRTE instance not found for the visible Description editor');
    editor.fire('input');
    editor.fire('change');
    editor.save?.();
    editor.fire('blur');
  });
}

async function visibleDescriptionComponent(page: Page, technicalId: string): Promise<Locator> {
  const byTechnicalId = page.locator(`#${technicalId}`).first();
  if (await byTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) {
    return byTechnicalId;
  }

  const fallback = page.locator(`${SEL.descriptionComponent}:visible`).first();
  await expect(fallback, `Description component ${technicalId} should be visible`).toBeVisible({ timeout: 30_000 });
  return fallback;
}

async function expectDescriptionText(component: Locator, expectedFragments: string[], surface: 'editor' | 'viewer'): Promise<void> {
  for (const fragment of expectedFragments) {
    await expect
      .poll(
        () =>
          component.evaluate((root, expected) => {
            const rendered = root.textContent ?? '';
            if (rendered.includes(expected)) return rendered;
            const clone = root.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('[c8otype="path"]').forEach((chip) => chip.remove());
            return clone.textContent ?? '';
          }, fragment),
        { message: `${surface}: Description should render ${fragment}`, timeout: 30_000 },
      )
      .toContain(fragment);
  }
}

async function expectDescriptionRichMarkup(
  component: Locator,
  expected: { boldText: string; italicText: string },
  surface: 'editor' | 'viewer',
): Promise<void> {
  await expect
    .poll(
      () =>
        component.evaluate(
          (root, text) => [...root.querySelectorAll('strong, b')].some((element) => (element.textContent ?? '').includes(text)),
          expected.boldText,
        ),
      {
        message: `${surface}: Description should render the bold fragment as rich HTML`,
        timeout: 20_000,
      },
    )
    .toBe(true);

  await expect
    .poll(
      () =>
        component.evaluate(
          (root, text) => [...root.querySelectorAll('em, i')].some((element) => (element.textContent ?? '').includes(text)),
          expected.italicText,
        ),
      {
        message: `${surface}: Description should render the italic fragment as rich HTML`,
        timeout: 20_000,
      },
    )
    .toBe(true);
}

async function expectDescriptionSpacing(
  component: Locator,
  paragraphText: string,
  expected: { marginBottom: string; padding: string },
  surface: 'editor' | 'viewer',
): Promise<void> {
  await expect
    .poll(
      () =>
        component.evaluate((root, text) => {
          const paragraph = [...root.querySelectorAll<HTMLElement>('p')].find((element) => {
            if ((element.textContent ?? '').includes(text)) return true;
            const clone = element.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('[c8otype="path"]').forEach((chip) => chip.remove());
            return (clone.textContent ?? '').includes(text);
          });
          return paragraph
            ? {
                marginBottom: paragraph.style.marginBottom,
                padding: paragraph.style.padding,
              }
            : null;
        }, paragraphText),
      {
        message: `${surface}: Description should preserve configured margin and padding`,
        timeout: 20_000,
      },
    )
    .toEqual(expected);
}

async function openTextInputQuestionTab(page: Page): Promise<void> {
  const section = page.locator(SEL.styleSectionLabel).first();
  await expect(section, 'Text input Appearance section should be visible').toBeVisible({ timeout: 10_000 });
  await section.click({ timeout: 10_000 }).catch(async () => section.dispatchEvent('click'));

  const questionTab = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}:visible`).first();
  await expect(questionTab, 'Text input Question tab should be visible').toBeVisible({ timeout: 10_000 });
  await questionTab.click({ timeout: 10_000 }).catch(async () => questionTab.dispatchEvent('click'));
  await expect(page.locator('iframe.tox-edit-area__iframe, .tox-edit-area iframe, [contenteditable="true"].mce-content-body').last()).toBeVisible({
    timeout: 15_000,
  });
}

async function setTextInputPlaceholder(page: Page, value: string): Promise<void> {
  const input = page.locator(TEXT_INPUT_VALUE_SEL.placeholderInput).first();
  await expect(input, 'Text input placeholder setting should be visible').toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.blur();
  await expect(input, 'Text input placeholder setting should keep the typed value').toHaveValue(value, { timeout: 15_000 });
}

async function setTextInputRequired(page: Page, required: boolean): Promise<void> {
  const toggle = page.locator(TEXT_INPUT_VALUE_SEL.requiredToggle).first();
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
}

async function expectTextInputRequiredInViewer(page: Page, technicalId: string): Promise<void> {
  await expect
    .poll(
      () =>
        page.locator(`#${technicalId}`).first().evaluate((root) => {
          const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
          const ionInput = root.querySelector<HTMLElement>('ion-input, ion-textarea');
          return (
            input?.required === true ||
            ionInput?.hasAttribute('required') === true ||
            ionInput?.getAttribute('ng-reflect-required') === 'true' ||
            [...root.querySelectorAll<HTMLElement>('span, p')].some((element) => (element.innerText ?? '').trim() === '*')
          );
        }),
      {
        message: 'viewer Text input should render a required state',
        timeout: 15_000,
      },
    )
    .toBe(true);
}

async function clickViewerSubmit(page: Page): Promise<void> {
  const submit = page.locator(SEL.viewerSubmitButton).first();
  await expect(submit, 'viewer submit button should be visible').toBeVisible({ timeout: 30_000 });
  await submit.scrollIntoViewIfNeeded().catch(() => undefined);
  await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
}

async function closeComponentConfiguration(page: Page): Promise<void> {
  const closeButton = page.locator(`${SEL.configClose}:visible`).first();
  await expect(closeButton, 'component configuration close button should be visible').toBeVisible({ timeout: 10_000 });
  await closeButton.click({ timeout: 10_000 }).catch(async () => closeButton.dispatchEvent('click'));
  await expect(page.locator(`${SEL.configClose}:visible`), 'component configuration should close').toHaveCount(0, {
    timeout: 15_000,
  });
}
