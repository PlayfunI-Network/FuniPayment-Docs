// The pure part of DashboardDemo (dashboard-demo.tsx): turns steps that name targets of a
// dashboard screenshot into DemoStage steps (camera shots and cursor positions as fractions of
// the stage), and works out the reduced-motion markers. A screenshot taller than the stage is
// scrolled like a page: `scroll` says how far, so a target is always in view when it is used.
import type { Rect, Shot } from "@/lib/camera";
import type { CursorState } from "./cursor";
import type { DashboardLayout, DashboardPicture, DashboardShotData } from "./dashboard-shot";
import type { DemoStep } from "./stage";

/**
 * One moment of a dashboard demo, `at` ms after it starts.
 * - `target`: a target name of the shot on screen; the cursor moves to it (and stays there).
 * - `zoom`: the camera moves `zoom` times closer onto the target (this step's, or the last one);
 *   1 shows the whole stage again. Carries over like `shot` in DemoStep. While it is above 1, a
 *   step naming a new target moves the camera onto it.
 * - `phoneZoom`: the zoom on the phone pictures, which are drawn at phone size: there a step that
 *   sets `zoom` but no `phoneZoom` shows the whole picture. Not boosted on narrow stages.
 * - `click` presses the cursor; `typing` turns it into a text I-beam.
 * - `hideCursor` hides the cursor (until a later step names a target).
 * - `swapTo`: from this step on, another shot is on screen (the page after a click, a typed
 *   value, a saved form). Its targets are used from then on.
 * - `caption`: the line under the stage from this step on.
 */
export type DashboardStep = {
  at: number;
  caption?: string;
  target?: string;
  zoom?: number;
  phoneZoom?: number;
  click?: boolean;
  typing?: boolean;
  hideCursor?: boolean;
  swapTo?: string;
};

/** A DemoStage step plus which shot is on screen and how far it is scrolled. */
export type DashboardFrame = DemoStep & { shotId: string; scroll: number };

/** Below this stage width (px) the phone pictures are used. */
export const NARROW_BELOW = 600;
/** The tallest stage, as height ÷ width: taller pictures scroll inside it. */
export const MAX_RATIO: Readonly<Record<DashboardLayout, number>> = { desktop: 0.72, mobile: 1.3 };
/** How close to the stage edge a target may sit before the picture scrolls (fraction of the stage height). */
const EDGE = 0.06;

export type PictureOf = (shotId: string, layout: DashboardLayout) => DashboardPicture;

/** Every shot a demo shows: the first one, then each `swapTo`, without repeats. */
export function shotsUsed(shot: string, steps: readonly DashboardStep[]): string[] {
  const ids = [shot];
  for (const s of steps) if (s.swapTo && !ids.includes(s.swapTo)) ids.push(s.swapTo);
  return ids;
}

/** The shot on screen at each step. */
function shotPerStep(shot: string, steps: readonly DashboardStep[]): string[] {
  let current = shot;
  return steps.map((s) => (current = s.swapTo ?? current));
}

/**
 * Which pictures a demo uses: on a narrow stage the phone ones, when every shot it shows has a
 * phone picture holding every target the steps name on it; otherwise the desktop ones.
 */
export function chooseLayout(shots: Readonly<Record<string, DashboardShotData>>, shot: string, steps: readonly DashboardStep[], narrow: boolean): DashboardLayout {
  if (!narrow) return "desktop";
  const perStep = shotPerStep(shot, steps);
  const fits = shotsUsed(shot, steps).every((id) => shots[id]?.mobile) &&
    steps.every((s, i) => !s.target || s.target in (shots[perStep[i]].mobile?.targets ?? {}));
  return fits ? "mobile" : "desktop";
}

