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

## Dashboard

Everything on the page is scoped to one month, picked with the prev/next month selector. The default is the latest month that has data, and there is no "all months" view — the expected-vs-actual comparison only makes sense for a concrete month.

- **Stats bar** — transaction counts and totals plus a match rate. The rate is `matched / (total − ignored)`: ignored transactions are deliberately excluded from reconciliation, so they don't count against it.
- **Company summary (expected vs actual)** — *expected* is the sum of monthly amounts of the company's contracts active in the selected month; a contract counts as active if its date range overlaps the month at all, judged by `start_date`/`end_date` rather than the `status` column (status only reflects the current state, past months go by dates). *Actual* is the sum of the company's matched transactions in that month. Green = paid at least the expected amount, red = underpaid, gray = no payment at all. A payment from a company with no active contract still gets a row (expected 0), so unexpected money is visible too.
- **Transactions table** — sortable by date or amount, filterable by status. The status filter only narrows the table; the stats and the summary always reflect the whole month.
- **Ignore / Restore** — unmatched transactions can be marked as ignored (and back), so noise like bank fees doesn't drag the match rate down. The status change is optimistic: the cache is rewritten before the request, the UI flips instantly, and on failure it rolls back to a snapshot. Matched rows deliberately have no action — unmatching would just get undone by the next matching run.
- **Run matching** — triggers the `match_transactions()` RPC and shows how many new matches it found.

### Bonus features

- **Search** — filters the transactions table by bank sender name, matched company name or tax ID, and the company summary by name. Matching is case-insensitive in both Georgian scripts (Mtavruli input finds mkhedruli names).
- **CSV export** — the company summary downloads as `reconciliation-<month>.csv`. Values are raw numbers (so Excel can compute with them) and the file starts with a UTF-8 BOM so Georgian names render correctly in Excel. The export reflects the current search filter.
- **Matching via Supabase RPC** — matching has lived in the database from day one rather than being retrofitted; the reasoning is covered in [Matching Logic](#matching-logic--where-it-lives-and-why) below.
- **Fuzzy name suggestions** — an unmatched transaction whose sender name resembles a known company gets an amber *Suggested: …* label with an **Accept** button (e.g. "გეოტრანსი (ფილიალი)" suggests "შპს გეოტრანსი"). Names are first normalized in [`lib/fuzzy.ts`](lib/fuzzy.ts) (legal forms like შპს/სს stripped wherever they appear, parenthetical qualifiers such as "(ფილიალი)" removed, Georgian-aware lowercasing), then compared with a bigram Dice similarity. A suggestion only appears above a 0.6 score **and** with a clear margin over the runner-up — an ambiguous match shows nothing rather than guessing. Accepting writes the match with `match_method = 'manual'` and the similarity score as `match_confidence`.

  *Where to see it:* on a freshly seeded database every transaction starts `unmatched`, so suggestions are visible immediately, before the first matching run. After **Run matching**, tax-ID matching wins wherever both signals exist (every variant-named transaction in the seed also carries a correct tax ID), and the remaining unmatched rows are companies not in the system — where showing no suggestion is the correct behavior, not a gap. To revisit a suggestion afterwards, temporarily unmatch one row and let the next matching run restore it:

  ```sql
  UPDATE bank_transactions
  SET status = 'unmatched', matched_company_id = NULL,
      match_method = NULL, match_confidence = NULL
  WHERE doc_key = 'BOG-2026-06-002';
  ```

### URL state

Filter, sort and month all live in the URL (`?status=…&sort=…&dir=…&month=…`), so any view is shareable and survives a refresh. The params are validated with a Zod schema ([`lib/searchParams.ts`](lib/searchParams.ts)) that uses `.catch()` fallbacks — a missing or garbage value silently falls back to its default instead of ever throwing.

### Data loading

All reads go through TanStack Query (`useTransactions`, `useContracts`). The "Run matching" mutation invalidates the `["transactions"]` cache on success, so the table, stats and summary all refresh automatically — contracts don't change during matching, so nothing else needs invalidating. Queries share a single loading/error state for the page; the mutation has its own inline pending/error/success feedback on the button.

The hooks call typed service functions in [`lib/services/`](lib/services/), which own all Supabase access and error handling. Responses are typed via the interfaces in `lib/types.ts` but not runtime-validated with Zod: the database schema is owned by this repo (`supabase/seed_schema.sql`) and enforced by Postgres itself, so the shapes can't drift the way user input can. Zod is reserved for the one boundary where genuinely untrusted input enters the app — the URL search params.

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
