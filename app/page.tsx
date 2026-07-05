"use client";

import { useTransactions } from "@/lib/hooks/useTransactions";
import { useRunMatching } from "@/lib/hooks/useRunMatching";
import { StatsBar } from "@/components/StatsBar";
import { TransactionsTable } from "@/components/TransactionsTable";

export default function Home() {
  const { data: transactions, isPending, isError, error } = useTransactions();
  const runMatching = useRunMatching();
  

  if (isPending) {
    return <p className="p-8 text-zinc-500">Loading…</p>;
  }

  if (isError) {
    return <p className="p-8 text-red-600">Error: {error.message}</p>;
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">
        Payment Reconciliation
      </h1>
      <StatsBar transactions={transactions} />
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => runMatching.mutate()}
          disabled={runMatching.isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          {runMatching.isPending ? "Running…" : "Run matching"}
        </button>
        {runMatching.isSuccess && (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {runMatching.data} new matches
          </span>
        )}
        {runMatching.isError && (
          <span className="text-sm text-red-600">
            Error: {runMatching.error.message}
          </span>
        )}
      </div>
      <TransactionsTable transactions={transactions} />
    </main>
  );
}
