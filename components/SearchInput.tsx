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
      className="h-9 w-56 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
    />
  );
}
