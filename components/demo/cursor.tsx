import type { CSSProperties } from "react";

/** Where the scripted pointer is, as fractions (0–1) of the screen; `click` presses it. */
export type CursorState = { x: number; y: number; click?: boolean; hidden?: boolean };

/** How long the pointer takes to glide to a new position. */
export const CURSOR_MS = 900;
/** Slow start and slow stop, like a hand moving a mouse (the camera's expo curve would dart). */
const CURSOR_EASE = "cubic-bezier(0.65, 0, 0.25, 1)";

/**
 * The scripted pointer. It lives inside the Camera (so it stays on its target while the camera
 * moves) and divides its size by `--camera-scale`, so it looks the same size at any zoom.
 * Clicking presses the arrow and sends out a ripple from its tip.
 */
export function Cursor({ state }: { state: CursorState }) {
  const track: CSSProperties = {
    transform: `translate(${state.x * 100}%, ${state.y * 100}%)`,
    transition: `transform ${CURSOR_MS}ms ${CURSOR_EASE}, opacity 300ms ease`,
    opacity: state.hidden ? 0 : 1,
  };
  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={track}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ scale: "calc(1 / var(--camera-scale, 1))" }}>
        {state.click && (
          <span
            className="demo-ripple absolute -left-6 -top-6 size-12 rounded-full border-2 border-white bg-white/30"
            // The dark outline keeps the ring visible on light buttons too.
            style={{ boxShadow: "0 0 0 2px rgb(0 0 0 / 0.35)" }}
          />
        )}
        {/* A new key on every press restarts the press animation. */}
        <svg
          key={state.click ? "down" : "up"}
          className={state.click ? "demo-press origin-top-left" : "origin-top-left"}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          style={{ filter: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.45))" }}
        >
          <path
            d="M1.5 1.5 L1.5 17.5 L5.8 13.6 L8.6 20 L11.6 18.7 L8.9 12.4 L14.6 12.4 Z"
            fill="#fff"
            stroke="#111"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
