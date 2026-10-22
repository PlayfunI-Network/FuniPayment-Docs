// The demo stories every page's demo draws from. A phase 2 demo reuses one of these when its
// story fits (the same shop, people, amount and order id across pages), and adds its own only
// when it needs another amount or method. SNAPSHOT_SCENARIOS says which story each bot screen
// in content/bot-ui.generated.ts is drawn with on the dev page (and is checked to fill).
import { DEMO_PEOPLE, type Scenario, type SnapshotId } from "@/lib/scenario";

const PEOPLE = { shop: DEMO_PEOPLE.shop.name, buyer: DEMO_PEOPLE.buyer.name, admin: DEMO_PEOPLE.admin.name };

export const SCENARIOS = {
  /**
   * 星光遊戲社 bills the customer 500 with /fp; the customer pays at a store with the barcode
   * (+25 fee, total 525: the only total public/demo/barcodes.png encodes). The order id has the
   * 12 digits of a SmilePay 付款編號.
   */
  fpStoreBarcode: {
    ...PEOPLE,
    amount: 500,
    method: "store_barcode",
    orderId: "241021387465",
  },
  /** /payment create for 1200 by bank transfer (+13, total 1213), with or without invoice fields. */
  payBankTransfer: { ...PEOPLE, amount: 1200, method: "bank_transfer", orderId: "241021550918" },
  /** 800 at 7-11 ibon (+30, total 830). */
  payIbon: { ...PEOPLE, amount: 800, method: "ibon", orderId: "241021602374" },
  /** 1500 at FamilyMart (+35, total 1535); also the method a refusal or -3003 names. */
  payFamiport: { ...PEOPLE, amount: 1500, method: "famiport", orderId: "241021671530" },
  /** 300 at Hi-Life (+30, total 330). */
  payHilife: { ...PEOPLE, amount: 300, method: "hilife", orderId: "241021718246" },
  /** /fp 500 paid with 1200 points (700 left). */
  payWithBalance: { ...PEOPLE, amount: 500, method: "balance", orderId: "241021794102", balance: 1200 },
  /** /fp 500 with only 200 points: 「餘額不足」. */
  balanceShort: { ...PEOPLE, amount: 500, method: "balance", orderId: "241021794102", balance: 200 },
  /** /top-up 300 points at 7-11 ibon (+30, total 330); 200 before, 500 after. */
  topUp: { ...PEOPLE, amount: 300, method: "ibon", orderId: "241021845567", balance: 200 },
  /** The customer sends 150 of 700 points to another member, who had 80 (230 after). */
  transfer: {
    ...PEOPLE,
    amount: 150,
    method: "balance",
    orderId: "241021387465",
    balance: 700,
    recipient: DEMO_PEOPLE.member.name,
    recipientBalance: 80,
    reason: "團購分攤",
  },
  /** A transfer of 150 with only 50 points. */
  transferShort: { ...PEOPLE, amount: 150, method: "balance", orderId: "241021387465", balance: 50 },
  /** The merchant adds 200 points (700 → 900) for an event. */
  balanceAdd: { ...PEOPLE, amount: 200, method: "balance", orderId: "241021387465", balance: 700, reason: "活動獎勵" },
  /** The merchant removes 100 points (700 → 600). */
  balanceRemove: { ...PEOPLE, amount: 100, method: "balance", orderId: "241021387465", balance: 700 },
  /** Removing 1000 points when the customer has 700: 「不足」. */
  balanceRemoveShort: { ...PEOPLE, amount: 1000, method: "balance", orderId: "241021387465", balance: 700 },
  /** /balance set to 1000 (from 700: +300), for an event. */
  balanceSetUp: { ...PEOPLE, amount: 1000, method: "balance", orderId: "241021387465", balance: 700, reason: "活動獎勵" },
  /** /balance set to 500 (from 700: -200). */
  balanceSetDown: { ...PEOPLE, amount: 500, method: "balance", orderId: "241021387465", balance: 700 },
  /** /balance set to what the customer already has. */
  balanceSetSame: { ...PEOPLE, amount: 700, method: "balance", orderId: "241021387465", balance: 700 },
  /**
   * The customer's 60 points: /balance show, and /balance history (whose screens are fixed: 10,
   * 20 and 30 from an admin, 60 in all).
   */
  balanceHistory: { ...PEOPLE, amount: 60, method: "balance", orderId: "241021387465", balance: 60 },
  /** SmilePay refuses a 25000 order at FamilyMart: -3004 超過付款模式設定金額. */
  smilepayError: { ...PEOPLE, amount: 25000, method: "famiport", orderId: "241021903311", errorCode: "-3004" },
} as const satisfies Record<string, Scenario>;

export type ScenarioName = keyof typeof SCENARIOS;

/**
 * The story each bot screen is drawn with on the dev page (app/dev/discord); lib/scenario.test.ts
 * fills every one. Screens without values of their own (refusals, fixed texts) use the story of
 * the command they belong to.
 */
