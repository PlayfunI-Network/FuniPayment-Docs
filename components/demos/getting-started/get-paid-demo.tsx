"use client";
// After the customer pays: the payment complete notice (builder/payment_complete) goes to the
// ticket channel (only for orders created in a ticket category), the payer's DMs and every log
// channel (app/bot/notifier.py payment_completed, send_to_dm_and_log); the ticket channel is then
// moved to the 付款完成時 category and renamed. One window at a time, with the ticket categories
// beside it on the wide layout. Channel names are examples a merchant could set on the dashboard.
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  LIST_W,
  SnapshotMessage,
  zoomTo,
  type CanvasArea,
  type Pane,
  type SceneLayout,
  type SceneStep,
} from "@/components/demo";
import { STAGES } from "../shared/channel-automation-screen";
import { TicketCategories } from "../shared/ticket-categories";
import { DEMO_BOT } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
/** Illustrative: the log channel picked in the wizard's 日誌頻道. */
const LOG_CHANNEL = "日誌";
const CATEGORIES = [
  { name: STAGES.pending.category, others: ["待付款｜0039"] },
  { name: STAGES.complete.category, others: ["已付款｜0037"] },
];

export type Screen = { paid: boolean; show: "channel" | "dm" | "log" };
type Targets = { message: CanvasArea; name: CanvasArea };
type Layout = SceneLayout<Targets>;

const WIDE: Layout = {
  w: LIST_W + 640,
  h: 700,
  left: LIST_W,
  list: true,
  at: {
    message: { x: 0, y: 220, w: 640, h: 480 },
    name: { x: -LIST_W, y: 0, w: LIST_W + 300, h: 420 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 720,
  at: {
    message: { x: 0, y: 230, w: 400, h: 490 },
    name: { x: 0, y: 0, w: 400, h: 300 },
  },
};

function timeline(l: Layout): SceneStep<Screen>[] {
  const message = zoomTo(l, 1.25, l.at.message);
  return [
    { at: 0, screen: { paid: false, show: "channel" }, caption: "顧客拿著條碼到超商付款", shot: { zoom: 1 } },
    { at: 2200, screen: { paid: true, show: "channel" }, caption: "速買配通知付款完成，訂單頻道收到付款完成通知", shot: message },
    { at: 5000, screen: { paid: true, show: "channel" }, caption: "訂單頻道換成「付款完成時」的名稱和分類", shot: zoomTo(l, 1.5, l.at.name) },
    { at: 7400, screen: { paid: true, show: "dm" }, caption: "付款者的私訊也收到同一則通知", shot: message },
    { at: 9800, screen: { paid: true, show: "log" }, caption: "日誌頻道也收到一份", shot: message },
    { at: 12200, screen: { paid: true, show: "channel" }, caption: "訂單頻道、付款者的私訊、日誌頻道都收到了", shot: { zoom: 1 } },
    { at: 14200, screen: { paid: true, show: "channel" } },
  ];
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

const notice = (
  <ChatMessage from="bot" enter>
    <SnapshotMessage id="builder/payment_complete" scenario={SCENARIO} />
  </ChatMessage>
);

export function GetPaidScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const here = screen.paid ? STAGES.complete : STAGES.pending;
  const panes: Record<Screen["show"], Pane> = {
    channel: {
      id: "channel",
      kind: "channel",
      title: here.name,
      tag: "訂單頻道",
      messages: (
        <>
          <ChatMessage from="bot" ago={20}>
            <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
          </ChatMessage>
          {screen.paid && notice}
        </>
      ),
    },
    dm: { id: "dm", kind: "dm", title: DEMO_BOT.name, tag: "付款者的私訊", messages: notice },
    log: { id: "log", kind: "channel", title: LOG_CHANNEL, tag: "日誌頻道", messages: notice },
  };
  return (
    <DiscordScene
      layout={layout}
      list={<TicketCategories here={here} categories={CATEGORIES} />}
      panes={[panes[screen.show]]}
    />
  );
}

export function GetPaidDemo() {
  return (
    <DiscordDemo
      label="示範：顧客付款後，機器人在訂單頻道送出付款完成通知，頻道從待付款｜0042 改名為已付款｜0042 並移到已付款分類；付款者的私訊和日誌頻道也收到同一則通知。頻道名稱都是商家自己設定的例子"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <GetPaidScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
