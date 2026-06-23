import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectLoopActionIteratorModesConfigurable,
  login,
  openButtonFlowLoopActionConfig,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1329
 *
 * Found in 2.2.0-beta127. The Loop flow action rendered its configuration
 * shell, but the "Loop" iterator row was empty and the old "Actions" tab did
 * not expose a usable action configuration either. The current UI exposes a
 * single Loop section whose iterator can be configured in Aa or JavaScript
 * mode.
 *
 * The C8oForms form is built only through Studio UI: create a blank form, add a
 * Button, open its default workflow, add the Loop action from the action
 * palette, then configure the Loop iterator.
 */

const BUTTON_TECHNICAL_ID = 'loop_button_1329';

test.setTimeout(180_000);

test('#1329 - Loop action exposes Aa and JavaScript iterator configuration', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1329 loop action ${Date.now()}`);
  });

  await test.step('Add the workflow Button', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_TECHNICAL_ID);
    await closeComponentConfig(page);
  });

  await test.step('Configure the Loop action', async () => {
    await openButtonFlowLoopActionConfig(page);
  });

  await test.step('Assert Loop iterator modes', async () => {
    await expectLoopActionIteratorModesConfigurable(page, '[1, 2, 3]');
  });
});
