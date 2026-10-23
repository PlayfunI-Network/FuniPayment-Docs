// Helpers the balance demos share: the slash commands' names and descriptions from COMMANDS
// (commands.json), and a step builder that carries the screen over like fp-demo's timeline.
import { canvasPoint, zoomTo, type CanvasArea, type CanvasLayout, type CanvasPoint, type DemoStep } from "@/components/demo";
import { COMMANDS } from "@/content/bot-ui.generated";
import type { CursorState } from "@/components/demo";
import type { Pane, SceneStep } from "./scene";

type Option = { name: string; nameZh: string; description: string };

/** A /balance subcommand: its full name ("balance show"), description and options. */
export function balanceCommand(sub: string) {
  const found = COMMANDS.balance.subcommands.find((s) => s.name === sub);
  if (!found) throw new Error(`commands.json 沒有 /balance ${sub}`);
  return { name: `balance ${found.name}`, description: found.description, options: found.options as readonly Option[] };
}

/** The Chinese name of an option, as Discord shows it in the zh-TW client. */
export function optionName(options: readonly Option[], name: string): string {
  const found = options.find((o) => o.name === name);
  if (!found) throw new Error(`沒有參數 ${name}`);
  return found.nameZh;
}

/**
 * Builds a demo's steps on one layout. `step(at, panes, rest)` adds a step showing `panes`
 * (the last ones when left out); `point` / `zoom` turn canvas px into cursor and camera values.
 */
export function stepper(l: CanvasLayout) {
  const out: SceneStep[] = [];
  let current: Pane[] = [];
  return {
    out,
    step(at: number, panes: Pane[] | null, rest: Omit<DemoStep, "at"> = {}) {
      if (panes) current = panes;
      out.push({ at, panes: current, ...rest });
    },
    point: (p: CanvasPoint, extra?: Partial<CursorState>) => canvasPoint(l, p, extra),
    zoom: (z: number, area: CanvasArea) => zoomTo(l, z, area),
  };
}

/** Types `text` one chunk at a time from `at`, every `every` ms; returns the time after the last. */
export function typeOut(chunks: string[], at: number, every: number, each: (typed: string, at: number) => void): number {
  chunks.forEach((typed, i) => each(typed, at + i * every));
  return at + chunks.length * every;
}
