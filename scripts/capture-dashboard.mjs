// npm run capture [-- <shot id> ...]
// Photographs the bot's web dashboard for the docs (scripts/capture.config.mjs SHOTS): starts the
// bot's fake API, scripts/demo-api.mjs (星光遊戲社's invented data) and the bot's dashboard in dev
// mode, takes every shot in dark and light (2x, WebP quality 82), at desktop and at phone width,
// into public/demo/dashboard/, and writes the target elements' boxes to
// content/dashboard-shots.generated.json. Before each shot the fake API is reset and 星光遊戲社's
// settings (demo-data.mjs DEMO_SETTINGS_CHANGES) are saved into it. The three processes are always
// shut down, also on failure. The bot repo is only read.
// Env: FUNIPAY_BOT_DIR (default ../../PycharmProjects/FuniPayment), CAPTURE_FAKE_PORT (8399),
// CAPTURE_DEMO_PORT (8398), CAPTURE_WEB_PORT (3100). With shot ids, only those are taken again.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { MOBILE_VIEWPORT, SHOTS } from "./capture.config.mjs";
import { DEMO_SETTINGS_CHANGES, findBanned } from "./demo-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const botWeb = path.join(path.resolve(root, process.env.FUNIPAY_BOT_DIR ?? "../../PycharmProjects/FuniPayment"), "web");
const PORTS = {
  fake: Number(process.env.CAPTURE_FAKE_PORT ?? 8399),
  demo: Number(process.env.CAPTURE_DEMO_PORT ?? 8398),
  web: Number(process.env.CAPTURE_WEB_PORT ?? 3100),
};
const TOKEN = "e2e-internal-token"; // fake-api.mjs TOKEN
const CSRF = "e2e-csrf-token"; // fixtures.mjs CSRF_TOKEN
const SESSIONS = { owner: "valid", newbie: "newbie", none: null };
const SERVER_ID = "111111111111111111"; // fixtures.mjs SERVER_ID (星光遊戲社)
const THEMES = /** @type {const} */ (["dark", "light"]);
const SCALE = 2;
const QUALITY = 0.82;
const MAX_BYTES = 200 * 1024;
const OUT_DIR = path.join(root, "public", "demo", "dashboard");
const JSON_FILE = path.join(root, "content", "dashboard-shots.generated.json");
const WEB = `http://127.0.0.1:${PORTS.web}`;

// ---- processes ----------------------------------------------------------------------------

/** @type {{name: string; child: import("node:child_process").ChildProcess; log: string[]}[]} */
const running = [];

function start(name, args, options = {}) {
  const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32", ...options });
  const log = [];
  const keep = (chunk) => { log.push(chunk.toString()); if (log.length > 200) log.shift(); };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);
  running.push({ name, child, log });
  return child;
}

function stopAll() {
  for (const { child } of running.splice(0)) {
    if (child.exitCode !== null || child.pid === undefined) continue;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else try { process.kill(-child.pid, "SIGKILL"); } catch { /* already gone */ }
  }
}
process.on("exit", stopAll);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { stopAll(); process.exit(1); });

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, "127.0.0.1");
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("error", () => resolve(false));
  });
}

async function waitFor(url, name, timeoutMs) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const proc = running.find((p) => p.name === name);
    if (proc && proc.child.exitCode !== null) throw new Error(`${name} 結束了（${proc.child.exitCode}）：\n${proc.log.join("")}`);
    try {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
      if (response.status < 500) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${name} 在 ${timeoutMs / 1000} 秒內沒有回應（${url}）`);
}

async function startServers() {
  for (const [name, port] of Object.entries(PORTS)) if (await portInUse(port)) throw new Error(`port ${port}（${name}）已經有程式在用，先關掉它或換 CAPTURE_*_PORT`);
  if (!fs.existsSync(path.join(botWeb, "node_modules", "next"))) throw new Error(`${botWeb} 沒有 node_modules（在 bot 專案 web/ 執行 pnpm install）`);
  start("fake-api", [path.join(botWeb, "e2e", "fake-api.mjs"), String(PORTS.fake)], { cwd: botWeb });
  start("demo-api", [path.join(root, "scripts", "demo-api.mjs"), String(PORTS.demo), String(PORTS.fake)], { cwd: root });
  start("dashboard", [path.join(botWeb, "node_modules", "next", "dist", "bin", "next"), "dev", "--hostname", "127.0.0.1", "--port", String(PORTS.web)], {
    cwd: botWeb,
    env: { ...process.env, FUNIPAY_API_URL: `http://127.0.0.1:${PORTS.demo}`, FUNIPAY_INTERNAL_TOKEN: TOKEN, NEXT_TELEMETRY_DISABLED: "1" },
  });
  await waitFor(`http://127.0.0.1:${PORTS.fake}/health`, "fake-api", 20_000);
  await waitFor(`http://127.0.0.1:${PORTS.demo}/health`, "demo-api", 20_000);
  await waitFor(`${WEB}/login`, "dashboard", 180_000);
}

