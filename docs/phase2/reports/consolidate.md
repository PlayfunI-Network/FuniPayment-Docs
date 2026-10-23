# 第二階段回報：整合（consolidate）

分支 `phase2/consolidate`（從 `docs-v1` 105c8ff 開出），worktree `C:\Users\LD\WebstormProjects\FuniPayment-Docs-consolidate`。bot 以 `release/v1.0.0`（7b7f148）為準，只讀，沒有改。

## 每一項做了什麼

| 項目 | 做了什麼 | commit |
|---|---|---|
| 1 embed 標題 | `Embed` 的標題改用 `DiscordMarkdown` 畫，`__540 新台幣__`、`__60__` 畫成底線。測試：元件本身一個，兩則統計表的快照各一個 | fea56d8 |
| 2 共用元件 | 見下方「第 2 項的細節」 | fba20f7 |
| 3 check:export | 大小檢查移到 `checkSizes()`（`scripts/check-export-lib.mjs`）：整站 60 MB、每張圖 200 KB、每頁 HTML 500 KB，加測試。spec 4.5 D 節和 plan 的 Global Constraints 同步改了 | bf222d4 |
| 4 list:materials CRLF | 讀檔時把 `\r\n` 換成 `\n`；測試把三個來源檔轉成 CRLF 放到暫存資料夾，結果要和原本一樣。另外修了一個查到的 bug：`COMMANDS` 結尾是 `} satisfies …`，附錄的 `COMMANDS` 那行會一路列到速買配錯誤代碼，現在每個物件只列自己的 key（也加了測試） | bb31a1d、e56cfc7 |
| 5 ui.json | 新增 `builder/payment_history/page=2`、`text/payment/recheck_all_progress/12`、一般成員的 `builder/balance_history/page=1|2|0|-1/admin=False`，加情境 `balanceHistoryPages`。統計表的手續費沒有改，原因見下方 | cbb7155 |
| 6 萊爾富教學 | 圖下載到 `public/demo/tutorials/hilife.png`（原圖 232 KB，轉成 256 色 PNG，尺寸一樣 620×466，84 KB），產生檔的連結改指向它；`how-to-pay` 的文字也連過去 | cbb7155（config 與產生檔）、5ceffa6（圖）、85182d1（頁面連結） |
| 7 後台截圖 | 新增 `overview-7d`（`?period=last_7d`，目標同總覽，含 `period7d`）；`settings-payment-fee-edited`／`-fee-saved`（萊爾富關掉之後再把銀行轉帳手續費改成 15，兩項變更）；`settings-smilepay-edited`／`-saved` 改填 `2468` 重拍；點數分頁依序 `settings-balance-transfer`、`-pay`、`-leaderboard`、`-name`（星光幣）、`-roles`（點數管理員身分組選「管理員」）、`-roles-saved`，每張保留前面的變更。全部深淺色、桌面與手機，用 label／role selector。新的 `settingsEdits()` 產生這些設定頁截圖 | ff989ce |
| 8 dashboard | `settings-balance.mdx` 刪掉「商城點數會換成點數名稱」；`SMILEPAY_STEPS` 用新截圖，caption 補「1 到 4 位數字」；-3003 改用原文（速買配「商家未開啟此付款方式」、私訊「尚未啟用此服務」）；付款方式的例子統一成萊爾富（私訊示範改用 `payHilife`，儲存那步的例子改成「2 項未儲存的變更：銀行轉帳、萊爾富超商代碼」，和示範一致）；總覽示範第一步點 `period7d` 再 `swapTo: "overview-7d"`；付款方式示範加上改手續費 | 3f1143b |
| 9 balance | `BalanceSettingsDemo` 改成真的切換：打開點數轉帳、關掉用點數付款和點數排行榜、改點數名稱、選點數管理員身分組、儲存，caption 不再說「點數系統」是總開關；「公開顯示」改從 `COMMANDS` 取（`optionPill`，在第 2 項就換了）；`balance-add-set.mdx` 寫「增加理由」／「扣除理由」；歷史紀錄示範改成第 1 頁 → ▶️ 第 2 頁 → 統計表 → 排行榜（同一批 7 筆、91 點） | 2f683d4 |
| 10 payments | 錯字改成「最晚什麼時候要付」；`how-to-pay`、`check-order` 改成「機器人會把這張訂單標成已過期，還想付款請商家重新開單」；`channel-automation` 補改名限制（寫法見下方第 6 節）；`payment-create-demo` 的 caption 用情境的付款方式和金額（第 2 項就換了）；歷史紀錄示範加第 2 頁；scan_all 示範接到 12/12 和總結；萊爾富連結用本地圖片 | 85182d1 |
| WRITING.md | 元件清單（fba20f7），附錄「可用素材」用新的 `list:materials` 輸出重貼 | fba20f7、6a5623d |

