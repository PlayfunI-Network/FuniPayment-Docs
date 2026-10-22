import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { checkRedirects, findBannedWords, findBrokenLinks } from "./check-export-lib.mjs";

let tmp;
beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "funipay-export-"));
  fs.mkdirSync(path.join(tmp, "payments"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "payments", "fp.html"), "<html></html>");
  fs.writeFileSync(
    path.join(tmp, "index.html"),
    '<a href="/payments/fp">ok</a><a href="/payments/fp#x">ok</a><a href="/missing">bad</a><a href="https://a.b/c">ext</a>',
  );
});
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

test("站內轉址目標不存在時回報", () => {
  expect(checkRedirects("/commands/payment/fp /payments/fp 301\n/x /nope 301", tmp)).toEqual(["/x → /nope：頁面不存在"]);
});
test("外部轉址不檢查", () => {
  expect(checkRedirects("/terms-of-service https://funipay.net/terms 301", tmp)).toEqual([]);
});
test("註解與空行略過", () => {
  expect(checkRedirects("# note\n\n/a /payments/fp 301", tmp)).toEqual([]);
});
test("禁用字詞", () => {
  expect(findBannedWords("支援信用卡與藍新")).toEqual(["信用卡", "藍新"]);
  expect(findBannedWords("乾淨的文字")).toEqual([]);
});
test("站內連結找不到頁面時回報", () => {
  expect(findBrokenLinks(tmp)).toEqual(["index.html：連結 /missing 找不到頁面"]);
});
