/** One line under a demo saying what the current step does, with its number. `index` is 0-based. */
export function Caption({ text, index }: { text: string; index: number }) {
  return (
    <div className="mt-3 flex min-h-7 items-center gap-2.5 text-sm text-[var(--fg)]">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold tabular-nums text-[#0a0a0a]">
        {index + 1}
      </span>
      {/* Keyed so each new step's text fades in instead of swapping in place. */}
      <span key={index} className="demo-in min-w-0 flex-1">
        {text}
      </span>
    </div>
  );
}
