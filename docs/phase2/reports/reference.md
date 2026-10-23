# 回報：其他功能 + 疑難排解 + 參考（phase2/reference）

分支 `phase2/reference`（從 `docs-v1` b6b3bb1 開出），資料夾 `../FuniPayment-Docs-reference`。bot 專案依 `release/v1.0.0`（7b7f148）查證，沒有改動。

## 1. 完成的頁面

| 頁面 | 說明 |
|---|---|
| `/features/auto-publish` | 管理頻道權限、只能在公告頻道、開關切換的兩種回覆、機器人自己的訊息不發佈、發佈失敗不會說、後台功能頁只能看。示範：指令 → 回覆 → 商家發的公告出現在追蹤的伺服器。 |
| `/features/dynamic-vc-rename` | 參數（Discord 上沒有中文名稱）、`delete` 停用、每 10 分鐘更新且數字沒變不改、10 分鐘 2 次限制、28 個變數全表（說明照後台功能頁）、頻道不見或沒權限時移除設定並私訊商家擁有者（附私訊畫面）、各種回覆。示範：指令 → 回覆 → 語音頻道變成「訂單 128」→ 10 分鐘後「訂單 129」。 |
| `/features/dashboard-command` | /dashboard（管理伺服器權限、只在伺服器、只有自己看得到、未設定時多「開始設定」）、/settings（所有人、三種情況的按鈕去向）。示範：四個分頁的靜態回覆。 |
| `/features/auto-reply` | 私訊觸發字詞（照 `AUTO_REPLY_TRIGGERS`）、頻道裡提及機器人、hi 也會比對到 this 這類字。示範：顧客私訊「在嗎？我剛剛付款了」→ 自動回覆。 |
| `/troubleshooting/command-errors` | 13 節，各一張靜態畫面（私訊、未設定、不在指令頻道、沒有身分組、沒有建立訂單權限、只能幫自己開單、付款方式沒開、收款暫停、點數未開、不開放儲值、不允許轉帳、管理頻道權限），加上「其他回覆」對照表與「找不到指令」。 |
| `/troubleshooting/smilepay-errors` | 代碼表由元件讀 `SMILEPAY_ERRORS` 產生（去掉 -9999 範例），未知代碼、-1 連線與存檔失敗兩種非代碼錯誤、-3003 的特殊處理、-2001／-2002／-3001／-3002／-3004／-3005／-4001～-4004 的處理方式。 |
| `/troubleshooting/faq` | 15 題，分設定、付款、通知、點數，每題連到詳細頁。 |
| `/reference/commands` | 元件讀 `COMMANDS` 產生全部 15 個指令／子指令：說明、參數（標選填）、誰可以用、連結。誰可以用寫在元件裡，測試會在 commands.json 增減指令時失敗。 |
| `/reference/permissions` | 三種身分組、三個看 Discord 權限的指令、每個指令的完整對照（限頻道、其他條件）、訊息按鈕、後台只有商家擁有者。 |
| `/reference/fees` | 預設手續費、7-11／萊爾富超過 1000 加 5（剛好 1000 不加、用加收前的手續費判斷）、商家可改的範圍、顧客在哪看到、儲值的手續費。小計算器用 `calculateFee`。 |

## 2. 新增或修改的檔案

- `content/docs/features/{auto-publish,dynamic-vc-rename,dashboard-command,auto-reply}.mdx`
- `content/docs/troubleshooting/{command-errors,smilepay-errors,faq}.mdx`
- `content/docs/reference/{commands,permissions,fees}.mdx`
- `components/demos/features/`：`auto-publish-demo.tsx`、`dynamic-vc-demo.tsx`、`auto-reply-demo.tsx`、`dashboard-command-replies.tsx`、`vc-removed-dm.tsx`、`features-demos.test.tsx`
- `components/demos/reference/`：`command-table.tsx`、`fee-calculator.tsx`、`smilepay-error-table.tsx`、`refusal.tsx`、`reference.test.tsx`
- 本回報

共用檔案都沒有改。

## 3. 驗證

