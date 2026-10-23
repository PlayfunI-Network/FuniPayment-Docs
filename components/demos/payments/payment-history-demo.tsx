"use client";
// /payment history shown to everyone: page 1 of the customer's completed payments (three per
// page), then the 統計表 button turns the same message into the statistics (page 0). The
// history snapshots carry their own fixed orders and totals (tests/snapshots/ui.json).
import { useRef } from "react";
import { Canvas, DemoStage, SnapshotMessage, useWidth, zoomTo } from "@/components/demo";
import { Message } from "@/components/discord";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import {
  BOT,
  BUYER,
  CommandInput,
  NARROW_BELOW,
  Screen,
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
const SUB = paymentSub("history");
const CHANNEL = DEMO_CHANNELS.command.name;
const MODE = optionPill(SUB, "mode", "公開顯示");

export type Screen = { input: InputState; page: null | 1 | 0 };
type Targets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea; stats: CanvasPoint; aside: CanvasPoint };

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout<Targets> = {
  w: 640,
  h: 700,
  left: 0,
  list: false,
  at: {
    typing: { x: 330, y: 662 },
    input: { x: 0, y: 490, w: 640, h: 210 },
    reply: { x: 40, y: 125, w: 600, h: 505 },
    stats: { x: 325, y: 606 },
    aside: { x: 620, y: 400 },
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
    reply: { x: 20, y: 185, w: 380, h: 505 },
    stats: { x: 319, y: 666 },
    aside: { x: 392, y: 420 },
  },
};

function timeline(l: Layout<Targets>) {
  const { steps, step, point } = stepper<Screen>(l, { input: { kind: "empty" }, page: null });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "顧客輸入 /payment history", shot: zoomTo(l, 1.8, l.at.input), cursor: typing });
  step(300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(700, { input: { kind: "typing", typed: "/payment hi" } });
  step(1100, { input: { kind: "typing", typed: "/payment history" } });
  step(1800, { input: { kind: "options", options: [MODE] } }, { caption: "顯示模式選「公開顯示」後送出" });
  step(2900, { input: { kind: "empty" }, page: 1 }, {
    caption: "列出已完成的付款，每頁 3 筆",
    shot: zoomTo(l, 1.2, l.at.reply),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(5600, {}, { caption: "按「統計表」", cursor: point(l.at.stats) });
  step(6500, {}, { cursor: point(l.at.stats, { click: true }) });
  step(6800, { page: 0 }, { caption: "同一則訊息換成統計數據", cursor: point(l.at.aside) });
  step(10500, {}, { shot: { zoom: 1 }, cursor: { ...point(l.at.aside), hidden: true } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function PaymentHistoryScreen({ screen, layout }: { screen: Screen; layout: Layout<Targets> }) {
  return (
    <Screen
      layout={layout}
      title={CHANNEL}
      input={<CommandInput input={screen.input} channel={CHANNEL} command="payment history" description={SUB.description} />}
    >
      {screen.page !== null && (
        <Message
          author={BOT.name}
          avatar={BOT.avatar}
          bot
          time={time()}
          interaction={{ user: BUYER.name, avatar: BUYER.avatar, command: "payment history" }}
        >
          <div key={screen.page} className={screen.page === 1 ? "demo-in" : ""}>
            <SnapshotMessage id={`flow/payment_history_command/${screen.page}`} scenario={SCENARIO} />
          </div>
        </Message>
      )}
    </Screen>
  );
}

export function PaymentHistoryDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? WIDE : NARROW;
  const steps = wide ? WIDE_STEPS : NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        key={wide ? "wide" : "narrow"}
        label="示範：顧客輸入 /payment history 選公開顯示，機器人列出第 1 頁的已完成付款；按下統計表後，同一則訊息換成消費統計"
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <PaymentHistoryScreen screen={steps[index].screen} layout={layout} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}
