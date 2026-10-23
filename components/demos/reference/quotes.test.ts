// Every 「…」 on every docs page is text the bot or the
// dashboard shows (WRITING.md: quote it word for word). A quote passes when it is the generated
// file's text (BOT_UI, COMMANDS, …) or a string in the bot's app/i18n with the {tokens} filled
// in, a whole line of one, or a piece of one between tokens; or text in the dashboard's web/src.
// Needs the bot repo: FUNIPAY_BOT_DIR, default ../../PycharmProjects/FuniPayment (like sync:bot).
import fs from "node:fs";
import path from "node:path";
import * as generated from "@/content/bot-ui.generated";
import { BOT_DEFAULTS, BOT_METHOD_LABELS, BOT_UI } from "@/content/bot-ui.generated";
import { DEFAULT_FEES, type SmilePayMethod } from "@/lib/fees";

const root = path.resolve(__dirname, "../../..");
const botDir = path.resolve(root, process.env.FUNIPAY_BOT_DIR ?? "../../PycharmProjects/FuniPayment");
const DOCS = path.join(root, "content/docs");
const PAGES = fs
  .readdirSync(DOCS, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.split(path.sep).join("/"))
  .sort();

/** Discord's own words (permission names, its 發佈 button), not the bot's or the dashboard's. */
const DISCORD = new Set(["管理頻道", "管理伺服器", "管理訊息", "發佈"]);

/** The outermost 「…」 quotes of a text; a quote may hold another one. */
function quotes(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "「" && depth++ === 0) start = i + 1;
    else if (text[i] === "」" && depth > 0 && --depth === 0) out.push(text.slice(start, i));
  }
  return out;
}

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

function pyStrings(dir: string): string[] {
  const out: string[] = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".py"))) {
    // Python joins adjacent literals: ("a "\n f"b") is one string.
    const src = fs.readFileSync(path.join(dir, f), "utf8").replace(/"\s*\n\s*[fr]?"/g, "");
    for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) out.push(m[1].replace(/\\n/g, "\n"));
  }
  return out;
}

function files(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files(p, out);
    else if (/\.tsx?$/.test(e.name) && !e.name.includes(".test.")) out.push(fs.readFileSync(p, "utf8"));
  }
  return out;
}

const TOKEN = /\{[^{}]*\}/g;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const anyOf = (texts: string[]) => `(?:${texts.map(escape).join("|")})`;
/**
 * One source line: the quote is the whole line with its tokens filled, a piece between tokens,
 * or a run of the filled line that crosses tokens (a sentence quoted from the middle of a DM).
 */
function matcher(line: string): (q: string) => boolean {
  const pieces = line.split(TOKEN);
  const whole = new RegExp(`^${pieces.map(escape).join(".+?")}$`, "s");
  // A line of tokens and a bracket or two would match anything.
  const fixed = pieces.join("").replace(/\s/g, "").length >= 3;
  // Runs from the end of piece i to the start of piece j (j > i), either end possibly empty (the
  // quote starts or stops at a filled token), with at least 3 fixed characters in the run.
  const runs: { re: RegExp; middle: string }[] = [];
  for (let i = 0; i < pieces.length; i++)
    for (let j = i + 1; j < pieces.length; j++) {
      const tails = [...pieces[i]].map((_, k) => pieces[i].slice(k)).concat("");
      const heads = [...pieces[j]].map((_, k) => pieces[j].slice(0, pieces[j].length - k)).concat("");
      const middle = pieces.slice(i + 1, j);
      const re = new RegExp(`^(${anyOf(tails)})${middle.map((m) => `.+?${escape(m)}`).join("")}.+?(${anyOf(heads)})$`, "s");
      runs.push({ re, middle: middle.join("") });
    }
  const fixedChars = (s: string) => s.replace(/\s/g, "").length;
  const inRun = (q: string) =>
    runs.some(({ re, middle }) => {
      const m = re.exec(q);
      return m !== null && fixedChars(m[1] + middle + m[2]) >= 3;
    });
  return (q) => (fixed && whole.test(q)) || pieces.some((p) => p.includes(q)) || inRun(q);
}

