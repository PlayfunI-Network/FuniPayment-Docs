# 任務：點數

先讀 `docs/phase2/README.md` 的共同規則。

- 分支／worktree：`phase2/balance`，資料夾 `../FuniPayment-Docs-balance`
- dev server port：3303
- 你負責：`content/docs/balance/`、`components/demos/balance/`
- 回報：`docs/phase2/reports/balance.md`

來源：bot `app/bot/cogs/{balance,topup}.py`、`app/bot/views/{balance,topup,fp}.py`、`app/i18n/{balance,topup,records}.py`、`app/services/{balance,topup}.py`、`tests/snapshots/commands.json`、後台點數分頁截圖。點數名稱由商家自訂（預設「商城點數」），頁面要說明畫面上的點數名稱會換成商家設定的名稱。

## 頁面

| 頁面 | 重點 | 示範 |
|---|---|---|
| `overview` | 點數系統是什麼、在後台點數分頁開啟（點數系統、點數轉帳、用點數付款、儲值點數、點數排行榜、點數管理員身分組、點數名稱）、哪些指令受哪個開關控制。 | 後台點數分頁 `DashboardDemo`，依序點開關 |
| `balance-show` | mode、查別人要點數管理員身分組。 | /balance show → 藍色 embed |
| `balance-transfer` | 需要開啟點數轉帳、確認畫面、雙方私訊、日誌紀錄。 | 轉帳確認 → 按確認 → 雙方通知 |
| `balance-history` | 每頁 5 筆、第 0 頁統計、排行榜（需開啟，管理員例外）、按鈕。 | 翻頁 → 統計 → 排行榜 |
| `balance-add-set` | 點數管理員身分組、add 可以是負數（扣除）、set、結果 embed 與對方私訊。 | add → 結果 → 對方私訊 |
| `top-up` | 需要開啟點數與儲值、整個流程只有自己看得到、選數量 → 確認 → 建立付款 → 訂單 embed、10 分鐘逾時、付款後的私訊與日誌。 | 完整流程 |
| `pay-with-balance` | /fp 選單裡的點數選項（只在開啟時出現、手續費 0）、確認並支付、消費通知。 | /fp 選點數 → 消費通知 |
