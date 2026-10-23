// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_SHOTS, dashboardPicture, type DemoStep } from "@/components/demo";
import { chooseLayout, markersFor, resolveSteps } from "@/components/demo/dashboard-demo-steps";
import { BOT_UI } from "@/content/bot-ui.generated";
import {
  LOGIN_STEPS, LoginDemo, SETUP_1_STEPS, SETUP_2_STEPS, SETUP_3_STEPS, SETUP_4_STEPS, SETUP_5_STEPS, SetupChannelsDemo,
  SetupConfirmDemo, SetupPaymentDemo, SetupServerDemo, SetupSmilePayDemo,
} from "./dashboard-demos";
import * as firstOrder from "./first-order-demo";
import * as getPaid from "./get-paid-demo";
import * as home from "./home-demo";
import * as welcome from "./welcome-demo";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Steps = (DemoStep & { screen: unknown })[];
type Any = ComponentType<{ screen: never; layout: never }>;
const CHAT: [string, Any, Record<string, unknown>, Steps, Steps][] = [
  ["home", home.HomeScreen as Any, home.LAYOUTS, home.WIDE_STEPS, home.NARROW_STEPS],
  ["welcome", welcome.WelcomeScreen as Any, welcome.LAYOUTS, welcome.WIDE_STEPS, welcome.NARROW_STEPS],
  ["first order", firstOrder.FirstOrderScreen as Any, firstOrder.LAYOUTS, firstOrder.WIDE_STEPS, firstOrder.NARROW_STEPS],
  ["get paid", getPaid.GetPaidScreen as Any, getPaid.LAYOUTS, getPaid.WIDE_STEPS, getPaid.NARROW_STEPS],
];

describe.each(CHAT)("%s demo", (_, Screen, layouts, wide, narrow) => {
  it.each([
    ["wide", wide],
    ["narrow", narrow],
  ])("%s timeline runs 6 to 15 seconds, in order, aiming inside the screen", (__, steps) => {
    expect(steps[steps.length - 1].at).toBeGreaterThanOrEqual(6000);
    expect(steps[steps.length - 1].at).toBeLessThanOrEqual(15000);
    steps.forEach((s, i) => {
      if (i > 0) expect(s.at).toBeGreaterThan(steps[i - 1].at);
      for (const v of [s.cursor?.x, s.cursor?.y, s.shot?.focus?.x, s.shot?.focus?.y]) {
        if (v === undefined) continue;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
    // Reduced motion shows only the last step: it has to be the finished story.
    expect(steps[steps.length - 1].screen).toEqual(steps[steps.length - 2].screen);
  });

  it("draws every screen of the story from the snapshots", () => {
    for (const layout of Object.values(layouts)) {
      for (const step of wide) {
        const { unmount } = render(<Screen screen={step.screen as never} layout={layout as never} />);
        unmount();
      }
    }
  });
});

describe("the end of each story", () => {
  it("the welcome shows in the system channel first, and the story ends in the owner's DM", () => {
    const shown = welcome.WIDE_STEPS.map((s) => s.screen.show);
    expect(shown.indexOf("channel")).toBeLessThan(shown.indexOf("dm"));
    const last = welcome.WIDE_STEPS[welcome.WIDE_STEPS.length - 1].screen;
    render(<welcome.WelcomeScreen screen={last} layout={welcome.LAYOUTS.wide} />);
    expect(screen.getByText("感謝邀請 FunI 付款系統！")).toBeTruthy();
    expect(screen.getByText("開始設定")).toBeTruthy();
    expect(screen.getByText(/是因為有人把機器人加入了你的伺服器「星光遊戲社」/)).toBeTruthy();
  });

  it("the welcome DM and the channel welcome differ only in the DM's first line", () => {
    const channel = BOT_UI["guide/welcome/channel_web"].embeds[0];
    const dm = BOT_UI["guide/welcome/dm_web"].embeds[0];
    expect(dm.description?.endsWith(channel.description ?? "")).toBe(true);
    expect(BOT_UI["guide/welcome/dm_web"].components).toEqual(BOT_UI["guide/welcome/channel_web"].components);
  });

  it("the paid channel is renamed and holds the complete notice", () => {
    const last = getPaid.WIDE_STEPS[getPaid.WIDE_STEPS.length - 1].screen;
    render(<getPaid.GetPaidScreen screen={last} layout={getPaid.LAYOUTS.wide} />);
    expect(screen.getAllByText("已付款｜0042").length).toBeGreaterThan(0);
    expect(screen.getByText(/速買配－付款完成通知/)).toBeTruthy();
  });

  it("the first order stops at the method confirmation", () => {
    const last = firstOrder.WIDE_STEPS[firstOrder.WIDE_STEPS.length - 1].screen;
    expect(last.bot).toBe("confirm");
  });
});

const DASHBOARD = [
  { shot: "login", steps: LOGIN_STEPS, Demo: LoginDemo },
  { shot: "setup-1", steps: SETUP_1_STEPS, Demo: SetupServerDemo },
  { shot: "setup-2", steps: SETUP_2_STEPS, Demo: SetupChannelsDemo },
  { shot: "setup-3", steps: SETUP_3_STEPS, Demo: SetupSmilePayDemo },
  { shot: "setup-4", steps: SETUP_4_STEPS, Demo: SetupPaymentDemo },
  { shot: "setup-5", steps: SETUP_5_STEPS, Demo: SetupConfirmDemo },
];

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduced && query === "(prefers-reduced-motion: reduce)", media: query, addEventListener: () => {}, removeEventListener: () => {} })),
  );
}

describe.each(DASHBOARD)("$shot demo", ({ shot, steps, Demo }) => {
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
