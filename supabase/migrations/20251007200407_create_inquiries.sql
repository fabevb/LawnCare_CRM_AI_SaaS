-- Create inquiries table for public form submissions
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  property_type TEXT CHECK (property_type IN ('Residential', 'Commercial', 'Other')),
  lot_size TEXT,
  services_interested TEXT[], -- Array of service types
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'text')),
  preferred_contact_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'converted', 'declined', 'spam')),
  notes TEXT,
  internal_notes TEXT, -- Admin-only notes
  source TEXT, -- How they found us (referral, google, etc.)
  converted_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  contacted_at TIMESTAMPTZ,
  contacted_by TEXT,
  quote_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for queries
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_inquiries_converted_customer_id ON inquiries(converted_customer_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (public form)
CREATE POLICY "Enable insert for all users" ON inquiries
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON inquiries
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow read access for service role
CREATE POLICY "Enable read access for service role" ON inquiries
  FOR SELECT
  USING (true);
