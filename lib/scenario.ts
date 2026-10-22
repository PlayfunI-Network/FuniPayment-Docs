// A demo "scenario" (shop, people, amount, method, order id) and the values it gives every
// {token} in content/bot-ui.generated.ts. One scenario per story keeps the amount, fee and order
// id the same across every screen of that story (/fp -> order -> payment complete).
import { BOT_DEFAULTS, BOT_METHOD_LABELS, BOT_UI, SMILEPAY_ERRORS } from "@/content/bot-ui.generated";
import type { MessageEntry } from "./bot-ui-types";
import { calculateFee, METHODS, type Method } from "./fees";

/**
 * One story. `amount` is the story's main number: the order amount (without the fee), the
 * points paid, transferred, added, removed or bought, or the new balance of /balance set.
 * The optional fields only matter to the screens that show them; a screen whose token needs a
 * field the scenario leaves out throws instead of drawing an empty value.
 */
export type Scenario = {
  shop: string;
  buyer: string;
  admin: string;
  amount: number;
  method: Method;
  orderId: string;
  /** The server's balance name; the bot's default (「商城點數」) when left out. */
  balanceName?: string;
  /** The buyer's balance before the story ({balance}, {balancePlus}, {balanceMinus}, {setIncrease} / {setDecrease}). */
  balance?: number;
  /** The member receiving a /balance transfer, and their balance before it. */
  recipient?: string;
  recipientBalance?: number;
  /** The reason typed with /balance add, set or transfer. */
  reason?: string;
  /** A SmilePay status code (a key of SMILEPAY_ERRORS, e.g. "-3004") for a failed order. */
  errorCode?: string;
};

/** The demo people and their avatars (the files the generated snapshots point to). */
export const DEMO_PEOPLE = {
  shop: { name: "星光遊戲社", avatar: "/demo/avatars/shop.png" },
  buyer: { name: "顧客", avatar: "/demo/avatars/buyer.png" },
  admin: { name: "商家", avatar: "/demo/avatars/admin.png" },
  /** Another member of the server (the /balance transfer receiver). */
  member: { name: "會員", avatar: "/demo/avatars/member.png" },
} as const;

/** The buyer information the demo buyer types into the form (synthetic, as on the site). */
export const DEMO_BUYER_INFO = { name: "王○○", phone: "0912345678", email: "customer@example.com" } as const;

/** The invoice fields /payment create can take (synthetic). */
export const DEMO_INVOICE = { title: "範例科技有限公司", number: "24681357" } as const;

/**
 * The demo server's channels, as `<#{channel:<name>}>` and `{channelId:<name>}` in the texts
 * (sync-bot-ui.config.mjs CHANNELS). Illustrative names; the IDs are made up.
 */
export const DEMO_CHANNELS = {
  command: { name: "指令區", id: "1297385046129384751" },
  ticket: { name: "ticket-0042", id: "1297385046129384752" },
  log: { name: "付款紀錄", id: "1297385046129384753" },
  voice: { name: "訂單 128", id: "1297385046129384754" },
  category: { name: "待付款", id: "1297385046129384755" },
} as const;

/** The demo server's ID (the setup link in a plain-text reply shows it). */
export const DEMO_SERVER_ID = "1297384615023847936";

/** The first letters of the payment code SmilePay gives per store (illustrative). */
const PAY_CODE_PREFIX: Partial<Record<Method, string>> = { ibon: "IB", famiport: "FM", hilife: "HL" };

/** The default story: 星光遊戲社 bills the customer 500 and the customer pays at a store. */
export const DEMO_SCENARIO: Scenario = {
  shop: DEMO_PEOPLE.shop.name,
  buyer: DEMO_PEOPLE.buyer.name,
  admin: DEMO_PEOPLE.admin.name,
  amount: 500,
  method: "store_barcode",
  orderId: "241021387465",
};

/** A fixed "now" so server and client render the same HTML. */
export const DEMO_NOW = new Date(2026, 9, 21, 15, 24, 8);

/**
 * The store barcode images in public/demo, by the order total their third barcode encodes
 * (drawn like app/bot/barcode.py). A store-barcode scenario with another total needs its own image.
 */
export const BARCODE_IMAGES: Readonly<Record<string, string>> = { "525": "/demo/barcodes.png" };

/** How zh-TW Discord shows /fp's `<t:now+1 day:R>` (views/fp.py: expiry = now + 1 day). */
const SELECT_EXPIRES_IN = "1 天內";
/** The demo order's payment deadline, in days after it is created (SmilePay sets the real one). */
const DEADLINE_DAYS = 3;

const pad = (n: number) => String(n).padStart(2, "0");

