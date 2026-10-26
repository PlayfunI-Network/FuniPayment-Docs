"use client";
// The home page's overview: one order from start to finish in a ticket channel. /fp brings the
// payment menu, the order with its barcode lands in the channel, the customer pays at a store and
// the payment complete notice follows. It replays the channel automation demo's screens (the same
// channel, names and messages) with captions about the order instead of the renaming. The whole
// story plays at full view: the wide canvas has a 500px window (not the shared 640px one), so at a
// 680px stage the embeds' 14px text shows at 12.9px and the camera never has to move.
import { DiscordDemo, LIST_W, type SceneStep } from "@/components/demo";
import {
  ChannelAutomationScreen,
  LAYOUTS as SHARED,
  type ChannelAutomationLayout,
  type Screen,
} from "../shared/channel-automation-screen";

const WIDE: ChannelAutomationLayout = {
  w: LIST_W + 500,
  h: 700,
  left: LIST_W,
  list: true,
  at: { list: { x: -LIST_W, y: 0, w: LIST_W + 300, h: 520 }, window: { x: 0, y: 0, w: 500, h: 700 } },
};

const STEPS: SceneStep<Screen>[] = [
  { at: 0, screen: { stage: "open" }, caption: "商家在訂單頻道跟顧客談好價錢", shot: { zoom: 1 } },
  { at: 1800, screen: { stage: "selecting" }, caption: "商家輸入 /fp 和金額，機器人貼出付款方式選單" },
  { at: 5200, screen: { stage: "pending" }, caption: "顧客選好付款方式，拿到超商條碼" },
  { at: 8800, screen: { stage: "complete" }, caption: "顧客付款後，機器人送出付款完成通知" },
  { at: 12800, screen: { stage: "complete" } },
];

export const LAYOUTS = { wide: WIDE, narrow: SHARED.narrow };
export const WIDE_STEPS = STEPS;
export const NARROW_STEPS = STEPS;
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
