# SEO 與 AI 搜尋優化報告

Branch：`seo/optimize`（未 merge、未部署）。網域取自專案設定：`https://docs.funipay.net`。

## 現況與結論

網站是 Next.js + Fumadocs 的純靜態輸出，爬蟲不跑 JavaScript 也拿得到完整內文，**不需要 SSR 或 prerender**。原本已有 `lang`、viewport、單一 H1、正確的標題階層、語意標籤、外部連結 `rel`、404 頁與舊網址 301。這次補的是下面這些。

## 改了什麼

| 項目 | 內容 |
|---|---|
| Title／description | 44 頁都有獨立的 title 與摘要，frontmatter 新增 `seoTitle`（選填）和 `seoDescription`（必填）。畫面上的 H1 和副標題不變 |
| Canonical、robots | 每頁有絕對網址的 canonical、`max-snippet` 等 robots 設定；404 頁 `noindex` |
| 社群分享 | Open Graph、Twitter Card，以及新做的 1200x630 分享圖 |
| JSON-LD | 全站 Organization、WebSite；文件頁 TechArticle、BreadcrumbList；首頁 SoftwareApplication；FAQ 頁 FAQPage（從頁面內容產生） |
| Sitemap | 44 頁都有 `lastmod`，日期取自 git |
| 最後更新日期 | 每頁底部顯示，寫在 HTML 裡。Fumadocs 內建元件是 hydration 後才填日期，所以沒有用它 |
| 麵包屑 | 改成伺服器輸出，分類可點（連到該分類第一頁），與 JSON-LD 同一份資料。多了「說明文件」和目前頁面兩層 |
| Markdown 版本 | 每頁加 `.md`（例如 `/payments/fp.md`、`/index.md`），`<head>` 有 `rel="alternate"`。指令表和錯誤代碼表由資料還原成 Markdown 表格 |
| LLM 檔案 | `/llms.txt`（依側邊欄分節的全部頁面連結與摘要）、`/llms-full.txt`（全站內文，約 180 KB） |
| `_headers` | `.md` 和 llms 檔標明 UTF-8；`.md` 與 `/api/*` 加 `X-Robots-Tag: noindex`，避免和 HTML 頁搶排名，爬蟲仍可讀取 |
| 圖示 | `favicon.ico`、`apple-touch-icon`、192／512 圖示、`manifest.webmanifest` |
| 內容 | FAQ 有 7 題標題改成自然問句；首頁加上常見問題與指令總表的連結 |
| 建置檢查 | `check:export` 新增每頁的 H1、title／description 重複、canonical、sitemap、分享標籤、JSON-LD、Markdown 版本檢查 |

## 判斷與取捨，請確認

- **字數用顯示寬度計算**：中文字算 2、英數算 1。title 上限 60、摘要 120 到 160，約等於 30 個和 60 到 80 個中文字。若真的寫 120 到 160 個中文字，搜尋結果會被截斷。測試會強制檢查。
- **首段定義沒有改寫成 40 到 60 字**：每頁首段本來就在說明「這是什麼」，只是沒有逐頁量字數。試過把副標題加長，結果和首段重複，也讓上下頁卡片變長，所以還原，改放到 `seoDescription`。
- **沒有 hreflang**：全站只有繁體中文，沒有對應的語言版本。
- **沒有 `/pricing.md`**：文件裡沒有服務方案或價格，只有速買配付款手續費，已在 `/reference/fees.md`。
- **沒有 SearchAction**：站內搜尋是對話框，沒有可連結的搜尋網址。
- **SoftwareApplication 沒有價格和評分**：網站上沒有這些資料。Google 的軟體複合式結果需要它們，所以這段不會產生該類結果，但仍能說明產品是什麼。
- **FAQPage**：Google 目前只對少數網站顯示 FAQ 複合式結果，這裡主要是給其他搜尋與 AI 解析用。
- **Organization 名稱用「FunI 付款系統」**：專案裡找不到公司法定名稱。
- **圖片沒有另外加 lazy-load**：後台截圖原本就有 lazy 和尺寸；Discord 示範裡的圖片是動畫的一部分，改載入時機可能造成閃爍，不算低風險。
- **「程式碼範例周圍的說明」不適用**：文件沒有程式碼區塊，指令都寫在說明文字裡。

