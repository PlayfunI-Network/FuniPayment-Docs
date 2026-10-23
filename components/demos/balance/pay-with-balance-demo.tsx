"use client";
// /fp paid with points: the merchant's /fp 500 reply is already in the ticket channel; the
// customer picks the balance option (only listed when 用點數付款 is on, +0元), confirms, the
// message becomes the green 消費通知 and the customer gets a DM (views/fp.py: confirm_callback).
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type Pane,
  type SceneLayout,
} from "@/components/demo";
import { ChatInput } from "@/components/discord";
import { DEMO_BOT, DEMO_CHANNELS, DEMO_PEOPLE } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.payWithBalance;
const CHANNEL = DEMO_CHANNELS.ticket.name;

type Bot = "select" | "menu" | "menuPick" | "confirm" | "paid";

type Layout = SceneLayout<{ reply: CanvasArea; select: CanvasPoint; menu: CanvasArea; option: CanvasPoint; confirm: CanvasPoint; aside: CanvasPoint }>;
export type Screen = { panes: Pane[] };

const WIDE: Layout = {
  w: 640,
  h: 720,
  at: {
    reply: { x: 0, y: 340, w: 640, h: 320 },
    select: { x: 230, y: 621 },
    menu: { x: 0, y: 320, w: 600, h: 340 },
    option: { x: 200, y: 578 },
    confirm: { x: 240, y: 626 },
    aside: { x: 600, y: 450 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {
    reply: { x: 0, y: 320, w: 400, h: 380 },
    select: { x: 180, y: 661 },
    menu: { x: 0, y: 350, w: 400, h: 350 },
    option: { x: 180, y: 618 },
    confirm: { x: 240, y: 666 },
    aside: { x: 384, y: 450 },
  },
};

function Body({ bot }: { bot: Bot }) {
  switch (bot) {
    case "select":
      return <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} />;
    case "menu":
      return <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} menu={{ open: "up" }} />;
    case "menuPick":
      return <SnapshotMessage id="flow/fp_command/ok" scenario={SCENARIO} menu={{ open: "up", active: "balance" }} />;
    case "confirm":
      return <SnapshotMessage id="builder/fp/balance/500/designated=False" scenario={SCENARIO} />;
    case "paid":
      return <SnapshotMessage id="flow/fp_balance_confirm/500" scenario={SCENARIO} />;
  }
}

const channel = (bot: Bot): Pane => ({
  id: "channel",
  kind: "channel",
  title: CHANNEL,
  input: <ChatInput channel={CHANNEL} />,
  messages: (
    <>
      <ChatMessage from="buyer" ago={3}>{`我想買 ${SCENARIO.amount} 元的方案，用點數付`}</ChatMessage>
      <ChatMessage from="admin" ago={2}>
        好的，開單給你
      </ChatMessage>
      <ChatMessage from="bot" command={{ by: "admin", name: "fp" }}>
        <div key={bot.startsWith("menu") ? "menu" : bot} className={bot.startsWith("menu") || bot === "select" ? "" : "demo-in"}>
          <Body bot={bot} />
        </div>
      </ChatMessage>
    </>
  ),
});

const DM: Pane = {
  id: "dm",
  kind: "dm",
  title: DEMO_BOT.name,
  tag: `${DEMO_PEOPLE.buyer.name}的私訊`,
  grow: 0.6,
  messages: (
    <ChatMessage from="bot" enter>
      <SnapshotMessage id="flow/fp_balance_confirm/500@Client.send_dm_to_user" scenario={SCENARIO} />
    </ChatMessage>
  ),
};

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, { panes: [] });

  step(0, { panes: [channel("select")] }, { caption: "商家開好 /fp，顧客打開付款方式選單", shot: zoom(1.3, l.at.reply), cursor: point(l.at.aside) });
  step(800, {}, { cursor: point(l.at.select) });
  step(1600, {}, { cursor: point(l.at.select, { click: true }) });
  step(1800, { panes: [channel("menu")] }, { caption: "選最後一個「商城點數（+0元）」", shot: zoom(1.3, l.at.menu) });
  step(2600, {}, { cursor: point(l.at.option) });
  step(3300, { panes: [channel("menuPick")] }, { cursor: point(l.at.option, { click: true }) });
  step(3600, { panes: [channel("confirm")] }, {
    caption: "確認要花的點數和付款後的餘額，按「確認並支付商城點數」",
    shot: zoom(1.3, l.at.reply),
    cursor: point(l.at.aside),
  });
  step(4500, {}, { cursor: point(l.at.confirm) });
  step(5400, {}, { cursor: point(l.at.confirm, { click: true }) });
  step(5700, { panes: [channel("paid")] }, { caption: "訊息換成綠色的「商城點數消費通知」，訂單完成", cursor: point(l.at.aside) });
  step(7600, { panes: [channel("paid"), DM] }, {
    caption: `${DEMO_PEOPLE.buyer.name}也收到消費通知私訊`,
    shot: { zoom: 1 },
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(11000, {}, {});
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function PayWithBalanceDemo() {
  return (
    <DiscordDemo
      label={`示範：商家用 /fp 開了 ${SCENARIO.amount} 元的單，顧客從選單選商城點數，確認後扣掉 ${SCENARIO.amount} 點，訊息變成商城點數消費通知，顧客也收到私訊`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <DiscordScene layout={layout} panes={step.screen.panes} />}
    </DiscordDemo>
  );
}
