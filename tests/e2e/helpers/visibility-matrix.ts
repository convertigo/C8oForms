import { expect, type Page } from '@playwright/test';
import {
  acceptRgpdIfVisible,
  addComponent,
  addVisibilityCondition,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfigAt,
  openConfigTabById,
  openViewer,
  setCheckboxDefaultSelected,
  setCheckboxLocalOptions,
  setDescriptionText,
  setTechnicalId,
  setTextDefaultValueJavascript,
  PALETTE_ICON,
  SEL,
  type VisibilityConditionSpec,
} from './studio';

/**
 * Shared fixtures + runners for the standalone (non-ticket) component Visibility
 * coverage. Split across separate spec files (operators / types A / types B) so
 * the three long tests land on different CI shards (sharding is per file).
 *
 * Everything is authored through the No Code Studio UI (no document writes). In
 * the viewer, field components render with their technical id as the element id,
 * a Description renders only its content, and every component renders under a
 * `c8oforms-item<type>viewer` tag whose `:visible` reflects show/hide.
 *
 * Out of scope (not UI-authorable condition-value paths): JavaScript-mode values
 * and dropped Source Palette tokens. Layout containers (group, horizontal layout)
 * are out of scope for the type axis — layout has #1363.
 */
export const TARGET_TYPES = {
  text: { icon: PALETTE_ICON.textInput, tag: 'c8oforms-itemtextviewer' },
  checkbox: { icon: PALETTE_ICON.checkbox, tag: 'c8oforms-itemcheckboxviewer' },
  checkboxGroup: { icon: PALETTE_ICON.checkboxGroup, tag: 'c8oforms-itemcheckboxgroupviewer' },
  description: { icon: PALETTE_ICON.description, tag: 'c8oforms-itemdescriptionviewer' },
  select: { icon: PALETTE_ICON.select, tag: 'c8oforms-itemselectviewver' },
  radio: { icon: PALETTE_ICON.radio, tag: 'c8oforms-itemradioviewver' },
  radioGroup: { icon: PALETTE_ICON.radioGroup, tag: 'c8oforms-itemradiogroupviewver' },
  slider: { icon: PALETTE_ICON.slider, tag: 'c8oforms-itemsliderviewver' },
  datetime: { icon: PALETTE_ICON.date, tag: 'c8oforms-itemdatetimeviewver' },
  time: { icon: PALETTE_ICON.time, tag: 'c8oforms-itemtimeviewver' },
  camera: { icon: PALETTE_ICON.camera, tag: 'c8oforms-itemimgviewer' },
  grid: { icon: PALETTE_ICON.grid, tag: 'c8oforms-itemgridviewer' },
  chart: { icon: PALETTE_ICON.chart, tag: 'c8oforms-itemchartviewer' },
  map: { icon: PALETTE_ICON.map, tag: 'c8oforms-itemmapviewer' },
  barcode: { icon: PALETTE_ICON.barcode, tag: 'c8oforms-itembarcodeviewver' },
  file: { icon: PALETTE_ICON.file, tag: 'c8oforms-itemfileviewver' },
  signature: { icon: PALETTE_ICON.signature, tag: 'c8oforms-itemsignatureviewver' },
  location: { icon: PALETTE_ICON.location, tag: 'c8oforms-itemlocationviewer' },
  button: { icon: PALETTE_ICON.button, tag: 'c8oforms-itembuttonviewer' },
} as const;

export type TargetType = keyof typeof TARGET_TYPES;

// Two batches keep each type test ~half the components (robust + balanced shards).
export const TYPE_BATCH_A: TargetType[] = [
  'text', 'checkbox', 'checkboxGroup', 'description', 'select', 'radio', 'radioGroup', 'slider', 'datetime', 'time',
];
export const TYPE_BATCH_B: TargetType[] = [
  'camera', 'grid', 'chart', 'map', 'barcode', 'file', 'signature', 'location', 'button',
];
export const TYPE_BATCH_B1: TargetType[] = ['camera', 'grid'];
export const TYPE_BATCH_B2: TargetType[] = ['map', 'barcode', 'file'];
export const TYPE_BATCH_B3: TargetType[] = ['signature', 'location', 'button'];

export interface TargetCase {
  id: string;
  type: TargetType;
  condition: VisibilityConditionSpec;
  visible: boolean;
}

export interface SourceSpec {
  kind: 'text' | 'checkbox';
  id: string;
  value?: string;
  options?: string[];
  defaultSelected?: number;
}

// Operator axis sources: a text source, a numeric source, and a checkbox source
// with Alpha selected by default (for the multiple operators).
export const OPERATOR_SOURCES: SourceSpec[] = [
  { kind: 'text', id: 'inputAlpha', value: 'Alpha' },
  { kind: 'text', id: 'inputNum', value: '5' },
  { kind: 'checkbox', id: 'cb1', options: ['Alpha', 'Beta', 'Bravo'], defaultSelected: 0 },
];

