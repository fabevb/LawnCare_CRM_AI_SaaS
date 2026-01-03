-- Add profiles table and admin role helpers
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

alter table public.profiles enable row level security;

insert into public.profiles (user_id, role)
select id, 'staff' from auth.users
on conflict (user_id) do nothing;

create or replace function public.is_admin(check_user uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = check_user
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "Profiles: read own" on public.profiles;
drop policy if exists "Profiles: insert own" on public.profiles;
drop policy if exists "Profiles: admin read all" on public.profiles;
drop policy if exists "Profiles: admin update" on public.profiles;

create policy "Profiles: read own" on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Profiles: insert own" on public.profiles
  for insert
  with check (auth.uid() = user_id and role = 'staff');

create policy "Profiles: admin read all" on public.profiles
  for select
  using (public.is_admin(auth.uid()));

create policy "Profiles: admin update" on public.profiles
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'staff')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Replace broad authenticated policies with role-aware policies.

drop policy if exists "Enable all operations for authenticated users" on public.customers;
create policy "Customers: select authenticated" on public.customers
  for select
  using (auth.role() = 'authenticated');
create policy "Customers: insert authenticated" on public.customers
  for insert
  with check (auth.role() = 'authenticated');
create policy "Customers: update authenticated" on public.customers
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Customers: delete admin" on public.customers
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.products_services;
create policy "Products: select authenticated" on public.products_services
  for select
  using (auth.role() = 'authenticated');
create policy "Products: insert authenticated" on public.products_services
  for insert
  with check (auth.role() = 'authenticated');
create policy "Products: update authenticated" on public.products_services
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Products: delete admin" on public.products_services
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.customer_products;
create policy "Customer products: select authenticated" on public.customer_products
  for select
  using (auth.role() = 'authenticated');
create policy "Customer products: insert authenticated" on public.customer_products
  for insert
  with check (auth.role() = 'authenticated');
create policy "Customer products: update authenticated" on public.customer_products
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Customer products: delete admin" on public.customer_products
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.routes;
create policy "Routes: select authenticated" on public.routes
  for select
  using (auth.role() = 'authenticated');
create policy "Routes: insert authenticated" on public.routes
  for insert
  with check (auth.role() = 'authenticated');
create policy "Routes: update authenticated" on public.routes
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Routes: delete admin" on public.routes
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.route_stops;
create policy "Route stops: select authenticated" on public.route_stops
  for select
  using (auth.role() = 'authenticated');
create policy "Route stops: insert authenticated" on public.route_stops
  for insert
  with check (auth.role() = 'authenticated');
create policy "Route stops: update authenticated" on public.route_stops
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Route stops: delete admin" on public.route_stops
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.service_history;
create policy "Service history: select authenticated" on public.service_history
  for select
  using (auth.role() = 'authenticated');
create policy "Service history: insert authenticated" on public.service_history
  for insert
  with check (auth.role() = 'authenticated');
create policy "Service history: update authenticated" on public.service_history
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Service history: delete admin" on public.service_history
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.inquiries;
create policy "Inquiries: select authenticated" on public.inquiries
  for select
  using (auth.role() = 'authenticated');
create policy "Inquiries: update authenticated" on public.inquiries
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Inquiries: delete admin" on public.inquiries
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Enable all operations for authenticated users" on public.settings;
drop policy if exists "Enable read access for all users" on public.settings;
create policy "Settings: select authenticated" on public.settings
  for select
  using (auth.role() = 'authenticated');
create policy "Settings: insert admin" on public.settings
  for insert
  with check (public.is_admin(auth.uid()));
create policy "Settings: update admin" on public.settings
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
create policy "Settings: delete admin" on public.settings
  for delete
  using (public.is_admin(auth.uid()));

-- Public business profile for inquiry form
create or replace function public.get_public_business_profile()
returns table (business_name text, business_email text, business_phone text)
language sql
security definer
set search_path = public
as $$
  select business_name, business_email, business_phone
  from public.settings
  limit 1;
$$;

grant execute on function public.get_public_business_profile() to anon, authenticated;

