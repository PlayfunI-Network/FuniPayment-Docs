"use client";
// The screens of the channel automation story, shared by the payments chapter's demo
// (components/demos/payments/channel-automation-demo.tsx) and the getting-started demos (home,
// get paid), each with its own timeline. The story: one ticket channel through an order: /fp (selecting), order created (pending), paid
// (complete). At each stage the bot renames the channel with that stage's template and moves it
// to that stage's category; the messages are the bot's own at that stage. The names are what a
// merchant could set on the dashboard's channels tab, e.g. 選擇中｜<name:ticket-> (the bot has
// no default names).
import {
  ChatMessage,
  DiscordScene,
  LIST_W,
  SnapshotMessage,
  type CanvasArea,
  type SceneLayout,
} from "@/components/demo";
import { SCENARIOS } from "../scenarios";
import { TicketCategories } from "./ticket-categories";

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
export type ChannelAutomationLayout = SceneLayout<Targets>;
type Layout = ChannelAutomationLayout;

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

export const LAYOUTS = { wide: WIDE, narrow: NARROW };

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