// Operator axis — text-input targets (asserted by element id), plus checkbox
// (description targets) for the multiple operators.
export const OPERATOR_CASES: TargetCase[] = [
  { id: 'opEqualsVis', type: 'text', condition: { field: 'inputAlpha', operator: 'equals', value: 'Alpha' }, visible: true },
  { id: 'opEqualsHid', type: 'text', condition: { field: 'inputAlpha', operator: 'equals', value: 'Nope' }, visible: false },
  { id: 'opDifferentVis', type: 'text', condition: { field: 'inputAlpha', operator: 'different', value: 'Bravo' }, visible: true },
  { id: 'opContainsVis', type: 'text', condition: { field: 'inputAlpha', operator: 'contains', value: 'lph' }, visible: true },
  { id: 'opNotContainsHid', type: 'text', condition: { field: 'inputAlpha', operator: 'not_contains', value: 'lph' }, visible: false },
  { id: 'opGreaterVis', type: 'text', condition: { field: 'inputNum', operator: 'greater', value: '3' }, visible: true },
  { id: 'opGreaterEqVis', type: 'text', condition: { field: 'inputNum', operator: 'greaterequals', value: '5' }, visible: true },
  { id: 'opMinusVis', type: 'text', condition: { field: 'inputNum', operator: 'minus', value: '10' }, visible: true },
  { id: 'opMinusEqVis', type: 'text', condition: { field: 'inputNum', operator: 'minusequals', value: '5' }, visible: true },
  { id: 'opFilledVis', type: 'text', condition: { field: 'inputAlpha', operator: 'is_filled' }, visible: true },
  { id: 'opEmptyHid', type: 'text', condition: { field: 'inputAlpha', operator: 'is_empty' }, visible: false },
  { id: 'opAmongVis', type: 'description', condition: { field: 'cb1', operator: 'among_following', value: ['Alpha', 'Gamma'] }, visible: true },
  { id: 'opAmongHid', type: 'description', condition: { field: 'cb1', operator: 'among_following', value: ['Gamma', 'Delta'] }, visible: false },
  { id: 'opOutVis', type: 'description', condition: { field: 'cb1', operator: 'out_following', value: ['Gamma', 'Delta'] }, visible: true },
  { id: 'opOutHid', type: 'description', condition: { field: 'cb1', operator: 'out_following', value: ['Alpha', 'Gamma'] }, visible: false },
];

function indexer() {
  const indexByTag: Record<string, number> = {};
  return (tag: string): number => {
    const i = indexByTag[tag] ?? 0;
    indexByTag[tag] = i + 1;
    return i;
  };
}

async function addSourceField(page: Page, index: number, technicalId: string, value: string): Promise<void> {
  await addComponent(page, PALETTE_ICON.textInput);
  await page.locator(`${SEL.textComponent}:visible`).nth(index).waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfigAt(page, SEL.textComponent, index);
  await setTechnicalId(page, technicalId);
  await setTextDefaultValueJavascript(page, `'${value}'`);
  await closeComponentConfig(page);
}

async function addCheckboxSource(
  page: Page,
  index: number,
  technicalId: string,
  options: string[],
  defaultSelectedIndex: number,
): Promise<void> {
  await addComponent(page, PALETTE_ICON.checkbox);
  await page.locator(`${SEL.checkboxComponent}:visible`).nth(index).waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfigAt(page, SEL.checkboxComponent, index);
  await setTechnicalId(page, technicalId);
  await setCheckboxLocalOptions(page, options);
  await setCheckboxDefaultSelected(page, defaultSelectedIndex);
  await closeComponentConfig(page);
}

async function addTarget(page: Page, testCase: TargetCase): Promise<void> {
  const { icon, tag } = TARGET_TYPES[testCase.type];
  const attachedIndex = await page.locator(tag).count();
  await addComponent(page, icon);
  const visibleIndex = await waitForVisibleIndexByAttachedIndex(page, tag, attachedIndex);
  await openComponentConfigAt(page, tag, visibleIndex);
  await setTechnicalId(page, testCase.id);
  // A Description has no technical-id element in the viewer, so stamp its content
  // with the id to locate it there.
  if (testCase.type === 'description') await setDescriptionText(page, testCase.id);
  await openConfigTabById(page, 'visibility_tab_selector');
  await addVisibilityCondition(page, testCase.condition);
  await closeComponentConfig(page);
}

