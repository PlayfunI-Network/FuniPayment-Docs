"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Shot } from "@/lib/camera";
import { useTimeline, type Timeline } from "@/lib/use-timeline";
import { Camera } from "./camera";
import { Caption } from "./caption";
import { Cursor, type CursorState } from "./cursor";
import { ControlBar, type DemoControls } from "./controls";
import { HeroFrame } from "./hero";
import { HighlightFrame, pointAtFrame, useHighlightRect, type Highlight } from "./highlight";

/**
 * One moment of a demo, `at` ms after it starts. `shot` and `cursor` carry over to later steps
 * until a step sets them again (a carried-over cursor does not click again); `caption` is the
 * line shown under the stage from this step on. `highlight` frames in red what the step shows
 * without clicking it (a Rect of the stage, or a selector: see highlight.tsx); it stays until a
 * step shows the cursor somewhere (a hidden cursor keeps it) or sets another `highlight` (null
 * clears it). A step with a highlight and no cursor points the cursor at the frame.
 */
export type DemoStep = { at: number; caption?: string; shot?: Shot; cursor?: CursorState; highlight?: Highlight | null };

export type DemoFrame = {
  shot: Shot;
  cursor: CursorState;
  caption: { text: string; index: number; total: number } | null;
  /** What is framed in red, and whether the cursor points at it (its step set no cursor). */
  highlight: Highlight | null;
  pointAtHighlight: boolean;
};

/**
 * The tallest a stage gets: short enough that the stage and its caption fit on one screen under
 * what sits above it (`--demo-fold` in globals.css: the docs header, or on a wide screen the page
 * title and description, so a page's opening demo is whole on arrival), but at least 420px on a
 * very short screen (better to scroll a little than to shrink past reading), and never taller
 * than 600px on a big screen.
 */
export const STAGE_MAX_H = "min(600px, max(420px, 100svh - var(--demo-fold, 190px)))";
/** The widest a stage gets, even in a wider column (a 700px dashboard shot still reads at 11px+). */
export const STAGE_MAX_W = "720px";

/**
 * The width a stage may take: the column (`--demo-avail`, set beside a DemoHero's text in
 * globals.css, else 100%).
 */
export const STAGE_AVAIL = "var(--demo-avail, 100%)";

/**
 * The stage's width for `aspect` (CSS aspect-ratio, `w / h`): STAGE_AVAIL, but no wider than
 * STAGE_MAX_W and no wider than keeps it within STAGE_MAX_H.
 */
export function stageWidth(aspect: string): string {
  const [w, h = 1] = aspect.split("/").map((n) => Number(n.trim()));
  return `min(${STAGE_AVAIL}, ${STAGE_MAX_W}, calc((${STAGE_MAX_H}) * ${w / h}))`;
}

const WIDE: Shot = { zoom: 1 };
const NO_CURSOR: CursorState = { x: 0.5, y: 0.5, hidden: true };

/** What the stage shows at step `index`, with the carried-over shot, cursor and caption resolved. */
export function frameAt(steps: DemoStep[], index: number): DemoFrame {
  let shot = WIDE;
  let cursor = NO_CURSOR;
  let caption: DemoFrame["caption"] = null;
  let highlight: Highlight | null = null;
  let pointAtHighlight = false;
  const total = steps.filter((s) => s.caption).length;
  let captions = 0;
  steps.forEach((s, i) => {
    if (s.caption) captions++;
    if (i > index) return;
    if (s.shot) shot = s.shot;
    if (s.cursor) cursor = i === index ? s.cursor : { ...s.cursor, click: false };
    if (s.highlight !== undefined) {
      highlight = s.highlight;
      pointAtHighlight = s.highlight !== null && !s.cursor;
    } else if (s.cursor && !s.cursor.hidden) {
      highlight = null;
      pointAtHighlight = false;
    }
    if (s.caption) caption = { text: s.caption, index: captions - 1, total };
  });
  return { shot, cursor, caption, highlight, pointAtHighlight };
}

