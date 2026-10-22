// Pure parts of sync-bot-ui.mjs: turn the bot's ui.json entries into demo data with {token}
// placeholders, read a few values from the bot's Python source, and render the generated file.
// Everything that does not match what the config expects throws: a silent fallback would let a
// demo drift from what the bot really shows.
import { DEFAULT_FEES, EXTRA_FEE_METHODS, EXTRA_FEE_THRESHOLD, IBON_EXTRA_FEE, METHODS } from "../lib/fees.mjs";

/** The ui.json flow calls that answer the interaction (in a flow's `order`). */
const MESSAGE_CALLS = ["response.send_message", "response.edit_message", "edit_original_response", "followup.send"];
const MESSAGE_KWARGS = new Set(["embed", "embeds", "view", "ephemeral", "content"]);

/**
 * Every call a `<key>@<call>` part can pick, and where the call holds its message: `kwargs` like
 * an interaction reply, `embedArg` an `{embed}` positional argument, `textArg` a positional
 * string. The bot's helpers send to the buyer's DM, the log channel or the server owner's DM.
 */
const PART_CALLS = {
  "response.send_message": { kwargs: true },
  "response.edit_message": { kwargs: true },
  edit_original_response: { kwargs: true },
  "followup.send": { kwargs: true },
  "channel.send": { kwargs: true },
  // Client.send_dm_to_user(client, user_id, embed=...) / client.send_dm_to_user(user_id, embed=...)
  "client.send_dm_to_user": { kwargs: true },
  "Client.send_dm_to_user": { kwargs: true },
  // send_to_log_channel(settings, {embed}) or send_to_log_channel(settings, embed=...)
  "client.send_to_log_channel": { kwargs: true, embedArg: 1 },
  "Client.send_to_log_channel": { kwargs: true },
  // send_to_dm_and_log(settings, user_id, {embed}): one embed to the buyer's DM and the log channel
  "client.send_to_dm_and_log": { embedArg: 2 },
  // notify_owner(server_id, text): a DM to the server owner
  "client.notify_owner": { textArg: 1 },
};

/** The parts a builder with several embeds (`{dm, embed}`, `{confirm, log, receiver, sender, view}`) has. */
const BUILDER_PARTS = new Set(["dm", "embed", "confirm", "log", "receiver", "sender"]);
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
  [/<\/[^>]+:\d+>/, "沒有換掉的指令 mention"],
  // A bare Discord ID in the text (an ID inside a link, after / or =, is never shown)
  [/(?<![\d/=])\d{17,20}(?!\d)/, "Discord ID"],
  [/<(FakeClient|ServerSettings|settings)>/, "測試用的物件"],
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

/** A flow's calls: at the top level, or under `calls` when the flow also records state. */
function flowCalls(raw) {
  return raw.calls ?? raw;
}

