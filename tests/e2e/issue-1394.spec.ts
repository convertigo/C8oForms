import { test, expect, Page } from '@playwright/test';
import {
  SEL,
  PALETTE_ICON,
  SourcePaletteSection,
  login,
  createBlankForm,
  addComponent,
  openComponentConfig,
  setTechnicalId,
  waitForSourcePaletteSections,
  clickSourcePaletteCollapseAll,
  clickSourcePaletteSection,
  sourcePaletteSectionStates,
} from './helpers/studio';

/**
 * Regression/characterization test for
 * https://github.com/convertigo/C8oForms/issues/1394
 * "Source palette should offer a collapse all option".
 *
 * Broken in 2.2.0-beta193 and earlier: the Source palette had no global action
 * to collapse expanded sections. The feature was introduced by d6fd70ec
 * (first released in 2.2.0-beta194) and validated after follow-up UI fixes in
 * 96ef0325 (first released in 2.2.0-beta225). The green validation for this
 * regression was run on the latest available release at creation time:
 * 2.2.0-beta226.
 *
 * Root cause: the palette only stored per-section expansion state. The fix
 * added a list-collapse button and shared local collapse/onClickCollapse state
 * so one action can close all visible palette sections while keeping individual
 * section toggles coherent afterward.
 */
test.setTimeout(120_000);

test('#1394 - source palette collapse-all closes every section and preserves manual toggles', async ({ page }) => {
  await login(page);
  await createBlankForm(page, `Issue 1394 ${Date.now()}`);

  await addComponent(page, PALETTE_ICON.description);
  await page.locator('c8oforms-itemdescriptionviewer').first().waitFor({ state: 'visible', timeout: 30_000 });
  await openComponentConfig(page, 'c8oforms-itemdescriptionviewer');
  await setTechnicalId(page, 'desc_source_palette');

  await page.frameLocator('iframe[title="Rich Text Area"]').locator('body').waitFor({
    state: 'visible',
    timeout: 30_000,
  });

  const sections = await waitForSourcePaletteSections(page, 4);
  await expect(
    page.locator(SEL.sourcePaletteCollapseAllButton).first(),
    'the Source palette should expose the collapse-all action',
  ).toBeVisible({ timeout: 15_000 });

  await expect
    .poll(() => expandedSourcePaletteSections(page, sections), {
      message: 'the selected Source palette sections should start expanded',
      timeout: 15_000,
    })
    .toEqual(sections);

  await clickSourcePaletteCollapseAll(page);
  await expect
    .poll(() => expandedSourcePaletteSections(page, sections), {
      message: 'collapse-all should close every visible Source palette section',
      timeout: 15_000,
    })
    .toEqual([]);

  await clickSourcePaletteSection(page, sections[0]);
  await expect
    .poll(() => expandedSourcePaletteSections(page, sections), {
      message: 'manual expansion should still work after collapse-all',
      timeout: 15_000,
    })
    .toEqual([sections[0]]);

  await clickSourcePaletteSection(page, sections[0]);
  await expect
    .poll(() => expandedSourcePaletteSections(page, sections), {
      message: 'manual collapse should still work after collapse-all',
      timeout: 15_000,
    })
    .toEqual([]);
});

async function expandedSourcePaletteSections(
  page: Page,
  sections: SourcePaletteSection[],
): Promise<SourcePaletteSection[]> {
  return (await sourcePaletteSectionStates(page, sections))
    .filter((state) => state.expanded)
    .map((state) => state.name);
}
