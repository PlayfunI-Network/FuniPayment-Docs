// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import type { DemoStep } from "@/components/demo";
import { BOT_UI } from "@/content/bot-ui.generated";
import type { MessageEntry } from "@/lib/bot-ui-types";
import * as after from "../buyers/after-paying-demo";
import * as buyer from "./buyer-info-demo";
import * as automation from "./channel-automation-demo";
import * as expiry from "./expiry-demo";
import { OrderGallery } from "./order-gallery";
import * as create from "./payment-create-demo";
import * as history from "./payment-history-demo";
import * as recheck from "./payment-recheck-demo";
import * as review from "./payment-review-demo";

type Steps = (DemoStep & { screen: unknown })[];
type Any = ComponentType<{ screen: never; layout: never }>;
const DEMOS: [string, Any, Record<string, unknown>, Steps, Steps][] = [
  ["payment create", create.PaymentCreateScreen as Any, create.LAYOUTS, create.WIDE_STEPS, create.NARROW_STEPS],
  ["buyer info", buyer.BuyerInfoScreen as Any, buyer.LAYOUTS, buyer.WIDE_STEPS, buyer.NARROW_STEPS],
  ["payment review", review.PaymentReviewScreen as Any, review.LAYOUTS, review.WIDE_STEPS, review.NARROW_STEPS],
  ["payment history", history.PaymentHistoryScreen as Any, history.LAYOUTS, history.WIDE_STEPS, history.NARROW_STEPS],
  ["payment recheck", recheck.PaymentRecheckScreen as Any, recheck.LAYOUTS, recheck.WIDE_STEPS, recheck.NARROW_STEPS],
  ["recheck all", recheck.RecheckAllScreen as Any, recheck.ALL_LAYOUTS, recheck.ALL_WIDE_STEPS, recheck.ALL_NARROW_STEPS],
  ["channel automation", automation.ChannelAutomationScreen as Any, automation.LAYOUTS, automation.WIDE_STEPS, automation.NARROW_STEPS],
  ["expiry", expiry.ExpiryScreen as Any, expiry.LAYOUTS, expiry.WIDE_STEPS, expiry.NARROW_STEPS],
  ["after paying", after.AfterPayingScreen as Any, after.LAYOUTS, after.WIDE_STEPS, after.NARROW_STEPS],
];

describe.each(DEMOS)("%s demo", (_, Screen, layouts, wide, narrow) => {
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

describe("snapshot assumptions", () => {
  it("the buyer information comes up empty, then filled, with the same buttons", () => {
    const empty = BOT_UI["flow/payment_create_command/ok"];
    const filled = BOT_UI["builder/consumer_info/filled=True/cancel_first=True"];
    const labels = (e: MessageEntry) => e.components.map((c) => c.type === "button" && [c.label, c.disabled]);
    expect(labels(empty)).toEqual([
      ["取消操作", false],
      ["✏️ 填寫/修改資訊", false],
      ["確認並獲取付款碼", true],
    ]);
    expect(labels(filled)).toEqual([
      ["取消操作", false],
      ["✏️ 填寫/修改資訊", false],
      ["確認並獲取付款碼", false],
    ]);
    expect(empty.ephemeral).toBe(true);
    expect(BOT_UI["modal/consumer_info"].fields.map((f) => f.id)).toEqual(["name", "mail", "phone"]);
  });

  it("history page 1 has a 統計表 button that page 0 disables", () => {
    const button = (id: "flow/payment_history_command/1" | "flow/payment_history_command/0") =>
      BOT_UI[id].components.find((c) => c.type === "button" && c.label === "統計表");
    expect(button("flow/payment_history_command/1")).toMatchObject({ disabled: false });
    expect(button("flow/payment_history_command/0")).toMatchObject({ disabled: true });
  });
});

describe("the end of each story", () => {
  it("the order lands in the channel after /payment create", () => {
    const last = create.WIDE_STEPS[create.WIDE_STEPS.length - 1].screen;
    render(<create.PaymentCreateScreen screen={last} layout={create.LAYOUTS.wide} />);
    expect(screen.getByText("付款編號：241021550918")).toBeTruthy();
  });

  it("the recheck renames the channel and posts the complete notice", () => {
    const last = recheck.WIDE_STEPS[recheck.WIDE_STEPS.length - 1].screen;
    render(<recheck.PaymentRecheckScreen screen={last} layout={recheck.LAYOUTS.wide} />);
    expect(screen.getAllByText("已付款｜0042").length).toBeGreaterThan(0);
    expect(screen.getByText(/速買配－付款完成通知/)).toBeTruthy();
  });
});

describe("order gallery and review states", () => {
  it("switches between every method's order", () => {
    render(<OrderGallery />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["銀行轉帳", "四大超商條碼", "7-11 超商代碼", "全家超商代碼", "萊爾富超商代碼"]);
    for (const tab of tabs) {
      fireEvent.click(tab);
      expect(tab.getAttribute("aria-selected")).toBe("true");
      expect(screen.getByText(/速買配－成功建立訂單/)).toBeTruthy();
    }
  });

  it("shows the three review answers", () => {
    render(<review.ReviewStates />);
    for (const [i, author] of ["付款進度：尚未付款／待入帳", "付款進度：已繳費", "付款狀態：已過期"].entries()) {
      fireEvent.click(screen.getAllByRole("tab")[i]);
      expect(screen.getByText(author)).toBeTruthy();
    }
  });
});
