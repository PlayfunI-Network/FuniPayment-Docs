"use client";
// An /fp menu nobody answers: after 24 hours the bot edits it into 「付款單已過期，請聯繫客服處理」,
// drops the menu, and renames and moves the channel with the 「訂單過期時」 settings. The names
// are what a merchant could set on the dashboard (the bot has no default names).
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  LIST_W,
  SnapshotMessage,
  type SceneLayout,
  type SceneStep,
} from "@/components/demo";
import { demoTime } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { TicketCategories } from "../shared/ticket-categories";

const SCENARIO = SCENARIOS.fpStoreBarcode;
/** The /fp message was sent a day before the demo's "now", at the same time of day. */
const YESTERDAY = demoTime().replace("今天", "昨天");

const CHANNEL = {
  selecting: { name: "選擇中｜0042", category: "選擇中" },
  expired: { name: "已過期｜0042", category: "已過期" },
} as const;
const CATEGORIES = [
  { name: "選擇中", others: [] },
  { name: "待付款", others: ["待付款｜0039"] },
  { name: "已過期", others: ["已過期｜0031"] },
];

export type Screen = { expired: boolean };
type Layout = SceneLayout;

/**
 * The window is 480 wide so the whole screen is drawn at 0.94 on a 678px stage: the 12px category
 * names show at 11px and the message's 14px text at 13px without zooming in.
 */
const WIDE: Layout = { w: LIST_W + 480, h: 460, left: LIST_W, list: true, at: {} };
const NARROW: Layout = { w: 400, h: 500, at: {} };

/** The same on both layouts: the whole screen, with nothing to zoom in on. */
const STEPS: SceneStep<Screen>[] = [
  { at: 0, screen: { expired: false }, caption: "商家送出 /fp，顧客一直沒有選付款方式" },
  { at: 2600, screen: { expired: false }, caption: "24 小時後……" },
  { at: 4000, screen: { expired: true }, caption: "選單變成過期訊息，頻道換成「訂單過期時」的名稱和分類" },
  // Holds on the expired message before the loop starts over.
  { at: 9000, screen: { expired: true } },
];

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = STEPS;
export const NARROW_STEPS = STEPS;

export function ExpiryScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  const here = screen.expired ? CHANNEL.expired : CHANNEL.selecting;
  return (
    <DiscordScene
      layout={layout}
      list={<TicketCategories here={here} categories={CATEGORIES} />}
      panes={[
        {
          id: "channel",
          kind: "channel",
          title: here.name,
          messages: (
            <ChatMessage from="bot" command={{ by: "admin", name: "fp" }} time={YESTERDAY}>
              <div key={String(screen.expired)} className={screen.expired ? "demo-in" : ""}>
                <SnapshotMessage id={screen.expired ? "source/expired_order" : "flow/fp_command/ok"} scenario={SCENARIO} />
              </div>
            </ChatMessage>
          ),
        },
      ]}
    />
  );
}

export function ExpiryDemo() {
  return (
    <DiscordDemo
      label="示範：/fp 的付款方式選單 24 小時沒人選，訊息變成付款單已過期，請聯繫客服處理，選單消失，頻道改名為已過期｜0042 並移到已過期分類。名稱都是商家自己設定的例子"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <ExpiryScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
