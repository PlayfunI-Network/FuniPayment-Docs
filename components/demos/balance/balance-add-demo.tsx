"use client";
// /balance add: the merchant (a balance admin) adds 200 points to the customer for an event. The
// result embed goes to the channel (and the log channel), and the customer gets a DM without the
// reason or who did it (views/balance.py: BalanceAddMessage.create_dm_embed).
import { SnapshotMessage, type CanvasArea, type CanvasLayout, type CanvasPoint } from "@/components/demo";
import { DEMO_CHANNELS, DEMO_PEOPLE } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { BOT, ChatDemo, type Input, type Msg, type Pane } from "./scene";
import { balanceCommand, optionName, stepper } from "./timeline";

const SCENARIO = SCENARIOS.balanceAdd;
const CMD = balanceCommand("add");
const CHANNEL = DEMO_CHANNELS.command.name;

type Layout = CanvasLayout & { h: number; at: { typing: CanvasPoint; input: CanvasArea; result: CanvasArea } };

const WIDE: Layout = {
  w: 640,
  h: 760,
  at: { typing: { x: 220, y: 722 }, input: { x: 0, y: 560, w: 640, h: 200 }, result: { x: 0, y: 360, w: 640, h: 340 } },
};
const NARROW: Layout = {
  w: 400,
  h: 800,
  at: { typing: { x: 220, y: 762 }, input: { x: 0, y: 600, w: 400, h: 200 }, result: { x: 0, y: 370, w: 400, h: 370 } },
};

const RESULT: Msg = {
  id: "result",
  from: "bot",
  command: { by: "admin", name: CMD.name },
  enter: true,
  body: <SnapshotMessage id="flow/balance_add/40/50/活動" scenario={SCENARIO} />,
};
const THANKS: Msg = { id: "thanks", from: "admin", ago: 1, body: "活動得獎的點數發給你囉" };

const channel = (input: Input, result: boolean, grow = 1): Pane => ({
  id: "channel",
  kind: "channel",
  title: CHANNEL,
  input,
  grow,
  messages: result ? [THANKS, RESULT] : [THANKS],
});

const DM: Pane = {
  id: "dm",
  kind: "dm",
  title: BOT.name,
  tag: `${DEMO_PEOPLE.buyer.name}的私訊`,
  grow: 0.75,
  messages: [{ id: "dm", from: "bot", enter: true, body: <SnapshotMessage id="flow/balance_add/40/50/None@client.send_dm_to_user" scenario={SCENARIO} /> }],
};

function timeline(l: Layout) {
  const { out, step, point, zoom } = stepper(l);
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): Input => ({ kind: "typing", command: CMD.name, description: CMD.description, typed: t });
  const empty: Input = { kind: "empty" };

  step(0, [channel(empty, false)], {
    caption: "商家輸入 /balance add，填上顧客、金額 200 和備註",
    shot: zoom(1.6, l.at.input),
    cursor: typing,
  });
  step(300, [channel(typed("/bal"), false)], { cursor: { ...typing, click: true } });
  step(600, [channel(typed("/balance a"), false)]);
  step(900, [channel(typed("/balance add"), false)]);
  step(1600, [
    channel(
      {
        kind: "options",
        command: CMD.name,
        options: [
          { name: optionName(CMD.options, "user"), value: `@${SCENARIO.buyer}` },
          { name: optionName(CMD.options, "amount"), value: String(SCENARIO.amount) },
          { name: optionName(CMD.options, "reason"), value: SCENARIO.reason },
        ],
      },
      false,
    ),
  ]);
  step(3000, [channel(empty, true)], {
    caption: "機器人在頻道貼出「餘額增加成功」，寫著理由和執行者",
    shot: zoom(1.3, l.at.result),
    cursor: { ...typing, hidden: true },
  });
  step(6200, [channel(empty, true), DM], {
    caption: `${DEMO_PEOPLE.buyer.name}收到「餘額異動通知」私訊，裡面沒有理由和執行者`,
    shot: { zoom: 1 },
  });
  step(10000, null, {});
  return out;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceAddDemo() {
  return (
    <ChatDemo
      label={`示範：商家用 /balance add 幫顧客增加 ${SCENARIO.amount} 點，備註${SCENARIO.reason}，機器人在頻道貼出餘額增加成功，顧客也收到餘額異動通知私訊`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    />
  );
}
