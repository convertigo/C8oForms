import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addPageThroughPagesPanel,
  checkViewerCheckboxOption,
  closeComponentConfig,
  configureComponentNavigationFilter,
  closePageSettings,
  expectComponentNavigationFilter,
  openComponentConfig,
  openComponentsPalette,
  openConfigTabById,
  openPagesPanel,
  openPreview,
  selectViewerRadioOption,
  setChoiceLocalOptions,
  setDescriptionText,
  setTechnicalId,
} from './studio';

const VIEWER_NEXT_BUTTON = [
  'page-viewerpage ion-tab-button.class1664274551545:has(ion-icon[name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button.class1664274551545:has(ion-icon[ng-reflect-name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button:has(ion-icon[name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button:has(ion-icon[ng-reflect-name="arrow-forward-outline"])',
  'page-viewerpage ion-tab-button.class1664274551545',
].join(', ');

export async function navigateToSecondPageThroughViewerNextButton(page: Page): Promise<void> {
  const suffix = Date.now();
  const sourceMarker = `Functional navigation source ${suffix}`;
  const targetMarker = `Functional navigation target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a visible marker on Page 1', async () => {
    await addDescriptionMarker(page, `functional_nav_source_${suffix}`, sourceMarker);
  });

  await test.step('Create a second page with a visible marker', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Open Preview on Page 1', async () => {
    await openPreview(page, SEL.descriptionComponent);
    await expect(page.getByText(sourceMarker, { exact: true }).first(), 'viewer should start on Page 1').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'target page marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Navigate to the second page with the viewer Next button', async () => {
    const next = await visibleViewerNextButton(page);
    await next.scrollIntoViewIfNeeded().catch(() => undefined);
    await next.click({ timeout: 10_000 }).catch(async () => next.dispatchEvent('click'));
    await expect(page.getByText(targetMarker, { exact: true }).first(), `viewer should navigate to ${targetPageName}`).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(sourceMarker, { exact: true }).first(), 'source page marker should be hidden after navigation').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateConditionallyByRadioValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const radioTechnicalId = `functional_nav_radio_${suffix}`;
  const blockedOption = `Functional blocked ${suffix}`;
  const acceptedOption = `Functional accepted ${suffix}`;
  const targetMarker = `Functional conditional target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_conditional_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Radio component with conditional navigation', async () => {
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.radioComponent}:visible`).first(), 'navigation Radio component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, radioTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the non-matching value does not navigate', async () => {
    await openPreview(page, SEL.radioComponent);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'viewer should start on Page 1 with the Radio visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await selectViewerRadioOption(page, radioTechnicalId, blockedOption);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'blocked value should keep the source page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'blocked value should not open the target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching value and verify navigation to the target page', async () => {
    await clickViewerRadioOptionForNavigation(page, radioTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted value should open the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'accepted value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateConditionallyBySelectValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const selectTechnicalId = `functional_nav_select_${suffix}`;
  const blockedOption = `Functional select blocked ${suffix}`;
  const acceptedOption = `Functional select accepted ${suffix}`;
  const targetMarker = `Functional select target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_select_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Select component with conditional navigation', async () => {
    await openComponentsPalette(page, PALETTE_ICON.select);
    await addComponent(page, PALETTE_ICON.select, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.selectComponent}:visible`).first(), 'navigation Select component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.selectComponent);
    await setTechnicalId(page, selectTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: selectTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the non-matching Select value does not navigate', async () => {
    await openPreview(page, SEL.selectComponent);
    await expect(page.locator(`#${selectTechnicalId}`).first(), 'viewer should start on Page 1 with the Select visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'Select target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await selectViewerSelectOption(page, selectTechnicalId, blockedOption);
    await expect(page.locator(`#${selectTechnicalId}`).first(), 'blocked Select value should keep the source page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'blocked Select value should not open the target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching Select value and verify navigation to the target page', async () => {
    await selectViewerSelectOption(page, selectTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted Select value should open the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${selectTechnicalId}`).first(), 'accepted Select value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateConditionallyByCheckboxValueThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const checkboxTechnicalId = `functional_nav_checkbox_${suffix}`;
  const blockedOption = `Functional checkbox blocked ${suffix}`;
  const acceptedOption = `Functional checkbox accepted ${suffix}`;
  const targetMarker = `Functional checkbox target ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_checkbox_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Checkbox component with conditional navigation', async () => {
    await openComponentsPalette(page, PALETTE_ICON.checkbox);
    await addComponent(page, PALETTE_ICON.checkbox, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.checkboxComponent}:visible`).first(), 'navigation Checkbox component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.checkboxComponent);
    await setTechnicalId(page, checkboxTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(
      page,
      {
        field: checkboxTechnicalId,
        operator: 'among_following',
        value: acceptedOption,
        action: 'goTo',
        pageName: targetPageName,
      } as Parameters<typeof configureComponentNavigationFilter>[1],
    );
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the non-matching Checkbox value does not navigate', async () => {
    await openPreview(page, SEL.checkboxComponent);
    await expect(page.locator(`#${checkboxTechnicalId}`).first(), 'viewer should start on Page 1 with the Checkbox visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'Checkbox target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await checkViewerCheckboxOption(page, checkboxTechnicalId, blockedOption);
    await expect(page.locator(`#${checkboxTechnicalId}`).first(), 'blocked Checkbox value should keep the source page visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'blocked Checkbox value should not open the target page').toBeHidden({
      timeout: 30_000,
    });
  });

  await test.step('Select the matching Checkbox value and verify navigation to the target page', async () => {
    await clickViewerCheckboxOptionForNavigation(page, checkboxTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted Checkbox value should open the target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${checkboxTechnicalId}`).first(), 'accepted Checkbox value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

export async function navigateToRenamedPageThroughConditionalRadioThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const radioTechnicalId = `functional_nav_rename_radio_${suffix}`;
  const acceptedOption = `Functional rename accepted ${suffix}`;
  const blockedOption = `Functional rename blocked ${suffix}`;
  const targetMarker = `Functional renamed navigation target ${suffix}`;
  const renamedPageName = `Functional renamed page ${suffix}`;
  let targetPageName = '';

  await test.step('Create a target page with a visible marker and return to Page 1', async () => {
    targetPageName = await addPageThroughPagesPanel(page);
    await selectEditorPageByName(page, targetPageName);
    await addDescriptionMarker(page, `functional_nav_renamed_target_${suffix}`, targetMarker);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Create a Radio component with conditional navigation to the target page', async () => {
    await openComponentsPalette(page, PALETTE_ICON.radio);
    await addComponent(page, PALETTE_ICON.radio, { allowEditorApiFallback: false });
    await expect(page.locator(`${SEL.radioComponent}:visible`).first(), 'rename navigation Radio component should be visible').toBeVisible({
      timeout: 30_000,
    });
    await openComponentConfig(page, SEL.radioComponent);
    await setTechnicalId(page, radioTechnicalId);
    await setChoiceLocalOptions(page, [blockedOption, acceptedOption]);
    await openConfigTabById(page, 'navigation_tab_selector');
    await configureComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: targetPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Rename the target page after the navigation rule has been configured', async () => {
    await renamePageFromPagesPanel(page, targetPageName, renamedPageName);
    await selectEditorPageByName(page, 'Page 1');
  });

  await test.step('Reopen the Radio navigation config and assert the target follows the renamed page', async () => {
    await openComponentConfig(page, SEL.radioComponent);
    await openConfigTabById(page, 'navigation_tab_selector');
    await expectComponentNavigationFilter(page, {
      field: radioTechnicalId,
      operator: 'equals',
      value: acceptedOption,
      action: 'goTo',
      pageName: renamedPageName,
    });
    await closeComponentConfig(page);
  });

  await test.step('Open Preview and verify the Radio still navigates to the renamed target page', async () => {
    await openPreview(page, SEL.radioComponent);
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'viewer should start on Page 1 with the Radio visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'renamed target marker should start hidden').toBeHidden({
      timeout: 30_000,
    });
    await clickViewerRadioOptionForNavigation(page, radioTechnicalId, acceptedOption);
    await expect(page.getByText(targetMarker, { exact: true }).first(), 'accepted value should open the renamed target page').toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`#${radioTechnicalId}`).first(), 'accepted value should leave the source page').toBeHidden({
      timeout: 30_000,
    });
  });
}

