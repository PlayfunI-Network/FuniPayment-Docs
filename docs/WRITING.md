# 撰寫手冊

這份手冊寫給之後負責各章節的 session。動手前先讀完，再打開完成品 `/payments/fp`（`content/docs/payments/fp.mdx` 和 `components/demos/payments/fp-demo.tsx`）對照著看。每一頁都照 fp 的做法寫。

## 開始之前

- `npm install`，然後 `npm run dev`（用 webpack 跑，`next dev --webpack`；這台機器上 Turbopack 的 loader 子程序會啟動失敗）。
- `npm test` 要讀 bot 專案，所以 bot 專案要放在 `../../PycharmProjects/FuniPayment`，或用 `FUNIPAY_BOT_DIR` 指定位置。`npm run sync:bot` 和 `npm run capture` 也一樣。
- 文件以 bot 的 `release/v1.0.0` 分支為準。bot 專案只能讀，不能改。

## 頁面骨架

功能頁一律用這 8 段，沒有內容的段落直接省略：

1. 一兩句話說這是什麼、什麼時候用。不用寫標題，緊接在頁首說明之後。
2. demo：放在第一段文字後面。
3. 誰可以用：要哪個身分組或權限，誰能按哪些按鈕。
4. 使用步驟：用 `<Steps>` / `<Step>`，每一步用 `###` 小標。
5. 參數：指令頁才有，用表格列出參數名、必填、說明。參數名和說明照 `COMMANDS`（來自 `commands.json`）。
6. 會看到什麼：bot 回什麼、東西會送到哪裡。demo 已經看得出來的就不用再寫一遍。
7. 常見狀況：用 `<Callout>` 寫，只寫真的會遇到的事，並附上 bot 實際回的字。
8. 相關頁面：三到五個連結，每個後面可以補一句說明。

站內連結寫根路徑，例如 `/dashboard/settings-channels`，不要寫 `/docs/...`。

## 寫作規範

- 繁體中文、台灣用語，稱呼讀者「你」。
- bot 和後台上的字一律用「」括起來，逐字照抄來源（見下一節）。連半形冒號、空白、全形括號、表情符號都要一樣，例如「下一步: 確認購買資訊」「✏️ 填寫/修改資訊」。
- 「」只給真的出現在 bot 或後台上的字。示範用的名稱（頻道名、分類名、顧客說的話）不加「」，要說清楚那是舉例。
- 頁面文字不寫英文的 demo，寫「示範」或「動畫」。
- 段落寫短。不要用表情符號裝飾，bot 原文裡本來就有的除外。少用粗體，不要用破折號把句子串起來。
- 只寫 v1.0.0 現在會發生的事。從程式碼確認不了的就不寫，列在回報裡。
- 禁用字詞（建置會檢查）：信用卡、免費試用、申請試用、NewebPay、藍新、公測期間全部免費。
- 示範商店叫「星光遊戲社」，人物只用角色名：商家、顧客、管理員。

三組改前改後：

| 改前 | 改後 |
|---|---|
| /fp 是一個強大又便利的指令，不僅能快速開單，更能大幅提升您的收款效率！ | 你只要輸入金額，機器人會在頻道貼出付款方式選單，顧客自己選要怎麼付。 |
| **注意：** 訂單會在一段時間後過期——請務必提醒顧客儘早付款。 | 任何一步停超過 24 小時，訊息會變成「付款單已過期，請聯繫客服處理」。 |
| 點擊 **確認** 按鈕即可完成付款資訊的取得、確認與送出。 | 顧客按下「確認並獲取付款碼」，機器人建立訂單，把付款資訊貼到頻道。 |

每頁寫完都要用 `humanizer:humanizer` skill 跑一遍，改完再回頭把每個「」裡的字跟來源對一次。humanizer 可能會改到 bot 的字，原文優先。

## 文字從哪裡來

