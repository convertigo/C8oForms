import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  activePageSettingsSection,
  addComponent,
  addPageThroughPagesPanel,
  closePageSettings,
  closeComponentConfig,
  countComponents,
  expectEditorSidebarButtonsVisible,
  expectPagesPanelDefaultAfterWorkflowNavigation,
  openComponentConfig,
  openComponentConfigByTechnicalId,
  openApplicationSettingsFromSidebar,
  openComponentsPalette,
  openPageButtonsConfig,
  openPagesPanel,
  openWorkflowsPanel,
  recordedToasts,
  recordToasts,
  setTechnicalId,
} from './studio';

const EMPTY_PAGE_NAME_MESSAGE = /Ce champ ne peut etre vide|Ce champ ne peut .tre vide|This field can't be empty/i;
const DUPLICATE_PAGE_NAME_MESSAGE = /Ce nom existe deja|Ce nom existe d.j.|This name already exists/i;
const PAGE_DUPLICATE_ACTION = '[data-id="duplicate-action-pages"]';

export async function navigateEditorShellSectionsThroughUi(page: Page): Promise<void> {
  await test.step('Open the component Palette panel', async () => {
    await openComponentsPalette(page, PALETTE_ICON.description);
    await expect(page.locator(SEL.componentPaletteSearch).first(), 'component Palette search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
    await expectEditorCanvasVisible(page);
  });

  await test.step('Open the Pages panel', async () => {
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageSearchbar).first(), 'Pages panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should expose the current page').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
    await expectEditorCanvasVisible(page);
  });

  await test.step('Open the Workflows panel', async () => {
    await openWorkflowsPanel(page);
    await expect(page.locator(SEL.workflowsSearchbar).first(), 'Workflows panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.workflowEntry).first(), 'Workflows panel should expose workflow entries').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await expectPagesPanelDefaultAfterWorkflowNavigation(page);

  await test.step('Open the application Settings panel', async () => {
    await openApplicationSettingsFromSidebar(page);
    await expect(page.locator(SEL.appSettingsCategories).first(), 'Settings panel categories should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await test.step('Return to Pages and prove the canvas remains reachable after Settings', async () => {
    await closeApplicationSettingsIfOpen(page);
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should still expose the current page').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
    await expectEditorCanvasVisible(page);
  });
}

export async function openSettingsFromWorkflowsAndKeepSidebarNavigable(page: Page): Promise<void> {
  await test.step('Open Workflows before application Settings', async () => {
    await openWorkflowsPanel(page);
    await expect(page.locator(SEL.workflowsSearchbar).first(), 'Workflows panel search should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.workflowEntry).first(), 'Workflows panel should expose workflow entries').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await test.step('Open application Settings while coming from Workflows', async () => {
    await openApplicationSettingsFromSidebar(page);
    await expect(page.locator(SEL.appSettingsCategories).first(), 'Settings panel categories should be visible').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorSidebarButtonsVisible(page);
  });

  await test.step('Use the sidebar after opening Settings from Workflows', async () => {
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageSearchbar).first(), 'Pages panel search should be reachable from Settings').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(SEL.pageRow).first(), 'Pages panel should show the current page after leaving Settings').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorCanvasVisible(page);
  });
}

export async function addPageAndNavigateThroughPagesPanel(page: Page): Promise<void> {
  const newPageName = await addPageThroughPagesPanel(page);

  await test.step('Navigate to the newly added page from the Pages panel', async () => {
    await openPagesPanel(page);
    const newPageRow = page.locator(SEL.pageRow).filter({ hasText: newPageName }).first();
    await expect(newPageRow, `new page row ${newPageName} should stay visible`).toBeVisible({ timeout: 15_000 });
    await newPageRow.click({ timeout: 10_000 }).catch(async () => newPageRow.dispatchEvent('click'));
    await expect(page.locator(SEL.pageButtonsBlock).first(), 'page canvas should stay visible after selecting the new page').toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(newPageName, { exact: true }).first(), `canvas should expose the active page ${newPageName}`).toBeVisible({
      timeout: 15_000,
    });
  });
}

