// Cross-platform deploy: replace a C8oForms release (project + all dependencies)
// on a Convertigo server. Node port of deploy-version.sh so it runs on Windows
// too (the runner and verify.mjs both call this). Uses `gh` to download the
// release, adm-zip to unpack, and fetch (no curl/bash) for the engine calls.
//
//   node scripts/deploy-version.mjs <release-tag>
//   node scripts/deploy-version.mjs --dir <folder-of-cars>
//
// Config (tests/.env or environment):
//   CONVERTIGO_ADMIN_PASSWORD  required — admin password for the deploy server
//   C8O_SERVER                 optional — default https://test-repro.convertigo.net
//   C8O_REPO                   optional — default convertigo/C8oForms
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(here, '..', '.env') });

const SERVER = (process.env.C8O_SERVER || 'https://test-repro.convertigo.net').replace(/\/+$/, '');
const REPO = process.env.C8O_REPO || 'convertigo/C8oForms';
const PASSWORD = process.env.CONVERTIGO_ADMIN_PASSWORD;
const ADMIN_USER = 'admin';

const WIPE_PROJECTS = [
  'C8Oforms', 'C8Oforms_PWAs', 'lib_Actions_C8Oforms', 'lib_BaseRow',
  'lib_ExtendedComponents_ui_ngx', 'lib_FullSyncGrp', 'lib_GeneratePWAAssets',
  'lib_Geocoding', 'lib_Geocoding_ui_ngx', 'lib_OAuth', 'lib_ProductTour', 'lib_UserManager',
  'lib_UserManager_ui_ngx', 'lib_Vonage', 'lib_Vonage_ui_ngx', 'libApexCharts', 'lib_Leaflet',
  'BaserowIntegration', 'mobilebuilder_tpl_7_9_0', 'mobilebuilder_tpl_8_0_0_ngx',
  'mobilebuilder_tpl_8_1_0_ngx', 'mobilebuilder_tpl_8_3_0_ngx', 'mobilebuilder_tpl_8_4_0_ngx',
];

const log = (m) => console.log(`deploy-version: ${m}`);
const die = (m) => { console.error(`deploy-version: error: ${m}`); process.exit(1); };

// Run a command, inheriting stdio. shell:true so Windows resolves gh/gh.exe.
function run(cmd, args) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { stdio: 'inherit', shell: true });
    c.on('close', (code) => resolve(code ?? 1));
    c.on('error', () => resolve(1));
  });
}

// Admin services live under /convertigo.
const srv = `${SERVER}/convertigo`;
let cookie = '';

async function engine(path, form) {
  const body = new URLSearchParams(form).toString();
  const res = await fetch(`${srv}/admin/services/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}) },
    body,
    redirect: 'follow',
  });
  const setCookie = res.headers.getSetCookie
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  if (setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  return { res, text: await res.text() };
}

async function login() {
  const { res, text } = await engine('engine.Authenticate', {
    authType: 'login', authUserName: ADMIN_USER, authPassword: PASSWORD,
  });
  if (!res.ok || /<error/i.test(text)) die('authentication failed');
}

async function deleteProject(name) {
  await engine('projects.Delete', { projectName: name }).catch(() => undefined);
}

async function deployCar(file, name) {
  const fd = new FormData();
  fd.append('archive', new Blob([readFileSync(file)], { type: 'application/octet-stream' }), `${name}.car`);
  const res = await fetch(`${srv}/admin/services/projects.Deploy?bAssembleXsl=false`, {
    method: 'POST', headers: cookie ? { Cookie: cookie } : {}, body: fd,
  });
  const text = await res.text();
  return res.ok && !/<error/i.test(text) ? null : text.slice(0, 400);
}

async function main() {
  if (!PASSWORD) die('CONVERTIGO_ADMIN_PASSWORD is not set (copy tests/.env.example to tests/.env)');

  const argv = process.argv.slice(2);
  let carDir = '';
  let cleanup = '';
  if (argv[0] === '--dir') {
    carDir = argv[1] || die('--dir needs a folder');
  } else {
    const tag = argv[0] || die('usage: deploy-version.mjs <release-tag> | --dir <folder>');
    carDir = mkdtempSync(join(tmpdir(), 'c8o-deploy-'));
    cleanup = carDir;
    log(`downloading ${tag} from ${REPO}`);
    const code = await run('gh', ['release', 'download', tag, '-R', REPO,
      '--pattern', 'no_code_studio_and_dependencies.zip', '--dir', carDir, '--clobber']);
    if (code !== 0) die(`gh release download failed for ${tag}`);
    new AdmZip(join(carDir, 'no_code_studio_and_dependencies.zip')).extractAllTo(carDir, true);
  }

  const cars = readdirSync(carDir).filter((f) => f.endsWith('.car')).map((f) => f.replace(/\.car$/, ''));
  if (!cars.length) die(`no .car files in ${carDir}`);

  // Dependencies first, C8Oforms_PWAs, then the C8Oforms app last.
  const ordered = [
    ...cars.filter((c) => c !== 'C8Oforms' && c !== 'C8Oforms_PWAs'),
    ...cars.filter((c) => c === 'C8Oforms_PWAs'),
    ...cars.filter((c) => c === 'C8Oforms'),
  ];

  log(`authenticating on ${srv}`);
  await login();

  log(`wiping ${WIPE_PROJECTS.length} projects (best-effort)`);
  for (const p of WIPE_PROJECTS) await deleteProject(p);

  log(`deploying ${ordered.length} archives`);
  let failed = false;
  for (const name of ordered) {
    process.stdout.write(`deploy-version:   ${name} ... `);
    const err = await deployCar(join(carDir, `${name}.car`), name);
    if (err) { console.log('FAILED'); console.error(err); failed = true; }
    else console.log('ok');
  }

  if (cleanup) rmSync(cleanup, { recursive: true, force: true });
  if (failed) die('at least one deployment failed');
  log('done');
}

main().catch((e) => die(String(e)));
