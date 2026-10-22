// A screenshot of the bot's web dashboard (npm run capture), in the site's theme: both images are
// in the HTML and CSS shows the one for html.light / html.dark, so the static export never
// flashes the wrong one. Dark is the default (also before next-themes sets a class).
import shots from "@/content/dashboard-shots.generated.json";
import type { Rect } from "@/lib/camera";

export type DashboardShotData = {
  dark: string;
  light: string;
  /** The images' size in pixels (2x the CSS size they were taken at). */
  width: number;
  height: number;
  /** The elements a demo points at, as fractions of the image. */
  targets: Record<string, Rect>;
};

export const DASHBOARD_SHOTS: Readonly<Record<string, DashboardShotData>> = shots;

export function dashboardShot(id: string): DashboardShotData {
  const shot = DASHBOARD_SHOTS[id];
  if (!shot) throw new Error(`沒有後台截圖「${id}」（scripts/capture.config.mjs，npm run capture）`);
  return shot;
}

/** The element `name` of screenshot `id`, for the demo cursor and camera. */
export function shotTarget(id: string, name: string): Rect {
  const rect = dashboardShot(id).targets[name];
  if (!rect) throw new Error(`後台截圖「${id}」沒有目標「${name}」`);
  return rect;
}

export function DashboardShot({ id, alt = "", className }: { id: string; alt?: string; className?: string }) {
  const shot = dashboardShot(id);
  const common = { width: shot.width, height: shot.height, draggable: false, loading: "lazy", decoding: "async" } as const;
  return (
    <span className={`block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.dark} alt={alt} {...common} className="block h-auto w-full [.light_&]:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.light} alt={alt} {...common} className="hidden h-auto w-full [.light_&]:block" />
    </span>
  );
}
