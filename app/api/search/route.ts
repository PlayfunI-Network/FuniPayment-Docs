import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";
import { zhTokenizer } from "@/lib/search";

// 靜態匯出：建置時產生一份索引（out/api/search），瀏覽器自己下載後搜尋。
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  tokenizer: zhTokenizer,
});
