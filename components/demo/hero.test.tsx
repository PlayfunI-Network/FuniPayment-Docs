// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DemoHero, DemoStage, type DemoStep } from "./index";

const STEPS: DemoStep[] = [
  { at: 0, caption: "輸入指令" },
  { at: 1000, caption: "選付款方式" },
  { at: 2000 },
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

const Demo = () => (
  <DemoStage label="示範：開單" steps={STEPS} caption>
    {() => <div />}
  </DemoStage>
);

test("DemoHero 把介紹文字放在 demo 旁邊，並列出每一步的 caption，目前這一步亮起", () => {
  const { container } = render(
    <DemoHero>
      <Demo />
      <p>這個指令用來開單。</p>
    </DemoHero>,
  );
  const stage = screen.getByRole("img", { name: "示範：開單" });
  const text = container.querySelector(".demo-hero-text")!;
  expect(text.textContent).toContain("這個指令用來開單。");
  // The text is readable: not inside the image, not hidden
  expect(stage.contains(text)).toBe(false);
  expect(text.closest("[aria-hidden]")).toBeNull();
  const steps = [...container.querySelectorAll(".demo-hero-step")];
  expect(steps.map((s) => s.textContent)).toEqual(["1輸入指令", "2選付款方式"]);
  // Exactly one is lit: the one the caption under the stage shows (hidden side by side)
  const lit = steps.filter((s) => s.hasAttribute("data-on"));
  expect(lit).toHaveLength(1);
  expect(container.querySelector(".demo-hero-caption")!.textContent).toContain(lit[0].textContent!.slice(1));
});

test("不在 DemoHero 裡的 demo 照舊：沒有旁邊的文字和清單", () => {
  const { container } = render(<Demo />);
  expect(screen.getByRole("img", { name: "示範：開單" }).parentElement!.className).toContain("my-6");
  expect(container.querySelector(".demo-hero")).toBeNull();
  expect(container.querySelector(".demo-hero-step")).toBeNull();
  // The controls are under the stage
  expect(screen.getByRole("button", { name: "下一步" })).toBeTruthy();
});
