import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import {
  SEL,
  createBlankForm,
  login,
  returnToSelectorFromEditor,
  selectorApplicationTitleClipping,
  switchSelectorApplicationsView,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1358
 * Reported in 2.2.0-beta150. Although the original ticket requested wrapping,
 * QA accepted a one-line ellipsis with a full-name hover tooltip. Fixes
 * 0f4ae709d and b8f2087eb update the card/list title styles, tooltips and list
 * layout; both first shipped and were historically validated in beta159. This
 * latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta371, without deployment or a historical red phase. The application
 * is created and navigated exclusively through the Studio UI.
 */
test.use({ viewport: { width: 1366, height: 768 } });
test.setTimeout(150_000);

test('#1358 - long application names remain identifiable in grid and list views', async ({ page }) => {
  const title = `Issue 1358 long application name with a complete descriptive title ${Date.now()} and more words for clipping`;

  await test.step('Create a long-named application through Studio', async () => {
    await login(page);
    await createBlankForm(page, title);
    await returnToSelectorFromEditor(page);
  });

  await test.step('Check the grid card title and its full-name tooltip', async () => {
    const cardTitle = page.locator(SEL.selectorCardTitle).filter({ hasText: title }).first();
    await expect(cardTitle).toBeVisible({ timeout: 30_000 });
    await expect(cardTitle).toHaveText(title);
    await expectTitleClippedFromEnd(cardTitle, 'grid');
    await expectFullTitleTooltip(page, cardTitle, title);
  });

  await test.step('Check the list row title and its full-name tooltip', async () => {
    await switchSelectorApplicationsView(page, 'list');
    const listTitle = page.locator(SEL.selectorListTitle).filter({ hasText: title }).first();
    await expect(listTitle).toBeVisible({ timeout: 30_000 });
    await expect(listTitle).toHaveText(title);
    await expectTitleClippedFromEnd(listTitle, 'list');
    await expectFullTitleTooltip(page, listTitle, title);
  });
});

async function expectTitleClippedFromEnd(title: Locator, view: 'grid' | 'list'): Promise<void> {
  const state = await selectorApplicationTitleClipping(title, view);
  expect(state.scrollWidth, `${view} title should be long enough to overflow its allotted width`).toBeGreaterThan(
    state.clientWidth + 20,
  );
  expect(state.overflow, `${view} title should not spill outside its container`).toBe('hidden');
  expect(state.textOverflow, `${view} title should end in an ellipsis`).toBe('ellipsis');
  expect(state.whiteSpace, `${view} title should occupy a single line`).toBe('nowrap');
  expect(state.firstGlyphLeft, `${view} title should not lose its beginning on the left`).toBeGreaterThanOrEqual(
    state.containerLeft - 1,
  );
  expect(state.firstGlyphRight, `${view} title should start within the visible container`).toBeLessThanOrEqual(
    state.containerRight + 1,
  );
}

async function expectFullTitleTooltip(page: Page, title: Locator, fullTitle: string): Promise<void> {
  await title.hover();
  await expect(page.locator('.mat-mdc-tooltip-show .mat-mdc-tooltip-surface').last()).toHaveText(fullTitle, {
    timeout: 5_000,
  });
}
