import { rankByTitle, tokenizeZh } from "./search";

test("中文以單字與雙字切開，英文數字整段保留", () => {
  const t = tokenizeZh("四大超商條碼 /fp 1000元");
  expect(t).toEqual(expect.arrayContaining(["條碼", "超商", "條", "/fp", "1000"]));
});

test("搜尋詞「手續費」可以對上內文", () => {
  expect(tokenizeZh("手續費")).toEqual(expect.arrayContaining(["手續", "續費"]));
});

test("英文轉小寫，標點與空白只當分隔", () => {
  expect(tokenizeZh("SmilePay，Discord。")).toEqual(["smilepay", "discord"]);
});

test("指令也能用不帶斜線的字搜到", () => {
  expect(tokenizeZh("/fp")).toEqual(expect.arrayContaining(["/fp", "fp"]));
});

test("空字串沒有詞", () => {
  expect(tokenizeZh("")).toEqual([]);
});

test("標題含有搜尋詞的頁排到前面，同一頁的段落跟著走", () => {
  const items = [
    { type: "page", content: "開出第一張訂單" },
    { type: "text", content: "輸入 /fp" },
    { type: "page", content: "用點數付款" },
    { type: "page", content: "/fp 快速開單" },
    { type: "heading", content: "參數" },
  ];
  expect(rankByTitle(items, "fp").map((i) => i.content)).toEqual([
    "/fp 快速開單",
    "參數",
    "開出第一張訂單",
    "輸入 /fp",
    "用點數付款",
  ]);
  expect(rankByTitle(items, "")).toBe(items);
});
