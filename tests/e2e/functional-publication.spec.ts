import { test } from './fixtures';
import {
  publishAnonymousApplicationAndOpenWithoutSessionThroughUi,
  publishAuthenticatedApplicationThroughUi,
  submitSimplePublishedFormThroughUi,
  switchAnonymousPwaBackToAuthenticatedThroughUi,
  updateExistingPwaWithoutRepublishingThroughUi,
  verifyFrenchSingleResponseMessageThroughUi,
  verifySelectedOwnerCollaborationsOnlyThroughUi,
  verifyNonLoopingResponsePreservesEncodedNavigationDataThroughUi,
  verifyPwaConfigurationReopenAndViewerMetadataThroughUi,
  verifyPublishedPwaCacheMetadataThroughUi,
  verifyPublishedViewerResponsiveLayoutThroughUi,
  verifyPublishedViewerToolbarThemeThroughUi,
} from './helpers/functional-publication-sharing';
import {
  functionalAdminUserCredentials,
  functionalSecondaryUserCredentials,
  loginWithUsernamePassword,
} from './helpers/functional-studio';
import { ensureFunctionalUserIfPossible } from './helpers/functional-users';

test.describe('No-Code Studio functional publication contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('PUB-001 - publish an authenticated application', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await publishAuthenticatedApplicationThroughUi(page);
  });

  // #1248: an anonymous publication must open in a fresh browser context without an insufficient-permissions gate.
  test('PUB-002 - publish an anonymous application and open it without a session', async ({ page, browser }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await publishAnonymousApplicationAndOpenWithoutSessionThroughUi(page, browser);
  });

  test('PUB-003 - edit an existing PWA without republishing a new application', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await updateExistingPwaWithoutRepublishingThroughUi(page);
  });

  test('PUB-004 - switch an anonymous PWA back to authenticated', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await switchAnonymousPwaBackToAuthenticatedThroughUi(page);
  });

  /**
   * #1307: reported in beta118. The #1325 redesign commit 13f60641 bounded
   * the picker and its visual at 120px, first shipped in beta127 and was
   * historically QA-validated in beta127.
   */
  test('PUB-005 #1307 - PWA configuration reopens with a contained icon and viewer metadata', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyPwaConfigurationReopenAndViewerMetadataThroughUi(page);
  });

  test('PUB-006 - published viewer toolbar buttons follow the PWA theme', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedViewerToolbarThemeThroughUi(page);
  });

  test('PUB-007 - submit a simple published form', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await submitSimplePublishedFormThroughUi(page);
  });

  test('PUB-009 - published viewer remains usable on mobile tablet and desktop', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedViewerResponsiveLayoutThroughUi(page);
  });

  // #1314: every generated anonymous and authenticated sub-PWA must retain env.json.
  test('PUB-010 - published PWA exposes cache metadata resources', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedPwaCacheMetadataThroughUi(page);
  });

  /**
   * #1300: reported in beta114 (inferred from the release current at issue
   * creation). Commit b1d3e860 corrected the French agreement in
   * already_responded_once, first shipped and historically QA-validated in
   * beta116. Runtime validation on the current test-nocode release is pending.
   */
  test('PUB-011 #1300 - single-response rejection uses the corrected French message', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await verifyFrenchSingleResponseMessageThroughUi(page);
  });

  /**
   * #1302: reported in beta115 (inferred from the release current at issue
   * creation). Commit 19e56a9e decoded forwardData before the manual return to
   * viewerPage, first shipped in beta116 and historically QA-validated in
   * beta123. Runtime validation on the current test-nocode release is pending.
   */
  test('PUB-012 #1302 - manual resubmission preserves encoded navigation data', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await verifyNonLoopingResponsePreservesEncodedNavigationDataThroughUi(page);
  });

  /**
   * #1338: acfe2bb8 introduced the administrator user filter in beta139, but
   * still included applications where the selected user was only a
   * collaborator. Commit 6a41d745 made creator filtering unconditional when a
   * user is selected, first shipped in beta147 and historically QA-validated
   * in beta154.
   *
   * #1350: reported in beta141. After rejected/clarified iterations in
   * beta280, beta281, and beta292, commit 4701e65c sequenced the selected-owner
   * filter with the current user's collaborations. The final fix first shipped
   * in beta303 and was historically QA-validated in beta309. Runtime
   * validation on the current test-nocode release is pending.
   */
  test('PUB-013 #1338 #1350 - selected-owner collaboration filtering keeps only owned collaborations', async ({
    page,
    browser,
  }) => {
    test.setTimeout(540_000);
    const adminUser = functionalAdminUserCredentials();
    const ownerUser = functionalSecondaryUserCredentials();
    test.skip(!adminUser || !ownerUser, 'functional admin and secondary-user fixtures are required');
    test.skip(
      adminUser!.user.toLowerCase() === ownerUser!.user.toLowerCase(),
      'functional admin and selected owner must be distinct users',
    );

    await ensureFunctionalUserIfPossible(adminUser!, { admin: true });
    await ensureFunctionalUserIfPossible(ownerUser!);
    await loginWithUsernamePassword(page);
    await verifySelectedOwnerCollaborationsOnlyThroughUi(page, browser, adminUser!, ownerUser!);
  });
});
