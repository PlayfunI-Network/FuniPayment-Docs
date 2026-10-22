// The DM the server owner gets when SmilePay answers -3003 and the system turns the payment
// method off (settings-payment page). A still picture: one message, nothing to animate.
import { SnapshotMessage } from "@/components/demo";
import { DmWindow, Message } from "@/components/discord";
import { SCENARIOS } from "@/components/demos/scenarios";
import { DEMO_NOW, discordTime } from "@/lib/scenario";

const BOT = { name: "FunI 付款系統", avatar: "/brand/funi-icon.png" } as const;

export function AutoDisabledDm() {
  return (
    <div role="img" aria-label="畫面：系統自動關閉付款方式時，伺服器擁有者收到的私訊" className="not-prose my-6">
      <div aria-hidden="true">
        <DmWindow peer={BOT.name} avatar={BOT.avatar}>
          <Message author={BOT.name} avatar={BOT.avatar} bot time={discordTime(DEMO_NOW)}>
            <SnapshotMessage id="server/notifier/payment_method_auto_disabled" scenario={SCENARIOS.payFamiport} />
          </Message>
        </DmWindow>
      </div>
    </div>
  );
}
