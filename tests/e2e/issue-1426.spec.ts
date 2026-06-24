import { expect, test, type Page } from './fixtures';
import { setGlobalSymbolForTest, type RestoreGlobalSymbol } from './helpers/admin-symbols';
import { PALETTE_ICON, SEL, addComponent, createBlankForm, login, openPreview, submitViewerForm } from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1426
 *
 * Found in 2.2.0-beta237. Fixed by 220decf0, first released in
 * 2.2.0-beta240 and validated OK in 2.2.0-beta241.
 *
 * Root cause: responseCompleted constrained the custom header logo width but
 * not its height. A square or tall logo therefore rendered much taller than the
 * header during the post-submit transition screen. The fix adds max-height:56px
 * to the responseCompleted logo image.
 *
 * The form fixture is built through Studio UI. The server symbol
 * C8Oforms.customHeaderLogo is set through the Convertigo admin API as test
 * environment setup, then restored after the test.
 */

const CUSTOM_HEADER_LOGO_SYMBOL = 'C8Oforms.customHeaderLogo';
const CUSTOM_HEADER_LOGO = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#047a8c"/></svg>',
).toString('base64')}`;

type LogoMetrics = {
  src: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  maxHeight: string;
};

let restoreHeaderLogo: RestoreGlobalSymbol | undefined;

test.setTimeout(180_000);

test.afterEach(async () => {
  await restoreHeaderLogo?.();
  restoreHeaderLogo = undefined;
});

test('#1426 - custom header logo keeps its constrained height after submitting a form', async ({ page }) => {
  await test.step('Set the custom header logo server symbol', async () => {
    restoreHeaderLogo = await setGlobalSymbolForTest(CUSTOM_HEADER_LOGO_SYMBOL, CUSTOM_HEADER_LOGO);
  });

  await test.step('Create a simple form through Studio UI', async () => {
    await login(page);
    await createBlankForm(page, `Issue 1426 custom logo ${Date.now()}`);
    await addComponent(page, PALETTE_ICON.textInput);
  });

  await test.step('Open the viewer and submit the form', async () => {
    await openPreview(page, SEL.textComponent);
    await submitViewerForm(page);
  });

  await test.step('Assert the responseCompleted logo remains header-sized', async () => {
    const metrics = await responseCompletedLogoMetrics(page);
    expect(metrics.src, 'responseCompleted should render the configured custom header logo').toBe(CUSTOM_HEADER_LOGO);
    expect(metrics.naturalWidth, 'the guard logo should be the square test image').toBe(200);
    expect(metrics.naturalHeight, 'the guard logo should be the square test image').toBe(200);
    expect(metrics.height, `responseCompleted custom logo height should be constrained; metrics=${JSON.stringify(metrics)}`).toBeLessThanOrEqual(60);
  });
});

async function responseCompletedLogoMetrics(page: Page): Promise<LogoMetrics> {
  const logo = page.locator(SEL.responseCompletedLogo).first();
  await expect(logo, 'responseCompleted custom logo should be visible').toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      () =>
        logo.evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        }),
      {
        message: 'responseCompleted custom logo image should finish loading',
        timeout: 15_000,
      },
    )
    .toBe(true);

  return logo.evaluate((node) => {
    const image = node as HTMLImageElement;
    const box = image.getBoundingClientRect();
    return {
      src: image.src,
      width: box.width,
      height: box.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      maxHeight: getComputedStyle(image).maxHeight,
    };
  });
}
