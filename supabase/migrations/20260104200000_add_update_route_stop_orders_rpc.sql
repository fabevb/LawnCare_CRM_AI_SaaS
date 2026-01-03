-- Batch update route stop ordering
create or replace function public.update_route_stop_orders(
  target_route_id uuid,
  stop_ids uuid[]
) returns void
language plpgsql
as $$
begin
  update public.route_stops as rs
  set stop_order = data.ordinality
  from unnest(stop_ids) with ordinality as data(stop_id, ordinality)
  where rs.id = data.stop_id
    and rs.route_id = target_route_id;
end;
$$;

grant execute on function public.update_route_stop_orders(uuid, uuid[]) to authenticated;
