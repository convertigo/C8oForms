import { expect, test, type Locator, type Page, type Response } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addBaserowAddRowColumnMapping,
  closeComponentConfig,
  c8oCall,
  configureButtonFlowBaserowAddRow,
  expectBaserowAddRowColumnMappingDeletable,
  expectConditionActionConfigurationTabsOnlyIf,
  expectConditionActionModesSwitchable,
  expectFlowConditionOperatorSelectForField,
  expectLoopActionIteratorModesConfigurable,
  expectLoopActionPaletteButtonFullyVisible,
  ensureMailActionSummaryChecked,
  expectMailActionBodyContainsUserName,
  expectMailActionSubjectJavaScriptContains,
  expectMailActionSummaryChecked,
  expectPagesPanelDefaultAfterWorkflowNavigation,
  expectMailActionTextVariableContains,
  fillViewerTextInput,
  fillToastMessageText,
  deleteOpenComponent,
  addPageThroughPagesPanel,
  openButtonFlowConditionActionConfig,
  openButtonFlowBaserowAddRowConfiguration,
  openButtonFlowLoopActionConfig,
  openButtonFlowMailActionConfig,
  openButtonFlowToastActionConfig,
  openComponentConfig,
  openComponentConfigAt,
  openComponentsPalette,
  openConfigTabById,
  openPreview,
  openPagesPanel,
  openPublishedViewer,
  openToastActionMessageEditor,
  openWorkflowsPanel,
  recordedToasts,
  recordToasts,
  publishCurrentFormWithPwa,
  reselectMailActionFromActionSelection,
  selectFlowConditionField,
  setButtonLabel,
  setDescriptionText,
  setMailActionBodyTextWithUserName,
  setMailActionSubjectJavaScriptReturn,
  setMailActionTextVariable,
  setTechnicalId,
  setTextDefaultValueText,
  submitViewerForm,
  tinyMceEditorContent,
} from './studio';

const WORKFLOW_BASEROW_WORKSPACE = 'C8oForms E2E';
const WORKFLOW_BASEROW_DATABASE = 'Functional Fixtures';
const ADD_ROW_TABLE = 'Functional Workflow Add Row';
const ADD_ROW_NAME_COLUMN = 'Name';
const ADD_ROW_NOTE_COLUMN = 'Note';
const TEXT_INPUT_WORKFLOW_SEL = {
  requiredToggle: 'c8oforms-toggleswitch.class1776263100018:visible, .class1776263100018:visible',
} as const;

const MAIL_ACTION_PICKER_BUTTON = `c8oforms-datasourcebutton:has(img[src*="${PALETTE_ICON.mailAction}"])`;
const RESET_FIELDS_ACTION_CARD = 'ion-row[id*="@prefixc8oitem"][id*="@prefixc8otypereset_fields"]';
const RESET_FIELDS_ACTION_EDITOR = 'c8oforms-itemresetfieldsactioneditor';
const RESET_FIELDS_ACTION_NAME = /^\s*(?:Reset fields|Réinitialiser les champs|Restablecer campos|Reimposta campi|重置字段)\s*$/i;
const RESET_FIELDS_SCOPE_LABELS = {
  application: /^\s*(?:Application|Aplicación|Applicazione|应用)\s*$/i,
  page: /^\s*(?:Page|Página|Pagina|页面)\s*$/i,
  component: /^\s*(?:Component|Composant|Componente|组件)\s*$/i,
} as const;
const LOOP_EXPECTED_INPUT_TITLE = /^\s*(?:Expected input|Entrée attendue|Entrada esperada|Input atteso|预期输入)\s*$/i;
const CONDITION_EXPECTED_TITLE = /^\s*(?:Expected condition|Condition attendue|Condición esperada|Condizione attesa|预期条件)\s*$/i;
const GO_BACK_LABEL = /^\s*(?:Go back|Retour|Volver|Indietro|返回)\s*$/i;
const PREVIOUS_PAGE_LABEL = /^\s*(?:Previous page|Page précédente|Página anterior|Pagina precedente|上一页)\s*$/i;
const NAVIGATE_PAGE_ACTION_CARD = 'ion-row[id*="@prefixc8oitem"][id*="@prefixc8otypepush_page"]';
const NAVIGATE_PAGE_ACTION_EDITOR = 'c8oforms-itemnavigatepageactioneditor';
const NAVIGATE_PAGE_ACTION_ICON = 'icn_push_page.svg';

export async function addToastActionToButtonWorkflowThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_button_${suffix}`;
  const buttonLabel = `Functional workflow button ${suffix}`;

  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Open the Button workflow and add a Toast action', async () => {
    const before = await page.locator(SEL.flowToastActionCard).count();
    await openButtonFlowToastActionConfig(page);
    await expect
      .poll(() => page.locator(SEL.flowToastActionCard).count(), {
        message: 'Toast action should appear on the workflow canvas',
        timeout: 30_000,
      })
      .toBeGreaterThan(before);
  });

  await test.step('Assert the Toast action configuration opens', async () => {
    await openToastActionMessageEditor(page);
    await expect(page.locator(SEL.toastMessageRow).last(), 'Toast action message configuration should be open').toBeVisible({
      timeout: 15_000,
    });
  });
}

export async function configureSubmitActionAndVerifyRequiredValidationThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_wf_submit_text_${suffix}`;
  const submittedValue = `Functional submitted ${suffix}`;

  await createTextSource(page, sourceTechnicalId, { required: true });

  await test.step('Open Preview and verify required validation blocks submission', async () => {
    await openPreview(page, SEL.textComponent);
    await expect(viewerTextInput(page, sourceTechnicalId), 'required Text input should render in the viewer').toBeVisible({
      timeout: 30_000,
    });

    await clickViewerSubmitWithoutCompletionWait(page);
    await expect(page.locator(SEL.responseCompletedPage), 'empty required Text input should block submission').toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(viewerTextInput(page, sourceTechnicalId), 'blocked submission should keep the viewer on the form').toBeVisible({
      timeout: 10_000,
    });
  });

  await test.step('Fill the required value and verify submission completes the response', async () => {
    await fillViewerTextInput(page, sourceTechnicalId, submittedValue);
    await expect(viewerTextInput(page, sourceTechnicalId), 'required Text input should keep the filled value').toHaveValue(
      submittedValue,
      { timeout: 10_000 },
    );
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'submission should complete after required fields are valid').toBeAttached({
      timeout: 60_000,
    });
  });
}

export async function configureToastActionAndVerifyViewerToastThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_toast_button_${suffix}`;
  const buttonLabel = `Functional toast button ${suffix}`;
  const toastMessage = `Functional toast message ${suffix}`;

  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Add a Toast action and configure its message', async () => {
    await openButtonFlowToastActionConfig(page);
    await fillToastMessageText(page, toastMessage);
    const editorContent = await tinyMceEditorContent(page);
    expect(editorContent.text, 'Toast message editor should contain the configured message').toContain(toastMessage);
  });

  await test.step('Open Preview and trigger the Button workflow', async () => {
    await openPreview(page, SEL.buttonComponent);
    await expect(viewerButtonByLabel(page, buttonLabel), 'workflow Button should render in the viewer').toBeVisible({
      timeout: 30_000,
    });
    await recordToasts(page);
    await clickViewerButton(page, buttonTechnicalId, buttonLabel);
    await expect
      .poll(async () => (await recordedToasts(page)).join(' | '), {
        message: 'viewer should display the configured Toast message',
        timeout: 30_000,
      })
      .toContain(toastMessage);
  });
}

export async function configureIfActionModesWithTextSourceThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceTechnicalId = `functional_wf_if_text_${suffix}`;
  const buttonTechnicalId = `functional_wf_if_button_${suffix}`;
  const buttonLabel = `Functional if button ${suffix}`;

  await createTextSource(page, sourceTechnicalId);
  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Open the Button workflow and add an If action', async () => {
    await openButtonFlowConditionActionConfig(page);
    await expect(page.locator(SEL.flowConditionActionCard).last(), 'If action should appear on the workflow canvas').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Configure the If action with the Text source and verify available modes', async () => {
    await selectFlowConditionField(page, sourceTechnicalId);
    await expectConditionActionModesSwitchable(page, sourceTechnicalId);
    await expectModernConditionModeGuidance(page);
    await expectFlowConditionOperatorSelectForField(page, sourceTechnicalId);
    await expectConditionActionConfigurationTabsOnlyIf(page);
  });
}

async function expectModernConditionModeGuidance(page: Page): Promise<void> {
  const conditionEditor = page.locator(`${SEL.flowConditionEditor}:visible`).last();
  const guidance = conditionEditor.locator('.condition-help:visible');

  await test.step('Verify modern If guidance in Aa and JavaScript modes', async () => {
    await expect(guidance, 'Fields mode intentionally should not display expression guidance').toHaveCount(0);

    await clickConditionModeAndConfirmWarning(page, SEL.flowConditionTextModeButton);
    await expect(guidance, 'Aa mode should display modern condition guidance').toBeVisible({ timeout: 15_000 });
    await expect(guidance.locator('.condition-help-title'), 'condition guidance should expose a localized title').toHaveText(
      CONDITION_EXPECTED_TITLE,
    );
    await expect(guidance.locator('.condition-help-text'), 'condition guidance should describe a boolean result').toContainText(
      /(?:true.*false|false.*true|vrai.*faux|faux.*vrai|verdadero.*falso|falso.*verdadero|vero.*falso|falso.*vero)/i,
    );
    await expect(guidance.locator('ion-icon[name="information-circle-outline"]'), 'condition guidance should be visibly identified').toBeVisible();

    await clickConditionModeAndConfirmWarning(page, SEL.flowConditionJavaScriptModeButton);
    await expect(guidance, 'JavaScript mode should preserve modern condition guidance').toBeVisible({ timeout: 15_000 });

    await clickConditionModeAndConfirmWarning(page, SEL.flowConditionVisualModeButton);
    await expect(guidance, 'Fields mode should intentionally omit expression guidance').toHaveCount(0);
    await expect(page.locator(SEL.flowConditionBuilder).first(), 'Fields mode should restore the condition builder').toBeVisible({
      timeout: 15_000,
    });
  });
}

async function clickConditionModeAndConfirmWarning(page: Page, selector: string): Promise<void> {
  const button = page.locator(`${selector}:visible`).last();
  await expect(button, `condition mode button ${selector} should be visible`).toBeVisible({ timeout: 15_000 });
  await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
  const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
  if (await alert.isVisible({ timeout: 1_000 }).catch(() => false)) {
    const confirm = alert
      .locator('button.btn--primary, button.alert-button-role-confirm, button.alert-button')
      .last();
    await expect(confirm, 'condition mode warning should expose a confirm action').toBeVisible({ timeout: 5_000 });
    await confirm.click({ timeout: 5_000 }).catch(async () => confirm.dispatchEvent('click'));
    await expect(alert, 'condition mode warning should close after confirmation').toBeHidden({ timeout: 10_000 });
  }
}

export async function configureLoopActionIteratorThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_loop_button_${suffix}`;
  const buttonLabel = `Functional loop button ${suffix}`;

  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Open the Button workflow and add a Loop action', async () => {
    await openButtonFlowLoopActionConfig(page);
    await expect(page.locator(SEL.flowLoopActionCard).last(), 'Loop action should appear on the workflow canvas').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Verify the Loop Source Palette button and iterator modes', async () => {
    const loopEditor = page.locator(`${SEL.flowLoopActionEditor}:visible`).last();
    const guidance = loopEditor.locator('.for-loop-help:visible').last();
    await expect(guidance, 'Loop should document the input expected by its iterator').toBeVisible({ timeout: 15_000 });
    await expect(guidance.locator('.for-loop-help-title'), 'Loop guidance should expose a localized Expected input title').toHaveText(
      LOOP_EXPECTED_INPUT_TITLE,
    );
    const hint = guidance.locator('.for-loop-help-text');
    await expect(hint, 'Loop guidance should state that the source returns an array').toContainText(/(?:array|tableau|数组)/i);
    await expect(hint, 'Loop guidance should cite Baserow records as an iterable example').toContainText(/Baserow/i);
    await expect(hint, 'Loop guidance should cite JSON arrays as an iterable example').toContainText(/JSON/i);
    await expect(guidance.locator('ion-icon[name="information-circle-outline"]'), 'Loop guidance should be visibly identified').toBeVisible();
    await expectLoopActionPaletteButtonFullyVisible(page);
    await expectLoopActionIteratorModesConfigurable(page, '["Functional Alpha", "Functional Beta"]');
  });
}

export async function configureMailActionAndVerifyPersistenceThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_mail_button_${suffix}`;
  const buttonLabel = `Functional mail button ${suffix}`;
  const to = `functional-mail-${suffix}@example.test`;
  const subjectExpression = `'Functional mail subject ${suffix}'`;
  const bodyText = `Functional mail body ${suffix}`;

  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);
  await page.setViewportSize({ width: 1280, height: 720 });

  await test.step('Open the Button workflow and configure a Send mail action', async () => {
    await openButtonFlowMailActionConfig(page);
    await expectMailActionPanelBoundedToViewport(page);
    await expectMailActionSelectorFullyVisible(page);
    await setMailActionTextVariable(page, 'to', to);
    await expectMailActionTextEditorWithoutToolbar(page);
    await setMailActionSubjectJavaScriptReturn(page, subjectExpression);
    await setMailActionBodyTextWithUserName(page, bodyText);
    await expectMailActionHtmlEditorUsable(page);
    await ensureMailActionSummaryChecked(page);
  });

  await test.step('Return to action selection and verify Mail configuration persists', async () => {
    await reselectMailActionFromActionSelection(page);
    await expectMailActionTextVariableContains(page, 'to', to);
    await expectMailActionSubjectJavaScriptContains(page, subjectExpression);
    await expectMailActionBodyContainsUserName(page, bodyText);
    await expectMailActionSummaryChecked(page);
  });
}

async function expectMailActionPanelBoundedToViewport(page: Page): Promise<void> {
  await test.step('Verify the action configuration panel fits the viewport', async () => {
    const panel = page.locator('ion-col.class1741109898625:visible').last();
    const card = panel.locator('ion-card.class1741109898628:visible').last();
    await expect(panel, 'Send Mail action configuration column should be visible').toBeVisible({ timeout: 15_000 });
    await expect(card, 'Send Mail action configuration card should be visible').toBeVisible({ timeout: 15_000 });

    const layout = await panel.evaluate((element) => {
      const panelBox = (element as HTMLElement).getBoundingClientRect();
      const cardElement = element.querySelector('ion-card.class1741109898628') as HTMLElement | null;
      if (!cardElement) return null;
      const cardBox = cardElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const visibleRatio = (box: DOMRect) => {
        const width = Math.max(0, Math.min(box.right, viewportWidth) - Math.max(box.left, 0));
        const height = Math.max(0, Math.min(box.bottom, viewportHeight) - Math.max(box.top, 0));
        return box.width > 0 && box.height > 0 ? (width * height) / (box.width * box.height) : 0;
      };
      return {
        viewportWidth,
        viewportHeight,
        panelLeft: panelBox.left,
        panelRight: panelBox.right,
        panelTop: panelBox.top,
        panelBottom: panelBox.bottom,
        panelHeight: panelBox.height,
        panelVisibleRatio: visibleRatio(panelBox),
        cardVisibleRatio: visibleRatio(cardBox),
      };
    });

    expect(layout, 'Send Mail action panel layout should be measurable').not.toBeNull();
    expect(layout?.panelLeft, 'action panel should not overflow the left viewport edge').toBeGreaterThanOrEqual(-1);
    expect(layout?.panelRight, 'action panel should not overflow the right viewport edge').toBeLessThanOrEqual(
      (layout?.viewportWidth ?? 0) + 1,
    );
    expect(layout?.panelTop, 'action panel should start inside the viewport').toBeGreaterThanOrEqual(-1);
    expect(layout?.panelBottom, 'action panel should end inside the viewport').toBeLessThanOrEqual(
      (layout?.viewportHeight ?? 0) + 1,
    );
    expect(layout?.panelHeight, 'action panel should retain useful viewport height').toBeGreaterThanOrEqual(
      (layout?.viewportHeight ?? 0) - 60,
    );
    expect(layout?.panelVisibleRatio, 'action panel should not be clipped').toBeGreaterThanOrEqual(0.99);
    expect(layout?.cardVisibleRatio, 'action configuration card should not be clipped').toBeGreaterThanOrEqual(0.99);
  });
}

async function expectMailActionSelectorFullyVisible(page: Page): Promise<void> {
  await test.step('Verify the Send Mail source/action selector is not clipped', async () => {
    await openConfigTabById(page, 'tab_selector_choice_action');
    const editor = page.locator('c8oforms-itemactionsubmiteditor:visible').last();
    const selector = editor.locator('c8oforms-datasourcebutton:visible').last();
    const selectionZone = selector.locator('.class1775847135189:visible').last();
    await expect(editor, 'Send Mail action editor should be visible').toBeVisible({ timeout: 15_000 });
    await expect(selector, 'Send Mail source/action selector should be visible').toBeVisible({ timeout: 15_000 });
    await expect(selectionZone, 'Send Mail source/action selection zone should be visible').toBeVisible({ timeout: 15_000 });
    await selector.scrollIntoViewIfNeeded();

    const layout = await selector.evaluate((element) => {
      const host = element as HTMLElement;
      const row = host.closest('.submit-editor-row') as HTMLElement | null;
      const zone = host.querySelector('.class1775847135189') as HTMLElement | null;
      if (!row || !zone) return null;
      const hostBox = host.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();
      const zoneBox = zone.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const visibleRatio = (box: DOMRect) => {
        const width = Math.max(0, Math.min(box.right, viewportWidth) - Math.max(box.left, 0));
        const height = Math.max(0, Math.min(box.bottom, viewportHeight) - Math.max(box.top, 0));
        return box.width > 0 && box.height > 0 ? (width * height) / (box.width * box.height) : 0;
      };
      return {
        hostWidth: hostBox.width,
        rowWidth: rowBox.width,
        hostRight: hostBox.right,
        rowRight: rowBox.right,
        zoneWidth: zoneBox.width,
        zoneHeight: zoneBox.height,
        hostVisibleRatio: visibleRatio(hostBox),
        zoneVisibleRatio: visibleRatio(zoneBox),
      };
    });

    expect(layout, 'Send Mail source/action selector layout should be measurable').not.toBeNull();
    expect(layout?.hostWidth, 'source/action selector should use most of the available row width').toBeGreaterThanOrEqual(
      (layout?.rowWidth ?? 0) * 0.8,
    );
    expect(layout?.hostRight, 'source/action selector should stay inside its row').toBeLessThanOrEqual(
      (layout?.rowRight ?? 0) + 1,
    );
    expect(layout?.zoneWidth, 'source/action selection zone should retain useful width').toBeGreaterThanOrEqual(240);
    expect(layout?.zoneHeight, 'source/action selection zone should retain useful height').toBeGreaterThanOrEqual(72);
    expect(layout?.hostVisibleRatio, 'source/action selector should not be clipped').toBeGreaterThanOrEqual(0.99);
    expect(layout?.zoneVisibleRatio, 'source/action selection zone should not be clipped').toBeGreaterThanOrEqual(0.99);
    await openConfigTabById(page, 'tab_selector_conf_action');
  });
}

async function expectMailActionTextEditorWithoutToolbar(page: Page): Promise<void> {
  await test.step('Verify the Aa text editor has no TinyMCE toolbar', async () => {
    const editor = page.locator('c8oforms-datasourceeditor:visible').last();
    await expect(editor, 'Send Mail Aa editor should be visible').toBeVisible({ timeout: 15_000 });
    await expect(
      editor.locator('[contenteditable="true"].mce-content-body:visible, .tox-edit-area iframe:visible').last(),
      'Send Mail Aa editor should expose an editable body',
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator(
        '.tox.tox-tinymce.tox-tinymce-inline:visible, .tox-editor-header:visible, .tox-toolbar-overlord:visible, .tox-toolbar:visible, .tox-tbtn:visible',
      ),
      'Aa mode should not render an inappropriate TinyMCE toolbar',
    ).toHaveCount(0);
  });
}

async function expectMailActionHtmlEditorUsable(page: Page): Promise<void> {
  await test.step('Verify the Send Mail HTML editor keeps useful editing space', async () => {
    const htmlEditor = page.locator('c8oforms-datasourceeditor:visible .tox.tox-hugerte:visible').last();
    const editArea = htmlEditor.locator('.tox-edit-area:visible').last();
    await expect(htmlEditor, 'Send Mail HTML editor should be visible').toBeVisible({ timeout: 15_000 });
    await expect(editArea, 'Send Mail HTML editor should expose its edit area').toBeVisible({ timeout: 15_000 });

    const layout = await htmlEditor.evaluate((element) => {
      const editorBox = (element as HTMLElement).getBoundingClientRect();
      const area = element.querySelector('.tox-edit-area') as HTMLElement | null;
      const areaBox = area?.getBoundingClientRect();
      const parentBox = element.parentElement?.getBoundingClientRect();
      return {
        editorWidth: editorBox.width,
        editorHeight: editorBox.height,
        editAreaHeight: areaBox?.height ?? 0,
        parentWidth: parentBox?.width ?? 0,
      };
    });

    expect(layout.editorHeight, 'HTML editor should preserve the fixed usable height').toBeGreaterThanOrEqual(319);
    expect(layout.editAreaHeight, 'HTML editor content area should remain useful').toBeGreaterThanOrEqual(160);
    expect(layout.editorWidth, 'HTML editor should fit within its responsive parent').toBeLessThanOrEqual(layout.parentWidth + 1);
    expect(layout.editorWidth, 'HTML editor should retain useful width').toBeGreaterThanOrEqual(240);
  });
}

export async function verifyConfiguredActionReplacementWarningThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_replace_button_${suffix}`;
  const buttonLabel = `Functional replace button ${suffix}`;
  const to = `functional-replace-${suffix}@example.test`;
  const subjectExpression = `'Functional replacement subject ${suffix}'`;
  const bodyText = `Functional replacement body ${suffix}`;

  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Configure a Send mail action before attempting replacement', async () => {
    await openButtonFlowMailActionConfig(page);
    await setMailActionTextVariable(page, 'to', to);
    await setMailActionSubjectJavaScriptReturn(page, subjectExpression);
    await setMailActionBodyTextWithUserName(page, bodyText);
    await ensureMailActionSummaryChecked(page);
  });

  await test.step('Reselect the same action and cancel the replacement warning', async () => {
    await reselectMailActionAndCancelOverwriteWarning(page);
  });

  await test.step('Verify the configured Mail values were preserved after cancelling replacement', async () => {
    await expectMailActionTextVariableContains(page, 'to', to);
    await expectMailActionSubjectJavaScriptContains(page, subjectExpression);
    await expectMailActionBodyContainsUserName(page, bodyText);
    await expectMailActionSummaryChecked(page);
  });
}

export async function configureBaserowAddRowAndVerifyCreatedRowThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const nameTechnicalId = `functional_wf_addrow_name_${suffix}`;
  const noteTechnicalId = `functional_wf_addrow_note_${suffix}`;
  const buttonTechnicalId = `functional_wf_addrow_button_${suffix}`;
  const buttonLabel = `Functional add row button ${suffix}`;
  const rowName = `Functional row ${suffix}`;
  const rowNote = `Functional note ${suffix}`;

  await ensureFunctionalAddRowTable();

  await createTextSource(page, nameTechnicalId);
  await createTextSource(page, noteTechnicalId);
  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Configure the Button workflow Baserow Add Row action', async () => {
    await configureButtonFlowBaserowAddRow(page, {
      workspace: WORKFLOW_BASEROW_WORKSPACE,
      database: WORKFLOW_BASEROW_DATABASE,
      table: ADD_ROW_TABLE,
      expectedColumns: [ADD_ROW_NAME_COLUMN, ADD_ROW_NOTE_COLUMN],
      mappings: [
        { column: ADD_ROW_NAME_COLUMN, sourceLabel: nameTechnicalId },
        { column: ADD_ROW_NOTE_COLUMN, sourceLabel: noteTechnicalId },
      ],
    });
  });

  await test.step('Open Preview, submit Add Row, and verify the created row payload', async () => {
    await openPreview(page, SEL.textComponent);
    await fillViewerTextInput(page, nameTechnicalId, rowName);
    await fillViewerTextInput(page, noteTechnicalId, rowNote);

    await installExecuteSequencesResponseCapture(page);
    const addRowResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/projects/C8Oforms/.json') &&
        (response.request().postData() ?? '').includes('APIV2_Execute_Sequences'),
      { timeout: 30_000 },
    );
    await clickViewerButton(page, buttonTechnicalId, buttonLabel);
    const createdRow = await rowFromActionResponse(page, await addRowResponsePromise);

    expect(createdRow?.[ADD_ROW_NAME_COLUMN], 'the Name mapping should create the expected Baserow value').toBe(rowName);
    expect(createdRow?.[ADD_ROW_NOTE_COLUMN], 'the Note mapping should create the expected Baserow value').toBe(rowNote);
  });
}

