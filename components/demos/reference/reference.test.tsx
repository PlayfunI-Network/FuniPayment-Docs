// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { COMMANDS, SMILEPAY_ERRORS } from "@/content/bot-ui.generated";
import { calculateFee } from "@/lib/fees";
import { commandRows, CommandTable, WHO } from "./command-table";
import { FeeCalculator, quote } from "./fee-calculator";
import { SmilepayErrorTable, smilepayErrorRows, UNKNOWN_SAMPLE } from "./smilepay-error-table";

describe("command table", () => {
  it("has who-may-use for exactly the commands in commands.json", () => {
    expect(commandRows().map((r) => r.name).sort()).toEqual(Object.keys(WHO).sort());
  });

  it("lists every command and subcommand, /dashboard as 管理伺服器 (permission bit 32)", () => {
    const { container } = render(<CommandTable />);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(commandRows().length);
    expect(COMMANDS.dashboard.defaultMemberPermissions).toBe(32);
    expect(WHO.dashboard.who).toContain("管理伺服器");
    expect(container.textContent).toContain("/payment create");
    expect(container.textContent).toContain("指定付款者（選填）");
  });
});

describe("fee calculator", () => {
  it("quotes the bot's rule: 7-11 over 1000 adds 5, exactly 1000 does not", () => {
    expect(quote("ibon", "980")).toEqual({ fee: 35, total: 1015 });
    expect(quote("ibon", "970")).toEqual({ fee: 30, total: 1000 });
    expect(quote("hilife", "980")).toEqual({ fee: 35, total: 1015 });
    expect(quote("famiport", "980")).toEqual({ fee: calculateFee("famiport", 980), total: 1015 });
    expect(quote("bank_transfer", "0")).toBeNull();
    expect(quote("bank_transfer", "1.5")).toBeNull();
    expect(quote("bank_transfer", "-3")).toBeNull();
  });

  it("updates when the amount or method changes", () => {
    render(<FeeCalculator />);
    expect(screen.getByText("1015 元")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("付款方式"), { target: { value: "bank_transfer" } });
    expect(screen.getByText("993 元")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("訂單金額（元）"), { target: { value: "abc" } });
    expect(screen.getByText("金額請填大於 0 的整數。")).toBeTruthy();
  });
});

describe("SmilePay error table", () => {
  it("lists every code but the unknown-code sample", () => {
    const { container } = render(<SmilepayErrorTable />);
    expect(SMILEPAY_ERRORS[UNKNOWN_SAMPLE]).toBe("未知的錯誤代碼 -9999");
    expect(smilepayErrorRows()).toHaveLength(Object.keys(SMILEPAY_ERRORS).length - 1);
    expect(container.textContent).toContain("商家未開啟此付款方式");
  });
});
