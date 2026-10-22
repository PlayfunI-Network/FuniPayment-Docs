import { SCENARIOS, SNAPSHOT_SCENARIOS } from "@/components/demos/scenarios";
import { BOT_UI } from "@/content/bot-ui.generated";
import type { BotUiEntry } from "./bot-ui-types";
import { calculateFee } from "./fees";
import {
  DEMO_NOW,
  discordTime,
  fillSnapshot,
  fillTokens,
  scenarioTokens,
  type Scenario,
  type SnapshotId,
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

test("條碼圖的總額和情境不同就丟錯，不默默畫出錯的條碼", () => {
  const id = "builder/payment_create/store_barcode/invoice=False";
  expect(fillSnapshot(id, scenario, now).embeds[0].image?.url).toBe("/demo/barcodes.png");
  expect(() => fillSnapshot(id, { ...scenario, amount: 600 }, now)).toThrow(/條碼圖.*525.*625/);
  // 沒有條碼圖的畫面不受影響
  expect(() => fillSnapshot("builder/payment_complete", { ...scenario, amount: 600 }, now)).not.toThrow();
});

test("付款完成通知的作者圖示是商店圖示，和訂單建立一致", () => {
  const created = fillSnapshot("builder/payment_create/store_barcode/invoice=False", scenario, now).embeds[0];
  const done = fillSnapshot("builder/payment_complete", scenario, now).embeds[0];
  expect(done.author?.icon_url).toBe("/demo/avatars/shop.png");
  expect(done.author?.icon_url).toBe(created.author?.icon_url);
  expect(done.footer?.icon_url).toBe("/brand/playfuni-icon.png");
});

test("只適用某個付款方式的畫面，情境不同就丟錯", () => {
  expect(() =>
    fillSnapshot("builder/payment_create/store_barcode/invoice=False", { ...scenario, method: "ibon" }, now),
  ).toThrow(/store_barcode/);
});

test("每個 key 用 SNAPSHOT_SCENARIOS 指定的情境都填得起來", () => {
  for (const [id, entry] of Object.entries(BOT_UI) as [string, BotUiEntry][]) {
    if (entry.kind !== "message") continue;
    const name = SNAPSHOT_SCENARIOS[id as SnapshotId];
    expect(name, id).toBeDefined();
    const filled = fillSnapshot(id as SnapshotId, SCENARIOS[name], DEMO_NOW);
    expect(JSON.stringify(filled)).not.toMatch(/\{[A-Za-z_]+(:[A-Za-z_]+)?\}/);
  }
});

test("情境的付款方式和只適用某個付款方式的畫面一致", () => {
  for (const [id, name] of Object.entries(SNAPSHOT_SCENARIOS)) {
    const entry = BOT_UI[id as SnapshotId] as BotUiEntry;
    if (entry.kind === "message" && entry.method) expect(SCENARIOS[name].method, id).toBe(entry.method);
  }
});

test("點數：轉帳、增減、設定的前後餘額", () => {
  const t = scenarioTokens(SCENARIOS.transfer, now);
  expect([t.amount, t.balance, t.balanceMinus, t.balancePlus]).toEqual(["150", "700", "550", "850"]);
  expect([t.recipient, t.recipientBalance, t.recipientBalancePlus, t.reason]).toEqual(["會員", "80", "230", "團購分攤"]);
  expect(scenarioTokens(SCENARIOS.balanceSetUp, now).setIncrease).toBe("300");
  expect(scenarioTokens(SCENARIOS.balanceSetUp, now).setDecrease).toBeUndefined();
  expect(scenarioTokens(SCENARIOS.balanceSetDown, now).setDecrease).toBe("200");
  // 餘額不夠時沒有「付款後餘額」，用到就丟錯
  expect(scenarioTokens(SCENARIOS.balanceShort, now).balanceMinus).toBeUndefined();
  // 沒有餘額的情境用到餘額 token 就丟錯
  expect(() => fillTokens("{balance}", tokens)).toThrow(/balance/);
});

test("轉帳的畫面：收款人、理由與雙方餘額", () => {
  const confirm = fillSnapshot("flow/balance_transfer_command/ok", SCENARIOS.transfer, now).embeds[0];
  expect(confirm.title).toBe("商城點數轉帳確認");
  expect(confirm.description).toContain("您即將轉帳 **150** 點給 <@會員>");
  expect(confirm.fields?.map((f) => f.value)).toEqual(["700 點", "550 點"]);
  expect(confirm.thumbnail?.url).toBe("/demo/avatars/member.png");
  const receiver = fillSnapshot("flow/balance_transfer_confirm/50@client.send_dm_to_user#1", SCENARIOS.transfer, now).embeds[0];
  expect(receiver.description).toContain("已收到來自 <@顧客> 的 **150** 點");
  expect(receiver.fields?.map((f) => f.value)).toEqual(["230", "80"]);
});

test("訂單畫面的付款資料依付款方式", () => {
  const bank = scenarioTokens(SCENARIOS.payBankTransfer, now);
  expect(bank.bankAccount).toMatch(/^\d{13}$/);
  expect(bank.payCode).toBeUndefined();
  expect(scenarioTokens(SCENARIOS.payFamiport, now).payCode).toMatch(/^FM\d{10}$/);
  expect(tokens.payCode).toBeUndefined();
  const ibon = fillSnapshot("builder/payment_create/ibon/invoice=True", SCENARIOS.payIbon, now).embeds[0];
  expect(ibon.fields?.map((f) => f.name)).toEqual(["付款超商", "繳費代碼", "付款金額", "付款期限", "發票抬頭", "統一編號"]);
  expect(ibon.fields?.[2].value).toBe("```830```");
});

test("速買配錯誤代碼用 bot 的說明", () => {
  const failed = fillSnapshot("flow/do_payment_create/error-2001", SCENARIOS.smilepayError, now);
  expect(failed.embeds[0].description).toBe("錯誤訊息：超過付款模式設定金額");
  expect(() => scenarioTokens({ ...scenario, errorCode: "-1234" }, now)).toThrow(/-1234/);
});

test("頻道 mention 換成示範頻道名稱", () => {
  expect(fillSnapshot("server/checks/wrong_channel", scenario, now).content).toBe(
    "您無法在此頻道使用此指令，請前往 <#指令區> 使用",
  );
});
