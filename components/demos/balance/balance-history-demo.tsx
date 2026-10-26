"use client";
// /balance history over two pages: the customer's page 1 of 5 records, ▶️ to page 2, then
// 統計表 (page 0) and 伺服器排行榜 (page -1, the server allows the leaderboard). The same message
// is edited each time; the screens are one fixture's seven records (91 points in all).
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasPoint,
  type InputState,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.balanceHistoryPages;
const CMD = slashCommand("balance history");
const MODE = optionPill(CMD, "mode", "公開顯示");
const CHANNEL = DEMO_CHANNELS.command.name;

export const PAGES = {
  1: "builder/balance_history/page=1/admin=False",
  2: "builder/balance_history/page=2/admin=False",
  0: "builder/balance_history/page=0/admin=False",
  [-1]: "builder/balance_history/page=-1/admin=False",
} as const satisfies Record<number, SnapshotId>;
type Page = keyof typeof PAGES;

type Layout = SceneLayout<{
  typing: CanvasPoint;
  /** ▶️ on page 1, 統計表 on page 2, 伺服器排行榜 on page 0 (each the button the step presses). */
  next: CanvasPoint;
  stats: CanvasPoint;
  leaderboard: CanvasPoint;
  aside: CanvasPoint;
}>;
export type Screen = { panes: Pane[] };

/** Measured on a temporary dev page under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout = {
  w: 640,
  h: 760,
  at: {
    typing: { x: 200, y: 722 },
    next: { x: 250, y: 666 },
    stats: { x: 323, y: 666 },
    leaderboard: { x: 340, y: 666 },
    aside: { x: 600, y: 400 },
  },
};
const NARROW: Layout = {
  // 420 wide, so the embeds' 14 px text is 11 px or more on a 341 px stage (at 460 it was 10.4).
  // The four buttons of pages 1 and 2 stay on one row with and without the kit's sm: paddings;
  // on the statistics page 伺服器排行榜 wraps under the others with them (viewports 768–918 px,
  // where the stage is under 600 px), so the cursor aims at the phone's one-row position.
  w: 420,
  h: 800,
  at: {
    typing: { x: 200, y: 762 },
    next: { x: 250, y: 706 },
    stats: { x: 323, y: 706 },
    leaderboard: { x: 340, y: 706 },
    aside: { x: 404, y: 400 },
  },
};

const channel = (input: InputState, page: Page | null): Pane[] => [
  {
    id: "channel",
    kind: "channel",
    title: CHANNEL,
    input: <CommandInput input={input} channel={CHANNEL} command={CMD} />,
    messages: page !== null && (
      <ChatMessage from="bot" command={{ by: "buyer", name: CMD.name }}>
        <div key={page} className="demo-in">
          <SnapshotMessage id={PAGES[page]} scenario={SCENARIO} />
        </div>
      </ChatMessage>
    ),
  },
];

function timeline(l: Layout) {
  const { steps, step, point } = stepper<Screen>(l, { panes: [] });
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): InputState => ({ kind: "typing", typed: t });
  const empty: InputState = { kind: "empty" };
  const press = (at: number, where: CanvasPoint, page: Page) => {
    step(at + 800, {}, { cursor: point(where, { click: true }) });
    step(at + 1100, { panes: channel(empty, page) }, { cursor: point(l.at.aside) });
  };

  step(0, { panes: channel(empty, null) }, {
    caption: `顧客輸入 /balance history，${MODE.name}選「${MODE.value}」`,
    shot: { zoom: 1 },
    cursor: typing,
  });
  step(300, { panes: channel(typed("/bal"), null) }, { cursor: { ...typing, click: true } });
  step(600, { panes: channel(typed("/balance hi"), null) });
  step(900, { panes: channel(typed("/balance history"), null) });
  step(1500, { panes: channel({ kind: "options", options: [MODE] }, null) });
  step(2400, { panes: channel(empty, 1) }, {
    caption: "第 1 頁列出最近的點數異動，一頁 5 筆",
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(4000, {}, { caption: "按「▶️」翻到第 2 頁，看比較早的紀錄", cursor: point(l.at.next) });
  press(4000, l.at.next, 2);
  step(6500, {}, { caption: "按「統計表」看總轉入、總轉出和交易日期", cursor: point(l.at.stats) });
  press(6500, l.at.stats, 0);
  step(9000, {}, { caption: "再按「伺服器排行榜」看前 10 名和自己的排名", cursor: point(l.at.leaderboard) });
  press(9000, l.at.leaderboard, -1);
  step(12500, {}, { cursor: { ...point(l.at.aside), hidden: true } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceHistoryDemo() {
  return (
    <DiscordDemo
      label="示範：顧客輸入 /balance history，看到第 1 頁的點數紀錄，按向右箭頭翻到第 2 頁，按統計表看統計數據，再按伺服器排行榜看前 10 名和自己的排名"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DiscordScene layout={layout} panes={step.screen.panes} />}
    </DiscordDemo>
  );
}
