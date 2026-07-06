"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchTransactions } from "@/lib/services/transactions";

export function useRunMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: matchTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
