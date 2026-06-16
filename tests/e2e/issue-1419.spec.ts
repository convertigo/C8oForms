import { expect, test, type Page } from '@playwright/test';
import {
  acceptRgpdIfVisible,
  configureVisibilityEqualsField,
  createFormDocument,
  createFormWithCheckboxAndDescription,
  expectVisibilityValueTextEditorToContain,
  fillVisibilityTagValue,
  fillVisibilityValueTextEditor,
  login,
  openComponentVisibilityConfig,
  openViewer,
  reopenEditorFromHome,
  visibilityValueChip,
} from './helpers/studio';
import type { FormElement } from './helpers/studio';

const CHECKBOX_ID = 'checkbox1';
const DESCRIPTION_ID = 'desc1';
const OPTION = 'Oui';
const TEXT_ALPHA_ID = 1781622253016;
const TEXT_BRAVO_ID = 1781622253017;
const TEXT_NINE_ID = 1781622253018;
const CHECKBOX_SOURCE_ID = 1781604101897;
let nextFixtureId = 1781622260000;

/**
 * Open bug test for https://github.com/convertigo/C8oForms/issues/1419
 * "Visibility: single checkbox equality value is edited as chips and lost after reopening"
 *
 * Broken version: 2.2.0-beta228. Status: open bug, no #1419 fix commit found.
 * Observed mechanism: selecting a single Checkbox as the left side of a
 * Visibility equality condition renders the right side as a tag-input/chip
 * editor; the chip is visible before leaving, but the saved condition loses the
 * value and reopening the editor shows an empty value.
 *
 * The fixture is built through the Studio UI only: create a blank form, add a
 * Checkbox and Description, set their technical ids, and configure the checkbox
 * option through the component configuration panel.
 */
test('#1419 - checkbox equality visibility value uses the text editor and persists after reopening', async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  const title = `Visibility checkbox chips ${Date.now()}`;
  await createFormWithCheckboxAndDescription(page, {
    title,
    checkboxTechnicalId: CHECKBOX_ID,
    descriptionTechnicalId: DESCRIPTION_ID,
    checkboxOptions: [OPTION],
  });
  await acceptRgpdIfVisible(page);

  await openComponentVisibilityConfig(page, DESCRIPTION_ID);
  await configureVisibilityEqualsField(page, CHECKBOX_ID);
  await expect
    .soft(
      page.locator('tag-input'),
      'checkbox equality value editor should not use the chip/tag input; it should use the same text editor as Select visibility',
    )
    .toHaveCount(0, { timeout: 1_000 });

  const brokenChipEditor = await page.locator('tag-input').first().isVisible().catch(() => false);
  if (brokenChipEditor) {
    await fillVisibilityTagValue(page, OPTION);
    await expect(visibilityValueChip(page, OPTION), 'the broken value chip should be visible before leaving the editor').toBeVisible({
      timeout: 10_000,
    });
  } else {
    await fillVisibilityValueTextEditor(page, OPTION);
    await expectVisibilityValueTextEditorToContain(page, OPTION);
  }

  await reopenEditorFromHome(page, title);
  await openComponentVisibilityConfig(page, DESCRIPTION_ID);

  if (brokenChipEditor) {
    await expect(
      visibilityValueChip(page, OPTION),
      'the checkbox value chip should still be visible after returning Home and reopening the editor',
    ).toBeVisible({ timeout: 10_000 });
  } else {
    await expectVisibilityValueTextEditorToContain(page, OPTION);
  }
});

/**
 * Runtime guard for the same #1419 family.
 *
 * The UI-authored test above proves the editor persists a single-checkbox
 * equality value. This controlled viewer fixture exercises the broader runtime
 * surface: every supported simple/multiple visibility operator, literal values,
 * JavaScript-mode values, and Source Palette input-text tokens wrapped in the
 * HTML payload produced by drag/drop. It also verifies that visibility is
 * applied to non-Description field components.
 */
