import { test, expect } from '@playwright/test';
import {
  login,
  createBlankForm,
  openEditor,
  acceptRgpdIfVisible,
  openPageButtonsConfig,
  activePageSettingsSection,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1392
 * "Clicking the Page buttons configuration redirects to General instead of
 * Navigation".
 *
 * Found in 2.2.0-beta178, fixed by 542344019 (fix(actionsButtons)), OK in
 * beta187+. Root cause: the click handler on the page navigation buttons block
 * left `page.local.currentPageSettingsPanel` on 'general'; the fix sets it to
 * 'navigation'. The active section is reflected by the `app-settings-btn-active`
 * class on the General / Navigation section toggles.
 *
 * Fixture is built entirely through the No Code Studio UI (createBlankForm) — a
 * blank form already has a page with the navigation buttons block.
 */
test('#1392 - clicking the page buttons block opens the Navigation section, not General', async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  const id = await createBlankForm(page, `Repro 1392 ${Date.now()}`);
  await openEditor(page, id);
  await acceptRgpdIfVisible(page);

  // Click the page navigation buttons block. The context guard inside the helper
  // fails loudly if the page settings don't open at all (broken setup, not bug).
  await openPageButtonsConfig(page);

  // The bug opens the "General" section; the fix opens "Navigation".
  expect(
    await activePageSettingsSection(page),
    'clicking the page buttons block must open the Navigation section, not General',
  ).toBe('navigation');
});
