# 任務：點數、自動功能、顧客章節的示範（others）

先讀 `docs/zoom-fix/README.md` 的共同規則。

- 分支／worktree：`zoom-fix/others`、`../FuniPayment-Docs-zoom-others`
- dev server port：`3204`

## 範圍

| 示範 | 檔案 | 頁面 |
|---|---|---|
| `BalanceSettingsDemo` | `components/demos/balance/balance-settings-demo.tsx` | `/balance/overview` |
| `BalanceAddDemo` | `balance/balance-add-demo.tsx` | `/balance/balance-add-set` |
| `BalanceHistoryDemo` | `balance/balance-history-demo.tsx` | `/balance/balance-history` |
| `BalanceShowDemo` | `balance/balance-show-demo.tsx` | `/balance/balance-show` |
| `BalanceTransferDemo` | `balance/balance-transfer-demo.tsx` | `/balance/balance-transfer` |
| `PayWithBalanceDemo` | `balance/pay-with-balance-demo.tsx` | `/balance/pay-with-balance` |
| `TopUpDemo` | `balance/top-up-demo.tsx` | `/balance/top-up` |
| `AutoPublishDemo` | `components/demos/features/auto-publish-demo.tsx` | `/features/auto-publish` |
| `AutoReplyDemo` | `features/auto-reply-demo.tsx` | `/features/auto-reply` |
| `DynamicVcDemo` | `features/dynamic-vc-demo.tsx` | `/features/dynamic-vc-rename` |
| `AfterPayingDemo` | `components/demos/buyers/after-paying-demo.tsx` | `/buyers/after-paying` |

可以改的檔案：`components/demos/balance/`、`components/demos/features/`、`components/demos/buyers/`，必要時對應章節的 MDX。

## 注意

- 很多步驟寫的是 `shot: { zoom: 1 }`（全景），那不是問題；要找的是 `zoomTo(...)` 和 `zoom` 大於 1 的步驟，以及「放大後又拉回」的來回。
- `BalanceSettingsDemo` 是後台截圖示範（`zoom: 1.6` 對「儲存變更」），量過再決定。
