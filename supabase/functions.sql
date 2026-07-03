-- Auto-matching: link unmatched bank transactions to companies by exact tax id.
-- security definer: runs with owner rights, bypassing RLS for the update.
-- Only touches 'unmatched' rows, so re-running never overwrites manual matches
-- or ignored transactions. Returns the number of newly matched rows.
create or replace function match_transactions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_count integer;
begin
  update bank_transactions bt
  set matched_company_id = c.id,
      match_method = 'inn_exact',
      match_confidence = 1.00,
      status = 'matched',
      updated_at = now()
  from companies c
  where bt.sender_inn = c.tax_id
    and bt.status = 'unmatched';

  get diagnostics matched_count = row_count;
  return matched_count;
end;
$$;
