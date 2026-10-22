import type { ReactNode } from "react";

/**
 * A reply only the person who ran the command sees: the content, then Discord's line under it —
 * eye icon, 「只有你看得到這則訊息」 and the 「關閉訊息」 link. Put it inside a `Message`.
 */
export function Ephemeral({ children }: { children?: ReactNode }) {
  return (
    <>
      {children}
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1 text-xs leading-4 whitespace-normal text-[#949ba4]">
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" className="mr-0.5 shrink-0">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 4.5C6.6 4.5 2.95 8.65 1.33 11.4a1.2 1.2 0 0 0 0 1.2C2.95 15.35 6.6 19.5 12 19.5s9.05-4.15 10.67-6.9a1.2 1.2 0 0 0 0-1.2C21.05 8.65 17.4 4.5 12 4.5ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
            clipRule="evenodd"
          />
          <circle cx="12" cy="12" r="2.25" fill="currentColor" />
        </svg>
        <span>只有你看得到這則訊息</span>
        <span aria-hidden>•</span>
        <span className="text-[#00a8fc]">關閉訊息</span>
      </div>
    </>
  );
}
