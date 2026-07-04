export type TransactionStatus = "matched" | "unmatched" | "ignored";

export type MatchMethod = "inn_exact" | "manual";

export interface BankTransaction {
  id: string;
  doc_key: string;
  entry_date: string;
  amount: number;
  currency: string;
  sender_name: string | null;
  sender_inn: string | null;
  sender_account: string | null;
  purpose: string | null;
  matched_company_id: string | null;
  match_method: MatchMethod | null;
  match_confidence: number | null;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}
