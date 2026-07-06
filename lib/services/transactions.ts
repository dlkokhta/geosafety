import { supabase } from "@/lib/supabase";
import type { TransactionStatus, TransactionWithCompany } from "@/lib/types";

export async function fetchTransactions(): Promise<TransactionWithCompany[]> {
  const { data, error } = await supabase
    .from("bank_transactions")
    .select("*, matched_company:companies!matched_company_id(id, name)")
    .order("entry_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function matchTransactions(): Promise<number> {
  const { data, error } = await supabase.rpc("match_transactions");
  if (error) throw error;
  return data;
}

export async function matchTransactionManually(
  id: string,
  companyId: string,
  confidence: number
): Promise<void> {
  const { error } = await supabase
    .from("bank_transactions")
    .update({
      matched_company_id: companyId,
      match_method: "manual",
      match_confidence: Math.round(confidence * 100) / 100,
      status: "matched",
    })
    .eq("id", id);
  if (error) throw error;
}

export async function setTransactionStatus(
  id: string,
  status: TransactionStatus
): Promise<void> {
  const { error } = await supabase
    .from("bank_transactions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
