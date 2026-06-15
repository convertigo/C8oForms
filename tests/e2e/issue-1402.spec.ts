import { expect, test } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  login,
  openComponentConfig,
  setTechnicalId,
} from './helpers/studio';
import { ensureBaserowTable } from './helpers/baserow';
import { BASEROW_BASE, BASEROW_WORKSPACE, configureSelectBaserowSource } from './helpers/select-source';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1402
 * "Select component from a data source shows a large empty zone at the end of
 * the data list"
 *
 * Found in 2.2.0-beta205, fixed by 7be1f800 (first released in
 * 2.2.0-beta214). Root cause: the source-backed searchable Select used a CDK
 * virtual scroll item size of 48 while the rendered rows are 42px high, leaving
 * an oversized blank area at the bottom of the dropdown.
 */
const TABLE = 'Issue 1402 Compact Select Long';
const ROW_COUNT = 80;

test.setTimeout(120_000);

test.beforeAll(async () => {
  await ensureBaserowTable({
    workspace: BASEROW_WORKSPACE,
    database: BASEROW_BASE,
    table: TABLE,
    columns: [
      { name: 'Value', type: 'text' },
      { name: 'Label', type: 'text' },
    ],
    rows: Array.from({ length: ROW_COUNT }, (_, index) => {
      const n = String(index + 1).padStart(2, '0');
      return { Value: `value-${n}`, Label: `Choice ${n}` };
    }),
  });
});

test('#1402 - source select dropdown ends near the last rendered item', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1402 ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.select);
  await page.locator('c8oforms-itemselectviewver').first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, 'c8oforms-itemselectviewver');
  await setTechnicalId(page, 'compact_select');

  await configureSelectBaserowSource(page, {
    table: TABLE,
    displayColumn: 'Label',
    valueColumn: 'Value',
  });

  await closeComponentConfig(page);
  await page.locator(SEL.previewButton).first().click();
  await page.waitForURL('**/viewer/**', { timeout: 30_000 });

  const select = page.locator('c8oforms-itemselectviewver').first();
  await expect(select, 'the Select fixture should render in the viewer').toBeVisible({ timeout: 30_000 });
  await select.locator('button').first().click();

  const viewport = page.locator('cdk-virtual-scroll-viewport').filter({ hasText: 'Choice' }).last();
  await expect(viewport, 'the source Select should open a virtual-scroll list').toBeVisible({ timeout: 30_000 });
  await expect(viewport).toContainText('Choice 01', { timeout: 30_000 });

  await viewport.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(700);

  const metrics = await viewport.evaluate((viewportElement) => {
    const viewportBox = viewportElement.getBoundingClientRect();
    const choices = [...viewportElement.querySelectorAll<HTMLElement>('*')]
      .map((el) => ({ el, text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ') }))
      .filter(({ el, text }) => /^Choice \d{2}$/.test(text) && el.getBoundingClientRect().height > 0);
    const last = choices.sort((a, b) => a.el.getBoundingClientRect().bottom - b.el.getBoundingClientRect().bottom).at(-1);
    if (!last) return { lastText: '', bottomGap: 9999, renderedChoices: 0 };
    return {
      lastText: last.text,
      bottomGap: Math.round(viewportBox.bottom - last.el.getBoundingClientRect().bottom),
      renderedChoices: choices.length,
    };
  });

  expect(metrics.lastText, 'scrolling to the bottom should expose the final source row').toBe(`Choice ${ROW_COUNT}`);
  expect(metrics.renderedChoices, 'the dropdown should render visible source choices').toBeGreaterThan(0);
  expect(metrics.bottomGap, 'the dropdown must not leave a large blank zone after the last item').toBeLessThan(90);
});
