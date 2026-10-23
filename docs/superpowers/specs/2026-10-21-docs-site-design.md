# FunI 付款系統 說明文件網站（docs.funipay.net）設計

日期：2026-10-21
狀態：草稿，待確認

## 1. 為什麼要重做

docs.funipay.net 目前放在 GitBook，內容停在 v0.x：邀請制試用申請、在私訊用 `/setting` 設定、「NewebPay 開發中」。這些在 v1.0.0 全部不存在了。v1.0.0 起，任何人都能在網頁後台（dashboard.funipay.net）透過五步設定精靈自己開通，`/settings` 只剩一個連到後台的按鈕。

以前「怎麼設定」和「這個功能怎麼用」是問得最多的問題。新文件要讓新商家**照著新版流程一步一步做，不用私訊問人就能設定完、開出第一張單**；之後每個功能都有一頁，打開就有一段跟 bot 實際畫面一樣的 demo 動畫，看完就懂。

GitBook 不再使用。網站改成一個普通的程式碼專案，內容是 MDX 文字檔，由 Claude 維護。

## 2. 目標、非目標、反目標

**目標**

- 看起來、用起來像一般的文件網站：左側目錄、右側本頁大綱、全站搜尋（中文要搜得到）、上一頁／下一頁、提示框、步驟區塊、深淺色。
- 主線照新商家的實際順序：開始之前 → 邀請機器人 → 登入後台 → 設定精靈 → 開出第一張單 → 收款與通知。
- 每個功能頁都有對應的 demo 動畫，畫面貼近 bot 的實際顯示（文字、顏色、欄位、按鈕都對得上）。
- Dashboard 的 demo 用真實介面截圖加上游標、點擊與「跟著游標放大」的鏡頭動畫。
- 純靜態輸出，可以免費部署在 Cloudflare（主要）或 Vercel。
- 內容好維護：改字只要改 MDX；bot 文案改了，重新產生一次資料檔就跟上。

**非目標**

- 不做多語系，只有繁體中文。
- 不寫 bot 擁有者專用的功能（`/admin` 後台、`!pf sync`、加密備份、遷移、停權操作）。
- 不放服務條款與隱私權政策全文，連到官網的 `/terms`、`/privacy`。
- 不做影片檔 demo。

**反目標（做到了也算失敗）**

- demo 畫面看起來是編出來的：文字、按鈕或欄位跟 bot 實際不一樣。
- 文字讀起來像 AI 寫的：空泛開場、「不僅……更……」、到處是破折號與粗體標籤、硬湊三點。
- demo 太花俏，看完反而不知道要按哪裡。一段 demo 只示範一件事。
- 出現真實商家或顧客資料。
- 出現已經不存在的東西（申請試用、私訊設定、NewebPay、信用卡）。

## 3. 讀者

| 讀者 | 他們來找什麼 | 主要章節 |
|---|---|---|
| 準備開始用的商家（伺服器擁有者） | 怎麼從零設定好 | 開始使用 |
| 伺服器管理員 | 指令怎麼用、為什麼不能用 | 收款、點數、其他功能、疑難排解 |
| 商家（日常營運） | 後台各頁在看什麼、設定怎麼改 | 網頁後台 |
| 付款的顧客 | 怎麼付款、付完多久會好 | 給顧客 |

## 4. 已經決定的做法

### 4.1 技術

- **Fumadocs**（建在 Next.js 上的文件框架）+ Next.js 16 App Router + React 19 + Tailwind CSS 4 + TypeScript。版本跟官網 `funipay_site` 對齊。
- `output: "export"` 純靜態輸出到 `out/`。
- 套件管理用 npm（跟官網一樣）。
- 全站搜尋用 Fumadocs 內建的靜態搜尋（Orama），必須設定成中文斷詞也搜得到，例如搜「條碼」要找到四大超商條碼那頁。
- 專案位置：`C:\Users\LD\WebstormProjects\FuniPayment-Docs`（GitHub `PlayfunI-Network/FuniPayment-Docs`），在新分支上原地重寫。GitBook 的檔案（`.gitbook/`、`SUMMARY.md`、舊的 `.md`）移除，保留 `LICENSE`。

### 4.2 部署

