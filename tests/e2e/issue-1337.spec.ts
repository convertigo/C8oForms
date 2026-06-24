import { expect, test, type Locator } from './fixtures';
import {
  SEL,
  alertValidationButtonState,
  login,
  openCreateApplicationPrompt,
  openCreateFolderPrompt,
  type AlertValidationButtonState,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1337
 * "Create Folder button still looks disabled after entering a folder name".
 *
 * The ticket was fixed in two passes: f1f01685 removed the permanent generic
 * opacity applied to alert buttons, then b444dc7e added a real input-driven
 * disabled/enabled state for Create Folder and Create Application alerts. The
 * final regression target is 2.2.0-beta154, where empty validation buttons were
 * still actionable; the fix is first released and validated OK in 2.2.0-beta156.
 *
 * The test drives only the selector UI: it opens the alerts, types/clears the
 * title field, and cancels them without creating a folder or an application.
 */

test.setTimeout(90_000);

test('#1337 - Create Folder and Create Application buttons toggle their validation state', async ({ page }) => {
  await test.step('Open the selector page', async () => {
    await login(page);
  });

  await test.step('Assert Create Folder validation state follows the folder name', async () => {
    const alert = await openCreateFolderPrompt(page);
    await expectValidationDisabled(alert, SEL.createFolderSaveButton, 'Create Folder starts disabled while the name is empty');
    await typeAlertTitle(alert, SEL.createFolderTitleInput, `folder_1337_${Date.now()}`);
    await expectValidationEnabled(alert, SEL.createFolderSaveButton, 'Create Folder becomes enabled after typing a folder name');
    await clearAlertTitle(alert, SEL.createFolderTitleInput);
    await expectValidationDisabled(alert, SEL.createFolderSaveButton, 'Create Folder becomes disabled again after clearing the name');
    await dismissAlert(alert, SEL.createFolderCancelButton);
  });

  await test.step('Assert Create Application validation state follows the application title', async () => {
    const alert = await openCreateApplicationPrompt(page);
    await expectValidationDisabled(alert, SEL.createFormSaveButton, 'Create Application starts disabled while the title is empty');
    await typeAlertTitle(alert, SEL.createFormTitleInput, `app_1337_${Date.now()}`);
    await expectValidationEnabled(alert, SEL.createFormSaveButton, 'Create Application becomes enabled after typing an application title');
    await clearAlertTitle(alert, SEL.createFormTitleInput);
    await expectValidationDisabled(alert, SEL.createFormSaveButton, 'Create Application becomes disabled again after clearing the title');
    await dismissAlert(alert, SEL.createFormCancelButton);
  });
});

async function typeAlertTitle(alert: Locator, inputSelector: string, value: string): Promise<void> {
  const input = alert.locator(inputSelector).first();
  await expect(input, 'alert title input should be visible').toBeVisible({ timeout: 10_000 });
  await input.fill('');
  await input.pressSequentially(value, { delay: 10 });
  await expect(input, 'alert title should contain the typed value').toHaveValue(value, { timeout: 10_000 });
}

async function clearAlertTitle(alert: Locator, inputSelector: string): Promise<void> {
  const input = alert.locator(inputSelector).first();
  await expect(input, 'alert title input should be visible before clearing').toBeVisible({ timeout: 10_000 });
  await input.fill('');
  await expect(input, 'alert title should be empty after clearing').toHaveValue('', { timeout: 10_000 });
}

async function dismissAlert(alert: Locator, cancelSelector: string): Promise<void> {
  await alert.locator(cancelSelector).first().click({ timeout: 10_000 });
  await expect(alert, 'alert should close after cancel').toBeHidden({ timeout: 15_000 });
}

async function expectValidationDisabled(alert: Locator, buttonSelector: string, message: string): Promise<void> {
  await expect
    .poll(async () => validationKind(await alertValidationButtonState(alert, buttonSelector)), {
      message,
      timeout: 10_000,
    })
    .toBe('disabled');
}

async function expectValidationEnabled(alert: Locator, buttonSelector: string, message: string): Promise<void> {
  await expect
    .poll(async () => validationKind(await alertValidationButtonState(alert, buttonSelector)), {
      message,
      timeout: 10_000,
    })
    .toBe('enabled');
}

function validationKind(state: AlertValidationButtonState): string {
  if (
    state.disabled &&
    state.ariaDisabled === 'true' &&
    state.hasDisabledClass &&
    state.pointerEvents === 'none' &&
    state.opacity <= 0.6
  ) {
    return 'disabled';
  }

  if (
    !state.disabled &&
    state.ariaDisabled !== 'true' &&
    !state.hasDisabledClass &&
    state.pointerEvents !== 'none' &&
    state.opacity >= 0.85
  ) {
    return 'enabled';
  }

  return [
    'mixed',
    `disabled=${state.disabled}`,
    `ariaDisabled=${state.ariaDisabled ?? 'null'}`,
    `disabledClass=${state.hasDisabledClass}`,
    `pointerEvents=${state.pointerEvents}`,
    `opacity=${state.opacity}`,
    `cursor=${state.cursor}`,
    `filter=${state.filter}`,
  ].join(' ');
}
