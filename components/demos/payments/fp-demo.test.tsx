// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { BOT_UI } from "@/content/bot-ui.generated";
import { FpScreen, LAYOUTS } from "../shared/fp-screen";
import { NARROW_STEPS, WIDE_STEPS } from "./fp-demo";

describe("fp demo", () => {
  it("composes the filled buyer step from the same embed the /fp step shows", () => {
    // BuyerInfoFilled draws the filled builder's embed under /fp's buttons; if the bot ever
    // drew the /fp buyer embed differently, this composition would be wrong.
    const fp = BOT_UI["flow/fp_method_confirm"].embeds[0];
    const filled = BOT_UI["builder/consumer_info/filled=True/cancel_first=False"].embeds[0];
    const strip = (e: typeof fp) => ({ ...e, fields: e.fields?.map((f) => ({ ...f, value: "" })) });
    expect(strip(filled)).toEqual(strip(fp));
    expect(BOT_UI["flow/fp_method_confirm"].components.map((c) => c.type === "button" && c.label)).toEqual([
      "上一步",
      "✏️ 填寫/修改資訊",
      "確認並獲取付款碼",
    ]);
  });

  it.each([
    ["wide", WIDE_STEPS],
    ["narrow", NARROW_STEPS],
  ])("%s timeline runs 6 to 15 seconds, in order, aiming inside the screen", (_, steps) => {
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
  });

  it("draws every screen of the story from the snapshots", () => {
    const bots = [...new Set(WIDE_STEPS.map((s) => s.screen.bot))];
    expect(bots).toEqual(["none", "select", "menu", "menuPick", "confirm", "buyer", "order"]);
    for (const layout of Object.values(LAYOUTS)) {
      for (const step of WIDE_STEPS) {
        const { unmount } = render(<FpScreen screen={step.screen} layout={layout} />);
        unmount();
      }
    }
    render(<FpScreen screen={WIDE_STEPS[WIDE_STEPS.length - 1].screen} layout={LAYOUTS.wide} />);
    expect(screen.getByText("付款編號：241021387465")).toBeTruthy();
    expect(screen.getAllByText("待付款｜0042").length).toBeGreaterThan(0);
  });
});
