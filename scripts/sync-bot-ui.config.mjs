// Which ui.json keys the demos use, and how their test values become demo tokens.
//
// Each key lists its own replacements [from, to], applied only to that key's strings (an
// all-digit `from` only matches a whole number, so "35" never touches "135"; a RegExp such as
// /^管理員$/ matches a whole field value). Every rule must match at least once, so a changed bot
// text fails the sync instead of leaving a test value.
// `optionFees` turns a select option's 「（+N元）」 into 「（+{fee:<method>}元）」.
// `method` marks a screen that exists for one payment method only; the demo's scenario must use it.
// `override` sets one field by its path ("embeds.0.author.icon_url"), winning over the global
// rules; the path must exist.
// `mentions` maps more user IDs (or another person for an ID) for this key only.
//
// A key is a ui.json key, or `<ui.json key>@<part>` for one message of it:
//   flow/...@<call>[#n]  the n-th (from 0) call of that name, e.g. the DM a flow sends
//                        (`@client.send_dm_to_user#1`), the log channel copy
//                        (`@client.send_to_log_channel`), the owner's DM (`@client.notify_owner`)
//   builder/...@<part>   one embed of a builder that makes several (`@dm`, `@log`); `view: true`
//                        gives that part the builder's buttons.
// Without a part a flow gives its interaction reply (plus its followup, when it has both).
// The fixture's people: 333… is the buyer 「顧客」, 444… the merchant 「管理員」 (demo 「商家」);
// their display names appear in some texts and have rules of their own.
// Tokens are filled by lib/scenario.ts (scenarioTokens); which scenario fits each key is
// SNAPSHOT_SCENARIOS in components/demos/scenarios.ts.

/** Replaced in every key: images (never linked from outside) and the test server's name. */
export const URL_RULES = [
  ["https://i.imgur.com/ma5Gxaq.png", "/brand/playfuni-icon.png"],
  [/https:\/\/cdn\.test\/icon\/\d+\.png/, "/demo/avatars/shop.png"],
  ["https://cdn.test/avatar/333333333333333333.png", "/demo/avatars/buyer.png"],
  ["https://cdn.test/avatar/444444444444444444.png", "/demo/avatars/admin.png"],
  // The bot's own avatar (the failure embeds' author)
  ["https://cdn.test/avatar/999.png", "/brand/funi-icon.png"],
  ["attachment://barcodes.png", "{barcodeImage}"],
];

export const TEXT_RULES = [
  ["測試商店", "{shop}"],
  // The test bot's name (the failure embeds' author); the demos call the bot 「FunI 付款系統」.
  ["FunI Bot", "FunI 付款系統"],
];

/** The bot's test users (tests/conftest.py USER_ID / OTHER_USER_ID) as demo people. */
export const MENTIONS = {
  "333333333333333333": "buyer",
  "444444444444444444": "admin",
};

/** The fixture's channel IDs, as `<#{channel:<name>}>` (lib/scenario.ts DEMO_CHANNELS). */
export const CHANNELS = {
  "888888888888888888": "command",
  "777777777777777777": "ticket",
  "123456789012345678": "voice",
  "234567890123456789": "category",
  "123": "log",
};

// ---- Rules shared by several keys ----

/** An order embed (/payment create, /fp): the fixture's 000042723549, 35 + 100 = 135. */
const CREATE = [
  ["000042723549", "{orderId}"],
  ["135", "{total}"],
  ["35", "{fee}"],
  ["2026/05/04｜23:59:59", "{deadline}"],
];
const INVOICE = [
  ["測試公司", "{invoiceTitle}"],
  ["12345678", "{invoiceNumber}"],
];
/** The fixture's 「全家」 order 042723549378 on the review and recheck screens. */
const REVIEWED = [
  ["042723549378", "{orderId}"],
  ["35", "{fee}"],
  ["135", "{total}"],
];
/** The admin's display name, as the 執行者 field shows it. */
const EXECUTOR = [/^管理員$/, "{admin}"];
/** In the transfer flows 444… is the member receiving the points, not the merchant. */
const TRANSFER = {
  mentions: { "444444444444444444": "recipient" },
};
const RECIPIENT_THUMBNAIL = { "embeds.0.thumbnail.url": "/demo/avatars/member.png" };
/** /fp's select step (also after 取消重選). */
const FP_SELECT = {
  replace: [
    ["100", "{amount}"],
    ["<t:TS:R>", "<t:{expiresIn}:R>"],
    ["點數（", "{balanceName}（"],
  ],
  optionFees: true,
};
/** /top-up's select step (also after 取消重選): the fixture buys 300 點數. */
const TOPUP_SELECT = {
  replace: [
    ["購買 300 點數", "購買 {amount} {balanceName}"],
    ["的點數\n", "的{balanceName}\n"],
    ["300", "{amount}"],
    ["關於點數之", "關於{balanceName}之"],
  ],
  optionFees: true,
};

