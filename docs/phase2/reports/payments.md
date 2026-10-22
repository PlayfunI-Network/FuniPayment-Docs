# 第二階段回報：收款 + 給顧客（payments）

分支 `phase2/payments`（從 `docs-v1` cee3108 開出），worktree `C:\Users\LD\WebstormProjects\FuniPayment-Docs-payments`。bot 以 `release/v1.0.0`（7b7f148）為準。

## 1. 完成的頁面

| 頁面 | 說明 | 示範 |
|---|---|---|
| `payments/payment-create` | 參數表（九個參數，照 `COMMANDS`）、可建立訂單的身分組與管理員身分組、只有自己看得到的購買人資訊、三類付款方式的訂單差異、拒絕訊息與「訂單建立失敗...」、取消。 | `PaymentCreateDemo`（輸入指令 → 購買人資訊 → 「✅ 資訊確認中，請稍候...」 → 銀行轉帳訂單）＋ `OrderGallery`（五種付款方式的訂單，按鈕切換） |
| `payments/buyer-info` | 實名規定（照 bot 原文引用）、誰能按、表單三欄與字數上限、三欄都填才能確認、資料依使用者＋伺服器存、/payment create 參數會蓋過存的資料、後台明細與列表遮罩。 | `BuyerInfoDemo`（未填 → 開表單 → 打字 → 提交 → 確認按鈕可按） |
| `payments/payment-review` | 不給編號時找哪一筆（開單分類裡＝頻道最新一筆；其他＝自己最新一筆）、只能查自己的（管理員例外）、三種狀態、回覆是公開的。 | `PaymentReviewDemo`（查兩次：待付款 → 已繳費）＋ `ReviewStates`（三種狀態切換） |
| `payments/payment-history` | 顯示模式、每頁 3 筆、按鈕與誰能按、第 0 頁統計表各欄位意思、查詢使用者限管理員、按鈕約 3 分鐘失效。 | `PaymentHistoryDemo`（第 1 頁 → 按「統計表」） |
| `payments/payment-recheck` | 管理員限定；不填編號查頻道最後一筆待付款；各種結果訊息；完成效果與 SmilePay 回呼相同；scan_all 的進度與總結；少付的處理。 | `PaymentRecheckDemo`（頻道改名、移分類、付款完成通知）＋ `RecheckAllDemo`（scan_all 進度） |
| `payments/channel-automation` | 四種狀態何時套用、只對開單分類有效、移到的分類自動加入開單分類、範本語法（`<name:…>`、`<name>`、無 `<>`）、前綴替換、多分類依序找空位、10 分鐘 2 次改名限制、私訊擁有者的兩種移動失敗。設定連到 `/dashboard/settings-channels`。 | `ChannelAutomationDemo`（開單 → 選擇中 → 待付款 → 已付款，頻道列表改名移動） |
| `payments/expiry` | /fp 任一步 24 小時 → 過期 embed＋頻道改名移動；訂單過付款期限 → 每天 00:01 標成已過期＋頻道改名移動（訂單訊息不改、不通知）；/payment create 的確認畫面只是按鈕失效。 | `ExpiryDemo`（/fp 選單 → 過期 embed，頻道改名移動） |
| `buyers/how-to-pay` | 給顧客：訂單在哪、三個必看欄位、銀行轉帳、四大超商條碼（條碼只在頻道那則）、7-11／全家／萊爾富代碼與教學連結、付款期限與 24 小時過期。 | `OrderGallery` |
| `buyers/after-paying` | 通知出現在私訊與訂單頻道、時間由速買配通知決定（不寫固定時間）、沒收到時先 /payment review 再請商家重新確認、少付。 | `AfterPayingDemo`（私訊裡的 7-11 代碼訂單 → 付款完成通知） |
| `buyers/check-order` | 顧客用 /payment review 和 /payment history（建議「僅自己看到」）。 | 重用 `PaymentReviewDemo` |

`fp.mdx`、`fp-demo.tsx` 沒有動。

## 2. 新增或修改的檔案

修改：

- `content/docs/payments/{payment-create,buyer-info,payment-review,payment-history,payment-recheck,channel-automation,expiry}.mdx`
- `content/docs/buyers/{how-to-pay,after-paying,check-order}.mdx`

新增：

