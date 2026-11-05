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

test("pointAt 讓游標停在那一步展示的東西上，直到游標移到別處或指向別的東西", () => {
  const steps: DemoStep[] = [
    { at: 0, cursor: { x: 0.9, y: 0.9 } },
    { at: 500, caption: "看回覆", pointAt: "[data-reply]" },
    { at: 1000, caption: "還在看" },
    { at: 1500, cursor: { x: 0.5, y: 0.5, hidden: true } },
    { at: 2000, cursor: { x: 0.1, y: 0.1, click: true } },
    { at: 2500, pointAt: "[data-reply]", cursor: { x: 0.3, y: 0.3 } },
  ];
  expect(frameAt(steps, 0).pointAt).toBeNull();
  expect(frameAt(steps, 1).pointAt).toBe("[data-reply]");
  expect(frameAt(steps, 2).pointAt).toBe("[data-reply]");
  // Hiding the cursor keeps it there; showing it elsewhere ends it
  expect(frameAt(steps, 3).pointAt).toBe("[data-reply]");
  expect(frameAt(steps, 4).pointAt).toBeNull();
  // A step's own cursor wins
  expect(frameAt(steps, 5).pointAt).toBeNull();
});

test("展示型的步驟不在畫面上畫任何框", () => {
  // Without IntersectionObserver the stage shows its last step
  const { container } = render(
    <DemoStage label="示範" steps={[{ at: 0 }, { at: 500, caption: "看回覆", pointAt: "[data-reply]" }]} caption>
      {() => <div data-reply="">回覆</div>}
    </DemoStage>,
  );
  expect(container.querySelector("[data-highlight]")).toBeNull();
  expect(container.querySelector('[class*="highlight"]')).toBeNull();
});
