"use client";
// /fp from start to order: the merchant types /fp 500 in a ticket channel, the customer picks
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
  DiscordDemo,
  DiscordScene,
  LIST_W,
  SnapshotEmbed,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type InputState,
  type SceneLayout,
} from "@/components/demo";
import { ActionRow, DiscordButton } from "@/components/discord";
import { optionPill, slashCommand } from "@/lib/commands";
import { fillSnapshot } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { TicketCategories } from "./kit";

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
type Layout = SceneLayout<Targets>;

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

// ---- Timeline ----

const START: Screen = { input: { kind: "empty" }, bot: "none", channel: "open" };
/** The amount option as it is typed in. */
const amount = (typed: string): InputState => ({ kind: "options", options: [optionPill(FP, "amount", typed)] });

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, START);
  const at = l.at;
  const typing = point(at.typing, { typing: true });

  step(0, {}, { caption: "商家在訂單頻道輸入 /fp", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, {}, { shot: zoom(1.9, at.input), cursor: typing });
  step(1000, { input: { kind: "typing", typed: "/" } }, { cursor: { ...typing, click: true } });
  step(1250, { input: { kind: "typing", typed: "/f" } });
  step(1500, { input: { kind: "typing", typed: "/fp" } });
  step(2200, { input: amount("") }, { caption: `填上金額 ${SCENARIO.amount} 後送出` });
  step(2500, { input: amount("5") });
  step(2650, { input: amount("50") });
  step(2800, { input: amount(String(SCENARIO.amount)) });
  step(3500, { input: { kind: "empty" }, bot: "select", channel: "selecting" }, {
    caption: "機器人回覆付款方式選單，頻道也跟著改名、換分類",
    // The whole screen, so the renamed channel in its new category is in view.
    shot: { zoom: 1 },
    cursor: { ...typing, hidden: true },
  });
  step(4900, {}, {
    caption: "顧客打開選單，選「四大超商條碼」",
    shot: zoom(1.35, at.reply),
    cursor: point(at.select),
  });
  step(5800, {}, { cursor: point(at.select, { click: true }) });
  step(6000, { bot: "menu" }, { shot: zoom(1.6, at.menu) });
  step(6800, {}, { cursor: point(at.option) });
  step(7500, { bot: "menuPick" }, { cursor: point(at.option, { click: true }) });
  step(7800, { bot: "confirm" }, {
    caption: "確認金額和手續費，按「下一步」",
    shot: zoom(1.35, at.confirmScreen),
    cursor: point(at.aside),
  });
  step(8500, {}, { cursor: point(at.next) });
  step(9300, {}, { cursor: point(at.next, { click: true }) });
  step(9600, { bot: "buyer" }, { caption: "確認購買人資訊，取得付款碼", shot: zoom(1.4, at.buyer) });
  step(10300, {}, { cursor: point(at.confirm) });
  step(11100, {}, { cursor: point(at.confirm, { click: true }) });
  step(11500, { bot: "order", channel: "pending" }, {
    caption: "訂單成立，條碼貼在頻道裡，頻道再換到待付款的分類",
    shot: zoom(1.1, at.order),
    cursor: { ...point(at.confirm), hidden: true },
  });
  step(13300, {}, { shot: { zoom: 1 } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

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

export function FpDemo() {
  return (
    <DiscordDemo
      label={`示範：商家在訂單頻道輸入 /fp 金額 ${SCENARIO.amount}，顧客從選單選四大超商條碼，確認付款方式和購買人資訊後，機器人在頻道貼出含條碼的訂單，頻道也跟著改名、換分類`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <FpScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
