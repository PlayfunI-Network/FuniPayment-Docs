import { Avatar, type AvatarSource } from "./avatar";

/** A filled option as the input shows it: the option's name, then the value. */
export type SlashOption = { name: string; value: string };

/**
 * The chat input with a slash command. Without options it shows Discord's command
 * autocomplete popup above the input (app icon, /command, description) with the command
 * typed; with `options` (or the single `option`) the popup is gone and the input holds the
 * command and one name | value pill per filled option. `options={[]}` is the command picked
 * with nothing filled yet.
 */
export function SlashPicker({
  command,
  description,
  option,
  options,
  appName,
  appIcon = "/brand/funi-icon.png",
  placeholder,
}: {
  command: string;
  description: string;
  /** One filled option (the same as `options={[option]}`). */
  option?: SlashOption;
  /** Every filled option, in the order they were filled. */
  options?: readonly SlashOption[];
  /** The app shown in the autocomplete popup (the bot's name). */
  appName: string;
  appIcon?: AvatarSource;
  /** Text typed so far while the popup is open; defaults to `/${command}`. */
  placeholder?: string;
}) {
  const typed = placeholder ?? `/${command}`;
  const filled = options ?? (option ? [option] : null);
  return (
    <div className="mt-4 px-4 text-base leading-[1.375rem] whitespace-normal">
      {!filled && (
        <div className="mb-2 overflow-hidden rounded-lg border border-[#1e1f22] bg-[#2b2d31] shadow-[0_8px_16px_rgb(0_0_0/0.24)]">
          <div className="flex items-center gap-2 px-3 pt-3 pb-1 text-xs leading-4 font-semibold text-[#b5bac1]">
            <Avatar src={appIcon} size={16} />
            <span className="min-w-0 truncate">{appName}</span>
          </div>
          <div className="m-1.5 mt-1 flex min-w-0 items-center gap-3 rounded-md bg-[#404249] px-2 py-2">
            <Avatar src={appIcon} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-[#f2f3f5]">/{command}</div>
              <div className="truncate text-sm leading-[1.125rem] text-[#b5bac1]">{description}</div>
            </div>
            <span className="hidden shrink-0 text-xs text-[#b5bac1] sm:inline">{appName}</span>
          </div>
        </div>
      )}
      <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg bg-[#383a40] px-4 py-2.5">
        <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-[#b5bac1]">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path fill="#383a40" d="M12 7a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1Z" />
        </svg>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[#dbdee1]">
          {filled ? (
            <>
              <span className="font-medium">/{command}</span>
              {filled.map((o) => (
                <span
                  key={o.name}
                  data-slash-option={o.name}
                  className="inline-flex min-w-0 items-stretch overflow-hidden rounded bg-[#1e1f22] text-[0.9375rem] leading-6"
                >
                  <span className="shrink-0 bg-[#4e5058] px-1.5 text-[#f2f3f5]">{o.name}</span>
                  <span className="min-w-0 truncate px-1.5 tabular-nums">{o.value}</span>
                </span>
              ))}
            </>
          ) : (
            <span>
              {typed}
              <span aria-hidden className="ml-px inline-block h-5 w-px translate-y-1 bg-[#dbdee1]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