export const KEYS = {
  // ---- /fp ----
  // /fp: choose a payment method
  "flow/fp_command/ok": FP_SELECT,
  // 取消重選 brings the select step back (edit_message)
  "flow/fp_reselect": FP_SELECT,
  // /fp: after choosing a method, 「再次確認您的付款方式」 with 取消重選 / 下一步. The fixture chose
  // 全家; every SmilePay method draws this screen the same way (views/fp.py create_embed), so
  // the method name, amount and fee are tokens.
  "builder/fp/famiport/0/designated=False": {
    replace: [
      ["100", "{amount}"],
      ["135", "{total}"],
      ["35", "{fee}"],
      ["全家代碼繳費", "{method_label:confirm}"],
    ],
  },
  // /fp: after 下一步: 確認購買資訊, the buyer information step (edit_message; 上一步 first)
  "flow/fp_method_confirm": { replace: [] },
  // /fp refusals
  "flow/fp_command/zero_amount": { replace: [] },
  "flow/fp_command/suspended": { replace: [] },
  // Someone other than the buyer (or an admin) uses the order's menu or buttons
  "flow/fp_check_user/stranger": { replace: [] },
  // /fp with the balance option: 「正在使用點數付款」 (enough balance) ...
  "builder/fp/balance/500/designated=False": {
    replace: [
      ["**100** 點數來", "**{amount}** {balanceName}來"],
      ["目前餘額：500", "目前餘額：{balance}"],
      ["付款後餘：400", "付款後餘：{balanceMinus}"],
      ["正在使用點數付款", "正在使用{balanceName}付款"],
      ["確認並支付點數", "確認並支付{balanceName}"],
    ],
  },
  // ... or 「點數餘額不足」 (the fixed text 「獲得更多點數」 is not the balance name)
  "builder/fp/balance/50/designated=False": {
    replace: [
      ["只支援點數", "只支援{balanceName}"],
      ["__50__ 點數", "__{balance}__ {balanceName}"],
      ["點數餘額不足", "{balanceName}餘額不足"],
    ],
  },
  // 確認並支付: the message becomes 「點數消費通知」 (the log channel gets the same embed) ...
  "flow/fp_balance_confirm/500": {
    replace: [
      ["**100** 點數", "**{amount}** {balanceName}"],
      ["目前餘額：400", "目前餘額：{balanceMinus}"],
      ["點數消費通知", "{balanceName}消費通知"],
    ],
  },
  // ... and the buyer gets this DM
  "flow/fp_balance_confirm/500@Client.send_dm_to_user": {
    replace: [
      ["**100** 點", "**{amount}** 點"],
      ["目前餘額：400 點數", "目前餘額：{balanceMinus} {balanceName}"],
      ["點數消費通知", "{balanceName}消費通知"],
    ],
  },
  // Paying with balance failed
  "flow/fp_balance_confirm/0": {
    replace: [
      ["使用點數付款", "使用{balanceName}付款"],
      ["點數付款失敗", "{balanceName}付款失敗"],
    ],
  },

  // ---- Buyer information (/fp and /payment create) ----
  "builder/consumer_info/filled=False/cancel_first=False": { replace: [] },
  "builder/consumer_info/filled=True/cancel_first=False": {
    replace: [
      ["王小明", "{buyerName}"],
      ["0912345678", "{buyerPhone}"],
      ["a@b.c", "{buyerEmail}"],
    ],
  },
  // /payment create puts 取消操作 first
  "builder/consumer_info/filled=True/cancel_first=True": {
    replace: [
      ["王小明", "{buyerName}"],
      ["0912345678", "{buyerPhone}"],
      ["a@b.c", "{buyerEmail}"],
    ],
  },
  // Someone else presses the buyer information buttons
  "flow/consumer_info_permission/stranger": { replace: [] },

  // ---- /payment create ----
  // The buyer information step as /payment create sends it (followup, ephemeral, 取消操作 first)
  "flow/payment_create_command/ok": { replace: [] },
  "flow/payment_create_command/zero_amount": { replace: [] },
  "flow/payment_create_command/designated_not_admin": { replace: [] },
  "flow/payment_create_command/role_not_allowed": { replace: [] },
  "flow/payment_create_command/suspended": { replace: [] },
  "flow/payment_create_command/method_disabled": { replace: [["全家 FamiPort 代碼繳費", "{method_label:create}"]] },

  // ---- The order embed, per payment method (the buyer's DM and the log channel get it too) ----
  "builder/payment_create/bank_transfer/invoice=False": {
    method: "bank_transfer",
    replace: [...CREATE, ["1234567890123", "{bankAccount}"]],
  },
  "builder/payment_create/bank_transfer/invoice=True": {
    method: "bank_transfer",
    replace: [...CREATE, ["1234567890123", "{bankAccount}"], ...INVOICE],
  },
  // The order embed for 四大超商條碼 (with the barcode image)
  "builder/payment_create/store_barcode/invoice=False": {
    method: "store_barcode",
    replace: [
      ["000042723549", "{orderId}"],
      ["135", "{total}"],
      ["35", "{fee}"],
      ["2026/05/04｜23:59:59", "{deadline}"],
    ],
  },
  "builder/payment_create/store_barcode/invoice=True": {
    method: "store_barcode",
    replace: [...CREATE, ...INVOICE],
  },
  "builder/payment_create/ibon/invoice=False": {
    method: "ibon",
    replace: [...CREATE, ["IB0123456789", "{payCode}"]],
  },
  "builder/payment_create/ibon/invoice=True": {
    method: "ibon",
    replace: [...CREATE, ["IB0123456789", "{payCode}"], ...INVOICE],
  },
  "builder/payment_create/famiport/invoice=False": {
    method: "famiport",
    replace: [...CREATE, ["FM0123456789", "{payCode}"]],
  },
  "builder/payment_create/famiport/invoice=True": {
    method: "famiport",
    replace: [...CREATE, ["FM0123456789", "{payCode}"], ...INVOICE],
  },
  // 萊爾富's tutorial link is an image on imgur: public/demo/tutorials/hilife.png is a copy (same size, 256 colours)
  "builder/payment_create/hilife/invoice=False": {
    method: "hilife",
    replace: [...CREATE, ["IB0123456789", "{payCode}"], ["https://i.imgur.com/JK2TExl.png", "/demo/tutorials/hilife.png"]],
  },
  "builder/payment_create/hilife/invoice=True": {
    method: "hilife",
    replace: [...CREATE, ["IB0123456789", "{payCode}"], ["https://i.imgur.com/JK2TExl.png", "/demo/tutorials/hilife.png"], ...INVOICE],
  },
  // Creating the order failed (followup)
  "flow/do_payment_create/db_failure": { replace: [] },
  "flow/do_payment_create/error-1": { replace: [] },
  // A SmilePay status code: the description is SMILEPAY_ERRORS[scenario.errorCode]
  "flow/do_payment_create/error-2001": { replace: [["速買配錯誤描述", "{errorDescription}"]] },
  // -3003 (method not opened at SmilePay): the buyer's reply ...
  "flow/do_payment_create/error-3003": { replace: [] },
  // ... and the owner's DM (the bot turns the method off)
  "flow/do_payment_create/error-3003@client.notify_owner": { replace: [["全家 FamiPort 代碼繳費", "{method_label:create}"]] },
  // (source/payment_create_cancelled, source/payment_create_confirming: read from the cog, sync-bot-ui.mjs)

  // ---- Payment complete notice (any SmilePay method; the fixture paid with 全家) ----
  "builder/payment_complete": {
    // The bot uses the server icon when the server has one (views/payment.py, notifier.py
    // _with_server_icon); the fixture server has none, so it fell back to the PlayfunI icon.
    // 星光遊戲社 has an icon on every other screen of the story.
    override: { "embeds.0.author.icon_url": "/demo/avatars/shop.png" },
    replace: [
      ["042723549378", "{orderId}"],
      ["100", "{amount}"],
      ["135", "{total}"],
      ["35", "{fee}"],
      ["2026-05-01 20:03:05", "{paidAt}"],
      ["全家超商代碼", "{method_label:complete}"],
    ],
  },
  // (source/expired_order, the order after it expired: read from the views, sync-bot-ui.mjs)

  // ---- /payment review ----
  "builder/payment_review/pending": {
    replace: [...REVIEWED, ["超商代碼｜全家", "{method_label:review}"], ["2026/05/04｜23:59:59", "{deadline}"]],
  },
  "builder/payment_review/complete": {
    replace: [...REVIEWED, ["超商代碼｜全家", "{method_label:review}"], ["2026/05/01｜20:03:05", "{paidAtBot}"]],
  },
  "builder/payment_review/expired": {
    replace: [...REVIEWED, ["2026/05/01｜12:00:00", "{createdAt}"], ["2026/05/04｜23:59:59", "{deadline}"]],
  },
  "flow/payment_review/no_id_no_payments": { replace: [] },
  "flow/payment_review/not_found": { replace: [["000000000099", "{orderId}"]] },
  "flow/payment_review/other_as_customer": { replace: [] },

  // ---- /payment history: the fixture buyer paid four 全家 orders of 135 (100 + 35) ----
  // Statistics (page 0). Dates are demo values; the counts and amounts are the fixture's.
  "flow/payment_history_command/0": {
    replace: [
      ["顧客 的統計數據", "{buyer} 的統計數據"],
      ["2026/05/01｜135 元", "2026/10/15｜135 元"],
      ["2026/05/04｜135 元", "2026/10/20｜135 元"],
    ],
  },
  // Page 1 of 2 (the fourth order, 2026/10/15, is on page 2)
  "flow/payment_history_command/1": {
    replace: [
      ["顧客 已完成", "{buyer} 已完成"],
      ["000000010003", "241020563318"],
      ["000000010002", "241018120477"],
      ["000000010001", "241016904125"],
      ["2026/05/04｜20:00:00", "2026/10/20｜21:16:52"],
      ["2026/05/03｜20:00:00", "2026/10/18｜13:40:09"],
      ["2026/05/02｜20:00:00", "2026/10/16｜19:02:37"],
    ],
  },
  // Page 2 of 2, after ▶️ (◀️ and 回首頁 on, ▶️ off). The builder's fixture has five orders, two
  // on page 2; the first of them is dropped so page 2 holds the fourth order of the four above
  // (2026/10/15, the first payment on the statistics). The remaining entry is the bot's text.
  "builder/payment_history/page=2": {
    replace: [
      ["顧客 已完成", "{buyer} 已完成"],
      [
        "－訂單編號：[000000010001](https://discord.com/channels/111111111111111111/777777777777777777/8888)\n> 繳費時間：2026/05/02｜12:00:00\n> 付款方式：超商代碼｜全家\n> 付款金額：135 元\n\n",
        "",
      ],
      ["000000010000", "241015318842"],
      ["2026/05/01｜12:00:00", "2026/10/15｜10:24:31"],
    ],
  },
  "builder/payment_history/page=-1": { replace: [] },

  // ---- /payment recheck ----
  "flow/payment_recheck/paid": { replace: [["042723549378", "{orderId}"]] },
  "flow/payment_recheck/not_paid": { replace: [["042723549378", "{orderId}"]] },
  "flow/payment_recheck/expired": { replace: [["042723549378", "{orderId}"]] },
  "flow/payment_recheck/not_found": { replace: [["000000000099", "{orderId}"]] },
  "flow/payment_recheck/no_id_no_pending": { replace: [] },
  // The bot mentions /payment review as a command (</payment review:<command id>>)
  "flow/payment_recheck/already_complete": {
    replace: [
      ["#42723549378", "#{orderId}"],
      ["</payment review:424242>", "</payment review>"],
    ],
  },
  // Paid less than the total: the reply ...
  "flow/payment_recheck/paid_underpaid": { replace: [["042723549378", "{orderId}"]] },
  // ... and the owner's DM (the roturl callback sends the same DM)
  "flow/payment_recheck/paid_underpaid@client.notify_owner": {
    replace: [
      ["042723549378", "{orderId}"],
      ["100", "{amount}"],
      ["135", "{total}"],
    ],
  },
  // scan_all is not in ui.json: see TEMPLATES

  // ---- Ticket channel automation (DMs to the server owner) ----
  "server/rename_rate_limited": { replace: [] },
  "server/move_category/50001": { replace: [] },
  "server/move_category/50035": { replace: [] },
  "server/notifier/ticket_channel_forbidden": { replace: [] },
  "server/log_channel_forbidden/send_to_log_channel": { replace: [] },

  // ---- /balance show ----
  "flow/balance_show/self": {
    replace: [
      ["顧客的點數", "{buyer}的{balanceName}"],
      ["**70**", "**{balance}**"],
    ],
  },
  "flow/balance_show/other_as_customer": { replace: [] },

  // ---- /balance transfer: the buyer sends {amount} to another member ----
  "flow/balance_transfer_command/ok": {
    ...TRANSFER,
    override: RECIPIENT_THUMBNAIL,
    replace: [
      ["**30**", "**{amount}**"],
      ["50 點", "{balance} 點"],
      ["20 點", "{balanceMinus} 點"],
      ["點數轉帳確認", "{balanceName}轉帳確認"],
    ],
  },
  "flow/balance_transfer_cancel": { replace: [] },
  "flow/balance_transfer_confirm/50": {
    ...TRANSFER,
    override: RECIPIENT_THUMBNAIL,
    replace: [
      ["**30**", "**{amount}**"],
      [/^還錢$/, "{reason}"],
      ["點數轉帳成功", "{balanceName}轉帳成功"],
    ],
  },
  "flow/balance_transfer_confirm/50@client.send_to_log_channel": {
    ...TRANSFER,
    replace: [
      ["**30** 點數", "**{amount}** {balanceName}"],
      ["轉帳理由： 還錢", "轉帳理由： {reason}"],
    ],
  },
  // The sender's DM ...
  "flow/balance_transfer_confirm/50@client.send_dm_to_user#0": {
    ...TRANSFER,
    replace: [
      ["**30** 點給", "**{amount}** 點給"],
      [/^還錢$/, "{reason}"],
      [/^20$/, "{balanceMinus}"],
      [/^50$/, "{balance}"],
      ["點數轉帳通知", "{balanceName}轉帳通知"],
    ],
  },
  // ... and the receiver's
  "flow/balance_transfer_confirm/50@client.send_dm_to_user#1": {
    ...TRANSFER,
    replace: [
      ["**30** 點", "**{amount}** 點"],
      [/^30$/, "{recipientBalancePlus}"],
      [/^0$/, "{recipientBalance}"],
      ["點數轉帳通知", "{balanceName}轉帳通知"],
    ],
  },
  "flow/balance_transfer_confirm/10": { replace: [["轉移點數時", "轉移{balanceName}時"]] },
  "flow/balance_transfer_command/disabled": { replace: [] },
  "flow/balance_transfer_command/zero": { replace: [] },
  "flow/balance_transfer_command/insufficient": {
    replace: [
      ["您當前的點數不足", "您當前的{balanceName}不足"],
      ["50", "{balance}"],
    ],
  },
  "flow/balance_transfer_command/to_bot": { replace: [["把點數轉給", "把{balanceName}轉給"]] },
  "flow/balance_transfer_command/to_self": { replace: [["將點數轉移", "將{balanceName}轉移"]] },

  // ---- /balance history: the fixture buyer got 10, 20 and 30 from an admin (60 in all) ----
  "flow/balance_history_command/1": {
    replace: [
      ["顧客 的點數交易紀錄", "{buyer} 的{balanceName}交易紀錄"],
      [" 點數\n", " {balanceName}\n"],
      ["2026/05/01｜12:00:02", "2026/10/20｜21:15:40"],
      ["2026/05/01｜12:00:01", "2026/10/19｜14:02:11"],
      ["2026/05/01｜12:00:00", "2026/10/18｜10:30:05"],
    ],
  },
  "flow/balance_history_command/0": {
    replace: [
      ["顧客 的點數統計數據", "{buyer} 的{balanceName}統計數據"],
      ["__60__ 點數", "__60__ {balanceName}"],
      ["2026/05/01｜10 點", "2026/10/18｜10 點"],
      ["2026/05/01｜30 點", "2026/10/20｜30 點"],
    ],
  },
  "flow/balance_history_command/-1": {
    replace: [
      ["的點數排行榜", "的{balanceName}排行榜"],
      ["**顧客**", "**{buyer}**"],
    ],
  },
  // An admin looking at a member's history sees who added and why (another fixture: 16 … 12)
  "builder/balance_history/page=1/admin=True": {
    replace: [
      ["顧客 的點數交易紀錄", "{buyer} 的{balanceName}交易紀錄"],
      ["管理員 seed 增加了", "管理員 {admin} 增加了"],
      [" 點數\n", " {balanceName}\n"],
      ["2026/05/01｜12:00:06", "2026/10/21｜12:40:18"],
      ["2026/05/01｜12:00:05", "2026/10/20｜20:05:51"],
      ["2026/05/01｜12:00:04", "2026/10/19｜09:12:30"],
      ["2026/05/01｜12:00:03", "2026/10/18｜16:48:02"],
      ["2026/05/01｜12:00:02", "2026/10/17｜11:27:44"],
    ],
  },
  "builder/balance_history/page=9/admin=False": { replace: [] },
  // A member's own history over two pages (another fixture: 10 … 16 from an admin, 91 in all;
  // the merchant has 5). Page 1, page 2 after ▶️, the statistics and the leaderboard of the same
  // records. A middle page with 去尾頁 needs a third page, which no fixture has.
  "builder/balance_history/page=1/admin=False": {
    replace: [
      ["顧客 的點數交易紀錄", "{buyer} 的{balanceName}交易紀錄"],
      [" 點數\n", " {balanceName}\n"],
      ["2026/05/01｜12:00:06", "2026/10/21｜12:40:18"],
      ["2026/05/01｜12:00:05", "2026/10/20｜20:05:51"],
      ["2026/05/01｜12:00:04", "2026/10/19｜09:12:30"],
      ["2026/05/01｜12:00:03", "2026/10/18｜16:48:02"],
      ["2026/05/01｜12:00:02", "2026/10/17｜11:27:44"],
    ],
  },
  "builder/balance_history/page=2/admin=False": {
    replace: [
      ["顧客 的點數交易紀錄", "{buyer} 的{balanceName}交易紀錄"],
      [" 點數\n", " {balanceName}\n"],
      ["2026/05/01｜12:00:01", "2026/10/16｜18:30:15"],
      ["2026/05/01｜12:00:00", "2026/10/15｜10:12:40"],
    ],
  },
  "builder/balance_history/page=0/admin=False": {
    replace: [
      ["顧客 的點數統計數據", "{buyer} 的{balanceName}統計數據"],
      ["__91__ 點數", "__91__ {balanceName}"],
      ["2026/05/01｜10 點", "2026/10/15｜10 點"],
      ["2026/05/01｜16 點", "2026/10/21｜16 點"],
    ],
  },
  "builder/balance_history/page=-1/admin=False": {
    replace: [
      ["的點數排行榜", "的{balanceName}排行榜"],
      ["**顧客**", "**{buyer}**"],
      ["**管理員**", "**{admin}**"],
    ],
  },

  // ---- /balance add (an admin adds or removes; the member gets a DM) ----
  "flow/balance_add/40/50/None": {
    replace: [
      ["**40**", "**{amount}**"],
      ["個點數", "個{balanceName}"],
      ["**90**", "**{balancePlus}**"],
      EXECUTOR,
    ],
  },
  "flow/balance_add/40/50/活動": {
    replace: [
      ["**40**", "**{amount}**"],
      ["個點數", "個{balanceName}"],
      ["**90**", "**{balancePlus}**"],
      [/^活動$/, "{reason}"],
      EXECUTOR,
    ],
  },
  "flow/balance_add/40/50/None@client.send_dm_to_user": {
    replace: [
      ["**40**", "**{amount}**"],
      ["**90** 點數", "**{balancePlus}** {balanceName}"],
    ],
  },
  "flow/balance_add/-20/50/None": {
    replace: [
      ["**20**", "**{amount}**"],
      ["個點數", "個{balanceName}"],
      ["**30**", "**{balanceMinus}**"],
      EXECUTOR,
    ],
  },
  "flow/balance_add/-20/50/None@client.send_dm_to_user": {
    replace: [
      ["**20**", "**{amount}**"],
      ["**30** 點數", "**{balanceMinus}** {balanceName}"],
    ],
  },
  "flow/balance_add/-80/50/None": {
    replace: [
      ["**顧客** 的點數", "**{buyer}** 的{balanceName}"],
      ["50", "{balance}"],
    ],
  },
  "flow/balance_add/0/50/None": { replace: [] },

  // ---- /balance set ({amount} is the new balance) ----
  "flow/balance_set/80/50/None": {
    replace: [
      ["的點數\n", "的{balanceName}\n"],
      ["**80**", "**{amount}**"],
      ["50 點", "{balance} 點"],
      ["+30 點", "+{setIncrease} 點"],
      EXECUTOR,
    ],
  },
  "flow/balance_set/80/50/活動": {
    replace: [
      ["的點數\n", "的{balanceName}\n"],
      ["**80**", "**{amount}**"],
      ["50 點", "{balance} 點"],
      ["+30 點", "+{setIncrease} 點"],
      [/^活動$/, "{reason}"],
      EXECUTOR,
    ],
  },
  "flow/balance_set/80/50/None@client.send_dm_to_user": {
    replace: [
      ["**30**", "**{setIncrease}**"],
      ["**80** 點數", "**{amount}** {balanceName}"],
    ],
  },
  "flow/balance_set/20/50/None": {
    replace: [
      ["的點數\n", "的{balanceName}\n"],
      ["**20**", "**{amount}**"],
      ["50 點", "{balance} 點"],
      ["-30 點", "-{setDecrease} 點"],
      EXECUTOR,
    ],
  },
  "flow/balance_set/20/50/None@client.send_dm_to_user": {
    replace: [
      ["**30**", "**{setDecrease}**"],
      ["**20** 點數", "**{amount}** {balanceName}"],
    ],
  },
  "flow/balance_set/50/50/None": { replace: [["顧客 的點數已經是 50", "{buyer} 的{balanceName}已經是 {amount}"]] },
  "flow/balance_set/-1/50/None": { replace: [] },

  // ---- /top-up ----
  "flow/topup_command/ok": TOPUP_SELECT,
  "flow/topup_reselect": TOPUP_SELECT,
  // 「再次確認您的付款方式」 (the fixture chose 銀行轉帳; every method draws it the same way)
  "builder/topup/bank_transfer": {
    replace: [
      ["300 點數", "{amount} {balanceName}"],
      ["銀行轉帳", "{method_label:confirm}"],
      ["313", "{total}"],
      ["13", "{fee}"],
    ],
  },
  // 確認並獲取付款碼: the message becomes 「成功建立付款資訊」; the order embed follows (builder/payment_create)
  "flow/topup_confirm": { replace: [] },
  "flow/topup_command/zero_amount": { replace: [["點數的儲值金額", "{balanceName}的儲值金額"]] },
  "flow/topup_command/topup_disabled": { replace: [] },
  "flow/topup_command/balance_disabled": { replace: [] },
  "flow/topup_command/suspended": { replace: [] },
  // Paid: besides the payment complete notice, the buyer's DM and the log channel (fixture: 100, balance 300)
  "builder/topup_success@dm": {
    replace: [
      ["購買的 100 點", "購買的 {amount} 點"],
      ["**300** 點數", "**{balancePlus}** {balanceName}"],
      ["成功儲值 100 點數", "成功儲值 {amount} {balanceName}"],
    ],
  },
  "builder/topup_success@log": {
    replace: [
      ["**100** 點數！", "**{amount}** {balanceName}！"],
      ["**300**", "**{balancePlus}**"],
    ],
  },

  // ---- /dashboard and /settings ----
  "guide/dashboard/set_up": { replace: [] },
  "guide/dashboard/not_set_up_web": { replace: [] },
  "guide/settings/set_up": { replace: [] },
  "guide/settings/not_set_up": { replace: [] },
  // Welcome message when the bot joins a server without settings
  "guide/welcome/channel_web": { replace: [] },
  "guide/welcome/dm_web": { replace: [] },

  // ---- Checks every command shares (app/bot/checks.py) ----
  "server/checks/wrong_channel": { replace: [] },
  "server/checks/no_permission": { replace: [] },
  "server/checks/dm": { replace: [] },
  "server/checks/balance_not_enabled": { replace: [] },
  // The setup link is plain text here, so the server ID is shown
  "server/checks/not_in_service_web": { replace: [[/server=\d+/, "server={serverId}"]] },

  // ---- SmilePay turned a method off (-3003 on a later order): the owner's DM ----
  "server/notifier/payment_method_auto_disabled": { replace: [["全家 FamiPort 代碼繳費", "{method_label:create}"]] },

  // ---- /auto-publish ----
  "server/auto_publish/add_ok": { replace: [] },
  "server/auto_publish/remove_ok": { replace: [] },
  "server/auto_publish/not_news": { replace: [] },
  "server/auto_publish/missing_permissions": { replace: [] },
  "server/auto_publish/add_failed": { replace: [] },
  "server/auto_publish/remove_failed": { replace: [] },

  // ---- Dynamic voice channel names (the fixture's template 「訂單 %all_orders%」 is kept) ----
  "server/direct_rename/ok": { replace: [] },
  "server/direct_rename/cooldown": { replace: [] },
  "server/direct_rename/forbidden": { replace: [] },
  "server/direct_rename/not_found": { replace: [] },
  "server/direct_rename/db_failed": { replace: [] },
  "server/direct_rename/http_error": { replace: [] },
  "server/dynamic_vc_rename/delete_ok": { replace: [] },
  "server/dynamic_vc_rename/delete_failed": { replace: [] },
  "server/dynamic_vc_rename/channel_not_configured": { replace: [] },
  "server/dynamic_vc_rename/missing_permissions": { replace: [] },
  // The channel was deleted: the owner's DM (forbidden sends the same text)
  "server/dynamic_vc_loop/not_found": { replace: [["123456789012345678", "{channelId:voice}"]] },

  // ---- Auto reply (a DM to the bot, or a mention in a server) ----
  "server/auto_reply/dm_trigger": { replace: [] },
  "server/auto_reply/server_mention": { replace: [] },
};

