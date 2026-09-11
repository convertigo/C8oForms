import { test } from '@playwright/test';
import {
  verifyAuthenticatedPublishedPwaRejectsUnauthorizedUserThroughUi,
  verifyCollaboratorCanFindSharedApplicationThroughUi,
  verifyCollaboratorRevocationHidesSharedApplicationThroughUi,
  verifyEditorCollaboratorCanFindSharedApplicationThroughUi,
  verifyPublishedApplicationCanBeSharedWithTemporaryGroupThroughUi,
  verifyPublishedGroupShareAllowsConfiguredMemberThroughUi,
} from './helpers/functional-publication-sharing';
import { functionalSecondaryUserCredentials, loginWithUsernamePassword } from './helpers/functional-studio';
import { ensureFunctionalUserIfPossible } from './helpers/functional-users';

test.describe('No-Code Studio functional sharing access contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
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
