// Dev-only: every screen of the /fp demo at canvas size, unscaled, for measuring where the
// camera and cursor aim (components/demos/payments/fp-demo.tsx, AT).
import { FpScreen, type Screen } from "@/components/demos/payments/fp-demo";

export const metadata = { title: "/fp demo 畫面（開發用）", robots: { index: false } };

const SCREENS: Screen[] = [
  { input: { kind: "command", typed: "/fp" }, bot: "none", channel: "open" },
  { input: { kind: "option", value: "500" }, bot: "none", channel: "open" },
  { input: { kind: "empty" }, bot: "select", channel: "selecting" },
  { input: { kind: "empty" }, bot: "menuPick", channel: "selecting" },
  { input: { kind: "empty" }, bot: "confirm", channel: "selecting" },
  { input: { kind: "empty" }, bot: "buyer", channel: "selecting" },
  { input: { kind: "empty" }, bot: "order", channel: "pending" },
];

export default function FpScreens() {
  return (
    <main className="flex flex-col gap-8 p-6">
      {SCREENS.map((s, i) => (
        <div key={i} data-screen={s.bot} data-input={s.input.kind} className="relative" style={{ width: 880, height: 740 }}>
          <FpScreen screen={s} wide />
        </div>
      ))}
    </main>
  );
}
