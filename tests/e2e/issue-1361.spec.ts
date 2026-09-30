import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  addComponent,
  createBlankForm,
  login,
  openComponentsPalette,
  openWorkflowsPanel,
  workflowListBottomVisibility,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1361
 * Reported in 2.2.0-beta150. Fix 2795de4e9 lets the Workflows column shrink
 * and scroll instead of clipping the last flow name; first shipped in
 * 2.2.0-beta152 and historically validated by QA in 2.2.0-beta153. This
 * latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta371, without deployment or a historical red phase. The form and
 * its Button workflows are created exclusively through the Studio UI.
 */
test.use({ viewport: { width: 1280, height: 600 } });
test.setTimeout(240_000);

test('#1361 - the last workflow name remains fully visible at the bottom of a scrolled list', async ({ page }) => {
  await test.step('Create a form and enough Button workflows to scroll', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1361 workflows ${Date.now()}`);
    await openComponentsPalette(page, PALETTE_ICON.button);
    for (let index = 0; index < 9; index++) {
      await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    }
  });

  await test.step('Scroll Workflows to the bottom and check the final name', async () => {
    await openWorkflowsPanel(page);
    const state = await workflowListBottomVisibility(page);
    expect(state.entryCount, 'the form should have several workflow entries').toBeGreaterThanOrEqual(9);
    expect(state.lastLabel, 'the final workflow should have a readable name').not.toBe('');
    expect(state.scrollRange, 'the Workflows list must really need scrolling').toBeGreaterThan(20);
    expect(state.scrollRemaining, 'the Workflows list should reach its bottom').toBeLessThanOrEqual(2);
    expect(state.lastTop, 'the last workflow should start inside the visible list').toBeGreaterThanOrEqual(state.visibleTop - 1);
    expect(state.lastBottom, 'the last workflow should end inside the visible list').toBeLessThanOrEqual(state.visibleBottom + 1);
  });
});
