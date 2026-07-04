"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRunMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    
    mutationFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc("match_transactions");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

}
