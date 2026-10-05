import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  type Download,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  PALETTE_ICON,
  SEL,
  acceptRgpdIfVisible,
  addComponent,
  c8oCall,
  clickVisibleSelectorCardMenuByTitle,
  closeComponentConfig,
  createBlankForm,
  fillViewerTextInput,
  getPwaDocument,
  openComponentConfig,
  openComponentConfigAt,
  openComponentsPalette,
  openPublishedApplicationsTab,
  expectSelectorApplicationVisible,
  publishCurrentFormWithPwa,
  publishedPwaUrl,
  setChoiceDefaultValueText,
  setTechnicalId,
  setTextInputQuestion,
  submitViewerForm,
} from './studio';

type JsonRecord = Record<string, unknown>;

const RESPONSES_SEL = {
  cameraComponent: 'c8oforms-itemimgviewer',
  timeComponent: 'c8oforms-itemtimeviewver',
  dataPage: 'page-datapage:visible',
  exportModal: 'page-exportcsvpage:visible',
  responseMenuItem:
    'ion-popover:not(.overlay-hidden):visible page-popoverpageselector ion-item.class1580132441145, ' +
    'ion-popover:not(.overlay-hidden):visible page-popoverpageselector ion-item:has(ion-icon[src*="chart-column.svg"])',
} as const;

const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

type PublishedFixture = {
  formId: string;
  pwaUrl: string;
  title: string;
};

type CsvExportOptions = {
  questionSort?: 'current' | 'id' | 'label';
  responseSort?: 'current' | 'date_asc' | 'date_desc';
};

type CsvDownload = {
  bytes: Buffer;
  text: string;
  suggestedFilename: string;
};

export async function verifyPhotoResponsesRenderWithoutDuplicationThroughUi(page: Page, browser: Browser): Promise<void> {
  const suffix = Date.now();
  const technicalId = `resp_photo_${suffix}`;
  const fixture = await createPublishedPhotoFixture(page, `RESP-001 photo ${suffix}`, technicalId);

  await test.step('Submit two isolated anonymous photo responses', async () => {
    for (let index = 1; index <= 2; index += 1) {
      await submitPublishedPhoto(browser, fixture.pwaUrl, technicalId, `resp-photo-${suffix}-${index}.png`);
    }
    await waitForPublishedResponseCount(page, fixture.formId, 2);
  });

  await test.step('Assert Summary and Individual render the photo without duplicate responses', async () => {
    const dataPage = await openResponsesThroughUi(page, fixture.title);
    await selectResponsesSegment(dataPage, 'Summary');
    await expectRenderedResponseImage(dataPage, 'Summary');

    await selectResponsesSegment(dataPage, 'Individual');
    await expectIndividualResponseCount(dataPage, 2);
    await expectRenderedResponseImage(dataPage, 'Individual');
  });
}

