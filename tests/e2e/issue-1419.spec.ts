import { expect, test } from '@playwright/test';
import {
  acceptRgpdIfVisible,
  configureVisibilityEqualsField,
  createFormWithCheckboxAndDescription,
  expectVisibilityValueTextEditorToContain,
  fillVisibilityTagValue,
  fillVisibilityValueTextEditor,
  login,
  openComponentVisibilityConfig,
  reopenEditorFromHome,
  visibilityValueChip,
} from './helpers/studio';

const CHECKBOX_ID = 'checkbox1';
const DESCRIPTION_ID = 'desc1';
const OPTION = 'Oui';

/**
 * Open bug test for https://github.com/convertigo/C8oForms/issues/1419
 * "Visibility: single checkbox equality value is edited as chips and lost after reopening"
 *
 * Broken version: 2.2.0-beta228. Status: open bug, no #1419 fix commit found.
 * Observed mechanism: selecting a single Checkbox as the left side of a
 * Visibility equality condition renders the right side as a tag-input/chip
 * editor; the chip is visible before leaving, but the saved condition loses the
 * value and reopening the editor shows an empty value.
 *
 * The fixture is built through the Studio UI only: create a blank form, add a
 * Checkbox and Description, set their technical ids, and configure the checkbox
 * option through the component configuration panel.
 */
test('#1419 - checkbox equality visibility value uses the text editor and persists after reopening', async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  const title = `Visibility checkbox chips ${Date.now()}`;
  await createFormWithCheckboxAndDescription(page, {
    title,
    checkboxTechnicalId: CHECKBOX_ID,
    descriptionTechnicalId: DESCRIPTION_ID,
    checkboxOptions: [OPTION],
  });
  await acceptRgpdIfVisible(page);

  await openComponentVisibilityConfig(page, DESCRIPTION_ID);
  await configureVisibilityEqualsField(page, CHECKBOX_ID);
  await expect
    .soft(
      page.locator('tag-input'),
      'checkbox equality value editor should not use the chip/tag input; it should use the same text editor as Select visibility',
    )
    .toHaveCount(0, { timeout: 1_000 });

  const brokenChipEditor = await page.locator('tag-input').first().isVisible().catch(() => false);
  if (brokenChipEditor) {
    await fillVisibilityTagValue(page, OPTION);
    await expect(visibilityValueChip(page, OPTION), 'the broken value chip should be visible before leaving the editor').toBeVisible({
      timeout: 10_000,
    });
  } else {
    await fillVisibilityValueTextEditor(page, OPTION);
    await expectVisibilityValueTextEditorToContain(page, OPTION);
  }

  await reopenEditorFromHome(page, title);
  await openComponentVisibilityConfig(page, DESCRIPTION_ID);

  if (brokenChipEditor) {
    await expect(
      visibilityValueChip(page, OPTION),
      'the checkbox value chip should still be visible after returning Home and reopening the editor',
    ).toBeVisible({ timeout: 10_000 });
  } else {
    await expectVisibilityValueTextEditorToContain(page, OPTION);
  }
});
