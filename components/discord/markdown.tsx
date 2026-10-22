import type { ReactNode } from "react";

/*
 * The subset of Discord markdown the bot's copy uses, rendered as Discord's dark theme does:
 * **bold**, __underline__, *italic*, [link](url), <@name> mentions and <t:label:R> timestamps.
 * Newlines are kept (the container uses pre-wrap).
 */
const TOKEN =
  /(\*\*(.+?)\*\*)|(__(.+?)__)|(<@([^>]+)>)|(<t:([^>]+?):R>)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*([^*\n]+?)\*)/;

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

export function DiscordMarkdown({ text }: { text: string }) {
  return <>{parse(text, "md")}</>;
}
