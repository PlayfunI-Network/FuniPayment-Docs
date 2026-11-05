"use client";
// The dashboard's 點數系統 tab, changed one setting at a time: 點數轉帳 on, 用點數付款 and 點數排行榜
// off (星光遊戲社 has transfer off and the other two on), a new name, a balance admin role, then
// save. Each shot keeps the changes before it (capture.config.mjs settingsEdits). Starts on the
// tab itself: tabBalance has no phone target.
//
// The camera (DashboardStep `view`): each demo starts on the whole page, comes close (the page as
// wide as the stage, how it reads in a browser) for the fields, and pulls back to the whole page
// before 儲存變更 or another button that sends or moves on, so the reader sees what is pressed and
// what comes next. The pictures are taken in a 700 px window (375 on phones), so close up the
// dashboard's 11.5–13 px text shows at 11–12 px.
import { DashboardDemo, type DashboardStep } from "@/components/demo";

export const STEPS: DashboardStep[] = [
  { at: 0, caption: "打開「點數轉帳」，成員就能用 /balance transfer 互相轉點數", target: "transfer" },
  { at: 1000, view: "close" },
  { at: 2000, target: "transfer", click: true },
  { at: 2300, swapTo: "settings-balance-transfer" },
  { at: 3100, caption: "關掉「用點數付款」，/fp 的選單就沒有點數選項", target: "payWithBalance" },
  { at: 3900, target: "payWithBalance", click: true },
  { at: 4200, swapTo: "settings-balance-pay" },
  { at: 5000, caption: "關掉「點數排行榜」，只剩點數管理員看得到排行榜", target: "leaderboard" },
  { at: 5800, target: "leaderboard", click: true },
  { at: 6100, swapTo: "settings-balance-leaderboard" },
  { at: 6900, caption: "點數名稱改成你的店的叫法，例如星光幣", target: "name", typing: true },
  { at: 7900, swapTo: "settings-balance-name", target: "name", typing: true },
  { at: 8700, caption: "「點數管理員身分組」選誰可以幫人加點、扣點", target: "adminRoles" },
  { at: 9500, target: "adminRoles", click: true },
  { at: 9800, swapTo: "settings-balance-roles" },
  { at: 10600, caption: "按「儲存變更」", target: "save", view: "whole" },
  { at: 11700, target: "save", click: true },
  { at: 12000, caption: "看到「已儲存」就生效了", swapTo: "settings-balance-roles-saved", target: "saved" },
  { at: 14000, hideCursor: true },
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
