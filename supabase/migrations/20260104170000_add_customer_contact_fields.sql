-- Add customer contact fields
alter table public.customers
  add column if not exists phone text,
  add column if not exists email text;

create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_customers_email on public.customers (email);