| 內容 | 來源（bot 專案） |
|---|---|
| Discord 訊息、embed、按鈕、選單 | `tests/snapshots/ui.json`，經過 `npm run sync:bot` 變成 `content/bot-ui.generated.ts` |
| 指令名稱、參數、中文翻譯 | `tests/snapshots/commands.json`，也就是 generated 檔裡的 `COMMANDS` |
| 權限檢查 | `app/bot/checks.py`，以及各 cog 的 decorator |
| 其他 bot 文字（錯誤訊息等） | `app/i18n/*.py` |
| 後台畫面與文字 | 截圖腳本；`app/i18n/dashboard.py`、`web/src` |
| 行為細節（多久過期、誰能按、改名限制） | `app/services/*`、`app/bot/cogs/*`、`app/bot/views/*`、bot 的 `CLAUDE.md` |
| 手續費預設值 | `app/db/settings_schema.py`，在這個 repo 是 `lib/fees.mjs` |
| 已經移除的功能 | `docs/database/upgrade-v0.8.0-to-v1.0.0.md` |

寫 fp 頁時查過的地方可以當例子：誰能按選單，看 `views/fp.py` 的 `_check_user`（沒有指定付款者時，第一個選的人就是付款者）。24 小時過期，看 `CustomView(timeout=86400)` 和 `on_timeout`。改名限制，看 `client.py` 的 `check_rename_cooldown`（10 分鐘 2 次）。

## 怎麼寫一段 demo

原則：一段 demo 只示範一件事，長度 6 到 15 秒，自動循環播放。完整例子是 `components/demos/payments/fp-demo.tsx`，下面照它的順序說明。

### 1. 先定情境

情境放在 `components/demos/scenarios.ts` 的 `SCENARIOS`，內容是店名、人物、金額、付款方式、訂單號。故事能接上的話就重用現成的情境，例如付款完成、查詢訂單都沿用 `fpStoreBarcode`，金額、手續費、訂單號才會前後一致。需要別的金額或付款方式時，在自己的 demo 資料夾另外定一個，回報時提出來。

條碼圖 `public/demo/barcodes.png` 只對應總額 525（500 + 25），四大超商條碼的情境換成別的金額會直接報錯。

### 2. 再寫 steps

`DemoStage` 收一個 `steps` 陣列。每一步有 `at`（開始後第幾毫秒）、`caption`（畫面下方那一行說明）、`shot`（鏡頭）和 `cursor`（游標）。`shot` 和 `cursor` 會沿用到下一次被設定為止。

- `steps` 一定要是模組層級的常數。`useTimeline` 是用陣列本身來判斷要不要重播，每次 render 都產生新陣列的話，動畫會一直從頭開始。
- 畫面狀態和步驟放在一起。fp 用 `FpStep = DemoStep & { screen }`，`children(step, index)` 用 `steps[index].screen` 決定要畫什麼。
- 有點擊的地方分成兩步：先移過去並按下（`click: true`），過 300 ms 左右畫面再變。看的人才看得出是「按了才變」。
- caption 寫「誰做了什麼」，一行就好，例如「顧客打開選單，選「四大超商條碼」」。
- 減少動態時只會顯示最後一格，所以最後一格要能單獨看懂。fp 最後一格是頻道已經換到待付款分類、訂單訊息完整的全景。

### 3. 哪一步用哪個 SnapshotMessage

bot 的字一律用 `SnapshotMessage` / `SnapshotEmbed` 畫，id 就是 ui.json 的 key，自己不打任何 bot 的字。fp 用到的：

| 畫面 | id |
|---|---|
| 送出 /fp 後的選單 | `flow/fp_command/ok`（選單打開：`menu={{ open: "up", active: "store_barcode" }}`） |
| 再次確認付款方式 | `builder/fp/famiport/0/designated=False`（付款方式名稱是 token，各種方式都通用） |
| 購買人資訊（已填） | `SnapshotEmbed` 用 `builder/consumer_info/filled=True/cancel_first=False`，按鈕取 `flow/fp_method_confirm`。測試會檢查兩者的 embed 一致 |
| 訂單建立 | `builder/payment_create/store_barcode/invoice=False` |

