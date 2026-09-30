import type { Locator } from '@playwright/test';
import { expect, test } from './fixtures';
import { deleteBaserowWorkspaces, ensureBaserowWorkspaceTable, replaceBaserowTableRows } from './helpers/functional-baserow';
import {
  PALETTE_ICON,
  SEL,
  addComponent,
  closeComponentConfig,
  configureSelectBaserowSource,
  createBlankForm,
  ionSearchbarTextAlignment,
  login,
  openComponentConfig,
  openComponentsPalette,
  openPreview,
  setTextDefaultValueJavascript,
  sourceSelectVisibleOptions,
} from './helpers/studio';

/**
 * Latest-only regression coverage for https://github.com/convertigo/C8oForms/issues/1278
 * The ticket names no reported beta; beta104 was current when it was filed,
 * which is a timing inference. Fix e572f2ee8 left-aligned the component and
 * JavaScript palette search inputs, first in 2.2.0-beta107 (QA OK there).
 * Follow-up a48ecb08e aligned the Select search, first in beta109; QA
 * historically validated that case in 2.2.0-beta112. This latest-only test
 * was executed successfully on test-nocode running 2.2.0-beta371, without
 * deployment or a historical red phase. Form setup uses Studio UI only;
 * Baserow API calls prepare and remove an external Select data source.
 */
test.use({ viewport: { width: 1366, height: 768 } });
test.setTimeout(300_000);

test('#1278 - palette and Select search placeholders and text are left-aligned', async ({ page }) => {
  const suffix = Date.now();
  const workspace = `Issue 1278 Workspace ${suffix}`;
  const database = `Issue 1278 Database ${suffix}`;
  const table = `Issue 1278 Select ${suffix}`;
  const options = [`Alpha ${suffix}`, `Beta ${suffix}`];
  const workspaceIds: number[] = [];

  await login(page);
  try {
    await test.step('Prepare an isolated Select data source', async () => {
      const fixture = await ensureBaserowWorkspaceTable(page, {
        workspace,
        database,
        table,
        columns: [{ name: 'Name', type: 'text' }, { name: 'Value', type: 'text' }],
      });
      workspaceIds.push(fixture.workspaceId);
      await replaceBaserowTableRows(page, fixture.tableId, options.map((name, index) => ({
        Name: name,
        Value: `option-${index + 1}`,
      })));
    });

    await test.step('Check the component palette search', async () => {
      await createBlankForm(page, `Issue 1278 palette search ${suffix}`);
      await openComponentsPalette(page, PALETTE_ICON.textInput);
      await expectLeftAlignedSearch(page.locator(SEL.componentPaletteSearch).first());
    });

    await test.step('Check the JavaScript source palette search', async () => {
      await addComponent(page, PALETTE_ICON.textInput);
      await openComponentConfig(page, SEL.textComponent);
      await setTextDefaultValueJavascript(page, "'Issue 1278'");
      await expectLeftAlignedSearch(page.locator('ion-searchbar.class1732284058973:visible').first());
      await closeComponentConfig(page);
    });

    await test.step('Check the source-backed Select search in Preview', async () => {
      await addComponent(page, PALETTE_ICON.select);
      await openComponentConfig(page, SEL.selectComponent);
      await configureSelectBaserowSource(page, {
        workspace,
        database,
        table,
        expectedColumns: ['Name', 'Value'],
        displayColumn: 'Name',
        valueColumn: 'Value',
      });
      await closeComponentConfig(page);
      await openPreview(page, SEL.selectComponent);
      await expect(sourceSelectVisibleOptions(page, options)).resolves.toEqual(options);
      await expectLeftAlignedSearch(page.locator('ion-searchbar.class1599133954849:visible').first());
    });
  } finally {
    await deleteBaserowWorkspaces(page, workspaceIds).catch(() => undefined);
  }
});

async function expectLeftAlignedSearch(searchbar: Locator): Promise<void> {
  const alignment = await ionSearchbarTextAlignment(searchbar);
  expect(alignment.placeholder, 'search placeholder should be rendered').not.toBe('');
  expect(alignment.inputAlign, 'typed search text should be left-aligned').toBe('left');
  expect(alignment.placeholderAlign, 'search placeholder should be left-aligned').toBe('left');

  const input = searchbar.locator('input');
  await input.fill('a');
  await expect(input, 'the search should accept typed text').toHaveValue('a');
  expect((await ionSearchbarTextAlignment(searchbar)).inputAlign, 'entered text should remain left-aligned').toBe('left');
  await input.fill('');
}
