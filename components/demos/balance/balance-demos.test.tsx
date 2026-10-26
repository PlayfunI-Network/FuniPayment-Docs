// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { DiscordScene, dashboardPicture } from "@/components/demo";
import { BOT_UI } from "@/content/bot-ui.generated";
import { PHONE_STEPS as SETTINGS_PHONE_STEPS, STEPS as SETTINGS_STEPS } from "./balance-settings-demo";
import * as add from "./balance-add-demo";
import * as history from "./balance-history-demo";
import * as pay from "./pay-with-balance-demo";
import * as show from "./balance-show-demo";
import * as topup from "./top-up-demo";
import * as transfer from "./balance-transfer-demo";

const DEMOS = { show, transfer, history, add, topup, pay };

describe.each(Object.entries(DEMOS))("%s demo", (_, demo) => {
  it.each([
    ["wide", demo.WIDE_STEPS, demo.LAYOUTS.wide],
    ["narrow", demo.NARROW_STEPS, demo.LAYOUTS.narrow],
  ] as const)("%s timeline runs 6 to 15 seconds, in order, aiming inside the screen", (_, steps, layout) => {
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
    // Every screen of the story draws from the snapshots without throwing.
    for (const s of steps) {
      const { unmount } = render(<DiscordScene layout={layout} panes={s.screen.panes} />);
      unmount();
    }
  });
});

describe("balance demos", () => {
  it("ends the transfer on both DMs, with the balances before and after", () => {
    const last = transfer.WIDE_STEPS[transfer.WIDE_STEPS.length - 1];
    render(<DiscordScene layout={transfer.LAYOUTS.wide} panes={last.screen.panes} />);
    expect(screen.getAllByText("商城點數轉帳通知")).toHaveLength(2);
    expect(screen.getByText("550")).toBeTruthy(); // 700 - 150
    expect(screen.getByText("230")).toBeTruthy(); // 80 + 150
  });

  it("pays /fp with points from the balance option the menu lists last", () => {
    const menu = BOT_UI["flow/fp_command/ok"].components[0];
    expect(menu.type === "select" && menu.options.at(-1)?.value).toBe("balance");
    const last = pay.WIDE_STEPS[pay.WIDE_STEPS.length - 1];
    render(<DiscordScene layout={pay.LAYOUTS.wide} panes={last.screen.panes} />);
    expect(screen.getAllByText("商城點數消費通知")).toHaveLength(2);
  });

  it("presses only enabled history buttons, in the place each page has them", () => {
    const buttons = (id: keyof typeof BOT_UI) =>
      (BOT_UI[id] as { components: { label?: string; disabled?: boolean }[] }).components;
    // ▶️ is the third button of page 1; 統計表 and 伺服器排行榜 the fourth of pages 2 and 0.
    expect(buttons(history.PAGES[1])[2]).toMatchObject({ label: "▶️", disabled: false });
    expect(buttons(history.PAGES[2])[3]).toMatchObject({ label: "統計表", disabled: false });
    expect(buttons(history.PAGES[0])[3]).toMatchObject({ label: "伺服器排行榜", disabled: false });
    // The four pages are the same seven records: page 1 says two more, the statistics 91 in all.
    expect(BOT_UI[history.PAGES[1]].embeds[0].description).toContain("...還有 **2** 筆");
    expect(BOT_UI[history.PAGES[0]].embeds[0].title).toContain("__91__");
  });

  it("aims the settings demo at targets the balance shots have, on the phone pictures too", () => {
    let shot = "settings-balance";
    for (const s of SETTINGS_STEPS) {
      if (s.swapTo) shot = s.swapTo;
      if (!s.target) continue;
      expect(Object.keys(dashboardPicture(shot, "desktop").targets)).toContain(s.target);
      // No tabBalance click: the phone pictures have every target, so phones get them.
      expect(Object.keys(dashboardPicture(shot, "mobile").targets)).toContain(s.target);
    }
    expect(SETTINGS_STEPS[SETTINGS_STEPS.length - 1].at).toBeLessThanOrEqual(15000);
  });

  it("keeps one zoom on the desktop pictures and none on the phone pictures, both ending on the whole picture", () => {
    const zooms = SETTINGS_STEPS.flatMap((s) => (s.zoom === undefined ? [] : [s.zoom]));
    expect(zooms.slice(0, -1).every((z) => z === zooms[0])).toBe(true);
    expect(zooms.at(-1)).toBe(1);
    expect(SETTINGS_PHONE_STEPS.every((s) => s.zoom === undefined || s.zoom === 1)).toBe(true);
    // The phone steps are the desktop ones but for the zoom.
    const withoutZoom = (s: object) => ({ ...s, zoom: undefined });
    expect(SETTINGS_PHONE_STEPS.map(withoutZoom)).toEqual(SETTINGS_STEPS.map(withoutZoom));
  });
});
