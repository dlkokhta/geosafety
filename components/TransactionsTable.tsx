"use client";

import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";
import { formatDate, formatGel } from "@/lib/format";

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

export function TransactionsTable({
  transactions,
}: {
  transactions: TransactionWithCompany[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Sender</th>
            <th className="px-4 py-3 font-medium">Tax ID</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Matched company</th>
            <th className="px-4 py-3 font-medium">Actions</th>
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
                <td className="px-4 py-3">{t.matched_company?.name ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-400 dark:text-zinc-600">—</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
