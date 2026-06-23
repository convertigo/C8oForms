import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectDefaultValueJavaScriptEditorKeeps,
  expectViewerTextInputValue,
  login,
  openComponentConfigAt,
  openPreview,
  setTextDefaultValueText,
  setTechnicalId,
  setTextDefaultValueJavascriptCode,
} from './helpers/studio';

const SOURCE_TECHNICAL_ID = 'select1';
const SOURCE_VALUE = 'Alpha';
const DYNAMIC_LOOKUP = 'fields[id]';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1395
 *
 * Found in 2.2.0-beta184. Dynamic field lookups such as fields[id] were first
 * preserved in Monaco, then fixed at runtime so they resolve to the field value
 * like fields["select1"]. Fix 3767dcf7 first shipped in 2.2.0-beta204, where
 * the ticket was validated OK.
 *
 * The C8oForms form is built only through Studio UI.
 */

test.setTimeout(150_000);

test('#1395 - dynamic fields[id] default value resolves to the target field value', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1395 dynamic fields ${Date.now()}`);
  });

  await test.step('Add the source Text field', async () => {
    await addComponent(page, PALETTE_ICON.textInput);
    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, SOURCE_TECHNICAL_ID);
    await setTextDefaultValueText(page, SOURCE_VALUE);
    await closeComponentConfig(page);
  });

  await test.step('Configure another Text field with a dynamic field lookup', async () => {
    await addComponent(page, PALETTE_ICON.textInput);
    await openComponentConfigAt(page, SEL.textComponent, 1);
    await setTechnicalId(page, 'dynamic_default_1395');
    await setTextDefaultValueJavascriptCode(page, `const id = "${SOURCE_TECHNICAL_ID}";\n\treturn ${DYNAMIC_LOOKUP};`);
    await expectDefaultValueJavaScriptEditorKeeps(page, DYNAMIC_LOOKUP);
    await closeComponentConfig(page);
  });

  await test.step('Open the preview', async () => {
    await openPreview(page, SEL.textComponent);
  });

  await test.step('Assert the dynamic lookup resolves to the field value', async () => {
    await expectViewerTextInputValue(page, 0, SOURCE_VALUE);
    await expectViewerTextInputValue(page, 1, SOURCE_VALUE);
  });
});