test('#1419 - visibility operators resolve literal, JavaScript, and dropped input-text values in viewer', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await login(page);
  const alphaToken = sourceToken(TEXT_ALPHA_ID);
  const bravoToken = sourceToken(TEXT_BRAVO_ID);
  const nineToken = sourceToken(TEXT_NINE_ID);
  const wrappedAlphaToken = wrappedSourceToken(alphaToken);
  const wrappedBravoToken = wrappedSourceToken(bravoToken);
  const wrappedNineToken = wrappedSourceToken(nineToken);

  const visibleCases: VisibilityCase[] = [
    {
      label: 'OP_EQUALS_LITERAL_VISIBLE',
      condition: simpleCondition('inputAlpha', 'equals', literalText('Alpha')),
    },
    {
      label: 'OP_EQUALS_JS_VISIBLE',
      condition: simpleCondition('inputAlpha', 'equals', jsValue('"Alpha"')),
    },
    {
      label: 'OP_DIFFERENT_VISIBLE',
      condition: simpleCondition('inputAlpha', 'different', literalText('Bravo')),
    },
    {
      label: 'OP_GREATER_VISIBLE',
      condition: simpleCondition('inputNumber', 'greater', literalText('3')),
    },
    {
      label: 'OP_GREATEREQUALS_JS_VISIBLE',
      condition: simpleCondition('inputNumber', 'greaterequals', jsValue('"5"')),
    },
    {
      label: 'OP_MINUS_INPUT_VISIBLE',
      condition: simpleCondition('inputNumber', 'minus', literalText(wrappedNineToken)),
    },
    {
      label: 'OP_MINUSEQUALS_VISIBLE',
      condition: simpleCondition('inputNumber', 'minusequals', literalText('5')),
    },
    {
      label: 'OP_CONTAINS_VISIBLE',
      condition: simpleCondition('inputAlpha', 'contains', literalText('lph')),
    },
    {
      label: 'OP_NOT_CONTAINS_VISIBLE',
      condition: simpleCondition('inputAlpha', 'not_contains', literalText('zzz')),
    },
    {
      label: 'OP_IS_FILLED_VISIBLE',
      condition: simpleCondition('inputAlpha', 'is_filled'),
    },
    {
      label: 'OP_IS_EMPTY_VISIBLE',
      condition: simpleCondition('inputEmpty', 'is_empty'),
    },
    {
      label: 'OP_MULTI_EQUALS_ORDER_VISIBLE',
      condition: checkboxCondition('equals', literalMultiple(['Beta', 'Alpha'])),
    },
    {
      label: 'OP_MULTI_DIFFERENT_VISIBLE',
      condition: checkboxCondition('different', literalMultiple(['Alpha'])),
    },
    {
      label: 'OP_MULTI_AMONG_DROPPED_INPUT_VISIBLE',
      condition: checkboxCondition('among_following', literalMultiple([wrappedAlphaToken, 'Gamma'])),
    },
    {
      label: 'OP_MULTI_AMONG_JS_ARRAY_VISIBLE',
      condition: checkboxCondition('among_following', jsValue('["Beta", "Delta"]')),
    },
    {
      label: 'OP_MULTI_OUT_DROPPED_INPUT_VISIBLE',
      condition: checkboxCondition('out_following', literalMultiple([wrappedBravoToken, 'Gamma'])),
    },
  ];

  const hiddenCases: VisibilityCase[] = [
    {
      label: 'OP_EQUALS_LITERAL_HIDDEN',
      condition: simpleCondition('inputAlpha', 'equals', literalText('Nope')),
    },
    {
      label: 'OP_MULTI_AMONG_DROPPED_INPUT_HIDDEN',
      condition: checkboxCondition('among_following', literalMultiple([wrappedBravoToken, 'Gamma'])),
    },
    {
      label: 'OP_MULTI_OUT_JS_ARRAY_HIDDEN',
      condition: checkboxCondition('out_following', jsValue('["Beta", "Delta"]')),
    },
  ];

  const fieldTypes: TargetFieldType[] = ['description', 'text', 'checkbox', 'select', 'radio', 'slider', 'datetime'];
  const targetFields = fieldTypes.flatMap((type) => [
    targetField(
      type,
      `visible_${type}`,
      `VISIBLE_${type.toUpperCase()}_TARGET`,
      simpleCondition('inputAlpha', 'equals', literalText('Alpha')),
    ),
    targetField(
      type,
      `hidden_${type}`,
      `HIDDEN_${type.toUpperCase()}_TARGET`,
      simpleCondition('inputAlpha', 'equals', literalText('Nope')),
    ),
  ]);

  const created = await createFormDocument(page, `Issue 1419 operator matrix ${Date.now()}`, [
    jsTextElement('inputAlpha', TEXT_ALPHA_ID, 'Alpha'),
    jsTextElement('inputBravo', TEXT_BRAVO_ID, 'Bravo'),
    jsTextElement('inputNine', TEXT_NINE_ID, '9'),
    jsTextElement('inputNumber', 1781622253019, '5'),
    plainTextElement('inputEmpty', 1781622253020),
    checkboxSourceElement(),
    ...visibleCases.map((testCase, index) =>
      targetDescription(`visible_case_${index}`, testCase.label, testCase.condition),
    ),
    ...hiddenCases.map((testCase, index) =>
      targetDescription(`hidden_case_${index}`, testCase.label, testCase.condition),
    ),
    ...targetFields,
  ]);

  await openViewer(page, created.id);
  await page.locator('page-viewerpage').waitFor({ state: 'attached', timeout: 30_000 });

  for (const testCase of visibleCases) {
    await expectLabelVisible(page, testCase.label);
  }
  for (const testCase of hiddenCases) {
    await expectLabelHidden(page, testCase.label);
  }

  for (const type of fieldTypes) {
    await expectLabelVisible(page, `VISIBLE_${type.toUpperCase()}_TARGET`);
    await expectLabelHidden(page, `HIDDEN_${type.toUpperCase()}_TARGET`);
  }
});

