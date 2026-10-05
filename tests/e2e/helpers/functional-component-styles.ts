import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  addHorizontalLayout,
  dragPaletteComponentInto,
  openApplicationSettingsFromSidebar,
  openComponentConfig,
  openComponentConfigAt,
  openEditor,
  openPageSettingsForPage,
  openPreview,
} from "./studio";
import { addPaletteComponentIntoGroup } from "./functional-components-common";

const COMPONENT_STYLE_SEL = {
  editor: ".c8o-style-manager-shell:visible",
  boxEditor: ".c8o-box-style-editor:visible",
  borderEditor: ".c8o-border-editor:visible",
  borderWidthInput: ".c8o-border-controls .c8o-border-unit-field input:visible",
  settingRow: ".c8o-box-setting-row",
  resetButton: ".c8o-mini-button:visible",
  inheritanceNote: ".c8o-box-inheritance-note:visible",
  borderSidePicker: ".c8o-border-side-picker",
  applicationCategoryButton: "button.app-settings-btn:visible",
} as const;

/**
 * Bounded vertical slice of #1411. All form creation and style mutations are
 * performed through the Studio UI. The observable contract is the computed
 * border of the Button's viewer card, where the product actually applies the
 * container box style.
 */
export async function verifyApplicationToButtonBorderInheritanceThroughUi(
  page: Page,
  applicationId: string,
): Promise<void> {
  let applicationInheritanceNote = "";

  await test.step("Add a Button and assert its finalized 1px border default", async () => {
    await addComponent(page, PALETTE_ICON.button, {
      allowEditorApiFallback: false,
    });
    await openComponentConfig(page, SEL.buttonComponent);

    const editor = await openButtonBoxStyleEditor(page);
    await expectBorderWidthInput(editor, "1");
  });

  await test.step("Set a 4px application border and observe Button inheritance in Preview", async () => {
    await closeComponentConfiguration(page);
    const editor = await openApplicationBoxStyleEditor(page);
    applicationInheritanceNote = await expectInheritanceNote(editor, "application");
    await setBorderWidthThroughVisualEditor(editor, "4");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, "4px");
  });

  await test.step("Override the application border at page scope and expose its inheritance indicator", async () => {
    await reopenEditorWithButton(page, applicationId);
    const editor = await openPageBoxStyleEditor(page);
    const pageInheritanceNote = await expectInheritanceNote(editor, "page");
    expect(pageInheritanceNote, "page and application inheritance indicators should identify distinct scopes").not.toBe(
      applicationInheritanceNote,
    );
    await setBorderWidthThroughVisualEditor(editor, "3");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, "3px");
  });

  await test.step("Override the Button border to 0 and remove all four visible sides", async () => {
    await reopenEditorWithButton(page, applicationId);
    await openComponentConfig(page, SEL.buttonComponent);
    const editor = await openButtonBoxStyleEditor(page);
    await setBorderWidthThroughVisualEditor(editor, "0");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, "0px");
  });

  await test.step("Configure every Button border side independently", async () => {
    await reopenEditorWithButton(page, applicationId);
    await openComponentConfig(page, SEL.buttonComponent);
    const editor = await openButtonBoxStyleEditor(page);
    await setIndividualBorderWidthsThroughVisualEditor(editor, {
      top: "2",
      right: "4",
      bottom: "6",
      left: "8",
    });

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, ["2px", "4px", "6px", "8px"]);
  });

  await test.step("Reset the Button border and inherit the 3px page border again", async () => {
    await reopenEditorWithButton(page, applicationId);
    await openComponentConfig(page, SEL.buttonComponent);
    const editor = await openButtonBoxStyleEditor(page);
    await resetBorderThroughVisualEditor(editor);
    await expectBorderWidthInput(editor, "1");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, "3px");
  });

  await test.step("Reset the page border and inherit the 4px application border again", async () => {
    await reopenEditorWithButton(page, applicationId);
    const editor = await openPageBoxStyleEditor(page);
    await expectInheritanceNote(editor, "page");
    await resetBorderThroughVisualEditor(editor);
    await expectBorderWidthInput(editor, "1");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, "4px");
  });

  await test.step("Reset the application border and restore the 1px product default", async () => {
    await reopenEditorWithButton(page, applicationId);
    const editor = await openApplicationBoxStyleEditor(page);
    await resetBorderThroughVisualEditor(editor);
    await expectBorderWidthInput(editor, "1");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidths(page, "1px");
  });

  await test.step("Override and reset a Layout child border against its parent-context default", async () => {
    await reopenEditorWithButton(page, applicationId);
    await addHorizontalLayout(page);
    await dragPaletteComponentInto(page, PALETTE_ICON.button, SEL.layoutViewer);
    await expect(page.locator(`${SEL.layoutViewer} ${SEL.buttonComponent}:visible`), "Layout should contain its Button child").toHaveCount(
      1,
      { timeout: 30_000 },
    );
    await openComponentConfigAt(page, SEL.buttonComponent, 1);
    let editor = await openButtonBoxStyleEditor(page);
    await expectChildStyleHint(editor, "Layout");
    await expectBorderWidthInput(editor, "1");
    await setBorderWidthThroughVisualEditor(editor, "5");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidthsAt(page, 1, "5px");

    await reopenEditorWithButton(page, applicationId);
    await openComponentConfigAt(page, SEL.buttonComponent, 1);
    editor = await openButtonBoxStyleEditor(page);
    await resetBorderThroughVisualEditor(editor);
    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidthsAt(page, 1, "1px");
  });

  await test.step("Override and reset a Group child border against its parent-context default", async () => {
    await reopenEditorWithButton(page, applicationId);
    await addComponent(page, PALETTE_ICON.group, { allowEditorApiFallback: false });
    await addPaletteComponentIntoGroup(page, PALETTE_ICON.button, 1);
    await expect(
      page.locator(`c8oforms-itemcardeditorviewer:visible ${SEL.buttonComponent}:visible`),
      "Group should contain its Button child",
    ).toHaveCount(1, { timeout: 30_000 });
    await openComponentConfigAt(page, SEL.buttonComponent, 2);
    let editor = await openButtonBoxStyleEditor(page);
    await expectChildStyleHint(editor, "Group");
    await expectBorderWidthInput(editor, "0");
    await setBorderWidthThroughVisualEditor(editor, "7");

    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidthsAt(page, 2, "7px");

    await reopenEditorWithButton(page, applicationId);
    await openComponentConfigAt(page, SEL.buttonComponent, 2);
    editor = await openButtonBoxStyleEditor(page);
    await resetBorderThroughVisualEditor(editor);
    await openPreview(page, SEL.buttonComponent);
    await expectButtonViewerBorderWidthsAt(page, 2, "0px");
  });
}

