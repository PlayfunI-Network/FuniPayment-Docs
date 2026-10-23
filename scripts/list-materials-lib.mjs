// The list behind `npm run list:materials` (scripts/list-materials.mjs): every bot screen (ui.json
// key) a demo can draw, grouped as components/demos/scenarios.ts SNAPSHOT_SCENARIOS groups them,
// and every dashboard shot with its targets. Read as text, so it runs under plain Node.
import fs from "node:fs";
import path from "node:path";

/**
 * A file's text with every line ending as \n: a Windows checkout (core.autocrlf) has \r\n, and
 * the patterns below match lines by \n.
 */
function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

/** The bot screens: `{ family, key, scenario, kind, via }`, in SNAPSHOT_SCENARIOS order, then the rest of BOT_UI. */
export function botScreens(root) {
  const generated = readText(path.join(root, "content/bot-ui.generated.ts"));
  const scenarios = readText(path.join(root, "components/demos/scenarios.ts"));
  const ui = generated.slice(generated.indexOf("export const BOT_UI"), generated.indexOf("export const COMMANDS"));
  const entries = new Map();
  for (const m of ui.matchAll(/^ {2}"([^"]+)": \{\n {4}"kind": "([^"]+)"(?:,\n {4}"via": "([^"]+)")?/gm)) {
    entries.set(m[1], { kind: m[2], via: m[3] ?? "" });
  }
  const block = scenarios.slice(scenarios.indexOf("export const SNAPSHOT_SCENARIOS"));
  const screens = [];
  let family = "";
  for (const line of block.split("\n").slice(1)) {
    if (/^};/.test(line)) break;
    const comment = line.match(/^ {2}\/\/ (.+)$/);
    if (comment) family = comment[1];
    const entry = line.match(/^ {2}"([^"]+)": "([^"]+)",?$/);
    if (entry) screens.push({ family, key: entry[1], scenario: entry[2], ...(entries.get(entry[1]) ?? { kind: "?", via: "" }) });
  }
  const listed = new Set(screens.map((s) => s.key));
  for (const [key, e] of entries) if (!listed.has(key)) screens.push({ family: "其他（沒有情境）", key, scenario: "", ...e });
  return screens;
}

/** The keys of one `export const NAME = { ... }` object of the generated file. */
function topKeys(generated, name) {
  const start = generated.indexOf(`export const ${name} = {`);
  const end = generated.indexOf("\n};", start);
  return [...generated.slice(start, end).matchAll(/^ {2}"([^"]+)":/gm)].map((m) => m[1]);
}

/** The whole list as Markdown (what WRITING.md's 「可用素材」 appendix pastes). */
export function materialsMarkdown(root) {
  const generated = readText(path.join(root, "content/bot-ui.generated.ts"));
  const shots = JSON.parse(readText(path.join(root, "content/dashboard-shots.generated.json")));
  const out = [];
  out.push("### Bot 畫面（`SnapshotMessage id=…`）", "");
  out.push("每個 key 後面是它的情境（`SNAPSHOT_SCENARIOS`）和 `via`（訊息出現在哪裡，見 `lib/bot-ui-types.ts` 的 `MessageEntry.via`）。`key@part` 是同一個流程裡另一則訊息（私訊、日誌）。", "");
  let family = null;
  for (const s of botScreens(root)) {
    if (s.family !== family) {
      family = s.family;
      out.push("", `**${family}**`, "");
    }
    const info = [s.scenario, s.kind === "message" ? s.via : s.kind].filter(Boolean).join("，");
    out.push(`- \`${s.key}\`${info ? `（${info}）` : ""}`);
  }
  out.push("", "其他產生的資料：", "");
  out.push(`- \`COMMANDS\`（斜線指令與參數）：${topKeys(generated, "COMMANDS").map((k) => `\`${k}\``).join("、")}`);
  out.push(`- \`SMILEPAY_ERRORS\`（速買配錯誤代碼）：${topKeys(generated, "SMILEPAY_ERRORS").map((k) => `\`${k}\``).join("、")}`);
  out.push(`- \`BOT_METHOD_LABELS\`：${topKeys(generated, "BOT_METHOD_LABELS").map((k) => `\`${k}\``).join("、")}`);
  out.push(`- \`BOT_DEFAULTS\`：${topKeys(generated, "BOT_DEFAULTS").map((k) => `\`${k}\``).join("、")}`);
  out.push("", "### 後台截圖（`DashboardDemo shot=…`）", "");
  out.push("每張截圖後面是它的目標（`target`）。只有桌面版有的目標標 *（手機版沒有，用到它的示範在手機上也會用桌面版截圖）；「無手機版」表示這張只有桌面版。", "");
  for (const [id, shot] of Object.entries(shots)) {
    const mobile = shot.mobile ? new Set(Object.keys(shot.mobile.targets)) : null;
    const names = Object.keys(shot.targets).map((n) => `\`${n}\`${mobile && !mobile.has(n) ? "*" : ""}`);
    out.push(`- \`${id}\`${mobile ? "" : "（無手機版）"}：${names.join("、")}`);
  }
  return `${out.join("\n")}\n`;
}
