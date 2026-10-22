# 任務：網頁後台

先讀 `docs/phase2/README.md` 的共同規則。

- 分支／worktree：`phase2/dashboard`，資料夾 `../FuniPayment-Docs-dashboard`
- dev server port：3304
- 你負責：`content/docs/dashboard/`、`components/demos/dashboard/`
- 回報：`docs/phase2/reports/dashboard.md`

來源：後台截圖（`npm run list:materials` 列出截圖 id 與目標元素）、bot `web/src`、`app/i18n/dashboard.py`、`app/services/{stats,orders,server_settings}.py`、`app/db/settings_schema.py`（設定欄位與驗證規則）、bot `CLAUDE.md` 的 Dashboard pages 段落。後台的字逐字照截圖。

## 頁面

| 頁面 | 重點 | 示範 |
|---|---|---|
| `overview` | 期間（今天到全部時間、自訂；日曆期間跟上一期比較、最近 24 小時是滾動計算、全部時間不比較）、各指標的意思、收款趨勢、付款方式表、熱門時段、顧客、最近訂單（遮罩）、新手檢查清單、資料範圍（遷移群組）、含不含手續費。 | 總覽 `DashboardDemo`：切期間 → 看指標 → 熱門時段 |
| `orders` | 篩選（搜尋、狀態、方式、類型、日期）、列表遮罩顧客資料、只有明細看得到、明細內容（顧客、發票、備註、時間軸）。 | 篩選 → 點一筆 → 明細 |
| `settings-basic` | 管理員身分組、可建立訂單的身分組、日誌頻道、指令頻道、開單分類，各自影響哪些指令。每個分頁各自儲存。 | 改一個欄位 → 儲存 |
| `settings-smilepay` | 三組參數與商家驗證參數（建議填，用來驗證付款回呼）。秘密欄位的顯示方式。只寫 bot 或後台說得出來的事。 | 填欄位（打字） |
| `settings-payment` | 每種方式的開關與手續費、7-11 與萊爾富超過 1000 加收、SmilePay -3003 時系統自動關閉該方式並私訊擁有者。 | 開關一種方式、改手續費 |
| `settings-channels` | 四種狀態的改名範本與移動分類、語法、停用。連到 `/payments/channel-automation`。 | 改範本 → 儲存 |
| `settings-balance` | 點數相關開關，連到 `/balance/overview`。 | 開關 |
| `settings-history` | 時間、版本、來源、操作者、欄位、前後值；秘密欄位只顯示「已變更」。 | 設定紀錄截圖 |
| `features` | 功能頁（唯讀）：自動發佈頻道、動態語音頻道範本與變數說明；要改請用 Discord 指令（連到其他功能章節）。 | 功能頁截圖 |

## 注意

- 停權中的伺服器設定是唯讀並顯示橫幅：在相關頁的常見狀況提一句即可，不寫停權的內部流程。
- 不寫 bot 擁有者的 `/admin` 頁面。
