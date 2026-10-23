// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import {
  Attachment,
  ChannelList,
  ChatInput,
  DiscordMarkdown,
  DmWindow,
  Embed,
  Ephemeral,
  Message,
  Modal,
  SlashPicker,
  VoiceChannel,
} from "./index";

describe("Modal", () => {
  it("shows the title, every field label and the 提交 button", () => {
    render(
      <Modal
        title="表單標題"
        fields={[
          { label: "欄位一", required: true },
          { label: "欄位二", value: "已填的值" },
          { label: "欄位三", placeholder: "提示文字" },
        ]}
      />,
    );
    expect(screen.getByText("表單標題")).toBeTruthy();
    for (const label of ["欄位一", "欄位二", "欄位三"]) expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText("已填的值")).toBeTruthy();
    expect(screen.getByText("提示文字")).toBeTruthy();
    expect(screen.getByText("提交")).toBeTruthy();
    expect(screen.getByText("取消")).toBeTruthy();
  });

  it("uses submitLabel when given", () => {
    render(<Modal title="t" fields={[]} submitLabel="送出" />);
    expect(screen.getByText("送出")).toBeTruthy();
    expect(screen.queryByText("提交")).toBeNull();
  });
});

describe("Ephemeral", () => {
  it("shows the content and the 只有你看得到這則訊息 line", () => {
    render(<Ephemeral>內容</Ephemeral>);
    expect(screen.getByText("內容")).toBeTruthy();
    expect(screen.getByText("只有你看得到這則訊息")).toBeTruthy();
    expect(screen.getByText("關閉訊息")).toBeTruthy();
  });
});

describe("ChannelList", () => {
  it("shows category and channel names", () => {
    render(
      <ChannelList
        categories={[
          { name: "分類甲", channels: [{ name: "頻道一" }, { name: "頻道二", highlight: true }] },
          { name: "分類乙", channels: [{ name: "頻道三" }] },
        ]}
      />,
    );
    for (const text of ["分類甲", "分類乙", "頻道一", "頻道二", "頻道三"]) {
      expect(screen.getByText(text)).toBeTruthy();
    }
  });
});

describe("ChannelList kinds", () => {
  it("draws text channels by default and voice channels when asked", () => {
    const { container } = render(
      <ChannelList
        categories={[{ name: "分類", channels: [{ name: "文字" }, { name: "語音", kind: "voice", highlight: true }] }]}
      />,
    );
    const kinds = [...container.querySelectorAll("[data-kind]")].map((el) => [el.textContent, el.getAttribute("data-kind")]);
    expect(kinds).toEqual([
      ["文字", "text"],
      ["語音", "voice"],
    ]);
  });
});

describe("ChatInput", () => {
  it("shows the channel placeholder, the DM placeholder, or the text being typed", () => {
    const { unmount } = render(<ChatInput channel="指令區" />);
    expect(screen.getByText("傳送訊息到 #指令區")).toBeTruthy();
    unmount();
    const dm = render(<ChatInput dm="FunI 付款系統" />);
    expect(screen.getByText("傳送訊息給 @FunI 付款系統")).toBeTruthy();
    dm.unmount();
    render(<ChatInput dm="FunI 付款系統" typed="在嗎？" />);
    expect(screen.getByText("在嗎？")).toBeTruthy();
    expect(screen.queryByText(/傳送訊息/)).toBeNull();
  });
});

describe("VoiceChannel", () => {
  it("shows the channel name", () => {
    render(<VoiceChannel name="語音頻道" />);
    expect(screen.getByText("語音頻道")).toBeTruthy();
  });
});

describe("Embed", () => {
  it("draws the left bar in the given numeric colour", () => {
    const { container } = render(<Embed color={0x00b7ff} title="標題" />);
    const article = container.querySelector("article") as HTMLElement;
    expect(article.style.borderLeftColor).toBe("rgb(0, 183, 255)");
  });

  it("pads small numeric colours to six hex digits", () => {
    const { container } = render(<Embed color={0x0fae22} title="標題" />);
    const article = container.querySelector("article") as HTMLElement;
    expect(article.style.borderLeftColor).toBe("rgb(15, 174, 34)");
  });

  it("still accepts a CSS colour string", () => {
    const { container } = render(<Embed color="#2b3f5e" title="標題" />);
    const article = container.querySelector("article") as HTMLElement;
    expect(article.style.borderLeftColor).toBe("rgb(43, 63, 94)");
  });

  it("draws Discord markdown in the title instead of the raw markers", () => {
    const { container } = render(<Embed color={0x00b7ff} title="您總共消費了：__540 新台幣__ **共** 4 筆" />);
    expect(container.textContent).toBe("您總共消費了：540 新台幣 共 4 筆");
    expect(container.querySelector("u")?.textContent).toBe("540 新台幣");
    expect(container.querySelector("strong")?.textContent).toBe("共");
  });
});

