import { expect, test } from './fixtures';
import { createBlankForm, editorSidebarTooltipTitles, login } from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1271
 * The ticket names no reported beta; 2.2.0-beta104 was the latest release at
 * creation time, so it is only a timing inference. Fix ff54af8e3 replaced
 * absent or generic sidebar hover text with action-specific native titles,
 * first shipped in 2.2.0-beta108. QA historically validated 2.2.0-beta112.
 * This latest-only test targets test-nocode running 2.2.0-beta371, without
 * deployment or a historical red phase. Its form is authored only via Studio.
 */
test.setTimeout(120_000);

test('#1271 - editor sidebar buttons expose distinct meaningful tooltips', async ({ page }) => {
  await test.step('Create a blank form through Studio', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1271 sidebar tooltips ${Date.now()}`);
  });

  const titles = await editorSidebarTooltipTitles(page);
  await test.step('Verify tooltip wording distinguishes each sidebar action', async () => {
    expect(titles).toHaveLength(4);
    expect(new Set(titles).size, 'sidebar actions should not share a generic tooltip').toBe(4);
    for (const title of titles) {
      expect(title, 'tooltip should be translated, not an i18n key').not.toMatch(/^(show_palette|app_settings|editor_menu_title_\w+)$/);
    }
  });
});
