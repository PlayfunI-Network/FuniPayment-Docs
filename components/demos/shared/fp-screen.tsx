"use client";
// The screens of the /fp story, shared by the /fp demo (components/demos/payments/fp-demo.tsx)
// and the first-order demo (components/demos/getting-started/first-order-demo.tsx), each with its
// own timeline. The story:  the merchant types /fp 500 in a ticket channel, the customer picks
// 四大超商條碼 in the menu, confirms the method and the buyer information, and the order with
// its barcode lands in the channel. The channel list beside it shows the channel being renamed
// and moved, with names a merchant could set on the dashboard (the bot has no default names).
//
// The screen is drawn on a fixed canvas (components/demo/canvas.tsx), one per stage size: WIDE
// with the channel list, NARROW (a phone-width window, so the text stays readable) without it.
// components/demo/discord-scene.tsx draws the Discord screen and plays the right layout. Every
// bot text comes from content/bot-ui.generated.ts; only the two chat lines before /fp, the
// channel names and Discord's own chrome are written here.
import {
  ChatMessage,
  CommandInput,
  DiscordScene,
  LIST_W,
  SnapshotEmbed,
  SnapshotMessage,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type SceneLayout,
} from "@/components/demo";
import { ActionRow, DiscordButton } from "@/components/discord";
import { slashCommand } from "@/lib/commands";
import { fillSnapshot } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { TicketCategories } from "./ticket-categories";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const FP = slashCommand("fp");

/**
 * The ticket channel's name and category at each stage. Illustrative: a merchant who set
 * 選擇中｜<name:ticket-> and 待付款｜<name:ticket-> on the dashboard's channels tab, and a
 * category for each stage (the bot moves and renames only inside the ticket categories).
 */
const CHANNEL = {
  open: { name: "ticket-0042", category: "開單" },
  selecting: { name: "選擇中｜0042", category: "選擇中" },
  pending: { name: "待付款｜0042", category: "待付款" },
} as const;
type ChannelStage = keyof typeof CHANNEL;
const CATEGORIES = [
  { name: CHANNEL.open.category, others: ["ticket-0041"] },
  { name: CHANNEL.selecting.category, others: [] },
  { name: CHANNEL.pending.category, others: ["待付款｜0039"] },
];

/** Which bot message is on screen: the /fp reply as it is edited step by step, then the order. */
type Bot = "none" | "select" | "menu" | "menuPick" | "confirm" | "buyer" | "order";
export type Screen = { input: InputState; bot: Bot; channel: ChannelStage };

// ---- Layouts and where things are on them ----

type Targets = {
  typing: CanvasPoint;
  input: CanvasArea;
  reply: CanvasArea;
  select: CanvasPoint;
  menu: CanvasArea;
  option: CanvasPoint;
  confirmScreen: CanvasArea;
  /** Where the pointer waits after the pick: off the embed text the caption asks you to read. */
  aside: CanvasPoint;
  next: CanvasPoint;
  buyer: CanvasArea;
  confirm: CanvasPoint;
  order: CanvasArea;
};
export type FpLayout = SceneLayout<Targets>;
type Layout = FpLayout;

/**
 * Points and areas inside the Discord window (x from the window's left edge, CSS px), measured
 * on app/dev/fp under next dev in Chrome at 1280px and 375px viewports; each point sits inside
 * its button at both (the kit's sm: paddings move things by up to 8px).
 */
