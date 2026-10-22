// rewrite() against the bot's real fake-api data (web/e2e/fixtures.mjs), so a fixture change that
// brings in a new test value fails here before it reaches a screenshot.
// Needs the bot repo: FUNIPAY_BOT_DIR, default ../../PycharmProjects/FuniPayment (like sync:bot).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeAll, describe, expect, test } from "vitest";
import { calculateFee, DEFAULT_FEES } from "../lib/fees.mjs";
import { DEMO_BUYER_INFO, DEMO_PEOPLE } from "../lib/scenario";
import { BANNED, DEMO, DEMO_SETTINGS_CHANGES, findBanned, overviewBook, rewrite } from "./demo-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const botDir = path.resolve(root, process.env.FUNIPAY_BOT_DIR ?? "../../PycharmProjects/FuniPayment");
const fixturesFile = path.join(botDir, "web", "e2e", "fixtures.mjs");

/** @type {any} */
let F;
beforeAll(async () => {
  if (!fs.existsSync(fixturesFile)) throw new Error(`找不到 bot 專案的 ${fixturesFile}（設定 FUNIPAY_BOT_DIR）`);
  F = await import(pathToFileURL(fixturesFile).href);
});

const S = "111111111111111111";
// fake-api.mjs's inline answers (not exported from fixtures.mjs, so copied here: if fake-api.mjs
// changes them, these copies no longer show what the proxy really serves; update them with it)
const ME = { id: "222222222222222222", name: "測試商家", avatar_url: null, is_bot_owner: false, needs_terms: false, welcome_seen: true };
const SERVERS = [
  { id: S, name: "測試伺服器", icon_url: null, suspended: false, has_orders: true },
  { id: "111111111111111777", name: "沒有遷移的伺服器", icon_url: null, suspended: false, has_orders: true },
  { id: "111111111111111666", name: null, icon_url: null, suspended: false, has_orders: false },
];

/** The fake-api answer for every path the dashboard demos open. */
function responses() {
  return {
    "/api/me": ME,
    "/api/servers": SERVERS,
    [`/api/servers/${S}`]: SERVERS[0],
    "/api/onboarding/state": {
      daily_remaining: F.DAILY_CREATE_LIMIT, invite_url: F.INVITE_URL, owner_suspended: false, servers: F.NEWBIE_SERVERS,
      terms_accepted: false, terms_version: F.LEGAL.terms.version, welcome_seen: false,
    },
    [`/api/onboarding/servers/${F.NEW_SERVER_ID}/options`]: { roles: F.ROLES, channels: F.CHANNELS },
    [`/api/servers/${S}/overview`]: F.overview("last_30d", true),
    [`/api/servers/${S}/orders`]: F.orderPage(new URLSearchParams()),
    [`/api/servers/${S}/orders/50000000001`]: F.orderDetail("50000000001"),
    [`/api/servers/${S}/orders/50000000005`]: F.orderDetail("50000000005"),
    [`/api/servers/${S}/settings`]: F.SETTINGS,
    [`/api/servers/${S}/discord/roles`]: F.ROLES,
    [`/api/servers/${S}/discord/channels`]: F.CHANNELS,
    [`/api/servers/${S}/settings/audit`]: F.AUDIT,
    [`/api/servers/${S}/features`]: F.FEATURES,
    "/api/admin/overview": F.ADMIN_OVERVIEW,
  };
}

const rewritten = () => Object.fromEntries(Object.entries(responses()).map(([p, body]) => [p, rewrite(p, structuredClone(body))]));

/** Every order row in an answer: list items, the overview's recent orders, or one order's detail. */
function ordersIn(body) {
  if (Array.isArray(body?.items) && body.items[0]?.smilepay_id) return body.items;
  if (Array.isArray(body?.recent_orders)) return body.recent_orders;
  if (body?.smilepay_id) return [body];
  return [];
}

