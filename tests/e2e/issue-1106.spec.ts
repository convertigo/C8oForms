import { test, expect } from './fixtures';
import {
  createBlankForm,
  expectSelectorSearchKeepsSingleApplication,
  login,
  openEditionApplicationsTab,
  openPublishedApplicationsTab,
  returnToSelectorFromEditor,
  searchSelectorApplicationsByName,
  selectorPaginationUiState,
  waitForSelectorPaginationExchange,
  type SelectorPaginationExchange,
} from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1106
 * "Forms Query Lacks Pagination in Edit Apps and Published Apps".
 *
 * The feature and its follow-up fixes introduced paginated APIV2_ExecuteView
 * requests, normalized response metadata, separate Edition/Publication state,
 * page-size options through 500 plus a localized infinite mode, and bounded
 * search pagination. QA validated the complete flow in 2.2.0-beta313.
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta369. Per request, it has no historical red run or deployment. Its
 * unique application fixture is created and searched entirely through the
 * Studio UI.
 */

test.setTimeout(180_000);

test('#1106 — Edition, Publication and search expose consistent pagination', async ({ page }) => {
  let editionExchange: SelectorPaginationExchange;
  let publicationExchange: SelectorPaginationExchange;

  await test.step('Open Edition applications and validate its paginated query', async () => {
    const exchange = waitForSelectorPaginationExchange(page, 'formsV2/out_folder');
    await login(page);
    editionExchange = await exchange;
    expectFirstPagePaginationContract(editionExchange);

    const ui = await selectorPaginationUiState(page);
    expect(ui.visibleInstances, 'Edition should render a pagination component').toBeGreaterThanOrEqual(1);
    expect(ui.currentPage, 'Edition should start on page 1, never page 0').toBe(1);
    expect(ui.totalPages, 'Edition should expose a positive total page count').toBeGreaterThanOrEqual(1);
    expect(ui.pageSizeOptions, 'Edition should expose every supported page size').toEqual([
      '10',
      '25',
      '50',
      '100',
      '500',
      'infinite',
    ]);
    expect(ui.infiniteLabel, 'the complete-list option should have a user-facing label').toBeTruthy();
    expect(ui.infiniteLabel?.toLowerCase(), 'the technical value infinite should not be displayed').not.toBe('infinite');
  });

  await test.step('Switch to Published applications and validate its independent paginated query', async () => {
    const exchange = waitForSelectorPaginationExchange(page, 'published_formsV2/out_folder');
    await openPublishedApplicationsTab(page);
    publicationExchange = await exchange;
    expectFirstPagePaginationContract(publicationExchange);

    expect(publicationExchange.request.pageSize).toBe(editionExchange.request.pageSize);
    const ui = await selectorPaginationUiState(page);
    expect(ui.currentPage, 'Publication should start on page 1').toBe(1);
    expect(ui.previousDisabled, 'Previous should be disabled on Publication page 1').toBe(true);
  });

  const title = `Issue1106-${Date.now()}`;
  await test.step('Create one application through Studio and search it from Edition', async () => {
    await openEditionApplicationsTab(page);
    await createBlankForm(page, title);
    await returnToSelectorFromEditor(page);
    await searchSelectorApplicationsByName(page, title);
    await expectSelectorSearchKeepsSingleApplication(page, title);
  });

  await test.step('Keep the single search result on a coherent first page', async () => {
    const ui = await selectorPaginationUiState(page);
    expect(ui.currentPage, 'a new search should reset pagination to page 1').toBe(1);
    expect(ui.totalPages, 'one matching application should occupy exactly one page').toBe(1);
    expect(ui.previousDisabled, 'Previous should be disabled for a one-page search').toBe(true);
    expect(ui.nextDisabled, 'Next should be disabled for a one-page search').toBe(true);
    expect(ui.emptyStateVisible, 'a matching search result must not display the empty-state message').toBe(false);
  });
});

function expectFirstPagePaginationContract(exchange: SelectorPaginationExchange): void {
  expect(exchange.request.pageSize, `${exchange.target} should send a numeric page size`).toEqual(expect.any(Number));
  expect(exchange.request.pageToken, `${exchange.target} first page should not send a page token`).toBeNull();
  expect(exchange.response.paginated, `${exchange.target} should return normalized pagination metadata`).toBe(true);
  expect(exchange.response.mode, `${exchange.target} should use the root-folder offset strategy`).toBe(
    'out_folder_offset',
  );
  expect(exchange.response.pageSize, `${exchange.target} should preserve the requested page size`).toBe(
    exchange.request.pageSize,
  );
  expect(exchange.response.currentPageIndex, `${exchange.target} should return zero-based page index 0`).toBe(0);
  expect(exchange.response.pageCount, `${exchange.target} should return at least one page`).toBeGreaterThanOrEqual(1);
  expect(exchange.response.returnedCount, `${exchange.target} should report the returned result count`).toBeGreaterThanOrEqual(
    0,
  );
  expect(exchange.response.totalCount, `${exchange.target} should report the total matching result count`).toBeGreaterThanOrEqual(
    exchange.response.returnedCount ?? 0,
  );
  expect(exchange.response.hasPreviousPage, `${exchange.target} page 1 should have no previous page`).toBe(false);
}
