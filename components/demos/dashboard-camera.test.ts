import { describe, expect, it } from "vitest";
import { CAMERA_MS } from "@/components/demo";
import { dashboardPicture } from "@/components/demo/dashboard-shot";
import { resolveSteps, type DashboardStep } from "@/components/demo/dashboard-demo-steps";
import { STEPS as BALANCE_SETTINGS } from "./balance/balance-settings-demo";
import * as DASH from "./dashboard/dashboard-demos";
import * as START from "./getting-started/dashboard-demos";

// Every dashboard demo with the shot it starts on. The login demo is `whole`: its pictures read
// whole, so it never comes close.
const DEMOS: { name: string; shot: string; steps: DashboardStep[]; whole?: boolean }[] = [
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

/** Buttons that send the form or move on to another page. */
const SUBMIT = new Set(["save", "next", "create", "firstOrder"]);

describe.each(DEMOS)("$name demo: the camera", ({ shot, steps, whole }) => {
  for (const layout of ["desktop", "mobile"] as const) {
    const frames = resolveSteps(dashboardPicture, shot, steps, layout, whole);

    it(`${layout}: starts on the whole picture`, () => {
      expect(frames[0]).toMatchObject({ view: "whole", shot: { zoom: 1 } });
    });

    it(`${layout}: shows the whole picture when the cursor goes to a button that sends or moves on, and when it presses it`, () => {
      steps.forEach((s, i) => {
        if (s.target && SUBMIT.has(s.target)) expect(frames[i].shot, `${s.at} ms`).toEqual({ zoom: 1 });
      });
    });

    it(`${layout}: the camera has settled before each click`, () => {
      let changed = 0;
      frames.forEach((f, i) => {
        if (i > 0 && f.view !== frames[i - 1].view) changed = f.at;
        if (steps[i].click && changed > 0) expect(f.at - changed, `${f.at} ms`).toBeGreaterThanOrEqual(CAMERA_MS);
      });
    });
  }

  if (!whole) {
    it("comes close for the fields on a desktop", () => {
      const frames = resolveSteps(dashboardPicture, shot, steps, "desktop");
      expect(frames.some((f) => f.view === "close" && f.shot!.zoom > 1)).toBe(true);
    });
  } else {
    it("never zooms in", () => {
      expect(resolveSteps(dashboardPicture, shot, steps, "desktop", true).every((f) => f.shot!.zoom === 1)).toBe(true);
    });
  }

  it("keeps the timeline under 15 seconds", () => {
    expect(steps[steps.length - 1].at).toBeLessThanOrEqual(15000);
  });
});
