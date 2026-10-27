# 回報：重拍後台截圖，拿掉後台示範的放大（recapture）

主 session 直接做完，分支 `zoom-fix/recapture`。

## 做了什麼

- `scripts/capture.config.mjs`：桌機截圖的視窗從 1280 改成 **700**（登入頁 768，保留 md 版面旁邊的功能清單；設定精靈也是 700）。後台在 1024 以下是真實的窄版面：上方工具列取代側邊欄，訂單和設定變更紀錄是卡片列表。商家頁面沒有 `md:` 樣式，所以 700 和 768 版面相同；選 700 是因為 11.5 px 的字在 678 px 舞台上剛好約 11 px。
- 側邊欄的目標（`SIDEBAR`）拿掉，沒有示範或頁面用到。訂單和設定變更紀錄的 `list`、`webRow` 等目標改成卡片版，桌機和手機共用（原本的 `mobileTargets`）。其他目標名稱都沒變。
- `npm run capture` 重拍全部 45 張（深淺色、桌機和手機），每張都在 200 KB 以下。
- 三個後台示範檔的放大全部拿掉，第一輪為手機另外寫的步驟清單也一起刪掉：`components/demos/dashboard/dashboard-demos.tsx`、`components/demos/getting-started/dashboard-demos.tsx`、`components/demos/balance/balance-settings-demo.tsx`。測試改成檢查「桌機和手機每一步都不放大」。
- 總覽示範的 caption「期間在右上角」改成「在「總覽」下面的期間列」，因為窄版面的期間列在標題下面。頁面內文描述的是寬螢幕後台（左邊的側邊欄、右上角），那仍然正確，所以沒改。
- `docs/WRITING.md`：後台截圖改寫成 700 寬，範例拿掉 zoom。

## 字的大小（全景，桌機舞台 680 px／精靈 635 px）

截圖 CSS 寬 700，所以縮放約 0.97（精靈約 0.91）：後台 12.5 px 的表單字約 12.1 px（精靈 11.3 px），11.5 px 的字約 11.1 px（精靈 10.4 px），最小的 11 px 說明字約 10.7 px。手機照舊 375 寬、縮放 0.91。

## 驗證

- `npm test`（427 通過）、`typecheck`、`lint`、`build`、`check:export`（26.02 MB）全部通過。
- 用 Playwright 開靜態 build，桌機 1280 和手機 375 兩種寬度，12 頁、16 個後台示範，每 1.6 秒讀一次鏡頭的縮放：全部都是 1，從頭到尾都沒有放大。截圖在主 session 的 scratchpad（沒有 commit）。

## 沒做的

- 第一輪回報提到的新目標（儲存列只框文字、`expiredName`、精靈摘要各區等）是為了讓放大不切到東西。現在不放大，就不需要了，所以沒加。
