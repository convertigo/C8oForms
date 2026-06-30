import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addBaserowAddRowColumnMapping,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectBaserowAddRowColumnMappingJavaScriptContains,
  expectBaserowAddRowColumnMappingJavaScriptNotContains,
  login,
  openButtonFlowBaserowAddRowActionConfiguration,
  openComponentConfig,
  setBaserowAddRowColumnMappingJavaScriptReturn,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1331
 *
 * Found in 2.2.0-beta127. Fixed by d9c42405, first released in
 * 2.2.0-beta135 and validated OK in 2.2.0-beta146.
 *
 * Root cause / observed mechanism: Add/update row actions use the shared
 * forms_freeVars editor for free column mappings. Before the fix, switching
 * between two free-variable rows did not refresh the Monaco editor with the
 * newly selected row's code, so a JavaScript value configured for one column
 * appeared on another column and could be saved there. The fix updates the
 * Monaco component when its code input changes.
 *
 * The C8oForms form is built only through Studio UI: blank form, Button
 * component, workflow Add Row action, two free column mappings, then JavaScript
 * configuration through the action editor UI. No form document or action JSON
 * is created through an API shortcut.
 */

const BUTTON_TECHNICAL_ID = 'submit_1331';
const DATE_COLUMN = 'Date';
const TEMPERATURE_COLUMN = 'Temperature';
const DATE_RETURN_EXPRESSION = '"date_1331"';
const TEMPERATURE_RETURN_EXPRESSION = '"temperature_1331"';
const DATE_SENTINEL = 'date_1331';
const TEMPERATURE_SENTINEL = 'temperature_1331';

// Baserow action editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.setTimeout(240_000);

test('#1331 - Add Row column mappings keep independent JavaScript configuration', async ({ page }) => {
  await test.step('Create a blank form with a Button component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1331 free vars ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.button);
    await expect(page.locator(SEL.buttonComponent), 'the Button component should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, BUTTON_TECHNICAL_ID);
    await closeComponentConfig(page);
  });

  await openButtonFlowBaserowAddRowActionConfiguration(page, /Flow button/i);
  await addBaserowAddRowColumnMapping(page, DATE_COLUMN);
  await addBaserowAddRowColumnMapping(page, TEMPERATURE_COLUMN);

  await setBaserowAddRowColumnMappingJavaScriptReturn(page, DATE_COLUMN, DATE_RETURN_EXPRESSION);
  await expectBaserowAddRowColumnMappingJavaScriptContains(page, DATE_COLUMN, DATE_SENTINEL);

  await setBaserowAddRowColumnMappingJavaScriptReturn(page, TEMPERATURE_COLUMN, TEMPERATURE_RETURN_EXPRESSION);
  await expectBaserowAddRowColumnMappingJavaScriptContains(page, TEMPERATURE_COLUMN, TEMPERATURE_SENTINEL);

  await expectBaserowAddRowColumnMappingJavaScriptContains(page, DATE_COLUMN, DATE_SENTINEL);
  await expectBaserowAddRowColumnMappingJavaScriptNotContains(page, DATE_COLUMN, TEMPERATURE_SENTINEL);
});
