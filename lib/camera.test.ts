import { cameraTransform } from "./camera";

test("沒有 focus 時是全景", () => {
  expect(cameraTransform({ zoom: 1 }, { w: 1000, h: 600 })).toEqual({ scale: 1, tx: 0, ty: 0 });
});

test("把 focus 中心移到畫面中心", () => {
  const view = { w: 1000, h: 600 };
  const t = cameraTransform({ zoom: 2, focus: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 } }, view);
  expect(t.scale).toBe(2);
  // transform-origin 0 0: a content point p lands at tx + scale * p, so the focus centre
  // (0.5 of the width / height) must land on the viewport centre.
  expect(t.tx + t.scale * 0.5 * view.w).toBeCloseTo(view.w / 2);
  expect(t.ty + t.scale * 0.5 * view.h).toBeCloseTo(view.h / 2);
  expect(t.tx).toBeCloseTo(-500);
  expect(t.ty).toBeCloseTo(-300);
});

test("focus 在角落時不露出空白", () => {
  const t = cameraTransform({ zoom: 2, focus: { x: 0, y: 0, w: 0.1, h: 0.1 } }, { w: 1000, h: 600 });
  expect(t.tx).toBe(0);
  expect(t.ty).toBe(0);
});

test("focus 在右下角時也不露出空白", () => {
  const t = cameraTransform({ zoom: 2, focus: { x: 0.9, y: 0.9, w: 0.1, h: 0.1 } }, { w: 1000, h: 600 });
  // The scaled content's right / bottom edges sit exactly on the viewport's.
  expect(t.tx + t.scale * 1000).toBeCloseTo(1000);
  expect(t.ty + t.scale * 600).toBeCloseTo(600);
});

test("窄畫面放大更多", () => {
  const t = cameraTransform({ zoom: 2, focus: { x: 0.45, y: 0.45, w: 0.1, h: 0.1 } }, { w: 375, h: 500 });
  expect(t.scale).toBeCloseTo(2.7);
});

test("窄畫面加乘不超過 focus 填滿畫面的倍率", () => {
  // A focus half the width fills the viewport at 2x; 2 * 1.35 would crop it.
  const t = cameraTransform({ zoom: 2, focus: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } }, { w: 375, h: 500 });
  expect(t.scale).toBeCloseTo(2);
});

test("寬畫面照 zoom 放大", () => {
  const t = cameraTransform({ zoom: 2, focus: { x: 0.45, y: 0.45, w: 0.1, h: 0.1 } }, { w: 640, h: 400 });
  expect(t.scale).toBe(2);
});

test("還沒量到大小時是全景", () => {
  expect(cameraTransform({ zoom: 2, focus: { x: 0, y: 0, w: 0.1, h: 0.1 } }, { w: 0, h: 0 })).toEqual({
    scale: 1,
    tx: 0,
    ty: 0,
  });
});
