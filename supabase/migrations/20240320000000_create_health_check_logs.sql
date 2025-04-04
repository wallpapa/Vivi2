-- Create health_check_logs table
CREATE TABLE IF NOT EXISTS health_check_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_health_check_logs_timestamp ON health_check_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_check_logs_type ON health_check_logs(check_type);
CREATE INDEX IF NOT EXISTS idx_health_check_logs_status ON health_check_logs(status);

-- Add RLS policies
ALTER TABLE health_check_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON health_check_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access to service role
CREATE POLICY "Allow insert access to service role" ON health_check_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true); 