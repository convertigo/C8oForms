import { test } from './fixtures';
import {
  PALETTE_ICON,
  addComponent,
  createBlankForm,
  ensureMailActionSummaryChecked,
  expectMailActionBodyContainsUserName,
  expectMailActionSubjectJavaScriptContains,
  expectMailActionSummaryChecked,
  expectMailActionTextVariableContains,
  login,
  openButtonFlowMailActionConfig,
  reselectMailActionFromActionSelection,
  setMailActionBodyTextWithUserName,
  setMailActionSubjectJavaScriptReturn,
  setMailActionTextVariable,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1317
 *
 * Found in 2.2.0-beta120. Fixed by d0a21b5d, first released in
 * 2.2.0-beta126 and validated OK in 2.2.0-beta127.
 *
 * Root cause: background actions added from the editor palette initialized their
 * variable values as empty objects instead of the complete { str, html } shape.
 * Returning to Action selection and validating the same action could then
 * silently replace configured variables, including the Form summary checkbox.
 * The fix initializes action variables with the complete value shape and warns
 * before overwriting an already configured action.
 *
 * The fixture is built entirely through Studio UI: create a blank form, add a
 * Button, add the Send mail action, configure variables in Aa, JS and TinyMCE,
 * drag the Source Palette user/name helper into the mail body, then reopen
 * Action selection and verify the configured values are preserved.
 */

const RECIPIENT = 'qa-1317@example.test';
const SUBJECT_RETURN = "'Issue 1317 subject'";
const BODY_TEXT = 'Bonjour 1317';

test.setTimeout(180_000);

test('#1317 - Send mail action keeps configured variables after returning to Action selection', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form with a workflow button', async () => {
    await createBlankForm(page, `Issue 1317 mail action ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.button);
  });

  await test.step('Open the Send mail action configuration', async () => {
    await openButtonFlowMailActionConfig(page);
  });

  await test.step('Configure the Send mail action variables', async () => {
    await setMailActionTextVariable(page, 'to', RECIPIENT);
    await setMailActionSubjectJavaScriptReturn(page, SUBJECT_RETURN);
    await setMailActionBodyTextWithUserName(page, BODY_TEXT);
    await ensureMailActionSummaryChecked(page);
  });

  await test.step('Reopen Action selection and keep the existing configuration', async () => {
    await reselectMailActionFromActionSelection(page);
  });

  await test.step('Assert every configured variable survived the round trip', async () => {
    await expectMailActionTextVariableContains(page, 'to', RECIPIENT);
    await expectMailActionSubjectJavaScriptContains(page, SUBJECT_RETURN);
    await expectMailActionBodyContainsUserName(page, BODY_TEXT);
    await expectMailActionSummaryChecked(page);
  });
});