async function openPageBoxStyleEditor(page: Page): Promise<Locator> {
  await openPageSettingsForPage(page, "Page 1");
  return visibleBoxStyleEditor(page, "page Box style editor");
}

async function openButtonBoxStyleEditor(page: Page): Promise<Locator> {
  const styleSection = page.locator(`${SEL.styleSectionLabel}:visible`).first();
  await expect(
    styleSection,
    "Button configuration should expose its Style section",
  ).toBeVisible({ timeout: 15_000 });
  await styleSection
    .click({ timeout: 10_000 })
    .catch(async () => styleSection.dispatchEvent("click"));

  const tabs = page.locator(
    `${SEL.styleTabsContainer} ${SEL.styleTab}:visible`,
  );
  await expect(
    tabs,
    "Button Style should expose label, icon, and box tabs",
  ).toHaveCount(3, { timeout: 15_000 });
  const boxTab = tabs.nth(2);
  await boxTab
    .click({ timeout: 10_000 })
    .catch(async () => boxTab.dispatchEvent("click"));

  return visibleBoxStyleEditor(page, "Button Box style editor");
}

async function openApplicationBoxStyleEditor(page: Page): Promise<Locator> {
  await openApplicationSettingsFromSidebar(page);
  const categories = page
    .locator(`${SEL.appSettingsCategories}:visible`)
    .first();
  const buttons = categories.locator(
    COMPONENT_STYLE_SEL.applicationCategoryButton,
  );
  await expect
    .poll(() => buttons.count(), {
      message:
        "application Settings should expose General and Layout categories",
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(2);

  // Application settings declare General then Layout with stable bean order.
  const layout = buttons.nth(1);
  await layout
    .click({ timeout: 10_000 })
    .catch(async () => layout.dispatchEvent("click"));
  await expect(
    layout,
    "application Layout category should become active",
  ).toHaveClass(/app-settings-btn-active/, {
    timeout: 10_000,
  });

  return visibleBoxStyleEditor(page, "application Box style editor");
}

async function visibleBoxStyleEditor(
  page: Page,
  description: string,
): Promise<Locator> {
  const editor = page
    .locator(COMPONENT_STYLE_SEL.editor)
    .filter({ has: page.locator(COMPONENT_STYLE_SEL.boxEditor) })
    .first();
  await expect(editor, `${description} should be visible`).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    editor.locator(COMPONENT_STYLE_SEL.borderEditor),
    `${description} should expose border controls`,
  ).toBeVisible({
    timeout: 15_000,
  });
  return editor;
}

async function setBorderWidthThroughVisualEditor(
  editor: Locator,
  value: string,
): Promise<void> {
  const input = editor.locator(COMPONENT_STYLE_SEL.borderWidthInput).first();
  await expect(
    input,
    "visual border editor should expose a width input",
  ).toBeVisible({ timeout: 10_000 });
  await input.fill(value);
  await input.press("Tab");
  await expectBorderWidthInput(editor, value);
  await editor.page().waitForTimeout(1_200);
}

async function setIndividualBorderWidthsThroughVisualEditor(
  editor: Locator,
  widths: { top: string; right: string; bottom: string; left: string },
): Promise<void> {
  const selectors = {
    top: ".c8o-side-top",
    right: ".c8o-side-right",
    bottom: ".c8o-side-bottom",
    left: ".c8o-side-left",
  } as const;
  for (const side of ["top", "right", "bottom", "left"] as const) {
    const button = editor
      .locator(`${COMPONENT_STYLE_SEL.borderSidePicker} .c8o-side-button${selectors[side]}:visible`)
      .first();
    await expect(button, `${side} border selector should be visible`).toBeVisible({ timeout: 10_000 });
    await button.click({ timeout: 10_000 }).catch(async () => button.dispatchEvent("click"));
    await expect(button, `${side} border selector should become active`).toHaveClass(/is-active/, { timeout: 10_000 });
    await setBorderWidthThroughVisualEditor(editor, widths[side]);
    await expect(button, `${side} border should record its independent override`).toHaveClass(/has-override/, {
      timeout: 10_000,
    });
  }
}

async function expectInheritanceNote(editor: Locator, scope: "application" | "page"): Promise<string> {
  const note = editor.locator(COMPONENT_STYLE_SEL.inheritanceNote).first();
  await expect(note, `${scope} Box style editor should expose its inheritance indicator`).toBeVisible({
    timeout: 10_000,
  });
  const text = (await note.innerText()).replace(/\s+/g, " ").trim();
  expect(text, `${scope} inheritance indicator should contain a localized explanation`).not.toBe("");
  return text;
}

async function expectChildStyleHint(editor: Locator, parent: "Layout" | "Group"): Promise<void> {
  const hint = editor.locator(".c8o-box-child-warning:visible").first();
  await expect(hint, `${parent} child Box editor should expose its parent-context style hint`).toBeVisible({
    timeout: 10_000,
  });
  await expect
    .poll(() => hint.innerText().then((text) => text.replace(/\s+/g, " ").trim()), {
      message: `${parent} child style hint should contain a localized explanation`,
      timeout: 10_000,
    })
    .not.toBe("");
}

async function resetBorderThroughVisualEditor(editor: Locator): Promise<void> {
  const borderEditor = editor.locator(COMPONENT_STYLE_SEL.borderEditor).first();
  const row = borderEditor.locator(
    `xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' ${COMPONENT_STYLE_SEL.settingRow.slice(1)} ')][1]`,
  );
  const reset = row.locator(COMPONENT_STYLE_SEL.resetButton).first();
  await expect(
    reset,
    "visual border editor should expose its reset action",
  ).toBeVisible({ timeout: 10_000 });
  await reset
    .click({ timeout: 10_000 })
    .catch(async () => reset.dispatchEvent("click"));
  await editor.page().waitForTimeout(1_200);
}

async function expectBorderWidthInput(
  editor: Locator,
  expected: string,
): Promise<void> {
  const input = editor.locator(COMPONENT_STYLE_SEL.borderWidthInput).first();
  await expect(
    input,
    `border width editor should display ${expected}px`,
  ).toHaveValue(expected, { timeout: 10_000 });
}

async function expectButtonViewerBorderWidths(
  page: Page,
  expected: string | [string, string, string, string],
): Promise<void> {
  const expectedSides = typeof expected === "string" ? [expected, expected, expected, expected] : expected;
  await expect
    .poll(() => buttonViewerBorderWidths(page), {
      message: `Button viewer container should render border widths ${expectedSides.join(", ")}`,
      timeout: 20_000,
    })
    .toEqual(expectedSides);
}

async function expectButtonViewerBorderWidthsAt(page: Page, index: number, expected: string): Promise<void> {
  await expect
    .poll(() => buttonViewerBorderWidthsAt(page, index), {
      message: `Button #${index + 1} viewer container should render ${expected} on every border side`,
      timeout: 20_000,
    })
    .toEqual([expected, expected, expected, expected]);
}

async function buttonViewerBorderWidths(page: Page): Promise<string[]> {
  return buttonViewerBorderWidthsAt(page, 0);
}

async function buttonViewerBorderWidthsAt(page: Page, index: number): Promise<string[]> {
  const button = page.locator(`${SEL.buttonComponent}:visible`).nth(index);
  await expect(button, "Button should be visible in Preview").toBeVisible({
    timeout: 30_000,
  });
  const groupChild = button.locator('xpath=ancestor::div[contains(@class, "class1730739322495")][1]');
  const card = (await groupChild.count()) > 0
    ? groupChild
    : button.locator("xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' card ')][1]");
  await expect(
    card,
    "Button should be wrapped by the styled viewer card",
  ).toBeVisible({ timeout: 15_000 });
  return card.evaluate((element) => {
    const style = getComputedStyle(element);
    return [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ];
  });
}

async function closeComponentConfiguration(page: Page): Promise<void> {
  const close = page.locator(`${SEL.configClose}:visible`).first();
  await expect(
    close,
    "component configuration should expose its close action",
  ).toBeVisible({ timeout: 10_000 });
  await close
    .click({ timeout: 10_000 })
    .catch(async () => close.dispatchEvent("click"));
  await expect(close, "component configuration should close").toBeHidden({
    timeout: 10_000,
  });
}

async function reopenEditorWithButton(
  page: Page,
  applicationId: string,
): Promise<void> {
  await openEditor(page, applicationId);
  await expect(
    page.locator(`${SEL.buttonComponent}:visible`).first(),
    "Button should persist after returning to Studio",
  ).toBeVisible({
    timeout: 30_000,
  });
  await page
    .locator('[draggable="true"]')
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(800);
}
