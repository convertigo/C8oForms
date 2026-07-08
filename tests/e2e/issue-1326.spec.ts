import { expect, test, type Page } from './fixtures';
import {
  SEL,
  createBlankForm,
  getFormDocument,
  getPwaDocument,
  login,
  openPublishedPwaEditor,
  publishCurrentFormWithPwa,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1326
 *
 * Found before 2.2.0-beta131. Fixed by a39db37f, first released in
 * 2.2.0-beta131 and validated OK in 2.2.0-beta133.
 *
 * Root cause: the Published Applications card menu opened the existing PWA
 * editor with `publish: true`. Saving a PWA-only change therefore invoked the
 * full publish-and-create-PWA path and incremented the published application
 * version. The fix opens the PWA editor with `publish: false`, so the save path
 * updates the PWA document and generated assets without creating a new
 * application version.
 *
 * The form fixture is built entirely through Studio UI: create a blank
 * application, publish its first PWA, reopen that existing PWA from Published
 * Applications, then save a short-name change.
 */

test.setTimeout(240_000);

type FormDocument = Awaited<ReturnType<typeof getFormDocument>>;
type PwaDocument = Awaited<ReturnType<typeof getPwaDocument>>;

test('#1326 - Updating an existing PWA does not republish the application', async ({ page }) => {
  const title = `Issue 1326 PWA ${Date.now()}`;
  const updatedShortName = `P1326${Date.now().toString().slice(-7)}`;
  let formId = '';
  let publishedVersionBefore = '';
  let pwaRevisionBefore = '';

  await test.step('Log in and create a blank application', async () => {
    await login(page);
    formId = await createBlankForm(page, title);
  });

  await test.step('Publish the first PWA as anonymous through the Studio UI', async () => {
    await publishCurrentFormWithPwa(page, 'anonymous');
    await expect
      .poll(async () => (await getPwaDocument(page, formId))?.notAnonymous, {
        message: 'the initial PWA should be saved as anonymous',
        timeout: 60_000,
      })
      .toBe(false);
  });

  await test.step('Capture the published application version and PWA revision', async () => {
    publishedVersionBefore = await waitForPublishedApplicationVersion(page, formId);
    const pwa = await expectPwaDocument(page, formId, 'the anonymous PWA document should exist before editing');
    pwaRevisionBefore = documentRevision(pwa);
    expect(pwaRevisionBefore, 'the initial PWA document should have a revision').not.toBe('');
  });

  await test.step('Update only the existing PWA short name', async () => {
    await openPublishedPwaEditor(page, title);
    await setPwaShortNameAndSave(page, updatedShortName);
  });

  await test.step('Assert the PWA changed but the published application did not', async () => {
    await expect
      .poll(async () => {
        const pwa = await getPwaDocument(page, formId);
        return pwa?.shortName === updatedShortName && documentRevision(pwa) !== pwaRevisionBefore;
      }, {
        message: 'saving the existing PWA should update the PWA document',
        timeout: 60_000,
      })
      .toBe(true);

    await expectPublishedApplicationVersionUnchanged(page, formId, publishedVersionBefore);
  });
});

function publishedApplicationId(formId: string): string {
  return formId.startsWith('published_') ? formId : `published_${formId}`;
}

function documentRevision(doc: FormDocument | PwaDocument | null | undefined): string {
  const revision = doc?._rev;
  return typeof revision === 'string' ? revision : '';
}

function documentVersion(doc: FormDocument | null | undefined): string {
  const version = doc?.version;
  return typeof version === 'string' || typeof version === 'number' ? String(version) : '';
}

async function waitForPublishedApplicationVersion(page: Page, formId: string): Promise<string> {
  await expect
    .poll(async () => {
      const doc = await getFormDocument(page, publishedApplicationId(formId)).catch(() => null);
      return documentVersion(doc);
    }, {
      message: 'the published application document should expose a version after publication',
      timeout: 60_000,
    })
    .not.toBe('');

  return documentVersion(await getFormDocument(page, publishedApplicationId(formId)));
}

async function expectPwaDocument(page: Page, formId: string, message: string): Promise<NonNullable<PwaDocument>> {
  const pwa = await getPwaDocument(page, formId);
  expect(pwa, message).not.toBeNull();
  return pwa as NonNullable<PwaDocument>;
}

async function setPwaShortNameAndSave(page: Page, shortName: string): Promise<void> {
  const modal = page.locator(SEL.pwaEditModal).last();
  await expect(modal, 'the PWA editor modal should be open').toBeVisible({ timeout: 30_000 });
  const input = modal.locator(SEL.pwaShortNameInput).first();
  await expect(input, 'the PWA short name input should be visible').toBeVisible({ timeout: 15_000 });
  await input.fill(shortName);
  await input.dispatchEvent('input');
  await input.dispatchEvent('change');
  await input.blur();
  await expect(input, 'the PWA short name should contain the updated value before saving').toHaveValue(shortName, {
    timeout: 10_000,
  });
  await modal.locator(SEL.pwaSaveButton).first().click();
  await expect(modal, 'the PWA editor modal should close after saving').toBeHidden({ timeout: 60_000 });
}

async function expectPublishedApplicationVersionUnchanged(
  page: Page,
  formId: string,
  expectedVersion: string,
): Promise<void> {
  const deadline = Date.now() + 8_000;
  do {
    const currentVersion = documentVersion(await getFormDocument(page, publishedApplicationId(formId)));
    expect(
      currentVersion,
      'saving an existing PWA should not create a new published application version',
    ).toBe(expectedVersion);
    await page.waitForTimeout(500);
  } while (Date.now() < deadline);
}
