-- Create products_services table for service catalog
CREATE TABLE products_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('mowing', 'trimming', 'edging', 'fertilizing', 'aeration', 'seeding', 'mulching', 'leaf_removal', 'snow_removal', 'other')),
  base_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL CHECK (unit IN ('per_sqft', 'per_hour', 'flat', 'per_acre')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on type and active status
CREATE INDEX idx_products_services_type ON products_services(type);
CREATE INDEX idx_products_services_active ON products_services(active);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_services_updated_at
  BEFORE UPDATE ON products_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON products_services
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow read access for service role
CREATE POLICY "Enable read access for service role" ON products_services
  FOR SELECT
  USING (true);
