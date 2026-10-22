// The demo data the dashboard screenshots show: rewrite() turns an answer of the bot's fake
// dashboard API (web/e2e/fake-api.mjs + fixtures.mjs) into 星光遊戲社's invented data.
// scripts/demo-api.mjs applies it to every GET; scripts/demo-data.test.mjs checks it against the
// bot's real fixtures. Started from funipay_site/scripts/demo-api.mjs (overview and settings).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateFee, DEFAULT_FEES, IBON_EXTRA_FEE } from "../lib/fees.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pngDataUrl = (file) => `data:image/png;base64,${fs.readFileSync(path.join(root, "public", "demo", "avatars", file)).toString("base64")}`;

/** The demo shop and people; the same as lib/scenario.ts (DEMO_PEOPLE, DEMO_BUYER_INFO), checked by the test. */
export const DEMO = Object.freeze({
  shop: "星光遊戲社",
  merchant: "商家",
  buyer: "顧客",
  /** The bot owner (the fixtures' 開發者); only the bot owner's pages show it. */
  botOwner: "平台管理員",
  buyerInfo: Object.freeze({ name: "王○○", phone: "0912345678", email: "customer@example.com" }),
  storeNumber: 24680,
});

/** Words that must never reach a screenshot. */
export const BANNED = Object.freeze(["測試", "開發者"]);
/** The dashboard's own wording that contains a banned word (step 5 of /setup recommends a small test order). */
const ALLOWED_UI = Object.freeze(["小額測試訂單"]);

/** The banned words left in `text`, ignoring the dashboard's own wording. */
export function findBanned(text) {
  let rest = text;
  for (const phrase of ALLOWED_UI) rest = rest.replaceAll(phrase, "");
  return BANNED.filter((word) => rest.includes(word));
}

// The fixtures' ids (fixtures.mjs SERVER_ID, NEW_SERVER_ID; fake-api.mjs ME)
const SERVER_ID = "111111111111111111";
const NEW_SERVER_ID = "222222222222222001";
const MERCHANT_ID = "222222222222222222";
const SHOP_IDS = new Set([SERVER_ID, NEW_SERVER_ID]);

const SHOP_ICON = pngDataUrl("shop.png");
const MERCHANT_AVATAR = pngDataUrl("admin.png");

/** Plain renames, applied to every answer after the structured rewrites (longest first). */
const RENAMES = [
  ["新的測試伺服器", DEMO.shop],
  ["舊測試伺服器", `${DEMO.shop}（舊）`],
  ["測試伺服器", DEMO.shop],
  ["沒有遷移的伺服器", "星光桌遊館"],
  ["測試商家", DEMO.merchant],
  ["測試買家", DEMO.buyer],
  ["測試備註", "月卡 30 天"],
  ["開發者", DEMO.botOwner],
  ["大戶甲", "夜貓子"],
];

// ---- orders -------------------------------------------------------------------------------

const ORDER_AMOUNTS = [680, 1290, 360, 2480, 520, 890, 1560, 420, 750, 1180, 300, 990, 450, 1880, 600];
const TOPUP_AMOUNTS = [500, 1000, 300];
const ORDER_METHODS = ["ibon", "famiport", "store_barcode", "hilife", "bank_transfer", "ibon", "famiport"];
const mask = {
  name: (name) => `${name.slice(0, 1)}**`,
  mail: (mail) => `${mail.slice(0, 2)}***@${mail.split("@")[1]}`,
  phone: (phone) => `${phone.slice(0, 4)}***${phone.slice(-3)}`,
};

/** One order row: the amount, method and people change; id, status, type and times stay (filters and paging follow the fixture). */
function demoOrder(row) {
  const i = Number(BigInt(row.smilepay_id) % 1000n) - 1;
  const topup = row.order_type === "topup";
  const amount = topup ? TOPUP_AMOUNTS[i % TOPUP_AMOUNTS.length] : ORDER_AMOUNTS[i % ORDER_AMOUNTS.length];
  const method = ORDER_METHODS[i % ORDER_METHODS.length];
  const fee = calculateFee(method, amount);
  return {
    ...row,
    payment_method: method,
    order_amount: amount,
    fee,
    pay_amount: amount + fee,
    user_name: DEMO.buyer,
    buyer_name: mask.name(DEMO.buyerInfo.name),
    buyer_mail: mask.mail(DEMO.buyerInfo.email),
    buyer_phone: mask.phone(DEMO.buyerInfo.phone),
  };
}

