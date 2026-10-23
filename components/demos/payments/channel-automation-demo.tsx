"use client";
// One ticket channel through an order: /fp (selecting), order created (pending), paid
// (complete). At each stage the bot renames the channel with that stage's template and moves it
// to that stage's category; the messages are the bot's own at that stage. The names are what a
// merchant could set on the dashboard's channels tab, e.g. 選擇中｜<name:ticket-> (the bot has
// no default names).
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  LIST_W,
  SnapshotMessage,
  zoomTo,
  type CanvasArea,
  type SceneLayout,
  type SceneStep,
} from "@/components/demo";
import { SCENARIOS } from "../scenarios";
import { TicketCategories } from "./kit";

const SCENARIO = SCENARIOS.fpStoreBarcode;

export const STAGES = {
  open: { name: "ticket-0042", category: "開單" },
  selecting: { name: "選擇中｜0042", category: "選擇中" },
  pending: { name: "待付款｜0042", category: "待付款" },
  complete: { name: "已付款｜0042", category: "已付款" },
} as const;
type Stage = keyof typeof STAGES;
const CATEGORIES = [
  { name: "開單", others: ["ticket-0041"] },
  { name: "選擇中", others: [] },
  { name: "待付款", others: ["待付款｜0039"] },
  { name: "已付款", others: ["已付款｜0037"] },
];

export type Screen = { stage: Stage };
type Targets = { list: CanvasArea; window: CanvasArea };
type Layout = SceneLayout<Targets>;

const WIDE: Layout = {
  w: LIST_W + 640,
  h: 700,
  left: LIST_W,
  list: true,
  at: { list: { x: -LIST_W, y: 0, w: LIST_W + 300, h: 520 }, window: { x: 0, y: 0, w: 640, h: 700 } },
};
const NARROW: Layout = {
  w: 400,
  h: 720,
  at: { list: { x: 0, y: 0, w: 400, h: 240 }, window: { x: 0, y: 0, w: 400, h: 720 } },
};

function timeline(l: Layout): SceneStep<Screen>[] {
  // On the narrow screen the header shows the name; zoom on it so the rename reads.
  const name = l.list ? zoomTo(l, 1.5, l.at.list) : zoomTo(l, 1.6, { x: 0, y: 0, w: 400, h: 300 });
  return [
    { at: 0, screen: { stage: "open" }, caption: "訂單頻道剛開，還在開單分類", shot: name },
    { at: 2200, screen: { stage: "selecting" }, caption: "/fp 送出：換成「選擇付款方式時」的名稱和分類", shot: { zoom: 1 } },
    { at: 3600, screen: { stage: "selecting" }, shot: name },
    { at: 5400, screen: { stage: "pending" }, caption: "訂單建立：換成「待付款時」的名稱和分類", shot: { zoom: 1 } },
    { at: 6800, screen: { stage: "pending" }, shot: name },
    { at: 8600, screen: { stage: "complete" }, caption: "付款完成：換成「付款完成時」的名稱和分類", shot: { zoom: 1 } },
    { at: 10000, screen: { stage: "complete" }, shot: name },
    { at: 12500, screen: { stage: "complete" }, shot: { zoom: 1 } },
  ];
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function ChannelAutomationScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const here = STAGES[screen.stage];
  const stage = screen.stage;
  return (
    <DiscordScene
      layout={layout}
      list={<TicketCategories here={here} categories={CATEGORIES} />}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: here.name,
          messages: (
            <>
              <ChatMessage from="admin" ago={6}>
                好的，馬上幫你開單
              </ChatMessage>
              {stage === "selecting" && (
                <ChatMessage from="bot" command={{ by: "admin", name: "fp" }} ago={5} enter>
                  <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} />
                </ChatMessage>
              )}
              {(stage === "pending" || stage === "complete") && (
                // Creating the order deletes the /fp message and posts the order.
                <ChatMessage from="bot" ago={4} enter={stage === "pending"}>
                  <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
                </ChatMessage>
              )}
              {stage === "complete" && (
                <ChatMessage from="bot" enter>
                  <SnapshotMessage id="builder/payment_complete" scenario={SCENARIO} />
                </ChatMessage>
              )}
            </>
          ),
        },
      ]}
    />
  );
}

export function ChannelAutomationDemo() {
  return (
    <DiscordDemo
      label="示範：訂單頻道 ticket-0042 在 /fp 送出時改名為選擇中｜0042 並移到選擇中分類，訂單建立時改名為待付款｜0042 並移到待付款分類，付款完成時改名為已付款｜0042 並移到已付款分類。名稱都是商家自己設定的例子"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <ChannelAutomationScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
