"use client";
// What the bot sends when it joins a server that has no settings yet (app/bot/cogs/guide.py,
// on_guild_join): the welcome message in the server's system channel, and the same welcome as a
// DM to the server owner; the owner presses 開始設定. One window at a time, the channel first. The channel name is an example: the
// system channel is whatever the server set in Discord.
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { DEMO_BOT } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
/** Illustrative: the server's system channel (Discord's 系統訊息頻道 setting). */
const SYSTEM_CHANNEL = "歡迎";

export type Screen = { channel: boolean; dm: boolean; show: "channel" | "dm" };
type Targets = { channelMsg: CanvasArea; dmMsg: CanvasArea; start: CanvasPoint; aside: CanvasPoint };
type Layout = SceneLayout<Targets>;

/**
 * Points and areas from the window's left edge, measured on this page under next dev in Chrome at
 * 1280px and 375px viewports. Both show one window at a time (both at once made the wide stage
 * over 1000px tall).
 */
const WIDE: Layout = {
  w: 640,
  h: 560,
  at: {
    channelMsg: { x: 0, y: 200, w: 640, h: 345 },
    dmMsg: { x: 0, y: 165, w: 640, h: 380 },
    start: { x: 128, y: 526 },
    aside: { x: 520, y: 480 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {
    channelMsg: { x: 0, y: 340, w: 400, h: 405 },
    dmMsg: { x: 0, y: 290, w: 400, h: 455 },
    start: { x: 120, y: 726 },
    aside: { x: 330, y: 660 },
  },
};

const START: Screen = { channel: false, dm: false, show: "channel" };

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, START);
  const at = l.at;
  step(0, {}, { caption: "機器人剛加入伺服器", shot: { zoom: 1 }, cursor: { ...point(at.aside), hidden: true } });
  step(1200, { channel: true }, { caption: "系統訊息頻道收到「感謝邀請 FunI 付款系統！」", shot: zoom(1.2, at.channelMsg) });
  step(4200, { dm: true, show: "dm" }, {
    caption: "伺服器擁有者也收到私訊，開頭寫著是哪個伺服器加了機器人",
    shot: zoom(1.2, at.dmMsg),
  });
  step(7400, {}, { caption: "按「開始設定」打開後台的設定精靈", cursor: point(at.start) });
  step(8600, {}, { cursor: point(at.start, { click: true }) });
  step(9000, {}, { cursor: point(at.aside) });
  step(11400, {}, { shot: { zoom: 1 }, cursor: { ...point(at.aside), hidden: true } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function WelcomeScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const channel: Pane = {
    id: "channel",
    kind: "channel",
    title: SYSTEM_CHANNEL,
    tag: "系統訊息頻道",
    messages: screen.channel && (
      <ChatMessage from="bot" enter id="channel-welcome">
        <SnapshotMessage id="guide/welcome/channel_web" scenario={SCENARIO} />
      </ChatMessage>
    ),
  };
  const dm: Pane = {
    id: "dm",
    kind: "dm",
    title: DEMO_BOT.name,
    tag: "擁有者的私訊",
    messages: screen.dm && (
      <ChatMessage from="bot" enter id="dm-welcome">
        <SnapshotMessage id="guide/welcome/dm_web" scenario={SCENARIO} />
      </ChatMessage>
    ),
  };
  return <DiscordScene layout={layout} panes={[screen.show === "dm" ? dm : channel]} />;
}

export function WelcomeDemo() {
  return (
    <DiscordDemo
      label="示範：機器人加入伺服器後，在系統訊息頻道貼出「感謝邀請 FunI 付款系統！」，也私訊伺服器擁有者同樣的歡迎訊息；擁有者在私訊按「開始設定」打開後台的設定精靈"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <WelcomeScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
