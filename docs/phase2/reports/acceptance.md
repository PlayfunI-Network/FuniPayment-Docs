# 回報：最後修正與全站驗收（acceptance）

分支 `phase2/acceptance`（從 `docs-v1` e6d50b1 開），worktree `C:\Users\LD\WebstormProjects\FuniPayment-Docs-acceptance`。沒有 push、沒有 merge，`docs-v1` 和其他分支都沒動，bot 專案只讀。

## 0. Commit

| Commit | 內容 |
|---|---|
| 6fc77e4 | 第 6 項：/fp 與訂單頻道自動改名的畫面、`TicketCategories` 搬到 `components/demos/shared/` |
| b97c701 | 第 1–5 項：「開始使用」的事實修正 |
| a4da113 | 第 11、12 項：`quotes.test.ts` 擴大到全站，修掉它抓到的引號；每頁加頁尾 |
| f277a1a | 第 13 項：可以這次修的延後項目；設定紀錄頁改叫「設定變更紀錄」（跟後台一致） |
| b0b5249 | 第 7、9 項找到的問題：prefetch 檔 404、搜尋結果排序；vc-rename 引號裡的 Markdown 記號 |
| b441cf4 | 第 7 項找到的問題：連到檔案的連結不再被當成頁面 prefetch |
| 6efba97 | lint 略過 `.wrangler/` 暫存檔與本機截圖 |
| （本檔） | 回報 |

## 1. 每一項的結果

### A. 「開始使用」審查

1. **get-paid 的改名次數**（b97c701）：改成「如果你在後台設定了「選擇付款方式時」和「待付款時」的名稱，而且訂單頻道在開單分類底下，`/fp` 從送出到建立訂單就會用掉這 2 次」。依據：`app/bot/client.py` 的 `rename_channel` 在範本是空的、或頻道不在開單分類時直接 return，名稱沒變也不改，不會用掉次數。後台上的欄位名是 `web/src/lib/settings.ts` 的「選擇付款方式時」「待付款時」。
2. **作者列與標題**（b97c701）：改成「付款完成通知最上面一行寫「速買配－付款完成通知」，括號裡是付款方式。下面的標題是「付款編號：」加上編號…」。依據：`app/bot/views/payment.py` `PaymentCompleteMessage`（`set_author` 用 `complete_author`，`title` 用 `payment_id_title`）。
3. **私訊不一定送**（b97c701）：表格與「付款者沒收到私訊」都改成：付款者關掉伺服器成員私訊，或機器人已經看不到這位使用者時不會送。依據：`client.py` `send_to_dm_and_log`（`get_user` 回 None 或 `Forbidden` 都略過）。
4. **invite 的 embed**（b97c701）：「訂單和通知都用訊息卡片顯示」。
5. **setup-wizard**（b97c701）：
   - 新增 Callout「暫時無法設定新的伺服器」，放 `setup-owner-suspended` 截圖，引用畫面上的「你有伺服器目前已被停用，暫時無法設定新的伺服器。」（`web/src/app/setup/page.tsx`）。
   - 「按「建立」後出現錯誤」補上 `owner_suspended` 與 `daily_limit` 兩句（`web/src/lib/setup.ts` 的 `ERRORS`）。
   - 第 23 行改成：後台只有你能打開；營運方也看得到，需要時會替你修改，每次修改都記在設定變更紀錄。依據：`app/services/dashboard_access.py`（`can_view_server` 對 bot 擁有者是 true，`can_edit_server` 只給擁有者；bot 擁有者改設定走 `/admin`，紀錄來源是「管理後台」）。
6. **共用元件**（6fc77e4）：新增 `components/demos/shared/`：
   - `ticket-categories.tsx`：原 `payments/kit.tsx`（git rename，內容只改註解）
   - `fp-screen.tsx`：`FpScreen`、`LAYOUTS`、`Screen`、量好的版面（從 `payments/fp-demo.tsx` 搬出）
   - `channel-automation-screen.tsx`：`ChannelAutomationScreen`、`LAYOUTS`、`STAGES`、`Screen`
   - `payments/fp-demo.tsx`、`payments/channel-automation-demo.tsx` 只留各自的時間軸和外框；「開始使用」三段示範、`expiry`、`payment-recheck`、`app/dev/fp` 都改 import 共用的。
   - 畫面沒變：比對搬移前後的程式碼，非註解、非 import 的行只有 `type Layout = …` 改成指向匯出的型別，其他每一行都一樣；示範測試全部照舊通過，Playwright 截圖也看過（見第 3 節）。