export async function verifyAnonymousResponseTrackingThroughUi(page: Page, browser: Browser): Promise<void> {
  const suffix = Date.now();
  const technicalId = `resp_anonymous_${suffix}`;
  const fixture = await createPublishedTextFixture(page, `RESP-002 anonymous ${suffix}`, [
    { technicalId, question: `Anonymous marker ${suffix}` },
  ]);
  const markers = [`AUTH-${suffix}`, `ANON-A-${suffix}`, `ANON-B-${suffix}`];

  await test.step('Submit one signed-in and two signed-out responses to the anonymous PWA', async () => {
    const signedInState = await page.context().storageState();
    await submitPublishedText(browser, fixture.pwaUrl, technicalId, markers[0], { storageState: signedInState });
    await submitPublishedText(browser, fixture.pwaUrl, technicalId, markers[1]);
    await submitPublishedText(browser, fixture.pwaUrl, technicalId, markers[2]);
    for (const marker of markers) {
      await waitForPublishedResponseValue(page, fixture.formId, marker);
    }
  });

  await test.step('Assert response tracking keeps three anonymous rows and exposes no null identity', async () => {
    const dataPage = await openResponsesThroughUi(page, fixture.title);
    await selectResponsesSegment(dataPage, 'Invitees');

    const trackingList = await visibleTrackingList(dataPage);
    const rows = trackingList.locator(':scope > ion-item:visible');
    await expect(rows, 'anonymous response tracking should expose one row per response').toHaveCount(3, {
      timeout: 60_000,
    });
    const rowTexts = await rows.allInnerTexts();
    expect(rowTexts.join(' '), 'anonymous response tracking should not expose a null identity').not.toMatch(/\bnull\b/i);
    expect(
      rowTexts.every((text) => /#\d+/.test(text)),
      'the signed-in submission should still be represented as anonymous in an anonymous PWA',
    ).toBe(true);
    expect(rowTexts, 'each anonymous response should receive a distinct ordinal').toEqual(
      expect.arrayContaining([expect.stringContaining('#1'), expect.stringContaining('#2'), expect.stringContaining('#3')]),
    );
  });
}

export async function verifyLocalResponseTimeMatchesCsvThroughUi(page: Page, browser: Browser): Promise<void> {
  const suffix = Date.now();
  const timeTechnicalId = `resp_time_${suffix}`;
  const markerTechnicalId = `resp_tz_marker_${suffix}`;
  const marker = `TZ-${suffix}`;
  // Keep the submitted Time answer twelve hours away from the submission
  // timestamp so the timestamp comparison cannot accidentally match that field.
  const enteredTime = await localClockAtOffset(page, 12 * 60);
  const fixture = await createPublishedTimeFixture(
    page,
    `RESP-003 timezone ${suffix}`,
    timeTechnicalId,
    markerTechnicalId,
    enteredTime,
  );

  await test.step('Submit the response in a non-UTC browser timezone', async () => {
    await submitPublishedText(browser, fixture.pwaUrl, markerTechnicalId, marker, { timezoneId: 'Europe/Paris' });
    await waitForPublishedResponseValue(page, fixture.formId, marker);
  });

  await test.step('Compare the local response viewer values with the CSV export', async () => {
    const dataPage = await openResponsesThroughUi(page, fixture.title);
    await selectResponsesSegment(dataPage, 'Individual');
    await expect(dataPage, 'Individual response should retain the local Time value entered in the form').toContainText(
      enteredTime,
      { timeout: 60_000 },
    );

    const localClockCandidates = await recentLocalClockCandidates(page, 8);
    const viewerText = await dataPage.innerText();
    const displayedTimestampClock = localClockCandidates.find((clock) => viewerText.includes(clock));
    expect(displayedTimestampClock, 'response viewer should display the submission timestamp in browser local time').toBeTruthy();

    const csv = await exportCsvThroughUi(page);
    expect(csv.text, 'CSV should retain the local Time answer without UTC conversion').toContain(enteredTime);
    expect(csv.text, 'CSV timestamp should use the same local clock as the response viewer').toContain(
      displayedTimestampClock!,
    );
  });
}

export async function verifyDefaultCsvUtf8RoundTripThroughUi(page: Page, browser: Browser): Promise<void> {
  const suffix = Date.now();
  const technicalId = `resp_utf8_${suffix}`;
  const unicodeValue = `UTF8-${suffix}: é è à ç œ ’ — € 中文; "quoted"`;
  const fixture = await createPublishedTextFixture(page, `RESP-004 unicode ${suffix}`, [
    { technicalId, question: `Unicode response ${suffix}` },
  ]);

  await test.step('Submit a response containing characters outside ISO-8859-1', async () => {
    await submitPublishedText(browser, fixture.pwaUrl, technicalId, unicodeValue);
    await waitForPublishedResponseValue(page, fixture.formId, unicodeValue);
  });

  await test.step('Download with the untouched default encoding and assert a lossless UTF-8 CSV', async () => {
    await openResponsesThroughUi(page, fixture.title);
    const csv = await exportCsvThroughUi(page, {}, 'UTF-8');

    expect(csv.bytes.subarray(0, 3), 'default UTF-8 export should remain BOM-free').not.toEqual(
      Buffer.from([0xef, 0xbb, 0xbf]),
    );
    expect(() => new TextDecoder('utf-8', { fatal: true }).decode(csv.bytes), 'CSV should decode strictly as UTF-8').not.toThrow();
    expect(csv.suggestedFilename, 'CSV download should retain a .csv filename').toMatch(/\.csv$/i);

    const parsed = parseCsv(csv.text);
    const cells = parsed.flat();
    expect(cells, 'CSV parsing should retain the quoted/semicolon response as one exact Unicode cell').toContain(unicodeValue);
    expect(cells, 'Unicode response should not be degraded to question-mark replacements').not.toContain(
      unicodeValue.replace(/[œ’—€中文]/g, '?'),
    );
  });
}

export async function verifyAdvancedCsvSortingThroughUi(page: Page, browser: Browser): Promise<void> {
  const suffix = Date.now();
  const alphaQuestion = `Alpha question ${suffix}`;
  const zuluQuestion = `Zulu question ${suffix}`;
  const zetaId = `zeta_${suffix}`;
  const alphaId = `alpha_${suffix}`;
  const olderA = `OLDER-A-${suffix}`;
  const olderB = `OLDER-B-${suffix}`;
  const newerA = `NEWER-A-${suffix}`;
  const newerB = `NEWER-B-${suffix}`;
  const fixture = await createPublishedTextFixture(page, `RESP-005 sorting ${suffix}`, [
    { technicalId: zetaId, question: alphaQuestion },
    { technicalId: alphaId, question: zuluQuestion },
  ]);

  await test.step('Submit two distinguishable responses in chronological order', async () => {
    await submitPublishedTextValues(browser, fixture.pwaUrl, [
      { technicalId: zetaId, value: olderA },
      { technicalId: alphaId, value: olderB },
    ]);
    await waitForPublishedResponseValue(page, fixture.formId, olderA);
    // The CSV backend sorts on the persisted response timestamp. Keep the two
    // fixtures in distinct seconds even on stores that truncate milliseconds.
    const firstResponseSecond = Math.floor(Date.now() / 1_000);
    await expect
      .poll(() => Math.floor(Date.now() / 1_000), {
        message: 'the second response fixture should be submitted in a later timestamp second',
        timeout: 2_500,
        intervals: [50],
      })
      .toBeGreaterThan(firstResponseSecond);
    await submitPublishedTextValues(browser, fixture.pwaUrl, [
      { technicalId: zetaId, value: newerA },
      { technicalId: alphaId, value: newerB },
    ]);
    await waitForPublishedResponseValue(page, fixture.formId, newerA);
  });

  await test.step('Assert question and response sort controls change the exported order', async () => {
    await openResponsesThroughUi(page, fixture.title);

    const byTechnicalIdAsc = parseCsv(
      (await exportCsvThroughUi(page, { questionSort: 'id', responseSort: 'date_asc' })).text,
    );
    const idHeader = csvHeaderContaining(byTechnicalIdAsc, [alphaQuestion, zuluQuestion]);
    expect(idHeader.indexOf(zuluQuestion), 'alpha technical ID column should precede zeta technical ID column').toBeLessThan(
      idHeader.indexOf(alphaQuestion),
    );
    expect(csvRowIndexContaining(byTechnicalIdAsc, olderA), 'ascending response order should place the older row first').toBeLessThan(
      csvRowIndexContaining(byTechnicalIdAsc, newerA),
    );

    const byQuestionTextDesc = parseCsv(
      (await exportCsvThroughUi(page, { questionSort: 'label', responseSort: 'date_desc' })).text,
    );
    const labelHeader = csvHeaderContaining(byQuestionTextDesc, [alphaQuestion, zuluQuestion]);
    expect(labelHeader.indexOf(alphaQuestion), 'Alpha question should precede Zulu question').toBeLessThan(
      labelHeader.indexOf(zuluQuestion),
    );
    expect(
      csvRowIndexContaining(byQuestionTextDesc, newerA),
      'descending response order should place the newer row first',
    ).toBeLessThan(csvRowIndexContaining(byQuestionTextDesc, olderA));
  });
}

async function createPublishedPhotoFixture(page: Page, title: string, technicalId: string): Promise<PublishedFixture> {
  const formId = await createBlankForm(page, title);
  await openComponentsPalette(page);
  await addComponent(page, PALETTE_ICON.camera, { allowEditorApiFallback: false });
  await expect(page.locator(`${RESPONSES_SEL.cameraComponent}:visible`).first(), 'Photo component should be visible').toBeVisible({
    timeout: 30_000,
  });
  await openComponentConfig(page, RESPONSES_SEL.cameraComponent);
  await setTechnicalId(page, technicalId);
  await closeComponentConfig(page);
  return publishFixture(page, formId, title);
}

async function createPublishedTextFixture(
  page: Page,
  title: string,
  questions: Array<{ technicalId: string; question: string }>,
): Promise<PublishedFixture> {
  const formId = await createBlankForm(page, title);
  for (const question of questions) {
    const before = await page.locator(SEL.textComponent).count();
    await openComponentsPalette(page);
    await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
    await openComponentConfigAt(page, SEL.textComponent, before);
    await setTechnicalId(page, question.technicalId);
    await setTextInputQuestion(page, question.question);
    await closeComponentConfig(page);
  }
  return publishFixture(page, formId, title);
}

async function createPublishedTimeFixture(
  page: Page,
  title: string,
  timeTechnicalId: string,
  markerTechnicalId: string,
  defaultTime: string,
): Promise<PublishedFixture> {
  const formId = await createBlankForm(page, title);
  await openComponentsPalette(page);
  await addComponent(page, PALETTE_ICON.time, { allowEditorApiFallback: false });
  await openComponentConfig(page, RESPONSES_SEL.timeComponent);
  await setTechnicalId(page, timeTechnicalId);
  await setChoiceDefaultValueText(page, defaultTime);
  await closeComponentConfig(page);

  await openComponentsPalette(page);
  await addComponent(page, PALETTE_ICON.textInput, { allowEditorApiFallback: false });
  await openComponentConfig(page, SEL.textComponent);
  await setTechnicalId(page, markerTechnicalId);
  await setTextInputQuestion(page, `Timezone marker ${markerTechnicalId}`);
  await closeComponentConfig(page);
  return publishFixture(page, formId, title);
}

async function publishFixture(page: Page, formId: string, title: string): Promise<PublishedFixture> {
  await publishCurrentFormWithPwa(page, 'anonymous');
  const pwa = await expectPublishedPwa(page, formId);
  const targetId =
    (typeof pwa.targetId === 'string' && pwa.targetId) ||
    (typeof pwa.anonymousKey === 'string' && pwa.anonymousKey) ||
    `published_${formId}`;
  return { formId, title, pwaUrl: publishedPwaUrl(page, targetId) };
}

async function expectPublishedPwa(page: Page, formId: string): Promise<JsonRecord> {
  let pwa: JsonRecord | null = null;
  await expect
    .poll(async () => {
      pwa = await getPwaDocument(page, formId);
      return pwa;
    }, { message: 'anonymous PWA document should be available', timeout: 60_000 })
    .not.toBeNull();
  return pwa!;
}

async function submitPublishedPhoto(
  browser: Browser,
  pwaUrl: string,
  technicalId: string,
  fileName: string,
): Promise<void> {
  const context = await browser.newContext();
  try {
    const responsePage = await openStandalonePwa(context, pwaUrl);
    const component = await visiblePhotoComponent(responsePage, technicalId);
    await expect(component, 'published Photo component should be visible').toBeVisible({ timeout: 60_000 });
    const input = component.locator('input[type="file"][accept="image/*"], input[type="file"]').first();
    await input.setInputFiles({ name: fileName, mimeType: 'image/png', buffer: TINY_PNG_BUFFER });
    await input.dispatchEvent('change');
    await expect
      .poll(
        () => component.locator('img:visible').evaluateAll((images) => images.some((image) => (image as HTMLImageElement).naturalWidth > 0)),
        { message: 'selected Photo should render a loaded preview', timeout: 30_000 },
      )
      .toBe(true);
    await submitViewerForm(responsePage);
  } finally {
    await context.close();
  }
}

async function visiblePhotoComponent(page: Page, technicalId: string): Promise<Locator> {
  const containsTechnicalId = page
    .locator(`${RESPONSES_SEL.cameraComponent}:visible`)
    .filter({ has: page.locator(`#${technicalId}`) })
    .first();
  if (await containsTechnicalId.isVisible({ timeout: 5_000 }).catch(() => false)) return containsTechnicalId;

  const hostById = page.locator(`${RESPONSES_SEL.cameraComponent}#${technicalId}:visible`).first();
  if (await hostById.isVisible({ timeout: 5_000 }).catch(() => false)) return hostById;

  const fallback = page.locator(`${RESPONSES_SEL.cameraComponent}:visible`).first();
  await expect(fallback, `published Photo component ${technicalId} should be visible`).toBeVisible({ timeout: 60_000 });
  return fallback;
}

async function submitPublishedText(
  browser: Browser,
  pwaUrl: string,
  technicalId: string,
  value: string,
  contextOptions: BrowserContextOptions = {},
): Promise<void> {
  await submitPublishedTextValues(browser, pwaUrl, [{ technicalId, value }], contextOptions);
}

async function submitPublishedTextValues(
  browser: Browser,
  pwaUrl: string,
  values: Array<{ technicalId: string; value: string }>,
  contextOptions: BrowserContextOptions = {},
): Promise<void> {
  const context = await browser.newContext(contextOptions);
  try {
    const responsePage = await openStandalonePwa(context, pwaUrl);
    for (const entry of values) {
      await fillViewerTextInput(responsePage, entry.technicalId, entry.value);
    }
    await submitViewerForm(responsePage);
  } finally {
    await context.close();
  }
}

async function openStandalonePwa(context: BrowserContext, pwaUrl: string): Promise<Page> {
  const responsePage = await context.newPage();
  await responsePage.goto(pwaUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await acceptRgpdIfVisible(responsePage);
  await expect(responsePage.locator(SEL.viewerPage), 'published viewer should render').toBeAttached({ timeout: 60_000 });
  return responsePage;
}

async function waitForPublishedResponseValue(page: Page, formId: string, expectedValue: string): Promise<void> {
  await expect
    .poll(async () => responseContainsExactString(await publishedResponses(page, formId), expectedValue), {
      message: `published response should contain ${expectedValue}`,
      timeout: 60_000,
    })
    .toBe(true);
}

function responseContainsExactString(value: unknown, expectedValue: string): boolean {
  if (typeof value === 'string') return value === expectedValue;
  if (Array.isArray(value)) return value.some((entry) => responseContainsExactString(entry, expectedValue));
  if (value && typeof value === 'object') {
    return Object.values(value as JsonRecord).some((entry) => responseContainsExactString(entry, expectedValue));
  }
  return false;
}

async function waitForPublishedResponseCount(page: Page, formId: string, expectedCount: number): Promise<void> {
  await expect
    .poll(async () => countNestedResponseRows(await publishedResponses(page, formId)), {
      message: `published response set should contain exactly ${expectedCount} rows`,
      timeout: 60_000,
    })
    .toBe(expectedCount);
}

async function publishedResponses(page: Page, formId: string): Promise<JsonRecord> {
  return c8oCall(page, 'APIV2_getResponses', {
    formId: formId.startsWith('published_') ? formId : `published_${formId}`,
    summary: 'false',
    csv: 'false',
    meta: JSON.stringify({ limit: 20 }),
  });
}

function countNestedResponseRows(response: JsonRecord): number {
  const payload = ((response.res as JsonRecord | undefined) ?? response) as JsonRecord;
  const root = (payload.response as JsonRecord | undefined) ?? payload;
  const nested = root.nestedResponses;
  if (!Array.isArray(nested)) return 0;
  return nested.length;
}

async function openResponsesThroughUi(page: Page, title: string): Promise<Locator> {
  await openPublishedApplicationsTab(page);
  await expectSelectorApplicationVisible(page, title);
  await expect
    .poll(() => clickVisibleSelectorCardMenuByTitle(page, title), {
      message: 'published application menu should open',
      timeout: 30_000,
    })
    .toBe(true);
  const responseItem = page.locator(RESPONSES_SEL.responseMenuItem).first();
  await expect(responseItem, 'published application menu should expose response visualization').toBeVisible({ timeout: 15_000 });
  await responseItem.click();
  const dataPage = page.locator(RESPONSES_SEL.dataPage).last();
  await expect(dataPage, 'response visualization page should open').toBeVisible({ timeout: 60_000 });
  await expect(dataPage.locator('ion-segment-button[value="Summary"]').first(), 'response segments should render').toBeVisible({
    timeout: 60_000,
  });
  return dataPage;
}

async function selectResponsesSegment(dataPage: Locator, value: 'Summary' | 'Individual' | 'Invitees'): Promise<void> {
  const segment = dataPage.locator(`ion-segment-button[value="${value}"]`).first();
  await expect(segment, `${value} response segment should be visible`).toBeVisible({ timeout: 30_000 });
  await segment.click();
  await expect(segment, `${value} response segment should become selected`).toHaveClass(/\bsegment-button-checked\b/, {
    timeout: 30_000,
  });
}

async function expectRenderedResponseImage(dataPage: Locator, surface: string): Promise<void> {
  const images = dataPage.locator('c8oforms-sharedstatsimg:visible img:visible');
  await expect
    .poll(
      () => images.evaluateAll((entries) => entries.filter((entry) => (entry as HTMLImageElement).naturalWidth > 0).length),
      { message: `${surface} should render a loaded response image`, timeout: 60_000 },
    )
    .toBeGreaterThan(0);
}

async function expectIndividualResponseCount(dataPage: Locator, expectedCount: number): Promise<void> {
  const pager = dataPage.locator('ion-input[type="number"]:visible').first();
  await expect(pager, 'Individual response pager should be visible').toBeVisible({ timeout: 30_000 });
  await expect
    .poll(() => pager.evaluate((element) => Number((element as HTMLElement & { max?: string | number }).max)), {
      message: 'Individual response pager maximum should equal the stored response count',
      timeout: 30_000,
    })
    .toBe(expectedCount);
}

async function visibleTrackingList(dataPage: Locator): Promise<Locator> {
  const lists = dataPage.locator('ion-card:visible ion-list:visible:not(:has(ion-skeleton-text))');
  await expect
    .poll(() => lists.count(), { message: 'response tracking list should finish loading', timeout: 60_000 })
    .toBeGreaterThan(0);
  return lists.last();
}

async function exportCsvThroughUi(
  page: Page,
  options: CsvExportOptions = {},
  expectedDefaultEncoding?: string,
): Promise<CsvDownload> {
  // The response toolbar is rendered outside page-datapage. Ionic consumes the
  // icon source during hydration, so its src is not a queryable host attribute;
  // use the generated identity of the toolbar's CSV button instead.
  const exportButton = page.locator('ion-button.class1770651143045:visible').first();
  await expect(exportButton, 'response view should expose CSV export').toBeVisible({ timeout: 30_000 });
  await exportButton.click();

  const modal = await visibleCsvExportModal(page);
  if (expectedDefaultEncoding || options.questionSort || options.responseSort) {
    await exposeCsvAdvancedOptions(modal);
  }
  if (expectedDefaultEncoding) {
    await expectIonSelectValue(modal, expectedDefaultEncoding, 'default CSV character set');
  }
  if (options.questionSort) {
    await setIonSelectValue(modal, ['current', 'id', 'label'], options.questionSort, 'question sort');
  }
  if (options.responseSort) {
    await setIonSelectValue(modal, ['current', 'date_asc', 'date_desc'], options.responseSort, 'response sort');
  }

  const downloadButton = modal.locator('ion-button.class1763127394827:visible').first();
  await expect(downloadButton, 'CSV export modal should expose file download').toBeVisible({ timeout: 30_000 });
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 60_000 }), downloadButton.click()]);
  const bytes = await readDownload(download);
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  return { bytes, text, suggestedFilename: download.suggestedFilename() };
}

