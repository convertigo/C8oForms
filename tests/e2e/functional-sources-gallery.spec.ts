import { test } from './fixtures';
import { exerciseGalleryBaserowCardsThroughUi } from './helpers/functional-gallery';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional sources contract - Gallery', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  /**
   * #1400 introduced Gallery as a dedicated sourced component in beta208.
   * Follow-up fixes shipped in beta215, beta240 and beta245; QA validated the
   * complete Gallery flow in beta245.
   *
   * This functional owner protects the stable browser contract: Gallery is
   * authored through its palette entry, exposes its dedicated editor, accepts
   * a Baserow source, restores a cleared default presentation, reports loading
   * without a false empty state, renders bounded cards, and selects a card.
   */
  test('SRC-GALLERY-001 #1400 - sourced Gallery presentation, cards and selection', async ({ page }) => {
    test.setTimeout(480_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseGalleryBaserowCardsThroughUi(page);
  });
});
