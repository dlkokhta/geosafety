"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ContractWithCompany } from "@/lib/types";

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async (): Promise<ContractWithCompany[]> => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, company:companies!company_id(id, name)");
      if (error) throw error;
      return data;
    },
  });
}
