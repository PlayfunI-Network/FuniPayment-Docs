// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { slashCommand } from "@/lib/commands";
import { DEMO_BOT, DEMO_PEOPLE, demoTime } from "@/lib/scenario";
import { ChatMessage, CommandInput, DiscordScene, DiscordStill, LIST_W, MessageWindow, stepper, type Pane } from "./discord-scene";
import { SnapshotTabs } from "./snapshot-tabs";

const CMD = slashCommand("payment create");

describe("stepper", () => {
  it("carries the screen over and applies each change from its step on", () => {
    const layout = { w: 400, h: 200, left: 0 };
    const { steps, step, point, zoom } = stepper(layout, { a: 1, b: "x" });
    step(0, {});
    step(100, { a: 2 }, { caption: "改 a" });
    step(200, { b: "y" });
    expect(steps.map((s) => s.screen)).toEqual([
      { a: 1, b: "x" },
      { a: 2, b: "x" },
      { a: 2, b: "y" },
    ]);
    expect(steps[1]).toMatchObject({ at: 100, caption: "改 a" });
    expect(point({ x: 200, y: 50 }, { click: true })).toEqual({ x: 0.5, y: 0.25, click: true });
    expect(zoom(2, { x: 0, y: 0, w: 200, h: 100 })).toEqual({ zoom: 2, focus: { x: 0, y: 0, w: 0.5, h: 0.5 } });
  });
});

describe("ChatMessage", () => {
  it("shows the sender, the time and the slash-command line", () => {
    render(
      <ChatMessage from="bot" command={{ by: "buyer", name: "payment create" }} ago={5}>
        內容
      </ChatMessage>,
    );
    expect(screen.getByText(DEMO_BOT.name)).toBeTruthy();
    expect(screen.getByText("APP")).toBeTruthy();
    expect(screen.getByText(DEMO_PEOPLE.buyer.name)).toBeTruthy();
    expect(screen.getByText("/payment create")).toBeTruthy();
    expect(screen.getByText(demoTime(5))).toBeTruthy();
  });

  it("slides the content in only when asked", () => {
    const { container, rerender } = render(<ChatMessage from="admin">文字</ChatMessage>);
    expect(container.querySelector(".demo-in")).toBeNull();
    expect(screen.queryByText("APP")).toBeNull();
    rerender(<ChatMessage from="admin" enter>文字</ChatMessage>);
    expect(container.querySelector(".demo-in")?.textContent).toBe("文字");
  });
});

describe("CommandInput", () => {
  it("is the empty input, the typed command with its popup, or the command with every filled option", () => {
    const { rerender, container } = render(<CommandInput input={{ kind: "empty" }} channel="指令區" command={CMD} />);
    expect(screen.getByText("傳送訊息到 #指令區")).toBeTruthy();
    rerender(<CommandInput input={{ kind: "typing", typed: "/payment cr" }} channel="指令區" command={CMD} />);
    expect(screen.getByText(CMD.description)).toBeTruthy();
    rerender(
      <CommandInput
        input={{ kind: "options", options: [{ name: "付款方式", value: "銀行轉帳" }, { name: "金額", value: "1200" }] }}
        channel="指令區"
        command={CMD}
      />,
    );
    expect(screen.queryByText(CMD.description)).toBeNull();
    expect([...container.querySelectorAll("[data-slash-option]")].map((p) => p.textContent)).toEqual(["付款方式銀行轉帳", "金額1200"]);
  });
});

describe("DiscordScene", () => {
  const panes: Pane[] = [
    { id: "channel", kind: "channel", title: "指令區", messages: <p>頻道訊息</p> },
    { id: "dm", kind: "dm", title: DEMO_BOT.name, tag: "顧客的私訊", grow: 0.5, messages: <p>私訊</p> },
  ];

  it("shares the height by grow, less a 1px line between the panes", () => {
    const { container } = render(<DiscordScene layout={{ w: 400, h: 301, at: {} }} panes={panes} />);
    const heights = [...container.querySelectorAll("[data-pane]")].map((el) => (el as HTMLElement).style.height);
    // 300px shared 2:1, then each pane loses its header and padding (68px).
    expect(heights).toEqual(["132px", "32px"]);
    expect(screen.getByText("顧客的私訊")).toBeTruthy();
  });

  it("shows the channel list only on a layout that has one", () => {
    const list = <nav>頻道列表</nav>;
    const { rerender } = render(<DiscordScene layout={{ w: 400, h: 300, at: {} }} list={list} panes={panes} />);
    expect(screen.queryByText("頻道列表")).toBeNull();
    rerender(<DiscordScene layout={{ w: LIST_W + 400, h: 300, left: LIST_W, list: true, at: {} }} list={list} panes={panes} />);
    expect(screen.getByText("頻道列表")).toBeTruthy();
  });
});

describe("MessageWindow and DiscordStill", () => {
  it("draws one message in a channel, or in the DM with the bot when no channel is given", () => {
    const { rerender } = render(<MessageWindow channel="ticket-0042">訂單</MessageWindow>);
    expect(screen.getByText("ticket-0042")).toBeTruthy();
    rerender(<MessageWindow>私訊內容</MessageWindow>);
    // The DM header and the message both show the bot's name.
    expect(screen.getAllByText(DEMO_BOT.name)).toHaveLength(2);
  });

  it("is one labelled image to assistive tech", () => {
    render(<DiscordStill label="畫面：私訊">內容</DiscordStill>);
    const img = screen.getByRole("img", { name: "畫面：私訊" });
    expect(img.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("SnapshotTabs", () => {
  it("shows one panel at a time and switches on click", () => {
    render(
      <SnapshotTabs
        label="分頁"
        tabs={[
          { tab: "一", label: "第一個", content: <p>內容一</p> },
          { tab: "二", label: "第二個", content: <p>內容二</p> },
        ]}
      />,
    );
    expect(screen.getByRole("tablist", { name: "分頁" })).toBeTruthy();
    expect(screen.getByText("內容一")).toBeTruthy();
    expect(screen.queryByText("內容二")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "二" }));
    expect(screen.getByRole("tab", { name: "二" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-label")).toBe("第二個");
    expect(screen.getByText("內容二")).toBeTruthy();
    expect(screen.queryByText("內容一")).toBeNull();
  });

  it("gives each tab list its own ids, so two on a page do not collide", () => {
    const tabs = [{ tab: "一", label: "一", content: null }];
    render(
      <>
        <SnapshotTabs label="甲" tabs={tabs} />
        <SnapshotTabs label="乙" tabs={tabs} />
      </>,
    );
    const ids = screen.getAllByRole("tabpanel").map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
  });
});
