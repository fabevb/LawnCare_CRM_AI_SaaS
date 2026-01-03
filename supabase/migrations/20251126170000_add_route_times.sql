-- Create table to record actual route durations
create table if not exists public.route_times (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.routes(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes numeric not null,
  created_at timestamptz not null default now()
);

alter table public.route_times enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'route_times'
      and policyname = 'route_times_select_authenticated'
  ) then
    create policy route_times_select_authenticated
      on public.route_times
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'route_times'
      and policyname = 'route_times_insert_authenticated'
  ) then
    create policy route_times_insert_authenticated
      on public.route_times
      for insert
      to authenticated
      with check (true);
  end if;
end$$;
