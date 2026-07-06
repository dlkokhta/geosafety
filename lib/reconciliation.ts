import type { ContractWithCompany, TransactionWithCompany } from "@/lib/types";

export interface CompanySummaryRow {
  companyId: string;
  name: string;
  expected: number;
  actual: number;
  diff: number;
}

export type PaymentState = "paid" | "underpaid" | "unpaid";


export function paymentState(row: CompanySummaryRow): PaymentState {
  if (row.actual === 0) return "unpaid";
  return row.actual >= row.expected ? "paid" : "underpaid";
}


export function isActiveInMonth(
  contract: ContractWithCompany,
  month: string
): boolean {
  return (
    contract.start_date.slice(0, 7) <= month &&
    (contract.end_date === null || contract.end_date.slice(0, 7) >= month)
  );
}

export function buildCompanySummary(
  contracts: ContractWithCompany[],
  monthTransactions: TransactionWithCompany[],
  month: string
): CompanySummaryRow[] {
  const rows = new Map<string, CompanySummaryRow>();

  const getRow = (companyId: string, name: string): CompanySummaryRow => {
    let row = rows.get(companyId);
    if (!row) {
      row = { companyId, name, expected: 0, actual: 0, diff: 0 };
      rows.set(companyId, row);
    }
    return row;
  };

  for (const contract of contracts) {
    if (isActiveInMonth(contract, month)) {
      getRow(contract.company_id, contract.company.name).expected +=
        contract.monthly_amount;
    }
  }

  for (const transaction of monthTransactions) {
    if (transaction.status === "matched" && transaction.matched_company) {
      getRow(
        transaction.matched_company.id,
        transaction.matched_company.name
      ).actual += transaction.amount;
    }
  }

  for (const row of rows.values()) {
    row.diff = row.actual - row.expected;
  }

  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, "ka"));
}
