"use client";

import { formatMonth } from "@/lib/format";

export function MonthSelector({
  months,
  value,
  onChange,
}: {
  months: string[];
  value: string;
  onChange: (month: string) => void;
}) {
  const index = months.indexOf(value);

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
      <button
        onClick={() => onChange(months[index - 1])}
        disabled={index <= 0}
        aria-label="Previous month"
        className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-100 dark:disabled:hover:text-zinc-400"
      >
        ←
      </button>
      <span className="w-28 text-center text-sm font-medium">
        {formatMonth(value)}
      </span>
      <button
        onClick={() => onChange(months[index + 1])}
        disabled={index < 0 || index >= months.length - 1}
        aria-label="Next month"
        className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-100 dark:disabled:hover:text-zinc-400"
      >
        →
      </button>
    </div>
  );
}
