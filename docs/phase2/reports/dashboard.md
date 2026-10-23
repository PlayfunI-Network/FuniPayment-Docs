# 回報：網頁後台（dashboard）

分支 `phase2/dashboard`（從 `docs-v1` cee3108 開出），資料夾 `C:\Users\LD\WebstormProjects\FuniPayment-Docs-dashboard`。來源以 bot `release/v1.0.0`（7b7f148）為準。

## 1. 完成的頁面

| 頁面 | 說明 | 示範 |
|---|---|---|
| `/dashboard/overview` | 期間（9 種，比較方式、日期列、自訂的錯誤訊息、圖表單位）、四個指標怎麼算、含不含手續費、收款趨勢、付款方式、熱門時段、大戶與回購率、最近訂單（遮罩）、開始使用清單、資料範圍（遷移群組）、停用時的橫幅 | `OverviewDemo`：期間 → 四個指標 → 熱門時段 → 最近訂單的遮罩 |
| `/dashboard/orders` | 狀態分頁、搜尋（只搜付款編號、訂單編號、Discord ID）、三種篩選與標籤、列表欄位、遮罩規則、明細的時間軸與三塊資料、資料範圍、錯誤訊息 | `OrdersDemo`：搜尋 SHOP-001 → 點那一筆 → 明細的顧客、時間軸 |
| `/dashboard/settings-basic` | 五個欄位各自影響哪些指令、存檔列與「還有未儲存的變更」對話框、各種錯誤與停用 | `BasicSettingsDemo`：選指令頻道 → 儲存 → 已儲存 |
| `/dashboard/settings-smilepay` | 四個欄位與格式、秘密欄位的顯示方式（留空不修改、目前：已設定）、商家驗證參數的設定步驟與清除、填錯的後果 | `SmilePaySettingsDemo`：打字填商家驗證參數 → 儲存 |
| `/dashboard/settings-payment` | 五種方式的預設手續費、0 到 999、7-11／萊爾富超過 1000 加收（含算例）、-3003 自動關閉並私訊擁有者（用 ui.json 畫出私訊） | `PaymentSettingsDemo`：關掉萊爾富 → 儲存 |
| `/dashboard/settings-channels` | 只對開單分類有效、四個時間點、改名稱與移到分類、移到的分類自動加入開單分類、多個分類依序搬、名稱語法（`<name:…>`）、連到 `/payments/channel-automation` | `ChannelsSettingsDemo`：打開訂單過期時改名 → 儲存 |
| `/dashboard/settings-balance` | 五個開關與對應指令、點數名稱、點數管理員身分組、拒絕訊息，連到 `/balance/overview` | `BalanceSettingsDemo`：打開儲值點數 → 儲存 |
| `/dashboard/settings-history` | 七個欄位、四種來源、值的顯示方式、秘密欄位只寫「已變更（不顯示內容）」 | `SettingsHistoryDemo`：網頁、秘密、系統、建立設定四種紀錄 |
| `/dashboard/features` | 唯讀；自動發佈與動態語音頻道改名的卡片、28 個範本變數的表、改用 Discord 指令（連到其他功能章節） | `FeaturesDemo`：兩張卡 → 打開範本變數 |

每頁都照 WRITING.md 的骨架寫，寫完用 `humanizer:humanizer` 跑過（主要改掉開頭的三連列舉和「就來這裡看」這類收尾），再回頭把「」裡的字對過一次截圖、`web/src` 和 `app/i18n`。頁面標題沿用空殼原本的（其他章節已經用這些名稱連過來），只改了 description。

## 2. 新增或修改的檔案

- 修改：`content/docs/dashboard/` 下 9 個 `.mdx`
- 新增：`components/demos/dashboard/dashboard-demos.tsx`（9 段示範與它們的 steps）
- 新增：`components/demos/dashboard/dashboard-demos.test.tsx`（每段 6 到 15 秒、手機版會用手機截圖、游標在舞台內、每個 caption 在減少動態時有標號、動畫與全景都畫得出來；共 54 個測試）
- 新增：`components/demos/dashboard/auto-disabled-dm.tsx`（-3003 自動關閉付款方式的私訊，一張靜態畫面，字來自 `server/notifier/payment_method_auto_disabled`，情境 `payFamiport`）
- 新增：本回報

共用的檔案都沒有改。

## 3. 驗證結果

