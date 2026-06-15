// Post-release CI step: the release happens even when a regression test fails.
// This script classifies the Playwright results, reopens any closed issue whose
// recorded issue-backed test failed on the released tag, and writes a Markdown
// report to both the GitHub step summary and tests/dist/e2e_report.md.
//
// It intentionally exits 0: the release is already produced, and this step is a
// reporting/remediation step rather than a gate.
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
const runUrl = process.env.GITHUB_RUN_ID
  ? `${serverUrl}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : '';

const manifest = JSON.parse(
  readFileSync(join(testsDir, 'e2e', 'regression-manifest.json'), 'utf8'),
).tests;

function findResultsJson(dir) {
  const direct = join(dir, 'results.json');
  if (existsSync(direct)) return direct;
  if (!existsSync(dir)) return null;

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

function collectFailingSpecs(report) {
  const failing = [];

  function specFailed(spec) {
    if (spec.ok === false) return true;
    return (spec.tests || []).some((test) =>
      (test.results || []).some((result) =>
        ['failed', 'timedOut', 'interrupted'].includes(result.status),
      ),
    );
  }

  function walk(suites = []) {
    for (const suite of suites) {
      for (const spec of suite.specs || []) {
        if (specFailed(spec)) {
          failing.push({
            file: basename(spec.file || suite.file || ''),
            title: spec.title || '',
          });
        }
      }
      walk(suite.suites || []);
    }
  }

  walk(report.suites || []);
  return failing;
}

function issueNumber(id) {
  return String(id).match(/^\d+/)?.[0] || '';
}

function manifestEntryFailed(entry, failingSpecs) {
  const specFile = basename(entry.spec);
  const grep = entry.grep ? String(entry.grep).toLowerCase() : '';
  return failingSpecs.some((failing) => {
    if (failing.file !== specFile) return false;
    return !grep || failing.title.toLowerCase().includes(grep);
  });
}

function gh(args) {
  try {
    return {
      ok: true,
      stdout: execFileSync('gh', args, {
        encoding: 'utf8',
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim(),
    };
  } catch (error) {
    const stderr = String(error.stderr || error.message || '').trim();
    return { ok: false, stdout: '', stderr };
  }
}

function tableCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|');
}

const resultsPath = findResultsJson(join(testsDir, 'test-results'));
const missingResults = !resultsPath;
const failingSpecs = missingResults
  ? []
  : collectFailingSpecs(JSON.parse(readFileSync(resultsPath, 'utf8')));

const results = Object.entries(manifest).map(([id, entry]) => {
  const failed = missingResults ? false : manifestEntryFailed(entry, failingSpecs);
  return {
    id,
    entry,
    failed,
    issue: issueNumber(id),
    action: '',
  };
});

const reopened = [];
const alreadyOpen = [];
const issueErrors = [];
const reopenableKinds = new Set(['regression', 'open']);

for (const result of results) {
  const { entry, failed, issue } = result;
  if (!failed || !issue || !reopenableKinds.has(entry.kind)) continue;

  const state = gh(['issue', 'view', issue, '-R', repo, '--json', 'state', '--jq', '.state']);
  if (!state.ok) {
    result.action = 'Issue lookup failed';
    issueErrors.push(`#${issue}: ${state.stderr || 'state lookup failed'}`);
    continue;
  }

  if (state.stdout.toUpperCase() === 'CLOSED') {
    const versionContext =
      entry.kind === 'regression' && entry.fixedVersion
        ? `The manifest says it was fixed in ${entry.fixedVersion}, so this regression is present after that fix and in ${releaseTag}.`
        : entry.brokenVersion
        ? `The manifest still tracks this test as ${entry.kind} from ${entry.brokenVersion}, with no passing fixed version recorded.`
        : `The manifest still tracks this test as ${entry.kind}, with no passing fixed version recorded.`;

    const comment = [
      `Issue test failed in ${releaseTag}.`,
      '',
      `The automated end-to-end test for this issue failed on the released tag ${releaseTag}.`,
      versionContext,
      runUrl ? `CI run: ${runUrl}` : '',
      '',
      'Reopened automatically by the release workflow.',
    ]
      .filter(Boolean)
      .join('\n');

    const reopenedIssue = gh(['issue', 'reopen', issue, '-R', repo, '-c', comment]);
    if (reopenedIssue.ok) {
      reopened.push(issue);
      result.action = `Reopened #${issue}`;
    } else {
      result.action = 'Reopen failed';
      issueErrors.push(`#${issue}: ${reopenedIssue.stderr || 'reopen failed'}`);
    }
  } else {
    alreadyOpen.push(issue);
    result.action = `Already open #${issue}`;
  }
}

for (const result of results) {
  if (result.action) continue;
  if (missingResults) result.action = 'No Playwright result';
  else if (result.failed && result.entry.kind === 'open') result.action = 'Expected red open bug';
  else if (result.failed) result.action = 'Reported failure';
  else result.action = 'No action';
}

const failed = results.filter((result) => result.failed);
const passedCount = results.length - failed.length;
const lines = [];

lines.push(`## E2E regression report - \`${releaseTag}\``);
lines.push('');
if (runUrl) lines.push(`CI run: ${runUrl}`);
if (missingResults) {
  lines.push('');
  lines.push('Playwright did not produce a JSON report, so no issue was reopened automatically.');
} else {
  lines.push('');
  lines.push(`Passed **${passedCount}/${results.length}**, failed **${failed.length}**.`);
  lines.push('Test failures do not block this release; failed closed issue-backed tests are reopened below.');
}

if (reopened.length) lines.push(`\nReopened issues: ${reopened.map((n) => `#${n}`).join(', ')}`);
if (alreadyOpen.length) lines.push(`\nFailed issues already open: ${alreadyOpen.map((n) => `#${n}`).join(', ')}`);
if (issueErrors.length) {
  lines.push('\nIssue automation errors:');
  for (const error of issueErrors) lines.push(`- ${error}`);
}

lines.push('');
lines.push('| Test | Kind | Issue | Result | Action |');
lines.push('|---|---|---|---|---|');
for (const { id, entry, failed: isFailed, issue, action } of results) {
  const status = missingResults ? 'NO RESULT' : isFailed ? 'FAIL' : 'PASS';
  lines.push(
    `| ${tableCell(entry.title || id)} | ${tableCell(entry.kind || '')} | ${issue ? `#${issue}` : '-'} | ${status} | ${tableCell(action)} |`,
  );
}

const markdown = `${lines.join('\n')}\n`;
mkdirSync(join(testsDir, 'dist'), { recursive: true });
writeFileSync(join(testsDir, 'dist', 'e2e_report.md'), markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);

process.exit(0);
