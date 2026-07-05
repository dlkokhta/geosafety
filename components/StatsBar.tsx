"use client";

import { useMemo } from "react";
import type { TransactionWithCompany } from "@/lib/types";

const amountFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatGel(amount: number) {
  return `${amountFormat.format(amount)} ₾`;
}

interface StatTileProps {
  label: string;
  value: string;
  detail?: string;
}

function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {detail && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>
      )}
    </div>
  );
}

export function StatsBar({
  transactions,
}: {
  transactions: TransactionWithCompany[];
}) {
  const stats = useMemo(() => {
    let matchedCount = 0;
    let matchedAmount = 0;
    let unmatchedCount = 0;
    let unmatchedAmount = 0;
    let ignoredCount = 0;
    let totalAmount = 0;

    for (const t of transactions) {
      totalAmount += t.amount;
      if (t.status === "matched") {
        matchedCount++;
        matchedAmount += t.amount;
      } else if (t.status === "unmatched") {
        unmatchedCount++;
        unmatchedAmount += t.amount;
      } else {
        ignoredCount++;
      }
    }

    // Ignored transactions are deliberately excluded from reconciliation,
    // so they don't count against the match rate.
    const relevantCount = transactions.length - ignoredCount;

    return {
      total: { count: transactions.length, amount: totalAmount },
      matched: { count: matchedCount, amount: matchedAmount },
      unmatched: { count: unmatchedCount, amount: unmatchedAmount },
      matchRate:
        relevantCount > 0 ? (matchedCount / relevantCount) * 100 : null,
    };
  }, [transactions]);

  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Total transactions"
        value={String(stats.total.count)}
        detail={formatGel(stats.total.amount)}
      />
      <StatTile
        label="Matched"
        value={String(stats.matched.count)}
        detail={formatGel(stats.matched.amount)}
      />
      <StatTile
        label="Unmatched"
        value={String(stats.unmatched.count)}
        detail={formatGel(stats.unmatched.amount)}
      />
      <StatTile
        label="Match rate"
        value={
          stats.matchRate === null ? "—" : `${stats.matchRate.toFixed(1)}%`
        }
        detail="of non-ignored transactions"
      />
    </section>
  );
}
