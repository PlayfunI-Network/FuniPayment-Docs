// npm run list:materials
// Prints every bot screen and dashboard shot a demo can use (scripts/list-materials-lib.mjs), as
// the Markdown pasted into docs/WRITING.md 「可用素材」. Written as UTF-8 bytes: the Windows
// console mangles Chinese, so redirect it to a file (npm run -s list:materials > list.md).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materialsMarkdown } from "./list-materials-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.stdout.write(Buffer.from(materialsMarkdown(root), "utf8"));
