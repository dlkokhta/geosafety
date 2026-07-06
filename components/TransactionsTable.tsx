"use client";

import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";
import type { CompanySuggestion } from "@/lib/fuzzy";
import { formatDate, formatGel } from "@/lib/format";

export type SortField = "date" | "amount";
export type SortDir = "asc" | "desc";

const badgeStyles: Record<TransactionStatus, string> = {
  matched: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  unmatched: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  ignored: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const dotStyles: Record<TransactionStatus, string> = {
  matched: "bg-green-500",
  unmatched: "bg-red-500",
  ignored: "bg-zinc-400",
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
      {status}
    </span>
  );
}

function SortableHeader({
  label,
  field,
  sort,
  dir,
  onSortChange,
  align = "left",
  className = "",
}: {
  label: string;
  field: SortField;
  sort: SortField;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort === field;
  return (
    <th
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
      className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""} ${className}`}
    >
      <button
        onClick={() => onSortChange(field)}
        className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        {label}
        {/* invisible (not conditional) so the header width doesn't jump */}
        <span className={active ? "" : "invisible"}>
          {active && dir === "asc" ? "↑" : "↓"}
        </span>
      </button>
    </th>
  );
}

export function TransactionsTable({
  transactions,
  suggestions,
  sort,
  dir,
  onSortChange,
  onSetStatus,
  pendingId,
}: {
  transactions: TransactionWithCompany[];
  suggestions: Map<string, CompanySuggestion>;
  sort: SortField;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
  onSetStatus: (id: string, status: TransactionStatus) => void;
  pendingId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      {/* table-fixed: column widths come from the header row, not row
          content, so they stay identical across filters */}
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <SortableHeader
              label="Date"
              field="date"
              sort={sort}
              dir={dir}
              onSortChange={onSortChange}
              className="w-30"
            />
            <th className="px-4 py-3 font-medium">Sender</th>
            <th className="w-28 px-4 py-3 font-medium">Tax ID</th>
            <SortableHeader
              label="Amount"
              field="amount"
              sort={sort}
              dir={dir}
              onSortChange={onSortChange}
              align="right"
              className="w-32"
            />
            <th className="w-32 px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Matched company</th>
            <th className="w-24 px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
              >
                No transactions
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(t.entry_date)}
                </td>
                <td className="px-4 py-3">{t.sender_name ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {t.sender_inn ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatGel(t.amount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  {t.matched_company ? (
                    t.matched_company.name
                  ) : suggestions.has(t.id) ? (
                    <span
                      className="text-amber-700 dark:text-amber-500"
                      title={`similarity ${Math.round(
                        suggestions.get(t.id)!.score * 100
                      )}%`}
                    >
                      Suggested: {suggestions.get(t.id)!.company.name}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  {t.status === "matched" ? (
                    // Matched rows have no manual action: unmatching would
                    // contradict the auto-matcher on the next run.
                    <span className="text-zinc-400 dark:text-zinc-600">—</span>
                  ) : (
                    <button
                      onClick={() =>
                        onSetStatus(
                          t.id,
                          t.status === "ignored" ? "unmatched" : "ignored"
                        )
                      }
                      disabled={pendingId === t.id}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      {t.status === "ignored" ? "Restore" : "Ignore"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
