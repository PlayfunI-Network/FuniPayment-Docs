"use client";
// The red frame a demo draws around what a step shows without clicking it ("look here"): a
// DemoStep's `highlight`, either a Rect of the stage or a CSS selector of elements on it
// (measured on screen, e.g. the newest message of a pane: newestIn). In a selector, "a || b"
// frames what `a` finds, or else what `b` finds; a selector list "a, b" frames all it finds
// together.
import { useLayoutEffect, useState, type RefObject } from "react";
import type { Rect } from "@/lib/camera";
import type { CursorState } from "./cursor";

/** What a step frames: a Rect of the stage (fractions), or a selector of an element on it. */
export type Highlight = Rect | string;

/** The newest message group in the pane `paneId` of a DiscordScene. */
export const newestIn = (paneId: string) => `[data-pane="${paneId}"] > :first-child > :last-child`;

/** The demo's own text channel: its row in the channel list, or the window's title when there is no list. */
export const CURRENT_CHANNEL = `[data-kind="text"][data-selected] || [data-channel-title]`;

/** How long after a step starts its framed element is measured again (entrances take 450ms). */
const SETTLE_MS = 520;

/**
 * Where `highlight` is on the stage, as fractions of `viewport` (the stage element). A selector
 * is looked up inside the viewport and measured through the camera's transform at each new
 * `step` (the element may have moved), again once the entrances on the stage have settled; until
 * then the last place found for the same selector stands. Null until found.
 */
export function useHighlightRect(highlight: Highlight | null | undefined, viewport: RefObject<HTMLElement | null>, step: number): Rect | null {
  const [measured, setMeasured] = useState<{ key: string; rect: Rect } | null>(null);
  const selector = typeof highlight === "string" ? highlight : null;
  useLayoutEffect(() => {
    if (!selector) return;
    let live = true;
    const measure = () => {
      const stage = viewport.current;
      const camera = stage?.querySelector<HTMLElement>("[data-camera]");
      if (!live || !stage || !camera) return;
      const found = findAll(stage, selector);
      // The camera's box is the stage scaled: undo its transform to get stage fractions
      const c = camera.getBoundingClientRect();
      if (found.length === 0 || c.width === 0 || c.height === 0) return;
      const boxes = found.map(contentBox).filter((r): r is Box => r !== null);
      if (boxes.length === 0) return;
      const left = Math.min(...boxes.map((r) => r.left));
      const top = Math.min(...boxes.map((r) => r.top));
      const right = Math.max(...boxes.map((r) => r.right));
      const bottom = Math.max(...boxes.map((r) => r.bottom));
      const rect = { x: (left - c.left) / c.width, y: (top - c.top) / c.height, w: (right - left) / c.width, h: (bottom - top) / c.height };
      setMeasured((m) => (m && m.key === selector && sameRect(m.rect, rect) ? m : { key: selector, rect }));
    };
    // Measure once the entrances (demo-in, demo-pop) running on the stage have ended, so the
    // frame does not jump after them; and again a little later in case one starts late.
    const stage = viewport.current;
    const entrances = (stage?.getAnimations?.({ subtree: true }) ?? []).filter(
      (a) => "animationName" in a && /^demo-(in|pop)$/.test(String((a as CSSAnimation).animationName)) && a.playState === "running",
    );
    if (entrances.length === 0) measure();
    else Promise.all(entrances.map((a) => a.finished.catch(() => undefined))).then(measure);
    const timer = setTimeout(measure, SETTLE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [selector, viewport, step]);
  if (!highlight) return null;
  if (typeof highlight !== "string") return highlight;
  return measured && measured.key === highlight ? measured.rect : null;
}

type Box = { left: number; top: number; right: number; bottom: number };

/**
 * What `el` draws, on screen: its contents' boxes together (text, images, cards), not its own
 * box, which for a chat message is the pane's whole width. Null when it draws nothing.
 */
function contentBox(el: Element): Box | null {
  const boxes: Box[] = [];
  const visit = (node: Element) => {
    const r = node.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const style = getComputedStyle(node);
    const drawn =
      node.children.length === 0 ||
      /^(IMG|SVG|BUTTON|INPUT)$/i.test(node.tagName) ||
      (style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent") ||
      style.borderLeftWidth !== "0px";
    if (drawn && (node.children.length === 0 || node !== el)) {
      boxes.push(r);
      // A drawn card stands for what is inside it
      if (node.children.length > 0) return;
    }
    for (const child of node.children) visit(child);
  };
  visit(el);
  if (boxes.length === 0) {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r : null;
  }
  return {
    left: Math.min(...boxes.map((b) => b.left)),
    top: Math.min(...boxes.map((b) => b.top)),
    right: Math.max(...boxes.map((b) => b.right)),
    bottom: Math.max(...boxes.map((b) => b.bottom)),
  };
}

/** The elements `selector` finds inside `root`: the first "||" alternative that finds any. */
function findAll(root: Element, selector: string): Element[] {
  for (const alternative of selector.split("||")) {
    const found = [...root.querySelectorAll(alternative.trim())];
    if (found.length > 0) return found;
  }
  return [];
}

const sameRect = (a: Rect, b: Rect) =>
  Math.abs(a.x - b.x) < 1e-4 && Math.abs(a.y - b.y) < 1e-4 && Math.abs(a.w - b.w) < 1e-4 && Math.abs(a.h - b.h) < 1e-4;

/** The pointer resting on a framed element's bottom-right corner, just inside it: pointing, not pressing. */
export function pointAtFrame(r: Rect): CursorState {
  return { x: Math.min(r.x + r.w - 0.012, 0.97), y: Math.min(r.y + r.h - 0.01, 0.97) };
}

/**
 * The red frame around `rect` (fractions of the stage), a few pixels outside it so it never
 * covers what it frames. Inside the Camera: its line keeps the same width at any zoom. `marker`
 * numbers a reduced-motion panorama's frame (dashboard-demo.tsx).
 */
export function HighlightFrame({ rect, marker }: { rect: Rect; marker?: number }) {
  // A few px outside the target, but never past the stage's edge (it would be cut off there)
  const side = (fraction: number) => `max(calc(${fraction * 100}% - var(--hl-pad)), var(--hl-edge))`;
  return (
    <div
      data-highlight=""
      data-marker={marker}
      aria-hidden="true"
      className="demo-highlight"
      style={{ left: side(rect.x), top: side(rect.y), right: side(1 - rect.x - rect.w), bottom: side(1 - rect.y - rect.h) }}
    />
  );
}
