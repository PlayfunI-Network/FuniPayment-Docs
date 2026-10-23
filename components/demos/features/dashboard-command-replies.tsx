// The replies of /dashboard and /settings, one tab each: both are sent only to the person who
// ran the command (guide.py / settings.py send them ephemeral), so each is drawn inside
// Discord's 「只有你看得到這則訊息」 line. Still pictures: nothing to animate.
import { MessageWindow, SnapshotMessage, SnapshotTabs, type SnapshotTab } from "@/components/demo";
import { Ephemeral } from "@/components/discord";
import type { DemoSender, SnapshotId } from "@/lib/scenario";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { SCENARIOS } from "../scenarios";

const SCENARIO = SCENARIOS.fpStoreBarcode;
const CHANNEL = DEMO_CHANNELS.command.name;

/** The replies in tab order: the command, who ran it, and the snapshot. */
export const REPLIES: { tab: string; label: string; command: string; by: DemoSender; id: SnapshotId }[] = [
  {
    tab: "/dashboard",
    label: "伺服器已經設定好時，/dashboard 的回覆",
    command: "dashboard",
    by: "admin",
    id: "guide/dashboard/set_up",
  },
  {
    tab: "/dashboard（還沒設定）",
    label: "伺服器還沒設定時，/dashboard 的回覆",
    command: "dashboard",
    by: "admin",
    id: "guide/dashboard/not_set_up_web",
  },
  {
    tab: "/settings",
    label: "伺服器已經設定好時，/settings 的回覆",
    command: "settings",
    by: "admin",
    id: "guide/settings/set_up",
  },
  {
    tab: "/settings（還沒設定）",
    label: "伺服器還沒設定時，/settings 的回覆",
    command: "settings",
    by: "admin",
    id: "guide/settings/not_set_up",
  },
];

const TABS: SnapshotTab[] = REPLIES.map((r) => ({
  tab: r.tab,
  label: r.label,
  content: (
    <MessageWindow channel={CHANNEL} command={{ by: r.by, name: r.command }}>
      <Ephemeral>
        <SnapshotMessage id={r.id} scenario={SCENARIO} />
      </Ephemeral>
    </MessageWindow>
  ),
}));

export function DashboardCommandReplies() {
  return <SnapshotTabs label="/dashboard 與 /settings 的回覆" tabs={TABS} />;
}
