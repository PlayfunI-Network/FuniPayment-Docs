import fs from "node:fs";
import path from "node:path";

/** The whole of out/ (Cloudflare has no site limit, only 25 MB a file), one image, one page's HTML. */
export const SIZE_LIMITS = { total: 60 * 1024 * 1024, image: 200 * 1024, html: 500 * 1024 };
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg|ico)$/i;

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

/**
 * Size errors for `files` ({ path relative to out/, size in bytes }): an image over 200 KB, a
 * page's HTML over 500 KB, and out/ as a whole over 60 MB. Returns the errors and the total.
 */
export function checkSizes(files, limits = SIZE_LIMITS) {
  const errors = [];
  let total = 0;
  for (const { path: file, size } of files) {
    total += size;
    if (IMAGE_EXT.test(file) && size > limits.image) {
      errors.push(`${file}：圖片 ${Math.round(size / 1024)} KB，超過 ${limits.image / 1024} KB`);
    }
    if (file.endsWith(".html") && size > limits.html) {
      errors.push(`${file}：頁面 HTML ${Math.round(size / 1024)} KB，超過 ${limits.html / 1024} KB`);
    }
  }
  if (total > limits.total) {
    errors.push(`out/ 共 ${(total / 1024 / 1024).toFixed(1)} MB，超過 ${limits.total / 1024 / 1024} MB`);
  }
  return { errors, total };
}
