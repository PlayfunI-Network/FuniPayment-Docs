import { expect, test } from "vitest";
import {
  checkFees,
  convertKeys,
  extractConstants,
  extractDicts,
  extractModal,
  renderGenerated,
} from "./sync-bot-ui-lib.mjs";
import * as realConfig from "./sync-bot-ui.config.mjs";

const FOOTER = { icon_url: "https://i.imgur.com/ma5Gxaq.png", text: "Powered by PlayfunI Network" };

/** A small ui.json in the bot's shapes: one flow (send_message) and one builder (embed + view). */
const UI = {
  "flow/x/ok": {
    order: ["response.send_message", "Client.rename_channel"],
    "Client.rename_channel": [{ args: ["<FakeClient>", "selecting"], kwargs: {} }],
    "response.send_message": [
      {
        args: [],
        kwargs: {
          embed: {
            embed: {
              color: 47103,
              title: "測試商店 的訂單",
              description: "訂單金額：__100__ 新台幣\n付款者：<@333333333333333333>\n編號 1100",
              footer: FOOTER,
              thumbnail: { url: "https://cdn.test/icon/111111111111111111.png" },
              has_timestamp: true,
              flags: 0,
              type: "rich",
            },
          },
          view: {
            view: {
              children: [
                {
                  type: "Select",
                  placeholder: "選擇付款方式",
                  disabled: false,
                  max_values: 1,
                  min_values: 1,
                  options: [
                    ["銀行轉帳（+13元）", "bank_transfer", null, false],
                    ["點數（+0元）", "balance", null, false],
                  ],
                },
              ],
              timeout: 86400,
            },
          },
          ephemeral: true,
        },
      },
    ],
  },
  "builder/y": {
    embed: {
      color: 1027618,
      title: "付款編號：000042723549",
      fields: [{ inline: false, name: "付款金額", value: "```135```" }],
      footer: FOOTER,
      has_timestamp: false,
      type: "rich",
      flags: 0,
    },
    view: {
      children: [
        { type: "Button", label: "確認", style: "success", disabled: true, url: null },
        { type: "Button", label: "開始設定", style: 5, disabled: false, url: "https://example.com/setup" },
      ],
      timeout: null,
    },
  },
};

const GLOBAL = {
  urlRules: realConfig.URL_RULES,
  textRules: realConfig.TEXT_RULES,
  mentions: realConfig.MENTIONS,
};

const KEYS = {
  "flow/x/ok": { replace: [["100", "{amount}"], ["點數（", "{balanceName}（"]], optionFees: true },
  "builder/y": { replace: [["135", "{total}"], ["000042723549", "{orderId}"]], method: "store_barcode" },
};

test("config 裡的 key 在 ui.json 找不到就丟錯並列出 key", () => {
  expect(() => convertKeys(UI, { ...KEYS, "flow/missing": { replace: [] }, "builder/也沒有": { replace: [] } }, GLOBAL)).toThrow(
    /flow\/missing.*builder\/也沒有/s,
  );
});

test("替換規則：數字、商店、mention、圖示", () => {
  const out = convertKeys(UI, KEYS, GLOBAL);
  const flow = out["flow/x/ok"];
  expect(flow.kind).toBe("message");
  expect(flow.ephemeral).toBe(true);
  const embed = flow.embeds[0];
  expect(embed.title).toBe("{shop} 的訂單");
  // 只換完整的數字：1100 裡的 100 不動
  expect(embed.description).toBe("訂單金額：__{amount}__ 新台幣\n付款者：<@{buyer}>\n編號 1100");
  expect(embed.footer).toEqual({ text: "Powered by PlayfunI Network", icon_url: "/brand/playfuni-icon.png" });
  expect(embed.thumbnail).toEqual({ url: "/demo/avatars/shop.png" });
  expect(embed.color).toBe(47103);
  expect(embed.has_timestamp).toBe(true);
  expect(flow.components).toEqual([
    {
      type: "select",
      placeholder: "選擇付款方式",
      disabled: false,
      options: [
        { label: "銀行轉帳（+{fee:bank_transfer}元）", value: "bank_transfer", description: null, default: false },
        { label: "{balanceName}（+{fee:balance}元）", value: "balance", description: null, default: false },
      ],
    },
  ]);
});

test("builder：欄位、按鈕樣式（名稱或數字）、停用狀態與付款方式限定", () => {
  const out = convertKeys(UI, KEYS, GLOBAL);
  const b = out["builder/y"];
  expect(b.method).toBe("store_barcode");
  expect(b.ephemeral).toBe(false);
  expect(b.embeds[0].title).toBe("付款編號：{orderId}");
  expect(b.embeds[0].fields).toEqual([{ name: "付款金額", value: "```{total}```", inline: false }]);
  expect(b.components).toEqual([
    { type: "button", label: "確認", style: "success", disabled: true, url: null },
    { type: "button", label: "開始設定", style: "link", disabled: false, url: "https://example.com/setup" },
  ]);
});

