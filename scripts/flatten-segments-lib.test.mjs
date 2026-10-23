import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect, test } from "vitest";
import { flattenSegments } from "./flatten-segments-lib.mjs";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "funipay-segments-"));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

test("nested prefetch segments get a dotted copy next to them", () => {
  const nested = path.join(tmp, "payments", "fp", "__next.!KGRvY3Mp", "$oc$slug");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(nested, "__PAGE__.txt"), "page");
  fs.writeFileSync(path.join(tmp, "payments", "fp", "__next._tree.txt"), "tree");
  fs.mkdirSync(path.join(tmp, "__next._not-found"));
  fs.writeFileSync(path.join(tmp, "__next._not-found", "__PAGE__.txt"), "404");

  expect(flattenSegments(tmp)).toEqual([
    "__next._not-found.__PAGE__.txt",
    "payments/fp/__next.!KGRvY3Mp.$oc$slug.__PAGE__.txt",
  ]);
  expect(fs.readFileSync(path.join(tmp, "payments", "fp", "__next.!KGRvY3Mp.$oc$slug.__PAGE__.txt"), "utf8")).toBe("page");
});