describe("rewrite", () => {
  test("沒有任何測試字樣", () => {
    for (const [p, body] of Object.entries(rewritten())) {
      const text = JSON.stringify(body);
      for (const word of BANNED) expect(text, `${p} 還有「${word}」`).not.toContain(word);
    }
  });

  test("fixture 本來就有測試字樣（測試真的有在檢查）", () => {
    const all = JSON.stringify(responses());
    for (const word of ["測試", "開發者", "沒有遷移的伺服器"]) expect(all).toContain(word);
  });

  test("伺服器名稱是星光遊戲社", () => {
    const r = rewritten();
    expect(DEMO.shop).toBe("星光遊戲社");
    const state = r["/api/onboarding/state"];
    expect(state.servers.find((s) => s.id === F.NEW_SERVER_ID)).toMatchObject({ name: DEMO.shop, state: "available" });
    expect(state.servers.find((s) => s.id === F.NEW_SERVER_ID).icon_url).toMatch(/^data:image\/png;base64,/);
    expect(r["/api/servers"]).toEqual([expect.objectContaining({ id: S, name: DEMO.shop })]);
    expect(r[`/api/servers/${S}`].name).toBe(DEMO.shop);
    const group = r[`/api/servers/${S}/orders`].scope.group.map((g) => g.name);
    expect(group[0]).toBe(DEMO.shop);
  });

  test("人物用角色名，和 Discord demo 同一批", () => {
    const r = rewritten();
    expect(DEMO.merchant).toBe(DEMO_PEOPLE.admin.name);
    expect(DEMO.buyer).toBe(DEMO_PEOPLE.buyer.name);
    expect(r["/api/me"]).toMatchObject({ name: DEMO.merchant, is_bot_owner: false });
    for (const row of r[`/api/servers/${S}/orders`].items) expect(row.user_name).toBe(DEMO.buyer);
    const detail = r[`/api/servers/${S}/orders/50000000001`];
    expect(detail).toMatchObject({ buyer_name: DEMO_BUYER_INFO.name, buyer_mail: DEMO_BUYER_INFO.email, buyer_phone: DEMO_BUYER_INFO.phone });
    for (const item of r[`/api/servers/${S}/settings/audit`].items) if (item.actor_name !== null) expect(item.actor_name).toBe(DEMO.merchant);
  });

  test("訂單的金額與手續費符合 calculateFee", () => {
    let count = 0;
    for (const body of Object.values(rewritten())) {
      for (const row of ordersIn(body)) {
        count += 1;
        expect(row.fee, `${row.smilepay_id} ${row.payment_method} ${row.order_amount}`).toBe(calculateFee(row.payment_method, row.order_amount));
        expect(row.pay_amount).toBe(row.order_amount + row.fee);
      }
    }
    expect(count).toBeGreaterThan(20);
  });

  test("訂單明細和列表裡同一筆訂單一致", () => {
    const r = rewritten();
    for (const id of ["50000000001", "50000000005"]) {
      const row = r[`/api/servers/${S}/orders`].items.find((o) => o.smilepay_id === id);
      const detail = r[`/api/servers/${S}/orders/${id}`];
      for (const key of ["order_amount", "fee", "pay_amount", "payment_method", "status", "order_type"]) expect(detail[key]).toBe(row[key]);
    }
  });

  test("不改狀態、編號與筆數（篩選與分頁照 fixture）", () => {
    const before = responses()[`/api/servers/${S}/orders`];
    const after = rewritten()[`/api/servers/${S}/orders`];
    expect(after.items.map((o) => [o.smilepay_id, o.status, o.order_type])).toEqual(before.items.map((o) => [o.smilepay_id, o.status, o.order_type]));
    expect(after.status_counts).toEqual(before.status_counts);
  });

  test("存進 fake API 的設定：手續費是 bot 的預設值，付款方式全開，速買配參數都已設定", () => {
    const settings = F.applyFake(F.SETTINGS, structuredClone(DEMO_SETTINGS_CHANGES));
    expect(F.fakeErrors(structuredClone(DEMO_SETTINGS_CHANGES))).toEqual([]);
    for (const [method, fee] of Object.entries(DEFAULT_FEES)) expect(settings.payment[method]).toEqual({ enabled: true, fee });
    expect(settings.payment.ibon_extra_fee).toBe(5);
    expect(settings.smilepay_store_number).toBe(DEMO.storeNumber);
    expect(settings).toMatchObject({ smilepay_param_code_set: true, smilepay_verify_key_set: true, smilepay_mid_verify_param_set: true });
  });

  test("設定頁的頻道與分類：機器人都有權限，多一個 #指令區", () => {
    const channels = rewritten()[`/api/servers/${S}/discord/channels`];
    expect(channels.text_channels.map((c) => c.name)).toEqual([...F.CHANNELS.text_channels.map((c) => c.name), "指令區"]);
    expect(channels.text_channels.every((c) => c.bot_can_send)).toBe(true);
    expect(channels.categories.every((c) => c.bot_can_manage)).toBe(true);
  });

  test("同樣的輸入每次都得到同樣的結果（深色、淺色兩張圖一致）", () => {
    expect(JSON.stringify(rewritten())).toBe(JSON.stringify(rewritten()));
  });

  test("沒列出的路徑也會換掉名稱", () => {
    expect(rewrite("/api/admin/servers", { name: "測試伺服器", owner: "開發者" })).toEqual({ name: DEMO.shop, owner: DEMO.botOwner });
  });
});