export const SNAPSHOT_SCENARIOS: Record<SnapshotId, ScenarioName> = {
  // /fp
  "flow/fp_command/ok": "fpStoreBarcode",
  "flow/fp_reselect": "fpStoreBarcode",
  "builder/fp/famiport/0/designated=False": "fpStoreBarcode",
  "flow/fp_method_confirm": "fpStoreBarcode",
  "flow/fp_command/zero_amount": "fpStoreBarcode",
  "flow/fp_command/suspended": "fpStoreBarcode",
  "flow/fp_check_user/stranger": "fpStoreBarcode",
  "builder/fp/balance/500/designated=False": "payWithBalance",
  "builder/fp/balance/50/designated=False": "balanceShort",
  "flow/fp_balance_confirm/500": "payWithBalance",
  "flow/fp_balance_confirm/500@Client.send_dm_to_user": "payWithBalance",
  "flow/fp_balance_confirm/0": "payWithBalance",
  // Buyer information
  "builder/consumer_info/filled=False/cancel_first=False": "fpStoreBarcode",
  "builder/consumer_info/filled=True/cancel_first=False": "fpStoreBarcode",
  "builder/consumer_info/filled=True/cancel_first=True": "payBankTransfer",
  "flow/consumer_info_permission/stranger": "fpStoreBarcode",
  // /payment create
  "flow/payment_create_command/ok": "payBankTransfer",
  "flow/payment_create_command/zero_amount": "payBankTransfer",
  "flow/payment_create_command/designated_not_admin": "payBankTransfer",
  "flow/payment_create_command/role_not_allowed": "payBankTransfer",
  "flow/payment_create_command/suspended": "payBankTransfer",
  "flow/payment_create_command/method_disabled": "payFamiport",
  "builder/payment_create/bank_transfer/invoice=False": "payBankTransfer",
  "builder/payment_create/bank_transfer/invoice=True": "payBankTransfer",
  "builder/payment_create/store_barcode/invoice=False": "fpStoreBarcode",
  "builder/payment_create/store_barcode/invoice=True": "fpStoreBarcode",
  "builder/payment_create/ibon/invoice=False": "payIbon",
  "builder/payment_create/ibon/invoice=True": "payIbon",
  "builder/payment_create/famiport/invoice=False": "payFamiport",
  "builder/payment_create/famiport/invoice=True": "payFamiport",
  "builder/payment_create/hilife/invoice=False": "payHilife",
  "builder/payment_create/hilife/invoice=True": "payHilife",
  "flow/do_payment_create/db_failure": "payFamiport",
  "flow/do_payment_create/error-1": "payFamiport",
  "flow/do_payment_create/error-2001": "smilepayError",
  "flow/do_payment_create/error-3003": "payFamiport",
  "flow/do_payment_create/error-3003@client.notify_owner": "payFamiport",
  "source/payment_create_cancelled": "payBankTransfer",
  "source/payment_create_confirming": "payBankTransfer",
  // Paid, expired
  "builder/payment_complete": "fpStoreBarcode",
  "source/expired_order": "fpStoreBarcode",
  // /payment review, history, recheck
  "builder/payment_review/pending": "fpStoreBarcode",
  "builder/payment_review/complete": "fpStoreBarcode",
  "builder/payment_review/expired": "fpStoreBarcode",
  "flow/payment_review/no_id_no_payments": "fpStoreBarcode",
  "flow/payment_review/not_found": "fpStoreBarcode",
  "flow/payment_review/other_as_customer": "fpStoreBarcode",
  "flow/payment_history_command/0": "fpStoreBarcode",
  "flow/payment_history_command/1": "fpStoreBarcode",
  "builder/payment_history/page=-1": "fpStoreBarcode",
  "flow/payment_recheck/paid": "fpStoreBarcode",
  "flow/payment_recheck/not_paid": "fpStoreBarcode",
  "flow/payment_recheck/expired": "fpStoreBarcode",
  "flow/payment_recheck/not_found": "fpStoreBarcode",
  "flow/payment_recheck/no_id_no_pending": "fpStoreBarcode",
  "flow/payment_recheck/already_complete": "fpStoreBarcode",
  "flow/payment_recheck/paid_underpaid": "fpStoreBarcode",
  "flow/payment_recheck/paid_underpaid@client.notify_owner": "fpStoreBarcode",
  "text/payment/recheck_all_started": "fpStoreBarcode",
  "text/payment/recheck_all_progress": "fpStoreBarcode",
  "text/payment/recheck_all_summary": "fpStoreBarcode",
  // Ticket channel automation
  "server/rename_rate_limited": "fpStoreBarcode",
  "server/move_category/50001": "fpStoreBarcode",
  "server/move_category/50035": "fpStoreBarcode",
  "server/notifier/ticket_channel_forbidden": "fpStoreBarcode",
  "server/log_channel_forbidden/send_to_log_channel": "fpStoreBarcode",
  // /balance
  "flow/balance_show/self": "balanceHistory",
  "flow/balance_show/other_as_customer": "balanceHistory",
  "flow/balance_transfer_command/ok": "transfer",
  "flow/balance_transfer_cancel": "transfer",
  "flow/balance_transfer_confirm/50": "transfer",
  "flow/balance_transfer_confirm/50@client.send_to_log_channel": "transfer",
  "flow/balance_transfer_confirm/50@client.send_dm_to_user#0": "transfer",
  "flow/balance_transfer_confirm/50@client.send_dm_to_user#1": "transfer",
  "flow/balance_transfer_confirm/10": "transfer",
  "flow/balance_transfer_command/disabled": "transfer",
  "flow/balance_transfer_command/zero": "transfer",
  "flow/balance_transfer_command/insufficient": "transferShort",
  "flow/balance_transfer_command/to_bot": "transfer",
  "flow/balance_transfer_command/to_self": "transfer",
  "flow/balance_history_command/1": "balanceHistory",
  "flow/balance_history_command/0": "balanceHistory",
  "flow/balance_history_command/-1": "balanceHistory",
  "builder/balance_history/page=1/admin=True": "balanceHistory",
  "builder/balance_history/page=9/admin=False": "balanceHistory",
  "flow/balance_add/40/50/None": "balanceAdd",
  "flow/balance_add/40/50/活動": "balanceAdd",
  "flow/balance_add/40/50/None@client.send_dm_to_user": "balanceAdd",
  "flow/balance_add/-20/50/None": "balanceRemove",
  "flow/balance_add/-20/50/None@client.send_dm_to_user": "balanceRemove",
  "flow/balance_add/-80/50/None": "balanceRemoveShort",
  "flow/balance_add/0/50/None": "balanceAdd",
  "flow/balance_set/80/50/None": "balanceSetUp",
  "flow/balance_set/80/50/活動": "balanceSetUp",
  "flow/balance_set/80/50/None@client.send_dm_to_user": "balanceSetUp",
  "flow/balance_set/20/50/None": "balanceSetDown",
  "flow/balance_set/20/50/None@client.send_dm_to_user": "balanceSetDown",
  "flow/balance_set/50/50/None": "balanceSetSame",
  "flow/balance_set/-1/50/None": "balanceSetDown",
  // /top-up
  "flow/topup_command/ok": "topUp",
  "flow/topup_reselect": "topUp",
  "builder/topup/bank_transfer": "topUp",
  "flow/topup_confirm": "topUp",
  "flow/topup_command/zero_amount": "topUp",
  "flow/topup_command/topup_disabled": "topUp",
  "flow/topup_command/balance_disabled": "topUp",
  "flow/topup_command/suspended": "topUp",
  "builder/topup_success@dm": "topUp",
  "builder/topup_success@log": "topUp",
  // /dashboard, /settings, welcome
  "guide/dashboard/set_up": "fpStoreBarcode",
  "guide/dashboard/not_set_up_web": "fpStoreBarcode",
  "guide/settings/set_up": "fpStoreBarcode",
  "guide/settings/not_set_up": "fpStoreBarcode",
  "guide/welcome/channel_web": "fpStoreBarcode",
  "guide/welcome/dm_web": "fpStoreBarcode",
  // Shared checks, SmilePay
  "server/checks/wrong_channel": "fpStoreBarcode",
  "server/checks/no_permission": "fpStoreBarcode",
  "server/checks/dm": "fpStoreBarcode",
  "server/checks/balance_not_enabled": "fpStoreBarcode",
  "server/checks/not_in_service_web": "fpStoreBarcode",
  "server/notifier/payment_method_auto_disabled": "payFamiport",
  // /auto-publish, dynamic voice channel names, auto reply
  "server/auto_publish/add_ok": "fpStoreBarcode",
  "server/auto_publish/remove_ok": "fpStoreBarcode",
  "server/auto_publish/not_news": "fpStoreBarcode",
  "server/auto_publish/missing_permissions": "fpStoreBarcode",
  "server/auto_publish/add_failed": "fpStoreBarcode",
  "server/auto_publish/remove_failed": "fpStoreBarcode",
  "server/direct_rename/ok": "fpStoreBarcode",
  "server/direct_rename/cooldown": "fpStoreBarcode",
  "server/direct_rename/forbidden": "fpStoreBarcode",
  "server/direct_rename/not_found": "fpStoreBarcode",
  "server/direct_rename/db_failed": "fpStoreBarcode",
  "server/direct_rename/http_error": "fpStoreBarcode",
  "server/dynamic_vc_rename/delete_ok": "fpStoreBarcode",
  "server/dynamic_vc_rename/delete_failed": "fpStoreBarcode",
  "server/dynamic_vc_rename/channel_not_configured": "fpStoreBarcode",
  "server/dynamic_vc_rename/missing_permissions": "fpStoreBarcode",
  "server/dynamic_vc_loop/not_found": "fpStoreBarcode",
  "server/auto_reply/dm_trigger": "fpStoreBarcode",
  "server/auto_reply/server_mention": "fpStoreBarcode",
};
