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
