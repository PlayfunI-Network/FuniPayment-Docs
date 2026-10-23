"use client";
// /auto-publish: the merchant runs it in an announcement channel, the bot answers that the
// channel now publishes automatically, and the next message the merchant posts there is
// published at once: it shows up in a channel of another server that follows this one (the
// lower window). The channel names and the announcement are illustrative; the bot's reply comes
// from the snapshot.
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
import { ChatInput, Message } from "@/components/discord";
import { slashCommand } from "@/lib/commands";
import { DEMO_PEOPLE, demoTime } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const CMD = slashCommand("auto-publish");
/** The merchant's announcement channel and a channel of another server that follows it. */
export const CHANNEL = "公告";
const FOLLOWER = "合作伺服器公告";
const ANNOUNCEMENT = "本週六晚上 8 點開放新伺服器，記得準時上線！";

type Targets = { typing: CanvasPoint; input: CanvasArea; reply: CanvasArea; follower: CanvasArea };
type Layout = SceneLayout<Targets>;
/** What is on screen: the input, whether the reply and the announcement are there, and if it has been published. */
export type Screen = { input: InputState; reply: boolean; posted: boolean; published: boolean };

// Measured in Chrome at 1280px (wide) and 375px (narrow) viewports with every screen drawn unscaled.
const WIDE: Layout = {
  w: 640,
  h: 620,
  at: {
    typing: { x: 260, y: 335 },
    input: { x: 0, y: 190, w: 440, h: 180 },
    // Narrower than the window, so the camera can move in on the messages.
    reply: { x: 0, y: 150, w: 460, h: 210 },
    follower: { x: 0, y: 470, w: 460, h: 130 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 680,
  at: {
    typing: { x: 260, y: 365 },
    input: { x: 0, y: 220, w: 300, h: 180 },
    reply: { x: 0, y: 110, w: 400, h: 290 },
    follower: { x: 0, y: 410, w: 400, h: 270 },
  },
};

export function panes(screen: Screen): Pane[] {
  return [
    {
      id: "news",
      kind: "channel",
      title: CHANNEL,
      grow: 1.5,
      tag: "星光遊戲社",
      input: <CommandInput input={screen.input} channel={CHANNEL} command={CMD} />,
      messages: (
        <>
          {screen.reply && (
            <ChatMessage from="bot" command={{ by: "admin", name: CMD.name }} enter>
              <SnapshotMessage id="server/auto_publish/add_ok" scenario={SCENARIO} />
            </ChatMessage>
          )}
          {screen.posted && (
            <ChatMessage from="admin" enter>
              {ANNOUNCEMENT}
            </ChatMessage>
          )}
        </>
      ),
    },
    {
      id: "follower",
      kind: "channel",
      title: FOLLOWER,
      tag: "追蹤這個公告頻道的伺服器",
      input: <ChatInput channel={FOLLOWER} />,
      messages: screen.published && (
        // A followed channel's message carries the source server and channel as its author.
        <div className="demo-in">
          <Message author={`${DEMO_PEOPLE.shop.name} #${CHANNEL}`} avatar={DEMO_PEOPLE.shop.avatar} time={demoTime(0)}>
            {ANNOUNCEMENT}
          </Message>
        </div>
      ),
    },
  ];
}

const START: Screen = { input: { kind: "empty" }, reply: false, posted: false, published: false };

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, START);
  const typing = point(l.at.typing, { typing: true });
  const typed = (t: string): InputState => ({ kind: "typing", typed: t });

  step(0, {}, { caption: "商家在公告頻道輸入 /auto-publish", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, {}, { shot: zoom(1.8, l.at.input), cursor: typing });
  step(1000, { input: typed("/") }, { cursor: { ...typing, click: true } });
  step(1300, { input: typed("/auto") });
  step(1600, { input: typed("/auto-pub") });
  step(1900, { input: typed("/auto-publish") });
  step(2700, { input: { kind: "options", options: [] } }, { caption: "這個指令沒有參數，直接送出" });
  step(3700, { input: { kind: "empty" }, reply: true }, {
    caption: "機器人回覆這個頻道已設定為自動發佈",
    shot: zoom(1.4, l.at.reply),
    cursor: { ...typing, hidden: true },
  });
  step(6000, { posted: true }, { caption: "之後商家在這裡發的訊息……" });
  step(7200, { published: true }, {
    caption: "機器人會立刻發佈，追蹤這個頻道的伺服器馬上收到",
    shot: zoom(1.3, l.at.follower),
  });
  step(9800, {}, { shot: { zoom: 1 } });
  step(11500, {}, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function AutoPublishScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return <DiscordScene layout={layout} panes={panes(screen)} />;
}

export function AutoPublishDemo() {
  return (
    <DiscordDemo
      label={`示範：商家在公告頻道 ${CHANNEL} 輸入 /auto-publish，機器人回覆已設定為自動發佈；商家接著發的公告被自動發佈，出現在追蹤這個頻道的另一個伺服器`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <AutoPublishScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
