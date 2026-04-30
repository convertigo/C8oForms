import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const baseHrefRe = /^\/convertigo.*?\/mobile\/?/;

function setBaseHref(html) {
  const exactBaseTag = `<base href="./" data-c8o-mode="web">`;

  // Match n'importe quelle balise <base ...>
  const re = /<base\b[^>]*>/i;

  if (!re.test(html)) {
    // Si aucune balise <base>, on l’insère juste après <head>
    const headRe = /<head\b[^>]*>/i;
    if (!headRe.test(html)) {
      throw new Error("No <head> tag found; cannot insert <base>.");
    }
    return html.replace(headRe, (m) => `${m}\n    ${exactBaseTag}`);
  }

  // Remplacement strict par la balise exacte
  return html.replace(re, exactBaseTag);
}

function replaceBaseHrefInString(value) {
  if (typeof value !== "string") return value;
  if (!baseHrefRe.test(value)) return value;
  return value.replace(baseHrefRe, "./");
}

function replaceBaseHrefInJson(value, state) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceBaseHrefInJson(item, state));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      const newKey = replaceBaseHrefInString(key);
      if (newKey !== key) state.changed = true;
      out[newKey] = replaceBaseHrefInJson(val, state);
    }
    return out;
  }
  if (typeof value === "string") {
    const replaced = replaceBaseHrefInString(value);
    if (replaced !== value) state.changed = true;
    return replaced;
  }
  return value;
}

function toScopeRelativeManifestPath(value) {
  if (typeof value !== "string") return value;
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  return value.slice(1);
}

function makeManifestUrlsScopeRelative(manifest) {
  let changed = 0;

  if (typeof manifest.index === "string") {
    const next = toScopeRelativeManifestPath(manifest.index);
    if (next !== manifest.index) {
      manifest.index = next;
      changed++;
    }
  }

  if (manifest.hashTable && typeof manifest.hashTable === "object" && !Array.isArray(manifest.hashTable)) {
    const nextHashTable = {};
    for (const [key, value] of Object.entries(manifest.hashTable)) {
      const nextKey = toScopeRelativeManifestPath(key);
      if (nextKey !== key) changed++;
      nextHashTable[nextKey] = value;
    }
    manifest.hashTable = nextHashTable;
  }

  if (Array.isArray(manifest.assetGroups)) {
    for (const group of manifest.assetGroups) {
      if (!Array.isArray(group.urls)) continue;
      group.urls = group.urls.map((url) => {
        const next = toScopeRelativeManifestPath(url);
        if (next !== url) changed++;
        return next;
      });
    }
  }

  return changed;
}

function sha1(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function updateIndexHash(manifest, indexContent) {
  const hashTable = manifest.hashTable;
  if (!hashTable || typeof hashTable !== "object" || Array.isArray(hashTable)) {
    throw new Error("ngsw.json has no hashTable object");
  }

  const indexHash = sha1(indexContent);
  const indexKeys = Object.keys(hashTable).filter((key) => key === "index.html" || key.endsWith("/index.html"));
  if (indexKeys.length === 0) {
    throw new Error("ngsw.json hashTable has no index.html entry");
  }

  for (const key of indexKeys) {
    hashTable[key] = indexHash;
  }
  return { indexHash, indexKeys };
}

function main() {
  // Le script est exécuté depuis _private/ionic normalement
  const root = process.cwd();
  const args = new Set(process.argv.slice(2));
  const isPwa = args.has("--pwa");

  const pwaCandidates = [
    path.resolve(root, "../../DisplayObjects/template-pwa"),
    path.resolve(root, "../../DisplayObjects/mobile/template-pwa"),
  ];
  const targetDir = isPwa
    ? pwaCandidates.find((dir) => fs.existsSync(path.join(dir, "index.html"))) ||
      pwaCandidates[0]
    : path.resolve(root, "../../DisplayObjects/mobile");
  const indexFile = path.join(targetDir, "index.html");
  const ngswFile = path.join(targetDir, "ngsw.json");
  const customWorker = path.resolve(root, "ngsw-worker-custom.js");
  const workerFile = path.join(targetDir, "ngsw-worker.js");

  if (!fs.existsSync(indexFile)) throw new Error(`index.html not found: ${indexFile}`);
  if (!fs.existsSync(ngswFile)) throw new Error(`ngsw.json not found: ${ngswFile}`);
  if (!fs.existsSync(customWorker)) throw new Error(`ngsw-worker-custom.js not found: ${customWorker}`);

  fs.copyFileSync(customWorker, workerFile);
  console.log(`OK copied custom ngsw-worker.js to ${workerFile}`);

  const before = fs.readFileSync(indexFile, "utf8");
  const after = setBaseHref(before);
  if (after !== before) {
    fs.writeFileSync(indexFile, after, "utf8");
    console.log(`✅ base href set to ./ in ${indexFile}`);
  } else {
    console.log(`ℹ️ base href unchanged in ${indexFile}`);
  }

  const ngswBefore = JSON.parse(fs.readFileSync(ngswFile, "utf8"));
  const state = { changed: false };
  const ngswAfter = replaceBaseHrefInJson(ngswBefore, state);
  const scopeRelativeCount = makeManifestUrlsScopeRelative(ngswAfter);
  const { indexHash, indexKeys } = updateIndexHash(ngswAfter, fs.readFileSync(indexFile));
  if (state.changed) {
    console.log("OK replaced /convertigo.../mobile base href values in ngsw.json");
  } else {
    console.log("OK no /convertigo.../mobile base href values found in ngsw.json");
  }
  if (scopeRelativeCount > 0) {
    console.log(`OK converted ${scopeRelativeCount} ngsw.json resource paths to scope-relative URLs`);
  } else {
    console.log("OK ngsw.json resource paths already scope-relative");
  }
  console.log(`OK updated ngsw.json index hash (${indexKeys.join(", ")}) to ${indexHash}`);
  fs.writeFileSync(ngswFile, JSON.stringify(ngswAfter, null, 2) + "\n", "utf8");
}

main();
