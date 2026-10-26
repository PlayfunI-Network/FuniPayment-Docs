"use client";
// The customer's DMs with the bot: the order it sent when the order was created, then the
// payment complete notice once SmilePay tells the bot the order is paid. A 7-11 code order: the
// DM copy of a store barcode order carries no barcode image, so the demo does not use one.
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  type SceneLayout,
  type SceneStep,
} from "@/components/demo";
import { DEMO_BOT } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.payIbon;

export type Screen = { paid: boolean };
type Layout = SceneLayout<Record<string, never>>;

const WIDE: Layout = {
  w: 640,
  h: 680,
  at: {},
};
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {},
};

// Both layouts show the whole DM: the order and the notice read without zooming.
const STEPS: SceneStep<Screen>[] = [
  { at: 0, screen: { paid: false }, caption: "開單時，機器人把訂單私訊給你", shot: { zoom: 1 } },
  { at: 3200, screen: { paid: false }, caption: "你到 7-11 付款" },
  { at: 5000, screen: { paid: true }, caption: "速買配通知付款完成後，私訊多了一則付款完成通知" },
  { at: 10000, screen: { paid: true } },
];

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = STEPS;
export const NARROW_STEPS = STEPS;

export function AfterPayingScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return (
    <DiscordScene
      layout={layout}
      panes={[
        {
          id: "dm",
          kind: "dm",
          title: DEMO_BOT.name,
          messages: (
            <>
              <ChatMessage from="bot" ago={90}>
                <SnapshotMessage id="builder/payment_create/ibon/invoice=False" scenario={SCENARIO} />
              </ChatMessage>
              {screen.paid && (
                <ChatMessage from="bot" enter>
                  <SnapshotMessage id="builder/payment_complete" scenario={SCENARIO} />
                </ChatMessage>
              )}
            </>
          ),
        },
      ]}
    />
  );
}

export function AfterPayingDemo() {
  return (
    <DiscordDemo
      label="示範：你和機器人的私訊裡先有開單時收到的 7-11 超商代碼訂單，付款完成後，私訊多了一則付款完成通知，列出訂單金額、手續費、付款金額和付款時間"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <AfterPayingScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
