// Release gate: the CI runs the WHOLE suite (open bugs included, for visibility),
// then this script decides whether to block the release. It blocks only on an
// UNEXPECTED failure — a test that should pass. Failures of open-bug specs
// (kind=open in the manifest) are red on purpose and must not block a release.
//
//   node ci/gate.mjs   # exit 0 = release allowed, exit 1 = blocked
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = join(here, '..');

const report = JSON.parse(readFileSync(join(testsDir, 'test-results', 'results.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(testsDir, 'e2e', 'regression-manifest.json'), 'utf8'));

// Spec files that hold open-bug tests (failures there are expected).
const openSpecFiles = new Set(
  Object.values(manifest.tests)
    .filter((t) => t.kind === 'open')
    .map((t) => basename(t.spec)),
);

// Walk the Playwright JSON report and collect failing specs with their file.
const failing = [];
const walk = (suites = []) => {
  for (const s of suites) {
    for (const spec of s.specs ?? []) {
      if (spec.ok === false) failing.push({ file: basename(spec.file || s.file || ''), title: spec.title });
    }
    walk(s.suites);
  }
};
walk(report.suites);

const blocking = failing.filter((f) => !openSpecFiles.has(f.file));
const expected = failing.filter((f) => openSpecFiles.has(f.file));

const line = (s) => console.log(s);
line('');
line('────────────────── Release gate ──────────────────');
if (expected.length) {
  line(`Expected red (open bugs, not blocking): ${expected.length}`);
  for (const f of expected) line(`  · ${f.title}`);
}
if (blocking.length) {
  line(`\n✗ Unexpected failures (BLOCK the release): ${blocking.length}`);
  for (const f of blocking) line(`  ✗ ${f.title}  [${f.file}]`);
  line('───────────────────────────────────────────────────');
  line('Release blocked — a test that should pass is red.');
  process.exit(1);
}
line('\n✓ No unexpected failure — release allowed.');
line('───────────────────────────────────────────────────');
process.exit(0);
