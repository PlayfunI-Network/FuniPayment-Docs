// After next build: add the dotted copies of the nested prefetch segments (see flatten-segments-lib).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { flattenSegments } from "./flatten-segments-lib.mjs";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../out");
console.log(`flatten-segments：${flattenSegments(outDir).length} 個 prefetch 檔`);
