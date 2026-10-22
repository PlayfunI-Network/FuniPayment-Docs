import type { ReactNode } from "react";
import type { AvatarSource } from "./avatar";
import { ChannelHeader } from "./channel-header";

/** Discord's own type stack; gg sans is not loaded, the system fallbacks take over. */
export const DISCORD_FONT =
  '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';

/**
 * A Discord dark-theme window: channel header plus the message pane. Always dark, whatever
 * the site theme. Children are messages (and optionally a SlashPicker at the bottom).
 */
export function DiscordWindow({
  title,
  kind,
  children,
  className = "",
  avatar,
}: {
  title: string;
  kind: "channel" | "dm";
  children: ReactNode;
  className?: string;
  /** DM only: the peer's avatar in the header. */
  avatar?: AvatarSource;
}) {
  return (
    <div
      className={`@container w-full max-w-full min-w-0 overflow-hidden rounded-lg border border-[#1e1f22] bg-[#313338] text-left text-[#dbdee1] shadow-[0_8px_24px_rgb(0_0_0/0.28)] [color-scheme:dark] ${className}`}
      style={{ fontFamily: DISCORD_FONT, lineHeight: 1.375 }}
    >
      <ChannelHeader name={title} kind={kind} avatar={avatar} />
      <div className="flex min-w-0 flex-col pt-1 pb-4">{children}</div>
    </div>
  );
}
