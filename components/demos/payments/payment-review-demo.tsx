"use client";
// /payment review in a command channel (outside the ticket categories, so without a payment ID
// it looks up the customer's own latest order): first while the order is waiting for payment,
// then again after paying. ReviewStates shows the three answers side by side behind tabs.
import { useRef, useState } from "react";
import { Canvas, DemoStage, SnapshotMessage, useWidth, zoomTo } from "@/components/demo";
import { DiscordWindow, Message } from "@/components/discord";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import {
  BOT,
  BUYER,
  CommandInput,
  NARROW_BELOW,
  Screen,
  paymentSub,
  stepper,
  time,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type Layout,
} from "./kit";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const SUB = paymentSub("review");
const CHANNEL = DEMO_CHANNELS.command.name;

export type Screen = { input: InputState; replies: ("pending" | "complete")[] };
type Targets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea };

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout<Targets> = {
  w: 640,
  h: 640,
  left: 0,
  list: false,
  at: {
    typing: { x: 330, y: 602 },
    input: { x: 0, y: 430, w: 640, h: 210 },
    reply: { x: 40, y: 150, w: 600, h: 420 },
  },
};
const NARROW: Layout<Targets> = {
  w: 400,
  h: 680,
  left: 0,
  list: false,
  at: {
    typing: { x: 300, y: 642 },
    input: { x: 0, y: 470, w: 400, h: 210 },
    reply: { x: 20, y: 190, w: 380, h: 420 },
  },
};

function timeline(l: Layout<Targets>) {
  const { steps, step, point } = stepper<Screen>(l, { input: { kind: "empty" }, replies: [] });
  const typing = point(l.at.typing, { typing: true });
  const ask = (at: number, replies: Screen["replies"], caption: string, reply: string) => {
    step(at, {}, { caption, shot: zoomTo(l, 1.8, l.at.input), cursor: typing });
    step(at + 300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
    step(at + 700, { input: { kind: "typing", typed: "/payment re" } });
    step(at + 1100, { input: { kind: "typing", typed: "/payment review" } });
    step(at + 1700, { input: { kind: "options", options: [] } });
    step(at + 2300, { input: { kind: "empty" }, replies }, {
      caption: reply,
      shot: zoomTo(l, 1.3, l.at.reply),
      cursor: { ...typing, hidden: true },
    });
  };
  step(0, {}, { shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  ask(400, ["pending"], "顧客輸入 /payment review，不填付款編號", "查到自己最近一筆訂單：「付款進度：尚未付款／待入帳」");
  ask(6000, ["pending", "complete"], "付款之後再查一次", "變成「付款進度：已繳費」，附上付款時間");
  step(11800, {}, { shot: { zoom: 1 } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

function Reply({ status, minutesAgo }: { status: "pending" | "complete"; minutesAgo: number }) {
  return (
    <Message
      author={BOT.name}
      avatar={BOT.avatar}
      bot
      time={time(minutesAgo)}
      interaction={{ user: BUYER.name, avatar: BUYER.avatar, command: "payment review" }}
    >
      <div className="demo-in">
        <SnapshotMessage id={`builder/payment_review/${status}`} scenario={SCENARIO} />
      </div>
    </Message>
  );
}

export function PaymentReviewScreen({ screen, layout }: { screen: Screen; layout: Layout<Targets> }) {
  return (
    <Screen
      layout={layout}
      title={CHANNEL}
      input={<CommandInput input={screen.input} channel={CHANNEL} command="payment review" description={SUB.description} />}
    >
      {screen.replies.map((status, i) => (
        <Reply key={status} status={status} minutesAgo={screen.replies.length - 1 - i} />
      ))}
    </Screen>
  );
}

export function PaymentReviewDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? WIDE : NARROW;
  const steps = wide ? WIDE_STEPS : NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        key={wide ? "wide" : "narrow"}
        label="示範：顧客輸入 /payment review，機器人回覆最近一筆訂單尚未付款；付款後再查一次，變成已繳費並附上付款時間"
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <PaymentReviewScreen screen={steps[index].screen} layout={layout} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}

const STATES = [
  { id: "builder/payment_review/pending", tab: "待付款" },
  { id: "builder/payment_review/complete", tab: "已付款" },
  { id: "builder/payment_review/expired", tab: "已過期" },
] as const satisfies readonly { id: SnapshotId; tab: string }[];

export const REVIEW_STATES = STATES;

/** The three answers of /payment review, one at a time behind tabs (not animated). */
export function ReviewStates() {
  const [active, setActive] = useState(0);
  const state = STATES[active];
  return (
    <div className="not-prose my-6">
      <div role="tablist" aria-label="三種訂單狀態的查詢結果" className="mb-3 flex flex-wrap gap-2">
        {STATES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="review-states-panel"
            onClick={() => setActive(i)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              i === active
                ? "border-[var(--brand)] bg-[var(--brand)]/15 text-[var(--fg)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {s.tab}
          </button>
        ))}
      </div>
      <div id="review-states-panel" role="tabpanel" aria-label={`${state.tab}訂單的查詢結果`}>
        <DiscordWindow title={CHANNEL} kind="channel">
          <Message
            author={BOT.name}
            avatar={BOT.avatar}
            bot
            time={time()}
            interaction={{ user: BUYER.name, avatar: BUYER.avatar, command: "payment review" }}
          >
            <SnapshotMessage key={state.id} id={state.id} scenario={SCENARIO} />
          </Message>
        </DiscordWindow>
      </div>
    </div>
  );
}
