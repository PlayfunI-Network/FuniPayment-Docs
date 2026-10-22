"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      aria-hidden
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={`shrink-0 text-[#b5bac1] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        fill="currentColor"
        d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
      />
    </svg>
  );
}

/**
 * Discord's string select. Closed it shows the selected option's label (or the placeholder);
 * open it lists the options below, the selected one highlighted.
 */
export function SelectMenu({
  placeholder,
  options,
  open,
}: {
  placeholder: string;
  options: { label: string; selected?: boolean }[];
  open?: boolean;
}) {
  const selected = options.find((o) => o.selected);
  return (
    <div className="relative mt-1 w-full max-w-[400px] min-w-0 text-base leading-5 whitespace-normal">
      <div
        className={`flex min-h-10 items-center justify-between gap-2 border border-[#1e1f22] bg-[#1e1f22] py-2 pr-2 pl-3 ${open ? "rounded-t-lg" : "rounded-lg"}`}
      >
        <span className={`min-w-0 truncate font-medium ${selected ? "text-[#dbdee1]" : "text-[#949ba4]"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Chevron open={open} />
      </div>
      {open && (
        <ul
          role="listbox"
          className="overflow-hidden rounded-b-lg border border-t-0 border-[#1e1f22] bg-[#2b2d31] shadow-[0_8px_16px_rgb(0_0_0/0.24)]"
        >
          {options.map((o) => (
            <li
              key={o.label}
              role="option"
              aria-selected={!!o.selected}
              className={`flex min-h-11 items-center px-3 py-2 font-medium ${o.selected ? "bg-[#404249] text-[#f2f3f5]" : "text-[#dbdee1]"}`}
            >
              <span className="min-w-0 break-words">{o.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The same select, usable: click or tap it (or focus it and press Enter, Space or the arrow keys)
 * to open the list, then pick an option. The list opens upward over the messages, as Discord's
 * does near the bottom of a channel, so nothing moves under the pointer. A select-only combobox (WAI-ARIA APG): the list's
 * active option follows the arrow keys and the pointer, Escape or a click elsewhere closes it.
 */
export function ChoiceMenu({
  label,
  placeholder,
  options,
  value,
  onChoose,
}: {
  /** Accessible name, e.g. 「選擇付款方式」. */
  label: string;
  placeholder: string;
  options: string[];
  /** Index of the chosen option, or null. */
  value: number | null;
  onChoose: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const show = () => {
    setActive(value ?? 0);
    setOpen(true);
  };
  const choose = (i: number) => {
    setOpen(false);
    onChoose(i);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (open) setActive((a) => Math.min(a + 1, options.length - 1));
        else show();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) setActive((a) => Math.max(a - 1, 0));
        else show();
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else show();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={root} className="relative mt-1 w-full max-w-[400px] min-w-0 text-base leading-5 whitespace-normal">
      <div
        role="combobox"
        tabIndex={0}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`flex min-h-10 cursor-pointer items-center justify-between gap-2 border border-[#1e1f22] bg-[#1e1f22] py-2 pr-2 pl-3 transition-colors duration-150 select-none hover:border-[#4e5058] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00a8fc] ${open ? "rounded-b-lg" : "rounded-lg"}`}
      >
        <span className={`min-w-0 truncate font-medium ${value !== null ? "text-[#dbdee1]" : "text-[#949ba4]"}`}>
          {value !== null ? options[value] : placeholder}
        </span>
        <Chevron open={open} />
      </div>
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 bottom-full z-10 overflow-hidden rounded-t-lg border border-b-0 border-[#1e1f22] bg-[#2b2d31] shadow-[0_-8px_16px_rgb(0_0_0/0.24)]"
        >
          {options.map((o, i) => (
            <li
              key={o}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === value}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
              className={`flex min-h-11 cursor-pointer items-center px-3 py-2 font-medium ${i === active ? "bg-[#404249] text-[#f2f3f5]" : "text-[#dbdee1]"}`}
            >
              <span className="min-w-0 break-words">{o}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
