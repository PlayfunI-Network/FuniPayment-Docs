"use client";
// /balance transfer: the customer sends 150 points to another member. The confirmation only the
// customer sees, the click on 確認並轉帳, the success embed in its place, then the DM each side
// gets (views/balance.py: confirm_callback sends both after the log channel's copy).
import { SnapshotMessage, type CanvasArea, type CanvasLayout, type CanvasPoint } from "@/components/demo";
import { Ephemeral } from "@/components/discord";
import { DEMO_CHANNELS, DEMO_PEOPLE } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { BOT, ChatDemo, type Input, type Msg, type Pane } from "./scene";
import { balanceCommand, optionName, stepper } from "./timeline";

const SCENARIO = SCENARIOS.transfer;
const CMD = balanceCommand("transfer");
const CHANNEL = DEMO_CHANNELS.command.name;

type Layout = CanvasLayout & {
  h: number;
  at: { typing: CanvasPoint; input: CanvasArea; confirmMsg: CanvasArea; confirm: CanvasPoint; aside: CanvasPoint };
};

const WIDE: Layout = {
  w: 640,
  h: 700,
  at: {
    typing: { x: 230, y: 662 },
    input: { x: 0, y: 500, w: 640, h: 200 },
    confirmMsg: { x: 0, y: 300, w: 640, h: 340 },
    confirm: { x: 215, y: 582 },
    aside: { x: 600, y: 450 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {
    typing: { x: 230, y: 722 },
    input: { x: 0, y: 560, w: 400, h: 200 },
    confirmMsg: { x: 0, y: 320, w: 400, h: 380 },
    confirm: { x: 215, y: 642 },
    aside: { x: 384, y: 450 },
  },
};

const OPTIONS: Input = {
  kind: "options",
  command: CMD.name,
  options: [
    { name: optionName(CMD.options, "to"), value: `@${SCENARIO.recipient}` },
    { name: optionName(CMD.options, "amount"), value: String(SCENARIO.amount) },
    { name: optionName(CMD.options, "reason"), value: SCENARIO.reason },
  ],
};

const reply = (state: "ask" | "done"): Msg => ({
  id: "reply",
  from: "bot",
  command: { by: "buyer", name: CMD.name },
  enter: state === "ask",
  body:
    state === "ask" ? (
      <SnapshotMessage id="flow/balance_transfer_command/ok" scenario={SCENARIO} />
    ) : (
      // The success embed replaces the confirmation, which only the customer sees.
      <div key="done" className="demo-in">
        <Ephemeral>
          <SnapshotMessage id="flow/balance_transfer_confirm/50" scenario={SCENARIO} />
        </Ephemeral>
      </div>
    ),
});

const ASK: Msg = { id: "ask", from: "buyer", ago: 2, body: `@${SCENARIO.recipient} 團購的錢我轉點數給你` };

const channel = (input: Input, state: "none" | "ask" | "done"): Pane[] => [
  { id: "channel", kind: "channel", title: CHANNEL, messages: state === "none" ? [ASK] : [ASK, reply(state)], input },
];

const DMS: Pane[] = [
  {
    id: "sender",
    kind: "dm",
    title: BOT.name,
    tag: `${DEMO_PEOPLE.buyer.name}的私訊`,
    messages: [{ id: "dm0", from: "bot", enter: true, body: <SnapshotMessage id="flow/balance_transfer_confirm/50@client.send_dm_to_user#0" scenario={SCENARIO} /> }],
  },
  {
    id: "receiver",
    kind: "dm",
    title: BOT.name,
    tag: `${SCENARIO.recipient}的私訊`,
    messages: [{ id: "dm1", from: "bot", enter: true, body: <SnapshotMessage id="flow/balance_transfer_confirm/50@client.send_dm_to_user#1" scenario={SCENARIO} /> }],
  },
];

function timeline(l: Layout) {
  const { out, step, point, zoom } = stepper(l);
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): Input => ({ kind: "typing", command: CMD.name, description: CMD.description, typed: t });

  step(0, channel({ kind: "empty" }, "none"), {
    caption: "顧客輸入 /balance transfer，填好接收者、金額和備註",
    shot: { zoom: 1 },
    cursor: { ...typing, hidden: true },
  });
  step(500, null, { shot: zoom(1.6, l.at.input), cursor: typing });
  step(800, channel(typed("/bal"), "none"), { cursor: { ...typing, click: true } });
  step(1100, channel(typed("/balance tr"), "none"));
  step(1400, channel(typed("/balance transfer"), "none"));
  step(2100, channel(OPTIONS, "none"));
  step(3300, channel({ kind: "empty" }, "ask"), {
    caption: "確認畫面只有顧客看得到，核對金額和對象後按「確認並轉帳」",
    shot: zoom(1.3, l.at.confirmMsg),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(4500, null, { cursor: point(l.at.confirm) });
  step(5500, null, { cursor: point(l.at.confirm, { click: true }) });
  step(5800, channel({ kind: "empty" }, "done"), { caption: "轉帳完成，確認畫面換成「轉帳成功」", cursor: point(l.at.aside) });
  step(7800, DMS, {
    caption: `${DEMO_PEOPLE.buyer.name}和${SCENARIO.recipient}各收到一則私訊，寫著轉帳前後的餘額`,
    shot: { zoom: 1 },
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(11500, null, {});
  return out;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceTransferDemo() {
  return (
    <ChatDemo
      label={`示範：顧客用 /balance transfer 轉 ${SCENARIO.amount} 點給${SCENARIO.recipient}，在只有自己看得到的確認畫面按確認並轉帳，之後雙方各收到一則轉帳通知私訊`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    />
  );
}
