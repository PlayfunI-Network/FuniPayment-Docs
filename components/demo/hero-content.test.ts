import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const ROOT = "content/docs";
const pages = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pages(join(dir, e.name)) : e.name.endsWith(".mdx") ? [join(dir, e.name)] : []));

// A page's demo comes first, beside the paragraph that introduces the page, so
// it is whole on arrival. The setup wizard has one demo per step instead of an opening one.
const NO_OPENING_DEMO = new Set(["getting-started/setup-wizard.mdx"]);

test.each(pages(ROOT).filter((f) => /<\w+Demo \/>/.test(readFileSync(f, "utf8"))))("%s 開頭是 DemoHero：demo 和介紹文字", (file) => {
  const rel = file.slice(ROOT.length + 1).replaceAll("\\", "/");
  if (NO_OPENING_DEMO.has(rel)) return;
  const body = readFileSync(file, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^import .*\n/gm, "")
    .trimStart();
  expect(body).toMatch(/^<DemoHero>\n<\w+Demo \/>\n\n[^\n<#][^\n]*\n\n<\/DemoHero>\n/);
});
