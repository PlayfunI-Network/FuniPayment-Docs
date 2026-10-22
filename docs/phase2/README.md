# 第二階段：平行撰寫頁面

這個資料夾是交給其他 Claude Code session（可以是另一個帳號）的工作說明。每份 `<章節>.md` 是一個獨立任務，一個 session 做一份。

## 給擁有者：怎麼交出去

1. 在另一個帳號的 Claude Code（桌面版或 CLI 都可以）開一個新 session，資料夾選 `C:\Users\LD\WebstormProjects\FuniPayment-Docs`。
2. 第一次使用那個帳號時，先在終端機裝 humanizer：

   ```bash
   claude plugin marketplace add blader/humanizer
   ```

   ```bash
   claude plugin install humanizer@humanizer
   ```

3. 把下面這句貼給 session（`<章節>` 換成檔名，例如 `payments`）：

   > 請完整讀 `docs/phase2/README.md` 和 `docs/phase2/<章節>.md`，照裡面的規則把這份任務做完。

4. 同時跑 2 到 3 個就好。每個 session 都會開 dev server 和 Playwright，這台電腦程序太多時 Next.js 會啟動失敗（錯誤碼 0xc0000142）。建議順序：

   | 批次 | 任務 |
   |---|---|
   | 第一批 | `payments`、`dashboard`、`balance` |
   | 第二批 | `getting-started`、`reference` |

5. 每個 session 做完會把回報寫在 `docs/phase2/reports/<章節>.md` 並 commit 在自己的分支。全部做完後回到原本的 session 說一聲，由它檢查、合併、驗收。

## 給執行的 session：共同規則（必讀）

### 開始之前

- 先讀：`docs/superpowers/specs/2026-10-21-docs-site-design.md`（設計規範，第 2、3、4.4、4.5、4.6、6 節）、`docs/WRITING.md`（撰寫手冊，照它寫）、範例頁 `content/docs/payments/fp.mdx` 與 `components/demos/payments/fp-demo.tsx`（品質標準）。
- bot 專案在 `C:\Users\LD\PycharmProjects\FuniPayment`（分支 `release/v1.0.0`），**只能讀，不能改**。它的 `CLAUDE.md` 有整體架構。所有事實以程式碼為準。

### 工作區（避免互相蓋掉）

- 不要在 `C:\Users\LD\WebstormProjects\FuniPayment-Docs` 本身改檔案。先建立自己的 worktree：

  ```bash
  git -C C:/Users/LD/WebstormProjects/FuniPayment-Docs worktree add ../FuniPayment-Docs-<章節> -b phase2/<章節> docs-v1
  ```

  然後在 `C:\Users\LD\WebstormProjects\FuniPayment-Docs-<章節>` 裡 `npm install`，之後所有工作都在這個資料夾。
- 只改你那份任務列出的資料夾：`content/docs/<章節>/`（任務檔列出的頁面）與 `components/demos/<章節>/`，加上你的回報檔。共用的東西（`components/discord/`、`components/demo/`、`lib/`、`scripts/`、`content/*.generated.*`、`public/demo/`、`docs/WRITING.md`、`mdx-components.tsx`、`package.json`）一律不改。
- 缺共用元件時，先在自己的 `components/demos/<章節>/` 裡做，回報裡寫清楚，之後由主 session 合進共用。
- 缺 bot 畫面（ui.json key）或後台截圖時，不要自己加。先用現有素材（`npm run list:materials` 列出全部），真的沒有就在回報裡列出需要什麼，該段示範先留 `{/* TODO: 需要素材 … */}`。

### 開發與驗證

- dev server 用 `npx next dev --webpack -p <你的 port>`（這台電腦 Turbopack 會失敗）。port 用任務檔指定的。
- 只關你自己開的程序（記下 PID，用 `taskkill /PID <pid> /T /F`）。不要動其他程序。
- 每頁都要：照 WRITING.md 的骨架、bot 字逐字對來源、用 humanizer skill（`humanizer:humanizer`）跑過、1280 與 375 寬、深淺色、減少動態都用 Playwright 截圖看過。
- 全部做完：`npm test && npm run typecheck && npm run lint && npm run build && npm run check:export` 都要通過。

### 提交與回報

- 在自己的分支 commit，訊息結尾加：

  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

- **不要 push、不要 merge、不要改 `docs-v1` 或其他分支。**
- 回報寫在 `docs/phase2/reports/<章節>.md`（一併 commit），內容：
  1. 完成的頁面清單與每頁一句說明
  2. 新增或修改的檔案
  3. 驗證結果（指令與輸出摘要、截圖位置）
  4. 需要但沒有的素材（ui.json key、後台截圖與目標元素），以及暫時留 TODO 的位置
  5. 在自己資料夾裡做的、應該合進共用的元件
  6. 查不到、不確定、所以沒寫的事實
  7. 發現的 bot 或後台問題（只記錄，不要改 bot）
