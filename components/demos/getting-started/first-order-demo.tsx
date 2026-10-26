"use client";
// The first half of the /fp demo (components/demos/payments/fp-demo.tsx, screens in components/demos/shared/fp-screen.tsx): the merchant types
// /fp 500 and the customer picks 四大超商條碼 in the menu. The rest of the story (confirming and
// the order itself) is on the /fp page; this page links there. Same screens and measured points
// as the fp demo, a shorter timeline.
//
// The camera: on the narrow layout the embeds' 14px text already shows at 12px, so it stays at full
// view. The wide canvas (880px, shared with the fp demo) shows that text at 10.8px on a 680px
// stage, so once the typing starts the camera moves in 1.12 times (12.1px), on the bottom of the
// window where every step happens, and stays there until the closing full view.
import { DiscordDemo, LIST_W, stepper, type CanvasArea, type InputState, type Shot } from "@/components/demo";
import { FpScreen, LAYOUTS, type Screen } from "../shared/fp-screen";
import { optionPill, slashCommand } from "@/lib/commands";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const FP = slashCommand("fp");

type Layout = (typeof LAYOUTS)["wide"];

const START: Screen = { input: { kind: "empty" }, bot: "none", channel: "open" };
const amount = (typed: string): InputState => ({ kind: "options", options: [optionPill(FP, "amount", typed)] });

/** The bottom of the wide screen from its left edge: the channel list stays whole and only the empty right end of the window is cut. */
const WIDE_CLOSE: CanvasArea = { x: -LIST_W, y: 380, w: 640, h: 400 };

function timeline(l: Layout, closeArea?: CanvasArea) {
  const { steps, step, point, zoom } = stepper<Screen>(l, START);
  const at = l.at;
  const typing = point(at.typing, { typing: true });
  const close: Shot | undefined = closeArea && zoom(1.12, closeArea);

  step(0, {}, { caption: "在訂單頻道輸入 /fp", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, {}, { shot: close, cursor: typing });
  step(1000, { input: { kind: "typing", typed: "/" } }, { cursor: { ...typing, click: true } });
  step(1250, { input: { kind: "typing", typed: "/f" } });
  step(1500, { input: { kind: "typing", typed: "/fp" } });
  step(2200, { input: amount("") }, { caption: `「金額」填 ${SCENARIO.amount}，按 Enter 送出` });
  step(2500, { input: amount("5") });
  step(2650, { input: amount("50") });
  step(2800, { input: amount(String(SCENARIO.amount)) });
  step(3500, { input: { kind: "empty" }, bot: "select", channel: "selecting" }, {
    caption: "機器人貼出付款方式選單，接下來換顧客操作",
    cursor: { ...typing, hidden: true },
  });
  step(5400, {}, { caption: "顧客打開選單，選一種付款方式", cursor: point(at.select) });
  step(6200, {}, { cursor: point(at.select, { click: true }) });
  step(6400, { bot: "menu" });
  step(7200, {}, { cursor: point(at.option) });
  step(7900, { bot: "menuPick" }, { cursor: point(at.option, { click: true }) });
  step(8200, { bot: "confirm" }, {
    caption: "顧客確認金額和手續費，再填購買人資訊，就會拿到付款資訊",
    cursor: point(at.aside),
  });
  step(11000, {}, { shot: { zoom: 1 }, cursor: { ...point(at.aside), hidden: true } });
  return steps;
}

export { LAYOUTS };
export const WIDE_STEPS = timeline(LAYOUTS.wide, WIDE_CLOSE);
export const NARROW_STEPS = timeline(LAYOUTS.narrow);
export const FirstOrderScreen = FpScreen;

export function FirstOrderDemo() {
  return (
    <DiscordDemo
      label={`示範：商家在訂單頻道輸入 /fp，金額填 ${SCENARIO.amount} 後送出，機器人貼出付款方式選單；顧客打開選單選四大超商條碼，畫面換成再次確認付款方式`}
      wide={{ layout: LAYOUTS.wide, steps: WIDE_STEPS }}
      narrow={{ layout: LAYOUTS.narrow, steps: NARROW_STEPS }}
    >
      {(step, layout) => <FpScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
