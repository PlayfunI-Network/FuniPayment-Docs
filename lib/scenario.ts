// A demo "scenario" (shop, people, amount, method, order id) and the values it gives every
// {token} in content/bot-ui.generated.ts. One scenario per story keeps the amount, fee and order
// id the same across every screen of that story (/fp -> order -> payment complete).
import { BOT_DEFAULTS, BOT_METHOD_LABELS, BOT_UI } from "@/content/bot-ui.generated";
import type { MessageEntry } from "./bot-ui-types";
import { calculateFee, METHODS, type Method } from "./fees";

export type Scenario = {
  shop: string;
  buyer: string;
  admin: string;
  amount: number;
  method: Method;
  orderId: string;
  /** The server's balance name; the bot's default (「商城點數」) when left out. */
  balanceName?: string;
};

/** The demo people and their avatars (the files the generated snapshots point to). */
export const DEMO_PEOPLE = {
  shop: { name: "星光遊戲社", avatar: "/demo/avatars/shop.png" },
  buyer: { name: "顧客", avatar: "/demo/avatars/buyer.png" },
  admin: { name: "商家", avatar: "/demo/avatars/admin.png" },
} as const;

/** The buyer information the demo buyer types into the form (synthetic, as on the site). */
export const DEMO_BUYER_INFO = { name: "王○○", phone: "0912345678", email: "customer@example.com" } as const;

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
  };
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
