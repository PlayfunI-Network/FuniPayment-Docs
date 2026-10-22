/** Discord's empty chat input with its 「傳送訊息到 #channel」 placeholder (zh-TW client). */
export function ChatInput({ channel }: { channel: string }) {
  return (
    <div className="mt-4 px-4 text-base leading-[1.375rem] whitespace-normal">
      <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg bg-[#383a40] px-4 py-2.5">
        <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-[#b5bac1]">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path
            fill="#383a40"
            d="M12 7a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1Z"
          />
        </svg>
        <span className="min-w-0 truncate text-[#6d6f78]">傳送訊息到 #{channel}</span>
      </div>
    </div>
  );
}
