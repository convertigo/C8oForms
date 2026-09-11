import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = join(here, '..');
const e2eDir = join(testsDir, 'e2e');
const shardScript = join(here, 'shard-specs.mjs');

function runPlan(shardTotal, timingsPath) {
  return Array.from({ length: shardTotal }, (_, index) => {
    const args = [shardScript, String(index + 1), String(shardTotal)];
    if (timingsPath) args.push(timingsPath);
    const output = execFileSync(process.execPath, args, {
      cwd: testsDir,
      encoding: 'utf8',
      env: { ...process.env, C8OFORMS_SHARD_DEBUG: '0' },
    }).trim();
    return output ? output.split(/\s+/) : [];
  });
}

test('assigns every spec exactly once and keeps issue-1421 on shard 1', () => {
  const plan = runPlan(8);
  const assigned = plan.flat();
  const expected = readdirSync(e2eDir)
    .filter((name) => name.endsWith('.spec.ts'))
    .map((name) => `e2e/${name}`)
    .sort();

  assert.deepEqual([...assigned].sort(), expected);
  assert.equal(new Set(assigned).size, assigned.length);
  assert.ok(plan[0].includes('e2e/issue-1421.spec.ts'));
});

test('uses measured timings to put the largest specs on distinct shards', () => {
  const temporaryDir = mkdtempSync(join(tmpdir(), 'c8oforms-sharding-'));
  const timingsPath = join(temporaryDir, 'e2e-timings.json');
  const heavySpecs = [
    'functional-publication.spec.ts',
    'functional-sharing-access.spec.ts',
    'functional-components-common.spec.ts',
    'functional-components-values-choices.spec.ts',
    'functional-visibility-operators.spec.ts',
  ];

  try {
    writeFileSync(
      timingsPath,
      JSON.stringify({
        specs: Object.fromEntries(
          heavySpecs.map((name, index) => [name, { durationMs: (100 - index * 10) * 60_000 }]),
        ),
      }),
    );

    const plan = runPlan(8, timingsPath);
    const shardIndexes = heavySpecs.map((name) =>
      plan.findIndex((specs) => specs.includes(`e2e/${name}`)),
    );

    assert.equal(new Set(shardIndexes).size, heavySpecs.length);
    assert.ok(shardIndexes.every((index) => index >= 0));
  } finally {
    rmSync(temporaryDir, { recursive: true, force: true });
  }
});
