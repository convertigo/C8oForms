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
  test('CMP-DESC-001 - Description rich text source palette and rendering', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseDescriptionRichTextAndSourcePaletteThroughUi(page);
  });
});
