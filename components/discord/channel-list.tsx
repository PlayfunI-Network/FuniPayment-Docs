import { DISCORD_FONT } from "./window";

/** One row of the channel sidebar; `highlight` is the selected-channel look (#404249). */
export function ChannelRow({
  name,
  kind,
  highlight,
}: {
  name: string;
  kind: "text" | "voice";
  highlight?: boolean;
}) {
  return (
    <div
      className={`mx-2 my-px flex h-8 min-w-0 items-center gap-1.5 rounded px-2 transition-colors duration-200 ${highlight ? "bg-[#404249]" : ""}`}
    >
      {kind === "text" ? (
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" className="shrink-0 text-[#80848e]">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.81-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" className="shrink-0 text-[#80848e]">
          <path
            fill="currentColor"
            d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3Z"
          />
          <path
            fill="currentColor"
            d="M15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z"
          />
          <path
            fill="currentColor"
            d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z"
          />
        </svg>
      )}
      {/* Keyed on the name: a rename mounts a new label, which slides in. */}
      <span
        key={name}
        className={`demo-in min-w-0 truncate text-base leading-5 font-medium ${highlight ? "text-[#f2f3f5]" : "text-[#949ba4]"}`}
      >
        {name}
      </span>
    </div>
  );
}

/**
 * Discord's channel sidebar (#2b2d31): categories with their text channels. Rows are keyed on
 * the channel name, so a renamed channel, or one moved to another category, slides in.
 */
export function ChannelList({
  categories,
  className = "",
}: {
  categories: { name: string; channels: { name: string; highlight?: boolean }[] }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="頻道"
      className={`w-60 max-w-full min-w-0 overflow-hidden rounded-lg bg-[#2b2d31] pb-2 text-left [color-scheme:dark] ${className}`}
      style={{ fontFamily: DISCORD_FONT, lineHeight: 1.375 }}
    >
      {categories.map((cat) => (
        <section key={cat.name} className="pt-4">
          <h3 className="flex h-6 min-w-0 items-center gap-0.5 pr-2 pl-0.5 text-xs leading-4 font-semibold tracking-[0.02em] text-[#949ba4] uppercase">
            <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" className="shrink-0">
              <path
                fill="currentColor"
                d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
              />
            </svg>
            <span className="min-w-0 truncate">{cat.name}</span>
          </h3>
          {cat.channels.map((ch) => (
            <ChannelRow key={ch.name} name={ch.name} kind="text" highlight={ch.highlight} />
          ))}
        </section>
      ))}
    </nav>
  );
}