export async function verifyBaserowAddRowMappingCanBeDeletedThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_addrow_delete_mapping_${suffix}`;
  const buttonLabel = `Functional add row mapping ${suffix}`;

  await ensureFunctionalAddRowTable();
  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Configure Add Row and delete a mapped column', async () => {
    await openButtonFlowBaserowAddRowConfiguration(page, {
      workspace: WORKFLOW_BASEROW_WORKSPACE,
      database: WORKFLOW_BASEROW_DATABASE,
      table: ADD_ROW_TABLE,
      expectedColumns: [ADD_ROW_NAME_COLUMN, ADD_ROW_NOTE_COLUMN],
    });
    await addBaserowAddRowColumnMapping(page, ADD_ROW_NOTE_COLUMN);
    await expectBaserowAddRowColumnMappingDeletable(page, ADD_ROW_NOTE_COLUMN);
  });
}

export async function verifyWorkflowPersistenceAfterReloadThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const buttonTechnicalId = `functional_wf_persist_button_${suffix}`;
  const buttonLabel = `Functional persistence button ${suffix}`;
  const toastMessage = `Functional persisted toast ${suffix}`;

  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Configure a Toast action before reload', async () => {
    await openButtonFlowToastActionConfig(page);
    await fillToastMessageText(page, toastMessage);
    const editorContent = await tinyMceEditorContent(page);
    expect(editorContent.text, 'Toast message should be configured before reload').toContain(toastMessage);
  });

  await test.step('Reload the editor and reopen the Button workflow', async () => {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(SEL.previewButton).first(), 'editor should reload with the toolbar visible').toBeVisible({
      timeout: 60_000,
    });
    await openButtonWorkflowByText(page, buttonTechnicalId);
  });

  await test.step('Verify the Toast action and message persist after reload', async () => {
    const toastAction = page.locator(SEL.flowToastActionCard).last();
    await expect(toastAction, 'persisted Toast action should still be on the workflow canvas').toBeVisible({
      timeout: 30_000,
    });
    await toastAction.click({ timeout: 10_000 }).catch(async () => toastAction.dispatchEvent('click'));
    await openToastActionMessageEditor(page);
    await expect(page.getByText(toastMessage, { exact: true }).first(), 'persisted Toast action should keep its configured message').toBeVisible({
      timeout: 15_000,
    });
  });
}

export async function configureToastButtonForPublicationThroughUi(
  page: Page,
  options: { technicalId: string; label: string; message: string },
): Promise<void> {
  await createWorkflowButton(page, options.technicalId, options.label);
  await openButtonFlowToastActionConfig(page);
  await fillToastMessageText(page, options.message);
  expect((await tinyMceEditorContent(page)).text, 'published Toast should retain its configured message').toContain(
    options.message,
  );
  await closeComponentConfig(page);
}

export async function replaceToastActionForPublicationThroughUi(
  page: Page,
  options: { workflowName: string; message: string },
): Promise<void> {
  await test.step('Delete the old Toast action through its Studio workflow configuration', async () => {
    await openButtonWorkflowByText(page, options.workflowName);
    const actions = page.locator(SEL.flowToastActionCard);
    const before = await actions.count();
    expect(before, 'the published workflow fixture should contain its old Toast action').toBeGreaterThan(0);
    await actions.last().click({ timeout: 10_000 }).catch(async () => actions.last().dispatchEvent('click'));
    await deleteOpenComponent(page);
    await expect.poll(() => actions.count(), { message: 'old Toast action should be deleted in Studio' }).toBe(before - 1);
  });

  await test.step('Add a replacement Toast action through Studio', async () => {
    await openButtonFlowToastActionConfig(page);
    await fillToastMessageText(page, options.message);
    expect((await tinyMceEditorContent(page)).text, 'replacement Toast should retain its configured message').toContain(
      options.message,
    );
    await closeComponentConfig(page);
  });
}

export async function verifyGenericTaskChangesOnlyNamedStoredResponseFieldThroughUi(
  page: Page,
  formId: string,
): Promise<void> {
  const suffix = Date.now();
  const targetTechnicalId = `functional_wf_generic_target_${suffix}`;
  const witnessTechnicalId = `functional_wf_generic_witness_${suffix}`;
  const targetInitialValue = `Generic target before ${suffix}`;
  const witnessValue = `Generic witness ${suffix}`;
  const targetStoredValue = `Generic target after ${suffix}`;

  await createTextSource(page, targetTechnicalId);
  await createTextSource(page, witnessTechnicalId);

  await test.step('Add Change response field value to the submission workflow', async () => {
    await ensureWorkflowsPanelOpen(page);
    const submissionWorkflow = page.locator(`${SEL.submitFlowButton}:visible`).first();
    await expect(submissionWorkflow, 'Triggered on submission workflow should be visible').toBeVisible({ timeout: 15_000 });
    await submissionWorkflow.click({ timeout: 10_000 }).catch(async () => submissionWorkflow.dispatchEvent('click'));

    const paletteButton = page.locator(`${SEL.componentPanelButton}:visible`).first();
    await expect(paletteButton, 'submission workflow should expose the action Palette').toBeVisible({ timeout: 15_000 });
    await paletteButton.click({ timeout: 10_000 }).catch(async () => paletteButton.dispatchEvent('click'));
    const submitTile = page.locator(`#bloc-palette [draggable="true"]:has(img[src*="${PALETTE_ICON.submitAction}"])`).first();
    await expect(submitTile, 'Generic Task action should be available in the Palette').toBeVisible({ timeout: 30_000 });
    const actions = page.locator(SEL.flowSubmitActionCard);
    const before = await actions.count();
    await submitTile.dblclick({ force: true, delay: 75 });
    await expect.poll(() => actions.count(), { message: 'Generic Task should be added to submission' }).toBeGreaterThan(before);
    await actions.last().click({ timeout: 10_000 }).catch(async () => actions.last().dispatchEvent('click'));

    await openConfigTabById(page, 'tab_selector_choice_action');
    const select = page.locator(`${SEL.dataSourceSelectButton}:visible`).first();
    await expect(select, 'Generic Task should expose the action selector').toBeVisible({ timeout: 15_000 });
    await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
    const modal = page.locator('ion-modal:visible').last();
    await expect(modal, 'Generic Task action picker should be visible').toBeVisible({ timeout: 15_000 });
    const actionsLibrary = modal.getByText(/lib Actions C8Oforms/i).first();
    await expect(actionsLibrary, 'the C8Oforms actions library should be available').toBeVisible({ timeout: 15_000 });
    await actionsLibrary.click({ timeout: 10_000 });
    const editField = modal.locator('c8oforms-datasourcebutton:has(img[src*="forms_edit_field"]) button.c8o-btn').first();
    await expect(editField, 'Change response field value should be selectable').toBeVisible({ timeout: 30_000 });
    await editField.click({ timeout: 10_000 }).catch(async () => editField.dispatchEvent('click'));
    await modal.locator('ion-footer ion-button.class1599830132445:visible').last().click({ timeout: 10_000 });
    await expect(modal, 'Generic Task action picker should close').toBeHidden({ timeout: 30_000 });
    await openConfigTabById(page, 'tab_selector_conf_action');
  });

  await test.step('Bind the Generic Task field_name variable to the target technical name', async () => {
    const variables = page.locator('c8oforms-itemactionsubmiteditor:visible c8oforms-button_variable:visible button.figma-button');
    await expect(variables, 'Change response field value should expose its two variables').toHaveCount(2, { timeout: 30_000 });
    await variables.nth(0).click({ timeout: 10_000 });
    await fillVisibleActionTextEditor(page, targetTechnicalId);
    expect((await tinyMceEditorContent(page)).text.trim(), 'field_name editor should store only the technical name').toBe(
      targetTechnicalId,
    );

    await variables.nth(1).click({ timeout: 10_000 });
    await fillVisibleActionTextEditor(page, targetStoredValue);
    expect((await tinyMceEditorContent(page)).text, 'new response value should be configured').toContain(targetStoredValue);
    await closeComponentConfig(page);
  });

  await test.step('Submit values and verify only the named stored response changed', async () => {
    await expectPagesPanelDefaultAfterWorkflowNavigation(page);
    await publishCurrentFormWithPwa(page, 'anonymous');
    await openPublishedViewer(page, formId, SEL.textComponent);
    await fillViewerTextInput(page, targetTechnicalId, targetInitialValue);
    await fillViewerTextInput(page, witnessTechnicalId, witnessValue);
    await submitViewerForm(page);
    await expect(page.locator(SEL.responseCompletedPage), 'Generic Task submission should complete').toBeAttached({
      timeout: 60_000,
    });

    const stored = await waitForStoredResponseEntries(
      page,
      formId,
      targetTechnicalId,
      targetStoredValue,
      witnessTechnicalId,
      witnessValue,
    );
    expect(stored.get(targetTechnicalId), 'the named target should contain the Generic Task replacement').toContain(
      targetStoredValue,
    );
    expect(stored.get(targetTechnicalId), 'the stale submitted target value should not remain stored').not.toContain(
      targetInitialValue,
    );
    expect(stored.get(witnessTechnicalId), 'the unrelated witness field should remain unchanged').toContain(witnessValue);
  });
}

