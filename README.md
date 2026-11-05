# FunI 付款系統說明文件

[FunI 付款系統](https://funipay.net)（Discord 收款機器人）的官方使用說明，網站位於 **[docs.funipay.net](https://docs.funipay.net)**。

本網站以 [Fumadocs](https://fumadocs.dev) 與 Next.js 建置為純靜態網站，內容以繁體中文撰寫。

## 開發環境

需求：Node.js 22.12 以上。

```bash
npm install
npm run dev         # 開發伺服器 http://localhost:3000
npm run build       # 建置靜態網站，輸出至 out/
npm test            # 單元測試（Vitest）
npm run lint        # 程式碼檢查（ESLint）
npm run typecheck   # 型別檢查（TypeScript）
```

其他指令：

| 指令 | 說明 |
| --- | --- |
| `npm run check:export` | 建置後檢查 `out/`：必要檔案、禁用字詞與檔案大小上限 |
| `npm run sync:bot` | 從機器人專案同步介面文字，產生 `content/bot-ui.generated.ts` |
| `npm run capture` | 重新擷取網頁後台截圖 |
| `npm run list:materials` | 列出示範可使用的機器人畫面與後台截圖 |

`sync:bot`、`capture` 以及部分測試需要機器人專案的原始碼，請以環境變數 `FUNIPAY_BOT_DIR` 指定其路徑。

## 目錄結構

| 路徑 | 內容 |
| --- | --- |
| `content/docs/` | 文件頁面（MDX）。網址即檔案路徑，例如 `content/docs/payments/fp.mdx` 對應 `/payments/fp` |
| `content/docs/**/meta.json` | 側邊欄的標題與排列順序 |
| `components/` | 互動示範與 Discord 介面元件 |
| `lib/` | 共用邏輯（搜尋斷詞、手續費計算、示範情境等） |
| `app/` | Next.js 路由與版面 |
| `public/` | 圖片等靜態資源 |
| `scripts/` | 建置、檢查與素材同步腳本 |

站名與導覽列設定位於 `lib/layout.shared.tsx`，色彩與字型位於 `app/globals.css`。

## 搜尋

搜尋索引於建置時產生為靜態檔案，由瀏覽器下載後在本機搜尋。中文斷詞由 `lib/search.ts` 處理，建立索引與查詢時共用同一套規則。

## 部署

網站部署於 Cloudflare Workers（靜態資源），設定檔為 `wrangler.jsonc`。推送至 `main` 分支後會自動建置（`npm run build`）並部署 `out/` 的內容。

## 授權

本專案以 [MIT License](LICENSE) 授權。
