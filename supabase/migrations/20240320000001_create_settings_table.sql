-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL
);

-- Insert initial settings
INSERT INTO settings (key, value) VALUES
  ('doctor_rate', 1000),
  ('therapist_rate', 500),
  ('commission_rate', 10)
ON CONFLICT (key) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to settings"
  ON settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true); 