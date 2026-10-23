# 任務：整合（共用元件、補素材、修正已合併的三章）

先讀 `docs/phase2/README.md` 的共同規則。**這份任務例外：可以改共用檔案**（`components/`、`lib/`、`scripts/`、`content/*.generated.*`、`public/demo/`、`docs/WRITING.md`、`package.json`），但**不能改** `content/docs/index.mdx`、`content/docs/getting-started/`、`content/docs/features/`、`content/docs/troubleshooting/`、`content/docs/reference/`、`components/demos/getting-started/`、`components/demos/features/`、`components/demos/reference/`（另外兩個 session 正在寫）。

- 分支／worktree：`phase2/consolidate`，資料夾 `../FuniPayment-Docs-consolidate`，從 `docs-v1` 開
- dev server port：3306；截圖用 `npm run capture` 的預設 port（8399／8398／3100）
- 回報：`docs/phase2/reports/consolidate.md`

背景：`phase2/payments`、`phase2/balance`、`phase2/dashboard` 已合併進 `docs-v1`。三份回報在 `docs/phase2/reports/{payments,balance,dashboard}.md`，審查結果整理在下面。每一項做完都要有測試或截圖證明。

## A. 共用元件

1. `components/discord/embed.tsx`：embed 標題要走 Discord markdown（`__底線__`、`**粗體**` 等）。現在「您總共消費了：__540 新台幣__」「您目前擁有：__60__ 商城點數」會原樣顯示底線符號。加測試。
2. 合併三章各自做的同類元件，放進共用、加測試，再把三章的示範改成用共用的、刪掉重複的：
   - 多參數的斜線指令輸入框：`components/demos/payments/kit.tsx` 的 `CommandInput` 與 `components/demos/balance/scene.tsx` 的 `SlashInput` → 擴充 `components/discord/slash-picker.tsx`（例如 `options` 陣列）。
   - Discord 視窗骨架（一或多個視窗、訊息靠下、上方淡出、寬窄版面）：payments 的 `Screen`、balance 的 `Scene`/`ChatDemo` → 共用一個。
   - 帶畫面狀態的步驟產生器：payments 的 `stepper`、balance 的 `timeline.ts`、`fp-demo.tsx` 的 `timeline` → 共用一個。
   - 機器人名稱與頭像常數 `BOT`（payments `kit.tsx`、dashboard `auto-disabled-dm.tsx` 各有一份）→ 放到 `lib/scenario.ts` 的 `DEMO_PEOPLE` 旁；做一個共用的「單則私訊／單則頻道訊息」靜態畫面元件。
   - payments 的 `OrderGallery`、`ReviewStates` 分頁按鈕 → 共用 `SnapshotTabs`。
   - `optionPill`／`paymentSub`（從 `COMMANDS` 取參數中文名稱）→ 共用。
   - 更新 `docs/WRITING.md` 的元件清單，讓之後的頁面用共用的。
3. `scripts/check-export.mjs`：整站上限改成 60 MB（目前 21.8 MB；Cloudflare 沒有整站上限，單檔 25 MB），每張圖仍 ≤ 200 KB，另外加每頁 HTML ≤ 500 KB 的檢查。同步更新 spec 第 4.5 D 節與 plan 的 Global Constraints 那一行。
4. `list:materials` 的測試在 Windows worktree 因為 CRLF 失敗：讓比對同時接受 `\r\n`。

## B. 補素材（`scripts/sync-bot-ui.config.mjs`、`scripts/capture.config.mjs`）

5. ui.json：`/payment history` 第 2 頁（含「▶️」翻頁後的按鈕）；`/payment recheck scan_all` 的最後一次進度（例如 12/12）與總結；`/balance history` 一般成員的多頁版本（第 1、2 頁、出現「去尾頁」的中間頁）。修 `/payment history` 統計表的手續費：現在顯示 140，但四筆訂單各 135，數值要跟情境一致。
6. 萊爾富教學連結：bot 原本是 `https://i.imgur.com/JK2TExl.png`，產生檔換成 `#`。把那張圖下載到 `public/demo/tutorials/`（≤ 200 KB，必要時縮小），連結改指向它。
7. 後台截圖：總覽切到 `?period=last_7d`（加目標 `period7d`）；付款方式分頁把「銀行轉帳 手續費」改成 15 的 edited／saved；速買配分頁的商家驗證參數改成 4 位數字（例如 `2468`）重拍 edited／saved；點數分頁依序切換「點數轉帳」「用點數付款」「點數排行榜」、輸入新的點數名稱、選點數管理員身分組的各狀態。全部深淺色、桌面與手機，用 label/role selector。

## C. 修正已合併的三章

8. dashboard：
   - `content/docs/dashboard/settings-balance.mdx:28` 刪掉「商城點數會換成點數名稱」的說明（`app/i18n/common.py:26` 是固定字串）。
   - `components/demos/dashboard/dashboard-demos.tsx` 的 `SMILEPAY_STEPS` 改用新截圖（4 位數字），caption 可以補「1 到 4 位數字」。
   - `settings-payment.mdx:72` 的 -3003 說明改用 bot／速買配原文（速買配：「商家未開啟此付款方式」；私訊：「尚未啟用此服務」）；示範與文字的付款方式例子統一。
   - 總覽示範第一步改成點 `period7d` 再 `swapTo`；付款方式示範加上改手續費。
9. balance：
   - `components/demos/balance/balance-settings-demo.tsx:9` caption 不能說「點數系統」是總開關（`app/bot/views/fp.py:152` 只看 `use_balance_to_pay`），跟 `overview.mdx` 的提醒一致。
   - `balance-history-demo.tsx:88`、`balance-show-demo.tsx:53` 的「公開顯示」改從 `COMMANDS` 的選項名稱取。
   - `balance-add-set.mdx:54` 欄位名稱是「增加理由」／「扣除理由」。
   - 歷史紀錄示範加上翻到第 2 頁；點數分頁示範改成真的切換各開關。
10. payments：
    - `content/docs/buyers/how-to-pay.mdx:8` 錯字「什麼時候前要付」。
    - `how-to-pay.mdx:46`、`check-order.mdx:30` 的「過期訂單不能再用」改成程式碼能證明的說法（訂單標成已過期，要付款請聯絡商家重新開單）。
    - `payments/channel-automation.mdx:69` 補一句：四種狀態都用 `前綴<name:…>` 的寫法；其中一種寫成純文字時，從那個狀態換到其他狀態的改名可能失敗。
    - `payment-create-demo.tsx` 的 caption「金額填 1200」改用情境的金額。
    - 歷史紀錄示範加上第 2 頁；recheck scan_all 示範接到最後的進度與總結；萊爾富教學連結用新的本地圖片。

## 完成條件

- 改過的文字都用 humanizer 跑過；bot 字逐字對來源。
- `npm test && npm run typecheck && npm run lint && npm run build && npm run check:export` 全過；`npm run sync:bot` 重跑沒有差異。
- 改過的示範在 1280／375、深淺色、減少動態都截圖看過。
- 回報照 README 的格式，另外列出：每一項（1–10）做了什麼、對應的 commit。
