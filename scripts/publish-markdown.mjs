// After next build: put each page's Markdown copy next to the page (see publish-markdown-lib).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishMarkdown } from "./publish-markdown-lib.mjs";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../out");
console.log(`publish-markdown：${publishMarkdown(outDir)} 個 Markdown 檔`);
