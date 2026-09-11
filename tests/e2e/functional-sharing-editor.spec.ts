import { test } from '@playwright/test';
import {
  verifyAnonymousPublishedQrToggleThroughUi,
  verifyEditorCollaboratorCanBeAddedThroughUi,
  verifyEditorCollaboratorCanBeRemovedThroughUi,
  verifyEditorCollaboratorsCsvImportAddsExistingUserThroughUi,
  verifyEditorCollaboratorsCsvImportThroughUi,
  verifyPublishedShareNotificationFieldsThroughUi,
} from './helpers/functional-publication-sharing';
import { loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional sharing editor contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
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

  test('SHARE-004 - remove a collaborator from the editor', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorCanBeRemovedThroughUi(page);
  });

  test('SHARE-006 - published application share notification fields are configurable', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedShareNotificationFieldsThroughUi(page);
  });
});