test("輸出不含 cdn.test、imgur、測試", () => {
  const out = convertKeys(UI, KEYS, GLOBAL);
  const text = renderGenerated({ entries: out, extra: {}, commit: "abc1234" });
  expect(text).not.toMatch(/cdn\.test|imgur|測試/);
  expect(text).toContain("abc1234");
  expect(text).toContain("勿手改");
});

test("沒對應到的頭像、mention 或測試字樣會丟錯，不默默留下", () => {
  const withAvatar = structuredClone(UI);
  withAvatar["builder/y"].embed.thumbnail = { url: "https://cdn.test/avatar/999.png" };
  expect(() => convertKeys(withAvatar, KEYS, GLOBAL)).toThrow(/cdn\.test/);

  const withMention = structuredClone(UI);
  withMention["builder/y"].embed.description = "<@555555555555555555>";
  expect(() => convertKeys(withMention, KEYS, GLOBAL)).toThrow(/555555555555555555/);

  const withTest = structuredClone(UI);
  withTest["builder/y"].embed.description = "測試伺服器";
  expect(() => convertKeys(withTest, KEYS, GLOBAL)).toThrow(/測試/);
});

test("沒有套用到的替換規則會丟錯（bot 改了字，規則過期）", () => {
  expect(() =>
    convertKeys(UI, { ...KEYS, "builder/y": { replace: [...KEYS["builder/y"].replace, ["999", "{fee}"]] } }, GLOBAL),
  ).toThrow(/999/);
});

test("原文已經像 token 的字會丟錯", () => {
  const ui = structuredClone(UI);
  ui["builder/y"].embed.description = "{amount}";
  expect(() => convertKeys(ui, KEYS, GLOBAL)).toThrow(/token/);
});

test("Python 原始碼：UPPER_CASE 常數、dict、Modal 欄位", () => {
  const i18n = 'MODAL_TITLE = "填寫購買人資訊"\nINPUT_NAME = "您的姓名"\nINPUT_MAIL = "電子郵件(Email)"\nINPUT_PHONE = "電話號碼"\nlower = "x"\n';
  expect(extractConstants(i18n)).toEqual({
    MODAL_TITLE: "填寫購買人資訊",
    INPUT_NAME: "您的姓名",
    INPUT_MAIL: "電子郵件(Email)",
    INPUT_PHONE: "電話號碼",
  });
  const dicts = 'A: dict[str, str] = {\n    "bank_transfer": "銀行轉帳",\n    "ibon": "7-11"\n}\nB = {"x": "y"}\n';
  expect(extractDicts(dicts)).toEqual({ A: { bank_transfer: "銀行轉帳", ibon: "7-11" }, B: { x: "y" } });
  const view = [
    "class ConsumerInfoModal(Modal, title=consumer_text.MODAL_TITLE):",
    "            self.buyer_name = TextInput(",
    "                label=consumer_text.INPUT_NAME,",
    "                required=True,",
    "                max_length=50",
    "            )",
    "            self.buyer_phone = TextInput(",
    "                label=consumer_text.INPUT_PHONE,",
    "                required=False,",
    "                max_length=20",
    "            )",
    "            self.add_item(self.buyer_phone)",
    "            self.add_item(self.buyer_name)",
  ].join("\n");
  expect(extractModal(view, extractConstants(i18n))).toEqual({
    kind: "modal",
    title: "填寫購買人資訊",
    fields: [
      { id: "phone", label: "電話號碼", required: false, maxLength: 20 },
      { id: "name", label: "您的姓名", required: true, maxLength: 50 },
    ],
  });
});

test("手續費預設值和 bot 不同時丟錯", () => {
  const schema = [
    "    bank_transfer: PaymentMethodConfig = PaymentMethodConfig(fee=13)",
    "    store_barcode: PaymentMethodConfig = PaymentMethodConfig(fee=25)",
    "    ibon: PaymentMethodConfig = PaymentMethodConfig(fee=30)",
    "    famiport: PaymentMethodConfig = PaymentMethodConfig(fee=35)",
    "    hilife: PaymentMethodConfig = PaymentMethodConfig(fee=30)",
    "    ibon_extra_fee: Fee = 5",
  ].join("\n");
  const feesPy = 'EXTRA_FEE_METHODS = ("ibon", "hilife")\nEXTRA_FEE_THRESHOLD = 1000\n';
  expect(() => checkFees(schema, feesPy)).not.toThrow();
  expect(() => checkFees(schema.replace("fee=25", "fee=20"), feesPy)).toThrow(/store_barcode/);
  expect(() => checkFees(schema, feesPy.replace("1000", "2000"))).toThrow(/EXTRA_FEE_THRESHOLD/);
});
