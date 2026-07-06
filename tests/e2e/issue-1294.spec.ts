import { expect, Page, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addVisibilityCondition,
  checkViewerCheckboxOption,
  closeComponentConfig,
  createBlankForm,
  fillViewerTextInput,
  login,
  openComponentConfigAt,
  openConfigTabById,
  openEditor,
  openViewer,
  selectViewerRadioOption,
  setCheckboxLocalOptions,
  setChoiceLocalOptions,
  setDescriptionText,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1294
 * "Visibility condition is_filled is not applied for text inputs, radio
 * buttons, or checkboxes".
 *
 * Found in 2.2.0-beta111. Fixed by 0b818d25, first released and validated OK
 * in 2.2.0-beta115.
 *
 * Root cause: viewerPage treated unary field operators such as is_filled and
 * is_empty like binary operators and required a right-hand condition value.
 * Empty val2 therefore made those Visibility conditions invalid before they
 * could be evaluated. The fix accepts unary operators without val2 and normalizes
 * filled checks for simple and multiple-choice values.
 *
 * The fixture is built entirely through Studio UI: create a blank application,
 * add Text Input, Radio and Checkbox sources from the palette, add Description
 * targets, configure each target Visibility condition with is_filled, then fill
 * or select the sources in the viewer.
 */

const TEXT_ID = 'text_source_1294';
const RADIO_ID = 'radio_source_1294';
const CHECKBOX_ID = 'checkbox_source_1294';

const RADIO_OPTION = 'Radio option 1294';
const CHECKBOX_OPTION = 'Checkbox option 1294';

const TEXT_TARGET = 'Visible when text is filled 1294';
const RADIO_TARGET = 'Visible when radio is filled 1294';
const CHECKBOX_TARGET = 'Visible when checkbox is filled 1294';

test.setTimeout(180_000);

test('#1294 - is_filled Visibility reacts to Text, Radio and Checkbox values', async ({ page }) => {
  let formId = '';

  await test.step('Create a blank form with a Text Input is_filled target', async () => {
    await login(page);
    formId = await createBlankForm(page, `Issue 1294 is filled ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.textInput);
    await expect(page.locator(SEL.textComponent), 'the Text Input source should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, TEXT_ID);
    await closeComponentConfig(page);

    await addDescriptionTarget(page, 0, TEXT_ID, TEXT_TARGET);
  });

  await test.step('Fill the Text Input and assert its is_filled target appears', async () => {
    await openViewer(page, formId);
    await expect(page.getByText(TEXT_TARGET, { exact: true }).first(), `${TEXT_TARGET} should start hidden`).toBeHidden({
      timeout: 30_000,
    });

    await fillViewerTextInput(page, TEXT_ID, 'Text value 1294');
    await expect(page.getByText(TEXT_TARGET, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  });

  await test.step('Add Radio and Checkbox is_filled targets', async () => {
    await openEditor(page, formId);
    await expect(page.locator(SEL.textComponent), 'the editor should reopen the Text Input source').toHaveCount(1, {
      timeout: 30_000,
    });

    await addComponent(page, PALETTE_ICON.radio);
    await expect(page.locator(SEL.radioComponent), 'the Radio source should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.radioComponent, 0);
    await setTechnicalId(page, RADIO_ID);
    await setChoiceLocalOptions(page, [RADIO_OPTION]);
    await closeComponentConfig(page);
    await addDescriptionTarget(page, 1, RADIO_ID, RADIO_TARGET);

    await addComponent(page, PALETTE_ICON.checkbox);
    await expect(page.locator(SEL.checkboxComponent), 'the Checkbox source should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.checkboxComponent, 0);
    await setTechnicalId(page, CHECKBOX_ID);
    await setCheckboxLocalOptions(page, [CHECKBOX_OPTION]);
    await closeComponentConfig(page);
    await addDescriptionTarget(page, 2, CHECKBOX_ID, CHECKBOX_TARGET);
  });

  await test.step('Select Radio and Checkbox values and assert their is_filled targets appear', async () => {
    await openViewer(page, formId);
    await expect(page.getByText(RADIO_TARGET, { exact: true }).first(), `${RADIO_TARGET} should start hidden`).toBeHidden({
      timeout: 30_000,
    });
    await expect(
      page.getByText(CHECKBOX_TARGET, { exact: true }).first(),
      `${CHECKBOX_TARGET} should start hidden`,
    ).toBeHidden({ timeout: 30_000 });

    await selectViewerRadioOption(page, RADIO_ID, RADIO_OPTION);
    await expect(page.getByText(RADIO_TARGET, { exact: true }).first()).toBeVisible({ timeout: 30_000 });

    await checkViewerCheckboxOption(page, CHECKBOX_ID, CHECKBOX_OPTION);
    await expect(page.getByText(CHECKBOX_TARGET, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  });
});

async function addDescriptionTarget(page: Page, index: number, source: string, label: string): Promise<void> {
  await addComponent(page, PALETTE_ICON.description);
  await expect(page.locator(SEL.descriptionComponent), `description target ${index + 1} should be added`).toHaveCount(
    index + 1,
    { timeout: 30_000 },
  );
  await openComponentConfigAt(page, SEL.descriptionComponent, index);
  await setTechnicalId(page, `desc_${index + 1}_1294`);
  await setDescriptionText(page, label);
  await openConfigTabById(page, 'visibility_tab_selector');
  await addVisibilityCondition(page, {
    field: source,
    operator: 'is_filled',
  });
  await closeComponentConfig(page);
}
