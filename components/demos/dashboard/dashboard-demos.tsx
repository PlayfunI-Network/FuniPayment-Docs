"use client";
// The demos of the 網頁後台 pages, one per page, over the dashboard screenshots (npm run capture).
// Every step list is a module-level constant (DemoStage replays when the array changes) and only
// names targets the phone pictures have too, so each demo also uses the phone shots under 600 px.
//
// Zoom differs by picture. A desktop picture is 1280 px wide and shown about 680 px wide, so its
// 11.5–13 px text is 6–7 px on the whole picture: a step zooms (`zoom`) just enough for the text
// its caption names to reach about 12 px, but never so far that the thing it names leaves the
// frame, and keeps one zoom while the steps stay in one part of the page. A phone picture is 375 px
// wide and shown about 343 px wide, where that text is already 11–12 px: there a step only zooms
// (`phoneZoom`) when its text is smaller (docs/zoom-fix/reports/dashboard.md has the measurements).
import { useRef } from "react";
import { DashboardDemo, useWidth, type DashboardStep } from "@/components/demo";
import { NARROW_BELOW } from "@/components/demo/dashboard-demo-steps";

/** A step with the zoom it uses on the phone pictures (absent: none, the whole picture). */
type Step = DashboardStep & { phoneZoom?: number };

/**
 * The least zoom a phone stage shows: any zoom above 1 is raised 1.35 times there (NARROW_BOOST in
 * lib/camera.ts), so 11.5 px text becomes about 14 px.
 */
const PHONE_LEAST = 1.01;
/** On a full-width phone target the zoom stops where the target fills the stage (about 1.09). */
const PHONE_FILL = 1.1;

/** The steps for the desktop pictures. */
function desktop(steps: Step[]): DashboardStep[] {
  return steps.map((s) => {
    const step: Step = { ...s };
    delete step.phoneZoom;
    return step;
  });
}

/** The steps for the phone pictures: `phoneZoom` where a step sets one, otherwise the whole picture. */
function phone(steps: Step[]): DashboardStep[] {
  return desktop(steps).map((s, i) => {
    const zoom = steps[i].phoneZoom ?? (s.zoom === undefined ? undefined : 1);
    return zoom === undefined ? s : { ...s, zoom };
  });
}

type Steps = { desktop: DashboardStep[]; phone: DashboardStep[] };

const both = (steps: Step[]): Steps => ({ desktop: desktop(steps), phone: phone(steps) });

/** Overview: switch the period to 近 7 天, then the four main numbers, the busy hours. */
export const OVERVIEW = both([
  { at: 0, caption: "期間在右上角，點「近 7 天」", target: "period7d", zoom: 2, phoneZoom: PHONE_LEAST },
  { at: 1400, target: "period7d", click: true },
  { at: 1700, swapTo: "overview-7d", target: "period7d" },
  { at: 2800, caption: "四張卡是這段期間的主要指標，下面寫著比前一期多或少", target: "kpis", zoom: 1.25, phoneZoom: PHONE_FILL },
  { at: 5800, caption: "「熱門時段」看顧客通常在星期幾、幾點付款", target: "heatmap", zoom: 1.9 },
  { at: 8800, caption: "「最近訂單」裡顧客的名字只露出第一個字", target: "recentOrders", zoom: 1.9 },
  { at: 11600, zoom: 1, hideCursor: true },
]);

/** Orders: search, open the order, read the buyer data only the detail shows. */
export const ORDERS = both([
  { at: 0, caption: "在搜尋框輸入商店訂單編號，例如 SHOP-001", target: "search", zoom: 1.85, typing: true },
  { at: 1800, swapTo: "orders-search", target: "search", typing: true },
  { at: 3000, caption: "列表只剩這一筆，點它打開明細", target: "firstOrder", zoom: 1.85, phoneZoom: PHONE_LEAST },
  { at: 4200, target: "firstOrder", click: true },
  { at: 4500, caption: "明細才看得到買家完整的姓名、Email 和電話", swapTo: "order-detail", target: "customer", zoom: 1.9 },
  { at: 7600, caption: "時間軸列出建立訂單、完成付款和付款期限", target: "timeline", zoom: 1.25, phoneZoom: PHONE_FILL },
  { at: 10600, zoom: 1, hideCursor: true },
]);