export async function configureResetFieldsActionAndVerifyComponentScopeThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const targetTechnicalId = `functional_wf_reset_target_${suffix}`;
  const outsideTechnicalId = `functional_wf_reset_outside_${suffix}`;
  const buttonTechnicalId = `functional_wf_reset_button_${suffix}`;
  const buttonLabel = `Functional reset button ${suffix}`;
  const targetDefault = `Functional target default ${suffix}`;
  const outsideDefault = `Functional outside default ${suffix}`;
  const targetChanged = `Functional target changed ${suffix}`;
  const outsideChanged = `Functional outside changed ${suffix}`;

  await createTextSource(page, targetTechnicalId, { defaultValue: targetDefault });
  await createTextSource(page, outsideTechnicalId, { defaultValue: outsideDefault });
  await createWorkflowButton(page, buttonTechnicalId, buttonLabel);

  await test.step('Add Reset fields and verify its application, page, and component scopes', async () => {
    await openButtonWorkflowByText(page, buttonTechnicalId);
    await addResetFieldsActionFromPalette(page);

    const action = page.locator(RESET_FIELDS_ACTION_CARD).last();
    await expect(action, 'Reset fields action should be present on the Button workflow').toBeVisible({ timeout: 15_000 });
    await action.click({ timeout: 10_000 }).catch(async () => action.dispatchEvent('click'));

    const editor = page.locator(`${RESET_FIELDS_ACTION_EDITOR}:visible`).last();
    await expect(editor, 'Reset fields action editor should open').toBeVisible({ timeout: 15_000 });

    const configurationTabs = page.locator(
      '.toast-action-tabs-configuration-buttons:visible button.toast-action-tab-button:visible',
    );
    await expect(configurationTabs, 'Reset fields should expose Scope and Target configuration tabs').toHaveCount(2);

    const scopeButtons = editor.locator('.reset-fields-scope-toggle button.c8o-btn:visible');
    await expect(scopeButtons, 'Reset fields should expose all three scope choices').toHaveCount(3);
    await expect(scopeButtons.nth(0), 'first Reset fields scope should be Application').toHaveText(
      RESET_FIELDS_SCOPE_LABELS.application,
    );
    await expect(scopeButtons.nth(1), 'second Reset fields scope should be Page').toHaveText(RESET_FIELDS_SCOPE_LABELS.page);
    await expect(scopeButtons.nth(2), 'third Reset fields scope should be Component').toHaveText(
      RESET_FIELDS_SCOPE_LABELS.component,
    );
    await expect(scopeButtons.nth(0), 'Application should be the default Reset fields scope').toHaveClass(/c8o-btn-selected/);

    await scopeButtons.nth(1).click({ timeout: 10_000 });
    await expect(scopeButtons.nth(1), 'Page scope should be selectable').toHaveClass(/c8o-btn-selected/, { timeout: 10_000 });
    await configurationTabs.nth(1).click({ timeout: 10_000 });
    const pageTarget = editor.locator('.reset-fields-select-row ion-select:visible');
    await expect(pageTarget, 'Page scope should expose a page target selector').toBeVisible({ timeout: 10_000 });
    await expect(pageTarget.locator('ion-select-option').first(), 'Page target selector should contain the current page').toBeAttached();

    await configurationTabs.nth(0).click({ timeout: 10_000 });
    await scopeButtons.nth(2).click({ timeout: 10_000 });
    await expect(scopeButtons.nth(2), 'Component scope should be selectable').toHaveClass(/c8o-btn-selected/, {
      timeout: 10_000,
    });
    await configurationTabs.nth(1).click({ timeout: 10_000 });
    await selectResetFieldsComponentTarget(page, editor, targetTechnicalId);
  });

  await test.step('Execute Reset fields and verify default and outside-scope values', async () => {
    await openPreview(page, SEL.textComponent);
    await expect(viewerTextInput(page, targetTechnicalId), 'target Text input should start with its configured default').toHaveValue(
      targetDefault,
      { timeout: 30_000 },
    );
    await expect(viewerTextInput(page, outsideTechnicalId), 'outside Text input should start with its configured default').toHaveValue(
      outsideDefault,
      { timeout: 30_000 },
    );

    await fillViewerTextInput(page, targetTechnicalId, targetChanged);
    await fillViewerTextInput(page, outsideTechnicalId, outsideChanged);
    await expect(viewerTextInput(page, targetTechnicalId), 'target Text input should contain the changed value before reset').toHaveValue(
      targetChanged,
    );
    await expect(
      viewerTextInput(page, outsideTechnicalId),
      'outside Text input should contain the changed value before reset',
    ).toHaveValue(outsideChanged);

    await clickViewerButton(page, buttonTechnicalId, buttonLabel);
    await expect(viewerTextInput(page, targetTechnicalId), 'target Text input should return to its configured default').toHaveValue(
      targetDefault,
      { timeout: 15_000 },
    );
    await expect(viewerTextInput(page, outsideTechnicalId), 'field outside component scope should remain unchanged').toHaveValue(
      outsideChanged,
      { timeout: 15_000 },
    );
  });
}

async function addResetFieldsActionFromPalette(page: Page): Promise<void> {
  const existingPaletteTile = page.locator('ion-col[draggable="true"]').filter({ hasText: RESET_FIELDS_ACTION_NAME }).first();
  if (!(await existingPaletteTile.isVisible({ timeout: 1_000 }).catch(() => false))) {
    const paletteButton = await firstVisibleLocator(page, SEL.componentPanelButton, 'action palette panel', 15_000);
    await paletteButton.click({ timeout: 10_000 }).catch(async () => paletteButton.dispatchEvent('click'));
  }

  const actionTile = page.locator('ion-col[draggable="true"]').filter({ hasText: RESET_FIELDS_ACTION_NAME }).first();
  await expect(actionTile, 'Reset fields should be available from the flow action palette').toBeVisible({ timeout: 30_000 });

  const before = await page.locator(RESET_FIELDS_ACTION_CARD).count();
  await actionTile.dblclick({ force: true, delay: 75 });
  await expect
    .poll(() => page.locator(RESET_FIELDS_ACTION_CARD).count(), {
      message: 'Reset fields action should be added to the Button workflow through the palette',
      timeout: 15_000,
    })
    .toBeGreaterThan(before);
}

async function selectResetFieldsComponentTarget(page: Page, editor: Locator, technicalId: string): Promise<void> {
  const select = editor.locator('.reset-fields-select-row ion-select:visible');
  await expect(select, 'Component scope should expose a component target selector').toBeVisible({ timeout: 10_000 });

  const targetOption = select.locator('ion-select-option').filter({ hasText: technicalId }).first();
  await expect(targetOption, `component target ${technicalId} should be present in the selector`).toBeAttached();
  const expectedValue = await targetOption.evaluate((option) =>
    String((option as HTMLElement & { value?: unknown }).value ?? option.getAttribute('value') ?? ''),
  );
  expect(expectedValue, `component target ${technicalId} should expose a stable option value`).not.toBe('');

  await select.click({ timeout: 10_000 });
  const popoverOption = page
    .locator('ion-select-popover ion-item, ion-popover ion-item')
    .filter({ hasText: technicalId })
    .first();
  await expect(popoverOption, `component target ${technicalId} should be selectable`).toBeVisible({ timeout: 10_000 });
  await popoverOption.click({ timeout: 10_000 }).catch(async () => popoverOption.dispatchEvent('click'));

  await expect
    .poll(
      () => select.evaluate((element) => String((element as HTMLElement & { value?: unknown }).value ?? '')),
      {
        message: `Reset fields should persist component target ${technicalId}`,
        timeout: 10_000,
      },
    )
    .toBe(expectedValue);
}

