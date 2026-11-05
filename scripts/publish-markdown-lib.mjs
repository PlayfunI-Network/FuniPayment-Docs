import fs from "node:fs";
import path from "node:path";
import { walk } from "./check-export-lib.mjs";

/** Moves out/md/** up to out/**, next to the pages they copy, and returns how many files moved. */
export function publishMarkdown(outDir) {
  const from = path.join(outDir, "md");
  if (!fs.existsSync(from)) throw new Error("out/md 不存在，Markdown 版本沒有匯出");
  const files = walk(from);
  for (const file of files) {
    const target = path.join(outDir, path.relative(from, file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(file, target);
  }
  fs.rmSync(from, { recursive: true });
  return files.length;
}
