import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  fillViewerTextInput,
  login,
  openButtonFlowResetFieldsActionConfig,
  openComponentConfigAt,
  openPreview,
  selectResetFieldsScope,
  setTechnicalId,
  setTextDefaultValueText,
  viewerTextInput,
} from './helpers/studio';

/**
 * Latest-only coverage for https://github.com/convertigo/C8oForms/issues/1378
 * Feature dbd10db8b first shipped in 2.2.0-beta185; QA historically validated
 * it in 2.2.0-beta309. Reset fields resolves application, page or component
 * targets and rebuilds configured default values before refreshing dependents.
 * This latest-only test currently exposes a failure on test-nocode running
 * 2.2.0-beta371: the targeted Text input is cleared instead of restored to
 * its configured default. No deployment or historical red phase was used.
 * All C8oForms form creation and configuration uses the Studio UI exclusively.
 */
test.setTimeout(300_000);

test('#1378 - Reset fields supports scopes and restores a component default without changing another field', async ({ page }) => {
  const firstId = 'reset_default_1378';
  const secondId = 'reset_outside_1378';
  const defaultValue = 'Initial 1378';

  await test.step('Create two text fields and a Button through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1378 reset fields ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await openComponentConfigAt(page, SEL.textComponent, 0);
    await setTechnicalId(page, firstId);
    await setTextDefaultValueText(page, defaultValue);
    await closeComponentConfig(page);

    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await openComponentConfigAt(page, SEL.textComponent, 1);
    await setTechnicalId(page, secondId);
    await closeComponentConfig(page);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
  });

  await test.step('Add Reset fields and configure a component target', async () => {
    await openButtonFlowResetFieldsActionConfig(page);
    await selectResetFieldsScope(page, 'page');
    await selectResetFieldsScope(page, 'component');

    const targetTab = page.locator(`${SEL.configTabsContainer} ${SEL.configTab}:visible`).last();
    await targetTab.click({ timeout: 5_000 }).catch(async () => targetTab.dispatchEvent('click'));
    const target = page.locator(`${SEL.resetFieldsTargetSelect}:visible`).first();
    await expect(target, 'component scope should expose a target selector').toBeVisible();
    await target.click();
    const option = page.locator('ion-popover:visible ion-radio').filter({ hasText: firstId }).first();
    await expect(option, 'the first Text input should be selectable as a reset target').toBeVisible();
    await option.click();
    await expect(target).toContainText(firstId);
  });

  await test.step('Run the flow in Preview and check only the target resets', async () => {
    await openPreview(page, SEL.textComponent);
    const first = viewerTextInput(page, firstId);
    const second = viewerTextInput(page, secondId);
    await expect(first).toHaveValue(defaultValue);
    await fillViewerTextInput(page, firstId, 'Changed target 1378');
    await fillViewerTextInput(page, secondId, 'Keep outside 1378');
    await expect(first).toHaveValue('Changed target 1378');
    await expect(second).toHaveValue('Keep outside 1378');
    await page.locator(`${SEL.buttonComponent}:visible ion-button`).first().click();
    await expect(second, 'component scope must leave the other Text input untouched').toHaveValue('Keep outside 1378');
    await expect(first, 'reset should restore the configured default, not clear to empty').toHaveValue(defaultValue);
  });
});
