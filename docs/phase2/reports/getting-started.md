# 第二階段回報：開始使用 + 首頁

分支 `phase2/getting-started`（從 `docs-v1` b6b3bb1 開出），worktree `C:\Users\LD\WebstormProjects\FuniPayment-Docs-getting-started`。沒有 push、沒有 merge。

## 1. 完成的頁面

| 頁面 | 說明 | 示範 |
|---|---|---|
| `index` | FunI 付款系統是什麼、能做什麼（開單、收款通知、點數、後台），六步主線的連結 | `HomeDemo`：/fp 選單 → 條碼訂單 → 付款完成通知，重用收款章的頻道自動化畫面 |
| `before-you-start` | 需要「管理伺服器」權限的伺服器、速買配帳號與四個欄位、先建好管理員身分組和日誌頻道；不用申請 | 無（照任務檔，可省略） |
| `invite` | 邀請連結、七項權限與用途、歡迎訊息送到系統訊息頻道和擁有者私訊、重新邀請不再送 | `WelcomeDemo`：頻道歡迎 → 擁有者私訊 → 點「開始設定」 |
| `login` | Discord 登入（只讀名稱與頭像）、四張導覽、之後登入去哪裡、30 天／7 天的登入期限、兩種登入錯誤 | `LoginDemo`：`login` → `welcome` |
| `setup-wizard` | 五步每一步的欄位與畫面字、四種伺服器狀態、預設手續費表、建立後的「設定完成！開始使用」清單、取消、每日上限、建立失敗的四種訊息 | `setup-1` 到 `setup-5` 各一段 `DashboardDemo`，每日上限用 `DashboardShot` |
| `first-order` | 推薦 /fp、先開一筆小額訂單自己付、擁有者也要有管理員身分組、三步帶過並連到 `/payments/fp` | `FirstOrderDemo`：fp 示範前半段（輸入到再次確認） |
| `get-paid` | 通知送到三個地方與各自的條件、開單分類的影響、改名換分類、去後台看訂單 | `GetPaidDemo`：訂單頻道收到通知並換到已付款 → 付款者私訊 → 日誌頻道 |

## 2. 新增或修改的檔案

- `content/docs/index.mdx`、`content/docs/getting-started/*.mdx`（六頁，`meta.json` 沒動）
- `components/demos/getting-started/`
  - `dashboard-demos.tsx`：登入與精靈五步的 `DashboardDemo`
  - `home-demo.tsx`、`welcome-demo.tsx`、`first-order-demo.tsx`、`get-paid-demo.tsx`
  - `getting-started-demos.test.tsx`（52 個測試：時間軸 6–15 秒、座標在 0–1、最後一格是完整故事、每格畫得出來、手機用手機版截圖、減少動態的數字標號；歡迎私訊與頻道版只差第一段、按鈕相同）
- `docs/phase2/reports/getting-started.md`（本檔）

共用檔案（`components/demo`、`components/discord`、`lib`、`scripts`、產生檔、`WRITING.md`）都沒有改。

## 3. 驗證

