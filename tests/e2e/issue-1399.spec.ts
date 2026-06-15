import { expect, test } from '@playwright/test';
import { TEST_USER, createFormDocument, login, openViewer, textElement } from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1399
 * "Viewer expressions using api.* no longer resolve correctly"
 *
 * Broken before 2.2.0-beta205, fixed by 68e69971 (first released in
 * 2.2.0-beta205). Root cause: viewerPage shadowed the global viewer API with
 * `const api = page.api || {}`, so computeVariable evaluated api.user.* against
 * an empty object. The fix falls back to window["api"].
 */
test.setTimeout(90_000);

test('#1399 - viewer expressions resolve api user values', async ({ page }) => {
  await login(page);
  const { id } = await createFormDocument(page, `Issue 1399 ${Date.now()}`, [
    textElement('api_user_email', {
      config: {
        label: 'API user email',
        html: '<p>API user email</p>',
        placeholder: 'api.user.email',
      },
      sources: {
        self: {
          enabled: true,
          vars: {
            selfVar: { str: 'api.user.email', type: 'ts', html: false },
          },
        },
      },
    }),
  ]);

  await openViewer(page, id);
  await expect(
    page.locator('ion-input#api_user_email input').first(),
    'the api.user.email source should resolve through the viewer API object',
  ).toHaveValue(TEST_USER, { timeout: 30_000 });
});
