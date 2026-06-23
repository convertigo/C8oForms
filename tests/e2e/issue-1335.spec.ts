import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectConditionActionConfigurationTabsOnlyIf,
  login,
  openButtonFlowConditionActionConfig,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1335
 *
 * Found in 2.2.0-beta135. Fixed by 706855ff, first released in
 * 2.2.0-beta136 and validated OK in 2.2.0-beta143.
 *
 * Root cause: the Condition flow action configuration advertised three config
 * tabs (`If`, `Then`, `Else`). The Then/Else tabs were empty in that side panel
 * and could not accept actions there; branch actions are configured from the
 * workflow canvas instead. The fix removes Then/Else from
 * flowConditionMainEditorConfigurationTabs, leaving only the If tab.
 *
 * The form fixture is built entirely through Studio UI: create a blank form,
 * add a Button, open its workflow, add a Condition action, then inspect the
 * Condition action configuration tabs.
 */

const BUTTON_ID = 'button_1335';

test.setTimeout(180_000);

test('#1335 - Condition action configuration does not expose empty Then/Else tabs', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1335 condition tabs ${Date.now()}`);
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

  await expectConditionActionConfigurationTabsOnlyIf(page);
});
