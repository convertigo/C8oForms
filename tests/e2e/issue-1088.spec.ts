import { expect, test } from './fixtures';
import {
  activePageSettingsSection,
  addPageThroughPagesPanel,
  closePageSettings,
  createBlankForm,
  login,
  openPageSettingsForPage,
} from './helpers/studio';

/**
 * Latest-only characterization test for https://github.com/convertigo/C8oForms/issues/1088
 * "Page Settings tab as default instead of Application tab".
 *
 * The issue did not name a broken version; 2.2.0-beta8 was the latest 2.2
 * release when it was filed. The redesigned behavior was validated by QA in
 * 2.2.0-beta115. This latest-only test was executed successfully on test-nocode
 * running 2.2.0-beta368. Per request, the historical red run is intentionally
 * omitted and no deployment was performed.
 *
 * Observed old mechanism: the page-description TinyMCE read
 * `form.pages[currentIndex].desc` only as its initial value, while its blur
 * handler wrote to the then-current index. Reusing that editor while switching
 * pages could therefore display Page 1 content and save it into Page 2. The
 * redesigned UI opens a dedicated Page settings context for the selected page;
 * its General section is the default and the old page-description TinyMCE is no
 * longer part of this screen.
 *
 * The form and its second page are created entirely through the Studio UI.
 */
test.setTimeout(120_000);

test('#1088 - page settings default to General and follow the selected page', async ({ page }) => {
  await test.step('Log in and create a two-page form', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1088 page settings ${Date.now()}`);
  });

  const secondPageName = await test.step('Add a second page through Studio', async () => {
    return addPageThroughPagesPanel(page);
  });

  await test.step('Open Page 1 settings in the default section', async () => {
    await openPageSettingsForPage(page, 'Page 1');
    expect(await activePageSettingsSection(page), 'Page 1 settings should default to General, not application settings').toBe(
      'general',
    );
  });

  await test.step('Switch the settings context to Page 2', async () => {
    await closePageSettings(page);
    await openPageSettingsForPage(page, secondPageName);
    expect(await activePageSettingsSection(page), 'Page 2 settings should default to General, not keep Page 1 settings').toBe(
      'general',
    );
  });

  await test.step('Switch the settings context back to Page 1', async () => {
    await closePageSettings(page);
    await openPageSettingsForPage(page, 'Page 1');
    expect(await activePageSettingsSection(page), 'Page 1 settings should be restored after visiting Page 2').toBe('general');
  });
});
