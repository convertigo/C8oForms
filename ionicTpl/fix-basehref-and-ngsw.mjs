import fs from "node:fs";
import path from "node:path";
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
  if (state.changed) {
    console.log("OK replaced /convertigo.../mobile base href values in ngsw.json");
  } else {
    console.log("OK no /convertigo.../mobile base href values found in ngsw.json");
  }
  fs.writeFileSync(ngswFile, JSON.stringify(ngswAfter, null, 2) + "\n", "utf8");
}

main();
