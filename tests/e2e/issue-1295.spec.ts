import { expect, test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  closePageSettings,
  createBlankForm,
  expectViewerPageTitleHidden,
  expectViewerPageTitleVisible,
  login,
  openComponentConfigAt,
  openEditor,
  openPreview,
  openPublishedViewer,
  publishCurrentFormWithPwa,
  setDescriptionText,
  setPageTitleDisplayed,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1295
 * "Display page title" setting is not applied in Preview or Published mode.
 *
 * Found in 2.2.0-beta111. The fix series starts with 650a98f7, which made
 * viewerPage honor pages[currentIndex].isNameDisplayed, and continues with
 * 9ff3422d, which corrected migration/defaulting for page display metadata.
 * The ticket was validated OK in 2.2.0-beta127.
 *
 * Root cause: the viewer title block was rendered from the application name
 * without checking the page "display title" flag, so disabling the setting in
 * Page settings only affected the editor and the title still appeared in
 * Preview and published apps.
 *
 * The fixture is built entirely through Studio UI: create a blank application,
 * add a Description witness from the palette, disable the Page settings display
 * title control, preview the form, publish it as an anonymous PWA, then open
 * the published PWA.
 */

const WITNESS = 'Issue 1295 description witness';

test.setTimeout(300_000);

test('#1295 - Display page title is hidden in Preview and published app', async ({ page }) => {
  const title = `Issue 1295 page title ${Date.now()}`;
  let formId = '';

  await test.step('Create an application with visible content', async () => {
    await login(page);
    formId = await createBlankForm(page, title);

    await addComponent(page, PALETTE_ICON.description);
    await expect(page.locator(SEL.descriptionComponent), 'the Description witness should be added').toHaveCount(1, {
      timeout: 30_000,
    });
    await openComponentConfigAt(page, SEL.descriptionComponent, 0);
    await setDescriptionText(page, WITNESS);
    await closeComponentConfig(page);
  });

  await test.step('Guard that the title is normally rendered before changing Page settings', async () => {
    await openPreview(page, SEL.descriptionComponent);
    await expect(page.getByText(WITNESS, { exact: true }).first(), 'the Description witness should render in Preview').toBeVisible({
      timeout: 30_000,
    });
    await expectViewerPageTitleVisible(page, title);
  });

  await test.step('Disable the page title from Page settings', async () => {
    await openEditor(page, formId);
    await expect(page.locator(SEL.descriptionComponent), 'the editor should reopen the Description witness').toHaveCount(1, {
      timeout: 30_000,
    });
    await setPageTitleDisplayed(page, false);
    await closePageSettings(page);
  });

  await test.step('Preview hides the application title while keeping page content visible', async () => {
    await openPreview(page, SEL.descriptionComponent);
    await expect(page.getByText(WITNESS, { exact: true }).first(), 'the Description witness should still render in Preview').toBeVisible({
      timeout: 30_000,
    });
    await expectViewerPageTitleHidden(page, title);
  });

  await test.step('Published app hides the application title while keeping page content visible', async () => {
    await openEditor(page, formId);
    await expect(page.locator(SEL.descriptionComponent), 'the editor should reopen before publishing').toHaveCount(1, {
      timeout: 30_000,
    });
    await publishCurrentFormWithPwa(page, 'anonymous');
    await openPublishedViewer(page, formId, SEL.descriptionComponent);
    await expect(
      page.getByText(WITNESS, { exact: true }).first(),
      'the Description witness should render in the published app',
    ).toBeVisible({ timeout: 30_000 });
    await expectViewerPageTitleHidden(page, title);
  });
});
