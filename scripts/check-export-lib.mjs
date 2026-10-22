import fs from "node:fs";
import path from "node:path";

export const BANNED_WORDS = ["信用卡", "免費試用", "申請試用", "NewebPay", "藍新", "公測期間全部免費"];

/** Every file under dir, as absolute paths. */
export function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

/** Does a site path like /payments/fp (or /, or /a/) map to a file in outDir? */
export function pageExists(sitePath, outDir) {
  const clean = decodeURIComponent(sitePath.split(/[?#]/)[0]).replace(/\/+$/, "");
  if (clean === "") return fs.existsSync(path.join(outDir, "index.html"));
  const base = path.join(outDir, clean);
  return (
    fs.existsSync(`${base}.html`) ||
    fs.existsSync(path.join(base, "index.html")) ||
    (fs.existsSync(base) && fs.statSync(base).isFile())
  );
}

/** Errors for redirects whose in-site target page is missing. External targets are not checked. */
export function checkRedirects(redirectsText, outDir) {
  const errors = [];
  for (const raw of redirectsText.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const [from, to] = line.split(/\s+/);
    if (!to || /^https?:\/\//.test(to)) continue;
    if (!pageExists(to, outDir)) errors.push(`${from} → ${to}：頁面不存在`);
  }
  return errors;
}

/** Banned words found in text, in the order of BANNED_WORDS (each at most once). */
export function findBannedWords(text) {
  return BANNED_WORDS.filter((word) => text.includes(word));
}

/** Errors for in-site <a href="/..."> links in the exported html that have no matching file. */
export function findBrokenLinks(outDir) {
  const errors = [];
  for (const file of walk(outDir).filter((f) => f.endsWith(".html"))) {
    const html = fs.readFileSync(file, "utf8");
    const seen = new Set();
    for (const match of html.matchAll(/<a\s[^>]*?href="(\/[^"]*)"/g)) {
      const href = match[1];
      if (href.startsWith("//") || seen.has(href)) continue;
      seen.add(href);
      const sitePath = href.split(/[?#]/)[0];
      if (!pageExists(sitePath, outDir)) {
        errors.push(`${path.relative(outDir, file)}：連結 ${href} 找不到頁面`);
      }
    }
  }
  return errors;
}
