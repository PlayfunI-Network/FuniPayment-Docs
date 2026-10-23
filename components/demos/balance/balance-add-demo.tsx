"use client";
// /balance add: the merchant (a balance admin) adds 200 points to the customer for an event. The
// result embed goes to the channel (and the log channel), and the customer gets a DM without the
// reason or who did it (views/balance.py: BalanceAddMessage.create_dm_embed).
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_BOT, DEMO_CHANNELS, DEMO_PEOPLE } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.balanceAdd;
const CMD = slashCommand("balance add");
const CHANNEL = DEMO_CHANNELS.command.name;

type Layout = SceneLayout<{ typing: CanvasPoint; input: CanvasArea; result: CanvasArea }>;
export type Screen = { panes: Pane[] };

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

const channel = (input: InputState, result: boolean): Pane => ({
  id: "channel",
  kind: "channel",
  title: CHANNEL,
  input: <CommandInput input={input} channel={CHANNEL} command={CMD} />,
  messages: (
    <>
      <ChatMessage from="admin" ago={1}>
        活動得獎的點數發給你囉
      </ChatMessage>
      {result && (
        <ChatMessage from="bot" command={{ by: "admin", name: CMD.name }} enter>
          <SnapshotMessage id="flow/balance_add/40/50/活動" scenario={SCENARIO} />
        </ChatMessage>
      )}
    </>
  ),
});

const DM: Pane = {
  id: "dm",
  kind: "dm",
  title: DEMO_BOT.name,
  tag: `${DEMO_PEOPLE.buyer.name}的私訊`,
  grow: 0.75,
  messages: (
    <ChatMessage from="bot" enter>
      <SnapshotMessage id="flow/balance_add/40/50/None@client.send_dm_to_user" scenario={SCENARIO} />
    </ChatMessage>
  ),
};

const OPTIONS: InputState = {
  kind: "options",
  options: [
    optionPill(CMD, "user", `@${SCENARIO.buyer}`),
    optionPill(CMD, "amount", SCENARIO.amount),
    optionPill(CMD, "reason", SCENARIO.reason ?? ""),
  ],
};

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, { panes: [] });
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): InputState => ({ kind: "typing", typed: t });
  const empty: InputState = { kind: "empty" };

  step(0, { panes: [channel(empty, false)] }, {
    caption: `商家輸入 /balance add，填上顧客、金額 ${SCENARIO.amount} 和備註`,
    shot: zoom(1.6, l.at.input),
    cursor: typing,
  });
  step(300, { panes: [channel(typed("/bal"), false)] }, { cursor: { ...typing, click: true } });
  step(600, { panes: [channel(typed("/balance a"), false)] });
  step(900, { panes: [channel(typed("/balance add"), false)] });
  step(1600, { panes: [channel(OPTIONS, false)] });
  step(3000, { panes: [channel(empty, true)] }, {
    caption: "機器人在頻道貼出「餘額增加成功」，寫著理由和執行者",
    shot: zoom(1.3, l.at.result),
    cursor: { ...typing, hidden: true },
  });
  step(6200, { panes: [channel(empty, true), DM] }, {
    caption: `${DEMO_PEOPLE.buyer.name}收到「餘額異動通知」私訊，裡面沒有理由和執行者`,
    shot: { zoom: 1 },
  });
  step(10000, {}, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceAddDemo() {
  return (
    <DiscordDemo
      label={`示範：商家用 /balance add 幫顧客增加 ${SCENARIO.amount} 點，備註${SCENARIO.reason}，機器人在頻道貼出餘額增加成功，顧客也收到餘額異動通知私訊`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DiscordScene layout={layout} panes={step.screen.panes} />}
    </DiscordDemo>
  );
}