export async function verifyButtonFlowNamesRemainUniqueAfterComponentRecreationThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const baselineNames = await visibleButtonWorkflowNames(page);

  await test.step('Create three Buttons and capture their generated workflow names', async () => {
    await openComponentsPaletteForWorkflowFixture(page);
    for (let index = 1; index <= 3; index++) {
      await createWorkflowButton(
        page,
        `functional_wf_unique_${suffix}_${index}`,
        `Functional unique flow button ${suffix} ${index}`,
      );
    }
  });

  const originalGeneratedNames = await test.step('Verify the three generated workflow names are distinct', async () => {
    const names = await visibleButtonWorkflowNames(page);
    const generated = names.filter((name) => !baselineNames.includes(name));
    expect(generated, 'three Buttons should generate three workflow entries').toHaveLength(3);
    expect(new Set(generated).size, 'initial generated workflow names should be unique').toBe(generated.length);
    return generated;
  });

  await test.step('Delete the middle Button while retaining its workflow', async () => {
    await openComponentsPaletteForWorkflowFixture(page);
    const buttons = page.locator(SEL.buttonComponent);
    await expect(buttons, 'three Button components should exist before deletion').toHaveCount(3);
    await openComponentConfigAt(page, SEL.buttonComponent, 1);
    await deleteOpenComponent(page);
    await expect(buttons, 'deleting one Button should leave two Button components').toHaveCount(2, { timeout: 15_000 });

    const namesAfterDeletion = await visibleButtonWorkflowNames(page);
    for (const retainedName of originalGeneratedNames) {
      expect(namesAfterDeletion, `deleted Button workflow ${retainedName} should intentionally remain`).toContain(retainedName);
    }
  });

  await test.step('Create a replacement Button and verify its workflow name does not collide', async () => {
    await openComponentsPaletteForWorkflowFixture(page);
    await createWorkflowButton(
      page,
      `functional_wf_unique_${suffix}_replacement`,
      `Functional replacement flow button ${suffix}`,
    );

    const names = await visibleButtonWorkflowNames(page);
    const generated = names.filter((name) => !baselineNames.includes(name));
    expect(generated, 'the retained workflows plus the replacement workflow should all remain listed').toHaveLength(4);
    expect(new Set(generated).size, 'replacement workflow must not reuse any retained workflow name').toBe(generated.length);
    for (const retainedName of originalGeneratedNames) {
      expect(generated, `original workflow ${retainedName} should remain after replacement creation`).toContain(retainedName);
    }
  });
}

export async function verifyNavigateToPageGoBackUsesViewerHistoryThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const pageOneMarker = `Functional history origin ${suffix}`;
  const pageThreeMarker = `Functional history destination ${suffix}`;
  const forwardTechnicalId = `functional_wf_history_forward_${suffix}`;
  const backTechnicalId = `functional_wf_history_back_${suffix}`;
  const forwardLabel = `Functional history forward ${suffix}`;
  const backLabel = `Functional history back ${suffix}`;
  const baselineFlowNames = await visibleButtonWorkflowNames(page);

  let forwardFlowName = '';
  let backFlowName = '';
  let pageThreeName = '';

  await test.step('Create the Page 1 marker and forward Button', async () => {
    await openComponentsPaletteForWorkflowFixture(page);
    await addDescriptionMarkerThroughUi(page, `functional_wf_history_origin_marker_${suffix}`, pageOneMarker);
    await createWorkflowButton(page, forwardTechnicalId, forwardLabel);
    const names = await visibleButtonWorkflowNames(page);
    const generated = names.filter((name) => !baselineFlowNames.includes(name));
    expect(generated, 'the Page 1 Button should generate one workflow').toHaveLength(1);
    forwardFlowName = generated[0];
  });

  await test.step('Create Page 2 and Page 3, then add the Page 3 marker and Back Button', async () => {
    await addPageThroughPagesPanel(page);
    pageThreeName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, pageThreeName);
    await openComponentsPaletteForWorkflowFixture(page);
    await addDescriptionMarkerThroughUi(page, `functional_wf_history_destination_marker_${suffix}`, pageThreeMarker);
    await createWorkflowButton(page, backTechnicalId, backLabel);

    const names = await visibleButtonWorkflowNames(page);
    const generated = names.filter((name) => !baselineFlowNames.includes(name) && name !== forwardFlowName);
    expect(generated, 'the Page 3 Button should generate one additional workflow').toHaveLength(1);
    backFlowName = generated[0];
  });

  await test.step('Configure Page 1 to jump directly to Page 3', async () => {
    await configureNavigatePageActionTarget(page, forwardFlowName, pageThreeName);
  });

  await test.step('Configure Page 3 with the distinct Go back history target', async () => {
    await configureNavigatePageActionTarget(page, backFlowName, GO_BACK_LABEL);
  });

  await test.step('Jump Page 1 to Page 3, then return to the visited Page 1 through Go back', async () => {
    await selectEditorPageByName(page, 'Page 1');
    await openPreview(page, SEL.descriptionComponent);
    await expect(page.getByText(pageOneMarker, { exact: true }).first(), 'viewer should start on Page 1').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(pageThreeMarker, { exact: true }).first(), 'Page 3 marker should start hidden').toBeHidden();

    await clickViewerButton(page, forwardTechnicalId, forwardLabel);
    await expect(page.getByText(pageThreeMarker, { exact: true }).first(), 'forward action should jump directly to Page 3').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(pageOneMarker, { exact: true }).first(), 'Page 1 marker should be hidden on Page 3').toBeHidden();

    await clickViewerButton(page, backTechnicalId, backLabel);
    await expect(
      page.getByText(pageOneMarker, { exact: true }).first(),
      'Go back should return to visited Page 1 rather than index-adjacent Page 2',
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(pageThreeMarker, { exact: true }).first(), 'Page 3 marker should be hidden after Go back').toBeHidden();
  });
}

async function configureNavigatePageActionTarget(page: Page, flowName: string, target: string | RegExp): Promise<void> {
  await openButtonWorkflowByText(page, flowName);

  await test.step(`Add Navigate to Page to ${flowName}`, async () => {
    const paletteButton = await firstVisibleLocator(page, SEL.componentPanelButton, 'action palette panel', 15_000);
    await paletteButton.click({ timeout: 10_000 }).catch(async () => paletteButton.dispatchEvent('click'));
    const tile = page
      .locator('#bloc-palette [draggable="true"]')
      .filter({ has: page.locator(`img[src*="${NAVIGATE_PAGE_ACTION_ICON}"]`) })
      .first();
    await expect(tile, 'Navigate to Page should be available from the action palette').toBeVisible({ timeout: 30_000 });

    const actions = page.locator(NAVIGATE_PAGE_ACTION_CARD);
    const before = await actions.count();
    await tile.dblclick({ force: true, delay: 75 });
    await expect
      .poll(() => actions.count(), {
        message: 'Navigate to Page action should be added to the Button workflow',
        timeout: 15_000,
      })
      .toBeGreaterThan(before);
    await actions.last().click({ timeout: 10_000 }).catch(async () => actions.last().dispatchEvent('click'));
  });

  await test.step(`Select the Navigate to Page target for ${flowName}`, async () => {
    const editor = page.locator(`${NAVIGATE_PAGE_ACTION_EDITOR}:visible`).last();
    await expect(editor, 'Navigate to Page action editor should open').toBeVisible({ timeout: 15_000 });
    const options = editor.locator('.navigate-page-toggle button.c8o-btn:visible');
    await expect
      .poll(() => options.count(), {
        message: 'Navigate to Page should expose Next, Previous, Go back, and page targets',
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(3);
    const goBack = options.filter({ hasText: GO_BACK_LABEL }).first();
    const previous = options.filter({ hasText: PREVIOUS_PAGE_LABEL }).first();
    await expect(goBack, 'Navigate to Page should expose the localized Go back target').toBeVisible({ timeout: 15_000 });
    await expect(previous, 'Navigate to Page should retain a distinct Previous page target').toBeVisible({ timeout: 15_000 });

    const targetButton = options.filter({ hasText: target }).first();
    await expect(targetButton, `Navigate to Page target ${String(target)} should be available`).toBeVisible({ timeout: 15_000 });
    await targetButton.click({ timeout: 10_000 }).catch(async () => targetButton.dispatchEvent('click'));
    await expect(targetButton, `Navigate to Page target ${String(target)} should be selected`).toHaveClass(/c8o-btn-selected/, {
      timeout: 15_000,
    });
    if (target instanceof RegExp) {
      await expect(previous, 'Go back must remain distinct from Previous page').not.toHaveClass(/c8o-btn-selected/);
    }
    await closeComponentConfig(page);
  });
}

async function visibleButtonWorkflowNames(page: Page): Promise<string[]> {
  await ensureWorkflowsPanelOpen(page);
  return page.locator(`${SEL.buttonWorkflowEntry}:visible`).evaluateAll((entries) => {
    const names = entries
      .map((entry) => ((entry as HTMLElement).innerText || entry.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return [...new Set(names)];
  });
}

async function openComponentsPaletteForWorkflowFixture(page: Page): Promise<void> {
  if (!(await page.locator(SEL.pageButtonsBlock).first().isVisible({ timeout: 1_000 }).catch(() => false))) {
    await expectPagesPanelDefaultAfterWorkflowNavigation(page);
  }
  await openComponentsPalette(page, PALETTE_ICON.button);
}

async function addDescriptionMarkerThroughUi(page: Page, technicalId: string, text: string): Promise<void> {
  const before = await page.locator(SEL.descriptionComponent).count();
  await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
  await expect
    .poll(() => page.locator(SEL.descriptionComponent).count(), {
      message: `Description marker ${technicalId} should be added`,
      timeout: 30_000,
    })
    .toBeGreaterThan(before);
  await openComponentConfigAt(page, SEL.descriptionComponent, before);
  await setTechnicalId(page, technicalId);
  await setDescriptionText(page, text);
  await closeComponentConfig(page);
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

async function ensureFunctionalAddRowTable(): Promise<void> {
  await test.step('Ensure the functional Add Row Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: WORKFLOW_BASEROW_WORKSPACE,
      database: WORKFLOW_BASEROW_DATABASE,
      table: ADD_ROW_TABLE,
      primaryField: ADD_ROW_NAME_COLUMN,
      columns: [
        { name: ADD_ROW_NAME_COLUMN, type: 'text' },
        { name: ADD_ROW_NOTE_COLUMN, type: 'text' },
      ],
    });
    assertBaserowAddRowFixture(catalog);
  });
}

async function createWorkflowButton(page: Page, technicalId: string, label: string): Promise<void> {
  await test.step('Create a Button component for the workflow', async () => {
    const before = await page.locator(SEL.buttonComponent).count();
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.buttonComponent), 'a new Button component should be added').toHaveCount(before + 1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.buttonComponent, before);
    await setTechnicalId(page, technicalId);
    await setButtonLabel(page, label);
    await closeComponentConfig(page);
  });
}

