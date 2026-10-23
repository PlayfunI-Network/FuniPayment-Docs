# 任務：最後修正 + 全站驗收

先讀 `docs/phase2/README.md` 的共同規則。**這份任務例外：整個 repo 都可以改**（五章與整合、收尾都已經合併進 `docs-v1`，沒有其他 session 在寫）。

- 分支／worktree：`phase2/acceptance`，資料夾 `../FuniPayment-Docs-acceptance`，從 `docs-v1`（652a7a1 或更新）開
- dev server port：3309；轉址測試用 `npx wrangler dev`（port 8788）
- 回報：`docs/phase2/reports/acceptance.md`
- bot 專案 `C:\Users\LD\PycharmProjects\FuniPayment` 只能讀

## A. 「開始使用」審查要修的（來源：bot 程式碼）

1. `content/docs/getting-started/get-paid.mdx:41` 說 /fp 一定會用掉兩次改名額度。實際上只有在後台設定了「選擇中」「待付款」的頻道名稱、而且頻道在開單分類裡時才會改名（同一頁第 26 行也說 bot 沒有預設名稱）。補上條件。
2. `get-paid.mdx:14` 把「速買配－付款完成通知」叫做標題，它其實是 embed 的作者列（標題是「付款編號：…」）。
3. `get-paid.mdx:19` 的「一定會送」說太滿：顧客關閉私訊、或機器人看不到這位使用者時都會略過。
4. `invite.mdx:57` 的英文 "embed" 改成中文說法（或「訊息卡片」）。
5. `setup-wizard.mdx`：建立被拒絕的情況補上 `owner_suspended`（截圖 `setup-owner-suspended` 已有）；第 23 行「只有你看得到」要考慮 bot 擁有者也看得到（照 `app/services/dashboard_access.py`）。
6. 「開始使用」直接 import 了收款章的元件（`components/demos/payments/fp-demo.tsx` 的 `FpScreen`、`LAYOUTS`、`Screen`；`channel-automation-demo.tsx` 的 `ChannelAutomationScreen`、`LAYOUTS`、`STAGES`；`kit.tsx` 的 `TicketCategories`）。把它們搬到共用的地方（`components/demo/` 或 `components/demos/shared/`），兩章都改用共用的，畫面不能變。

## B. 全站驗收（spec 第 6 節）

7. 每一頁（全部 44 頁左右）用 Playwright 在 1280 與 375、深色與淺色各拍一張整頁圖，另外每段示範捲到畫面裡、等 3 秒拍一張，再用減少動態拍一張。檢查：沒有 console 錯誤、沒有水平捲動、示範有畫出來、沒有原始的 `{token}`、`__` 或 `**` 殘留、圖片都載得到。截圖存在 worktree 的 `.phase2-shots/acceptance/`（不要 commit），回報裡附 10 張最有代表性的路徑。
8. 站內連結：每一頁所有站內連結都要能開（`check:export` 已檢查一部分，再用 Playwright 實際點一輪或用腳本掃 `out/`）。外部連結（`dashboard.funipay.net`、`go.funipay.net`、`funipay.net`）只檢查網址格式，不要大量打外部網站。
9. 搜尋：在建置後的網站（`npx serve out` 或 `wrangler dev`）用搜尋框查「條碼」「手續費」「fp」「點數」「改名」「速買配」「設定精靈」，每個都要找到對的頁面，回報列出結果。
10. GitBook 舊網址轉址：用 `npx wrangler dev` 跑起來，`public/_redirects` 每一條都實際請求一次，確認 301 和目的地正確。
11. 文字最後一輪：全站搜尋禁用字（信用卡、免費試用、申請試用、NewebPay、藍新、公測期間全部免費）、英文單字夾在中文段落（"demo"、"embed"、"click" 等）、簡體字、「」裡的字對不上來源（`quotes.test.ts` 目前只涵蓋三個章節，擴大到全部章節）。
12. 首頁、側邊欄、頁尾：品牌、連結（官網、後台、社群、服務條款、隱私權政策、聯絡信箱 contact@funipay.net）都在、都正確。

## C. 交給主 session 的清單

13. 讀 `.superpowers/sdd/2026-10-21-docs-phase1/progress.md` 裡所有 `minor (deferred)` 與 `Ruling:` 開頭的行（這個資料夾在 `C:\Users\LD\WebstormProjects\FuniPayment-Docs\.superpowers\`，git 忽略，直接讀檔），已經被後來的工作修好的標「已解決」，還沒修的、能在這次修的就修，剩下的列在回報裡。

## 完成條件

- 改過的文字都用 humanizer 跑過；bot 字逐字對來源。
- `npm test && npm run typecheck && npm run lint && npm run build && npm run check:export` 全過。
- 回報照 README 的格式，另外列出 1–13 每一項的結果與 commit，以及第 9、10 項的實際結果表。
- 只關自己開的程序（dev server、serve、wrangler、Playwright），做完全部關掉。