/**
 * The frame every scripted demo plays in: a fixed-ratio screen (`aspect`, CSS aspect-ratio)
 * with a camera, a scripted cursor and optionally a caption line, centred and sized by
 * stageWidth so the whole demo fits on one screen. To assistive tech it is one
 * image described by `label`; everything inside is hidden. The timeline plays once 30% of it
 * is visible, pauses off-screen, loops, and under reduced motion shows only the last step.
 * With captions the reader can also pick a step (it plays that step and holds on its end), go a
 * step back or on (buttons, ← →) and pause or play on; under the stage the caption sits over a
 * bar of step dots. Inside a DemoHero it sits beside (or above) the hero's text, which lists
 * the steps instead when side by side.
 * `children` draws the screen for a step, filling the stage. `steps` must keep its identity
 * between renders (define it at module level).
 */
export function DemoStage({
  label,
  aspect = "16 / 10",
  steps,
  caption = false,
  children,
}: {
  label: string;
  aspect?: string;
  steps: DemoStep[];
  caption?: boolean;
  children: (step: DemoStep, index: number) => ReactNode;
}) {
  const timeline = useTimeline(steps);
  const { ref, step: index } = timeline;
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewport = useSize(viewportRef);
  const frame = frameAt(steps, index);
  // No frame on the server's last step before the timeline rewinds: it would flash there
  const framed = useHighlightRect(timeline.settled ? frame.highlight : null, viewportRef, index);
  const cursor = frame.pointAtHighlight && framed ? pointAtFrame(framed) : frame.cursor;
  const controls = caption ? demoControls(steps, frame, timeline) : undefined;

  return (
    <HeroFrame
      controls={controls}
      stage={(className) => (
        <div className={className}>
          <div ref={ref as RefObject<HTMLDivElement>} role="img" aria-label={label}>
            <div aria-hidden="true" className="mx-auto" style={{ width: stageWidth(aspect) }}>
              <div
                ref={viewportRef}
                className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
                style={{ aspectRatio: aspect }}
              >
                <Camera shot={frame.shot} viewport={viewport}>
                  {children(steps[index], index)}
                  {framed && <HighlightFrame key={JSON.stringify(frame.highlight)} rect={framed} />}
                  <Cursor state={cursor} pressId={index} />
                </Camera>
              </div>
            </div>
          </div>
          {controls && (
            // Hidden beside a hero's text, which lists every caption instead
            <div className="demo-hero-caption mx-auto" style={{ width: stageWidth(aspect) }}>
              {frame.caption ? <Caption text={frame.caption.text} index={frame.caption.index} /> : <div className="mt-3 min-h-7" />}
              <div className="mt-1 flex justify-center">
                <ControlBar controls={controls} />
              </div>
            </div>
          )}
        </div>
      )}
    />
  );
}

/** Where each caption's steps start and end (inclusive): the first starts at step 0. */
export function captionSpans(steps: DemoStep[]): { from: number; to: number }[] {
  const starts = steps.flatMap((s, i) => (s.caption ? [i] : []));
  if (starts.length > 0) starts[0] = 0;
  return starts.map((from, k) => ({ from, to: (starts[k + 1] ?? steps.length) - 1 }));
}

/** The reader's controls over a timeline: a step plays its part and holds on its end. */
function demoControls(steps: DemoStep[], frame: DemoFrame, timeline: Timeline): DemoControls {
  const spans = captionSpans(steps);
  const captions = steps.flatMap((s) => (s.caption ? [s.caption] : []));
  const current = frame.caption?.index ?? -1;
  const select = (k: number) => {
    const span = spans[Math.max(0, Math.min(spans.length - 1, k))];
    if (span) timeline.seek(span.from, span.to);
  };
  return {
    captions,
    current,
    playing: timeline.playing,
    animates: timeline.animates,
    select,
    prev: () => select(current - 1),
    next: () => select(current + 1),
    toggle: () => (timeline.playing ? timeline.pause() : timeline.resume()),
  };
}

/** The element's content-box size in px, kept current with a ResizeObserver ({0, 0} until measured). */
function useSize(ref: RefObject<HTMLElement | null>): { w: number; h: number } {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}
