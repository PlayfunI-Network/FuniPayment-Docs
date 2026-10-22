# 任務：其他功能 + 疑難排解 + 參考

先讀 `docs/phase2/README.md` 的共同規則。

- 分支／worktree：`phase2/reference`，資料夾 `../FuniPayment-Docs-reference`
- dev server port：3305
- 你負責：`content/docs/features/`、`content/docs/troubleshooting/`、`content/docs/reference/`、`components/demos/features/`、`components/demos/reference/`
- 回報：`docs/phase2/reports/reference.md`

## 頁面

| 頁面 | 重點（來源） | 示範 |
|---|---|---|
| `features/auto-publish` | 需要管理頻道權限、只能用在公告頻道、開關切換的回覆、之後頻道裡每則訊息自動發佈（`app/bot/cogs/auto_publisher.py`）。 | 指令 → 回覆 → 新訊息已發佈 |
| `features/dynamic-vc-rename` | 參數、輸入 delete 停止、每 10 分鐘更新與改名次數限制、**全部變數表**（每個變數一列，照 `app/bot/cogs/dynamic_vc_rename.py` 與後台功能頁的中文說明）、頻道不見時私訊擁有者並移除設定。 | 指令 → 語音頻道名稱變成數字 |
| `features/dashboard-command` | /dashboard（需要管理伺服器權限、只有自己看得到、未設定時多一個「開始設定」）、/settings 只回前往網頁後台的按鈕。 | 兩個指令的回覆 |
| `features/auto-reply` | 私訊出現觸發詞或在頻道提及機器人時的自動回覆（觸發詞照 bot 原始碼）。 | 私訊 → 自動回覆 |
| `troubleshooting/command-errors` | 每一種拒絕訊息一節：不在允許的頻道、沒有身分組、伺服器還沒設定、付款方式已關閉、伺服器停權、點數未開啟等（`app/bot/checks.py`、各 cog）。每節寫你會看到什麼（ui.json 原文）、為什麼、怎麼處理。 | 每節一個靜態 embed，不需要動畫 |
| `troubleshooting/smilepay-errors` | 速買配錯誤代碼表（`smilepay/error_descriptions` 原文），加上常見幾個的處理方式（-3003 系統自動關閉付款方式）。 | 不需要 |
| `troubleshooting/faq` | 只放真的常被問的問題（設定、付款、通知、點數），每題連到詳細頁。 | 不需要 |
| `reference/commands` | 指令總表，用元件讀 `content/bot-ui.generated.ts` 的 `COMMANDS` 產生，不手打：指令、中文名稱、說明、參數、誰可以用。 | 表格 |
| `reference/permissions` | 誰可以用什麼：管理員身分組、可建立訂單的身分組、點數管理員身分組、Discord 權限（管理頻道、管理伺服器）對照每個指令（`app/bot/checks.py`、`commands.json` 的 default_member_permissions）。 | 表格 |
| `reference/fees` | 預設手續費（銀行轉帳 13、四大超商條碼 25、7-11 30、全家 35、萊爾富 30）、7-11 與萊爾富在金額加手續費超過 1000 時再加 5、商家可在後台改（`lib/fees.mjs`、`app/services/fees.py`）、手續費由誰付（照 bot 實際行為寫）。 | 可選：小計算器（輸入金額與方式算出總額，用 `calculateFee`） |

## 注意

- 這份最好排在其他章節之後做，方便連結其他頁；不需要等它們合併，連結用固定的頁面路徑。
