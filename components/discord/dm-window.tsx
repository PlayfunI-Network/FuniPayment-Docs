import type { ReactNode } from "react";
import type { AvatarSource } from "./avatar";
import { DiscordWindow } from "./window";

/** A direct-message window with `peer`: their avatar and name in the header, then the messages. */
export function DmWindow({
  peer,
  avatar,
  children,
  className,
}: {
  peer: string;
  avatar: AvatarSource;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DiscordWindow title={peer} kind="dm" avatar={avatar} className={className}>
      {children}
    </DiscordWindow>
  );
}
