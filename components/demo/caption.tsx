/** One line under a demo saying what the current step does, with progress dots. `index` is 0-based. */
export function Caption({ text, index, total }: { text: string; index: number; total: number }) {
  return (
    <div className="mt-3 flex min-h-7 items-center gap-2.5 text-sm text-[var(--fg)]">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold tabular-nums text-[#0a0a0a]">
        {index + 1}
      </span>
      {/* Keyed so each new step's text fades in instead of swapping in place. */}
      <span key={index} className="demo-in min-w-0 flex-1">
        {text}
      </span>
      <span className="flex shrink-0 gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`size-1.5 rounded-full transition-colors duration-300 ${i === index ? "bg-[var(--brand)]" : "bg-[var(--line)]"}`}
          />
        ))}
      </span>
    </div>
  );
}
