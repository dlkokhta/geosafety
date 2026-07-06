"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";

interface SetStatusInput {
  id: string;
  status: TransactionStatus;
}


export function useSetTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: SetStatusInput) => {
      const { error } = await supabase
        .from("bank_transactions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previous = queryClient.getQueryData<TransactionWithCompany[]>([
        "transactions",
      ]);

      queryClient.setQueryData<TransactionWithCompany[]>(
        ["transactions"],
        (old) => old?.map((t) => (t.id === id ? { ...t, status } : t))
      );

      
      return { previous };
    },
   
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["transactions"], context.previous);
      }
    },
    // Success or failure, refetch in the end so the cache reflects the
    // server's truth rather than our guess.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
