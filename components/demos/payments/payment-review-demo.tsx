"use client";
// /payment review in a command channel (outside the ticket categories, so without a payment ID
// it looks up the customer's own latest order): first while the order is waiting for payment,
// then again after paying. ReviewStates shows the three answers side by side behind tabs.
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  MessageWindow,
  SnapshotMessage,
  SnapshotTabs,
  stepper,
  type CanvasPoint,
  type InputState,
  type SceneLayout,
} from "@/components/demo";
import { slashCommand } from "@/lib/commands";
import { DEMO_CHANNELS, type SnapshotId } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const CMD = slashCommand("payment review");
const CHANNEL = DEMO_CHANNELS.command.name;

export type Screen = { input: InputState; replies: ("pending" | "complete")[] };
type Targets = { typing: CanvasPoint };
type Layout = SceneLayout<Targets>;

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout = {
  w: 640,
  h: 640,
  at: {
    typing: { x: 330, y: 602 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 680,
  at: {
    typing: { x: 300, y: 642 },
  },
};

function timeline(l: Layout) {
  const { steps, step, point } = stepper<Screen>(l, { input: { kind: "empty" }, replies: [] });
  const typing = point(l.at.typing, { typing: true });
  const ask = (at: number, replies: Screen["replies"], caption: string, reply: string) => {
    step(at, {}, { caption, cursor: typing });
    step(at + 300, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
    step(at + 700, { input: { kind: "typing", typed: "/payment re" } });
    step(at + 1100, { input: { kind: "typing", typed: "/payment review" } });
    step(at + 1700, { input: { kind: "options", options: [] } });
    step(at + 2300, { input: { kind: "empty" }, replies }, {
      caption: reply,
      cursor: { ...typing, hidden: true },
    });
  };
  step(0, {}, { cursor: { ...typing, hidden: true } });
  ask(400, ["pending"], "顧客輸入 /payment review，不填付款編號", "查到自己最近一筆訂單：「付款進度：尚未付款／待入帳」");
  ask(6000, ["pending", "complete"], "付款之後再查一次", "變成「付款進度：已繳費」，附上付款時間");
  // Holds on the second answer before the loop starts over.
  step(11800, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function PaymentReviewScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return (
    <DiscordScene
      layout={layout}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: CHANNEL,
          input: <CommandInput input={screen.input} channel={CHANNEL} command={CMD} />,
          messages: screen.replies.map((status, i) => (
            <ChatMessage key={status} from="bot" command={{ by: "buyer", name: CMD.name }} ago={screen.replies.length - 1 - i} enter>
              <SnapshotMessage id={`builder/payment_review/${status}`} scenario={SCENARIO} />
            </ChatMessage>
          )),
        },
      ]}
    />
  );
}

export function PaymentReviewDemo() {
  return (
    <DiscordDemo
      label="示範：顧客輸入 /payment review，機器人回覆最近一筆訂單尚未付款；付款後再查一次，變成已繳費並附上付款時間"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <PaymentReviewScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
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
  return (
    <SnapshotTabs
      label="三種訂單狀態的查詢結果"
      tabs={STATES.map((s) => ({
        tab: s.tab,
        label: `${s.tab}訂單的查詢結果`,
        content: (
          <MessageWindow channel={CHANNEL} command={{ by: "buyer", name: CMD.name }}>
            <SnapshotMessage id={s.id} scenario={SCENARIO} />
          </MessageWindow>
        ),
      }))}
    />
  );
}
