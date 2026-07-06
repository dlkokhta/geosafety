"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useContracts } from "@/lib/hooks/useContracts";
import { useRunMatching } from "@/lib/hooks/useRunMatching";
import { useSetTransactionStatus } from "@/lib/hooks/useSetTransactionStatus";
import { buildCompanySummary } from "@/lib/reconciliation";
import { parseSearchParams } from "@/lib/searchParams";
import { StatsBar } from "@/components/StatsBar";
import { CompanySummary } from "@/components/CompanySummary";
import {
  TransactionsTable,
  type SortField,
} from "@/components/TransactionsTable";
import { StatusFilter } from "@/components/StatusFilter";
import { MonthSelector } from "@/components/MonthSelector";

export function Dashboard() {
  const { data: transactions, isPending, isError, error } = useTransactions();
  const contractsQuery = useContracts();
  const runMatching = useRunMatching();
  const setStatus = useSetTransactionStatus();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { status, sort, dir, month: rawMonth } = parseSearchParams(searchParams);

  const months = useMemo(() => {
    const unique = new Set(
      (transactions ?? []).map((t) => t.entry_date.slice(0, 7))
    );
    return [...unique].sort();
  }, [transactions]);

  // Expected vs actual (task 4) needs a concrete month, so there is no
  // "all months" state — an unknown month falls back to the latest one.
  const month =
    rawMonth && months.includes(rawMonth)
      ? rawMonth
      : (months[months.length - 1] ?? null);

  const monthTransactions = useMemo(
    () =>
      month
        ? (transactions ?? []).filter((t) => t.entry_date.startsWith(month))
        : [],
    [transactions, month]
  );

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

  const companySummary = useMemo(
    () =>
      month && contractsQuery.data
        ? buildCompanySummary(contractsQuery.data, monthTransactions, month)
        : [],
    [contractsQuery.data, monthTransactions, month]
  );

  const visibleTransactions = useMemo(() => {
    const filtered = status
      ? monthTransactions.filter((t) => t.status === status)
      : monthTransactions;
    return [...filtered].sort((a, b) => {
      const cmp =
        sort === "amount"
          ? a.amount - b.amount
          : a.entry_date.localeCompare(b.entry_date);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [monthTransactions, status, sort, dir]);

  if (isPending || contractsQuery.isPending) {
    // Skeleton mirrors the real layout (header, stat tiles, table) so the
    // page doesn't jump when data arrives.
    return (
      <main className="mx-auto max-w-6xl p-8" aria-busy="true">
        <div className="mb-4 h-8 w-72 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
            />
          ))}
        </div>
        <div className="mb-6 h-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-72 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      </main>
    );
  }

  if (isError || contractsQuery.isError) {
    const message = isError ? error.message : contractsQuery.error!.message;
    return (
      <main className="mx-auto max-w-6xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <p className="font-medium text-red-700 dark:text-red-400">
            Failed to load dashboard data
          </p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
            {message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Payment Reconciliation</h1>
        {month && (
          <MonthSelector
            months={months}
            value={month}
            onChange={(value) => setParams({ month: value })}
          />
        )}
      </div>
      <StatsBar transactions={monthTransactions} />
      <CompanySummary rows={companySummary} />
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
      {setStatus.isError && (
        <p className="mb-2 text-sm text-red-600">
          Error: {setStatus.error.message}
        </p>
      )}
      <TransactionsTable
        transactions={visibleTransactions}
        sort={sort}
        dir={dir}
        onSortChange={handleSortChange}
        onSetStatus={(id, status) => setStatus.mutate({ id, status })}
        pendingId={setStatus.isPending ? (setStatus.variables?.id ?? null) : null}
      />
    </main>
  );
}
