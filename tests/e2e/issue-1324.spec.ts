import { expect, test, type Page } from './fixtures';
import { PALETTE_ICON, SEL, addComponent, createBlankForm, login } from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1324
 * "Chart component shows undefined on hover for default values".
 *
 * Found in 2.2.0-beta124. Fixed by bf4a09f3, first released in
 * 2.2.0-beta151 and validated OK in 2.2.0-beta155.
 *
 * Root cause: the Chart editor placeholder rendered 12 sample values but only
 * three fallback labels, so later sample points could resolve to "undefined"
 * in ApexCharts hover/display logic. The fix routes placeholder series through
 * getChartSeries() and provides matching fallback labels.
 *
 * The form fixture is built entirely through Studio UI: blank form, Chart
 * component, then editor-mode hover on the placeholder chart.
 */

test.setTimeout(120_000);

const EXPECTED_PLACEHOLDER_LABELS = [
  'Label1',
  'Label2',
  'Label3',
  'Label4',
  'Label5',
  'Label6',
  'Label7',
  'Label8',
  'Label9',
  'Label10',
  'Label11',
  'Label12',
];

test('#1324 - Chart placeholder labels cover every default value in Edition mode', async ({ page }) => {
  await test.step('Create a blank form with a Chart component', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1324 chart tooltip ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.chart);
    await expect(page.locator(SEL.chartComponent).first(), 'Chart component should be added to the editor canvas').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Assert Chart placeholder labels cover all sample values', async () => {
    const labels = await chartPlaceholderXAxisLabels(page);
    expect(labels, `Chart placeholder labels should not contain undefined: ${JSON.stringify(labels)}`).not.toContain('undefined');
    expect(labels, `Chart placeholder should render one fallback label for each of its 12 sample values`).toEqual(
      EXPECTED_PLACEHOLDER_LABELS,
    );
  });
});

async function chartPlaceholderXAxisLabels(page: Page): Promise<string[]> {
  const chart = page.locator(SEL.chartComponent).first();
  await expect(chart, 'Chart component should be visible before reading its placeholder labels').toBeVisible({ timeout: 30_000 });
  await expect(chart.locator('.apexcharts-canvas').first(), 'ApexCharts canvas should be rendered').toBeVisible({ timeout: 30_000 });

  let labels: string[] = [];
  await expect
    .poll(async () => {
      labels = await readChartXAxisLabels(page);
      return labels;
    }, {
      message: 'Chart placeholder should render all fallback x-axis labels',
      timeout: 30_000,
    })
    .toEqual(EXPECTED_PLACEHOLDER_LABELS);

  return labels;
}

async function readChartXAxisLabels(page: Page): Promise<string[]> {
  return page.locator(`${SEL.chartComponent} .apexcharts-canvas`).first().evaluate((root) =>
    Array.from(root.querySelectorAll('.apexcharts-xaxis-label'))
      .map((el) => {
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        const half = text.slice(0, text.length / 2);
        return text.length % 2 === 0 && half === text.slice(text.length / 2) ? half : text;
      })
      .filter(Boolean),
  );
}
