"use client";
// The Discord screen every balance demo draws: one or more windows (a channel, a DM) stacked in
// a fixed canvas, each with its messages pushed to the bottom like Discord. A demo says which
// windows and messages are on screen at each step; the bot's words always come from
// SnapshotMessage / SnapshotEmbed, only the chat lines, channel names and Discord's own chrome
// are written in the demos.
//
// SlashInput is the chat input holding a slash command with several filled options (the shared
// SlashPicker shows one); it belongs in components/discord once merged.
import { useRef, type ReactNode } from "react";
import { Canvas, DemoStage, useWidth, type CanvasLayout, type DemoStep } from "@/components/demo";
import { ChatInput, DiscordWindow, Message, SlashPicker } from "@/components/discord";
import { DEMO_NOW, DEMO_PEOPLE, discordTime } from "@/lib/scenario";

export const BOT = { name: "FunI 付款系統", avatar: "/brand/funi-icon.png" };

export type Who = "bot" | "buyer" | "admin" | "member";
const PEOPLE: Record<Who, { name: string; avatar: string }> = {
  bot: BOT,
  buyer: DEMO_PEOPLE.buyer,
  admin: DEMO_PEOPLE.admin,
  member: DEMO_PEOPLE.member,
};

/** One message group: who sent it, the 「… 使用了 /command」 line when it answers a command. */
export type Msg = {
  /** Stable key; also `data-msg` for measuring. */
  id: string;
  from: Who;
  /** The slash command this bot message answers, and who ran it. */
  command?: { by: Who; name: string };
  /** Minutes before the demo's "now" (0 = now). */
  ago?: number;
  /** Slides in when it first appears. */
  enter?: boolean;
  body: ReactNode;
};

export type Input =
  | { kind: "empty" }
  | { kind: "typing"; command: string; description: string; typed: string }
  | { kind: "options"; command: string; options: { name: string; value: string }[] };

/** One window: a channel (with its input) or a DM with the bot. `grow` shares the canvas height. */
export type Pane = {
  id: string;
  kind: "channel" | "dm";
  title: string;
  messages: Msg[];
  input?: Input;
  grow?: number;
  /** A demo label on the header saying whose window it is (e.g. 「會員的私訊」); not Discord's. */
  tag?: string;
};

const time = (ago = 0) => discordTime(new Date(DEMO_NOW.getTime() - ago * 60_000));

/** The chat input with a slash command and its filled options, each as Discord's name | value pill. */
export function SlashInput({ command, options }: { command: string; options: { name: string; value: string }[] }) {
  return (
    <div className="mt-4 px-4 text-base leading-[1.375rem] whitespace-normal">
      <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg bg-[#383a40] px-4 py-2.5">
        <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-[#b5bac1]">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path fill="#383a40" d="M12 7a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1Z" />
        </svg>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[#dbdee1]">
          <span className="font-medium">/{command}</span>
          {options.map((o) => (
            <span
              key={o.name}
              className="inline-flex min-w-0 items-stretch overflow-hidden rounded bg-[#1e1f22] text-[0.9375rem] leading-6"
            >
              <span className="bg-[#4e5058] px-1.5 text-[#f2f3f5]">{o.name}</span>
              <span className="px-1.5 tabular-nums">{o.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputRow({ input, channel }: { input: Input; channel: string }) {
  if (input.kind === "empty") return <ChatInput channel={channel} />;
  if (input.kind === "typing") {
    return <SlashPicker command={input.command} description={input.description} appName={BOT.name} placeholder={input.typed} />;
  }
  return <SlashInput command={input.command} options={input.options} />;
}

function PaneView({ pane, height }: { pane: Pane; height: number }) {
  return (
    <div className="relative h-full">
      {pane.tag && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-[#5865f2] px-2.5 py-0.5 text-xs leading-5 font-medium text-white">
          {pane.tag}
        </span>
      )}
    <DiscordWindow
      title={pane.title}
      kind={pane.kind}
      avatar={pane.kind === "dm" ? BOT.avatar : undefined}
      className="h-full rounded-none! border-0! shadow-none!"
    >
      {/* The header (48px) and the message pane's padding (4px, 16px) take the rest. */}
      <div data-pane={pane.id} className="flex flex-col" style={{ height: height - 48 - 4 - 16 }}>
        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_24px)]">
          {pane.messages.map((m) => {
            const who = PEOPLE[m.from];
            const by = m.command && PEOPLE[m.command.by];
            return (
              <div key={m.id} data-msg={m.id}>
                <Message
                  author={who.name}
                  avatar={who.avatar}
                  bot={m.from === "bot"}
                  time={time(m.ago)}
                  interaction={by && m.command ? { user: by.name, avatar: by.avatar, command: m.command.name } : undefined}
                >
                  <div className={m.enter ? "demo-in" : ""}>{m.body}</div>
                </Message>
              </div>
            );
          })}
        </div>
        {pane.input && <InputRow input={pane.input} channel={pane.title} />}
      </div>
    </DiscordWindow>
    </div>
  );
}

/**
 * A demo of chat screens: `wide` and `narrow` are the layout and steps for a stage at least /
 * below NARROW_BELOW px wide (a phone-width canvas keeps the text readable on a phone). Each
 * step carries the panes on screen.
 */
export function ChatDemo({
  label,
  wide,
  narrow,
}: {
  label: string;
  wide: { layout: CanvasLayout & { h: number }; steps: SceneStep[] };
  narrow: { layout: CanvasLayout & { h: number }; steps: SceneStep[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const isWide = width === 0 || width >= NARROW_BELOW;
  const { layout, steps } = isWide ? wide : narrow;
  return (
    <div ref={ref}>
      <DemoStage
        // A new layout is a new timeline: start it from the top.
        key={isWide ? "wide" : "narrow"}
        label={label}
        aspect={`${layout.w} / ${layout.h}`}
        steps={steps}
        caption
      >
        {(_, index) => (
          <Canvas w={layout.w} h={layout.h}>
            <Scene panes={steps[index].panes} h={layout.h} />
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}

/** Below this stage width the narrow layout is used. */
export const NARROW_BELOW = 600;

export type SceneStep = DemoStep & { panes: Pane[] };

/** The panes stacked in a `w` × `h` canvas; a 1px line between them. */
export function Scene({ panes, h }: { panes: Pane[]; h: number }) {
  const total = panes.reduce((sum, p) => sum + (p.grow ?? 1), 0);
  const gaps = panes.length - 1;
  return (
    <div className="flex h-full w-full flex-col gap-px bg-[#1e1f22]">
      {panes.map((p) => {
        const height = ((h - gaps) * (p.grow ?? 1)) / total;
        return (
          <div key={p.id} className="shrink-0" style={{ height }}>
            <PaneView pane={p} height={height} />
          </div>
        );
      })}
    </div>
  );
}
