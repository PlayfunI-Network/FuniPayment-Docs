"use client";
// /payment create from start to order: the customer types the command with a method and an
// amount, the bot answers with the buyer information only they can see (filled in from last
// time), they press 確認並獲取付款碼, the message turns into 「✅ 資訊確認中，請稍候...」 and the
// order lands in the channel. The channel is a command channel outside the ticket categories,
// so nothing is renamed (illustrative name).
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasPoint,
  type InputState,
  type SceneLayout,
} from "@/components/demo";
import { Ephemeral } from "@/components/discord";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.payBankTransfer;
const CMD = slashCommand("payment create");
const CHANNEL = DEMO_CHANNELS.command.name;
const OPTIONS = [optionPill(CMD, "method", SCENARIO.method), optionPill(CMD, "amount", SCENARIO.amount)];

type Bot = "none" | "buyer" | "confirming" | "order";
export type Screen = { input: InputState; bot: Bot };
type Targets = { typing: CanvasPoint; confirm: CanvasPoint; aside: CanvasPoint };
type Layout = SceneLayout<Targets>;

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout = {
  w: 640,
  h: 720,
  at: {
    typing: { x: 420, y: 682 },
    confirm: { x: 390, y: 606 },
    aside: { x: 620, y: 520 },
  },
};
/**
 * 360 wide (not the usual 400): at a 343px stage it is drawn at 0.95, so 「只有你看得到這則訊息」
 * (12px) shows at about 11.4px without zooming in (10.2px on a 400px canvas).
 */
const NARROW: Layout = {
  w: 360,
  h: 760,
  at: {
    // The two option pills wrap to a second line at this width; this stays right of the text.
    typing: { x: 334, y: 722 },
    // The buttons wrap: 確認並獲取付款碼 is alone on the second row.
    confirm: { x: 136, y: 646 },
    aside: { x: 352, y: 520 },
  },
};

function timeline(l: Layout) {
  const { steps, step, point } = stepper<Screen>(l, { input: { kind: "empty" }, bot: "none" });
  const typing = point(l.at.typing, { typing: true });
  step(0, {}, { caption: "顧客在指令頻道輸入 /payment create", cursor: { ...typing, hidden: true } });
  step(600, {}, { cursor: typing });
  step(900, { input: { kind: "typing", typed: "/pay" } }, { cursor: { ...typing, click: true } });
  step(1300, { input: { kind: "typing", typed: "/payment cr" } });
  step(1700, { input: { kind: "typing", typed: "/payment create" } });
  step(2400, { input: { kind: "options", options: [OPTIONS[0]] } }, {
    caption: `選付款方式「${OPTIONS[0].value}」，金額填 ${SCENARIO.amount} 後送出`,
  });
  step(3200, { input: { kind: "options", options: OPTIONS } });
  step(4100, { input: { kind: "empty" }, bot: "buyer" }, {
    caption: "購買人資訊只有顧客自己看得到，上次填過的會自動帶入",
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(6300, {}, { caption: "確認沒問題，按「確認並獲取付款碼」", cursor: point(l.at.confirm) });
  step(7300, {}, { cursor: point(l.at.confirm, { click: true }) });
  step(7600, { bot: "confirming" }, { cursor: point(l.at.aside) });
  step(8700, { bot: "order" }, {
    caption: "訂單建立，銀行帳號和付款期限貼在頻道裡",
    cursor: { ...point(l.at.aside), hidden: true },
  });
  // Holds on the order before the loop starts over.
  step(11800, {});
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

export function PaymentCreateScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return (
    <DiscordScene
      layout={layout}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: CHANNEL,
          input: <CommandInput input={screen.input} channel={CHANNEL} command={CMD} />,
          messages: (
            <>
              <ChatMessage from="buyer" ago={4}>{`我要匯款付 ${SCENARIO.amount} 元`}</ChatMessage>
              {(screen.bot === "buyer" || screen.bot === "confirming") && (
                <ChatMessage from="bot" command={{ by: "buyer", name: CMD.name }} enter>
                  <Reply bot={screen.bot} />
                </ChatMessage>
              )}
              {screen.bot === "order" && (
                <ChatMessage from="bot" enter>
                  <SnapshotMessage id="builder/payment_create/bank_transfer/invoice=False" scenario={SCENARIO} />
                </ChatMessage>
              )}
            </>
          ),
        },
      ]}
    />
  );
}

export function PaymentCreateDemo() {
  return (
    <DiscordDemo
      label={`示範：顧客輸入 /payment create，付款方式選銀行轉帳、金額 ${SCENARIO.amount}，確認只有自己看得到的購買人資訊後，機器人在頻道貼出含銀行帳號的訂單`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <PaymentCreateScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