/**
 * Messages ui.json has no snapshot of, from the i18n functions that write them (filled with
 * these values; scripts/sync-bot-ui-lib.mjs extractTemplate). /payment recheck scan_all edits
 * its first followup as it goes, then sends the summary (cogs/payment.py payment_recheck).
 */
export const TEMPLATES = {
  // 12 unpaid orders: eta = round(12 / 60) = 0 minutes
  "text/payment/recheck_all_started": {
    file: "app/i18n/payment.py",
    fn: "recheck_all_started",
    via: "followup.send",
    values: { total: 12, eta_minutes: 0 },
  },
  "text/payment/recheck_all_progress": {
    file: "app/i18n/payment.py",
    fn: "recheck_all_progress",
    via: "message.edit",
    values: { done: 5, total: 12, eta_minutes: 0 },
  },
  // The last edit, once the twelfth order is checked (i == total), just before the summary
  "text/payment/recheck_all_progress/12": {
    file: "app/i18n/payment.py",
    fn: "recheck_all_progress",
    via: "message.edit",
    values: { done: 12, total: 12, eta_minutes: 0 },
  },
  "text/payment/recheck_all_summary": {
    file: "app/i18n/payment.py",
    fn: "recheck_all_summary",
    via: "followup.send",
    values: { paid: 3, pending: 9 },
  },
};
