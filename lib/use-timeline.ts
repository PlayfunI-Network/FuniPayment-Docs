import { useEffect, useRef, useState, type RefObject } from "react";

export type TimelineStep = { at: number };

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Fraction of the element that must be on screen before the timeline plays. */
const VISIBLE = 0.3;

/** Index of the last step whose `at` (ms since start) has elapsed. */
export function stepAt(elapsed: number, steps: TimelineStep[]): number {
  let index = 0;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].at > elapsed) break;
    index = i;
  }
  return index;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Drives a scripted demo. `step` starts at the final step (what the server renders, and what
 * reduced motion keeps); once mounted off-screen it rewinds to 0, plays when the element is
 * ≥30% visible, freezes while it is off-screen or the tab is hidden, and after the last step
 * holds for `loopPause` ms before starting over (unless `loop` is false).
 * `restart`: each new `key` jumps the timeline to `at` ms (playing on from there once it is
 * visible). Under reduced motion it changes nothing: the last step stays.
 */
export function useTimeline(
  steps: TimelineStep[],
  opts: { loop?: boolean; loopPause?: number; restart?: { key: number; at: number } } = {},
): { ref: RefObject<HTMLElement | null>; step: number } {
  const { loop = true, loopPause = 2500, restart } = opts;
  const ref = useRef<HTMLElement | null>(null);
  const last = steps.length - 1;
  const [step, setStep] = useState(last);
  const restartTo = useRef<((at: number) => void) | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;

    const total = steps[last].at + loopPause;
    let elapsed = 0;
    let startedAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let finished = false;
    let primed = false;
    let inView = false;

    const tick = () => {
      const now = performance.now();
      let t = now - startedAt;
      if (loop && t >= total) {
        startedAt = now;
        t = 0;
      }
      const i = stepAt(t, steps);
      setStep(i);
      const next = i < last ? steps[i + 1].at : loop ? total : null;
      if (next === null) {
        running = false;
        finished = true;
        timer = undefined;
        return;
      }
      timer = setTimeout(tick, Math.max(0, next - t));
    };

    const play = () => {
      if (running || finished || document.visibilityState === "hidden") return;
      running = true;
      startedAt = performance.now() - elapsed;
      tick();
    };

    const pause = () => {
      if (!running) return;
      running = false;
      elapsed = performance.now() - startedAt;
      clearTimeout(timer);
      timer = undefined;
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Entries are queued oldest first; only the newest reflects the current state.
        const entry = entries[entries.length - 1];
        const visible = entry.intersectionRatio >= VISIBLE - 0.001;
        if (!primed) {
          primed = true;
          // Rewind while nobody is looking, so the demo plays from its first frame.
          if (!visible) setStep(0);
        }
        if (visible) {
          inView = true;
          play();
        } else if (!entry.isIntersecting) {
          inView = false;
          pause();
        }
      },
      { threshold: [0, VISIBLE] },
    );
    io.observe(el);

    restartTo.current = (at: number) => {
      clearTimeout(timer);
      timer = undefined;
      running = false;
      finished = false;
      elapsed = at;
      setStep(stepAt(at, steps));
      if (inView) play();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") pause();
      else if (inView) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      restartTo.current = null;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(timer);
    };
  }, [steps, last, loop, loopPause]);

  const restartKey = restart?.key;
  const restartAt = restart?.at ?? 0;
  useEffect(() => {
    if (restartKey !== undefined) restartTo.current?.(restartAt);
  }, [restartKey, restartAt]);

  return { ref, step };
}
