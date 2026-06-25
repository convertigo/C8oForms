import { expect, test } from './fixtures';
import { SEL, createFormWithMap, login, openComponentConfig, openMapDataSourcePicker } from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1342
 * "Map component: From a data source button does not open the source selection panel".
 *
 * Found in 2.2.0-beta138 and fixed by 703b2f89, first released and validated
 * OK in 2.2.0-beta142.
 *
 * Root cause: the shared datasource button row was only rendered for
 * tab_selector_choice_source. Map config uses tab_selector_conf_source for the
 * Markers/Circles/Polygons source settings, so switching a Map section to
 * "From a data source" left the user without a working source picker. The fix
 * added showSourceButtonInConfig for the Map editor.
 *
 * The form fixture is built entirely through Studio UI: blank form, Map
 * component, configuration panel, then the Map source-mode toggle.
 */

test.setTimeout(120_000);

test('#1342 - Map From a data source opens the source selection panel', async ({ page }) => {
  await test.step('Create a blank form with a Map component', async () => {
    await login(page);
    await createFormWithMap(page, {
      title: `Issue 1342 map source ${Date.now()}`,
      technicalId: 'map_source_1342',
    });
  });

  await test.step('Open the Map data source picker', async () => {
    await openComponentConfig(page, SEL.mapComponent);
    const sourcePicker = await openMapDataSourcePicker(page);
    await expect(sourcePicker, 'source selection panel should be visible after clicking the Map data source button').toBeVisible({
      timeout: 15_000,
    });
  });
});
