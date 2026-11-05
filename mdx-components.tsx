import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import type { MDXComponents } from "mdx/types";
import { DemoHero } from "@/components/demo/hero";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    DemoHero,
    Step,
    Steps,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
