import { test } from '@playwright/test';
import {
  publishAnonymousApplicationAndOpenWithoutSessionThroughUi,
  publishAuthenticatedApplicationThroughUi,
  submitSimplePublishedFormThroughUi,
  switchAnonymousPwaBackToAuthenticatedThroughUi,
  updateExistingPwaWithoutRepublishingThroughUi,
  verifyPwaConfigurationReopenAndViewerMetadataThroughUi,
  verifyAnonymousPublishedQrToggleThroughUi,
  verifyEditorCollaboratorCanBeAddedThroughUi,
  verifyEditorCollaboratorCanFindSharedApplicationThroughUi,
  verifyEditorCollaboratorCanBeRemovedThroughUi,
  verifyEditorCollaboratorsCsvImportAddsExistingUserThroughUi,
  verifyEditorCollaboratorsCsvImportThroughUi,
  verifyPublishedShareNotificationFieldsThroughUi,
  verifyPublishedPwaCacheMetadataThroughUi,
  verifyPublishedApplicationCanBeSharedWithTemporaryGroupThroughUi,
  verifyPublishedGroupShareAllowsConfiguredMemberThroughUi,
  verifyAuthenticatedPublishedPwaRejectsUnauthorizedUserThroughUi,
  verifyCollaboratorCanFindSharedApplicationThroughUi,
  verifyCollaboratorRevocationHidesSharedApplicationThroughUi,
  verifyPublishedViewerToolbarThemeThroughUi,
  verifyPublishedViewerResponsiveLayoutThroughUi,
} from './helpers/functional-publication-sharing';
import { functionalSecondaryUserCredentials, loginWithUsernamePassword } from './helpers/functional-studio';
import { ensureFunctionalUserIfPossible } from './helpers/functional-users';

test.describe('No-Code Studio functional publication and sharing contract', () => {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('PUB-001 - publish an authenticated application', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await publishAuthenticatedApplicationThroughUi(page);
  });

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

  test('PUB-005 - PWA configuration reopens with name short name icon and viewer metadata', async ({ page }) => {
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

  test('PUB-010 - published PWA exposes cache metadata resources', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedPwaCacheMetadataThroughUi(page);
  });

  test('SHARE-007 - anonymous published application QR toggle remains usable', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyAnonymousPublishedQrToggleThroughUi(page);
  });

  test('SHARE-002 - editor collaborators modal exposes CSV import controls', async ({ page }) => {
    test.setTimeout(180_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorsCsvImportThroughUi(page);
  });

  test('SHARE-003 - import collaborators from CSV', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorsCsvImportAddsExistingUserThroughUi(page);
  });

  test('SHARE-001 - add a collaborator from the editor', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorCanBeAddedThroughUi(page);
  });

  test('SHARE-001 - added collaborator can find the shared application', async ({ page, browser }) => {
    test.setTimeout(420_000);
    const secondaryUser = functionalSecondaryUserCredentials();
    test.skip(
      !secondaryUser,
      'Set C8OFORMS_FUNCTIONAL_SECONDARY_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to auto-provision a functional secondary user.',
    );
    await ensureFunctionalUserIfPossible(secondaryUser!);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorCanFindSharedApplicationThroughUi(page, browser, secondaryUser!);
  });

  test('SHARE-004 - remove a collaborator from the editor', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorCanBeRemovedThroughUi(page);
  });

  test('SHARE-004 - removed collaborator loses access to the shared application', async ({ page, browser }) => {
    test.setTimeout(420_000);
    const secondaryUser = functionalSecondaryUserCredentials();
    test.skip(
      !secondaryUser,
      'Set C8OFORMS_FUNCTIONAL_SECONDARY_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to auto-provision a functional secondary user.',
    );
    await ensureFunctionalUserIfPossible(secondaryUser!);
    await loginWithUsernamePassword(page);
    await verifyCollaboratorRevocationHidesSharedApplicationThroughUi(page, browser, secondaryUser!);
  });

  test('SHARE-005 - share a published application with a temporary group', async ({ page }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedApplicationCanBeSharedWithTemporaryGroupThroughUi(page);
  });

  test('SHARE-005 - group member can open the shared published application', async ({ page, browser }) => {
    test.setTimeout(480_000);
    const secondaryUser = functionalSecondaryUserCredentials();
    test.skip(
      !secondaryUser,
      'Set C8OFORMS_FUNCTIONAL_SECONDARY_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to auto-provision a functional secondary user.',
    );
    await ensureFunctionalUserIfPossible(secondaryUser!);
    await loginWithUsernamePassword(page);
    await verifyPublishedGroupShareAllowsConfiguredMemberThroughUi(page, browser, secondaryUser!);
  });

  test('SHARE-006 - published application share notification fields are configurable', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedShareNotificationFieldsThroughUi(page);
  });

  test('SHARE-008 - authenticated published application denies an unauthorized user', async ({ page, browser }) => {
    test.setTimeout(360_000);
    const secondaryUser = functionalSecondaryUserCredentials();
    test.skip(
      !secondaryUser,
      'Set C8OFORMS_FUNCTIONAL_SECONDARY_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to auto-provision a functional secondary user.',
    );
    await ensureFunctionalUserIfPossible(secondaryUser!);
    await loginWithUsernamePassword(page);
    await verifyAuthenticatedPublishedPwaRejectsUnauthorizedUserThroughUi(page, browser, secondaryUser!);
  });

  test('SHARE-009 - collaborator can search an application shared by another owner', async ({ page, browser }) => {
    test.setTimeout(360_000);
    const secondaryUser = functionalSecondaryUserCredentials();
    test.skip(
      !secondaryUser,
      'Set C8OFORMS_FUNCTIONAL_SECONDARY_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to auto-provision a functional secondary user.',
    );
    await ensureFunctionalUserIfPossible(secondaryUser!);
    await loginWithUsernamePassword(page);
    await verifyCollaboratorCanFindSharedApplicationThroughUi(page, browser, secondaryUser!);
  });
});
