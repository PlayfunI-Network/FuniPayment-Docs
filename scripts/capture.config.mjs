// What `npm run capture` photographs on the bot's web dashboard (scripts/capture-dashboard.mjs).
//
// identity: "owner" = the merchant who owns 星光遊戲社 (fake-api session `valid`);
//           "newbie" = a new user without servers yet (session `newbie`, the /setup wizard);
//           "none" = not logged in (the login page).
// path:     the page opened first (with its query, if any); actions then run in order.
// actions:  "click:<selector>", "check:<selector>", "fill:<selector>|<text>",
//           "pick:<combobox label>|<option>" (the dashboard's MultiSelect), "wait:<selector>".
// fake:     [{ path, body }] POSTed to the fake API after its reset and before the page opens (test
//           switches: /__onboarding { daily_remaining }, /__suspend { id, suspended }).
// targets:  the elements a demo's cursor and camera aim at; each selector must match exactly one
//           visible element, on the desktop and on the phone picture. Their boxes are saved as
//           Rects (0–1 of the image).
// desktopTargets: targets that only exist on the desktop layout (the sidebar, the order table);
//           a demo that uses one shows the desktop picture on phones too.
// crop:     the element the image is cut to, plus `pad` CSS px around it (the whole page if absent).
// mobile:   every shot is also taken at phone width (MOBILE_VIEWPORT, same actions and targets);
//           `mobile: false` skips it.
// mobileTargets: selectors that replace a target's on the phone picture (same name, same thing,
//           drawn differently there: e.g. a table that becomes a list of cards).
// Selectors are Playwright selectors: CSS, or role=button[name="下一步"s] and the like (`s` =
// exact name; role selectors only match visible elements, so a layout's hidden twin never counts).

const NEW_SERVER = "222222222222222001"; // fixtures.mjs NEW_SERVER_ID (星光遊戲社 after demo-data)
const SERVER = "111111111111111111"; // fixtures.mjs SERVER_ID (星光遊戲社)
const OTHER_SERVER = "222222222222222002"; // NEWBIE_SERVERS: set up by someone else
const NO_PERMISSION_SERVER = "222222222222222003"; // NEWBIE_SERVERS: member only
const OWN_SERVER = "222222222222222004"; // added by demo-data.mjs (DEMO_EXTRA_SERVER): already set up by you
const BASE = `/servers/${SERVER}`;
const ORDER = "50000000001"; // the first fixture order (shown as 050000000001)

/** The wizard's 900px window, as the welcome tour and /setup were taken in Task 6. */
const WIZARD_VIEWPORT = { w: 900, h: 900 };
/** The merchant pages: a desktop window with the sidebar (the dashboard's lg layout). */
const DESKTOP = { w: 1280, h: 900 };
export const MOBILE_VIEWPORT = { w: 375, h: 812 };

const role = (kind, name) => `role=${kind}[name="${name}"s]`;
const NEXT = role("button", "下一步");
const WIZARD = { selector: "main > div", pad: 24 };
/** The pages that replace the wizard when it is closed to you (a card on its own). */
const BLOCKED = { selector: 'section[aria-labelledby="setup-blocked"]', pad: 40 };
const BLOCKED_TARGETS = {
  card: 'section[aria-labelledby="setup-blocked"]',
  title: role("heading", "暫時無法設定新的伺服器"),
  home: role("link", "回到首頁"),
  logout: role("button", "登出"),
};
const serverCard = (id) => `div:has(> label input[value="${id}"])`;
const HELP = 'details:has(> summary:text-is("找不到我的伺服器？"))';
const HELP_SUMMARY = `${HELP} >> summary`;
/** Step 1: one card per server state, the invite link, the refresh button and the help. */
const STEP1_TARGETS = {
  server: serverCard(NEW_SERVER),
  stateAvailable: serverCard(NEW_SERVER),
  stateSetUpByYou: serverCard(OWN_SERVER),
  openDashboard: role("link", "前往後台"),
  stateSetUpByOther: serverCard(OTHER_SERVER),
  stateNoPermission: serverCard(NO_PERMISSION_SERVER),
  noPermissionNote: 'p:text-is("需要這個伺服器的「管理伺服器」權限才能設定。")',
  invite: role("link", "邀請機器人到其他伺服器"),
  refresh: role("button", "重新整理"),
  help: HELP,
  helpSummary: HELP_SUMMARY,
  next: NEXT,
};

