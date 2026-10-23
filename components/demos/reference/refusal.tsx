// One refusal on /troubleshooting/command-errors: the bot's answer to a command, drawn from its
// snapshot in a channel window under the 「… 使用了 /command」 line. Most refusals are sent
// ephemeral; SnapshotMessage adds Discord's 「只有你看得到這則訊息」 line from the snapshot.
// A still picture: nothing to animate.
import { DiscordStill, SnapshotMessage } from "@/components/demo";
import { SCENARIOS, type ScenarioName } from "@/components/demos/scenarios";
import type { DemoSender, SnapshotId } from "@/lib/scenario";
import { DEMO_CHANNELS } from "@/lib/scenario";

export function Refusal({
  id,
  command,
  by = "buyer",
  channel = DEMO_CHANNELS.command.name,
  dm,
  scenario = "fpStoreBarcode",
  label,
}: {
  /** The command was run in a DM with the bot: draw the DM window instead of a channel. */
  dm?: boolean;
  id: SnapshotId;
  /** The command as typed, without the slash ("payment create"). */
  command: string;
  by?: DemoSender;
  /** The channel's name (illustrative; the bot has no default names). */
  channel?: string;
  scenario?: ScenarioName;
  /** What the picture shows, for assistive tech. */
  label: string;
}) {
  return (
    <DiscordStill label={label} channel={dm ? undefined : channel} command={{ by, name: command }}>
      <SnapshotMessage id={id} scenario={SCENARIOS[scenario]} />
    </DiscordStill>
  );
}
