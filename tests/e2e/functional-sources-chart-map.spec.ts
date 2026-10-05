import { expect, test } from './fixtures';
import {
  assertChartLoadingStateThroughUi,
  configureChartBaserowTableAndAssertPersistenceThroughUi,
  configureMapBaserowTableAndAssertPersistenceThroughUi,
  exerciseChartSourceTypeAndHeightThroughUi,
  exerciseMapBaserowMarkersThroughUi,
} from './helpers/functional-sources';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  filterComponentPaletteByIcon,
  openComponentConfig,
  openConfigTabById,
  reloadStudioWithLanguage,
} from './helpers/studio';

// Chart and Map part of the sources contract (see functional-sources-grid.spec.ts).
test.describe('No-Code Studio functional sources contract - Chart and Map', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  /**
   * #1433: the Chart filter model request must expose every source column,
   * including columns that are not assigned to the visible category/value roles.
   */
  test('SRC-004 #1433 - configure Chart from Baserow and filter on non-rendered columns', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureChartBaserowTableAndAssertPersistenceThroughUi(page);
  });

  test('CMP-CHART-001 - Chart source roles, type, and height', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseChartSourceTypeAndHeightThroughUi(page);
  });

  /** #1450: fixed by 914eb93e in beta265 and historically QA-validated in beta294. */
  test('CMP-CHART-002 #1450 - sourced Chart shows loading feedback without demo labels', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertChartLoadingStateThroughUi(page);
  });

  /**
   * #1341: reported in beta138. Commit d0483a6e added the missing Spanish and
   * Italian Chart palette strings plus localized type labels in beta143;
   * b1cbb302 corrected the descriptions in beta146. QA historically validated
   * the complete result in beta147.
   */
  test('CMP-CHART-001 #1341 - Chart palette and type options are translated in Spanish', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    const originalLanguage = await page.evaluate(() => window.localStorage.getItem('lang'));

    try {
      await reloadStudioWithLanguage(page, 'es');
      await createBlankApplicationThroughUi(page);

      const tile = await filterComponentPaletteByIcon(page, PALETTE_ICON.chart);
      await expect(tile, 'Spanish Chart palette tile should use its localized name').toContainText('Gráfico');
      const translationsResponse = await page.request.get('assets/i18n/es.json');
      expect(translationsResponse.ok(), 'served Spanish catalog should be available').toBe(true);
      const translations = (await translationsResponse.json()) as Record<string, string>;
      expect(translations.forms_chart_desc, 'served Chart palette description should be translated').toBe(
        'Este componente permite mostrar datos en un gráfico.',
      );

      await addComponent(page, PALETTE_ICON.chart, { allowEditorApiFallback: false });
      await expect(page.locator(`${SEL.chartComponent}:visible`).first(), 'Chart component should be added through Studio').toBeVisible({
        timeout: 30_000,
      });
      await openComponentConfig(page, SEL.chartComponent);
      await openConfigTabById(page, 'data_interactions');

      const labels = await page
        .locator('.class1776605300004:visible button.c8o-btn:visible')
        .allTextContents()
        .then((values) => values.map((value) => value.replace(/\s+/g, ' ').trim()));
      expect(labels, 'all five Chart type options should use Spanish translations').toEqual([
        'Área',
        'Barra',
        'Tarta',
        'Línea',
        'Rosquilla',
      ]);
    } finally {
      await page.evaluate((value) => {
        if (value === null) window.localStorage.removeItem('lang');
        else window.localStorage.setItem('lang', value);
      }, originalLanguage);
    }
  });

  // #1437: this journey uses the dedicated Source Selection and Source Configuration tabs.
  test('SRC-005 #1437 - configure Map from Baserow through split source tabs', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureMapBaserowTableAndAssertPersistenceThroughUi(page);
  });

  test('CMP-MAP-002 - Map Baserow roles and visible markers', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseMapBaserowMarkersThroughUi(page);
  });
});
