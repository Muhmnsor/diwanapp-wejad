
-- Create the digital_accounts table
CREATE TABLE IF NOT EXISTS digital_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT,
  has_password BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add row-level security policies
ALTER TABLE digital_accounts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to see their own digital accounts
CREATE POLICY "Users can view their own digital accounts" ON digital_accounts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert their own digital accounts
CREATE POLICY "Users can insert their own digital accounts" ON digital_accounts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update their own digital accounts
CREATE POLICY "Users can update their own digital accounts" ON digital_accounts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete their own digital accounts
CREATE POLICY "Users can delete their own digital accounts" ON digital_accounts
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
