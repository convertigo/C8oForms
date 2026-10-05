import { test } from './fixtures';
import {
  assertAuthorizedFooterTabAppearsOnlyAfterConditionThroughUi,
  assertConfigurableTabLayoutsThroughUi,
  assertFooterTabsProgressIndicatorThroughUi,
  assertNewPageKeepsApplicationTitleHiddenThroughUi,
  assertPublishedFooterTabsUseThemeColorThroughUi,
  assertStandardNavigationStylesMatchEditorAndPreviewThroughUi,
  assertSharedTabsHoverAndSelectedStylesThroughUi,
  navigateConditionallyByCheckboxValueThroughUi,
  navigateConditionallyByRadioValueThroughUi,
  navigateConditionallyBySelectValueThroughUi,
  navigateToRenamedPageThroughConditionalRadioThroughUi,
  navigateToSecondPageThroughViewerNextButton,
} from './helpers/functional-navigation';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

test.describe('No-Code Studio functional navigation contract', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('NAV-001 - simple viewer navigation to another page', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateToSecondPageThroughViewerNextButton(page);
  });

  /**
   * #1290: SharedTabs was first converted to real Ionic Tabs/TabButton beans in
   * 2.2.0-beta109. Firefox still lost the selected color and rendered the tiny
   * pseudo-element underline as a stray underscore. The explicit hover/selected
   * color rules and Firefox label underline shipped in 2.2.0-beta116, where QA
   * historically validated the fix. Current runtime validation remains pending
   * and must include Firefox.
   */
  test('NAV-001 #1290 - SharedTabs expose hover and selected-page feedback', async ({ page, browserName }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertSharedTabsHoverAndSelectedStylesThroughUi(page, browserName);
  });

  /**
   * #1449 was reported in 2.2.0-beta262. Commit cbfb1844 replaced the
   * hard-coded Ionic primary selected color with the published PWA policy
   * color, first released in beta266 and historically validated in beta294.
   * Current runtime validation remains pending.
   */
  test('NAV-001 #1449 - published footer-tab selection follows the application theme', async ({ page, browserName }) => {
    test.setTimeout(360_000);
    await loginWithUsernamePassword(page);
    const formId = await createBlankApplicationThroughUi(page);
    await assertPublishedFooterTabsUseThemeColorThroughUi(page, formId, browserName);
  });

  test('NAV-002 - conditional navigation by Radio value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateConditionallyByRadioValueThroughUi(page);
  });

  /**
   * #1446 was reported in 2.2.0-beta261. Commits ba244d75, c0cd9f45 and
   * c54f1b4e separated GoTo side effects from Authorize-page visibility;
   * the final behavior was historically validated in beta294.
   * Current runtime validation remains pending.
   */
  test('NAV-002 #1446 - authorized footer tabs appear only after their condition', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertAuthorizedFooterTabAppearsOnlyAfterConditionThroughUi(page);
  });

  test('NAV-002 - conditional navigation by Select value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateConditionallyBySelectValueThroughUi(page);
  });

  test('NAV-002 - conditional navigation by Checkbox value', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateConditionallyByCheckboxValueThroughUi(page);
  });

  test('NAV-003 - navigation target remains correct after page rename', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await navigateToRenamedPageThroughConditionalRadioThroughUi(page);
  });

  /**
   * #1320 was reported in 2.2.0-beta124. An initial redesign was reverted;
   * commit 2cd6b8e2 then applied the editor button shape to Preview, first
   * released in beta152 and historically validated by QA in beta155. #1386
   * added application-level navigation with page-specific exceptions; its
   * final editor rendering fix 6754c104 was historically validated in beta253.
   * Current runtime validation remains pending.
   */
  test('NAV-005 #1320 #1386 - global standard navigation keeps its style and allows page exceptions', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertStandardNavigationStylesMatchEditorAndPreviewThroughUi(page);
  });

  /**
   * #1390 was reported in 2.2.0-beta178. Horizontal Scroll/Wrap support first
   * shipped in beta307; vertical Left/Right support and its follow-up layout
   * fixes were historically validated by QA in beta321.
   * Current runtime validation remains pending.
   */
  test('NAV-006 #1390 - tab buttons support wrapping and right-side vertical layout', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertConfigurableTabLayoutsThroughUi(page);
  });

  /**
   * #1481 was reported in 2.2.0-beta304. Commit 24c103b9 initialized new
   * pages with isNameDisplayed=false, first released in beta318 and
   * historically validated by QA in beta320. Current runtime validation is pending.
   */
  test('NAV-007 #1481 - a new page keeps its title hidden in Preview by default', async ({ page }) => {
    test.setTimeout(240_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertNewPageKeepsApplicationTitleHiddenThroughUi(page);
  });

  /**
   * #1488 was reported in 2.2.0-beta307 and its footer-visibility fix was
   * historically validated in beta320. #1503 replaced the fixed black fill
   * with a theme-derived, contrast-safe progress/track pair; QA validated the
   * final contrast correction in beta337. Current runtime validation is pending.
   */
  test('NAV-008 #1488 #1503 - footer tabs retain a theme-aware progress indicator', async ({ page }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await assertFooterTabsProgressIndicatorThroughUi(page);
  });
});
