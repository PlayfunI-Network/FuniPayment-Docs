"use client";
// The dashboard demos of 開始使用: logging in, then one demo per step of the setup wizard, over the
// screenshots of npm run capture. Every step list is a module-level constant (DemoStage replays
// when the array changes) and names only targets the phone pictures have too, so each demo also
// uses the phone shots under 600 px. The wizard shots are empty forms (nothing picked or typed),
// so the demos point at the fields instead of filling them.
import { DashboardDemo, type DashboardStep } from "@/components/demo";

// The camera never zooms: the pictures are taken in a 700 px window (the login page in 768, the
// welcome tour cut to its card), so their text already shows at about 11–13 px on the whole
// picture, on the 635 px wizard stage too (docs/zoom-fix/reports/recapture.md).

/** Log in with Discord, then the first card of the welcome tour. */
export const LOGIN_STEPS: DashboardStep[] = [
  { at: 0, caption: "打開後台，按「使用 Discord 登入」", target: "login" },
  { at: 1600, target: "login", click: true },
  { at: 1900, caption: "在 Discord 授權後，第一次登入會看到導覽", swapTo: "welcome", target: "tour" },
  { at: 4400, caption: "按「下一張」往下看，最後一張按「開始設定」", target: "next" },
  { at: 7200, caption: "不想看可以按右上角的「跳過」，直接去設定精靈", target: "skip" },
  { at: 10000, hideCursor: true },
];

/** Step 1: the four server states, the invite link and refresh, then the help. */
export const SETUP_1_STEPS: DashboardStep[] = [
  { at: 0, caption: "標「可設定」的伺服器才選得到", target: "stateAvailable" },
  { at: 2600, caption: "「已由你設定」的伺服器已經設定好，按「前往後台」", target: "openDashboard" },
  { at: 5000, caption: "「沒有管理權限」：你缺少「管理伺服器」權限", target: "noPermissionNote" },
  { at: 7600, caption: "伺服器不在清單上？先邀請機器人，再按「重新整理」", target: "invite" },
  { at: 9000, target: "refresh" },
  { at: 10400, caption: "打開「找不到我的伺服器？」看完整說明", target: "help" },
  { at: 11400, target: "help", click: true },
  { at: 11700, swapTo: "setup-1-help", target: "helpList" },
  { at: 14200, hideCursor: true },
];

/** Step 2: the two required fields, then 下一步. */
export const SETUP_2_STEPS: DashboardStep[] = [
  { at: 0, caption: "「管理員身分組」：選可以開單的身分組", target: "adminRole" },
  { at: 2800, caption: "「日誌頻道」：訂單和點數異動的紀錄都送到這裡", target: "logChannel" },
  { at: 5600, caption: "這兩項有「必填」，選好之後「下一步」才按得下去", target: "next" },
  { at: 8400, hideCursor: true },
];

/** Step 3: the SmilePay merchant data, field by field. */
export const SETUP_3_STEPS: DashboardStep[] = [
  { at: 0, caption: "照速買配後台的「基本資料管理」填「商家代號」", target: "storeNumber", typing: true },
  { at: 2600, caption: "再填「參數碼」和「檢查碼」", target: "paramCode", typing: true },
  { at: 4200, target: "verifyKey", typing: true },
  { at: 6000, caption: "「商家驗證參數（推薦）」建議也填上", target: "midParam", typing: true },
  { at: 8800, caption: "三個必填欄位都有值，按「下一步」", target: "next" },
  { at: 11400, hideCursor: true },
];

/** Step 4: the methods are on with the default fees; change nothing, go on. */
export const SETUP_4_STEPS: DashboardStep[] = [
  { at: 0, caption: "五種付款方式預設都開著，手續費也填好了", target: "bankTransfer" },
  { at: 2400, target: "storeBarcode" },
  { at: 3200, target: "ibon" },
  { at: 4000, target: "famiport" },
  { at: 4800, target: "hilife" },
  { at: 5800, caption: "不想開放的方式把開關關掉，不用改的話直接按「下一步」", target: "next" },
  { at: 8800, hideCursor: true },
];

/** Step 5: the summary, the terms, 建立. */
export const SETUP_5_STEPS: DashboardStep[] = [
  { at: 0, caption: "最後再看一次前面填的內容，要改就按該區的「修改」", target: "summary", hideCursor: true },
  { at: 3200, caption: "勾選「我已閱讀並同意服務條款與隱私權政策」", target: "agree" },
  { at: 4600, target: "agree", click: true },
  { at: 5800, caption: "按「建立」就設定完成了", target: "create" },
  { at: 7000, target: "create", click: true },
  { at: 9600, hideCursor: true },
];

export function LoginDemo() {
  return (
    <DashboardDemo
      shot="login"
      steps={LOGIN_STEPS}
      label="示範：在後台登入頁按「使用 Discord 登入」，授權後第一次登入看到導覽，按「下一張」往下看，或按「跳過」"
    />
  );
}

export function SetupServerDemo() {
  return (
    <DashboardDemo
      shot="setup-1"
      steps={SETUP_1_STEPS}
      label="示範：設定精靈第一步，只有標「可設定」的伺服器選得到；「已由你設定」的伺服器有「前往後台」，「沒有管理權限」的伺服器下面寫著原因；最後打開「找不到我的伺服器？」"
    />
  );
}

export function SetupChannelsDemo() {
  return (
    <DashboardDemo
      shot="setup-2"
      steps={SETUP_2_STEPS}
      label="示範：設定精靈第二步，選「管理員身分組」和「日誌頻道」這兩個必填欄位，再按「下一步」"
    />
  );
}

export function SetupSmilePayDemo() {
  return (
    <DashboardDemo
      shot="setup-3"
      steps={SETUP_3_STEPS}
      label="示範：設定精靈第三步，依序填入「商家代號」「參數碼」「檢查碼」和「商家驗證參數（推薦）」，再按「下一步」"
    />
  );
}

export function SetupPaymentDemo() {
  return (
    <DashboardDemo
      shot="setup-4"
      steps={SETUP_4_STEPS}
      label="示範：設定精靈第四步，五種付款方式預設都開啟並填好手續費，不用修改就按「下一步」"
    />
  );
}

export function SetupConfirmDemo() {
  return (
    <DashboardDemo
      shot="setup-5"
      steps={SETUP_5_STEPS}
      label="示範：設定精靈第五步，看過設定摘要，勾選同意服務條款與隱私權政策，再按「建立」"
    />
  );
}
