"use client";
// One ticket channel through an order: /fp (selecting), order created (pending), paid
// (complete). The screens are in components/demos/shared/channel-automation-screen.tsx; this file
// holds the timeline.
import { DiscordDemo, type SceneStep } from "@/components/demo";
import { ChannelAutomationScreen, LAYOUTS, type Screen } from "../shared/channel-automation-screen";

const { wide: WIDE, narrow: NARROW } = LAYOUTS;

/**
 * The same on both layouts: the whole screen throughout, so each rename and move is seen as it
 * happens (the channel list wide, the window header narrow).
 */
const STEPS: SceneStep<Screen>[] = [
  { at: 0, screen: { stage: "open" }, caption: "訂單頻道剛開，還在開單分類" },
  { at: 2600, screen: { stage: "selecting" }, caption: "/fp 送出：換成「選擇付款方式時」的名稱和分類" },
  { at: 5600, screen: { stage: "pending" }, caption: "訂單建立：換成「待付款時」的名稱和分類" },
  { at: 8600, screen: { stage: "complete" }, caption: "付款完成：換成「付款完成時」的名稱和分類" },
  // Holds on the last stage before the loop starts over.
  { at: 11500, screen: { stage: "complete" } },
];

export const WIDE_STEPS = STEPS;
export const NARROW_STEPS = STEPS;

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