export async function renamePageWithValidationThroughUi(page: Page, validName = `Functional page ${Date.now()}`): Promise<void> {
  const newPageName = await addPageThroughPagesPanel(page);

  await test.step('Select the page to rename and open page settings', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);
    await openPageSettingsFromPageRow(page, newPageName);
    await expect(page.locator(SEL.pageNameInput).first(), 'page name input should be visible').toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Reject an empty page name', async () => {
    const input = page.locator(SEL.pageNameInput).first();
    await recordToasts(page);
    await input.fill('', { timeout: 10_000 });
    await input.blur();
    await expect
      .poll(async () => (await recordedToasts(page)).join(' | '), {
        message: 'empty page name should raise a validation toast',
        timeout: 10_000,
      })
      .toMatch(EMPTY_PAGE_NAME_MESSAGE);
  });

  await test.step('Reject a duplicate page name', async () => {
    const input = page.locator(SEL.pageNameInput).first();
    await input.fill('Page 1', { timeout: 10_000 });
    await input.blur();
    await expect
      .poll(async () => (await recordedToasts(page)).join(' | '), {
        message: 'duplicate page name should raise a validation toast',
        timeout: 10_000,
      })
      .toMatch(DUPLICATE_PAGE_NAME_MESSAGE);
  });

  await test.step('Save a valid page name and assert it persists after reload', async () => {
    const input = page.locator(SEL.pageNameInput).first();
    await input.fill(validName, { timeout: 10_000 });
    await input.blur();
    await expect(input, 'valid page name should stay in the settings input').toHaveValue(validName, {
      timeout: 10_000,
    });
    await closePageSettings(page);

    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).filter({ hasText: validName }).first(), `page row ${validName} should be listed`).toBeVisible({
      timeout: 15_000,
    });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expectEditorCanvasVisible(page);
    await openPagesPanel(page);
    await expect(
      page.locator(SEL.pageRow).filter({ hasText: validName }).first(),
      `page row ${validName} should persist after reload`,
    ).toBeVisible({ timeout: 30_000 });
  });
}

export async function deletePageCancelThenConfirmThroughUi(page: Page): Promise<void> {
  const pageName = await addPageThroughPagesPanel(page);
  await acceptRgpdIfVisible(page);

  await test.step('Cancel page deletion and assert the page remains listed', async () => {
    await clickPageDeleteAction(page, pageName);
    const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
    await expect(alert, 'page deletion confirmation should be visible').toBeVisible({ timeout: 15_000 });
    const cancel = alert.locator('button.alert-button-role-cancel, button.btn--info, button.alert-button').first();
    await expect(cancel, 'page deletion cancel action should be visible').toBeVisible({ timeout: 10_000 });
    await cancel.click({ timeout: 10_000 }).catch(async () => cancel.dispatchEvent('click'));
    await expect(alert, 'page deletion confirmation should close after cancel').toBeHidden({ timeout: 15_000 });
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).filter({ hasText: pageName }).first(), `page row ${pageName} should remain after cancel`).toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step('Confirm page deletion and assert the active page remains usable', async () => {
    await clickPageDeleteAction(page, pageName);
    const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
    await expect(alert, 'page deletion confirmation should reopen').toBeVisible({ timeout: 15_000 });
    const confirm = alert.locator('button.btn--danger, button.alert-button-role-confirm').last();
    await expect(confirm, 'page deletion confirm action should be visible').toBeVisible({ timeout: 10_000 });
    await confirm.click({ timeout: 10_000 }).catch(async () => confirm.dispatchEvent('click'));
    await expect(alert, 'page deletion confirmation should close after confirm').toBeHidden({ timeout: 15_000 });
    await openPagesPanel(page);
    await expect(page.locator(SEL.pageRow).filter({ hasText: pageName }).first(), `page row ${pageName} should be removed`).toHaveCount(
      0,
      { timeout: 15_000 },
    );
    await expect(page.locator(SEL.pageRow).first(), 'at least one page should remain after deletion').toBeVisible({
      timeout: 15_000,
    });
    await expectEditorCanvasVisible(page);
  });
}

