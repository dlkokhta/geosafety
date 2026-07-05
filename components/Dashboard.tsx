"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useRunMatching } from "@/lib/hooks/useRunMatching";
import { StatsBar } from "@/components/StatsBar";
import {
  TransactionsTable,
  type SortDir,
  type SortField,
} from "@/components/TransactionsTable";
import { StatusFilter } from "@/components/StatusFilter";
import type { TransactionStatus } from "@/lib/types";

const STATUSES = ["matched", "unmatched", "ignored"] as const;

export function Dashboard() {
  const { data: transactions, isPending, isError, error } = useTransactions();
  const runMatching = useRunMatching();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Until task 5 adds Zod, unknown URL values silently fall back to defaults.
  const rawStatus = searchParams.get("status") as TransactionStatus | null;
  const status = rawStatus && STATUSES.includes(rawStatus) ? rawStatus : null;
  const sort: SortField =
    searchParams.get("sort") === "amount" ? "amount" : "date";
  const dir: SortDir = searchParams.get("dir") === "asc" ? "asc" : "desc";

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, router, pathname]
  );

  const handleSortChange = (field: SortField) => {
    if (field === sort) {
      setParams({ dir: dir === "desc" ? "asc" : "desc" });
    } else {
      setParams({ sort: field, dir: "desc" });
    }
  };

  const visibleTransactions = useMemo(() => {
    const all = transactions ?? [];
    const filtered = status ? all.filter((t) => t.status === status) : all;
    return [...filtered].sort((a, b) => {
      const cmp =
        sort === "amount"
          ? a.amount - b.amount
          : a.entry_date.localeCompare(b.entry_date);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [transactions, status, sort, dir]);

  if (isPending) {
    return <p className="p-8 text-zinc-500">Loading…</p>;
  }

  if (isError) {
    return <p className="p-8 text-red-600">Error: {error.message}</p>;
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Payment Reconciliation</h1>
      <StatsBar transactions={transactions} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <StatusFilter
          value={status}
          onChange={(value) => setParams({ status: value })}
        />
        <div className="flex items-center gap-4">
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
          <button
            onClick={() => runMatching.mutate()}
            disabled={runMatching.isPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            {runMatching.isPending ? "Running…" : "Run matching"}
          </button>
        </div>
      </div>
      <TransactionsTable
        transactions={visibleTransactions}
        sort={sort}
        dir={dir}
        onSortChange={handleSortChange}
      />
    </main>
  );
}
