import { test } from './fixtures';
import {
  exerciseDescriptionRichTextAndSourcePaletteThroughUi,
  exerciseTextInputAdvancedDefaultValuesThroughUi,
  exerciseTextInputCoreBehaviorThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional text component values', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('CMP-TEXT-001 - Text input label placeholder required default input and submission', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTextInputCoreBehaviorThroughUi(page);
  });

  test('CMP-TEXT-002 - Text input advanced default values and source expressions', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseTextInputAdvancedDefaultValuesThroughUi(page);
  });

  // #1234/#1247/#1263: spacing and color controls remain usable in Question,
  // while the rich-text editor stays absent from unrelated configuration tabs.
  // #1377: Source Palette chips keep the same generated presentation between
  // the Aa configuration editor and the Studio canvas preview.
  // #1464 (reported in beta290): fix f8b9110e first shipped and was QA validated
  // in beta294. Large Description content keeps a bounded HugeRTE shell and an
  // independently scrollable editing document.
  // #1507 (reported in beta320): fix 9aa7681f first shipped in beta322 and was
  // QA validated in beta323. Moving a source chip inside the same HugeRTE moves
  // the existing chip instead of running the external-source insertion path a
  // second time. Current functional runtime validation remains pending.
  test('CMP-DESC-001 #1377 #1464 #1507 - Description rich text source palette and rendering', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDescriptionRichTextAndSourcePaletteThroughUi(page);
  });
});
