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
