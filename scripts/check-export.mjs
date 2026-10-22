// Post-build checks for out/. Exit 1 on any error.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRedirects, findBannedWords, findBrokenLinks, walk } from "./check-export-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const MAX_TOTAL = 20 * 1024 * 1024;
const MAX_IMAGE = 200 * 1024;
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg|ico)$/i;
const errors = [];

if (!fs.existsSync(outDir)) {
  console.error("out/ 不存在，先執行 npm run build");
  process.exit(1);
}

for (const required of ["index.html", "404.html", "_redirects"]) {
  if (!fs.existsSync(path.join(outDir, required))) errors.push(`缺少 out/${required}`);
}
if (fs.existsSync(path.join(outDir, "dev"))) errors.push("out/dev 不應存在（開發用頁面被匯出了）");

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

let total = 0;
for (const file of walk(outDir)) {
  const size = fs.statSync(file).size;
  total += size;
  if (IMAGE_EXT.test(file) && size > MAX_IMAGE) {
    errors.push(`${path.relative(outDir, file)}：圖片 ${Math.round(size / 1024)} KB，超過 200 KB`);
  }
}
if (total > MAX_TOTAL) errors.push(`out/ 共 ${(total / 1024 / 1024).toFixed(1)} MB，超過 20 MB`);

if (errors.length > 0) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`check:export 通過（out/ ${(total / 1024 / 1024).toFixed(2)} MB）`);