export async function reorderPagesAndAssertPersistenceThroughUi(page: Page): Promise<void> {
  const secondPageName = await addPageThroughPagesPanel(page);
  const thirdPageName = await addPageThroughPagesPanel(page);

  await test.step('Reorder the third page before the first page', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);
    const beforeOrder = await visiblePageNames(page);
    expect(beforeOrder, 'three page rows should be visible before reordering').toEqual(['Page 1', secondPageName, thirdPageName]);

    await dragPageBefore(page, thirdPageName, 'Page 1');

    await expect
      .poll(() => visiblePageNames(page), {
        message: 'page rows should reflect the new drag-and-drop order',
        timeout: 20_000,
      })
      .toEqual([thirdPageName, 'Page 1', secondPageName]);
  });

  await test.step('Reload the editor and assert the page order persists', async () => {
    const editorUrl = page.url();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (!(await page.locator(SEL.pageButtonsBlock).first().isVisible({ timeout: 30_000 }).catch(() => false))) {
      await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }
    await expectEditorCanvasVisible(page);
    await openPagesPanel(page);
    await expect
      .poll(() => visiblePageNames(page), {
        message: 'page rows should keep the reordered order after reload',
        timeout: 30_000,
      })
      .toEqual([thirdPageName, 'Page 1', secondPageName]);
  });
}

export async function duplicatePageAndAssertCopiedContentThroughUi(
  page: Page,
  sourceTechnicalId = `functional_duplicate_text_${Date.now()}`,
): Promise<void> {
  await test.step('Create a source page with a configured Text input', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent).first(), 'source Text input should be visible before duplication').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, sourceTechnicalId);
    await closeComponentConfig(page);
    await expect(page.getByText(sourceTechnicalId, { exact: true }).first(), 'source technical ID should be visible').toBeVisible({
      timeout: 15_000,
    });
  });

  let copiedPageName = '';
  await test.step('Duplicate the source page from the Pages panel', async () => {
    await acceptRgpdIfVisible(page);
    await openPagesPanel(page);
    const beforeRows = await visiblePageRowLabels(page);
    expect(beforeRows, 'a blank application should expose one source page before duplication').toContain('Page 1');

    await clickPageDuplicateAction(page, 'Page 1');
    const alert = page.locator('ion-alert:not(.overlay-hidden)').last();
    await expect(alert, 'page duplication confirmation should be visible').toBeVisible({ timeout: 15_000 });
    const confirm = alert.locator('button.btn--success, button.alert-button-role-confirm').last();
    await expect(confirm, 'page duplication confirm action should be visible').toBeVisible({ timeout: 10_000 });
    await confirm.click({ timeout: 10_000 }).catch(async () => confirm.dispatchEvent('click'));
    await expect(alert, 'page duplication confirmation should close after confirm').toBeHidden({ timeout: 15_000 });

    await openPagesPanel(page);
    await expect
      .poll(() => visiblePageRowLabels(page), {
        message: 'duplicating a page should add a new page row',
        timeout: 20_000,
      })
      .toHaveLength(beforeRows.length + 1);
    const afterRows = await visiblePageRowLabels(page);
    copiedPageName = afterRows.find((name) => !beforeRows.includes(name)) ?? '';
    expect(copiedPageName, `a copied page name should be discoverable after rows ${afterRows.join(' | ')}`).not.toBe('');
  });

  await test.step('Open the copied page and assert the component was copied with a distinct ID', async () => {
    await openPagesPanel(page);
    const copiedRow = page.locator(SEL.pageRow).filter({ hasText: copiedPageName }).first();
    await expect(copiedRow, `copied page row ${copiedPageName} should be visible`).toBeVisible({ timeout: 15_000 });
    await copiedRow.click({ timeout: 10_000 }).catch(async () => copiedRow.dispatchEvent('click'));
    await expect(page.locator(SEL.textComponent).first(), 'copied page should contain the Text input component').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    const copiedTechnicalId = await page.locator(SEL.technicalIdInput).first().inputValue({ timeout: 15_000 });
    expect(copiedTechnicalId, 'copied component technical ID should not be empty').not.toBe('');
    expect(copiedTechnicalId, 'copied component technical ID should differ from the source component').not.toBe(sourceTechnicalId);
    await closeComponentConfig(page);
  });
}