/** A SectionCard by its title (the cards without an aria-label). */
const card = (title) => `section:has(> div > h2:text-is("${title}"))`;

// ---- /setup ---------------------------------------------------------------------------------

const toStep2 = [`check:input[value="${NEW_SERVER}"]`, `click:${NEXT}`, `wait:${role("combobox", "管理員身分組")}`];
const toStep3 = [...toStep2, "pick:管理員身分組|管理員", "pick:日誌頻道|#日誌", `click:${NEXT}`, `wait:${role("textbox", "商家代號")}`];
const toStep4 = [
  ...toStep3,
  `fill:${role("textbox", "商家代號")}|24680`,
  `fill:${role("textbox", "參數碼")}|A1B2C3`,
  `fill:${role("textbox", "檢查碼")}|D4E5F6`,
  `fill:${role("textbox", "商家驗證參數（推薦）")}|G7H8`,
  `click:${NEXT}`,
  `wait:${role("switch", "銀行轉帳")}`,
];
const toStep5 = [...toStep4, `click:${NEXT}`, `wait:${role("region", "設定摘要")}`];

// ---- the merchant pages -----------------------------------------------------------------------

const MAIN_NAV = role("navigation", "主要導覽");
/** The sidebar (desktop only; phones open it from the menu button). */
const SIDEBAR = {
  serverSwitcher: role("button", "切換伺服器"),
  navOverview: `${MAIN_NAV} >> ${role("link", "總覽")}`,
  navOrders: `${MAIN_NAV} >> ${role("link", "訂單")}`,
  navSettings: `${MAIN_NAV} >> ${role("link", "設定")}`,
  navHistory: `${MAIN_NAV} >> ${role("link", "設定變更紀錄")}`,
  navFeatures: `${MAIN_NAV} >> ${role("link", "功能說明")}`,
  theme: role("radiogroup", "主題"),
};

const OVERVIEW_TARGETS = {
  checklist: role("region", "開始使用"),
  scope: "role=button[name=/^資料範圍/]",
  feeSwitch: role("switch", "含手續費"),
  period: role("navigation", "期間"),
  periodToday: role("link", "今天"),
  period7d: role("link", "近 7 天"),
  period30d: role("link", "近 30 天"),
  kpis: "main div.grid.grid-cols-2:has(section[aria-label='收款金額'])",
  kpiRevenue: role("region", "收款金額"),
  kpiCompleted: role("region", "完成訂單數"),
  kpiAverage: role("region", "平均客單價"),
  kpiCompletion: role("region", "付款完成率"),
  trend: role("region", "收款趨勢"),
  methods: card("付款方式"),
  recentOrders: card("最近訂單"),
  viewAll: role("link", "查看全部 →"),
  firstOrder: role("link", "訂單 050000000001"),
  heatmap: card("熱門時段"),
  customers: role("region", "顧客"),
};

/** The period bar scrolls sideways on phones, with 自訂… out of view at first. */
const OVERVIEW_DESKTOP = { ...SIDEBAR, periodCustom: role("button", "自訂…") };

const ORDERS_TARGETS = {
  scope: "role=button[name=/^資料範圍/]",
  statusTabs: role("navigation", "訂單狀態"),
  statusAll: "role=link[name=/^全部\\d+$/]",
  statusComplete: "role=link[name=/^已完成\\d+$/]",
  statusPending: "role=link[name=/^待付款\\d+$/]",
  statusExpired: "role=link[name=/^已過期\\d+$/]",
  search: role("searchbox", "搜尋"),
  methodFilter: role("button", "付款方式"),
  typeFilter: role("button", "訂單類型"),
  dateFilter: role("button", "建立日期"),
  firstOrder: role("link", "訂單 050000000001"),
  pagination: role("navigation", "分頁"),
  list: role("table", "訂單列表"),
};
/** The list is a table on the desktop and one card per order on phones. */
const ORDERS_MOBILE = { list: role("list", "訂單列表（卡片）") };

const SETTINGS_TABS = {
  tabs: role("navigation", "設定分頁"),
  tabBasic: role("link", "基本"),
  tabSmilepay: role("link", "SmilePay"),
  tabPayment: role("link", "付款方式與手續費"),
};
/** The tab bar scrolls sideways on phones; these two are out of view there. */
const SETTINGS_TABS_WIDE = {
  tabChannels: role("link", "訂單頻道流程"),
  tabBalance: role("link", "點數系統"),
};
/** The bar that appears once something changed (and stays to show 「已儲存」). */
const SAVE_BAR = {
  saveBar: "div.sticky:has(div[aria-live])",
  changes: "div[aria-live] > p",
  revert: role("button", "還原"),
  save: role("button", "儲存變更"),
};
const SAVED = { saved: 'role=status >> text="已儲存"' };
const save = [`click:${role("button", "儲存變更")}`, `wait:${SAVED.saved}`];