### B. 全站驗收

7. **截圖與檢查**：44 頁 × 1280／375 × 深色／淺色的整頁圖，54 段示範各在兩種寬度捲進畫面等 3 秒拍一張，再用減少動態各拍一張，共 392 張，存在 `.phase2-shots/acceptance/`（已加進 `.git/info/exclude`，沒 commit）。腳本 `.phase2-shots/acceptance/audit.mjs`，結果 `audit.json`。
   - 第一次跑：每頁都有 console 錯誤。原因是 Next 16 靜態匯出把每頁的 prefetch 檔寫成巢狀 `__next.!KGRvY3Mp/$oc$slug/__PAGE__.txt`，瀏覽器卻要 `__next.!KGRvY3Mp.$oc$slug.__PAGE__.txt`，側邊欄每個連結 prefetch 都 404。修法：`npm run build` 之後跑 `scripts/flatten-segments.mjs`，在旁邊補一份點號版本（有測試）。正式站 Cloudflare 會一樣出錯，部署前一定要用新的 build 指令。
   - `/buyers/how-to-pay` 連到 `/demo/tutorials/hilife.png`，Next 的 Link 把圖片當頁面 prefetch → 404。改成：站內連到檔案（路徑有副檔名）的連結用一般 `<a>`。
   - `/features/dynamic-vc-rename` 引號裡留著 `**__移除__**`，畫面上看得到 `**`。改成 Discord 顯示的樣子。
   - 最後一次（最終 build）：44 頁 0 問題。沒有 console 錯誤、沒有水平捲動、54 段示範都有畫出來、顯示中的圖片都載得到。文字裡沒有原始 `{token}`；`**` 只剩「王\*\*」這個遮罩後的買家名字（後台真的這樣顯示）。
   - 隱藏的另一個主題／另一個寬度的截圖本來就不會載入，檢查只看有顯示的圖片。
8. **站內連結**：同一支腳本收集全站 259 個不同的連結。站內的每一個都用 HTTP 打一次（跟著轉址），全部 200，`#錨點` 都在目標頁找得到。外部連結只檢查格式（https、網域在名單內）：`funipay.net`、`/terms`、`/privacy`、`dashboard.funipay.net`、`/setup`、`go.funipay.net/discord`、Discord 邀請連結、`www.smilepay.net`，都正確。`check:export` 也加強了（f277a1a）：現在連 `src=` 的圖片、script 和單引號都檢查，壞掉的 `%` 編碼當成斷連結，不會讓腳本當掉。
9. **搜尋**：在 wrangler 跑的建置版用搜尋框查，結果見第 4 節。第一次查的時候，每個詞都找得到對的頁，但引擎照索引順序排頁，例如「fp」的 /fp 快速開單排第 7、「手續費」的手續費頁排第 5。加了 `rankByTitle`（`lib/search.ts`，有測試）：標題含有搜尋詞的頁排前面。
10. **GitBook 轉址**：`npx wrangler dev --port 8788` 跑起來，`public/_redirects` 26 條每條都請求一次：全部 301、目的地正確，站內目的地跟過去都是 200。結果見第 5 節。
11. **文字最後一輪**：
   - 禁用字詞：`content/`、`components/`、`app/`、`lib/`、`public/` 都沒有；`check:export` 也照常檢查。
   - 夾在中文裡的英文：掃過全部 MDX 的內文，剩下的是產品與指令名稱（Discord、SmilePay、/payment create…）、後台的欄位名（Email、Discord ID）、Discord 上沒有中文名的參數（channel、rename_name）和自動回覆的觸發字（hi、hello）。沒有 demo、embed、click。開發頁（`app/dev`）的標題有 demo、embed，不會匯出。
   - 簡體字：用一份常見簡體字表掃 MDX 與元件，0 個（只有「首」「接」兩個繁簡同形的誤報）。
   - 「」對來源：`quotes.test.ts` 從三章擴大到全部 44 頁。為了能比對真實的寫法，測試學會了：Discord 顯示的樣子（去掉粗體、底線、引言符號，`<#頻道>` 寫成 `#名稱`）、Python 相鄰字串接起來、跨過 token 的一段（至少 3 個固定的字）、後台 JSX 與樣板字串、MDX 的 `{"<>"}` 和 `\*`。很短的片段拼成的字列在 `COMPOSED`，附上組出它的程式碼。它抓到並修好的：示範名稱「選擇中」「待付款」「已付款」被加了「」（channel-automation、settings-channels）、手機卡片的「原本 → 改為」不是畫面上的字（settings-history）、「篩選條件不正確…」（orders）、「請前往 #… 使用」（settings-basic，改成舉例 #下單區）。WRITING.md 的說明一起更新。
