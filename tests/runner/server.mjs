// Tiny local dashboard to browse the regression manifest and run tests with a
// chosen version (broken = deploy first, actual = current deploy), headed and
// slowed down so a tester can watch. No framework — Node http + child_process.
//
//   cd tests && npm run runner        # then open http://127.0.0.1:8771
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = join(here, '..');
dotenv.config({ path: join(testsDir, '.env') });

const PORT = Number(process.env.RUNNER_PORT ?? 8771);
const MANIFEST = join(testsDir, 'e2e', 'regression-manifest.json');
// Run Playwright via the local CLI with the current node binary, so we don't
// depend on `npx` being on the spawned process's PATH (which breaks on Windows
// and GUI-launched servers — `spawn npx ENOENT`).
const PW_CLI = join(testsDir, 'node_modules', '@playwright', 'test', 'cli.js');

function appBaseUrl() {
  const direct = process.env.C8OFORMS_APP_URL;
  if (direct) return direct.endsWith('/') ? direct : `${direct}/`;
  const server = (process.env.C8OFORMS_BASE_URL ?? 'https://test-repro.convertigo.net').replace(/\/+$/, '');
  return `${server}/convertigo/projects/C8Oforms/DisplayObjects/mobile/`;
}

async function loadTests() {
  const raw = JSON.parse(await readFile(MANIFEST, 'utf8'));
  return Object.entries(raw.tests).map(([id, t]) => ({ id, ...t }));
}

async function servedVersion() {
  try {
    const res = await fetch(`${appBaseUrl()}assets/i18n/fr.json`, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    // Robust to the endpoint occasionally returning an HTML wrapper instead of
    // raw JSON: just pull the version_c8o value out.
    const m = text.match(/"version_c8o"\s*:\s*"([^"]+)"/);
    return m ? m[1] : 'unreachable';
  } catch {
    return 'unreachable';
  }
}

// Capture a command's stdout (no streaming).
function capture(cmd, args) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { cwd: testsDir });
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.on('close', () => resolve(out.trim()));
    c.on('error', () => resolve(''));
  });
}

const repo = () => process.env.C8O_REPO || 'convertigo/C8oForms';
function resolveLatest() {
  return capture('gh', ['release', 'list', '-R', repo(), '--limit', '1', '--json', 'tagName', '--jq', '.[0].tagName']);
}

// Make sure `version` is the one actually served before running. Deploys it if
// the served version differs, then re-checks. Returns true only when confirmed.
async function ensureDeployed(send, version, ctl) {
  send('phase', { label: `Ensuring ${version} is deployed` });
  const current = await servedVersion();
  if (current === version) {
    send('log', { line: `already deployed (${version}) — skipping deploy`, cls: 'out' });
    return true;
  }
  send('log', { line: `served version is ${current}; deploying ${version}…`, cls: 'out' });
  const code = await run(send, process.execPath, ['scripts/deploy-version.mjs', version], {}, ctl);
  if (code !== 0) {
    send('log', { line: `deploy of ${version} failed`, cls: 'err' });
    return false;
  }
  const after = await servedVersion();
  if (after !== version) {
    send('log', { line: `after deploy the server serves ${after} (expected ${version}) — aborting`, cls: 'err' });
    return false;
  }
  send('log', { line: `confirmed: server now on ${version}`, cls: 'out' });
  return true;
}

// ── SSE helpers ──────────────────────────────────────────────────────────────
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
    // detached:true puts the child in its own process group so we can kill the
    // WHOLE tree (npx → npm exec → node playwright → browser) on cancel.
    const child = spawn(cmd, args, { cwd: testsDir, env: { ...process.env, ...env }, detached: true });
    if (ctl) ctl.child = child;
    let buf = '';
    const pump = (chunk, cls) => {
      buf += chunk;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) send('log', { line, cls });
    };
    child.stdout.on('data', (d) => pump(d.toString(), 'out'));
    child.stderr.on('data', (d) => pump(d.toString(), 'err'));
    child.on('close', (code) => {
      if (ctl) ctl.child = null;
      if (buf) send('log', { line: buf, cls: 'out' });
      resolve(code ?? 1);
    });
    child.on('error', (e) => {
      send('log', { line: String(e), cls: 'err' });
      resolve(1);
    });
  });
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

// Execute the selected run, streaming everything. params: ids[], version, slowMo, headed.
async function execute(send, params, tests, ctl) {
  const headed = params.headed;
  const env = { C8OFORMS_SLOWMO: String(params.slowMo || 0) };

  const selected =
    params.ids[0] === 'all' ? tests : tests.filter((t) => params.ids.includes(t.id));
  if (!selected.length) {
    send('log', { line: 'No matching test in the manifest.', cls: 'err' });
    return send('done', { ok: false });
  }

  let ok = true;

  // Resolve the target version for "latest" once (same for every test).
  let latest = null;
  if (params.version !== 'broken') {
    latest = await resolveLatest();
    if (!latest) {
      send('log', { line: 'Could not resolve the latest release (is gh authenticated?).', cls: 'err' });
      return send('done', { ok: false });
    }
  }
  const targetOf = (t) => (params.version === 'broken' ? brokenVersionOf(t) : latest);

  // Fast path: whole suite on latest → ensure once, run once.
  if (params.ids[0] === 'all' && params.version !== 'broken') {
    if (!(await ensureDeployed(send, latest, ctl))) return send('done', { ok: false });
    if (!ctl.cancelled) {
      send('phase', { label: `Running the whole suite on ${latest}` });
      ok = (await run(send, process.execPath, pwArgs({ spec: null, headed }), env, ctl)) === 0;
    }
    if (ctl.cancelled) send('log', { line: '\n[cancelled]', cls: 'err' });
    return send('done', { ok: ok && !ctl.cancelled });
  }

  // General path: per test, VERIFY the right version is served (deploy only if
  // it differs), then run. ensureDeployed re-checks every time, so a version
  // drift between tests is caught — and it's cheap when already correct.
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
    if (!(await ensureDeployed(send, target, ctl))) {
      ok = false;
      continue;
    }
    if (ctl.cancelled) break;
    send('phase', { label: `Running ${t.id} on ${target}` });
    const code = await run(send, process.execPath, pwArgs({ spec: t.spec, grep: t.grep, headed }), env, ctl);
    ok = ok && code === 0;
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
      return res.end(JSON.stringify({ tests, servedVersion: version, appBaseUrl: appBaseUrl() }));
    }
    if (url.pathname === '/api/served-version') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ servedVersion: await servedVersion() }));
    }
    if (url.pathname === '/api/run') {
      const send = sse(res);
      const params = {
        ids: (url.searchParams.get('ids') || '').split(',').filter(Boolean),
        version: url.searchParams.get('version') === 'broken' ? 'broken' : 'latest',
        slowMo: Number(url.searchParams.get('slowMo') || 0),
        headed: url.searchParams.get('headed') !== '0',
      };
      // Cancel the run (kill the spawned child) if the tester closes the tab —
      // no orphaned headed browsers or deploys.
      const ctl = { cancelled: false, child: null };
      req.on('close', () => {
        ctl.cancelled = true;
        if (ctl.child?.pid) {
          try { process.kill(-ctl.child.pid, 'SIGTERM'); } catch { /* already gone */ }
        }
      });
      const tests = await loadTests();
      await execute(send, params, tests, ctl).catch((e) => send('log', { line: String(e), cls: 'err' }));
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
