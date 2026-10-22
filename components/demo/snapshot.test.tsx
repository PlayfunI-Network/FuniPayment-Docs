// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { DEMO_SCENARIO } from "@/lib/scenario";
import { SnapshotEmbed, SnapshotMessage } from "./snapshot";

describe("SnapshotMessage", () => {
  it("draws /fp's embed and menu with the scenario's amount", () => {
    const { container } = render(<SnapshotMessage id="flow/fp_command/ok" scenario={DEMO_SCENARIO} />);
    expect(screen.getByText("請點選下方選單來決定付款方式")).toBeTruthy();
    expect(screen.getByText("500")).toBeTruthy();
    expect(screen.getByText("選擇付款方式")).toBeTruthy();
    expect(container.querySelector("article")?.getAttribute("style")).toContain("rgb(0, 183, 255)");
    expect(screen.getByText(/Powered by PlayfunI Network/)).toBeTruthy();
  });

  it("shows the chosen option in the closed menu", () => {
    render(<SnapshotMessage id="flow/fp_command/ok" scenario={DEMO_SCENARIO} selected="store_barcode" />);
    expect(screen.getByText("四大超商條碼（+25元）")).toBeTruthy();
  });

  it("draws the buttons in order, disabled ones marked", () => {
    const { container } = render(
      <SnapshotMessage id="builder/consumer_info/filled=False/cancel_first=False" scenario={DEMO_SCENARIO} />,
    );
    const buttons = [...container.querySelectorAll("[data-discord-button]")].map((b) => ({
      label: b.textContent,
      disabled: b.getAttribute("aria-disabled") === "true",
    }));
    expect(buttons).toEqual([
      { label: "✏️ 填寫/修改資訊", disabled: false },
      { label: "取消操作", disabled: false },
      { label: "確認並獲取付款碼", disabled: true },
    ]);
    // ``` values become code blocks
    expect(container.querySelectorAll("pre").length).toBe(3);
  });

  it("refuses a scenario with another payment method on a method-only screen", () => {
    expect(() =>
      render(
        <SnapshotMessage
          id="builder/payment_create/store_barcode/invoice=False"
          scenario={{ ...DEMO_SCENARIO, method: "ibon" }}
        />,
      ),
    ).toThrow(/store_barcode/);
  });
});

describe("SnapshotEmbed", () => {
  it("draws only the embed: title, fields and the barcode image", () => {
    const { container } = render(
      <SnapshotEmbed id="builder/payment_create/store_barcode/invoice=False" scenario={DEMO_SCENARIO} />,
    );
    expect(screen.getByText("付款編號：241021387465")).toBeTruthy();
    expect(screen.getByText("525")).toBeTruthy();
    expect(container.querySelector('img[src="/demo/barcodes.png"]')).toBeTruthy();
  });
});
