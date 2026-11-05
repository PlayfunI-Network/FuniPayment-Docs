import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

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

/** What a timeline does on its own and what the reader can make it do. */
export type Timeline = {
  ref: RefObject<HTMLElement | null>;
  /** The step on screen. */
  step: number;
  /** Whether it moves by itself: false under reduced motion, without IntersectionObserver, and before mount. */
  animates: boolean;
  /** Whether it plays on by itself (autoplay); false once the reader picks a step or pauses. */
  playing: boolean;
  /**
   * Plays steps `from` to `to` and holds on `to` (autoplay off), so the reader sees that part
   * happen. Where the timeline does not animate it shows `to` at once.
   */
  seek: (from: number, to: number) => void;
  /** Autoplay on again, from the step on screen (from the start after the last step). */
  resume: () => void;
  /** Autoplay off: holds the step on screen. */
  pause: () => void;
};

type Controls = Pick<Timeline, "seek" | "resume" | "pause">;

/**
 * Drives a scripted demo. `step` starts at the final step (what the server renders, and what
 * reduced motion keeps); once mounted off-screen it rewinds to 0, plays when the element is
 * ≥30% visible, freezes while it is off-screen or the tab is hidden, and after the last step
 * holds for `loopPause` ms before starting over (unless `loop` is false).
 * `restart`: each new `key` jumps the timeline to `at` ms (playing on from there once it is
 * visible). Under reduced motion it changes nothing: the last step stays.
 * The reader's controls (seek, resume, pause) are in the result.
 */
export function useTimeline(
  steps: TimelineStep[],
  opts: { loop?: boolean; loopPause?: number; restart?: { key: number; at: number } } = {},
): Timeline {
  const { loop = true, loopPause = 2500, restart } = opts;
  const ref = useRef<HTMLElement | null>(null);
  const last = steps.length - 1;
  const [step, setStep] = useState(last);
  const [animates, setAnimates] = useState(false);
  const [playing, setPlaying] = useState(true);
  const restartTo = useRef<((at: number) => void) | null>(null);
  const controls = useRef<Controls | null>(null);
  /** The step on screen, for the controls (kept by `show`, which every move goes through). */
  const stepNow = useRef(last);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    setAnimates(true);

    const total = steps[last].at + loopPause;
    let elapsed = 0;
    let startedAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let finished = false;
    let primed = false;
    let inView = false;
    /** The step a picked part of the timeline stops on (null: autoplay); `held` once it got there. */
    let stopAt: number | null = null;
    let held = false;

    const show = (i: number) => {
      stepNow.current = i;
      setStep(i);
    };

    const tick = () => {
      const now = performance.now();
      let t = now - startedAt;
      if (stopAt === null && loop && t >= total) {
        startedAt = now;
        t = 0;
      }
      const i = stepAt(t, steps);
      if (stopAt !== null && i >= stopAt) {
        show(stopAt);
        running = false;
        held = true;
        timer = undefined;
        return;
      }
      show(i);
      const next = i < last ? steps[i + 1].at : stopAt === null && loop ? total : null;
      if (next === null) {
        running = false;
        finished = true;
        timer = undefined;
        return;
      }
      timer = setTimeout(tick, Math.max(0, next - t));
    };

    const play = () => {
      if (running || finished || held || document.visibilityState === "hidden") return;
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

    /** Stops wherever it is and forgets any picked part. */
    const halt = () => {
      clearTimeout(timer);
      timer = undefined;
      running = false;
      finished = false;
      held = false;
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Entries are queued oldest first; only the newest reflects the current state.
        const entry = entries[entries.length - 1];
        const visible = entry.intersectionRatio >= VISIBLE - 0.001;
        if (!primed) {
          primed = true;
          // Rewind while nobody is looking, so the demo plays from its first frame.
          if (!visible && stopAt === null) show(0);
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
      halt();
      stopAt = null;
      elapsed = at;
      show(stepAt(at, steps));
      if (inView) play();
    };

    controls.current = {
      seek: (from, to) => {
        halt();
        stopAt = to;
        elapsed = steps[from].at;
        show(from);
        if (from >= to) held = true;
        // Picked while it is off-screen (a keyboard user scrolled away): show the result
        else if (!inView) {
          show(to);
          held = true;
        } else play();
      },
      resume: () => {
        halt();
        stopAt = null;
        const from = stepNow.current >= last ? 0 : stepNow.current;
        elapsed = steps[from].at;
        show(from);
        if (inView) play();
      },
      pause: () => {
        pause();
        halt();
        stopAt = stepNow.current;
        held = true;
      },
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") pause();
      else if (inView) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      restartTo.current = null;
      controls.current = null;
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

  const seek = useCallback((from: number, to: number) => {
    setPlaying(false);
    if (controls.current) controls.current.seek(from, to);
    else setStep(to);
  }, []);
  const resume = useCallback(() => {
    if (!controls.current) return;
    setPlaying(true);
    controls.current.resume();
  }, []);
  const pause = useCallback(() => {
    setPlaying(false);
    controls.current?.pause();
  }, []);

  return { ref, step, animates, playing: animates && playing, seek, resume, pause };
}