async function waitForVisibleIndexByAttachedIndex(
  page: Page,
  tag: string,
  attachedIndex: number,
  timeout = 30_000,
): Promise<number> {
  await expect
    .poll(() => page.locator(tag).count(), {
      message: `${tag} should be attached after adding the component`,
      timeout,
    })
    .toBeGreaterThan(attachedIndex);

  const deadline = Date.now() + timeout;
  let lastState = '';
  while (Date.now() < deadline) {
    const state = await page.evaluate(
      ({ componentTag, targetIndex }) => {
        const visible = (el: Element) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          const style = getComputedStyle(el as HTMLElement);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        };
        const all = [...document.querySelectorAll(componentTag)];
        const target = all[targetIndex];
        const visibleElements = all.filter(visible);
        return {
          attachedCount: all.length,
          visibleCount: visibleElements.length,
          visibleIndex: target ? visibleElements.indexOf(target) : -1,
        };
      },
      { componentTag: tag, targetIndex: attachedIndex },
    );
    lastState = JSON.stringify(state);
    if (state.visibleIndex >= 0) {
      return state.visibleIndex;
    }
    await page.waitForTimeout(250);
  }

  throw new Error(`${tag} at attached index ${attachedIndex} did not become visible before configuration; last state=${lastState}`);
}

async function addSources(page: Page, sources: SourceSpec[], nextIndex: (tag: string) => number): Promise<void> {
  for (const source of sources) {
    if (source.kind === 'text') {
      await addSourceField(page, nextIndex(SEL.textComponent), source.id, source.value ?? '');
    } else {
      await addCheckboxSource(
        page,
        nextIndex(SEL.checkboxComponent),
        source.id,
        source.options ?? [],
        source.defaultSelected ?? 0,
      );
    }
  }
}

/**
 * Operator axis: author each case's target + condition and assert per-case in the
 * viewer (field components by `#id`, a Description by its content text).
 */
export async function runVisibilityCases(
  page: Page,
  title: string,
  sources: SourceSpec[],
  cases: TargetCase[],
): Promise<void> {
  await login(page);
  const id = await createBlankForm(page, `${title} ${Date.now()}`);
  await acceptRgpdIfVisible(page);

  const nextIndex = indexer();
  await addSources(page, sources, nextIndex);
  for (const testCase of cases) {
    await addTarget(page, testCase);
  }

  await openViewer(page, id);

  for (const testCase of cases) {
    const locator =
      testCase.type === 'description'
        ? page.getByText(testCase.id, { exact: true }).first()
        : page.locator(`#${testCase.id}`).first();
    if (testCase.visible) {
      await expect(locator, `${testCase.id} (${testCase.type}) should be visible`).toBeVisible({ timeout: 30_000 });
    } else {
      await expect(locator, `${testCase.id} (${testCase.type}) should be hidden`).toBeHidden({ timeout: 30_000 });
    }
  }
}

/**
 * Type axis: for each type, author one shown + one hidden target, then assert
 * exactly the visible instances of that type's component tag are visible.
 * `tag:visible` is the uniform signal across the heterogeneous viewer rendering
 * (hidden components are removed for field inputs, collapsed to a zero box for
 * button/grid/groups/…), with a retrying count so the collapse can settle.
 */
export async function runTypeVisibility(page: Page, title: string, types: TargetType[]): Promise<void> {
  await login(page);
  const id = await createBlankForm(page, `${title} ${Date.now()}`);
  await acceptRgpdIfVisible(page);

  const nextIndex = indexer();
  await addSourceField(page, nextIndex(SEL.textComponent), 'inputAlpha', 'Alpha');

  const cases: TargetCase[] = types.flatMap((type) => [
    { id: `${type}Vis`, type, condition: { field: 'inputAlpha', operator: 'equals', value: 'Alpha' }, visible: true },
    { id: `${type}Hid`, type, condition: { field: 'inputAlpha', operator: 'equals', value: 'Nope' }, visible: false },
  ]);
  for (const testCase of cases) {
    await addTarget(page, testCase);
  }

  await openViewer(page, id);

  const textTag = TARGET_TYPES.text.tag;
  for (const type of types) {
    const tag = TARGET_TYPES[type].tag;
    const expectedVisible = 1 + (tag === textTag ? 1 : 0); // one shown target + the text source
    await expect(
      page.locator(`${tag}:visible`),
      `${type}: exactly the shown instance should be visible (hidden one must collapse/remove)`,
    ).toHaveCount(expectedVisible, { timeout: 30_000 });
  }
}

export async function runSingleTypeVisibility(
  page: Page,
  title: string,
  type: TargetType,
  visible: boolean,
): Promise<void> {
  await login(page);
  const id = await createBlankForm(page, `${title} ${Date.now()}`);
  await acceptRgpdIfVisible(page);

  const nextIndex = indexer();
  await addSourceField(page, nextIndex(SEL.textComponent), 'inputAlpha', 'Alpha');
  await addTarget(page, {
    id: `${type}${visible ? 'Vis' : 'Hid'}`,
    type,
    condition: { field: 'inputAlpha', operator: 'equals', value: visible ? 'Alpha' : 'Nope' },
    visible,
  });

  await openViewer(page, id);

  const tag = TARGET_TYPES[type].tag;
  await expect(
    page.locator(`${tag}:visible`),
    `${type}: single ${visible ? 'shown' : 'hidden'} instance should ${visible ? 'be visible' : 'collapse/remove'}`,
  ).toHaveCount(visible ? 1 : 0, { timeout: 30_000 });
}
