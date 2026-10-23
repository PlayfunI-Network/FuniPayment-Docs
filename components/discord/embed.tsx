import type { ReactNode } from "react";
import { Avatar, type AvatarSource } from "./avatar";
import { DiscordMarkdown } from "./markdown";

export type EmbedField = {
  name: string;
  value: string;
  code?: boolean;
  inline?: boolean;
  /**
   * Take the full row when the Discord window is narrower than 36rem, even when inline, so a
   * long code stays on one line (Discord's own phone layout stacks fields the same way).
   */
  wideWhenNarrow?: boolean;
  /** Larger code text, for the value the demo is about (the payment code). */
  emphasis?: boolean;
};

/**
 * Discord's grid placement for fields: consecutive inline fields share a row, up to 3 per
 * row (2 when the embed has a thumbnail), splitting the 12 columns evenly.
 */
function fieldColumns(fields: EmbedField[], hasThumbnail: boolean): string[] {
  const perRow = hasThumbnail ? 2 : 3;
  const cols: string[] = [];
  let i = 0;
  while (i < fields.length) {
    if (!fields[i].inline) {
      cols.push("1 / 13");
      i++;
      continue;
    }
    let n = 0;
    while (i + n < fields.length && fields[i + n].inline && n < perRow) n++;
    const span = 12 / n;
    for (let k = 0; k < n; k++) cols.push(`${1 + k * span} / ${1 + (k + 1) * span}`);
    i += n;
  }
  return cols;
}

/** A colour as the bot gives it (0x00b7ff) or any CSS colour string. */
export function embedColor(color: string | number): string {
  return typeof color === "number" ? `#${color.toString(16).padStart(6, "0")}` : color;
}

export function CodeBlock({ children, emphasis }: { children: ReactNode; emphasis?: boolean }) {
  return (
    <pre
      className={`mt-1.5 max-w-full overflow-hidden rounded border border-[#1e1f22] bg-[#1e1f22] p-[0.5em] font-mono break-all whitespace-pre-wrap ${emphasis ? "text-lg leading-6 font-semibold tracking-wide text-[#f2f3f5]" : "text-sm leading-[1.125rem] text-[#dbdee1]"}`}
    >
      <code>{children}</code>
    </pre>
  );
}

/**
 * A Discord rich embed (dark theme): 4px colour bar, author line with icon, title (blue
 * when it is a link; markdown such as __underline__ like Discord draws it), markdown description, field grid with code-block values, 80px
 * thumbnail, optional image slot and footer with icon and timestamp.
 */
export function Embed({
  color,
  author,
  title,
  titleLink,
  description,
  fields,
  thumbnail,
  image,
  footer,
  footerIcon = "/brand/funi-icon.png",
  timestamp,
}: {
  /** The bot's embed colour, e.g. 0x00b7ff (a CSS colour string also works). */
  color: string | number;
  author?: { name: string; icon?: AvatarSource };
  title?: string;
  titleLink?: boolean;
  description?: ReactNode;
  fields?: EmbedField[];
  thumbnail?: AvatarSource;
  image?: ReactNode;
  footer?: string;
  footerIcon?: AvatarSource;
  timestamp?: string;
}) {
  const cols = fields ? fieldColumns(fields, !!thumbnail) : [];
  return (
    <article
      className="grid w-fit max-w-full min-w-0 rounded-lg border-l-4 bg-[#2b2d31] text-sm leading-[1.125rem] whitespace-normal text-[#dbdee1] sm:max-w-[516px]"
      style={{ borderLeftColor: embedColor(color) }}
    >
      <div
        className="grid min-w-0 pt-2 pr-4 pb-4 pl-3"
        style={{ gridTemplateColumns: thumbnail ? "minmax(0,1fr) min-content" : "minmax(0,1fr)" }}
      >
        {author && (
          <div className="col-start-1 mt-2 flex min-w-0 items-center">
            {author.icon && <Avatar src={author.icon} size={24} className="mr-2" />}
            <span className="min-w-0 text-sm font-semibold break-words text-[#f2f3f5]">{author.name}</span>
          </div>
        )}
        {title && (
          <div
            className={`col-start-1 mt-2 min-w-0 text-base leading-[1.375rem] font-semibold break-words ${titleLink ? "text-[#00a8fc]" : "text-[#f2f3f5]"}`}
          >
            <DiscordMarkdown text={title} />
          </div>
        )}
        {description != null && (
          <div className="col-start-1 mt-2 min-w-0 break-words whitespace-pre-wrap">
            {typeof description === "string" ? <DiscordMarkdown text={description} /> : description}
          </div>
        )}
        {fields && fields.length > 0 && (
          <div className="col-start-1 mt-2 grid min-w-0 grid-cols-12 gap-2 max-sm:col-span-full">
            {fields.map((f, idx) => (
              <div
                key={`${f.name}-${idx}`}
                className={`min-w-0 ${f.wideWhenNarrow ? "@max-[36rem]:[grid-column:1/13]!" : ""}`}
                style={{ gridColumn: cols[idx] }}
              >
                <div className="mb-0.5 font-semibold break-words text-[#f2f3f5]">{f.name}</div>
                {f.code ? (
                  <CodeBlock emphasis={f.emphasis}>{f.value}</CodeBlock>
                ) : (
                  <div className="break-words whitespace-pre-wrap">
                    <DiscordMarkdown text={f.value} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {thumbnail && (
          <div className="col-start-2 row-span-6 row-start-1 mt-2 ml-4 shrink-0 justify-self-end">
            {/* max-w-none: preflight's img max-width:100% would size the min-content column to 0. */}
            <Avatar src={thumbnail} size={80} shape="square" className="max-w-none max-sm:!size-16" />
          </div>
        )}
        {image && (
          <div className="col-span-full mt-4 min-w-0 overflow-hidden rounded">{image}</div>
        )}
        {(footer || timestamp) && (
          <div className="col-span-full mt-2 flex min-w-0 items-center">
            {footer && footerIcon && <Avatar src={footerIcon} size={20} className="mr-2" />}
            <span className="min-w-0 text-xs leading-4 font-medium break-words text-[#dbdee1]">
              {footer}
              {footer && timestamp && <span className="mx-1">•</span>}
              {timestamp}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
