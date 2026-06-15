// Resolve "latest" the way the project means it: the newest release of the
// HIGHEST version line, not whatever was published most recently. A hotfix on an
// old line (e.g. 2.1.17 released after the 2.2 betas) must not be picked as
// "latest" for the 2.2 development line.
//
// Override with C8O_RELEASE_PREFIX to pin a line explicitly, e.g. "2.2" or
// "2.2.0-beta".
import { spawn } from 'node:child_process';

function gh(args) {
  return new Promise((resolve) => {
    const c = spawn('gh', args, { shell: true }); // shell:true so Windows finds gh.exe
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.on('close', () => resolve(out.trim()));
    c.on('error', () => resolve(''));
  });
}

// Parse "2.2.0-beta226", "2.1.17", "2.2.0", "2.3.0-rc1" → comparable parts.
function parse(tag) {
  const m = String(tag).match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.?(\d+)?)?$/i);
  if (!m) return null;
  return {
    tag,
    major: +m[1],
    minor: +m[2],
    patch: +m[3],
    pre: (m[4] || '').toLowerCase(), // '' means a final release (> any prerelease)
    preNum: m[5] ? +m[5] : 0,
  };
}

function cmp(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (!a.pre && b.pre) return 1; // final > prerelease
  if (a.pre && !b.pre) return -1;
  if (a.pre !== b.pre) return a.pre < b.pre ? -1 : 1; // alpha < beta < rc
  return a.preNum - b.preNum;
}

/**
 * Newest release tag of the active line.
 * @param {string} repo  e.g. "convertigo/C8oForms"
 * @param {string} [prefix]  optional tag prefix to pin a line (C8O_RELEASE_PREFIX)
 */
export async function latestRelease(repo, prefix = process.env.C8O_RELEASE_PREFIX || '') {
  const raw = await gh(['release', 'list', '-R', repo, '--limit', '100', '--json', 'tagName', '--jq', '.[].tagName']);
  let tags = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  if (prefix) tags = tags.filter((t) => t.startsWith(prefix));

  const parsed = tags.map(parse).filter(Boolean);
  if (!parsed.length) return tags[0] || '';

  if (prefix) {
    parsed.sort(cmp);
    return parsed[parsed.length - 1].tag;
  }

  // No prefix: restrict to the highest major.minor line, then newest within it.
  const top = parsed.reduce((m, p) =>
    p.major > m.major || (p.major === m.major && p.minor > m.minor) ? p : m,
  );
  const line = parsed.filter((p) => p.major === top.major && p.minor === top.minor);
  line.sort(cmp);
  return line[line.length - 1].tag;
}

// CLI: `node scripts/release.mjs [repo]` prints the resolved latest tag.
if (import.meta.url === `file://${process.argv[1]}`) {
  const repo = process.argv[2] || process.env.C8O_REPO || 'convertigo/C8oForms';
  latestRelease(repo).then((t) => process.stdout.write(t));
}
