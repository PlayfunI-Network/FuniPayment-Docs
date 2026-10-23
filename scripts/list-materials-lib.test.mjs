import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import shots from "../content/dashboard-shots.generated.json";
import { botScreens, materialsMarkdown } from "./list-materials-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("每個 bot 畫面都在清單裡，有分組和 kind", async () => {
  const { BOT_UI } = await import("../content/bot-ui.generated.ts");
  const screens = botScreens(root);
  expect(screens.map((s) => s.key).sort()).toEqual(Object.keys(BOT_UI).sort());
  for (const s of screens) {
    expect(s.family, s.key).not.toBe("");
    expect(s.kind, s.key).toBe(BOT_UI[s.key].kind);
    if (s.kind === "message") expect(s.via, s.key).toBe(BOT_UI[s.key].via);
  }
});

test("每張後台截圖和它的每個目標都在清單裡", () => {
  const md = materialsMarkdown(root);
  for (const [id, shot] of Object.entries(shots)) {
    const line = md.split("\n").find((l) => l.startsWith(`- \`${id}\``));
    expect(line, id).toBeTruthy();
    for (const name of Object.keys(shot.targets)) expect(line, `${id}.${name}`).toContain(`\`${name}\``);
  }
});

test("CRLF 的檔案（Windows 的 worktree）也讀得到每個畫面和目標", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "funipay-materials-"));
  try {
    for (const file of ["content/bot-ui.generated.ts", "components/demos/scenarios.ts", "content/dashboard-shots.generated.json"]) {
      const text = fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
      fs.mkdirSync(path.dirname(path.join(tmp, file)), { recursive: true });
      fs.writeFileSync(path.join(tmp, file), text.replace(/\n/g, "\r\n"));
    }
    expect(botScreens(tmp)).toEqual(botScreens(root));
    expect(botScreens(tmp).length).toBeGreaterThan(100);
    expect(materialsMarkdown(tmp)).toBe(materialsMarkdown(root));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