全部的 id 在本手冊最後的「可用素材」。讀 id 時要知道：

- `key@part` 是同一個流程裡的另一則訊息，例如 `flow/balance_transfer_confirm/50@client.send_dm_to_user#0` 是轉帳成功後寄給轉出方的私訊，`@client.send_to_log_channel` 是日誌頻道那則。
- 每個畫面的 `via` 說它出現在哪裡：回覆指令、改掉原本的訊息、私訊、日誌頻道、通知伺服器擁有者。意思寫在 `lib/bot-ui-types.ts` 的 `MessageEntry.via`。示範要把畫面放在 `via` 說的地方（私訊放 `DmWindow`，`ephemeral` 的放 `Ephemeral`）。
- `components/demos/scenarios.ts` 的 `SNAPSHOT_SCENARIOS` 指定每個畫面用哪個情境畫。用這個畫面時，用它指定的情境，或欄位相同的另一個情境（例如四種超商代碼都有自己的情境）；欄位對不上會直接報錯。

可以自己寫的只有：顧客和商家在指令之前的聊天句子、示範用的頻道名稱，以及 Discord 本身的介面（輸入框的「傳送訊息到 #…」、「使用了」）。頻道名稱 bot 沒有預設值，都是商家在後台自己設的，頁面上要講清楚，並連到 `/dashboard/settings-channels`。

### 4. 鏡頭與游標

- 畫面畫在固定大小的畫布上，再縮放到舞台寬度，所以座標可以用畫布的 px 來算。共用的工具在 `components/demo`：`Canvas`（畫布）、`useWidth`（量寬度，用來選版面）、`canvasRect` / `canvasPoint`（畫布 px 換成鏡頭和游標要的比例）、`zoomTo`（放大）。
- 每種舞台寬度一個版面，各自量座標。fp 的寬版是 880×780，有頻道列表；舞台寬度小於 600 px 時換成窄版 400×760，沒有頻道列表，換版就重播。
- 手機上的字要看得清楚：放大時文字換算後至少要有 11 px。窄版的畫布要做窄，不要把桌機的畫布直接縮小。fp 窄版在 343 px 的舞台上縮成 0.86 倍，embed 的 14 px 字約 12 px。
- 座標要實際量，不要用猜的。開 `npm run dev`，到 `/dev/fp` 這類開發頁把每個畫面原尺寸畫出來，用 Playwright 讀元素的 `getBoundingClientRect`。1280 和 375 兩種寬度都要量：元件的 `sm:` 樣式在手機上會讓位置差到 8 px，點的位置要選在兩種寬度都還在按鈕裡的地方。
- 放大用 `zoomTo(layout, zoom, area)`。它會限制倍率，讓 area 整塊都留在畫面裡，窄畫面也不會把選單切掉。
- 按下之後游標移到旁邊空白處，不要停在 caption 要人看的字上。
- 有東西要讓人看到變化時（頻道改名、換分類），鏡頭要拉回全景，不能剛好切在外面。
- 打字時游標是 I 字形（`typing: true`），擺在文字右邊，不要蓋住打出來的字。

### 5. 註冊與檢查

demo 元件放在 `components/demos/<章節>/`，在自己的 MDX 開頭直接 import，不要改 `mdx-components.tsx`（那是共用檔）：

```mdx
import { FpDemo } from "@/components/demos/payments/fp-demo";

<FpDemo />
```

測試照 `fp-demo.test.tsx` 寫：時間軸在 6 到 15 秒之間，座標都在 0 到 1 之內，每個畫面畫得出來；用到拼接畫面的話，也要檢查拼接的來源一致。

## 後台示範

