// E2E report step: release runs keep going even when a test fails. This script
// is driven by the ACTUAL Playwright results (not the manifest), so every test
// that ran is counted — even specs that were never registered in the manifest.
//
// It:
//   1. counts pass/fail from one or more Playwright results.json files (real denominator),
//   2. optionally reopens any CLOSED issue whose test failed (issue number read
//      from the test title `#NNNN`), commenting the released tag,
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
const expectedResultShards = Number(process.env.EXPECTED_E2E_RESULT_SHARDS || 0);
const issueAutomationEnabled = process.env.E2E_REOPEN_ISSUES === 'true';

const manifest = JSON.parse(readFileSync(join(testsDir, 'e2e', 'regression-manifest.json'), 'utf8')).tests;

function findResultsJsons(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  const direct = join(dir, 'results.json');
  if (existsSync(direct)) found.push(direct);
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      found.push(...findResultsJsons(p));
    } else if (entry === 'results.json') {
      found.push(p);
    }
  }
  return [...new Set(found)].sort();
}

function findFilesNamed(dir, filename) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      found.push(...findFilesNamed(path, filename));
    } else if (entry === filename) {
      found.push(path);
    }
  }
  return found.sort();
}

function networkType(snapshot) {
  const url = snapshot?.request?.url || '';
  if (url.includes('/_changes?') && url.includes('feed=longpoll')) return 'longpoll';
  return snapshot?._resourceType || 'other';
}

function sanitizedRequestPath(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return String(url || '').split('?')[0];
  }
}

function responseHeader(snapshot, name) {
  const expected = name.toLowerCase();
  return (snapshot?.response?.headers || []).find((header) =>
    String(header?.name || '').toLowerCase() === expected)?.value || '(none)';
}

function collectTraceNetworkSamples(rootDir) {
  const samples = [];
  const errors = [];
  const traceZips = findFilesNamed(rootDir, 'trace.zip');

  for (const traceZip of traceZips) {
    try {
      const entries = execFileSync('unzip', ['-Z1', traceZip], {
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
      }).split(/\r?\n/).filter((entry) => entry.endsWith('.network'));
      for (const entry of entries) {
        const contents = execFileSync('unzip', ['-p', traceZip, entry], {
          encoding: 'utf8',
          maxBuffer: 128 * 1024 * 1024,
        });
        for (const line of contents.split(/\r?\n/)) {
          if (!line) continue;
          const snapshot = JSON.parse(line)?.snapshot;
          const durationMs = Number(snapshot?.time);
          if (!snapshot || !Number.isFinite(durationMs) || durationMs < 0) continue;
          samples.push({
            type: networkType(snapshot),
            durationMs,
            status: Number(snapshot?.response?.status || 0),
            path: sanitizedRequestPath(snapshot?.request?.url),
            cacheControl: responseHeader(snapshot, 'cache-control'),
          });
        }
      }
    } catch (error) {
      errors.push(`${basename(dirname(traceZip))}: ${error.message}`);
    }
  }
  return { samples, errors, traceZips: traceZips.length };
}

function aggregateCacheControls(samples) {
  const byType = new Map();
  for (const sample of samples) {
    const counts = byType.get(sample.type) ?? new Map();
    counts.set(sample.cacheControl, (counts.get(sample.cacheControl) ?? 0) + 1);
    byType.set(sample.type, counts);
  }
  return Object.fromEntries([...byType.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, counts]) => [
      type,
      Object.fromEntries([...counts.entries()].sort(([, a], [, b]) => b - a)),
    ]));
}

function percentile(sorted, ratio) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

function aggregateNetworkTimings(samples) {
  const byType = new Map();
  for (const sample of samples) {
    const durations = byType.get(sample.type) ?? [];
    durations.push(sample.durationMs);
    byType.set(sample.type, durations);
  }
  return Object.fromEntries([...byType.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, durations]) => {
      durations.sort((a, b) => a - b);
      return [type, {
        requests: durations.length,
        p50Ms: Math.round(percentile(durations, 0.5)),
        p95Ms: Math.round(percentile(durations, 0.95)),
        maxMs: Math.round(durations.at(-1)),
        overOneSecond: durations.filter((duration) => duration > 1_000).length,
      }];
    }));
}

