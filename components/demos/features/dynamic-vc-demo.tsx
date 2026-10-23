"use client";
// /dynamic-vc-rename: the merchant picks a voice channel and types the template 訂單 %all_orders%
// (the one the bot's reply snapshot carries), the bot answers and the voice channel in the
// sidebar takes the number; ten minutes later a new order has come in and the name follows.
// The wide layout has the sidebar beside the channel; the narrow one puts the voice channel's
// category above it, so the rename stays in view on a phone. Channel names before the rename
// and the later count are illustrative.
import {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  LIST_W,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { ChannelList } from "@/components/discord";
import { optionPill, slashCommand } from "@/lib/commands";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const CMD = slashCommand("dynamic-vc-rename");
const CHANNEL = DEMO_CHANNELS.command.name;
/** The template in the bot's reply snapshot (server/direct_rename/ok). */
export const TEMPLATE = "訂單 %all_orders%";
/** The voice channel before the bot renames it, after (the snapshots' voice channel), and ten minutes later. */
export const VOICE = { before: "訂單統計", after: DEMO_CHANNELS.voice.name, later: "訂單 129" } as const;
const VOICE_PILL = optionPill(CMD, "channel", VOICE.before);
const TEMPLATE_PILL = (typed: string) => optionPill(CMD, "rename_name", typed);
/** Height of the voice category strip above the channel in the narrow layout. */
const STRIP_H = 116;

type Targets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea; voice: CanvasArea };
type Layout = SceneLayout<Targets>;
export type Screen = { input: InputState; reply: boolean; voice: keyof typeof VOICE };

// Measured in Chrome at 1280px (wide) and 375px (narrow) viewports with every screen drawn unscaled.
// In the narrow layout `voice` is in the strip above the window and y counts from the canvas top.
const WIDE: Layout = {
  w: LIST_W + 600,
  h: 520,
  left: LIST_W,
  list: true,
  at: {
    typing: { x: 420, y: 482 },
    input: { x: 0, y: 330, w: 460, h: 190 },
    reply: { x: 0, y: 260, w: 600, h: 200 },
    voice: { x: -LIST_W, y: 60, w: LIST_W + 300, h: 160 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 640,
  at: {
    typing: { x: 330, y: 602 },
    // The whole width: both filled options wrap across it.
    input: { x: 0, y: 430, w: 400, h: 210 },
    reply: { x: 0, y: 380, w: 400, h: 200 },
    voice: { x: 0, y: 0, w: 400, h: 200 },
  },
};

/** The sidebar: the commands channel, then the category with the voice channel (only that in the strip). */
function Sidebar({ voice, strip }: { voice: string; strip?: boolean }) {
  return (
    <ChannelList
      className="h-full w-full! rounded-none!"
      categories={[
        ...(strip
          ? []
          : [{ name: "文字頻道", channels: [{ name: "公告" }, { name: CHANNEL, highlight: true }] }]),
        {
          name: "統計",
          channels: [
            { name: voice, kind: "voice" as const, highlight: voice !== VOICE.before },
            { name: "閒聊", kind: "voice" as const },
          ],
        },
      ]}
    />
  );
}

function channelPane(screen: Screen): Pane {
  return {
    id: "channel",
    kind: "channel",
    title: CHANNEL,
    input: <CommandInput input={screen.input} channel={CHANNEL} command={CMD} />,
    messages: screen.reply && (
      <ChatMessage from="bot" command={{ by: "admin", name: CMD.name }} enter>
        <SnapshotMessage id="server/direct_rename/ok" scenario={SCENARIO} />
      </ChatMessage>
    ),
  };
}

const START: Screen = { input: { kind: "empty" }, reply: false, voice: "before" };

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, START);
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): InputState => ({ kind: "typing", typed: t });
  const options = (template: string): InputState => ({
    kind: "options",
    options: template ? [VOICE_PILL, TEMPLATE_PILL(template)] : [VOICE_PILL],
  });

  step(0, {}, { caption: "商家輸入 /dynamic-vc-rename", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, {}, { shot: zoom(1.7, l.at.input), cursor: typing });
  step(1000, { input: typed("/") }, { cursor: { ...typing, click: true } });
  step(1300, { input: typed("/dyn") });
  step(1600, { input: typed("/dynamic-vc") });
  step(1900, { input: typed("/dynamic-vc-rename") });
  step(2600, { input: options("") }, { caption: `選要改名的語音頻道「${VOICE.before}」` });
  step(3800, { input: options("訂單 ") }, { caption: `範本填 ${TEMPLATE}` });
  step(4200, { input: options("訂單 %all_") });
  step(4600, { input: options(TEMPLATE) });
  step(5600, { input: { kind: "empty" }, reply: true, voice: "after" }, {
    caption: "機器人回覆設定成功，語音頻道名稱換成目前的訂單數",
    shot: { zoom: 1 },
    cursor: { ...typing, hidden: true },
  });
  step(8200, {}, { shot: zoom(1.6, l.at.voice) });
  step(9400, { voice: "later" }, { caption: "之後每 10 分鐘，名稱跟著最新的數字更新" });
  step(11600, {}, { shot: { zoom: 1 } });
  step(13000, {}, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function DynamicVcScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const voice = VOICE[screen.voice];
  if (layout.list) {
    return <DiscordScene layout={layout} list={<Sidebar voice={voice} />} panes={[channelPane(screen)]} />;
  }
  return (
    <div className="flex h-full w-full flex-col bg-[#1e1f22]">
      <div className="shrink-0 border-b border-[#1e1f22]" style={{ height: STRIP_H }}>
        <Sidebar voice={voice} strip />
      </div>
      <div className="min-h-0 flex-1">
        <DiscordScene layout={{ ...layout, h: layout.h - STRIP_H }} panes={[channelPane(screen)]} />
      </div>
    </div>
  );
}

export function DynamicVcDemo() {
  return (
    <DiscordDemo
      label={`示範：商家輸入 /dynamic-vc-rename，選語音頻道${VOICE.before}，範本填 ${TEMPLATE}。機器人回覆設定成功，語音頻道改名為${VOICE.after}，10 分鐘後再更新為${VOICE.later}`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DynamicVcScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
