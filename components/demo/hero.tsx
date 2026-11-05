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
// demo's steps listed one per line with the current one lit, each one a button, and the
// previous/pause/next bar, right), else stacked (demo, its caption and controls, then the text). Which one is a container query in globals.css (.demo-hero), so the
// static HTML is already right and nothing moves after hydration.
import { Children, createContext, use, type ReactNode } from "react";
import { ControlBar, StepList, type DemoControls } from "./controls";

const HeroText = createContext<ReactNode>(null);

/** The opening demo (first child) and the text beside it (the rest). */
export function DemoHero({ children }: { children: ReactNode }) {
  const [demo, ...text] = Children.toArray(children);
  return <HeroText value={text}>{demo}</HeroText>;
}

/**
 * Lays `stage` (the demo's element, with `className` for its margins) out with the hero's text
 * when it is inside a DemoHero; otherwise returns it as is, with `className`. `controls` lists
 * the steps beside a side-by-side demo, each one a button, with the previous/pause/next bar.
 */
export function HeroFrame({
  stage,
  controls,
}: {
  stage: (className: string) => ReactNode;
  controls?: DemoControls;
}) {
  const text = use(HeroText);
  if (text === null) return stage("not-prose my-6 first:mt-0");
  return (
    <div className="demo-hero my-6 first:mt-0" data-demo-hero="">
      <div className="demo-hero-row">
        <div className="demo-hero-stage">{stage("not-prose")}</div>
        <div className="demo-hero-text">
          {text}
          {controls && controls.captions.length > 0 && (
            // Only side by side (globals.css); stacked, the bar under the stage has the steps
            <div className="demo-hero-side-controls not-prose">
              <StepList controls={controls} />
              <ControlBar controls={controls} labelled />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
