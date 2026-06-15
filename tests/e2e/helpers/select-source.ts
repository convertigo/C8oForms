import { expect, Locator, Page } from '@playwright/test';
import { acceptRgpdIfVisible, openConfigTab } from './studio';

export const BASEROW_WORKSPACE = 'C8oForms E2E';
export const BASEROW_BASE = 'Regression Fixtures';

const SOURCE_MODE_BUTTON = 'button.class1775840591959';
const CONFIG_SECTION_BUTTON = '.class1775835275863';
const SELECT_SOURCE_BUTTON = 'button.class1775848361410';
const SOURCE_PICKER_SAVE = 'ion-button.class1599830132445';
const TABLE_PICKER_BUTTON = 'button.class1776013870072';
const COLUMN_ROW = 'ion-item.class1776161384798';
const DISPLAY_COLUMN_CHECKBOX = 'ion-checkbox.class1776352302823';
const VALUE_COLUMN_CHECKBOX = 'ion-checkbox.class1776352314668';
const TABLE_PICKER_SAVE = 'ion-button.class1776244653366';
const SOURCE_SUMMARY = '.class1776013865512';

export interface ConfigureSelectSourceOptions {
  workspace?: string;
  database?: string;
  table: string;
  displayColumn: string;
  valueColumn: string;
}

/**
 * Configure the currently open Select component as a Baserow data source.
 *
 * The source modals use repeated priority classes, so the helper scopes every
 * click to the last visible ion-modal and verifies the summary before saving.
 */
export async function configureSelectBaserowSource(
  page: Page,
  options: ConfigureSelectSourceOptions,
): Promise<void> {
  const workspace = options.workspace ?? BASEROW_WORKSPACE;
  const database = options.database ?? BASEROW_BASE;

  await acceptRgpdIfVisible(page);
  const configSection = page.locator(CONFIG_SECTION_BUTTON).first();
  if (await configSection.isVisible().catch(() => false)) {
    await configSection.click();
  }

  await openConfigTab(page, 'Choix de la source');
  const modeButtons = page.locator(SOURCE_MODE_BUTTON);
  if ((await modeButtons.count()) > 1) {
    await modeButtons.nth(1).click();
  }

  await page.locator(SELECT_SOURCE_BUTTON).first().click();
  const sourcePicker = page.locator('ion-modal').last();
  await expect(sourcePicker, 'the Select source picker should open').toBeVisible({ timeout: 15_000 });
  await sourcePicker.locator(SELECT_SOURCE_BUTTON).nth(1).click();
  await sourcePicker.locator(SOURCE_PICKER_SAVE).click();
  await expect(sourcePicker).toBeHidden({ timeout: 15_000 });
  await page.waitForTimeout(1_500);

  await openConfigTab(page, 'Configuration de la source');
  await acceptRgpdIfVisible(page);
  const tablePicker = await openSelectTablePicker(page);
  await chooseBaserowTable(tablePicker, { workspace, database, table: options.table });
  await acceptRgpdIfVisible(page);
  await setSingleCheckedColumn(tablePicker, DISPLAY_COLUMN_CHECKBOX, options.displayColumn);
  await setSingleCheckedColumn(tablePicker, VALUE_COLUMN_CHECKBOX, options.valueColumn);
  await expect(tablePicker.locator('.class1776246576145')).toContainText(options.table, { timeout: 15_000 });
  await tablePicker.locator(TABLE_PICKER_SAVE).click();
  await expect(tablePicker).toBeHidden({ timeout: 20_000 });
  await expect(page.locator(SOURCE_SUMMARY).first()).toContainText(options.table, { timeout: 15_000 });
}

export async function openSelectTablePicker(page: Page): Promise<Locator> {
  await page.locator(TABLE_PICKER_BUTTON).first().click();
  const tablePicker = page.locator('ion-modal').last();
  await expect(tablePicker, 'the Select table picker should open').toBeVisible({ timeout: 15_000 });
  return tablePicker;
}

export async function openSelectSourceConfiguration(page: Page): Promise<void> {
  await acceptRgpdIfVisible(page);
  const configSection = page.locator(CONFIG_SECTION_BUTTON).first();
  if (await configSection.isVisible().catch(() => false)) {
    await configSection.click();
  }
  await openConfigTab(page, 'Configuration de la source');
}

export async function checkedValueColumns(modal: Locator, candidates: string[]): Promise<string[]> {
  return checkedColumns(modal, VALUE_COLUMN_CHECKBOX, candidates);
}

export async function checkedDisplayColumns(modal: Locator, candidates: string[]): Promise<string[]> {
  return checkedColumns(modal, DISPLAY_COLUMN_CHECKBOX, candidates);
}

export async function checkedColumns(modal: Locator, checkboxSelector: string, candidates: string[]): Promise<string[]> {
  const checked: string[] = [];
  for (const name of candidates) {
    const row = columnRow(modal, name);
    if ((await row.count()) === 0) continue;
    const attr = await row.locator(checkboxSelector).first().getAttribute('aria-checked');
    if (attr === 'true') checked.push(name);
  }
  return checked;
}

async function chooseBaserowTable(
  modal: Locator,
  options: { workspace: string; database: string; table: string },
): Promise<void> {
  await expect(modal.getByText(options.workspace, { exact: true })).toBeVisible({ timeout: 20_000 });
  await modal.getByText(options.workspace, { exact: true }).click();
  await expect(modal.getByText(options.database, { exact: true })).toBeVisible({ timeout: 20_000 });
  await modal.getByText(options.database, { exact: true }).click();
  await expect(modal.getByText(options.table, { exact: true })).toBeVisible({ timeout: 20_000 });
  await modal.getByText(options.table, { exact: true }).click();
  await expect(modal.locator('.class1776246576145')).toContainText(options.table, { timeout: 20_000 });
}

async function setSingleCheckedColumn(modal: Locator, checkboxSelector: string, targetColumn: string): Promise<void> {
  await expect(columnRow(modal, targetColumn), `column ${targetColumn} should be available`).toBeVisible({
    timeout: 15_000,
  });

  const rows = modal.locator(COLUMN_ROW);
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = normalize(await row.innerText().catch(() => ''));
    if (!text) continue;
    const checkbox = row.locator(checkboxSelector).first();
    if ((await checkbox.count()) === 0) continue;

    const isTarget = columnNameFromRowText(text) === targetColumn || text.split(/\s+/).includes(targetColumn);
    const checked = (await checkbox.getAttribute('aria-checked')) === 'true';
    if (checked !== isTarget) {
      await checkbox.click();
      await expect
        .poll(() => checkbox.getAttribute('aria-checked'), {
          message: `column ${text} checked state should become ${isTarget}`,
          timeout: 5_000,
        })
        .toBe(isTarget ? 'true' : 'false');
    }
  }
}

function columnRow(modal: Locator, name: string): Locator {
  return modal.locator(COLUMN_ROW).filter({ hasText: new RegExp(`(^|\\s)${escapeRegExp(name)}(\\s|$)`) }).first();
}

function columnNameFromRowText(text: string): string {
  const tokens = normalize(text).split(/\s+/);
  return tokens.find((token) => !/^\d+$/.test(token)) ?? text;
}

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
