import { expect, test } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureSelectBaserowSource,
  createBlankForm,
  login,
  openComponentConfig,
  openPreview,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1402
 *
 * Found in 2.2.0-beta205, fixed by 7be1f800 (first tagged in
 * 2.2.0-beta214). The source-backed searchable Select used a CDK virtual-scroll
 * item size of 48 while rendered rows are about 42px high, leaving a large blank
 * area after the last source item.
 *
 * The C8oForms form is built only through the Studio UI. The external Baserow
 * table is an idempotent MCP fixture, selected later through the Select source
 * configuration UI.
 */

const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1402 Source Select Labels';
const TECHNICAL_ID = 'source_select_1402';
// The Baserow fixture table is persistent and the MCP upsert never deletes stale
// rows, so the row count must stay stable across runs (the test asserts the last
// dropdown row is "Choice <ROW_COUNT>"). Keep 80; fixture-upsert slowness is
// handled by the MCP per-request timeout + retry in helpers/baserow.ts, not by
// shrinking the dataset.
const ROW_COUNT = 80;
const DISPLAY_COLUMN = 'Name';
const VALUE_COLUMN = 'Value';

const ROWS = Array.from({ length: ROW_COUNT }, (_, index) => {
  const n = String(index + 1).padStart(2, '0');
  return { [DISPLAY_COLUMN]: `Choice ${n}`, [VALUE_COLUMN]: `value-${n}` };
});

// Baserow editor flows can intermittently stall on "Page loading in progress";
// retry the whole test from a fresh page/form in CI rather than failing flaky.
test.describe.configure({ retries: process.env.CI ? 2 : 0 });

test.use({
  viewport: { width: 1920, height: 1080 },
});

// Generous budget: the fixture upserts 80 rows, which can be slow against a
// freshly (re)deployed engine on push builds before the Baserow cache warms up.
test.setTimeout(240_000);

test('#1402 - source Select dropdown has no large blank zone after the last item', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: DISPLAY_COLUMN,
    columns: [
      { name: DISPLAY_COLUMN, type: 'text' },
      { name: VALUE_COLUMN, type: 'text' },
    ],
    rows: ROWS,
    upsertKey: DISPLAY_COLUMN,
  });
  assertBaserowFixture(catalog);

  await login(page);
  await createBlankForm(page, `Issue 1402 source select ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.select);
  await expect(page.locator(SEL.selectComponent), 'the Select component should be added').toHaveCount(1, {
    timeout: 30_000,
  });
  await openComponentConfig(page, SEL.selectComponent);
  await setTechnicalId(page, TECHNICAL_ID);
  await configureSelectBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: [DISPLAY_COLUMN, VALUE_COLUMN],
    displayColumn: DISPLAY_COLUMN,
    valueColumn: VALUE_COLUMN,
  });
  await closeComponentConfig(page);

  await openPreview(page, SEL.selectComponent);
  const select = page.locator(SEL.selectComponent).first();
  await expect(select, 'the source Select should render in the viewer').toBeVisible({ timeout: 30_000 });
  await select.locator('ion-item.class1648542300891, button').first().click();

  const viewport = page.locator('cdk-virtual-scroll-viewport').filter({ hasText: 'Choice' }).last();
  await expect(viewport, 'the source Select should open a virtual-scroll dropdown').toBeVisible({ timeout: 30_000 });
  await expect(viewport).toContainText('Choice 01', { timeout: 30_000 });

  await viewport.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(700);

  const metrics = await viewport.evaluate((viewportElement, rowCount) => {
    const viewportBox = viewportElement.getBoundingClientRect();
    const choices = [...viewportElement.querySelectorAll<HTMLElement>('*')]
      .map((element) => ({
        element,
        text: (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' '),
      }))
      .filter(({ element, text }) => /^Choice \d{2}$/.test(text) && element.getBoundingClientRect().height > 0);
    const last = choices.sort((a, b) => a.element.getBoundingClientRect().bottom - b.element.getBoundingClientRect().bottom).at(-1);
    return {
      expectedLastText: `Choice ${String(rowCount).padStart(2, '0')}`,
      lastText: last?.text ?? '',
      bottomGap: last ? Math.round(viewportBox.bottom - last.element.getBoundingClientRect().bottom) : 9999,
      renderedChoices: choices.length,
    };
  }, ROW_COUNT);

  expect(metrics.lastText, 'scrolling to the bottom should expose the final source row').toBe(metrics.expectedLastText);
  expect(metrics.renderedChoices, 'the dropdown should render visible source choices').toBeGreaterThan(0);
  expect(metrics.bottomGap, 'the dropdown must not leave a large blank zone after the last item').toBeLessThan(90);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  for (const columnName of [DISPLAY_COLUMN, VALUE_COLUMN]) {
    const column = columns.find((candidate) => candidate.name === columnName);
    expect(column, `Baserow column ${columnName} should exist`).toBeTruthy();
    expect(column?.type, `Baserow column ${columnName} should be a Text field`).toBe('text');
  }
}
