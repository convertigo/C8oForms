import { test } from './fixtures';
import {
  createBlankForm,
  login,
  publishCurrentFormWithPwa,
  sharePublishedApplicationWithNotification,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1318
 *
 * Found in 2.2.0-beta122. Fixed by d1970389, first released in
 * 2.2.0-beta131 and validated OK in 2.2.0-beta133.
 *
 * Root cause: the published Share application modal only exposed notification
 * through an unclear send icon path after choosing users or groups, so the
 * explicit email notification option and its subject/body fields were no
 * longer offered. The fix adds a visible Send an email notification toggle and
 * reveals the Email subject and Email body editors when a recipient is selected
 * and Yes/Oui is chosen.
 *
 * The fixture is built entirely through Studio UI: create a blank application,
 * publish it as an authenticated PWA, open Share application from the published
 * application card menu, choose a recipient, then verify the notification
 * toggle and editable email fields.
 */

const EMAIL_SUBJECT = 'Issue 1318 share notification';
const EMAIL_BODY = 'Bonjour depuis le test 1318';

test.setTimeout(300_000);

test('#1318 - Share application exposes editable email notification fields', async ({ page }) => {
  const title = `Issue 1318 share app ${Date.now()}`;

  await test.step('Log in and create a blank application', async () => {
    await login(page);
    await createBlankForm(page, title);
  });

  await test.step('Publish the application with authenticated access', async () => {
    await publishCurrentFormWithPwa(page, 'authenticated');
  });

  await test.step('Configure an email notification from the published Share application modal', async () => {
    await sharePublishedApplicationWithNotification(page, title, {
      subject: EMAIL_SUBJECT,
      body: EMAIL_BODY,
    });
  });
});
