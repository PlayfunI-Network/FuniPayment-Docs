import {
  chooseLayout,
  demoRatio,
  markersFor,
  panoramaSpan,
  closeShot,
  resolveSteps,
  showsOnly,
  shotsUsed,
  stageRatio,
  wholePlacement,
  type DashboardStep,
  type PictureOf,
} from "./dashboard-demo-steps";
import type { DashboardPicture, DashboardShotData } from "./dashboard-shot";

// A short page (fits the stage) and a tall one (narrowed to fit, close up as wide as the stage): 1000 px wide pictures
const pic = (height: number, targets: DashboardPicture["targets"]): DashboardPicture => ({ dark: "d", light: "l", width: 1000, height, targets });
const SHORT = pic(500, { save: { x: 0.8, y: 0.8, w: 0.1, h: 0.1 }, title: { x: 0.1, y: 0.1, w: 0.4, h: 0.1 } });
const TALL = pic(2000, { top: { x: 0.1, y: 0.02, w: 0.2, h: 0.02 }, bottom: { x: 0.5, y: 0.9, w: 0.2, h: 0.05 } });
const SHOTS: Record<string, DashboardShotData> = {
  short: { ...SHORT, mobile: pic(1500, { save: { x: 0.1, y: 0.9, w: 0.8, h: 0.04 } }) },
  tall: TALL,
};
const picture: PictureOf = (id, layout) => (layout === "mobile" ? SHOTS[id].mobile! : SHOTS[id]);

describe("resolveSteps", () => {
  test("目標換算成舞台上的位置，按的時候游標在中心；一開始是全景", () => {
    const steps: DashboardStep[] = [
      { at: 0, caption: "移到儲存", target: "save" },
      { at: 900, target: "save", click: true },
    ];
    const [a, b] = resolveSteps(picture, "short", steps, "desktop");
    // The short picture fits: stage ratio 0.5, placed as is
    expect(a).toMatchObject({ at: 0, caption: "移到儲存", shotId: "short", view: "whole", shot: { zoom: 1 }, cursor: { x: expect.closeTo(0.85), y: expect.closeTo(0.85), hidden: false } });
    expect(a.highlight).toBeUndefined();
    expect(b.cursor).toMatchObject({ x: expect.closeTo(0.85), y: expect.closeTo(0.85), click: true });
  });

  test("只是給人看的目標（沒按也沒打字）框紅框，游標停在框的右下角", () => {
    const steps: DashboardStep[] = [
      { at: 0, caption: "看標題", target: "title" },
      { at: 900, view: "close" },
      { at: 1800, target: "save", click: true },
      { at: 2100, swapTo: "tall", target: "top" },
    ];
    expect(steps.map((_, i) => showsOnly(steps, i))).toEqual([true, false, false, true]);
    const [a, b, c] = resolveSteps(picture, "short", steps, "desktop");
    expect(a.highlight).toEqual({ x: 0.1, y: expect.closeTo(0.1), w: 0.4, h: expect.closeTo(0.1) });
    expect(a.cursor).toMatchObject({ x: expect.closeTo(0.5 - 0.012), y: expect.closeTo(0.2 - 0.01) });
    // A step that only moves the camera keeps the frame; pressing elsewhere ends it
    expect(b.highlight).toBeUndefined();
    expect(c.cursor?.click).toBe(true);
    // The page a press opened, with the cursor still on the button, is not framed
    expect(showsOnly([{ at: 0, target: "save", click: true }, { at: 300, swapTo: "tall", target: "save" }], 1)).toBe(false);
  });

  test("長截圖縮窄放進舞台；close 把它放大到跟舞台一樣寬，對準目標", () => {
    const steps: DashboardStep[] = [
      { at: 0, target: "top" },
      { at: 900, view: "close" },
      { at: 1800, target: "bottom" },
      { at: 2700, view: "whole" },
    ];
    expect(stageRatio(TALL, "desktop")).toBe(0.72);
    const at = wholePlacement(2, 0.72);
    expect(at.w).toBeCloseTo(0.36);
    const [a, b, c, d] = resolveSteps(picture, "tall", steps, "desktop");
    expect(a.shot).toEqual({ zoom: 1 });
    expect(b.shot).toMatchObject({ zoom: expect.closeTo(1 / 0.36), focus: { x: expect.closeTo(at.x), w: expect.closeTo(0.36) }, exact: true });
    // The close camera follows a new target: lower on the page
    expect(c.shot!.focus!.y).toBeGreaterThan(b.shot!.focus!.y);
    expect(d).toMatchObject({ view: "whole", shot: { zoom: 1 } });
    // The frame is on the narrowed picture
    expect((a.highlight as { x: number }).x).toBeCloseTo(at.x + 0.1 * at.w);
  });

  test("close 的鏡頭：比舞台看得到的還高的目標對準上緣；已經跟舞台一樣寬的截圖不放大", () => {
    const at = { x: 0.3, w: 0.4 };
    const small = closeShot({ x: 0.4, y: 0.5, w: 0.1, h: 0.05 }, at);
    expect(small.zoom).toBeCloseTo(2.5);
    // Centred on the target: the focus is the target with room above and below
    expect(small.focus!.y + small.focus!.h / 2).toBeCloseTo(0.525);
    const tall = closeShot({ x: 0.4, y: 0.2, w: 0.1, h: 0.6 }, at);
    expect(tall.focus!.h).toBeCloseTo(0.4);
    expect(tall.focus!.y).toBeLessThan(0.2);
    expect(closeShot({ x: 0.4, y: 0.5, w: 0.1, h: 0.05 }, { x: 0, w: 1 })).toEqual({ zoom: 1 });
  });

  test("每一格都帶著自己的鏡頭，跳到任一步都是對的畫面", () => {
    const frames = resolveSteps(picture, "tall", [{ at: 0, target: "top" }, { at: 900, view: "close" }, { at: 1800, target: "bottom" }], "desktop");
    expect(frames.every((f) => f.shot)).toBe(true);
  });

  test("swapTo 換截圖；目標不在畫面上的截圖時直接報錯", () => {
    const ok = resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, swapTo: "tall", target: "top" }], "desktop");
    expect(ok.map((f) => f.shotId)).toEqual(["short", "tall"]);
    expect(() => resolveSteps(picture, "short", [{ at: 0, target: "top" }], "desktop")).toThrow("第 1 步");
    expect(() => resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, swapTo: "tall" }], "desktop")).toThrow("save");
  });

  test("手機版截圖也一樣：全景，再 close 到跟舞台一樣寬", () => {
    const frames = resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, view: "close" }], "mobile");
    expect(frames[0].shot).toEqual({ zoom: 1 });
    // 1500 / 1000 = 1.5 tall in a 1.3 stage
    expect(frames[1].shot).toMatchObject({ zoom: expect.closeTo(1.5 / 1.3), exact: true });
  });

  test("hideCursor 藏起游標", () => {
    const frames = resolveSteps(picture, "short", [{ at: 0, target: "save" }, { at: 900, hideCursor: true }], "desktop");
    expect(frames[1].cursor?.hidden).toBe(true);
  });
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

