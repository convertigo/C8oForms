import { test } from './fixtures';
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

  /**
   * #1451: the generic collaborator modal still used a gradient Save action
   * after the solid-button redesign. Commit 7ec0f78c aligned the modal in
   * beta315/beta316 and the fix was historically QA-validated in beta320.
   */
  test('SHARE-001 #1451 - add a collaborator with a solid-color Save action', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorCanBeAddedThroughUi(page);
  });

  test('SHARE-004 - remove a collaborator from the editor', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await verifyEditorCollaboratorCanBeRemovedThroughUi(page);
  });

  /**
   * #1445: reported in beta257. Commit 2821b1a5 removed the fixed invitee-row
   * height in beta259; selector/data-page follow-ups shipped in beta261 and
   * the complete fix was historically QA-validated in beta262. Automated E2E
   * coverage was runtime-validated against test-nocode 2.2.0-beta371.
   */
  test('SHARE-006 #1445 - published sharing keeps notification fields and invitee response rows readable', async ({
    page,
  }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await verifyPublishedShareNotificationFieldsThroughUi(page);
  });
});
