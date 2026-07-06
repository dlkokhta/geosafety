"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/lib/services/transactions";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });
}
