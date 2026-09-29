import { expect, test } from './fixtures';
import { PALETTE_ICON, SEL, addComponent, createBlankForm, login, openPreview } from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1210
 * "Update Template to 8.4.0 standalone".
 *
 * This maintenance ticket does not identify a broken release; 2.2.0-beta21
 * was the published predecessor when the work started. Commit 77efb6a7 moved
 * C8oForms from its project-local template to mobilebuilder_tpl_8_4_0_ngx,
 * while a27d7e71 imported the standalone PWA bootstrap and routing template,
 * first shipped in 2.2.0-beta22. The first issue-linked test candidate was
 * 2.2.0-beta25. Follow-up commits repaired NavParams usage, standalone library
 * references, SDK compatibility, and production base-href handling; that
 * correction series was complete in 2.2.0-beta30.
 * Historically validated in 2.2.0-beta297. This latest-only test was executed
 * successfully on test-nocode running 2.2.0-beta370, without deployment or a
 * historical red phase.
 *
 * The form and Text input are authored exclusively through the Studio UI. The
 * test then exercises standalone editor-to-viewer routing, the corrected web
 * base href, a direct deep-route reload, and browser history back to Studio.
 */

test.use({ viewport: { width: 1920, height: 1080 } });
test.setTimeout(180_000);

test('#1210 — standalone template survives preview deep-link reload and editor return', async ({ page }) => {
  const suffix = Date.now();

  await login(page);
  const formId = await createBlankForm(page, `Issue 1210 standalone ${suffix}`);
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await expect(page.locator(SEL.textComponent), 'the Text input should be added through Studio').toHaveCount(1, {
    timeout: 30_000,
  });

  await openPreview(page, SEL.textComponent);
  await expect(page, 'the standalone router should preserve the authored form id in preview').toHaveURL(
    new RegExp(`(?:/viewer/${formId}/|/viewerPage(?:/|$))`),
  );
  const base = page.locator('head base');
  await expect(base, 'the production web build should identify its web base-href mode').toHaveAttribute(
    'data-c8o-mode',
    'web',
  );
  const documentBaseUri = await base.evaluate((element) => (element as HTMLBaseElement).href);
  const indexResponse = await page.request.get(new URL('index.html', documentBaseUri).toString());
  expect(indexResponse.ok(), 'the standalone index should load from the runtime base URI').toBe(true);
  expect(await indexResponse.text(), 'the production index should retain the corrected relative web base href').toContain(
    '<base href="./" data-c8o-mode="web">',
  );

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.locator(SEL.viewerPage), 'the standalone viewer should boot after a deep-route reload').toBeAttached({
    timeout: 60_000,
  });
  await expect(page.locator(SEL.textComponent), 'the UI-authored Text input should render after the reload').toHaveCount(1, {
    timeout: 30_000,
  });

  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page, 'browser history should return from the standalone viewer to Studio').toHaveURL(
    /(?:\/editor\/|\/editorPage(?:\/|$))/,
    { timeout: 60_000 },
  );
  await expect(page.locator(SEL.textComponent), 'the UI-authored Text input should still be present in Studio').toHaveCount(1, {
    timeout: 30_000,
  });
});
