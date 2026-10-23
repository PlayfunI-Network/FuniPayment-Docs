"use client";
// /balance show: the customer asks for their balance in the commands channel and the bot answers
// in the channel with the blue balance embed (mode 公開顯示).
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
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.balanceHistory;
const CMD = slashCommand("balance show");
const MODE = optionPill(CMD, "mode", "公開顯示");
const CHANNEL = DEMO_CHANNELS.command.name;

type Layout = SceneLayout<{ typing: CanvasPoint; input: CanvasArea; reply: CanvasArea }>;
export type Screen = { panes: Pane[] };

// Measured in Chrome at 1280px (wide) and 375px (narrow) viewports with every screen drawn unscaled.
const WIDE: Layout = {
  w: 640,
  h: 440,
  at: { typing: { x: 200, y: 402 }, input: { x: 0, y: 250, w: 440, h: 190 }, reply: { x: 0, y: 150, w: 640, h: 230 } },
};
const NARROW: Layout = {
  w: 400,
  h: 480,
  at: { typing: { x: 200, y: 442 }, input: { x: 0, y: 290, w: 400, h: 190 }, reply: { x: 0, y: 180, w: 400, h: 240 } },
};

const channel = (input: InputState, reply: boolean): Pane[] => [
  {
    id: "channel",
    kind: "channel",
    title: CHANNEL,
    input: <CommandInput input={input} channel={CHANNEL} command={CMD} />,
    messages: (
      <>
        <ChatMessage from="buyer" ago={1}>
          我的點數還剩多少？
        </ChatMessage>
        {reply && (
          <ChatMessage from="bot" command={{ by: "buyer", name: CMD.name }} enter>
            <SnapshotMessage id="flow/balance_show/self" scenario={SCENARIO} />
          </ChatMessage>
        )}
      </>
    ),
  },
];

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, { panes: [] });
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): InputState => ({ kind: "typing", typed: t });

  step(0, { panes: channel({ kind: "empty" }, false) }, {
    caption: "顧客在指令頻道輸入 /balance show",
    shot: { zoom: 1 },
    cursor: { ...typing, hidden: true },
  });
  step(600, {}, { shot: zoom(1.8, l.at.input), cursor: typing });
  step(1000, { panes: channel(typed("/"), false) }, { cursor: { ...typing, click: true } });
  step(1300, { panes: channel(typed("/bal"), false) });
  step(1600, { panes: channel(typed("/balance s"), false) });
  step(1900, { panes: channel(typed("/balance show"), false) });
  step(2700, { panes: channel({ kind: "options", options: [MODE] }, false) }, {
    caption: `「${MODE.name}」選「${MODE.value}」後送出`,
  });
  step(4200, { panes: channel({ kind: "empty" }, true) }, {
    caption: "機器人在頻道貼出顧客目前的點數",
    shot: zoom(1.4, l.at.reply),
    cursor: { ...typing, hidden: true },
  });
  step(7000, {}, { shot: { zoom: 1 } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceShowDemo() {
  return (
    <DiscordDemo
      label={`示範：顧客在指令頻道輸入 /balance show，顯示模式選${MODE.value}，機器人在頻道貼出顧客的點數餘額 ${SCENARIO.balance}`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DiscordScene layout={layout} panes={step.screen.panes} />}
    </DiscordDemo>
  );
}
