import { test, expect, Page } from '@playwright/test';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  openComponentConfigAt,
  openComponentVisibilityConfigBySelector,
  openVisibilityConditionFieldPicker,
  sourceCompletionPopoverState,
  fillSourceCompletionSearch,
  sourceCompletionPopover,
  setTechnicalId,
  closeComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1357
 * "Elements list in Visibility condition is not sorted, has no search bar,
 * and gives no scroll indication."
 *
 * Found in 2.2.0-beta150, then reported again in 2.2.0-beta205 for the source
 * completion search bar layout. Fixed by f7eb45b3 and af7add77, first OK in
 * 2.2.0-beta223. Validated green in this suite on 2.2.0-beta234.
 *
 * Root cause: source-completion lists used by editor configuration surfaces did
 * not consistently sort/filter candidates and lacked a bounded scroll/search UI;
 * the follow-up fix aligned the search icon inside the completion popover.
 *
 * The fixture is built entirely through the Studio UI: create a blank form, add
 * local components, rename their technical identifiers, then open the target
 * components' configuration panels.
 */
const SOURCE_FIELD_IDS = [
  'mmm_middle_input',
  'aaa_alpha_input',
  'zzz_zulu_input',
  'bbb_bravo_input',
  'kkk_kilo_input',
  'ccc_charlie_input',
  'yyy_yankee_input',
  'ddd_delta_input',
  'jjj_juliett_input',
  'eee_echo_input',
  'hhh_hotel_input',
  'fff_foxtrot_input',
];

const SEARCH_TARGET = 'jjj_juliett_input';

const TARGETS = [
  {
    technicalId: 'target_button_1357',
    icon: PALETTE_ICON.button,
    expectedIconPath: `assets/images/svg/component/${PALETTE_ICON.button}`,
    tag: SEL.buttonComponent,
  },
  {
    technicalId: 'target_select_1357',
    icon: PALETTE_ICON.select,
    expectedIconPath: `assets/images/svg/component/${PALETTE_ICON.select}`,
    tag: SEL.selectComponent,
  },
  {
    technicalId: 'target_grid_1357',
    icon: PALETTE_ICON.grid,
    expectedIconPath: `assets/images/svg/component/${PALETTE_ICON.grid}`,
    tag: SEL.gridComponent,
  },
];

test.setTimeout(240_000);

test('#1357 - source completion lists are sorted, searchable and scrollable in button, select and data grid config', async ({
  page,
}) => {
  await login(page);
  await createBlankForm(page, `Issue 1357 ${Date.now()}`);

  await createSourceFields(page);
  await createTargetComponents(page);

  for (const target of TARGETS) {
    await openComponentVisibilityConfigBySelector(page, target.tag);
    await openVisibilityConditionFieldPicker(page);
    await expectSourceCompletionIcon(page, target.technicalId, target.expectedIconPath);
    await expectSourceCompletionListUsable(page, target.technicalId);
    await sourceCompletionPopover(page).locator('ion-item').filter({ hasText: SEARCH_TARGET }).first().click();
    await expect(sourceCompletionPopover(page)).toBeHidden({ timeout: 10_000 });
    await closeComponentConfig(page);
  }
});

async function createSourceFields(page: Page): Promise<void> {
  for (const [index, technicalId] of SOURCE_FIELD_IDS.entries()) {
    await addComponent(page, PALETTE_ICON.textInput);
    await page.locator(SEL.textComponent).nth(index).waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfigAt(page, SEL.textComponent, index);
    await setTechnicalId(page, technicalId);
    await closeComponentConfig(page);
  }
}

async function createTargetComponents(page: Page): Promise<void> {
  for (const target of TARGETS) {
    await addComponent(page, target.icon);
    await page.locator(target.tag).first().waitFor({ state: 'visible', timeout: 30_000 });
    await openComponentConfig(page, target.tag);
    await setTechnicalId(page, target.technicalId);
    await closeComponentConfig(page);
  }
}

async function expectSourceCompletionListUsable(page: Page, context: string): Promise<void> {
  const beforeSearch = await sourceCompletionPopoverState(page);
  const missing = SOURCE_FIELD_IDS.filter((technicalId) => !beforeSearch.labels.includes(technicalId));
  expect(missing, `${context}: every source field should be offered in the completion popover`).toEqual([]);

  const visibleSourceFields = beforeSearch.labels.filter((label) => SOURCE_FIELD_IDS.includes(label));
  expect(visibleSourceFields, `${context}: source fields should be sorted alphabetically`).toEqual(
    [...visibleSourceFields].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })),
  );
  expect(beforeSearch.overflowY, `${context}: the list should advertise vertical scrolling`).toMatch(/auto|scroll/);
  expect(beforeSearch.scrollHeight, `${context}: the long source list should be scrollable`).toBeGreaterThan(
    beforeSearch.clientHeight,
  );
  expect(beforeSearch.maxHeight, `${context}: the source list should be height-bounded`).not.toBe('none');
  expect(beforeSearch.searchIconTop, `${context}: the search icon should be measurable`).not.toBeNull();
  expect(beforeSearch.searchIconLeft, `${context}: the search icon should be measurable`).not.toBeNull();
  expect(beforeSearch.searchIconTop!, `${context}: the search icon should be aligned near the top of the input`)
    .toBeLessThanOrEqual(14);
  expect(beforeSearch.searchIconLeft!, `${context}: the search icon should stay inside the input padding`)
    .toBeLessThanOrEqual(16);

  await fillSourceCompletionSearch(page, SEARCH_TARGET);
  await expect
    .poll(() => sourceCompletionPopoverState(page).then((state) => state.labels), {
      message: `${context}: source completion search should filter the list immediately`,
      timeout: 10_000,
    })
    .toContain(SEARCH_TARGET);

  const afterSearch = await sourceCompletionPopoverState(page);
  const nonMatchingSourceFields = SOURCE_FIELD_IDS.filter(
    (technicalId) => technicalId !== SEARCH_TARGET && afterSearch.labels.includes(technicalId),
  );
  expect(nonMatchingSourceFields, `${context}: non-matching source fields should be hidden after search`).toEqual([]);
}

async function expectSourceCompletionIcon(page: Page, technicalId: string, expectedIconPath: string): Promise<void> {
  const state = await sourceCompletionPopoverState(page);
  const item = state.items.find((entry) => entry.label === technicalId);
  expect(item, `${technicalId}: source completion item should be listed`).toBeDefined();
  expect(item!.imageSrc, `${technicalId}: source completion item should expose the component type image`).toContain(
    expectedIconPath,
  );
}
