import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addVisibilityConditionAndExpectGenericElementPlaceholder,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  openComponentVisibilityConfigBySelector,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1296
 * "Visibility condition placeholder incorrectly shows Column instead of a
 * generic term".
 *
 * Found in 2.2.0-beta112. Fixed by 0b818d25, first released and validated OK
 * in 2.2.0-beta115.
 *
 * Root cause: the shared FilterBR condition editor always used the `the_col`
 * i18n key for the left-hand condition field placeholder. That wording is
 * correct for Grid filters but misleading in component Visibility conditions.
 * The fix adds the `the_element` i18n key and uses it when the condition kind is
 * `visibleIf`.
 *
 * The fixture is built entirely through Studio UI: create a blank application,
 * add a Text Input component from the palette, then open its Visibility tab and
 * add a condition through the component configuration panel.
 */

test.setTimeout(120_000);

test('#1296 - Visibility condition field uses a generic Element placeholder', async ({ page }) => {
  await test.step('Create a blank form with a Text Input component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1296 visibility placeholder ${Date.now()}`);

    await addComponent(page, PALETTE_ICON.textInput);
    await expect(page.locator(SEL.textComponent), 'the Text Input component should be added').toHaveCount(1, {
      timeout: 30_000,
    });

    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, 'input_1296');
    await closeComponentConfig(page);
  });

  await test.step('Open Visibility and assert the condition field placeholder', async () => {
    await openComponentVisibilityConfigBySelector(page, SEL.textComponent);
    await addVisibilityConditionAndExpectGenericElementPlaceholder(page);
  });
});
