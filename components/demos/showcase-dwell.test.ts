import { describe, expect, it } from "vitest";
import { dashboardPicture } from "@/components/demo/dashboard-shot";
import { resolveSteps, type DashboardStep } from "@/components/demo/dashboard-demo-steps";
import { CAMERA_MS, type DemoStep } from "@/components/demo";
import { STEPS as BALANCE_SETTINGS } from "./balance/balance-settings-demo";
import * as DASH from "./dashboard/dashboard-demos";
import * as START from "./getting-started/dashboard-demos";

/** How long a step that only shows something (no click, nothing typed) may hold. */
const SHOW_MS = 2600;

// Every exported step list of the chat demos (WIDE_STEPS, NARROW_STEPS, ALL_WIDE_STEPS, …)
const modules = import.meta.glob<Record<string, unknown>>("./**/*-demo.tsx", { eager: true });
const isSteps = (v: unknown): v is DemoStep[] => Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === "object" && s !== null && "at" in s);
const CHAT = Object.entries(modules).flatMap(([file, mod]) =>
  Object.entries(mod)
    .filter(([, v]) => isSteps(v))
    .map(([name, steps]) => ({ name: `${file.replace("./", "")} ${name}`, steps: steps as DemoStep[] })),
);

const DASHBOARD: { name: string; shot: string; steps: DashboardStep[]; whole?: boolean }[] = [
  { name: "overview", shot: "overview", steps: DASH.OVERVIEW },
  { name: "orders", shot: "orders", steps: DASH.ORDERS },
  { name: "settings-basic", shot: "settings-basic", steps: DASH.BASIC },
  { name: "settings-smilepay", shot: "settings-smilepay", steps: DASH.SMILEPAY },
  { name: "settings-payment", shot: "settings-payment", steps: DASH.PAYMENT },
  { name: "settings-channels", shot: "settings-channels", steps: DASH.CHANNELS },
  { name: "settings-balance", shot: "settings-balance", steps: DASH.BALANCE },
  { name: "settings-history", shot: "settings-history", steps: DASH.HISTORY },
  { name: "features", shot: "features", steps: DASH.FEATURES },
  { name: "balance overview", shot: "settings-balance", steps: BALANCE_SETTINGS },
  { name: "login", shot: "login", steps: START.LOGIN_STEPS, whole: true },
  { name: "setup-1", shot: "setup-1", steps: START.SETUP_1_STEPS },
  { name: "setup-2", shot: "setup-2", steps: START.SETUP_2_STEPS },
  { name: "setup-3", shot: "setup-3", steps: START.SETUP_3_STEPS },
  { name: "setup-4", shot: "setup-4", steps: START.SETUP_4_STEPS },
  { name: "setup-5", shot: "setup-5", steps: START.SETUP_5_STEPS },
];

/** The steps that do something: name a target, press, type or hide the cursor. */
const acts = (s: DashboardStep) => Boolean(s.target || s.click || s.typing || s.hideCursor);

/**
 * Whether step `i` only shows its target: it names one, presses and types nothing, the next step
 * that does something does not press or type on it either, and it is not the page a press on the
 * same target just opened (that step shows what the press did, with the cursor where it was).
 */
function showsOnly(steps: readonly DashboardStep[], i: number): boolean {
  const s = steps[i];
  if (!s.target || s.click || s.typing) return false;
  const next = steps.slice(i + 1).find(acts);
  if (next && (next.click || next.typing) && (next.target ?? s.target) === s.target) return false;
  const before = steps.slice(0, i).reverse().find(acts);
  if (before && before.click && (before.target === s.target || !before.target) && s.swapTo) return false;
  return true;
}

/**
 * How long each step that only shows something holds still: until the next step that moves the
 * cursor, points at something else or brings a caption, less the camera's move when the camera
 * comes close meanwhile (the picture is moving then).
 */
function showHolds<S extends DemoStep & { view?: string }>(steps: S[], shows: (i: number) => boolean): { at: number; ms: number }[] {
  const holds: { at: number; ms: number }[] = [];
  steps.forEach((s, i) => {
    if (!shows(i)) return;
    const j = steps.findIndex((n, k) => k > i && (n.cursor || n.pointAt || n.caption));
    const end = j === -1 ? steps.length - 1 : j;
    const moves = steps.slice(i + 1, end).some((n, k) => n.view !== undefined && n.view !== steps[i + k].view);
    holds.push({ at: s.at, ms: steps[end].at - s.at - (moves ? CAMERA_MS : 0) });
  });
  return holds;
}

it("finds the chat demos' step lists", () => {
  expect(CHAT.length).toBeGreaterThan(20);
});

describe.each(CHAT)("$name", ({ steps }) => {
  it("does not hold long on what it only shows", () => {
    for (const h of showHolds(steps, (i) => Boolean(steps[i].pointAt))) expect(h.ms, `${h.at} ms`).toBeLessThanOrEqual(SHOW_MS);
  });
});

describe.each(DASHBOARD)("$name dashboard demo", ({ shot, steps, whole }) => {
  for (const layout of ["desktop", "mobile"] as const) {
    const frames = resolveSteps(dashboardPicture, shot, steps, layout, whole);
    it(`${layout}: moves the cursor to each target it only shows, presses nothing there, and does not hold it long`, () => {
      steps.forEach((_, i) => {
        if (!showsOnly(steps, i)) return;
        // Visible, unless the step hides it on purpose (setup-5 shows the whole summary)
        expect(frames[i].cursor?.hidden, `${steps[i].at} ms`).toBe(Boolean(steps[i].hideCursor));
        expect(frames[i].cursor?.click, `${steps[i].at} ms`).toBeFalsy();
      });
      for (const h of showHolds(frames, (i) => showsOnly(steps, i))) expect(h.ms, `${h.at} ms`).toBeLessThanOrEqual(SHOW_MS);
    });
  }
});