/** common.DATETIME_FORMAT 「%Y/%m/%d｜%H:%M:%S」. */
export function botDateTime(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}｜${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** str(datetime) without microseconds, as the payment complete notice shows 付款時間. */
function pythonDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const CLOCK = new Intl.DateTimeFormat("zh-TW", { hour: "numeric", minute: "2-digit", hour12: true });

/** Discord's timestamp for a moment today, e.g. 「今天 下午3:24」 (messages and embed footers). */
export function discordTime(d: Date): string {
  return `今天 ${CLOCK.format(d)}`;
}

/** Every token's value for this scenario at `now`. */
export function scenarioTokens(s: Scenario, now: Date): Record<string, string> {
  const fee = calculateFee(s.method, s.amount);
  const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + DEADLINE_DAYS, 23, 59, 59);
  const tokens: Record<string, string> = {
    shop: s.shop,
    buyer: s.buyer,
    admin: s.admin,
    amount: String(s.amount),
    fee: String(fee),
    total: String(s.amount + fee),
    orderId: s.orderId,
    deadline: botDateTime(deadline),
    paidAt: pythonDateTime(now),
    expiresIn: SELECT_EXPIRES_IN,
    buyerName: DEMO_BUYER_INFO.name,
    buyerPhone: DEMO_BUYER_INFO.phone,
    buyerEmail: DEMO_BUYER_INFO.email,
    balanceName: s.balanceName ?? BOT_DEFAULTS.balanceNickname,
    createdAt: botDateTime(now),
    paidAtBot: botDateTime(now),
    invoiceTitle: DEMO_INVOICE.title,
    invoiceNumber: DEMO_INVOICE.number,
    serverId: DEMO_SERVER_ID,
  };
  for (const [name, channel] of Object.entries(DEMO_CHANNELS)) {
    tokens[`channel:${name}`] = channel.name;
    tokens[`channelId:${name}`] = channel.id;
  }
  // What the SmilePay order shows: a virtual account for a bank transfer, a code for a store.
  if (s.method === "bank_transfer") tokens.bankAccount = `9100${s.orderId.slice(3)}`;
  const prefix = PAY_CODE_PREFIX[s.method];
  if (prefix) tokens.payCode = `${prefix}${s.orderId.slice(2)}`;
  if (s.balance != null) {
    tokens.balance = String(s.balance);
    tokens.balancePlus = String(s.balance + s.amount);
    if (s.amount <= s.balance) tokens.balanceMinus = String(s.balance - s.amount);
    // /balance set: amount is the new balance
    if (s.amount > s.balance) tokens.setIncrease = String(s.amount - s.balance);
    if (s.amount < s.balance) tokens.setDecrease = String(s.balance - s.amount);
  }
  if (s.recipient != null) tokens.recipient = s.recipient;
  if (s.recipientBalance != null) {
    tokens.recipientBalance = String(s.recipientBalance);
    tokens.recipientBalancePlus = String(s.recipientBalance + s.amount);
  }
  if (s.reason != null) tokens.reason = s.reason;
  if (s.errorCode != null) {
    const description = (SMILEPAY_ERRORS as Record<string, string>)[s.errorCode];
    if (!description) throw new Error(`SMILEPAY_ERRORS 沒有 ${s.errorCode}`);
    tokens.errorDescription = description;
  }
  const barcode = BARCODE_IMAGES[tokens.total];
  if (barcode) tokens.barcodeImage = barcode;
  // Every method's fee for the same amount (the /fp menu lists them all).
  for (const m of METHODS) tokens[`fee:${m}`] = String(calculateFee(m, s.amount));
  // The method's name as each screen writes it; a screen without the method has no token.
  for (const [table, labels] of Object.entries(BOT_METHOD_LABELS)) {
    const label = (labels as Partial<Record<Method, string>>)[s.method];
    if (label) tokens[`method_label:${table}`] = label;
  }
  return tokens;
}

const TOKEN = /\{([A-Za-z_]+(?::[A-Za-z_]+)?)\}/g;

/** Replace every {token}; a token the scenario does not define is an error, never left empty. */
export function fillTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(TOKEN, (_, name: string) => {
    if (!(name in tokens)) throw new Error(`未知的 token {${name}}（文字：${text}）`);
    return tokens[name];
  });
}

/** The ids in BOT_UI that are messages (not the modal or the defaults). */
export type SnapshotId = {
  [K in keyof typeof BOT_UI]: (typeof BOT_UI)[K] extends { kind: "message" } ? K : never;
}[keyof typeof BOT_UI];

function fillDeep<T>(value: T, tokens: Record<string, string>): T {
  if (typeof value === "string") return fillTokens(value, tokens) as T;
  if (Array.isArray(value)) return value.map((v) => fillDeep(v, tokens)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillDeep(v, tokens)])) as T;
  }
  return value;
}

/** One message from BOT_UI with every token filled for `scenario`. */
export function fillSnapshot(id: SnapshotId, scenario: Scenario, now: Date = DEMO_NOW): MessageEntry {
  const entry: MessageEntry = BOT_UI[id];
  if (entry.method && entry.method !== scenario.method) {
    throw new Error(`${id} 只適用付款方式 ${entry.method}，情境是 ${scenario.method}`);
  }
  const tokens = scenarioTokens(scenario, now);
  if (!tokens.barcodeImage && JSON.stringify(entry).includes("{barcodeImage}")) {
    throw new Error(
      `${id} 的條碼圖只有總額 ${Object.keys(BARCODE_IMAGES).join("、")} 元的版本，情境總額是 ${tokens.total} 元；` +
        "請另外產生這個總額的條碼圖並加進 BARCODE_IMAGES",
    );
  }
  return fillDeep(entry, tokens);
}
