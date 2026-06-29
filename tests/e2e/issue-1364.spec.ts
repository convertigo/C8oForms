import { test, expect } from './fixtures';
import {
  login,
  createBlankForm,
  openEditor,
  acceptRgpdIfVisible,
  addHorizontalLayout,
  dragPaletteComponentInto,
  layoutChildComponentTypes,
  moveLayoutChildToStart,
  PALETTE_ICON,
  SEL,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1364
 * "Cannot reorder child components inside an Horizontal layout component".
 *
 * Reproduced on 2.2.0-beta151. The layout child drop-zone work was fixed across
 * commits 63c5ac4b, 173647c2, 393931ed and f041ccc5; the ticket was finally
 * validated OK in 2.2.0-beta164 after the follow-up layout drop regressions.
 *
 * The fixture is created entirely through the No Code Studio UI: create a blank
 * form, add a Horizontal layout, then drag a Text input, a Description and a
 * Checkbox into that layout. The assertion captures the editor DOM order of
 * nested component tags before and after the move, so it is independent of the
 * current Studio language and of the exact insertion side used by the drop zone.
 */
test('#1364 - children inside a Horizontal layout can be reordered by drag-and-drop', async ({ page }) => {
  test.setTimeout(90_000);
  let initialOrder: string[] = [];

  await test.step('Create a blank form with a three-child Horizontal layout', async () => {
    await login(page);
    const id = await createBlankForm(page, `Repro 1364 ${Date.now()}`);
    await openEditor(page, id);
    await acceptRgpdIfVisible(page);

    await addHorizontalLayout(page);
    await dragPaletteComponentInto(page, PALETTE_ICON.textInput, SEL.layoutViewer);
    await dragPaletteComponentInto(page, PALETTE_ICON.description, SEL.layoutViewer);
    await dragPaletteComponentInto(page, PALETTE_ICON.checkbox, SEL.layoutViewer);
  });

  await test.step('Verify the initial nested child order', async () => {
    await expect(page.locator(SEL.layoutViewer), 'the Horizontal layout should be present').toHaveCount(1);
    await expect(page.locator(SEL.layoutChild), 'the layout should contain three nested children').toHaveCount(3);
    await expect
      .poll(async () => (await layoutChildComponentTypes(page)).sort().join(','), {
        message: 'the layout should contain one Checkbox, one Description and one Text input child',
        timeout: 10_000,
      })
      .toBe('checkbox,description,text');
    initialOrder = await layoutChildComponentTypes(page);
  });

  await test.step('Drag the last child before the first child', async () => {
    const expectedOrder = [initialOrder[2], initialOrder[0], initialOrder[1]].join(',');
    await moveLayoutChildToStart(page, 2);

    await expect
      .poll(async () => (await layoutChildComponentTypes(page)).join(','), {
        message: 'the last child should move before the first child',
        timeout: 10_000,
      })
      .toBe(expectedOrder);
  });
});