const WIDE: Layout = {
  w: LIST_W + 640,
  h: 780,
  left: LIST_W,
  list: true,
  at: {
    // Right of the typed text, so the I-beam never covers it.
    typing: { x: 420, y: 741 },
    input: { x: 0, y: 580, w: 440, h: 200 },
    reply: { x: 40, y: 470, w: 560, h: 250 },
    select: { x: 230, y: 681 },
    menu: { x: 40, y: 380, w: 520, h: 340 },
    option: { x: 200, y: 462 },
    confirmScreen: { x: 40, y: 390, w: 560, h: 330 },
    aside: { x: 560, y: 600 },
    next: { x: 251, y: 686 },
    buyer: { x: 40, y: 370, w: 560, h: 350 },
    confirm: { x: 377, y: 686 },
    order: { x: 40, y: 100, w: 600, h: 620 },
  },
};
/**
 * A phone-width window: at a 343px stage it is drawn at 0.86, so the embeds' 14px text shows at
 * about 12px even in the wide shot (a 640px window there came out at 7–8px).
 */
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {
    typing: { x: 300, y: 721 },
    input: { x: 0, y: 560, w: 400, h: 200 },
    reply: { x: 20, y: 410, w: 380, h: 290 },
    select: { x: 200, y: 661 },
    menu: { x: 20, y: 360, w: 380, h: 340 },
    option: { x: 180, y: 442 },
    confirmScreen: { x: 20, y: 370, w: 380, h: 330 },
    aside: { x: 384, y: 600 },
    next: { x: 243, y: 666 },
    buyer: { x: 20, y: 270, w: 380, h: 430 },
    // The buttons wrap: 確認並獲取付款碼 is alone on the second row.
    confirm: { x: 136, y: 666 },
    order: { x: 20, y: 160, w: 380, h: 560 },
  },
};

export const LAYOUTS = { wide: WIDE, narrow: NARROW };

// ---- Screen ----

/** The buyer step once the buyer's information is filled in (the customer saved it before). */
function BuyerInfoFilled() {
  // The /fp buyer step keeps 上一步 first; with every field filled the confirm button is enabled
  // (views/consumer_info.py: disabled = not all of name, mail and phone). The filled embed is the
  // same builder with the values in.
  const step = fillSnapshot("flow/fp_method_confirm", SCENARIO);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <SnapshotEmbed id="builder/consumer_info/filled=True/cancel_first=False" scenario={SCENARIO} />
      <ActionRow>
        {step.components.map((b) =>
          b.type === "button" ? <DiscordButton key={b.label} label={b.label} style={b.style} /> : null,
        )}
      </ActionRow>
    </div>
  );
}

function FpReply({ bot }: { bot: Exclude<Bot, "none" | "order"> }) {
  switch (bot) {
    case "select":
      return <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} />;
    case "menu":
      return <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} menu={{ open: "up" }} />;
    case "menuPick":
      return (
        <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} menu={{ open: "up", active: SCENARIO.method }} />
      );
    case "confirm":
      return <SnapshotMessage id="builder/fp/famiport/0/designated=False" scenario={SCENARIO} />;
    case "buyer":
      return <BuyerInfoFilled />;
  }
}

export function FpScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const channel = CHANNEL[screen.channel];
  return (
    <DiscordScene
      layout={layout}
      list={<TicketCategories here={channel} categories={CATEGORIES} />}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: channel.name,
          input: <CommandInput input={screen.input} channel={channel.name} command={FP} />,
          messages: (
            <>
              <ChatMessage from="buyer" ago={3}>{`你好，我想買 ${SCENARIO.amount} 元的方案`}</ChatMessage>
              <ChatMessage from="admin" ago={2}>
                好的，馬上幫你開單
              </ChatMessage>
              {screen.bot !== "none" && screen.bot !== "order" && (
                <ChatMessage from="bot" command={{ by: "admin", name: FP.name }}>
                  <div
                    key={screen.bot === "menuPick" ? "menu" : screen.bot}
                    className={screen.bot.startsWith("menu") ? "" : "demo-in"}
                  >
                    <FpReply bot={screen.bot} />
                  </div>
                </ChatMessage>
              )}
              {screen.bot === "order" && (
                <ChatMessage from="bot" enter>
                  <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
                </ChatMessage>
              )}
            </>
          ),
        },
      ]}
    />
  );
}