type TargetFieldType = 'description' | 'text' | 'checkbox' | 'select' | 'radio' | 'slider' | 'datetime';

interface VisibilityCase {
  label: string;
  condition: Record<string, unknown>;
}

function conditions(condition: Record<string, unknown>) {
  return {
    visibleIf: {
      type: 'visibleIf',
      condVisible: 'and',
      conds: [condition],
      groups: [],
    },
    goToPageIf: {
      type: 'goToPageIf',
      condVisible: 'or',
      conds: [],
      groups: [],
    },
  };
}

function simpleCondition(fieldName: string, operator: string, val2 = literalText('')) {
  return {
    type: 'visibleIf',
    subject: 'field',
    operator,
    val1: {
      str: fieldName,
      source: true,
      type: 'text',
      arr: [],
    },
    val2,
  };
}

function checkboxCondition(operator: string, val2: Record<string, unknown>) {
  return {
    type: 'visibleIf',
    subject: 'field',
    operator,
    val1: {
      name: CHECKBOX_ID,
      displayName: CHECKBOX_ID,
      str: CHECKBOX_SOURCE_ID,
      source: true,
      type: 'checkbox',
      arr: [],
    },
    val2,
  };
}

function literalText(value: string) {
  return {
    str: value,
    source: false,
    type: 'text',
    arr: [],
  };
}

function literalMultiple(values: string[]) {
  return {
    str: '',
    source: false,
    type: 'text',
    arr: values.map((value) => ({ value, display: displayForValue(value) })),
  };
}

function jsValue(expression: string) {
  return {
    str: `(async () => { return ${expression}; })();`,
    source: false,
    type: 'ts',
    arr: [],
  };
}

function sourceToken(id: number) {
  return `$$START${id}${JSON.stringify({
    c8otype: 'path',
    c8opath: '',
    c8oPrettyPath: null,
    c8obuiltin: null,
    fakeId: '${uniqueId}',
    c8oName: null,
  })}END${id}$$`;
}

function wrappedSourceToken(token: string) {
  return `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><span>${token}</span>`;
}

