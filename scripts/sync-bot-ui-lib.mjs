// Pure parts of sync-bot-ui.mjs: turn the bot's ui.json entries into demo data with {token}
// placeholders, read a few values from the bot's Python source, and render the generated file.
// Everything that does not match what the config expects throws: a silent fallback would let a
// demo drift from what the bot really shows.
import { DEFAULT_FEES, EXTRA_FEE_METHODS, EXTRA_FEE_THRESHOLD, IBON_EXTRA_FEE, METHODS } from "../lib/fees.mjs";

/** The ui.json flow calls that show a message (in a flow's `order`). */
const MESSAGE_CALLS = ["response.send_message", "response.edit_message", "edit_original_response", "followup.send"];
const MESSAGE_KWARGS = new Set(["embed", "embeds", "view", "ephemeral", "content"]);
const EMBED_KEYS = new Set([
  "title", "description", "color", "url", "author", "fields", "footer", "thumbnail", "image", "has_timestamp", "flags", "type",
]);
const BUTTON_KEYS = new Set(["type", "label", "style", "disabled", "url"]);
const SELECT_KEYS = new Set(["type", "placeholder", "disabled", "options", "max_values", "min_values"]);

/** discord.py ButtonStyle, by name (and its aliases) or by value. */
const BUTTON_STYLES = {
  primary: "primary", blurple: "primary", 1: "primary",
  secondary: "secondary", grey: "secondary", gray: "secondary", 2: "secondary",
  success: "success", green: "success", 3: "success",
  danger: "danger", red: "danger", 4: "danger",
  link: "link", url: "link", 5: "link",
};

/** A `{token}` or `{token:arg}` placeholder, as lib/scenario.ts fills them. */
export const TOKEN_PATTERN = /\{[A-Za-z_]+(?::[A-Za-z_]+)?\}/;

