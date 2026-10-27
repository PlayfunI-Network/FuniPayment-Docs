"use client";
// The dashboard's 點數系統 tab, changed one setting at a time: 點數轉帳 on, 用點數付款 and 點數排行榜
// off (星光遊戲社 has transfer off and the other two on), a new name, a balance admin role, then
// save. Each shot keeps the changes before it (capture.config.mjs settingsEdits). Starts on the
// tab itself: tabBalance has no phone target.
//
// The camera never zooms: the pictures are taken in a 700 px window (375 on phones), so the form's
// 12.5 px labels already show at about 12 px on the whole picture.
import { DashboardDemo, type DashboardStep } from "@/components/demo";

export const STEPS: DashboardStep[] = [
  { at: 0, caption: "打開「點數轉帳」，成員就能用 /balance transfer 互相轉點數", target: "transfer" },
  { at: 1000, target: "transfer", click: true },
  { at: 1300, swapTo: "settings-balance-transfer" },
  { at: 2200, caption: "關掉「用點數付款」，/fp 的選單就沒有點數選項", target: "payWithBalance" },
  { at: 3100, target: "payWithBalance", click: true },
  { at: 3400, swapTo: "settings-balance-pay" },
  { at: 4300, caption: "關掉「點數排行榜」，只剩點數管理員看得到排行榜", target: "leaderboard" },
  { at: 5200, target: "leaderboard", click: true },
  { at: 5500, swapTo: "settings-balance-leaderboard" },
  { at: 6400, caption: "點數名稱改成你的店的叫法，例如星光幣", target: "name", typing: true },
  { at: 7400, swapTo: "settings-balance-name", target: "name", typing: true },
  { at: 8300, caption: "「點數管理員身分組」選誰可以幫人加點、扣點", target: "adminRoles" },
  { at: 9100, target: "adminRoles", click: true },
  { at: 9400, swapTo: "settings-balance-roles" },
  { at: 10300, caption: "按「儲存變更」", target: "save" },
  { at: 11100, target: "save", click: true },
  { at: 11400, caption: "看到「已儲存」就生效了", swapTo: "settings-balance-roles-saved", target: "saved" },
  { at: 13800, hideCursor: true },
];

export function BalanceSettingsDemo() {
  return (
    <DashboardDemo
      shot="settings-balance"
      steps={STEPS}
      label="示範：在後台點數系統分頁打開點數轉帳，關掉用點數付款和點數排行榜，把點數名稱改成星光幣，選一個點數管理員身分組，按儲存變更後看到已儲存"
    />
  );
}
