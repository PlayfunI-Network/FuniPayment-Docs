const STYLES = {
  primary: { base: "#5865f2", active: "#3c45a5" },
  secondary: { base: "#4e5058", active: "#80848e" },
  success: { base: "#248046", active: "#15562b" },
  danger: { base: "#da373c", active: "#8f2022" },
  link: { base: "#4e5058", active: "#80848e" },
} as const;

/**
 * A Discord message button (blurple / grey / green / red / link). `active` shows the pressed
 * state the demos use when a click lands; `disabled` is Discord's half-transparent, unclickable look.
 */
export function DiscordButton({
  label,
  style,
  active,
  disabled,
}: {
  label: string;
  style: "primary" | "secondary" | "success" | "danger" | "link";
  active?: boolean;
  disabled?: boolean;
}) {
  const c = STYLES[style];
  return (
    <span
      data-discord-button=""
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className="inline-flex h-8 min-w-[60px] items-center justify-center gap-2 rounded-lg px-4 text-sm leading-4 font-medium whitespace-nowrap text-white transition-[background-color,transform] duration-150 data-[active]:translate-y-px data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
      style={{ backgroundColor: active ? c.active : c.base }}
    >
      {label}
      {style === "link" && (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
          <path
            fill="currentColor"
            d="M15 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4.41l-4.3 4.3a1 1 0 1 1-1.4-1.42L19.58 3H16a1 1 0 0 1-1-1ZM5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 1 0-2 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H5Z"
          />
        </svg>
      )}
    </span>
  );
}
