# 第二階段回報：點數（balance）

分支 `phase2/balance`（從 `docs-v1` cee3108 開出），worktree `C:\Users\LD\WebstormProjects\FuniPayment-Docs-balance`。bot 來源 `release/v1.0.0` 7b7f148，只讀。

## 1. 完成的頁面

| 頁面 | 說明 | 示範 |
|---|---|---|
| `/balance/overview` | 點數系統是什麼、後台「點數系統」分頁的每個開關各管哪些指令（表格）、點數名稱怎麼替換、哪些字不跟著換 | `BalanceSettingsDemo`：後台分頁依序指過五個開關，打開「儲值點數」→ 儲存變更 → 已儲存 |
| `/balance/balance-show` | 顯示模式、查別人要點數管理員身分組、拒絕訊息 | 顧客輸入 /balance show（公開顯示）→ 藍色 embed |
| `/balance/balance-transfer` | 要開「點數轉帳」、只有自己看得到的確認畫面、取消、雙方私訊、日誌、備註誰看得到、10 分鐘按鈕失效、所有拒絕訊息 | 輸入指令 → 確認畫面 → 按「確認並轉帳」→ 轉帳成功 → 顧客和會員兩則私訊 |
| `/balance/balance-history` | 每頁 5 筆、翻頁按鈕（含「去尾頁」）、`查詢頁數` 0 / -1、統計表欄位、排行榜（要開，點數管理員例外）、誰能按按鈕、每種紀錄的字、管理員多看到什麼 | 第 1 頁 → 統計表 → 伺服器排行榜 |
| `/balance/balance-add-set` | 點數管理員身分組（和管理員身分組分開）、add 負數扣點、set、結果 embed、日誌、對方私訊（沒有理由和執行者）、所有拒絕訊息 | 商家 /balance add 200 備註活動獎勵 → 餘額增加成功 → 顧客私訊 |
| `/balance/top-up` | 要開「點數系統」和「儲值點數」、選付款方式和確認只有自己看得到、一點一元、付款資訊私訊、付款後私訊與日誌、後台訂單類型「儲值」、10 分鐘按鈕失效、拒絕訊息 | 完整流程：/top-up 300 → 選 7-11 → 確認 → 成功建立付款資訊 → 私訊訂單 → 付款完成通知與成功儲值 |
| `/balance/pay-with-balance` | 選單的點數選項（只在開啟時出現、+0元、`/payment create` 沒有）、誰能按（同 /fp）、全額付款、餘額不足畫面、消費通知去哪裡、不建速買配訂單 | /fp 選單選「商城點數（+0元）」→ 確認並支付 → 綠色消費通知 → 顧客私訊 |

每頁都照 WRITING.md 的骨架寫，跑過 `humanizer:humanizer`，之後用腳本把每個「」對過 bot 的 `app/i18n/*.py`、`ui.json`、`web/src`：只有帶示範數值的句子（例如「被增加了 300 點」）不能直接比對，都逐一對過模板。

## 2. 新增或修改的檔案

修改：`content/docs/balance/` 七個 `.mdx`。

新增（`components/demos/balance/`）：

- `scene.tsx`：點數示範共用的 Discord 畫面。`Scene` 把一或多個視窗（頻道、私訊）上下疊在畫布裡，訊息靠下；`ChatDemo` 包好寬窄兩種版面與 `DemoStage`；`SlashInput` 是填了多個參數的輸入框；視窗可以加一個「顧客的私訊」這類標籤。
- `timeline.ts`：從 `COMMANDS` 取子指令名稱、說明和參數中文名；步驟產生器 `stepper`。
- `balance-settings-demo.tsx`、`balance-show-demo.tsx`、`balance-transfer-demo.tsx`、`balance-history-demo.tsx`、`balance-add-demo.tsx`、`top-up-demo.tsx`、`pay-with-balance-demo.tsx`
- `balance-demos.test.tsx`：每段時間軸 6～15 秒、座標在 0～1、每一格都畫得出來（寬窄兩種版面）；轉帳最後一格的雙方餘額；/fp 選單最後一個選項是點數；歷史紀錄點的按鈕存在於快照；後台示範的每個目標在桌面和手機截圖都有。