export async function configurePageButtonsThroughUi(page: Page): Promise<void> {
  const secondPageName = await addPageThroughPagesPanel(page);
  await acceptRgpdIfVisible(page);

  await test.step('Configure page buttons as standard buttons', async () => {
    await openPageButtonsConfig(page);
    expect(await activePageSettingsSection(page), 'page buttons click should open Navigation settings').toBe('navigation');
    await ensurePageSpecificNavigationControlsVisible(page);
    await selectPageButtonsMode(page, 1);
    await closePageSettings(page);
    await expect
      .poll(() => pageButtonsUiState(page), {
        message: 'standard page buttons should be visible without tab roles',
        timeout: 15_000,
      })
      .toMatchObject({ visible: true, hasTabs: false });
  });

  await test.step('Configure page buttons as tab buttons', async () => {
    await openPageNavigationSettingsFromPageRow(page, secondPageName);
    await ensurePageSpecificNavigationControlsVisible(page);
    await selectPageButtonsMode(page, 2);
    await closePageSettings(page);
    await expect
      .poll(() => pageButtonsUiState(page), {
        message: 'tab page buttons should be visible with tab roles',
        timeout: 15_000,
      })
      .toMatchObject({ visible: true, hasTabs: true });
  });

  await test.step('Disable page buttons', async () => {
    await openPageNavigationSettingsFromPageRow(page, secondPageName);
    await ensurePageSpecificNavigationControlsVisible(page);
    await selectPageButtonsMode(page, 0);
    await closePageSettings(page);
    await expect
      .poll(() => pageButtonsUiState(page), {
        message: 'disabled page buttons should hide the page buttons block',
        timeout: 15_000,
      })
      .toMatchObject({ visible: false });
  });
}

