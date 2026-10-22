# 任務：收款 + 給顧客

先讀 `docs/phase2/README.md` 的共同規則。

- 分支／worktree：`phase2/payments`，資料夾 `../FuniPayment-Docs-payments`
- dev server port：3302
- 你負責：`content/docs/payments/`（`fp.mdx` 已完成，不要改）、`content/docs/buyers/`、`components/demos/payments/`（`fp-demo.tsx` 不要改）、`components/demos/buyers/`
- 回報：`docs/phase2/reports/payments.md`

來源：bot `app/bot/cogs/payment.py`、`app/bot/views/payment.py`、`app/bot/views/consumer_info.py`、`app/i18n/{payment,consumer_info}.py`、`app/services/{payments,payment_completion,maintenance}.py`、`tests/snapshots/commands.json`。

## 頁面

| 頁面 | 重點 | 示範 |
|---|---|---|
| `payments/payment-create` | 參數（method 必填五種、amount、buyer/mail/phone/comment/invoice_number/invoice_title 選填、designated 限管理員）、頻道限制、可建立訂單的身分組、三類付款方式的訂單 embed 差異（銀行帳號／超商代碼與教學連結／條碼圖）、失敗時的 embed。 | 輸入指令 → 購買人資訊確認 → 訂單 embed；其他方式用靜態 embed 並排或切換 |
| `payments/buyer-info` | 購買人資訊確認畫面、「填寫/修改資訊」Modal 三欄、三欄都填才能按「確認並獲取付款碼」、資料依使用者與伺服器記住、實名規定（照 bot 原文）。 | Modal 填寫 → 確認畫面變成已填 |
| `payments/payment-review` | 不給編號時找哪一筆、只能查自己的（管理員例外）、三種狀態。 | 查詢 → 黃色 embed，狀態切換 |
| `payments/payment-history` | mode 公開／僅自己、每頁 3 筆、按鈕、第 0 頁統計表、user 限管理員。 | 翻頁 → 統計表 |
| `payments/payment-recheck` | 管理員；查頻道最後一筆待付款；scan_all 與進度訊息；完成效果跟 SmilePay 回呼一樣。 | 單筆 recheck → 付款完成；scan_all 進度 |
| `payments/channel-automation` | 四種狀態（選擇中／待付款／已付款／已過期）的改名範本與 `<name:remove>` 語法、停用、移動分類、只對開單分類裡的頻道、每頻道 10 分鐘 2 次的改名限制（bot 自己的限制）。設定在後台頻道分頁（連到 `/dashboard/settings-channels`）。bot 沒有預設名稱，示範用的名稱是舉例。 | 頻道列表依狀態改名、移動 |
| `payments/expiry` | 每天 00:01 把逾期訂單標成已過期、頻道改名移動、/fp 選單 24 小時後失效的訊息。 | 過期 embed 加頻道移動 |
| `buyers/how-to-pay` | 給顧客看：銀行轉帳、四大超商條碼、7-11／全家／萊爾富代碼各怎麼付（教學連結照 bot）、付款期限。用顧客懂的話。 | 每種方式的訂單 embed（靜態或切換） |
| `buyers/after-paying` | 付完之後在哪裡收到通知、沒收到怎麼辦（請商家用 /payment recheck）。顯示時間以 SmilePay 回呼為準，不寫沒根據的時間。 | 付款完成通知出現在私訊 |
| `buyers/check-order` | 顧客用 /payment review、/payment history 查自己的訂單。 | 重用 review 的示範元件 |

## 注意

- 情境沿用 `components/demos/scenarios.ts`；條碼圖只有固定幾個總額有圖，選有圖的情境。
- 給顧客的三頁，讀者是付款的人，不懂機器人設定；不要出現管理員用語。
