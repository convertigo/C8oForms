import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectLoopActionPaletteButtonFullyVisible,
  login,
  openButtonFlowLoopActionConfig,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1425
 *
 * Found in 2.2.0-beta237. Fixed by 87c2a01a, first released in
 * 2.2.0-beta239.
 *
 * Root cause: the Loop action editor and the embedded
 * DefaultValueEditorWithPalette were clipping their contents with
 * overflow:hidden / overflow-x:hidden. The Source Palette rail button is
 * positioned outside the picker panel, so only a small part of the button
 * remained visible. The fix makes the Loop editor wrappers overflow-visible.
 *
 * The form fixture is built entirely through Studio UI: create a blank form,
 * add a Button, open its workflow, add a Loop action from the action palette,
 * then inspect the Palette button in the Loop action configuration.
 */

const BUTTON_ID = 'button_1425';

test.setTimeout(180_000);

test('#1425 - Loop action Palette button is fully visible in action configuration', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form', async () => {
    await createBlankForm(page, `Issue 1425 loop palette ${Date.now()}`);
  });

  await test.step('Add the workflow Button', async () => {
    await addComponent(page, PALETTE_ICON.button);
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_ID);
    await closeComponentConfig(page);
  });

  await test.step('Open a Loop action editor', async () => {
    await openButtonFlowLoopActionConfig(page);
  });

  await expectLoopActionPaletteButtonFullyVisible(page);
});
