"use client";
// One ticket channel through an order: /fp (selecting), order created (pending), paid
// (complete). At each stage the bot renames the channel with that stage's template and moves it
// to that stage's category; the messages are the bot's own at that stage. The names are what a
// merchant could set on the dashboard's channels tab, e.g. 選擇中｜<name:ticket-> (the bot has
// no default names).
import { useRef } from "react";
import { Canvas, DemoStage, SnapshotMessage, useWidth, zoomTo, type DemoStep } from "@/components/demo";
import { Message } from "@/components/discord";
import { SCENARIOS } from "../scenarios";
import { ADMIN, BOT, LIST_W, NARROW_BELOW, Screen, TicketCategories, time, type CanvasArea, type Layout } from "./kit";

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

const WIDE: Layout<Targets> = {
  w: LIST_W + 640,
  h: 700,
  left: LIST_W,
  list: true,
  at: { list: { x: -LIST_W, y: 0, w: LIST_W + 300, h: 520 }, window: { x: 0, y: 0, w: 640, h: 700 } },
};
const NARROW: Layout<Targets> = {
  w: 400,
  h: 720,
  left: 0,
  list: false,
  at: { list: { x: 0, y: 0, w: 400, h: 240 }, window: { x: 0, y: 0, w: 400, h: 720 } },
};

function timeline(l: Layout<Targets>): (DemoStep & { screen: Screen })[] {
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

export function ChannelAutomationScreen({ screen, layout }: { screen: Screen; layout: Layout<Targets> }) {
  const here = STAGES[screen.stage];
  const stage = screen.stage;
  return (
    <Screen layout={layout} title={here.name} list={<TicketCategories here={here} categories={CATEGORIES} />}>
      <Message author={ADMIN.name} avatar={ADMIN.avatar} time={time(6)}>
        好的，馬上幫你開單
      </Message>
      {stage === "selecting" && (
        <Message author={BOT.name} avatar={BOT.avatar} bot time={time(5)} interaction={{ user: ADMIN.name, avatar: ADMIN.avatar, command: "fp" }}>
          <div className="demo-in">
            <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} />
          </div>
        </Message>
      )}
      {(stage === "pending" || stage === "complete") && (
        // Creating the order deletes the /fp message and posts the order.
        <Message author={BOT.name} avatar={BOT.avatar} bot time={time(4)}>
          <div className={stage === "pending" ? "demo-in" : ""}>
            <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
          </div>
        </Message>
      )}
      {stage === "complete" && (
        <Message author={BOT.name} avatar={BOT.avatar} bot time={time()}>
          <div className="demo-in">
            <SnapshotMessage id="builder/payment_complete" scenario={SCENARIO} />
          </div>
        </Message>
      )}
    </Screen>
  );
}

export function ChannelAutomationDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? WIDE : NARROW;
  const steps = wide ? WIDE_STEPS : NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        key={wide ? "wide" : "narrow"}
        label="示範：訂單頻道 ticket-0042 在 /fp 送出時改名為選擇中｜0042 並移到選擇中分類，訂單建立時改名為待付款｜0042 並移到待付款分類，付款完成時改名為已付款｜0042 並移到已付款分類。名稱都是商家自己設定的例子"
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <ChannelAutomationScreen screen={steps[index].screen} layout={layout} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}
