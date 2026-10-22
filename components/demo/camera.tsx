import type { CSSProperties, ReactNode } from "react";
import { cameraTransform, type Shot } from "@/lib/camera";

/** How long the camera takes to move between shots. */
export const CAMERA_MS = 700;

/**
 * Shows its children through `shot`: a CSS transform (origin 0 0) that eases to each new
 * shot. `viewport` is the stage's measured size in px; until it is known the camera shows
 * the whole screen. It also eases `--camera-scale`, which the cursor divides by.
 */
export function Camera({
  shot,
  viewport,
  children,
}: {
  shot: Shot;
  viewport: { w: number; h: number };
  children: ReactNode;
}) {
  const { scale, tx, ty } = cameraTransform(shot, viewport);
  const style = {
    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    transformOrigin: "0 0",
    transition: `transform ${CAMERA_MS}ms var(--ease-expo), --camera-scale ${CAMERA_MS}ms var(--ease-expo)`,
    "--camera-scale": scale,
  } as CSSProperties;
  return (
    <div className="absolute inset-0" style={style}>
      {children}
    </div>
  );
}
