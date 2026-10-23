"use client";
// The home page's overview: one order from start to finish in a ticket channel. /fp brings the
// payment menu, the order with its barcode lands in the channel, the customer pays at a store and
// the payment complete notice follows. It replays the channel automation demo's screens (the same
// channel, names and messages) with captions about the order instead of the renaming.
import { DiscordDemo, zoomTo, type CanvasArea, type SceneStep } from "@/components/demo";
import {
  ChannelAutomationScreen,
  LAYOUTS,
  type Screen,
} from "../shared/channel-automation-screen";

type Layout = (typeof LAYOUTS)["wide"];

/** Where the bot's latest message sits in the channel window of each layout. */
const MESSAGE: Record<"wide" | "narrow", CanvasArea> = {
  wide: { x: 0, y: 160, w: 640, h: 540 },
  narrow: { x: 0, y: 200, w: 400, h: 520 },
};

function timeline(l: Layout, message: CanvasArea): SceneStep<Screen>[] {
  const close = zoomTo(l, 1.25, message);
  return [
    { at: 0, screen: { stage: "open" }, caption: "商家在訂單頻道跟顧客談好價錢", shot: { zoom: 1 } },
    { at: 1800, screen: { stage: "selecting" }, caption: "商家輸入 /fp 和金額，機器人貼出付款方式選單" },
    { at: 2800, screen: { stage: "selecting" }, shot: close },
    { at: 5200, screen: { stage: "pending" }, caption: "顧客選好付款方式，拿到超商條碼", shot: { zoom: 1 } },
    { at: 6200, screen: { stage: "pending" }, shot: close },
    { at: 8800, screen: { stage: "complete" }, caption: "顧客付款後，機器人送出付款完成通知", shot: { zoom: 1 } },
    { at: 9800, screen: { stage: "complete" }, shot: close },
    { at: 12800, screen: { stage: "complete" }, shot: { zoom: 1 } },
  ];
}

export { LAYOUTS };
export const WIDE_STEPS = timeline(LAYOUTS.wide, MESSAGE.wide);
export const NARROW_STEPS = timeline(LAYOUTS.narrow, MESSAGE.narrow);
export const HomeScreen = ChannelAutomationScreen;

export function HomeDemo() {
  return (
    <DiscordDemo
      label="示範：商家在訂單頻道輸入 /fp，機器人貼出付款方式選單；顧客選四大超商條碼後，頻道裡出現含條碼的訂單；顧客付款後，機器人在同一個頻道送出付款完成通知"
      wide={{ layout: LAYOUTS.wide, steps: WIDE_STEPS }}
      narrow={{ layout: LAYOUTS.narrow, steps: NARROW_STEPS }}
    >
      {(step, layout) => <ChannelAutomationScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
