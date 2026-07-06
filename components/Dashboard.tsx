"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useContracts } from "@/lib/hooks/useContracts";
import { useRunMatching } from "@/lib/hooks/useRunMatching";
import { buildCompanySummary } from "@/lib/reconciliation";
import { StatsBar } from "@/components/StatsBar";
import { CompanySummary } from "@/components/CompanySummary";
import {
  TransactionsTable,
  type SortDir,
  type SortField,
} from "@/components/TransactionsTable";
import { StatusFilter } from "@/components/StatusFilter";
import { MonthSelector } from "@/components/MonthSelector";
import type { TransactionStatus } from "@/lib/types";

const STATUSES = ["matched", "unmatched", "ignored"] as const;

export function Dashboard() {
  const { data: transactions, isPending, isError, error } = useTransactions();
  const contractsQuery = useContracts();
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

  const months = useMemo(() => {
    const unique = new Set(
      (transactions ?? []).map((t) => t.entry_date.slice(0, 7))
    );
    return [...unique].sort();
  }, [transactions]);

  // Expected vs actual (task 4) needs a concrete month, so there is no
  // "all months" state — an unknown month falls back to the latest one.
  const rawMonth = searchParams.get("month");
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
    return <p className="p-8 text-zinc-500">Loading…</p>;
  }

  if (isError || contractsQuery.isError) {
    const message = isError ? error.message : contractsQuery.error!.message;
    return <p className="p-8 text-red-600">Error: {message}</p>;
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
      <TransactionsTable
        transactions={visibleTransactions}
        sort={sort}
        dir={dir}
        onSortChange={handleSortChange}
      />
    </main>
  );
}
