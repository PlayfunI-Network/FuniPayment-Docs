# 任務：重拍後台截圖，讓桌機全景就看得清楚（recapture）

先讀 `docs/zoom-fix/README.md` 的共同規則（判斷規則、工作區、驗證、提交方式都照它），再讀四份回報：`docs/zoom-fix/reports/dashboard.md`、`getting-started.md`、`others.md`（後台示範的部分）。

- 分支／worktree：`zoom-fix/recapture`、`../FuniPayment-Docs-zoom-recapture`（從最新的 `docs-v1` 開）
- dev server port：`3205`；capture 用預設的 port（`CAPTURE_*`），同時間只有你在跑 capture。

## 為什麼要做

第一輪之後，Discord 示範都不放大了，但後台截圖示範在桌機上每一步還是放大：截圖是 1280 寬的後台頁面，塞進 678 px 的舞台（設定精靈 635 px）只剩 0.53 倍，後台 11.5–13 px 的字只剩 6–7 px，表單下方還有一大片空白。擁有者決定：**用真實後台重拍成比較窄的截圖，讓桌機全景就看得清楚**，而不是靠鏡頭放大。

## 目標

- 每張桌機截圖，在 678 px 的舞台全景下（精靈用 635 px），**示範的 caption 指到的字至少 11 px，盡量 12 px**。換算：截圖的 CSS 寬 ≤ 舞台寬 × 字級 ÷ 目標字高，例如 12.5 px 的表單字要到 11 px，截圖 CSS 寬要 ≤ 約 770 px。
- 截圖一定是**真的後台畫面**：只能改 `scripts/capture.config.mjs` 的視窗大小（`viewport`）、裁切（`crop`）、目標。不能注入 CSS、改 DOM、合成或後製圖片，bot 專案一律只讀。
- 做法自己量了再決定，可以混用：
  - 視窗改窄：後台在較窄的視窗會換版面（例如側邊欄收起），那也是真實的後台。先讀 bot 的 `web/src` 找斷點，確定各頁在新寬度下是什麼樣子。
  - 用 `crop` 裁到主內容（去掉側邊欄、表單下方的空白）。
  - 截圖變高沒關係：舞台最高 0.72（寬的倍數），更高的會像網頁一樣自動捲到目標。
- 有 `desktopTargets`（側邊欄、桌機才有的表格欄位）的截圖要特別小心：裁掉或換版面後目標不見的話，`npm run capture` 或示範會報錯。哪些示範用到哪些目標，查 `components/demos/` 裡用 `DashboardDemo` 的檔案，以及頁面上的 `<DashboardShot>`、`<DashboardCommandReplies>`。保不住的目標列在回報裡，並寫出建議的替代目標。

## 範圍

1. 重拍 `scripts/capture.config.mjs` 裡所有桌機截圖（含 login、welcome 導覽、`/setup` 精靈）。手機版截圖已經夠清楚，原則上照舊，但 capture 會一起重拍，看一下沒有變壞。
2. 順便補回報裡要的目標（拍了才有座標）：
   - 儲存列：只框「1 項未儲存的變更：…」和「已儲存」那段字的窄目標（現在的 `changes`／`saved` 撐滿整列，883 px 寬）。
   - `settings-channels-edited` 的 `expiredName`（「訂單過期時」那列的新名稱輸入框）。
   - `setup-5` 摘要各區（伺服器、頻道、速買配、付款方式）各一個目標，加上同意那整行（`label`）。
   - `setup-1`／`setup-1-help` 的「可設定」狀態標籤。
   - `setup-4` 的付款方式清單（整張卡片的 `ul`）和每一列。
   - 點數系統「功能開關」整張卡、付款方式那一列整列這類「能框住整列」的目標：讓示範游標點開關時，鏡頭（如果還需要）可以框住整列。
3. **不改**示範的步驟（`components/demos/**`）；那是下一輪三個 session 的事。但重拍後示範必須還能跑：`npm test`、`npm run build` 要過。目標名稱不要改名；真的要改，在回報裡列出舊名→新名。
4. 用到截圖的頁面（`<DashboardShot>`、`<DashboardCommandReplies>`、所有後台示範）在 1280／375、深淺色都截圖看過，確定沒有被切壞。

README 說共用的 `scripts/`、`public/demo/` 不能改；這份任務是例外。可以改的檔案：`scripts/capture.config.mjs`、`public/demo/dashboard/`、`content/dashboard-shots.generated.json`，必要時 `scripts/capture-dashboard.mjs`（只能加功能，例如新的目標寫法，不能改成合成畫面），加上你的回報。

## 回報

寫在 `docs/zoom-fix/reports/recapture.md`（一併 commit），內容：

1. 每張截圖：原本的視窗／裁切 → 新的視窗／裁切、新的 CSS 寬，以及 caption 會指到的字在 678（精靈 635）舞台全景下的字高
2. 新增的目標（名稱、截圖、選擇器）
3. 消失或改名的目標，以及受影響的示範與建議
4. 還是做不到 11 px 的截圖和原因
5. 驗證結果（指令與輸出摘要、截圖位置）
