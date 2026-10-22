// A screenshot of the bot's web dashboard (npm run capture), in the site's theme: both images are
// in the HTML and CSS shows the one for html.light / html.dark, so the static export never
// flashes the wrong one. Dark is the default (also before next-themes sets a class).
// Every shot has a desktop picture and usually a phone one (`mobile`), with the same targets
// except the desktop-only ones (the sidebar and the like, scripts/capture.config.mjs).
import shots from "@/content/dashboard-shots.generated.json";
import type { Rect } from "@/lib/camera";

/** One picture of a shot: both themes' images and where its targets are. */
export type DashboardPicture = {
  dark: string;
  light: string;
  /** The images' size in pixels (2x the CSS size they were taken at). */
  width: number;
  height: number;
  /** The elements a demo points at, as fractions of the image. */
  targets: Record<string, Rect>;
};

/** A shot: its desktop picture, plus the phone picture when one was taken. */
export type DashboardShotData = DashboardPicture & { mobile?: DashboardPicture };

/** Which picture of a shot: the desktop window or the phone (375px). */
export type DashboardLayout = "desktop" | "mobile";

export const DASHBOARD_SHOTS: Readonly<Record<string, DashboardShotData>> = shots;

export function dashboardShot(id: string): DashboardShotData {
  const shot = DASHBOARD_SHOTS[id];
  if (!shot) throw new Error(`沒有後台截圖「${id}」（scripts/capture.config.mjs，npm run capture）`);
  return shot;
}

/** The desktop or phone picture of shot `id`. */
export function dashboardPicture(id: string, layout: DashboardLayout = "desktop"): DashboardPicture {
  const shot = dashboardShot(id);
  if (layout === "desktop") return shot;
  if (!shot.mobile) throw new Error(`後台截圖「${id}」沒有手機版`);
  return shot.mobile;
}

/** The element `name` of screenshot `id`, for the demo cursor and camera. */
export function shotTarget(id: string, name: string, layout: DashboardLayout = "desktop"): Rect {
  const rect = dashboardPicture(id, layout).targets[name];
  if (!rect) throw new Error(`後台截圖「${id}」${layout === "mobile" ? "的手機版" : ""}沒有目標「${name}」`);
  return rect;
}

/**
 * The screenshot as an image in the page's flow (full width, its own height). `alt` is empty by
 * default: inside a demo the stage describes the whole picture; a screenshot shown on its own in a
 * page needs an `alt`. `eager` loads it right away (a demo that swaps to it later).
 */
export function DashboardShot({
  id,
  layout = "desktop",
  alt = "",
  className,
  eager = false,
}: {
  id: string;
  layout?: DashboardLayout;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const picture = dashboardPicture(id, layout);
  const common = { width: picture.width, height: picture.height, draggable: false, loading: eager ? "eager" : "lazy", decoding: "async" } as const;
  return (
    <span className={`block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={picture.dark} alt={alt} {...common} className="block h-auto w-full [.light_&]:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={picture.light} alt={alt} {...common} className="hidden h-auto w-full [.light_&]:block" />
    </span>
  );
}