// Every test (= Playwright "spec") from the report, with its pass/fail.
function collectTests(report) {
  const out = [];
  const failureStatuses = new Set(['failed', 'timedOut', 'interrupted']);
  const resultFailed = (result) => result && failureStatuses.has(result.status);
  const finalResult = (test) => [...(test.results || [])].reverse().find((r) => r.status !== 'skipped') ?? null;
  const durationMs = (test) => (test.results || []).reduce((sum, result) => {
    const duration = Number(result?.duration);
    return Number.isFinite(duration) && duration > 0 ? sum + duration : sum;
  }, 0);
  const testFailed = (test) => {
    const final = finalResult(test);
    return final ? resultFailed(final) : failureStatuses.has(test.status);
  };
  const testFlaky = (test) => (test.results || []).some(resultFailed) && !testFailed(test);
  const failed = (spec) => {
    const tests = spec.tests || [];
    return tests.length ? tests.some(testFailed) : spec.ok === false;
  };
  const flaky = (spec) => (spec.tests || []).some(testFlaky);
  const walk = (suites = []) => {
    for (const s of suites) {
      for (const spec of s.specs || []) {
        const tests = spec.tests || [];
        out.push({
          file: basename(spec.file || s.file || ''),
          title: spec.title || '',
          failed: failed(spec),
          flaky: flaky(spec),
          durationMs: tests.reduce((sum, test) => sum + durationMs(test), 0),
        });
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
const formatDuration = (ms) => {
  const seconds = Math.round(Number(ms || 0) / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m ${String(rest).padStart(2, '0')}s` : `${rest}s`;
};

// Collapse per-browser runs of the same test (same spec file + title) into one
// distinct test. Failure wins across browsers so a chromium-pass/firefox-fail
// still counts (and colours the badge) as a failure.
function dedupeByTest(items) {
  const byKey = new Map();
  for (const item of items) {
    const key = `${item.file}::${item.title}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...item });
      continue;
    }
    existing.failed = existing.failed || item.failed;
    existing.flaky = existing.flaky || item.flaky;
    existing.durationMs = Math.max(existing.durationMs || 0, item.durationMs || 0);
    if (!existing.action && item.action) existing.action = item.action;
  }
  return [...byKey.values()];
}

function aggregateSpecTimings(items) {
  const byFile = new Map();
  for (const item of items) {
    if (!item.file || !item.durationMs) continue;
    const current = byFile.get(item.file) ?? { durationMs: 0, tests: 0, failed: 0, flaky: 0 };
    current.durationMs += item.durationMs;
    current.tests += 1;
    if (item.failed) current.failed += 1;
    if (item.flaky) current.flaky += 1;
    byFile.set(item.file, current);
  }
  return Object.fromEntries([...byFile.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([file, timing]) => [file, {
      durationMs: Math.round(timing.durationMs),
      tests: timing.tests,
      failed: timing.failed,
      flaky: timing.flaky,
    }]));
}

// ── Collect results ──────────────────────────────────────────────────────────
const resultsPaths = findResultsJsons(join(testsDir, 'test-results'));
const missingResults = resultsPaths.length === 0;
const partialResults = expectedResultShards > 0 && resultsPaths.length > 0 && resultsPaths.length < expectedResultShards;
const traceNetwork = collectTraceNetworkSamples(join(testsDir, 'test-results'));
const networkTimings = aggregateNetworkTimings(traceNetwork.samples);
const networkCacheControls = aggregateCacheControls(traceNetwork.samples);

const rawTests = (missingResults
  ? []
  : resultsPaths.flatMap((resultsPath) => collectTests(JSON.parse(readFileSync(resultsPath, 'utf8'))))).map((t) => {
  const m = manifestFor(t);
  const issue = (t.title.match(/#(\d+)/) || [])[1] || '';
  return { ...t, issue, kind: m?.entry.kind || (issue ? 'regression' : 'smoke'), entry: m?.entry };
});
// Spec timings stay per-browser on purpose: sharding (shard-specs.mjs) balances
// per-browser run cost, so every browser's run is kept here.
const specTimings = aggregateSpecTimings(rawTests);

// Every spec runs once per browser (chromium + firefox), so the same test shows
// up once per browser across the shard reports. Collapse to distinct tests for
// the pass/fail counts, report table and badge — otherwise the totals (and the
// badge "N/M passed") double the real test count. A distinct test is failed when
// it failed on ANY browser, and flaky when flaky on any browser.
const tests = dedupeByTest(rawTests);

// ── Optional issue automation for failed issue-backed tests ──────────────────
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

  if (!issueAutomationEnabled) {
    t.action = 'Report only';
    continue;
  }

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
  if (partialResults) {
    lines.push(`Only found **${resultsPaths.length}/${expectedResultShards}** Playwright JSON reports; the result set is partial.`);
  }
  lines.push(`Passed **${passedCount}/${tests.length}**, failed **${failedTests.length}** (${unexpected.length} unexpected).`);
  lines.push(
    issueAutomationEnabled
      ? 'Test failures do not block the release; failed closed issue-backed tests are reopened.'
      : 'Issue automation is disabled for this run; failed tests are reported only.',
  );
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
  const result = t.failed ? 'FAIL' : t.flaky ? 'FLAKY' : 'PASS';
  lines.push(`| ${tableCell(t.title)} | ${tableCell(t.kind)} | ${t.issue ? `#${t.issue}` : '-'} | ${result} | ${tableCell(t.action)} |`);
}

const slowestSpecs = Object.entries(specTimings).sort(([, a], [, b]) => b.durationMs - a.durationMs).slice(0, 10);
if (slowestSpecs.length) {
  lines.push('');
  lines.push('Slowest spec files:');
  lines.push('');
  lines.push('| Spec | Duration | Tests |');
  lines.push('|---|---:|---:|');
  for (const [file, timing] of slowestSpecs) {
    lines.push(`| ${tableCell(file)} | ${formatDuration(timing.durationMs)} | ${timing.tests} |`);
  }
}

const networkTypes = Object.entries(networkTimings);
if (networkTypes.length) {
  lines.push('');
  lines.push(`Network timing from **${traceNetwork.traceZips} retained failure traces** (diagnostic sample, not the whole suite):`);
  lines.push('');
  lines.push('| Resource type | Requests | p50 | p95 | Max | > 1s |');
  lines.push('|---|---:|---:|---:|---:|---:|');
  for (const [type, timing] of networkTypes) {
    lines.push(`| ${tableCell(type)} | ${timing.requests} | ${timing.p50Ms}ms | ${timing.p95Ms}ms | ${timing.maxMs}ms | ${timing.overOneSecond} |`);
  }
  const scriptCacheControls = Object.entries(networkCacheControls.script || {});
  if (scriptCacheControls.length) {
    lines.push('');
    lines.push(`JavaScript Cache-Control: ${scriptCacheControls
      .map(([value, count]) => `\`${value}\` (${count})`)
      .join(', ')}.`);
  }

  const slowRequests = traceNetwork.samples
    .filter((sample) => sample.type !== 'longpoll')
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 10);
  if (slowRequests.length) {
    lines.push('');
    lines.push('Slowest non-long-poll requests:');
    lines.push('');
    lines.push('| Type | Duration | Status | Path |');
    lines.push('|---|---:|---:|---|');
    for (const request of slowRequests) {
      lines.push(`| ${tableCell(request.type)} | ${Math.round(request.durationMs)}ms | ${request.status || '-'} | ${tableCell(request.path)} |`);
    }
  }
}
if (traceNetwork.errors.length) {
  lines.push('');
  lines.push(`Trace network parsing errors: ${traceNetwork.errors.map(tableCell).join('; ')}`);
}

const markdown = `${lines.join('\n')}\n`;
mkdirSync(join(testsDir, 'dist'), { recursive: true });
writeFileSync(join(testsDir, 'dist', 'e2e_report.md'), markdown);
writeFileSync(join(testsDir, 'dist', 'e2e-network-timings.json'), `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  traceZips: traceNetwork.traceZips,
  samples: traceNetwork.samples.length,
  timings: networkTimings,
  cacheControls: networkCacheControls,
  slowestNonLongPollRequests: traceNetwork.samples
    .filter((sample) => sample.type !== 'longpoll')
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 50),
  errors: traceNetwork.errors,
}, null, 2)}\n`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);

// shields.io endpoint badge. Green unless an UNEXPECTED test failed (an open-bug
// red is expected, so the badge stays green — the number still conveys it).
const badge = missingResults
  ? { schemaVersion: 1, label: 'e2e', message: 'no results', color: 'lightgrey' }
  : {
      schemaVersion: 1,
      label: 'e2e',
      message: `${passedCount}/${tests.length} passed`,
      color: partialResults || unexpected.length ? 'red' : 'brightgreen',
    };
const badgeDir = join(testsDir, 'dist', 'badge');
mkdirSync(badgeDir, { recursive: true });
writeFileSync(join(badgeDir, 'e2e-badge.json'), `${JSON.stringify(badge)}\n`);
writeFileSync(join(badgeDir, 'e2e-timings.json'), `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  releaseTag,
  runUrl,
  expectedResultShards,
  resultsJsons: resultsPaths.map((p) => p.replace(`${testsDir}/`, '')),
  specs: specTimings,
}, null, 2)}\n`);

process.exit(0);