### 第 2 項的細節

共用的東西：

- `components/discord/slash-picker.tsx`：`SlashPicker` 多了 `options`（一或多個 `{ name, value }`），原本的 `option` 照樣能用；`options={[]}` 是選好指令、還沒填參數。
- `components/demo/discord-scene.tsx`（從 `components/demo` 匯出）：
  - `DiscordDemo`：寬窄兩種版面各一組 `{ layout, steps }`，舞台小於 600 px 換窄版從頭播（取代每段示範自己寫的 `useWidth` + `DemoStage` + `Canvas`，以及 balance 的 `ChatDemo`）。
  - `DiscordScene` / `Pane`：頻道列表（版面有 `list` 時）加一或多個視窗，訊息靠下、上方淡出、視窗標籤 `tag`（取代 payments 的 `Screen`、balance 的 `Scene`、fp 的 `FpScreen` 外框）。
  - `ChatMessage`：`from`（bot、buyer、admin、member）、`command`、`ago`、`enter`。
  - `CommandInput` / `InputState`：空的、打字中、填好參數（取代 payments 的 `CommandInput`、balance 的 `SlashInput`／`InputRow`、fp 的 `Input`）。
  - `stepper` / `SceneStep` / `SceneLayout`：帶畫面狀態的步驟產生器（取代 payments 的 `stepper`、balance `timeline.ts` 的 `stepper`、fp 的 `timeline` 內部那段）。
  - `MessageWindow` / `DiscordStill`：單則頻道訊息或私訊的靜態畫面（dashboard 的 `AutoDisabledDm` 改用它）。
- `components/demo/snapshot-tabs.tsx`：`SnapshotTabs`（`OrderGallery`、`ReviewStates` 改用它；每組分頁用 `useId`，一頁放兩組也不會撞 id）。
- `lib/commands.ts`：`slashCommand("payment create")`、`optionPill(指令, 參數, 值)`、`commandOption`（取代 payments 的 `paymentSub`／`optionPill`、balance 的 `balanceCommand`／`optionName`）。
- `lib/scenario.ts`：`DEMO_BOT`（`DEMO_PEOPLE` 旁邊）、`demoSender`、`demoTime`。

刪掉的重複：`components/demos/balance/scene.tsx`、`components/demos/balance/timeline.ts`；`components/demos/payments/kit.tsx` 只剩 `TicketCategories`（payments 自己的示範分類）；`fp-demo.tsx`、`auto-disabled-dm.tsx` 的 `BOT` 常數。三章與 fp 的示範全部改用共用的，座標和時間軸沒有動（除了下面第 3 節說的 payment history 窄版）。

## 1. 完成的頁面

這份任務沒有新頁面。改過內容的頁面：

| 頁面 | 改了什麼 |
|---|---|
| `/dashboard/overview` | 示範先切到近 7 天 |
| `/dashboard/settings-smilepay` | 示範填 4 位數字，caption 寫明 1 到 4 位數字 |
| `/dashboard/settings-payment` | -3003 用原文；儲存的例子和示範一致；示範加改手續費；私訊示範改成萊爾富 |
| `/dashboard/settings-balance` | 刪掉點數名稱替換的錯誤說明 |
| `/balance/overview` | 示範逐一切換每個設定 |
| `/balance/balance-history` | 示範翻到第 2 頁 |
| `/balance/balance-add-set` | 欄位名稱「增加理由」／「扣除理由」 |
| `/payments/payment-history` | 示範翻到第 2 頁 |
| `/payments/payment-recheck` | scan_all 示範接到 12/12 和總結 |
| `/payments/channel-automation` | 補改名限制 |
| `/buyers/how-to-pay` | 錯字、過期的說法、萊爾富教學連結 |
| `/buyers/check-order` | 過期的說法 |

