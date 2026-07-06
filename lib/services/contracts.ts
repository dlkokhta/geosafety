import { supabase } from "@/lib/supabase";
import type { ContractWithCompany } from "@/lib/types";

export async function fetchContracts(): Promise<ContractWithCompany[]> {
  const { data, error } = await supabase
    .from("contracts")
    .select("*, company:companies!company_id(id, name)");
  if (error) throw error;
  return data;
}
