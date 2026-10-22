"use client";
// /payment create from start to order: the customer types the command with a method and an
// amount, the bot answers with the buyer information only they can see (filled in from last
// time), they press 確認並獲取付款碼, the message turns into 「✅ 資訊確認中，請稍候...」 and the
// order lands in the channel. The channel is a command channel outside the ticket categories,
// so nothing is renamed (illustrative name).
import { useRef } from "react";
import { Canvas, DemoStage, SnapshotMessage, useWidth, zoomTo } from "@/components/demo";
import { Ephemeral, Message } from "@/components/discord";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import {
  BOT,
  BUYER,
  CommandInput,
  NARROW_BELOW,
  Screen,
  optionPill,
  paymentSub,
  stepper,
  time,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type Layout,
} from "./kit";

const SCENARIO = SCENARIOS.payBankTransfer;
const SUB = paymentSub("create");
const CHANNEL = DEMO_CHANNELS.command.name;
const OPTIONS = [
  optionPill(SUB, "method", SCENARIO.method),
  optionPill(SUB, "amount", undefined, String(SCENARIO.amount)),
];

type Bot = "none" | "buyer" | "confirming" | "order";
export type Screen = { input: InputState; bot: Bot };
type Targets = { typing: CanvasPoint; input: CanvasArea; buyer: CanvasArea; confirm: CanvasPoint; aside: CanvasPoint; order: CanvasArea };

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout<Targets> = {
  w: 640,
  h: 720,
  left: 0,
  list: false,
  at: {
    typing: { x: 420, y: 682 },
    input: { x: 0, y: 500, w: 640, h: 220 },
    buyer: { x: 40, y: 250, w: 600, h: 400 },
    confirm: { x: 390, y: 606 },
    aside: { x: 620, y: 520 },
    order: { x: 40, y: 250, w: 600, h: 400 },
  },
};
const NARROW: Layout<Targets> = {
  w: 400,
  h: 760,
  left: 0,
  list: false,
  at: {
    typing: { x: 360, y: 722 },
    input: { x: 0, y: 550, w: 400, h: 210 },
    buyer: { x: 20, y: 215, w: 380, h: 475 },
    // The buttons wrap: 確認並獲取付款碼 is alone on the second row.
    confirm: { x: 136, y: 646 },
    aside: { x: 390, y: 520 },
    order: { x: 20, y: 280, w: 380, h: 410 },
  },
};

function timeline(l: Layout<Targets>) {
  const { steps, step, point } = stepper<Screen>(l, { input: { kind: "empty" }, bot: "none" });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "顧客在指令頻道輸入 /payment create", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, {}, { shot: zoomTo(l, 1.8, l.at.input), cursor: typing });
  step(900, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(1300, { input: { kind: "typing", typed: "/payment cr" } });
  step(1700, { input: { kind: "typing", typed: "/payment create" } });
  step(2400, { input: { kind: "options", options: [OPTIONS[0]] } }, { caption: "選付款方式「銀行轉帳」，金額填 1200 後送出" });
  step(3200, { input: { kind: "options", options: OPTIONS } });
  step(4100, { input: { kind: "empty" }, bot: "buyer" }, {
    caption: "購買人資訊只有顧客自己看得到，上次填過的會自動帶入",
    shot: zoomTo(l, 1.4, l.at.buyer),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(6300, {}, { caption: "確認沒問題，按「確認並獲取付款碼」", cursor: point(l.at.confirm) });
  step(7300, {}, { cursor: point(l.at.confirm, { click: true }) });
  step(7600, { bot: "confirming" }, { cursor: point(l.at.aside) });
  step(8700, { bot: "order" }, {
    caption: "訂單建立，銀行帳號和付款期限貼在頻道裡",
    shot: zoomTo(l, 1.15, l.at.order),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(11800, {}, { shot: { zoom: 1 } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

function Reply({ bot }: { bot: Exclude<Bot, "none" | "order"> }) {
  if (bot === "confirming") {
    // The same message, edited: it stays the one only the customer sees.
    return (
      <Ephemeral>
        <SnapshotMessage id="source/payment_create_confirming" scenario={SCENARIO} />
      </Ephemeral>
    );
  }
  // flow/payment_create_command/ok is this message before the first fill; a returning customer's
  // saved information comes in already filled.
  return (
    <Ephemeral>
      <SnapshotMessage id="builder/consumer_info/filled=True/cancel_first=True" scenario={SCENARIO} />
    </Ephemeral>
  );
}

export function PaymentCreateScreen({ screen, layout }: { screen: Screen; layout: Layout<Targets> }) {
  return (
    <Screen
      layout={layout}
      title={CHANNEL}
      input={<CommandInput input={screen.input} channel={CHANNEL} command="payment create" description={SUB.description} />}
    >
      <Message author={BUYER.name} avatar={BUYER.avatar} time={time(4)}>
        我要匯款付 1200 元
      </Message>
      {(screen.bot === "buyer" || screen.bot === "confirming") && (
        <Message
          author={BOT.name}
          avatar={BOT.avatar}
          bot
          time={time()}
          interaction={{ user: BUYER.name, avatar: BUYER.avatar, command: "payment create" }}
        >
          <div className="demo-in">
            <Reply bot={screen.bot} />
          </div>
        </Message>
      )}
      {screen.bot === "order" && (
        <Message author={BOT.name} avatar={BOT.avatar} bot time={time()}>
          <div className="demo-in">
            <SnapshotMessage id="builder/payment_create/bank_transfer/invoice=False" scenario={SCENARIO} />
          </div>
        </Message>
      )}
    </Screen>
  );
}

export function PaymentCreateDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? WIDE : NARROW;
  const steps = wide ? WIDE_STEPS : NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        key={wide ? "wide" : "narrow"}
        label={`示範：顧客輸入 /payment create，付款方式選銀行轉帳、金額 ${SCENARIO.amount}，確認只有自己看得到的購買人資訊後，機器人在頻道貼出含銀行帳號的訂單`}
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <PaymentCreateScreen screen={steps[index].screen} layout={layout} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}
