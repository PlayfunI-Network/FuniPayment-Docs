# 任務：開始使用 + 首頁

先讀 `docs/phase2/README.md` 的共同規則。

- 分支／worktree：`phase2/getting-started`，資料夾 `../FuniPayment-Docs-getting-started`
- dev server port：3301
- 你負責：`content/docs/index.mdx`、`content/docs/getting-started/`、`components/demos/getting-started/`
- 回報：`docs/phase2/reports/getting-started.md`

這是新商家第一次接觸的章節，要讓人照著做就能從零設定好、開出第一張單。主線順序不要改。

## 頁面

| 頁面 | 要寫什麼 | 示範 |
|---|---|---|
| `index` 首頁 | FunI 付款系統是什麼、能做什麼（開單、收款通知、點數、後台統計）、從哪裡開始（連到開始之前）。短。 | 一段總覽：/fp 開單 → 顧客付款 → 付款完成通知（重用 `SCENARIOS` 與現有元件） |
| `before-you-start` | 需要：一個你有管理權限的 Discord 伺服器、速買配（SmilePay）商家帳號與後台要填的參數（看 bot `web/src` 設定精靈的速買配步驟與 `app/i18n/dashboard.py`）。任何人都能自己開通，不需要申請（v1.0.0 已移除邀請制，見 bot `docs/database/upgrade-v0.8.0-to-v1.0.0.md`）。 | 不需要，或一張後台 welcome 截圖 |
| `invite` | 邀請機器人（連結；權限不要取消勾選，權限值見 bot `app/services/dashboard_links.py` 的 `BOT_PERMISSIONS`）、加入後在系統頻道與擁有者私訊收到的歡迎訊息（`guide/welcome/*`）。 | 歡迎訊息出現在頻道與私訊，游標點「開始設定」 |
| `login` | 用 Discord 登入後台（只要 identify 權限）、第一次會看到導覽頁 `/welcome`、之後去哪裡。 | welcome 截圖的 `DashboardDemo` |
| `setup-wizard` | 五步精靈，每一步一段示範：選伺服器（四種狀態：可設定／已由你設定／已由其他人設定／沒有管理權限，以及沒看到伺服器時的邀請機器人、重新整理）、管理員身分組與頻道、速買配參數（商家驗證參數建議填）、付款方式與預設手續費、確認與條款。每日建立上限。文字照後台實際字。 | `setup-1` 到 `setup-5` 截圖各一段 `DashboardDemo` |
| `first-order` | 開第一張單：推薦 /fp，簡短帶過步驟並連到 `/payments/fp`；可以先開一筆小額訂單試試。 | 可重用 fp 示範的前半段，不要整段複製 |
| `get-paid` | 顧客付款後：付款完成通知出現在三個地方（訂單頻道、顧客私訊、日誌頻道；私訊關閉時略過、沒設日誌頻道就不送）、頻道改名與移動、去後台看訂單。 | 付款完成通知（`builder/payment_complete`）加頻道列表移到已付款 |

## 注意

- 這一章語氣最友善、最具體，每一步寫你會看到什麼、要按哪裡。
- 後台的字逐字照截圖；精靈每一步的欄位名稱以截圖為準。