test("findBanned 找出殘留字樣，允許的介面原文除外", () => {
  expect(findBanned("你好，測試商家")).toEqual(["測試"]);
  expect(findBanned("建議先在 Discord 用 /fp 建立一筆小額測試訂單")).toEqual([]);
  expect(findBanned("開發者")).toEqual(["開發者"]);
});

describe("總覽：每個數字都是同一批訂單加總出來的", () => {
  const PERIODS = ["last_30d", "today", "last_24h", "last_7d"];
  const sum = (orders, key) => orders.reduce((total, o) => total + o[key], 0);

  for (const kind of PERIODS) {
    test(`${kind}：指標、趨勢、付款方式、熱門時段都和訂單一致`, () => {
      const base = F.overview(kind, true);
      const o = rewrite(`/api/servers/${S}/overview`, structuredClone(base));
      const { current, previous } = overviewBook(structuredClone(base));
      const paid = current.filter((x) => x.status === "complete");
      expect(paid.length).toBeGreaterThan(0);
      for (const x of [...current, ...previous]) {
        expect(x.fee, `${x.payment_method} ${x.order_amount}`).toBe(calculateFee(x.payment_method, x.order_amount));
        expect(x.pay_amount).toBe(x.order_amount + x.fee);
      }
      expect(o.kpis.revenue_detail).toEqual({ order_amount: sum(paid, "order_amount"), fee: sum(paid, "fee"), pay_amount: sum(paid, "pay_amount") });
      expect(o.kpis.revenue.total.current).toEqual({ excl_fee: sum(paid, "order_amount"), incl_fee: sum(paid, "pay_amount") });
      expect(o.kpis.completed_orders.total.current).toBe(paid.length);
      expect(o.kpis.completed_orders.payment.current + o.kpis.completed_orders.topup.current).toBe(paid.length);
      expect(o.kpis.created_orders.total.current).toBe(current.length);
      const methodTotal = o.payment_methods.reduce((t, m) => ({ orders: t.orders + m.orders, excl: t.excl + m.amount.excl_fee }), { orders: 0, excl: 0 });
      expect(methodTotal).toEqual({ orders: paid.length, excl: sum(paid, "order_amount") });
      expect(o.trend.reduce((t, p) => t + p.revenue.excl_fee, 0)).toBe(sum(paid, "order_amount"));
      expect(o.trend.reduce((t, p) => t + p.completed_orders, 0)).toBe(paid.length);
      expect(o.trend.reduce((t, p) => t + p.created_orders, 0)).toBe(current.length);
      expect(o.heatmap.reduce((t, c) => t + c.orders, 0)).toBe(paid.length);
      const pending = current.filter((x) => x.status === "pending");
      expect(o.kpis.pending).toEqual({ orders: pending.length, amount: { excl_fee: sum(pending, "order_amount"), incl_fee: sum(pending, "pay_amount") } });
      expect(o.kpis.average_order_value.current.excl_fee).toBe(Math.round(sum(paid, "order_amount") / paid.length));
      const finished = current.filter((x) => x.status !== "pending");
      expect(o.kpis.completion_rate.current).toBe(Math.round((current.filter((x) => x.status === "complete").length / finished.length) * 1000) / 10);
      expect(o.customers.unique_payers.current).toBe(new Set(paid.map((x) => x.user_id)).size);
    });
  }

  test("最近訂單就是那批訂單裡最新的幾筆，金額和訂單列表一樣", () => {
    const base = F.overview("last_30d", true);
    const o = rewrite(`/api/servers/${S}/overview`, structuredClone(base));
    const { current } = overviewBook(structuredClone(base));
    const list = rewritten()[`/api/servers/${S}/orders`].items;
    const newest = [...current].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, o.recent_orders.length);
    expect(newest.map((x) => x.smilepay_id)).toEqual(o.recent_orders.map((x) => x.smilepay_id));
    for (const row of o.recent_orders) {
      const same = list.find((x) => x.smilepay_id === row.smilepay_id);
      for (const key of ["order_amount", "fee", "pay_amount", "payment_method", "status"]) expect(row[key]).toBe(same[key]);
    }
  });

  test("和前一期比較的百分比照 bot 的算法（小數一位，四捨五入）", () => {
    const o = rewrite(`/api/servers/${S}/overview`, F.overview("last_30d", true));
    const { current, previous } = o.kpis.revenue.total;
    expect(o.kpis.revenue.total.change_pct.excl_fee).toBe(Math.round(((current.excl_fee - previous.excl_fee) / previous.excl_fee) * 1000) / 10);
    const top = o.customers.top.excl_fee;
    expect(top.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].amount.excl_fee).toBeGreaterThanOrEqual(top[i].amount.excl_fee);
  });
});
