// verify.mjs — prove a regression test is a *valid* regression test.
// Cross-platform Node port of verify.sh (no bash, so it runs on Windows too).
//
// Fixed bug: deploy the broken version, run the spec (must FAIL — red), deploy
// the fixed version, run again (must PASS — green). Open bug: deploy where it
// still reproduces, expect red. Smoke: deploy `version` ("latest"), expect green.
//
//   node verify.mjs                 # list the tests you can verify
//   node verify.mjs 1412            # regression: red on broken, green on fixed
//   node verify.mjs journey-login   # smoke: green on the latest version
//   HEADED=1 node verify.mjs 1412   # show the browser
//
// One-time setup: copy .env.example to .env and fill in CONVERTIGO_ADMIN_PASSWORD.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(here, '.env') });

const PW_CLI = join(here, 'node_modules', '@playwright', 'test', 'cli.js');
const manifest = JSON.parse(readFileSync(join(here, 'e2e', 'regression-manifest.json'), 'utf8')).tests;
const REPO = process.env.C8O_REPO || 'convertigo/C8oForms';

const c = (code, s) => `\x1b[${code}m${s}\x1b[0m`;
const bold = (s) => c(1, s), dim = (s) => c(2, s);
const red = (s) => c(31, s), green = (s) => c(32, s), yellow = (s) => c(33, s);

function appBaseUrl() {
  const direct = process.env.C8OFORMS_APP_URL;
  if (direct) return direct.endsWith('/') ? direct : `${direct}/`;
  const server = (process.env.C8OFORMS_BASE_URL ?? 'https://test-repro.convertigo.net').replace(/\/+$/, '');
  return `${server}/convertigo/projects/C8Oforms/DisplayObjects/mobile/`;
}

async function servedVersion() {
  try {
    const res = await fetch(`${appBaseUrl()}assets/i18n/fr.json`, { signal: AbortSignal.timeout(8000) });
    const m = (await res.text()).match(/"version_c8o"\s*:\s*"([^"]+)"/);
    return m ? m[1] : 'unreachable';
  } catch {
    return 'unreachable';
  }
}

// Run a command inheriting stdio (so deploy/playwright output streams). Resolves exit code.
function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: here, stdio: 'inherit', shell: false });
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}
// gh needs shell:true so Windows resolves gh.exe.
function capture(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: here, shell: true });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.on('close', () => resolve(out.trim()));
    child.on('error', () => resolve(''));
  });
}
const resolveVersion = async (v) =>
  v === 'latest'
    ? capture('gh', ['release', 'list', '-R', REPO, '--limit', '1', '--json', 'tagName', '--jq', '.[0].tagName'])
    : v;

const headedArgs = process.env.HEADED === '1' ? ['--headed'] : [];

// Deploy a version, confirm it's served, run the spec. Returns 'PASS' | 'FAIL'.
async function runPhase(label, version, spec, grep) {
  console.log(`\n${bold(`-- ${label}: deploying ${version} --`)}`);
  const dcode = await run(process.execPath, ['scripts/deploy-version.mjs', version]);
  if (dcode !== 0) {
    console.log(red(`deploy of ${version} failed`));
    return 'FAIL';
  }
  const got = await servedVersion();
  console.log(got === version ? dim(`server confirmed on ${got}`) : yellow(`warning: server serves ${got} (expected ${version})`));
  console.log(bold(`-- ${label}: running ${spec}${grep ? ` (-g "${grep}")` : ''} --`));
  const args = [PW_CLI, 'test', spec, ...(grep ? ['-g', grep] : []), ...headedArgs];
  return (await run(process.execPath, args)) === 0 ? 'PASS' : 'FAIL';
}

function list() {
  console.log(bold('Tests you can verify:'));
  for (const [id, t] of Object.entries(manifest)) {
    console.log(`  ${id.padEnd(30)}${(t.kind || '').padEnd(11)} ${t.title}`);
  }
  console.log('\nUsage: node verify.mjs <id>     (e.g. node verify.mjs 1412)');
}

async function main() {
  const id = process.argv[2];
  if (!id) return list();
  const t = manifest[id];
  if (!t) {
    console.log(`${red(`Unknown test '${id}'.`)} Run node verify.mjs to list available tests.`);
    process.exit(1);
  }

  console.log(bold(`Verifying test '${id}' (${t.kind || 'regression'})`));
  console.log(`  ${t.title}\n  spec: ${t.spec}`);
  if (t.reproduction?.length) {
    console.log(bold('\nHow to reproduce manually:'));
    t.reproduction.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  }

  const line = () => console.log(bold('='.repeat(52)));

  // Smoke: green on the given/current version.
  if (t.kind === 'smoke') {
    const v = await resolveVersion(t.version || 'latest');
    console.log(`\n  kind: ${bold('SMOKE')} — must PASS on ${v}`);
    const r = await runPhase('Smoke', v, t.spec, t.grep);
    console.log(`\n${bold(`=================== VERDICT '${id}' ===================`)}`);
    if (r === 'PASS') { console.log(`  ${green('OK')} the journey passes on ${v} (${green('GREEN')})`); line(); process.exit(0); }
    console.log(`  ${red('X')}  the journey FAILED on ${v}`); line(); process.exit(1);
  }

  // Open bug: still red, no fix yet.
  if (t.kind === 'open' || !t.fixedVersion) {
    console.log(`\n  status: ${yellow('OPEN')} — broken on ${t.brokenVersion}, no fix yet (the test MUST fail)`);
    const r = await runPhase('Open bug', t.brokenVersion, t.spec, t.grep);
    console.log(`\n${bold(`=================== VERDICT '${id}' ===================`)}`);
    if (r === 'FAIL') {
      console.log(`  ${green('OK')} the bug still reproduces on ${t.brokenVersion} (${red('RED')}, as expected)`);
      line();
      console.log(green(bold('Open bug confirmed.')) + ' Fix it, then set fixedVersion and flip kind to "regression".');
      process.exit(0);
    }
    console.log(`  ${yellow('!')} the test PASSED on ${t.brokenVersion} — the bug may be fixed`);
    line();
    console.log(yellow(bold('Looks fixed.')) + ' Record the fixed version and flip kind to "regression".');
    process.exit(1);
  }

  // Regression: red on broken, green on fixed.
  console.log(`\n  broken version: ${t.brokenVersion}   (must FAIL)\n  fixed version : ${t.fixedVersion}    (must PASS)`);
  const brokenResult = await runPhase('Broken version', t.brokenVersion, t.spec, t.grep);
  const fixedResult = await runPhase('Fixed version', t.fixedVersion, t.spec, t.grep);

  console.log(`\n${bold(`=================== VERDICT '${id}' ===================`)}`);
  console.log(brokenResult === 'FAIL'
    ? `  ${green('OK')} broken version (${t.brokenVersion}): test ${red('RED')} as expected`
    : `  ${red('X')}  broken version (${t.brokenVersion}): test GREEN — it does NOT catch the bug!`);
  console.log(fixedResult === 'PASS'
    ? `  ${green('OK')} fixed version  (${t.fixedVersion}): test ${green('GREEN')} as expected`
    : `  ${red('X')}  fixed version  (${t.fixedVersion}): test RED — the fix does not hold or the test is broken`);
  line();
  if (brokenResult === 'FAIL' && fixedResult === 'PASS') {
    console.log(green(bold('Valid regression test:')) + ' red on the broken version, green on the fixed one.');
    process.exit(0);
  }
  console.log(red(bold('Verification FAILED:')) + ' the red->green cycle is not satisfied (see above).');
  process.exit(1);
}

main();