// ---- one shot -----------------------------------------------------------------------------

/** The page-coordinate box of the one visible element `selector` matches. */
async function boxOf(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count !== 1) throw new Error(`selector ${selector} 找到 ${count} 個元素（要剛好一個）`);
  await locator.waitFor({ state: "visible" });
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height };
  });
}

async function runAction(page, action) {
  const at = action.indexOf(":");
  const [verb, arg] = [action.slice(0, at), action.slice(at + 1)];
  const [target, value] = arg.split("|");
  switch (verb) {
    case "click": return page.locator(target).click();
    case "check": return page.locator(target).check();
    case "fill": return page.locator(target).fill(value);
    case "wait": return page.locator(target).waitFor({ state: "visible" });
    case "pick": {
      await page.getByRole("combobox", { name: target, exact: true }).click();
      const label = new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
      await page.getByRole("listbox", { name: target, exact: true }).getByRole("option", { name: label }).click();
      return page.keyboard.press("Escape");
    }
    default: throw new Error(`不認得的動作 ${action}`);
  }
}

// The Next.js dev indicator is not part of the dashboard
const HIDE_DEV_OVERLAY = `document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = "nextjs-portal { display: none !important; }";
  document.head.append(style);
});`;

/** Resets the fake API and saves 星光遊戲社's settings into it (so a save answers with them too). */
async function resetFakeApi(extra = []) {
  const fake = `http://127.0.0.1:${PORTS.fake}`;
  const reset = await fetch(`${fake}/__reset`, { method: "POST" });
  if (!reset.ok) throw new Error("fake-api /__reset 失敗");
  const headers = { "x-funipay-internal-token": TOKEN, cookie: `funipay_session=${SESSIONS.owner}; funipay_csrf=${CSRF}`, "x-csrf-token": CSRF };
  const url = `${fake}/api/servers/${SERVER_ID}/settings`;
  const current = await fetch(url, { headers });
  if (!current.ok) throw new Error(`fake-api 讀不到設定（${current.status}）`);
  const { version } = await current.json();
  const saved = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ version, changes: DEMO_SETTINGS_CHANGES }),
  });
  if (!saved.ok) throw new Error(`fake-api 存不進示範設定（${saved.status}）：${await saved.text()}`);
  for (const { path: switchPath, body } of extra) {
    const response = await fetch(`${fake}${switchPath}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`fake-api ${switchPath} 失敗（${response.status}）`);
  }
}

/** The desktop picture and, unless `mobile: false`, the phone one, with the targets each has. */
function variantsOf(shot) {
  const desktop = { name: "desktop", suffix: "", viewport: shot.viewport, targets: { ...shot.targets, ...shot.desktopTargets }, mobile: false };
  if (shot.mobile === false) return [desktop];
  const targets = { ...shot.targets, ...shot.mobileTargets };
  return [desktop, { name: "mobile", suffix: "-mobile", viewport: MOBILE_VIEWPORT, targets, mobile: true }];
}

async function takeShot(browser, encoder, shot, variant, theme) {
  const label = `${shot.id}${variant.suffix}（${theme}）`;
  await resetFakeApi(shot.fake);
  const context = await browser.newContext({
    viewport: { width: variant.viewport.w, height: variant.viewport.h },
    deviceScaleFactor: SCALE,
    isMobile: variant.mobile,
    hasTouch: variant.mobile,
    reducedMotion: "reduce",
    colorScheme: theme,
    locale: "zh-TW",
  });
  try {
    const session = SESSIONS[shot.identity];
    await context.addCookies([
      ...(session ? [{ name: "funipay_session", value: session, url: WEB }] : []),
      { name: "funipay_csrf", value: CSRF, url: WEB },
      { name: "funipay_theme", value: theme, url: WEB },
    ]);
    await context.addInitScript(HIDE_DEV_OVERLAY);
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    await page.goto(`${WEB}${shot.path}`, { waitUntil: "networkidle", timeout: 180_000 });
    for (const action of shot.actions ?? []) await runAction(page, action);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    // No focus ring left on the last field an action used (demos draw their own cursor)
    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
    // Back to the top: an action may have scrolled, and a full-page shot of a scrolled page draws
    // the sticky header in the middle of it
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const here = new URL(page.url());
    if (`${here.pathname}${here.search}` !== shot.path) throw new Error(`${label}：停在 ${here.pathname}${here.search}，不是 ${shot.path}`);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    if (isDark !== (theme === "dark")) throw new Error(`${label}：主題不是 ${theme}`);
    const words = findBanned(await page.evaluate(() => `${document.title}\n${document.body.innerText}`));
    if (words.length) throw new Error(`${label} 畫面上還有「${words.join("」「")}」`);

    const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    if (size.w > variant.viewport.w) throw new Error(`${label}：頁面比視窗寬（${size.w}px），有橫向捲軸`);
    let clip = { x: 0, y: 0, width: size.w, height: size.h };
    if (shot.crop) {
      const box = await boxOf(page, shot.crop.selector);
      const x = Math.max(0, Math.floor(box.x - shot.crop.pad));
      const y = Math.max(0, Math.floor(box.y - shot.crop.pad));
      clip = { x, y, width: Math.min(size.w, Math.ceil(box.x + box.w + shot.crop.pad)) - x, height: Math.min(size.h, Math.ceil(box.y + box.h + shot.crop.pad)) - y };
    }
    const round = (n) => Math.round(n * 10000) / 10000;
    const targets = {};
    for (const [name, selector] of Object.entries(variant.targets)) {
      let box;
      try {
        box = await boxOf(page, selector);
      } catch (error) {
        throw new Error(`${label}：目標 ${name}：${error instanceof Error ? error.message.split("\n")[0] : error}`);
      }
      const rect = { x: round((box.x - clip.x) / clip.width), y: round((box.y - clip.y) / clip.height), w: round(box.w / clip.width), h: round(box.h / clip.height) };
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > 1.0001 || rect.y + rect.h > 1.0001) throw new Error(`${label}：${name} 在裁切範圍外`);
      targets[name] = rect;
    }

    const png = await page.screenshot({ type: "png", fullPage: true, clip, animations: "disabled", caret: "hide" });
    const webp = await toWebp(encoder, png);
    const file = `${shot.id}${variant.suffix}-${theme}.webp`;
    if (webp.data.length > MAX_BYTES) throw new Error(`${file} ${Math.round(webp.data.length / 1024)} KB，超過 200 KB`);
    fs.writeFileSync(path.join(OUT_DIR, file), webp.data);
    return { src: `/demo/dashboard/${file}`, width: webp.width, height: webp.height, targets, bytes: webp.data.length };
  } finally {
    await context.close();
  }
}

/** PNG -> WebP with the browser's own encoder (no image library needed). */
async function toWebp(encoder, png) {
  const result = await encoder.evaluate(async ({ src, quality }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return { url: canvas.toDataURL("image/webp", quality), width: img.naturalWidth, height: img.naturalHeight };
  }, { src: `data:image/png;base64,${png.toString("base64")}`, quality: QUALITY });
  if (!result.url.startsWith("data:image/webp;")) throw new Error("瀏覽器沒有輸出 WebP");
  return { data: Buffer.from(result.url.split(",")[1], "base64"), width: result.width, height: result.height };
}

/** The two themes' boxes must agree (same layout), so either one is right for both images. */
function sameTargets(id, a, b) {
  for (const name of Object.keys(a)) {
    for (const key of ["x", "y", "w", "h"]) {
      if (Math.abs(a[name][key] - b[name][key]) > 0.002) throw new Error(`${id}：${name} 深色和淺色的位置不同`);
    }
  }
}

// ---- main ---------------------------------------------------------------------------------

async function main() {
  const wanted = process.argv.slice(2);
  for (const id of wanted) if (!SHOTS.some((s) => s.id === id)) throw new Error(`capture.config.mjs 沒有 ${id}`);
  const shots = wanted.length ? SHOTS.filter((s) => wanted.includes(s.id)) : SHOTS;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const previous = fs.existsSync(JSON_FILE) ? JSON.parse(fs.readFileSync(JSON_FILE, "utf8")) : {};

  await startServers();
  const browser = await chromium.launch();
  try {
    const encoder = await browser.newPage();
    const taken = {};
    for (const shot of shots) {
      const pictures = {};
      for (const variant of variantsOf(shot)) {
        const byTheme = {};
        for (const theme of THEMES) byTheme[theme] = await takeShot(browser, encoder, shot, variant, theme);
        const { dark, light } = byTheme;
        const id = `${shot.id}${variant.suffix}`;
        if (dark.width !== light.width || dark.height !== light.height) throw new Error(`${id}：深色 ${dark.width}×${dark.height}，淺色 ${light.width}×${light.height}`);
        sameTargets(id, dark.targets, light.targets);
        pictures[variant.name] = { dark: dark.src, light: light.src, width: dark.width, height: dark.height, targets: dark.targets };
        console.log(`${id}: ${dark.width}×${dark.height}, ${Math.round(dark.bytes / 1024)} KB / ${Math.round(light.bytes / 1024)} KB`);
      }
      taken[shot.id] = pictures.mobile ? { ...pictures.desktop, mobile: pictures.mobile } : pictures.desktop;
    }
    // Shots in the config's order; ones no longer in the config are dropped
    const all = Object.fromEntries(SHOTS.filter((s) => taken[s.id] || previous[s.id]).map((s) => [s.id, taken[s.id] ?? previous[s.id]]));
    fs.writeFileSync(JSON_FILE, `${JSON.stringify(all, null, 2)}\n`);
    console.log(`寫入 ${path.relative(root, JSON_FILE)}（${Object.keys(all).length} 張）`);
  } finally {
    await browser.close();
  }
}

main()
  .then(() => { stopAll(); process.exit(0); })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    for (const { name, log } of running) if (log.length) console.error(`\n--- ${name} ---\n${log.slice(-30).join("")}`);
    stopAll();
    process.exit(1);
  });
