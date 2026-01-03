-- Create a view for customer metrics
CREATE OR REPLACE VIEW customer_metrics AS
SELECT
  c.id,
  c.name,
  c.type,
  c.cost as base_cost,
  COUNT(sh.id) as total_services,
  COALESCE(SUM(sh.cost), 0) as lifetime_revenue,
  COALESCE(AVG(sh.cost), 0) as avg_service_cost,
  MAX(sh.service_date) as last_service_date,
  COALESCE(AVG(sh.customer_rating), 0) as avg_rating,
  COUNT(CASE WHEN sh.service_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as services_last_90_days
FROM customers c
LEFT JOIN service_history sh ON c.id = sh.customer_id
GROUP BY c.id, c.name, c.type, c.cost;

-- Create a view for route statistics
CREATE OR REPLACE VIEW route_statistics AS
SELECT
  r.id,
  r.date,
  r.day_of_week,
  r.status,
  COUNT(rs.id) as total_stops,
  COUNT(CASE WHEN rs.status = 'completed' THEN 1 END) as completed_stops,
  COUNT(CASE WHEN rs.status = 'skipped' THEN 1 END) as skipped_stops,
  r.total_distance_miles,
  r.total_duration_minutes,
  COALESCE(SUM(c.cost), 0) as total_revenue,
  r.estimated_fuel_cost
FROM routes r
LEFT JOIN route_stops rs ON r.id = rs.route_id
LEFT JOIN customers c ON rs.customer_id = c.id
GROUP BY r.id, r.date, r.day_of_week, r.status, r.total_distance_miles, r.total_duration_minutes, r.estimated_fuel_cost;

-- Function to calculate distance between two points (lat/lng)
-- This is a simplified Haversine formula for rough distance calculation
CREATE OR REPLACE FUNCTION calculate_distance_miles(
  lat1 DECIMAL,
  lng1 DECIMAL,
  lat2 DECIMAL,
  lng2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  r DECIMAL := 3959; -- Earth's radius in miles
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlng := RADIANS(lng2 - lng1);
  a := SIN(dlat/2) * SIN(dlat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlng/2) * SIN(dlng/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get customers by day with their route order
CREATE OR REPLACE FUNCTION get_customers_by_day(day_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  type TEXT,
  cost DECIMAL,
  route_order INTEGER,
  distance_from_shop_miles DECIMAL,
  has_additional_work BOOLEAN,
  additional_work_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.address,
    c.type,
    c.cost,
    c.route_order,
    c.distance_from_shop_miles,
    c.has_additional_work,
    c.additional_work_cost
  FROM customers c
  WHERE c.day = day_name
  ORDER BY c.route_order NULLS LAST, c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update customer route order
CREATE OR REPLACE FUNCTION update_route_orders(
  customer_ids UUID[],
  day_name TEXT
)
RETURNS void AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..array_length(customer_ids, 1)
  LOOP
    UPDATE customers
    SET route_order = i,
        day = day_name,
        updated_at = NOW()
    WHERE id = customer_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add latitude and longitude columns to customers for better mapping
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index on lat/lng for geospatial queries
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers(latitude, longitude);

-- Comments for documentation
COMMENT ON VIEW customer_metrics IS 'Aggregated metrics per customer including lifetime revenue and service count';
COMMENT ON VIEW route_statistics IS 'Statistics for each route including stops, revenue, and completion rates';
COMMENT ON FUNCTION calculate_distance_miles IS 'Calculate distance in miles between two lat/lng coordinates using Haversine formula';
COMMENT ON FUNCTION get_customers_by_day IS 'Get all customers scheduled for a specific day, ordered by route_order';
COMMENT ON FUNCTION update_route_orders IS 'Batch update route orders for multiple customers';
