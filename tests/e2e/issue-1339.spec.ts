import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addVisibilityCondition,
  cancelVisibilityModeSwitch,
  closeComponentConfig,
  createBlankForm,
  expectVisibilityConditionConfigured,
  expectVisibilityModeSelected,
  login,
  openComponentConfig,
  openComponentVisibilityConfigBySelector,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1339
 * "Visibility tab: condition is deleted when switching options or cancelling dialog".
 *
 * Reproduced on 2.2.0-beta138, fixed by eecf47e7 (first released in
 * 2.2.0-beta145 and validated OK in 2.2.0-beta147). Root cause: the Visibility
 * ToggleSwitch did not restore its model when the user clicked the current
 * condition mode or cancelled the confirmation shown while leaving condition
 * mode. The UI could therefore leave conditional visibility, hiding or losing
 * the authored condition despite the cancellation.
 *
 * The form is built entirely through Studio UI: create a blank form, add a Text
 * input source and a Description target, then configure the target Visibility
 * condition from the component configuration panel.
 */
test('#1339 - cancelling a Visibility mode switch keeps the conditional rule', async ({ page }) => {
  test.setTimeout(120_000);

  const textId = 'input_1339';
  const descriptionId = 'desc_1339';
  const value = 'Alpha 1339';

  await test.step('Create a form with a Text input source and a Description target', async () => {
    await login(page);
    await createBlankForm(page, `Repro 1339 ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.textInput);
    await expect(page.locator(SEL.textComponent), 'the Text input component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, textId);
    await closeComponentConfig(page);

    await addComponent(page, PALETTE_ICON.description);
    await expect(page.locator(SEL.descriptionComponent), 'the Description component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.descriptionComponent);
    await setTechnicalId(page, descriptionId);
    await closeComponentConfig(page);
  });

  await test.step('Configure a conditional Visibility rule on the Description', async () => {
    await openComponentVisibilityConfigBySelector(page, SEL.descriptionComponent);
    await addVisibilityCondition(page, {
      field: textId,
      operator: 'equals',
      value,
    });

    await expectVisibilityModeSelected(page, 'condition');
    await expectVisibilityConditionConfigured(page, textId, 'equals', value);
  });

  await test.step('Cancel the switch from condition mode to authentication-required mode', async () => {
    await cancelVisibilityModeSwitch(page, 'auth_required');

    await expectVisibilityModeSelected(page, 'condition');
    await expectVisibilityConditionConfigured(page, textId, 'equals', value);
  });
});