function demoOrderDetail(detail) {
  return {
    ...demoOrder(detail),
    buyer_name: DEMO.buyerInfo.name,
    buyer_mail: DEMO.buyerInfo.email,
    buyer_phone: DEMO.buyerInfo.phone,
    item_number: "CARD-30",
    comment: detail.order_type === "topup" ? null : "月卡 30 天",
  };
}

// ---- overview (from the site's demo-api) -------------------------------------------------

// Deterministic noise, reset on every call, so the dark and light captures match.
let seed = 0;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// Totals only (no single order): the fee is about 4.3% of the amount, as on the site.
const money = (excl, fee = 0.043) => ({ excl_fee: Math.round(excl), incl_fee: Math.round(excl * (1 + fee)) });
const pct = (now, before) => Math.round(((now - before) / before) * 1000) / 10;
const moneyMetric = (cur, prev) => ({ current: money(cur), previous: money(prev), change_pct: { excl_fee: pct(cur, prev), incl_fee: pct(cur, prev) } });
const countMetric = (cur, prev) => ({ current: cur, previous: prev, change_pct: pct(cur, prev) });

function demoOverview(base) {
  seed = 20261012;
  const AVG = 560;
  const WEEKDAY = [0.9, 0.85, 0.9, 0.95, 1.05, 1.25, 1.2]; // Mon..Sun; weekends busier
  const trend = base.trend.map((point, i, all) => {
    const day = point.bucket.match(/^(\d+)-(\d+)-(\d+)/);
    const weekday = day ? (new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])).getDay() + 6) % 7 : 4;
    const growth = 3300 + (3700 * i) / Math.max(1, all.length - 1);
    const revenue = Math.round((growth * WEEKDAY[weekday] * (0.82 + rand() * 0.36)) / 5) * 5;
    const completed = Math.max(1, Math.round(revenue / (AVG * (0.9 + rand() * 0.2))));
    return { bucket: point.bucket, revenue: money(revenue), completed_orders: completed, created_orders: Math.round(completed / (0.8 + rand() * 0.06)) };
  });
  const sum = (key) => trend.reduce((total, p) => total + (key === "revenue" ? p.revenue.excl_fee : p[key]), 0);
  const revenue = sum("revenue");
  const completed = sum("completed_orders");
  const created = sum("created_orders");
  const topup = Math.round(revenue * 0.05);
  const payment = revenue - topup;
  const prevRevenue = revenue / 1.184;
  const revDetail = money(revenue);
  const rate = Math.round((completed / created) * 1000) / 10;
  const kpis = {
    ...base.kpis,
    revenue: {
      total: moneyMetric(revenue, prevRevenue),
      payment: moneyMetric(payment, prevRevenue * 0.95),
      topup: moneyMetric(topup, prevRevenue * 0.05 * 0.8),
    },
    revenue_detail: { order_amount: revDetail.excl_fee, fee: revDetail.incl_fee - revDetail.excl_fee, pay_amount: revDetail.incl_fee },
    completed_orders: {
      total: countMetric(completed, Math.round(completed / 1.126)),
      payment: countMetric(completed - 6, Math.round((completed - 6) / 1.12)),
      topup: countMetric(6, 5),
    },
    created_orders: {
      total: countMetric(created, Math.round(created / 1.09)),
      payment: countMetric(created - 7, Math.round((created - 7) / 1.09)),
      topup: countMetric(7, 6),
    },
    average_order_value: {
      current: money(revenue / completed),
      previous: money(prevRevenue / (completed / 1.126)),
      change_pct: { excl_fee: 5.1, incl_fee: 5.1 },
    },
    completion_rate: { current: rate, previous: Math.round((rate - 2.6) * 10) / 10, change_pp: 2.6 },
    pending: { orders: 9, amount: money(9 * 520) },
  };
  const shares = [["ibon", 0.34], ["famiport", 0.22], ["store_barcode", 0.17], ["bank_transfer", 0.15], ["hilife", 0.12]];
  let left = payment;
  const payment_methods = shares.map(([method, share], i) => {
    const amount = i === shares.length - 1 ? left : Math.round(payment * share);
    left -= amount;
    return { method, orders: Math.round(completed * share), amount: money(amount) };
  });
  const heatmap = Array.from({ length: 168 }, (_, i) => {
    const weekday = Math.floor(i / 24);
    const hour = i % 24;
    const evening = hour >= 19 && hour <= 23 ? 1 : hour >= 12 && hour <= 18 ? 0.55 : hour >= 8 ? 0.25 : 0.08;
    return { weekday, hour, orders: Math.round(7 * WEEKDAY[weekday] * evening * (0.6 + rand() * 0.8)) };
  });
  const top = [
    ["夜貓子", 11, 8450],
    ["小海豹", 9, 6720],
    ["Kenji", 8, 5980],
    ["米米醬", 7, 4390],
    ["阿哲", 6, 3610],
  ].map(([name, orders, amount], i) => ({ user_id: String(900000000000000010n + BigInt(i)), name, avatar_url: null, orders, amount: money(amount) }));
  const customers = {
    unique_payers: countMetric(Math.round(completed * 0.62), Math.round((completed * 0.62) / 1.081)),
    repeat_rate: { current: 38.4, previous: 34.9, change_pp: 3.5 },
    top: { excl_fee: top, incl_fee: top },
  };
  return { ...base, kpis, trend, payment_methods, heatmap, customers, recent_orders: base.recent_orders.map(demoOrder) };
}

