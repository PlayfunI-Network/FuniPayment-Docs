"use client";
// A demo screen drawn on a fixed-size canvas (CSS px) and scaled to the stage, so the camera and
// the cursor can aim at canvas pixels measured once in the browser. A demo usually has one layout
// per stage size (e.g. with and without a sidebar); positions are given inside the part that is
// common to both and shifted by `left`.
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Rect, Shot } from "@/lib/camera";
import type { CursorState } from "./cursor";

/** A canvas `w` × `h` px; `left` is where the measured part starts (e.g. after a channel list). */
export type CanvasLayout = { w: number; h: number; left?: number };
/** A point or an area in canvas px, measured from the layout's `left`. */
export type CanvasPoint = { x: number; y: number };
export type CanvasArea = { x: number; y: number; w: number; h: number };

/** `area` as fractions of the layout (what Shot.focus takes). */
export function canvasRect(l: CanvasLayout, area: CanvasArea): Rect {
  const left = l.left ?? 0;
  return { x: (left + area.x) / l.w, y: area.y / l.h, w: area.w / l.w, h: area.h / l.h };
}

/** The cursor at `p` (plus any of click / typing / hidden). */
export function canvasPoint(l: CanvasLayout, p: CanvasPoint, extra: Partial<CursorState> = {}): CursorState {
  return { x: ((l.left ?? 0) + p.x) / l.w, y: p.y / l.h, ...extra };
}

/** Zoom `zoom` times onto `area`, but never so close that the area no longer fits the stage. */
export function zoomTo(l: CanvasLayout, zoom: number, area: CanvasArea): Shot {
  const focus = canvasRect(l, area);
  return { zoom: Math.max(1, Math.min(zoom, 1 / focus.w, 1 / focus.h)), focus };
}

/** The element's content width in px, kept current (0 until measured). */
export function useWidth(ref: RefObject<HTMLElement | null>): number {
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

/**
 * Draws `children` on a `w` × `h` canvas scaled to the width of the box it fills (put it inside
 * a DemoStage whose aspect is `w / h`). Hidden until the width is known, so it never flashes
 * at the wrong size.
 */
export function Canvas({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="origin-top-left"
        style={{ width: w, height: h, transform: `scale(${width ? width / w : 1})`, visibility: width ? undefined : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}
