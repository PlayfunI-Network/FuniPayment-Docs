// The Markdown copies of the docs and /llms.txt, /llms-full.txt. The text is the pages' own: the
// MDX with its JSX taken away. Demos have no text of their own to keep, since each page says in
// words what its demo shows; the two tables drawn from data come back as Markdown tables.
import { commandRows, WHO } from "@/components/demos/reference/command-table";
import { smilepayErrorRows } from "@/components/demos/reference/smilepay-error-table";
import type { DocSection } from "@/lib/doc-tree";
import { FOOTER_LINKS, SITE_NAME, SITE_URL } from "@/lib/layout.shared";
import { absoluteUrl, formatDate, markdownPath, type SeoPage } from "@/lib/seo";

/** One line of Markdown table text. */
function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function commandTable(): string {
  const rows = commandRows().map((row) => {
    const options = row.options.map((o) => `${o.nameZh}${o.required ? "" : "（選填）"}`).join("、") || "沒有";
    const who = WHO[row.name];
    return `| [\`/${row.name}\`](${who.page}) | ${cell(row.description)} | ${cell(options)} | ${cell(who.who)} |`;
  });
  return ["| 指令 | Discord 上的說明 | 參數 | 誰可以用 |", "|---|---|---|---|", ...rows].join("\n");
}

function smilepayErrorTable(): string {
  const rows = smilepayErrorRows().map(([code, description]) => `| ${code} | 「${cell(description)}」 |`);
  return ["| 代碼 | 「錯誤訊息：」後面寫的字 |", "|---|---|", ...rows].join("\n");
}

const DATA_TABLES: Record<string, () => string> = {
  CommandTable: commandTable,
  SmilepayErrorTable: smilepayErrorTable,
};

function callout(attributes: string, body: string): string {
  const title = /\btitle="([^"]*)"/.exec(attributes)?.[1];
  const lines = body.trim().split("\n");
  const quoted = title ? [`**${title}**`, "", ...lines] : lines;
  return quoted.map((line) => (line.trim() === "" ? ">" : `> ${line}`)).join("\n");
}

/** A page's MDX as plain Markdown: no frontmatter, imports or JSX; in-site links made absolute. */
export function mdxToMarkdown(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^import\s[\s\S]*?\sfrom\s+["'][^"']+["'];?[ \t]*$/gm, "")
    .replace(/^[ \t]*<([A-Z]\w*)\b[^>]*\/>[ \t]*$/gm, (_, name: string) => DATA_TABLES[name]?.() ?? "")
    .replace(/^[ \t]*<\/?(?:DemoHero|Steps|Step)>[ \t]*$/gm, "")
    .replace(/^<Callout\b([^>]*)>\n?([\s\S]*?)\n?<\/Callout>[ \t]*$/gm, (_, attributes: string, body: string) => callout(attributes, body))
    .replace(/\]\(\/([^)]*)\)/g, (_, path: string) => `](${SITE_URL}/${path})`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** One page's Markdown file. */
export function pageMarkdown(page: SeoPage, raw: string): string {
  const lines = [
    `# ${page.title}`,
    "",
    `> ${page.description}`,
    "",
    `網頁版：${absoluteUrl(page.url)}`,
    ...(page.lastModified ? [`最後更新：${formatDate(page.lastModified)}`] : []),
    "",
    mdxToMarkdown(raw),
    "",
  ];
  return lines.join("\n");
}

const SUMMARY =
  "FunI 付款系統是一個 Discord 收款機器人。接上速買配（SmilePay）商家帳號後，商家可以在 Discord 伺服器開單收款，顧客用銀行轉帳或超商付款，付款完成後機器人自動通知。";
const NOTES = "這是 FunI 付款系統給商家和顧客看的使用說明，內容為繁體中文。每頁都有 Markdown 版本，網址是頁面網址加上 .md；網頁上的互動示範不在 Markdown 版本裡。";

/** /llms.txt, in the llmstxt.org format: every page by sidebar section, Markdown links first. */
export function llmsTxt(sections: DocSection[], pages: Map<string, SeoPage>): string {
  const blocks = sections.map(({ name, urls }) => {
    const links = urls.map((url) => {
      const page = pages.get(url) as SeoPage;
      return `- [${page.title}](${SITE_URL}${markdownPath(url)}): ${page.description}`;
    });
    return [`## ${name ?? "總覽"}`, "", ...links].join("\n");
  });
  const optional = [
    "## Optional",
    "",
    `- [完整內容](${SITE_URL}/llms-full.txt): 所有頁面的 Markdown 合併成一個檔案`,
    ...FOOTER_LINKS.filter((link) => !link.url.includes("/discord")).map((link) => `- [${link.text}](${link.url})`),
  ].join("\n");
  return [`# ${SITE_NAME}`, `> ${SUMMARY}`, NOTES, ...blocks, optional].join("\n\n") + "\n";
}

/** /llms-full.txt: the summary, then every page's Markdown in sidebar order. */
export function llmsFullTxt(markdownInOrder: string[]): string {
  return [`# ${SITE_NAME}\n\n> ${SUMMARY}\n\n${NOTES}\n`, ...markdownInOrder].join("\n---\n\n");
}
