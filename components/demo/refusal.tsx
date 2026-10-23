// A refused command as a still picture: the bot's answer drawn from its snapshot in a channel
// window under the 「… 使用了 /command」 line, or in the DM with the bot. Most refusals are sent
// ephemeral; SnapshotMessage adds Discord's 「只有你看得到這則訊息」 line from the snapshot.
import { SCENARIOS, SNAPSHOT_SCENARIOS, type ScenarioName } from "@/components/demos/scenarios";
import type { DemoSender, SnapshotId } from "@/lib/scenario";
import { DEMO_CHANNELS } from "@/lib/scenario";
import { DiscordStill } from "./discord-scene";
import { SnapshotMessage } from "./snapshot";

export function Refusal({
  id,
  command,
  by = "buyer",
  channel = DEMO_CHANNELS.command.name,
  dm,
  scenario = SNAPSHOT_SCENARIOS[id],
  label,
}: {
  id: SnapshotId;
  /** The command as typed, without the slash ("payment create"). */
  command: string;
  by?: DemoSender;
  /** The channel's name (illustrative; the bot has no default names). */
  channel?: string;
  /** The command was run in a DM with the bot: draw the DM window instead of a channel. */
  dm?: boolean;
  /** The story to fill the snapshot from; by default the one SNAPSHOT_SCENARIOS names for `id`. */
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
