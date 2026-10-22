// Dev-only page for the dashboard screenshots (exists under `next dev` only, see next.config.mjs):
// every shot with its targets outlined, to check that the saved Rects line up with the images.
import { DASHBOARD_SHOTS, DashboardShot } from "@/components/demo";

export const metadata = { title: "後台截圖（開發用）", robots: { index: false } };

export default function ShotsDevPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">後台截圖與目標位置</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">紅框是 content/dashboard-shots.generated.json 記錄的目標位置。切換深色淺色，圖會跟著換。</p>
      {Object.entries(DASHBOARD_SHOTS).map(([id, shot]) => (
        <section key={id} className="mb-10" data-shot={id}>
          <h2 className="mb-2 font-mono text-sm">{id}</h2>
          <div className="relative overflow-hidden rounded-lg border border-[var(--line)]">
            <DashboardShot id={id} />
            {Object.entries(shot.targets).map(([name, r]) => (
              <div
                key={name}
                data-target={name}
                className="pointer-events-none absolute outline-2 outline-red-500 outline"
                style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
              >
                <span className="absolute -top-4 left-0 bg-red-500 px-1 font-mono text-[10px] leading-4 text-white">{name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
