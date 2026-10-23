// Post-build checks for out/. Exit 1 on any error.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRedirects, checkRequired, checkSizes, findBannedWords, findBrokenLinks, walk } from "./check-export-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const errors = [];

if (!fs.existsSync(outDir)) {
  console.error("out/ 不存在，先執行 npm run build");
  process.exit(1);
}

errors.push(...checkRequired(outDir));

const redirectsFile = path.join(outDir, "_redirects");
if (fs.existsSync(redirectsFile)) errors.push(...checkRedirects(fs.readFileSync(redirectsFile, "utf8"), outDir));

errors.push(...findBrokenLinks(outDir));

// Banned words: exported html and everything under content/.
const textFiles = [
  ...walk(outDir).filter((f) => f.endsWith(".html")),
  ...(fs.existsSync(path.join(root, "content")) ? walk(path.join(root, "content")) : []),
];
for (const file of textFiles) {
  const found = findBannedWords(fs.readFileSync(file, "utf8"));
  if (found.length > 0) errors.push(`${path.relative(root, file)}：出現禁用字詞 ${found.join("、")}`);
}

const sizes = checkSizes(walk(outDir).map((file) => ({ path: path.relative(outDir, file), size: fs.statSync(file).size })));
errors.push(...sizes.errors);
const total = sizes.total;

if (errors.length > 0) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`check:export 通過（out/ ${(total / 1024 / 1024).toFixed(2)} MB）`);
