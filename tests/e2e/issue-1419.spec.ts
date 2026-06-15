import { expect, Page, test } from '@playwright/test';
import {
  SEL,
  acceptRgpdIfVisible,
  checkboxElement,
  createFormDocument,
  descriptionElement,
  login,
  openComponentConfigByTechnicalId,
  openEditor,
  reopenEditorFromHome,
} from './helpers/studio';

const CHECKBOX_ID = 'checkbox1';
const DESCRIPTION_ID = 'desc1';
const OPTION = 'Oui';

test('#1419 - checkbox equality visibility value uses the text editor and persists after reopening', async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  const title = `Visibility checkbox chips ${Date.now()}`;
  const { id } = await createFormDocument(page, title, [
    checkboxElement(CHECKBOX_ID, [OPTION], {
      config: {
        html: 'Case de validation',
      },
    }),
    descriptionElement(DESCRIPTION_ID, '<p>Description conditionnelle</p>'),
  ]);

  await openEditor(page, id);
  await acceptRgpdIfVisible(page);

  await openDescriptionVisibilityConfig(page);
  await configureVisibilityEqualsCheckboxChip(page);
  await expect
    .soft(
      page.locator('tag-input'),
      'checkbox equality value editor should not use the chip/tag input; it should use the same text editor as Select visibility',
    )
    .toHaveCount(0, { timeout: 1_000 });

  const brokenChipEditor = await page.locator('tag-input').first().isVisible().catch(() => false);
  if (brokenChipEditor) {
    await fillBrokenChipValue(page);
    await expect(visibilityValueChip(page), 'the broken value chip should be visible before leaving the editor').toBeVisible({
      timeout: 10_000,
    });
  } else {
    await fillConditionTextEditor(page, OPTION);
    await expectConditionTextEditorToContain(page, OPTION);
  }
  await page.screenshot({ path: 'test-results/checkbox-visibility-chips-before-reopen.png', fullPage: true });

  await reopenEditorFromHome(page, title);
  await openDescriptionVisibilityConfig(page);
  await page.screenshot({ path: 'test-results/checkbox-visibility-chips-after-reopen.png', fullPage: true });

  if (brokenChipEditor) {
    await expect(
      visibilityValueChip(page),
      'the checkbox value chip should still be visible after returning Home and reopening the editor',
    ).toBeVisible({ timeout: 10_000 });
  } else {
    await expectConditionTextEditorToContain(page, OPTION);
  }
});

async function openDescriptionVisibilityConfig(page: Page): Promise<void> {
  await openComponentConfigByTechnicalId(page, DESCRIPTION_ID);
  await page.locator(SEL.configTab).filter({ hasText: /Visibilit|Visibility/i }).first().click();
}

async function configureVisibilityEqualsCheckboxChip(page: Page): Promise<void> {
  await page.locator(SEL.visibilityModeButton).filter({ hasText: /Selon une condition|condition/i }).first().click();
  await page.locator(SEL.visibilityAddConditionButton).first().click();

  await page.locator(SEL.conditionFieldBrowseButton).first().click();
  await page.locator('ion-popover ion-item').filter({ hasText: CHECKBOX_ID }).first().click();
  await expect(page.locator(SEL.conditionFieldInput).first()).toHaveValue(CHECKBOX_ID);

  const operator = page.locator(SEL.conditionOperatorSelect).first();
  await operator.click();
  await page.getByText('=', { exact: true }).last().click();
  await expect
    .poll(() => operator.evaluate((el) => (el as HTMLElement & { value?: unknown }).value), {
      message: 'visibility condition operator should be equals',
      timeout: 10_000,
    })
    .toBe('equals');
}

async function fillBrokenChipValue(page: Page): Promise<void> {
  await page.locator(SEL.conditionValueTagInput).first().fill(OPTION);
  await page.keyboard.press('Enter');
}

function visibilityValueChip(page: Page) {
  return page.locator('tag').filter({ hasText: OPTION }).first();
}

async function fillConditionTextEditor(page: Page, value: string): Promise<void> {
  const frameBody = page.frameLocator('iframe.tox-edit-area__iframe').last().locator('body');
  if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await frameBody.fill(value);
    return;
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'visibility value should expose a TinyMCE text editor').toBeVisible({ timeout: 10_000 });
  await inlineEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(value);
  await page.keyboard.press('Tab');
}

async function expectConditionTextEditorToContain(page: Page, value: string): Promise<void> {
  const frameBody = page.frameLocator('iframe.tox-edit-area__iframe').last().locator('body');
  if (await frameBody.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await expect(frameBody).toContainText(value, { timeout: 10_000 });
    return;
  }

  const inlineEditor = page.locator('[contenteditable="true"].mce-content-body, .tox-edit-area [contenteditable="true"]').last();
  await expect(inlineEditor, 'visibility value text editor should contain the configured value').toContainText(value, {
    timeout: 10_000,
  });
}