async function createTextSource(
  page: Page,
  technicalId: string,
  options: { required?: boolean; defaultValue?: string } = {},
): Promise<void> {
  await test.step('Create a Text source for workflow conditions', async () => {
    const before = await page.locator(SEL.textComponent).count();
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect
      .poll(() => page.locator(SEL.textComponent).count(), {
        message: `Text source ${technicalId} should be added`,
        timeout: 30_000,
      })
      .toBeGreaterThan(before);
    await openComponentConfigAt(page, SEL.textComponent, before);
    await setTechnicalId(page, technicalId);
    if (options.required || options.defaultValue !== undefined) {
      await openConfigTabById(page, 'data_interactions');
    }
    if (options.required) {
      await setTextInputRequired(page, true);
    }
    if (options.defaultValue !== undefined) {
      await setTextDefaultValueText(page, options.defaultValue);
    }
    await closeComponentConfig(page);
  });
}

async function clickViewerButton(page: Page, technicalId: string, label: string): Promise<void> {
  const button = viewerButtonByLabel(page, label);
  if (await button.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent('click'));
    return;
  }
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Button ${technicalId} should be visible before click`).toBeVisible({ timeout: 30_000 });
  await root.click({ timeout: 10_000 }).catch(async () => root.dispatchEvent('click'));
}

function viewerButtonByLabel(page: Page, label: string) {
  return page.getByRole('button', { name: label }).first();
}

async function openButtonWorkflowByText(page: Page, text: string): Promise<void> {
  await ensureWorkflowsPanelOpen(page);
  let workflow = page.locator(SEL.workflowEntry).filter({ hasText: text }).first();
  if (!(await workflow.isVisible({ timeout: 2_000 }).catch(() => false))) {
    workflow = page.locator(SEL.workflowEntry).filter({ hasText: /Flow button/i }).first();
  }
  if (!(await workflow.isVisible({ timeout: 2_000 }).catch(() => false))) {
    workflow = page.locator(SEL.buttonWorkflowEntry).filter({ hasText: /button/i }).first();
  }
  if (!(await workflow.isVisible({ timeout: 2_000 }).catch(() => false))) {
    workflow = page.locator(SEL.buttonWorkflowEntry).first();
  }
  await expect(workflow, `Button workflow containing ${text} or the default Flow button label should be visible`).toBeVisible({
    timeout: 30_000,
  });
  await workflow.click({ timeout: 10_000 }).catch(async () => workflow.dispatchEvent('click'));
  await page.waitForTimeout(1_000);
}

async function ensureWorkflowsPanelOpen(page: Page): Promise<void> {
  await openWorkflowsPanel(page);
  if (await page.locator(SEL.workflowEntry).first().isVisible({ timeout: 2_000 }).catch(() => false)) {
    return;
  }

  const workflowsButton = await firstVisibleLocator(page, SEL.workflowsPanelButton, 'Workflows sidebar button', 15_000);
  await workflowsButton.click({ timeout: 10_000 }).catch(async () => workflowsButton.dispatchEvent('click'));
  await expect(page.locator(SEL.workflowEntry).first(), 'Workflows panel should expose workflow entries').toBeVisible({
    timeout: 30_000,
  });
}

async function reselectMailActionAndCancelOverwriteWarning(page: Page): Promise<void> {
  await openConfigTabById(page, 'tab_selector_choice_action');
  const selectButton = await firstVisibleLocator(page, SEL.dataSourceSelectButton, 'Mail action select button', 15_000);
  await selectButton.click({ timeout: 10_000 }).catch(async () => selectButton.dispatchEvent('click'));

  const actionPicker = page.locator('ion-modal:visible').last();
  await expect(actionPicker, 'Mail action picker should be visible').toBeVisible({ timeout: 15_000 });
  const mailAction = actionPicker.locator(MAIL_ACTION_PICKER_BUTTON).first();
  await expect(mailAction, 'Mail action should be available in the action picker').toBeVisible({ timeout: 30_000 });
  await mailAction.click({ timeout: 10_000 }).catch(async () => mailAction.dispatchEvent('click'));

  await actionPicker.locator('ion-footer ion-button').last().click({ timeout: 10_000 });

  const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
  await expect(alert, 'replacing an already configured action should open a warning').toBeVisible({ timeout: 10_000 });
  const cancel = alert.locator('button.btn--info, button.alert-button-role-cancel, button.alert-button').first();
  await expect(cancel, 'replacement warning should expose a cancel action').toBeVisible({ timeout: 5_000 });
  await cancel.click({ timeout: 5_000 }).catch(async () => cancel.dispatchEvent('click'));
  await expect(alert, 'replacement warning should close after cancel').toBeHidden({ timeout: 10_000 });

  if (await actionPicker.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const pickerCancel = actionPicker.locator('ion-footer ion-button').first();
    await pickerCancel.click({ timeout: 5_000, force: true }).catch(async () => pickerCancel.dispatchEvent('click'));
    await expect(actionPicker, 'Mail action picker should close after cancelling replacement').toBeHidden({ timeout: 15_000 });
  }

  await openConfigTabById(page, 'tab_selector_conf_action');
}

async function setTextInputRequired(page: Page, required: boolean): Promise<void> {
  const toggle = page.locator(TEXT_INPUT_WORKFLOW_SEL.requiredToggle).first();
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

async function fillVisibleActionTextEditor(page: Page, value: string): Promise<void> {
  const frame = page.locator('iframe.tox-edit-area__iframe:visible').last();
  if (await frame.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const body = frame.contentFrame().locator('body');
    await expect(body, 'Generic Task text editor body should be visible').toBeVisible({ timeout: 15_000 });
    await body.fill(value);
    await body.press('Tab').catch(() => undefined);
    return;
  }
  const body = page.locator('[contenteditable="true"].mce-content-body:visible').last();
  await expect(body, 'Generic Task inline text editor should be visible').toBeVisible({ timeout: 15_000 });
  await body.fill(value);
  await body.press('Tab').catch(() => undefined);
}

async function waitForStoredResponseEntries(
  page: Page,
  formId: string,
  targetName: string,
  targetValue: string,
  witnessName: string,
  witnessValue: string,
): Promise<Map<string, string[]>> {
  let entries = new Map<string, string[]>();
  await expect
    .poll(
      async () => {
        const response = await c8oCall(page, 'APIV2_getResponses', {
          formId: formId.startsWith('published_') ? formId : `published_${formId}`,
          summary: 'false',
          csv: 'false',
          meta: JSON.stringify({ limit: 10 }),
        });
        entries = namedResponseValues(response);
        return (entries.get(targetName)?.includes(targetValue) ?? false) &&
          (entries.get(witnessName)?.includes(witnessValue) ?? false);
      },
      {
        message: 'stored response should expose the changed target and untouched witness values',
        timeout: 60_000,
      },
    )
    .toBe(true);
  return entries;
}

function namedResponseValues(root: unknown): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const response = (root as { res?: { response?: { value?: unknown; nestedResponses?: unknown } } })?.res?.response;
  if (Array.isArray(response?.value) && Array.isArray(response?.nestedResponses)) {
    for (const row of response.nestedResponses) {
      if (!Array.isArray(row)) continue;
      response.value.forEach((column, index) => {
        const name = column && typeof column === 'object'
          ? (column as { name?: string; id?: string }).name ?? (column as { id?: string }).id
          : undefined;
        const cell = row[index] as { value?: unknown } | undefined;
        if (!name || !cell || !Object.prototype.hasOwnProperty.call(cell, 'value')) return;
        const values = Array.isArray(cell.value) ? cell.value : [cell.value];
        result.set(name, values.filter((value) => ['string', 'number', 'boolean'].includes(typeof value)).map(String));
      });
    }
    return result;
  }
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name : typeof record.id === 'string' ? record.id : '';
    if (name && Object.prototype.hasOwnProperty.call(record, 'value')) {
      const values = Array.isArray(record.value) ? record.value : [record.value];
      const strings = values.flatMap((entry) =>
        typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' ? [String(entry)] : [],
      );
      if (strings.length > 0) result.set(name, strings);
    }
    Object.values(record).forEach(visit);
  };
  visit(root);
  return result;
}

function viewerTextInput(page: Page, technicalId: string): Locator {
  return page.locator(`ion-input#${technicalId} input, input#${technicalId}, [id="${technicalId}"] input`).first();
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
      const candidate = elements.nth(i);
      if (await candidate.isVisible({ timeout: 250 }).catch(() => false)) {
        return candidate;
      }
    }
    if (timeout <= 0) {
      return null;
    }
    await page.waitForTimeout(100);
  } while (Date.now() - startedAt < timeout);

  const count = await elements.count();
  for (let i = 0; i < count; i++) {
    const candidate = elements.nth(i);
    if (await candidate.isVisible({ timeout: 250 }).catch(() => false)) {
      return candidate;
    }
  }
  return null;
}