/** Test values that must never reach the generated file. */
const LEFTOVERS = [
  [/cdn\.test/, "cdn.test 圖片"],
  [/imgur/, "imgur 圖片"],
  [/測試/, "「測試」字樣"],
  [/<@[!&]?\d+>/, "沒有對應的 mention"],
  [/<#\d+>/, "沒有對應的頻道 mention"],
  [/<t:(\d+|TS)(:[A-Za-z])?>/, "沒有換掉的時間戳記"],
];

function fail(key, message) {
  throw new Error(`${key}：${message}`);
}

function convertEmbed(key, raw) {
  const unknown = Object.keys(raw).filter((k) => !EMBED_KEYS.has(k));
  if (unknown.length > 0) fail(key, `embed 有還不支援的欄位 ${unknown.join(", ")}`);
  const out = {};
  if (raw.title != null) out.title = raw.title;
  if (raw.description != null) out.description = raw.description;
  if (raw.color != null) out.color = raw.color;
  if (raw.url != null) out.url = raw.url;
  if (raw.author) out.author = { name: raw.author.name, ...(raw.author.icon_url && { icon_url: raw.author.icon_url }) };
  if (raw.fields) out.fields = raw.fields.map((f) => ({ name: f.name, value: f.value, inline: !!f.inline }));
  if (raw.footer) out.footer = { text: raw.footer.text, ...(raw.footer.icon_url && { icon_url: raw.footer.icon_url }) };
  if (raw.thumbnail) out.thumbnail = { url: raw.thumbnail.url };
  if (raw.image) out.image = { url: raw.image.url };
  out.has_timestamp = !!raw.has_timestamp;
  return out;
}

function convertOption(key, [label, value, description, isDefault], optionFees) {
  let text = label;
  if (optionFees) {
    if (!METHODS.includes(value)) fail(key, `選項 ${value} 不是付款方式，不能套 optionFees`);
    if (!/（\+\d+元）$/.test(label)) fail(key, `選項「${label}」不是「名稱（+N元）」的格式`);
    text = label.replace(/（\+\d+元）$/, `（+{fee:${value}}元）`);
  }
  return { label: text, value, description: description ?? null, default: !!isDefault };
}

function convertView(key, view, cfg) {
  if (!view) return [];
  return view.children.map((c) => {
    if (c.type === "Button") {
      const unknown = Object.keys(c).filter((k) => !BUTTON_KEYS.has(k));
      if (unknown.length > 0) fail(key, `按鈕有還不支援的欄位 ${unknown.join(", ")}`);
      const style = BUTTON_STYLES[c.style];
      if (!style) fail(key, `不認得的按鈕樣式 ${c.style}`);
      return { type: "button", label: c.label, style, disabled: !!c.disabled, url: c.url ?? null };
    }
    if (c.type === "Select") {
      const unknown = Object.keys(c).filter((k) => !SELECT_KEYS.has(k));
      if (unknown.length > 0) fail(key, `選單有還不支援的欄位 ${unknown.join(", ")}`);
      return {
        type: "select",
        placeholder: c.placeholder,
        disabled: !!c.disabled,
        options: c.options.map((o) => convertOption(key, o, cfg.optionFees)),
      };
    }
    return fail(key, `不認得的元件 ${c.type}`);
  });
}

function messageFromCall(key, call, cfg) {
  const kwargs = call.kwargs ?? {};
  const unknown = Object.keys(kwargs).filter((k) => !MESSAGE_KWARGS.has(k));
  if (unknown.length > 0) fail(key, `訊息有還不支援的參數 ${unknown.join(", ")}`);
  const content = typeof call.args?.[0] === "string" ? call.args[0] : kwargs.content;
  const embeds = kwargs.embed ? [kwargs.embed.embed] : (kwargs.embeds ?? []).map((e) => e.embed ?? e);
  return {
    ...(content != null && { content }),
    embeds: embeds.map((e) => convertEmbed(key, e)),
    components: convertView(key, kwargs.view?.view, cfg),
    ephemeral: !!kwargs.ephemeral,
  };
}

function convertFlow(key, raw, cfg) {
  const seen = {};
  const calls = [];
  for (const name of raw.order ?? []) {
    const i = (seen[name] = (seen[name] ?? -1) + 1);
    if (MESSAGE_CALLS.includes(name)) calls.push({ via: name, call: raw[name][i] });
  }
  if (calls.length === 0) fail(key, "這個 flow 沒有任何訊息");
  const main = calls.filter((c) => c.via !== "followup.send");
  const followups = calls.filter((c) => c.via === "followup.send");
  if (main.length > 1 || followups.length > 1) {
    fail(key, `有 ${calls.length} 則訊息（${calls.map((c) => c.via).join(", ")}），目前只支援一則加一則 followup`);
  }
  const first = main[0] ?? followups[0];
  const entry = { kind: "message", via: first.via, ...messageFromCall(key, first.call, cfg) };
  if (main.length === 1 && followups.length === 1) {
    entry.followup = { via: "followup.send", ...messageFromCall(key, followups[0].call, cfg) };
  }
  return entry;
}

function convertBuilder(key, raw, cfg) {
  if (raw.type === "rich") {
    return { kind: "message", via: "builder", embeds: [convertEmbed(key, raw)], components: [], ephemeral: false };
  }
  if (raw.embed && Object.keys(raw).every((k) => k === "embed" || k === "view")) {
    return {
      kind: "message",
      via: "builder",
      embeds: [convertEmbed(key, raw.embed)],
      components: convertView(key, raw.view, cfg),
      ephemeral: false,
    };
  }
  return fail(key, `還不支援這種 builder 格式（${Object.keys(raw).join(", ")}）`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A literal rule as a global regex; an all-digit `from` only matches a whole number. */
function ruleRegExp(from) {
  if (from instanceof RegExp) return new RegExp(from.source, from.flags.includes("g") ? from.flags : from.flags + "g");
  return /^\d+$/.test(from) ? new RegExp(`(?<!\\d)${from}(?!\\d)`, "g") : new RegExp(escapeRegExp(from), "g");
}

function mapStrings(value, fn) {
  if (typeof value === "string") return fn(value);
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)]));
  }
  return value;
}

