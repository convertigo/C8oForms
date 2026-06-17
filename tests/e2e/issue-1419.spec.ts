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
 * Regression test for https://github.com/convertigo/C8oForms/issues/1419
 * "Visibility: single checkbox equality value is edited as chips and lost after reopening"
 *
 * Broken version: 2.2.0-beta228; fixed by b41111b51 (first in beta234). Observed
 * mechanism: selecting a single Checkbox as the left side of a Visibility equality
 * condition saved a condition whose value was lost — reopening the editor showed
 * an empty value. The test asserts on that round-trip (value still present after
 * Home -> reopen), regardless of which editor (chip or text) renders the value,
 * so it turns green once the value persists and stays red while it is dropped.
 *
 * The fixture is built through the Studio UI only: create a blank form, add a
 * Checkbox and Description, set their technical ids, and configure the checkbox
 * option through the component configuration panel.
 */
test('#1419 - checkbox equality visibility value persists after reopening', async ({ page }) => {
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

  // The real #1419 symptom is the value being LOST after reopening — not which
  // editor (chip vs text) renders. So detect whichever editor is shown, fill the
  // value there, and assert it survives a round-trip Home -> reopen. (Asserting
  // the editor must be text gave a false failure when the value persists.)
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
