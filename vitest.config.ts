import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests needing a DOM say so with `// @vitest-environment jsdom`, except the files copied
// unchanged from the site (which runs every test in jsdom); those are listed here.
const COPIED_DOM_TESTS = ["lib/use-timeline.test.ts"];

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["lib/**/*.test.ts", "components/**/*.test.tsx", "scripts/**/*.test.ts", "scripts/**/*.test.mjs"],
          exclude: COPIED_DOM_TESTS,
        },
      },
      { extends: true, test: { name: "jsdom", environment: "jsdom", include: COPIED_DOM_TESTS } },
    ],
  },
});
