-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Residential', 'Commercial', 'Workshop')),
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  day TEXT CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Workshop') OR day IS NULL),
  route_order INTEGER,
  distance_from_shop_km DECIMAL(10, 2),
  distance_from_shop_miles DECIMAL(10, 2),
  has_additional_work BOOLEAN DEFAULT FALSE,
  additional_work_cost DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on day for route queries
CREATE INDEX idx_customers_day ON customers(day);

-- Create index on route_order for sorting
CREATE INDEX idx_customers_route_order ON customers(route_order);

-- Create index on type for filtering
CREATE INDEX idx_customers_type ON customers(type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON customers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow read access for service role
CREATE POLICY "Enable read access for service role" ON customers
  FOR SELECT
  USING (true);
