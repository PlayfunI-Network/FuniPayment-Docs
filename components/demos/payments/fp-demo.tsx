"use client";
// /fp from start to order: the merchant types /fp 500 in a ticket channel, the customer picks
// 四大超商條碼 in the menu, confirms the method and the buyer information, and the order with
// its barcode lands in the channel. The channel list beside it shows the channel being renamed
// and moved, with names a merchant could set on the dashboard (the bot has no default names).
//
// The screen is drawn on a fixed canvas (WIDE with the channel list, NARROW without it for
// phones) and scaled to the stage, so the camera and cursor can aim at canvas pixels. Every
// bot text comes from content/bot-ui.generated.ts; only the two chat lines before /fp, the
// channel names and Discord's own chrome are written here.
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { DemoStage, SnapshotEmbed, SnapshotMessage, type CursorState, type DemoStep, type Rect, type Shot } from "@/components/demo";
import {
  ActionRow,
  ChannelList,
  ChatInput,
  DiscordButton,
  DiscordWindow,
  Message,
  SlashPicker,
} from "@/components/discord";
import { COMMANDS } from "@/content/bot-ui.generated";
import { DEMO_NOW, DEMO_PEOPLE, discordTime, fillSnapshot } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const BOT = { name: "FunI 付款系統", avatar: "/brand/funi-icon.png" };
const FP = COMMANDS.fp;
const AMOUNT = FP.options.find((o) => o.name === "amount")!;

/**
 * The ticket channel's name and category at each stage. Illustrative: a merchant who set
 * 「選擇中｜<name:ticket->」 and 「待付款｜<name:ticket->」 on the dashboard's channels tab, and a
 * category for each stage (the bot moves and renames only inside the ticket categories).
 */
const CHANNEL = {
  open: { name: "ticket-0042", category: "開單" },
  selecting: { name: "選擇中｜0042", category: "選擇中" },
  pending: { name: "待付款｜0042", category: "待付款" },
} as const;
type ChannelStage = keyof typeof CHANNEL;

type Input = { kind: "empty" } | { kind: "command"; typed: string } | { kind: "option"; value: string };
/** Which bot message is on screen: the /fp reply as it is edited step by step, then the order. */
type Bot = "none" | "select" | "menu" | "menuPick" | "confirm" | "buyer" | "order";
export type Screen = { input: Input; bot: Bot; channel: ChannelStage };
type FpStep = DemoStep & { screen: Screen };

// ---- Canvas and where things are on it (CSS px of the canvas, measured in Chrome) ----

const H = 740;
const WINDOW_W = 640;
const LIST_W = 240;
type Layout = { w: number; left: number };
const WIDE: Layout = { w: LIST_W + WINDOW_W, left: LIST_W };
const NARROW: Layout = { w: WINDOW_W, left: 0 };
/** Below this stage width the channel list is left out (the header still shows the renames). */
const NARROW_BELOW = 600;

/**
 * Points and areas inside the Discord window (x from the window's left edge), measured with
 * app/dev/fp (next dev) in Chrome at a 1280px and a 375px viewport; the points sit inside the
 * buttons at both (the kit's sm: paddings move them by up to 8px).
 */
const AT = {
  // Right of the typed text, so the I-beam never covers it.
  typing: { x: 420, y: 701 },
  input: { x: 0, y: 540, w: 440, h: 200 },
  reply: { x: 40, y: 430, w: 560, h: 250 },
  select: { x: 230, y: 641 },
  menu: { x: 40, y: 340, w: 520, h: 340 },
  option: { x: 200, y: 422 },
  confirmScreen: { x: 40, y: 350, w: 560, h: 330 },
  next: { x: 251, y: 646 },
  buyer: { x: 40, y: 330, w: 560, h: 350 },
  confirm: { x: 377, y: 646 },
  order: { x: 40, y: 60, w: 600, h: 620 },
};

