"use client";
// A sample demo for checking the camera and cursor by eye (used by the dev-only page.dev.tsx).
// The screen is a made-up SVG, not a real dashboard; its texts are placeholders.
import { DemoStage, type DemoStep, type Rect } from "@/components/demo";

/** The screen is drawn on a 1600 × 1000 canvas; rects are converted to 0–1 fractions. */
const W = 1600;
const H = 1000;
const px = (x: number, y: number, w: number, h: number): Rect => ({ x: x / W, y: y / H, w: w / W, h: h / H });

const BUTTON = { x: 1170, y: 170, w: 290, h: 72 };
const BUTTON_CENTER = { x: (BUTTON.x + BUTTON.w * 0.55) / W, y: (BUTTON.y + BUTTON.h * 0.6) / H };
/** What the camera frames around the button: the button plus some of the page around it. */
const BUTTON_AREA = px(BUTTON.x - 260, BUTTON.y - 90, BUTTON.w + 330, BUTTON.h + 230);

const STEPS: DemoStep[] = [
  { at: 0, caption: "找到「建立訂單」", cursor: { x: 0.34, y: 0.72 } },
  { at: 700, cursor: { x: BUTTON_CENTER.x, y: BUTTON_CENTER.y } },
  { at: 1700, shot: { zoom: 2.2, focus: BUTTON_AREA } },
  { at: 2700, caption: "點一下按鈕", cursor: { ...BUTTON_CENTER, click: true } },
  { at: 3100 },
  { at: 4000, caption: "訂單建立好了", shot: { zoom: 1 } },
  { at: 6500 },
];
/** From this step on the screen shows the result of the click. */
const CLICKED = 4;

export function SampleDemo() {
  return (
    <DemoStage label="示範：把游標移到「建立訂單」，放大後點擊，再拉回全景" steps={STEPS} caption>
      {(_, index) => <Screen clicked={index >= CLICKED} />}
    </DemoStage>
  );
}

function Screen({ clicked }: { clicked: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" preserveAspectRatio="none">
      <rect width={W} height={H} fill="#0f1115" />
      <rect width="300" height={H} fill="#16181d" />
      <text x="48" y="92" fill="#ececec" fontSize="34" fontWeight="700">
        星光遊戲社
      </text>
      {["總覽", "訂單", "功能", "設定"].map((t, i) => (
        <g key={t}>
          <rect x="28" y={150 + i * 80} width="244" height="60" rx="12" fill={i === 1 ? "#232833" : "transparent"} />
          <text x="60" y={190 + i * 80} fill={i === 1 ? "#ececec" : "#8c8c8c"} fontSize="28">
            {t}
          </text>
        </g>
      ))}
      <text x="360" y="225" fill="#ececec" fontSize="48" fontWeight="700">
        訂單
      </text>
      <rect
        x={BUTTON.x}
        y={BUTTON.y}
        width={BUTTON.w}
        height={BUTTON.h}
        rx="14"
        fill={clicked ? "#3a8fbf" : "#5aa9d6"}
        style={{ transition: "fill 200ms" }}
      />
      <text x={BUTTON.x + BUTTON.w / 2} y={BUTTON.y + 47} fill="#0a0a0a" fontSize="30" fontWeight="700" textAnchor="middle">
        ＋ 建立訂單
      </text>
      {[0, 1, 2, 3, 4].map((i) => {
        const fresh = clicked && i === 0;
        const y = 300 + i * 120;
        return (
          <g key={i} style={{ opacity: !clicked && i === 0 ? 0 : 1, transition: "opacity 400ms" }}>
            <rect x="360" y={y} width="1100" height="96" rx="16" fill={fresh ? "#16301f" : "#16181d"} stroke="#232323" />
            <text x="400" y={y + 58} fill="#ececec" fontSize="28">
              {`訂單 #A10${42 - i}`}
            </text>
            <text x="1000" y={y + 58} fill="#8c8c8c" fontSize="28">
              {`NT$ ${(i + 3) * 150}`}
            </text>
            <text x="1300" y={y + 58} fill={fresh ? "#5ccf8f" : "#8c8c8c"} fontSize="28">
              {fresh ? "剛建立" : "已付款"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