/** Set an existing string field by its dotted path (e.g. "embeds.0.author.icon_url"); a missing one throws. */
function setPath(key, entry, fieldPath, value) {
  const parts = fieldPath.split(".");
  let node = entry;
  for (const part of parts.slice(0, -1)) {
    node = node?.[part];
    if (node == null || typeof node !== "object") fail(key, `override 的欄位 ${fieldPath} 不存在`);
  }
  const last = parts[parts.length - 1];
  if (typeof node[last] !== "string") fail(key, `override 的欄位 ${fieldPath} 不存在或不是文字`);
  node[last] = value;
}

/**
 * Convert the configured ui.json keys to demo entries.
 * @param {Record<string, any>} ui the parsed ui.json
 * @param {Record<string, {replace: [string, string][], optionFees?: boolean, method?: string, override?: Record<string, string>}>} keys
 * @param {{urlRules: [string|RegExp, string][], textRules: [string, string][], mentions: Record<string, string>}} global
 */
export function convertKeys(ui, keys, global) {
  const missing = Object.keys(keys).filter((k) => !(k in ui));
  if (missing.length > 0) throw new Error(`ui.json 沒有這些 key：${missing.join("、")}`);

  const out = {};
  for (const [key, cfg] of Object.entries(keys)) {
    const raw = ui[key];
    const token = JSON.stringify(raw).match(TOKEN_PATTERN);
    if (token) fail(key, `原文已經有像 token 的字 ${token[0]}，無法分辨`);
    if (cfg.method && !METHODS.includes(cfg.method)) fail(key, `不認得的付款方式 ${cfg.method}`);

    let entry = key.startsWith("flow/") ? convertFlow(key, raw, cfg) : convertBuilder(key, raw, cfg);
    if (cfg.method) entry = { ...entry, method: cfg.method };
    // Per-field overrides are set before the global rules run, so they win over them.
    for (const [fieldPath, value] of Object.entries(cfg.override ?? {})) setPath(key, entry, fieldPath, value);

    const rules = (cfg.replace ?? []).map(([from, to]) => ({ from, re: ruleRegExp(from), to, used: 0 }));
    const globalRules = [...global.urlRules, ...global.textRules].map(([from, to]) => ({ re: ruleRegExp(from), to }));
    entry = mapStrings(entry, (s) => {
      let text = s;
      for (const r of globalRules) text = text.replace(r.re, r.to);
      text = text.replace(/<@!?(\d+)>/g, (m, id) => (global.mentions[id] ? `<@{${global.mentions[id]}}>` : m));
      for (const r of rules) {
        text = text.replace(r.re, () => {
          r.used++;
          return r.to;
        });
      }
      for (const [re, what] of LEFTOVERS) {
        const m = text.match(re);
        if (m) fail(key, `${what}「${m[0]}」還在：${text}`);
      }
      return text;
    });
    const unused = rules.filter((r) => r.used === 0).map((r) => String(r.from));
    if (unused.length > 0) fail(key, `替換規則沒有用到（bot 的字改了？）：${unused.join("、")}`);
    out[key] = entry;
  }
  return out;
}

// ---- The bot's Python source ----

function unescapePython(s) {
  return s.replace(/\\(.)/g, (_, c) => ({ n: "\n", t: "\t" })[c] ?? c);
}

/** Module-level UPPER_CASE = "..." constants written on one line. */
export function extractConstants(src) {
  const out = {};
  for (const m of src.matchAll(/^([A-Z][A-Z0-9_]*)\s*=\s*"((?:[^"\\\n]|\\.)*)"\s*(?:#.*)?$/gm)) {
    out[m[1]] = unescapePython(m[2]);
  }
  return out;
}

