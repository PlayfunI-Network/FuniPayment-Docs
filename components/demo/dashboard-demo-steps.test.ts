import { chooseLayout, markersFor, panoramaSpan, resolveSteps, scrollFor, shotsUsed, stageRatio, type DashboardStep, type PictureOf } from "./dashboard-demo-steps";
import type { DashboardPicture, DashboardShotData } from "./dashboard-shot";

// A short page (fits the stage) and a tall one (scrolls): 1000 px wide pictures
const pic = (height: number, targets: DashboardPicture["targets"]): DashboardPicture => ({ dark: "d", light: "l", width: 1000, height, targets });
const SHORT = pic(500, { save: { x: 0.8, y: 0.8, w: 0.1, h: 0.1 }, title: { x: 0.1, y: 0.1, w: 0.4, h: 0.1 } });
const TALL = pic(2000, { top: { x: 0.1, y: 0.02, w: 0.2, h: 0.02 }, bottom: { x: 0.5, y: 0.9, w: 0.2, h: 0.05 } });
const SHOTS: Record<string, DashboardShotData> = {
  short: { ...SHORT, mobile: pic(1500, { save: { x: 0.1, y: 0.9, w: 0.8, h: 0.04 } }) },
  tall: TALL,
};
const picture: PictureOf = (id, layout) => (layout === "mobile" ? SHOTS[id].mobile! : SHOTS[id]);

describe("resolveSteps", () => {
  test("目標換算成舞台上的位置：游標在中心，放大時鏡頭對準它", () => {
    const steps: DashboardStep[] = [
      { at: 0, caption: "看標題", target: "title" },
      { at: 900, target: "save", zoom: 2, click: true },
    ];
    const [a, b] = resolveSteps(picture, "short", steps, "desktop");
    // The short picture fits: stage ratio 0.5, no scroll, rects unchanged
    expect(a).toMatchObject({ at: 0, caption: "看標題", shotId: "short", scroll: 0, cursor: { x: expect.closeTo(0.3), y: expect.closeTo(0.15), hidden: false } });
    expect(b.cursor).toMatchObject({ x: expect.closeTo(0.85), y: expect.closeTo(0.85), click: true });
    expect(b.shot).toEqual({ zoom: 2, focus: { x: 0.8, y: expect.closeTo(0.8), w: 0.1, h: expect.closeTo(0.1) } });
  });

  test("長截圖會捲動，讓下面的目標進到畫面裡", () => {
    const steps: DashboardStep[] = [
      { at: 0, target: "top" },
      { at: 900, target: "bottom" },
    ];
    const ratio = stageRatio(TALL, "desktop");
    expect(ratio).toBe(0.72);
    const [a, b] = resolveSteps(picture, "tall", steps, "desktop");
    expect(a.scroll).toBe(0);
    expect(b.scroll).toBeGreaterThan(0);
    // The target is inside the stage after scrolling
    const y = b.cursor!.y;
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(1);
  });

  test("swapTo 換截圖；目標不在畫面上的截圖時直接報錯", () => {
    const ok = resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, swapTo: "tall", target: "top" }], "desktop");
    expect(ok.map((f) => f.shotId)).toEqual(["short", "tall"]);
    expect(() => resolveSteps(picture, "short", [{ at: 0, target: "top" }], "desktop")).toThrow("第 1 步");
    expect(() => resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, swapTo: "tall" }], "desktop")).toThrow("save");
  });

  test("hideCursor 藏起游標", () => {
    const frames = resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, hideCursor: true }], "desktop");
    expect(frames[1].cursor?.hidden).toBe(true);
  });
});

test("scrollFor：目標已經在畫面裡就不捲", () => {
  expect(scrollFor({ x: 0, y: 0.1, w: 0.1, h: 0.05 }, 2, 0.72, 0)).toBe(0);
  expect(scrollFor({ x: 0, y: 0.9, w: 0.1, h: 0.05 }, 2, 0.72, 0)).toBeCloseTo(2 - 0.72);
});

test("chooseLayout：窄螢幕用手機版，但手機版缺目標時改用桌面版", () => {
  expect(chooseLayout(SHOTS, "short", [{ at: 0, target: "save" }], true)).toBe("mobile");
  expect(chooseLayout(SHOTS, "short", [{ at: 0, target: "title" }], true)).toBe("desktop");
  expect(chooseLayout(SHOTS, "short", [{ at: 0, target: "save" }], false)).toBe("desktop");
  expect(chooseLayout(SHOTS, "short", [{ at: 0, swapTo: "tall" }], true)).toBe("desktop");
  expect(shotsUsed("short", [{ at: 0, swapTo: "tall" }, { at: 1, swapTo: "short" }])).toEqual(["short", "tall"]);
});

describe("減少動態的標號", () => {
  test("每個 caption 一個標號，指在它那段第一個目標上", () => {
    const steps: DashboardStep[] = [
      { at: 0, caption: "第一段" },
      { at: 500, target: "title" },
      { at: 900, caption: "第二段", target: "save" },
      { at: 1500, caption: "沒有目標的一段" },
      { at: 2000, caption: "換頁", swapTo: "tall", target: "bottom" },
    ];
    const markers = markersFor(picture, "short", steps, "desktop");
    expect(markers).toEqual([
      { number: 1, caption: "第一段", shotId: "short", rect: SHORT.targets.title },
      { number: 2, caption: "第二段", shotId: "short", rect: SHORT.targets.save },
      { number: 3, caption: "沒有目標的一段", shotId: "short" },
      { number: 4, caption: "換頁", shotId: "tall", rect: TALL.targets.bottom },
    ]);
  });

  test("全景範圍包住所有標號的目標，至少跟舞台一樣高，不超出截圖", () => {
    const span = panoramaSpan([TALL.targets.top, TALL.targets.bottom], 2, 0.72);
    expect(span.top).toBe(0);
    expect(span.top + span.height).toBeGreaterThanOrEqual(0.95 * 2);
    expect(span.top + span.height).toBeLessThanOrEqual(2);
    const one = panoramaSpan([TALL.targets.bottom], 2, 0.72);
    expect(one.height).toBeCloseTo(0.72);
    expect(one.top + one.height).toBeLessThanOrEqual(2);
    expect(panoramaSpan([], 2, 0.72)).toEqual({ top: 0, height: 0.72 });
  });
});
