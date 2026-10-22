import type { CSSProperties } from "react";

/**
 * Where the scripted pointer is, as fractions (0–1) of the screen. `click` presses it;
 * `typing` turns it into a text I-beam (centred on the point) while text is being entered.
 */
export type CursorState = { x: number; y: number; click?: boolean; hidden?: boolean; typing?: boolean };

/** How long the pointer takes to glide to a new position. */
export const CURSOR_MS = 900;
/** Slow start and slow stop, like a hand moving a mouse. */
const CURSOR_EASE = "cubic-bezier(0.65, 0, 0.25, 1)";

const SHADOW = { filter: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.45))" };

/**
 * The scripted pointer. It lives inside the Camera (so it stays on its target while the camera
 * moves) and divides its size by `--camera-scale`, so it looks the same size at any zoom.
 * Clicking presses the pointer and sends out a ripple from its tip. `pressId` names the press:
 * a new value replays the press and the ripple even when the previous state also clicked
 * (DemoStage passes the step index).
 */
export function Cursor({ state, pressId = 0 }: { state: CursorState; pressId?: number }) {
  const track: CSSProperties = {
    transform: `translate(${state.x * 100}%, ${state.y * 100}%)`,
    transition: `transform ${CURSOR_MS}ms ${CURSOR_EASE}, opacity 300ms ease`,
    opacity: state.hidden ? 0 : 1,
  };
  const pressed = state.click ? "demo-press" : "";
  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={track}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ scale: "calc(1 / var(--camera-scale, 1))" }}>
        {state.click && (
          <span
            key={`ripple-${pressId}`}
            data-testid="cursor-ripple"
            className="demo-ripple absolute -left-6 -top-6 size-12 rounded-full border-2 border-white bg-white/30"
            // The dark outline keeps the ring visible on light buttons too.
            style={{ boxShadow: "0 0 0 2px rgb(0 0 0 / 0.35)" }}
          />
        )}
        {state.typing ? (
          <svg
            key={state.click ? `beam-down-${pressId}` : "beam"}
            data-testid="cursor-ibeam"
            className={`${pressed} absolute -left-[7px] -top-[11px] origin-center`}
            width="14"
            height="22"
            viewBox="0 0 14 22"
            style={SHADOW}
          >
            <path
              d="M3 2 H5.5 Q7 2 7 3.5 Q7 2 8.5 2 H11 M7 3.5 V18.5 M3 20 H5.5 Q7 20 7 18.5 Q7 20 8.5 20 H11"
              fill="none"
              stroke="#111"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M3 2 H5.5 Q7 2 7 3.5 Q7 2 8.5 2 H11 M7 3.5 V18.5 M3 20 H5.5 Q7 20 7 18.5 Q7 20 8.5 20 H11"
              fill="none"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            key={state.click ? `arrow-down-${pressId}` : "arrow"}
            data-testid="cursor-arrow"
            className={`${pressed} origin-top-left`}
            width="22"
            height="22"
            viewBox="0 0 22 22"
            style={SHADOW}
          >
            <path
              d="M1.5 1.5 L1.5 17.5 L5.8 13.6 L8.6 20 L11.6 18.7 L8.9 12.4 L14.6 12.4 Z"
              fill="#fff"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