function rect(l: Layout, r: { x: number; y: number; w: number; h: number }): Rect {
  return { x: (l.left + r.x) / l.w, y: r.y / H, w: r.w / l.w, h: r.h / H };
}
/** Zoom `zoom` times onto `area`, but never so close that the area no longer fits the stage. */
function zoomTo(l: Layout, zoom: number, area: { x: number; y: number; w: number; h: number }): Shot {
  const focus = rect(l, area);
  return { zoom: Math.min(zoom, 1 / focus.w, 1 / focus.h), focus };
}
function point(l: Layout, p: { x: number; y: number }, extra: Partial<CursorState> = {}): CursorState {
  return { x: (l.left + p.x) / l.w, y: p.y / H, ...extra };
}

// ---- Timeline ----

const START: Screen = { input: { kind: "empty" }, bot: "none", channel: "open" };

function timeline(l: Layout): FpStep[] {
  const out: FpStep[] = [];
  let screen = START;
  const step = (at: number, change: Partial<Screen>, rest: Omit<DemoStep, "at"> = {}) => {
    screen = { ...screen, ...change };
    out.push({ at, screen, ...rest });
  };
  const typing = point(l, AT.typing, { typing: true });

  step(0, {}, { caption: "商家在訂單頻道輸入 /fp", shot: { zoom: 1 }, cursor: { ...typing, hidden: true } });
  step(600, {}, { shot: zoomTo(l, 1.9, AT.input), cursor: typing });
  step(1000, { input: { kind: "command", typed: "/" } }, { cursor: { ...typing, click: true } });
  step(1250, { input: { kind: "command", typed: "/f" } });
  step(1500, { input: { kind: "command", typed: "/fp" } });
  step(2200, { input: { kind: "option", value: "" } }, { caption: "填上金額 500 後送出" });
  step(2500, { input: { kind: "option", value: "5" } });
  step(2650, { input: { kind: "option", value: "50" } });
  step(2800, { input: { kind: "option", value: String(SCENARIO.amount) } });
  step(3500, { input: { kind: "empty" }, bot: "select", channel: "selecting" }, {
    caption: "機器人回覆付款方式選單，頻道改名並移到「選擇中」",
    // The whole screen, so the renamed channel in its new category is in view.
    shot: { zoom: 1 },
    cursor: { ...typing, hidden: true },
  });
  step(4900, {}, {
    caption: "顧客打開選單，選「四大超商條碼」",
    shot: zoomTo(l, 1.35, AT.reply),
    cursor: point(l, AT.select),
  });
  step(5800, {}, { cursor: point(l, AT.select, { click: true }) });
  step(6000, { bot: "menu" }, { shot: zoomTo(l, 1.6, AT.menu) });
  step(6800, {}, { cursor: point(l, AT.option) });
  step(7500, { bot: "menuPick" }, { cursor: point(l, AT.option, { click: true }) });
  step(7800, { bot: "confirm" }, { caption: "確認金額和手續費，按「下一步」", shot: zoomTo(l, 1.35, AT.confirmScreen) });
  step(8500, {}, { cursor: point(l, AT.next) });
  step(9300, {}, { cursor: point(l, AT.next, { click: true }) });
  step(9600, { bot: "buyer" }, { caption: "確認購買人資訊，取得付款碼", shot: zoomTo(l, 1.4, AT.buyer) });
  step(10300, {}, { cursor: point(l, AT.confirm) });
  step(11100, {}, { cursor: point(l, AT.confirm, { click: true }) });
  step(11500, { bot: "order", channel: "pending" }, {
    caption: "訂單成立，條碼貼在頻道裡，頻道移到「待付款」",
    shot: zoomTo(l, 1.1, AT.order),
    cursor: { ...point(l, AT.confirm), hidden: true },
  });
  step(13300, {}, { shot: { zoom: 1 } });
  return out;
}

export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

// ---- Screen ----

const time = (minutesAgo: number) => discordTime(new Date(DEMO_NOW.getTime() - minutesAgo * 60_000));