async function clickViewerSubmitWithoutCompletionWait(page: Page): Promise<void> {
  const submit = await firstVisibleLocator(page, SEL.viewerSubmitButton, 'viewer submit button', 30_000);
  await submit.scrollIntoViewIfNeeded().catch(() => undefined);
  await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
}

function assertBaserowAddRowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === ADD_ROW_TABLE);
  expect(table, `Baserow table ${ADD_ROW_TABLE} should exist after schema read-back`).toBeTruthy();
  const columns = (table.columns ?? []) as Record<string, unknown>[];
  for (const columnName of [ADD_ROW_NAME_COLUMN, ADD_ROW_NOTE_COLUMN]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be text`).toBe('text');
  }
}

async function rowFromActionResponse(page: Page, response: Response): Promise<Record<string, unknown> | undefined> {
  expect(response.ok(), `Baserow Add Row action should answer 2xx, got HTTP ${response.status()}`).toBeTruthy();
  try {
    const json = (await response.json()) as Record<string, unknown>;
    return sequenceResult(json);
  } catch (error) {
    if (isFirefoxResponseBodyReadError(error)) {
      return sequenceResult(await capturedExecuteSequencesResponse(page));
    }
    throw error;
  }
}

async function installExecuteSequencesResponseCapture(page: Page): Promise<void> {
  await page.evaluate(() => {
    type CapturedResponse = { json?: Record<string, unknown>; text?: string; error?: string };
    type CaptureWindow = Window & {
      __functionalWorkflowExecuteSequences?: CapturedResponse[];
      __functionalWorkflowCaptureInstalled?: boolean;
    };
    type CapturedXhr = XMLHttpRequest & { __functionalWorkflowUrl?: string };

    const captureWindow = window as CaptureWindow;
    captureWindow.__functionalWorkflowExecuteSequences = [];
    if (captureWindow.__functionalWorkflowCaptureInstalled) return;
    captureWindow.__functionalWorkflowCaptureInstalled = true;

    const recordText = (text: string) => {
      const captured: CapturedResponse = { text };
      try {
        captured.json = text ? JSON.parse(text) : {};
      } catch (error) {
        captured.error = String((error as Error | undefined)?.message ?? error);
      }
      captureWindow.__functionalWorkflowExecuteSequences?.push(captured);
    };

    const recordError = (error: unknown) => {
      captureWindow.__functionalWorkflowExecuteSequences?.push({
        error: String((error as Error | undefined)?.message ?? error),
      });
    };

    const bodyTargetsExecuteSequences = (body: unknown): boolean => {
      if (body instanceof FormData) {
        for (const [key, value] of body.entries()) {
          if (key === '__sequence' && String(value) === 'APIV2_Execute_Sequences') return true;
          if (String(value).includes('APIV2_Execute_Sequences')) return true;
        }
        return false;
      }
      if (body instanceof URLSearchParams) {
        return body.get('__sequence') === 'APIV2_Execute_Sequences' || body.toString().includes('APIV2_Execute_Sequences');
      }
      return String(body ?? '').includes('APIV2_Execute_Sequences');
    };

    const urlTargetsC8oForms = (url: unknown): boolean => String(url ?? '').includes('/projects/C8Oforms/.json');

    const originalFetch = captureWindow.fetch.bind(captureWindow);
    captureWindow.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      const url = input instanceof Request ? input.url : String(input);
      if (urlTargetsC8oForms(url) && bodyTargetsExecuteSequences(init?.body)) {
        response.clone().text().then(recordText).catch(recordError);
      }
      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function open(method: string, url: string | URL) {
      (this as CapturedXhr).__functionalWorkflowUrl = String(url);
      return (originalOpen as (...args: unknown[]) => void).apply(this, Array.from(arguments));
    } as typeof XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.send = function send(body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this as CapturedXhr;
      if (urlTargetsC8oForms(xhr.__functionalWorkflowUrl) && bodyTargetsExecuteSequences(body)) {
        xhr.addEventListener('load', () => recordText(xhr.responseText));
        xhr.addEventListener('error', () => recordError('XMLHttpRequest error while reading APIV2_Execute_Sequences'));
      }
      return (originalSend as (...args: unknown[]) => void).apply(this, Array.from(arguments));
    } as typeof XMLHttpRequest.prototype.send;
  });
}

async function capturedExecuteSequencesResponse(page: Page): Promise<Record<string, unknown>> {
  await page.waitForFunction(
    () => ((window as Window & { __functionalWorkflowExecuteSequences?: unknown[] }).__functionalWorkflowExecuteSequences ?? []).length > 0,
    undefined,
    { timeout: 10_000 },
  );
  const captured = await page.evaluate(() => {
    const responses = (window as Window & {
      __functionalWorkflowExecuteSequences?: Array<{ json?: Record<string, unknown>; text?: string; error?: string }>;
    }).__functionalWorkflowExecuteSequences ?? [];
    return responses.at(-1);
  });

  if (captured?.json) {
    return captured.json;
  }
  throw new Error(`Unable to read captured APIV2_Execute_Sequences response: ${captured?.error ?? captured?.text ?? 'empty capture'}`);
}

function isFirefoxResponseBodyReadError(error: unknown): boolean {
  return /Network\.getResponseBody|NS_ERROR_INVALID_CONTENT_ENCODING/i.test(String((error as Error | undefined)?.message ?? error));
}

function sequenceResult(json: Record<string, unknown>): Record<string, unknown> | undefined {
  const document = json.document as Record<string, unknown> | undefined;
  return (
    (document?.result as Record<string, unknown> | undefined) ??
    (json.result as Record<string, unknown> | undefined) ??
    (json.response as Record<string, unknown> | undefined) ??
    document
  );
}
