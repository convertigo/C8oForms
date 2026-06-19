import { test, expect } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  dragSourcePaletteEntryToTinyMceStrict,
  fillToastMessageText,
  login,
  openButtonFlowToastActionConfig,
  openComponentConfig,
  openToastActionMessageEditor,
  setTechnicalId,
  sourcePaletteEntryDragPayload,
  tinyMceEditorContent,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1370
 *
 * Found in 2.2.0-beta158. Fixed by c9ae8c51, first released in
 * 2.2.0-beta161 and validated OK in 2.2.0-beta163.
 *
 * Root cause: dragging a Source Palette Text entry exposed the HTML5 drag type
 * "text" with the value "true". Browsers normalize that to text/plain, so a
 * TinyMCE text-mode Toast message could consume "true" instead of the component
 * badge when normal text was already present. The fix clears stale drag data and
 * stores Text drag markers under c8oforms-type-text instead.
 *
 * The form fixture is built entirely through Studio UI: create a blank form,
 * add a Text input and Button, open the Button workflow, add a Toast action,
 * type a normal message prefix, then drag the Text input from the Source Palette
 * into the Toast message editor.
 */

const TEXT_ID = 'input_text_1370';
const BUTTON_ID = 'button_1370';
const MESSAGE_PREFIX = 'Hello';

test.setTimeout(180_000);

test('#1370 - Toast message text drops insert a field chip instead of true', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1370 toast message ${Date.now()}`);
  });

  await test.step('Add the Text input source field', async () => {
    await addComponent(page, PALETTE_ICON.textInput);
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, TEXT_ID);
    await closeComponentConfig(page);
  });

  await test.step('Add the workflow Button', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_ID);
    await closeComponentConfig(page);
  });

  await test.step('Open a Toast action message editor', async () => {
    await openButtonFlowToastActionConfig(page);
    await openToastActionMessageEditor(page);
  });

  await test.step('Type a normal Toast message prefix', async () => {
    await fillToastMessageText(page, MESSAGE_PREFIX);
    const before = await tinyMceEditorContent(page);
    expect(before.text, 'Toast message editor should contain the typed prefix before the drag').toContain(MESSAGE_PREFIX);
  });

  await test.step('Assert the Text field drag payload is not the broken true payload', async () => {
    const payload = await sourcePaletteEntryDragPayload(page, 'form', TEXT_ID);
    const types = payload.types.map((type) => type.toLowerCase());

    expect(payload.typeData, 'the dragged Source Palette entry should still identify a Text field').toBe('text');
    expect(payload.htmlData, 'the drag payload should carry the field badge HTML').toContain(TEXT_ID);
    expect(
      payload.plainData,
      'Text Source Palette drags must not expose "true" as text/plain; TinyMCE can insert that literal instead of the badge',
    ).not.toBe('true');
    expect(types, 'Text Source Palette drags should use the collision-safe drag marker').toContain('c8oforms-type-text');
  });

  await test.step('Drag the Text field into the Toast message', async () => {
    await dragSourcePaletteEntryToTinyMceStrict(page, 'form', TEXT_ID);
    const after = await tinyMceEditorContent(page);
    expect(after.text, 'Toast message should keep the typed prefix').toContain(MESSAGE_PREFIX);
    expect(after.text, 'Toast message should contain the dragged field token').toContain(TEXT_ID);
    expect(after.text, 'Toast message should not contain the broken literal true token').not.toMatch(/\btrue\b/i);
  });
});
