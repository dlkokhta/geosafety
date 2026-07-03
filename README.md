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

## Matching Logic — Where It Lives and Why

_(To be filled in once the RPC function is added)_
