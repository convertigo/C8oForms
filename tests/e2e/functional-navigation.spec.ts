import { test } from '@playwright/test';
import {
  navigateConditionallyByCheckboxValueThroughUi,
  navigateConditionallyByRadioValueThroughUi,
  navigateConditionallyBySelectValueThroughUi,
  navigateToRenamedPageThroughConditionalRadioThroughUi,
  navigateToSecondPageThroughViewerNextButton,
} from './helpers/functional-navigation';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional navigation contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('NAV-001 - simple viewer navigation to another page', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateToSecondPageThroughViewerNextButton(page);
  });

  test('NAV-002 - conditional navigation by Radio value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateConditionallyByRadioValueThroughUi(page);
  });

  test('NAV-002 - conditional navigation by Select value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateConditionallyBySelectValueThroughUi(page);
  });

  test('NAV-002 - conditional navigation by Checkbox value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateConditionallyByCheckboxValueThroughUi(page);
  });

  test('NAV-003 - navigation target remains correct after page rename', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateToRenamedPageThroughConditionalRadioThroughUi(page);
  });
});
