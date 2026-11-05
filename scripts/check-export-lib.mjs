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

/** decodeURIComponent, or null for a malformed escape (a broken link, not a crash). */
function decode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

/** Does a site path like /payments/fp (or /, or /a/) map to a file in outDir? */
export function pageExists(sitePath, outDir) {
  const decoded = decode(sitePath.split(/[?#]/)[0]);
  if (decoded === null) return false;
  const clean = decoded.replace(/\/+$/, "");
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

/**
 * Errors for what a crawler needs on every exported page: one H1, a title and description no other
 * page has, a canonical URL listed in the sitemap, share tags, valid JSON-LD and a Markdown copy.
 */
export function checkSeo(outDir) {
  const errors = [];
  const sitemapFile = path.join(outDir, "sitemap.xml");
  const sitemap = fs.existsSync(sitemapFile) ? fs.readFileSync(sitemapFile, "utf8") : "";
  const seen = { title: new Map(), description: new Map() };
  const pages = walk(outDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.relative(outDir, f).replace(/\\/g, "/"))
    .filter((f) => f !== "404.html" && f !== "_not-found.html");
  for (const file of pages) {
    const html = fs.readFileSync(path.join(outDir, file), "utf8");
    const report = (problem) => errors.push(`${file}：${problem}`);

    const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
    if (h1s !== 1) report(`有 ${h1s} 個 H1`);

    const texts = {
      title: /<title>([^<]+)<\/title>/.exec(html)?.[1],
      description: /<meta name="description" content="([^"]+)"/.exec(html)?.[1],
    };
    for (const [key, value] of Object.entries(texts)) {
      if (!value) report(`缺少 ${key}`);
      else if (seen[key].has(value)) report(`${key} 和 ${seen[key].get(value)} 相同`);
      else seen[key].set(value, file);
    }

    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
    if (!canonical) report("缺少 canonical");
    else if (!sitemap.includes(`<loc>${canonical}</loc>`)) report(`sitemap 沒有 ${canonical}`);

    for (const tag of ['property="og:title"', 'property="og:image"', 'property="og:locale"', 'name="twitter:card"']) {
      if (!html.includes(`<meta ${tag}`)) report(`缺少 ${tag}`);
    }

    const jsonLd = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)?.[1];
    if (!jsonLd) report("缺少 JSON-LD");
    else {
      try {
        JSON.parse(jsonLd);
      } catch {
        report("JSON-LD 解析失敗");
      }
    }

    const markdown = file === "index.html" ? "index.md" : file.replace(/\.html$/, ".md");
    if (!fs.existsSync(path.join(outDir, markdown))) report(`缺少 ${markdown}`);
  }
  return errors;
}

/** Errors for out/ files the deploy needs (the pages and what crawlers ask for first), and no out/dev. */
export function checkRequired(outDir) {
  const errors = [];
  for (const required of ["index.html", "404.html", "_redirects", "_headers", "robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", "favicon.ico", "manifest.webmanifest"]) {
    if (!fs.existsSync(path.join(outDir, required))) errors.push(`缺少 out/${required}`);
  }
  if (fs.existsSync(path.join(outDir, "dev"))) errors.push("out/dev 不應存在（開發用頁面被匯出了）");
  return errors;
}

/**
 * Errors for in-site links and assets in the exported html that have no matching file: href and
 * src attributes (links, images, scripts, stylesheets), in double or single quotes.
 */
export function findBrokenLinks(outDir) {
  const errors = [];
  for (const file of walk(outDir).filter((f) => f.endsWith(".html"))) {
    const html = fs.readFileSync(file, "utf8");
    const seen = new Set();
    for (const match of html.matchAll(/\s(?:href|src)=(?:"(\/[^"]*)"|'(\/[^']*)')/g)) {
      const href = (match[1] ?? match[2]).replace(/&amp;/g, "&");
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
