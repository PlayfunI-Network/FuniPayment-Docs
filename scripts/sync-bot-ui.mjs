// Generate content/bot-ui.generated.ts from the bot project (read only).
// Usage: npm run sync:bot [-- <bot dir>]   (or FUNIPAY_BOT_DIR; default ../../PycharmProjects/FuniPayment)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHANNELS, KEYS, MENTIONS, TEMPLATES, TEXT_RULES, URL_RULES } from "./sync-bot-ui.config.mjs";
import {
  assertClean,
  checkFees,
  convertCommands,
  convertKeys,
  extractBalanceNickname,
  extractChannelDefaults,
  extractConstants,
  extractDicts,
  extractExpiredOrder,
  extractModal,
  extractTemplate,
  extractTextEdit,
  renderGenerated,
} from "./sync-bot-ui-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const botDir = path.resolve(root, process.argv[2] ?? process.env.FUNIPAY_BOT_DIR ?? "../../PycharmProjects/FuniPayment");
// Some of the bot's files have CRLF line ends; the extractors expect \n.
const read = (rel) => fs.readFileSync(path.join(botDir, rel), "utf8").replace(/\r\n/g, "\n");

function botCommit() {
  const git = (...args) => execFileSync("git", ["-C", botDir, ...args], { encoding: "utf8" }).trim();
  const commit = git("rev-parse", "--short", "HEAD");
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  const dirty = git("status", "--porcelain", "--", "tests/snapshots", "app") !== "";
  return `${commit}${dirty ? "-dirty" : ""} (${branch})`;
}

function pick(dicts, name, file) {
  if (!dicts[name]) throw new Error(`${file} 找不到 ${name}`);
  return dicts[name];
}

const ui = JSON.parse(read("tests/snapshots/ui.json"));
const schema = read("app/db/settings_schema.py");
checkFees(schema, read("app/services/fees.py"));

const entries = convertKeys(ui, KEYS, { urlRules: URL_RULES, textRules: TEXT_RULES, mentions: MENTIONS, channels: CHANNELS });
entries["modal/consumer_info"] = extractModal(
  read("app/bot/views/consumer_info.py"),
  extractConstants(read("app/i18n/consumer_info.py")),
);
entries["defaults/channel_names"] = extractChannelDefaults(schema);

// Messages ui.json has no snapshot of, read from the bot's source (each extractor checks the code
// still draws them the way it expects).
const commonConstants = extractConstants(read("app/i18n/common.py"));
const paymentConstants = extractConstants(read("app/i18n/payment.py"));
const paymentCog = read("app/bot/cogs/payment.py");
const sourced = {
  "source/expired_order": extractExpiredOrder(
    ["app/bot/views/fp.py", "app/bot/views/consumer_info.py"].map((f) => [f, read(f)]),
    commonConstants,
  ),
  "source/payment_create_cancelled": extractTextEdit(paymentCog, "payment_text", "OPERATION_CANCELLED", paymentConstants),
  "source/payment_create_confirming": extractTextEdit(paymentCog, "payment_text", "CONFIRMING_INFO", paymentConstants),
};
for (const [id, { file, fn, via, values }] of Object.entries(TEMPLATES)) {
  sourced[id] = { kind: "message", via, content: extractTemplate(read(file), fn, values), embeds: [], components: [], ephemeral: false };
}
for (const [id, entry] of Object.entries(sourced)) {
  if (id in entries) throw new Error(`${id} 重複了`);
  assertClean(id, entry);
  entries[id] = entry;
}

const common = extractDicts(read("app/i18n/common.py"));
const fp = extractDicts(read("app/i18n/fp.py"));
const payment = extractDicts(read("app/i18n/payment.py"));
const methodLabels = {
  dropdown: pick(fp, "DROPDOWN_METHOD_LABELS", "app/i18n/fp.py"),
  confirm: pick(common, "CONFIRM_METHOD_NAMES", "app/i18n/common.py"),
  create: pick(common, "CREATE_METHOD_NAMES", "app/i18n/common.py"),
  complete: pick(payment, "COMPLETE_METHOD_NAMES", "app/i18n/payment.py"),
  review: pick(payment, "REVIEW_METHOD_NAMES", "app/i18n/payment.py"),
};

// SmilePay status codes of a failed order, as the failure embed's 「錯誤訊息」 (ui.json also has
// the unknown-code fallback, as -9999).
const smilepayErrors = ui["smilepay/error_descriptions"];
if (!smilepayErrors || Object.keys(smilepayErrors).length === 0) throw new Error("ui.json 沒有 smilepay/error_descriptions");
assertClean("smilepay/error_descriptions", smilepayErrors);

const commands = convertCommands(JSON.parse(read("tests/snapshots/commands.json")));

const out = path.join(root, "content", "bot-ui.generated.ts");
fs.writeFileSync(
  out,
  renderGenerated({
    entries,
    extra: {
      /** Payment method names per screen (app/i18n), by method. */
      BOT_METHOD_LABELS: methodLabels,
      BOT_DEFAULTS: { balanceNickname: extractBalanceNickname(schema) },
    },
    typed: {
      COMMANDS: { type: "Record<string, CommandData>", value: commands },
      SMILEPAY_ERRORS: { type: "Record<string, string>", value: smilepayErrors },
    },
    commit: botCommit(),
  }),
);
console.log(`已產生 ${path.relative(root, out)}（${Object.keys(entries).length} 個 key、${Object.keys(commands).length} 個指令）`);
