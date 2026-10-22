import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Avatar, type AvatarSource } from "./avatar";
import { DiscordMarkdown } from "./markdown";

const INLINE_TAGS = new Set(["a", "b", "br", "code", "em", "i", "s", "span", "strong", "u"]);

/** Text, inline tags and DiscordMarkdown flow together; anything else (embeds, rows) is a block. */
function isInline(node: ReactNode): boolean {
  if (typeof node === "string" || typeof node === "number") return true;
  if (!isValidElement(node)) return false;
  return node.type === DiscordMarkdown || (typeof node.type === "string" && INLINE_TAGS.has(node.type));
}

/**
 * The content column stacks its children, so each run of inline children goes into one block
 * first: formatted text stays one paragraph instead of one line per fragment.
 */
function groupInline(children: ReactNode, keyPrefix = "inline"): ReactNode[] {
  const out: ReactNode[] = [];
  let run: ReactNode[] = [];
  const flush = () => {
    if (run.length > 0) out.push(<div key={`${keyPrefix}-${out.length}`}>{run}</div>);
    run = [];
  };
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === Fragment) {
      flush();
      out.push(...groupInline((child.props as { children?: ReactNode }).children, `${keyPrefix}-${out.length}`));
    } else if (isInline(child)) {
      run.push(child);
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}

/**
 * One Discord message group: 40px avatar, 16px name, optional 「APP」 badge and timestamp,
 * then the content (text, embeds, component rows). `interaction` adds the
 * 「商家 使用了 /fp」 line (the verb is `usedLabel`) Discord shows above a slash-command reply.
 */
export function Message({
  author,
  avatar,
  bot,
  time,
  nameColor,
  interaction,
  usedLabel = "使用了",
  children,
}: {
  author: string;
  avatar: AvatarSource;
  bot?: boolean;
  time?: string;
  nameColor?: string;
  interaction?: { user: string; avatar: AvatarSource; command: string };
  /** The word between the user and the command on the interaction line. */
  usedLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative mt-[17px] min-w-0 py-0.5 pr-3 pl-[64px] sm:pr-12 sm:pl-[72px]">
      {interaction && (
        <div className="relative mb-1 flex min-w-0 items-center gap-1 text-sm leading-[1.125rem] text-[#949ba4]">
          <span
            aria-hidden
            className="absolute top-[9px] -left-[32px] h-[9px] w-[28px] sm:-left-[36px] sm:w-[32px] rounded-tl-md border-t-2 border-l-2 border-[#4e5058]"
          />
          <Avatar src={interaction.avatar} size={16} />
          <span className="shrink-0 font-medium text-[#dbdee1]">{interaction.user}</span>
          <span className="shrink-0">{usedLabel}</span>
          <span className="min-w-0 truncate text-[#00a8fc]">/{interaction.command}</span>
        </div>
      )}
      <Avatar src={avatar} size={40} className={`absolute left-3 sm:left-4 ${interaction ? "top-[24px]" : "top-0.5"}`} />
      <div className="flex min-w-0 flex-wrap items-center leading-[1.375rem]">
        <span className="text-base font-semibold" style={{ color: nameColor ?? "#f2f3f5" }}>
          {author}
        </span>
        {bot && (
          <span className="ml-1 inline-flex h-[0.9375rem] items-center rounded-[3px] bg-[#5865f2] px-[0.275rem] text-[0.625rem] leading-none font-semibold text-white">
            APP
          </span>
        )}
        {time && <span className="ml-1 text-xs leading-[1.375rem] text-[#949ba4]">{time}</span>}
      </div>
      <div className="flex min-w-0 flex-col gap-1 text-base leading-[1.375rem] break-words whitespace-pre-wrap text-[#dbdee1]">
        {groupInline(children)}
      </div>
    </div>
  );
}

/** A row of message components (buttons), wrapping like Discord on narrow screens. */
export function ActionRow({ children }: { children: ReactNode }) {
  return <div className="mt-1 flex flex-wrap gap-2 whitespace-normal">{children}</div>;
}