12. **首頁、側邊欄、頁尾**：側邊欄上方有 logo、「FunI 付款系統 說明文件」、官網、後台、社群三個外部連結。原本沒有頁尾，照 spec 4.3 加上 `components/site-footer.tsx`：官網、服務條款（`https://funipay.net/terms`）、隱私權政策（`https://funipay.net/privacy`）、社群（`https://go.funipay.net/discord`）、`contact@funipay.net`。每一頁的上一頁／下一頁下面都有。連結集中在 `lib/layout.shared.tsx`。

### C. 延後項目（第 13 項）

讀 `.superpowers/sdd/2026-10-21-docs-phase1/progress.md` 裡 `minor (deferred)` 和 `Ruling:` 開頭的行：

| 行 | 項目 | 狀態 |
|---|---|---|
| 24–26 | 腳本分批加入、`page.dev.tsx`、`lib/fees.mjs` | 已解決（照做了，仍在用） |
| 30 | package.json 的 `start` | 已解決（已經沒有 `start`） |
| 31 | playfuni-icon.png 太大 | 已解決（9.6 KB） |
| 32 | 搜尋 schema 寫死 `vector[512]` | **未修**：升級 Fumadocs 時要對一次 |
| 33 | 淺色卡片和背景同色 | 已解決（截圖看過，卡片、表格、Callout 都有框線） |
| 34 | 首頁暫時文字 | 已解決 |
| 38 | `decodeURIComponent` 會丟錯 | **這次修好**（f277a1a） |
| 39 | 連結檢查只看雙引號 `<a href>` | **這次修好**（f277a1a，加上 `src=` 與單引號） |
| 40 | out/dev、大小規則沒測試 | **這次修好**（`checkRequired` 加測試；大小已有測試） |
| 41 | 後台頁描述是暫時文字 | 已解決 |
| 44、45 | Message 排版；next dev 寫 AGENTS.md | 已解決（`agentRules: false`） |
| 46 | Ephemeral 不能整列上色 | 未修（外觀小差異） |
| 47 | ChannelList 第一次掛載也播 demo-in | 未修（外觀小差異） |
| 48 | Modal 用 label 當 key | **這次修好**（f277a1a） |
| 50 | Message INLINE_TAGS 只認得固定元件 | 未修（目前沒有頁面受影響） |
| 53–58 | 鏡頭、游標、動作的裁定 | 已解決（照裁定做了） |
| 59 | zoom<1 被夾成 1 沒寫；stage.test、RefObject、開發頁文字 | zoom 的說明**這次補上**（`lib/camera.ts`）；其餘未修（測試寫法與開發頁） |
| 63–65 | COMMANDS、預設頻道名、條碼圖只對 525 | 已解決（`BARCODE_IMAGES` 只有 525，其他金額會報錯） |
| 66 | 「1 天內」對不對 | **未確認**：要用 zh-TW 的 Discord 實際看 `<t:…:R>` 未來時間的寫法 |
| 67 | paidAt、extractModal、測試 ID、snapshot.test 查詢 | 未修（不影響畫面） |
| 71、72 | 「小額測試訂單」、截圖腳本做法 | 已解決 |
| 73 | 截圖的禁用字檢查漏了全域清單 | 已解決（`scripts/demo-data.mjs` 的 `BANNED` 已含全域清單和「沒有遷移的伺服器」） |
| 74、75 | 截圖腳本的密碼欄位定位、fake-api 資料手抄、子程序可能沒關等 | 未修（只影響重拍截圖時） |
| 76、77 | 總覽手續費用 calculateFee；測試需要 bot 專案 | 已解決 |
| 81、83、84 | webpack、Fumadocs 介面中文化、fp 頁修正 | 已解決（搜尋框、目錄都是中文） |
| 85 | fp 頁的小問題（/fp 訊息被刪後的狀況、減少動態最後一格被淡出遮到等） | 未修，留給主 session 判斷 |
| 87、93、97 | 工作切分的裁定 | 已解決 |
| 89 | WRITING.md 的 Callout 少了 warning | 已解決 |
| 95 | 整條分支的最後 review 延到第三階段合併時 | **還沒做**：合併 `phase2/acceptance` 前要做 |
| 96 | markdown.tsx 的頻道、指令、標題、清單 | 已解決 |
| 98 | /balance set 欄位排法、示範數字 | 未確認（要對真的 Discord 畫面） |
| 100 | 減少動態的編號標記太靠近時會擠在一起 | 未修 |
| 104 | setup 各狀態的截圖目標、owner_suspended 等 | 已解決（第 5 項也用到了） |
| 106、111 | out/ 大小上限 | 已解決（上限 60 MB，現在 27.24 MB） |
| 114、117 | 整合、商家驗證參數 4 碼 | 已解決 |

