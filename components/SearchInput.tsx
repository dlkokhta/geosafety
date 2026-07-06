"use client";

import { useEffect, useRef } from "react";

// Uncontrolled on purpose: the value round-trips through the URL, and a
// controlled input tied to router state lags under fast typing. Typing is
// debounced so we don't rewrite the URL on every keystroke.
export function SearchInput({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (value: string) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
      >
        <circle cx="7" cy="7" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
      <input
        type="search"
        defaultValue={defaultValue}
        placeholder="Company name or tax ID…"
        aria-label="Search by company name or tax ID"
        onChange={(event) => {
          const value = event.target.value;
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => onChange(value), 250);
        }}
        className="h-9 w-56 rounded-lg border border-zinc-200 bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
      />
    </div>
  );
}