/** 基本: pick a commands channel, save. */
export const BASIC = both([
  { at: 0, caption: "在「指令頻道」選一個頻道", target: "commandChannels", zoom: 1.75 },
  { at: 1600, target: "commandChannels", click: true },
  { at: 1900, caption: "下方出現未儲存的變更", swapTo: "settings-basic-edited", target: "changes", zoom: 1.45 },
  { at: 4200, caption: "按「儲存變更」", target: "save", zoom: 1.45 },
  { at: 5200, target: "save", click: true },
  { at: 5500, caption: "看到「已儲存」就完成了", swapTo: "settings-basic-saved", target: "saved", zoom: 1.45 },
  { at: 8200, zoom: 1, hideCursor: true },
]);

/** SmilePay: type the merchant verification parameter, save. */
export const SMILEPAY = both([
  { at: 0, caption: "在「商家驗證參數（推薦）」填入速買配後台的值，1 到 4 位數字", target: "midParam", zoom: 1.9, typing: true },
  { at: 1800, swapTo: "settings-smilepay-edited", target: "midParam", typing: true },
  { at: 3200, caption: "按「儲存變更」", target: "save", zoom: 1.9 },
  { at: 4200, target: "save", click: true },
  { at: 4500, caption: "存好後欄位清空，下面還是寫「目前：已設定」", swapTo: "settings-smilepay-saved", target: "midParam", zoom: 1.9, phoneZoom: PHONE_LEAST },
  { at: 7400, zoom: 1, hideCursor: true },
]);

/** 付款方式與手續費: turn one method off, change a fee, save. */
export const PAYMENT = both([
  { at: 0, caption: "每種付款方式一列：開關和手續費", target: "table", zoom: 1.2 },
  { at: 2000, caption: "關掉「萊爾富超商代碼」", target: "hilife", zoom: 1.2 },
  { at: 2900, target: "hilife", click: true },
  { at: 3200, swapTo: "settings-payment-edited" },
  { at: 4200, caption: "「銀行轉帳」的手續費從 13 改成 15", target: "bankTransferFee", zoom: 1.2, typing: true },
  { at: 5300, swapTo: "settings-payment-fee-edited", target: "bankTransferFee", typing: true },
  { at: 6400, caption: "按「儲存變更」", target: "save", zoom: 1.45 },
  { at: 7400, target: "save", click: true },
  { at: 7700, caption: "看到「已儲存」就完成了", swapTo: "settings-payment-fee-saved", target: "saved", zoom: 1.45 },
  { at: 10400, zoom: 1, hideCursor: true },
]);

/** 訂單頻道流程: turn on the rename for expired orders with a name, save. */
export const CHANNELS = both([
  { at: 0, caption: "打開「訂單過期時」的改名稱開關", target: "expiredRename", zoom: 1.45 },
  { at: 1600, target: "expiredRename", click: true },
  { at: 1900, caption: "填新名稱，例如 已過期｜<name:ticket->", swapTo: "settings-channels-edited", target: "expiredRename" },
  { at: 4400, caption: "按「儲存變更」", target: "save", zoom: 1.45 },
  { at: 5400, target: "save", click: true },
  { at: 5700, caption: "看到「已儲存」就完成了", swapTo: "settings-channels-saved", target: "saved", zoom: 1.45 },
  { at: 8400, zoom: 1, hideCursor: true },
]);

/** 點數系統: turn on top-ups, save. */
export const BALANCE = both([
  { at: 0, caption: "打開「儲值點數」", target: "topup", zoom: 1.4 },
  { at: 1600, target: "topup", click: true },
  { at: 1900, swapTo: "settings-balance-edited" },
  { at: 3000, caption: "按「儲存變更」", target: "save", zoom: 1.45 },
  { at: 4000, target: "save", click: true },
  { at: 4300, caption: "看到「已儲存」就完成了", swapTo: "settings-balance-saved", target: "saved", zoom: 1.45 },
  { at: 7000, zoom: 1, hideCursor: true },
]);

