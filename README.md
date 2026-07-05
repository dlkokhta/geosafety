# Payment Reconciliation Dashboard

A reconciliation tool for a company managing service contracts: bank transactions arrive daily from a bank API and need to be matched against existing contracts — who paid and who didn't.

## Tech Stack

- Next.js (App Router) + TypeScript
- Supabase (Database)
- Tailwind CSS
- TanStack Query
- Zod

## Getting Started

1. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd geosafety
   npm install
   ```

2. Create a `.env.local` file in the project root:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon key>
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run the files from the `supabase/` folder in the Supabase SQL Editor, in this order:

1. `seed_schema.sql` — tables, indexes, companies and contracts
2. `seed_transactions.sql` — 89 bank transactions (all starting as `unmatched`)
3. `policies.sql` — RLS policies
4. `functions.sql` — `match_transactions()` RPC (auto-matching logic)

## Matching Logic — Where It Lives and Why

The auto-matching logic lives **in the database**, as a single SQL function: `match_transactions()` in [`supabase/functions.sql`](supabase/functions.sql). The UI triggers it with one RPC call (`supabase.rpc("match_transactions")`) from the `useRunMatching` hook, and invalidates the transactions query on success so the table refreshes automatically.

### How it matches

A transaction is matched to a company **only by tax ID**: `bank_transactions.sender_inn = companies.tax_id`. Sender names are not used — the same company appears in the bank feed under different name spellings, so name matching would be unreliable. On a match the function sets `matched_company_id`, `match_method = 'inn_exact'`, `match_confidence = 1.00` and `status = 'matched'`. Transactions with an unknown `sender_inn` simply stay `unmatched`.

### Why an RPC instead of client-side matching

The assignment allowed either approach (fetch all + match + update on the client, or a database function). I chose the RPC because:

- **One atomic statement instead of N round trips.** The whole job is a single set-based `UPDATE ... FROM companies`. Client-side matching would need to download all transactions and companies, compare them in JS, and then send an update per matched row — slower, and a partial failure could leave the data half-updated.
- **It plays well with RLS.** The tables are protected by row-level security that only allows reads for anonymous users. The function is `security definer`, so this one well-defined operation may write, while the anon key still cannot modify tables directly.
- **Safe to re-run.** It only touches rows with `status = 'unmatched'`, so running it again never overwrites manual matches or ignored transactions. It returns the number of newly matched rows, which the UI shows after each run.
- **The logic sits next to the data.** The matching rule is a data-integrity rule; keeping it in SQL means any client (the dashboard, a cron job, a one-off script) runs exactly the same logic.
