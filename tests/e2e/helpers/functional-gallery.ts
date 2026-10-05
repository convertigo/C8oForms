import { expect, test, type Locator, type Page } from '@playwright/test';
import { ensureBaserowTable } from './baserow';
import { holdSourceRequests } from './functional-sources';
import {
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  closeComponentConfig,
  configureGridBaserowSource,
  openComponentConfig,
  openComponentsPalette,
  openPreview,
  setGridReturnedValueToRowSelected,
  setTechnicalId,
} from './studio';

const GALLERY_PALETTE_ICON = 'icn_cards.svg';
const GALLERY_COMPONENT = 'c8oforms-itemgalleryviewer';
const GALLERY_EDITOR = 'c8oforms-itemgalleryeditor';
const GALLERY_CARD = '.c8o-gallery-card';
const GALLERY_WORKSPACE = 'C8oForms E2E';
const GALLERY_DATABASE = 'Functional Fixtures';
const GALLERY_TABLE = 'Functional Gallery Cards 1400';
const GALLERY_COLUMNS = ['Name', 'Summary', 'Long text'];
const GALLERY_ROWS = [
  {
    Name: 'Functional Gallery Alpha',
    Summary: 'First selectable Gallery card',
    'Long text': 'Short gallery content',
  },
  {
    Name: 'Functional Gallery Bravo',
    Summary: 'Second selectable Gallery card',
    'Long text': 'Another gallery value',
  },
  {
    Name: 'Functional Gallery Overflow',
    Summary: 'Long content remains inside the card',
    'Long text': `gallery-overflow-${'unbroken'.repeat(45)}`,
  },
];

export async function exerciseGalleryBaserowCardsThroughUi(page: Page): Promise<void> {
  const technicalId = `functional_gallery_1400_${Date.now()}`;

  await test.step('Ensure the deterministic Gallery Baserow table exists', async () => {
    const catalog = await ensureBaserowTable({
      workspace: GALLERY_WORKSPACE,
      database: GALLERY_DATABASE,
      table: GALLERY_TABLE,
      primaryField: 'Name',
      columns: GALLERY_COLUMNS.map((name) => ({ name, type: 'text' })),
      rows: GALLERY_ROWS,
      upsertKey: 'Name',
    });
    const table = catalog.tables.find((candidate) => candidate.name === GALLERY_TABLE);
    expect(table, `Baserow table ${GALLERY_TABLE} should exist`).toBeTruthy();
    for (const column of GALLERY_COLUMNS) {
      expect(
        table?.columns.find((candidate) => candidate.name === column)?.type,
        `Gallery source column ${column} should be text`,
      ).toBe('text');
    }
  });

  await test.step('Add Gallery from the palette and open its dedicated editor', async () => {
    await acceptRgpdIfVisible(page);
    await openComponentsPalette(page, GALLERY_PALETTE_ICON);
    await addComponent(page, GALLERY_PALETTE_ICON, { allowEditorApiFallback: false });
    const gallery = page.locator(`${GALLERY_COMPONENT}:visible`).first();
    await expect(gallery, 'Gallery should be added through its dedicated palette entry').toBeVisible({ timeout: 30_000 });

    await openComponentConfig(page, GALLERY_COMPONENT);
    await expect(page.locator(`${GALLERY_EDITOR}:visible`).first(), 'Gallery should expose its dedicated editor').toBeVisible({
      timeout: 15_000,
    });
    await setTechnicalId(page, technicalId);
  });

  await test.step('Configure the Gallery Baserow source and restore its default presentation', async () => {
    await configureGridBaserowSource(page, {
      workspace: GALLERY_WORKSPACE,
      database: GALLERY_DATABASE,
      table: GALLERY_TABLE,
      expectedColumns: GALLERY_COLUMNS,
    });
    await openGalleryPresentationTab(page);
    await confirmGalleryAdaptationIfVisible(page);

    const presentationBody = await visibleGalleryPresentationBody(page);
    await expectGalleryPresentationFields(presentationBody);

    await presentationBody.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Tab');
    await expect
      .poll(async () => (await presentationBody.innerText()).trim(), {
        message: 'Gallery presentation should be cleared through its rich-text editor',
        timeout: 15_000,
      })
      .toBe('');

    const restore = page
      .locator(`${GALLERY_EDITOR}:visible ion-button`)
      .filter({ has: page.locator('ion-icon[name="refresh-outline"]') })
      .first();
    await expect(restore, 'Gallery Presentation should expose Restore default presentation').toBeVisible({ timeout: 15_000 });
    await restore.click({ timeout: 10_000 }).catch(async () => restore.dispatchEvent('click'));
    const alert = page.locator('ion-alert:not(.overlay-hidden):visible').last();
    await expect(alert, 'restoring the Gallery presentation should ask for confirmation').toBeVisible({ timeout: 10_000 });
    await alert.locator('button.alert-button').last().click({ timeout: 10_000 });
    await expect(alert, 'Gallery presentation confirmation should close').toBeHidden({ timeout: 15_000 });

    const restoredBody = await visibleGalleryPresentationBody(page);
    await expectGalleryPresentationFields(restoredBody);
    await setGridReturnedValueToRowSelected(page);
  });

  const heldSources = await holdSourceRequests(page);
  try {
    await closeComponentConfig(page);
    await openPreview(page, GALLERY_COMPONENT);

    await test.step('Show Gallery loading feedback without a false empty state', async () => {
      await expect
        .poll(() => heldSources.count(), {
          message: 'Gallery Preview should request its configured source',
          timeout: 15_000,
        })
        .toBeGreaterThan(0);
      await expect(
        page.locator(`${GALLERY_COMPONENT}:visible .c8o-gallery-loading`).first(),
        'Gallery should show deterministic loading feedback while its source is pending',
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        page.locator(`${GALLERY_COMPONENT}:visible .c8o-gallery-empty:not(.c8o-gallery-loading)`),
        'Gallery should not claim that there are no results while loading',
      ).toHaveCount(0);
    });
  } finally {
    await heldSources.release();
  }

  await test.step('Render sourced rows as bounded selectable Gallery cards', async () => {
    const gallery = page.locator(`#${technicalId}, ${GALLERY_COMPONENT}:visible`).first();
    await expect(gallery, 'configured Gallery should render in Preview').toBeVisible({ timeout: 45_000 });
    const cards = gallery.locator(GALLERY_CARD);
    await expect
      .poll(() => cards.count(), {
        message: 'Gallery should render every deterministic source row as a card',
        timeout: 45_000,
      })
      .toBeGreaterThanOrEqual(GALLERY_ROWS.length);

    for (const row of GALLERY_ROWS) {
      const matchingCards = cards.filter({ hasText: row.Name });
      await expect(matchingCards, `Gallery should render ${row.Name} exactly once`).toHaveCount(1);
      const card = matchingCards.first();
      await expect(card, `Gallery card ${row.Name} should render`).toBeVisible({ timeout: 30_000 });
      await expect(card, `Gallery card ${row.Name} should expose its source values`).toContainText(row.Summary);
      const text = (await card.innerText()).replace(/\s+/g, ' ').trim();
      expect(text, 'Gallery presentation should render values, not escaped HTML').not.toMatch(/<\/?p\b|api\.currentFor|c8otype/i);
    }

    await expectGalleryCardsStayWithinBounds(cards);
    const selectedCard = cards.filter({ hasText: GALLERY_ROWS[1].Name }).first();
    await selectedCard.click({ timeout: 10_000 });
    await expect(selectedCard, 'clicking a selectable Gallery card should mark it selected').toHaveClass(
      /c8o-gallery-card-selected/,
      { timeout: 15_000 },
    );
    await expect(gallery.locator(`${GALLERY_CARD}.c8o-gallery-card-selected`)).toHaveCount(1);
  });
}

