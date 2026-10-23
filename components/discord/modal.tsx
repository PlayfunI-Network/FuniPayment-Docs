import { DISCORD_FONT } from "./window";

export type ModalField = {
  label: string;
  /** Text already typed in the field; without it the placeholder (if any) shows. */
  value?: string;
  placeholder?: string;
  required?: boolean;
};

/**
 * A Discord modal (dark theme, as the bot's form opens it): 440px wide on #313338, title and
 * close button, one short text input per field on #1e1f22, then the 取消 / 提交 footer on
 * #2b2d31. Always dark, whatever the site theme. Static: the demos fill `value` as they type.
 */
export function Modal({
  title,
  fields,
  submitLabel = "提交",
}: {
  title: string;
  fields: ModalField[];
  submitLabel?: string;
}) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className="w-[440px] max-w-full min-w-0 overflow-hidden rounded-lg bg-[#313338] text-left text-[#dbdee1] shadow-[0_0_0_1px_rgb(30_31_34/0.6),0_2px_10px_0_rgb(0_0_0/0.2)] [color-scheme:dark]"
      style={{ fontFamily: DISCORD_FONT, lineHeight: 1.375 }}
    >
      <div className="flex items-start gap-2 p-4">
        <h2 className="min-w-0 flex-1 text-xl leading-6 font-semibold break-words text-[#f2f3f5]">{title}</h2>
        <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-[#b5bac1]">
          <path
            fill="currentColor"
            d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-5 px-4 pb-6">
        {fields.map((f, i) => (
          <div key={`${i}:${f.label}`} className="min-w-0">
            <div className="mb-2 text-xs leading-4 font-bold tracking-[0.02em] break-words text-[#b5bac1]">
              {f.label}
              {f.required && <span className="pl-1 text-[#f23f43]">*</span>}
            </div>
            <div className="flex h-10 min-w-0 items-center rounded-[3px] bg-[#1e1f22] px-2.5 text-base">
              {f.value ? (
                <span className="min-w-0 truncate text-[#dbdee1]">{f.value}</span>
              ) : (
                <span className="min-w-0 truncate text-[#87898c]">{f.placeholder}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 bg-[#2b2d31] p-4">
        <span className="inline-flex h-[38px] min-w-[60px] items-center justify-center px-4 text-sm leading-4 font-medium text-white">
          取消
        </span>
        <span className="inline-flex h-[38px] min-w-[96px] items-center justify-center rounded-[3px] bg-[#5865f2] px-4 text-sm leading-4 font-medium text-white">
          {submitLabel}
        </span>
      </div>
    </div>
  );
}
