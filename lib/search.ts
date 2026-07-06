import type { TransactionWithCompany } from "@/lib/types";

// toLocaleLowerCase("ka") also maps Georgian Mtavruli capitals (ᲒᲔᲝᲢᲠᲐᲜᲡᲘ)
// down to mkhedruli, so the search is case-insensitive in both scripts.
function normalize(value: string): string {
  return value.toLocaleLowerCase("ka").trim();
}

// Matches against the raw bank sender name, the sender's tax id (ს/კ) and
// the matched company's canonical name — a transaction stays findable by
// either the name the bank sent or the name we resolved it to.
export function filterTransactionsByQuery(
  transactions: TransactionWithCompany[],
  query: string
): TransactionWithCompany[] {
  const q = normalize(query);
  if (!q) return transactions;

  return transactions.filter((t) =>
    [t.sender_name, t.sender_inn, t.matched_company?.name].some(
      (value) => value != null && normalize(value).includes(q)
    )
  );
}
