"use client";

import type { TransactionStatus } from "@/lib/types";

const OPTIONS: { value: TransactionStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "matched", label: "Matched" },
  { value: "unmatched", label: "Unmatched" },
  { value: "ignored", label: "Ignored" },
];

export function StatusFilter({
  value,
  onChange,
}: {
  value: TransactionStatus | null;
  onChange: (value: TransactionStatus | null) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            value === option.value
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
