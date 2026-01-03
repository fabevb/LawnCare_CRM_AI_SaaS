-- Create customer_products table for recurring services
CREATE TABLE customer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products_services(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'seasonal', 'yearly')),
  custom_cost DECIMAL(10, 2), -- Override product base_cost if needed
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT FALSE,
  last_service_date DATE,
  next_service_date DATE,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- Create indexes for queries
CREATE INDEX idx_customer_products_customer_id ON customer_products(customer_id);
CREATE INDEX idx_customer_products_product_id ON customer_products(product_id);
CREATE INDEX idx_customer_products_next_service_date ON customer_products(next_service_date);
CREATE INDEX idx_customer_products_active ON customer_products(active);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customer_products_updated_at
  BEFORE UPDATE ON customer_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customer_products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON customer_products
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow read access for service role
CREATE POLICY "Enable read access for service role" ON customer_products
  FOR SELECT
  USING (true);
