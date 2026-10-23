// The DM the server owner gets when SmilePay answers -3003 and the system turns the payment
// method off (settings-payment page): 萊爾富, the method the page's other examples use. A still
// picture: one message, nothing to animate.
import { DiscordStill, SnapshotMessage } from "@/components/demo";
import { SCENARIOS } from "@/components/demos/scenarios";

export function AutoDisabledDm() {
  return (
    <DiscordStill label="畫面：系統自動關閉付款方式時，伺服器擁有者收到的私訊">
      <SnapshotMessage id="server/notifier/payment_method_auto_disabled" scenario={SCENARIOS.payHilife} />
    </DiscordStill>
  );
}
