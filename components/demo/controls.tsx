"use client";
// The reader's controls of a demo: pick a step (its dot, or its line in a DemoHero's list), the
// previous or next step, pause or play on. DemoStage builds `DemoControls` from its timeline.
import type { KeyboardEvent } from "react";

/** A demo's steps (its captions) and what the reader can do with them. */
export type DemoControls = {
  captions: string[];
  /** The caption on screen (-1 before the first). */
  current: number;
  /** Whether the demo plays on by itself. */
  playing: boolean;
  /** Whether it can play by itself at all (not under reduced motion). */
  animates: boolean;
  select: (index: number) => void;
  prev: () => void;
  next: () => void;
  toggle: () => void;
};

/** ← and → anywhere inside the controls move a step back or on. */
export function onControlKey(controls: DemoControls) {
  return (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === "ArrowLeft") controls.prev();
    else if (e.key === "ArrowRight") controls.next();
    else return;
    e.preventDefault();
  };
}

const ICON = "size-4";

const Chevron = ({ left }: { left?: boolean }) => (
  <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={left ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} />
  </svg>
);

const PlayPause = ({ playing }: { playing: boolean }) =>
  playing ? (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true" fill="currentColor">
      <rect x="4" y="3" width="2.6" height="10" rx="0.8" />
      <rect x="9.4" y="3" width="2.6" height="10" rx="0.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className={ICON} aria-hidden="true" fill="currentColor">
      <path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5Z" />
    </svg>
  );

const BUTTON =
  "demo-control inline-flex items-center justify-center gap-1 rounded-md text-[var(--muted)] transition-colors hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[var(--brand)]";

/**
 * Previous, play/pause, next. `labelled` writes the words next to the icons (beside a DemoHero's
 * text); otherwise the step dots sit between the arrows (under the stage).
 */
export function ControlBar({ controls, labelled = false }: { controls: DemoControls; labelled?: boolean }) {
  const { captions, current, playing, animates } = controls;
  const last = captions.length - 1;
  const toggleLabel = playing ? "暫停自動播放" : "繼續自動播放";
  return (
    <div role="group" aria-label="示範控制" className="demo-controls flex items-center gap-1" onKeyDown={onControlKey(controls)}>
      <button type="button" className={`${BUTTON} ${labelled ? "h-8 px-2 text-sm" : "size-7"}`} aria-label="上一步" disabled={current <= 0} onClick={controls.prev}>
        <Chevron left />
        {labelled && <span aria-hidden="true">上一步</span>}
      </button>
      {!labelled && (
        <span className="flex items-center">
          {captions.map((text, i) => (
            <button
              key={i}
              type="button"
              className="demo-control group flex size-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
              aria-label={`第 ${i + 1} 步：${text}`}
              aria-current={i === current ? "step" : undefined}
              onClick={() => controls.select(i)}
            >
              <span
                className={`size-1.5 rounded-full transition-colors duration-300 group-hover:bg-[var(--fg)] ${i === current ? "bg-[var(--brand)]" : "bg-[var(--line)]"}`}
              />
            </button>
          ))}
        </span>
      )}
      <button type="button" className={`${BUTTON} ${labelled ? "h-8 px-2 text-sm" : "size-7"}`} aria-label="下一步" disabled={current >= last} onClick={controls.next}>
        {labelled && <span aria-hidden="true">下一步</span>}
        <Chevron />
      </button>
      {animates && (
        <button type="button" className={`${BUTTON} ${labelled ? "ms-1 h-8 px-2 text-sm" : "ms-1 size-7"}`} aria-label={toggleLabel} aria-pressed={!playing} onClick={controls.toggle}>
          <PlayPause playing={playing} />
          {labelled && <span aria-hidden="true">{playing ? "暫停" : "播放"}</span>}
        </button>
      )}
    </div>
  );
}

/** The demo's captions one per line, the current one lit; each line picks its step. */
export function StepList({ controls }: { controls: DemoControls }) {
  return (
    <ol className="demo-hero-steps not-prose" onKeyDown={onControlKey(controls)}>
      {controls.captions.map((text, i) => (
        <li key={i}>
          <button
            type="button"
            data-on={i === controls.current || undefined}
            aria-current={i === controls.current ? "step" : undefined}
            className="demo-hero-step demo-control"
            onClick={() => controls.select(i)}
          >
            <span className="demo-hero-step-number">{i + 1}</span>
            <span className="min-w-0 flex-1 text-start">{text}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
