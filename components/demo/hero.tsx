"use client";
// A page's opening demo with the text that introduces it. MDX writes
//
//   <DemoHero>
//   <FpDemo />
//
//   一兩句話說這是什麼……
//   </DemoHero>
//
// The demo (DemoStage, or DashboardDemo's reduced-motion panorama) lays itself out with the text
// through HeroFrame: side by side when the hero is wide enough (demo left; the text, then the
// demo's steps listed one per line with the current one lit, right), else stacked (demo, its
// caption, then the text). Which one is a container query in globals.css (.demo-hero), so the
// static HTML is already right and nothing moves after hydration.
import { Children, createContext, use, type ReactNode } from "react";

const HeroText = createContext<ReactNode>(null);

/** The opening demo (first child) and the text beside it (the rest). */
export function DemoHero({ children }: { children: ReactNode }) {
  const [demo, ...text] = Children.toArray(children);
  return <HeroText value={text}>{demo}</HeroText>;
}

/** The demo's captions, for the list beside it: all of them, and which one is on (-1: none yet). */
export type HeroSteps = { captions: string[]; index: number };

/**
 * Lays `stage` (the demo's role="img" element, with `className` for its margins) out with the
 * hero's text when it is inside a DemoHero; otherwise returns it as is, with `className`.
 * `steps` lists the captions beside a side-by-side demo.
 */
export function HeroFrame({
  stage,
  steps,
}: {
  stage: (className: string) => ReactNode;
  steps?: HeroSteps;
}) {
  const text = use(HeroText);
  if (text === null) return stage("not-prose my-6 first:mt-0");
  return (
    <div className="demo-hero my-6 first:mt-0" data-demo-hero="">
      <div className="demo-hero-row">
        <div className="demo-hero-stage">{stage("not-prose")}</div>
        <div className="demo-hero-text">
          {text}
          {steps && steps.captions.length > 0 && <StepList {...steps} />}
        </div>
      </div>
    </div>
  );
}

/** The demo's captions one per line, the current one lit; only shown side by side (globals.css). */
function StepList({ captions, index }: HeroSteps) {
  return (
    <ol aria-hidden="true" className="demo-hero-steps not-prose">
      {captions.map((text, i) => (
        <li key={i} data-on={i === index || undefined} className="demo-hero-step">
          <span className="demo-hero-step-number">{i + 1}</span>
          <span className="min-w-0 flex-1">{text}</span>
        </li>
      ))}
    </ol>
  );
}
