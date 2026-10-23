// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_SHOTS, dashboardPicture } from "@/components/demo";
import { chooseLayout, markersFor, resolveSteps } from "@/components/demo/dashboard-demo-steps";
import {
  BALANCE_STEPS, BASIC_STEPS, BalanceSettingsDemo, BasicSettingsDemo, CHANNELS_STEPS, ChannelsSettingsDemo, FEATURES_STEPS,
  FeaturesDemo, HISTORY_STEPS, ORDERS_STEPS, OVERVIEW_STEPS, OrdersDemo, OverviewDemo, PAYMENT_STEPS, PaymentSettingsDemo,
  SMILEPAY_STEPS, SettingsHistoryDemo, SmilePaySettingsDemo,
} from "./dashboard-demos";

const DEMOS = [
  { shot: "overview", steps: OVERVIEW_STEPS, Demo: OverviewDemo },
  { shot: "orders", steps: ORDERS_STEPS, Demo: OrdersDemo },
  { shot: "settings-basic", steps: BASIC_STEPS, Demo: BasicSettingsDemo },
  { shot: "settings-smilepay", steps: SMILEPAY_STEPS, Demo: SmilePaySettingsDemo },
  { shot: "settings-payment", steps: PAYMENT_STEPS, Demo: PaymentSettingsDemo },
  { shot: "settings-channels", steps: CHANNELS_STEPS, Demo: ChannelsSettingsDemo },
  { shot: "settings-balance", steps: BALANCE_STEPS, Demo: BalanceSettingsDemo },
  { shot: "settings-history", steps: HISTORY_STEPS, Demo: SettingsHistoryDemo },
  { shot: "features", steps: FEATURES_STEPS, Demo: FeaturesDemo },
];

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduced && query === "(prefers-reduced-motion: reduce)", media: query, addEventListener: () => {}, removeEventListener: () => {} })),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe.each(DEMOS)("$shot demo", ({ shot, steps, Demo }) => {
  it("runs 6 to 15 seconds, in order", () => {
    const last = steps[steps.length - 1].at;
    expect(last).toBeGreaterThanOrEqual(6000);
    expect(last).toBeLessThanOrEqual(15000);
    steps.forEach((s, i) => i > 0 && expect(s.at).toBeGreaterThan(steps[i - 1].at));
  });

  it("uses the phone pictures on a narrow stage", () => {
    expect(chooseLayout(DASHBOARD_SHOTS, shot, steps, true)).toBe("mobile");
  });

  it.each(["desktop", "mobile"] as const)("aims inside the %s stage", (layout) => {
    for (const f of resolveSteps(dashboardPicture, shot, steps, layout)) {
      if (!f.cursor || f.cursor.hidden) continue;
      expect(f.cursor.x, `${f.at}`).toBeGreaterThan(0);
      expect(f.cursor.x, `${f.at}`).toBeLessThan(1);
      expect(f.cursor.y, `${f.at}`).toBeGreaterThan(0);
      expect(f.cursor.y, `${f.at}`).toBeLessThan(1);
    }
  });

  it("gives every caption a marker under reduced motion", () => {
    const markers = markersFor(dashboardPicture, shot, steps, "desktop");
    expect(markers.length).toBe(steps.filter((s) => s.caption).length);
    expect(markers.every((m) => m.rect)).toBe(true);
  });

  it("renders, animated and as a panorama", () => {
    stubReducedMotion(false);
    render(<Demo />);
    cleanup();
    stubReducedMotion(true);
    const { container } = render(<Demo />);
    expect(container.querySelector("[data-panorama]")).not.toBeNull();
  });
});
