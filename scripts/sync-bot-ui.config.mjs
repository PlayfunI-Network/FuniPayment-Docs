// Which ui.json keys the demos use, and how their test values become demo tokens.
//
// Each key lists its own replacements [from, to], applied only to that key's strings (an
// all-digit `from` only matches a whole number, so "35" never touches "135"). Every rule must
// match at least once, so a changed bot text fails the sync instead of leaving a test value.
// `optionFees` turns a select option's 「（+N元）」 into 「（+{fee:<method>}元）」.
// `method` marks a screen that exists for one payment method only; the demo's scenario must use it.
// Tokens are filled by lib/scenario.ts (scenarioTokens).

/** Replaced in every key: images (never linked from outside) and the test server's name. */
export const URL_RULES = [
  ["https://i.imgur.com/ma5Gxaq.png", "/brand/playfuni-icon.png"],
  [/https:\/\/cdn\.test\/icon\/\d+\.png/, "/demo/avatars/shop.png"],
  ["https://cdn.test/avatar/333333333333333333.png", "/demo/avatars/buyer.png"],
  ["https://cdn.test/avatar/444444444444444444.png", "/demo/avatars/admin.png"],
  ["attachment://barcodes.png", "/demo/barcodes.png"],
];

export const TEXT_RULES = [["測試商店", "{shop}"]];

/** The bot's test users (tests/conftest.py USER_ID / OTHER_USER_ID) as demo people. */
export const MENTIONS = {
  "333333333333333333": "buyer",
  "444444444444444444": "admin",
};

export const KEYS = {
  // /fp: choose a payment method
  "flow/fp_command/ok": {
    replace: [
      ["100", "{amount}"],
      ["<t:TS:R>", "<t:{expiresIn}:R>"],
      ["點數（", "{balanceName}（"],
    ],
    optionFees: true,
  },
  // /fp: after choosing, the buyer information step (edit_message)
  "flow/fp_method_confirm": { replace: [] },
  "builder/consumer_info/filled=False/cancel_first=False": { replace: [] },
  "builder/consumer_info/filled=True/cancel_first=False": {
    replace: [
      ["王小明", "{buyerName}"],
      ["0912345678", "{buyerPhone}"],
      ["a@b.c", "{buyerEmail}"],
    ],
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
  // Payment complete notice (any SmilePay method; the fixture paid with 全家)
  "builder/payment_complete": {
    replace: [
      ["042723549378", "{orderId}"],
      ["100", "{amount}"],
      ["135", "{total}"],
      ["35", "{fee}"],
      ["2026-05-01 20:03:05", "{paidAt}"],
      ["全家超商代碼", "{method_label:complete}"],
    ],
  },
  // Welcome message when the bot joins a server without settings
  "guide/welcome/channel_web": { replace: [] },
  "guide/welcome/dm_web": { replace: [] },
};
