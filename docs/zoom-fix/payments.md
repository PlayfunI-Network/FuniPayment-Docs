# 任務：收款章節的示範（payments）

先讀 `docs/zoom-fix/README.md` 的共同規則。

- 分支／worktree：`zoom-fix/payments`、`../FuniPayment-Docs-zoom-payments`
- dev server port：`3203`

## 範圍

`components/demos/payments/` 的 8 個示範：

| 示範 | 頁面 |
|---|---|
| `FpDemo` | `/payments/fp` |
| `ChannelAutomationDemo` | `/payments/channel-automation` |
| `ExpiryDemo` | `/payments/expiry` |
| `BuyerInfoDemo` | `/payments/buyer-info` |
| `PaymentCreateDemo` | `/payments/payment-create` |
| `PaymentHistoryDemo` | `/payments/payment-history` |
| `PaymentRecheckDemo`（含 `RecheckAllDemo`） | `/payments/payment-recheck` |
| `PaymentReviewDemo` | `/payments/payment-review`、`/buyers/check-order` |

可以改的檔案：`components/demos/payments/`、`components/demos/shared/`，必要時 `content/docs/payments/*.mdx`。

## 注意

- 這些是 Discord 畫布示範（寬版約 880 寬，桌機舞台上幾乎是原尺寸）。embed、按鈕、選單的字全景就看得清楚，`zoomTo(l, 1.3, …)` 這類放大幾乎都該拿掉。
- 窄版字太小時，修窄版畫布（做窄、去掉空白），不要靠放大。
- `components/demos/shared/` 也被 `getting-started` 組的 `FirstOrderDemo` 用到。改了共用畫面的大小或座標，要在 `/getting-started/first-order` 也截圖確認沒壞，並寫在回報裡。
