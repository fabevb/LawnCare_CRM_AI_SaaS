-- Create service_history table for completed services
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  route_stop_id UUID REFERENCES route_stops(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products_services(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER,
  weather_conditions TEXT,
  temperature_f INTEGER,
  notes TEXT,
  photos TEXT[], -- Array of photo URLs/paths
  completed_by TEXT, -- Employee name or ID
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for queries
CREATE INDEX idx_service_history_customer_id ON service_history(customer_id);
CREATE INDEX idx_service_history_service_date ON service_history(service_date);
CREATE INDEX idx_service_history_route_stop_id ON service_history(route_stop_id);
CREATE INDEX idx_service_history_product_id ON service_history(product_id);
CREATE INDEX idx_service_history_completed_by ON service_history(completed_by);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_history_updated_at
  BEFORE UPDATE ON service_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON service_history
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow read access for service role
CREATE POLICY "Enable read access for service role" ON service_history
  FOR SELECT
  USING (true);
