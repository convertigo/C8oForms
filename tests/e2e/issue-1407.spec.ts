import { Page, expect, test } from '@playwright/test';
import {
  createBlankForm,
  expectPwaAccessModeSelected,
  getPwaDocument,
  login,
  openPublishedPwaEditor,
  publishCurrentFormWithPwa,
  setPwaAccessModeAndSave,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1407
 * Broken version: 2.2.0-beta214.
 * Fixed version: 2.2.0-beta216, by 2ef5d325.
 * Root cause: CreatePwa handled ToggleSwitch modelChanged as a raw string
 * (`event == "oui"`), while ToggleSwitch emits an object with an `out` value.
 * The form fixture is created and published through the Studio UI.
 */
test.setTimeout(240_000);

type PwaDocument = Awaited<ReturnType<typeof getPwaDocument>>;

function pwaRevision(pwa: PwaDocument): string {
  const revision = pwa?._rev;
  return typeof revision === 'string' ? revision : '';
}

async function expectPwaDocument(page: Page, formId: string, message: string): Promise<NonNullable<PwaDocument>> {
  const pwa = await getPwaDocument(page, formId);
  expect(pwa, message).not.toBeNull();
  return pwa as NonNullable<PwaDocument>;
}

async function expectAuthenticatedPwaPersisted(
  page: Page,
  formId: string,
  previousRevision: string,
): Promise<void> {
  const deadline = Date.now() + 10_000;
  let pwa = await expectPwaDocument(page, formId, 'the PWA document should exist after saving the PWA editor');

  while (Date.now() < deadline) {
    const currentRevision = pwaRevision(pwa);
    if ((previousRevision && currentRevision && currentRevision !== previousRevision) || pwa.notAnonymous === true) {
      break;
    }
    await page.waitForTimeout(500);
    pwa = await expectPwaDocument(page, formId, 'the PWA document should remain readable after saving the PWA editor');
  }

  expect(pwa?.notAnonymous, 'saving the PWA editor after choosing authenticated should persist notAnonymous=true').toBe(
    true,
  );
}

test('#1407 - PWA access can switch from anonymous back to authenticated', async ({ page }) => {
  const title = `Issue 1407 PWA ${Date.now()}`;
  let formId = '';

  await test.step('login', async () => {
    await login(page);
  });

  await test.step('create a blank form and publish its PWA as anonymous', async () => {
    formId = await createBlankForm(page, title);
    await publishCurrentFormWithPwa(page, 'anonymous');
  });

  await test.step('assert the PWA fixture starts anonymous', async () => {
    await expect
      .poll(async () => (await getPwaDocument(page, formId))?.notAnonymous, {
        message: 'the test fixture should start as an anonymous PWA',
        timeout: 60_000,
      })
      .toBe(false);
  });

  await test.step('switch the existing PWA back to authenticated', async () => {
    await openPublishedPwaEditor(page, title);
    await expectPwaAccessModeSelected(page, 'anonymous');
    const anonymousPwa = await expectPwaDocument(page, formId, 'the anonymous PWA document should exist before editing');
    const anonymousPwaRevision = pwaRevision(anonymousPwa);
    await setPwaAccessModeAndSave(page, 'authenticated');

    await test.step('assert the authenticated access mode is persisted', async () => {
      await expectAuthenticatedPwaPersisted(page, formId, anonymousPwaRevision);

      await openPublishedPwaEditor(page, title);
      await expectPwaAccessModeSelected(page, 'authenticated');
    });
  });
});
