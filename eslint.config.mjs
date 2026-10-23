import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", ".source/**", "build/**", "next-env.d.ts", "docs/**", ".superpowers/**", ".wrangler/**", ".phase2-shots/**"]),
]);
