import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectConditionActionModesSwitchable,
  expectFlowConditionOperatorSelectForField,
  login,
  openButtonFlowConditionActionConfig,
  openComponentConfig,
  selectFlowConditionField,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1334
 *
 * Found in 2.2.0-beta135. Fixed by 95424cfc, first released in
 * 2.2.0-beta137 and validated OK in 2.2.0-beta144.
 *
 * Root cause: conditionVisibleIf.getType() returned an empty string for field
 * references whose type was not explicitly listed as simple/multiple/file, such
 * as workflow action ids (`if_else`). No operator select matched that empty
 * type, so the If action showed an empty operator slot after selecting a flow
 * action. The fix treats unknown types as simple fields.
 *
 * The form fixture is built entirely through Studio UI: create a blank form,
 * add a Button, open its workflow, add a Condition action, select the generated
 * Condition action id from the If field picker, assert that the If editor can
 * switch between Fields/Aa/JS modes, then assert that an operator select is
 * visible for that workflow field.
 */

const BUTTON_ID = 'button_1334';
const CONDITION_ACTION_ID = 'if_else1';

test.setTimeout(180_000);

test('#1334 - If condition workflow fields expose Fields/Aa/JS modes and an operator selector', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1334 condition operators ${Date.now()}`);
  });

  await test.step('Add the workflow Button', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_ID);
    await closeComponentConfig(page);
  });

  await test.step('Open a Condition action editor', async () => {
    await openButtonFlowConditionActionConfig(page);
  });

  await test.step('Assert Condition editor modes', async () => {
    await selectFlowConditionField(page, CONDITION_ACTION_ID);
    await expectConditionActionModesSwitchable(page, CONDITION_ACTION_ID);
    await expectFlowConditionOperatorSelectForField(page, CONDITION_ACTION_ID);
  });
});