- `components/demos/payments/kit.tsx`：共用的 Discord 畫面、多參數輸入框、步驟產生器（見第 5 節）
- `components/demos/payments/payment-create-demo.tsx`
- `components/demos/payments/order-gallery.tsx`
- `components/demos/payments/buyer-info-demo.tsx`
- `components/demos/payments/payment-review-demo.tsx`（含 `ReviewStates`）
- `components/demos/payments/payment-history-demo.tsx`
- `components/demos/payments/payment-recheck-demo.tsx`（含 `RecheckAllDemo`）
- `components/demos/payments/channel-automation-demo.tsx`
- `components/demos/payments/expiry-demo.tsx`
- `components/demos/buyers/after-paying-demo.tsx`
- `components/demos/payments/payments-demos.test.tsx`
- `docs/phase2/reports/payments.md`（本檔）

情境全部沿用 `components/demos/scenarios.ts` 現有的（`payBankTransfer`、`fpStoreBarcode`、`payIbon`、`payFamiport`、`payHilife`），沒有新增。`builder/payment_complete` 在付完之後的示範用 `payIbon`（欄位相同，測試有畫過）。

## 3. 驗證結果

- `npm run typecheck`：通過。
- `npm run lint`：通過（0 problems）。
- `npm run build`：通過。
- `npm run check:export`：通過（`out/` 19.67 MB，離 20 MB 上限很近，主 session 合併時請留意）。
- `npm test`：182 個測試 181 過，1 個失敗：`scripts/list-materials-lib.test.mjs`「每個 bot 畫面都在清單裡」。原因不是本分支的改動：這台機器 `core.autocrlf=true`，新開的 worktree 檔案是 CRLF，`scripts/list-materials-lib.mjs` 的 regex 寫死 `\n`，所以一筆都抓不到。把 `bot-ui.generated.ts` 和 `scenarios.ts` 轉成 LF 後同一個函式抓到 142 筆，主 repo（LF）跑這個測試是過的。其他 session 的 worktree 應該也會遇到，建議把 regex 改成 `\r?\n`，或加 `.gitattributes`（`* text=auto eol=lf`）。我沒有改共用檔。
- 本分支的示範測試（`payments-demos.test.tsx`，37 個）：每段示範寬窄兩版時間軸 6 到 15 秒、座標在 0 到 1、最後一格是完整結局（減少動態時看得懂）、每個畫面都畫得出來；購買人資訊空白／已填的按鈕與 disabled 狀態、表單欄位順序、統計表按鈕的 disabled；訂單切換與狀態切換的每個分頁。
- 座標：用暫時的開發頁把每段示範的每個畫面原尺寸畫出來，Playwright 在 1280 和 375 兩種寬度量 `getBoundingClientRect`，點擊點選在兩種寬度都在按鈕內。暫時的開發頁與量測腳本已刪除，沒有 commit。
- 截圖：Playwright 對 10 頁拍了 1280／375、深色、減少動態（最後一格），以及淺色主題（`localStorage.theme=light`，網站預設深色、不跟系統）。全部沒有 console 錯誤。截圖在本機 `C:\Users\LD\AppData\Local\Temp\claude\C--Users-LD-PycharmProjects-FuniPayment\8f35ca33-8437-421e-983c-eeb7199774a7\scratchpad\shots\`（不在 repo 裡）。看過後調整了過期示範的畫布高度（原本上方空白太多）。
- 每頁都用 `humanizer:humanizer` 跑過；之後用腳本把每頁所有「」裡的字對 bot 來源（`bot-ui.generated.ts`、`app/i18n/*.py`、`web/src`）比對一次，移除了兩處不是 bot 文字卻加了「」的地方。
- dev server（port 3302，`--webpack`）用完已用 `taskkill /PID 26772 /T /F` 關掉，Playwright 的瀏覽器都在腳本結束時關閉。

## 4. 需要但沒有的素材

- `flow/payment_history_command/2`（或任何第 2 頁）：想示範「▶️ 翻到下一頁」，目前只有第 1 頁和統計表，所以示範只做「第 1 頁 → 統計表」。
- `text/payment/recheck_all_progress` 的最後一次更新（例如 12/12）：示範只到 5/12 就停，沒有接總結訊息，避免進度和總結對不上；總結訊息在頁面上用文字說明。
- 萊爾富的教學連結：bot 原本是 `https://i.imgur.com/JK2TExl.png`（圖片教學），產生檔把它換成 `#`，所以 `OrderGallery` 裡萊爾富那則的「點我查看付款教學」連到 `#`。頁面文字有寫萊爾富是一張教學圖片。要不要把圖複製進 `public/` 再連過去，請主 session 決定。
- 沒有留 TODO。

## 5. 應該合進共用的元件

都在 `components/demos/payments/kit.tsx`：

- `CommandInput`：斜線指令輸入框的三種狀態（空白、打字中帶自動完成、已填多個參數）。共用的 `SlashPicker` 只能放一個參數，/payment create 需要「付款方式」和「金額」兩個 pill。建議直接擴充 `SlashPicker` 支援多個 `option`。
- `Screen`：Discord 頻道或私訊視窗＋可選的頻道列表，訊息靠下、上方淡出（從 `fp-demo.tsx` 的 `FpScreen` 抽出來的）。
- `TicketCategories`：示範用的分類與頻道列表，訂單頻道依狀態出現在不同分類。
- `stepper`：帶畫面狀態的步驟產生器（`fp-demo.tsx` 的 `timeline` 裡那段）。
- `optionPill` / `paymentSub`：從 `COMMANDS` 取參數的中文名稱和選項文字。
- `OrderGallery`、`ReviewStates` 的分頁按鈕樣式一樣，可以做成共用的「SnapshotTabs」。
- 共用的 `Embed` 標題不處理 Discord markdown：`flow/payment_history_command/0` 的標題「您總共消費了：__540 新台幣__」會直接顯示 `__`（Discord 會畫成底線）。歷史紀錄示範的統計表畫面有這個問題，需要在 `components/discord/embed.tsx` 修。

## 6. 查不到、不確定、所以沒寫的事

- 付款期限多長：bot 不指定，用速買配回傳的 `PayEndDate`。頁面只寫「期限是速買配決定的」。
- 每天 00:01 是哪個時區：`schedule` 用執行 bot 的主機的本地時間。頁面寫 00:01，假設主機在台灣時間。
- 付款期限過了以後顧客還能不能付、付了會怎樣：程式碼看不出速買配的行為，沒寫。
- 各超商機台的操作步驟、四大超商是哪四家：程式碼沒有，頁面只寫機台名稱（取自 bot 的付款方式名稱）並請讀者看 bot 附的教學連結。
- 銀行帳號是不是每張訂單不同：程式碼看不出來，沒寫。
- 速買配通知要多久：沒寫時間，只說要等速買配通知。
- /payment create 訂單訊息的可見性：`followup.send` 沒加 `ephemeral`，ui.json 也標成非 ephemeral，所以寫成貼在頻道。沒有實機確認。

## 7. 發現的 bot 或後台問題（只記錄，沒改）

1. 四大超商條碼訂單送到私訊和日誌頻道的那份 embed 引用 `attachment://barcodes.png`，但沒有附檔，所以看不到條碼（交接文件已提過，頁面上照實寫了「私訊那份沒有條碼圖片」）。
2. `/payment review` 已繳費的 embed，欄位名稱是「訂單金額」，值卻是 `pay_amount`（含手續費）；付款完成通知的「訂單金額」是 `order_amount`（不含手續費）。同一個名稱兩種意思。頁面上避開，只寫「金額」。
3. `/payment history` 統計表的「付款最大單」把待付款和已過期的訂單也算進去（`views/payment.py` 的 `biggest` 不分狀態），跟其他欄位只算已完成的不一致。頁面照實寫了。
4. `client.rename_channel` 的前綴替換：目前名稱含有其他狀態的前綴時，會用 `_extract_parts(template)` 取新範本的前綴；新範本如果不是「前綴`<name:…>`」的格式（例如 `已付款` 或 `已付款-<name>`），前綴是 `None`，`None + original_name` 會丟 `TypeError`，這次改名直接失敗。頁面建議四個狀態都用 `<name:…>` 寫法，沒有寫出這個錯誤。
5. `/payment review` 在開單分類的頻道不填編號、頻道又沒有訂單時，回的是「此頻道沒有任何標記為未付款的訂單。」，但這裡查的是任何狀態的訂單，字面意思不太對。
6. `/payment history` 的按鈕用 `discord.ui.View()` 預設的 180 秒逾時，逾時後沒有改訊息，按鈕還在但按了沒反應。頁面寫了「大約 3 分鐘沒人按就會失效」。
7. `/payment create` 的購買人資訊畫面（ephemeral）沒有設定 `message_id`，24 小時逾時後不會變成過期訊息，只是按鈕失效。
8. 訂單過了付款期限被標成已過期時，原本的訂單訊息不會改，也不會通知顧客或商家。
