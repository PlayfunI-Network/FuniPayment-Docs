"use client";
// The screens for page.dev.tsx (a client module: LAYOUTS lives in a client file, so a server
// component would only see a reference to it).
import { FpScreen, LAYOUTS, type Screen } from "@/components/demos/shared/fp-screen";

const SCREENS: Screen[] = [
  { input: { kind: "typing", typed: "/fp" }, bot: "none", channel: "open" },
  { input: { kind: "options", options: [{ name: "金額", value: "500" }] }, bot: "none", channel: "open" },
  { input: { kind: "empty" }, bot: "select", channel: "selecting" },
  { input: { kind: "empty" }, bot: "menuPick", channel: "selecting" },
  { input: { kind: "empty" }, bot: "confirm", channel: "selecting" },
  { input: { kind: "empty" }, bot: "buyer", channel: "selecting" },
  { input: { kind: "empty" }, bot: "order", channel: "pending" },
];

export function FpScreens() {
  return (
    <main className="flex flex-col gap-8 p-6">
      {Object.entries(LAYOUTS).map(([name, layout]) =>
        SCREENS.map((s, i) => (
          <div
            key={`${name}-${i}`}
            data-layout={name}
            data-left={layout.left}
            data-screen={s.bot}
            data-input={s.input.kind}
            className="relative shrink-0"
            style={{ width: layout.w, height: layout.h }}
          >
            <FpScreen screen={s} layout={layout} />
          </div>
        )),
      )}
    </main>
  );
}