async function openGalleryPresentationTab(page: Page): Promise<void> {
  const tabs = page.locator(`${SEL.styleTabsContainer} ${SEL.styleTab}:visible`);
  await expect(tabs, 'Gallery style editor should expose Question, Presentation, Organization and Style tabs').toHaveCount(4, {
    timeout: 15_000,
  });
  await tabs.nth(1).click({ timeout: 10_000 }).catch(async () => tabs.nth(1).dispatchEvent('click'));
  await expect(page.locator(`${GALLERY_EDITOR}:visible`).first(), 'Gallery Presentation editor should remain mounted').toBeVisible({
    timeout: 15_000,
  });
}

async function confirmGalleryAdaptationIfVisible(page: Page): Promise<void> {
  const alert = page.locator('ion-alert:not(.overlay-hidden):visible').last();
  if (await alert.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await alert.locator('button.alert-button').last().click({ timeout: 10_000 });
    await expect(alert).toBeHidden({ timeout: 15_000 });
  }
}

async function visibleGalleryPresentationBody(page: Page): Promise<Locator> {
  const frame = page.locator(`${GALLERY_EDITOR}:visible .tox-edit-area iframe:visible`).last();
  await expect(frame, 'Gallery Presentation should expose a rich-text editor').toBeVisible({ timeout: 30_000 });
  const body = frame.contentFrame().locator('body');
  await expect(body, 'Gallery Presentation rich-text body should be editable').toBeVisible({ timeout: 15_000 });
  return body;
}

async function expectGalleryPresentationFields(body: Locator): Promise<void> {
  for (const column of GALLERY_COLUMNS) {
    await expect(body, `default Gallery presentation should include ${column}`).toContainText(column, { timeout: 15_000 });
  }
}

async function expectGalleryCardsStayWithinBounds(cards: Locator): Promise<void> {
  const geometry = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const card = element as HTMLElement;
      const cardBox = card.getBoundingClientRect();
      const visibleChildren = [...card.querySelectorAll<HTMLElement>('*')]
        .filter((child) => {
          const box = child.getBoundingClientRect();
          const style = getComputedStyle(child);
          return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map((child) => child.getBoundingClientRect());
      const firstChildOffset =
        visibleChildren.length > 0 ? Math.min(...visibleChildren.map((box) => box.top)) - cardBox.top : null;
      return {
        clientWidth: card.clientWidth,
        scrollWidth: card.scrollWidth,
        firstChildOffset,
        childrenWithinCard: visibleChildren.every((box) => box.left >= cardBox.left - 1 && box.right <= cardBox.right + 1),
      };
    }),
  );

  expect(geometry, 'Gallery should expose measurable cards').not.toHaveLength(0);
  for (const [index, card] of geometry.entries()) {
    expect(card.scrollWidth, `Gallery card ${index + 1} should not overflow horizontally`).toBeLessThanOrEqual(
      card.clientWidth + 1,
    );
    expect(card.childrenWithinCard, `Gallery card ${index + 1} children should stay within its horizontal bounds`).toBe(true);
  }
  const firstOffsets = geometry.map((card) => card.firstChildOffset).filter((offset): offset is number => offset != null);
  expect(firstOffsets, 'Gallery cards should expose visible content').toHaveLength(geometry.length);
  expect(
    Math.max(...firstOffsets) - Math.min(...firstOffsets),
    'Gallery card content should start at a consistent height',
  ).toBeLessThanOrEqual(2);
}
