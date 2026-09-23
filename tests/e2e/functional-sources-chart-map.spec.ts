import { test } from './fixtures';
import {
  configureChartBaserowTableAndAssertPersistenceThroughUi,
  configureMapBaserowTableAndAssertPersistenceThroughUi,
  exerciseChartSourceTypeAndHeightThroughUi,
  exerciseMapBaserowMarkersThroughUi,
} from './helpers/functional-sources';
import { createBlankApplicationThroughUi, loginWithUsernamePassword } from './helpers/functional-studio';

// Chart and Map part of the sources contract (see functional-sources-grid.spec.ts).
test.describe('No-Code Studio functional sources contract - Chart and Map', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('SRC-004 - configure Chart from Baserow', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureChartBaserowTableAndAssertPersistenceThroughUi(page);
  });

  test('CMP-CHART-001 - Chart source roles, type, and height', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseChartSourceTypeAndHeightThroughUi(page);
  });

  test('SRC-005 - configure Map from Baserow', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await configureMapBaserowTableAndAssertPersistenceThroughUi(page);
  });

  test('CMP-MAP-002 - Map Baserow roles and visible markers', async ({ page }) => {
    test.setTimeout(420_000);
    await loginWithUsernamePassword(page);
    await createBlankApplicationThroughUi(page);
    await exerciseMapBaserowMarkersThroughUi(page);
  });
});
