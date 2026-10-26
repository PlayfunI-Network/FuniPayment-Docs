# 任務：後台章節的示範（dashboard）

先讀 `docs/zoom-fix/README.md` 的共同規則。

- 分支／worktree：`zoom-fix/dashboard`、`../FuniPayment-Docs-zoom-dashboard`
- dev server port：`3201`

## 範圍

`components/demos/dashboard/dashboard-demos.tsx` 裡的 9 個示範，每一步都檢查：

| 示範 | 頁面 |
|---|---|
| `OverviewDemo` | `/dashboard/overview` |
| `OrdersDemo` | `/dashboard/orders` |
| `BasicSettingsDemo` | `/dashboard/settings-basic` |
| `SmilePaySettingsDemo` | `/dashboard/settings-smilepay` |
| `PaymentSettingsDemo` | `/dashboard/settings-payment` |
| `ChannelsSettingsDemo` | `/dashboard/settings-channels` |
| `BalanceSettingsDemo` | `/dashboard/settings-balance`（`/balance/overview` 也有一個同名的，屬於 `others` 組，不用管） |
| `SettingsHistoryDemo` | `/dashboard/settings-history` |
| `FeaturesDemo` | `/dashboard/features` |

可以改的檔案：`components/demos/dashboard/`，必要時 `content/docs/dashboard/*.mdx`。

## 注意

- 這些示範用的是 1280 寬的後台截圖，桌機舞台上會縮小。按鈕（「儲存變更」）、開關、分頁、卡片的大字，全景通常就看得清楚，這類放大要拿掉；表格裡的小字才可能真的需要放大。一律量過再決定。
- 手機版用的是 375 寬的手機截圖，通常全景就夠清楚，手機上的放大特別要檢查。
- 截圖比舞台高時畫面會自動捲到目標，這不算放大，保留。
