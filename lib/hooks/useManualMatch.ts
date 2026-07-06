"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchTransactionManually } from "@/lib/services/transactions";
import type { Company, TransactionWithCompany } from "@/lib/types";

interface ManualMatchInput {
  id: string;
  company: Company;
  confidence: number;
}

export function useManualMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, company, confidence }: ManualMatchInput) =>
      matchTransactionManually(id, company.id, confidence),
    onMutate: async ({ id, company, confidence }) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previous = queryClient.getQueryData<TransactionWithCompany[]>([
        "transactions",
      ]);

      queryClient.setQueryData<TransactionWithCompany[]>(
        ["transactions"],
        (old) =>
          old?.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "matched",
                  matched_company_id: company.id,
                  matched_company: company,
                  match_method: "manual",
                  match_confidence: confidence,
                }
              : t
          )
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["transactions"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
