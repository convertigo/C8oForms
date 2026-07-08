import { expect, test } from './fixtures';
import { SEL, createFormWithMap, login, openComponentConfig, openMapDataSourcePicker } from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1342
 * "Map component: From a data source button does not open the source selection panel".
 *
 * Found in 2.2.0-beta138 and fixed by 703b2f89, first released and validated
 * OK in 2.2.0-beta142.
 *
 * The current Map editor exposes four source sub-categories: Markers/Repères,
 * Circles/Cercles, Polygons/Polygones, and Default location/Emplacement par
 * défaut. The regression path is to open Source selection, keep the default
 * Markers/Repères sub-category, switch it to Data source, then click the
 * dedicated source picker button.
 *
 * The form fixture is built entirely through Studio UI: blank form, Map
 * component, configuration panel, Source selection, then the Markers data-source
 * choice and source picker button.
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
