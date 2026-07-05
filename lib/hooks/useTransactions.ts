"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TransactionWithCompany } from "@/lib/types";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<TransactionWithCompany[]> => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*, matched_company:companies!matched_company_id(id, name)")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
