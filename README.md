# FunI 付款系統 說明文件（docs.funipay.net）

FunI 付款系統（Discord 收款機器人）的使用說明。用 [Fumadocs](https://fumadocs.dev) 與 Next.js 16 做成純靜態網站（`output: "export"`），沒有後端，建置後只有 `out/` 資料夾的靜態檔案。內容只有繁體中文。

## 指令

```bash
npm install
npm run dev         # 開發伺服器 http://localhost:3000
npm run build       # 建置，輸出到 out/（含搜尋索引 out/api/search）
npm test            # 單元測試（Vitest）
npm run lint
npm run typecheck
```

其他指令：

- `npm run check:export`：建置後檢查 `out/`（必要檔案、禁用字詞、大小上限）。
- `npm run sync:bot`：從機器人專案同步 bot 上的文字，產生 `bot-ui.generated.ts`。
- `npm run capture`：重新擷取後台截圖。

## 內容怎麼改

- 頁面都在 `content/docs/`，一頁一個 `.mdx`，網址就是檔案路徑（`content/docs/payments/fp.mdx` 是 `/payments/fp`），文件放在根路徑，不帶 `/docs`。
- 每個資料夾的 `meta.json` 決定側邊欄的標題與順序。
- 站名、導覽列連結在 `lib/layout.shared.tsx`；顏色與字型在 `app/globals.css`，色彩 token 與官網（funipay.net）一致，深色為預設，可切淺色。
- 搜尋是建置時產生的靜態索引，瀏覽器自己下載後搜尋。中文用 `lib/search.ts` 的 `tokenizeZh` 斷詞（單字加相鄰雙字），伺服器端建索引與瀏覽器端查詢共用同一個。

## 部署到 Cloudflare

設定檔是 `wrangler.jsonc`（Workers 靜態資源，目錄 `./out`，找不到頁面時回傳 `404.html`）。

### 手動部署

```bash
npx wrangler login        # 第一次，瀏覽器登入 Cloudflare
npm run build
npx wrangler deploy
```

第一次部署後，到 Cloudflare 控制台 Workers & Pages → `funipay-docs` → Settings → Domains & Routes，新增自訂網域 `docs.funipay.net`。

### 或：連接 Git（Workers Builds）

在 Workers & Pages → `funipay-docs` → Settings → Builds 連接 Git 儲存庫，Build command 填 `npm run build`，Deploy command 填 `npx wrangler deploy`。之後每次推送到指定分支自動部署。

### 關於 Vercel

Vercel 的 Hobby 方案禁止商業用途，要用就得升級 Pro（每月 US$20）。這個網站有商業性質，所以預設用 Cloudflare。
