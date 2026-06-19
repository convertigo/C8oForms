#!/usr/bin/env node
// Distribute e2e spec files across CI shards, balanced by duration.
//
// Playwright's own `--shard` splits the *sorted* test list into contiguous
// chunks balanced by test COUNT — which clusters our few long tests (all the
// visibility-* files are alphabetically adjacent) onto one shard. Instead we
// assign whole spec files to shards with longest-processing-time (LPT) greedy
// bin-packing on measured or fallback duration weights, so the heavy tests land
// on different shards.
//
// Usage: node ci/shard-specs.mjs <shardIndex 1-based> <shardTotal> [timingsJson]
// Prints the space-separated spec paths for that shard (empty if none).
//
// New specs are picked up automatically (default fallback weight 1). Measured
// timings are produced by ci/report.mjs and published to the badges branch.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const e2eDir = join(here, '..', 'e2e');

// Rough relative durations (minutes-ish). Only the long ones need an entry.
const WEIGHTS = {
  'visibility-operators.spec.ts': 5,
  'visibility-types-a.spec.ts': 6,
  'visibility-types-b.spec.ts': 5,
  'journeys.spec.ts': 4,
  'issue-1357.spec.ts': 3,
  'issue-1363.spec.ts': 2,
};

// The #1421 fixture owns legacy documents for the primary disposable account,
// so keep this spec on shard 1 where that account is selected.
const PINNED_SHARDS = {
  'issue-1421.spec.ts': 1,
};

function parsePositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function durationMsFromTimingEntry(entry) {
  if (typeof entry === 'number') return parsePositiveNumber(entry);
  if (!entry || typeof entry !== 'object') return null;
  return (
    parsePositiveNumber(entry.durationMs) ??
    parsePositiveNumber(entry.duration) ??
    parsePositiveNumber(entry.weight) ??
    null
  );
}

function loadMeasuredDurations(timingsPath) {
  if (!timingsPath || !existsSync(timingsPath)) return new Map();
  try {
    const payload = JSON.parse(readFileSync(timingsPath, 'utf8'));
    const specs = payload?.specs && typeof payload.specs === 'object' ? payload.specs : payload;
    const out = new Map();
    for (const [name, entry] of Object.entries(specs || {})) {
      const durationMs = durationMsFromTimingEntry(entry);
      if (durationMs) out.set(basename(name), durationMs);
    }
    return out;
  } catch (error) {
    console.warn(`Ignoring unreadable e2e timing file ${timingsPath}: ${error.message}`);
    return new Map();
  }
}

function fallbackDurationMs(name) {
  return (WEIGHTS[name] ?? 1) * 60_000;
}

function main() {
  const shardIndex = Number(process.argv[2]);
  const shardTotal = Number(process.argv[3]);
  if (!Number.isInteger(shardIndex) || !Number.isInteger(shardTotal) || shardIndex < 1 || shardIndex > shardTotal) {
    console.error('Usage: node ci/shard-specs.mjs <shardIndex 1-based> <shardTotal> [timingsJson]');
    process.exit(2);
  }
  const measuredDurations = loadMeasuredDurations(process.argv[4]);

  const specs = readdirSync(e2eDir)
    .filter((name) => name.endsWith('.spec.ts'))
    .sort();

  const weighted = specs
    .map((name) => ({ name, weight: measuredDurations.get(name) ?? fallbackDurationMs(name) }))
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name));

  const bins = Array.from({ length: shardTotal }, () => ({ load: 0, specs: [] }));
  const remaining = [];
  for (const { name, weight } of weighted) {
    const pinnedShard = PINNED_SHARDS[name];
    if (pinnedShard) {
      const bin = bins[Math.min(pinnedShard, shardTotal) - 1];
      bin.load += weight;
      bin.specs.push(`e2e/${name}`);
      continue;
    }
    remaining.push({ name, weight });
  }

  for (const { name, weight } of remaining) {
    const bin = bins.reduce((min, b) => (b.load < min.load ? b : min));
    bin.load += weight;
    bin.specs.push(`e2e/${name}`);
  }

  if (process.env.C8OFORMS_SHARD_DEBUG === '1') {
    const source = measuredDurations.size ? `measured timings (${measuredDurations.size} specs)` : 'fallback weights';
    console.error(`Shard plan uses ${source}.`);
    bins.forEach((bin, index) => {
      const seconds = Math.round(bin.load / 1000);
      console.error(`  shard ${index + 1}/${shardTotal}: ${seconds}s - ${bin.specs.join(' ') || '(empty)'}`);
    });
  }

  process.stdout.write(bins[shardIndex - 1].specs.join(' '));
}

main();
