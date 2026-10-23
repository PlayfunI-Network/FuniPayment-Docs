"use client";
// /payment recheck in a ticket channel: the customer says they paid, the merchant runs the
// command without a payment ID (the channel's last unpaid order), SmilePay says it is paid, and
// the order completes exactly as after SmilePay's own notice: the payment complete message in
// the channel, the channel renamed and moved. RecheckAllDemo is scan_all: the progress message
// edited as it goes (5/12, then 12/12) and the summary posted under it.
// Channel and category names are illustrative (the bot has no default names).
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  LIST_W,
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
import { TicketCategories } from "./kit";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const CMD = slashCommand("payment recheck");

const CHANNEL = {
  pending: { name: "待付款｜0042", category: "待付款" },
  complete: { name: "已付款｜0042", category: "已付款" },
} as const;
const CATEGORIES = [
  { name: "待付款", others: ["待付款｜0039"] },
  { name: "已付款", others: ["已付款｜0037"] },
];

export type Screen = { input: InputState; done: boolean };
type Targets = { typing: CanvasPoint; input: CanvasArea; result: CanvasArea };
type Layout = SceneLayout<Targets>;

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout = {
  w: LIST_W + 640,
  h: 720,
  left: LIST_W,
  list: true,
  at: {
    typing: { x: 330, y: 682 },
    input: { x: 0, y: 500, w: 640, h: 220 },
    result: { x: 40, y: 160, w: 600, h: 490 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {
    typing: { x: 300, y: 722 },
    input: { x: 0, y: 550, w: 400, h: 210 },
    result: { x: 20, y: 190, w: 380, h: 500 },
  },
};

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, { input: { kind: "empty" }, done: false });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "顧客說已經付款，頻道還在待付款", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(2000, {}, { caption: "商家在訂單頻道輸入 /payment recheck", shot: zoom(1.8, l.at.input), cursor: typing });
  step(2300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(2700, { input: { kind: "typing", typed: "/payment rech" } });
  step(3100, { input: { kind: "typing", typed: "/payment recheck" } });
  step(3800, { input: { kind: "options", options: [] } }, { caption: "不填付款編號，查這個頻道最後一筆待付款訂單" });
  step(5000, { input: { kind: "empty" }, done: true }, {
    caption: "速買配回報已付款：付款完成通知貼到頻道，頻道改名、換分類",
    // The whole screen, so the renamed channel in its new category is in view.
    shot: { zoom: 1 },
    cursor: { ...typing, hidden: true },
  });
  step(7800, {}, { shot: zoom(1.15, l.at.result) });
  step(11500, {}, { shot: { zoom: 1 } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function PaymentRecheckScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const channel = screen.done ? CHANNEL.complete : CHANNEL.pending;
  return (
    <DiscordScene
      layout={layout}
      list={<TicketCategories here={channel} categories={CATEGORIES} />}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: channel.name,
          input: <CommandInput input={screen.input} channel={channel.name} command={CMD} />,
          messages: (
            <>
              <ChatMessage from="bot" ago={40}>
                <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
              </ChatMessage>
              <ChatMessage from="buyer" ago={3}>
                我剛剛在超商付好了
              </ChatMessage>
              {screen.done && (
                <>
                  {/* The deferred reply keeps its place; the payment complete notice is posted under it. */}
                  <ChatMessage from="bot" command={{ by: "admin", name: CMD.name }} enter>
                    <SnapshotMessage id="flow/payment_recheck/paid" scenario={SCENARIO} />
                  </ChatMessage>
                  <ChatMessage from="bot" enter>
                    <SnapshotMessage id="builder/payment_complete" scenario={SCENARIO} />
                  </ChatMessage>
                </>
              )}
            </>
          ),
        },
      ]}
    />
  );
}

export function PaymentRecheckDemo() {
  return (
    <DiscordDemo
      label="示範：顧客說已經付款，商家在訂單頻道輸入 /payment recheck；速買配回報已付款，機器人回覆查詢結果並貼出付款完成通知，頻道改名並移到已付款的分類"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <PaymentRecheckScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}

// ---- scan_all ----

const SCAN_ALL = optionPill(CMD, "scan_all", 1);
const COMMAND_CHANNEL = DEMO_CHANNELS.command.name;

/** The progress message as it is edited; `summary` is the followup sent once all are checked. */
const PROGRESS = {
  started: "text/payment/recheck_all_started",
  progress: "text/payment/recheck_all_progress",
  done: "text/payment/recheck_all_progress/12",
} as const satisfies Record<string, SnapshotId>;

export type AllScreen = { input: InputState; progress: null | keyof typeof PROGRESS; summary: boolean };
type AllTargets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea; summary: CanvasArea };
type AllLayout = SceneLayout<AllTargets>;

