"use client";
// /fp from start to order: the merchant types /fp 500 in a ticket channel, the customer picks
// 四大超商條碼 in the menu, confirms the method and the buyer information, and the order with
// its barcode lands in the channel. The screens and measured points are in
// components/demos/shared/fp-screen.tsx; this file holds the timeline.
import { DiscordDemo, stepper, type InputState } from "@/components/demo";
import { optionPill, slashCommand } from "@/lib/commands";
import { SCENARIOS } from "../scenarios";
import { FpScreen, LAYOUTS, type FpLayout as Layout, type Screen } from "../shared/fp-screen";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const FP = slashCommand("fp");
const { wide: WIDE, narrow: NARROW } = LAYOUTS;

// ---- Timeline ----

const START: Screen = { input: { kind: "empty" }, bot: "none", channel: "open" };
/** The amount option as it is typed in. */
const amount = (typed: string): InputState => ({ kind: "options", options: [optionPill(FP, "amount", typed)] });

function timeline(l: Layout) {
  // The whole screen throughout: drawn at canvas size (or, narrow, a phone-width canvas) every
  // embed, button and menu reads without zooming in.
  const { steps, step, point } = stepper<Screen>(l, START);
  const at = l.at;
  const typing = point(at.typing, { typing: true });

  step(0, {}, { caption: "商家在訂單頻道輸入 /fp", cursor: { ...typing, hidden: true } });
  step(600, {}, { cursor: typing });
  step(1000, { input: { kind: "typing", typed: "/" } }, { cursor: { ...typing, click: true } });
  step(1250, { input: { kind: "typing", typed: "/f" } });
  step(1500, { input: { kind: "typing", typed: "/fp" } });
  step(2200, { input: amount("") }, { caption: `填上金額 ${SCENARIO.amount} 後送出` });
  step(2500, { input: amount("5") });
  step(2650, { input: amount("50") });
  step(2800, { input: amount(String(SCENARIO.amount)) });
  step(3500, { input: { kind: "empty" }, bot: "select", channel: "selecting" }, {
    caption: "機器人回覆付款方式選單，頻道也跟著改名、換分類",
    cursor: { ...typing, hidden: true },
  });
  step(4900, {}, { caption: "顧客打開選單，選「四大超商條碼」", cursor: point(at.select) });
  step(5800, {}, { cursor: point(at.select, { click: true }) });
  step(6000, { bot: "menu" });
  step(6800, {}, { cursor: point(at.option) });
  step(7500, { bot: "menuPick" }, { cursor: point(at.option, { click: true }) });
  step(7800, { bot: "confirm" }, { caption: "確認金額和手續費，按「下一步」", cursor: point(at.aside) });
  step(8500, {}, { cursor: point(at.next) });
  step(9300, {}, { cursor: point(at.next, { click: true }) });
  step(9600, { bot: "buyer" }, { caption: "確認購買人資訊，取得付款碼" });
  step(10300, {}, { cursor: point(at.confirm) });
  step(11100, {}, { cursor: point(at.confirm, { click: true }) });
  step(11500, { bot: "order", channel: "pending" }, {
    caption: "訂單成立，條碼貼在頻道裡，頻道再換到待付款的分類",
    cursor: { ...point(at.confirm), hidden: true },
  });
  // Holds on the order before the loop starts over.
  step(13300, {});
  return steps;
}

export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function FpDemo() {
  return (
    <DiscordDemo
      label={`示範：商家在訂單頻道輸入 /fp 金額 ${SCENARIO.amount}，顧客從選單選四大超商條碼，確認付款方式和購買人資訊後，機器人在頻道貼出含條碼的訂單，頻道也跟著改名、換分類`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <FpScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
