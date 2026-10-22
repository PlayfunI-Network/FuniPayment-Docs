import type { ReactNode } from "react";

/*
 * The subset of Discord markdown the bot's copy uses, rendered as Discord's dark theme does:
 * **bold**, __underline__, *italic*, `code`, [link](url), <@name> mentions, <#name> channel
 * mentions, </command name> command mentions, <t:label:R> timestamps, numbered lists (lines
 * starting 「1. 」), bulleted lists (「- 」) and headings (「# 」, 「## 」, 「### 」). Newlines are
 * kept (the container uses pre-wrap).
 */
// Strings, not regex literals: the tsconfig target (ES2017) rejects named groups in literals
const TOKEN = new RegExp(
  [
    String.raw`\*\*(?<bold>.+?)\*\*`,
    String.raw`__(?<underline>.+?)__`,
    String.raw`<@(?<user>[^>]+)>`,
    String.raw`<#(?<channel>[^>]+)>`,
    String.raw`<\/(?<command>[^>]+)>`,
    String.raw`<t:(?<time>[^>]+?):R>`,
    String.raw`\[(?<linkText>[^\]]+)\]\((?<linkUrl>[^)\s]+)\)`,
    String.raw`\*(?<italic>[^*\n]+?)\*`,
    "`(?<code>[^`\\n]+)`",
  ].join("|"),
);
const LIST_ITEM = /^(\d+)\. (.*)$/;
const BULLET = /^- (.*)$/;
const HEADING = /^(#{1,3}) (.*)$/;

/** Discord's mention pill, shared by user, channel and command mentions. */
const MENTION = "rounded-[3px] bg-[rgba(88,101,242,0.3)] px-0.5 font-medium text-[#c9cdfb]";

/** Discord's heading sizes (h1 1.5rem, h2 1.25rem, h3 1rem), bold, with space above. */
const HEADING_CLASS: Record<number, string> = {
  1: "text-[1.5rem] leading-[1.375em]",
  2: "text-[1.25rem] leading-[1.375em]",
  3: "text-[1rem] leading-[1.375em]",
};

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
    const g = m.groups ?? {};
    if (g.bold != null) {
      out.push(
        <strong key={key} className="font-bold">
          {parse(g.bold, key)}
        </strong>,
      );
    } else if (g.underline != null) {
      out.push(
        <u key={key} className="underline underline-offset-[0.15em]">
          {parse(g.underline, key)}
        </u>,
      );
    } else if (g.user != null) {
      out.push(
        <span key={key} className={MENTION}>
          @{g.user}
        </span>,
      );
    } else if (g.channel != null) {
      out.push(
        <span key={key} className={MENTION} data-discord-channel>
          <span aria-hidden className="mr-[0.1em] font-semibold">
            #
          </span>
          {g.channel}
        </span>,
      );
    } else if (g.command != null) {
      out.push(
        <span key={key} className={MENTION} data-discord-command>
          /{g.command}
        </span>,
      );
    } else if (g.time != null) {
      out.push(
        <span key={key} className="rounded-[3px] bg-[rgba(78,80,88,0.48)] px-0.5">
          {g.time}
        </span>,
      );
    } else if (g.linkText != null) {
      out.push(
        <span key={key} className="text-[#00a8fc]">
          {g.linkText}
        </span>,
      );
    } else if (g.code != null) {
      out.push(
        <code
          key={key}
          className="rounded-[4px] bg-[#1e1f22] px-[0.2em] font-mono text-[0.85em] leading-[1.125rem]"
        >
          {g.code}
        </code>,
      );
    } else {
      out.push(
        <em key={key} className="italic">
          {parse(g.italic ?? "", key)}
        </em>,
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

type Block = { kind: "ol"; items: RegExpMatchArray[] } | { kind: "ul"; items: RegExpMatchArray[] };

/**
 * Lines are text except runs of 「N. 」 or 「- 」 lines, which Discord draws as a numbered or
 * bulleted list, and 「# 」 headings. Lists and headings are blocks, so the newline before and
 * after them is their own line break.
 */
export function DiscordMarkdown({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let lines: string[] = [];
  let list: Block | null = null;
  const flushText = () => {
    if (lines.length > 0) out.push(...parse(lines.join("\n"), `md${out.length}`));
    lines = [];
  };
  const flushList = () => {
    if (!list) return;
    const key = `md${out.length}`;
    const items = list.items.map((m, i) => <li key={i}>{parse(m[m.length - 1], `${key}-${i}`)}</li>);
    out.push(
      list.kind === "ol" ? (
        <ol key={key} start={Number(list.items[0][1])} className="my-0 list-decimal pl-[1.4em] whitespace-normal">
          {items}
        </ol>
      ) : (
        <ul key={key} className="my-0 list-disc pl-[1.4em] whitespace-normal">
          {items}
        </ul>
      ),
    );
    list = null;
  };
  const addItem = (kind: Block["kind"], m: RegExpMatchArray) => {
    flushText();
    if (list && list.kind !== kind) flushList();
    const current: Block = list ?? { kind, items: [] };
    current.items.push(m);
    list = current;
  };
  for (const line of text.split("\n")) {
    const numbered = line.match(LIST_ITEM);
    const bullet = line.match(BULLET);
    const heading = line.match(HEADING);
    if (numbered) addItem("ol", numbered);
    else if (bullet) addItem("ul", bullet);
    else if (heading) {
      flushList();
      flushText();
      const key = `md${out.length}`;
      const level = heading[1].length;
      out.push(
        <div key={key} role="heading" aria-level={level} className={`mt-2 mb-1 font-bold first:mt-0 ${HEADING_CLASS[level]}`}>
          {parse(heading[2], key)}
        </div>,
      );
    } else {
      flushList();
      lines.push(line);
    }
  }
  flushList();
  flushText();
  return <>{out}</>;
}