新增：本回報。

情境全部沿用 `components/demos/scenarios.ts` 現成的（`balanceHistory`、`transfer`、`balanceAdd`、`topUp`、`payWithBalance`），沒有新增情境。

## 3. 驗證

- `npm test`：20 個檔案、165 個測試全過。
- `npm run typecheck`、`npm run lint`：無錯誤。
- `npm run build`、`npm run check:export`：通過（out/ 19.38 MB）。
- 座標：開一個暫時的開發頁（已刪，沒有 commit）把每個畫面原尺寸畫出來，用 Playwright 在 1280 和 375 寬量 `getBoundingClientRect`，點的位置都選在兩種寬度都在按鈕或選項裡的地方。`/balance history` 的窄版用 460 寬，因為 400 寬時四顆按鈕在有沒有 `sm:` 樣式下換行位置不同，找不到共同的點。
- 截圖：每頁在 1280 深色、375 淺色、1280 淺色減少動態、375 深色減少動態各拍數格（Playwright，`next dev --webpack -p 3303`）。截圖放在 worktree 的 `.phase2-shots/balance/`（沒有 commit）。Discord 畫面永遠深色；後台示範跟著主題。減少動態時 Discord 示範顯示最後一格全景，後台示範顯示數字標號全景。
- dev server 與 Playwright 都已關閉（PID 21080 及其子程序）。

worktree 注意事項：這台電腦 `core.autocrlf=true`，新的 worktree 檢出的檔案是 CRLF，`scripts/list-materials-lib.test.mjs` 的正規表示式只認 `\n`，所以在新 worktree 會失敗（主資料夾是 LF，會過）。我把 `content/bot-ui.generated.ts` 和 `components/demos/scenarios.ts` 在工作目錄轉回 LF 後測試全過；這兩個檔案沒有 commit 任何改動。其他 session 的 worktree 應該也會碰到。

## 4. 需要但沒有的素材

沒有留 TODO，每段示範都用現有素材做完。缺的部分改成文字說明：

- `/balance history` 翻到第 2 頁：現有的 `builder/balance_history/page=1/admin=True` 是管理員視角（兩頁），沒有第 2 頁，也沒有一般成員的多頁版本。示範只做第 1 頁 → 統計表 → 排行榜，翻頁寫在步驟裡。需要的話加：一般成員 7 筆紀錄的第 1 頁與第 2 頁（第 2 頁按鈕是「回首頁」◀️ ▶️「統計表」），以及中間頁出現「去尾頁」的版本。
- 後台「點數系統」分頁：只有打開「儲值點數」這一種已編輯狀態。示範其他開關時只移游標不切換。如果要逐一示範開關，需要每個開關切換後的截圖（`settings?tab=balance`，依序按「點數轉帳」「用點數付款」「點數排行榜」的 switch），以及在「點數名稱」輸入新名稱、在「點數管理員身分組」選身分組的截圖。
- `/top-up` 建立訂單後，頻道裡那則訂單訊息（`do_payment_create` 的 `followup.send`）。ui.json 的 `flow/topup_confirm` 把 `do_payment_create` 換成假的，所以沒有這則訊息的快照；見第 6 節。示範改成在私訊裡顯示訂單（`send_to_dm_and_log`，確定會送）。
- 點數系統關閉的回覆 `server/checks/balance_not_enabled` 已有，但頁面只用文字引用，沒有另做示範。

## 5. 應該合進共用的元件

- `SlashInput`（`scene.tsx`）：輸入框裡填好多個參數的樣子。共用的 `SlashPicker` 只能放一個參數，`/balance transfer`、`/balance add` 要三個。建議併進 `components/discord/slash-picker.tsx`（例如 `options` 陣列）。
- `Scene` / `ChatDemo`：「一或多個 Discord 視窗疊在畫布裡、訊息靠下、寬窄兩種版面」的通用骨架，其他章節的 Discord 示範也能用，省掉每段自己寫外框。視窗標籤（「會員的私訊」）也在這裡。
- `stepper`（`timeline.ts`）：和 fp-demo 的 `timeline` 內部寫法相同，可以抽成共用。

