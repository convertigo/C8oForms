import { expect, test } from './fixtures';
import {
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

  test('SRC-004 - configure Chart from Baserow', async ({ page }) => {
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
      await expect(tile, 'Spanish Chart palette tile should use its corrected localized description').toContainText(
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

  test('SRC-005 - configure Map from Baserow', async ({ page }) => {
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
