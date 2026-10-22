// Dev-only page for DashboardDemo (exists under `next dev` only, see next.config.mjs): one example
// per dashboard shot. Narrow the window below 600px for the phone pictures; turn on reduced
// motion for the panorama with numbered markers.
import { DashboardExamples } from "./examples";

export const metadata = { title: "後台示範（開發用）", robots: { index: false } };

export default function DashboardDemoDevPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">後台示範</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">每張後台截圖一段示範：游標依序移到幾個目標，第二個放大。窄於 600px 用手機版截圖；開啟減少動態會改成全景加數字標號。</p>
      <DashboardExamples />
    </main>
  );
}