describe("Message", () => {
  const interaction = { user: "商家", avatar: { initial: "商", color: "#5865f2" }, command: "fp" };

  it("shows 使用了 when usedLabel is not given", () => {
    render(<Message author="bot" avatar="/a.png" interaction={interaction} />);
    expect(screen.getByText("使用了")).toBeTruthy();
    expect(screen.getByText("/fp")).toBeTruthy();
  });

  it("keeps formatted text on one line: the fragments share a single block", () => {
    const { container } = render(
      <Message author="bot" avatar="/a.png">
        <DiscordMarkdown text="一般 **粗體** 文字" />
      </Message>,
    );
    const bold = screen.getByText("粗體");
    const block = bold.parentElement as HTMLElement;
    expect(block.tagName).toBe("DIV");
    // Not the flex-col content column itself, where each fragment would be its own flex item.
    expect(block.classList.contains("flex-col")).toBe(false);
    expect(block.textContent).toBe("一般 粗體 文字");
    expect(container.querySelectorAll("strong")).toHaveLength(1);
  });

  it("wraps a run of text and inline elements into one block, leaving blocks alone", () => {
    render(
      <Message author="bot" avatar="/a.png">
        前面 <strong>粗</strong> 後面
        <article>embed</article>
      </Message>,
    );
    const run = screen.getByText("粗").parentElement as HTMLElement;
    expect(run.tagName).toBe("DIV");
    expect(run.classList.contains("flex-col")).toBe(false);
    expect(run.textContent).toBe("前面 粗 後面");
    const embed = screen.getByText("embed");
    expect(embed.parentElement).toBe(run.parentElement);
  });

  it("uses usedLabel when given", () => {
    render(<Message author="bot" avatar="/a.png" interaction={interaction} usedLabel="用了" />);
    expect(screen.getByText("用了")).toBeTruthy();
    expect(screen.queryByText("使用了")).toBeNull();
  });
});

describe("SlashPicker", () => {
  it("shows the app name it is given", () => {
    render(<SlashPicker command="fp" description="建立付款" appName="示範應用" />);
    expect(screen.getAllByText("示範應用").length).toBeGreaterThan(0);
  });

  it("holds one pill per filled option, in order, with the popup gone", () => {
    const { container, rerender } = render(
      <SlashPicker
        command="balance transfer"
        description="轉移點數"
        appName="示範應用"
        options={[
          { name: "接收者", value: "@會員" },
          { name: "金額", value: "150" },
          { name: "備註", value: "團購" },
        ]}
      />,
    );
    const pills = () => [...container.querySelectorAll("[data-slash-option]")].map((p) => p.textContent);
    expect(pills()).toEqual(["接收者@會員", "金額150", "備註團購"]);
    expect(screen.queryByText("轉移點數")).toBeNull();
    // The single `option` is the same as a one-pill list; an empty list is the bare command.
    rerender(<SlashPicker command="fp" description="建立付款" appName="示範應用" option={{ name: "金額", value: "500" }} />);
    expect(pills()).toEqual(["金額500"]);
    rerender(<SlashPicker command="fp" description="建立付款" appName="示範應用" options={[]} />);
    expect(pills()).toEqual([]);
    expect(screen.queryByText("建立付款")).toBeNull();
  });
});

describe("DmWindow", () => {
  it("shows the peer's name in the header and the messages", () => {
    render(
      <DmWindow peer="顧客" avatar={{ initial: "顧", color: "#3ba55c" }}>
        <p>訊息</p>
      </DmWindow>,
    );
    expect(screen.getByText("顧客")).toBeTruthy();
    expect(screen.getByText("訊息")).toBeTruthy();
  });
});

describe("Attachment", () => {
  it("renders the image with its size and alt text", () => {
    render(<Attachment src="/barcode.png" alt="條碼" width={300} height={120} />);
    const img = screen.getByAltText("條碼") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/barcode.png");
    expect(img.getAttribute("width")).toBe("300");
    expect(img.getAttribute("height")).toBe("120");
  });
});

describe("DiscordMarkdown lists and code", () => {
  it("draws `code` as inline code", () => {
    const { container } = render(<DiscordMarkdown text="就能用 `/fp` 建立" />);
    expect(container.querySelector("code")?.textContent).toBe("/fp");
    expect(container.textContent).toBe("就能用 /fp 建立");
  });

  it("draws 「N. 」 lines as one numbered list, keeping the text around it", () => {
    const { container } = render(<DiscordMarkdown text={"**開始使用**\n1. 第一步\n2. 第二步 **粗**\n\n之後"} />);
    const items = [...container.querySelectorAll("ol > li")].map((li) => li.textContent);
    expect(items).toEqual(["第一步", "第二步 粗"]);
    expect(container.querySelector("ol")?.getAttribute("start")).toBe("1");
    expect(container.querySelector("strong")?.textContent).toBe("開始使用");
    expect(container.textContent?.endsWith("\n之後")).toBe(true);
  });
});
