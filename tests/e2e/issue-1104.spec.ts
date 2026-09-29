import { test, expect } from './fixtures';
import {
  PALETTE_ICON,
  addComponent,
  componentDropZoneHeightsDuringPaletteDrag,
  countComponents,
  createBlankForm,
  login,
} from './helpers/studio';

/**
 * Non-regression test for https://github.com/convertigo/C8oForms/issues/1104
 * "Enlarge component drop zone"
 *
 * QA validated the enlarged drop target in 2.2.0-beta101. The redesigned
 * shared drop indicator is 50px tall while a palette drag is active and grows
 * to 75px under the pointer, instead of exposing the former narrow target.
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta369. It intentionally has no historical red run or deployment. The
 * fixture is created entirely through the Studio UI and palette gestures.
 */
test('#1104 — component drop zones are enlarged and expand on hover', async ({ page }) => {
  await login(page);
  await createBlankForm(page);
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });

  const componentCountBeforeDrag = await countComponents(page);
  const heights = await componentDropZoneHeightsDuringPaletteDrag(page, PALETTE_ICON.description);

  expect(heights.visibleZoneCount, 'a populated page should expose several insertion targets').toBeGreaterThanOrEqual(
    2,
  );
  expect(heights.idle, 'an idle component drop target should be at least 50px tall').toBeGreaterThanOrEqual(48);
  expect(heights.hovered, 'a hovered component drop target should expand to about 75px').toBeGreaterThanOrEqual(70);
  expect(heights.hovered, 'hovering the component drop target should make it taller').toBeGreaterThan(heights.idle);
  await expect.poll(() => countComponents(page)).toBe(componentCountBeforeDrag);
});
