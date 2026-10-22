// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DemoStage, frameAt, type DemoStep } from "./index";

const STEPS: DemoStep[] = [
  { at: 0, caption: "移到按鈕", cursor: { x: 0.2, y: 0.2 } },
  { at: 600, shot: { zoom: 2, focus: { x: 0.6, y: 0.6, w: 0.2, h: 0.1 } }, cursor: { x: 0.7, y: 0.65 } },
  { at: 1400, caption: "點擊", cursor: { x: 0.7, y: 0.65, click: true } },
  { at: 2200, caption: "完成", shot: { zoom: 1 } },
];

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("減少動態時只顯示最後一步", () => {
  const seen: number[] = [];
  render(
    <DemoStage label="示範：點擊按鈕" steps={STEPS} caption>
      {(step, index) => {
        seen.push(index);
        return <div data-testid="screen">{step.caption}</div>;
      }}
    </DemoStage>,
  );
  expect(seen.length).toBeGreaterThan(0);
  expect(seen.every((i) => i === STEPS.length - 1)).toBe(true);
  expect(screen.getByTestId("screen").textContent).toBe("完成");
  // The caption shows the third (last) captioned step.
  expect(screen.getByText("3")).toBeTruthy();
});

test("沒寫 shot / cursor 的步驟沿用前一步，但不會再點一次", () => {
  const f = frameAt([...STEPS.slice(0, 3), { at: 2000 }], 3);
  expect(f.shot).toEqual(STEPS[1].shot);
  expect(f.cursor).toEqual({ x: 0.7, y: 0.65, click: false });
  expect(f.caption).toEqual({ text: "點擊", index: 1, total: 2 });
  expect(frameAt(STEPS, 0).shot).toEqual({ zoom: 1 });
});

test("外層是有 aria-label 的 img，內容對輔助技術隱藏", () => {
  render(
    <DemoStage label="示範：點擊按鈕" steps={STEPS}>
      {() => <div data-testid="screen" />}
    </DemoStage>,
  );
  const stage = screen.getByRole("img", { name: "示範：點擊按鈕" });
  const content = screen.getByTestId("screen").closest("[aria-hidden]");
  expect(content?.getAttribute("aria-hidden")).toBe("true");
  expect(stage.contains(content)).toBe(true);
});
