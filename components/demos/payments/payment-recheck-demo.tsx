"use client";
// /payment recheck in a ticket channel: the customer says they paid, the merchant runs the
// command without a payment ID (the channel's last unpaid order), SmilePay says it is paid, and
// the order completes exactly as after SmilePay's own notice: the payment complete message in
// the channel, the channel renamed and moved. RecheckAllDemo is the scan_all progress message.
// Channel and category names are illustrative (the bot has no default names).
import { useRef } from "react";
import { Canvas, DemoStage, SnapshotMessage, useWidth, zoomTo } from "@/components/demo";
import { Message } from "@/components/discord";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import {
  ADMIN,
  BOT,
  BUYER,
  CommandInput,
  LIST_W,
  NARROW_BELOW,
  Screen,
  TicketCategories,
  optionPill,
  paymentSub,
  stepper,
  time,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type Layout,
} from "./kit";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const SUB = paymentSub("recheck");

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

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout<Targets> = {
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
const NARROW: Layout<Targets> = {
  w: 400,
  h: 760,
  left: 0,
  list: false,
  at: {
    typing: { x: 300, y: 722 },
    input: { x: 0, y: 550, w: 400, h: 210 },
    result: { x: 20, y: 190, w: 380, h: 500 },
  },
};

function timeline(l: Layout<Targets>) {
  const { steps, step, point } = stepper<Screen>(l, { input: { kind: "empty" }, done: false });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "顧客說已經付款，頻道還在待付款", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(2000, {}, { caption: "商家在訂單頻道輸入 /payment recheck", shot: zoomTo(l, 1.8, l.at.input), cursor: typing });
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
  step(7800, {}, { shot: zoomTo(l, 1.15, l.at.result) });
  step(11500, {}, { shot: { zoom: 1 } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function PaymentRecheckScreen({ screen, layout }: { screen: Screen; layout: Layout<Targets> }) {
  const channel = screen.done ? CHANNEL.complete : CHANNEL.pending;
  return (
    <Screen
      layout={layout}
      title={channel.name}
      list={<TicketCategories here={channel} categories={CATEGORIES} />}
      input={<CommandInput input={screen.input} channel={channel.name} command="payment recheck" description={SUB.description} />}
    >
      <Message author={BOT.name} avatar={BOT.avatar} bot time={time(40)}>
        <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
      </Message>
      <Message author={BUYER.name} avatar={BUYER.avatar} time={time(3)}>
        我剛剛在超商付好了
      </Message>
      {screen.done && (
        <>
          {/* The deferred reply keeps its place; the payment complete notice is posted under it. */}
          <Message
            author={BOT.name}
            avatar={BOT.avatar}
            bot
            time={time()}
            interaction={{ user: ADMIN.name, avatar: ADMIN.avatar, command: "payment recheck" }}
          >
            <div className="demo-in">
              <SnapshotMessage id="flow/payment_recheck/paid" scenario={SCENARIO} />
            </div>
          </Message>
          <Message author={BOT.name} avatar={BOT.avatar} bot time={time()}>
            <div className="demo-in">
              <SnapshotMessage id="builder/payment_complete" scenario={SCENARIO} />
            </div>
          </Message>
        </>
      )}
    </Screen>
  );
}

export function PaymentRecheckDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? WIDE : NARROW;
  const steps = wide ? WIDE_STEPS : NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        key={wide ? "wide" : "narrow"}
        label="示範：顧客說已經付款，商家在訂單頻道輸入 /payment recheck；速買配回報已付款，機器人回覆查詢結果並貼出付款完成通知，頻道改名並移到已付款的分類"
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <PaymentRecheckScreen screen={steps[index].screen} layout={layout} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}

// ---- scan_all ----

const SCAN_ALL = optionPill(SUB, "scan_all", 1);
const COMMAND_CHANNEL = DEMO_CHANNELS.command.name;

export type AllScreen = { input: InputState; progress: null | "started" | "progress" };
type AllTargets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea };

const ALL_WIDE: Layout<AllTargets> = {
  w: 640,
  h: 520,
  left: 0,
  list: false,
  at: {
    typing: { x: 610, y: 482 },
    input: { x: 0, y: 330, w: 640, h: 190 },
    reply: { x: 40, y: 330, w: 600, h: 130 },
  },
};
const ALL_NARROW: Layout<AllTargets> = {
  w: 400,
  h: 560,
  left: 0,
  list: false,
  at: {
    typing: { x: 380, y: 522 },
    input: { x: 0, y: 370, w: 400, h: 190 },
    reply: { x: 20, y: 370, w: 380, h: 130 },
  },
};

function allTimeline(l: Layout<AllTargets>) {
  const { steps, step, point } = stepper<AllScreen>(l, { input: { kind: "empty" }, progress: null });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "商家輸入 /payment recheck", shot: zoomTo(l, 1.6, l.at.input), cursor: typing });
  step(300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(700, { input: { kind: "typing", typed: "/payment rech" } });
  step(1100, { input: { kind: "typing", typed: "/payment recheck" } });
  step(1800, { input: { kind: "options", options: [SCAN_ALL] } }, { caption: "「檢查所有未付款訂單」選「(謹慎使用) 複查伺服器內所有未付款的訂單」" });
  step(3800, { input: { kind: "empty" }, progress: "started" }, {
    caption: "機器人列出要檢查幾筆，開始一筆一筆查",
    shot: zoomTo(l, 1.6, l.at.reply),
    cursor: { ...typing, hidden: true },
  });
  step(6300, { progress: "progress" }, { caption: "每查完 5 筆，同一則訊息更新一次進度" });
  step(9500, {}, { shot: { zoom: 1 } });
  return steps;
}

export const ALL_LAYOUTS = { wide: ALL_WIDE, narrow: ALL_NARROW };
export const ALL_WIDE_STEPS = allTimeline(ALL_WIDE);
export const ALL_NARROW_STEPS = allTimeline(ALL_NARROW);

export function RecheckAllScreen({ screen, layout }: { screen: AllScreen; layout: Layout<AllTargets> }) {
  return (
    <Screen
      layout={layout}
      title={COMMAND_CHANNEL}
      input={<CommandInput input={screen.input} channel={COMMAND_CHANNEL} command="payment recheck" description={SUB.description} />}
    >
      {screen.progress && (
        <Message
          author={BOT.name}
          avatar={BOT.avatar}
          bot
          time={time()}
          interaction={{ user: ADMIN.name, avatar: ADMIN.avatar, command: "payment recheck" }}
        >
          <div key={screen.progress} className={screen.progress === "started" ? "demo-in" : ""}>
            <SnapshotMessage
              id={screen.progress === "started" ? "text/payment/recheck_all_started" : "text/payment/recheck_all_progress"}
              scenario={SCENARIO}
            />
          </div>
        </Message>
      )}
    </Screen>
  );
}

export function RecheckAllDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? ALL_WIDE : ALL_NARROW;
  const steps = wide ? ALL_WIDE_STEPS : ALL_NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        key={wide ? "wide" : "narrow"}
        label="示範：商家輸入 /payment recheck 並選擇複查伺服器內所有未付款的訂單，機器人回覆共要檢查 12 筆，之後每查完 5 筆就更新進度"
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <RecheckAllScreen screen={steps[index].screen} layout={layout} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}
