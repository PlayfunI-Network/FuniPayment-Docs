import { ChannelRow } from "./channel-list";
import { DISCORD_FONT } from "./window";

/**
 * A voice channel row as the sidebar shows it (speaker icon, name). The name is keyed, so when
 * the bot renames the channel the new name slides in.
 */
export function VoiceChannel({ name, highlight }: { name: string; highlight?: boolean }) {
  return (
    <div
      className="w-60 max-w-full min-w-0 rounded-lg bg-[#2b2d31] py-1 text-left [color-scheme:dark]"
      style={{ fontFamily: DISCORD_FONT, lineHeight: 1.375 }}
    >
      <ChannelRow name={name} kind="voice" highlight={highlight} />
    </div>
  );
}
