# 拿掉沒必要的放大

這個資料夾是交給其他 Claude Code session（可以是另一個帳號）的工作說明。每份 `<組>.md` 是一個獨立任務，一個 session 做一份。

## 為什麼要做

示範動畫很多地方在同一個畫面裡、字也不小，鏡頭卻硬要拉近（`zoom: 1.6`、`zoomTo(l, 1.3, …)` 這類）。本來全景就看得清楚的東西還特地放大，看起來很奇怪，也不合直覺。這次要把每個示範的每一步都檢查過，沒必要的放大全部拿掉，讓畫面不用放大也看得清楚。

示範仍然要是**真實的示範**：畫面、bot 的字、點擊順序都照程式碼和真實後台，不能為了不放大而改成假的畫面。

## 給擁有者：怎麼交出去

1. 在另一個帳號的 Claude Code 開新 session，資料夾選 `C:\Users\LD\WebstormProjects\FuniPayment-Docs`。
2. 把下面這句貼給 session（`<組>` 換成檔名）：

   > 請完整讀 `docs/zoom-fix/README.md` 和 `docs/zoom-fix/<組>.md`，照裡面的規則把這份任務做完。

3. 四組：`dashboard`、`getting-started`、`payments`、`others`。這台電腦同時跑太多 dev server 會讓 Next.js 啟動失敗（0xc0000142），建議先跑前三組，有一組做完再開 `others`。
4. 每個 session 做完會把回報寫在 `docs/zoom-fix/reports/<組>.md` 並 commit 在自己的分支。全部做完後回到原本的 session 說一聲，由它檢查、合併。

## 給執行的 session：共同規則（必讀）

### 開始之前

- 先讀 `docs/WRITING.md` 第 4 節「鏡頭與游標」（特別是新加的第一條「預設不放大」），以及 `lib/camera.ts`、`components/demo/canvas.tsx`（`zoomTo`）、`components/demo/dashboard-demo-steps.ts`（後台示範的 `zoom`）。
- bot 專案在 `C:\Users\LD\PycharmProjects\FuniPayment`（分支 `release/v1.0.0`），**只能讀，不能改**。

### 判斷規則

每個示範的**每一步**都要判斷，不是只看有沒有 `zoom` 這個字：

1. **先看全景。** 把那一步改成全景（`zoom: 1` 或拿掉 `shot`），在桌機（viewport 1280）和手機（viewport 375）兩種寬度截圖。
2. **量字的大小。** 用 Playwright 讀 caption 指的那段字的 `getBoundingClientRect` 和 computed font-size，乘上舞台的縮放比例，算出實際顯示的字高。
3. **決定：**
   - 全景下兩種寬度的字都 ≥ 11 px、目標一眼找得到 → **拿掉放大**。這是大部分的情況。
   - 只有手機太小 → 先修窄版的版面（Discord 示範的窄畫布、後台示範的手機版截圖），讓手機全景也看得清楚；桌機不放大。
   - 修版面也做不到（例如 1280 寬的後台截圖塞進舞台，表格的字只剩 7 px）→ 才可以放大，倍率用剛好讓字到 12–13 px 的最小值，並在回報裡寫出量到的數字。
4. **不要來回拉。** 連續幾步都在同一區時，不要每步都放大再拉回、或換一個倍率。鏡頭動一定要有理由（目標移到畫面外、要看變化的全景）。
5. **畫面可以修，但要真實。** Discord 示範可以把畫布裁小、去掉多餘空白、窄版另排，讓字在全景就夠大；後台示範不可以改截圖內容或自己合成畫面。

既有的規則照舊：有點擊要分兩步、要看變化時拉回全景、最後一格是可以單獨看懂的全景、減少動態模式要正常。

### 工作區（避免互相蓋掉）

- 不要在 `C:\Users\LD\WebstormProjects\FuniPayment-Docs` 本身改檔案。先建立自己的 worktree：

  ```bash
  git -C C:/Users/LD/WebstormProjects/FuniPayment-Docs worktree add ../FuniPayment-Docs-zoom-<組> -b zoom-fix/<組> docs-v1
  ```

  然後在 `C:\Users\LD\WebstormProjects\FuniPayment-Docs-zoom-<組>` 裡 `npm install`，之後所有工作都在這個資料夾。
- 只改任務檔列出的檔案，加上你的回報檔。共用的東西（`components/demo/`、`components/discord/`、`lib/`、`scripts/`、`public/demo/`、`docs/WRITING.md`、`mdx-components.tsx`、`package.json`）一律不改。覺得共用元件需要改（例如後台示範需要能固定框住某一區），寫在回報裡，由主 session 處理。
- 頁面文字（MDX）原則上不動。只有 caption 或內文提到「放大」之類、跟新動畫對不上時才改。

### 開發與驗證

- dev server 用 `npx next dev --webpack -p <你的 port>`（這台電腦 Turbopack 會失敗）。port 用任務檔指定的。
- 只關你自己開的程序（記下 PID，用 `taskkill /PID <pid> /T /F`）。不要動其他程序。
- 每個改過的示範：1280 與 375 寬、深淺色、減少動態都用 Playwright 截圖看過，**每個 caption 那一步都截**。截圖放在 `docs/zoom-fix/reports/<組>/`（不要 commit 圖片，路徑寫在回報裡即可）。
- 改了步驟後，相關的測試（`*.test.ts(x)`）如果寫死了 zoom 值，跟著更新，但不能刪掉測試或放寬檢查。
- 全部做完：`npm test && npm run typecheck && npm run lint && npm run build && npm run check:export` 都要通過。

### 提交與回報

- 在自己的分支 commit，訊息結尾加：

  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

- **不要 push、不要 merge、不要改 `docs-v1` 或其他分支。**
- 回報寫在 `docs/zoom-fix/reports/<組>.md`（一併 commit），內容：
  1. 每個示範一張表：每一步原本的放大、改成什麼、理由（量到的全景字高，桌機／手機）
  2. 保留放大的地方，以及為什麼修版面也做不到
  3. 為了不放大而修過的版面（畫布大小、窄版）
  4. 驗證結果（指令與輸出摘要、截圖位置）
  5. 希望主 session 改的共用元件