其他用到共用元件的頁面（payments、buyers、balance 其餘頁面）畫面不變。

## 2. 新增或修改的檔案

新增：`components/demo/discord-scene.tsx`、`components/demo/discord-scene.test.tsx`、`components/demo/snapshot-tabs.tsx`、`lib/commands.ts`、`lib/commands.test.ts`、`public/demo/tutorials/hilife.png`、`public/demo/dashboard/` 的 36 張新圖（9 張截圖 × 深淺 × 桌面手機）、本回報。

刪除：`components/demos/balance/scene.tsx`、`components/demos/balance/timeline.ts`。

修改：`components/discord/{embed,slash-picker,index}.tsx|ts` 與測試、`components/demo/{index.ts,snapshot.test.tsx}`、`components/demos/` 下 payments、buyers、balance、dashboard 的所有示範與測試、`components/demos/scenarios.ts`、`lib/scenario.ts`、`scripts/{check-export,check-export-lib,list-materials-lib,sync-bot-ui.config,capture.config}.mjs` 與測試、`content/bot-ui.generated.ts`、`content/dashboard-shots.generated.json`、`public/demo/dashboard/settings-smilepay-edited-*.webp`（重拍）、上面那張表的 12 個 MDX、`app/dev/fp/screens.tsx`（輸入框狀態改名）、`docs/WRITING.md`、spec 與 plan 各一行。

沒有改 `content/docs/index.mdx`、`getting-started/`、`features/`、`troubleshooting/`、`reference/` 與它們的 demos 資料夾。

## 3. 驗證結果

