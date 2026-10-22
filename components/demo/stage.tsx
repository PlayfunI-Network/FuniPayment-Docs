"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Shot } from "@/lib/camera";
import { useTimeline } from "@/lib/use-timeline";
import { Camera } from "./camera";
import { Caption } from "./caption";
import { Cursor, type CursorState } from "./cursor";

/**
 * One moment of a demo, `at` ms after it starts. `shot` and `cursor` carry over to later steps
 * until a step sets them again (a carried-over cursor does not click again); `caption` is the
 * line shown under the stage from this step on.
 */
export type DemoStep = { at: number; caption?: string; shot?: Shot; cursor?: CursorState };

export type DemoFrame = {
  shot: Shot;
  cursor: CursorState;
  caption: { text: string; index: number; total: number } | null;
};

const WIDE: Shot = { zoom: 1 };
const NO_CURSOR: CursorState = { x: 0.5, y: 0.5, hidden: true };

/** What the stage shows at step `index`, with the carried-over shot, cursor and caption resolved. */
export function frameAt(steps: DemoStep[], index: number): DemoFrame {
  let shot = WIDE;
  let cursor = NO_CURSOR;
  let caption: DemoFrame["caption"] = null;
  const total = steps.filter((s) => s.caption).length;
  let captions = 0;
  steps.forEach((s, i) => {
    if (s.caption) captions++;
    if (i > index) return;
    if (s.shot) shot = s.shot;
    if (s.cursor) cursor = i === index ? s.cursor : { ...s.cursor, click: false };
    if (s.caption) caption = { text: s.caption, index: captions - 1, total };
  });
  return { shot, cursor, caption };
}

/**
 * The frame every scripted demo plays in: a fixed-ratio screen (`aspect`, CSS aspect-ratio)
 * with a camera, a scripted cursor and optionally a caption line. To assistive tech it is one
 * image described by `label`; everything inside is hidden. The timeline plays once 30% of it
 * is visible, pauses off-screen, loops, and under reduced motion shows only the last step.
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
  const { ref, step: index } = useTimeline(steps);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewport = useSize(viewportRef);
  const frame = frameAt(steps, index);

  return (
    <div ref={ref as RefObject<HTMLDivElement>} role="img" aria-label={label} className="not-prose my-6">
      <div aria-hidden="true">
        <div
          ref={viewportRef}
          className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]"
          style={{ aspectRatio: aspect }}
        >
          <Camera shot={frame.shot} viewport={viewport}>
            {children(steps[index], index)}
            <Cursor state={frame.cursor} />
          </Camera>
        </div>
        {caption &&
          (frame.caption ? (
            <Caption text={frame.caption.text} index={frame.caption.index} total={frame.caption.total} />
          ) : (
            <div className="mt-3 min-h-7" />
          ))}
      </div>
    </div>
  );
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
