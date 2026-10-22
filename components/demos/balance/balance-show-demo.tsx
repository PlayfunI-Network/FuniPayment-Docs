"use client";
// /balance show: the customer asks for their balance in the commands channel and the bot answers
// in the channel with the blue balance embed (mode 公開顯示).
import { SnapshotMessage, type CanvasArea, type CanvasLayout, type CanvasPoint } from "@/components/demo";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { ChatDemo, type Input, type Msg, type Pane } from "./scene";
import { balanceCommand, optionName, stepper } from "./timeline";

const SCENARIO = SCENARIOS.balanceHistory;
const CMD = balanceCommand("show");
const MODE = optionName(CMD.options, "mode");
const CHANNEL = DEMO_CHANNELS.command.name;

type Layout = CanvasLayout & { h: number; at: { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea } };

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

const ASK: Msg = { id: "ask", from: "buyer", ago: 1, body: "我的點數還剩多少？" };
const REPLY: Msg = {
  id: "reply",
  from: "bot",
  command: { by: "buyer", name: CMD.name },
  enter: true,
  body: <SnapshotMessage id="flow/balance_show/self" scenario={SCENARIO} />,
};

const channel = (input: Input, reply: boolean): Pane[] => [
  { id: "channel", kind: "channel", title: CHANNEL, messages: reply ? [ASK, REPLY] : [ASK], input },
];

function timeline(l: Layout) {
  const { out, step, point, zoom } = stepper(l);
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): Input => ({ kind: "typing", command: CMD.name, description: CMD.description, typed: t });

  step(0, channel({ kind: "empty" }, false), { caption: "顧客在指令頻道輸入 /balance show", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, null, { shot: zoom(1.8, l.at.input), cursor: typing });
  step(1000, channel(typed("/"), false), { cursor: { ...typing, click: true } });
  step(1300, channel(typed("/bal"), false));
  step(1600, channel(typed("/balance s"), false));
  step(1900, channel(typed("/balance show"), false));
  step(2700, channel({ kind: "options", command: CMD.name, options: [{ name: MODE, value: "公開顯示" }] }, false), {
    caption: "「顯示模式」選「公開顯示」後送出",
  });
  step(4200, channel({ kind: "empty" }, true), {
    caption: "機器人在頻道貼出顧客目前的點數",
    shot: zoom(1.4, l.at.reply),
    cursor: { ...typing, hidden: true },
  });
  step(7000, null, { shot: { zoom: 1 } });
  return out;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BalanceShowDemo() {
  return (
    <ChatDemo
      label="示範：顧客在指令頻道輸入 /balance show，顯示模式選公開顯示，機器人在頻道貼出顧客的點數餘額 60"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    />
  );
}