## 2. 新增或修改的檔案

- 內容：`content/docs/getting-started/{get-paid,invite,setup-wizard}.mdx`、`content/docs/dashboard/{orders,settings-basic,settings-channels,settings-history,settings-payment,settings-smilepay}.mdx`、`content/docs/payments/channel-automation.mdx`、`content/docs/features/dynamic-vc-rename.mdx`、`content/docs/troubleshooting/smilepay-errors.mdx`
- 元件：新增 `components/demos/shared/{ticket-categories,fp-screen,channel-automation-screen}.tsx`、`components/site-footer.tsx`；修改 `components/demos/payments/{fp-demo,channel-automation-demo,expiry-demo,payment-recheck-demo}.tsx` 與兩個測試、`components/demos/getting-started/{first-order-demo,get-paid-demo,home-demo}.tsx`、`components/demos/reference/quotes.test.ts`、`components/discord/modal.tsx`、`components/search-dialog.tsx`；刪除 `components/demos/payments/kit.tsx`（搬走）
- 其他：`app/(docs)/[[...slug]]/page.tsx`、`app/dev/fp/*`、`lib/layout.shared.tsx`、`lib/search.ts`（+測試）、`lib/camera.ts`、`scripts/check-export*.mjs`、新增 `scripts/flatten-segments*.mjs`（+測試）、`package.json`（`build`）、`eslint.config.mjs`、`docs/WRITING.md`

## 3. 驗證