async function visibleCsvExportModal(page: Page): Promise<Locator> {
  const modals = page.locator(RESPONSES_SEL.exportModal);
  await expect(modals.last(), 'CSV export page should open').toBeVisible({ timeout: 30_000 });
  return modals.last();
}

async function exposeCsvAdvancedOptions(modal: Locator): Promise<void> {
  const encodingOption = modal.locator('ion-select-option[value="UTF-8"]');
  if (await encodingOption.count()) return;

  const advancedToggle = modal.locator('ion-toggle.class1763123554438:visible').first();
  await expect(advancedToggle, 'CSV export page should expose advanced settings').toBeVisible({ timeout: 15_000 });
  await advancedToggle.click();
  await expect(encodingOption, 'CSV export advanced settings should expose UTF-8').toHaveCount(1, { timeout: 15_000 });
}

async function expectIonSelectValue(root: Locator, value: string, description: string): Promise<void> {
  const select = await ionSelectWithOptions(root, [value]);
  await expect
    .poll(() => select.evaluate((element) => String((element as HTMLElement & { value?: string }).value ?? '')), {
      message: `${description} should be ${value}`,
      timeout: 15_000,
    })
    .toBe(value);
}

async function setIonSelectValue(root: Locator, signature: string[], value: string, description: string): Promise<void> {
  const select = await ionSelectWithOptions(root, signature);
  const optionValues = await select.locator('ion-select-option').evaluateAll((options) =>
    options.map((option) =>
      String((option as HTMLElement & { value?: string }).value ?? option.getAttribute('value') ?? ''),
    ),
  );
  const optionIndex = optionValues.indexOf(value);
  expect(optionIndex, `${description} should offer ${value}`).toBeGreaterThanOrEqual(0);

  await select.click();
  const option = root
    .page()
    .locator('ion-popover:not(.overlay-hidden) ion-select-popover ion-item:visible')
    .nth(optionIndex);
  await expect(option, `${description} option ${value} should be visible`).toBeVisible({ timeout: 15_000 });
  await option.click();
  await expect
    .poll(() => select.evaluate((element) => String((element as HTMLElement & { value?: string }).value ?? '')), {
      message: `${description} should persist ${value}`,
      timeout: 15_000,
    })
    .toBe(value);
}

