import { test } from './fixtures';
import {
  SEL,
  PALETTE_ICON,
  addComponent,
  createBlankForm,
  expectFileComponentHasNoNavigationConfigTab,
  login,
  openComponentConfig,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1434
 * "Import file component displays an empty Navigation category".
 *
 * Broken version: 2.2.0-beta247.
 * Fixed version: 5c08041a first shipped in 2.2.0-beta248 and the ticket was
 * validated OK in that release.
 * Root cause: fileMainEditorConfigurationTabs still listed
 * navigation_tab_selector even though Import file has no navigation-related
 * properties, so the component configuration exposed an empty Navigation tab.
 * The fix removes navigation_tab_selector from the Import file configuration
 * tab list.
 *
 * The C8oForms fixture is built only through Studio UI: log in, create a blank
 * form, add the Import file component from the palette, and open its
 * configuration panel.
 */

test.setTimeout(180_000);

test('#1434 - Import file configuration does not expose an empty Navigation tab', async ({ page }) => {
  await test.step('login', async () => {
    await login(page);
  });

  await test.step('create a blank form', async () => {
    await createBlankForm(page, `Issue 1434 import file ${Date.now()}`);
  });

  await test.step('add an Import file component', async () => {
    await addComponent(page, PALETTE_ICON.file);
  });

  await test.step('open Import file configuration', async () => {
    await openComponentConfig(page, SEL.fileComponent);
  });

  await expectFileComponentHasNoNavigationConfigTab(page);
});