/** 設定變更紀錄: the four kinds of rows. */
export const HISTORY = both([
  { at: 0, caption: "在網頁上改的設定：原本是什麼、改成什麼都看得到", target: "webRow", zoom: 1.25, phoneZoom: PHONE_FILL },
  { at: 2800, caption: "檢查碼這類秘密欄位只寫「已變更（不顯示內容）」", target: "secretRow", zoom: 1.25, phoneZoom: PHONE_FILL },
  { at: 5600, caption: "系統自動關掉的付款方式，來源寫「系統」", target: "systemRow", zoom: 1.25, phoneZoom: PHONE_FILL },
  { at: 8400, caption: "第一筆是「建立設定」", target: "createdRow", zoom: 1.25, phoneZoom: PHONE_FILL },
  { at: 11000, zoom: 1, hideCursor: true },
]);

/** 功能說明: the two features, then the template variables. */
export const FEATURES = both([
  { at: 0, caption: "「自動發佈公告」列出目前啟用的頻道", target: "autoPublish", zoom: 1.85 },
  { at: 2600, caption: "「動態語音頻道改名」列出頻道和它的範本", target: "dynamicVc", zoom: 1.85 },
  { at: 5200, caption: "打開「可用的範本變數」", target: "variables", zoom: 1.85 },
  { at: 6400, target: "variables", click: true },
  // This picture is cut to 1056 px, so 1.5 here is as close as 1.85 on the others
  { at: 6700, caption: "每個變數後面寫著它代表什麼", swapTo: "features-variables-open", target: "varServerMembers", zoom: 1.5 },
  { at: 9600, zoom: 1, hideCursor: true },
]);

/** A DashboardDemo that plays `steps.phone` when DashboardDemo shows the phone pictures. */
function Demo({ shot, steps, label }: { shot: string; steps: Steps; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const narrow = width > 0 && width < NARROW_BELOW;
  return (
    <div ref={ref}>
      <DashboardDemo shot={shot} steps={narrow ? steps.phone : steps.desktop} label={label} />
    </div>
  );
}

export function OverviewDemo() {
  return <Demo shot="overview" steps={OVERVIEW} label="示範：在後台總覽把期間切到近 7 天，再看主要指標、熱門時段和最近訂單" />;
}

export function OrdersDemo() {
  return <Demo shot="orders" steps={ORDERS} label="示範：在訂單頁搜尋一筆訂單並打開明細" />;
}

export function BasicSettingsDemo() {
  return <Demo shot="settings-basic" steps={BASIC} label="示範：在基本分頁加上指令頻道並儲存" />;
}

export function SmilePaySettingsDemo() {
  return <Demo shot="settings-smilepay" steps={SMILEPAY} label="示範：在 SmilePay 分頁填入商家驗證參數並儲存" />;
}

export function PaymentSettingsDemo() {
  return <Demo shot="settings-payment" steps={PAYMENT} label="示範：關掉萊爾富超商代碼，把銀行轉帳的手續費改成 15 元後儲存" />;
}

export function ChannelsSettingsDemo() {
  return <Demo shot="settings-channels" steps={CHANNELS} label="示範：設定訂單過期時的頻道名稱並儲存" />;
}

export function BalanceSettingsDemo() {
  return <Demo shot="settings-balance" steps={BALANCE} label="示範：打開儲值點數並儲存" />;
}

export function SettingsHistoryDemo() {
  return <Demo shot="settings-history" steps={HISTORY} label="示範：設定變更紀錄裡的幾種紀錄" />;
}

export function FeaturesDemo() {
  return <Demo shot="features" steps={FEATURES} label="示範：功能說明頁的兩項功能和範本變數" />;
}
