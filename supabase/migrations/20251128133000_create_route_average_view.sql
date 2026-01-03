-- View exposing routes with their rolling average actual duration
create or replace view route_average_durations as
select
  r.id as route_id,
  r.date,
  r.day_of_week,
  r.status,
  r.driver_id,
  r.driver_name,
  r.average_duration_minutes,
  r.total_duration_minutes,
  r.start_time,
  r.end_time,
  count(rt.id) as samples,
  coalesce(avg(rt.duration_minutes), 0)::numeric as calculated_avg_minutes
from routes r
left join route_times rt on rt.route_id = r.id
group by r.id;

