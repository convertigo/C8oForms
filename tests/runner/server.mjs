// Tiny local dashboard to browse the regression manifest and run tests with a
// chosen version (latest = newest release, broken = bug-report version, verify
// = broken then latest),
// headed and slowed down so a tester can watch. No framework — Node http + child_process.
//
//   cd tests && npm run runner        # then open http://127.0.0.1:8771
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';
import { latestRelease } from '../scripts/release.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = join(here, '..');
dotenv.config({ path: join(testsDir, '.env') });

const PORT = Number(process.env.RUNNER_PORT ?? 8771);
const MANIFEST = join(testsDir, 'e2e', 'regression-manifest.json');
const BROWSERS = new Set(['chromium', 'firefox', 'webkit']);
const DEFAULT_BASE_URL = 'https://test-repro.convertigo.net';
// Run Playwright via the local CLI with the current node binary, so we don't
// depend on `npx` being on the spawned process's PATH (which breaks on Windows
// and GUI-launched servers — `spawn npx ENOENT`).
const PW_CLI = join(testsDir, 'node_modules', '@playwright', 'test', 'cli.js');
let activeCtl = null;

function appBaseUrl(env = process.env) {
  const direct = env.C8OFORMS_APP_URL;
  if (direct) return direct.endsWith('/') ? direct : `${direct}/`;
  const server = (env.C8OFORMS_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  return `${server}/convertigo/projects/C8Oforms/DisplayObjects/mobile/`;
}

function formatDuration(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m${String(rest).padStart(2, '0')}s`;
}

function testLabel(test) {
  const grep = test.grep ? ` grep="${test.grep}"` : '';
  return `${test.id} (${test.spec}${grep})`;
}

async function loadTests() {
  const raw = JSON.parse(await readFile(MANIFEST, 'utf8'));
  return Object.entries(raw.tests).map(([id, t]) => ({ id, ...t }));
}

async function servedVersion(env = process.env) {
  try {
    const res = await fetch(`${appBaseUrl(env)}assets/i18n/fr.json`, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    // Robust to the endpoint occasionally returning an HTML wrapper instead of
    // raw JSON: just pull the version_c8o value out.
    const m = text.match(/"version_c8o"\s*:\s*"([^"]+)"/);
    return m ? m[1] : 'unreachable';
  } catch {
    return 'unreachable';
  }
}

const repo = () => process.env.C8O_REPO || 'convertigo/C8oForms';
// Newest release of the highest version line (ignores hotfixes on older lines
// like 2.1.x). Pin a line with C8O_RELEASE_PREFIX.
function resolveLatest() {
  return latestRelease(repo());
}

function runnerEnvironment() {
  return {
    C8OFORMS_BASE_URL: process.env.C8OFORMS_BASE_URL ?? DEFAULT_BASE_URL,
    C8OFORMS_BASE_URL_SOURCE: process.env.C8OFORMS_BASE_URL ? 'env' : 'default',
    C8OFORMS_APP_URL: process.env.C8OFORMS_APP_URL ?? '',
    C8OFORMS_APP_URL_SOURCE: process.env.C8OFORMS_APP_URL ? 'env' : 'unset',
    C8OFORMS_TEST_USER: process.env.C8OFORMS_TEST_USER ?? '',
    C8OFORMS_TEST_USER_SOURCE: process.env.C8OFORMS_TEST_USER ? 'env' : 'unset',
    C8OFORMS_TEST_PASSWORD: process.env.C8OFORMS_TEST_PASSWORD ?? '',
    C8OFORMS_TEST_PASSWORD_SOURCE: process.env.C8OFORMS_TEST_PASSWORD ? 'env' : 'unset',
    CONVERTIGO_ADMIN_PASSWORD: process.env.CONVERTIGO_ADMIN_PASSWORD ?? '',
    CONVERTIGO_ADMIN_PASSWORD_SOURCE: process.env.CONVERTIGO_ADMIN_PASSWORD ? 'env' : 'unset',
    appBaseUrl: appBaseUrl(),
  };
}

function normalizeBrowser(value) {
  return BROWSERS.has(value) ? value : 'chromium';
}

function runEnvironmentFromParams(params) {
  const base = (params.get('baseUrl') || '').trim() || (process.env.C8OFORMS_BASE_URL ?? DEFAULT_BASE_URL);
  const app = (params.get('appUrl') || '').trim();
  const testUser = (params.get('testUser') || '').trim() || process.env.C8OFORMS_TEST_USER || '';
  const passwordParam = params.get('testPassword');
  const rawPassword = passwordParam !== null ? passwordParam : process.env.C8OFORMS_TEST_PASSWORD;
  const testPassword = rawPassword || testUser;
  const adminPasswordParam = params.get('adminPassword');
  const adminPassword = adminPasswordParam !== null ? adminPasswordParam : process.env.CONVERTIGO_ADMIN_PASSWORD || '';
  return {
    C8OFORMS_BASE_URL: base,
    C8O_SERVER: base,
    C8OFORMS_APP_URL: app,
    C8OFORMS_TEST_USER: testUser,
    C8OFORMS_TEST_PASSWORD: testPassword,
    CONVERTIGO_ADMIN_PASSWORD: adminPassword,
    C8OFORMS_TEST_USERS: '',
    TEST_NOCODE_E2E_USERS: '',
  };
}

// Make sure `version` is the one actually served before running. Deploys it if
// the served version differs, then re-checks. Returns true only when confirmed.
async function ensureDeployed(send, version, env, ctl) {
  send('phase', { label: `Ensuring ${version} is deployed` });
  send('log', { line: `checking served version at ${appBaseUrl(env)}assets/i18n/fr.json`, cls: 'out' });
  const current = await servedVersion(env);
  if (current === version) {
    send('log', { line: `already deployed (${version}) — skipping deploy`, cls: 'out' });
    return true;
  }
  send('log', { line: `served version is ${current}; deploying ${version}…`, cls: 'out' });
  const code = await run(send, process.execPath, ['scripts/deploy-version.mjs', version], env, ctl);
  if (code !== 0) {
    send('log', { line: `deploy of ${version} failed`, cls: 'err' });
    return false;
  }
  const after = await servedVersion(env);
  if (after !== version) {
    send('log', { line: `after deploy the server serves ${after} (expected ${version}) — aborting`, cls: 'err' });
    return false;
  }
  send('log', { line: `confirmed: server now on ${version}`, cls: 'out' });
  return true;
}

// ── SSE helpers ──────────────────────────────────────────────────────────────
async function ensureFixture(send, test, target, env, ctl) {
  if (!test.fixtureScript) return true;
  send('phase', { label: `Ensuring fixture for ${test.id}` });
  const code = await run(send, process.execPath, [test.fixtureScript], env, ctl);
  if (code !== 0) {
    send('log', { line: `fixture script ${test.fixtureScript} failed`, cls: 'err' });
    return false;
  }
  const after = await servedVersion(env);
  if (after !== target) {
    send('log', { line: `fixture script left the server on ${after} (expected ${target})`, cls: 'err' });
    return false;
  }
  send('log', { line: `fixture confirmed; server still on ${after}`, cls: 'out' });
  return true;
}

async function ensureFixtures(send, tests, target, env, ctl) {
  const seen = new Set();
  for (const test of tests) {
    if (!test.fixtureScript || seen.has(test.fixtureScript)) continue;
    seen.add(test.fixtureScript);
    if (!(await ensureFixture(send, test, target, env, ctl))) return false;
  }
  return true;
}

function sse(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Run a command, streaming each output line via send('log', ...). Resolves exit code.
function run(send, cmd, args, env, ctl) {
  return new Promise((resolve) => {
    if (ctl?.cancelled) return resolve(130);
    send('log', { line: `$ ${cmd} ${args.join(' ')}`, cls: 'cmd' });
    const startedAt = Date.now();
    let lastOutputAt = startedAt;
    const label = [cmd, ...args].join(' ');
    const heartbeat = setInterval(() => {
      if (ctl?.cancelled) return;
      const idleFor = Date.now() - lastOutputAt;
      if (idleFor < 15_000) return;
      send('log', {
        line: `[runner] still running after ${formatDuration(Date.now() - startedAt)} (no output for ${formatDuration(idleFor)}): ${label}`,
        cls: 'out',
      });
      lastOutputAt = Date.now();
    }, 5_000);
    heartbeat.unref?.();
    // detached:true puts the child in its own process group so we can kill the
    // WHOLE tree (node Playwright CLI → browser) on cancel.
    const child = spawn(cmd, args, {
      cwd: testsDir,
      env: { ...process.env, ...env },
      detached: true,
      windowsHide: true,
    });
    if (ctl) ctl.child = child;
    let buf = '';
    const pump = (chunk, cls) => {
      lastOutputAt = Date.now();
      buf += chunk;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) send('log', { line, cls });
    };
    child.stdout.on('data', (d) => pump(d.toString(), 'out'));
    child.stderr.on('data', (d) => pump(d.toString(), 'err'));
    child.on('close', (code) => {
      clearInterval(heartbeat);
      if (ctl) ctl.child = null;
      if (buf) send('log', { line: buf, cls: 'out' });
      resolve(code ?? 1);
    });
    child.on('error', (e) => {
      clearInterval(heartbeat);
      send('log', { line: String(e), cls: 'err' });
      resolve(1);
    });
  });
}

function cancelRun(ctl) {
  if (!ctl || ctl.cancelled || ctl.finished) return false;
  ctl.cancelled = true;
  if (ctl.child?.pid) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(ctl.child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      const killProcessGroup = (signal) => {
        try {
          process.kill(-ctl.child.pid, signal);
        } catch {
          try {
            process.kill(ctl.child.pid, signal);
          } catch {
            // The child may already have exited.
          }
        }
      };
      killProcessGroup('SIGTERM');
      setTimeout(() => killProcessGroup('SIGKILL'), 2_000).unref();
    }
  }
  return true;
}

// Build the `node <cli> test …` args for one test (or the whole suite when
// spec is null). Run it with `run(send, process.execPath, pwArgs(...), …)`.
function pwArgs({ spec, grep, headed }) {
  const args = [PW_CLI, 'test'];
  if (spec) args.push(spec);
  if (grep) args.push('-g', grep);
  if (headed) args.push('--headed');
  return args;
}

function brokenVersionOf(t) {
  return t.brokenVersion || t.fixedVersion || t.version || '';
}

async function executeVerify(send, params, selected, latest, env, ctl) {
  if (params.ids[0] === 'all' || selected.length !== 1) {
    send('log', { line: 'Broken -> Latest verification runs one manifest test at a time.', cls: 'err' });
    return send('done', { ok: false });
  }

  const t = selected[0];
  const broken = t.brokenVersion;
  if (!broken) {
    send('log', { line: `${t.id} declares no brokenVersion - cannot verify broken -> latest.`, cls: 'err' });
    return send('done', { ok: false });
  }

  if (!(await ensureDeployed(send, broken, env, ctl))) return send('done', { ok: false });
  if (!(await ensureFixture(send, t, broken, env, ctl))) return send('done', { ok: false });
  if (ctl.cancelled) return send('done', { ok: false });

  send('phase', { label: `Running ${t.id} on broken ${broken}` });
  send('log', { line: `playwright target: ${testLabel(t)}`, cls: 'out' });
  const brokenCode = await run(send, process.execPath, pwArgs({ spec: t.spec, grep: t.grep, headed: params.headed }), env, ctl);
  if (ctl.cancelled) {
    send('log', { line: '\n[cancelled]', cls: 'err' });
    return send('done', { ok: false });
  }
  if (brokenCode === 0) {
    send('log', { line: `${t.id} PASSED on broken ${broken} - regression was not reproduced.`, cls: 'err' });
    return send('done', {
      ok: false,
      message: 'verification failed - broken version passed',
      status: 'failed',
      cls: 'ko',
    });
  }
  send('log', { line: `${t.id} FAILED on broken ${broken} - regression reproduced.`, cls: 'err' });

  if (!(await ensureDeployed(send, latest, env, ctl))) return send('done', { ok: false });
  if (!(await ensureFixture(send, t, latest, env, ctl))) return send('done', { ok: false });
  if (ctl.cancelled) return send('done', { ok: false });

  send('phase', { label: `Running ${t.id} on latest ${latest}` });
  send('log', { line: `playwright target: ${testLabel(t)}`, cls: 'out' });
  const latestCode = await run(send, process.execPath, pwArgs({ spec: t.spec, grep: t.grep, headed: params.headed }), env, ctl);
  if (ctl.cancelled) {
    send('log', { line: '\n[cancelled]', cls: 'err' });
    return send('done', { ok: false });
  }
  if (latestCode !== 0) {
    send('log', { line: `${t.id} FAILED on latest ${latest} - fix not confirmed.`, cls: 'err' });
    return send('done', {
      ok: false,
      message: 'verification failed - latest version failed',
      status: 'failed',
      cls: 'ko',
    });
  }

  send('log', { line: `${t.id} PASSED on latest ${latest} - fix confirmed.`, cls: 'out' });
  return send('done', {
    ok: true,
    message: 'verification complete - broken failed, latest passed',
    status: 'verified',
    cls: 'ok',
  });
}

// Execute the selected run, streaming everything. params: ids[], version, slowMo, headed.
async function execute(send, params, tests, ctl) {
  const headed = params.headed;
  const env = {
    ...params.runtimeEnv,
    C8OFORMS_SLOWMO: String(params.slowMo || 0),
    C8OFORMS_BROWSER: params.browser,
    C8OFORMS_RUNNER_PROGRESS: params.progress ? '1' : '0',
    HEADED: headed ? '1' : '0',
  };

  const selected =
    params.ids[0] === 'all' ? tests : tests.filter((t) => params.ids.includes(t.id));
  if (!selected.length) {
    send('log', { line: 'No matching test in the manifest.', cls: 'err' });
    return send('done', { ok: false });
  }

  let ok = true;

  // Resolve the target version for "latest" once (same for every test).
  // This is the guard that normal runs are actually launched on the latest
  // release, not on a stale served version.
  let latest = null;
  if (params.version !== 'broken') {
    latest = await resolveLatest();
    if (!latest) {
      send('log', { line: 'Could not resolve the latest release (is gh authenticated?).', cls: 'err' });
      return send('done', { ok: false });
    }
    send('log', { line: `latest release resolved to ${latest}`, cls: 'out' });
  }
  send('log', { line: `selected tests: ${selected.map(testLabel).join(', ')}`, cls: 'out' });
  send('log', { line: `version mode: ${params.version}`, cls: 'out' });
  send('log', { line: `browser selected: ${params.browser}`, cls: 'out' });
  send('log', { line: `headed=${headed ? '1' : '0'} slowMo=${params.slowMo || 0}ms progressLogs=${params.progress ? '1' : '0'}`, cls: 'out' });
  send('log', { line: `C8OFORMS_BASE_URL=${env.C8OFORMS_BASE_URL}`, cls: 'out' });
  send('log', { line: `C8OFORMS_APP_URL=${env.C8OFORMS_APP_URL || '(unset)'}`, cls: 'out' });
  send('log', { line: `C8OFORMS_TEST_USER=${env.C8OFORMS_TEST_USER || '(unset)'}`, cls: 'out' });
  send('log', { line: `C8OFORMS_TEST_PASSWORD=${env.C8OFORMS_TEST_PASSWORD ? '(set)' : '(unset)'}`, cls: 'out' });
  send('log', { line: `CONVERTIGO_ADMIN_PASSWORD=${env.CONVERTIGO_ADMIN_PASSWORD ? '(set)' : '(unset)'}`, cls: 'out' });
  send('log', { line: `resolved app URL=${appBaseUrl(env)}`, cls: 'out' });

  if (params.version === 'verify') {
    return executeVerify(send, params, selected, latest, env, ctl);
  }

  const targetOf = (t) => (params.version === 'broken' ? brokenVersionOf(t) : latest);

  // Fast path: whole suite on latest → ensure once, run once.
  if (params.ids[0] === 'all' && params.version !== 'broken') {
    if (!(await ensureDeployed(send, latest, env, ctl))) return send('done', { ok: false });
    if (!(await ensureFixtures(send, selected, latest, env, ctl))) return send('done', { ok: false });
    if (!ctl.cancelled) {
      send('phase', { label: `Running the whole suite on ${latest}` });
      send('log', { line: `playwright target: all manifest tests (${selected.length})`, cls: 'out' });
      ok = (await run(send, process.execPath, pwArgs({ spec: null, headed }), env, ctl)) === 0;
    }
    if (ctl.cancelled) send('log', { line: '\n[cancelled]', cls: 'err' });
    return send('done', { ok: ok && !ctl.cancelled });
  }

  // General path: per test, verify the target is served (deploy only if needed),
  // then run. ensureDeployed re-checks every time, so version drift is caught.
  // Sort by target so consecutive same-version tests don't redeploy.
  const order = [...selected].sort((a, b) => String(targetOf(a)).localeCompare(String(targetOf(b))));
  for (const t of order) {
    if (ctl.cancelled) break;
    const target = targetOf(t);
    if (!target) {
      send('phase', { label: `Skipping ${t.id}` });
      send('log', { line: `${t.id} declares no broken version — skipped`, cls: 'err' });
      ok = false;
      continue;
    }
    if (!(await ensureDeployed(send, target, env, ctl))) {
      ok = false;
      continue;
    }
    if (!(await ensureFixture(send, t, target, env, ctl))) {
      ok = false;
      continue;
    }
    if (ctl.cancelled) break;
    send('phase', { label: `Running ${t.id} on ${target}` });
    send('log', { line: `playwright target: ${testLabel(t)}`, cls: 'out' });
    const code = await run(send, process.execPath, pwArgs({ spec: t.spec, grep: t.grep, headed }), env, ctl);
    if (code === 0) {
      send('log', { line: `${t.id} passed on ${target}`, cls: 'out' });
    } else {
      send('log', { line: `${t.id} failed on ${target}`, cls: 'err' });
      ok = false;
    }
  }

  if (ctl.cancelled) send('log', { line: '\n[cancelled]', cls: 'err' });
  send('done', { ok: ok && !ctl.cancelled });
}

// ── HTTP routing ─────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/') {
      const html = await readFile(join(here, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (url.pathname === '/api/tests') {
      const [tests, version] = await Promise.all([loadTests(), servedVersion()]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ tests, servedVersion: version, appBaseUrl: appBaseUrl(), environment: runnerEnvironment() }));
    }
    if (url.pathname === '/api/served-version') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const env = runEnvironmentFromParams(url.searchParams);
      return res.end(JSON.stringify({ servedVersion: await servedVersion(env), appBaseUrl: appBaseUrl(env) }));
    }
    if (url.pathname === '/api/cancel') {
      const cancelled = cancelRun(activeCtl);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ cancelled }));
    }
    if (url.pathname === '/api/run') {
      const send = sse(res);
      const params = {
        ids: (url.searchParams.get('ids') || '').split(',').filter(Boolean),
        version: ['broken', 'verify'].includes(url.searchParams.get('version')) ? url.searchParams.get('version') : 'latest',
        slowMo: Number(url.searchParams.get('slowMo') || 0),
        headed: url.searchParams.get('headed') !== '0',
        browser: normalizeBrowser(url.searchParams.get('browser')),
        progress: url.searchParams.get('progress') === '1',
        runtimeEnv: runEnvironmentFromParams(url.searchParams),
      };
      // Cancel the run (kill the spawned child) if the tester closes the tab —
      // no orphaned headed browsers or deploys.
      const ctl = { cancelled: false, child: null, finished: false };
      activeCtl = ctl;
      req.on('close', () => {
        cancelRun(ctl);
      });
      const tests = await loadTests();
      await execute(send, params, tests, ctl).catch((e) => send('log', { line: String(e), cls: 'err' }));
      ctl.finished = true;
      if (activeCtl === ctl) activeCtl = null;
      return res.end();
    }
    res.writeHead(404);
    res.end('not found');
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  C8oForms test runner → http://127.0.0.1:${PORT}\n`);
});
