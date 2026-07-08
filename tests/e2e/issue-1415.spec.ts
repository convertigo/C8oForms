import { expect, test } from './fixtures';
import {
  createBlankForm,
  login,
  openPublishedViewer,
  publishCurrentFormWithPwa,
  publishedViewerToolbarThemeState,
  type PublishedToolbarButtonThemeState,
} from './helpers/studio';

/**
 * Regression test for https://github.com/convertigo/C8oForms/issues/1415
 * "Reload button and menu button in a published app do not use the theme".
 *
 * Found in 2.2.0-beta217. Commit 81cc774d added published-viewer toolbar
 * styling through getPublishedViewerButtonStyle(), first tagged in
 * 2.2.0-beta242 and validated OK in 2.2.0-beta247.
 *
 * Root cause: the published standalone viewer themed the toolbar itself, but
 * the menu and reload ion-buttons kept their default Studio button color and
 * hover/background rules. The fix applies the published toolbar text color and
 * transparent action styles to those buttons.
 *
 * The C8oForms form is built only through Studio UI: create a blank
 * application, publish it as an anonymous PWA from the publish modal, then open
 * the published PWA. No form document writes or fixture shortcuts are used.
 */

test.setTimeout(240_000);

test('#1415 - Published app reload and menu buttons inherit the toolbar theme', async ({ page }) => {
  let formId = '';

  await test.step('Create and publish a blank application', async () => {
    await login(page);
    formId = await createBlankForm(page, `Issue 1415 published theme ${Date.now()}`);
    await publishCurrentFormWithPwa(page, 'anonymous');
  });

  await test.step('Open the published app and assert toolbar button theme inheritance', async () => {
    await openPublishedViewer(page, formId);

    const state = await publishedViewerToolbarThemeState(page);
    expect(state.toolbarVisibility, 'published toolbar should not stay hidden after PWA theme loading').not.toBe('hidden');
    expectCssColorVisible(state.toolbarBackgroundColor, 'published toolbar should expose the selected PWA theme color');
    expectToolbarButtonUsesTheme(state.menu, state.toolbarColor, 'menu');
    expectToolbarButtonUsesTheme(state.reload, state.toolbarColor, 'reload');
  });
});

function expectToolbarButtonUsesTheme(
  state: PublishedToolbarButtonThemeState,
  toolbarColor: string,
  label: string,
): void {
  expect(state.visibility, `${label} button should be visible after theme loading`).not.toBe('hidden');
  expect(state.cssColor, `${label} button should define Ionic --color from the toolbar theme`).not.toBe('');
  expectCssColorClose(state.cssColor, toolbarColor, `${label} --color should match toolbar text color`);
  expectCssColorClose(buttonRenderedColor(state), toolbarColor, `${label} icon should render with toolbar text color`);
  expect(state.hoverBackground, `${label} hover background should stay transparent in a published app`).toBe('transparent');
}

function buttonRenderedColor(state: PublishedToolbarButtonThemeState): string {
  return state.iconColor || state.nativeColor || state.color;
}

function expectCssColorVisible(value: string, message: string): void {
  const color = parseCssColor(value);
  expect(color.alpha, `${message}; actual=${value}`).toBeGreaterThan(0);
}

function expectCssColorClose(actual: string, expected: string, message: string): void {
  const actualColor = parseCssColor(actual);
  const expectedColor = parseCssColor(expected);
  const distance =
    Math.abs(actualColor.red - expectedColor.red) +
    Math.abs(actualColor.green - expectedColor.green) +
    Math.abs(actualColor.blue - expectedColor.blue);

  expect(distance, `${message}; actual=${actual}; expected=${expected}`).toBeLessThanOrEqual(6);
}

function parseCssColor(value: string): { red: number; green: number; blue: number; alpha: number } {
  const css = value.trim().toLowerCase();
  if (css === 'white') {
    return { red: 255, green: 255, blue: 255, alpha: 1 };
  }
  if (css === 'black') {
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  }
  if (css === 'transparent') {
    return { red: 0, green: 0, blue: 0, alpha: 0 };
  }

  const hex = css.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1].length === 3
      ? hex[1].split('').map((part) => `${part}${part}`).join('')
      : hex[1];
    return {
      red: Number.parseInt(raw.slice(0, 2), 16),
      green: Number.parseInt(raw.slice(2, 4), 16),
      blue: Number.parseInt(raw.slice(4, 6), 16),
      alpha: 1,
    };
  }

  const rgb = css.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(',').map((part) => part.trim());
    return {
      red: Number(parts[0]),
      green: Number(parts[1]),
      blue: Number(parts[2]),
      alpha: parts[3] == null ? 1 : Number(parts[3]),
    };
  }

  throw new Error(`Unsupported CSS color: ${value}`);
}
