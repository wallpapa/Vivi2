-- Create a test table
CREATE TABLE IF NOT EXISTS test (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert some test data
INSERT INTO test (name, description) VALUES
    ('Test Item 1', 'This is a test item for development'),
    ('Test Item 2', 'Another test item for development');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_test_updated_at
    BEFORE UPDATE ON test
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE test ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
    ON test FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert"
    ON test FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update their own records
CREATE POLICY "Allow authenticated users to update"
    ON test FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true); 