- `npm test`：26 個檔案、296 個測試通過（新增 21 個：三段動畫的時間軸 6～15 秒、座標在 0～1、最後兩格相同、每格畫得出來；指令表與 commands.json 對齊；計算器 980／970 的邊界；錯誤代碼表；拒絕畫面）。
- `npm run typecheck`、`npm run lint`：通過。
- `npm run build`、`npm run check:export`：通過（out/ 25.57 MB）。
- dev server：`npx next dev --webpack -p 3305`，做完已關（PID 32212 連同子程序）。
- Playwright 截圖（在 session 的 scratchpad，不在 repo）：
  - 三段動畫在 1280 與 375 各取 5～7 格，確認鏡頭放大的位置、打字游標在字的右邊、改名時鏡頭拉回看得到。過程中修正：寬版放大區域原本和視窗一樣寬，`zoomTo` 會把倍率限制成 1，改窄；窄版輸入框放大會切掉參數，維持全寬。
  - 10 頁 × 1280／375 × 深色／淺色 × 減少動態，共 40 張整頁截圖：沒有 console 錯誤、沒有水平捲動。指令總表原本在 1280 會超出內容寬度（誰可以用整欄被切掉），改成可橫向捲動、參數可換行後正常。
- 「」檢查：寫了一個腳本把 10 頁所有「」裡的字跟 `bot-ui.generated.ts`、bot 的 `app/i18n`、`web/src`、`tests/snapshots` 比對。剩下的只有 Discord 自己的權限名稱（「管理頻道」「管理伺服器」「管理訊息」）和後台由兩段拼成的「7-11／萊爾富 金額超過 1000 的額外費用（元）」（`EXTRA_FEE_LABEL` +「（元）」，逐字相符）。
- 每頁都用 `humanizer:humanizer` 跑過，改掉描述頁面本身的句子和一句多餘的建議，之後重新比對了「」。

## 4. 需要但沒有的素材

沒有。所有畫面都用現有的 ui.json key，沒有留 TODO。

## 5. 應該合進共用的元件

- `components/demos/features/auto-reply-demo.tsx` 的 `DmInput`：私訊的輸入框（空的時候是「傳送訊息給 @機器人」，打字中顯示文字）。`ChatInput` 只有「傳送訊息到 #頻道」，`CommandInput` 只能放斜線指令；之後其他私訊示範也會需要。
- `components/demos/features/dynamic-vc-demo.tsx` 的 `Sidebar`：含語音頻道的頻道列表。共用的 `ChannelList` 只畫文字頻道，`VoiceChannel` 只有單列；可以讓 `ChannelList` 的頻道帶 `kind`。
- `components/demos/reference/refusal.tsx` 的 `Refusal`：指令被拒絕的靜態畫面（`DiscordStill` + `SnapshotMessage`，可切私訊）。其他章節的常見狀況如果要放畫面可以直接用。

## 6. 查不到、不確定、所以沒寫的事

- Discord 公告頻道每個頻道每小時能發佈的則數上限：這是 Discord 的限制，不在 bot 程式碼裡，沒寫。
- `%online_members%` 的實際數值（見 7.2）：頁面只照後台寫「在線成員數」。
- 速買配 -2002「檢查碼錯誤」對到後台的「檢查碼」欄位是照欄位名稱推的；-3002、-3004、-3005、-4001～-4004 的處理方式只寫到「找速買配」「換付款方式」「稍後再試」，沒有寫速買配那邊的具體操作。
- 「所有 FunI 付款系統的指令都看不到」那條只寫了確認機器人還在伺服器、頻道允許應用程式指令，是 Discord 的一般行為，bot 程式碼查不到。

## 7. 發現的 bot 或後台問題（只記錄，沒有改）

1. `/dynamic-vc-rename` 遇到改名次數限制時，回覆說「我們已儲存您提交的新命名模板」，但 `client.py` 的 `direct_rename_dynamic_vc` 在這個分支直接 return，沒有呼叫 `db.dynamic_channel_rename.add_channel`，範本其實沒有存。頁面照實際行為寫（新範本沒有存，10 分鐘後再輸入一次），bot 修好後要改那一則 Callout。
2. `%online_members%` 用 `m.status != discord.Status.offline` 計算，但 `Client` 的 intents 只開了 `members`，沒有開 `presences`。沒有 presence 資料時 discord.py 的成員狀態都是 offline，這個變數很可能永遠是 0（沒有在正式環境確認）。
3. 私訊自動回覆用子字串比對 `message.content.lower()`，觸發字詞 `hi` 會比對到 this、which、shipping 這類英文字。頁面有寫這件事。
4. 在開了自動發佈的公告頻道裡提及機器人：`on_message` 回完自動回覆就 return，那則訊息不會被自動發佈。很少見，頁面沒寫。
5. 動態語音頻道因為權限不足被移除時，私訊的內容是「因為找不到頻道 … 而失敗，請確認該頻道是否已被刪除或權限設置有誤」，原因其實是權限，文字有涵蓋但開頭容易讓人以為頻道被刪了。