/** One message from the call a `@<call>` or `@<call>#<n>` part names (n counts that call, from 0). */
function messageFromPart(key, raw, part, cfg) {
  const m = part.match(/^([\w.]+)(?:#(\d+))?$/);
  const shape = m && PART_CALLS[m[1]];
  if (!shape) fail(key, `不認得的訊息呼叫 ${part}（支援：${Object.keys(PART_CALLS).join("、")}）`);
  const [, name, index = "0"] = m;
  const calls = flowCalls(raw);
  const call = calls[name]?.[Number(index)];
  if (!call) fail(key, `flow 沒有第 ${Number(index) + 1} 個 ${name}`);
  const args = call.args ?? [];
  if (shape.textArg != null) {
    if (typeof args[shape.textArg] !== "string") fail(key, `${part} 的第 ${shape.textArg + 1} 個參數不是文字`);
    if (Object.keys(call.kwargs ?? {}).length > 0) fail(key, `${part} 有還不支援的參數`);
    return { via: name, content: args[shape.textArg], embeds: [], components: [], ephemeral: false };
  }
  const embedArg = shape.embedArg != null ? args[shape.embedArg] : undefined;
  if (embedArg && typeof embedArg === "object") {
    if (!embedArg.embed || Object.keys(embedArg).length !== 1) fail(key, `${part} 的 embed 參數格式不認得`);
    if (Object.keys(call.kwargs ?? {}).length > 0) fail(key, `${part} 有還不支援的參數`);
    return { via: name, embeds: [convertEmbed(key, embedArg.embed)], components: [], ephemeral: false };
  }
  if (!shape.kwargs) fail(key, `${part} 沒有 embed`);
  const msg = messageFromCall(key, { ...call, args: args.filter((a) => typeof a === "string" && !/^<\w+>$/.test(a)) }, cfg);
  if (msg.content == null && msg.embeds.length === 0) fail(key, `${part} 沒有任何內容`);
  return { via: name, ...msg };
}

function convertFlow(key, raw, cfg) {
  const seen = {};
  const calls = [];
  const all = flowCalls(raw);
  for (const name of all.order ?? []) {
    const i = (seen[name] = (seen[name] ?? -1) + 1);
    if (MESSAGE_CALLS.includes(name)) calls.push({ via: name, call: all[name][i] });
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

/**
 * One embed of a builder that makes several (`@dm`, `@confirm`, ...). The builder's view goes
 * with the part only when the config says so (`view: true`): which message carries the buttons
 * is the bot's code, not the snapshot's.
 */
function convertBuilderPart(key, raw, part, cfg) {
  if (!BUILDER_PARTS.has(part) || !raw[part] || typeof raw[part] !== "object") {
    fail(key, `builder 沒有 ${part}（有：${Object.keys(raw).join(", ")}）`);
  }
  if ("view" in raw && raw.view && typeof cfg.view !== "boolean") fail(key, "這個 builder 有 view，config 要寫 view: true 或 false");
  if (!raw.view && cfg.view) fail(key, "config 寫了 view: true，但 builder 沒有 view");
  return {
    kind: "message",
    via: "builder",
    embeds: [convertEmbed(key, raw[part])],
    components: cfg.view ? convertView(key, raw.view, cfg) : [],
    ephemeral: false,
  };
}

/**
 * A `server/...` entry: the calls one event makes, `[{args, kwargs}]`. `[text]` is a reply
 * (kwargs.ephemeral), `[server_id, text]` is the DM the bot sends the server owner.
 */
function convertServerText(key, raw) {
  if (!Array.isArray(raw) || raw.length !== 1) fail(key, `server 訊息應該是一則，這裡有 ${Array.isArray(raw) ? raw.length : "?"} 則`);
  const [{ args = [], kwargs = {} }] = raw;
  const unknown = Object.keys(kwargs).filter((k) => k !== "ephemeral");
  if (unknown.length > 0) fail(key, `訊息有還不支援的參數 ${unknown.join(", ")}`);
  if (args.length === 1 && typeof args[0] === "string") {
    return { kind: "message", via: "reply", content: args[0], embeds: [], components: [], ephemeral: !!kwargs.ephemeral };
  }
  if (args.length === 2 && typeof args[0] === "number" && typeof args[1] === "string") {
    if (kwargs.ephemeral) fail(key, "私訊不會是 ephemeral");
    return { kind: "message", via: "client.notify_owner", content: args[1], embeds: [], components: [], ephemeral: false };
  }
  return fail(key, `不認得的 server 訊息參數（${JSON.stringify(args)}）`);
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

function checkLeftovers(key, text) {
  for (const [re, what] of LEFTOVERS) {
    const m = text.match(re);
    if (m) fail(key, `${what}「${m[0]}」還在：${text}`);
  }
}

/** Throw when a value read from the bot (not through convertKeys) has a test value or a token-like text. */
export function assertClean(key, value) {
  mapStrings(value, (s) => {
    const token = s.match(TOKEN_PATTERN);
    if (token) fail(key, `原文已經有像 token 的字 ${token[0]}，無法分辨`);
    checkLeftovers(key, s);
    return s;
  });
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

/** `<ui.json key>` or `<ui.json key>@<part>` (a flow's call, or one embed of a builder). */
function splitKey(key) {
  const at = key.lastIndexOf("@");
  return at < 0 ? [key, null] : [key.slice(0, at), key.slice(at + 1)];
}

function convertEntry(key, uiKey, part, raw, cfg) {
  if (uiKey.startsWith("server/")) {
    if (part) fail(key, "server 訊息沒有 part");
    return convertServerText(key, raw);
  }
  if (uiKey.startsWith("flow/")) {
    if (cfg.view != null) fail(key, "view 只用在 builder 的 part");
    return part ? { kind: "message", ...messageFromPart(key, raw, part, cfg) } : convertFlow(key, raw, cfg);
  }
  if (uiKey.startsWith("builder/") || uiKey.startsWith("guide/")) {
    return part ? convertBuilderPart(key, raw, part, cfg) : convertBuilder(key, raw, cfg);
  }
  return fail(key, "不認得的 key 種類（flow/、builder/、guide/、server/）");
}

/**
 * One configured key's message as the bot wrote it: the same shape as convertKeys' entry, but
 * with no replacement and no checks, for comparing an entry field by field with its source.
 */
export function rawEntry(ui, key, cfg = {}) {
  const [uiKey, part] = splitKey(key);
  return convertEntry(key, uiKey, part, ui[uiKey], cfg);
}

/**
 * Convert the configured ui.json keys to demo entries. A key is a ui.json key, or
 * `<ui.json key>@<part>` for one message of it (a flow's `@client.send_dm_to_user#1`, a
 * builder's `@dm`); the entry keeps the configured key as its id.
 * @param {Record<string, any>} ui the parsed ui.json
 * @param {Record<string, {replace: [string|RegExp, string][], optionFees?: boolean, method?: string, override?: Record<string, string>, mentions?: Record<string, string>, view?: boolean}>} keys
 * @param {{urlRules: [string|RegExp, string][], textRules: [string, string][], mentions: Record<string, string>, channels?: Record<string, string>}} global
 */
export function convertKeys(ui, keys, global) {
  const missing = Object.keys(keys).filter((k) => !(splitKey(k)[0] in ui));
  if (missing.length > 0) throw new Error(`ui.json 沒有這些 key：${missing.join("、")}`);

  const out = {};
  for (const [key, cfg] of Object.entries(keys)) {
    const [uiKey, part] = splitKey(key);
    const raw = ui[uiKey];
    const token = JSON.stringify(raw).match(TOKEN_PATTERN);
    if (token) fail(key, `原文已經有像 token 的字 ${token[0]}，無法分辨`);
    if (cfg.method && !METHODS.includes(cfg.method)) fail(key, `不認得的付款方式 ${cfg.method}`);

    let entry = convertEntry(key, uiKey, part, raw, cfg);
    if (cfg.method) entry = { ...entry, method: cfg.method };
    // Per-field overrides are set before the global rules run, so they win over them.
    for (const [fieldPath, value] of Object.entries(cfg.override ?? {})) setPath(key, entry, fieldPath, value);

    const rules = (cfg.replace ?? []).map(([from, to]) => ({ from, re: ruleRegExp(from), to, used: 0 }));
    const globalRules = [...global.urlRules, ...global.textRules].map(([from, to]) => ({ re: ruleRegExp(from), to }));
    const mentions = { ...global.mentions, ...cfg.mentions };
    const channels = global.channels ?? {};
    entry = mapStrings(entry, (s) => {
      let text = s;
      for (const r of globalRules) text = text.replace(r.re, r.to);
      text = text.replace(/<@!?(\d+)>/g, (m, id) => (mentions[id] ? `<@{${mentions[id]}}>` : m));
      text = text.replace(/<#(\d+)>/g, (m, id) => (channels[id] ? `<#{channel:${channels[id]}}>` : m));
      for (const r of rules) {
        text = text.replace(r.re, () => {
          r.used++;
          return r.to;
        });
      }
      checkLeftovers(key, text);
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

/**
 * The text a small i18n function returns (`def name(a, b) -> str: return (f"..." f"...")`), with
 * each parameter filled from `values` (every parameter must have a value, and the f-strings may
 * only use plain `{param}` fields), for messages ui.json has no snapshot of.
 */
export function extractTemplate(src, name, values) {
  const m = src.match(new RegExp(`^def ${name}\\(([^)]*)\\) -> str:\\n\\s+return \\(?((?:\\s*f?"(?:[^"\\\\\\n]|\\\\.)*")+)\\)?\\s*$`, "m"));
  if (!m) throw new Error(`找不到 ${name}()，或它不是單純回傳 f-string 的函式`);
  const params = m[1].split(",").map((p) => p.split(":")[0].trim()).filter(Boolean);
  const missing = params.filter((p) => !(p in values));
  const extra = Object.keys(values).filter((p) => !params.includes(p));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(`${name}() 的參數是 ${params.join(", ")}；config 給了 ${Object.keys(values).join(", ")}`);
  }
  const parts = [...m[2].matchAll(/(f?)"((?:[^"\\\n]|\\.)*)"/g)];
  return parts
    .map(([, f, body]) => {
      const text = unescapePython(body);
      if (!f) return text;
      return text.replace(/\{([^{}]*)\}/g, (field, expr) => {
        if (!params.includes(expr)) throw new Error(`${name}() 的 f-string 有還不支援的欄位 ${field}`);
        return String(values[expr]);
      });
    })
    .join("");
}

/**
 * The order message after the buyer let /fp or the buyer information step time out: both views
 * (views/fp.py, views/consumer_info.py) edit it to the same red embed with common.EXPIRED_TITLE /
 * EXPIRED_DESCRIPTION and no buttons. Throws when either view draws it differently.
 */
export function extractExpiredOrder(viewSources, constants) {
  const pattern =
    /embed = discord\.Embed\((?:description="", )?color=0x([0-9a-fA-F]{6})\)\n\s+embed\.title = common_text\.EXPIRED_TITLE\n\s+embed\.description = common_text\.EXPIRED_DESCRIPTION\n\s+try:\n\s+await message\.edit\(embed=embed, view=None\)/;
  const colors = viewSources.map(([file, src]) => {
    const m = src.match(pattern);
    if (!m) throw new Error(`${file} 的過期訊息和預期的不同（Embed、標題、說明、view=None）`);
    return parseInt(m[1], 16);
  });
  if (new Set(colors).size !== 1) throw new Error(`過期訊息的顏色不一致：${colors.join("、")}`);
  for (const name of ["EXPIRED_TITLE", "EXPIRED_DESCRIPTION"]) {
    if (!(name in constants)) throw new Error(`common.py 沒有 ${name}`);
  }
  return {
    kind: "message",
    via: "message.edit",
    embeds: [{ title: constants.EXPIRED_TITLE, description: constants.EXPIRED_DESCRIPTION, color: colors[0], has_timestamp: false }],
    components: [],
    ephemeral: false,
  };
}

/**
 * A reply that is one i18n constant as plain text, replacing the message's embed and buttons:
 * `<module>.edit_message(content=<module>.<NAME>, embed=None, view=None)` in the cog source.
 */
export function extractTextEdit(cogSrc, module, name, constants) {
  const re = new RegExp(`response\\.edit_message\\(\\s*content=${module}\\.${name},\\s*embed=None,\\s*view=None\\)`);
  if (!re.test(cogSrc)) throw new Error(`找不到 edit_message(content=${module}.${name}, embed=None, view=None)`);
  if (!(name in constants)) throw new Error(`i18n 沒有常數 ${name}`);
  return { kind: "message", via: "response.edit_message", content: constants[name], embeds: [], components: [], ephemeral: false };
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
