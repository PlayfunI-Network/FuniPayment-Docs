"use client";
// The Discord screen the chat demos are drawn on, and the frame around it. A screen is one or
// more windows (a channel, a DM with the bot) stacked on a fixed canvas, optionally beside the
// channel list; each window keeps its messages at the bottom above the input, older ones fading
// out at the top, like Discord. A demo has a wide and a narrow layout (a phone-width canvas, so
// the text stays readable on a phone) and a timeline for each; every step carries the state the
// demo draws its screen from. The bot's words always come from SnapshotMessage / SnapshotEmbed:
// only the chat lines, channel names and Discord's own chrome are written in the demos.
import { useRef, type ReactNode } from "react";
import { ChatInput, DiscordWindow, Message, SlashPicker, type SlashOption } from "@/components/discord";
import type { SlashCommand } from "@/lib/commands";
import { DEMO_BOT, demoSender, demoTime, type DemoSender } from "@/lib/scenario";
import { Canvas, canvasPoint, useWidth, zoomTo, type CanvasArea, type CanvasLayout, type CanvasPoint } from "./canvas";
import type { CursorState } from "./cursor";
import { NARROW_BELOW } from "./dashboard-demo-steps";
import { DemoStage, type DemoStep } from "./stage";

/** Below this stage width a demo uses its narrow layout (the same as the dashboard demos). */
export { NARROW_BELOW };
/** The width of the channel list in the layouts that show one. */
export const LIST_W = 240;

/**
 * A layout per stage size: the canvas, whether it shows the channel list (then `left` is
 * LIST_W, where the window starts), and in `at` the points and areas the demo aims at, measured
 * on it from the window's left edge.
 */
export type SceneLayout<T = unknown> = CanvasLayout & { list?: boolean; at: T };

/** One step of a chat demo: the stage's step and the screen state `S` from this step on. */
export type SceneStep<S> = DemoStep & { screen: S };

/**
 * Builds a timeline on one layout. `step(at, change, rest)` adds a step whose screen is the last
 * one with `change` applied (`{}` keeps it); `point` and `zoom` turn canvas px into cursor and
 * camera values.
 */
export function stepper<S extends object>(layout: CanvasLayout, start: S) {
  const steps: SceneStep<S>[] = [];
  let screen = start;
  return {
    steps,
    step(at: number, change: Partial<S>, rest: Omit<DemoStep, "at"> = {}) {
      screen = { ...screen, ...change };
      steps.push({ at, screen, ...rest });
    },
    point: (p: CanvasPoint, extra?: Partial<CursorState>) => canvasPoint(layout, p, extra),
    zoom: (z: number, area: CanvasArea) => zoomTo(layout, z, area),
  };
}

/**
 * One message group from `from`, sent `ago` minutes before the demo's "now". `command` adds the
 * 「… 使用了 /command」 line of a slash-command reply; `enter` slides the content in.
 */
export function ChatMessage({
  from,
  command,
  ago = 0,
  time,
  enter,
  id,
  children,
}: {
  from: DemoSender;
  command?: { by: DemoSender; name: string };
  ago?: number;
  /** A time label other than 「今天 …」 (e.g. yesterday's). */
  time?: string;
  enter?: boolean;
  /** Set as `data-msg`, for measuring. */
  id?: string;
  children?: ReactNode;
}) {
  const who = demoSender(from);
  const by = command && demoSender(command.by);
  const message = (
    <Message
      author={who.name}
      avatar={who.avatar}
      bot={from === "bot"}
      time={time ?? demoTime(ago)}
      interaction={by && command ? { user: by.name, avatar: by.avatar, command: command.name } : undefined}
    >
      {enter ? <div className="demo-in">{children}</div> : children}
    </Message>
  );
  return id ? <div data-msg={id}>{message}</div> : message;
}

/**
 * What the chat input shows: empty, the command being typed (Discord's autocomplete popup open
 * above it), or the command with its filled options as pills (`[]`: picked, nothing filled yet).
 */
export type InputState =
  | { kind: "empty" }
  | { kind: "typing"; typed: string }
  | { kind: "options"; options: readonly SlashOption[] };

