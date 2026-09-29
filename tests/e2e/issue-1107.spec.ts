import { test, expect } from './fixtures';
import {
  createBlankForm,
  expectSelectorSearchKeepsSingleApplication,
  login,
  returnToSelectorFromEditor,
  submitSelectorApplicationSearchAfterRapidTyping,
} from './helpers/studio';

/**
 * Latest-only non-regression test for https://github.com/convertigo/C8oForms/issues/1107
 * "Application Search Should Be Debounced".
 *
 * The issue described one search request per keystroke and proposed a 300–500
 * ms debounce. It was closed as irrelevant after the new UI/UX replaced live
 * searching with explicit submission: typing only updates local state, while
 * Enter sends one formsV2/search request containing the complete query.
 *
 * This latest-only test was executed successfully on test-nocode running
 * 2.2.0-beta369. Per request, it has no historical red run or deployment. Its
 * unique application fixture is created entirely through the Studio UI.
 */

test.setTimeout(180_000);

test('#1107 — application search submits one complete query after rapid typing', async ({ page }) => {
  const title = `Issue1107-${Date.now()}`;

  await test.step('Create a uniquely named application through Studio', async () => {
    await login(page);
    await createBlankForm(page, title);
    await returnToSelectorFromEditor(page);
  });

  const submission = await submitSelectorApplicationSearchAfterRapidTyping(page, title);

  await test.step('Keep typing request-free and submit exactly one complete query', async () => {
    expect(submission.requestsWhileTyping, 'rapid typing and the former debounce window should stay request-free').toBe(
      0,
    );
    expect(submission.totalRequests, 'Enter should produce exactly one search request').toBe(1);
    expect(submission.queries, 'the only request should contain the complete query').toEqual([title]);
    await expectSelectorSearchKeepsSingleApplication(page, title);
  });
});