function Categories({ stage }: { stage: ChannelStage }) {
  const here = CHANNEL[stage];
  const inCategory = (category: string, others: string[]) => [
    ...others.map((name) => ({ name })),
    ...(here.category === category ? [{ name: here.name, highlight: true }] : []),
  ];
  return (
    <ChannelList
      className="h-full rounded-none!"
      categories={[
        { name: "資訊", channels: [{ name: "公告" }, { name: "商品介紹" }] },
        { name: CHANNEL.open.category, channels: inCategory(CHANNEL.open.category, ["ticket-0041"]) },
        { name: CHANNEL.selecting.category, channels: inCategory(CHANNEL.selecting.category, []) },
        { name: CHANNEL.pending.category, channels: inCategory(CHANNEL.pending.category, ["待付款｜0039"]) },
      ]}
    />
  );
}

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

export function FpScreen({ screen, wide }: { screen: Screen; wide: boolean }) {
  const channel = CHANNEL[screen.channel];
  const now = discordTime(DEMO_NOW);
  return (
    <div className="flex h-full w-full bg-[#313338]">
      {wide && (
        <div className="h-full shrink-0" style={{ width: LIST_W }}>
          <Categories stage={screen.channel} />
        </div>
      )}
      <DiscordWindow title={channel.name} kind="channel" className="h-full rounded-none! border-0! shadow-none!">
        <div className="flex flex-col" style={{ height: H - 48 - 4 - 16 }}>
          <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_48px)]">
            <Message author={DEMO_PEOPLE.buyer.name} avatar={DEMO_PEOPLE.buyer.avatar} time={time(3)}>
              {`你好，我想買 ${SCENARIO.amount} 元的方案`}
            </Message>
            <Message author={DEMO_PEOPLE.admin.name} avatar={DEMO_PEOPLE.admin.avatar} time={time(2)}>
              好的，馬上幫你開單
            </Message>
            {screen.bot !== "none" && screen.bot !== "order" && (
              <Message
                author={BOT.name}
                avatar={BOT.avatar}
                bot
                time={now}
                interaction={{ user: DEMO_PEOPLE.admin.name, avatar: DEMO_PEOPLE.admin.avatar, command: FP.name }}
              >
                <div key={screen.bot === "menuPick" ? "menu" : screen.bot} className={screen.bot.startsWith("menu") ? "" : "demo-in"}>
                  <FpReply bot={screen.bot} />
                </div>
              </Message>
            )}
            {screen.bot === "order" && (
              <Message author={BOT.name} avatar={BOT.avatar} bot time={now}>
                <div className="demo-in">
                  <SnapshotMessage id="builder/payment_create/store_barcode/invoice=False" scenario={SCENARIO} />
                </div>
              </Message>
            )}
          </div>
          <Input input={screen.input} channel={channel.name} />
        </div>
      </DiscordWindow>
    </div>
  );
}

function Input({ input, channel }: { input: Input; channel: string }) {
  if (input.kind === "empty") return <ChatInput channel={channel} />;
  if (input.kind === "command") {
    return <SlashPicker command={FP.name} description={FP.description} appName={BOT.name} placeholder={input.typed} />;
  }
  return (
    <SlashPicker
      command={FP.name}
      description={FP.description}
      appName={BOT.name}
      option={{ name: AMOUNT.nameZh, value: input.value }}
    />
  );
}

/** Draws `children` on a `w` × H canvas scaled to the width of the box it fills. */
function Canvas({ w, children }: { w: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="origin-top-left"
        style={{ width: w, height: H, transform: `scale(${width ? width / w : 1})`, visibility: width ? undefined : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

function useWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export function FpDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const wide = width === 0 || width >= NARROW_BELOW;
  const layout = wide ? WIDE : NARROW;
  const steps = wide ? WIDE_STEPS : NARROW_STEPS;
  return (
    <div ref={ref}>
      <DemoStage
        // A new layout is a new timeline: start it from the top.
        key={wide ? "wide" : "narrow"}
        label={`示範：商家在訂單頻道輸入 /fp 金額 ${SCENARIO.amount}，顧客從選單選四大超商條碼，確認付款方式和購買人資訊後，機器人在頻道貼出含條碼的訂單，頻道也跟著改名、換分類`}
        aspect={`${layout.w} / ${H}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w}>
            <FpScreen screen={steps[index].screen} wide={wide} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}
