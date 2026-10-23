// The demo data the dashboard screenshots show: rewrite() turns an answer of the bot's fake
// dashboard API (web/e2e/fake-api.mjs + fixtures.mjs) into 星光遊戲社's invented data.
// scripts/demo-api.mjs applies it to every GET; scripts/demo-data.test.mjs checks it against the
// bot's real fixtures. Started from funipay_site/scripts/demo-api.mjs (overview and settings).
// The settings themselves are not rewritten: npm run capture saves DEMO_SETTINGS_CHANGES through
// the fake API, so a save on the settings pages answers with the same values.
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

/**
 * Words that must never reach a screenshot: the fixtures' test values, and the site's banned words
 * (the same list scripts/check-export.mjs checks the built pages for).
 */
export const BANNED = Object.freeze([
  "測試",
  "開發者",
  "沒有遷移的伺服器",
  "信用卡",
  "免費試用",
  "申請試用",
  "NewebPay",
  "藍新",
  "公測期間全部免費",
]);
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

// ---- overview: every number summed from one invented order book ---------------------------

// Deterministic noise, reset on every call, so the dark and light captures match.
let seed = 0;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** One of `items`, picked with the given weights. */
function weighted(items, weights) {
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) if ((r -= weights[i]) < 0) return items[i];
  return items[items.length - 1];
}

const WEEKDAY = [0.9, 0.85, 0.9, 0.95, 1.05, 1.25, 1.2]; // Mon..Sun; weekends busier
/** How busy each hour is: evenings most, nights least. */
const HOUR_WEIGHTS = Array.from({ length: 24 }, (_, h) => (h >= 19 ? 1 : h >= 12 ? 0.55 : h >= 8 ? 0.25 : 0.08));
const HOURS = HOUR_WEIGHTS.map((_, h) => h);
const HOUR_TOTAL = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);
const METHOD_SHARES = [["ibon", 34], ["famiport", 22], ["store_barcode", 17], ["bank_transfer", 15], ["hilife", 12]];
/** The regulars (the overview's 大戶) and how often each orders; everyone else orders about once. */
const REGULARS = ["夜貓子", "小海豹", "Kenji", "米米醬", "阿哲", "阿凱", "小柚子", "Momo", "布丁", "阿翔"];
const REGULAR_WEIGHTS = [14, 12, 10, 9, 8, 6, 6, 5, 5, 4];
const OTHER_PAYERS = 110;
const FIRST_PAYER = 900000000000000010n;
const PAYERS = Array.from({ length: REGULARS.length + OTHER_PAYERS }, (_, i) => i);
const PAYER_WEIGHTS = PAYERS.map((i) => REGULAR_WEIGHTS[i] ?? 1);
/** A payer's name on the overview: a regular's nickname, otherwise the role name (like the fixture's buyer). */
const payerName = (id) => REGULARS[Number(BigInt(id) - FIRST_PAYER)] ?? DEMO.buyer;

