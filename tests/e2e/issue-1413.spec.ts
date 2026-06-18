import { test, expect, Page } from '@playwright/test';
import { ensureBaserowTable, type BaserowCatalog } from './helpers/baserow';
import {
  SEL,
  PALETTE_ICON,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  setTechnicalId,
  closeComponentConfig,
  openConfigTab,
  configureGridBaserowSource,
  openPreview,
  acceptRgpdIfVisible,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1413
 * "Description component breaks when using a Grid Palette value whose column
 * name contains a single quote."
 *
 * Found in 2.2.0-beta214, fixed by 6b3cbb897 (first released in 2.2.0-beta218).
 * Root cause: viewerPage generated JS string literals with unescaped grid path
 * segments, so a column such as Owner's name produced invalid JavaScript.
 */
const DATA_TAB = /donnees.*interactions|data.*interactions/i;
const WORKSPACE = 'C8oForms E2E';
const BASE = 'Regression Fixtures';
const TABLE = 'Issue 1413 Quote Text Field';
const ROW_LABEL = 'row_1413';
const GRID_NAME = 'quote_grid';
const QUOTED_COLUMN = "Owner's name";
const EXPECTED_VALUE = "Alice's quoted owner";
const ROW_SELECTED = /ligne sélectionnée|selected row/i;
const GRID_CONFIGURED = /cette table a été configurée pour renvoyer|this grid has been configured to return/i;

test.setTimeout(180_000);

test('#1413 - description palette values escape quoted grid column names', async ({ page }) => {
  const catalog = await ensureBaserowTable({
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    primaryField: 'Name',
    columns: [
      { name: 'Name', type: 'text' },
      { name: QUOTED_COLUMN, type: 'text' },
    ],
    rows: [
      {
        Name: ROW_LABEL,
        [QUOTED_COLUMN]: EXPECTED_VALUE,
      },
    ],
    upsertKey: 'Name',
  });
  assertBaserowFixture(catalog);

  const syntaxErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /SyntaxError|missing \) after argument list/.test(message.text())) {
      syntaxErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    if (/SyntaxError|missing \) after argument list/.test(error.message)) {
      syntaxErrors.push(error.message);
    }
  });

  await login(page);
  await createBlankForm(page, `Issue 1413 ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.grid);
  await page.locator('c8oforms-itemgridviewer').first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, 'c8oforms-itemgridviewer');
  await setTechnicalId(page, GRID_NAME);
  await acceptRgpdIfVisible(page);

  await configureGridBaserowSource(page, {
    workspace: WORKSPACE,
    database: BASE,
    table: TABLE,
    expectedColumns: [QUOTED_COLUMN],
  });
  await setGridReturnedValueToRowSelected(page);

  await closeComponentConfig(page);
  await addComponent(page, PALETTE_ICON.description);
  await page.locator('c8oforms-itemdescriptionviewer').first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, 'c8oforms-itemdescriptionviewer');
  await setTechnicalId(page, 'desc_quote');

  await insertGridColumnValueInDescription(page);

  syntaxErrors.length = 0;
  await closeComponentConfig(page);
  await openPreview(page, SEL.gridComponent);

  const row = page.locator('.ag-center-cols-container .ag-row').filter({ hasText: EXPECTED_VALUE }).first();
  await expect(row, 'the Baserow fixture row should render in the grid').toBeVisible({ timeout: 30_000 });
  await row.click();
  await page.waitForTimeout(2_000);

  expect(syntaxErrors, 'quoted grid column names must not break generated Description JavaScript').toEqual([]);
});

function assertBaserowFixture(catalog: BaserowCatalog): void {
  const table = catalog.tables.find((candidate) => candidate.name === TABLE);
  expect(table, `Baserow table ${TABLE} should exist`).toBeTruthy();
  const columns = table?.columns ?? [];
  expect(
    columns.find((candidate) => candidate.name === QUOTED_COLUMN),
    `Baserow column ${QUOTED_COLUMN} should exist`,
  ).toBeTruthy();
}

async function setGridReturnedValueToRowSelected(page: Page): Promise<void> {
  await openConfigTab(page, DATA_TAB);
  const returnedValue = page.locator('.class1775842589999');
  await returnedValue.getByText(ROW_SELECTED).click();
  await expect(returnedValue).toContainText(ROW_SELECTED, { timeout: 10_000 });
}

async function insertGridColumnValueInDescription(page: Page): Promise<void> {
  await dragPaletteEntryToEditor(page, GRID_NAME);
  await page.frameLocator('iframe[title="Rich Text Area"]').locator('svg[id^="clickable-"]').first().click();

  const treeview = page.locator('ion-modal.modalCSV').last();
  await expect(treeview.getByText(GRID_CONFIGURED)).toBeVisible({ timeout: 15_000 });
  await expect(treeview.getByText(ROW_SELECTED)).toBeVisible({ timeout: 15_000 });
  await treeview.getByText(QUOTED_COLUMN, { exact: true }).click();
  await acceptRgpdIfVisible(page);

  if (await treeview.getByText('displayValue', { exact: true }).isVisible({ timeout: 1_000 }).catch(() => false)) {
    await clickChooseButtonForTreeLabel(page, 'displayValue');
  } else {
    // The beta214 Baserow grid completion exposes value, not displayValue. The
    // regression still exercises the same quoted Owner's name path segment.
    await clickChooseButtonForTreeLabel(page, 'value');
  }

  const editorBody = page.frameLocator('iframe[title="Rich Text Area"]').locator('body');
  await expect
    .poll(() => editorBody.evaluate((body) => body.innerHTML), {
      message: 'the Description editor should contain the selected quoted grid path',
      timeout: 10_000,
    })
    .toContain(`${GRID_NAME}.${QUOTED_COLUMN}.`);
}

async function dragPaletteEntryToEditor(page: Page, label: string): Promise<void> {
  const editorBody = page.frameLocator('iframe[title="Rich Text Area"]').locator('body');
  await editorBody.waitFor({ state: 'visible', timeout: 15_000 });

  const tile = page.locator('.class1775922875303 [draggable="true"]').filter({ hasText: label }).first();
  await expect(tile).toBeVisible({ timeout: 15_000 });

  await tile.dragTo(editorBody).catch(() => undefined);
  await page.waitForTimeout(1_000);
  if ((await editorBody.locator('svg[id^="clickable-"]').count()) > 0) {
    return;
  }

  const payload = await page.evaluate((entryLabel) => {
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const root = document.querySelector('.class1775922875303') || document;
    const source = [...root.querySelectorAll('[draggable="true"]')]
      .filter(visible)
      .find((el) => (el.textContent ?? '').trim().includes(entryLabel));
    if (!source) return { ok: false, html: '' };

    const dataTransfer = new DataTransfer();
    source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
    source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }));
    return { ok: true, html: dataTransfer.getData('text/html') };
  }, label);
  expect(payload.ok, `could not get drag payload for ${label}`).toBe(true);

  await page.evaluate((html) => {
    const tinymce = (window as any).tinymce;
    tinymce?.activeEditor?.insertContent(html);
    tinymce?.activeEditor?.fire('change');
    tinymce?.activeEditor?.fire('blur');
  }, payload.html);
  await expect(editorBody.locator('svg[id^="clickable-"]').first()).toBeVisible({ timeout: 10_000 });
}

async function clickChooseButtonForTreeLabel(page: Page, label: string): Promise<void> {
  const center = await page.evaluate((wantedLabel) => {
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const modal = [...document.querySelectorAll('ion-modal.modalCSV')].filter(visible).pop();
    if (!modal) return null;

    const labelEl = [...modal.querySelectorAll('ion-label, p, span, div')]
      .filter(visible)
      .find((el) => (el.textContent ?? '').trim() === wantedLabel);
    if (!labelEl) return null;

    const labelBox = (labelEl as HTMLElement).getBoundingClientRect();
    const labelY = labelBox.y + labelBox.height / 2;
    const chooseButton = (text: string) => /^(Choisir cette valeur|Choose this value)$/i.test(text.trim());
    const buttons = [...modal.querySelectorAll('ion-button')]
      .filter(visible)
      .filter((el) => chooseButton(el.textContent ?? ''));

    let best: DOMRect | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const button of buttons) {
      const box = (button as HTMLElement).getBoundingClientRect();
      if (box.x < labelBox.x) continue;
      const score = Math.abs(box.y + box.height / 2 - labelY);
      if (score < bestScore) {
        bestScore = score;
        best = box;
      }
    }
    return best ? { x: best.x + best.width / 2, y: best.y + best.height / 2 } : null;
  }, label);

  expect(center, `could not find a choose-value button for ${label}`).not.toBeNull();
  await page.mouse.click(center!.x, center!.y);
  await page.locator('ion-modal.modalCSV').waitFor({ state: 'hidden', timeout: 15_000 });
}
