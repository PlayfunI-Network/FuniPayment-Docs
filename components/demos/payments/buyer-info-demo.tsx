"use client";
// The buyer information step of /payment create: the screen comes up with nothing filled in and
// 「確認並獲取付款碼」 greyed out; the customer opens 「✏️ 填寫/修改資訊」, types the three fields
// and submits, and the screen shows the values with the confirm button enabled.
import {
  ChatMessage,
  DiscordDemo,
  DiscordScene,
  SnapshotMessage,
  stepper,
  type CanvasArea,
  type CanvasPoint,
  type SceneLayout,
} from "@/components/demo";
import { Ephemeral, Modal } from "@/components/discord";
import { BOT_UI } from "@/content/bot-ui.generated";
import { DEMO_BUYER_INFO, DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.payBankTransfer;
const CHANNEL = DEMO_CHANNELS.command.name;
const MODAL = BOT_UI["modal/consumer_info"];
/** What the customer types into each field (by the modal's field id). */
const TYPED: Record<string, string> = { name: DEMO_BUYER_INFO.name, mail: DEMO_BUYER_INFO.email, phone: DEMO_BUYER_INFO.phone };

type Typed = Partial<Record<"name" | "mail" | "phone", string>>;
export type Screen = { filled: boolean; modal: Typed | null };
type Targets = {
  card: CanvasArea;
  edit: CanvasPoint;
  modal: CanvasArea;
  fields: Record<"name" | "mail" | "phone", CanvasPoint>;
  submit: CanvasPoint;
  confirm: CanvasPoint;
  aside: CanvasPoint;
};
type Layout = SceneLayout<Targets>;

/** Measured on app/dev/payments-measure under next dev in Chrome at 1280px and 375px viewports. */
const WIDE: Layout = {
  w: 640,
  h: 640,
  at: {
    card: { x: 40, y: 230, w: 600, h: 400 },
    edit: { x: 235, y: 582 },
    modal: { x: 100, y: 95, w: 440, h: 390 },
    fields: { name: { x: 480, y: 199 }, mail: { x: 480, y: 283 }, phone: { x: 480, y: 367 } },
    submit: { x: 476, y: 446 },
    confirm: { x: 390, y: 582 },
    aside: { x: 620, y: 440 },
  },
};
const NARROW: Layout = {
  w: 400,
  h: 700,
  at: {
    card: { x: 20, y: 210, w: 380, h: 480 },
    edit: { x: 231, y: 602 },
    modal: { x: 0, y: 125, w: 400, h: 390 },
    fields: { name: { x: 340, y: 229 }, mail: { x: 340, y: 313 }, phone: { x: 340, y: 397 } },
    submit: { x: 328, y: 476 },
    // The buttons wrap: 確認並獲取付款碼 is alone on the second row.
    confirm: { x: 136, y: 642 },
    aside: { x: 392, y: 560 },
  },
};

function timeline(l: Layout) {
  const { steps, step, point, zoom } = stepper<Screen>(l, { filled: false, modal: null });
  const typeInto = (at: number, field: "name" | "mail" | "phone", typed: Typed) => {
    const p = point(l.at.fields[field], { typing: true });
    step(at, {}, { cursor: { ...p, click: true } });
    step(at + 400, { modal: { ...typed, [field]: TYPED[field] } }, { cursor: p });
    return { ...typed, [field]: TYPED[field] };
  };
  step(0, {}, {
    caption: "還沒填資料，「確認並獲取付款碼」按不下去",
    shot: zoom(1.35, l.at.card),
    cursor: { ...point(l.at.aside), hidden: true },
  });
  step(1800, {}, { caption: "按「✏️ 填寫/修改資訊」", cursor: point(l.at.edit) });
  step(2600, {}, { cursor: point(l.at.edit, { click: true }) });
  step(2900, { modal: {} }, { caption: "填姓名、電子郵件和電話", shot: zoom(1.3, l.at.modal), cursor: point(l.at.aside) });
  const named = typeInto(3600, "name", {});
  typeInto(5800, "phone", typeInto(4700, "mail", named));
  step(7000, {}, { caption: "三欄都填好後送出", cursor: point(l.at.submit) });
  step(7700, {}, { cursor: point(l.at.submit, { click: true }) });
  step(8000, { modal: null, filled: true }, {
    caption: "資料填進畫面，「確認並獲取付款碼」可以按了",
    shot: zoom(1.35, l.at.card),
    cursor: point(l.at.aside),
  });
  step(9000, {}, { cursor: point(l.at.confirm) });
  step(11500, {}, { shot: { zoom: 1 }, cursor: { ...point(l.at.confirm), hidden: true } });
  return steps;
}

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export const WIDE_STEPS = timeline(WIDE);
export const NARROW_STEPS = timeline(NARROW);

export function BuyerInfoScreen({ screen, layout }: { screen: Screen; layout: Layout }) {
  return (
    <div className="relative h-full w-full">
      <DiscordScene
        layout={layout}
        panes={[
          {
            id: "channel",
            kind: "channel",
            title: CHANNEL,
            messages: (
              <ChatMessage from="bot" command={{ by: "buyer", name: "payment create" }}>
                {screen.filled ? (
                  <Ephemeral>
                    <SnapshotMessage key="filled" id="builder/consumer_info/filled=True/cancel_first=True" scenario={SCENARIO} />
                  </Ephemeral>
                ) : (
                  // Already ephemeral in the snapshot (the command's own reply).
                  <SnapshotMessage id="flow/payment_create_command/ok" scenario={SCENARIO} />
                )}
              </ChatMessage>
            ),
          },
        ]}
      />
      {screen.modal && (
        <div className="demo-in absolute inset-0 flex items-center justify-center bg-black/70 px-2" style={{ paddingBottom: 60 }}>
          <Modal
            title={MODAL.title}
            fields={MODAL.fields.map((f) => ({ label: f.label, required: f.required, value: screen.modal?.[f.id as keyof Typed] }))}
          />
        </div>
      )}
    </div>
  );
}

export function BuyerInfoDemo() {
  return (
    <DiscordDemo
      label="示範：購買人資訊還沒填時確認按鈕不能按；顧客按填寫/修改資訊，在表單填入姓名、電子郵件和電話後送出，畫面顯示資料，確認並獲取付款碼變成可以按"
      wide={{ layout: WIDE, steps: WIDE_STEPS }}
      narrow={{ layout: NARROW, steps: NARROW_STEPS }}
    >
      {(step, layout) => <BuyerInfoScreen screen={step.screen} layout={layout} />}
    </DiscordDemo>
  );
}
