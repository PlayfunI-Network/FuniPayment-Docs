# 任務：收尾（其他功能／疑難排解／參考的修正 + 最後幾個共用元件）

先讀 `docs/phase2/README.md` 的共同規則。**這份任務例外：可以改共用檔案**（`components/`、`lib/`、`scripts/`、`content/*.generated.*`、`public/demo/`、`docs/WRITING.md`），也可以改 `content/docs/{features,troubleshooting,reference}/` 與 `components/demos/{features,reference}/`。**不能改** `content/docs/index.mdx`、`content/docs/getting-started/`、`components/demos/getting-started/`（另一個 session 可能還在寫）。

- 分支／worktree：`phase2/polish`，資料夾 `../FuniPayment-Docs-polish`，從 `docs-v1` 開
- dev server port：3308
- 回報：`docs/phase2/reports/polish.md`

背景：五章裡已經有四章合併進 `docs-v1`（收款、點數、網頁後台、其他功能＋參考），整合任務也合併了。下面是「其他功能＋參考」的審查結果，以及它回報裡建議收進共用的元件。

## A. 修正（來源：bot `C:\Users\LD\PycharmProjects\FuniPayment`，只能讀）

1. `content/docs/troubleshooting/command-errors.mdx`：每一節的拒絕訊息現在只出現在圖裡，讀者沒辦法用搜尋找到。每節在文字裡用「」逐字引用那句話（從 `content/bot-ui.generated.ts` 取，不手打），讓搜尋找得到。
2. 同一頁「其他回覆」表格：
   - 「您只能查詢自己的餘額喔！」與「…付款紀錄喔！」漏了第二行「此功能目前僅管理員可以使用」，補上。
   - 補 /top-up 的「儲值金額必須大於 0！」。
   - 私訊那一節：/balance 指令先跑 `check_balance_enabled` 再跑 `check_channel`，在私訊裡會先回「伺服器還沒設定」的那句。把「在私訊使用會看到…」限定在付款指令，/balance 另外說明。
3. `content/docs/features/auto-publish.mdx`：「每一則新訊息都會發佈」說得太滿。提及機器人的訊息、互動產生的訊息（Discord 錯誤 50068）不會發佈，照 `app/bot/cogs/auto_publisher.py` 的實際行為寫。
4. `content/docs/reference/fees.mdx`：預設手續費的標籤要跟選單實際文字一致（例如「四大超商條碼（+25元）」），從產生檔取。
5. `content/docs/troubleshooting/smilepay-errors.mdx`：-4002、-4005 補上處理方式（只寫 bot 或速買配錯誤說明能支持的內容；不確定就寫「請聯絡速買配客服並提供錯誤代碼」）。
6. `content/docs/features/dynamic-vc-rename.mdx` 的 `%online_members%`：確認 bot 有沒有開 presences intent（`app/bot/client.py` 的 intents）。沒有的話，這個變數會一直是 0，在變數表旁加一句說明。

## B. 收進共用（加測試，原本的示範改用共用的，刪掉重複）

7. `components/demos/features/auto-reply-demo.tsx` 的 `DmInput`（私訊輸入框）→ 共用，`ChatInput` 可以加 `dm` 模式，或另做 `DmInput`。
8. `components/demos/features/dynamic-vc-demo.tsx` 的 `Sidebar`（含語音頻道的頻道列表）→ 讓共用 `ChannelList` 的頻道帶 `kind: "text" | "voice"`。
9. `components/demos/reference/refusal.tsx` 的 `Refusal`（指令被拒絕的靜態畫面）→ 共用。
10. 更新 `docs/WRITING.md` 的元件清單。

## 完成條件

- 改過的文字都用 humanizer 跑過；bot 字逐字對來源。
- `npm test && npm run typecheck && npm run lint && npm run build && npm run check:export` 全過。
- 改過的頁面與示範在 1280／375、深淺色、減少動態都截圖看過，截圖存在 worktree 裡的 `.phase2-shots/polish/`，不要放 scratchpad，方便審查。
- 回報照 README 的格式，另外列出 1–10 每一項做了什麼、對應的 commit。
