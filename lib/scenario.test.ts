import { BOT_UI } from "@/content/bot-ui.generated";
import type { BotUiEntry } from "./bot-ui-types";
import { calculateFee } from "./fees";
import {
  DEMO_NOW,
  DEMO_SCENARIO,
  discordTime,
  fillSnapshot,
  fillTokens,
  scenarioTokens,
  type Scenario,
} from "./scenario";

const scenario: Scenario = {
  shop: "星光遊戲社",
  buyer: "顧客",
  admin: "商家",
  amount: 500,
  method: "store_barcode",
  orderId: "241021387465",
};
const now = new Date(2026, 9, 21, 15, 24, 8);
const tokens = scenarioTokens(scenario, now);

test("fillTokens 把 token 換成情境的值", () => {
  expect(fillTokens("訂單金額：__{amount}__ 新台幣", tokens)).toBe("訂單金額：__500__ 新台幣");
  expect(fillTokens("付款者：<@{buyer}>", tokens)).toBe("付款者：<@顧客>");
  expect(fillTokens("沒有 token 的字", tokens)).toBe("沒有 token 的字");
});

test("找不到的 token 直接丟錯", () => {
  expect(() => fillTokens("{nope}", tokens)).toThrow(/nope/);
  expect(() => fillTokens("{fee:nope}", tokens)).toThrow(/fee:nope/);
});

test("{fee} 與 calculateFee 一致，{total} 等於 amount + fee", () => {
  for (const method of ["bank_transfer", "store_barcode", "ibon", "famiport", "hilife", "balance"] as const) {
    for (const amount of [100, 500, 971, 1500]) {
      const t = scenarioTokens({ ...scenario, method, amount }, now);
      const fee = calculateFee(method, amount);
      expect(t.fee).toBe(String(fee));
      expect(t.total).toBe(String(amount + fee));
      expect(t[`fee:${method}`]).toBe(String(fee));
    }
  }
});

test("每個付款方式的手續費 token 依同一個金額計算", () => {
  const t = scenarioTokens({ ...scenario, amount: 980 }, now);
  expect(t["fee:ibon"]).toBe("35"); // 980+30 > 1000
  expect(t["fee:famiport"]).toBe("35");
  expect(t["fee:balance"]).toBe("0");
});

test("期限、付款時間與訊息時間用 bot 的格式", () => {
  expect(tokens.deadline).toBe("2026/10/24｜23:59:59");
  expect(tokens.paidAt).toBe("2026-10-21 15:24:08");
  expect(tokens.expiresIn).toBe("1 天內");
  expect(discordTime(now)).toBe("今天 下午3:24");
});

test("付款方式名稱依畫面取 bot 的對照表", () => {
  expect(tokens["method_label:dropdown"]).toBe("四大超商條碼");
  expect(tokens["method_label:complete"]).toBe("超商條碼");
  const famiport = scenarioTokens({ ...scenario, method: "famiport" }, now);
  expect(famiport["method_label:complete"]).toBe("全家超商代碼");
  // 點數付款沒有「付款完成通知」，用到就會丟錯
  const balance = scenarioTokens({ ...scenario, method: "balance" }, now);
  expect(() => fillTokens("{method_label:complete}", balance)).toThrow();
});

test("點數名稱沒給時用 bot 的預設值", () => {
  expect(tokens.balanceName).toBe("商城點數");
  expect(scenarioTokens({ ...scenario, balanceName: "星光幣" }, now).balanceName).toBe("星光幣");
});

test("fillSnapshot 填好整則訊息，選單手續費依情境計算", () => {
  const entry = fillSnapshot("flow/fp_command/ok", scenario, now);
  expect(entry.embeds[0].description).toContain("訂單金額：__500__ 新台幣");
  expect(entry.embeds[0].description).toContain("<t:1 天內:R>");
  const select = entry.components.find((c) => c.type === "select");
  expect(select && select.type === "select" && select.options.map((o) => o.label)).toEqual([
    "銀行轉帳（+13元）",
    "四大超商條碼（+25元）",
    "7-11 超商代碼（+30元）",
    "全家超商代碼（+35元）",
    "萊爾富超商代碼（+30元）",
    "商城點數（+0元）",
  ]);
});

test("同一個情境，訂單建立與付款完成的金額、手續費、訂單號一致", () => {
  const created = fillSnapshot("builder/payment_create/store_barcode/invoice=False", scenario, now).embeds[0];
  expect(created.title).toBe("付款編號：241021387465");
  expect(created.description).toContain("**手續費**：25 元");
  expect(created.fields?.map((f) => f.value)).toEqual(["```525```", "```2026/10/24｜23:59:59```"]);
  const done = fillSnapshot("builder/payment_complete", scenario, now).embeds[0];
  expect(done.title).toBe("付款編號：241021387465");
  expect(done.author?.name).toBe("速買配－付款完成通知（超商條碼）");
  expect(done.fields?.map((f) => f.value).slice(0, 3)).toEqual(["```500```", "```25```", "```525```"]);
});

test("只適用某個付款方式的畫面，情境不同就丟錯", () => {
  expect(() =>
    fillSnapshot("builder/payment_create/store_barcode/invoice=False", { ...scenario, method: "ibon" }, now),
  ).toThrow(/store_barcode/);
});

test("第一批每個 key 用預設情境都填得起來", () => {
  for (const [id, entry] of Object.entries(BOT_UI) as [string, BotUiEntry][]) {
    if (entry.kind !== "message") continue;
    const s = entry.method ? { ...DEMO_SCENARIO, method: entry.method } : DEMO_SCENARIO;
    const filled = fillSnapshot(id as Parameters<typeof fillSnapshot>[0], s, DEMO_NOW);
    expect(JSON.stringify(filled)).not.toMatch(/\{[A-Za-z_]+(:[A-Za-z_]+)?\}/);
  }
});
