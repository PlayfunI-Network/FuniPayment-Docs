import { Avatar, type AvatarSource } from "./avatar";

/**
 * Discord's channel title bar: # icon (text channel) or @ icon (DM) and the name.
 * `nameClassName` lets a demo animate the name when the bot renames the channel; `compact`
 * is a smaller bar for the side-by-side windows of the notification demo. A DM with `avatar`
 * shows the peer's avatar in place of the @ icon, as Discord's DM header does.
 */
export function ChannelHeader({
  name,
  kind,
  nameClassName = "",
  compact,
  avatar,
}: {
  name: string;
  kind: "channel" | "dm";
  nameClassName?: string;
  compact?: boolean;
  avatar?: AvatarSource;
}) {
  const icon = compact ? 18 : 24;
  return (
    <div
      className={`flex min-w-0 items-center border-b border-[#1f2023] bg-[#2b2d31] ${compact ? "h-10 gap-1.5 px-3" : "h-12 gap-2 px-4"} shadow-[0_1px_0_rgb(4_4_5/0.2),0_1.5px_0_rgb(6_6_7/0.05),0_2px_0_rgb(4_4_5/0.05)]`}
    >
      {kind === "channel" ? (
        <svg aria-hidden width={icon} height={icon} viewBox="0 0 24 24" className="shrink-0 text-[#80848e]">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.81-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z"
            clipRule="evenodd"
          />
        </svg>
      ) : avatar ? (
        <Avatar src={avatar} size={icon} />
      ) : (
        <svg aria-hidden width={icon} height={icon} viewBox="0 0 24 24" className="shrink-0 text-[#80848e]">
          <path
            fill="currentColor"
            d="M12 3a9 9 0 1 0 4.5 16.8 1 1 0 1 0-1-1.73A7 7 0 1 1 19 12v1.5a1.5 1.5 0 0 1-3 0V8a1 1 0 0 0-1.94-.34A4.5 4.5 0 1 0 15.3 15.3 3.5 3.5 0 0 0 21 13.5V12a9 9 0 0 0-9-9Zm0 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
          />
        </svg>
      )}
      <div key={name} className={`min-w-0 truncate leading-5 font-semibold text-[#f2f3f5] ${compact ? "text-sm" : "text-base"} ${nameClassName}`}>
        {name}
      </div>
    </div>
  );
}
