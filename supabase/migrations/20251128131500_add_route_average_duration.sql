-- Add a column on routes to store the average completed time for that route
alter table routes
  add column if not exists average_duration_minutes numeric;

-- Backfill averages for existing data
update routes r
set average_duration_minutes = sub.avg_minutes
from (
  select route_id, avg(duration_minutes)::numeric as avg_minutes
  from route_times
  group by route_id
) sub
where r.id = sub.route_id;

-- Function to keep routes.average_duration_minutes in sync with route_times
create or replace function update_routes_average_duration()
returns trigger as $$
declare
  target_route uuid;
  avg_minutes numeric;
begin
  if TG_OP = 'DELETE' then
    target_route := OLD.route_id;
  else
    target_route := NEW.route_id;
  end if;

  select avg(duration_minutes)::numeric
  into avg_minutes
  from route_times
  where route_id = target_route;

  update routes
  set average_duration_minutes = avg_minutes
  where id = target_route;

  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_update_routes_average_duration on route_times;
create trigger trg_update_routes_average_duration
  after insert or update or delete on route_times
  for each row
  execute function update_routes_average_duration();

