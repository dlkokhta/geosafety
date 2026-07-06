"use client";

import {
  paymentState,
  type CompanySummaryRow,
  type PaymentState,
} from "@/lib/reconciliation";
import { toCsv } from "@/lib/csv";
import { formatGel } from "@/lib/format";

const badgeStyles: Record<PaymentState, string> = {
  paid: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  underpaid: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  unpaid: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const dotStyles: Record<PaymentState, string> = {
  paid: "bg-green-500",
  underpaid: "bg-red-500",
  unpaid: "bg-zinc-400",
};

const diffStyles: Record<PaymentState, string> = {
  paid: "text-green-600 dark:text-green-400",
  underpaid: "text-red-600 dark:text-red-400",
  unpaid: "text-zinc-500 dark:text-zinc-400",
};

function formatDiff(diff: number) {
  return diff > 0 ? `+${formatGel(diff)}` : formatGel(diff);
}

// Raw numbers (no ₾, no thousands separators) so the file stays
// computable in Excel; the CSV mirrors the rows currently on screen.
function downloadCsv(rows: CompanySummaryRow[], month: string) {
  const csv = toCsv([
    ["Company", "Expected", "Actual", "Difference", "Status"],
    ...rows.map((row) => [
      row.name,
      row.expected,
      row.actual,
      row.diff,
      paymentState(row),
    ]),
  ]);
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `reconciliation-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function CompanySummary({
  rows,
  month,
  isFiltered,
}: {
  rows: CompanySummaryRow[];
  month: string | null;
  isFiltered: boolean;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expected vs Actual</h2>
        {month && rows.length > 0 && (
          <button
            onClick={() => downloadCsv(rows, month)}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="w-32 px-4 py-3 text-right font-medium">
                Expected
              </th>
              <th className="w-32 px-4 py-3 text-right font-medium">Actual</th>
              <th className="w-32 px-4 py-3 text-right font-medium">
                Difference
              </th>
              <th className="w-32 px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  {isFiltered
                    ? "No companies match your search"
                    : "No active contracts or payments this month"}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const state = paymentState(row);
                return (
                  <tr
                    key={row.companyId}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {formatGel(row.expected)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {formatGel(row.actual)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${diffStyles[state]}`}
                    >
                      {formatDiff(row.diff)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[state]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${dotStyles[state]}`}
                        />
                        {state}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