const pad = (n) => String(n).padStart(2, "0");
/** Naive "YYYY-MM-DDTHH:MM:SS" <-> Date in UTC fields, so no time zone gets in between. */
const parse = (text) => new Date(`${text.slice(0, 19).replace(" ", "T")}Z`);
const format = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`;
/** The trend bucket of a time ("2026-10-12" or "2026-10-12 14:00"). */
const bucketOf = (text, granularity) => (granularity === "hour" ? `${text.slice(0, 10)} ${text.slice(11, 13)}:00` : text.slice(0, 10));
const bucketStart = (bucket) => parse(bucket.length > 10 ? bucket : `${bucket}T00:00:00`);

/**
 * Invented orders created in `buckets` (the overview's trend buckets: days or hours), `scale` times
 * the usual volume. Orders of the last `recentBuckets` buckets may still be pending; nothing is
 * created in or after the hour of `before` (where the fixture's recent orders start).
 */
function inventOrders(buckets, granularity, { scale, recentBuckets, before }) {
  const orders = [];
  buckets.forEach((bucket, i) => {
    const start = bucketStart(bucket);
    const weekday = (start.getUTCDay() + 6) % 7;
    const growth = 0.7 + (0.6 * i) / Math.max(1, buckets.length - 1);
    const perBucket = granularity === "hour" ? (9 * HOUR_WEIGHTS[start.getUTCHours()]) / HOUR_TOTAL : 9;
    // Hours the recent orders already fill (or later) get no invented order
    const cutoff = before === undefined ? Infinity : bucketStart(bucketOf(before, "hour")).getTime();
    const hours = HOUR_WEIGHTS.map((w, h) => (start.getTime() + h * 3_600_000 >= cutoff ? 0 : w));
    const open = granularity === "day" ? hours.some((w) => w > 0) : start.getTime() < cutoff;
    // Rounded at random, so quiet hours still get an order now and then
    const count = open ? Math.floor(perBucket * growth * WEEKDAY[weekday] * (0.75 + rand() * 0.5) * scale + rand()) : 0;
    for (let n = 0; n < count; n++) {
      const created = new Date(start);
      if (granularity === "day") created.setUTCHours(weighted(HOURS, hours));
      created.setUTCMinutes(Math.floor(rand() * 30));
      const paid = new Date(created.getTime() + (5 + Math.floor(rand() * 20)) * 60_000);
      const topup = rand() < 0.04;
      const amount = topup ? TOPUP_AMOUNTS[Math.floor(rand() * TOPUP_AMOUNTS.length)] : ORDER_AMOUNTS[Math.floor(rand() * ORDER_AMOUNTS.length)];
      const method = weighted(METHOD_SHARES.map(([m]) => m), METHOD_SHARES.map(([, w]) => w));
      const roll = rand();
      const status = i >= buckets.length - recentBuckets && roll < 0.3 ? "pending" : roll < 0.86 ? "complete" : "expired";
      const fee = calculateFee(method, amount);
      orders.push({
        order_type: topup ? "topup" : "payment",
        status,
        payment_method: method,
        order_amount: amount,
        fee,
        pay_amount: amount + fee,
        user_id: String(FIRST_PAYER + BigInt(weighted(PAYERS, PAYER_WEIGHTS))),
        created_at: format(created),
        paid_at: status === "complete" ? format(paid) : null,
      });
    }
  });
  return orders;
}

/** The same buckets one period earlier (the period the overview compares with). */
function earlierBuckets(period, buckets) {
  const shift = parse(period.start).getTime() - parse(period.previous_start).getTime();
  return buckets.map((bucket) => bucketOf(format(new Date(bucketStart(bucket).getTime() - shift)), bucket.length > 10 ? "hour" : "day"));
}

/**
 * The orders the overview `base` (a fake-api answer) is summed from: `current` holds the period's
 * invented orders plus the fixture's recent orders (rewritten like the order list), `previous` the
 * period before it.
 */
export function overviewBook(base) {
  seed = 20261012;
  const { period } = base;
  const buckets = base.trend.map((p) => p.bucket);
  const recent = base.recent_orders.map(demoOrder).filter((o) => o.created_at >= period.start && o.created_at < period.end);
  const before = recent.map((o) => o.created_at).sort()[0];
  const recentBuckets = period.granularity === "hour" ? 6 : 2;
  return {
    current: [...inventOrders(buckets, period.granularity, { scale: 1, recentBuckets, before }), ...recent],
    previous: inventOrders(earlierBuckets(period, buckets), period.granularity, { scale: 0.86, recentBuckets: 0 }),
  };
}

// The bot's rounding (app/services/stats.py): one decimal for percentages, whole dollars for
// averages, half up (away from zero), from exact integers.
/** num / den rounded half up to a whole number. */
function halfUp(num, den) {
  const sign = Math.sign(num) * Math.sign(den);
  const [a, b] = [Math.abs(num), Math.abs(den)];
  return sign * Math.floor((2 * a + b) / (2 * b)) + 0;
}
const changePct = (current, previous) => (previous === 0 ? null : halfUp((current - previous) * 1000, previous) / 10);
const ratePct = (part, whole) => (whole === 0 ? null : halfUp(part * 1000, whole) / 10);
const changePp = (part, whole, prevPart, prevWhole) =>
  whole === 0 || prevWhole === 0 ? null : halfUp((part * prevWhole - prevPart * whole) * 1000, whole * prevWhole) / 10;
const average = (total, count) => (count === 0 ? null : halfUp(total, count));

const sumOf = (orders) => ({
  orders: orders.length,
  order_amount: orders.reduce((s, o) => s + o.order_amount, 0),
  fee: orders.reduce((s, o) => s + o.fee, 0),
  pay_amount: orders.reduce((s, o) => s + o.pay_amount, 0),
});
const moneyOf = (t) => ({ excl_fee: t.order_amount, incl_fee: t.pay_amount });
const changeOf = (cur, prev) => ({ excl_fee: changePct(cur.excl_fee, prev.excl_fee), incl_fee: changePct(cur.incl_fee, prev.incl_fee) });
const moneyMetric = (cur, prev) => ({ current: cur, previous: prev, change_pct: changeOf(cur, prev) });
const countMetric = (cur, prev) => ({ current: cur, previous: prev, change_pct: changePct(cur, prev) });
const rateMetric = (part, whole, prevPart, prevWhole) => ({
  current: ratePct(part, whole),
  previous: ratePct(prevPart, prevWhole),
  change_pp: changePp(part, whole, prevPart, prevWhole),
});

const paid = (orders, type) => orders.filter((o) => o.status === "complete" && (!type || o.order_type === type));
const created = (orders, type) => orders.filter((o) => !type || o.order_type === type);

/** What app/services/stats.py answers for these orders: KPIs, trend, methods, heatmap, customers. */
function summarise(base, { current, previous }) {
  /** { total, payment, topup } of `metric` over the orders `pick` takes from each period. */
  const byType = (pick, metric) =>
    Object.fromEntries([["total", undefined], ["payment", "payment"], ["topup", "topup"]].map(([key, type]) => [key, metric(pick(current, type), pick(previous, type))]));
  const avg = (orders) => {
    const t = sumOf(paid(orders));
    return t.orders === 0 ? null : { excl_fee: average(t.order_amount, t.orders), incl_fee: average(t.pay_amount, t.orders) };
  };
  const [avgNow, avgBefore] = [avg(current), avg(previous)];
  /** Created in the period: [complete, complete + expired]. */
  const finished = (orders) => {
    const complete = orders.filter((o) => o.status === "complete").length;
    return [complete, complete + orders.filter((o) => o.status === "expired").length];
  };
  const done = sumOf(paid(current));
  const pending = sumOf(current.filter((o) => o.status === "pending"));
  const kpis = {
    revenue: byType(paid, (cur, prev) => moneyMetric(moneyOf(sumOf(cur)), moneyOf(sumOf(prev)))),
    revenue_detail: { order_amount: done.order_amount, fee: done.fee, pay_amount: done.pay_amount },
    completed_orders: byType(paid, (cur, prev) => countMetric(cur.length, prev.length)),
    created_orders: byType(created, (cur, prev) => countMetric(cur.length, prev.length)),
    average_order_value: {
      current: avgNow,
      previous: avgBefore,
      change_pct: avgNow && avgBefore ? changeOf(avgNow, avgBefore) : { excl_fee: null, incl_fee: null },
    },
    completion_rate: rateMetric(...finished(current), ...finished(previous)),
    pending: { orders: pending.orders, amount: moneyOf(pending) },
  };

  const { granularity } = base.period;
  const trend = base.trend.map(({ bucket }) => {
    const inBucket = sumOf(paid(current).filter((o) => bucketOf(o.paid_at, granularity) === bucket));
    return {
      bucket,
      revenue: moneyOf(inBucket),
      completed_orders: inBucket.orders,
      created_orders: current.filter((o) => bucketOf(o.created_at, granularity) === bucket).length,
    };
  });

  const group = (orders, key) => {
    const map = new Map();
    for (const o of orders) map.set(key(o), [...(map.get(key(o)) ?? []), o]);
    return map;
  };
  const payment_methods = [...group(paid(current), (o) => o.payment_method)]
    .map(([method, orders]) => ({ method, orders: orders.length, amount: moneyOf(sumOf(orders)) }))
    .sort((a, b) => b.amount.excl_fee - a.amount.excl_fee || a.method.localeCompare(b.method));
  const heat = group(paid(current), (o) => {
    const at = parse(o.paid_at);
    return ((at.getUTCDay() + 6) % 7) * 24 + at.getUTCHours();
  });
  const heatmap = Array.from({ length: 168 }, (_, i) => ({ weekday: Math.floor(i / 24), hour: i % 24, orders: heat.get(i)?.length ?? 0 }));

  const [payers, payersBefore] = [group(paid(current), (o) => o.user_id), group(paid(previous), (o) => o.user_id)];
  const repeat = (map) => [...map.values()].filter((orders) => orders.length >= 2).length;
  const top = (column) =>
    [...payers]
      .map(([user_id, orders]) => ({ user_id, orders, total: sumOf(orders) }))
      .sort((a, b) => b.total[column] - a.total[column] || b.orders.length - a.orders.length || a.user_id.localeCompare(b.user_id))
      .slice(0, 10)
      .map(({ user_id, orders, total }) => ({ user_id, name: payerName(user_id), avatar_url: null, orders: orders.length, amount: moneyOf(total) }));
  const customers = {
    unique_payers: countMetric(payers.size, payersBefore.size),
    repeat_rate: rateMetric(repeat(payers), payers.size, repeat(payersBefore), payersBefore.size),
    top: { excl_fee: top("order_amount"), incl_fee: top("pay_amount") },
  };
  return { kpis: { ...base.kpis, ...kpis }, trend, payment_methods, heatmap, customers };
}

function demoOverview(base) {
  return { ...base, ...summarise(base, overviewBook(base)), recent_orders: base.recent_orders.map(demoOrder) };
}

// ---- settings and the Discord lists the settings pages pick from ---------------------------

/**
 * The settings changes (a dashboard PUT body's `changes`) that turn the fixture's settings into
 * 星光遊戲社's: its store number, every SmilePay secret set, every method on with the bot's default
 * fees. `npm run capture` saves them through the fake API after every reset, so the settings pages
 * show them and a save there answers with them too.
 */
export const DEMO_SETTINGS_CHANGES = Object.freeze({
  smilepay_store_number: String(DEMO.storeNumber),
  smilepay_param_code: "A1B2C3",
  smilepay_verify_key: "D4E5F6",
  smilepay_mid_verify_param: "2468",
  payment: Object.freeze({
    ...Object.fromEntries(Object.entries(DEFAULT_FEES).map(([method, fee]) => [method, { enabled: true, fee: String(fee) }])),
    ibon_extra_fee: String(IBON_EXTRA_FEE),
  }),
});

/** The channels the settings pages offer: the bot may post and manage everywhere, plus #指令區. */
function demoChannels(base) {
  return {
    ...base,
    text_channels: [
      ...base.text_channels.map((c) => ({ ...c, bot_can_send: true })),
      { id: "700000000000000003", name: "指令區", category_id: null, bot_can_send: true },
    ],
    categories: base.categories.map((c) => ({ ...c, bot_can_manage: true })),
  };
}

// ---- the rewrite ------------------------------------------------------------------------

const server = String.raw`/api/servers/\d+`;
/**
 * A server the user already set up (fake-api shows 已由你設定 only after the wizard created one,
 * and that ends the wizard), so step 1's screenshot has all four states.
 */
export const DEMO_EXTRA_SERVER = Object.freeze({ id: "222222222222222004", name: "星光桌遊館", icon_url: null, state: "set_up_by_you" });

const ROUTES = [
  [new RegExp("^/api/onboarding/state$"), (body) => ({ ...body, servers: [...body.servers, { ...DEMO_EXTRA_SERVER }] })],
  [new RegExp(`^/api/servers$`), (body) => body.filter((s) => s.id === SERVER_ID)],
  [new RegExp(`^${server}/overview$`), demoOverview],
  [new RegExp(`^${server}/orders$`), (body) => ({ ...body, items: body.items.map(demoOrder) })],
  [new RegExp(`^${server}/orders/\\d+$`), demoOrderDetail],
  [new RegExp(`^${server}/discord/channels$`), demoChannels],
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
