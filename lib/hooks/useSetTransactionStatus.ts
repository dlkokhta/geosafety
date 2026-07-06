"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TransactionStatus } from "@/lib/types";

interface SetStatusInput {
  id: string;
  status: TransactionStatus;
}

// Serves both actions: Ignore (status -> 'ignored') and Restore
// (status -> 'unmatched'). updated_at is handled by the DB trigger.
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
