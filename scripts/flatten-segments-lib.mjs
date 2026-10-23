import fs from "node:fs";
import path from "node:path";

/**
 * Next 16's static export writes a page's prefetch segment nested
 * (`payments/fp/__next.!KGRvY3Mp/$oc$slug/__PAGE__.txt`), but the client asks for it with the
 * parts joined by dots (`payments/fp/__next.!KGRvY3Mp.$oc$slug.__PAGE__.txt`). Without the
 * dotted copy every prefetch is a 404 in the console. Returns the copies made, relative to outDir.
 */
export function flattenSegments(outDir) {
  const made = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("__next.")) {
        for (const file of fs.readdirSync(full, { recursive: true, encoding: "utf8" })) {
          const source = path.join(full, file);
          if (!fs.statSync(source).isFile()) continue;
          const target = path.join(dir, [entry.name, ...file.split(path.sep)].join("."));
          fs.copyFileSync(source, target);
          made.push(path.relative(outDir, target).split(path.sep).join("/"));
        }
      } else {
        visit(full);
      }
    }
  };
  visit(outDir);
  return made.sort();
}
