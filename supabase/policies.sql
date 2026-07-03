-- Enable RLS
alter table companies enable row level security;
alter table contracts enable row level security;
alter table bank_transactions enable row level security;

-- Read access for all tables
create policy "Allow public read" on companies
  for select to anon, authenticated using (true);

create policy "Allow public read" on contracts
  for select to anon, authenticated using (true);

create policy "Allow public read" on bank_transactions
  for select to anon, authenticated using (true);

-- Update access for manual match / ignore actions from the dashboard
create policy "Allow public update" on bank_transactions
  for update to anon, authenticated using (true) with check (true);
