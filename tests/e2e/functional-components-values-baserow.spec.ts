import { test } from './fixtures';
import {
  exerciseCheckboxBaserowSourceConfigurationThroughUi,
  exerciseCheckboxBaserowSourceThroughUi,
  exerciseCheckboxGroupBaserowSingleAxisRolesThroughUi,
} from './helpers/functional-components-values';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional Baserow component values', () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  // #1257: datasource-backed Checkbox items and their Display/Value mapping must persist.
  test('CMP-CHECK-002 - Checkbox Baserow source configuration persists', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxBaserowSourceConfigurationThroughUi(page);
  });

  test('CMP-CHECK-002 - Checkbox Baserow visible labels and multi-selection', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxBaserowSourceThroughUi(page);
  });

  /**
   * #1287: reported version absent (beta104 was current), fixed by bf8b61b6
   * in beta107 and historically validated in beta107.
   */
  test('CMP-CHECKGROUP-002 #1287 - Baserow row and column roles stay exclusive', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseCheckboxGroupBaserowSingleAxisRolesThroughUi(page);
  });
});