- `npm test && npm run typecheck && npm run lint && npm run build && npm run check:export`：最後一次全部通過。30 個測試檔 414 個測試；lint 0 個問題；`flatten-segments：45 個 prefetch 檔`；`check:export 通過（out/ 27.24 MB）`。
- 改過的文字都用 humanizer 跑過（兩輪），跑完再對過來源；`quotes.test.ts` 全站通過。
- 有代表性的 10 張截圖（`C:\Users\LD\WebstormProjects\FuniPayment-Docs-acceptance\.phase2-shots\acceptance\`）：
  1. `home.w1280.dark.png`：首頁
  2. `getting-started__get-paid.w1280.light.png`：改過的收款與通知，淺色，含頁尾
  3. `getting-started__setup-wizard.w375.dark.png`：手機上的設定精靈，含新的停用 Callout
  4. `payments__fp.w375.demo1.png`：/fp 示範，手機（搬移後）
  5. `getting-started__first-order.w375.demo1.reduced.png`：開出第一張訂單，減少動態（搬移後）
  6. `dashboard__overview.w1280.demo1.png`：後台示範
  7. `troubleshooting__command-errors.w375.light.png`：12 張拒絕畫面，手機淺色
  8. `features__dynamic-vc-rename.w1280.dark.png`：修過引號的那頁
  9. `balance__balance-transfer.w375.demo1.reduced.png`：點數示範，減少動態
  10. `reference__fees.w375.light.png`：表格頁，手機淺色
- 程序：wrangler（`npx wrangler dev --port 8788`）開過三次，每次都用 `taskkill /PID <cmd 的 PID> /T /F` 連子程序關掉（最後一次 cmd PID 55884）。Playwright 只在腳本裡開、跑完就關。沒有開 3309 的 dev server（這次只驗建置版）。最後確認 8788、3309 沒有程序在聽，也沒有 wrangler、workerd、Playwright 的程序留著。

## 4. 搜尋結果（第 9 項）

建置版、搜尋框實際輸入，列出結果裡的頁（前 8 頁，依顯示順序）：

| 搜尋 | 對的頁 | 結果 |
|---|---|---|
| 條碼 | 怎麼付款、/payment create | 邀請機器人 / **怎麼付款** / **/payment create** / 設定：付款方式與手續費 / 設定精靈 / 手續費 / /fp 快速開單 / 設定：速買配 |
| 手續費 | 手續費、設定：付款方式與手續費 | **手續費** / **設定：付款方式與手續費** / 總覽與統計 / 常見問題 / /top-up 儲值 / 設定精靈 / /payment history / /payment create |
| fp | /fp 快速開單 | **/fp 快速開單** / 開出第一張訂單 / 用點數付款 / 設定：頻道 / 購買人資訊與實名規定 / 訂單頻道自動改名與移動 / 訂單過期 / 總覽與統計 |
| 點數 | 點數系統總覽 | **點數系統總覽** / 設定：點數 / 用點數付款 / 歡迎使用 / 手續費 / /balance history / /balance show / 常見問題 |
| 改名 | 訂單頻道自動改名與移動、動態語音頻道名稱 | **訂單頻道自動改名與移動** / **/dynamic-vc-rename** / 收款與通知 / 訂單過期 / /payment recheck / 設定：基本 / 設定：頻道 / 功能頁 |
| 速買配 | 設定：速買配、速買配錯誤代碼 | **速買配錯誤代碼** / **設定：速買配** / 設定精靈 / 設定：付款方式與手續費 / 開始之前 / /payment recheck / /top-up 儲值 / 常見問題 |
| 設定精靈 | 設定精靈 | **設定精靈** / /dashboard 與 /settings / 邀請機器人 / 登入後台 / 設定：基本 / 歡迎使用 / 開始之前 / 設定：速買配 |

「條碼」沒有標題含這個詞的頁，所以照引擎原本的順序，「邀請機器人」（權限表的「附加檔案：四大超商條碼的條碼圖片」）排第一，怎麼付款排第二。截圖：`.phase2-shots/acceptance/search-<詞>.png`。

## 5. 轉址結果（第 10 項）

`npx wrangler dev --port 8788`，每條都實際請求：

| 舊網址 | 目的地 | 狀態 | 結果 |
|---|---|---|---|
| `/apply/free-trail`、`/apply/free-trail/` | `/getting-started/before-you-start` | 301 | OK，目的地 200 |
| `/settings/setup`、`/settings/setup/` | `/getting-started/setup-wizard` | 301 | OK，目的地 200 |
| `/settings/security`、`/settings/security/` | `/getting-started/before-you-start` | 301 | OK，目的地 200 |
| `/commands/payment`、`/commands/payment/` | `/payments/fp` | 301 | OK，目的地 200 |
| `/commands/payment/payment-create`（含 `/`） | `/payments/payment-create` | 301 | OK，目的地 200 |
| `/commands/payment/payment-review`（含 `/`） | `/payments/payment-review` | 301 | OK，目的地 200 |
| `/commands/payment/payment-history`（含 `/`） | `/payments/payment-history` | 301 | OK，目的地 200 |
| `/commands/payment/payment-recheck`（含 `/`） | `/payments/payment-recheck` | 301 | OK，目的地 200 |
| `/commands/payment/fp`（含 `/`） | `/payments/fp` | 301 | OK，目的地 200 |
| `/commands/auto-publish`（含 `/`） | `/features/auto-publish` | 301 | OK，目的地 200 |
| `/dynamic-vc-rename`（含 `/`） | `/features/dynamic-vc-rename` | 301 | OK，目的地 200 |
| `/privacy-policy`（含 `/`） | `https://funipay.net/privacy` | 301 | OK（外部，不打） |
| `/terms-of-service`（含 `/`） | `https://funipay.net/terms` | 301 | OK（外部，不打） |

共 26 條，26 條 OK。

## 6. 需要但沒有的素材

沒有。第 5 項用的 `setup-owner-suspended` 截圖本來就有。

## 7. 應該合進共用的元件

已經合進共用：`components/demos/shared/` 三個檔案（第 6 項）、`components/site-footer.tsx`。WRITING.md 的「其他共用的東西」已經更新。

## 8. 查不到、不確定、所以沒寫的事

- 「1 天內」（`<t:…:R>` 的未來時間）在 zh-TW Discord 上是不是這樣寫，要用真的 Discord 看（延後項目第 66 行）。
- 營運方（bot 擁有者）改商家設定的實際時機：頁面只寫「需要時」，沒寫什麼情況會改，因為程式碼看不出規則。

## 9. 發現的 bot 或後台問題（只記錄，沒改）

- 後台頁標題叫「設定變更紀錄」，文件原本叫「設定紀錄」：這次文件改成跟後台一樣，bot 不用改。
- 沒有發現新的 bot 問題。

## 10. 部署前要注意

- 部署一定要用新的 `npm run build`（`next build && node scripts/flatten-segments.mjs`）。只跑 `next build` 的話，正式站每個頁面都會有 prefetch 404 的 console 錯誤。
- 延後項目第 95 行：整條分支的最後 review 還沒做。