function displayForValue(value: string) {
  const tokenId = value.match(/\$\$(?:START)?(\d+)/)?.[1];
  if (tokenId === String(TEXT_ALPHA_ID)) return 'inputAlpha';
  if (tokenId === String(TEXT_BRAVO_ID)) return 'inputBravo';
  if (tokenId === String(TEXT_NINE_ID)) return 'inputNine';
  return value;
}

function nextId() {
  return nextFixtureId++;
}

function jsTextElement(name: string, id: number, value: string): FormElement {
  return {
    ...plainTextElement(name, id),
    sources: {
      self: {
        enabled: true,
        vars: {
          selfVar: {
            str: `(async () => { return ${JSON.stringify(value)}; })();`,
            type: 'ts',
            html: false,
          },
        },
      },
    },
  };
}

function plainTextElement(name: string, id: number): FormElement {
  return {
    id,
    type: 'text',
    name,
    config: {
      mandatory: false,
      placeholder: 'Votre reponse',
      type: 'text',
      clearInput: false,
      short: true,
      disabled: false,
      label: name,
      html: `<p>${name}</p>`,
      personalized: true,
    },
  };
}

function checkboxSourceElement(): FormElement {
  return {
    id: CHECKBOX_SOURCE_ID,
    type: 'checkbox',
    name: CHECKBOX_ID,
    children: [
      { value: 'Alpha', selected: true, label_color: '#202124', position: 'unset', id: '1419-alpha' },
      { value: 'Beta', selected: true, label_color: '#202124', position: 'unset', id: '1419-beta' },
      { value: 'Bravo', selected: false, label_color: '#202124', position: 'unset', id: '1419-bravo' },
    ],
    config: {
      mandatory: false,
      checked: false,
      disabled: false,
      html: '<p>checkbox1</p>',
      personalized: true,
    },
  };
}

function targetDescription(name: string, label: string, condition: Record<string, unknown>): FormElement {
  return {
    id: nextId(),
    type: 'description',
    name,
    config: {
      html: `<p>${label}</p>`,
      personalized: true,
    },
    conditions: conditions(condition),
  };
}

function targetField(type: TargetFieldType, name: string, label: string, condition: Record<string, unknown>): FormElement {
  const base = {
    id: nextId(),
    type,
    name,
    conditions: conditions(condition),
  };
  const config = {
    mandatory: false,
    disabled: false,
    html: `<p>${label}</p>`,
    personalized: true,
  };

  switch (type) {
    case 'description':
      return { ...base, config };
    case 'text':
      return {
        ...base,
        config: { ...config, placeholder: 'Votre reponse', type: 'text', clearInput: false, short: true },
      };
    case 'checkbox':
      return {
        ...base,
        children: [
          { value: 'Option', selected: false, label_color: '#202124', position: 'unset', id: `${name}-option` },
        ],
        config: { ...config, checked: false },
      };
    case 'select':
      return {
        ...base,
        children: [
          { value: 'Option', selected: false, label_color: '#202124', position: 'unset', id: `${name}-option` },
        ],
        config: { ...config, sourceEnabled: false, type: 'popover', placeholder: 'Choisir une reponse' },
      };
    case 'radio':
      return {
        ...base,
        children: [
          { value: 'Option', selected: false, label_color: '#202124', position: 'unset', id: `${name}-option` },
        ],
        config: { ...config, defaultValue: '' },
      };
    case 'slider':
      return {
        ...base,
        config: { ...config, min: 0, max: 10, step: 1, debounce: 0, pin: false, snaps: false, defaultvalue: 0 },
      };
    case 'datetime':
      return {
        ...base,
        config: { ...config, display_format: 'YYYY/MM/DD', defaultValue: '' },
      };
  }
}

async function expectLabelVisible(page: Page, label: string) {
  await expect(page.getByText(label, { exact: true }).first(), `${label} should be visible`).toBeVisible({
    timeout: 30_000,
  });
}

async function expectLabelHidden(page: Page, label: string) {
  await expect(page.getByText(label, { exact: true }).first(), `${label} should be hidden`).toBeHidden({
    timeout: 30_000,
  });
}