- 主要：**Cloudflare Workers 靜態資源**，做法跟官網一樣（`wrangler.jsonc`，assets 目錄 `./out`，404 頁），Worker 名稱 `funipay-docs`，自訂網域 `docs.funipay.net`（DNS 已在 Cloudflare）。
- 附一份 Vercel 部署說明（靜態輸出直接可用）。README 要註明 Vercel Hobby 方案禁止商業用途，所以預設是 Cloudflare。
- 舊 GitBook 網址要轉址到新頁面（例如 `/commands/payment/fp` → `/payments/fp`），用 Workers 靜態資源支援的 `_redirects`。沒有直接對應的舊頁：`apply/free-trail` → `/getting-started/before-you-start`，`settings/setup` → `/getting-started/setup-wizard`，`settings/security` → `/getting-started/before-you-start`，服務條款與隱私權政策 → 官網 `https://funipay.net/terms`、`/privacy`。
- 建置後檢查腳本 `scripts/check-export.mjs`：必要檔案存在、站內連結沒有斷、禁用字詞（見 4.7）不出現、`_redirects` 裡站內目標的頁面存在（指向 funipay.net 的轉址不檢查）。

### 4.3 頁面架構

網址前綴省略 `/docs`，文件就是整個網站。每個章節是一個資料夾，有自己的 `meta.json` 決定排序。

```
/                          介紹：FunI 付款系統是什麼、能做什麼（一段總覽 demo）、從哪裡開始

開始使用 getting-started/
  before-you-start         開始之前：需要什麼（Discord 伺服器的管理權限、速買配商家帳號與三組參數）
  invite                   邀請機器人（權限不要取消勾選、加入後的歡迎訊息）
  login                    登入後台（Discord 登入、第一次的導覽頁 /welcome）
  setup-wizard             設定精靈：五步，每一步一段 demo
  first-order              開出第一張訂單（用 /fp，看到顧客選付款方式）
  get-paid                 收款與通知（付款完成通知會出現在哪三個地方、頻道自動改名）

收款 payments/
  fp                       /fp 快速開單（推薦的開單方式）
  payment-create           /payment create
  buyer-info               購買人資訊與實名規定
  payment-review           /payment review 查詢訂單
  payment-history          /payment history 付款紀錄與統計
  payment-recheck          /payment recheck 重新檢查付款
  channel-automation       訂單頻道自動改名與移動（選擇中／待付款／已付款／已過期）
  expiry                   訂單過期

點數 balance/
  overview                 點數系統是什麼、怎麼開啟（後台「點數」分頁）
  balance-show             /balance show
  balance-transfer         /balance transfer
  balance-history          /balance history 與排行榜
  balance-add-set          /balance add、/balance set（點數管理員）
  top-up                   /top-up 儲值
  pay-with-balance         用點數付款（/fp 的點數選項）

網頁後台 dashboard/
  overview                 總覽與統計（期間、指標、收款趨勢、付款方式、熱門時段、顧客）
  orders                   訂單列表與訂單明細
  settings-basic           設定：基本
  settings-smilepay        設定：速買配
  settings-payment         設定：付款方式與手續費
  settings-channels        設定：頻道（自動改名與移動）
  settings-balance         設定：點數
  settings-history         設定紀錄
  features                 功能頁

其他功能 features/
  auto-publish             /auto-publish 自動發佈
  dynamic-vc-rename        /dynamic-vc-rename 動態語音頻道名稱（含全部變數表）
  dashboard-command        /dashboard 與 /settings
  auto-reply               自動回覆

給顧客 buyers/
  how-to-pay               怎麼付款（銀行轉帳、四大超商條碼、7-11／全家／萊爾富代碼）
  after-paying             付完之後：多久會顯示、去哪裡查
  check-order              查詢自己的訂單

疑難排解 troubleshooting/
  command-errors           指令不能用（頻道限制、身分組、伺服器未設定、付款方式關閉）
  smilepay-errors          速買配錯誤代碼（來源：ui.json 的 smilepay/error_descriptions）
  faq                      常見問題

參考 reference/
  commands                 指令總表（來源：commands.json）
  permissions              誰可以用什麼（身分組對照表）
  fees                     手續費（預設值與超過 1000 元的加收）
```

