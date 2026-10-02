import { test } from './fixtures';
import {
  verifyAdvancedCsvSortingThroughUi,
  verifyAnonymousResponseTrackingThroughUi,
  verifyDefaultCsvUtf8RoundTripThroughUi,
  verifyLocalResponseTimeMatchesCsvThroughUi,
  verifyPhotoResponsesRenderWithoutDuplicationThroughUi,
} from './helpers/functional-responses';
import { loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional response visualization and export', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    timezoneId: 'Europe/Paris',
  });

  /**
   * #1501: reported in beta313. Commit b208391d separated asynchronous
   * response loading from rendering, preserved anonymous identity, and fixed
   * image/Individual response rendering in beta316. Historically QA-validated
   * in beta320. Runtime validation on the current test-nocode release is pending.
   */
  test('RESP-001 #1501 - photo responses render in Summary and Individual without duplication', async ({ page, browser }) => {
    test.setTimeout(540_000);
    await loginWithUsernamePassword(page);
    await verifyPhotoResponsesRenderWithoutDuplicationThroughUi(page, browser);
  });

  /**
   * #1506: reported in beta319. Commits 36fc7c7f and 700579cd snapshot the
   * anonymous publication mode and keep anonymous response rows distinct,
   * first shipped and historically QA-validated in beta324. Runtime validation
   * on the current test-nocode release is pending.
   */
  test('RESP-002 #1506 - anonymous response tracking hides identity and keeps every response distinct', async ({
    page,
    browser,
  }) => {
    test.setTimeout(540_000);
    await loginWithUsernamePassword(page);
    await verifyAnonymousResponseTrackingThroughUi(page, browser);
  });

  /**
   * #1512: reported in beta324. Commit 700c795b aligned response timestamps
   * and Time values with the browser timezone in beta327. Historically
   * QA-validated in beta333. Runtime validation on the current test-nocode
   * release is pending.
   */
  test('RESP-003 #1512 - response viewer and CSV preserve browser-local timestamps and Time answers', async ({
    page,
    browser,
  }) => {
    test.setTimeout(540_000);
    await loginWithUsernamePassword(page);
    await verifyLocalResponseTimeMatchesCsvThroughUi(page, browser);
  });

  /**
   * #1516: discovered while beta324 was current. Commit 700c795b changed the
   * default CSV writer charset and attachment metadata to UTF-8 in beta327.
   * Historically QA-validated in beta333. Runtime validation on the current
   * test-nocode release is pending.
   */
  test('RESP-004 #1516 - default CSV export round-trips Unicode as strict BOM-free UTF-8', async ({ page, browser }) => {
    test.setTimeout(540_000);
    await loginWithUsernamePassword(page);
    await verifyDefaultCsvUtf8RoundTripThroughUi(page, browser);
  });

  /**
   * #1522: requested in beta328. Commit e86b287d added question sorting by
   * technical ID/text and response sorting by ascending/descending date in
   * beta332. Historically QA-validated in beta333. Runtime validation on the
   * current test-nocode release is pending.
   */
  test('RESP-005 #1522 - advanced CSV export sorts questions and responses deterministically', async ({ page, browser }) => {
    test.setTimeout(600_000);
    await loginWithUsernamePassword(page);
    await verifyAdvancedCsvSortingThroughUi(page, browser);
  });
});