## 已知限制

1. **合併後所有頁面的最後更新日期會變成同一天**，因為這次每個 MDX 都改了 frontmatter。之後會依各頁實際修改更新。
2. **日期依賴完整 git 歷史**。查不到 Cloudflare Workers Builds 的 clone 深度文件，所以建置會先嘗試 `git fetch --unshallow`；失敗就不輸出日期，不會輸出錯誤的日期。**第一次部署後請確認頁面底部有日期。**
3. **側邊欄收合的資料夾不在 HTML 裡**（Fumadocs 的行為）。實測所有頁面都連得到，從首頁最多 2 次點擊，加上 sitemap 和 llms.txt，不影響收錄，所以沒有改側邊欄。
4. **Core Web Vitals 沒有量測**，也沒有做這方面的改動。上線後可以用 PageSpeed Insights 看實際數字。

## 驗證結果

- `npm run build`、`check:export`、`typecheck`、`lint` 全部通過。
- `npm test`：724 通過、19 略過；2 個測試檔失敗（`components/demos/reference/quotes.test.ts`、`scripts/demo-data.test.mjs`）。**這次改動前就失敗**，它們需要專案外的 bot 原始碼，要設定 `FUNIPAY_BOT_DIR`。
- 用本機 `wrangler dev` 實測：`.md` 和 llms 檔的 Content-Type 與 `X-Robots-Tag` 正確、舊網址 301 正常、不存在的網址回 404、桌面與手機版沒有橫向溢出，也沒有 console 錯誤。
- 尚未在正式環境測試，也還沒用 Google Rich Results Test 驗證。

## 新增的主要檔案

- `lib/seo.ts`、`lib/seo-pages.ts`、`lib/doc-tree.ts`、`lib/last-modified.ts`、`lib/llms.ts`
- `components/page-breadcrumb.tsx`
- `app/manifest.ts`、`app/llms.txt/`、`app/llms-full.txt/`、`app/md/[...slug]/`
- `public/_headers`、`public/favicon.ico`、`public/brand/`（分享圖與圖示）
- `scripts/ensure-full-history.mjs`、`scripts/publish-markdown*.mjs`、`scripts/generate-brand-assets.mjs`

## 需要你手動做的事

1. **審核後 merge 並部署**。
2. **Cloudflare 設定**：確認 `www.docs.funipay.net`（如有）和 `http` 都轉到 `https://docs.funipay.net`；確認「AI Crawl Control」或「Block AI bots」、受管理的 robots.txt 沒有擋掉你想讓它進來的 AI 爬蟲。這些設定不在專案裡，我沒辦法從這裡確認。
3. **Google Search Console**：驗證網域、提交 `https://docs.funipay.net/sitemap.xml`，並抽幾頁用 Rich Results Test 檢查。
4. **Bing Webmaster Tools**：可以從 Search Console 匯入。Bing 的索引也會影響部分 AI 搜尋。
5. **第三方資料**：Discord 機器人目錄與速買配相關頁面的名稱、說明和連結保持一致。文件裡沒有實體地址，Google 商家檔案是否適用要由你判斷。
6. **外部連結與曝光**：從官網 `funipay.net` 明顯連到文件站；可以在 Discord 社群、台灣的 Discord 或金流社群分享實用頁面，例如手續費和速買配錯誤代碼。
7. **補充 FAQ**：目前的問題都來自既有內容。可以依客服實際收到的問題再增加。
8. **品牌用語**：任務裡寫「FunI Pay Docs」，網站上是「FunI 付款系統 說明文件」，這次沿用網站上的寫法。

## 之後維護

- 新增頁面時要寫 `seoDescription`，否則建置會失敗；`seoTitle` 視需要加。
- 更換 logo 或分享圖文字時，執行 `node scripts/generate-brand-assets.mjs`（需要 Playwright 的 Chromium，以及 Next 附帶的 sharp），再 commit 產生的圖。