async function ionSelectWithOptions(root: Locator, expectedOptions: string[]): Promise<Locator> {
  const selects = root.locator('ion-select:visible');
  const count = await selects.count();
  for (let index = 0; index < count; index += 1) {
    const select = selects.nth(index);
    const values = await select.locator('ion-select-option').evaluateAll((options) =>
      options.map((option) =>
        String((option as HTMLElement & { value?: string }).value ?? option.getAttribute('value') ?? ''),
      ),
    );
    if (expectedOptions.every((value) => values.includes(value))) return select;
  }
  throw new Error(`could not find ion-select exposing options: ${expectedOptions.join(', ')}`);
}

async function readDownload(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error('CSV download did not expose a readable stream');
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function recentLocalClockCandidates(page: Page, minutes: number): Promise<string[]> {
  return page.evaluate((count) => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return Array.from({ length: count }, (_, index) => formatter.format(new Date(Date.now() - index * 60_000)));
  }, minutes);
}

async function localClockAtOffset(page: Page, offsetMinutes: number): Promise<string> {
  return page.evaluate((offset) => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return formatter.format(new Date(Date.now() + offset * 60_000));
  }, offsetMinutes);
}

function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = countOutsideQuotes(firstLine, ';') >= countOutsideQuotes(firstLine, ',') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function countOutsideQuotes(text: string, searched: string): number {
  let count = 0;
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '"') quoted = !quoted;
    else if (!quoted && text[index] === searched) count += 1;
  }
  return count;
}

function csvHeaderContaining(rows: string[][], labels: string[]): string[] {
  const header = rows.find((row) => labels.every((label) => row.includes(label)));
  expect(header, `CSV should contain a header with ${labels.join(' and ')}`).toBeTruthy();
  return header!;
}

function csvRowIndexContaining(rows: string[][], marker: string): number {
  const index = rows.findIndex((row) => row.includes(marker));
  expect(index, `CSV should contain response marker ${marker}`).toBeGreaterThanOrEqual(0);
  return index;
}
