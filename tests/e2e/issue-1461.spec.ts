import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addButtonFlowLoopAction,
  addComponent,
  addFormulaActionToLoop,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1461
 *
 * Broken version: 2.2.0-beta283. The local fix has not been released yet.
 *
 * Root cause: flow deletion spliced form.flows[].elements with the visible list
 * index but never detached the action from its parent's childrenRefs. Other
 * editor paths delegated flow actions to delElementIndex(), which only searched
 * form.formulaire. Deleting a Loop could likewise leave descendant actions
 * orphaned in the flat flow array.
 *
 * The fixture is built only through Studio UI: blank form creation, Button and
 * Loop insertion from their palettes, a real Formula drag into the Loop, and
 * deletion through the visible editor controls.
 */

test.setTimeout(180_000);

test('#1461 - deleting a nested Formula removes it and keeps the Loop editable', async ({ page }) => {
  await test.step('Create a blank form with a workflow Button', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1461 Loop Formula ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    await openComponentConfig(page, SEL.buttonComponent);
    await setTechnicalId(page, 'loop_formula_button_1461');
    await closeComponentConfig(page);
  });

  await test.step('Add a Loop and nest a Formula through the action palette', async () => {
    await addButtonFlowLoopAction(page);
    await addFormulaActionToLoop(page);
    await expect(page.locator(SEL.flowBusinessLogicActionCard), 'the Loop should contain one Formula card').toHaveCount(
      1,
      { timeout: 15_000 },
    );
  });

  await test.step('Delete the nested Formula from its full-page editor', async () => {
    const formula = page.locator(SEL.flowBusinessLogicActionCard).first();
    await formula.click({ timeout: 10_000 }).catch(async () => formula.click({ force: true }));
    await expect(
      page.locator(`${SEL.componentDeleteButton}:visible`).first(),
      'the selected Formula editor should expose the Delete action',
    ).toBeVisible({ timeout: 15_000 });
    await page.locator(`${SEL.componentDeleteButton}:visible`).first().click();
    await page.locator(SEL.confirmDeleteYesButton).last().click({ timeout: 10_000 });
  });

  await test.step('Assert the Formula is gone and the Loop remains editable', async () => {
    await expect(
      page.locator(SEL.flowBusinessLogicActionCard),
      'deleting the nested Formula must remove its Loop card and reference',
    ).toHaveCount(0, { timeout: 15_000 });

    const loop = page.locator(SEL.flowLoopActionCard).last();
    await expect(loop, 'the parent Loop should remain visible after deleting its Formula child').toBeVisible({
      timeout: 15_000,
    });
    await loop.click({ timeout: 10_000 }).catch(async () => loop.click({ force: true }));
    await expect(page.locator(SEL.flowLoopActionEditor).last(), 'the parent Loop should still open for editing').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Delete a Loop with a Formula without leaving an orphaned action', async () => {
    await addFormulaActionToLoop(page);
    await expect(
      page.locator(SEL.flowBusinessLogicActionCard),
      'the recreated nested Formula should be visible before deleting its Loop',
    ).toHaveCount(1, { timeout: 15_000 });

    const loop = page.locator(SEL.flowLoopActionCard).last();
    await loop
      .click({ position: { x: 24, y: 18 }, timeout: 10_000 })
      .catch(async () => loop.click({ position: { x: 24, y: 18 }, force: true }));
    await expect(page.locator(SEL.flowLoopActionEditor).last(), 'the Loop editor should be active before deletion').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(`${SEL.componentDeleteButton}:visible`).first()).toBeVisible({ timeout: 15_000 });
    await page.locator(`${SEL.componentDeleteButton}:visible`).first().click();
    await page.locator(SEL.confirmDeleteYesButton).last().click({ timeout: 10_000 });

    await expect(page.locator(SEL.flowLoopActionCard), 'the deleted Loop should disappear').toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(
      page.locator(SEL.flowBusinessLogicActionCard),
      'deleting the Loop must recursively remove its Formula descendant',
    ).toHaveCount(0, { timeout: 15_000 });
  });

  await test.step('Recreate the Loop without reviving the deleted Formula', async () => {
    await addButtonFlowLoopAction(page);
    await expect(page.locator(SEL.flowLoopActionCard), 'a new Loop should remain insertable').toHaveCount(1, {
      timeout: 15_000,
    });
    await expect(
      page.locator(SEL.flowBusinessLogicActionCard),
      'the deleted Formula must not reappear in the recreated Loop',
    ).toHaveCount(0, { timeout: 15_000 });
  });
});