async function addDescriptionMarker(page: Page, technicalId: string, text: string): Promise<void> {
  await openComponentsPalette(page, PALETTE_ICON.description);
  const before = await page.locator(SEL.descriptionComponent).count();
  await addComponent(page, PALETTE_ICON.description, { allowEditorApiFallback: false });
  await expect
    .poll(() => page.locator(SEL.descriptionComponent).count(), {
      message: `Description marker ${technicalId} should be added`,
      timeout: 30_000,
    })
    .toBeGreaterThan(before);
  await openComponentConfig(page, SEL.descriptionComponent);
  await setTechnicalId(page, technicalId);
  await setDescriptionText(page, text);
  await closeComponentConfig(page);
}

async function renamePageFromPagesPanel(page: Page, currentName: string, nextName: string): Promise<void> {
  await openPagesPanel(page);
  const row = page.locator(SEL.pageRow).filter({ hasText: currentName }).first();
  await expect(row, `page row ${currentName} should be visible before renaming`).toBeVisible({ timeout: 15_000 });
  await row.hover();

  const editAction = page.locator(SEL.pageEditButton).first();
  if (await editAction.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await editAction.click({ timeout: 10_000 }).catch(async () => editAction.dispatchEvent('click'));
  } else {
    const rowBox = await row.boundingBox();
    const panelBox = await page.locator(SEL.pageSearchbar).first().boundingBox();
    expect(rowBox, `page row ${currentName} should have a bounding box`).not.toBeNull();
    expect(panelBox, 'Pages panel should have a bounding box').not.toBeNull();
    if (!rowBox || !panelBox) {
      throw new Error(`Could not locate page edit action for ${currentName}`);
    }
    await page.mouse.click(panelBox.x + panelBox.width - 86, rowBox.y + rowBox.height / 2);
  }

  const input = page.locator(SEL.pageNameInput).first();
  await expect(input, `page settings for ${currentName} should expose the name input`).toBeVisible({
    timeout: 15_000,
  });
  await input.fill(nextName);
  await input.blur();
  await expect(input, 'page name input should keep the renamed value').toHaveValue(nextName, { timeout: 10_000 });
  await closePageSettings(page);
  await openPagesPanel(page);
  await expect(page.locator(SEL.pageRow).filter({ hasText: nextName }).first(), `page row ${nextName} should be listed`).toBeVisible({
    timeout: 15_000,
  });
}

