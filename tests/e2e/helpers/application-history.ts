import { expect, test, type Locator, type Page } from '@playwright/test';
import { SEL } from './studio';
import {
  clickSelectorPopoverItem,
  dismissSelectorPopovers,
  expectNoCodeDashboardReady,
  openSelectorCardMenu,
} from './functional-studio';

/**
 * Version history of an application (#1359): the applicationHistoryPage modal, opened from the editor
 * more-actions menu or from the application menu of the selector, and the application import modal.
 * Selectors are the Convertigo priority classes of the beans (stable across labels and languages).
 */
export const HISTORY_SEL = {
  editorMenuItem: 'ion-item.class1790183000110',
  selectorMenuItem: 'ion-item.class1790183000312',
  modal: '.class1790181000120',
  closeButton: 'ion-button.class1790181000009',
  labelInput: '.class1790181000024 input',
  createButton: 'ion-button.class1790181000032',
  fileInput: 'input.class1790181000044',
  entry: '.class1790181000104',
  entryOrigin: '.class1790181000065',
  entryCurrent: '.class1790181000068',
  entryPublished: '.class1790181000072',
  entryTitle: '.class1790181000079',
  entryRestoreButton: 'ion-button.class1790181000092',
  entryExportButton: 'ion-button.class1790181000100',
  empty: '.class1790181000057',
  error: '.class1790181000053',
  restoreConfirmButton: 'ion-alert:not(.overlay-hidden) button.btn--success',
  selectorImportButton: 'ion-button.class1761574287978',
  importModalFileInput: 'input.class1658765639761',
  importModalSubmitButton: 'ion-button.class1658764714718',
} as const;

/** Origins recorded by the server (js/application_history.js). */
export type HistoryOrigin = 'manual' | 'auto' | 'publish' | 'import' | 'pre_restore' | 'restore';

export type HistoryEntry = {
  origin: HistoryOrigin;
  title: string;
  current: boolean;
  published: boolean;
  restorable: boolean;
};

export async function openVersionHistoryFromEditor(page: Page): Promise<Locator> {
  return test.step('Open the version history from the editor menu', async () => {
    const moreActions = page.locator(SEL.editorMoreActionsButton).first();
    await expect(moreActions, 'the editor more-actions button should be visible').toBeVisible({ timeout: 30_000 });
    await moreActions.click({ timeout: 10_000 }).catch(async () => moreActions.dispatchEvent('click'));
    const item = page.locator(SEL.editorMoreActionsPopover).last().locator(HISTORY_SEL.editorMenuItem).first();
    await expect(item, 'the editor menu should offer the version history').toBeVisible({ timeout: 10_000 });
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
    return expectVersionHistoryLoaded(page);
  });
}

export async function openVersionHistoryFromSelector(page: Page, title: string): Promise<Locator> {
  return test.step(`Open the version history of ${title} from the application list`, async () => {
    await openSelectorCardMenu(page, title);
    await clickSelectorPopoverItem(page, HISTORY_SEL.selectorMenuItem, 'version history');
    return expectVersionHistoryLoaded(page);
  });
}

/** Waits for the history modal and its first load (a list of versions, the empty state or an error). */
export async function expectVersionHistoryLoaded(page: Page): Promise<Locator> {
  const modal = page.locator(HISTORY_SEL.modal).last();
  await expect(modal, 'the version history should open').toBeVisible({ timeout: 30_000 });
  await expect
    .poll(async () => (await modal.locator(`${HISTORY_SEL.entry}, ${HISTORY_SEL.empty}, ${HISTORY_SEL.error}`).count()) > 0, {
      message: 'the version history should finish loading',
      timeout: 30_000,
    })
    .toBe(true);
  await expect(modal.locator(HISTORY_SEL.error), 'the version history should load without error').toHaveCount(0);
  return modal;
}

export async function readVersionHistory(page: Page): Promise<HistoryEntry[]> {
  const modal = page.locator(HISTORY_SEL.modal).last();
  return modal.locator(HISTORY_SEL.entry).evaluateAll(
    (entries, sel) =>
      entries.map((entry) => {
        const restore = entry.querySelector(sel.entryRestoreButton) as (HTMLElement & { disabled?: boolean }) | null;
        return {
          origin: (entry.querySelector(sel.entryOrigin)?.getAttribute('data-origin') ?? '') as HistoryOrigin,
          title: ((entry.querySelector(sel.entryTitle) as HTMLElement | null)?.innerText ?? '').trim(),
          current: entry.querySelector(sel.entryCurrent) != null,
          published: entry.querySelector(sel.entryPublished) != null,
          restorable: restore != null && restore.disabled !== true,
        };
      }),
    HISTORY_SEL,
  );
}