/** The stage's height ÷ width for a demo that starts on `picture`. */
export function stageRatio(picture: DashboardPicture, layout: DashboardLayout): number {
  return Math.min(picture.height / picture.width, MAX_RATIO[layout]);
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** How far a picture of height `tall` (in widths) can scroll in a stage of height `ratio`. */
const maxScroll = (tall: number, ratio: number) => Math.max(0, tall - ratio);

/**
 * The scroll that keeps `rect` (fractions of a picture `tall` widths high) in a stage `ratio`
 * widths high: unchanged when it is already well inside, else centred on it (its top when it
 * is taller than the stage).
 */
export function scrollFor(rect: Rect, tall: number, ratio: number, scroll: number): number {
  const top = rect.y * tall;
  const bottom = (rect.y + rect.h) * tall;
  const edge = EDGE * ratio;
  if (top >= scroll + edge && bottom <= scroll + ratio - edge) return scroll;
  const want = bottom - top > ratio - 2 * edge ? top - edge : (top + bottom) / 2 - ratio / 2;
  return clamp(want, 0, maxScroll(tall, ratio));
}

/** `rect` (fractions of the picture) as fractions of the stage, with the picture scrolled by `scroll`. */
export function stageRect(rect: Rect, tall: number, ratio: number, scroll: number): Rect {
  return { x: rect.x, y: (rect.y * tall - scroll) / ratio, w: rect.w, h: (rect.h * tall) / ratio };
}

/** Where the cursor points on a target: its centre, or right of the text for typing. */
function pointOn(r: Rect, extra: Partial<CursorState>): CursorState {
  const x = extra.typing ? r.x + r.w * 0.8 : r.x + r.w / 2;
  return { x, y: r.y + r.h / 2, ...extra };
}

/** Zoom onto `r`, never so close that it no longer fits the stage (like canvas zoomTo). */
function zoomOn(r: Rect, zoom: number, layout: DashboardLayout): Shot {
  if (zoom <= 1) return { zoom: 1 };
  const shot: Shot = { zoom: Math.max(1, Math.min(zoom, 1 / r.w, 1 / r.h)), focus: r };
  return layout === "mobile" ? { ...shot, exact: true } : shot;
}

/**
 * The DemoStage steps of a demo that starts on `shot`: each target becomes a Rect of the stage
 * (after scrolling the picture so it is in view), for the camera and the cursor. Throws, naming
 * the step, when a target is not on the shot that is on screen there.
 */
export function resolveSteps(picture: PictureOf, shot: string, steps: readonly DashboardStep[], layout: DashboardLayout): DashboardFrame[] {
  const ratio = stageRatio(picture(shot, layout), layout);
  let shotId = shot;
  let scroll = 0;
  let target: string | undefined;
  let zoom = 1;
  let hidden = true;
  return steps.map((s, i) => {
    const before = { shotId, scroll };
    if (s.swapTo) shotId = s.swapTo;
    const pic = picture(shotId, layout);
    const tall = pic.height / pic.width;
    if (s.target) {
      if (!pic.targets[s.target]) throw new Error(`第 ${i + 1} 步：後台截圖「${shotId}」${layout === "mobile" ? "的手機版" : ""}沒有目標「${s.target}」`);
      target = s.target;
      hidden = false;
    }
    if (s.hideCursor) hidden = true;
    const setZoom = layout === "mobile" ? (s.phoneZoom ?? (s.zoom === undefined ? undefined : 1)) : s.zoom;
    if (setZoom !== undefined) zoom = setZoom;
    const rect = target ? pic.targets[target] : undefined;
    // A target named on an earlier shot may be gone after a swap
    if (target && !rect) throw new Error(`第 ${i + 1} 步：換成「${shotId}」後，前面用的目標「${target}」不在這張截圖上，請重新指定 target`);
    scroll = Math.min(scroll, maxScroll(tall, ratio));
    if (rect && (s.target || setZoom !== undefined)) scroll = scrollFor(rect, tall, ratio, scroll);

    const out: DashboardFrame = { at: s.at, shotId, scroll };
    if (s.caption) out.caption = s.caption;
    const onStage = rect ? stageRect(rect, tall, ratio, scroll) : undefined;
    if (setZoom !== undefined || (zoom > 1 && (s.target || scroll !== before.scroll))) out.shot = onStage ? zoomOn(onStage, zoom, layout) : { zoom: 1 };
    const moved = scroll !== before.scroll || shotId !== before.shotId;
    if (onStage && (s.target || s.click || s.typing || s.hideCursor || moved)) {
      out.cursor = pointOn(onStage, { click: s.click, typing: s.typing, hidden });
    } else if (s.hideCursor) {
      out.cursor = { x: 0.5, y: 0.5, hidden: true };
    }
    return out;
  });
}

/** A numbered marker of the reduced-motion panorama: caption `number` (1-based) points at `rect` of `shotId`. */
export type Marker = { number: number; caption: string; shotId: string; rect?: Rect };

/**
 * One marker per caption: on the target the caption's steps (that step up to the next caption)
 * first name, on the shot on screen there. Captions without a target get no rect.
 */
export function markersFor(picture: PictureOf, shot: string, steps: readonly DashboardStep[], layout: DashboardLayout): Marker[] {
  const perStep = shotPerStep(shot, steps);
  const markers: Marker[] = [];
  steps.forEach((s, i) => {
    if (s.caption) markers.push({ number: markers.length + 1, caption: s.caption, shotId: perStep[i] });
    const last = markers[markers.length - 1];
    if (last && !last.rect && s.target) {
      const rect = picture(perStep[i], layout).targets[s.target];
      if (rect) Object.assign(last, { rect, shotId: perStep[i] });
    }
  });
  return markers;
}

/**
 * The part of a picture (`top` and `height`, in widths) the panorama shows: every marked target
 * with some room around it, at least as tall as the demo's stage, never past the picture.
 */
export function panoramaSpan(rects: readonly Rect[], tall: number, ratio: number): { top: number; height: number } {
  if (rects.length === 0) return { top: 0, height: Math.min(tall, ratio) };
  const pad = 0.04;
  let top = Math.min(...rects.map((r) => r.y * tall)) - pad;
  let bottom = Math.max(...rects.map((r) => (r.y + r.h) * tall)) + pad;
  const min = Math.min(tall, ratio);
  if (bottom - top < min) {
    const mid = (top + bottom) / 2;
    [top, bottom] = [mid - min / 2, mid + min / 2];
  }
  top = clamp(top, 0, Math.max(0, tall - (bottom - top)));
  return { top, height: Math.min(tall - top, bottom - top) };
}
