// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { DiscordScene, dashboardPicture } from "@/components/demo";
import { BOT_UI } from "@/content/bot-ui.generated";
import { STEPS as SETTINGS_STEPS } from "./balance-settings-demo";
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

  it("clicks only the history buttons the snapshots have", () => {
    const labels = (id: keyof typeof BOT_UI) =>
      (BOT_UI[id] as { components: { type: string; label?: string }[] }).components.map((c) => c.label);
    expect(labels("flow/balance_history_command/1")).toContain("統計表");
    expect(labels("flow/balance_history_command/0")).toContain("伺服器排行榜");
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
});