後台的示範不用自己量座標。`npm run capture` 已經把後台每個要用的畫面拍好（深淺色、桌面 1280 和手機 375 各一張），連同畫面上每個「目標」元素的位置一起存進 `content/dashboard-shots.generated.json`。`DashboardDemo` 用目標的名字指揮游標和鏡頭：

```tsx
"use client";
import { DashboardDemo, type DashboardStep } from "@/components/demo";

// 一樣要是模組層級的常數
const STEPS: DashboardStep[] = [
  { at: 0, caption: "打開「付款方式與手續費」分頁", target: "tabPayment" },
  { at: 1500, caption: "關掉「萊爾富超商代碼」", target: "hilife", zoom: 2 },
  { at: 2400, target: "hilife", click: true },
  { at: 2700, swapTo: "settings-payment-edited" },
  { at: 4000, caption: "按「儲存變更」", target: "save", zoom: 1.6 },
  { at: 4800, target: "save", click: true },
  { at: 5100, caption: "看到「已儲存」就完成了", swapTo: "settings-payment-saved", target: "saved" },
  { at: 7500, zoom: 1, hideCursor: true },
];

export function PaymentSaveDemo() {
  return <DashboardDemo shot="settings-payment" steps={STEPS} label="示範：在後台關掉一種付款方式並儲存" />;
}
```

每一步的欄位：

| 欄位 | 作用 |
|---|---|
| `at` | 開始後第幾毫秒 |
| `caption` | 畫面下方的說明，沿用到下一個 caption |
| `target` | 游標移到這個目標（停在上面直到換目標） |
| `zoom` | 鏡頭放大幾倍，對準這一步或上一個目標；`1` 拉回全景。會沿用 |
| `click` / `typing` | 按下／變成打字的 I 字形游標 |
| `hideCursor` | 藏起游標，直到下一個 `target` |
| `swapTo` | 換成另一張截圖（按了之後的頁面、填好的表單、已儲存）。之後的 `target` 都在新截圖上找 |

- 截圖比舞台高時（總覽、設定頁），畫面會像捲動網頁一樣自動捲到目標的位置，不用自己算。
- 目標名字寫錯、或目標不在當下那張截圖上，會直接報錯並說是第幾步。
- 舞台寬度小於 600 px 時用手機版截圖，前提是每張用到的截圖都有手機版，而且每個 `target` 手機版都有。「可用素材」裡標 * 的目標只有桌面版（側邊欄、表格的部分欄位），用到它的示範在手機上會改用桌面版截圖，字會很小：手機上要看清楚的示範，就只用沒有 * 的目標。
- 減少動態時不播放，改成全景：每個 caption 一個數字標號，標在那一段第一個 `target` 上，說明列在圖下面。所以每個 caption 那段至少指一個目標。
- 要讓人看到「按了才變」，跟 Discord 的示範一樣分兩步：先 `click`，300 ms 後再 `swapTo`。
- 截圖上的數字（金額、訂單數）全部來自同一批示範訂單，手續費照 `calculateFee` 算，總覽、訂單列表、訂單明細彼此對得上。頁面文字引用數字時照截圖寫。
- 開 `/dev/dashboard` 可以看每張截圖的範例示範，`/dev/shots` 可以看每個目標的框。

挑目標：先在「可用素材」找截圖和目標名字，再到 `/dev/shots` 看框在哪裡。需要的元素沒有目標、或需要一個沒拍的狀態（例如某個篩選打開、某個欄位填錯的提示），不要自己截圖或疊東西上去，寫進回報：哪一頁（網址和 query）、要先做哪些操作、要點哪個元素（畫面上的字或 aria-label）。主 session 加進 `scripts/capture.config.mjs` 重拍。

## 可以用的元件

MDX 裡不用 import 就能用的：`<Steps>` / `<Step>`、`<Callout>`、`<Cards>` / `<Card>`。`<Callout>` 的 `type` 有 `info`（預設）、`warn`、`warning`、`error`、`success`、`idea`，可以加 `title`。

