// Run after Convertigo has regenerated the viewer: node --test tests/unit/context-defaults.test.cjs
// Exercises the actual generated scalar-source handler, without a browser or data writes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const viewer = fs.readFileSync(path.resolve(__dirname, '../../_private/ionic/src/app/pages/viewerpage/viewerpage.ts'), 'utf8');
const marker = viewer.indexOf('// Opt-in initial defaults');
assert.ok(marker > 0, 'Regenerate the viewer before running this test');
const start = viewer.lastIndexOf('this.functionsById[sha] =', marker);
const end = viewer.indexOf('await this.functionsById[sha](true);', marker);
assert.ok(start > 0 && end > start);
const install = vm.runInNewContext('(function (page, item, formSubmit) { var sha = "test"; var findVars = {}; var variables = {}; ' + viewer.slice(start, end) + '; return this.functionsById[sha]; })');

function harness({ mode = 'initial', current = '', result = 'prefill', fromResponse = false, query, type = 'text', compute } = {}) {
  const item = { name: 'answer', id: 1, type, config: { contextValueMode: mode, defaultvalue: 0 } };
  const values = { answer: { value: current } };
  let computations = 0;
  const page = {
    functionsById: {}, local: { fromResponse, urlParams: new Map(query || []), functionsToBeCalled: {} },
    normalizeTextSourceValue: value => value, normalizeTimeDefaultValue: value => value,
    ref: { detectChanges() {} }, c8o: { log: { error(message) { throw new Error(message); } } },
    async computeVariable(_find, vars) { computations++; vars.selfVar = compute ? await compute() : result; }
  };
  const run = install.call(page, page, item, values);
  return { run, values, page, computations: () => computations };
}

test('initial context value fills once and does not refill after manual clearing', async () => {
  const h = harness();
  await h.run(true);
  assert.equal(h.values.answer.value, 'prefill');
  h.values.answer.value = '';
  await h.run(false);
  assert.equal(h.values.answer.value, '');
  assert.equal(h.computations(), 1);
});
test('initial defaults preserve responses and explicit URL values, even empty', async () => {
  for (const options of [{ fromResponse: true }, { query: [['answer', '']] }, { query: [['answer', 'url']] }]) {
    const h = harness(options);
    await h.run(true);
    assert.equal(h.values.answer.value, '');
    assert.equal(h.computations(), 0);
  }
});
test('initial defaults preserve existing manual values, including false and zero', async () => {
  for (const current of ['manual', false, 0]) {
    const h = harness({ current });
    await h.run(true);
    assert.equal(h.values.answer.value, current);
    assert.equal(h.computations(), 0);
  }
});
test('an async initial expression cannot replace a value entered while it ran', async () => {
  let finish;
  const h = harness({ compute: () => new Promise(resolve => { finish = resolve; }) });
  const pending = h.run(true);
  h.values.answer.value = 'typed during loading';
  finish('late default');
  await pending;
  assert.equal(h.values.answer.value, 'typed during loading');
});
test('initial slider defaults replace the native baseline but not an entered value', async () => {
  for (const current of [0, 12]) {
    const h = harness({ type: 'slider', current, result: 5 });
    await h.run(true);
    assert.equal(h.values.answer.value, current === 0 ? 5 : 12);
  }
});
test('reactive and legacy sources retain their dependency-update behavior', async () => {
  for (const mode of ['reactive', null]) {
    const h = harness({ mode, current: 'old', result: 'derived' });
    await h.run(false);
    assert.equal(h.values.answer.value, 'derived');
    const response = harness({ mode, current: 'saved', result: 'derived', fromResponse: true });
    await response.run(true);
    assert.equal(response.values.answer.value, 'saved');
  }
});
