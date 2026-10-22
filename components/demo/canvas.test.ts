import { canvasPoint, canvasRect, zoomTo } from "./canvas";

const WIDE = { w: 800, h: 400, left: 200 };

describe("canvas coordinates", () => {
  it("turns canvas px into fractions, shifted by left", () => {
    expect(canvasRect(WIDE, { x: 0, y: 100, w: 400, h: 200 })).toEqual({ x: 0.25, y: 0.25, w: 0.5, h: 0.5 });
    expect(canvasPoint({ w: 400, h: 400 }, { x: 100, y: 300 }, { click: true })).toEqual({ x: 0.25, y: 0.75, click: true });
  });

  it("caps the zoom so the area still fits, and never goes below 1", () => {
    expect(zoomTo(WIDE, 3, { x: 0, y: 0, w: 400, h: 100 }).zoom).toBe(2);
    expect(zoomTo(WIDE, 1.5, { x: 0, y: 0, w: 100, h: 100 }).zoom).toBe(1.5);
    expect(zoomTo(WIDE, 2, { x: 0, y: 0, w: 800, h: 400 }).zoom).toBe(1);
  });
});
