"use client";
// Several still screens behind tabs, one shown at a time (not animated): the order message of
// each payment method, the three answers of /payment review. The reader picks a tab; every
// panel is drawn from the snapshots like the rest of the demos.
import { useId, useState, type ReactNode } from "react";

export type SnapshotTab = {
  /** The tab's text. */
  tab: string;
  /** What the panel shows, for assistive tech (e.g. 「銀行轉帳的訂單訊息」). */
  label: string;
  content: ReactNode;
};

/** `label` names the tab list (e.g. 「各付款方式的訂單訊息」). */
export function SnapshotTabs({ label, tabs }: { label: string; tabs: readonly SnapshotTab[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const current = tabs[active];
  return (
    <div className="not-prose my-6">
      <div role="tablist" aria-label={label} className="mb-3 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.tab}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            onClick={() => setActive(i)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              i === active
                ? "border-[var(--brand)] bg-[var(--brand)]/15 text-[var(--fg)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {t.tab}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} aria-label={current.label}>
        {/* A new panel per tab, so a snapshot's own state (an open menu) never carries over. */}
        <div key={active}>{current.content}</div>
      </div>
    </div>
  );
}