export async function createVersionThroughUi(page: Page, label: string): Promise<void> {
  await test.step(`Create the version "${label}"`, async () => {
    const modal = page.locator(HISTORY_SEL.modal).last();
    const before = await modal.locator(HISTORY_SEL.entry).count();
    const input = modal.locator(HISTORY_SEL.labelInput).first();
    await input.fill(label, { timeout: 10_000 });
    await modal.locator(HISTORY_SEL.createButton).first().click({ timeout: 10_000 });
    await expect
      .poll(async () => (await readVersionHistory(page))[0]?.title, {
        message: `the new version "${label}" should head the history`,
        timeout: 30_000,
      })
      .toBe(label);
    expect(await modal.locator(HISTORY_SEL.entry).count(), 'creating a version should add one entry').toBe(before + 1);
    await expect(input, 'the label field should be cleared once the version is created').toHaveValue('');
  });
}

export async function closeVersionHistory(page: Page): Promise<void> {
  const modal = page.locator(HISTORY_SEL.modal).last();
  await modal.locator(HISTORY_SEL.closeButton).first().click({ timeout: 10_000 });
  await expect(modal, 'the version history should close').toBeHidden({ timeout: 15_000 });
}

function historyEntry(page: Page, match: { title?: string; origin?: HistoryOrigin }): Locator {
  let entry = page.locator(HISTORY_SEL.modal).last().locator(HISTORY_SEL.entry);
  if (match.origin) {
    entry = entry.filter({ has: page.locator(`${HISTORY_SEL.entryOrigin}[data-origin="${match.origin}"]`) });
  }
  if (match.title) {
    entry = entry.filter({ has: page.locator(HISTORY_SEL.entryTitle, { hasText: match.title }) });
  }
  return entry.first();
}

async function confirmRestore(page: Page, entry: Locator): Promise<void> {
  const restore = entry.locator(HISTORY_SEL.entryRestoreButton).first();
  await expect(restore, 'the version to restore should offer the restore action').toBeVisible({ timeout: 10_000 });
  await restore.click({ timeout: 10_000 });
  const confirm = page.locator(HISTORY_SEL.restoreConfirmButton).last();
  await expect(confirm, 'restoring should ask for a confirmation').toBeVisible({ timeout: 10_000 });
  await confirm.click({ timeout: 10_000 });
}

/** Restores from the editor: the editor reloads on the restored application. */
export async function restoreVersionFromEditorThroughUi(page: Page, match: { title?: string; origin?: HistoryOrigin }): Promise<void> {
  await test.step(`Restore the version ${JSON.stringify(match)} from the editor`, async () => {
    const reloaded = page.waitForEvent('load', { timeout: 60_000 });
    await confirmRestore(page, historyEntry(page, match));
    await reloaded;
    await expect(page.locator(SEL.editorMoreActionsButton).first(), 'the editor should reopen after the restore').toBeVisible({
      timeout: 60_000,
    });
  });
}

/** Restores from the application list: the history stays open and shows the restore on top. */
export async function restoreVersionFromListThroughUi(page: Page, match: { title?: string; origin?: HistoryOrigin }): Promise<void> {
  await test.step(`Restore the version ${JSON.stringify(match)} from the application list`, async () => {
    await confirmRestore(page, historyEntry(page, match));
    await expect
      .poll(async () => (await readVersionHistory(page))[0], {
        message: 'the restore should head the refreshed history as the current version',
        timeout: 30_000,
      })
      .toMatchObject({ origin: 'restore', current: true });
  });
}

/** Downloads a version through its export button and returns the saved file path. */
export async function downloadVersionThroughUi(page: Page, match: { title?: string; origin?: HistoryOrigin }, savePath: string): Promise<string> {
  return test.step(`Download the version ${JSON.stringify(match)}`, async () => {
    const download = page.waitForEvent('download', { timeout: 30_000 });
    await historyEntry(page, match).locator(HISTORY_SEL.entryExportButton).first().click({ timeout: 10_000 });
    await (await download).saveAs(savePath);
    return savePath;
  });
}

export async function importFileAsVersionThroughUi(page: Page, filePath: string, fileName: string): Promise<void> {
  await test.step(`Import ${fileName} as a version`, async () => {
    await page.locator(HISTORY_SEL.modal).last().locator(HISTORY_SEL.fileInput).setInputFiles(filePath);
    await expect
      .poll(async () => (await readVersionHistory(page))[0], {
        message: 'the imported file should head the history as an import version',
        timeout: 30_000,
      })
      .toMatchObject({ origin: 'import', title: fileName });
  });
}

/** Imports a .c8oforms file as a new application from the application list. */
export async function importApplicationFileThroughUi(page: Page, filePath: string): Promise<void> {
  await test.step('Import an application file from the application list', async () => {
    await expectNoCodeDashboardReady(page);
    await dismissSelectorPopovers(page);
    const importButton = page.locator(HISTORY_SEL.selectorImportButton).first();
    await expect(importButton, 'the application list should offer the import').toBeVisible({ timeout: 15_000 });
    await importButton.click({ timeout: 10_000 });
    const input = page.locator(HISTORY_SEL.importModalFileInput).last();
    await expect(input, 'the import modal should expose its file input').toBeAttached({ timeout: 15_000 });
    await input.setInputFiles(filePath);
    const submit = page.locator(HISTORY_SEL.importModalSubmitButton).last();
    await expect(submit, 'the import modal should offer to import the chosen file').toBeVisible({ timeout: 15_000 });
    await submit.click({ timeout: 10_000 });
  });
}
