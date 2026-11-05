"use client";
// A scripted demo over the bot's web dashboard screenshots (npm run capture): the cursor and the
// camera aim at a shot's targets by name (dashboard-demo-steps.ts turns them into stage Rects).
// Below NARROW_BELOW px it uses the phone pictures when they hold every target the steps name.
// Under reduced motion it shows the panorama instead: the part of each shot the steps use, with a
// numbered marker on each caption's target and the captions listed below (Task 4 ruling).
import { useMemo, useRef, useSyncExternalStore } from "react";
import {
  chooseLayout,
  demoRatio,
  markersFor,
  wholePlacement,
  NARROW_BELOW,
  panoramaSpan,
  resolveSteps,
  shotsUsed,
  type DashboardStep,
  type Marker,
} from "./dashboard-demo-steps";
import { DASHBOARD_SHOTS, DashboardShot, dashboardPicture, type DashboardLayout } from "./dashboard-shot";
import { useWidth } from "./canvas";
import { HeroFrame } from "./hero";
import { HighlightFrame } from "./highlight";
import { DemoStage } from "./stage";

export type { DashboardStep } from "./dashboard-demo-steps";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";


function subscribeReduced(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
}
const reducedNow = () => typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION).matches;

/** Whether the reader asked for reduced motion (false on the server: the static HTML plays). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, reducedNow, () => false);
}

/**
 * The demo. `shot` is the shot on screen first; `steps` must keep its identity between renders
 * (define it at module level). `label` describes the whole demo to assistive tech. `whole` shows
 * every picture whole on a stage as tall as the tallest, without scrolling (desktop pictures only:
 * see showsWhole); use it when the pictures read at that size, so the camera has nothing to do.
 */
export function DashboardDemo({ shot, steps, label, whole = false }: { shot: string; steps: readonly DashboardStep[]; label: string; whole?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const reduced = useReducedMotion();
  const layout = chooseLayout(DASHBOARD_SHOTS, shot, steps, width > 0 && width < NARROW_BELOW);
  return (
    <div ref={ref} data-dashboard-demo={shot} data-layout={layout}>
      {reduced ? <Panorama shot={shot} steps={steps} label={label} layout={layout} whole={whole} /> : <Animated shot={shot} steps={steps} label={label} layout={layout} whole={whole} />}
    </div>
  );
}

type Props = { shot: string; steps: readonly DashboardStep[]; label: string; layout: DashboardLayout; whole: boolean };

function Animated({ shot, steps, label, layout, whole }: Props) {
  const frames = useMemo(() => resolveSteps(dashboardPicture, shot, steps, layout, whole), [shot, steps, layout, whole]);
  const ratio = demoRatio(dashboardPicture, shot, layout, whole);
  const ids = useMemo(() => shotsUsed(shot, steps), [shot, steps]);
  return (
    <DemoStage label={label} aspect={`1 / ${ratio}`} steps={frames} caption={steps.some((s) => s.caption)}>
      {(_, index) => {
        const frame = frames[index];
        return ids.map((id) => {
          const pic = dashboardPicture(id, layout);
          const at = wholePlacement(pic.height / pic.width, ratio);
          return (
            <div
              key={id}
              data-shot={id}
              className="absolute"
              style={{
                left: `${at.x * 100}%`,
                top: `${(at.y / ratio) * 100}%`,
                width: `${at.w * 100}%`,
                visibility: id === frame.shotId ? undefined : "hidden",
              }}
            >
              <DashboardShot id={id} layout={layout} eager />
            </div>
          );
        });
      }}
    </DemoStage>
  );
}

function Panorama({ shot, steps, label, layout, whole }: Props) {
  const markers = useMemo(() => markersFor(dashboardPicture, shot, steps, layout), [shot, steps, layout]);
  const ratio = demoRatio(dashboardPicture, shot, layout, whole);
  // One picture per shot that has a marker (the first shot when none has)
  const ids = shotsUsed(shot, steps).filter((id) => markers.some((m) => m.shotId === id && m.rect));
  if (ids.length === 0) ids.push(shot);
  return (
    <HeroFrame
      stage={(className) => (
        <div role="img" aria-label={label} className={className} data-panorama>
          <div aria-hidden="true" className="space-y-3">
            {ids.map((id) => (
              <PanoramaPicture key={id} id={id} layout={layout} ratio={ratio} markers={markers.filter((m) => m.shotId === id && m.rect)} />
            ))}
            {markers.length > 0 && (
              <ol className="space-y-1.5 text-sm text-[var(--fg)]">
                {markers.map((m) => (
                  <li key={m.number} className="flex items-start gap-2.5">
                    <MarkerDot number={m.number} />
                    <span className="min-w-0 flex-1 pt-0.5">{m.caption}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    />
  );
}

function PanoramaPicture({ id, layout, ratio, markers }: { id: string; layout: DashboardLayout; ratio: number; markers: Marker[] }) {
  const pic = dashboardPicture(id, layout);
  const tall = pic.height / pic.width;
  const span = panoramaSpan(markers.map((m) => m.rect!), tall, ratio);
  return (
    <div data-shot={id} className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]" style={{ aspectRatio: `1 / ${span.height}` }}>
      <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${(-span.top / tall) * 100}%)` }}>
        <DashboardShot id={id} layout={layout} />
        {markers.map((m) => (
          <HighlightFrame key={m.number} marker={m.number} rect={m.rect!} />
        ))}
        {/* The numbers sit on each target's top-left corner, kept inside the picture; a number
            that would cover an earlier one (targets sharing a corner) moves right */}
        {markers.map((m, i) => {
          const r = m.rect!;
          const shift = markers.slice(0, i).filter((o) => Math.abs(o.rect!.x - r.x) < 0.03 && Math.abs(o.rect!.y - r.y) < 0.03).length * 28;
          return (
            <span
              key={m.number}
              className="absolute"
              style={{ left: `calc(max(0px, ${r.x * 100}% - 12px) + ${shift}px)`, top: `max(0px, calc(${r.y * 100}% - 12px))` }}
            >
              <MarkerDot number={m.number} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MarkerDot({ number }: { number: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold tabular-nums text-[#0a0a0a] shadow">
      {number}
    </span>
  );
}