const ALL_WIDE: AllLayout = {
  w: 640,
  h: 520,
  at: {
    typing: { x: 610, y: 482 },
    input: { x: 0, y: 330, w: 640, h: 190 },
    reply: { x: 40, y: 330, w: 600, h: 130 },
    summary: { x: 40, y: 180, w: 600, h: 280 },
  },
};
const ALL_NARROW: AllLayout = {
  w: 400,
  h: 560,
  at: {
    typing: { x: 380, y: 522 },
    input: { x: 0, y: 370, w: 400, h: 190 },
    reply: { x: 20, y: 370, w: 380, h: 130 },
    summary: { x: 20, y: 200, w: 380, h: 300 },
  },
};

function allTimeline(l: AllLayout) {
  const { steps, step, point, zoom } = stepper<AllScreen>(l, { input: { kind: "empty" }, progress: null, summary: false });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "商家輸入 /payment recheck", shot: zoom(1.6, l.at.input), cursor: typing });
  step(300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(700, { input: { kind: "typing", typed: "/payment rech" } });
  step(1100, { input: { kind: "typing", typed: "/payment recheck" } });
  step(1800, { input: { kind: "options", options: [SCAN_ALL] } }, { caption: `「${SCAN_ALL.name}」選「${SCAN_ALL.value}」` });
  step(3800, { input: { kind: "empty" }, progress: "started" }, {
    caption: "機器人列出要檢查幾筆，開始一筆一筆查",
    shot: zoom(1.6, l.at.reply),
    cursor: { ...typing, hidden: true },
  });
  step(5800, { progress: "progress" }, { caption: "每查完 5 筆，同一則訊息更新一次進度" });
  step(7800, { progress: "done" }, { caption: "查完最後一筆，進度停在 12/12" });
  step(9300, { summary: true }, { caption: "接著貼出總結：幾筆更新成功、幾筆還沒付款", shot: zoom(1.3, l.at.summary) });
  step(12800, {}, { shot: { zoom: 1 } });
  return steps;
}

export const ALL_LAYOUTS = { wide: ALL_WIDE, narrow: ALL_NARROW };
export const ALL_WIDE_STEPS = allTimeline(ALL_WIDE);
export const ALL_NARROW_STEPS = allTimeline(ALL_NARROW);

export function RecheckAllScreen({ screen, layout }: { screen: AllScreen; layout: AllLayout }) {
  return (
    <DiscordScene
      layout={layout}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: COMMAND_CHANNEL,
          input: <CommandInput input={screen.input} channel={COMMAND_CHANNEL} command={CMD} />,
          messages: screen.progress && (
            <>
              <ChatMessage from="bot" command={{ by: "admin", name: CMD.name }}>
                <div key={screen.progress} className={screen.progress === "started" ? "demo-in" : ""}>
                  <SnapshotMessage id={PROGRESS[screen.progress]} scenario={SCENARIO} />
                </div>
              </ChatMessage>
              {screen.summary && (
                <ChatMessage from="bot" enter>
                  <SnapshotMessage id="text/payment/recheck_all_summary" scenario={SCENARIO} />
                </ChatMessage>
              )}
            </>
          ),
        },
      ]}
    />
  );
}

export function RecheckAllDemo() {
  return (
    <DiscordDemo
      label="示範：商家輸入 /payment recheck 並選擇複查伺服器內所有未付款的訂單，機器人回覆共要檢查 12 筆，每查完 5 筆就更新進度，查完 12 筆後貼出總結：更新成功 3 筆、尚未付款 9 筆"
      wide={{ layout: ALL_WIDE, steps: ALL_WIDE_STEPS }}
      narrow={{ layout: ALL_NARROW, steps: ALL_NARROW_STEPS }}
    >
      {(step, layout) => <RecheckAllScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
