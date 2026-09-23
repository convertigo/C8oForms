// node --test tests/unit/application-history-retention.test.cjs
// Exercises the retention of the automatic versions of js/application_history.js (#1359), a pure function
// of the module: it is loaded as the Convertigo engine includes it, without the engine.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../js/application_history.js'), 'utf8');
const { autoEntriesToDrop } = vm.runInNewContext(`${source}; c8oHistory`);

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const NOW = Date.UTC(2026, 8, 23, 12, 30);
const entry = (age) => ({ id: `entry_${age}`, rev: '1-a', createdAt: NOW - age });
const dropped = (ages) => autoEntriesToDrop(ages.map(entry), NOW).map((e) => NOW - e.createdAt).sort((a, b) => a - b);

test('keeps every automatic version of the last hour', () => {
  const ages = Array.from({ length: 60 }, (_, i) => i * MINUTE);
  assert.deepEqual(dropped(ages), []);
});

test('keeps the newest automatic version of each hour of the last day', () => {
  // 12:30 is NOW: 10:40, 10:10 and 10:00 share the 10:00 hour, 09:50 is alone in its hour.
  const ages = [110 * MINUTE, 140 * MINUTE, 150 * MINUTE, 160 * MINUTE];
  assert.deepEqual(dropped(ages), [140 * MINUTE, 150 * MINUTE]);
});

test('keeps the newest automatic version of each day of the last week', () => {
  const ages = [2 * DAY, 2 * DAY + HOUR, 3 * DAY, 3 * DAY + 2 * HOUR];
  assert.deepEqual(dropped(ages), [2 * DAY + HOUR, 3 * DAY + 2 * HOUR]);
});

test('drops the automatic versions older than a week', () => {
  assert.deepEqual(dropped([7 * DAY + MINUTE, 30 * DAY]), [7 * DAY + MINUTE, 30 * DAY]);
});

test('an hour bucket does not keep a version on behalf of the day tier', () => {
  // Same calendar day, one version under a day old and one over: each tier keeps its own.
  const ages = [23 * HOUR, 25 * HOUR];
  assert.deepEqual(dropped(ages), []);
});
