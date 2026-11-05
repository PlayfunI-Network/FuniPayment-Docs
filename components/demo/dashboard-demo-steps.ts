// The pure part of DashboardDemo (dashboard-demo.tsx): turns steps that name targets of a
// dashboard screenshot into DemoStage steps (camera shots and cursor positions as fractions of
// the stage), and works out the reduced-motion markers. Every picture is drawn whole on the stage
// (wholePlacement: as wide as the stage, or narrowed so a tall page fits), and the camera has two
// views: "whole", the full picture, and "close", the picture as wide as the stage around the
// target (as the page reads in a browser). A demo starts whole, goes close for the fields and
// pulls back whole before a button that sends or moves on, so the reader sees what is pressed.
import type { Rect, Shot } from "@/lib/camera";
import type { CursorState } from "./cursor";
import type { DashboardLayout, DashboardPicture, DashboardShotData } from "./dashboard-shot";
import type { DemoStep } from "./stage";

/** The camera's two views: the whole picture, or the picture as wide as the stage around the target. */
export type DashboardView = "whole" | "close";

/**
 * One moment of a dashboard demo, `at` ms after it starts.
 * - `target`: a target name of the shot on screen; the cursor moves to it (and stays there).
 * - `view`: from this step on, the camera shows the whole picture ("whole", how every demo
 *   starts) or comes close around the target ("close"). Carries over; a close camera follows each
 *   new target. Give the camera about a second (CAMERA_MS) before a click.
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
  view?: DashboardView;
  click?: boolean;
  typing?: boolean;
  hideCursor?: boolean;
  swapTo?: string;
};

/** A DemoStage step plus which shot is on screen and the camera's view. */
export type DashboardFrame = DemoStep & { shotId: string; view: DashboardView };

/** Below this stage width (px) the phone pictures are used. */
export const NARROW_BELOW = 600;
/** The tallest stage, as height ÷ width: taller pictures are narrowed to fit it. */
export const MAX_RATIO: Readonly<Record<DashboardLayout, number>> = { desktop: 0.72, mobile: 1.3 };
/** Room kept above and below a target in the close view, as a fraction of what the stage shows. */
const MARGIN = 0.06;

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

/**
 * Whether a `whole` demo gets a stage of its first picture's own shape: only on the desktop
 * pictures, since the phone ones are drawn at phone height (two screens and more).
 */
export const showsWhole = (whole: boolean, layout: DashboardLayout) => whole && layout === "desktop";

/**
 * The stage's height ÷ width for a demo: as stageRatio, or for a `whole` demo (see showsWhole)
 * the first picture's own, so the first picture fills the stage.
 */
export function demoRatio(picture: PictureOf, shot: string, layout: DashboardLayout, whole = false): number {
  const pic = picture(shot, layout);
  return showsWhole(whole, layout) ? pic.height / pic.width : stageRatio(pic, layout);
}

/**
 * Where a picture `tall` widths high sits on a stage `ratio` widths high: the whole of it, as
 * wide as the stage or (when it is taller than the stage) narrowed to fit, centred. `x` and `w`
 * are fractions of the stage width, `y` is in stage widths.
 */
export function wholePlacement(tall: number, ratio: number): { x: number; y: number; w: number } {
  const w = Math.min(1, ratio / tall);
  return { x: (1 - w) / 2, y: (ratio - tall * w) / 2, w };
}

/** `rect` (fractions of the picture) as fractions of the stage, for a picture placed by wholePlacement. */
export function wholeRect(rect: Rect, tall: number, ratio: number): Rect {
  const at = wholePlacement(tall, ratio);
  return { x: at.x + rect.x * at.w, y: (at.y + rect.y * tall * at.w) / ratio, w: rect.w * at.w, h: (rect.h * tall * at.w) / ratio };
}

/**
 * The close view onto `target` (a Rect of the stage) of a picture placed at `at`: the picture as
 * wide as the stage, centred on the target (its top, when it is taller than the stage shows).
 * A picture already as wide as the stage has no close view: the whole one.
 */
export function closeShot(target: Rect, at: { x: number; w: number }): Shot {
  const zoom = 1 / at.w;
  if (zoom < 1.02) return { zoom: 1 };
  const band = 1 / zoom;
  const room = MARGIN * band;
  const h = Math.min(target.h + 2 * room, band);
  return { zoom, focus: { x: at.x, w: at.w, y: target.y - room, h }, exact: true };
}

/** Where the cursor points on a target: its centre, or right of the text for typing. */
function pointOn(r: Rect, extra: Partial<CursorState>): CursorState {
  const x = extra.typing ? r.x + r.w * 0.8 : r.x + r.w / 2;
  return { x, y: r.y + r.h / 2, ...extra };
}

/**
 * The DemoStage steps of a demo that starts on `shot`: each target becomes a Rect of the stage,
 * for the cursor, and each step gets the camera of its view (every frame carries its own, so a
 * step picked out of order shows right). Throws, naming the step, when a target is not on the
 * shot that is on screen there.
 */
export function resolveSteps(picture: PictureOf, shot: string, steps: readonly DashboardStep[], layout: DashboardLayout, whole = false): DashboardFrame[] {
  const ratio = demoRatio(picture, shot, layout, whole);
  let shotId = shot;
  let target: string | undefined;
  let view: DashboardView = "whole";
  let hidden = true;
  return steps.map((s, i) => {
    const before = shotId;
    if (s.swapTo) shotId = s.swapTo;
    const pic = picture(shotId, layout);
    const tall = pic.height / pic.width;
    if (s.target) {
      if (!pic.targets[s.target]) throw new Error(`第 ${i + 1} 步：後台截圖「${shotId}」${layout === "mobile" ? "的手機版" : ""}沒有目標「${s.target}」`);
      target = s.target;
      hidden = false;
    }
    if (s.hideCursor) hidden = true;
    if (s.view) view = s.view;
    const rect = target ? pic.targets[target] : undefined;
    // A target named on an earlier shot may be gone after a swap
    if (target && !rect) throw new Error(`第 ${i + 1} 步：換成「${shotId}」後，前面用的目標「${target}」不在這張截圖上，請重新指定 target`);

    const onStage = rect ? wholeRect(rect, tall, ratio) : undefined;
    const out: DashboardFrame = { at: s.at, shotId, view };
    if (s.caption) out.caption = s.caption;
    out.shot = view === "close" && onStage ? closeShot(onStage, wholePlacement(tall, ratio)) : { zoom: 1 };
    if (onStage && (s.target || s.click || s.typing || s.hideCursor || shotId !== before)) {
      out.cursor = pointOn(onStage, { click: s.click, typing: s.typing, hidden });
    } else if (s.hideCursor) {
      out.cursor = { x: 0.5, y: 0.5, hidden: true };
    }
    return out;
  });
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

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
