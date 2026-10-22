# 主 session 交接（萬一原本的 session 額度用完）

寫於 2026-10-21。原本的主 session（另一個帳號）可能在第一階段收尾時用完額度，這份文件讓新的 session 接手當「主 session」。

## 現況

- 分支 `docs-v1`（從 `main` 開出，未推送）。第一階段 Task 1–7 已完成並審查：Fumadocs 骨架與中文搜尋、全部頁面空殼與 GitBook 轉址、Discord 元件、鏡頭與游標、bot 文案同步（`npm run sync:bot`）、後台截圖流程（`npm run capture`）、範例頁 `/payments/fp`、撰寫手冊 `docs/WRITING.md`。
- 設計：`docs/superpowers/specs/2026-10-21-docs-site-design.md`；計畫：`docs/superpowers/plans/2026-10-21-docs-phase1.md`。擁有者決定：原 Task 8（設定精靈頁）移到第二階段 getting-started。
- 進行中（交接時可能已完成或做到一半）：「Task 9a」，由兩個 agent 同時在這個資料夾做：
  - 9a-keys：把第二階段所有頁面需要的 ui.json key 加進 `scripts/sync-bot-ui.config.mjs` 並產生 `content/bot-ui.generated.ts`、情境 `components/demos/scenarios.ts`、條碼圖。
  - 9a-dash：全部後台截圖（`scripts/capture.config.mjs`、`public/demo/dashboard/`、`content/dashboard-shots.generated.json`；總覽金額改成依每筆訂單的手續費加總）、共用元件 `components/demo/dashboard-demo*`（含減少動態時的全景與數字標號）、`docs/WRITING.md` 的「後台示範」與「可用素材」附錄、`npm run list:materials`。
  - 需求全文：`.superpowers/sdd/2026-10-21-docs-phase1/task-9a-brief.md`（git 忽略的工作區，檔案在本機）。

## 接手步驟

1. `git -C C:/Users/LD/WebstormProjects/FuniPayment-Docs log --oneline -15` 看 9a 的 commit 有沒有進來；`git status` 看有沒有做到一半沒 commit 的檔案（只屬於上面列的檔案）。做到一半的就照 task-9a-brief.md 補完。
2. 驗證：`npm test && npm run typecheck && npm run lint && npm run build && npm run check:export`；`npm run sync:bot` 再跑一次沒有差異；dev server 用 `npx next dev --webpack -p 3210`，看 `/dev/discord`、`/dev/dashboard`（只在開發模式存在）。
3. 執行 `npm run list:materials`，把輸出貼進 `docs/WRITING.md` 的「可用素材」附錄，commit。
4. 確認 `docs/phase2/*.md` 已 commit，然後告訴擁有者可以開始第二階段（`docs/phase2/README.md` 有交接步驟）。
5. 第二階段各 session 做完後：逐一檢查 `phase2/<章節>` 分支與回報 `docs/phase2/reports/<章節>.md`，合併進 `docs-v1`（合併前先問擁有者），把各回報列出的缺少素材補上、共用元件合進 `components/`，全站驗收（spec 第 6 節），最後依 spec 4.2 與第三階段部署（先給擁有者確認）。

## 已知事項

- 這台電腦 Turbopack 的 dev worker 會失敗（0xc0000142），dev 一律加 `--webpack`；`npm run build` 目前用 Turbopack 可以過。
- 只關自己開的程序。之前有 agent 留下 port 3177 的 dev server（PID 106576、95020），已請擁有者自己關。
- 已延後的小問題清單在 `.superpowers/sdd/2026-10-21-docs-phase1/progress.md`（`minor (deferred)` 與 `Ruling:` 開頭的行），最後驗收時要看過一次並列給擁有者。
- bot 那邊順手發現、和文件無關的問題（之後再決定要不要修）：條碼付款的私訊與日誌 embed 引用 `barcodes.png` 但沒附檔；`web/src/lib/format.ts` 還有「信用卡」標籤；設定紀錄頁副標題還寫「Discord 的 /settings」。
