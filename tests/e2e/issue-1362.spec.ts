import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  createBlankForm,
  login,
  openButtonFlowChooser,
  openComponentConfig,
  openComponentsPalette,
} from './helpers/studio';

/**
 * Latest-only coverage for https://github.com/convertigo/C8oForms/issues/1362
 * Reported in 2.2.0-beta150: the Button FLOW chooser was a flat group of
 * pills with no search. Commit 4270b1159 introduced a select in beta279, but
 * QA found search still absent in beta281. Commit b54f27a81 enabled searchable
 * options, first shipped and historically validated in 2.2.0-beta284. This
 * latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta371, without deployment or a historical red phase. All form and
 * Button manipulation is performed through the Studio UI.
 */
test.setTimeout(240_000);

test('#1362 - Button flow chooser searches long lists and keeps the selected flow', async ({ page }) => {
  await test.step('Create a form with nine Button flows through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1362 flow search ${Date.now()}`);
    await openComponentsPalette(page, PALETTE_ICON.button);
    for (let index = 0; index < 9; index++) {
      await addComponent(page, PALETTE_ICON.button, { allowEditorApiFallback: false });
    }
    await expect(page.locator(`${SEL.buttonComponent}:visible`)).toHaveCount(9, { timeout: 30_000 });
  });

  let selectedName = '';
  await test.step('Search and select a flow from the Button configuration', async () => {
    await openComponentConfig(page, SEL.buttonComponent);
    const popover = await openButtonFlowChooser(page);
    const search = popover.locator(SEL.buttonFlowSearchInput);
    const options = popover.locator(SEL.buttonFlowSearchOption);
    const initialCount = await options.count();
    expect(initialCount, 'the chooser should expose a long list of Button flows').toBeGreaterThanOrEqual(9);
    selectedName = (await options.last().innerText()).trim();
    expect(selectedName, 'the last flow should have a nonempty name').not.toBe('');

    await search.fill('no-matching-flow-1362');
    await expect(options, 'an unmatched query should remove the flow options').toHaveCount(0);
    await search.fill('');
    await expect(options, 'clearing search should restore every flow option').toHaveCount(initialCount);
    await search.fill(selectedName);
    await expect(options, 'search should isolate the chosen flow').toHaveCount(1);
    await expect(options.first()).toHaveText(selectedName);
    await options.first().click();
    await expect(popover).toBeHidden({ timeout: 10_000 });
    await expect(page.locator(`${SEL.buttonFlowSearchTrigger}:visible .select-editor-search-trigger__label`).first()).toHaveText(
      selectedName,
    );
  });

  await test.step('Reopen the configuration and verify the selected flow', async () => {
    await page.locator(SEL.configClose).first().click();
    await openComponentConfig(page, SEL.buttonComponent);
    const popover = await openButtonFlowChooser(page);
    const selected = popover.locator(`${SEL.buttonFlowSearchOption}[aria-selected="true"]`);
    await expect(selected, 'the selected flow should survive closing and reopening Button configuration').toHaveCount(1);
    await expect(selected).toHaveText(selectedName);
  });
});
