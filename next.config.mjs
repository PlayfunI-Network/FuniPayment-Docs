import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
  // next dev would otherwise write an AGENTS.md into the repo root on every start.
  agentRules: false,
  // Dev-only pages (app/dev/**/page.dev.tsx) exist only under `next dev`; the build never sees
  // them, so they are never exported (check:export also fails if out/dev appears).
  ...(process.env.NODE_ENV === "development" && {
    pageExtensions: ["mdx", "md", "jsx", "js", "tsx", "ts", "dev.tsx"],
  }),
};

export default withMDX(config);