/** The chat input of `channel` while `command` is typed and filled. */
export function CommandInput({ input, channel, command }: { input: InputState; channel: string; command: SlashCommand }) {
  if (input.kind === "empty") return <ChatInput channel={channel} />;
  if (input.kind === "typing") {
    return <SlashPicker command={command.name} description={command.description} appName={DEMO_BOT.name} placeholder={input.typed} />;
  }
  return (
    <SlashPicker command={command.name} description={command.description} appName={DEMO_BOT.name} options={input.options} />
  );
}

/** One window: a channel (with its input) or a DM with the bot. `grow` shares the canvas height. */
export type Pane = {
  id: string;
  kind: "channel" | "dm";
  /** The channel's name, or the DM peer's (the bot's) name. */
  title: string;
  messages: ReactNode;
  input?: ReactNode;
  grow?: number;
  /** A demo label on the header saying whose window it is (e.g. 「會員的私訊」); not Discord's. */
  tag?: string;
};

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
        avatar={pane.kind === "dm" ? DEMO_BOT.avatar : undefined}
        className="h-full rounded-none! border-0! shadow-none!"
      >
        {/* The header (48px) and the message pane's padding (4px, 16px) take the rest. */}
        <div data-pane={pane.id} className="flex flex-col" style={{ height: height - 48 - 4 - 16 }}>
          <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_24px)]">
            {pane.messages}
          </div>
          {pane.input}
        </div>
      </DiscordWindow>
    </div>
  );
}

/**
 * The screen on a `layout.w` × `layout.h` canvas: the channel list (`list`, when the layout
 * shows one), then the panes stacked top to bottom with a 1px line between them.
 */
export function DiscordScene({ layout, list, panes }: { layout: SceneLayout; list?: ReactNode; panes: Pane[] }) {
  const total = panes.reduce((sum, p) => sum + (p.grow ?? 1), 0);
  const gaps = panes.length - 1;
  return (
    <div className="flex h-full w-full bg-[#313338]">
      {layout.list && list && (
        <div className="h-full shrink-0" style={{ width: LIST_W }}>
          {list}
        </div>
      )}
      <div className="flex h-full min-w-0 flex-1 flex-col gap-px bg-[#1e1f22]">
        {panes.map((p) => {
          const height = ((layout.h - gaps) * (p.grow ?? 1)) / total;
          return (
            <div key={p.id} className="shrink-0" style={{ height }}>
              <PaneView pane={p} height={height} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A chat demo: `wide` and `narrow` are the layout and steps for a stage at least / below
 * NARROW_BELOW px wide; `children` draws the screen of a step on its layout. The steps must be
 * module-level constants (DemoStage replays when the array changes).
 */
export function DiscordDemo<L extends CanvasLayout, S extends DemoStep>({
  label,
  wide,
  narrow,
  children,
}: {
  label: string;
  wide: { layout: L; steps: S[] };
  narrow: { layout: L; steps: S[] };
  children: (step: S, layout: L) => ReactNode;
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
            {children(steps[index], layout)}
          </Canvas>
        )}
      </DemoStage>
    </div>
  );
}

/**
 * One message in a window, not animated: a channel message (`channel`) or a DM from the bot
 * (`dm`). `from` and `command` are ChatMessage's.
 */
export function MessageWindow({
  channel,
  from = "bot",
  command,
  children,
}: {
  /** The channel's name; left out, the window is the DM with the bot. */
  channel?: string;
  from?: DemoSender;
  command?: { by: DemoSender; name: string };
  children: ReactNode;
}) {
  return (
    <DiscordWindow
      title={channel ?? DEMO_BOT.name}
      kind={channel ? "channel" : "dm"}
      avatar={channel ? undefined : DEMO_BOT.avatar}
    >
      <ChatMessage from={from} command={command}>
        {children}
      </ChatMessage>
    </DiscordWindow>
  );
}

/** A MessageWindow on the page as a still picture: one image to assistive tech, described by `label`. */
export function DiscordStill({ label, ...window }: { label: string } & Parameters<typeof MessageWindow>[0]) {
  return (
    <div role="img" aria-label={label} className="not-prose my-6">
      <div aria-hidden="true">
        <MessageWindow {...window} />
      </div>
    </div>
  );
}