頁尾連結：官網 funipay.net、服務條款、隱私權政策、社群 Discord（`https://go.funipay.net/discord`）、聯絡信箱 contact@funipay.net。

### 4.4 每一頁的寫法

每個功能頁用同一個骨架，沒有的段落就省略：

1. 一兩句話說明這是什麼、什麼時候用。
2. **demo 動畫**（頁面第一個區塊之一）。
3. 誰可以用（身分組／權限）。
4. 使用步驟（Fumadocs `<Steps>`）。
5. 參數表（指令頁）。
6. 會看到什麼（bot 回覆的內容；不必重複 demo 已經清楚的部分）。
7. 常見狀況（提示框，寫真的會發生的事）。
8. 相關頁面。

寫作規範：

- 繁體中文、台灣用語。稱呼讀者「你」。
- bot 與後台上的字一律用「」括起來，**逐字**照抄來源（見 4.6），例如按下「確認並獲取付款碼」。
- 段落短。不用表情符號裝飾（bot 原文本身有的除外）。少用粗體，不用破折號串句子。
- 每頁寫完都要用 **humanizer** skill（`humanizer:humanizer`）跑過一遍再交。
- 只寫 v1.0.0 現在的行為。不知道的事不寫、不猜，標出來問。

### 4.5 Demo 系統

**原則：一段 demo 只示範一件事，6 到 15 秒，自動播放、循環，看得見的時候才播，不需要聲音。**

**A. Discord 畫面（全部用元件重做）**

- 從官網複製 `components/discord/*`（`DiscordWindow`、`ChannelHeader`、`Message`、`ActionRow`、`Embed`、`DiscordMarkdown`、`SelectMenu`、`DiscordButton`、`SlashPicker`、`Avatar`）、`lib/use-timeline.ts`（含測試）、`components/demos/shared.tsx` 裡通用的部分，以及 `globals.css` 的 `demo-*` keyframes、`--ease-expo`、reduced-motion 區塊。複製時解開對官網 `@/content/site` 的依賴、把寫死的中文抽成參數。
- 缺的元件要補：Modal（填寫購買人資訊）、ephemeral 訊息（「只有你看得到」標示）、私訊視窗、頻道列表（看頻道改名與移動分類）、附件圖片（條碼圖）、語音頻道名稱。
- **文案與 embed 結構的主要來源是 bot 專案的 `tests/snapshots/ui.json`**（每個 embed 的 title、description、color、fields、footer、按鈕、選單都在裡面）。`ui.json` 沒有的部分另外從程式碼取：購買人資訊 Modal 的欄位從 `app/i18n/consumer_info.py`、`app/bot/views/consumer_info.py`；頻道改名與移動的預設名稱從 `app/db/settings_schema.py`。寫一個腳本 `scripts/sync-bot-ui.mjs`，讀 bot 專案（路徑用參數或環境變數給，預設 `../../PycharmProjects/FuniPayment`）的 `ui.json` 與 `commands.json`，產生 `content/bot-ui.generated.ts`：
  - 只挑 demo 用到的 key（清單寫在腳本裡，檔案存 UTF-8；key 必須完全相符，找不到就報錯，因為有些 key 含中文測試值）。
  - 把測試用的假值換成示範用的虛構值：「測試商店」換成示範商店名，`https://cdn.test/...` 換成虛構頭像，`<@333…>` 這類 mention ID 對應到示範人物名（對照表寫在腳本裡），固定 ID 換成好看的假訂單號，`<t:TS:R>` 換成相對時間標籤，固定日期（例如付款期限）換成相對於示範時間的日期。
  - **數字也可以改，但要一致**：每段 demo 先定一個「情境」（金額、付款方式、顧客），腳本用跟 bot 一樣的手續費規則（`app/services/fees.py` 的預設值）重新算手續費與總額，填進每個用到的 embed。同一個故事裡（例如 /fp → 選擇付款方式 → 訂單建立 → 付款完成）金額、手續費、訂單號必須前後一致。只改值，不改欄位名稱、順序、按鈕文字。
  - 外部圖片不直接連：footer 圖示（目前連到 `i.imgur.com`）複製進 repo 的 `public/`。
  - 產生的檔案要提交進 repo（部署時不需要 bot 專案）。
