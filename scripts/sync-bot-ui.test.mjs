import { expect, test } from "vitest";
import {
  assertClean,
  checkFees,
  convertCommands,
  convertKeys,
  extractConstants,
  extractDicts,
  extractExpiredOrder,
  extractModal,
  extractTemplate,
  extractTextEdit,
  rawEntry,
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
  // (999 is the bot's own avatar, which URL_RULES maps; 555 is nobody)
  withAvatar["builder/y"].embed.thumbnail = { url: "https://cdn.test/avatar/555.png" };
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

test("per-field override 勝過全域規則，且欄位不存在時丟錯", () => {
  const ui = structuredClone(UI);
  ui["builder/y"].embed.author = { name: "速買配－付款完成通知", icon_url: "https://i.imgur.com/ma5Gxaq.png" };
  const keys = { ...KEYS, "builder/y": { ...KEYS["builder/y"], override: { "embeds.0.author.icon_url": "/demo/avatars/shop.png" } } };
  const embed = convertKeys(ui, keys, GLOBAL)["builder/y"].embeds[0];
  // 同一個 imgur 圖示：作者欄用 override，footer 照全域規則
  expect(embed.author.icon_url).toBe("/demo/avatars/shop.png");
  expect(embed.footer.icon_url).toBe("/brand/playfuni-icon.png");

  const missing = { ...KEYS, "builder/y": { ...KEYS["builder/y"], override: { "embeds.0.thumbnail.url": "/x.png" } } };
  expect(() => convertKeys(UI, missing, GLOBAL)).toThrow(/embeds\.0\.thumbnail\.url/);
});

test("Modal 欄位有不認得的參數就丟錯", () => {
  const view = [
    "class ConsumerInfoModal(Modal, title=consumer_text.MODAL_TITLE):",
    "            self.buyer_name = TextInput(",
    "                label=consumer_text.INPUT_NAME,",
    '                placeholder="王小明",',
    "                max_length=50",
    "            )",
    "            self.add_item(self.buyer_name)",
  ].join("\n");
  expect(() => extractModal(view, { MODAL_TITLE: "t", INPUT_NAME: "n" })).toThrow(/placeholder/);
});

/** A tiny commands.json in the bot's shape: a command with options and one with subcommands. */
const COMMANDS = {
  "command/fp": {
    contexts: null,
    default_member_permissions: null,
    description: "[管理員] 快速為顧客建立付款訂單",
    description_localizations: {},
    dm_permission: true,
    integration_types: null,
    name: "fp",
    name_localizations: {},
    nsfw: false,
    options: [
      { description: "付款金額", name: "amount", name_localizations: { "zh-CN": "金額", "zh-TW": "金額" }, required: true, type: 4 },
      {
        description: "(選填) 指定顧客",
        description_localizations: { "zh-TW": "僅該用戶能操作此筆訂單" },
        name: "designated",
        name_localizations: { "zh-TW": "指定付款者" },
        required: false,
        type: 6,
      },
    ],
    type: 1,
  },
  "command/payment": {
    contexts: [0],
    default_member_permissions: 32,
    description: "…",
    description_localizations: {},
    dm_permission: false,
    integration_types: null,
    name: "payment",
    name_localizations: {},
    nsfw: false,
    options: [
      {
        description: "建立一筆新的付款訂單",
        description_localizations: {},
        name: "create",
        name_localizations: {},
        options: [
          {
            choices: [
              { name: "銀行轉帳", value: "bank_transfer" },
              { name: "x", value: 1, name_localizations: { "zh-TW": "否" } },
            ],
            description: "付款方式",
            description_localizations: { "zh-TW": "請選擇付款方式" },
            name: "method",
            name_localizations: { "zh-TW": "付款方式" },
            required: true,
            type: 3,
          },
        ],
        type: 1,
      },
    ],
    type: 1,
  },
};

test("commands.json：zh-TW 名稱與說明、參數、選項、權限", () => {
  const out = convertCommands(COMMANDS);
  expect(out.fp).toEqual({
    name: "fp",
    nameZh: "fp",
    description: "[管理員] 快速為顧客建立付款訂單",
    defaultMemberPermissions: null,
    dmPermission: true,
    contexts: null,
    options: [
      { name: "amount", nameZh: "金額", description: "付款金額", required: true, type: "integer" },
      { name: "designated", nameZh: "指定付款者", description: "僅該用戶能操作此筆訂單", required: false, type: "user" },
    ],
    subcommands: [],
  });
  expect(out.payment.defaultMemberPermissions).toBe(32);
  expect(out.payment.dmPermission).toBe(false);
  expect(out.payment.contexts).toEqual([0]);
  expect(out.payment.options).toEqual([]);
  expect(out.payment.subcommands).toEqual([
    {
      name: "create",
      nameZh: "create",
      description: "建立一筆新的付款訂單",
      options: [
        {
          name: "method",
          nameZh: "付款方式",
          description: "請選擇付款方式",
          required: true,
          type: "string",
          choices: [
            { label: "銀行轉帳", value: "bank_transfer" },
            { label: "否", value: 1 },
          ],
        },
      ],
    },
  ]);
});

test("commands.json：不認得的欄位、型別或子指令群組都丟錯", () => {
  const extraKey = structuredClone(COMMANDS);
  extraKey["command/fp"].name_localized = "x";
  expect(() => convertCommands(extraKey)).toThrow(/command\/fp.*name_localized/);

  const badType = structuredClone(COMMANDS);
  badType["command/fp"].options[0].type = 99;
  expect(() => convertCommands(badType)).toThrow(/99/);

  const group = structuredClone(COMMANDS);
  group["command/payment"].options[0].type = 2;
  expect(() => convertCommands(group)).toThrow(/子指令群組/);

  const optionKey = structuredClone(COMMANDS);
  optionKey["command/fp"].options[1].placeholder = "x";
  expect(() => convertCommands(optionKey)).toThrow(/placeholder/);

  expect(() => convertCommands({ "menu/x": {} })).toThrow(/menu\/x/);
});

test("typed 匯出用 satisfies 檢查型別", () => {
  const text = renderGenerated({ entries: {}, extra: {}, typed: { COMMANDS: { type: "Record<string, CommandData>", value: {} } }, commit: "c" });
  expect(text).toContain("export const COMMANDS = {} satisfies Record<string, CommandData>;");
  expect(text).toContain('import type { BotUiEntry, CommandData } from "@/lib/bot-ui-types";');
});

// ---- Parts, server texts, channels and the source extractors ----

const DM_EMBED = { color: 47103, title: "餘額異動通知", description: "您在 __測試商店__ 被增加了 **40** 點", has_timestamp: true, type: "rich", flags: 0 };
const LOG_EMBED = { color: 47103, title: "使用者轉帳紀錄", description: "從 <@333333333333333333> 轉帳給 <@444444444444444444>", has_timestamp: true, type: "rich", flags: 0 };

/** A flow that records state: its calls are under `calls`, one call name used twice. */
const FLOW_UI = {
  "flow/z": {
    balance: 90,
    calls: {
      order: ["response.edit_message", "client.send_to_log_channel", "client.send_dm_to_user", "client.send_dm_to_user", "client.notify_owner"],
      "response.edit_message": [{ args: [], kwargs: { embed: { embed: { ...DM_EMBED, title: "成功" } }, view: null } }],
      "client.send_to_log_channel": [{ args: ["<ServerSettings>", { embed: LOG_EMBED }], kwargs: {} }],
      "client.send_dm_to_user": [
        { args: [333333333333333333], kwargs: { embed: { embed: DM_EMBED } } },
        { args: [444444444444444444], kwargs: { embed: { embed: { ...DM_EMBED, title: "第二則" } } } },
      ],
      "client.notify_owner": [{ args: [111111111111111111, "伺服器 **__測試商店__** 的類別 <#234567890123456789>"], kwargs: {} }],
    },
  },
  "builder/w": {
    dm: DM_EMBED,
    confirm: { ...DM_EMBED, title: "確認" },
    view: { children: [{ type: "Button", label: "確認並轉帳", style: "success", disabled: false, url: null }], timeout: 600 },
  },
  "server/x": [{ args: ["您無法在此頻道使用此指令，請前往 <#888888888888888888> 使用"], kwargs: { ephemeral: true } }],
  "server/owner": [{ args: [111111111111111111, "伺服器 **__測試商店__** 的日誌頻道 <#123>"], kwargs: {} }],
};
const CH_GLOBAL = { ...GLOBAL, channels: realConfig.CHANNELS };

test("flow 的 part：互動回覆、log 頻道、第 n 則私訊、私訊擁有者", () => {
  const out = convertKeys(
    FLOW_UI,
    {
      "flow/z": { replace: [] },
      "flow/z@client.send_to_log_channel": { replace: [] },
      "flow/z@client.send_dm_to_user#1": { replace: [["**40**", "**{amount}**"]] },
      "flow/z@client.notify_owner": { replace: [] },
    },
    CH_GLOBAL,
  );
  expect(out["flow/z"]).toMatchObject({ via: "response.edit_message", embeds: [{ title: "成功" }], components: [] });
  expect(out["flow/z@client.send_to_log_channel"]).toMatchObject({
    via: "client.send_to_log_channel",
    embeds: [{ description: "從 <@{buyer}> 轉帳給 <@{admin}>" }],
  });
  expect(out["flow/z@client.send_dm_to_user#1"].embeds[0]).toMatchObject({
    title: "第二則",
    description: "您在 __{shop}__ 被增加了 **{amount}** 點",
  });
  expect(out["flow/z@client.notify_owner"]).toEqual({
    kind: "message",
    via: "client.notify_owner",
    content: "伺服器 **__{shop}__** 的類別 <#{channel:category}>",
    embeds: [],
    components: [],
    ephemeral: false,
  });
  expect(() => convertKeys(FLOW_UI, { "flow/z@client.send_dm_to_user#2": { replace: [] } }, CH_GLOBAL)).toThrow(/第 3 個/);
  expect(() => convertKeys(FLOW_UI, { "flow/z@client.unknown": { replace: [] } }, CH_GLOBAL)).toThrow(/不認得的訊息呼叫/);
});

test("builder 的 part：哪一則帶按鈕由 config 決定", () => {
  const out = convertKeys(
    FLOW_UI,
    { "builder/w@confirm": { replace: [], view: true }, "builder/w@dm": { replace: [], view: false } },
    CH_GLOBAL,
  );
  expect(out["builder/w@confirm"].components).toEqual([
    { type: "button", label: "確認並轉帳", style: "success", disabled: false, url: null },
  ]);
  expect(out["builder/w@dm"].components).toEqual([]);
  expect(() => convertKeys(FLOW_UI, { "builder/w@dm": { replace: [] } }, CH_GLOBAL)).toThrow(/view: true 或 false/);
  expect(() => convertKeys(FLOW_UI, { "builder/w@log": { replace: [], view: false } }, CH_GLOBAL)).toThrow(/builder 沒有 log/);
});

test("server 訊息：回覆（ephemeral）與給擁有者的私訊，頻道 mention 換成 token", () => {
  const out = convertKeys(FLOW_UI, { "server/x": { replace: [] }, "server/owner": { replace: [] } }, CH_GLOBAL);
  expect(out["server/x"]).toEqual({
    kind: "message",
    via: "reply",
    content: "您無法在此頻道使用此指令，請前往 <#{channel:command}> 使用",
    embeds: [],
    components: [],
    ephemeral: true,
  });
  expect(out["server/owner"]).toMatchObject({
    via: "client.notify_owner",
    content: "伺服器 **__{shop}__** 的日誌頻道 <#{channel:log}>",
  });
  // 沒有對應的頻道 ID 不默默留下
  expect(() => convertKeys(FLOW_UI, { "server/x": { replace: [] } }, GLOBAL)).toThrow(/頻道 mention/);
});

test("per-key mentions：同一個 ID 在這個 key 是另一個人", () => {
  const out = convertKeys(
    FLOW_UI,
    { "flow/z@client.send_to_log_channel": { replace: [], mentions: { "444444444444444444": "recipient" } } },
    CH_GLOBAL,
  );
  expect(out["flow/z@client.send_to_log_channel"].embeds[0].description).toBe("從 <@{buyer}> 轉帳給 <@{recipient}>");
});

test("新的殘留檢查：指令 mention、文字裡的 Discord ID、測試物件", () => {
  const ui = {
    "server/a": [{ args: ["歡迎使用 </payment review:424242> 查看"], kwargs: {} }],
    "server/b": [{ args: ["找不到頻道 123456789012345678"], kwargs: {} }],
  };
  expect(() => convertKeys(ui, { "server/a": { replace: [] } }, CH_GLOBAL)).toThrow(/指令 mention/);
  expect(() => convertKeys(ui, { "server/b": { replace: [] } }, CH_GLOBAL)).toThrow(/Discord ID/);
  const ok = convertKeys(
    ui,
    {
      "server/a": { replace: [["</payment review:424242>", "</payment review>"]] },
      "server/b": { replace: [["123456789012345678", "{channelId:voice}"]] },
    },
    CH_GLOBAL,
  );
  expect(ok["server/b"].content).toBe("找不到頻道 {channelId:voice}");
  expect(() => assertClean("x", { a: ["<FakeClient>"] })).toThrow(/測試用的物件/);
  expect(() => assertClean("x", { a: "{amount}" })).toThrow(/token/);
  expect(() => assertClean("x", { a: "測試商店" })).toThrow(/測試/);
  expect(() => assertClean("x", { a: "一般文字" })).not.toThrow();
});

test("rawEntry：同樣的形狀，但不做任何替換", () => {
  const raw = rawEntry(FLOW_UI, "flow/z@client.send_dm_to_user#1");
  expect(raw.embeds[0].description).toBe("您在 __測試商店__ 被增加了 **40** 點");
});

test("i18n 函式的 f-string 依 config 的值填好", () => {
  const src = [
    "def recheck_all_started(total: int, eta_minutes: int) -> str:",
    '    return (f"開始檢查所有未付款訂單... (0/{total})\\n"',
    '            f"預計完成時間：約 {eta_minutes} 分鐘")',
    "",
    "def plain() -> str:",
    '    return "固定文字"',
    "",
    "def fancy(total: int) -> str:",
    '    return f"共 {total:,} 筆"',
  ].join("\n");
  expect(extractTemplate(src, "recheck_all_started", { total: 12, eta_minutes: 0 })).toBe(
    "開始檢查所有未付款訂單... (0/12)\n預計完成時間：約 0 分鐘",
  );
  expect(extractTemplate(src, "plain", {})).toBe("固定文字");
  expect(() => extractTemplate(src, "recheck_all_started", { total: 12 })).toThrow(/eta_minutes/);
  expect(() => extractTemplate(src, "fancy", { total: 1 })).toThrow(/total:,/);
  expect(() => extractTemplate(src, "missing", {})).toThrow(/missing/);
});

test("過期訊息：兩個 view 畫法一致才產生", () => {
  const view = (color) =>
    [
      `            embed = discord.Embed(color=${color})`,
      "            embed.title = common_text.EXPIRED_TITLE",
      "            embed.description = common_text.EXPIRED_DESCRIPTION",
      "            try:",
      "                await message.edit(embed=embed, view=None)",
    ].join("\n");
  const constants = { EXPIRED_TITLE: "付款單已過期，請聯繫客服處理", EXPIRED_DESCRIPTION: "請直接告知客服" };
  expect(extractExpiredOrder([["a.py", view("0xff0000")], ["b.py", view("0xff0000")]], constants)).toEqual({
    kind: "message",
    via: "message.edit",
    embeds: [{ title: "付款單已過期，請聯繫客服處理", description: "請直接告知客服", color: 0xff0000, has_timestamp: false }],
    components: [],
    ephemeral: false,
  });
  expect(() => extractExpiredOrder([["a.py", view("0xff0000")], ["b.py", view("0x00ff00")]], constants)).toThrow(/顏色/);
  expect(() => extractExpiredOrder([["a.py", view("0xff0000").replace("view=None", "view=self")]], constants)).toThrow(
    /a\.py/,
  );
});

test("只有一個常數的文字回覆，要確認 cog 真的這樣送", () => {
  const cog = "await btn_interaction.response.edit_message(content=payment_text.OPERATION_CANCELLED,\n      embed=None, view=None)";
  expect(extractTextEdit(cog, "payment_text", "OPERATION_CANCELLED", { OPERATION_CANCELLED: "操作已取消！" })).toEqual({
    kind: "message",
    via: "response.edit_message",
    content: "操作已取消！",
    embeds: [],
    components: [],
    ephemeral: false,
  });
  expect(() => extractTextEdit(cog, "payment_text", "CONFIRMING_INFO", { CONFIRMING_INFO: "x" })).toThrow(/CONFIRMING_INFO/);
});
