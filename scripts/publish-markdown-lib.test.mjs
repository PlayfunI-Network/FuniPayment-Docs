import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { publishMarkdown } from "./publish-markdown-lib.mjs";

test("把 out/md 底下的檔案搬到頁面旁邊，並移除 out/md", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "funipay-md-"));
  fs.mkdirSync(path.join(out, "md", "payments"), { recursive: true });
  fs.writeFileSync(path.join(out, "md", "index.md"), "home");
  fs.writeFileSync(path.join(out, "md", "payments", "fp.md"), "fp");
  fs.mkdirSync(path.join(out, "payments"));
  fs.writeFileSync(path.join(out, "payments", "fp.html"), "");

  expect(publishMarkdown(out)).toBe(2);
  expect(fs.readFileSync(path.join(out, "index.md"), "utf8")).toBe("home");
  expect(fs.readFileSync(path.join(out, "payments", "fp.md"), "utf8")).toBe("fp");
  expect(fs.existsSync(path.join(out, "md"))).toBe(false);
  fs.rmSync(out, { recursive: true, force: true });
});

test("沒有匯出 Markdown 時中止建置", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "funipay-md-"));
  expect(() => publishMarkdown(out)).toThrow("out/md");
  fs.rmSync(out, { recursive: true, force: true });
});
