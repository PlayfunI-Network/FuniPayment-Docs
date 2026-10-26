// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_SHOTS, dashboardPicture } from "@/components/demo";
import { chooseLayout, markersFor, resolveSteps } from "@/components/demo/dashboard-demo-steps";
import {
  BALANCE, BASIC, BalanceSettingsDemo, BasicSettingsDemo, CHANNELS, ChannelsSettingsDemo, FEATURES, FeaturesDemo, HISTORY,
  ORDERS, OVERVIEW, OrdersDemo, OverviewDemo, PAYMENT, PaymentSettingsDemo, SMILEPAY, SettingsHistoryDemo, SmilePaySettingsDemo,
} from "./dashboard-demos";

const DEMOS = [
  { shot: "overview", steps: OVERVIEW, Demo: OverviewDemo },
  { shot: "orders", steps: ORDERS, Demo: OrdersDemo },
  { shot: "settings-basic", steps: BASIC, Demo: BasicSettingsDemo },
  { shot: "settings-smilepay", steps: SMILEPAY, Demo: SmilePaySettingsDemo },
  { shot: "settings-payment", steps: PAYMENT, Demo: PaymentSettingsDemo },
  { shot: "settings-channels", steps: CHANNELS, Demo: ChannelsSettingsDemo },
  { shot: "settings-balance", steps: BALANCE, Demo: BalanceSettingsDemo },
  { shot: "settings-history", steps: HISTORY, Demo: SettingsHistoryDemo },
  { shot: "features", steps: FEATURES, Demo: FeaturesDemo },
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

describe.each(DEMOS)("$shot demo", ({ shot, steps: both, Demo }) => {
  const steps = both.desktop;

  it("runs 6 to 15 seconds, in order", () => {
    const last = steps[steps.length - 1].at;
    expect(last).toBeGreaterThanOrEqual(6000);
    expect(last).toBeLessThanOrEqual(15000);
    steps.forEach((s, i) => i > 0 && expect(s.at).toBeGreaterThan(steps[i - 1].at));
  });

  it("plays the same steps on the phone, only zooming differently", () => {
    const withoutZoom = (list: typeof steps) => list.map((s) => ({ ...s, zoom: undefined }));
    expect(withoutZoom(both.phone)).toEqual(withoutZoom(steps));
    expect(both.phone[both.phone.length - 1].zoom).toBe(1);
  });

  it("uses the phone pictures on a narrow stage", () => {
    expect(chooseLayout(DASHBOARD_SHOTS, shot, both.phone, true)).toBe("mobile");
  });

  it.each(["desktop", "mobile"] as const)("aims inside the %s stage", (layout) => {
    for (const f of resolveSteps(dashboardPicture, shot, layout === "mobile" ? both.phone : steps, layout)) {
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
