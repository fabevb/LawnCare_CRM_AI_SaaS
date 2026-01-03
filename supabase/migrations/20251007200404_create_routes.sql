-- Create routes table for planned daily routes
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  driver_id UUID, -- Future: reference to users/employees table
  driver_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  total_distance_km DECIMAL(10, 2),
  total_distance_miles DECIMAL(10, 2),
  total_duration_minutes INTEGER,
  estimated_fuel_cost DECIMAL(10, 2),
  optimized_waypoints JSONB, -- Store Google's optimized route data
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for queries
CREATE INDEX idx_routes_date ON routes(date);
CREATE INDEX idx_routes_day_of_week ON routes(day_of_week);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_driver_id ON routes(driver_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON routes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow read access for service role
CREATE POLICY "Enable read access for service role" ON routes
  FOR SELECT
  USING (true);
