import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function sha1File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha1").update(buf).digest("hex");
}

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


function updateIndexHashInNgsw(ngswPath, newHash) {
  const json = JSON.parse(fs.readFileSync(ngswPath, "utf8"));
  if (!json.hashTable) throw new Error("ngsw.json: missing hashTable");

  const keys = Object.keys(json.hashTable);

  // on update toutes les clés qui pointent vers index.html
  const candidates = keys.filter(
    (k) => k === "index.html" || k === "./index.html" || k.endsWith("/index.html")
  );

  if (candidates.length === 0) {
    // fallback : injecte "index.html"
    json.hashTable["index.html"] = newHash;
  } else {
    for (const k of candidates) json.hashTable[k] = newHash;
  }

  fs.writeFileSync(ngswPath, JSON.stringify(json, null, 2) + "\n", "utf8");
}

function main() {
  // Le script est exécuté depuis _private/ionic normalement
  const root = process.cwd();

  const indexFile = path.resolve(root, "../../DisplayObjects/mobile/index.html");
  const ngswFile  = path.resolve(root, "../../DisplayObjects/mobile/ngsw.json");

  if (!fs.existsSync(indexFile)) throw new Error(`index.html not found: ${indexFile}`);
  if (!fs.existsSync(ngswFile)) throw new Error(`ngsw.json not found: ${ngswFile}`);

  const before = fs.readFileSync(indexFile, "utf8");
  const after = setBaseHref(before);
  if (after !== before) {
    fs.writeFileSync(indexFile, after, "utf8");
    console.log(`✅ base href set to ./ in ${indexFile}`);
  } else {
    console.log(`ℹ️ base href unchanged in ${indexFile}`);
  }

  const newHash = sha1File(indexFile);
  updateIndexHashInNgsw(ngswFile, newHash);
  console.log(`✅ updated ngsw.json index.html hash = ${newHash}`);
}

main();
