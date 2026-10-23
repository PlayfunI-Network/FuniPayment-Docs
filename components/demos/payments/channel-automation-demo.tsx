"use client";
// One ticket channel through an order: /fp (selecting), order created (pending), paid
// (complete). The screens are in components/demos/shared/channel-automation-screen.tsx; this file
// holds the timeline.
import { DiscordDemo, zoomTo, type SceneStep } from "@/components/demo";
import {
  ChannelAutomationScreen,
  LAYOUTS,
  type ChannelAutomationLayout as Layout,
  type Screen,
} from "../shared/channel-automation-screen";

const { wide: WIDE, narrow: NARROW } = LAYOUTS;

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

export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

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