- 再做一個 `<SnapshotEmbed id="flow/fp_command/ok" />` 這類的元件，直接把產生的資料畫成 Embed / 按鈕列 / 選單。demo 腳本只負責「什麼時候出現什麼」，不手打 bot 的字。
- 官網的 demo（`components/demos/*`）文字來自手寫的 `content/bot-copy.ts`；搬過來的部分要改接 `bot-ui.generated.ts`，不能直接照搬。
- 顏色以 `ui.json` 的 color 為準（例：/fp 0x00b7ff、訂單建立 0x0fae22、付款完成 0x2b3f5e、查詢與後台連結 0xd5ce07、失敗 0xf81818 / 0xff0000），footer「Powered by PlayfunI Network」。
- Discord 視窗一律深色（跟官網一樣），不跟網站的深淺色切換。

**B. Dashboard 畫面（真實截圖 + 動畫）**

- 截圖腳本 `scripts/capture-dashboard.mjs`（Playwright）：在 bot 專案 `web/` 跑 `node e2e/fake-api.mjs 8399`（唯讀使用，不改 bot 專案的任何檔案），前面接一層 docs repo 自己的 `scripts/demo-api.mjs`（從官網複製後擴充）把資料換成示範用的虛構資料，再啟動 bot 專案的後台（`pnpm dev`，需要 Node 22 與 pnpm，`FUNIPAY_API_URL` 指向 demo-api），依清單截圖。設定精靈每一步、設定每個分頁、總覽、訂單列表與明細、設定紀錄、功能頁都要有。深色淺色各一張，WebP，2 倍解析度。腳本可以一鍵重跑（自己啟動與關閉這三個程序）。
- demo-api 要改寫的不只總覽與設定：精靈（`/api/onboarding/*`、新使用者身分）、訂單列表與明細、設定紀錄、功能頁的「測試伺服器」「開發者」等測試值都要換掉。
- 示範商店沿用官網的「星光遊戲社」，Discord demo 與後台截圖用同一家店、同一批人物，跟官網一致。
- 同時把每張圖上「要點的元素」的位置（用 selector 量出 bounding box）存成 JSON，demo 的游標與鏡頭直接用這些座標，介面改版重拍後座標也跟著更新。
- 截圖跟著網站主題切換深色淺色。

**C. 鏡頭與游標（兩種 demo 共用）**

- `<DemoStage>`：外框，固定比例，`role="img"` + 中文 `aria-label`，內容 `aria-hidden`；看得見 30% 才播放、離開畫面或分頁隱藏就暫停（沿用 `useTimeline`）。
- `<Camera>`：時間軸上每一步可以設 `zoom` 與 `focus`（以畫面百分比或元素座標），用 CSS transform 平滑過渡（`--ease-expo`）。游標移到目標時放大對準，點擊後停一下再拉回全景。
- `<Cursor>`：沿路徑移動，點擊時有按下與漣漪效果，打字時顯示輸入游標。
- 每段 demo 可選擇在下方顯示目前步驟的一行說明（例如「1 選擇付款方式」），跟時間軸同步。
- **減少動態（prefers-reduced-motion）**：不播放，直接顯示最後一格；Dashboard demo 改顯示全景截圖加上數字標號。
- 手機寬度（375px）也要清楚：鏡頭放大倍率在窄畫面自動調高，或改用直式截圖。

**D. 檔案大小**：不使用影片。單張截圖控制在 200 KB 以內，每頁 HTML 控制在 500 KB 以內，整站靜態檔案控制在 60 MB 以內（Cloudflare 沒有整站上限，單一檔案上限 25 MB）。

### 4.6 正確性的來源

| 內容 | 來源（bot 專案 `C:\Users\LD\PycharmProjects\FuniPayment`） |
|---|---|
| Discord 訊息、embed、按鈕、選單 | `tests/snapshots/ui.json`（經 `sync-bot-ui.mjs`） |
| 指令名稱、參數、中文翻譯、權限 | `tests/snapshots/commands.json`、`app/bot/checks.py` |
| 其他 bot 文字 | `app/i18n/*.py` |
| 後台畫面 | 截圖腳本；後台文字 `app/i18n/dashboard.py`、`web/src` |
| 行為細節（多久過期、每頁幾筆、改名限制等） | `app/services/*`、`app/bot/cogs/*`、`CLAUDE.md` |
| 手續費預設值 | 設定精靈、`app/db/settings_schema.py` |
| 版本與已移除的功能 | `docs/database/upgrade-v0.8.0-to-v1.0.0.md` |

