import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectConditionActionModesSwitchable,
  login,
  openButtonFlowConditionActionConfig,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1327
 *
 * Found in 2.2.0-beta127. In the Condition (if) flow action, the Aa and JS mode
 * buttons were clickable but did not switch the condition editor mode, making
 * the condition hard to configure. The ticket was validated OK in
 * 2.2.0-beta154.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button, open its default workflow, add the Condition action from the action
 * palette, then switch the If condition editor between Aa and JavaScript modes.
 */

const BUTTON_TECHNICAL_ID = 'condition_button_1327';

test.setTimeout(180_000);

test('#1327 - Condition action switches between Aa and JavaScript modes', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1327 condition action ${Date.now()}`);
  });

  await test.step('Add the workflow Button', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_TECHNICAL_ID);
    await closeComponentConfig(page);
  });

  await test.step('Configure the Condition action', async () => {
    await openButtonFlowConditionActionConfig(page);
  });

  await test.step('Assert Condition editor modes', async () => {
    await expectConditionActionModesSwitchable(page);
  });
});
