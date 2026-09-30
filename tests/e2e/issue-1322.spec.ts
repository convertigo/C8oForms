import { expect, test } from './fixtures';
import { PALETTE_ICON, SEL, addComponent, createBlankForm, login, openButtonWorkflow } from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1322
 * The ticket does not name a broken beta; beta125 was current when filed, a
 * timing inference only. Fix 9b68c8b00 rebuilds the palette whenever either
 * the static palette or the asynchronous actions tree arrives, first shipped
 * in 2.2.0-beta126. QA historically validated beta127. This latest-only test
 * was executed successfully on test-nocode running 2.2.0-beta371, without
 * deployment or a historical red phase. The form is created through Studio UI.
 */
test.use({ serviceWorkers: 'block' });
test.setTimeout(180_000);

test('#1322 - background actions populate the first editor palette without reload', async ({ page }) => {
  const mailAction = page.locator('#bloc-palette img[src*="forms_notify_response_simple_by_mail_simple.svg"]');
  let releaseTree = () => {};
  const treeGate = new Promise<void>((resolve) => { releaseTree = resolve; });
  let intercepted = 0;

  await login(page);
  const sequencesEndpoint = '**/projects/C8Oforms/.json';
  await page.route(sequencesEndpoint, async (route) => {
    if (route.request().postData()?.includes('GetSequences')) {
      intercepted += 1;
      await treeGate;
    }
    await route.continue();
  });

  try {
    await test.step('Open a Button workflow while its action tree response is delayed', async () => {
      await createBlankForm(page, `Issue 1322 background palette ${Date.now()}`);
      await addComponent(page, PALETTE_ICON.button);
      await openButtonWorkflow(page);
      await page.locator(SEL.componentPanelButton).first().click();
      await expect(page.locator(SEL.componentPaletteSearch)).toBeVisible();
      await expect.poll(() => intercepted, { message: 'the editor should request its actions tree' }).toBeGreaterThan(0);
      await expect(mailAction, 'tree-sourced action should not exist before the tree arrives').toHaveCount(0);
    });

    await test.step('Release the action tree and verify the palette updates without reload', async () => {
      releaseTree();
      await expect(mailAction, 'the Send mail background action should be added to the palette').toHaveCount(1, {
        timeout: 30_000,
      });
      await expect(mailAction, 'the Send mail action should be visible in the palette').toBeVisible();
    });
  } finally {
    releaseTree();
    await page.unroute(sequencesEndpoint);
  }
});
