# 任務：首頁與開始使用章節的示範（getting-started）

先讀 `docs/zoom-fix/README.md` 的共同規則。

- 分支／worktree：`zoom-fix/getting-started`、`../FuniPayment-Docs-zoom-getting-started`
- dev server port：`3202`

## 範圍

| 示範 | 檔案 | 頁面 |
|---|---|---|
| `HomeDemo` | `components/demos/getting-started/home-demo.tsx` | `/`（首頁） |
| `WelcomeDemo` | `welcome-demo.tsx` | `/getting-started/invite` |
| `LoginDemo` | `dashboard-demos.tsx` | `/getting-started/login` |
| `SetupServerDemo`、`SetupChannelsDemo`、`SetupSmilePayDemo`、`SetupPaymentDemo`、`SetupConfirmDemo` | `dashboard-demos.tsx` | `/getting-started/setup-wizard` |
| `GetPaidDemo` | `get-paid-demo.tsx` | `/getting-started/get-paid` |
| `FirstOrderDemo` | `first-order-demo.tsx` | `/getting-started/first-order` |

可以改的檔案：`components/demos/getting-started/`，必要時 `content/docs/getting-started/*.mdx`、`content/docs/index.mdx`。

## 注意

- `FirstOrderDemo` 用到 `components/demos/shared/` 的 fp 和頻道自動化畫面，那個資料夾屬於 `payments` 組。你只改 `first-order-demo.tsx` 裡的鏡頭（`shot`）；如果要改共用畫面的版面才能不放大，寫在回報裡，不要自己改。
- `LoginDemo` 和精靈的五個示範是 1280 寬的後台截圖：大按鈕（「使用 Discord 登入」、「下一張」、「跳過」）全景通常就看得清楚，量過再決定。
