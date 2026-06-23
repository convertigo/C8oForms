import { test, expect } from './fixtures';
import {
  SEL,
  PALETTE_ICON,
  type ChoiceViewerKind,
  login,
  createBlankForm,
  addComponent,
  openComponentConfigAt,
  closeComponentConfig,
  setTechnicalId,
  setChoiceLocalOptions,
  setChoiceDefaultValueVisual,
  setChoiceDefaultValueText,
  setChoiceDefaultValueFromSourcePalette,
  setChoiceDefaultValueJavascript,
  createTextBusinessLogicFormula,
  openPreview,
  choiceViewerValue,
  recordToasts,
  recordedToasts,
} from './helpers/studio';

const OPTIONS = ['Alpha', 'Beta', 'Gamma'];
const FORMULA_TECHNICAL_ID = 'formula_alpha_1109';

type DefaultMode = 'visual' | 'text' | 'js';

interface ChoiceDefaultCase {
  kind: ChoiceViewerKind;
  mode: DefaultMode;
  technicalId: string;
  icon: string;
  tag: string;
  expected: string | string[];
  textValue?: string;
  jsEmptyReturn?: string;
  jsReturn?: string;
}

const CASES: ChoiceDefaultCase[] = [
  {
    kind: 'select',
    mode: 'visual',
    technicalId: 'select_visual_1109',
    icon: PALETTE_ICON.select,
    tag: SEL.selectComponent,
    expected: 'Alpha',
  },
  {
    kind: 'select',
    mode: 'text',
    technicalId: 'select_text_1109',
    icon: PALETTE_ICON.select,
    tag: SEL.selectComponent,
    expected: 'Beta',
    textValue: 'Beta',
  },
  {
    kind: 'select',
    mode: 'js',
    technicalId: 'select_js_1109',
    icon: PALETTE_ICON.select,
    tag: SEL.selectComponent,
    expected: 'Gamma',
    jsEmptyReturn: "''",
    jsReturn: "'Gamma'",
  },
  {
    kind: 'radio',
    mode: 'visual',
    technicalId: 'radio_visual_1109',
    icon: PALETTE_ICON.radio,
    tag: SEL.radioComponent,
    expected: 'Alpha',
  },
  {
    kind: 'radio',
    mode: 'text',
    technicalId: 'radio_text_1109',
    icon: PALETTE_ICON.radio,
    tag: SEL.radioComponent,
    expected: 'Beta',
    textValue: 'Beta',
  },
  {
    kind: 'radio',
    mode: 'js',
    technicalId: 'radio_js_1109',
    icon: PALETTE_ICON.radio,
    tag: SEL.radioComponent,
    expected: 'Gamma',
    jsEmptyReturn: "''",
    jsReturn: "'Gamma'",
  },
  {
    kind: 'checkbox',
    mode: 'visual',
    technicalId: 'checkbox_visual_1109',
    icon: PALETTE_ICON.checkbox,
    tag: SEL.checkboxComponent,
    expected: ['Alpha', 'Gamma'],
  },
  {
    kind: 'checkbox',
    mode: 'text',
    technicalId: 'checkbox_text_1109',
    icon: PALETTE_ICON.checkbox,
    tag: SEL.checkboxComponent,
    expected: ['Beta', 'Gamma'],
    textValue: '["Beta","Gamma"]',
  },
  {
    kind: 'checkbox',
    mode: 'js',
    technicalId: 'checkbox_js_1109',
    icon: PALETTE_ICON.checkbox,
    tag: SEL.checkboxComponent,
    expected: ['Alpha', 'Beta'],
    jsEmptyReturn: '[]',
    jsReturn: '["Alpha","Beta"]',
  },
];

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1109
 * "Select / radio / checkbox component: Make default value sourceable"
 *
 * Characterized red before the #1109 implementation line (2.2.0-beta195) and
 * validated green on 2.2.0-beta235. The core fix 9edfcbe4 (first released in
 * 2.2.0-beta196) added the shared DefaultValueEditorWithPalette flow and viewer
 * default computation for Select, Radio, and Checkbox; follow-ups ef75244e and
 * ffee8cfe added header/default value affordances and the expected-format help
 * for Aa/JS modes.
 *
 * The fixture is authored through Studio UI only: create a blank form, add each
 * component from the palette, configure local options and Default Value modes
 * in the component panels, then assert the rendered viewer state.
 */
