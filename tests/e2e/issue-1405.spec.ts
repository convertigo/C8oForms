import { expect, test } from '@playwright/test';
import { createFormDocument, gridElement, login, openViewer, textElement, visibleIfFieldEquals } from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1405
 * "Grid columns are incorrectly sized when the grid becomes visible after being
 * hidden"
 *
 * Reproduced on 2.2.0-beta212, corrected in 2.2.0-beta213 after the beta213
 * dependency refresh. Root cause: the grid could compute its column sizes while
 * hidden, then keep compressed widths after the visibleIf condition revealed it.
 */
test.setTimeout(90_000);

test('#1405 - hidden grid recomputes column widths when it becomes visible', async ({ page }) => {
  const controllerId = 1405001;
  const gridId = 1405002;

  await login(page);
  const { id } = await createFormDocument(page, `Issue 1405 ${Date.now()}`, [
    {
      ...textElement('visibility_controller', {
        config: {
          label: 'Visibility controller',
          html: '<p>Visibility controller</p>',
          placeholder: 'type show',
        },
      }),
      id: controllerId,
    },
    {
      ...gridElement('hidden_grid', ['First column', 'Second column', 'Third column'], {
        conditions: visibleIfFieldEquals(String(controllerId), 'show'),
      }),
      id: gridId,
    },
  ]);

  await openViewer(page, id);
  await expect(page.locator('ion-input#visibility_controller input').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('c8oforms-itemgridviewer')).toBeHidden();

  await page.locator('ion-input#visibility_controller input').first().fill('show');
  await page.keyboard.press('Tab');
  await expect(page.locator('c8oforms-itemgridviewer').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.ag-header-cell').nth(2), 'the grid should render at least three columns').toBeVisible({
    timeout: 30_000,
  });

  const metrics = await page.locator('c8oforms-itemgridviewer').first().evaluate((grid) => {
    const gridBox = (grid as HTMLElement).getBoundingClientRect();
    const headerCells = [...grid.querySelectorAll('.ag-header-cell')]
      .slice(0, 3)
      .map((cell) => Math.round((cell as HTMLElement).getBoundingClientRect().width));
    return {
      gridWidth: Math.round(gridBox.width),
      minHeaderWidth: Math.min(...headerCells),
      summedHeaderWidth: headerCells.reduce((sum, width) => sum + width, 0),
    };
  });

  expect(metrics.gridWidth, 'the grid container should have a measurable width').toBeGreaterThan(900);
  expect(metrics.minHeaderWidth, 'visible grid columns must not remain compressed').toBeGreaterThan(150);
  expect(metrics.summedHeaderWidth, 'the first visible columns should use a substantial part of the grid').toBeGreaterThan(
    500,
  );
});
