// Makes the site's icons and share image from public/brand/funi-logo.webp and funi-icon.png. The
// results are committed; run this again only when the logo or the share image's text changes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const brand = (name) => path.join(publicDir, "brand", name);
const logo = brand("funi-logo.webp");

/** The logo centered on a white square, as app icons must be opaque. */
async function appIcon(size, name) {
  const inner = Math.round(size * 0.86);
  const art = await sharp(logo).resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: art }])
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(brand(name));
}

/** A one-image .ico holding a PNG, which every browser in use reads. */
async function favicon(size) {
  const png = await sharp(brand("funi-icon.png")).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), Buffer.concat([header, png]));
}

/** The 1200x630 share image, in the site's colors (app/globals.css). */
async function shareImage() {
  const art = (await sharp(logo).resize({ height: 340 }).png().toBuffer()).toString("base64");
  const html = `<!doctype html><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; background: #0a0a0a; color: #ececec; display: flex; align-items: center;
      gap: 72px; padding: 0 88px; font-family: "Microsoft JhengHei", "Noto Sans TC", sans-serif; }
    .tile { flex: none; background: #fff; border-radius: 32px; padding: 28px; display: flex; }
    img { height: 340px; display: block; }
    h1 { font-size: 72px; font-weight: 700; line-height: 1.2; }
    p { margin-top: 28px; font-size: 38px; color: #5aa9d6; font-weight: 600; }
    small { display: block; margin-top: 44px; font-size: 28px; color: #8c8c8c; font-family: Consolas, monospace; }
  </style><div class="tile"><img src="data:image/png;base64,${art}"></div>
  <div><h1>FunI 付款系統<br>說明文件</h1><p>Discord 收款機器人使用說明</p><small>docs.funipay.net</small></div>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  const shot = await page.screenshot({ type: "png" });
  await browser.close();
  await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(brand("og-default.png"));
}

await appIcon(180, "apple-touch-icon.png");
await appIcon(192, "icon-192.png");
await appIcon(512, "icon-512.png");
await favicon(48);
await shareImage();
console.log("generate-brand-assets：完成");