test.setTimeout(360_000);

test('#1109 - Select, Radio and Checkbox apply visual, text and JavaScript default values', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1109 defaults ${Date.now()}`);

  const indexByKind: Record<ChoiceViewerKind, number> = {
    select: 0,
    radio: 0,
    checkbox: 0,
  };

  for (const scenario of CASES) {
    const componentIndex = indexByKind[scenario.kind];
    await addComponent(page, scenario.icon);
    await expect(page.locator(scenario.tag), `${scenario.technicalId} should be added`).toHaveCount(componentIndex + 1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, scenario.tag, componentIndex);
    await setTechnicalId(page, scenario.technicalId);
    await setChoiceLocalOptions(page, OPTIONS);

    if (scenario.mode === 'visual') {
      await setChoiceDefaultValueVisual(page, Array.isArray(scenario.expected) ? scenario.expected : [scenario.expected]);
    } else if (scenario.mode === 'text') {
      await setChoiceDefaultValueText(page, scenario.textValue ?? String(scenario.expected));
    } else {
      await setChoiceDefaultValueJavascript(page, scenario.jsEmptyReturn ?? "''", scenario.jsReturn ?? String(scenario.expected));
    }

    await closeComponentConfig(page);
    indexByKind[scenario.kind] += 1;
  }

  await openPreview(page, SEL.selectComponent);
  await expect(page.locator(SEL.selectComponent), 'viewer should render the three Select components').toHaveCount(3, {
    timeout: 30_000,
  });
  await expect(page.locator(SEL.radioComponent), 'viewer should render the three Radio components').toHaveCount(3, {
    timeout: 30_000,
  });
  await expect(page.locator(SEL.checkboxComponent), 'viewer should render the three Checkbox components').toHaveCount(3, {
    timeout: 30_000,
  });

  const viewerIndexByKind: Record<ChoiceViewerKind, number> = {
    select: 0,
    radio: 0,
    checkbox: 0,
  };

  for (const scenario of CASES) {
    const viewerIndex = viewerIndexByKind[scenario.kind];
    await expect
      .poll(() => choiceViewerValue(page, scenario.kind, viewerIndex), {
        message: `${scenario.technicalId} should render default value ${JSON.stringify(scenario.expected)}`,
        timeout: 30_000,
      })
      .toEqual(scenario.expected);
    viewerIndexByKind[scenario.kind] += 1;
  }
});

/**
 * Open bug characterization for https://github.com/convertigo/C8oForms/issues/1422
 * "Default value in Text mode shows Unexpected token '??' after dragging a Palette source"
 *
 * Found in 2.2.0-beta235 and reproduced red on 2.2.0-beta236. This covers the
 * missing #1109 use case where Aa/text mode receives a Formula source from the
 * Source Palette. The viewer can still render the returned value, but the
 * generated expression also raises the parsing toast "Unexpected token '??'".
 *
 * The fixture is authored through Studio UI only: create a blank form, add a
 * Formula from the component palette, configure it from Workflows, add a Select,
 * configure local options, drag the Formula source into the Select Default Value
 * Aa editor, then open the viewer.
 */
test('#1109 #1422 - Select text default value accepts a Source Palette formula', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1109 formula source ${Date.now()}`);
  await createTextBusinessLogicFormula(page, FORMULA_TECHNICAL_ID, 'Alpha');

  await addComponent(page, PALETTE_ICON.select);
  await expect(page.locator(SEL.selectComponent), 'select_text_formula_1109 should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfigAt(page, SEL.selectComponent, 0);
  await setTechnicalId(page, 'select_text_formula_1109');
  await setChoiceLocalOptions(page, OPTIONS);
  await setChoiceDefaultValueFromSourcePalette(page, 'formulas', FORMULA_TECHNICAL_ID);
  await closeComponentConfig(page);

  await recordToasts(page);
  await openPreview(page, SEL.selectComponent);
  await expect
    .poll(() => choiceViewerValue(page, 'select', 0), {
      message: 'select_text_formula_1109 should render the value returned by formula_alpha_1109',
      timeout: 30_000,
    })
    .toBe('Alpha');
  await page.waitForTimeout(3_000);
  expect(
    await recordedToasts(page),
    'preview should not raise the #1422 parsing toast for a Source Palette formula in Aa mode',
  ).not.toContain("Unexpected token '??'");
});