/** How a line looks on Discord: no bold or underline marks, no quote bar, <#channel> as #name. */
const rendered = (s: string) =>
  s
    .replace(/\*\*|__/g, "")
    .replace(/^> /gm, "")
    .replace(/<#(\{[^{}]*\})>/g, "#$1");

/**
 * The dashboard's text lines: JSX text between tags with {expressions} as tokens, and string and
 * template literals with ${expressions} as tokens.
 */
function webLines(src: string): string[] {
  const out: string[] = [];
  const cjk = /[一-鿿]/;
  for (const line of src.split("\n").filter((l) => cjk.test(l))) {
    const tag = /<\/?[A-Za-z][^<>]*>/g;
    out.push(line.replace(tag, "").trim(), ...line.split(tag).filter((t) => cjk.test(t)).map((t) => t.trim()));
    for (const m of line.matchAll(/`([^`]*)`|"([^"]*)"/g)) {
      const text = (m[1] ?? m[2]).replace(/\$\{/g, "{");
      if (cjk.test(text)) out.push(text);
    }
  }
  return out;
}

/** A quote as the page shows it: {"<>"} in MDX is <>, \* is *. */
const shown = (q: string) => q.replace(/\{"([^"]*)"\}/g, "$1").replace(/\\([*_])/g, "$1");

const webSrc = files(path.join(botDir, "web/src"));
const sourceLines = [...strings(generated), ...pyStrings(path.join(botDir, "app/i18n"))]
  .flatMap((s) => [s, rendered(s)])
  .flatMap((s) => [s, s.replace(/\n/g, ""), ...s.split("\n")])
  .concat(webSrc.flatMap(webLines))
  .filter(Boolean);
const matchers = [...new Set(sourceLines)].map(matcher);
const web = webSrc.join("\n");
const read = (dir: string, names: string[]) => names.map((n) => fs.readFileSync(path.join(botDir, dir, n), "utf8"));
const i18nDir = path.join(botDir, "app/i18n");
const code = [
  web,
  ...read("app/i18n", fs.readdirSync(i18nDir).filter((n) => n.endsWith(".py"))),
  ...read("app/services", ["orders.py"]),
].join("\n");

/**
 * Text built from short pieces (too short for the matcher to trust), with the code that builds it
 * in the dashboard's web/src, the bot's app/i18n or app/services/orders.py.
 */
const COMPOSED: Record<string, string[]> = {
  "7-11／萊爾富 金額超過 1000 的額外費用（元）": [
    'EXTRA_FEE_LABEL = "7-11／萊爾富 金額超過 1000 的額外費用"',
    "label={`${EXTRA_FEE_LABEL}（元）`}",
  ],
  // /balance show's title: the member's name and the balance name (renamed to 星光幣 in the example).
  "顧客的商城點數": ['return f"{display_name}的{balance_name}"'],
  "顧客的星光幣": ['return f"{display_name}的{balance_name}"'],
  "700 點": ['return f"{value} 點"'],
  // The top-up order's item name.
  "購買 300 商城點數": ['return f"購買 {amount} {balance_name}"'],
  // The masked buyer name in lists: the first character and **.
  "王**": ['return name[0] + "**" if len(name) > 1 else "*"'],
  "+1.0 個百分點": ['`${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}${unit}`', 'signed(value, " 個百分點")'],
  // A field error in the save bar: the field's label, ：, the message.
  "萊爾富超商代碼手續費：必須是整數（只能有數字）": [
    "{error.label}：{error.message}",
    '"萊爾富超商代碼手續費"',
    '"必須是整數（只能有數字）"',
  ],
  "萊爾富超商代碼手續費：不能大於 999": ["{error.label}：{error.message}", '"萊爾富超商代碼手續費"', '"不能大於 {le}"'],
  "SmilePay 檢查碼：必須是 1 到 32 個英文、數字或符號，不能有空白": [
    "{error.label}：{error.message}",
    '"SmilePay 檢查碼"',
    '"必須是 1 到 32 個英文、數字或符號，不能有空白"',
  ],
  "SmilePay 商家驗證參數：必須是 1 到 4 位數字": [
    "{error.label}：{error.message}",
    '"SmilePay 商家驗證參數"',
    '"必須是 1 到 4 位數字"',
  ],
};

const fromSource = (raw: string) => {
  const q = shown(raw);
  return (
    DISCORD.has(q) ||
    COMPOSED[q]?.every((piece) => code.includes(piece)) ||
    web.includes(q) ||
    matchers.some((m) => m(q))
  );
};

describe("quotes on every page", () => {
  it("finds the quotes, nested ones too", () => {
    expect(quotes("回「抱歉，只有擁有「管理此頻道」權限的人」和「發佈」")).toEqual([
      "抱歉，只有擁有「管理此頻道」權限的人",
      "發佈",
    ]);
  });

  it("checks against the token-filled source text", () => {
    expect(fromSource("四大超商條碼（+25元）")).toBe(true);
    expect(fromSource("商城點數的儲值金額必須大於 0！")).toBe(true);
    expect(fromSource("此功能目前僅管理員可以使用")).toBe(true);
    expect(fromSource("四大超商條碼(+25元)")).toBe(false);
    expect(fromSource("伺服器還沒設定")).toBe(false);
    // A run across tokens: from inside one piece to inside a later one.
    expect(fromSource("被增加了 300 點")).toBe(true);
    expect(fromSource("您無法在此頻道使用此指令，請前往 #下單區 使用")).toBe(true);
    expect(fromSource("選擇中")).toBe(false);
  });

  it.each(PAGES)("%s quotes the bot and the dashboard word for word", (page) => {
    const text = fs.readFileSync(path.join(root, "content/docs", page), "utf8");
    const wrong = quotes(text).filter((q) => !fromSource(q));
    expect(wrong).toEqual([]);
  });
});

describe("/troubleshooting/command-errors", () => {
  const page = fs.readFileSync(path.join(root, "content/docs/troubleshooting/command-errors.mdx"), "utf8");
  const sections = page.split(/^## /m).filter((s) => s.includes("<Refusal"));

  it.each(sections.map((s) => [s.split("\n")[0], s]))(
    "%s quotes the refusal in its text, so search finds it",
    (_, section) => {
      const id = section.match(/<Refusal id="([^"]+)"/)![1] as keyof typeof BOT_UI;
      const entry = BOT_UI[id] as { content?: string };
      const prose = section.replace(/<Refusal[^>]*\/>/g, "");
      // The reply's first line is quoted: whole, or a piece of it at least 8 characters long.
      const first = matcher(entry.content!.split("\n")[0]);
      expect(quotes(prose).some((q) => q.length >= 8 && first(q))).toBe(true);
    },
  );
});

describe("/reference/fees", () => {
  const page = fs.readFileSync(path.join(root, "content/docs/reference/fees.mdx"), "utf8");
  const menu = BOT_UI["flow/fp_command/ok"].components[0] as { options: { label: string; value: string }[] };

  it("names each default fee the way the /fp menu shows it", () => {
    for (const { label, value } of menu.options) {
      const name = value === "balance" ? BOT_DEFAULTS.balanceNickname : BOT_METHOD_LABELS.dropdown[value as SmilePayMethod];
      const fee = value === "balance" ? 0 : DEFAULT_FEES[value as SmilePayMethod];
      expect(label).toBe(`${value === "balance" ? "{balanceName}" : name}（+{fee:${value}}元）`);
      expect(page).toContain(`| 「${name}（+${fee}元）」 | ${fee} 元 |`);
    }
  });
});
