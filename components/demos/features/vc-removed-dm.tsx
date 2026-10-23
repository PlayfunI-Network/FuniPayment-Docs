// The DM the merchant owner gets when a dynamic voice channel can no longer be renamed (deleted,
// hidden from the bot, or no permission) and the bot drops its template (client.py
// update_dynamic_vcs). A still picture: one message, nothing to animate.
import { DiscordStill, SnapshotMessage } from "@/components/demo";
import { SCENARIOS } from "@/components/demos/scenarios";

export function VcRemovedDm() {
  return (
    <DiscordStill label="畫面：動態語音頻道的設定被移除時，商家擁有者收到的私訊">
      <SnapshotMessage id="server/dynamic_vc_loop/not_found" scenario={SCENARIOS.fpStoreBarcode} />
    </DiscordStill>
  );
}