文件以 bot `release/v1.0.0` 分支為準。

### 4.7 外觀

- 沿用官網的品牌：顏色 token（`--ground`、`--card`、`--line`、`--fg`、`--muted`、`--brand` #5aa9d6 等）套進 Fumadocs 主題，深色為預設；Geist 字型；logo `funi-logo.webp`、icon `funi-icon.png`（從官網 `public/brand/` 複製）。
- 禁用字詞（建置檢查）：信用卡、免費試用、申請試用、NewebPay、藍新、公測期間全部免費。

## 5. 工作切分

**第一階段（一個 session，必須先完成）：地基**

1. Fumadocs 專案骨架、主題、部署設定、`_redirects`、建置檢查。
2. 全部頁面的空殼（每頁標題 + 一句說明 + `TODO`），目錄排序完成。
3. Demo 系統：複製並整理 Discord 元件、補齊缺的元件、`DemoStage` / `Camera` / `Cursor`、`sync-bot-ui.mjs` + `SnapshotEmbed`、`capture-dashboard.mjs` + 座標 JSON。
4. 一份撰寫手冊 `docs/WRITING.md`（給之後每個 session 看）：頁面骨架、寫作規範、怎麼寫一段 demo（附範例）、怎麼加截圖、驗收清單。
5. 兩個**範例頁**做到完成品質，當作其他頁的標準：`payments/fp`（Discord demo）與 `getting-started/setup-wizard`（Dashboard demo）。
6. 驗收後再開第二階段。

**第二階段（平行，每個 session 只動自己的資料夾）**

| Session | 負責 | 備註 |
|---|---|---|
| 開始使用 | `getting-started/`（setup-wizard 除外，已完成）、首頁 `/` | |
| 收款 + 給顧客 | `payments/`（fp 除外）、`buyers/` | |
| 點數 | `balance/` | |
| 網頁後台 | `dashboard/` | 截圖多，需要跑截圖腳本 |
| 其他 + 疑難排解 + 參考 | `features/`、`troubleshooting/`、`reference/` | |

規則：

- 每個 session 只能改自己負責的 `content/` 資料夾與自己的 `components/demos/<章節>/`。共用元件（`components/discord/`、`components/demo/`、腳本）有缺，先在自己的 demo 資料夾裡做，最後回報，由第一階段的 session 合進共用。
- 需要新的 `ui.json` key 或新的截圖，在回報裡列出，由主 session 加進清單統一重新產生（避免兩個 session 同時改產生檔）。
- 每個 session 在自己的 git worktree 分支上工作，不推送。

**第三階段（主 session）**：合併分支、統一重新產生 bot 資料與截圖、全站驗收。擁有者確認網站後才部署：用 wrangler 部署 `funipay-docs` Worker，再把 docs.funipay.net 從 GitBook 移到 Cloudflare（先解除 GitBook 的自訂網域與 DNS 記錄，再在 Worker 加上自訂網域）。需要擁有者在 Cloudflare 或 GitBook 控制台操作的步驟，寫成逐步說明交給擁有者。

## 6. 驗收清單（每頁）

- 文案逐字對得上來源；沒有不存在的功能。
- demo 在 1280px 與 375px 都清楚；深色淺色都正常；減少動態時顯示最後一格。
- demo 跟 bot 實際畫面對照過（`ui.json` 的對應 key）；有疑問的地方在回報中列出。
- humanizer 跑過。
- `npm run build && npm run check:export` 通過，站內連結沒有斷。

## 7. 留給建置者決定的事

- Fumadocs 的版本與具體設定方式、MDX 元件的命名細節。
- 示範用的虛構商店名、顧客名、訂單號（不能像真的商家；官網用「商家」「顧客」這種角色名）。
- 每段 demo 的精確時間軸與鏡頭倍率。
- 截圖的確切視窗大小與裁切。
- 共用元件從官網複製後的整理方式（複製，不做成共用套件）。