/** Module-level UPPER_CASE dicts whose keys and values are all plain strings. */
export function extractDicts(src) {
  const out = {};
  for (const m of src.matchAll(/^([A-Z][A-Z0-9_]*)(?:\s*:[^=\n]+)?\s*=\s*\{([^{}]*)\}/gm)) {
    const pairs = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
    const rest = m[2].replace(/"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g, "").replace(/#.*$/gm, "");
    if (pairs.length === 0 || /[^\s,]/.test(rest)) continue;
    out[m[1]] = Object.fromEntries(pairs.map((p) => [unescapePython(p[1]), unescapePython(p[2])]));
  }
  return out;
}

/** The consumer-info Modal (title, then its TextInputs in add_item order) from the view source. */
export function extractModal(viewSrc, constants) {
  const cls = viewSrc.match(/class \w+\(Modal, title=\w+\.(\w+)\):/);
  if (!cls) throw new Error("找不到 Modal 類別");
  const after = viewSrc.slice(cls.index + cls[0].length);
  const body = after.slice(0, after.search(/\n {0,4}(?:class |def |@)|$/));
  const constant = (name) => {
    if (!(name in constants)) throw new Error(`i18n 沒有常數 ${name}`);
    return constants[name];
  };
  const inputs = {};
  for (const m of body.matchAll(/self\.(?:buyer_)?(\w+) = TextInput\(([\s\S]*?)\n\s*\)/g)) {
    // `default` is the buyer's saved value; `style` must be short, the one-line input Modal draws.
    const kwargs = [...m[2].matchAll(/(\w+)=/g)].map((k) => k[1]);
    const unknown = kwargs.filter((k) => !["label", "style", "required", "default", "max_length"].includes(k));
    if (unknown.length > 0) throw new Error(`Modal 欄位 ${m[1]} 有還不支援的參數 ${unknown.join(", ")}`);
    if (/style=/.test(m[2]) && !/style=discord\.TextStyle\.short\b/.test(m[2])) {
      throw new Error(`Modal 欄位 ${m[1]} 不是單行輸入`);
    }
    const label = m[2].match(/label=\w+\.(\w+)/);
    const maxLength = m[2].match(/max_length=(\d+)/);
    if (!label || !maxLength) throw new Error(`Modal 欄位 ${m[1]} 缺 label 或 max_length`);
    inputs[m[1]] = {
      id: m[1],
      label: constant(label[1]),
      required: !/required=False/.test(m[2]),
      maxLength: Number(maxLength[1]),
    };
  }
  const order = [...body.matchAll(/self\.add_item\(self\.(?:buyer_)?(\w+)\)/g)].map((m) => m[1]);
  if (order.length === 0) throw new Error("Modal 沒有 add_item");
  return {
    kind: "modal",
    title: constant(cls[1]),
    fields: order.map((id) => inputs[id] ?? (() => { throw new Error(`Modal 加入了沒定義的欄位 ${id}`); })()),
  };
}

/** Fail when lib/fees.mjs no longer matches the bot's defaults (settings_schema + fees.py). */
export function checkFees(schemaSrc, feesSrc) {
  const problems = [];
  for (const [method, fee] of Object.entries(DEFAULT_FEES)) {
    const m = schemaSrc.match(new RegExp(`${method}: PaymentMethodConfig = PaymentMethodConfig\\(fee=(\\d+)\\)`));
    if (!m) problems.push(`settings_schema 找不到 ${method} 的手續費`);
    else if (Number(m[1]) !== fee) problems.push(`${method} 手續費 bot 是 ${m[1]}，lib/fees.mjs 是 ${fee}`);
  }
  const extra = schemaSrc.match(/ibon_extra_fee: Fee = (\d+)/);
  if (!extra || Number(extra[1]) !== IBON_EXTRA_FEE) problems.push(`ibon_extra_fee bot 是 ${extra?.[1]}，lib/fees.mjs 是 ${IBON_EXTRA_FEE}`);
  const threshold = feesSrc.match(/^EXTRA_FEE_THRESHOLD = (\d+)/m);
  if (!threshold || Number(threshold[1]) !== EXTRA_FEE_THRESHOLD) {
    problems.push(`EXTRA_FEE_THRESHOLD bot 是 ${threshold?.[1]}，lib/fees.mjs 是 ${EXTRA_FEE_THRESHOLD}`);
  }
  const methods = feesSrc.match(/^EXTRA_FEE_METHODS = \(([^)]*)\)/m);
  const botMethods = methods ? [...methods[1].matchAll(/"(\w+)"/g)].map((m) => m[1]).join(",") : null;
  if (botMethods !== EXTRA_FEE_METHODS.join(",")) {
    problems.push(`EXTRA_FEE_METHODS bot 是 ${botMethods}，lib/fees.mjs 是 ${EXTRA_FEE_METHODS.join(",")}`);
  }
  if (problems.length > 0) throw new Error(`手續費規則和 bot 不同：\n${problems.join("\n")}`);
}

