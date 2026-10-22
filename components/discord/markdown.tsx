import type { ReactNode } from "react";

/*
 * The subset of Discord markdown the bot's copy uses, rendered as Discord's dark theme does:
 * **bold**, __underline__, *italic*, `code`, [link](url), <@name> mentions, <t:label:R> timestamps
 * and numbered lists (lines starting 「1. 」). Newlines are kept (the container uses pre-wrap).
 */
const TOKEN =
  /(\*\*(.+?)\*\*)|(__(.+?)__)|(<@([^>]+)>)|(<t:([^>]+?):R>)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*([^*\n]+?)\*)|(`([^`\n]+)`)/;
const LIST_ITEM = /^(\d+)\. (.*)$/;

function parse(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let i = 0;
  while (rest) {
    const m = TOKEN.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[1]) {
      out.push(
        <strong key={key} className="font-bold">
          {parse(m[2], key)}
        </strong>,
      );
    } else if (m[3]) {
      out.push(
        <u key={key} className="underline underline-offset-[0.15em]">
          {parse(m[4], key)}
        </u>,
      );
    } else if (m[5]) {
      out.push(
        <span
          key={key}
          className="rounded-[3px] bg-[rgba(88,101,242,0.3)] px-0.5 font-medium text-[#c9cdfb]"
        >
          @{m[6]}
        </span>,
      );
    } else if (m[7]) {
      out.push(
        <span key={key} className="rounded-[3px] bg-[rgba(78,80,88,0.48)] px-0.5">
          {m[8]}
        </span>,
      );
    } else if (m[9]) {
      out.push(
        <span key={key} className="text-[#00a8fc]">
          {m[10]}
        </span>,
      );
    } else if (m[14]) {
      out.push(
        <code
          key={key}
          className="rounded-[4px] bg-[#1e1f22] px-[0.2em] font-mono text-[0.85em] leading-[1.125rem]"
        >
          {m[15]}
        </code>,
      );
    } else {
      out.push(
        <em key={key} className="italic">
          {parse(m[13], key)}
        </em>,
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

/**
 * Lines are text except runs of 「N. 」 lines, which Discord draws as a numbered list (a block, so
 * the newline before and after it is the list's own line break).
 */
export function DiscordMarkdown({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let lines: string[] = [];
  let items: RegExpMatchArray[] = [];
  const flushText = () => {
    if (lines.length > 0) out.push(...parse(lines.join("\n"), `md${out.length}`));
    lines = [];
  };
  const flushList = () => {
    if (items.length === 0) return;
    const key = `md${out.length}`;
    out.push(
      <ol key={key} start={Number(items[0][1])} className="my-0 list-decimal pl-[1.4em] whitespace-normal">
        {items.map((m, i) => (
          <li key={i}>{parse(m[2], `${key}-${i}`)}</li>
        ))}
      </ol>,
    );
    items = [];
  };
  for (const line of text.split("\n")) {
    const item = line.match(LIST_ITEM);
    if (item) {
      flushText();
      items.push(item);
    } else {
      flushList();
      lines.push(line);
    }
  }
  flushList();
  flushText();
  return <>{out}</>;
}
