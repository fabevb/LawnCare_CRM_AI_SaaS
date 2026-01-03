-- Add archived timestamp for customers
alter table public.customers
  add column if not exists archived_at timestamptz;

create index if not exists idx_customers_archived_at on public.customers (archived_at);
