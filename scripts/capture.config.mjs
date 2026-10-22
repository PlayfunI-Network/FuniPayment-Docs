// What `npm run capture` photographs on the bot's web dashboard (scripts/capture-dashboard.mjs).
//
// identity: "owner" = the merchant who owns 星光遊戲社 (fake-api session `valid`);
//           "newbie" = a new user without servers yet (session `newbie`, the /setup wizard).
// path:     the page opened first; actions then run in order.
// actions:  "click:<selector>", "check:<selector>", "fill:<selector>|<text>",
//           "pick:<combobox label>|<option>" (the dashboard's MultiSelect), "wait:<selector>".
// targets:  the elements a demo's cursor and camera aim at; each selector must match exactly one
//           visible element. Their boxes are saved as Rects (0–1 of the image).
// crop:     the element the image is cut to, plus `pad` CSS px around it (the whole page if absent).
// Selectors are Playwright selectors: CSS, or role=button[name="下一步"] and the like.

const NEW_SERVER = "222222222222222001"; // fixtures.mjs NEW_SERVER_ID (星光遊戲社 after demo-data)
const NEXT = 'role=button[name="下一步"]';
const WIZARD = { selector: "main > div", pad: 24 };
const VIEWPORT = { w: 900, h: 900 };

const toStep2 = [`check:input[value="${NEW_SERVER}"]`, `click:${NEXT}`, 'wait:role=combobox[name="管理員身分組"]'];
const toStep3 = [...toStep2, "pick:管理員身分組|管理員", "pick:日誌頻道|#日誌", `click:${NEXT}`, 'wait:input[inputmode="numeric"]'];
const toStep4 = [
  ...toStep3,
  'fill:input[inputmode="numeric"]|24680',
  'fill:input[type="password"] >> nth=0|A1B2C3',
  'fill:input[type="password"] >> nth=1|D4E5F6',
  'fill:input[type="password"] >> nth=2|G7H8',
  `click:${NEXT}`,
  'wait:role=switch[name="銀行轉帳"]',
];
const toStep5 = [...toStep4, `click:${NEXT}`, 'wait:role=region[name="設定摘要"]'];

/** @type {{id: string; identity: "owner" | "newbie"; path: string; viewport: {w: number; h: number}; actions?: string[]; targets: Record<string, string>; crop?: {selector: string; pad: number}}[]} */
export const SHOTS = [
  {
    id: "welcome",
    identity: "newbie",
    path: "/welcome",
    viewport: { w: 900, h: 760 },
    crop: { selector: 'section[aria-label="導覽"]', pad: 40 },
    targets: {
      tour: 'section[aria-label="導覽"]',
      next: 'role=button[name="下一張"]',
      skip: 'role=button[name="跳過"]',
    },
  },
  {
    id: "setup-1",
    identity: "newbie",
    path: "/setup",
    viewport: VIEWPORT,
    crop: WIZARD,
    targets: {
      server: `div:has(> label input[value="${NEW_SERVER}"])`,
      next: NEXT,
    },
  },
  {
    id: "setup-2",
    identity: "newbie",
    path: "/setup",
    viewport: VIEWPORT,
    actions: toStep2,
    crop: WIZARD,
    targets: {
      adminRole: 'role=combobox[name="管理員身分組"]',
      logChannel: 'role=combobox[name="日誌頻道"]',
      next: NEXT,
    },
  },
  {
    id: "setup-3",
    identity: "newbie",
    path: "/setup",
    viewport: VIEWPORT,
    actions: toStep3,
    crop: WIZARD,
    targets: {
      storeNumber: 'input[inputmode="numeric"]',
      paramCode: 'input[type="password"] >> nth=0',
      verifyKey: 'input[type="password"] >> nth=1',
      next: NEXT,
    },
  },
  {
    id: "setup-4",
    identity: "newbie",
    path: "/setup",
    viewport: VIEWPORT,
    actions: toStep4,
    crop: WIZARD,
    targets: {
      bankTransfer: 'role=switch[name="銀行轉帳"]',
      storeBarcode: 'role=switch[name="四大超商條碼"]',
      ibon: 'role=switch[name="7-11 超商代碼"]',
      famiport: 'role=switch[name="全家超商代碼"]',
      hilife: 'role=switch[name="萊爾富超商代碼"]',
      next: NEXT,
    },
  },
  {
    id: "setup-5",
    identity: "newbie",
    path: "/setup",
    viewport: VIEWPORT,
    actions: toStep5,
    crop: WIZARD,
    targets: {
      summary: 'role=region[name="設定摘要"]',
      agree: 'input[type="checkbox"]',
      create: 'role=button[name="建立"]',
    },
  },
];
