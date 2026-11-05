import { describe, expect, it } from "vitest";
import { dashboardPicture } from "@/components/demo/dashboard-shot";
import { resolveSteps, type DashboardStep } from "@/components/demo/dashboard-demo-steps";
import { CAMERA_MS, type DemoStep } from "@/components/demo";
import { STEPS as BALANCE_SETTINGS } from "./balance/balance-settings-demo";
import * as DASH from "./dashboard/dashboard-demos";
import * as START from "./getting-started/dashboard-demos";

/** How long a step that only shows something (framed in red) may hold. */
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

/**
 * How long each framed step holds still: until the next step that moves the cursor, frames
 * something else or ends, less the camera's move when the camera comes close meanwhile (the
 * frame is on screen then too, but the picture is moving).
 */
function framedHolds(steps: (DemoStep & { view?: string })[]): { at: number; ms: number }[] {
  const holds: { at: number; ms: number }[] = [];
  steps.forEach((s, i) => {
    if (!s.highlight) return;
    const j = steps.findIndex((n, k) => k > i && (n.cursor || n.highlight !== undefined || n.caption));
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
  it("frames something it only shows, and does not hold it long", () => {
    for (const h of framedHolds(steps)) expect(h.ms, `${h.at} ms`).toBeLessThanOrEqual(SHOW_MS);
  });
});

describe.each(DASHBOARD)("$name dashboard demo", ({ shot, steps, whole }) => {
  for (const layout of ["desktop", "mobile"] as const) {
    const frames = resolveSteps(dashboardPicture, shot, steps, layout, whole);
    it(`${layout}: frames each target it only shows, inside the stage, and does not hold it long`, () => {
      for (const f of frames.filter((f) => f.highlight)) {
        const r = f.highlight as { x: number; y: number; w: number; h: number };
        expect(r.x, `${f.at} ms`).toBeGreaterThanOrEqual(0);
        expect(r.y + r.h, `${f.at} ms`).toBeLessThanOrEqual(1.0001);
        // The cursor rests on the frame's corner, pressing nothing
        expect(f.cursor?.click, `${f.at} ms`).toBeFalsy();
      }
      for (const h of framedHolds(frames)) expect(h.ms, `${h.at} ms`).toBeLessThanOrEqual(SHOW_MS);
    });
  }
});
