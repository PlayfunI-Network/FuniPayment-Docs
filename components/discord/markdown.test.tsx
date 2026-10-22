// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { DiscordMarkdown } from "./markdown";

describe("DiscordMarkdown mentions", () => {
  it("draws <#name> as a channel chip with a # icon", () => {
    const { container } = render(<DiscordMarkdown text="請前往 <#指令區> 使用" />);
    const chip = container.querySelector("[data-discord-channel]");
    expect(chip?.textContent).toBe("#指令區");
    expect(chip?.className).toContain("bg-[rgba(88,101,242,0.3)]");
    expect(container.textContent).toBe("請前往 #指令區 使用");
  });

  it("keeps spaces in a channel name and works inside bold", () => {
    const { container } = render(<DiscordMarkdown text="**頻道 <#訂單 128>**" />);
    expect(container.querySelector("strong [data-discord-channel]")?.textContent).toBe("#訂單 128");
  });

  it("draws </command name> as a command chip", () => {
    const { container } = render(<DiscordMarkdown text="歡迎使用 </payment review> 查看更多..." />);
    const chip = container.querySelector("[data-discord-command]");
    expect(chip?.textContent).toBe("/payment review");
    expect(container.textContent).toBe("歡迎使用 /payment review 查看更多...");
  });

  it("still draws user mentions and timestamps", () => {
    const { container } = render(<DiscordMarkdown text="<@顧客> 請於 <t:1 天內:R> 完成" />);
    expect(container.textContent).toBe("@顧客 請於 1 天內 完成");
  });
});

describe("DiscordMarkdown headings and bullets", () => {
  it("draws ## lines as a bold, larger heading and - lines as a bulleted list", () => {
    const { container } = render(
      <DiscordMarkdown text={"## 所有未付款訂單更新完畢！\n- 更新成功：3 筆\n- 尚未付款：9 筆\n"} />,
    );
    const heading = container.querySelector('[role="heading"]');
    expect(heading?.getAttribute("aria-level")).toBe("2");
    expect(heading?.textContent).toBe("所有未付款訂單更新完畢！");
    expect(heading?.className).toContain("font-bold");
    expect(heading?.className).toContain("text-[1.25rem]");
    const items = [...container.querySelectorAll("ul > li")].map((li) => li.textContent);
    expect(items).toEqual(["更新成功：3 筆", "尚未付款：9 筆"]);
    expect(container.querySelector("ul")?.className).toContain("list-disc");
  });

  it("heading levels # to ###, with inline markdown inside", () => {
    const { container } = render(<DiscordMarkdown text={"# 大\n### **小**"} />);
    const levels = [...container.querySelectorAll('[role="heading"]')].map((h) => h.getAttribute("aria-level"));
    expect(levels).toEqual(["1", "3"]);
    expect(container.querySelector('[aria-level="3"] strong')?.textContent).toBe("小");
  });

  it("a numbered list and a bulleted list next to each other stay separate", () => {
    const { container } = render(<DiscordMarkdown text={"1. 一\n2. 二\n- 甲\n文字"} />);
    expect(container.querySelectorAll("ol > li").length).toBe(2);
    expect(container.querySelectorAll("ul > li").length).toBe(1);
    expect(container.textContent?.endsWith("文字")).toBe(true);
  });

  it("# or - inside a line is plain text", () => {
    const { container } = render(<DiscordMarkdown text="編號 #12 - 已完成" />);
    expect(container.querySelector('[role="heading"]')).toBeNull();
    expect(container.querySelector("ul")).toBeNull();
    expect(container.textContent).toBe("編號 #12 - 已完成");
  });
});
