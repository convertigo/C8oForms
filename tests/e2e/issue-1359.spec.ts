import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  addComponent,
  countComponents,
  createBlankForm,
  expectSelectorApplicationVisible,
  login,
} from './helpers/studio';
import { expectNoCodeDashboardReady, openSelectorApplicationFromCard } from './helpers/functional-studio';
import {
  closeVersionHistory,
  createVersionThroughUi,
  downloadVersionThroughUi,
  importApplicationFileThroughUi,
  importFileAsVersionThroughUi,
  openVersionHistoryFromEditor,
  openVersionHistoryFromSelector,
  readVersionHistory,
  restoreVersionFromEditorThroughUi,
  restoreVersionFromListThroughUi,
  setAutomaticVersionsShown,
} from './helpers/application-history';

/**
 * Feature test for https://github.com/convertigo/C8oForms/issues/1359
 * (version history with restore capability for applications).
 *
 * An application keeps a history of versions (created on demand, on every
 * publication, automatically while it is edited - at most one a minute, thinned
 * out with age - and when a file is imported into it). Restoring a version rewrites the application itself: same id, so
 * same URL, access rights and publication; the state it replaced is kept as a
 * version, which makes the restore undoable. An imported application file
 * creates a copy named as such, never taken for the original.
 *
 * The applications are built only through the Studio UI; the history is read
 * from its modal.
 */

test.setTimeout(240_000);

async function expectComponentCount(page: import('@playwright/test').Page, count: number, message: string): Promise<void> {
  await expect.poll(() => countComponents(page), { message, timeout: 30_000 }).toBe(count);
}

test('#1359 - restoring a version from the editor replaces the application in place and can be undone', async ({ page }) => {
  const title = `Issue 1359 restore ${Date.now()}`;
  const label = `Before redesign ${Date.now()}`;
  let formId = '';

  await login(page);

  await test.step('Create an application with one component', async () => {
    formId = await createBlankForm(page, title);
    await addComponent(page, PALETTE_ICON.textInput);
    await expectComponentCount(page, 1, 'the application should hold one component');
  });

  await test.step('Record it as a named version', async () => {
    await openVersionHistoryFromEditor(page);
    await createVersionThroughUi(page, label);
    const [latest] = await readVersionHistory(page);
    expect(latest, 'the named version should be the current one').toMatchObject({ origin: 'manual', title: label, current: true, restorable: false });
  });

  await test.step('The automatic versions can be hidden', async () => {
    // The first save of the application kept its initial state as an automatic version.
    await setAutomaticVersionsShown(page, false);
    expect((await readVersionHistory(page)).map((entry) => entry.origin), 'only the named version should remain').toEqual(['manual']);
    await setAutomaticVersionsShown(page, true);
    await closeVersionHistory(page);
  });

  await test.step('Change the application', async () => {
    await addComponent(page, PALETTE_ICON.description);
    await expectComponentCount(page, 2, 'the changed application should hold two components');
  });

  await test.step('Restore the named version from the editor', async () => {
    await openVersionHistoryFromEditor(page);
    const named = (await readVersionHistory(page)).find((entry) => entry.title === label);
    expect(named, 'the named version should no longer be the current one').toMatchObject({ current: false, restorable: true });
    await restoreVersionFromEditorThroughUi(page, { origin: 'manual', title: label });
    expect(page.url(), 'the restored application should keep its id, hence its URL').toContain(`/editor/${formId}`);
    await expectComponentCount(page, 1, 'the restored application should hold the component of the named version only');
  });

  await test.step('The history records the restore and the state it replaced', async () => {
    await openVersionHistoryFromEditor(page);
    const [restore, backup] = await readVersionHistory(page);
    expect(restore, 'the restore should head the history, labelled like the restored version').toMatchObject({
      origin: 'restore',
      title: label,
      current: true,
    });
    expect(backup, 'the replaced state should be kept just below the restore').toMatchObject({ origin: 'pre_restore', current: false });
  });

  await test.step('Undo the restore by restoring the replaced state', async () => {
    await restoreVersionFromEditorThroughUi(page, { origin: 'pre_restore' });
    expect(page.url(), 'undoing the restore should keep the application URL').toContain(`/editor/${formId}`);
    await expectComponentCount(page, 2, 'undoing the restore should bring the second component back');
  });
});

test('#1359 - a downloaded version is imported back into its application, and an application import creates a copy', async ({ page }, testInfo) => {
  const title = `Issue 1359 import ${Date.now()}`;
  const label = `Single component ${Date.now()}`;
  const fileName = 'issue-1359-version.c8oforms';
  const filePath = testInfo.outputPath(fileName);

  await login(page);

  await test.step('Create an application, record a version, then change it', async () => {
    await createBlankForm(page, title);
    await addComponent(page, PALETTE_ICON.textInput);
    await expectComponentCount(page, 1, 'the application should hold one component');
    await openVersionHistoryFromEditor(page);
    await createVersionThroughUi(page, label);
    await closeVersionHistory(page);
    await addComponent(page, PALETTE_ICON.description);
    await expectComponentCount(page, 2, 'the changed application should hold two components');
  });

  await test.step('Download the recorded version from the application list', async () => {
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectNoCodeDashboardReady(page);
    await expectSelectorApplicationVisible(page, title);
    await openVersionHistoryFromSelector(page, title);
    await downloadVersionThroughUi(page, { origin: 'manual', title: label }, filePath);
  });

  await test.step('Import the file as a version and restore it', async () => {
    await importFileAsVersionThroughUi(page, filePath, fileName);
    await restoreVersionFromListThroughUi(page, { origin: 'import', title: fileName });
    await closeVersionHistory(page);
    await openSelectorApplicationFromCard(page, title);
    await expectComponentCount(page, 1, 'the application should hold the content of the imported version');
  });

  await test.step('Importing the file as an application creates a copy named as such', async () => {
    await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await importApplicationFileThroughUi(page, filePath);
    // The copy suffix is translated: only its presence after the original name is checked.
    await expect
      .poll(
        () =>
          page.evaluate(
            (original) =>
              [...document.querySelectorAll('.class1603968061706')]
                .map((element) => (element as HTMLElement).innerText.replace(/\s+/g, ' ').trim())
                .filter((name) => name.startsWith(`${original} (`)),
            title,
          ),
        { message: 'the imported application should be listed as a copy of the original', timeout: 60_000 },
      )
      .toHaveLength(1);
    await expectSelectorApplicationVisible(page, title);
  });
});
