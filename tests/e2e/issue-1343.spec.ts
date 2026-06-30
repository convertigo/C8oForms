import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addBaserowAddRowColumnMapping,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectBaserowAddRowColumnMappingDeletable,
  login,
  openButtonFlowBaserowAddRowActionConfiguration,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1343
 *
 * Found in 2.2.0-beta138. Fixed by 54721022, first released and validated OK
 * in 2.2.0-beta141.
 *
 * Root cause: Add Row free-variable mappings were rendered with the shared
 * button_variable component, but that shared button exposed only a row click
 * event. The old in-row trash icon path was disabled, so newly added mappings
 * had no delete affordance. The fix added an actionIcon/actionClicked slot to
 * button_variable and wires the datasource Add Row variable row to splice the
 * selected mapping after confirmation.
 *
 * The C8oForms form is built only through Studio UI: blank form, Button
 * component, workflow Add Row action, mapping addition and mapping deletion.
 */

const NAME_COLUMN = 'Name';
const BUTTON_TECHNICAL_ID = 'submit_1343';

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.setTimeout(240_000);

test('#1343 - Baserow Add Row column mappings can be deleted', async ({ page }) => {
  await test.step('Create a blank form with a Button component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1343 add row delete ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.button);
    await expect(page.locator(SEL.buttonComponent), 'the Button component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_TECHNICAL_ID);
    await closeComponentConfig(page);
  });

  await openButtonFlowBaserowAddRowActionConfiguration(page, /Flow button/i);
  await addBaserowAddRowColumnMapping(page, NAME_COLUMN);
  await expectBaserowAddRowColumnMappingDeletable(page, NAME_COLUMN);
});
