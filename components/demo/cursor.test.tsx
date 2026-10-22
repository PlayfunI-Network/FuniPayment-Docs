// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { Cursor } from "./cursor";

afterEach(cleanup);

test("連續兩步都點擊時，第二次按下與漣漪會重新播放", () => {
  const state = { x: 0.5, y: 0.5, click: true };
  const { rerender } = render(<Cursor state={state} pressId={3} />);
  const firstRipple = screen.getByTestId("cursor-ripple");
  const firstArrow = screen.getByTestId("cursor-arrow");

  rerender(<Cursor state={{ ...state }} pressId={4} />);
  const secondRipple = screen.getByTestId("cursor-ripple");
  const secondArrow = screen.getByTestId("cursor-arrow");

  // Remounted: new elements, so their CSS animations start over.
  expect(secondRipple).not.toBe(firstRipple);
  expect(firstRipple.isConnected).toBe(false);
  expect(secondArrow).not.toBe(firstArrow);
  expect(secondArrow.getAttribute("class")).toContain("demo-press");
});

test("同一次點擊重新 render 不會重播", () => {
  const state = { x: 0.5, y: 0.5, click: true };
  const { rerender } = render(<Cursor state={state} pressId={3} />);
  const ripple = screen.getByTestId("cursor-ripple");
  rerender(<Cursor state={{ ...state }} pressId={3} />);
  expect(screen.getByTestId("cursor-ripple")).toBe(ripple);
});

test("打字時顯示輸入游標，不是箭頭", () => {
  const { rerender } = render(<Cursor state={{ x: 0.5, y: 0.5, typing: true }} />);
  expect(screen.getByTestId("cursor-ibeam")).toBeTruthy();
  expect(screen.queryByTestId("cursor-arrow")).toBeNull();

  rerender(<Cursor state={{ x: 0.5, y: 0.5 }} />);
  expect(screen.getByTestId("cursor-arrow")).toBeTruthy();
  expect(screen.queryByTestId("cursor-ibeam")).toBeNull();
});
