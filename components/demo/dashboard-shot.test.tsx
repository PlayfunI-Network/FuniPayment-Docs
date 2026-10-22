// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { DASHBOARD_SHOTS, DashboardShot, shotTarget } from "./dashboard-shot";

const WIZARD = ["welcome", "setup-1", "setup-2", "setup-3", "setup-4", "setup-5"];

describe("DashboardShot", () => {
  it("puts both themes' images in the HTML, the light one shown only under html.light", () => {
    const { container } = render(<DashboardShot id="setup-1" />);
    const [dark, light] = Array.from(container.querySelectorAll("img"));
    expect(dark.getAttribute("src")).toBe("/demo/dashboard/setup-1-dark.webp");
    expect(dark.className).toContain("[.light_&]:hidden");
    expect(light.getAttribute("src")).toBe("/demo/dashboard/setup-1-light.webp");
    expect(light.className).toMatch(/^hidden .*\[\.light_&\]:block/);
    expect(dark.getAttribute("width")).toBe(String(DASHBOARD_SHOTS["setup-1"].width));
  });

  it("fails loudly for an unknown shot or target", () => {
    expect(() => render(<DashboardShot id="nope" />)).toThrow("nope");
    expect(() => shotTarget("setup-1", "nope")).toThrow("nope");
  });
});

describe("dashboard-shots.generated.json", () => {
  it("has the wizard and the welcome tour with the brief's targets", () => {
    for (const id of WIZARD) expect(DASHBOARD_SHOTS[id], id).toBeTruthy();
    expect(Object.keys(DASHBOARD_SHOTS["setup-1"].targets)).toEqual(["server", "next"]);
    expect(Object.keys(DASHBOARD_SHOTS["setup-2"].targets)).toContain("adminRole");
    expect(Object.keys(DASHBOARD_SHOTS["setup-3"].targets)).toEqual(expect.arrayContaining(["storeNumber", "paramCode", "verifyKey"]));
    expect(Object.keys(DASHBOARD_SHOTS["setup-4"].targets)).toEqual(expect.arrayContaining(["bankTransfer", "famiport"]));
    expect(Object.keys(DASHBOARD_SHOTS["setup-5"].targets)).toEqual(expect.arrayContaining(["agree", "create"]));
  });

  it("every image exists, is at most 200 KB, and every target lies inside it", () => {
    for (const [id, shot] of Object.entries(DASHBOARD_SHOTS)) {
      for (const src of [shot.dark, shot.light]) {
        const file = path.join(process.cwd(), "public", src);
        expect(fs.statSync(file).size, src).toBeLessThanOrEqual(200 * 1024);
      }
      for (const [name, r] of Object.entries(shot.targets)) {
        expect(r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= 1.0001 && r.y + r.h <= 1.0001, `${id}.${name}`).toBe(true);
      }
    }
  });
});
