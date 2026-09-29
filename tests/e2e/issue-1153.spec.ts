import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  choiceViewerValue,
  chooseViewerSelectOptions,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setChoiceLocalOptions,
  setSelectSelectionMode,
  setTechnicalId,
} from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1153
 * "Support multiple selection in Select component".
 *
 * The ticket was reported on 2.1.9-beta10. Commit 1733dbe6 introduced the
 * single/multiple selectionMode contract and the canonical string[] viewer
 * value (first shipped in 2.2.0-beta283); 3cf287d8 then placed the data-source
 * choice before Selection mode in the editor (first shipped in beta286). QA
 * validated the complete ticket in 2.2.0-beta289.
 *
 * This latest-only run targets test-nocode 2.2.0-beta370. The form and Select
 * are authored only through the Studio UI. Per request, there is no deployment
 * and no historical red phase.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(240_000);

test('#1153 — Select supports multiple local selections as a string array', async ({ page }) => {
  const suffix = Date.now();
  const technicalId = `select_multiple_1153_${suffix}`;
  const options = [`Alpha 1153 ${suffix}`, `Beta 1153 ${suffix}`, `Gamma 1153 ${suffix}`];

  await login(page);
  await createBlankForm(page, `Issue 1153 multiple Select ${suffix}`);

  await test.step('Create a Select and enable multiple selection through Studio', async () => {
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.selectComponent), 'the Select component should be added through Studio').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, technicalId);
    await setChoiceLocalOptions(page, options);
    await setSelectSelectionMode(page, 'multiple');
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the empty multiple value is an array', async () => {
    await openPreview(page, SEL.selectComponent);
    const component = page.locator(`#${technicalId}`).first();
    await expect(component, 'the configured Select should render in Preview').toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() =>
        component
          .locator('ion-select')
          .first()
          .evaluate((element) => (element as HTMLElement & { multiple?: boolean }).multiple === true), {
        message: 'the viewer Select should render in multiple mode',
        timeout: 15_000,
      })
      .toBe(true);
    await expect.poll(() => choiceViewerValue(page, 'select', 0)).toEqual([]);
  });

  await test.step('Select two values and keep them as a canonical string array', async () => {
    await chooseViewerSelectOptions(page, technicalId, [options[0], options[2]]);
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: 'the multiple Select value should contain both selected strings',
        timeout: 15_000,
      })
      .toEqual([options[0], options[2]]);
    await expect(page.locator(`#${technicalId}`).first()).toContainText(options[0]);
    await expect(page.locator(`#${technicalId}`).first()).toContainText(options[2]);
  });

  await test.step('Deselect one value without clearing the other selection', async () => {
    await chooseViewerSelectOptions(page, technicalId, [options[0]]);
    await expect
      .poll(() => choiceViewerValue(page, 'select', 0), {
        message: 'deselecting one option should preserve the other selected string',
        timeout: 15_000,
      })
      .toEqual([options[2]]);
  });
});