/** Rename defaults per status, the "do not rename" value and the length limit. */
export function extractChannelDefaults(schemaSrc) {
  const rename = {};
  for (const status of ["selecting", "pending", "complete", "expired"]) {
    const m = schemaSrc.match(new RegExp(`rename_${status}_channel_name: str \\| None = (None|"[^"]*")`));
    if (!m) throw new Error(`settings_schema 找不到 rename_${status}_channel_name`);
    rename[status] = m[1] === "None" ? null : m[1].slice(1, -1);
  }
  const disabled = schemaSrc.match(/^DISABLED_RENAME = "([^"]+)"/m);
  const maxLength = schemaSrc.match(/^MAX_RENAME_LENGTH = (\d+)/m);
  if (!disabled || !maxLength) throw new Error("settings_schema 找不到 DISABLED_RENAME 或 MAX_RENAME_LENGTH");
  return { kind: "channel_defaults", rename, disabledValue: disabled[1], maxLength: Number(maxLength[1]) };
}

/** ServerSettings.balance_nickname's default. */
export function extractBalanceNickname(schemaSrc) {
  const m = schemaSrc.match(/balance_nickname: str = Field\(default="([^"]+)"/);
  if (!m) throw new Error("settings_schema 找不到 balance_nickname 的預設值");
  return m[1];
}

// ---- Slash commands (tests/snapshots/commands.json) ----

const COMMAND_KEYS = new Set([
  "contexts", "default_member_permissions", "description", "description_localizations", "dm_permission",
  "integration_types", "name", "name_localizations", "nsfw", "options", "type",
]);
const OPTION_KEYS = new Set([
  "choices", "description", "description_localizations", "name", "name_localizations", "options", "required", "type",
  "channel_types", "min_value", "max_value", "min_length", "max_length", "autocomplete",
]);
const CHOICE_KEYS = new Set(["name", "value", "name_localizations"]);
const OPTION_TYPES = {
  3: "string", 4: "integer", 5: "boolean", 6: "user", 7: "channel", 8: "role", 9: "mentionable", 10: "number", 11: "attachment",
};

function unknownKeys(where, obj, known) {
  const unknown = Object.keys(obj).filter((k) => !known.has(k));
  if (unknown.length > 0) throw new Error(`${where}：還不支援的欄位 ${unknown.join(", ")}`);
}

/** What a zh-TW Discord client shows: the zh-TW localization, else the default text. */
const zhTW = (text, localizations) => localizations?.["zh-TW"] ?? text;

