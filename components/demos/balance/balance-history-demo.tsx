"use client";
// /balance history: the customer's first page of records, then 統計表 (page 0), then
// 伺服器排行榜 (page -1, the server allows the leaderboard). The same message is edited each time.
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.balanceHistory;
const CMD = slashCommand("balance history");
const MODE = optionPill(CMD, "mode", "公開顯示");
const CHANNEL = DEMO_CHANNELS.command.name;

const PAGES = {
  1: "flow/balance_history_command/1",
  0: "flow/balance_history_command/0",
  [-1]: "flow/balance_history_command/-1",
} as const satisfies Record<number, SnapshotId>;
type Page = keyof typeof PAGES;

type Layout = SceneLayout<{
  typing: CanvasPoint;
  input: CanvasArea;
  reply: CanvasArea;
  stats: CanvasPoint;
  leaderboard: CanvasPoint;
  aside: CanvasPoint;
}>;
export type Screen = { panes: Pane[] };

const WIDE: Layout = {
  w: 640,
  h: 720,
  at: {
    typing: { x: 200, y: 682 },
    input: { x: 0, y: 520, w: 520, h: 200 },
    reply: { x: 0, y: 200, w: 640, h: 460 },
    stats: { x: 323, y: 626 },
    leaderboard: { x: 340, y: 626 },
    aside: { x: 600, y: 400 },
  },
};
const NARROW: Layout = {
  // 460 wide so the four buttons stay on one row at every viewport (at 400 they wrap
  // differently with and without the kit's sm: paddings).
  w: 460,
  h: 760,
  at: {
    typing: { x: 200, y: 722 },
    input: { x: 0, y: 560, w: 460, h: 200 },
    reply: { x: 0, y: 250, w: 460, h: 440 },
    stats: { x: 323, y: 666 },
    leaderboard: { x: 340, y: 666 },
    aside: { x: 444, y: 400 },
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
  const { steps, step, point, zoom } = stepper<Screen>(l, { panes: [] });
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): InputState => ({ kind: "typing", typed: t });
  const empty: InputState = { kind: "empty" };

  step(0, { panes: channel(empty, null) }, {
    caption: `顧客輸入 /balance history，${MODE.name}選「${MODE.value}」`,
    shot: zoom(1.6, l.at.input),
    cursor: typing,
  });
  step(300, { panes: channel(typed("/bal"), null) }, { cursor: { ...typing, click: true } });
  step(600, { panes: channel(typed("/balance hi"), null) });
  step(900, { panes: channel(typed("/balance history"), null) });
  step(1600, { panes: channel({ kind: "options", options: [MODE] }, null) });
  step(2800, { panes: channel(empty, 1) }, {
    caption: "第 1 頁列出最近的點數異動，一頁 5 筆",
    shot: zoom(1.3, l.at.reply),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(4600, {}, { caption: "按「統計表」看總轉入、總轉出和交易日期", cursor: point(l.at.stats) });
  step(5400, {}, { cursor: point(l.at.stats, { click: true }) });
  step(5700, { panes: channel(empty, 0) }, { cursor: point(l.at.aside) });
  step(7600, {}, { caption: "再按「伺服器排行榜」看前 10 名和自己的排名", cursor: point(l.at.leaderboard) });
  step(8400, {}, { cursor: point(l.at.leaderboard, { click: true }) });
  step(8700, { panes: channel(empty, -1) }, { cursor: point(l.at.aside) });
  step(11000, {}, { shot: { zoom: 1 }, cursor: { ...point(l.at.aside), hidden: true } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceHistoryDemo() {
  return (
    <DiscordDemo
      label="示範：顧客輸入 /balance history，看到第 1 頁的點數紀錄，按統計表看統計數據，再按伺服器排行榜看前 10 名和自己的排名"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DiscordScene layout={layout} panes={step.screen.panes} />}
    </DiscordDemo>
  );
}
