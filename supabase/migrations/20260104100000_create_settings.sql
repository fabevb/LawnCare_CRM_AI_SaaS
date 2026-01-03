-- Create settings table for persistent business configuration
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true,
  business_name text not null default 'Lawn Care CRM',
  business_email text,
  business_phone text,
  shop_address text not null default '16 Cherokee Dr, St Peters, MO',
  shop_lat double precision not null default 38.7839,
  shop_lng double precision not null default -90.4974,
  notify_new_inquiry_email boolean not null default true,
  notify_new_inquiry_sms boolean not null default false,
  notify_route_completed_email boolean not null default true,
  notify_route_completed_sms boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint settings_singleton_check check (singleton),
  constraint settings_shop_lat_check check (shop_lat between -90 and 90),
  constraint settings_shop_lng_check check (shop_lng between -180 and 180)
);

create unique index if not exists settings_singleton_key on public.settings (singleton);

insert into public.settings (singleton)
values (true)
on conflict (singleton) do nothing;

create trigger update_settings_updated_at
  before update on public.settings
  for each row
  execute function update_updated_at_column();

alter table public.settings enable row level security;

create policy "Enable all operations for authenticated users" on public.settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Enable read access for all users" on public.settings
  for select
  using (true);