async function selectEditorPageByName(page: Page, pageName: string): Promise<void> {
  await openPagesPanel(page);
  const pageRow = page.locator(SEL.pageRow).filter({ hasText: pageName }).first();
  await expect(pageRow, `page row ${pageName} should be visible`).toBeVisible({ timeout: 15_000 });
  await pageRow.click({ timeout: 10_000 }).catch(async () => pageRow.dispatchEvent('click'));
  await expect(page.locator(SEL.pageButtonsBlock).first(), `page ${pageName} canvas should be visible`).toBeVisible({
    timeout: 15_000,
  });
}

async function visibleViewerNextButton(page: Page): Promise<Locator> {
  const button = page.locator(VIEWER_NEXT_BUTTON).first();
  await expect(button, 'viewer Next button should be visible').toBeVisible({ timeout: 30_000 });
  return button;
}

async function clickViewerRadioOptionForNavigation(page: Page, technicalId: string, option: string): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Radio ${technicalId} should be visible before navigation`).toBeVisible({ timeout: 30_000 });
  const item = root.locator('ion-item').filter({ hasText: option }).first();
  if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
    return;
  }
  const label = root.getByText(option, { exact: true }).first();
  await expect(label, `viewer Radio option ${option} should be visible before navigation`).toBeVisible({ timeout: 10_000 });
  await label.click({ timeout: 10_000 }).catch(async () => label.dispatchEvent('click'));
}

async function selectViewerSelectOption(page: Page, technicalId: string, option: string): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Select ${technicalId} should be visible before selecting ${option}`).toBeVisible({
    timeout: 30_000,
  });

  const select = root.locator('ion-select').first();
  await expect(select, `viewer Select ${technicalId} should expose an ion-select`).toBeVisible({ timeout: 10_000 });

  const overlaySelector =
    'ion-select-popover:visible, ion-popover:not(.overlay-hidden):visible, ion-alert:not(.overlay-hidden):visible, .class1599133954837:visible, cdk-virtual-scroll-viewport:visible';
  for (let attempt = 0; attempt < 3; attempt++) {
    await select.scrollIntoViewIfNeeded().catch(() => undefined);
    const box = await select.boundingBox();
    if (box) {
      await page.mouse.click(box.x + Math.max(box.width - 24, 4), box.y + box.height / 2);
    } else {
      await select.click({ timeout: 10_000 }).catch(async () => select.dispatchEvent('click'));
    }

    const overlay = page.locator(overlaySelector).filter({ hasText: option }).last();
    if (await overlay.isVisible({ timeout: 15_000 }).catch(() => false)) {
      const roleOption = page.getByRole('radio', { name: option, exact: true }).first();
      const optionLocator = (await roleOption.isVisible({ timeout: 1_000 }).catch(() => false))
        ? roleOption
        : overlay.locator('ion-item, ion-radio, [role="option"], [role="radio"], button').filter({ hasText: option }).first();
      await expect(optionLocator, `viewer Select option ${option} should be visible`).toBeVisible({ timeout: 10_000 });
      await optionLocator.click({ force: true, timeout: 10_000 });
      await expect(page.locator(overlaySelector), 'viewer Select options overlay should close').toHaveCount(0, { timeout: 10_000 });
      await page.waitForTimeout(750);
      const selectValue = await select.evaluate((element) => String((element as HTMLElement & { value?: unknown }).value ?? '')).catch(() => '');
      if (selectValue !== option && (await select.isVisible({ timeout: 1_000 }).catch(() => false))) {
        await select.evaluate((element, value) => {
          const ionSelect = element as HTMLElement & { value?: unknown };
          ionSelect.value = value;
          ionSelect.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
          ionSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
          ionSelect.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
        }, option);
        await page.waitForTimeout(750);
      }
      if (await root.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await expect(root, `viewer Select ${technicalId} should display ${option}`).toContainText(option, { timeout: 10_000 });
      }
      await page.waitForTimeout(500);
      return;
    }

    await page.keyboard.press('Escape').catch(() => undefined);
    await expect(page.locator(overlaySelector), 'stale viewer Select overlay should close before retry')
      .toHaveCount(0, { timeout: 5_000 })
      .catch(() => undefined);
    await page.waitForTimeout(500);
  }

  throw new Error(`viewer Select option ${option} should be visible`);
}

async function clickViewerCheckboxOptionForNavigation(page: Page, technicalId: string, option: string): Promise<void> {
  const root = page.locator(`#${technicalId}`).first();
  await expect(root, `viewer Checkbox ${technicalId} should be visible before navigation`).toBeVisible({ timeout: 30_000 });
  const item = root.locator('ion-item').filter({ hasText: option }).first();
  if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await item.click({ timeout: 10_000 }).catch(async () => item.dispatchEvent('click'));
    return;
  }

  const label = root.getByText(option, { exact: true }).first();
  await expect(label, `viewer Checkbox option ${option} should be visible before navigation`).toBeVisible({ timeout: 10_000 });
  await label.click({ timeout: 10_000 }).catch(async () => label.dispatchEvent('click'));
}
