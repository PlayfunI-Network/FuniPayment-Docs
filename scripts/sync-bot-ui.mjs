// Generate content/bot-ui.generated.ts from the bot project (read only).
// Usage: npm run sync:bot [-- <bot dir>]   (or FUNIPAY_BOT_DIR; default ../../PycharmProjects/FuniPayment)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KEYS, MENTIONS, TEXT_RULES, URL_RULES } from "./sync-bot-ui.config.mjs";
import {
  checkFees,
  convertCommands,
  convertKeys,
  extractBalanceNickname,
  extractChannelDefaults,
  extractConstants,
  extractDicts,
  extractModal,
  renderGenerated,
} from "./sync-bot-ui-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const botDir = path.resolve(root, process.argv[2] ?? process.env.FUNIPAY_BOT_DIR ?? "../../PycharmProjects/FuniPayment");
const read = (rel) => fs.readFileSync(path.join(botDir, rel), "utf8");

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

const entries = convertKeys(ui, KEYS, { urlRules: URL_RULES, textRules: TEXT_RULES, mentions: MENTIONS });
entries["modal/consumer_info"] = extractModal(
  read("app/bot/views/consumer_info.py"),
  extractConstants(read("app/i18n/consumer_info.py")),
);
entries["defaults/channel_names"] = extractChannelDefaults(schema);

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
    typed: { COMMANDS: { type: "Record<string, CommandData>", value: commands } },
    commit: botCommit(),
  }),
);
console.log(`已產生 ${path.relative(root, out)}（${Object.keys(entries).length} 個 key、${Object.keys(commands).length} 個指令）`);
