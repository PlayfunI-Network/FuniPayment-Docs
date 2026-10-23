// Every 「…」 on the other features, troubleshooting and reference pages is text the bot or the
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
const PAGES = ["features", "troubleshooting", "reference"].flatMap((dir) =>
  fs
    .readdirSync(path.join(root, "content/docs", dir))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `${dir}/${f}`),
);

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
    const src = fs.readFileSync(path.join(dir, f), "utf8");
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
/** One source line: the quote is the whole line with its tokens filled, or a piece between tokens. */
function matcher(line: string): (q: string) => boolean {
  const pieces = line.split(TOKEN);
  const whole = new RegExp(`^${pieces.map(escape).join(".+?")}$`, "s");
  // A line of tokens and a bracket or two would match anything.
  const fixed = pieces.join("").replace(/\s/g, "").length >= 3;
  return (q) => (fixed && whole.test(q)) || pieces.some((p) => p.includes(q));
}

const sourceLines = [...strings(generated), ...pyStrings(path.join(botDir, "app/i18n"))]
  .flatMap((s) => [s, ...s.split("\n")])
  .filter(Boolean);
const matchers = sourceLines.map(matcher);
const web = files(path.join(botDir, "web/src")).join("\n");

/** Dashboard labels the web builds from a constant and more text, with the code that builds them. */
const COMPOSED: Record<string, string[]> = {
  "7-11／萊爾富 金額超過 1000 的額外費用（元）": [
    'EXTRA_FEE_LABEL = "7-11／萊爾富 金額超過 1000 的額外費用"',
    "label={`${EXTRA_FEE_LABEL}（元）`}",
  ],
};

const fromSource = (q: string) =>
  DISCORD.has(q) ||
  COMPOSED[q]?.every((code) => web.includes(code)) ||
  web.includes(q) ||
  matchers.some((m) => m(q));

describe("quotes on the features, troubleshooting and reference pages", () => {
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