describe("whole", () => {
  // A page about as tall as wide, then a taller card: the login demo's shape
  const PAGE = pic(1000, { button: { x: 0.5, y: 0.5, w: 0.2, h: 0.05 } });
  const CARD = pic(1200, { skip: { x: 0.8, y: 0.1, w: 0.1, h: 0.05 } });
  const whole: PictureOf = (id, layout) => {
    const p = id === "page" ? PAGE : CARD;
    return layout === "mobile" ? { ...p, height: p.height * 2 } : p;
  };
  const steps: DashboardStep[] = [
    { at: 0, caption: "按按鈕", target: "button" },
    { at: 900, swapTo: "card", target: "skip" },
  ];

  test("舞台是第一張的比例，較高的一張縮窄置中，整張放得下", () => {
    expect(demoRatio(whole, "page", "desktop", true)).toBe(1);
    expect(demoRatio(whole, "page", "desktop")).toBe(0.72);
    expect(wholePlacement(1, 1)).toEqual({ x: 0, y: 0, w: 1 });
    const card = wholePlacement(1.2, 1);
    expect(card.w).toBeCloseTo(1 / 1.2);
    expect(card.x).toBeCloseTo((1 - 1 / 1.2) / 2);
    expect(card.y).toBeCloseTo(0);
  });

  test("整張顯示，游標照放好的位置指到目標；close 也不放大第一張", () => {
    const [a, b] = resolveSteps(whole, "page", steps.map((s) => ({ ...s, click: true })), "desktop", true);
    expect(a.shot).toEqual({ zoom: 1 });
    expect(resolveSteps(whole, "page", [{ at: 0, target: "button", view: "close" }], "desktop", true)[0].shot).toEqual({ zoom: 1 });
    expect(a.cursor).toMatchObject({ x: expect.closeTo(0.6), y: expect.closeTo(0.525) });
    // skip's centre (0.85, 0.125) on the card narrowed to 1/1.2 of the stage width
    const at = wholePlacement(1.2, 1);
    expect(b.cursor).toMatchObject({ x: expect.closeTo(at.x + 0.85 * at.w), y: expect.closeTo(0.125 * 1.2 * at.w) });
  });

  test("手機版的截圖太高，不用第一張的比例", () => {
    expect(demoRatio(whole, "page", "mobile", true)).toBe(stageRatio(whole("page", "mobile"), "mobile"));
  });
});
