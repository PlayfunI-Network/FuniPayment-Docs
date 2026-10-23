"use client";
// The dashboard's 點數系統 tab: what each switch is, then turning on 儲值點數 and saving (the
// edited shot has exactly that change). Starts on the tab itself: tabBalance has no phone target.
import { DashboardDemo, type DashboardStep } from "@/components/demo";

export const STEPS: DashboardStep[] = [
  // Zoom 1 while the switches are explained: closer in, the camera centres on the switch and
  // cuts its label off.
  { at: 0, caption: "「點數系統」是總開關，關掉時其他點數功能都不會運作", target: "enable", zoom: 1 },
  { at: 2200, caption: "「點數轉帳」開啟 /balance transfer", target: "transfer" },
  { at: 3600, caption: "「用點數付款」讓 /fp 的選單多一個點數選項", target: "payWithBalance" },
  { at: 5000, caption: "「點數排行榜」開放顧客看排行榜", target: "leaderboard" },
  { at: 6400, caption: "打開「儲值點數」，顧客就能用 /top-up", target: "topup" },
  { at: 7200, target: "topup", click: true },
  { at: 7500, swapTo: "settings-balance-edited" },
  { at: 8600, caption: "按「儲存變更」", target: "save", zoom: 1.6 },
  { at: 9400, target: "save", click: true },
  { at: 9700, caption: "看到「已儲存」就生效了", swapTo: "settings-balance-saved", target: "saved" },
  { at: 12000, zoom: 1, hideCursor: true },
];

export function BalanceSettingsDemo() {
  return (
    <DashboardDemo
      shot="settings-balance"
      steps={STEPS}
      label="示範：在後台點數系統分頁看過每個開關，打開儲值點數後按儲存變更，看到已儲存"
    />
  );
}
