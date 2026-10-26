"use client";
// The dashboard's 點數系統 tab, changed one setting at a time: 點數轉帳 on, 用點數付款 and 點數排行榜
// off (星光遊戲社 has transfer off and the other two on), a new name, a balance admin role, then
// save. Each shot keeps the changes before it (capture.config.mjs settingsEdits). Starts on the
// tab itself: tabBalance has no phone target.
//
// Zoom differs by picture. The desktop picture is 1280 px wide on a stage about 680 px wide, so the
// form's 12.5 px labels are 6.6 px on the whole picture: every caption keeps one zoom, 1.4, and the
// camera only pans (a step re-aims only when it sets a zoom, so each caption sets it). Closer than
// that, the camera centres on a switch at the right end of its row and cuts the row's label off.
// The phone picture is 375 px wide on a stage about 343 px wide, where the same labels are already
// 11.4 px: there nothing zooms (docs/zoom-fix/reports/others.md has the measurements).
import { useRef } from "react";
import { DashboardDemo, useWidth, type DashboardStep } from "@/components/demo";
import { NARROW_BELOW } from "@/components/demo/dashboard-demo-steps";

/** The one zoom of the desktop steps. */
const DESKTOP_ZOOM = 1.4;

export const STEPS: DashboardStep[] = [
  { at: 0, caption: "打開「點數轉帳」，成員就能用 /balance transfer 互相轉點數", target: "transfer", zoom: DESKTOP_ZOOM },
  { at: 1000, target: "transfer", click: true },
  { at: 1300, swapTo: "settings-balance-transfer" },
  { at: 2200, caption: "關掉「用點數付款」，/fp 的選單就沒有點數選項", target: "payWithBalance", zoom: DESKTOP_ZOOM },
  { at: 3100, target: "payWithBalance", click: true },
  { at: 3400, swapTo: "settings-balance-pay" },
  { at: 4300, caption: "關掉「點數排行榜」，只剩點數管理員看得到排行榜", target: "leaderboard", zoom: DESKTOP_ZOOM },
  { at: 5200, target: "leaderboard", click: true },
  { at: 5500, swapTo: "settings-balance-leaderboard" },
  { at: 6400, caption: "點數名稱改成你的店的叫法，例如星光幣", target: "name", typing: true, zoom: DESKTOP_ZOOM },
  { at: 7400, swapTo: "settings-balance-name", target: "name", typing: true },
  { at: 8300, caption: "「點數管理員身分組」選誰可以幫人加點、扣點", target: "adminRoles", zoom: DESKTOP_ZOOM },
  { at: 9100, target: "adminRoles", click: true },
  { at: 9400, swapTo: "settings-balance-roles" },
  { at: 10300, caption: "按「儲存變更」", target: "save", zoom: DESKTOP_ZOOM },
  { at: 11100, target: "save", click: true },
  { at: 11400, caption: "看到「已儲存」就生效了", swapTo: "settings-balance-roles-saved", target: "saved", zoom: DESKTOP_ZOOM },
  { at: 13800, zoom: 1, hideCursor: true },
];

/** The same steps on the phone pictures: the whole picture throughout. */
export const PHONE_STEPS: DashboardStep[] = STEPS.map((s) => (s.zoom === undefined ? s : { ...s, zoom: 1 }));

export function BalanceSettingsDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const phone = width > 0 && width < NARROW_BELOW;
  return (
    <div ref={ref}>
      <DashboardDemo
        shot="settings-balance"
        steps={phone ? PHONE_STEPS : STEPS}
        label="示範：在後台點數系統分頁打開點數轉帳，關掉用點數付款和點數排行榜，把點數名稱改成星光幣，選一個點數管理員身分組，按儲存變更後看到已儲存"
      />
    </div>
  );
}
