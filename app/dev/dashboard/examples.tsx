"use client";
// One DashboardDemo per dashboard shot for the dev page: the cursor visits up to four of the
// shot's targets (zooming onto the second), then the camera pulls back. The steps are built
// once at module level, as DemoStage needs.
import { DASHBOARD_SHOTS, DashboardDemo, type DashboardStep } from "@/components/demo";

function exampleSteps(id: string): DashboardStep[] {
  const shot = DASHBOARD_SHOTS[id];
  // Targets the phone picture has too, so the example also plays on narrow screens
  const names = Object.keys(shot.targets).filter((n) => !shot.mobile || n in shot.mobile.targets).slice(0, 4);
  const steps: DashboardStep[] = names.map((name, i) => ({
    at: i * 1800,
    caption: `目標 ${name}`,
    target: name,
    ...(i === 1 && { zoom: 2 }),
    ...(i === 2 && { zoom: 1, click: true }),
  }));
  steps.push({ at: names.length * 1800, caption: "全景", zoom: 1, hideCursor: true });
  return steps;
}

const EXAMPLES: Readonly<Record<string, DashboardStep[]>> = Object.fromEntries(Object.keys(DASHBOARD_SHOTS).map((id) => [id, exampleSteps(id)]));

export function DashboardExamples() {
  return Object.entries(EXAMPLES).map(([id, steps]) => (
    <section key={id} className="mb-10" data-example={id}>
      <h2 className="mb-2 font-mono text-sm">{id}</h2>
      <DashboardDemo shot={id} steps={steps} label={`示範：後台截圖 ${id}`} />
    </section>
  ));
}
