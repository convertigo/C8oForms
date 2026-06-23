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
  setChoiceGroupDefaultValueVisual,
  setChoiceDefaultValueText,
  setChoiceDefaultValueJavascript,
  expectComponentHeaderDefaultValueIndicator,
  openPreview,
  choiceViewerValue,
} from './helpers/studio';

type GroupChoiceKind = Extract<ChoiceViewerKind, 'radioGroup' | 'checkboxGroup'>;
type GroupDefaultMode = 'visual' | 'text' | 'js';
type GroupExpected = Record<string, string | string[]>;

interface GroupDefaultCase {
  kind: GroupChoiceKind;
  mode: GroupDefaultMode;
  technicalId: string;
  icon: string;
  tag: string;
  expected: GroupExpected;
  textValue?: string;
  jsReturn?: string;
}

const CASES: GroupDefaultCase[] = [
  {
    kind: 'radioGroup',
    mode: 'visual',
    technicalId: 'radio_group_visual_1086',
    icon: PALETTE_ICON.radioGroup,
    tag: SEL.radioGroupComponent,
    expected: {
      'Line 1': 'Option 1',
      'Line 2': 'Option 2',
      'Line 3': '',
    },
  },
  {
    kind: 'radioGroup',
    mode: 'text',
    technicalId: 'radio_group_text_1086',
    icon: PALETTE_ICON.radioGroup,
    tag: SEL.radioGroupComponent,
    expected: {
      'Line 1': 'Option 2',
      'Line 2': 'Option 1',
      'Line 3': '',
    },
    textValue: '{"Line 1":"Option 2","Line 2":"Option 1"}',
  },
  {
    kind: 'radioGroup',
    mode: 'js',
    technicalId: 'radio_group_js_1086',
    icon: PALETTE_ICON.radioGroup,
    tag: SEL.radioGroupComponent,
    expected: {
      'Line 1': 'Option 1',
      'Line 2': 'Option 2',
      'Line 3': 'Option 1',
    },
    jsReturn: '{"Line 1":"Option 1","Line 2":"Option 2","Line 3":"Option 1"}',
  },
  {
    kind: 'checkboxGroup',
    mode: 'visual',
    technicalId: 'checkbox_group_visual_1086',
    icon: PALETTE_ICON.checkboxGroup,
    tag: SEL.checkboxGroupComponent,
    expected: {
      'Line 1': ['Option 1'],
      'Line 2': ['Option 2'],
      'Line 3': [],
    },
  },
  {
    kind: 'checkboxGroup',
    mode: 'text',
    technicalId: 'checkbox_group_text_1086',
    icon: PALETTE_ICON.checkboxGroup,
    tag: SEL.checkboxGroupComponent,
    expected: {
      'Line 1': ['Option 1', 'Option 2'],
      'Line 2': [],
      'Line 3': ['Option 2'],
    },
    textValue: '{"Line 1":["Option 1","Option 2"],"Line 3":["Option 2"]}',
  },
  {
    kind: 'checkboxGroup',
    mode: 'js',
    technicalId: 'checkbox_group_js_1086',
    icon: PALETTE_ICON.checkboxGroup,
    tag: SEL.checkboxGroupComponent,
    expected: {
      'Line 1': ['Option 2'],
      'Line 2': ['Option 1', 'Option 2'],
      'Line 3': [],
    },
    jsReturn: '{"Line 1":["Option 2"],"Line 2":["Option 1","Option 2"]}',
  },
];

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1086
 * "Have a default value for Radio Group and Check Group"
 *
 * The group default-value feature landed in the #1086/#1109 line, then a
 * follow-up in 2.2.0-beta233 fixed the missing configured-default indicator for
 * Radio Group and Checkbox Group when the Default Value was set in Aa/text mode
 * (commit eabc197f). Validated against the latest release line in this suite.
 *
 * The fixture is authored through Studio UI only: create a blank form, add the
 * Radio Group and Checkbox Group components from the palette, configure their
 * Default Value modes in the component panels, then assert both the editor card
 * indicator and the rendered viewer state.
 */
test.setTimeout(300_000);

test('#1086 - Radio Group and Checkbox Group apply visual, text and JavaScript default values', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1086 group defaults ${Date.now()}`);

  const indexByKind: Record<GroupChoiceKind, number> = {
    radioGroup: 0,
    checkboxGroup: 0,
  };

  for (const scenario of CASES) {
    const componentIndex = indexByKind[scenario.kind];
    await addComponent(page, scenario.icon);
    await expect(page.locator(scenario.tag), `${scenario.technicalId} should be added`).toHaveCount(componentIndex + 1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, scenario.tag, componentIndex);
    await setTechnicalId(page, scenario.technicalId);

    if (scenario.mode === 'visual') {
      await setChoiceGroupDefaultValueVisual(page, scenario.expected);
    } else if (scenario.mode === 'text') {
      await setChoiceDefaultValueText(page, scenario.textValue ?? JSON.stringify(scenario.expected));
    } else {
      await setChoiceDefaultValueJavascript(page, '{}', scenario.jsReturn ?? JSON.stringify(scenario.expected));
    }

    await closeComponentConfig(page);
    await expectComponentHeaderDefaultValueIndicator(page, scenario.tag, componentIndex, scenario.technicalId);
    indexByKind[scenario.kind] += 1;
  }

  await openPreview(page, SEL.radioGroupComponent);
  await expect(page.locator(SEL.radioGroupComponent), 'viewer should render the three Radio Group components').toHaveCount(3, {
    timeout: 30_000,
  });
  await expect(page.locator(SEL.checkboxGroupComponent), 'viewer should render the three Checkbox Group components').toHaveCount(3, {
    timeout: 30_000,
  });

  const viewerIndexByKind: Record<GroupChoiceKind, number> = {
    radioGroup: 0,
    checkboxGroup: 0,
  };

  for (const scenario of CASES) {
    const viewerIndex = viewerIndexByKind[scenario.kind];
    await expect
      .poll(() => choiceViewerValue(page, scenario.kind, viewerIndex), {
        message: `${scenario.technicalId} should render default values ${JSON.stringify(scenario.expected)}`,
        timeout: 30_000,
      })
      .toEqual(scenario.expected);
    viewerIndexByKind[scenario.kind] += 1;
  }
});
