import { test } from './fixtures';
import {
  clickPublishedQrButton,
  createBlankForm,
  expectPublishedQrButtonMode,
  expectPublishedQrTooltipMode,
  expectSelectorApplicationVisible,
  login,
  openPublishedApplicationsTab,
  publishCurrentFormWithPwa,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1336
 *
 * Found before 2.2.0-beta138. Fixed by 4249f258, first released in
 * 2.2.0-beta138 and validated OK in 2.2.0-beta140.
 *
 * Root cause: the Published Applications QR button reused the Import
 * application tooltip, and its label was bound to the static qrcode_btn key.
 * Clicking the QR toggle displayed the QR codes but left the action text as
 * "View QR". The fix binds both the tooltip and label to the current
 * this.global.qr state, switching them between show and hide messages.
 *
 * The fixture is built entirely through Studio UI: create a blank application,
 * publish its PWA, open the Published Applications selector tab, then click the
 * QR toggle.
 */

test.setTimeout(240_000);

test('#1336 - Published Applications QR button switches to hide mode after showing QR codes', async ({ page }) => {
  const title = `Issue 1336 QR ${Date.now()}`;

  await test.step('Log in and create a blank application', async () => {
    await login(page);
    await createBlankForm(page, title);
  });

  await test.step('Publish the application through the Studio UI', async () => {
    await publishCurrentFormWithPwa(page, 'authenticated');
  });

  await test.step('Open the Published Applications tab', async () => {
    await openPublishedApplicationsTab(page);
    await expectSelectorApplicationVisible(page, title);
  });

  await test.step('Assert the QR action starts in show mode', async () => {
    await expectPublishedQrButtonMode(page, 'show');
    await expectPublishedQrTooltipMode(page, 'show');
  });

  await test.step('Show QR codes and assert the action switches to hide mode', async () => {
    await clickPublishedQrButton(page);
    await expectPublishedQrButtonMode(page, 'hide');
    await expectPublishedQrTooltipMode(page, 'hide');
  });

  await test.step('Hide QR codes and assert the action switches back to show mode', async () => {
    await clickPublishedQrButton(page);
    await expectPublishedQrButtonMode(page, 'show');
  });
});
