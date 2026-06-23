import { test } from './fixtures';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  createBlankForm,
  expectGridFooterAndPaginationSettings,
  expectGridRowsPerPageValue,
  expectGridRowsPerPageVisible,
  login,
  openComponentConfig,
  openGridFormattingTab,
  setGridFooterEnabled,
  setGridPaginationMode,
  setGridRowsPerPage,
  setTechnicalId,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1410
 *
 * Feature absent in 2.2.0-beta239. Implemented by 1a1cada9 (first tagged in
 * 2.2.0-beta240) and validated OK in 2.2.0-beta241.
 *
 * Root cause/feature gap: Data Grid components had no authoring controls for
 * footer visibility, pagination mode, or rows per page. The fix adds those
 * controls to the Grid formatting tab and wires them to gridFooterEnabled,
 * gridPaginationEnabled, and gridRowsPerPage.
 *
 * The C8oForms form fixture is built only through Studio UI: create a blank
 * form, add a Data Grid, open its configuration, and edit the new formatting
 * controls. No form document writes or fixture shortcuts are used.
 */

const GRID_ID = 'grid_pagination_1410';

test.setTimeout(180_000);

test('#1410 - Data Grid exposes footer and pagination display settings', async ({ page }) => {
  await test.step('Log in to C8oForms', async () => {
    await login(page);
  });

  await test.step('Create a blank form and add a Data Grid', async () => {
    await createBlankForm(page, `Issue 1410 grid pagination ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.grid);
    await page.locator(SEL.gridComponent).first().waitFor({ state: 'visible', timeout: 30_000 });
  });

  await test.step('Open the Grid formatting settings', async () => {
    await openComponentConfig(page, SEL.gridComponent);
    await setTechnicalId(page, GRID_ID);
    await openGridFormattingTab(page);
  });

  await test.step('Assert footer and pagination controls can be changed', async () => {
    await expectGridFooterAndPaginationSettings(page);
    await setGridFooterEnabled(page, false);
    await setGridFooterEnabled(page, true);

    await setGridPaginationMode(page, 'all_rows');
    await expectGridRowsPerPageVisible(page, false);

    await setGridPaginationMode(page, 'paginated');
    await expectGridRowsPerPageVisible(page, true);
    await setGridRowsPerPage(page, '7');
  });

  await test.step('Reopen the Grid settings and assert rows per page persisted', async () => {
    await closeComponentConfig(page);
    await openComponentConfig(page, SEL.gridComponent);
    await openGridFormattingTab(page);
    await expectGridRowsPerPageVisible(page, true);
    await expectGridRowsPerPageValue(page, '7');
  });
});
