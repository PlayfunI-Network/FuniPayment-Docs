// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { chooseLayout, resolveSteps } from "./dashboard-demo-steps";
import { DASHBOARD_SHOTS, DashboardDemo, dashboardPicture, type DashboardStep } from "./index";

const STEPS: DashboardStep[] = [
  { at: 0, caption: "打開設定分頁", target: "tabBasic" },
  { at: 1200, caption: "按儲存變更", swapTo: "settings-basic-edited", target: "save", click: true },
  { at: 2400, caption: "已儲存", swapTo: "settings-basic-saved", target: "saved" },
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

test("減少動態時改成全景：每個 caption 一個數字標號，下面列出說明", () => {
  stubReducedMotion(true);
  const { container } = render(<DashboardDemo shot="settings-basic" steps={STEPS} label="示範：儲存基本設定" />);
  expect(screen.getByRole("img", { name: "示範：儲存基本設定" }).hasAttribute("data-panorama")).toBe(true);
  // One picture per shot with a marker, each marker on its own shot
  const shots = Array.from(container.querySelectorAll("[data-panorama] [data-shot]")).map((el) => el.getAttribute("data-shot"));
  expect(shots).toEqual(["settings-basic", "settings-basic-edited", "settings-basic-saved"]);
  const markers = Array.from(container.querySelectorAll("[data-marker]")).map((el) => el.getAttribute("data-marker"));
  expect(markers).toEqual(["1", "2", "3"]);
  const items = Array.from(container.querySelectorAll("ol li")).map((li) => li.textContent);
  expect(items).toEqual(["1打開設定分頁", "2按儲存變更", "3已儲存"]);
});

test("一般情況播放示範：每張用到的截圖都先載入，最後一步的截圖在畫面上", () => {
  stubReducedMotion(false);
  const { container } = render(<DashboardDemo shot="settings-basic" steps={STEPS} label="示範：儲存基本設定" />);
  expect(container.querySelector("[data-panorama]")).toBeNull();
  const layers = Array.from(container.querySelectorAll<HTMLElement>("[data-shot]"));
  expect(layers.map((el) => el.getAttribute("data-shot"))).toEqual(["settings-basic", "settings-basic-edited", "settings-basic-saved"]);
  expect(layers.map((el) => el.style.visibility)).toEqual(["hidden", "hidden", ""]);
  expect(container.querySelector("img")?.getAttribute("loading")).toBe("eager");
});

test("WRITING.md「後台示範」的範例在桌面和手機版截圖上都對得上", () => {
  const steps: DashboardStep[] = [
    { at: 0, caption: "打開「付款方式與手續費」分頁", target: "tabPayment" },
    { at: 1500, caption: "關掉「萊爾富超商代碼」", target: "hilife", zoom: 2 },
    { at: 2400, target: "hilife", click: true },
    { at: 2700, swapTo: "settings-payment-edited" },
    { at: 4000, caption: "按「儲存變更」", target: "save", zoom: 1.6 },
    { at: 4800, target: "save", click: true },
    { at: 5100, caption: "看到「已儲存」就完成了", swapTo: "settings-payment-saved", target: "saved" },
    { at: 7500, zoom: 1, hideCursor: true },
  ];
  for (const layout of ["desktop", "mobile"] as const) {
    const frames = resolveSteps(dashboardPicture, "settings-payment", steps, layout);
    for (const f of frames) {
      if (f.cursor && !f.cursor.hidden) expect(f.cursor.y, `${layout} ${f.at}`).toBeGreaterThan(0);
      if (f.cursor && !f.cursor.hidden) expect(f.cursor.y, `${layout} ${f.at}`).toBeLessThan(1);
    }
  }
  expect(chooseLayout(DASHBOARD_SHOTS, "settings-payment", steps, true)).toBe("mobile");
});

test("目標不在截圖上時直接報錯", () => {
  stubReducedMotion(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<DashboardDemo shot="settings-basic" steps={[{ at: 0, target: "nope" }]} label="x" />)).toThrow("nope");
});
