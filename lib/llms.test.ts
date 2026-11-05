import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { llmsFullTxt, llmsTxt, mdxToMarkdown, pageMarkdown } from "./llms";
import type { SeoPage } from "./seo";

const DOCS = path.resolve(__dirname, "../content/docs");

function mdxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? mdxFiles(full) : entry.name.endsWith(".mdx") ? [full] : [];
  });
}

describe("MDX 轉 Markdown", () => {
  test("拿掉 frontmatter、import、示範元件和外框標籤，留下文字", () => {
    const md = mdxToMarkdown(`---
title: x
---

import { A } from "@/a";
import {
  B,
  C,
} from "@/b";

<DemoHero>
<A />

開頭的說明。

</DemoHero>

<Steps>
<Step>

### 第一步

做這個。

</Step>
</Steps>
`);
    expect(md).toBe("開頭的說明。\n\n### 第一步\n\n做這個。");
  });

  test("Callout 變成引用，標題粗體，內部的元件拿掉", () => {
    const md = mdxToMarkdown(`<Callout type="warn" title="注意">
第一段。

- 清單

<Shot id="a" alt="圖" />
</Callout>`);
    expect(md).toBe("> **注意**\n>\n> 第一段。\n>\n> - 清單");
  });

  test("站內連結變成完整網址，外部連結不動", () => {
    expect(mdxToMarkdown("見[手續費](/reference/fees)和[官網](https://funipay.net)。")).toBe(
      "見[手續費](https://docs.funipay.net/reference/fees)和[官網](https://funipay.net)。",
    );
  });

  test("資料表還原成 Markdown 表格", () => {
    const commands = mdxToMarkdown("<CommandTable />");
    expect(commands).toContain("| [`/fp`](https://docs.funipay.net/payments/fp) |");
    const errors = mdxToMarkdown("<SmilepayErrorTable />");
    expect(errors).toContain("| -3003 |");
    expect(errors).not.toContain("-9999");
  });

  test.each(mdxFiles(DOCS))("%s 沒有留下 JSX 或 import", (file) => {
    const md = mdxToMarkdown(fs.readFileSync(file, "utf8"));
    expect(md).not.toMatch(/^\s*(?:>\s*)?<\/?[A-Z]\w*/m);
    expect(md).not.toMatch(/^(?:import|export)\s/m);
    expect(md.length).toBeGreaterThan(100);
  });
});

const PAGE: SeoPage = { url: "/a", title: "標題", description: "描述", lastModified: "2026-11-04T16:22:22-08:00" };

test("單頁 Markdown：標題、摘要、網頁版網址、日期、內文", () => {
  expect(pageMarkdown(PAGE, "內文。")).toBe("# 標題\n\n> 描述\n\n網頁版：https://docs.funipay.net/a\n最後更新：2026年11月5日\n\n內文。\n");
  expect(pageMarkdown({ ...PAGE, lastModified: undefined }, "內文。")).not.toContain("最後更新");
});

test("llms.txt 符合 llmstxt.org：H1、引用摘要、分節連結", () => {
  const home: SeoPage = { url: "/", title: "首頁", description: "首頁描述" };
  const text = llmsTxt(
    [
      { name: null, urls: ["/"] },
      { name: "分類", urls: ["/a"] },
    ],
    new Map([
      ["/", home],
      ["/a", PAGE],
    ]),
  );
  expect(text).toMatch(/^# FunI 付款系統 說明文件\n\n> /);
  expect(text).toContain("## 總覽\n\n- [首頁](https://docs.funipay.net/index.md): 首頁描述");
  expect(text).toContain("## 分類\n\n- [標題](https://docs.funipay.net/a.md): 描述");
  expect(text).toContain("## Optional");
  expect(text).toContain("https://docs.funipay.net/llms-full.txt");
});

test("llms-full.txt 依序接起每一頁", () => {
  const text = llmsFullTxt(["# 甲\n", "# 乙\n"]);
  expect(text.indexOf("# 甲")).toBeLessThan(text.indexOf("# 乙"));
  expect(text).toContain("# 甲\n\n---\n\n# 乙");
});
