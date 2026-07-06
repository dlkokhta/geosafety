"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchContracts } from "@/lib/services/contracts";

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: fetchContracts,
  });
}
