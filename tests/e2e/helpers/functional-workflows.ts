import { expect, test, type Locator, type Page, type Response } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addBaserowAddRowColumnMapping,
  closeComponentConfig,
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
  expectMailActionTextVariableContains,
  fillViewerTextInput,
  fillToastMessageText,
  openButtonFlowConditionActionConfig,
  openButtonFlowBaserowAddRowConfiguration,
  openButtonFlowLoopActionConfig,
  openButtonFlowMailActionConfig,
  openButtonFlowToastActionConfig,
  openComponentConfig,
  openComponentConfigAt,
  openConfigTabById,
  openPreview,
  openToastActionMessageEditor,
  openWorkflowsPanel,
  recordedToasts,
  recordToasts,
  reselectMailActionFromActionSelection,
  selectFlowConditionField,
  setButtonLabel,
  setMailActionBodyTextWithUserName,
  setMailActionSubjectJavaScriptReturn,
  setMailActionTextVariable,
  setTechnicalId,
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
    await expectFlowConditionOperatorSelectForField(page, sourceTechnicalId);
    await expectConditionActionConfigurationTabsOnlyIf(page);
  });
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

  await test.step('Open the Button workflow and configure a Send mail action', async () => {
    await openButtonFlowMailActionConfig(page);
    await setMailActionTextVariable(page, 'to', to);
    await setMailActionSubjectJavaScriptReturn(page, subjectExpression);
    await setMailActionBodyTextWithUserName(page, bodyText);
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
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.buttonComponent}:visible`).first(), 'Button component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, technicalId);
    await setButtonLabel(page, label);
    await closeComponentConfig(page);
  });
}

async function createTextSource(page: Page, technicalId: string, options: { required?: boolean } = {}): Promise<void> {
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
    if (options.required) {
      await openConfigTabById(page, 'data_interactions');
      await setTextInputRequired(page, true);
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
  if (!table) {
    console.warn(`Baserow catalog read-back did not include ${ADD_ROW_TABLE}; continuing after ensure-created returned successfully.`);
    return;
  }
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
