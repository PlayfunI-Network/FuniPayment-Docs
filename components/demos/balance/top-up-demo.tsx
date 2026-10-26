"use client";
// /top-up 300: the customer picks 7-11 ibon in the reply only they see, confirms, and the bot
// creates the order. The order reaches the customer's DM (send_to_dm_and_log); once it is paid,
// the DM gets the payment notice and 「成功儲值」 with the new balance (notifier.topup_completed).
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  SnapshotEmbed,
  SnapshotMessage,
  stepper,
  type CanvasPoint,
  type InputState,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { Ephemeral } from "@/components/discord";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_BOT, DEMO_CHANNELS, DEMO_PEOPLE } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.topUp;
const CMD = slashCommand("top-up");
const AMOUNT = optionPill(CMD, "amount", SCENARIO.amount);
const CHANNEL = DEMO_CHANNELS.command.name;

type Reply = "select" | "menu" | "menuPick" | "confirm" | "done";

type Layout = SceneLayout<{
  typing: CanvasPoint;
  select: CanvasPoint;
  option: CanvasPoint;
  confirm: CanvasPoint;
  aside: CanvasPoint;
}>;
export type Screen = { panes: Pane[] };

const WIDE: Layout = {
  w: 640,
  h: 720,
  at: {
    typing: { x: 120, y: 682 },
    select: { x: 230, y: 597 },
    option: { x: 200, y: 466 },
    confirm: { x: 236, y: 606 },
    aside: { x: 600, y: 450 },
  },
};
// 360 wide: 只有你看得到這則訊息 (12 px) is 11 px or more on a 341 px stage.
const NARROW: Layout = {
  w: 360,
  h: 760,
  at: {
    typing: { x: 120, y: 722 },
    select: { x: 180, y: 637 },
    option: { x: 180, y: 506 },
    confirm: { x: 236, y: 646 },
    aside: { x: 344, y: 450 },
  },
};

function ReplyBody({ reply }: { reply: Reply }) {
  switch (reply) {
    case "select":
      return <SnapshotMessage id="flow/topup_command/ok" scenario={SCENARIO} />;
    case "menu":
      return <SnapshotMessage id="flow/topup_command/ok" scenario={SCENARIO} menu={{ open: "up" }} />;
    case "menuPick":
      return <SnapshotMessage id="flow/topup_command/ok" scenario={SCENARIO} menu={{ open: "up", active: SCENARIO.method }} />;
    // The later screens edit the same reply, so they stay visible to the customer only.
    case "confirm":
      return (
        <Ephemeral>
          <SnapshotMessage id="builder/topup/bank_transfer" scenario={SCENARIO} />
        </Ephemeral>
      );
    case "done":
      return (
        <Ephemeral>
          <SnapshotMessage id="flow/topup_confirm" scenario={SCENARIO} />
        </Ephemeral>
      );
  }
}

const channel = (input: InputState, reply: Reply | null): Pane[] => [
  {
    id: "channel",
    kind: "channel",
    title: CHANNEL,
    input: <CommandInput input={input} channel={CHANNEL} command={CMD} />,
    messages: reply && (
      <ChatMessage from="bot" command={{ by: "buyer", name: CMD.name }}>
        <div key={reply.startsWith("menu") ? "menu" : reply} className={reply.startsWith("menu") ? "" : "demo-in"}>
          <ReplyBody reply={reply} />
        </div>
      </ChatMessage>
    ),
  },
];

/** The customer's DM: the order, then (paid) the payment notice and the top-up's new balance. */
const dm = (paid: boolean): Pane[] => [
  {
    id: "dm",
    kind: "dm",
    title: DEMO_BOT.name,
    tag: `${DEMO_PEOPLE.buyer.name}的私訊`,
    messages: (
      <>
        <ChatMessage from="bot" ago={30}>
          <SnapshotEmbed id="builder/payment_create/ibon/invoice=False" scenario={SCENARIO} />
        </ChatMessage>
        {paid && (
          <>
            <ChatMessage from="bot" enter>
              <SnapshotEmbed id="builder/payment_complete" scenario={SCENARIO} />
            </ChatMessage>
            <ChatMessage from="bot" enter>
              <SnapshotEmbed id="builder/topup_success@dm" scenario={SCENARIO} />
            </ChatMessage>
          </>
        )}
      </>
    ),
  },
];

function timeline(l: Layout) {
  const { steps, step, point } = stepper<Screen>(l, { panes: [] });
  const typing = point(l.at.typing, { typing: true });
  const empty: InputState = { kind: "empty" };

  step(0, { panes: channel(empty, null) }, {
    caption: `顧客輸入 /top-up，${AMOUNT.name}填 ${AMOUNT.value}`,
    shot: { zoom: 1 },
    cursor: typing,
  });
  step(300, { panes: channel({ kind: "typing", typed: "/top" }, null) }, { cursor: { ...typing, click: true } });
  step(600, { panes: channel({ kind: "typing", typed: "/top-up" }, null) });
  step(1300, { panes: channel({ kind: "options", options: [AMOUNT] }, null) });
  step(2500, { panes: channel(empty, "select") }, {
    caption: "回覆只有顧客看得到；打開選單選「7-11 超商代碼」",
    cursor: point(l.at.select),
  });
  step(3500, {}, { cursor: point(l.at.select, { click: true }) });
  step(3700, { panes: channel(empty, "menu") });
  step(4400, {}, { cursor: point(l.at.option) });
  step(5000, { panes: channel(empty, "menuPick") }, { cursor: point(l.at.option, { click: true }) });
  step(5300, { panes: channel(empty, "confirm") }, {
    caption: "確認點數、付款金額和手續費，按「確認並獲取付款碼」",
    cursor: point(l.at.aside),
  });
  step(6100, {}, { cursor: point(l.at.confirm) });
  step(6900, {}, { cursor: point(l.at.confirm, { click: true }) });
  step(7200, { panes: channel(empty, "done") }, { cursor: { ...point(l.at.aside), hidden: true } });
  step(8600, { panes: dm(false) }, { caption: "付款資訊私訊給顧客，照著去 7-11 付款" });
  step(11000, { panes: dm(true) }, { caption: "付款完成後，點數自動入帳，私訊寫著新的餘額" });
  step(14000, {}, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function TopUpDemo() {
  return (
    <DiscordDemo
      label={`示範：顧客輸入 /top-up 金額 ${SCENARIO.amount}，在只有自己看得到的回覆裡選 7-11 超商代碼並確認，付款資訊私訊給顧客，付款完成後點數入帳，私訊顯示成功儲值與新的餘額`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DiscordScene layout={layout} panes={step.screen.panes} />}
    </DiscordDemo>
  );
}
