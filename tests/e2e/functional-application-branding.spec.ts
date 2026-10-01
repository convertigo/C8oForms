import { test } from './fixtures';
import { verifyApplicationThumbnailIndependenceThroughUi } from './helpers/functional-application-branding';
import { loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional application branding', () => {
  /**
   * #1448 was reported in 2.2.0-beta262. Commit fa574dad made the
   * thumbnail/background target accept both boolean and serialized boolean
   * parameters, made the picker preview the requested attachment, and stopped
   * selector cards from falling back to wallpaper colors/images. The fix first
   * shipped in 2.2.0-beta266 and was historically QA-validated in
   * 2.2.0-beta291. Runtime validation on the current test-nocode release is
   * pending.
   */
  test('APP-BRAND-001 #1448 - thumbnail color and image stay independent from the application background', async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    await verifyApplicationThumbnailIndependenceThroughUi(page);
  });
});