## 6. 查不到、不確定、所以沒寫的事

- `/top-up` 按下「確認並獲取付款碼」後，訂單訊息用 `interaction.followup.send` 送出（沒有 `ephemeral=True`），而原本的訊息是只有本人看得到的。這則訂單訊息在頻道裡是公開還是只有本人看得到，從程式碼確認不了（取決於 Discord 對元件互動 followup 的處理）。頁面只寫「付款資訊會私訊給你」，沒有寫頻道裡會出現什麼。任務檔說「整個流程只有自己看得到」，我只寫了能確認的部分：選付款方式和確認的畫面只有本人看得到。
- `/top-up` 如果在開單分類裡的頻道使用，`do_payment_create` 會把頻道換成「待付款」的名稱和分類，但付款完成時 `topup_completed` 不會再改成「已付款」。這是推論，沒寫進頁面。
- 按鈕失效時間：轉帳和儲值是 `View(timeout=600)`（10 分鐘），歷史紀錄是 `discord.ui.View()` 的預設 180 秒。三者都沒有 `on_timeout`，按鈕不會消失，只是按了沒反應。頁面寫「10 分鐘後就沒有作用了」「大約 3 分鐘沒人按就會失效」，沒有寫 Discord 用戶端顯示什麼字。
- 點數名稱的長度上限寫 20 個字，來源是 `settings_schema.MAX_NICKNAME_LENGTH`；後台輸入框超過時顯示什麼錯誤沒有查。
- 伺服器遷移時點數沿用舊伺服器（`balance_server_id`）屬於 bot 擁有者的操作，依規範沒寫。

## 7. 發現的 bot 或後台問題（只記錄，沒有改）

1. `/fp` 的點數選項只看 `use_balance_to_pay`，沒有檢查 `enable_balance`（`views/fp.py` `_create_method_dropdown`）。後台說明「點數系統：關閉時其他點數功能都不會運作。」和實際不符：只開「用點數付款」時，顧客仍能用點數付款。頁面照實際行為寫，並建議兩個都開。
2. 用點數付款完成後的訊息可能在 24 小時後被改成「付款單已過期」：`/fp` 最初那個 `CustomView`（有 `message_id`）在選完付款方式後沒有被停止，`on_timeout` 會去改同一則訊息並把頻道移到「已過期」。一般付款方式在確認時會刪掉那則訊息，所以只會 NotFound；點數付款是改同一則訊息，訊息還在。沒有實際跑過，需要確認。
3. `/balance transfer` 的「備註」說明寫「(選填) 這個備註只有你能看到」，但備註會出現在日誌頻道的「使用者轉帳紀錄」，點數管理員查紀錄也看得到（`received_transfer_note`）。
4. 點數管理員查別人的紀錄時，`/balance set` 留下的紀錄會解析錯：`records.admin_set` 寫的是「X 將餘額設定為 N 點」，但 `views/balance.py` 用「增加了」「扣除了」切出管理員名字，切不到時整段描述會被當成名字，顯示成「管理員 X 將餘額設定為 N 點 增加了 …」。
5. 點數系統關閉時的回覆 `common.BALANCE_NOT_ENABLED` 固定寫「商城點數系統」，不跟著點數名稱換。
6. `/top-up` 沒有購買人資訊（實名）這一步，`/fp` 和 `/payment create` 都有。是否符合 2026/04/23 起的規定，需要擁有者判斷。
7. 文件站的 `SnapshotEmbed` 不處理 embed 標題裡的底線語法：統計表標題「您目前擁有：__60__ 商城點數」在示範裡會直接顯示兩組底線（Discord 會畫成底線）。這是共用元件（`components/discord/embed.tsx` 的標題沒有走 `DiscordMarkdown`）的問題，沒有在我的資料夾裡繞過。
