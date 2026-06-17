import { expect, test, type Page } from '@playwright/test';
import {
  acceptRgpdIfVisible,
  addComponent,
  addVisibilityCondition,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfigAt,
  openConfigTab,
  openViewer,
  setCheckboxDefaultSelected,
  setCheckboxLocalOptions,
  setDescriptionText,
  setTechnicalId,
  setTextDefaultValueJavascript,
  PALETTE_ICON,
  SEL,
  type VisibilityConditionSpec,
} from './helpers/studio';

/**
 * Standalone (non-ticket) coverage test for component Visibility.
 *
 * It exercises two axes through the No Code Studio UI (no document writes) and
 * checks the result in the viewer, which renders every component with its
 * technical id as the element id — so a target's visibility is asserted by
 * `#<technicalId>` regardless of its type:
 *   - operator axis: every operator the condition UI exposes — equals, different,
 *     contains, not_contains, greater, greaterequals, minus, minusequals,
 *     is_filled, is_empty (text/numeric source), and among_following /
 *     out_following (checkbox source with a default-selected value);
 *   - target-type axis: every form/content palette component (text, checkbox and
 *     checkbox group, radio and radio grid, select, slider, date, time, camera,
 *     table/grid, chart, map, barcode, file import, signature, location, button,
 *     description) is shown and hidden by a simple condition. Layout containers
 *     (group, horizontal layout) are out of scope here — layout has #1363.
 *
 * Out of scope (not UI-authorable condition-value paths): JavaScript-mode values
 * and dropped Source Palette tokens.
 */