/**
 * More edits of a tab already taken by settingsTab: `settings-<tab>-<name>` after the steps up to
 * and including that one (each shot keeps the edits before it), and `settings-<tab>-<last>-saved`
 * after saving them all. With one step that is `-<name>-edited` and `-<name>-saved`. `before` are
 * edits every one of these shots starts with (e.g. settingsTab's edit, to go on from its shot).
 */
function settingsEdits(tab, targets, steps, { before = [], wideTargets = {} } = {}) {
  const path = `${BASE}/settings?tab=${tab}`;
  const all = { ...SETTINGS_TABS, ...targets };
  const wide = { ...SETTINGS_TABS_WIDE, ...wideTargets };
  const actions = [...before, ...steps.map(([, action]) => action)];
  const last = steps[steps.length - 1][0];
  const id = (name) => (steps.length === 1 ? `settings-${tab}-${name}-edited` : `settings-${tab}-${name}`);
  return [
    ...steps.map(([name], i) => ({
      id: id(name),
      identity: "owner",
      path,
      viewport: DESKTOP,
      actions: actions.slice(0, before.length + i + 1),
      targets: { ...all, ...SAVE_BAR },
      desktopTargets: wide,
    })),
    { id: `settings-${tab}-${last}-saved`, identity: "owner", path, viewport: DESKTOP, actions: [...actions, ...save], targets: { ...all, ...SAVED }, desktopTargets: wide },
  ];
}

/** One settings tab: as it opens, after `edit` (the save bar is up) and after saving that edit. */
function settingsTab(tab, targets, edit, wideTargets = {}) {
  const path = `${BASE}/settings?tab=${tab}`;
  const all = { ...SETTINGS_TABS, ...targets };
  const wide = { ...SETTINGS_TABS_WIDE, ...wideTargets };
  return [
    { id: `settings-${tab}`, identity: "owner", path, viewport: DESKTOP, targets: all, desktopTargets: { ...SIDEBAR, ...wide } },
    { id: `settings-${tab}-edited`, identity: "owner", path, viewport: DESKTOP, actions: edit, targets: { ...all, ...SAVE_BAR }, desktopTargets: wide },
    { id: `settings-${tab}-saved`, identity: "owner", path, viewport: DESKTOP, actions: [...edit, ...save], targets: { ...all, ...SAVED }, desktopTargets: wide },
  ];
}

