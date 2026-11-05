// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DemoStage, frameAt, type DemoStep } from "./index";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const BOX = { x: 0.2, y: 0.3, w: 0.4, h: 0.1 };

test("紅框留到下一個把游標移到別處或另設紅框的步驟；沒設游標時游標指向紅框", () => {
  const steps: DemoStep[] = [
    { at: 0, cursor: { x: 0.9, y: 0.9 } },
    { at: 500, caption: "看這裡", highlight: BOX },
    { at: 1000, caption: "還在看" },
    { at: 1500, cursor: { x: 0.1, y: 0.1, click: true } },
    { at: 2000, highlight: BOX, cursor: { x: 0.5, y: 0.5 } },
    { at: 2500, highlight: null },
    { at: 3000, highlight: BOX },
    { at: 3500, cursor: { x: 0.5, y: 0.5, hidden: true } },
  ];
  expect(frameAt(steps, 0)).toMatchObject({ highlight: null, pointAtHighlight: false });
  expect(frameAt(steps, 1)).toMatchObject({ highlight: BOX, pointAtHighlight: true });
  expect(frameAt(steps, 2)).toMatchObject({ highlight: BOX, pointAtHighlight: true });
  expect(frameAt(steps, 3)).toMatchObject({ highlight: null });
  expect(frameAt(steps, 4)).toMatchObject({ highlight: BOX, pointAtHighlight: false });
  expect(frameAt(steps, 5)).toMatchObject({ highlight: null });
  // Hiding the cursor at the end keeps the frame
  expect(frameAt(steps, 7)).toMatchObject({ highlight: BOX });
});

test("舞台畫出紅框（在鏡頭裡、輔助技術看不到）", () => {
  // Without IntersectionObserver the stage shows its last step
  const { container } = render(
    <DemoStage label="示範" steps={[{ at: 0 }, { at: 500, caption: "看這裡", highlight: BOX }]} caption>
      {() => <div />}
    </DemoStage>,
  );
  const frame = container.querySelector<HTMLElement>("[data-highlight]")!;
  expect(frame).toBeTruthy();
  expect(frame.closest("[data-camera]")).toBeTruthy();
  expect(frame.closest('[aria-hidden="true"]')).toBeTruthy();
  // A few px outside the target (20% to 60% across), kept inside the stage
  expect(frame.style.left).toContain("20%");
  expect(frame.style.right).toContain("40%");
});
