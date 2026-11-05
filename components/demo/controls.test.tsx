// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { captionSpans, DemoHero, DemoStage, type DemoStep } from "./index";

// Two captions, the first over two steps (move, then click), the last with a closing step
const STEPS: DemoStep[] = [
  { at: 0, caption: "移到按鈕", cursor: { x: 0.2, y: 0.2 } },
  { at: 800, cursor: { x: 0.2, y: 0.2, click: true } },
  { at: 1200, caption: "看結果", cursor: { x: 0.6, y: 0.6 } },
  { at: 2000, caption: "完成", shot: { zoom: 2, focus: { x: 0.5, y: 0.5, w: 0.2, h: 0.2 } } },
  { at: 3000, cursor: { x: 0.5, y: 0.5, hidden: true } },
];

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("captionSpans：每段從它的 caption 到下一段之前", () => {
  expect(captionSpans(STEPS)).toEqual([
    { from: 0, to: 1 },
    { from: 2, to: 2 },
    { from: 3, to: 4 },
  ]);
  // Steps before the first caption belong to it
  expect(captionSpans([{ at: 0 }, { at: 500, caption: "a" }])).toEqual([{ from: 0, to: 1 }]);
});

const Demo = ({ seen }: { seen: (index: number) => void }) => (
  <DemoStage label="示範" steps={STEPS} caption>
    {(_, index) => {
      seen(index);
      return <div />;
    }}
  </DemoStage>
);

test("點一步的圓點：畫面停在那一段的結尾，caption 和目前那一步跟著換", () => {
  const seen = vi.fn();
  render(<Demo seen={seen} />);
  // No IntersectionObserver in jsdom: it does not animate, so a pick shows the part's end at once
  fireEvent.click(screen.getByRole("button", { name: "第 1 步：移到按鈕" }));
  expect(seen).toHaveBeenLastCalledWith(1);
  expect(screen.getByRole("button", { name: "第 1 步：移到按鈕" }).getAttribute("aria-current")).toBe("step");
  expect(screen.getByText("移到按鈕")).toBeTruthy();
  // No play button where it cannot play
  expect(screen.queryByRole("button", { name: /自動播放/ })).toBeNull();
});

test("上一步、下一步和 ← →；第一步沒有上一步，最後一步沒有下一步", () => {
  const seen = vi.fn();
  render(<Demo seen={seen} />);
  const prev = screen.getByRole("button", { name: "上一步" }) as HTMLButtonElement;
  const next = screen.getByRole("button", { name: "下一步" }) as HTMLButtonElement;
  // Server render: the last step
  expect(next.disabled).toBe(true);
  fireEvent.click(prev);
  expect(seen).toHaveBeenLastCalledWith(2);
  fireEvent.keyDown(prev, { key: "ArrowLeft" });
  expect(seen).toHaveBeenLastCalledWith(1);
  expect(prev.disabled).toBe(true);
  fireEvent.keyDown(prev, { key: "ArrowRight" });
  expect(seen).toHaveBeenLastCalledWith(2);
});

test("DemoHero 旁邊的步驟清單也能點", () => {
  const seen = vi.fn();
  const { container } = render(
    <DemoHero>
      <Demo seen={seen} />
      <p>介紹</p>
    </DemoHero>,
  );
  const lines = container.querySelectorAll<HTMLButtonElement>(".demo-hero-step");
  expect(lines).toHaveLength(3);
  fireEvent.click(lines[1]);
  expect(seen).toHaveBeenLastCalledWith(2);
  expect(lines[1].getAttribute("aria-current")).toBe("step");
  // Labelled bar beside the text
  expect(container.querySelector(".demo-hero-side-controls")!.textContent).toContain("下一步");
});