// ---- settings (from the site's demo-api, with the bot's default fees) ---------------------

function demoSettings(base) {
  const payment = Object.fromEntries(Object.entries(DEFAULT_FEES).map(([method, fee]) => [method, { enabled: true, fee }]));
  return {
    ...base,
    smilepay_store_number: DEMO.storeNumber,
    smilepay_param_code_set: true,
    smilepay_verify_key_set: true,
    smilepay_mid_verify_param_set: true,
    payment: { ...payment, ibon_extra_fee: IBON_EXTRA_FEE },
  };
}

// ---- the rewrite ------------------------------------------------------------------------

const server = String.raw`/api/servers/\d+`;
const ROUTES = [
  [new RegExp(`^/api/servers$`), (body) => body.filter((s) => s.id === SERVER_ID)],
  [new RegExp(`^${server}/overview$`), demoOverview],
  [new RegExp(`^${server}/orders$`), (body) => ({ ...body, items: body.items.map(demoOrder) })],
  [new RegExp(`^${server}/orders/\\d+$`), demoOrderDetail],
  [new RegExp(`^${server}/settings$`), demoSettings],
  [new RegExp(`^${server}/features$`), (body) => ({ ...body, auto_publish: body.auto_publish.map((c) => ({ ...c, name: c.name ?? "活動消息" })) })],
];

/** Gives 星光遊戲社 its icon and the merchant an avatar, wherever they appear. */
function withPictures(value) {
  if (Array.isArray(value)) return value.map(withPictures);
  if (value === null || typeof value !== "object") return value;
  const out = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withPictures(v)]));
  if (SHOP_IDS.has(out.id) && "icon_url" in out) out.icon_url = SHOP_ICON;
  if (out.id === MERCHANT_ID && "avatar_url" in out) out.avatar_url = MERCHANT_AVATAR;
  return out;
}

/**
 * The fake-api answer for `pathname` with 星光遊戲社's invented data in place of the test values.
 * @param {string} pathname
 * @param {unknown} body
 * @returns {unknown}
 */
export function rewrite(pathname, body) {
  let json = body;
  for (const [pattern, change] of ROUTES) if (pattern.test(pathname)) json = change(json);
  let text = JSON.stringify(withPictures(json));
  for (const [from, to] of RENAMES) text = text.replaceAll(from, to);
  return JSON.parse(text);
}
