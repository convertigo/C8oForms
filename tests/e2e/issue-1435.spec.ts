import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addButtonStateCondition,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectRenderedButtonEnabled,
  login,
  openButtonStateConfigBySelector,
  openComponentConfig,
  openPreview,
  setTechnicalId,
  viewerTextInput,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1435
 * "Button component should support conditional enabled and disabled states".
 *
 * Requested version: 2.2.0-beta247. The implementation started in 9155fe88
 * (first tagged in 2.2.0-beta248), then the context switch between Visibility
 * and Button State conditions was fixed by ebfe82da (first tagged in
 * 2.2.0-beta250). The ticket was validated OK in 2.2.0-beta253.
 *
 * Root cause: before the fix series, Button components used the generic simple
 * configuration tabs and the viewer did not evaluate a buttonStateIf condition
 * to disable a visible Button. The fixed UI exposes a dedicated State tab and
 * the viewer keeps the Button visible while toggling its disabled state from
 * the authored condition.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Text input source, add a Button target, configure the Button State condition,
 * and open Preview. No form document writes or fixture shortcuts are used.
 */

test.setTimeout(180_000);

test('#1435 - Button state condition enables a visible Button from a Text input value', async ({ page }) => {
  const textId = 'state_input_1435';
  const buttonId = 'conditional_button_1435';
  const triggerValue = 'enable-1435';

  await test.step('Create a form with a Text input source and a Button target', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1435 button state ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await page.locator(SEL.textComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, textId);
    await closeComponentConfig(page);

    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await page.locator(SEL.buttonComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, buttonId);
    await closeComponentConfig(page);
  });

  await test.step('Configure the Button to be enabled when the Text input matches', async () => {
    await openButtonStateConfigBySelector(page);
    await addButtonStateCondition(page, {
      mode: 'enabled_when_condition',
      field: textId,
      operator: 'equals',
      value: triggerValue,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and assert the Button state follows the Text input', async () => {
    await openPreview(page, SEL.textComponent);
    await expectRenderedButtonEnabled(page, false, 'viewer');

    await viewerTextInput(page, textId).fill(triggerValue);
    await page.keyboard.press('Tab');

    await expectRenderedButtonEnabled(page, true, 'viewer');
  });
});
