import { test, expect, type Page } from './fixtures';
import {
  SEL,
  addPageThroughPagesPanel,
  createBlankForm,
  login,
  openPreview,
  selectedViewerPageTabIndex,
  setPageTabsThroughAppSettings,
  switchViewerPageTab,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1534
 * "Uncaught "c8oSkipError" in the console when switching pages via the tab bar"
 *
 * Reported on 2.2.0-beta338 in the Firefox console and reproduced on 2.2.0-beta347.
 * Fixed by 24e9dcc1, merged into NGX by bd01058e, first in 2.2.0-beta348.
 * Root cause: the SharedTabs tab click handler (UIControlEvent 1664292958758) picks
 * the direction with two sibling IfAction beans, index > currentIndex and
 * index < currentIndex. IfAction throws new Error("c8oSkipError") when its condition
 * is false, so every tab switch threw it once, and twice on the tab of the current
 * page. The handler catches it, yet Firefox showed "Uncaught (in promise) Error:
 * c8oSkipError". The fix turns both beans into IfElse beans without an else handler:
 * the branch that does not apply resolves false and nothing is thrown.
 *
 * Whether the console reports it depends on the browser, so the test counts the
 * c8oSkipError created while a tab click is dispatched, which is browser neutral.
 * The application (three pages, page tabs in the footer) is built through the
 * Studio UI.
 */

interface SkipErrorCounts {
  tabClicks: number;
  createdDuringTabClick: number;
  reportedUncaught: number;
}

type SkipErrorState = SkipErrorCounts & { inTabClick: boolean };

/**
 * Counts the c8oSkipError created while a click on a tab bar button is handled. A
 * window capture listener runs before the tab handler and marks the click task, the
 * handler and its microtasks included, until the next task clears the mark.
 */
async function recordSkipErrorsFromTabClicks(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __issue1534?: SkipErrorState };
    if (w.__issue1534) {
      return;
    }
    const state: SkipErrorState = { tabClicks: 0, createdDuringTabClick: 0, reportedUncaught: 0, inTabClick: false };
    w.__issue1534 = state;
    window.addEventListener(
      'click',
      (event) => {
        if (!(event.target instanceof Element) || !event.target.closest('ion-tab-button')) {
          return;
        }
        state.tabClicks++;
        state.inTabClick = true;
        setTimeout(() => {
          state.inTabClick = false;
        }, 0);
      },
      true,
    );
    const NativeError = window.Error;
    function RecordingError(...args: [string?]): Error {
      if (state.inTabClick && args[0] === 'c8oSkipError') {
        state.createdDuringTabClick++;
      }
      return new NativeError(...args);
    }
    RecordingError.prototype = NativeError.prototype;
    Object.setPrototypeOf(RecordingError, NativeError);
    window.Error = RecordingError as unknown as ErrorConstructor;
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason as { message?: unknown } | undefined;
      if (String(reason?.message ?? reason).includes('c8oSkipError')) {
        state.reportedUncaught++;
      }
    });
  });
}

async function takeSkipErrorCounts(page: Page): Promise<SkipErrorCounts> {
  return page.evaluate(() => {
    const state = (window as unknown as { __issue1534: SkipErrorState }).__issue1534;
    const counts = {
      tabClicks: state.tabClicks,
      createdDuringTabClick: state.createdDuringTabClick,
      reportedUncaught: state.reportedUncaught,
    };
    state.tabClicks = 0;
    state.createdDuringTabClick = 0;
    state.reportedUncaught = 0;
    return counts;
  });
}

const TAB_SWITCHES = [
  { label: 'forward from page 1 to page 3', to: 2 },
  { label: 'backward from page 3 to page 2', to: 1 },
  { label: 'the tab of the current page 2', to: 1 },
  { label: 'forward from page 2 to page 3', to: 2 },
  { label: 'backward from page 3 to page 1', to: 0 },
] as const;

test('#1534 — switching pages from the viewer tab bar creates no c8oSkipError', async ({ page }) => {
  test.setTimeout(240_000);

  await test.step('Log in', async () => {
    await login(page);
  });

  await test.step('Create a blank application with three pages', async () => {
    await createBlankForm(page, `Issue 1534 ${Date.now()}`);
    await addPageThroughPagesPanel(page);
    await addPageThroughPagesPanel(page);
  });

  await setPageTabsThroughAppSettings(page, 'footer');

  await test.step('Open Preview on the first page with one tab per page', async () => {
    await openPreview(page, SEL.viewerPageTab);
    await expect(page.locator(SEL.viewerPageTab), 'the viewer tab bar should show one tab per page').toHaveCount(3, {
      timeout: 30_000,
    });
    await expect
      .poll(() => selectedViewerPageTabIndex(page), { message: 'Preview should open on the first page', timeout: 15_000 })
      .toBe(0);
  });

  await recordSkipErrorsFromTabClicks(page);
  const observed: Record<string, SkipErrorCounts> = {};
  for (const { label, to } of TAB_SWITCHES) {
    await test.step(`Tab bar: ${label}`, async () => {
      await switchViewerPageTab(page, to);
      // Let the handler's promise chain settle and a rejection report fire.
      await page.waitForTimeout(500);
      observed[label] = await takeSkipErrorCounts(page);
    });
  }

  // Zero errors prove nothing unless the recorder saw every tab click.
  expect(
    TAB_SWITCHES.map(({ label }) => observed[label].tabClicks),
    'the recorder should see each tab click once',
  ).toEqual(TAB_SWITCHES.map(() => 1));
  expect(observed, 'no tab switch should create or report a c8oSkipError').toEqual(
    Object.fromEntries(TAB_SWITCHES.map(({ label }) => [label, { tabClicks: 1, createdDuringTabClick: 0, reportedUncaught: 0 }])),
  );
});