function convertCommandOption(where, o) {
  unknownKeys(where, o, OPTION_KEYS);
  const type = OPTION_TYPES[o.type];
  if (!type) throw new Error(`${where}：不認得的參數型別 ${o.type}`);
  if (o.options) throw new Error(`${where}：一般參數不應該有 options`);
  const out = {
    name: o.name,
    nameZh: zhTW(o.name, o.name_localizations),
    description: zhTW(o.description, o.description_localizations),
    required: !!o.required,
    type,
  };
  if (o.choices) {
    out.choices = o.choices.map((c, i) => {
      unknownKeys(`${where} 選項 ${i + 1}`, c, CHOICE_KEYS);
      return { label: zhTW(c.name, c.name_localizations), value: c.value };
    });
  }
  if (o.channel_types) out.channelTypes = o.channel_types;
  if (o.min_value != null) out.minValue = o.min_value;
  if (o.max_value != null) out.maxValue = o.max_value;
  if (o.min_length != null) out.minLength = o.min_length;
  if (o.max_length != null) out.maxLength = o.max_length;
  if (o.autocomplete) out.autocomplete = true;
  return out;
}

/** commands.json ("command/<name>" entries) as COMMANDS, keyed by command name. */
export function convertCommands(commands) {
  const out = {};
  for (const [key, c] of Object.entries(commands)) {
    if (!key.startsWith("command/")) throw new Error(`commands.json：不認得的 key ${key}`);
    unknownKeys(key, c, COMMAND_KEYS);
    if (c.type !== 1) throw new Error(`${key}：只支援斜線指令（type 1），這裡是 ${c.type}`);
    if (c.nsfw) throw new Error(`${key}：nsfw 指令還不支援`);
    const options = c.options ?? [];
    if (options.some((o) => o.type === 2)) throw new Error(`${key}：還不支援子指令群組`);
    const subs = options.filter((o) => o.type === 1);
    if (subs.length > 0 && subs.length !== options.length) throw new Error(`${key}：子指令和一般參數混在一起`);
    out[c.name] = {
      name: c.name,
      nameZh: zhTW(c.name, c.name_localizations),
      description: zhTW(c.description, c.description_localizations),
      defaultMemberPermissions: c.default_member_permissions == null ? null : Number(c.default_member_permissions),
      dmPermission: c.dm_permission !== false,
      contexts: c.contexts ?? null,
      options: subs.length > 0 ? [] : options.map((o) => convertCommandOption(`${key} ${o.name}`, o)),
      subcommands: subs.map((sc) => {
        unknownKeys(`${key} ${sc.name}`, sc, OPTION_KEYS);
        return {
          name: sc.name,
          nameZh: zhTW(sc.name, sc.name_localizations),
          description: zhTW(sc.description, sc.description_localizations),
          options: (sc.options ?? []).map((o) => convertCommandOption(`${key} ${sc.name} ${o.name}`, o)),
        };
      }),
    };
  }
  return out;
}

/**
 * The generated TypeScript file. `extra` exports are `as const`; `typed` exports are checked with
 * `satisfies` against a type from lib/bot-ui-types.ts.
 * @param {{entries: Record<string, unknown>, extra: Record<string, unknown>, typed?: Record<string, {type: string, value: unknown}>, commit: string}} data
 */
export function renderGenerated({ entries, extra, typed = {}, commit }) {
  const json = (v) => JSON.stringify(v, null, 2);
  const lines = [
    "// 產生檔，勿手改。執行 `npm run sync:bot` 重新產生（scripts/sync-bot-ui.mjs）。",
    `// 來源：bot 專案 FuniPayment ${commit} 的 tests/snapshots/ui.json、commands.json 與 app/ 原始碼。`,
    "// 字串裡的 {token} 由 lib/scenario.ts 依示範情境填入。",
    'import type { BotUiEntry, CommandData } from "@/lib/bot-ui-types";',
    "",
    `export const BOT_SOURCE_COMMIT = ${json(commit)};`,
    "",
    `export const BOT_UI = ${json(entries)} satisfies Record<string, BotUiEntry>;`,
  ];
  for (const [name, { type, value }] of Object.entries(typed)) {
    lines.push("", `export const ${name} = ${json(value)} satisfies ${type};`);
  }
  for (const [name, value] of Object.entries(extra)) lines.push("", `export const ${name} = ${json(value)} as const;`);
  return lines.join("\n") + "\n";
}