- `npm test`：202 通過、1 失敗。失敗的是 `scripts/list-materials-lib.test.mjs`「每個 bot 畫面都在清單裡」，跟我的改動無關：這台電腦 `core.autocrlf=true`，worktree 裡的 `content/bot-ui.generated.ts`、`components/demos/scenarios.ts` 被 checkout 成 CRLF（原本的 `FuniPayment-Docs` 資料夾是 LF），而 `list-materials-lib.mjs` 的 regex 只認 `\n`，所以讀到 0 個畫面。其他 phase2 worktree 應該也會遇到。建議主 session 加 `.gitattributes`（`* text=auto eol=lf`）或把 regex 改成 `\r?\n`。
- `npm run typecheck`、`npm run lint`：通過。
- `npm run build`：通過。`npm run check:export`：通過（out/ 19.89 MB，已經很接近 20 MB 上限，主 session 合併其他章節時要留意）。
- dev server：`npx next dev --webpack -p 3304`（PID 31892，做完已用 `taskkill /T /F` 關掉）。
- Playwright 截圖：9 頁 × 6 種模式（1280 深色、1280 淺色、375 深色、375 淺色、1280 減少動態、375 減少動態），每種都有整頁和示範各一張，共 108 張，放在 session 的 scratchpad：`C:\Users\LD\AppData\Local\Temp\claude\C--Users-LD-PycharmProjects-FuniPayment\63b20d3e-5b70-4b51-90f7-3c1c6c71dd1e\scratchpad\shots\`（不在 repo 裡）。腳本同時檢查：沒有 console error、沒有橫向捲動、375 寬時示範都用手機版截圖。三項都沒問題。
- 看截圖時改了一處：付款方式示範原本放大 2 倍，付款方式的名稱被切到畫面外，改成 1.4 倍。

## 4. 需要但沒有的素材

都是後台截圖（`scripts/capture.config.mjs`），沒有缺 ui.json key。

1. 總覽換了期間之後的畫面。任務要的是「切期間 → 看指標」，但現在只有預設「近 30 天」的總覽，示範只能指著期間列，沒辦法真的切換。需要：`/servers/<id>?period=last_7d`（或 `this_month`），目標同 `overview`，外加 `period7d`。拍到之後，`OVERVIEW_STEPS` 第一步改成點 `period7d` 再 `swapTo`。
2. 改手續費的畫面。任務要「開關一種方式、改手續費」，現在的 `settings-payment-edited` 只有關掉萊爾富。需要：在 `settings?tab=payment` 把「銀行轉帳 手續費」（aria-label）改成 15 的 edited／saved 兩張。
3. `settings-smilepay-edited`／`-saved` 填的商家驗證參數是 `K9M2P7`（6 個英文字）。真的 bot 只收 1 到 4 位數字，會回「必須是 1 到 4 位數字」，所以截圖裡「6 個點然後已儲存」實際上存不進去。建議改成 4 位數字，例如 `2468`。示範的 caption 刻意沒有寫「4 位數字」，換掉之後可以補上。
4. `overview` 的 `periodCustom` 只有桌面版有目標（手機版期間列要橫向捲動），所以「自訂…」的示範在手機上只能用桌面截圖。我沒有做自訂期間的示範，文字裡有寫。
5. 可以考慮補的狀態（現在都用文字描述，沒有留 TODO）：切分頁時的「還有未儲存的變更」對話框、存檔失敗的欄位錯誤（例如訂單頻道名稱格式不對）、停用中伺服器的橫幅。

## 5. 應該合進共用的元件

- `auto-disabled-dm.tsx` 裡自己定義了 `BOT = { name: "FunI 付款系統", avatar: "/brand/funi-icon.png" }`，用 `DmWindow` + `Message` + `SnapshotMessage` 畫一則私訊。`phase2/payments` 的 `kit.tsx` 也定義了一樣的 `BOT`。建議把機器人的名稱和頭像放進共用（例如 `lib/scenario.ts` 的 `DEMO_PEOPLE` 旁邊），再做一個共用的「單則私訊」或「單則頻道訊息」靜態畫面元件，各章節直接用。

## 6. 查不到、不確定、所以沒寫的事

- 「商店訂單編號」「商品編號」是從哪裡來的：明細上有這兩欄，但我沒追到 bot 什麼情況會填，所以只列欄位名稱，沒有解釋。
- 設定變更紀錄一頁幾筆：API 的預設值沒有確認，頁面上只寫「紀錄很多時有上一頁、下一頁」。
- 熱門時段、大戶等統計遇到「資料範圍：只看這個伺服器」時的細節，只寫了一般規則。
- 「管理後台」這個來源只寫了一句「FunI 付款系統的營運方替你修改的」，沒有寫 /admin 的任何內容（照任務的注意事項）。
- -3003 的意思照 bot 私訊的字寫成「這個付款方式在速買配還沒開通」，速買配那一側要怎麼開通沒有寫。

## 7. 發現的 bot 或後台問題（只記錄，沒有改）

1. 點數系統開關跟 /fp 不一致：後台「點數系統」的說明是「關閉時其他點數功能都不會運作。」，但 `app/bot/views/fp.py:152` 只看 `use_balance_to_pay`，沒有看 `enable_balance`。所以點數系統關掉、「用點數付款」開著時，/fp 選單還是會有點數選項。頁面上照程式碼寫了，並提醒商家停用點數時兩個都要關。
2. 商家驗證參數填錯時，商家不會收到通知：`process_payment_completion` 拒絕 Mid_smilepay 不符的回呼後，`notifier.invalid_mid` 只私訊 bot 擁有者（`notify_bot_owner`）。商家只會看到訂單一直停在待付款。頁面上寫了這個後果，並提醒用 /payment recheck（它不驗證 Mid）。
3. `settings/history/page.tsx` 的說明還寫「網頁、Discord 的 /settings 與系統自動做的修改都會記在這裡。」（HANDOFF 已記）。頁面的常見狀況有解釋這句。
4. 功能說明頁的自動發佈卡片，`aria-label` 是英文的 `Auto Publisher`，畫面標題是「自動發佈公告」（`features/page.tsx`，無障礙名稱跟畫面不一致）。
5. `web/src/lib/format.ts` 的 `METHOD_LABELS` 還有「信用卡」，訂單頁的「付款方式」篩選選單會列出來（HANDOFF 已記）。