Discord 畫面（`components/discord`，永遠深色）：

| 元件 | 用途 |
|---|---|
| `DiscordWindow` | 頻道視窗外框：標題列加訊息區 |
| `ChannelHeader` | 頻道標題列，改名時會換字 |
| `Message` / `ActionRow` | 一則訊息（頭像、名字、時間、「使用了 /指令」那行）／一排按鈕 |
| `Embed`、`CodeBlock` | embed 本體；一般用 `SnapshotMessage`，不要手寫 |
| `DiscordMarkdown` | Discord 的粗體、底線、連結、mention、`<t:…>` |
| `DiscordButton` | 按鈕，有 `disabled` 和按下的樣子 |
| `SelectMenu` | 選單，可以打開（`open`、往上開 `up`）、標出選到的項目 |
| `ChoiceMenu` | 讓讀者自己點的選單（互動用） |
| `SlashPicker` | 輸入斜線指令時的提示框，和填了參數的輸入框 |
| `ChatInput` | 空的輸入框 |
| `Modal` | 表單視窗（例如填購買人資訊） |
| `Ephemeral` | 「只有你看得到」的訊息 |
| `DmWindow` | 私訊視窗 |
| `ChannelList` / `ChannelRow` | 左側頻道列表，看改名和換分類 |
| `VoiceChannel` | 語音頻道名稱 |
| `Attachment` | 訊息附加的圖片 |
| `Avatar` | 頭像（圖片或彩色字） |

示範系統（`components/demo`）：

| 元件 | 用途 |
|---|---|
| `DemoStage` | 示範外框：比例、播放、暫停、循環、減少動態、caption |
| `Camera`、`Cursor`、`Caption` | 鏡頭、游標、說明列（`DemoStage` 已經包好，通常不用直接用） |
| `SnapshotMessage` / `SnapshotEmbed` | 從 ui.json 畫出 bot 的訊息或單一 embed |
| `Canvas`、`useWidth`、`canvasRect`、`canvasPoint`、`zoomTo` | 固定畫布與座標工具 |
| `DashboardDemo` | 後台示範：用目標名字指揮游標和鏡頭，見「後台示範」 |
| `DashboardShot`、`shotTarget` | 後台截圖（單獨放在頁面上時要給 `alt`）與截圖上元素的位置 |

## 要新的 ui.json key 或截圖

- ui.json 的 key 清單在 `scripts/sync-bot-ui.config.mjs`，後台截圖清單在 `scripts/capture.config.mjs`，這兩個檔案只有主 session 能改。
- 第二階段的 session 需要新的 key（寫出完整 key、要換掉的測試值）或新的截圖（頁面、操作步驟、要點的元素）時，列在回報裡，由主 session 加進清單，統一重新產生。
- 等待期間 demo 可以先在自己的資料夾做，但不能自己手打 bot 的字頂替。

## 檔案歸屬

- 每個 session 只改自己負責的 `content/docs/<章節>/` 和 `components/demos/<章節>/`。
- 共用元件（`components/discord/`、`components/demo/`）、`lib/`、`scripts/`、產生檔（`content/*.generated.*`）都歸主 session 管。共用元件不夠用時，先在自己的 demo 資料夾裡做，回報時說明，由主 session 合進共用。
- 每個 session 在自己的 git worktree 分支上工作，不推送。

## 驗收清單（每一頁）

- [ ] 文字逐字對得上來源，沒有寫到不存在的功能。
- [ ] demo 在 1280 px 和 375 px 都看得清楚，深色和淺色都正常，減少動態時顯示最後一格。
- [ ] demo 每一格都和 ui.json 的對應 key 對照過，有疑問的地方列在回報裡。
- [ ] humanizer 跑過，跑完又對了一次來源。
- [ ] `npm test`、`npm run build && npm run check:export` 都通過，站內連結沒有斷。
