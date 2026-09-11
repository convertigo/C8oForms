import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

function readConfig(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function assetGroup(config, name) {
  const group = config.assetGroups.find((candidate) => candidate.name === name);
  assert.ok(group, `missing ${name} asset group`);
  return group;
}

test('Studio service worker only prefetches its small application shell', () => {
  const config = readConfig('ionicTpl/ngsw-config.json');
  const shell = assetGroup(config, 'app-shell');
  const code = assetGroup(config, 'app-code');
  const assets = assetGroup(config, 'assets');

  assert.equal(shell.installMode, 'prefetch');
  assert.equal(shell.updateMode, 'prefetch');
  assert.deepEqual(shell.resources.files, [
    '/index.html',
    '/manifest.webmanifest',
    '/ngsw.json',
  ]);

  assert.equal(code.installMode, 'lazy');
  assert.equal(code.updateMode, 'lazy');
  assert.ok(code.resources.files.includes('/*.js'));
  assert.ok(code.resources.files.includes('/*.css'));

  assert.equal(assets.installMode, 'lazy');
  assert.equal(assets.updateMode, 'lazy');
});

test('published PWA service workers prefetch only their shell and load application code lazily', () => {
  for (const path of [
    'ionicTpl/ngsw-config-sub-pwa.json',
    'ngswForPWA/ngsw-config-sub-pwa.json',
  ]) {
    const config = readConfig(path);
    const shell = assetGroup(config, 'app-shell');
    const code = assetGroup(config, 'app-code');

    assert.equal(shell.installMode, 'prefetch', `${path} shell installMode`);
    assert.equal(shell.updateMode, 'prefetch', `${path} shell updateMode`);
    assert.ok(!shell.resources.files.includes('/*.js'), `${path} shell should not prefetch every JavaScript bundle`);
    assert.ok(!shell.resources.files.includes('/*.css'), `${path} shell should not prefetch every CSS bundle`);

    assert.equal(code.installMode, 'lazy', `${path} code installMode`);
    assert.equal(code.updateMode, 'lazy', `${path} code updateMode`);
    assert.ok(code.resources.files.includes('/*.js'), `${path} JavaScript bundle pattern`);
    assert.ok(code.resources.files.includes('/*.css'), `${path} CSS bundle pattern`);
  }
});