const TARGET_TYPES = {
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

type TargetType = keyof typeof TARGET_TYPES;

// Two batches keep each type test ~half the components (robust vs one mega-test).
const TYPE_BATCH_A: TargetType[] = [
  'text', 'checkbox', 'checkboxGroup', 'description', 'select', 'radio', 'radioGroup', 'slider', 'datetime', 'time',
];
const TYPE_BATCH_B: TargetType[] = [
  'camera', 'grid', 'chart', 'map', 'barcode', 'file', 'signature', 'location', 'button',
];

interface TargetCase {
  id: string;
  type: TargetType;
  condition: VisibilityConditionSpec;
  visible: boolean;
}

// Operator axis — text-input targets (asserted by element id), source fields
// inputAlpha='Alpha', inputNum='5'.
const OPERATOR_CASES: TargetCase[] = [
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
  // multiple operators against a checkbox source (cb1) with Alpha selected by default.
  { id: 'opAmongVis', type: 'description', condition: { field: 'cb1', operator: 'among_following', value: ['Alpha', 'Gamma'] }, visible: true },
  { id: 'opAmongHid', type: 'description', condition: { field: 'cb1', operator: 'among_following', value: ['Gamma', 'Delta'] }, visible: false },
  { id: 'opOutVis', type: 'description', condition: { field: 'cb1', operator: 'out_following', value: ['Gamma', 'Delta'] }, visible: true },
  { id: 'opOutHid', type: 'description', condition: { field: 'cb1', operator: 'out_following', value: ['Alpha', 'Gamma'] }, visible: false },
];

interface SourceSpec {
  kind: 'text' | 'checkbox';
  id: string;
  value?: string;
  options?: string[];
  defaultSelected?: number;
}

// The two axes are separate tests: each is hermetic, ~half the components, and
// they can run in parallel — far more robust than one ~30-component mega-test.
test('Visibility: every condition operator resolves in the viewer (UI-authored)', async ({ page }) => {
  test.setTimeout(450_000);
  await runVisibilityCases(
    page,
    'Visibility operators',
    [
      { kind: 'text', id: 'inputAlpha', value: 'Alpha' },
      { kind: 'text', id: 'inputNum', value: '5' },
      { kind: 'checkbox', id: 'cb1', options: ['Alpha', 'Beta', 'Bravo'], defaultSelected: 0 },
    ],
    OPERATOR_CASES,
  );
});

test('Visibility: applies to every target component type — batch A (UI-authored)', async ({ page }) => {
  test.setTimeout(450_000);
  await runTypeVisibility(page, 'Visibility types A', TYPE_BATCH_A);
});

test('Visibility: applies to every target component type — batch B (UI-authored)', async ({ page }) => {
  test.setTimeout(450_000);
  await runTypeVisibility(page, 'Visibility types B', TYPE_BATCH_B);
});

/**
 * For each type, add one target shown and one hidden by a simple condition, then
 * assert in the viewer that exactly the visible instances of that type's
 * component tag are visible. `tag:visible` is the uniform signal across the
 * heterogeneous viewer rendering: a hidden component is either removed (field
 * inputs) or collapsed to a zero box (button, grid, groups, ...), and `:visible`
 * excludes both — so a working type yields one visible instance and a leaked
 * (still-visible) hidden one fails the count.
 */
async function runTypeVisibility(page: Page, title: string, types: TargetType[]): Promise<void> {
  await login(page);
  const id = await createBlankForm(page, `${title} ${Date.now()}`);
  await acceptRgpdIfVisible(page);

  const indexByTag: Record<string, number> = {};
  const nextIndex = (tag: string): number => {
    const i = indexByTag[tag] ?? 0;
    indexByTag[tag] = i + 1;
    return i;
  };

  // One text source drives every condition.
  await addSourceField(page, nextIndex(SEL.textComponent), 'inputAlpha', 'Alpha');

  const cases: TargetCase[] = types.flatMap((type) => [
    { id: `${type}Vis`, type, condition: { field: 'inputAlpha', operator: 'equals', value: 'Alpha' }, visible: true },
    { id: `${type}Hid`, type, condition: { field: 'inputAlpha', operator: 'equals', value: 'Nope' }, visible: false },
  ]);
  for (const testCase of cases) {
    await addTarget(page, testCase, nextIndex(TARGET_TYPES[testCase.type].tag));
  }

  await openViewer(page, id);
  await page.locator('page-viewerpage').waitFor({ state: 'attached', timeout: 30_000 });

  const textTag = TARGET_TYPES.text.tag;
  for (const type of types) {
    const tag = TARGET_TYPES[type].tag;
    // one visible target per type, plus the text source which shares the text tag.
    const expectedVisible = 1 + (tag === textTag ? 1 : 0);
    await expect(
      page.locator(`${tag}:visible`),
      `${type}: exactly the shown instance should be visible (hidden one must collapse/remove)`,
    ).toHaveCount(expectedVisible, { timeout: 30_000 });
  }
}

async function runVisibilityCases(
  page: Page,
  title: string,
  sources: SourceSpec[],
  cases: TargetCase[],
): Promise<void> {
  await login(page);
  const id = await createBlankForm(page, `${title} ${Date.now()}`);
  await acceptRgpdIfVisible(page);

  // Per-editor-tag running index so each newly added component's config can be
  // opened by (tag, index) — text sources share the text tag with text targets.
  const indexByTag: Record<string, number> = {};
  const nextIndex = (tag: string): number => {
    const i = indexByTag[tag] ?? 0;
    indexByTag[tag] = i + 1;
    return i;
  };

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

  for (const testCase of cases) {
    await addTarget(page, testCase, nextIndex(TARGET_TYPES[testCase.type].tag));
  }

  await openViewer(page, id);
  await page.locator('page-viewerpage').waitFor({ state: 'attached', timeout: 30_000 });

  for (const testCase of cases) {
    // Field components render with their technical id as the element id; a
    // Description renders only its content, so locate it by that content text.
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

async function addTarget(page: Page, testCase: TargetCase, index: number): Promise<void> {
  const { icon, tag } = TARGET_TYPES[testCase.type];
  await addComponent(page, icon);
  await page.locator(`${tag}:visible`).nth(index).waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfigAt(page, tag, index);
  await setTechnicalId(page, testCase.id);
  // A Description has no technical-id element in the viewer, so stamp its content
  // with the id to locate it there.
  if (testCase.type === 'description') await setDescriptionText(page, testCase.id);
  await page.waitForTimeout(600); // let the config panel settle before tab navigation
  await openConfigTab(page, /Visibilit|Visibility/i);
  await addVisibilityCondition(page, testCase.condition);
  await closeComponentConfig(page);
}