const BASIC = {
  adminRole: role("combobox", "管理員身分組"),
  adminRoleCard: role("region", "管理員身分組"),
  createRoles: role("combobox", "可建立訂單的身分組"),
  createRolesCard: role("region", "可建立訂單的身分組"),
  logChannel: role("combobox", "日誌頻道"),
  logChannelCard: role("region", "日誌頻道"),
  commandChannels: role("combobox", "指令頻道"),
  commandChannelsCard: role("region", "指令頻道"),
  ticketCategories: role("combobox", "開單分類"),
  ticketCategoriesCard: role("region", "開單分類"),
};
const SMILEPAY = {
  merchant: role("region", "速買配商家資料"),
  storeNumber: role("textbox", "商家代號"),
  paramCode: role("textbox", "參數碼"),
  verifyKey: role("textbox", "檢查碼"),
  midParam: role("textbox", "商家驗證參數（推薦）"),
  clearMid: role("switch", "清除商家驗證參數（不再驗證付款通知的來源）"),
};
const PAYMENT = {
  table: role("table", "付款方式與手續費"),
  bankTransfer: role("switch", "啟用 銀行轉帳"),
  bankTransferFee: role("textbox", "銀行轉帳 手續費"),
  storeBarcode: role("switch", "啟用 四大超商條碼"),
  storeBarcodeFee: role("textbox", "四大超商條碼 手續費"),
  ibon: role("switch", "啟用 7-11 超商代碼"),
  ibonFee: role("textbox", "7-11 超商代碼 手續費"),
  famiport: role("switch", "啟用 全家超商代碼"),
  famiportFee: role("textbox", "全家超商代碼 手續費"),
  hilife: role("switch", "啟用 萊爾富超商代碼"),
  hilifeFee: role("textbox", "萊爾富超商代碼 手續費"),
  extraFee: role("textbox", "7-11／萊爾富 金額超過 1000 的額外費用（元）"),
};
const CHANNELS = {
  card: role("region", "訂單頻道流程"),
  selectingRename: role("switch", "選擇付款方式時 改頻道名稱"),
  selectingName: role("textbox", "選擇付款方式時 頻道名稱"),
  pendingRename: role("switch", "待付款時 改頻道名稱"),
  pendingName: role("textbox", "待付款時 頻道名稱"),
  completeRename: role("switch", "付款完成時 改頻道名稱"),
  completeName: role("textbox", "付款完成時 頻道名稱"),
  expiredRename: role("switch", "訂單過期時 改頻道名稱"),
  nameHelp: role("button", "名稱裡的 <> 代表原本的頻道名稱"),
};
/** On phones the table scrolls sideways: the category column (and the table's full width) is out of view. */
const CHANNELS_WIDE = {
  table: role("table", "訂單頻道流程"),
  selectingCategory: role("combobox", "選擇付款方式時 移到的分類"),
  pendingCategory: role("combobox", "待付款時 移到的分類"),
  completeCategory: role("combobox", "付款完成時 移到的分類"),
  expiredCategory: role("combobox", "訂單過期時 移到的分類"),
};
const BALANCE = {
  switches: role("region", "功能開關"),
  enable: role("switch", "點數系統"),
  transfer: role("switch", "點數轉帳"),
  payWithBalance: role("switch", "用點數付款"),
  topup: role("switch", "儲值點數"),
  leaderboard: role("switch", "點數排行榜"),
  name: role("textbox", "點數名稱"),
  adminRoles: role("combobox", "點數管理員身分組"),
};

