import { test } from '@playwright/test';
import {
  publishAnonymousApplicationAndOpenWithoutSessionThroughUi,
  publishAuthenticatedApplicationThroughUi,
  submitSimplePublishedFormThroughUi,
  switchAnonymousPwaBackToAuthenticatedThroughUi,
  updateExistingPwaWithoutRepublishingThroughUi,
  verifyPwaConfigurationReopenAndViewerMetadataThroughUi,
  verifyPublishedPwaCacheMetadataThroughUi,
  verifyPublishedViewerResponsiveLayoutThroughUi,
  verifyPublishedViewerToolbarThemeThroughUi,
} from './helpers/functional-publication-sharing';
import { loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional publication contract', () => {
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
});