- `npm test && npm run typecheck && npm run lint && npm run build && npm run check:export`：全過。24 個測試檔、275 個測試；`check:export 通過（out/ 24.27 MB）`；沒有超過 400 KB 的頁面 HTML。
- `npm run sync:bot` 重跑：148 個 key，沒有差異。
- `npm run list:materials`：結果貼進 WRITING.md 附錄。
- 座標：開一個暫時的開發頁（`app/dev/measure`，已刪，沒有 commit）把新畫面原尺寸畫出來，Playwright 在 1280 和 375 寬量按鈕的 `getBoundingClientRect`。▶️、統計表、伺服器排行榜的點在兩種寬度都落在按鈕裡。量的時候發現 `/payment history` 的窄版（400 寬）在有 `sm:` 樣式時「統計表」會換到第二列，原本的點在 375 寬才對；比照 `/balance history` 把窄版改成 460 寬，四顆按鈕在兩種寬度都在同一列。
- 截圖：`npx next dev --webpack -p 3306`，Playwright 對 27 頁（payments、buyers、balance、dashboard 全部）每段示範拍 1280 深色、375 淺色（各兩個時間點）、1280 淺色減少動態、375 深色減少動態，共 186 張。沒有 console error，沒有橫向捲動。看過的重點：統計表標題的底線、第 2 頁與 ▶️、scan_all 的 12/12 與總結、點數分頁的每個開關、總覽切到近 7 天、手續費 15、萊爾富的私訊、fp 示範（改用共用元件後畫面不變）。截圖在 `C:\Users\LD\AppData\Local\Temp\claude\C--Users-LD-PycharmProjects-FuniPayment\a705dbe0-03f9-48c7-9528-7614ded57eab\scratchpad\shots\`（不在 repo 裡）。
- 後台截圖：`npm run capture -- <id>…`（預設 port 8399／8398／3100），每張都在 200 KB 以內（最大 161 KB）。
- 改過的文字都用 `humanizer:humanizer` 跑過（改掉一句不通順的長句，以及一處用「他」指商家），之後把每個「」對過來源：`content/bot-ui.generated.ts`、`app/i18n/*.py`、截圖。
- 程序：dev server（PID 39112）用 `taskkill /PID 39112 /T /F` 關掉；capture 自己開的三個程序由腳本關掉；Playwright 瀏覽器都在腳本結束時關閉。最後確認 3306、8399、8398、3100 都沒有程式在聽。

## 4. 需要但沒有的素材

- `/balance history` 出現「去尾頁」的中間頁：要第 3 頁以上。bot 的 `test_balance_history` 只建 7 筆（兩頁），ui.json 沒有中間頁，這個 repo 也沒辦法自己做出來（不能改 bot）。要的話，bot 那邊的 fixture 要多於 10 筆，並快照 `page=2` 在三頁中的版本。示範目前是第 1 頁 → 第 2 頁 → 統計表 → 排行榜。
- 沒有留 TODO。

## 5. 應該合進共用的元件

都已經合進去了（見第 2 項的細節）。還留在章節資料夾的只有 `components/demos/payments/kit.tsx` 的 `TicketCategories`，目前只有 payments 的示範用；WRITING.md 有列出它，別章要用可以直接 import 或搬到共用。

## 6. 查不到、不確定、所以沒寫的事

- 第 5 項「統計表的手續費 140 和四筆 135 對不上」：其實對得上。統計表的「手續費」是已完成訂單手續費的加總（`views/payment.py` 的 `fees += payment['fee']`），fixture 四筆都是 100 + 35（`tests/conftest.py` 的 `make_payment` 預設 `fee=35`），4 × 35 = 140；「您總共消費了」540 = 4 × 135。頁面本來就寫「已完成付款的手續費加總」，所以沒有改。
- `builder/payment_history/page=2` 的 fixture 有 5 筆訂單（第 2 頁 2 筆），和 `/payment history` 指令那組 4 筆對不上。為了接在第 1 頁後面，sync 規則把第 2 頁第一筆整段去掉，只留一筆（第 4 筆，2026/10/15，和統計表的首次付款日期一致）。留下的那筆是 bot 原文；規則寫在 `sync-bot-ui.config.mjs`，bot 的格式變了 sync 會失敗。
- 第 10 項改名限制，任務檔寫「其中一種寫成純文字時，從那個狀態換到其他狀態的改名可能失敗」。照 `client.py` 的 `_convert_rename_name`，方向相反：頻道名稱還帶著某個 `前綴<name:…>` 狀態的前綴，要換到的那個狀態的範本不是 `前綴<name:…>`（純文字，或 `已付款-<name>` 這種）時，`prefix` 是 `None`，`None + original_name` 丟錯，這次改名失敗。頁面照程式碼的方向寫，沒有寫出錯誤的細節。
- 設定精靈第 3 步（`setup-3`…`setup-5`）和 `DEMO_SETTINGS_CHANGES` 填的商家驗證參數還是 `G7H8`，也不是數字。畫面上是 4 個點，看不出差別，所以沒有重拍（`getting-started` 正在用這幾張）。之後要一致的話，把 `capture.config.mjs` 的 `toStep4` 和 `demo-data.mjs` 改成 4 位數字再重拍 `setup-3` 到 `setup-5`。
- Discord 畫面裡的連結（含萊爾富教學）畫成文字，不能點，因為示範對輔助技術是一張圖（`aria-hidden`）。所以除了產生檔指向本地圖片，也在 `how-to-pay` 的文字裡加了連結。
- 付款方式示範在手機上，打字的 I 字形游標停在「手續費」欄的數字上（`DashboardDemo` 把游標放在目標中央，SmilePay 示範也一樣）。沒有改共用的 `DashboardDemo`。

## 7. 發現的 bot 或後台問題（只記錄，沒有改）

1. `client.rename_channel`：見第 6 節，範本不是 `前綴<name:…>` 的狀態，從帶前綴的名稱換過去會丟 `TypeError`（payments 回報第 4 點已記）。
2. `/balance history` 的「去尾頁」只在中間頁出現，bot 的快照測試沒有涵蓋（fixture 只有兩頁）。
3. 後台 fake API 收下不是數字的商家驗證參數（`G7H8`、原本的 `K9M2P7`），真的 API 會回「必須是 1 到 4 位數字」。只是測試資料的問題，記下來給 bot 的 e2e 參考。
