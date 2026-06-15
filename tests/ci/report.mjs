// Post-release CI step: the release happens even when a test fails. This script
// is driven by the ACTUAL Playwright results (not the manifest), so every test
// that ran is counted and every failing issue-backed test is handled — even
// specs that were never registered in the manifest.
//
// It:
//   1. counts pass/fail from test-results/results.json (real denominator),
//   2. reopens any CLOSED issue whose test failed (issue number read from the
//      test title `#NNNN`), commenting the released tag,
//   3. writes a Markdown report (step summary + dist/e2e_report.md) and a
//      shields.io badge (dist/badge/e2e-badge.json).
// The manifest is used only as optional metadata (kind = open/regression/…,
// fixedVersion for the comment). It intentionally exits 0 — it reports, it does
// not gate the release.
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = join(here, '..');
const releaseTag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || 'unknown';
const repo = process.env.GITHUB_REPOSITORY || 'convertigo/C8oForms';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
const runUrl = process.env.GITHUB_RUN_ID ? `${serverUrl}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';

const manifest = JSON.parse(readFileSync(join(testsDir, 'e2e', 'regression-manifest.json'), 'utf8')).tests;

function findResultsJson(dir) {
  if (!existsSync(dir)) return null;
  const direct = join(dir, 'results.json');
  if (existsSync(direct)) return direct;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      const found = findResultsJson(p);
      if (found) return found;
    } else if (entry === 'results.json') {
      return p;
    }
  }
  return null;
}

// Every test (= Playwright "spec") from the report, with its pass/fail.
function collectTests(report) {
  const out = [];
  const failed = (spec) =>
    spec.ok === false ||
    (spec.tests || []).some((t) => (t.results || []).some((r) => ['failed', 'timedOut', 'interrupted'].includes(r.status)));
  const walk = (suites = []) => {
    for (const s of suites) {
      for (const spec of s.specs || []) {
        out.push({ file: basename(spec.file || s.file || ''), title: spec.title || '', failed: failed(spec) });
      }
      walk(s.suites || []);
    }
  };
  walk(report.suites || []);
  return out;
}

// Optional manifest metadata for a test, matched by spec file + grep substring.
function manifestFor(test) {
  for (const [id, entry] of Object.entries(manifest)) {
    if (basename(entry.spec) !== test.file) continue;
    const grep = entry.grep ? String(entry.grep).toLowerCase() : '';
    if (!grep || test.title.toLowerCase().includes(grep)) return { id, entry };
  }
  return null;
}

function gh(args) {
  try {
    return { ok: true, stdout: execFileSync('gh', args, { encoding: 'utf8', env: process.env, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (error) {
    return { ok: false, stdout: '', stderr: String(error.stderr || error.message || '').trim() };
  }
}

const tableCell = (v) => String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');

// ── Collect results ──────────────────────────────────────────────────────────
const resultsPath = findResultsJson(join(testsDir, 'test-results'));
const missingResults = !resultsPath;

const tests = (missingResults ? [] : collectTests(JSON.parse(readFileSync(resultsPath, 'utf8')))).map((t) => {
  const m = manifestFor(t);
  const issue = (t.title.match(/#(\d+)/) || [])[1] || '';
  return { ...t, issue, kind: m?.entry.kind || (issue ? 'regression' : 'smoke'), entry: m?.entry };
});

// ── Reopen closed issues whose test failed (deduped per issue) ───────────────
const reopened = [];
const alreadyOpen = [];
const issueErrors = [];
const handled = new Set();

for (const t of tests) {
  if (!t.failed) {
    t.action = 'No action';
    continue;
  }
  if (!t.issue) {
    t.action = t.kind === 'open' ? 'Expected red (open)' : 'Failure (no issue)';
    continue;
  }
  if (handled.has(t.issue)) {
    t.action = `See #${t.issue}`;
    continue;
  }
  handled.add(t.issue);

  const state = gh(['issue', 'view', t.issue, '-R', repo, '--json', 'state', '--jq', '.state']);
  if (!state.ok) {
    t.action = 'Issue lookup failed';
    issueErrors.push(`#${t.issue}: ${state.stderr || 'state lookup failed'}`);
    continue;
  }
  if (state.stdout.toUpperCase() !== 'CLOSED') {
    t.action = `Already open #${t.issue}`;
    alreadyOpen.push(t.issue);
    continue;
  }
  const context = t.entry?.fixedVersion
    ? `It was fixed in ${t.entry.fixedVersion}, so the regression is present after that fix and in ${releaseTag}.`
    : `The test for this issue failed on ${releaseTag}.`;
  const comment = [
    `E2E regression detected in ${releaseTag}.`,
    '',
    `The automated end-to-end test for this issue failed on the released tag ${releaseTag}.`,
    context,
    runUrl ? `CI run: ${runUrl}` : '',
    '',
    'Reopened automatically by the release workflow.',
  ].filter(Boolean).join('\n');

  const r = gh(['issue', 'reopen', t.issue, '-R', repo, '-c', comment]);
  if (r.ok) {
    t.action = `Reopened #${t.issue}`;
    reopened.push(t.issue);
  } else {
    t.action = 'Reopen failed';
    issueErrors.push(`#${t.issue}: ${r.stderr || 'reopen failed'}`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const failedTests = tests.filter((t) => t.failed);
const unexpected = failedTests.filter((t) => t.kind !== 'open'); // open bugs are red on purpose
const passedCount = tests.length - failedTests.length;

const lines = [];
lines.push(`## E2E regression report - \`${releaseTag}\``);
lines.push('');
if (runUrl) lines.push(`CI run: ${runUrl}`);
lines.push('');
if (missingResults) {
  lines.push('Playwright did not produce a JSON report, so no issue was reopened automatically.');
} else {
  lines.push(`Passed **${passedCount}/${tests.length}**, failed **${failedTests.length}** (${unexpected.length} unexpected).`);
  lines.push('Test failures do not block the release; failed closed issue-backed tests are reopened.');
}
if (reopened.length) lines.push(`\nReopened issues: ${reopened.map((n) => `#${n}`).join(', ')}`);
if (alreadyOpen.length) lines.push(`\nFailed issues already open: ${[...new Set(alreadyOpen)].map((n) => `#${n}`).join(', ')}`);
if (issueErrors.length) {
  lines.push('\nIssue automation errors:');
  for (const e of issueErrors) lines.push(`- ${e}`);
}

lines.push('');
lines.push('| Test | Kind | Issue | Result | Action |');
lines.push('|---|---|---|---|---|');
for (const t of [...tests].sort((a, b) => Number(b.failed) - Number(a.failed))) {
  lines.push(`| ${tableCell(t.title)} | ${tableCell(t.kind)} | ${t.issue ? `#${t.issue}` : '-'} | ${t.failed ? 'FAIL' : 'PASS'} | ${tableCell(t.action)} |`);
}

const markdown = `${lines.join('\n')}\n`;
mkdirSync(join(testsDir, 'dist'), { recursive: true });
writeFileSync(join(testsDir, 'dist', 'e2e_report.md'), markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);

// shields.io endpoint badge. Green unless an UNEXPECTED test failed (an open-bug
// red is expected, so the badge stays green — the number still conveys it).
const badge = missingResults
  ? { schemaVersion: 1, label: 'e2e', message: 'no results', color: 'lightgrey' }
  : { schemaVersion: 1, label: 'e2e', message: `${passedCount}/${tests.length} passed`, color: unexpected.length ? 'red' : 'brightgreen' };
const badgeDir = join(testsDir, 'dist', 'badge');
mkdirSync(badgeDir, { recursive: true });
writeFileSync(join(badgeDir, 'e2e-badge.json'), `${JSON.stringify(badge)}\n`);

process.exit(0);