- `npm test`：25 個檔案、327 個測試通過。`npm run typecheck`、`npm run lint` 無輸出。`npm run build` 通過（44 頁）。`npm run check:export`：「check:export 通過（out/ 25.01 MB）」。
- dev server：`npx next dev --webpack -p 3301`，做完已用 `taskkill /PID … /T /F` 關掉（只關自己開的）。
- Playwright：7 頁 × 6 種模式（1280 深色、1280 淺色、375 深色、375 淺色、1280 減少動態、375 減少動態；淺色用 `localStorage.theme=light`），整頁一張，每段示範在 3 秒、6.5 秒各一張（減少動態一張），共 142 張；另外拍了點擊瞬間的格子。沒有 console error，沒有橫向捲動。截圖在 `C:\Users\LD\AppData\Local\Temp\claude\C--Users-LD-PycharmProjects-FuniPayment\030d32cc-e516-4348-9c9a-f415fc2cd6e7\scratchpad\shots\` 和 `…\frames\`（不在 repo 裡）。
- 歡迎訊息示範的「開始設定」座標是在本頁用 `getBoundingClientRect` 量的（1280：寬版 640 畫布、375：窄版 400 畫布）。原本寬版把頻道和私訊上下疊在一起，舞台超過 1000 px 高，改成兩種版面都一次一個視窗。
- 看截圖後的調整：精靈第一步原本「點」可設定的伺服器，但截圖沒有選取後的狀態，看起來像沒反應，拿掉點擊；狀態表在 375 寬第三欄擠成一字一行，改成表格上方一句「只有標「可設定」的選得到」。
- 每頁跑過 `humanizer:humanizer`，之後用腳本把三頁 MDX 與 demo 裡每個「」對照 `bot-ui.generated.ts`、bot 的 `web/src` 和 `app/i18n`，全部找得到（示範用的分類名「已付款」原本加了「」，已拿掉）。
- 對照來源查過的行為：歡迎訊息只在伺服器沒有設定時送（`guide.py` `on_guild_join`），系統頻道要有傳送訊息和嵌入連結權限，私訊失敗只記 log；付款完成通知的三個去處與條件（`bot/notifier.py` `payment_completed`、`client.py` `send_dm_to_user`／`send_to_log_channel`）；擁有者沒有管理員身分組也不能用 /fp（`checks.py` `require_roles` 只看身分組）；登入期限（`web_sessions.py` 30 天／7 天）；精靈的必填規則（`web/src/lib/setup.ts` `canAdvance`）與建立失敗的字（同檔 `ERRORS`，跟 `app/i18n/dashboard.py` 的 API 字不同，頁面照網頁上的）。

## 4. 需要但沒有的素材

不急，現在的示範都能看懂；有的話示範會更完整。

- 精靈填好的狀態（`scripts/capture.config.mjs`），讓示範能「點了才變」：
  - `setup-1-selected`：`/setup`，點「星光遊戲社」那張卡（radio `value` 是它的 id），目標 `server`、`next`（按鈕變成可按）。
  - `setup-2-filled`：第二步選「管理員身分組」= 管理員、「日誌頻道」= #日誌，目標同 `setup-2`。
  - `setup-3-filled`：第三步填好四個欄位（商家代號 24680、其他用遮罩），目標同 `setup-3`。
- 導覽的其他三張：`welcome-2`（「你需要準備」，按一次「下一張」）、`welcome-4`（最後一張，目標 `start`＝「開始設定」）。
- 建立後的總覽：`overview-welcome`，`/servers/<id>?welcome=1`，示範訂單清空（沒有訂單時清單三項都未完成），目標 `checklist`（卡片標題「設定完成！開始使用」）。現在的 `overview` 截圖有 `checklist`，但標題是「開始使用」，所以頁面只用文字描述。

ui.json 不需要新 key。沒有留 `TODO`。

## 5. 應該合進共用的東西

沒有在自己資料夾做新元件。不過這一章直接 import 了收款章的東西，建議主 session 移到共用的地方，避免收款章改動時這裡壞掉：

- `components/demos/payments/fp-demo.tsx` 的 `FpScreen`、`LAYOUTS`、`Screen`（`first-order-demo.tsx` 用）
- `components/demos/payments/channel-automation-demo.tsx` 的 `ChannelAutomationScreen`、`LAYOUTS`、`STAGES`（`home-demo.tsx`、`get-paid-demo.tsx` 用）
- `components/demos/payments/kit.tsx` 的 `TicketCategories`

## 6. 不確定、所以沒寫或寫得保守的事

- 每日建立上限的數字：bot 預設 `onboarding.daily_create_limit: 3`，但正式環境的 `config.yml` 我沒讀（含密鑰），所以頁面只寫「有上限」。確認是 3 的話可以補上。
- 邀請連結（含 `client_id=993780236871290910`）取自官網專案 `funipay_site/content/site.ts` 的 `BOT_INVITE_URL`，權限值 125968 跟 bot 的 `BOT_PERMISSIONS` 一致。官網按鈕上的字沒查到，頁面寫「官網上的邀請按鈕」。
- `invite` 的權限表用 Discord 中文介面的權限名稱（檢視頻道、傳送訊息、嵌入連結、附加檔案、讀取訊息歷史、管理頻道、管理訊息），是從位元值換算的，不是 bot 的字，所以沒有加「」。用途照 `dashboard_links.py` 的註解。
- 速買配申請流程、審核多久、手續費怎麼跟速買配分：bot 裡沒有，沒寫。只連到 `https://www.smilepay.net/`（導覽頁的「前往速買配申請」）。
- 「點了「開始設定」但還沒登入」：登入後會回到首頁（`auth.py` 轉到 `/servers`），所以伺服器不會自動選好；頁面只說「已經登入的話會先幫你選好」。

## 7. 發現的 bot／後台問題（只記錄，沒改）

- `web/src/lib/login-errors.ts` 還留著 `no_servers`：「…只有在 FunI 付款系統登記為伺服器擁有者的帳號才能登入。」v1.0.0 已經開放任何人登入，後端也不再產生這個錯誤碼，可以刪掉。
- 精靈建立失敗的訊息有兩套：API（`app/i18n/dashboard.py`，例如「這個伺服器已經設定過了」）和網頁（`web/src/lib/setup.ts` `ERRORS`，例如「這個伺服器剛剛已經被設定了，請選擇其他伺服器。」）。API 只回錯誤碼（`onboarding.py` `_REFUSALS`），使用者看到的是網頁那套；`dashboard.py` 那幾句我沒找到在哪裡顯示，兩邊的字也不一樣。
- 從 Discord 的「開始設定」（`/setup?server=…`）進來時若還沒登入，登入後不會帶著 `server` 回到精靈，要自己再選一次。
