"use client";
// /payment history shown to everyone: page 1 of the customer's completed payments (three per
// page), ▶️ to page 2 (the fourth order), then the 統計表 button turns the same message into the
// statistics (page 0). The history snapshots carry their own fixed orders and totals
// (tests/snapshots/ui.json): four orders of 135, 540 in all.
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
  type SceneLayout,
} from "@/components/demo";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const CMD = slashCommand("payment history");
const CHANNEL = DEMO_CHANNELS.command.name;
const MODE = optionPill(CMD, "mode", "公開顯示");

export const PAGES = {
  1: "flow/payment_history_command/1",
  2: "builder/payment_history/page=2",
  0: "flow/payment_history_command/0",
} as const satisfies Record<number, SnapshotId>;

export type Screen = { input: InputState; page: null | keyof typeof PAGES };
/** `next` is ▶️ on page 1, `stats` 統計表 on page 2 (the fourth button on both pages). */
type Targets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea; next: CanvasPoint; stats: CanvasPoint; aside: CanvasPoint };
type Layout = SceneLayout<Targets>;

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout = {
  w: 640,
  h: 700,
  at: {
    typing: { x: 330, y: 662 },
    input: { x: 0, y: 490, w: 640, h: 210 },
    reply: { x: 40, y: 125, w: 600, h: 505 },
    next: { x: 250, y: 606 },
    stats: { x: 325, y: 606 },
    aside: { x: 620, y: 400 },
  },
};
const NARROW: Layout = {
  // 460 wide so the four buttons stay on one row at every viewport (at 400 統計表 wraps to a
  // second row with the kit's sm: paddings and stays on the first without them).
  w: 460,
  h: 760,
  at: {
    typing: { x: 300, y: 722 },
    input: { x: 0, y: 550, w: 460, h: 210 },
    reply: { x: 20, y: 185, w: 440, h: 505 },
    next: { x: 250, y: 666 },
    stats: { x: 323, y: 666 },
    aside: { x: 452, y: 420 },
  },
};

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, { input: { kind: "empty" }, page: null });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "顧客輸入 /payment history", shot: zoom(1.8, l.at.input), cursor: typing });
  step(300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(700, { input: { kind: "typing", typed: "/payment hi" } });
  step(1100, { input: { kind: "typing", typed: "/payment history" } });
  step(1800, { input: { kind: "options", options: [MODE] } }, { caption: `顯示模式選「${MODE.value}」後送出` });
  step(2900, { input: { kind: "empty" }, page: 1 }, {
    caption: "列出已完成的付款，每頁 3 筆",
    shot: zoom(1.2, l.at.reply),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(4800, {}, { caption: "按「▶️」翻到第 2 頁，看第 4 筆", cursor: point(l.at.next) });
  step(5600, {}, { cursor: point(l.at.next, { click: true }) });
  step(5900, { page: 2 }, { cursor: point(l.at.aside) });
  step(7300, {}, { caption: "按「統計表」", cursor: point(l.at.stats) });
  step(8100, {}, { cursor: point(l.at.stats, { click: true }) });
  step(8400, { page: 0 }, { caption: "同一則訊息換成統計數據", cursor: point(l.at.aside) });
  step(12000, {}, { shot: { zoom: 1 }, cursor: { ...point(l.at.aside), hidden: true } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function PaymentHistoryScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return (
    <DiscordScene
      layout={layout}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: CHANNEL,
          input: <CommandInput input={screen.input} channel={CHANNEL} command={CMD} />,
          messages: screen.page !== null && (
            <ChatMessage from="bot" command={{ by: "buyer", name: CMD.name }}>
              <div key={screen.page} className={screen.page === 1 ? "demo-in" : ""}>
                <SnapshotMessage id={PAGES[screen.page]} scenario={SCENARIO} />
              </div>
            </ChatMessage>
          ),
        },
      ]}
    />
  );
}

export function PaymentHistoryDemo() {
  return (
    <DiscordDemo
      label="示範：顧客輸入 /payment history 選公開顯示，機器人列出第 1 頁的已完成付款；按向右箭頭翻到第 2 頁，再按統計表，同一則訊息換成消費統計"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <PaymentHistoryScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
