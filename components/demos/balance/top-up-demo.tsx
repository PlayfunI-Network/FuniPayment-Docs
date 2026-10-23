"use client";
// /top-up 300: the customer picks 7-11 ibon in the reply only they see, confirms, and the bot
// creates the order. The order reaches the customer's DM (send_to_dm_and_log); once it is paid,
// the DM gets the payment notice and 「成功儲值」 with the new balance (notifier.topup_completed).
import { SnapshotEmbed, SnapshotMessage, type CanvasArea, type CanvasLayout, type CanvasPoint } from "@/components/demo";
import { Ephemeral } from "@/components/discord";
import { COMMANDS } from "@/content/bot-ui.generated";
import { DEMO_CHANNELS, DEMO_PEOPLE } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";
import { BOT, ChatDemo, type Input, type Msg, type Pane } from "./scene";
import { stepper } from "./timeline";

const SCENARIO = SCENARIOS.topUp;
const CMD = COMMANDS["top-up"];
const AMOUNT = CMD.options.find((o) => o.name === "amount")!;
const CHANNEL = DEMO_CHANNELS.command.name;

type Reply = "select" | "menu" | "menuPick" | "confirm" | "done";

type Layout = CanvasLayout & {
  h: number;
  at: {
    typing: CanvasPoint;
    input: CanvasArea;
    reply: CanvasArea;
    select: CanvasPoint;
    menu: CanvasArea;
    option: CanvasPoint;
    confirm: CanvasPoint;
    aside: CanvasPoint;
  };
};

const WIDE: Layout = {
  w: 640,
  h: 720,
  at: {
    typing: { x: 120, y: 682 },
    input: { x: 0, y: 520, w: 440, h: 200 },
    reply: { x: 0, y: 240, w: 640, h: 420 },
    select: { x: 230, y: 597 },
    menu: { x: 0, y: 280, w: 560, h: 360 },
    option: { x: 200, y: 466 },
    confirm: { x: 236, y: 606 },
    aside: { x: 600, y: 450 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 760,
  at: {
    typing: { x: 120, y: 722 },
    input: { x: 0, y: 560, w: 400, h: 200 },
    reply: { x: 0, y: 220, w: 400, h: 480 },
    select: { x: 180, y: 637 },
    menu: { x: 0, y: 300, w: 400, h: 400 },
    option: { x: 180, y: 506 },
    confirm: { x: 236, y: 646 },
    aside: { x: 384, y: 450 },
  },
};

function ReplyBody({ reply }: { reply: Reply }) {
  switch (reply) {
    case "select":
      return <SnapshotMessage id="flow/topup_command/ok" scenario={SCENARIO} />;
    case "menu":
      return <SnapshotMessage id="flow/topup_command/ok" scenario={SCENARIO} menu={{ open: "up" }} />;
    case "menuPick":
      return <SnapshotMessage id="flow/topup_command/ok" scenario={SCENARIO} menu={{ open: "up", active: SCENARIO.method }} />;
    // The later screens edit the same reply, so they stay visible to the customer only.
    case "confirm":
      return (
        <Ephemeral>
          <SnapshotMessage id="builder/topup/bank_transfer" scenario={SCENARIO} />
        </Ephemeral>
      );
    case "done":
      return (
        <Ephemeral>
          <SnapshotMessage id="flow/topup_confirm" scenario={SCENARIO} />
        </Ephemeral>
      );
  }
}

const channel = (input: Input, reply: Reply | null): Pane[] => [
  {
    id: "channel",
    kind: "channel",
    title: CHANNEL,
    input,
    messages: reply
      ? [
          {
            id: "reply",
            from: "bot",
            command: { by: "buyer", name: CMD.name },
            body: (
              <div key={reply.startsWith("menu") ? "menu" : reply} className={reply.startsWith("menu") ? "" : "demo-in"}>
                <ReplyBody reply={reply} />
              </div>
            ),
          },
        ]
      : [],
  },
];

const ORDER: Msg = {
  id: "order",
  from: "bot",
  ago: 30,
  body: <SnapshotEmbed id="builder/payment_create/ibon/invoice=False" scenario={SCENARIO} />,
};
const PAID: Msg = { id: "paid", from: "bot", enter: true, body: <SnapshotEmbed id="builder/payment_complete" scenario={SCENARIO} /> };
const TOPPED: Msg = { id: "topped", from: "bot", enter: true, body: <SnapshotEmbed id="builder/topup_success@dm" scenario={SCENARIO} /> };

const dm = (messages: Msg[]): Pane[] => [
  { id: "dm", kind: "dm", title: BOT.name, tag: `${DEMO_PEOPLE.buyer.name}的私訊`, messages },
];

function timeline(l: Layout) {
  const { out, step, point, zoom } = stepper(l);
  const typing = point(l.at.typing, { typing: true });
  const empty: Input = { kind: "empty" };

  step(0, channel(empty, null), { caption: "顧客輸入 /top-up，金額填 300", shot: zoom(1.7, l.at.input), cursor: typing });
  step(300, channel({ kind: "typing", command: CMD.name, description: CMD.description, typed: "/top" }, null), {
    cursor: { ...typing, click: true },
  });
  step(600, channel({ kind: "typing", command: CMD.name, description: CMD.description, typed: "/top-up" }, null));
  step(1300, channel({ kind: "options", command: CMD.name, options: [{ name: AMOUNT.nameZh, value: String(SCENARIO.amount) }] }, null));
  step(2500, channel(empty, "select"), {
    caption: "回覆只有顧客看得到；打開選單選「7-11 超商代碼」",
    shot: zoom(1.3, l.at.reply),
    cursor: point(l.at.select),
  });
  step(3500, null, { cursor: point(l.at.select, { click: true }) });
  step(3700, channel(empty, "menu"), { shot: zoom(1.4, l.at.menu) });
  step(4400, null, { cursor: point(l.at.option) });
  step(5000, channel(empty, "menuPick"), { cursor: point(l.at.option, { click: true }) });
  step(5300, channel(empty, "confirm"), {
    caption: "確認點數、付款金額和手續費，按「確認並獲取付款碼」",
    shot: zoom(1.3, l.at.reply),
    cursor: point(l.at.aside),
  });
  step(6100, null, { cursor: point(l.at.confirm) });
  step(6900, null, { cursor: point(l.at.confirm, { click: true }) });
  step(7200, channel(empty, "done"), { cursor: { ...point(l.at.aside), hidden: true } });
  step(8600, dm([ORDER]), { caption: "付款資訊私訊給顧客，照著去 7-11 付款", shot: { zoom: 1 } });
  step(11000, dm([ORDER, PAID, TOPPED]), { caption: "付款完成後，點數自動入帳，私訊寫著新的餘額" });
  step(14000, null, {});
  return out;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function TopUpDemo() {
  return (
    <ChatDemo
      label={`示範：顧客輸入 /top-up 金額 ${SCENARIO.amount}，在只有自己看得到的回覆裡選 7-11 超商代碼並確認，付款資訊私訊給顧客，付款完成後點數入帳，私訊顯示成功儲值與新的餘額`}
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    />
  );
}