/** @type {{id: string; identity: "owner" | "newbie" | "none"; path: string; viewport: {w: number; h: number}; actions?: string[]; targets: Record<string, string>; desktopTargets?: Record<string, string>; mobileTargets?: Record<string, string>; crop?: {selector: string; pad: number}; mobile?: false}[]} */
export const SHOTS = [
  // ---- login, welcome tour and the setup wizard ----
  {
    id: "login",
    identity: "none",
    path: "/login",
    viewport: DESKTOP,
    targets: { login: role("link", "使用 Discord 登入") },
    // The list of what the dashboard does sits beside the login card on wide screens only
    desktopTargets: { highlights: "main ul" },
  },
  {
    id: "welcome",
    identity: "newbie",
    path: "/welcome",
    viewport: { w: 900, h: 760 },
    crop: { selector: 'section[aria-label="導覽"]', pad: 40 },
    targets: {
      tour: 'section[aria-label="導覽"]',
      next: role("button", "下一張"),
      skip: role("button", "跳過"),
    },
  },
  {
    id: "setup-1",
    identity: "newbie",
    path: "/setup",
    viewport: WIZARD_VIEWPORT,
    crop: WIZARD,
    targets: STEP1_TARGETS,
  },
  {
    id: "setup-1-help",
    identity: "newbie",
    path: "/setup",
    viewport: WIZARD_VIEWPORT,
    actions: [`click:${HELP_SUMMARY}`, `wait:${HELP} >> ul`],
    crop: WIZARD,
    targets: { ...STEP1_TARGETS, helpList: `${HELP} >> ul` },
  },
  // The wizard's two refusals (the page of its own); the fake API has no way to show a
  // set-up-by-you server for a new user, so only these are produced with its switches.
  {
    id: "setup-daily-limit",
    identity: "owner",
    path: "/setup",
    viewport: { w: 900, h: 700 },
    fake: [{ path: "/__onboarding", body: { daily_remaining: 0 } }],
    crop: BLOCKED,
    targets: { ...BLOCKED_TARGETS, title: role("heading", "今天無法再建立伺服器") },
  },
  {
    id: "setup-owner-suspended",
    identity: "owner",
    path: "/setup",
    viewport: { w: 900, h: 700 },
    fake: [{ path: "/__suspend", body: { id: SERVER, suspended: true } }],
    crop: BLOCKED,
    targets: { ...BLOCKED_TARGETS, contact: role("link", "contact@funipay.net") },
  },
  {
    id: "setup-2",
    identity: "newbie",
    path: "/setup",
    viewport: WIZARD_VIEWPORT,
    actions: toStep2,
    crop: WIZARD,
    targets: {
      adminRole: role("combobox", "管理員身分組"),
      logChannel: role("combobox", "日誌頻道"),
      next: NEXT,
    },
  },
  {
    id: "setup-3",
    identity: "newbie",
    path: "/setup",
    viewport: WIZARD_VIEWPORT,
    actions: toStep3,
    crop: WIZARD,
    targets: {
      storeNumber: role("textbox", "商家代號"),
      paramCode: role("textbox", "參數碼"),
      verifyKey: role("textbox", "檢查碼"),
      midParam: role("textbox", "商家驗證參數（推薦）"),
      next: NEXT,
    },
  },
  {
    id: "setup-4",
    identity: "newbie",
    path: "/setup",
    viewport: WIZARD_VIEWPORT,
    actions: toStep4,
    crop: WIZARD,
    targets: {
      bankTransfer: role("switch", "銀行轉帳"),
      storeBarcode: role("switch", "四大超商條碼"),
      ibon: role("switch", "7-11 超商代碼"),
      famiport: role("switch", "全家超商代碼"),
      hilife: role("switch", "萊爾富超商代碼"),
      next: NEXT,
    },
  },
  {
    id: "setup-5",
    identity: "newbie",
    path: "/setup",
    viewport: WIZARD_VIEWPORT,
    actions: toStep5,
    crop: WIZARD,
    targets: {
      summary: role("region", "設定摘要"),
      agree: 'input[type="checkbox"]',
      create: role("button", "建立"),
    },
  },

  // ---- 總覽 ----
  { id: "overview", identity: "owner", path: BASE, viewport: DESKTOP, targets: OVERVIEW_TARGETS, desktopTargets: OVERVIEW_DESKTOP },
  // After 近 7 天 is picked (the overview page after the period7d link)
  {
    id: "overview-7d",
    identity: "owner",
    path: `${BASE}?period=last_7d`,
    viewport: DESKTOP,
    targets: OVERVIEW_TARGETS,
    desktopTargets: { periodCustom: role("button", "自訂…") },
  },
  {
    id: "overview-incl-fee",
    identity: "owner",
    path: BASE,
    viewport: DESKTOP,
    actions: [`click:${role("switch", "含手續費")}`],
    targets: OVERVIEW_TARGETS,
    desktopTargets: { periodCustom: role("button", "自訂…") },
  },
  {
    id: "overview-custom-period",
    identity: "owner",
    path: BASE,
    viewport: DESKTOP,
    actions: [`click:${role("button", "自訂…")}`, `wait:${role("button", "套用自訂期間")}`],
    targets: {
      period: role("navigation", "期間"),
      periodCustom: role("button", "自訂…"),
      customForm: "form:has(input[name='start'])",
      start: "input[name='start']",
      end: "input[name='end']",
      apply: role("button", "套用自訂期間"),
    },
  },

  // ---- 訂單 ----
  { id: "orders", identity: "owner", path: `${BASE}/orders`, viewport: DESKTOP, targets: ORDERS_TARGETS, desktopTargets: SIDEBAR, mobileTargets: ORDERS_MOBILE },
  // The 付款方式 filter's menu is not taken: it lists a method whose name the site must not show.
  {
    id: "orders-type-menu",
    identity: "owner",
    path: `${BASE}/orders`,
    viewport: DESKTOP,
    actions: [`click:${role("button", "訂單類型")}`, "wait:role=dialog"],
    targets: {
      ...ORDERS_TARGETS,
      menu: "role=dialog",
      typePayment: `role=dialog >> ${role("link", "一般訂單")}`,
      typeTopup: `role=dialog >> ${role("link", "儲值")}`,
    },
    mobileTargets: ORDERS_MOBILE,
  },
  { id: "orders-complete", identity: "owner", path: `${BASE}/orders?status=complete`, viewport: DESKTOP, targets: ORDERS_TARGETS, mobileTargets: ORDERS_MOBILE },
  { id: "orders-search", identity: "owner", path: `${BASE}/orders?q=SHOP-001`, viewport: DESKTOP, targets: ORDERS_TARGETS, mobileTargets: ORDERS_MOBILE },
  {
    id: "order-detail",
    identity: "owner",
    path: `${BASE}/orders/${ORDER}`,
    viewport: DESKTOP,
    targets: {
      back: role("link", "返回訂單列表"),
      title: role("heading", "訂單 050000000001"),
      amount: role("region", "金額"),
      timeline: role("list", "時間軸"),
      order: role("region", "訂單"),
      copyId: role("button", "複製 050000000001"),
      customer: role("region", "顧客"),
      invoice: role("region", "發票與備註"),
    },
    desktopTargets: SIDEBAR,
  },

  // ---- 設定 ----
  ...settingsTab("basic", BASIC, ["pick:指令頻道|#指令區"]),
  // The bot takes 1 to 4 digits (settings_schema), so the new value is 4 digits
  ...settingsTab("smilepay", SMILEPAY, [`fill:${SMILEPAY.midParam}|2468`]),
  ...settingsTab("payment", PAYMENT, [`click:${PAYMENT.hilife}`]),
  // Then 銀行轉帳's fee from the default 13 to 15, 萊爾富 still off (two changes):
  // settings-payment-fee-edited / -fee-saved
  ...settingsEdits("payment", PAYMENT, [["fee", `fill:${PAYMENT.bankTransferFee}|15`]], { before: [`click:${PAYMENT.hilife}`] }),
  ...settingsTab(
    "channels",
    CHANNELS,
    [`click:${CHANNELS.expiredRename}`, `fill:${role("textbox", "訂單過期時 頻道名稱")}|已過期｜<name:ticket->`],
    CHANNELS_WIDE,
  ),
  ...settingsTab("balance", BALANCE, [`click:${BALANCE.topup}`]),
  // Each switch in turn (the fixture has 點數轉帳 off, 用點數付款 and 點數排行榜 on), a new
  // name and a balance admin role: settings-balance-transfer … -roles, then -roles-saved
  ...settingsEdits("balance", BALANCE, [
    ["transfer", `click:${BALANCE.transfer}`],
    ["pay", `click:${BALANCE.payWithBalance}`],
    ["leaderboard", `click:${BALANCE.leaderboard}`],
    ["name", `fill:${BALANCE.name}|星光幣`],
    ["roles", "pick:點數管理員身分組|管理員"],
  ]),

  // ---- 設定變更紀錄、功能說明 ----
  {
    id: "settings-history",
    identity: "owner",
    path: `${BASE}/settings/history`,
    viewport: DESKTOP,
    targets: {
      intro: "main p:has-text('都會記在這裡')",
      list: role("table", "設定變更紀錄"),
      webRow: "role=row[name=/管理員身分組 管理員 管理員、VIP$/]",
      secretRow: "role=row[name=/SmilePay 檢查碼/]",
      systemRow: "role=row[name=/萊爾富超商代碼 開啟 關閉$/]",
      createdRow: "role=row[name=/建立設定/]",
      pagination: role("navigation", "分頁"),
    },
    // Phones show one card per change instead of the table
    mobileTargets: {
      list: role("list", "設定變更紀錄（卡片）"),
      webRow: 'li:has-text("管理員身分組")',
      secretRow: 'li:has-text("SmilePay 檢查碼")',
      systemRow: 'li:has-text("萊爾富超商代碼")',
      createdRow: 'li:has-text("建立設定")',
    },
    desktopTargets: SIDEBAR,
  },
  {
    id: "features",
    identity: "owner",
    path: `${BASE}/features`,
    viewport: DESKTOP,
    targets: {
      autoPublish: role("region", "Auto Publisher"),
      autoPublishChannels: `${role("region", "Auto Publisher")} >> role=list`,
      dynamicVc: role("region", "動態語音頻道改名"),
      dynamicVcChannels: `${role("region", "動態語音頻道改名")} >> role=list`,
      variables: "main details",
    },
    desktopTargets: SIDEBAR,
  },
  {
    id: "features-variables-open",
    identity: "owner",
    path: `${BASE}/features`,
    viewport: DESKTOP,
    // Cut to the page's content: with the sidebar the picture is over 200 KB
    crop: { selector: "main", pad: 16 },
    actions: [`click:summary:text-is("可用的範本變數")`, "wait:main details >> ul"],
    targets: {
      dynamicVc: role("region", "動態語音頻道改名"),
      variables: "main details",
      variablesSummary: 'main details > summary',
      variablesList: "main details >> ul",
      varServerMembers: 'main details li:has(code:text-is("%server_members%"))',
      varCompletedAmount: 'main details li:has(code:text-is("%completed_amount%"))',
      varPendingOrders: 'main details li:has(code:text-is("%pending_orders%"))',
      varMonthlyOrders: 'main details li:has(code:text-is("%monthly_orders%"))',
    },
  },
];
