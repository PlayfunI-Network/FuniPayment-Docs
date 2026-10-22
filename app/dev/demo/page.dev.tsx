// Dev-only page for the demo camera and cursor (exists under `next dev` only, see next.config.mjs).
import { SampleDemo } from "./sample-demo";

export const metadata = { title: "Demo 鏡頭（開發用）", robots: { index: false } };

export default function DemoDevPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Demo 鏡頭與游標</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">游標移到按鈕、鏡頭放大、點擊、拉回全景，循環播放。</p>
      <SampleDemo />
    </main>
  );
}
