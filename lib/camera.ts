/** A region of the demo screen, as fractions (0–1) of its width and height. */
export type Rect = { x: number; y: number; w: number; h: number };

/** What the camera shows: `zoom` times closer (below 1 counts as 1), centred on `focus` (the whole screen when absent). */
export type Shot = { zoom: number; focus?: Rect };

export type CameraTransform = { scale: number; tx: number; ty: number };

/** Below this stage width (px) the camera zooms in further, so the target stays readable. */
export const NARROW_WIDTH = 640;
export const NARROW_BOOST = 1.35;

const FULL: Rect = { x: 0, y: 0, w: 1, h: 1 };

/**
 * The CSS transform `translate(tx px, ty px) scale(scale)` (transform-origin 0 0) that shows
 * `shot` in a stage of `viewport` px: the focus centre moves to the stage centre, clamped so
 * the content always covers the stage (no blank edge). On a narrow stage the zoom is boosted
 * by NARROW_BOOST, but never past the scale at which the focus fills the stage.
 */
export function cameraTransform(shot: Shot, viewport: { w: number; h: number }): CameraTransform {
  const { w: vw, h: vh } = viewport;
  if (vw <= 0 || vh <= 0) return { scale: 1, tx: 0, ty: 0 };

  const focus = shot.focus ?? FULL;
  let scale = Math.max(1, shot.zoom);
  if (vw < NARROW_WIDTH) {
    const fill = Math.min(1 / Math.max(focus.w, 1e-6), 1 / Math.max(focus.h, 1e-6));
    scale = Math.max(scale, Math.min(scale * NARROW_BOOST, fill));
  }

  const cx = (focus.x + focus.w / 2) * vw;
  const cy = (focus.y + focus.h / 2) * vh;
  const tx = clamp(vw / 2 - scale * cx, vw - scale * vw, 0);
  const ty = clamp(vh / 2 - scale * cy, vh - scale * vh, 0);
  // `+ 0` turns -0 into 0, so a centred full shot compares equal to { tx: 0, ty: 0 }.
  return { scale, tx: tx + 0, ty: ty + 0 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
