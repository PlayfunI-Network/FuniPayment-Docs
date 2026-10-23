"use client";
// Shared by the payments and buyers demos: the Discord screen they are drawn on (a channel or a
// DM window, optionally with the channel list), the chat input as a command is typed and filled,
// and a step builder in the style of fp-demo.tsx. Every bot text still comes from the snapshots;
// only the screen around it is drawn here.
import type { ReactNode } from "react";
import { canvasPoint, type CanvasArea, type CanvasLayout, type CanvasPoint, type DemoStep } from "@/components/demo";
import { ChannelList, ChatInput, DiscordWindow, DmWindow, SlashPicker } from "@/components/discord";
import { COMMANDS } from "@/content/bot-ui.generated";
import { DEMO_NOW, DEMO_PEOPLE, discordTime } from "@/lib/scenario";

export const BOT = { name: "FunI 付款系統", avatar: "/brand/funi-icon.png" } as const;
export const BUYER = DEMO_PEOPLE.buyer;
export const ADMIN = DEMO_PEOPLE.admin;

/** Discord's time label for a message `minutesAgo` before the demo's "now". */
export const time = (minutesAgo = 0) => discordTime(new Date(DEMO_NOW.getTime() - minutesAgo * 60_000));

type Sub = (typeof COMMANDS.payment.subcommands)[number];

/** A /payment subcommand from commands.json: its description and options (names in zh-TW). */
export function paymentSub(name: Sub["name"]): Sub {
  const sub = COMMANDS.payment.subcommands.find((s) => s.name === name);
  if (!sub) throw new Error(`/payment 沒有 ${name}`);
  return sub;
}

/** An option's zh-TW name, and the label of one of its choices (by value), as Discord shows them. */
export function optionPill(sub: Sub, option: string, choice?: string | number, value?: string) {
  const o = sub.options.find((x) => x.name === option);
  if (!o) throw new Error(`/payment ${sub.name} 沒有參數 ${option}`);
  if (choice === undefined) return { name: o.nameZh, value: value ?? "" };
  const c = "choices" in o ? (o.choices as readonly { label: string; value: string | number }[]).find((x) => x.value === choice) : undefined;
  if (!c) throw new Error(`/payment ${sub.name} ${option} 沒有選項 ${choice}`);
  return { name: o.nameZh, value: c.label };
}

/**
 * What the chat input shows: empty, the command being typed (Discord's autocomplete popup open
 * above it), or the command with its filled options as pills (several, unlike SlashPicker).
 */
export type InputState =
  | { kind: "empty" }
  | { kind: "typing"; typed: string }
  | { kind: "options"; options: { name: string; value: string }[] };

export function CommandInput({
  input,
  channel,
  command,
  description,
}: {
  input: InputState;
  channel: string;
  command: string;
  description: string;
}) {
  if (input.kind === "empty") return <ChatInput channel={channel} />;
  if (input.kind === "typing") {
    return <SlashPicker command={command} description={description} appName={BOT.name} placeholder={input.typed} />;
  }
  // SlashPicker's input, with every filled option as its own pill.
  return (
    <div className="mt-4 px-4 text-base leading-[1.375rem] whitespace-normal">
      <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg bg-[#383a40] px-4 py-2.5">
        <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-[#b5bac1]">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path fill="#383a40" d="M12 7a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1Z" />
        </svg>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[#dbdee1]">
          <span className="font-medium">/{command}</span>
          {input.options.map((o) => (
            <span
              key={o.name}
              className="inline-flex min-w-0 items-stretch overflow-hidden rounded bg-[#1e1f22] text-[0.9375rem] leading-6"
            >
              <span className="shrink-0 bg-[#4e5058] px-1.5 text-[#f2f3f5]">{o.name}</span>
              <span className="min-w-0 truncate px-1.5 tabular-nums">{o.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A layout per stage size; `at` holds the points and areas a demo aims at, measured on it. */
export type Layout<T> = CanvasLayout & { left: number; list: boolean; at: T };

/** The width of the channel list in the wide layouts that show one. */
export const LIST_W = 240;
/** Below this stage width the narrow layout is used. */
export const NARROW_BELOW = 600;

/**
 * The screen: the channel list (wide layouts that have one), then a channel or DM window whose
 * messages sit at the bottom above the input, older ones fading out at the top.
 */
export function Screen({
  layout,
  title,
  dm,
  list,
  input,
  children,
}: {
  layout: Layout<unknown>;
  title: string;
  dm?: boolean;
  list?: ReactNode;
  input?: ReactNode;
  children: ReactNode;
}) {
  const body = (
    // The window's header (48px) and its top and bottom padding (4px, 16px) take the rest.
    <div className="flex flex-col" style={{ height: layout.h - 48 - 4 - 16 }}>
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_24px)]">
        {children}
      </div>
      {input}
    </div>
  );
  return (
    <div className="flex h-full w-full bg-[#313338]">
      {layout.list && list && (
        <div className="h-full shrink-0" style={{ width: LIST_W }}>
          {list}
        </div>
      )}
      {dm ? (
        <DmWindow peer={title} avatar={BOT.avatar} className="h-full rounded-none! border-0! shadow-none!">
          {body}
        </DmWindow>
      ) : (
        <DiscordWindow title={title} kind="channel" className="h-full rounded-none! border-0! shadow-none!">
          {body}
        </DiscordWindow>
      )}
    </div>
  );
}

/**
 * A ticket channel moving through categories. Illustrative names, as a merchant could set them
 * on the dashboard's channels tab (the bot has no default names); `here` is the demo's channel.
 */
export function TicketCategories({
  here,
  categories,
}: {
  here: { name: string; category: string };
  categories: { name: string; others: string[] }[];
}) {
  return (
    <ChannelList
      className="h-full rounded-none!"
      categories={[
        { name: "資訊", channels: [{ name: "公告" }, { name: "商品介紹" }] },
        ...categories.map((c) => ({
          name: c.name,
          channels: [
            ...c.others.map((name) => ({ name })),
            ...(here.category === c.name ? [{ name: here.name, highlight: true }] : []),
          ],
        })),
      ]}
    />
  );
}

/**
 * Builds a timeline of steps that each carry the screen state (`S`), like fp-demo.tsx: a change
 * applies from that step on, and the cursor helpers turn canvas points into cursor states.
 */
export function stepper<S extends object>(layout: Layout<unknown>, start: S) {
  const out: (DemoStep & { screen: S })[] = [];
  let screen = start;
  return {
    steps: out,
    step(at: number, change: Partial<S>, rest: Omit<DemoStep, "at"> = {}) {
      screen = { ...screen, ...change };
      out.push({ at, screen, ...rest });
    },
    point: (p: CanvasPoint, extra?: Parameters<typeof canvasPoint>[2]) => canvasPoint(layout, p, extra),
  };
}

export type { CanvasArea, CanvasPoint };
