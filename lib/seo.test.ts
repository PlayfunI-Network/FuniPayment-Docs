import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { breadcrumbs, docSections } from "./doc-tree";
import { parseGitLog } from "./last-modified";
import { displayWidth, documentTitle, extractFaq, formatDate, markdownPath, pageJsonLd, pageMetadata, serializeJsonLd } from "./seo";

const DOCS = path.resolve(__dirname, "../content/docs");

function mdxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? mdxFiles(full) : entry.name.endsWith(".mdx") ? [full] : [];
  });
}

function frontmatter(file: string, key: string): string | undefined {
  const head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(file, "utf8"))?.[1] ?? "";
  const value = new RegExp(`^${key}: (.*)$`, "m").exec(head)?.[1].trim();
  if (value === undefined) return undefined;
  return value.startsWith('"') ? (JSON.parse(value) as string) : value;
}

function urlOf(file: string): string {
  const relative = path.relative(DOCS, file).replace(/\\/g, "/").replace(/\.mdx$/, "");
  return relative === "index" ? "/" : `/${relative}`;
}

describe("每一頁的 title 和 description", () => {
  const pages = mdxFiles(DOCS).map((file) => ({
    url: urlOf(file),
    title: frontmatter(file, "title") as string,
    seoTitle: frontmatter(file, "seoTitle"),
    description: frontmatter(file, "seoDescription") as string,
  }));

  test.each(pages)("$url：title 不超過 60 寬、seoDescription 介於 120 到 160 寬", (page) => {
    expect(displayWidth(documentTitle(page))).toBeLessThanOrEqual(60);
    expect(displayWidth(page.description)).toBeGreaterThanOrEqual(120);
    expect(displayWidth(page.description)).toBeLessThanOrEqual(160);
  });

  test("沒有兩頁相同", () => {
    expect(new Set(pages.map(documentTitle)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length);
  });
});

const PAGE = { url: "/payments/fp", title: "/fp 快速開單", description: "說明", lastModified: "2026-11-04T16:22:22-08:00" };
const TREE = {
  children: [
    { type: "page" as const, name: "首頁", url: "/" },
    {
      type: "folder" as const,
      name: "收款",
      children: [
        { type: "page" as const, name: "a", url: "/payments/first" },
        { type: "page" as const, name: "b", url: "/payments/fp" },
      ],
    },
  ],
};

test("寬度：中文字算 2，英數算 1", () => {
  expect(displayWidth("abc 中文，")).toBe(10);
});

test("首頁的 title 不加站名，其他頁加", () => {
  expect(documentTitle({ url: "/", title: "歡迎", seoTitle: "完整標題" })).toBe("完整標題");
  expect(documentTitle({ url: "/a", title: "手續費" })).toBe("手續費｜FunI 付款系統 說明文件");
});

test("Markdown 版本的路徑", () => {
  expect(markdownPath("/")).toBe("/index.md");
  expect(markdownPath("/payments/fp")).toBe("/payments/fp.md");
});

test("metadata 有 canonical、Markdown 版本、Open Graph 與 Twitter Card", () => {
  const metadata = pageMetadata(PAGE);
  expect(metadata.alternates?.canonical).toBe("https://docs.funipay.net/payments/fp");
  expect(metadata.alternates?.types).toEqual({ "text/markdown": "/payments/fp.md" });
  expect(metadata.openGraph).toMatchObject({ type: "article", locale: "zh_TW", modifiedTime: PAGE.lastModified });
  expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
});

describe("麵包屑", () => {
  const sections = docSections(TREE);

  test("側邊欄順序與分組", () => {
    expect(sections).toEqual([
      { name: null, urls: ["/"] },
      { name: "收款", urls: ["/payments/first", "/payments/fp"] },
    ]);
  });

  test("分類連到它的第一頁；第一頁自己的分類不是連結；首頁沒有", () => {
    expect(breadcrumbs(sections, "/payments/fp", "b")).toEqual([{ name: "說明文件", url: "/" }, { name: "收款", url: "/payments/first" }, { name: "b" }]);
    expect(breadcrumbs(sections, "/payments/first", "a")[1]).toEqual({ name: "收款", url: undefined });
    expect(breadcrumbs(sections, "/", "首頁")).toEqual([]);
  });

  test("BreadcrumbList 每一項都有網址，沒有連結的分類不列", () => {
    const graph = (crumbs: ReturnType<typeof breadcrumbs>) =>
      pageJsonLd(PAGE, crumbs)["@graph"].find((node) => (node as { "@type": string })["@type"] === "BreadcrumbList") as { itemListElement: { item: string; position: number }[] };
    expect(graph(breadcrumbs(sections, "/payments/fp", "b")).itemListElement.map((i) => i.item)).toEqual([
      "https://docs.funipay.net",
      "https://docs.funipay.net/payments/first",
      "https://docs.funipay.net/payments/fp",
    ]);
    const first = graph(breadcrumbs(sections, "/payments/first", "a")).itemListElement;
    expect(first.map((i) => i.position)).toEqual([1, 2]);
  });
});

describe("JSON-LD", () => {
  const types = (data: { "@graph": object[] }) => data["@graph"].map((node) => (node as { "@type": string })["@type"]);

  test("文件頁是 TechArticle，FAQ 頁再加 FAQPage，首頁是 SoftwareApplication", () => {
    const crumbs = [{ name: "說明文件", url: "/" }, { name: "b" }];
    expect(types(pageJsonLd(PAGE, crumbs))).toEqual(["Organization", "WebSite", "TechArticle", "BreadcrumbList"]);
    expect(types(pageJsonLd(PAGE, crumbs, [{ question: "q", answer: "a" }]))).toContain("FAQPage");
    expect(types(pageJsonLd({ ...PAGE, url: "/" }, []))).toEqual(["Organization", "WebSite", "SoftwareApplication"]);
  });

  test("不寫網站上沒有的資料", () => {
    const text = JSON.stringify(pageJsonLd({ ...PAGE, url: "/" }, []));
    for (const field of ["aggregateRating", "review", "offers", "award", "SearchAction"]) expect(text).not.toContain(field);
  });

  test("不知道日期就不寫 dateModified", () => {
    expect(JSON.stringify(pageJsonLd({ ...PAGE, lastModified: undefined }, [{ name: "b" }]))).not.toContain("dateModified");
  });

  test("放進 <script> 也安全", () => {
    expect(serializeJsonLd({ a: "</script>" })).toBe('{"a":"\\u003c/script>"}');
  });
});

test("FAQ：每個 H3 是一題，答案去掉連結和程式碼標記", () => {
  const faq = extractFaq("## 分類\n\n### 誰付？\n\n顧客付。見[手續費](/reference/fees)。\n\n### 怎麼查？\n\n用 `/payment review`。\n\n## 下一類\n");
  expect(faq).toEqual([
    { question: "誰付？", answer: "顧客付。見手續費。" },
    { question: "怎麼查？", answer: "用 /payment review。" },
  ]);
});

test("真正的 FAQ 頁每題都有答案，而且都是問句", () => {
  const faq = extractFaq(fs.readFileSync(path.join(DOCS, "troubleshooting/faq.mdx"), "utf8"));
  expect(faq.length).toBeGreaterThan(10);
  for (const { question, answer } of faq) {
    expect(question).toMatch(/[？]$/);
    expect(answer.length).toBeGreaterThan(5);
  }
});

test("日期用台灣時區顯示", () => {
  expect(formatDate("2026-11-04T16:22:22-08:00")).toBe("2026年11月5日");
});

test("git log：每個檔案取最新一次", () => {
  const log = "@@2026-11-05T00:00:00Z\n\npayments/fp.mdx\n@@2026-10-01T00:00:00Z\n\npayments/fp.mdx\nindex.mdx\n";
  const dates = parseGitLog(log);
  expect(dates.get("payments/fp.mdx")).toBe("2026-11-05T00:00:00Z");
  expect(dates.get("index.mdx")).toBe("2026-10-01T00:00:00Z");
});