export async function returnHomeAndReopenSameApplicationThroughUi(
  page: Page,
  title: string,
  applicationId: string,
): Promise<void> {
  await test.step('Add a witness component before leaving the editor', async () => {
    await openComponentsPalette(page, PALETTE_ICON.description);
    await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
    await expect
      .poll(() => countComponents(page), {
        message: 'application should contain a witness component before returning home',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  });

  await test.step('Return to the selector from the editor Home button', async () => {
    const home = page.locator(SEL.editorHomeButton).first();
    await expect(home, 'editor Home button should be visible').toBeVisible({ timeout: 15_000 });
    await home.click({ timeout: 10_000 }).catch(async () => home.dispatchEvent('click'));
    await expect(page.locator(SEL.selectorPageRoot).first(), 'selector page should be visible after returning home').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(SEL.blankFormCard).first(), 'selector creation card should be visible after returning home').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Reopen the same application from the selector', async () => {
    const cards = page.locator('[id^="idcard"]');
    let card = cards.filter({ hasText: title }).first();
    if (!(await card.isVisible({ timeout: 10_000 }).catch(() => false))) {
      card = cards.filter({ hasText: title.slice(0, 29) }).first();
    }
    await expect(card, `selector should show application card ${title}`).toBeVisible({ timeout: 30_000 });
    await card.click({ timeout: 10_000 }).catch(async () => card.dispatchEvent('click'));
    await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 60_000 });
    const reopenedId = page.url().match(/\/editor\/([^/?#]+)/)?.[1] ?? '';
    expect(reopenedId, 'reopened editor id should match the original application id').toBe(applicationId);
    await expect
      .poll(() => countComponents(page), {
        message: 'reopened application should keep its witness component',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  });
}

export async function autosaveComponentConfigurationAfterCloseAndReload(
  page: Page,
  technicalId = `functional_autosave_${Date.now()}`,
): Promise<void> {
  await test.step('Add and configure a Text input component', async () => {
    await openComponentsPalette(page, PALETTE_ICON.textInput);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await expect(page.locator(SEL.textComponent).first(), 'Text input component should be visible on the canvas').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.textComponent);
    await setTechnicalId(page, technicalId);
    await expect(page.locator(SEL.technicalIdInput).first(), 'technical ID input should keep the configured value').toHaveValue(
      technicalId,
      { timeout: 10_000 },
    );
  });

  await test.step('Close the configuration panel and reload the editor', async () => {
    await closeComponentConfig(page);
    await expect(page.getByText(technicalId, { exact: true }).first(), 'configured technical ID should be visible after close').toBeVisible({
      timeout: 15_000,
    });

    const editorUrl = page.url();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (!(await page.locator(SEL.pageButtonsBlock).first().isVisible({ timeout: 30_000 }).catch(() => false))) {
      await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }
    await expectEditorCanvasVisible(page);
    await expect(page.locator(SEL.textComponent).first(), 'Text input component should remain visible after reload').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Reopen the component configuration and assert the saved value', async () => {
    await openComponentConfigByTechnicalId(page, technicalId);
    await expect(page.locator(SEL.technicalIdInput).first(), 'technical ID should persist after close and reload').toHaveValue(
      technicalId,
      { timeout: 15_000 },
    );
  });
}

async function closeApplicationSettingsIfOpen(page: Page): Promise<void> {
  if (!(await page.locator(SEL.appSettingsCategories).first().isVisible({ timeout: 1_000 }).catch(() => false))) {
    return;
  }

  const stableClose = page.locator('button.class1780498802542').first();
  const roleClose = page.getByRole('button', { name: /^Close$/i }).last();
  const close = (await stableClose.isVisible({ timeout: 1_000 }).catch(() => false)) ? stableClose : roleClose;
  await expect(close, 'application Settings close button should be visible before returning to Palette').toBeVisible({
    timeout: 10_000,
  });
  await close.click({ timeout: 10_000 }).catch(async () => close.dispatchEvent('click'));
  await expect(page.locator(SEL.appSettingsCategories).first(), 'application Settings panel should close').toBeHidden({
    timeout: 15_000,
  });
}

async function openPageSettingsFromPageRow(page: Page, pageName: string): Promise<void> {
  const row = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(row, `page row ${pageName} should be visible before opening settings`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const editAction = page.locator(SEL.pageEditButton).first();
  if (await editAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await editAction.click({ timeout: 10_000 }).catch(async () => editAction.dispatchEvent('click'));
  } else {
    const rowBox = await row.boundingBox();
    const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
    expect(rowBox, `page row ${pageName} should have a bounding box`).not.toBeNull();
    expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
    if (!rowBox || !panelBox) {
      return;
    }
    await page.mouse.click(panelBox.x + panelBox.width - 86, rowBox.y + rowBox.height / 2);
  }

  await expect(page.locator(SEL.pageNameInput).first(), `page settings for ${pageName} should expose the name input`).toBeVisible({
    timeout: 15_000,
  });
}

async function clickPageDeleteAction(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const row = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(row, `page row ${pageName} should be visible before deleting`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const deleteAction = page.locator(SEL.pageDeleteAction).first();
  if (await deleteAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await deleteAction.click({ timeout: 10_000 }).catch(async () => deleteAction.dispatchEvent('click'));
    return;
  }

  const rowBox = await row.boundingBox();
  const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
  expect(rowBox, `page row ${pageName} should have a bounding box`).not.toBeNull();
  expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
  if (!rowBox || !panelBox) {
    return;
  }
  await page.mouse.click(panelBox.x + panelBox.width - 42, rowBox.y + rowBox.height / 2);
}

async function clickPageDuplicateAction(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const row = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(row, `page row ${pageName} should be visible before duplicating`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const duplicateAction = page.locator(PAGE_DUPLICATE_ACTION).first();
  if (await duplicateAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await duplicateAction.click({ timeout: 10_000 }).catch(async () => duplicateAction.dispatchEvent('click'));
    return;
  }

  const rowBox = await row.boundingBox();
  const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
  expect(rowBox, `page row ${pageName} should have a bounding box`).not.toBeNull();
  expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
  if (!rowBox || !panelBox) {
    return;
  }
  await page.mouse.click(panelBox.x + panelBox.width - 76, rowBox.y + rowBox.height / 2);
}

async function visiblePageRowLabels(page: Page): Promise<string[]> {
  return page.locator(SEL.pageRow).evaluateAll((rows) => {
    const labels: string[] = [];
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    for (const row of rows) {
      if (!visible(row)) {
        continue;
      }
      const label = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (label && !labels.includes(label)) {
        labels.push(label);
      }
    }
    return labels;
  });
}

async function visiblePageNames(page: Page): Promise<string[]> {
  return page.locator(SEL.pageRow).evaluateAll((rows) => {
    const names: string[] = [];
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    for (const row of rows) {
      if (!visible(row)) {
        continue;
      }
      const text = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
      const match = text.match(/\bPage\s+\d+\b/);
      if (match && !names.includes(match[0])) {
        names.push(match[0]);
      }
    }
    return names;
  });
}

async function dragPageBefore(page: Page, sourceName: string, targetName: string): Promise<void> {
  await openPagesPanel(page);
  const source = page.locator(SEL.pageRow).filter({ hasText: sourceName }).first();
  const target = page.locator(SEL.pageRow).filter({ hasText: targetName }).first();
  await expect(source, `source page row ${sourceName} should be visible before drag`).toBeVisible({ timeout: 15_000 });
  await expect(target, `target page row ${targetName} should be visible before drag`).toBeVisible({ timeout: 15_000 });

  await source.dragTo(target, {
    sourcePosition: { x: 16, y: 16 },
    targetPosition: { x: 16, y: 8 },
    timeout: 10_000,
  }).catch(() => undefined);

  const orderAfterNativeDrag = await visiblePageNames(page);
  if (orderAfterNativeDrag[0] === sourceName) {
    return;
  }

  const dispatched = await dispatchPageDragDrop(page, sourceName, targetName);
  expect(dispatched, `page drag/drop events should be dispatched for ${sourceName} before ${targetName}`).toBe(true);
}

async function dispatchPageDragDrop(page: Page, sourceName: string, targetName: string): Promise<boolean> {
  return page.evaluate(
    ({ rowSelector, source, target }) => {
      const visible = (element: Element): element is HTMLElement => {
        const box = (element as HTMLElement).getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const pageRows = [...document.querySelectorAll(rowSelector)].filter(visible);
      const uniqueRows: Array<{ name: string; element: HTMLElement }> = [];
      for (const row of pageRows) {
        const text = (row.textContent ?? '').replace(/\s+/g, ' ').trim();
        const match = text.match(/\bPage\s+\d+\b/);
        if (match && !uniqueRows.some((entry) => entry.name === match[0])) {
          uniqueRows.push({ name: match[0], element: row });
        }
      }
      const sourceIndex = uniqueRows.findIndex((entry) => entry.name === source);
      const targetEntry = uniqueRows.find((entry) => entry.name === target);
      const sourceEntry = uniqueRows[sourceIndex];
      if (sourceIndex < 0 || !sourceEntry || !targetEntry) {
        return false;
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.setData('__pagec8oformsdrag', 'true');
      dataTransfer.setData('index', String(sourceIndex));
      dataTransfer.setData('dropEffect', 'move');
      dataTransfer.effectAllowed = 'move';
      dataTransfer.dropEffect = 'move';

      const init: DragEventInit = { bubbles: true, cancelable: true, dataTransfer };
      sourceEntry.element.dispatchEvent(new DragEvent('dragstart', init));
      targetEntry.element.dispatchEvent(new DragEvent('dragenter', init));
      targetEntry.element.dispatchEvent(new DragEvent('dragover', init));
      targetEntry.element.dispatchEvent(new DragEvent('drop', init));
      sourceEntry.element.dispatchEvent(new DragEvent('dragend', init));
      return true;
    },
    { rowSelector: SEL.pageRow, source: sourceName, target: targetName },
  );
}

async function openPageNavigationSettingsFromPageRow(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  await openPageSettingsFromPageRow(page, pageName);
  const navigationTab = page.locator(SEL.pageSettingsNavigationTab).first();
  await expect(navigationTab, 'page Navigation settings tab should be visible').toBeVisible({ timeout: 15_000 });
  await navigationTab.click({ timeout: 10_000 }).catch(async () => navigationTab.dispatchEvent('click'));
  await expect
    .poll(() => activePageSettingsSection(page), {
      message: 'page settings should switch to Navigation',
      timeout: 10_000,
    })
    .toBe('navigation');
}

async function ensurePageSpecificNavigationControlsVisible(page: Page): Promise<void> {
  if (await visibleToggleWithButtonCountOrNull(page, 3, 1_000)) {
    return;
  }

  const modeToggle = await visibleToggleWithButtonCount(page, 2);
  const firstOption = modeToggle.locator('button.c8o-btn:visible').nth(0);
  await expect(firstOption, 'individual page navigation first option should be visible').toBeVisible({ timeout: 10_000 });
  await firstOption.click({ timeout: 10_000 }).catch(async () => firstOption.dispatchEvent('click'));
  await expect
    .poll(() => countVisibleToggleGroupsWithButtonCount(page, 3), {
      message: 'enabling page-specific navigation should reveal page button controls',
      timeout: 15_000,
    })
    .toBeGreaterThan(0);
}

async function selectPageButtonsMode(page: Page, optionIndex: 0 | 1 | 2): Promise<void> {
  const buttonsToggle = await visibleToggleWithButtonCount(page, 3);
  const buttons = buttonsToggle.locator('button.c8o-btn:visible');
  const option = buttons.nth(optionIndex);
  await expect(option, `page buttons mode option #${optionIndex} should be visible`).toBeVisible({ timeout: 10_000 });
  await option.click({ timeout: 10_000 }).catch(async () => option.dispatchEvent('click'));
  await expect(option, `page buttons mode option #${optionIndex} should be selected`).toHaveClass(/c8o-btn-selected/, {
    timeout: 10_000,
  });
}

async function visibleToggleWithButtonCount(page: Page, buttonCount: number): Promise<Locator> {
  const toggle = await visibleToggleWithButtonCountOrNull(page, buttonCount, 15_000);
  if (!toggle) {
    throw new Error(`No visible ToggleSwitch with ${buttonCount} buttons found`);
  }
  return toggle;
}

async function visibleToggleWithButtonCountOrNull(page: Page, buttonCount: number, timeout: number): Promise<Locator | null> {
  const startedAt = Date.now();
  do {
    const toggles = page.locator('c8oforms-toggleswitch:visible');
    const count = await toggles.count();
    for (let index = 0; index < count; index++) {
      const toggle = toggles.nth(index);
      if ((await toggle.locator('button.c8o-btn:visible').count()) === buttonCount) {
        return toggle;
      }
    }
    await page.waitForTimeout(250);
  } while (Date.now() - startedAt < timeout);
  return null;
}

async function countVisibleToggleGroupsWithButtonCount(page: Page, buttonCount: number): Promise<number> {
  const toggles = page.locator('c8oforms-toggleswitch:visible');
  let matching = 0;
  const count = await toggles.count();
  for (let index = 0; index < count; index++) {
    if ((await toggles.nth(index).locator('button.c8o-btn:visible').count()) === buttonCount) {
      matching++;
    }
  }
  return matching;
}

async function pageButtonsUiState(page: Page): Promise<{ visible: boolean; hasTabs: boolean; controlCount: number }> {
  return page.evaluate((tabBlockSelector) => {
    const visible = (element: Element): element is HTMLElement => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const inLowerCanvas = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      return box.y > window.innerHeight * 0.45 && box.x > 280;
    };
    const tabBlock = document.querySelector(tabBlockSelector);
    const tabControls =
      tabBlock && visible(tabBlock)
        ? [...tabBlock.querySelectorAll('button, ion-button, [role="button"], [role="tab"], ion-tab-button')].filter(visible)
        : [];
    if (tabControls.length > 0) {
      return { visible: true, hasTabs: true, controlCount: tabControls.length };
    }

    const standardControls = [...document.querySelectorAll('button, ion-button, [role="button"]')]
      .filter(visible)
      .filter(inLowerCanvas);
    return {
      visible: standardControls.length > 0,
      hasTabs: false,
      controlCount: standardControls.length,
    };
  }, SEL.pageButtonsBlock);
}

async function expectEditorCanvasVisible(page: Page): Promise<void> {
  await expect(page.locator(SEL.pageButtonsBlock).first(), 'editor canvas page buttons block should stay visible').toBeVisible({
    timeout: 15_000,
  });
}
