"use client";
// The bot's auto reply: a customer DMs the bot "在嗎？" (a trigger word, server.py
// AUTO_REPLY_TRIGGERS) thinking it is a person, and the bot answers that it is a bot and to ask
// the shop's staff. The customer's words are illustrative; the reply comes from the snapshot.
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasPoint,
  type SceneLayout,
} from "@/components/demo";
import { ChatInput } from "@/components/discord";
import { DEMO_BOT } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
/** What the customer types: it contains the trigger word 在嗎. */
export const TYPED = "在嗎？我剛剛付款了";

type Layout = SceneLayout<{ typing: CanvasPoint }>;
export type Screen = { typed: string; sent: boolean; reply: boolean };

// Measured in Chrome at 1280px (wide) and 375px (narrow) viewports with every screen drawn unscaled.
const WIDE: Layout = {
  w: 640,
  h: 440,
  at: { typing: { x: 330, y: 402 } },
};
const NARROW: Layout = {
  w: 400,
  h: 500,
  at: { typing: { x: 300, y: 462 } },
};

const START: Screen = { typed: "", sent: false, reply: false };

function timeline(l: Layout) {
  const { steps, step, point } = stepper<Screen>(l, START);
  const typing = point(l.at.typing, { typing: true });

  step(0, {}, { caption: "顧客私訊機器人，以為對面是真人", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(700, {}, { cursor: typing });
  step(1100, { typed: "在" }, { cursor: { ...typing, click: true } });
  step(1400, { typed: "在嗎？" });
  step(1800, { typed: "在嗎？我剛剛" });
  step(2200, { typed: TYPED });
  step(3100, { typed: "", sent: true }, { caption: "訊息裡有觸發的字詞，這裡是在嗎", cursor: { ...typing, hidden: true } });
  step(4300, { reply: true }, { caption: "機器人自動回覆：它不是真人，訂單問題請找客服" });
  step(9500, {}, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function AutoReplyScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return (
    <DiscordScene
      layout={layout}
      panes={[
        {
          id: "dm",
          kind: "dm",
          title: DEMO_BOT.name,
          tag: "顧客的私訊",
          input: <ChatInput dm={DEMO_BOT.name} typed={screen.typed} />,
          messages: (
            <>
              {screen.sent && (
                <ChatMessage from="buyer" enter>
                  {TYPED}
                </ChatMessage>
              )}
              {screen.reply && (
                <ChatMessage from="bot" enter>
                  <SnapshotMessage id="server/auto_reply/dm_trigger" scenario={SCENARIO} />
                </ChatMessage>
              )}
            </>
          ),
        },
      ]}
    />
  );
}

export function AutoReplyDemo() {
  return (
    <DiscordDemo
      label={`示範：顧客私訊機器人「${TYPED}」，機器人自動回覆它不是真人，訂單問題請直接找客服`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <AutoReplyScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
