import { test } from './fixtures';
import {
  configurePublishedApplicationPublicLinkAndAssertQrLabel,
  createBlankForm,
  login,
  publishCurrentFormWithPwa,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1305
 *
 * Found KO in 2.2.0-beta118. A related persistence problem was still reported
 * KO in 2.2.0-beta132, and the ticket was validated OK in 2.2.0-beta156.
 *
 * Root cause: the published Share application access-rights modal could render
 * the QR code for an anonymous/public share link with the authenticated-link
 * wording, and earlier sharedAnonymous handling did not reliably persist when
 * the modal was saved and reopened. The fix series normalized anonymous-link
 * saving and uses the public QR i18n label for public links.
 *
 * The fixture is built entirely through Studio UI: create a blank application,
 * publish it as an authenticated PWA, open Share application from the published
 * application card menu, enable the anonymous/public link, then verify the QR
 * label and persistence after saving and reopening.
 */

test.setTimeout(300_000);

test('#1305 - Share application public QR label and anonymous link persist', async ({ page }) => {
  const title = `Issue 1305 public QR ${Date.now()}`;

  await test.step('Log in and create a blank application', async () => {
    await login(page);
    await createBlankForm(page, title);
  });

  await test.step('Publish the application with authenticated access', async () => {
    await publishCurrentFormWithPwa(page, 'authenticated');
  });

  await test.step('Enable the public share link and assert the QR label', async () => {
    await configurePublishedApplicationPublicLinkAndAssertQrLabel(page, title);
  });
});
