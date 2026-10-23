/**
 * 中文搜尋用的斷詞。伺服器端建索引與瀏覽器端查詢必須用同一個，
 * 所以這個檔案不引入任何只能在其中一邊執行的東西。
 */

/** 連續漢字，或連續的字母、數字與指令會用到的符號（/ . _ -）。 */
const RUN = /(\p{Script=Han}+)|((?:(?!\p{Script=Han})[\p{L}\p{N}/._-])+)/gu;

function pushHan(run: string, out: string[]) {
  const chars = Array.from(run);
  for (let i = 0; i < chars.length; i++) {
    out.push(chars[i]);
    if (i + 1 < chars.length) out.push(chars[i] + chars[i + 1]);
  }
}

function pushWord(raw: string, out: string[]) {
  const word = raw.toLowerCase().replace(/^[._-]+|[._-]+$/g, "");
  if (!word) return;
  out.push(word);
  // 「/fp」也要能用「fp」搜到
  if (word.startsWith("/") && word.length > 1) out.push(word.slice(1));
}

/** 中文：每個單字與相鄰雙字；其他：依空白與標點切開並轉小寫。 */
export function tokenizeZh(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(RUN)) {
    if (m[1]) pushHan(m[1], out);
    else pushWord(m[2], out);
  }
  return out;
}

/** 給搜尋引擎（ZBSearch）用的 tokenizer 物件。 */
export const zhTokenizer = {
  language: "zh",
  normalizationCache: new Map<string, string>(),
  tokenize: (raw: string) => tokenizeZh(raw),
};

type ResultItem = { type: string; content: unknown };

/**
 * 搜尋結果以頁為一組（頁標題那筆在前，後面是那頁的段落），引擎照索引順序排，不看標題。
 * 這裡把標題含有搜尋詞的頁移到前面：標題完全相同、標題開頭是搜尋詞、標題含有搜尋詞，其餘照原順序。
 */
export function rankByTitle<T extends ResultItem>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const groups: T[][] = [];
  for (const item of items) {
    if (item.type === "page" || groups.length === 0) groups.push([item]);
    else groups[groups.length - 1].push(item);
  }
  const rank = (group: T[]) => {
    const title = group[0].type === "page" && typeof group[0].content === "string" ? group[0].content.toLowerCase() : "";
    // 「/fp 快速開單」用「fp」也算開頭
    const bare = title.replace(/^\//, "");
    if (title === q || bare === q) return 0;
    if (title.startsWith(q) || bare.startsWith(q)) return 1;
    return title.includes(q) ? 2 : 3;
  };
  return groups
    .map((group, i) => ({ group, i, r: rank(group) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .flatMap((g) => g.group);
}
